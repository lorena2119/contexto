// Cálculo de métricas de clasificación (sin dependencias).
export const CLASES = ['literal', 'sarcasmo', 'metafora', 'ambigua'];

export function calcular(filas) {
  const validas = filas.filter((f) => f.obtenido);
  const matriz = Object.fromEntries(CLASES.map((e) => [e, Object.fromEntries(CLASES.map((o) => [o, 0]))]));
  for (const f of validas) if (matriz[f.esperado] && f.obtenido in matriz[f.esperado]) matriz[f.esperado][f.obtenido] += 1;

  const aciertos = validas.filter((f) => f.esperado === f.obtenido).length;
  const porClase = {};
  for (const c of CLASES) {
    const tp = matriz[c][c];
    const fn = CLASES.reduce((s, o) => s + (o === c ? 0 : matriz[c][o]), 0);
    const fp = CLASES.reduce((s, e) => s + (e === c ? 0 : matriz[e][c]), 0);
    const precision = tp + fp ? tp / (tp + fp) : null;
    const recall = tp + fn ? tp / (tp + fn) : null;
    const f1 = precision != null && recall != null && precision + recall ? (2 * precision * recall) / (precision + recall) : null;
    porClase[c] = { total: tp + fn, precision, recall, f1 };
  }

  // ¿Distingue lo literal de lo no literal? (sarcasmo, metáfora y ambigua cuentan como "no literal")
  const binarios = validas.filter((f) => f.obtenido in matriz.literal);
  const bin = binarios.filter((f) => (f.esperado === 'literal') === (f.obtenido === 'literal')).length;

  const porConfianza = {};
  for (const f of validas) {
    const k = f.confianza || 'sin dato';
    porConfianza[k] = porConfianza[k] || { total: 0, aciertos: 0 };
    porConfianza[k].total += 1;
    if (f.esperado === f.obtenido) porConfianza[k].aciertos += 1;
  }

  return {
    total: filas.length,
    validas: validas.length,
    sinRespuesta: filas.length - validas.length,
    aciertos,
    exactitud: validas.length ? aciertos / validas.length : null,
    exactitudLiteralVsNoLiteral: binarios.length ? bin / binarios.length : null,
    matriz,
    porClase,
    porConfianza,
    errores: validas.filter((f) => f.esperado !== f.obtenido),
  };
}