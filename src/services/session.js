import { getExercises } from './exerciseBank.js';

// Sesión fija de la Etapa 4: un ejercicio por nivel (versión A).
// En la Etapa 5 se reemplaza por el motor adaptativo.
export function createFixedSession(categoryId) {
  const queue = [1, 2, 3]
    .map((level) => getExercises({ category: categoryId, level, version: 'A' })[0])
    .filter(Boolean);
  return { category: categoryId, queue, index: 0, results: [] };
}

export function currentExercise(session) {
  return session.queue[session.index] || null;
}

export function recordResult(session, result) {
  session.results.push(result);
  session.index += 1;
}

export function isFinished(session) {
  return session.index >= session.queue.length;
}

export function summarize(session) {
  return {
    total: session.results.length,
    correct: session.results.filter((r) => r.correct).length,
    hints: session.results.reduce((sum, r) => sum + r.hintsUsed, 0),
  };
}