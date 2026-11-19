const MAX_SESSIONS = 200;

export function buildSessionRecord(session, nickname) {
  return {
    id: `s_${Date.now()}`,
    date: new Date().toISOString(),
    nickname,
    category: session.category,
    startLevel: session.startLevel,
    outcome: session.outcome, // 'completed' | 'stopped' | 'exited'
    review: Boolean(session.review), // true si fue un repaso de un módulo dominado
    highestPassed: session.highestPassed,
    levels: session.levelHistory,
    results: session.results.map((r) => ({
      exerciseId: r.exerciseId,
      level: r.level,
      version: r.version,
      correct: r.correct,
      chosenId: r.chosenId,
      hintsUsed: r.hintsUsed,
      timeMs: r.timeMs,
    })),
  };
}

export function addSession(state, record) {
  state.history = [...(state.history || []), record].slice(-MAX_SESSIONS);
}

// Proporción de aciertos a la primera en una sesión (0 a 1)
export function sessionAccuracy(session) {
  const total = session.results.length;
  return total ? session.results.filter((r) => r.correct).length / total : 0;
}

export function categoryStats(sessions) {
  const results = sessions.flatMap((s) => s.results);
  const n = results.length;
  return {
    sessions: sessions.length,
    exercises: n,
    accuracy: n ? results.filter((r) => r.correct).length / n : null,
    hintsPerExercise: n ? results.reduce((sum, r) => sum + r.hintsUsed, 0) / n : null,
    avgSeconds: n ? results.reduce((sum, r) => sum + r.timeMs, 0) / n / 1000 : null,
  };
}

const HEADERS = [
  'fecha', 'apodo', 'categoria', 'nivel_inicio', 'resultado_sesion',
  'nivel_ejercicio', 'version', 'ejercicio', 'acierto', 'respuesta', 'ayudas', 'tiempo_s', 'tipo_sesion',
];

function cell(value) {
  const text = String(value ?? '');
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// CSV con ";" como separador y BOM, para que Excel en español lo abra bien con las tildes
export function toCsv(sessions) {
  const rows = [HEADERS];
  for (const s of sessions) {
    for (const r of s.results) {
      rows.push([
        s.date, s.nickname, s.category, s.startLevel, s.outcome,
        r.level, r.version, r.exerciseId, r.correct ? 1 : 0, r.chosenId,
        r.hintsUsed, Math.round(r.timeMs / 1000), s.review ? 'repaso' : 'practica',
      ]);
    }
  }
  return '﻿' + rows.map((row) => row.map(cell).join(';')).join('\r\n');
}