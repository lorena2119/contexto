import 'dotenv/config';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_ANALYZE } from './prompts.js';
import { parseAnalysis, demoAnalysis, findDemo } from './analysis.js';
import { SYSTEM_EXERCISE, parseExercise } from './ejercicio.js';
import { SYSTEM_SUMMARY, sanitizeSummaryData, summaryPrompt, parseSummary } from './resumen.js';

const PORT = process.env.PORT || 3001;
const TEMPORARY = [429, 500, 502, 503, 504];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const userPrompt = (frase, contexto) =>
  `Frase a analizar: «${frase}»\nContexto de la situación: ${contexto || '(no se indicó)'}`;

const exercisePrompt = ({ frase, contexto, tipo, significado, nivel }) =>
  `Frase: «${frase}»\nTipo: ${tipo}\nSignificado real: ${significado}\nContexto: ${contexto || '(no se indicó)'}\nNúmero de opciones: ${nivel + 1}`;

async function failIfNotOk(response) {
  if (response.ok) return;
  const detail = await response.text().catch(() => '');
  throw new ApiError(response.status, detail.slice(0, 300));
}

// ---------- Proveedores (cada uno devuelve el texto de la respuesta) ----------
async function callGemini(model, system, user, maxTokens) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': PROVIDERS.gemini.key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { responseMimeType: 'application/json', maxOutputTokens: maxTokens },
    }),
  });
  await failIfNotOk(response);
  const data = await response.json();
  return (data.candidates?.[0]?.content?.parts || []).map((part) => part.text || '').join('').trim();
}

async function callGroq(model, system, user, maxTokens) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${PROVIDERS.groq.key}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_completion_tokens: maxTokens,
    }),
  });
  await failIfNotOk(response);
  const data = await response.json();
  return String(data.choices?.[0]?.message?.content || '').trim();
}

let anthropicClient = null;
async function callClaude(model, system, user, maxTokens) {
  anthropicClient = anthropicClient || new Anthropic({ apiKey: PROVIDERS.anthropic.key });
  const message = await anthropicClient.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
  });
  return message.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
}

const unique = (list) => [...new Set(list.filter(Boolean))];

