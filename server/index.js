import 'dotenv/config';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_ANALYZE } from './prompts.js';
import { parseAnalysis, demoAnalysis } from './analysis.js';

const PORT = process.env.PORT || 3001;
const PROVIDER = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
const PROVIDER_LABELS = { gemini: 'Gemini', anthropic: 'Claude' };
const DEFAULT_MODELS = { gemini: 'gemini-3.5-flash', anthropic: 'claude-sonnet-5-5' };
const MODEL = process.env.AI_MODEL || DEFAULT_MODELS[PROVIDER];
const FALLBACK_MODEL = process.env.AI_FALLBACK_MODEL || (PROVIDER === 'gemini' ? 'gemini-3.1-flash-lite' : '');
const RETRYABLE = [500, 503, 504];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const API_KEY = PROVIDER === 'anthropic' ? process.env.ANTHROPIC_API_KEY : process.env.GEMINI_API_KEY;

const knownProvider = Boolean(DEFAULT_MODELS[PROVIDER]);
const demoMode = process.env.DEMO_MODE === 'true' || !API_KEY || !knownProvider;

if (!knownProvider) {
  console.warn(`AI_PROVIDER "${PROVIDER}" no es válido (usa "gemini" o "anthropic"): se usará el modo demostración.`);
} else if (!API_KEY && process.env.DEMO_MODE !== 'true') {
  console.warn('No se encontró la clave de API en .env: se usará el modo demostración.');
}

const anthropicClient = !demoMode && PROVIDER === 'anthropic' ? new Anthropic({ apiKey: API_KEY }) : null;

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const app = express();
app.use(express.json({ limit: '10kb' }));

// Límite sencillo: 20 solicitudes por minuto por dirección
const hits = new Map();
function rateLimit(req, res, next) {
  const now = Date.now();
  const recent = (hits.get(req.ip) || []).filter((t) => now - t < 60_000);
  if (recent.length >= 20) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Espera un momento.' });
  }
  recent.push(now);
  hits.set(req.ip, recent);
  next();
}

const userPrompt = (frase, contexto) =>
  `Frase a analizar: «${frase}»\nContexto de la situación: ${contexto || '(no se indicó)'}`;

async function callGemini(model, frase, contexto) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_ANALYZE }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt(frase, contexto) }] }],
      generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 2048 },
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new ApiError(response.status, detail.slice(0, 300));
  }
  const data = await response.json();
  const text = (data.candidates?.[0]?.content?.parts || [])
    .map((part) => part.text || '')
    .join('')
    .trim();
  return parseAnalysis(text);
}

// Si Google está saturado: reintenta con pausas y, si sigue igual, prueba un modelo alterno
async function analyzeWithGemini(frase, contexto) {
  let lastError;
  for (const delay of [0, 1500, 3000]) {
    if (delay) await wait(delay);
    try {
      return await callGemini(MODEL, frase, contexto);
    } catch (error) {
      lastError = error;
      if (!RETRYABLE.includes(error.status)) throw error;
      console.warn(`Gemini no disponible (${error.status}), reintentando...`);
    }
  }
  if (FALLBACK_MODEL && FALLBACK_MODEL !== MODEL) {
    try {
      console.warn(`Probando el modelo alterno: ${FALLBACK_MODEL}`);
      return await callGemini(FALLBACK_MODEL, frase, contexto);
    } catch (error) {
      console.warn('El modelo alterno también falló:', error.status || '', error.message);
    }
  }
  throw lastError;
}

async function analyzeWithClaude(frase, contexto) {
  const message = await anthropicClient.messages.create({
    model: MODEL,
    max_tokens: 900,
    system: SYSTEM_ANALYZE,
    messages: [{ role: 'user', content: userPrompt(frase, contexto) }],
  });
  const text = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();
  return parseAnalysis(text);
}

function analyze(frase, contexto) {
  return PROVIDER === 'anthropic' ? analyzeWithClaude(frase, contexto) : analyzeWithGemini(frase, contexto);
}

function explainError(error) {
  const status = error?.status;
  const message = String(error?.message || '');
  if (status === 400 && /api key/i.test(message)) return 'La clave de API no es válida. Revisa .env.';
  if (status === 400 && /credit|balance/i.test(message)) return 'La cuenta de API no tiene saldo.';
  if (status === 401 || status === 403) return 'La clave de API no es válida o no tiene permiso para este modelo. Revisa .env.';
  if (status === 404) return 'No se encontró el modelo. Cambia AI_MODEL en .env.';
if (RETRYABLE.includes(status)) return 'El servicio de IA está con mucha demanda en este momento. Inténtalo de nuevo en unos segundos o usa el modo demostración.';
  if (status === 429) return 'Se alcanzó el límite de uso. Espera un minuto e inténtalo de nuevo.';
  if (error instanceof SyntaxError || /JSON/i.test(message)) {
    return 'La IA devolvió una respuesta en un formato inesperado. Inténtalo de nuevo.';
  }
  return 'No se pudo analizar la frase. Revisa la terminal del servidor para ver el detalle.';
}

app.get('/api/estado', (req, res) => {
  res.json({
    modo: demoMode ? 'demo' : 'ia',
    proveedor: demoMode ? null : PROVIDER_LABELS[PROVIDER],
    modelo: demoMode ? null : MODEL,
  });
});

app.post('/api/analizar', rateLimit, async (req, res) => {
  const frase = String(req.body?.frase || '').trim();
  const contexto = String(req.body?.contexto || '').trim();

  if (!frase) return res.status(400).json({ error: 'Escribe una frase para analizar.' });
  if (frase.length > 300 || contexto.length > 300) {
    return res.status(400).json({ error: 'La frase y el contexto deben tener máximo 300 caracteres.' });
  }

  try {
    const resultado = demoMode ? demoAnalysis(frase) : await analyze(frase, contexto);
    res.json({ modo: demoMode ? 'demo' : 'ia', resultado });
  } catch (error) {
    console.error('Error al analizar la frase:', error.status || '', error.message);
    res.status(502).json({ error: explainError(error) });
  }
});

app.listen(PORT, () => {
  const modo = demoMode ? 'demostración' : `IA (${PROVIDER_LABELS[PROVIDER]} · ${MODEL})`;
  console.log(`Servidor listo en http://localhost:${PORT} · modo: ${modo}`);
});