// Prepara los datos que se envían a la IA para el resumen del progreso.
// Solo salen números agregados por categoría: sin apodo, sin fechas, sin ids de ejercicios.
import { CATEGORIES } from '../data/categories.js';

const round = (value, decimals = 0) => {
  if (value == null) return null;
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
};

const accuracyOf = (results) =>
  results.length ? results.filter((r) => r.correct).length / results.length : null;

function trendOf(sessions) {
  if (sessions.length < 4) return null;
  const recent = sessions.slice(-3).flatMap((s) => s.results);
  const before = sessions.slice(0, -3).flatMap((s) => s.results);
  const a = accuracyOf(recent);
  const b = accuracyOf(before);
  if (a == null || b == null) return null;
  if (a - b >= 0.15) return 'sube';
  if (b - a >= 0.15) return 'baja';
  return 'estable';
}

export function buildSummaryData(history, progress = {}) {
  const categorias = [];
  for (const category of CATEGORIES) {
    const sessions = history.filter((s) => s.category === category.id);
    if (!sessions.length) continue;
    const results = sessions.flatMap((s) => s.results);
    const porNivel = {};
    for (const level of [1, 2, 3]) {
      const atLevel = results.filter((r) => r.level === level);
      if (atLevel.length) porNivel[level] = round(accuracyOf(atLevel) * 100);
    }
    categorias.push({
      nombre: category.label,
      sesiones: sessions.length,
      ejercicios: results.length,
      aciertos: round(accuracyOf(results) * 100),
      ayudas: round(results.length ? results.reduce((sum, r) => sum + r.hintsUsed, 0) / results.length : null, 1),
      segundos: round(results.length ? results.reduce((sum, r) => sum + r.timeMs, 0) / results.length / 1000 : null),
      nivelActual: progress[category.id]?.level ?? null,
      completadas: sessions.filter((s) => s.outcome === 'completed').length,
      detenidas: sessions.filter((s) => s.outcome === 'stopped').length,
      salidas: sessions.filter((s) => s.outcome === 'exited').length,
      aciertosPorNivel: porNivel,
      tendencia: trendOf(sessions),
    });
  }
  return { categorias };
}