const PROVIDERS = {
  gemini: {
    label: 'Gemini',
    key: process.env.GEMINI_API_KEY,
    models: unique([process.env.GEMINI_MODEL || 'gemini-3.5-flash', process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.1-flash-lite']),
    call: callGemini,
  },
  groq: {
    label: 'Groq',
    key: process.env.GROQ_API_KEY,
    models: unique([process.env.GROQ_MODEL || 'openai/gpt-oss-120b']),
    call: callGroq,
  },
  anthropic: {
    label: 'Claude',
    key: process.env.ANTHROPIC_API_KEY,
    models: unique([process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5']),
    call: callClaude,
  },
};

// Solo se usan los proveedores pedidos en AI_PROVIDERS que tengan clave
const requested = (process.env.AI_PROVIDERS || 'gemini,groq')
  .split(',')
  .map((name) => name.trim().toLowerCase())
  .filter(Boolean);
const order = requested.filter((name) => PROVIDERS[name] && PROVIDERS[name].key);

const demoRequested = String(process.env.DEMO_MODE || '').trim().toLowerCase() === 'true';
const demoMode = demoRequested || order.length === 0;

if (!demoRequested && order.length === 0) {
  console.warn('No se encontró ninguna clave de API válida en .env: se usará el modo demostración.');
}
for (const name of requested) {
  if (!PROVIDERS[name]) console.warn(`AI_PROVIDERS incluye "${name}", que no existe (usa gemini, groq o anthropic).`);
  else if (!PROVIDERS[name].key) console.warn(`Falta la clave de ${PROVIDERS[name].label} en .env: se omite.`);
}

const isTemporary = (error) =>
  TEMPORARY.includes(error?.status) || error instanceof SyntaxError || /JSON/i.test(String(error?.message));

// Prueba cada proveedor y cada modelo; reintenta una vez si el fallo parece temporal.
// "parse" convierte el texto de la IA en el resultado final (y lanza error si no sirve).
async function askAI({ system, user, maxTokens, parse }) {
  let lastError;
  for (const name of order) {
    const provider = PROVIDERS[name];
    for (const model of provider.models) {
      for (const delay of [0, 1500]) {
        if (delay) await wait(delay);
        try {
          const text = await provider.call(model, system, user, maxTokens);
          return { resultado: parse(text), proveedor: provider.label, modelo: model };
        } catch (error) {
          lastError = error;
          console.warn(`${provider.label} (${model}) falló: ${error.status || ''} ${String(error.message).slice(0, 120)}`);
          if (!isTemporary(error)) break; // error permanente: pasa al siguiente modelo
        }
      }
    }
  }
  throw lastError || new Error('No hay proveedores de IA configurados');
}

function explainError(error, action = 'analizar la frase') {
  const status = error?.status;
  if (TEMPORARY.includes(status)) {
    return 'Los servicios de IA están con mucha demanda en este momento. Inténtalo de nuevo en unos segundos o usa el modo demostración.';
  }
  if (status === 401 || status === 403 || (status === 400 && /api key/i.test(String(error.message)))) {
    return 'Una clave de API no es válida. Revisa el archivo .env.';
  }
  if (status === 404) return 'No se encontró un modelo. Revisa los nombres de los modelos en .env.';
  if (error instanceof SyntaxError || /JSON/i.test(String(error?.message))) {
    return 'La IA devolvió una respuesta en un formato inesperado. Inténtalo de nuevo.';
  }
  return `No se pudo ${action}. Revisa la terminal del servidor para ver el detalle.`;
}

// ---------- Servidor ----------
const app = express();
app.use(express.json({ limit: '10kb' }));

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

app.get('/api/estado', (req, res) => {
  res.json({
    modo: demoMode ? 'demo' : 'ia',
    proveedores: demoMode ? [] : order.map((name) => PROVIDERS[name].label),
  });
});

app.post('/api/analizar', rateLimit, async (req, res) => {
  const frase = String(req.body?.frase || '').trim();
  const contexto = String(req.body?.contexto || '').trim();

  if (!frase) return res.status(400).json({ error: 'Escribe una frase para analizar.' });
  if (frase.length > 300 || contexto.length > 300) {
    return res.status(400).json({ error: 'La frase y el contexto deben tener máximo 300 caracteres.' });
  }

  if (demoMode) return res.json({ modo: 'demo', resultado: demoAnalysis(frase) });

  try {
    const { resultado, proveedor, modelo } = await askAI({
      system: SYSTEM_ANALYZE,
      user: userPrompt(frase, contexto),
      maxTokens: 2048,
      parse: parseAnalysis,
    });
    res.json({ modo: 'ia', proveedor, modelo, resultado });
  } catch (error) {
    console.error('Error al analizar la frase:', error.status || '', error.message);
    // Último recurso: si la frase es uno de los ejemplos, se responde con el respaldo
    const backup = findDemo(frase);
    if (backup) return res.json({ modo: 'respaldo', resultado: backup });
    res.status(502).json({ error: explainError(error) });
  }
});

// Borrador de lección (con escena) para que el terapeuta lo revise
app.post('/api/ejercicio', rateLimit, async (req, res) => {
  const frase = String(req.body?.frase || '').trim();
  const contexto = String(req.body?.contexto || '').trim();
  const tipo = String(req.body?.tipo || '').trim();
  const significado = String(req.body?.significado || '').trim();
  const nivel = Number(req.body?.nivel);

  if (!frase || !significado) return res.status(400).json({ error: 'Falta la frase o su significado.' });
  if (!['sarcasmo', 'metafora'].includes(tipo)) {
    return res.status(400).json({ error: 'Solo se pueden crear lecciones de sarcasmo o metáfora.' });
  }
  if (![1, 2, 3].includes(nivel)) return res.status(400).json({ error: 'El nivel debe ser 1, 2 o 3.' });
  if (frase.length > 300 || contexto.length > 300 || significado.length > 500) {
    return res.status(400).json({ error: 'El texto enviado es demasiado largo.' });
  }

  if (demoMode) {
    return res.status(400).json({ error: 'En modo demostración no se pueden crear lecciones. Configura una clave de IA en .env.' });
  }

  try {
    const { resultado, proveedor, modelo } = await askAI({
      system: SYSTEM_EXERCISE,
      user: exercisePrompt({ frase, contexto, tipo, significado, nivel }),
      maxTokens: 4096,
      parse: (text) => parseExercise(text, nivel + 1),
    });
    res.json({ modo: 'ia', proveedor, modelo, ejercicio: resultado });
  } catch (error) {
    console.error('Error al crear el ejercicio:', error.status || '', error.message);
    res.status(502).json({ error: explainError(error, 'crear la lección') });
  }
});

// Resumen del progreso en lenguaje claro: recibe solo datos agregados (sin apodo ni fechas)
app.post('/api/resumen', rateLimit, async (req, res) => {
  const data = sanitizeSummaryData(req.body);
  if (!data.categorias.length) return res.status(400).json({ error: 'No hay sesiones para resumir.' });

  if (demoMode) {
    return res.status(400).json({ error: 'En modo demostración no se puede generar el resumen. Configura una clave de IA en .env.' });
  }

  try {
    const { resultado, proveedor, modelo } = await askAI({
      system: SYSTEM_SUMMARY,
      user: summaryPrompt(data),
      maxTokens: 4096,
      parse: parseSummary,
    });
    res.json({ modo: 'ia', proveedor, modelo, resumen: resultado });
  } catch (error) {
    console.error('Error al generar el resumen:', error.status || '', error.message);
    res.status(502).json({ error: explainError(error, 'generar el resumen') });
  }
});

app.listen(PORT, () => {
  const modo = demoMode
    ? 'demostración'
    : `IA (${order.map((name) => `${PROVIDERS[name].label}: ${PROVIDERS[name].models.join(' → ')}`).join(' | ')})`;
  console.log(`Servidor listo en http://localhost:${PORT} · modo: ${modo}`);
});