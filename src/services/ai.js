async function request(path, options) {
  const response = await fetch(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'No se pudo conectar con el servidor. ¿Ejecutaste "npm run server"?');
  }
  return data;
}

export function getAiStatus() {
  return request('/api/estado');
}

export function analyzePhrase(frase, contexto) {
  return request('/api/analizar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ frase, contexto }),
  });
}