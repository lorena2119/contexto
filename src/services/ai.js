async function request(path, options) {
  const response = await fetch(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'No se pudo conectar con el servidor. ¿Ejecutaste "npm run server"?');
  }
  return data;
}

function post(path, body) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function getAiStatus() {
  return request('/api/estado');
}

export function analyzePhrase(frase, contexto) {
  return post('/api/analizar', { frase, contexto });
}

// Pide a la IA un borrador de lección (con su escena) para que el terapeuta lo revise
export function generateExercise({ frase, contexto, tipo, significado, nivel }) {
  return post('/api/ejercicio', { frase, contexto, tipo, significado, nivel });
}

// Pide a la IA un resumen del progreso. Recibe solo datos agregados (ver services/summary.js)
export function generateSummary(data) {
  return post('/api/resumen', data);
}