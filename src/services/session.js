import { getExercises, LEVELS } from './exerciseBank.js';

// Se supera un nivel con al menos 50 % de aciertos a la primera
// (mismo umbral del estudio de Maddalon et al.).
export const MASTERY_THRESHOLD = 0.5;
const MAX_LEVEL = LEVELS[LEVELS.length - 1];

// De los ejercicios disponibles elige el que lleva más tiempo sin verse
// (los que nunca se han visto van primero). "seen" guarda en qué sesión se vio cada uno.
function pickLeastSeen(candidates, seen) {
  let best = null;
  let bestValue = Infinity;
  for (const exercise of candidates) {
    const value = seen[exercise.id] ?? -1;
    if (value < bestValue) {
      best = exercise;
      bestValue = value;
    }
  }
  return best;
}

// Un bloque = 2 ejercicios de un nivel (una versión A y una B).
// El orden alterna entre sesiones y, dentro de cada versión, se prefieren los menos vistos.
function buildBlock(category, level, sessionNumber, seen) {
  const versions = sessionNumber % 2 === 0 ? ['A', 'B'] : ['B', 'A'];
  return versions
    .map((version) => pickLeastSeen(getExercises({ category, level, version }), seen))
    .filter(Boolean);
}

// ¿Ya completó los 3 niveles alguna vez en esta categoría?
export function isMastered(progress) {
  return Boolean(progress?.mastered);
}

export function createSession(category, progress) {
  const mastered = isMastered(progress);
  // Con el módulo dominado, practicar es un repaso: se recorren los niveles desde el 1
  const startLevel = mastered ? 1 : progress?.level || 1;
  const sessionNumber = progress?.sessions || 0;
  const seen = progress?.seen || {};
  return {
    category,
    startLevel,
    sessionNumber,
    review: mastered, // true cuando es un repaso de un módulo ya dominado
    seen,
    level: startLevel,
    block: buildBlock(category, startLevel, sessionNumber, seen),
    blockIndex: 0,
    results: [],
    levelHistory: [], // [{ level, correct, total, passed }]
    highestPassed: 0,
    outcome: null, // 'completed' | 'stopped' | 'exited'
    saved: false,
  };
}

export function currentExercise(session) {
  return session.block[session.blockIndex] || null;
}

export function recordResult(session, result) {
  session.results.push(result);
  session.blockIndex += 1;
}

// Evalúa el bloque terminado. Devuelve 'levelUp', 'completed' o 'stopped'.
export function closeBlock(session) {
  const start = session.results.length - session.block.length;
  const blockResults = session.results.slice(start);
  const correct = blockResults.filter((r) => r.correct).length;
  const total = blockResults.length;
  const passed = total > 0 && correct / total >= MASTERY_THRESHOLD;

  session.levelHistory.push({ level: session.level, correct, total, passed });

  if (!passed) {
    session.outcome = 'stopped';
    return 'stopped';
  }
  session.highestPassed = session.level;
  if (session.level >= MAX_LEVEL) {
    session.outcome = 'completed';
    return 'completed';
  }
  return 'levelUp';
}

export function advanceLevel(session) {
  session.level += 1;
  session.block = buildBlock(session.category, session.level, session.sessionNumber, session.seen);
  session.blockIndex = 0;
}

export function exitSession(session) {
  if (!session.outcome) session.outcome = 'exited';
}

// Ajuste "offline": calcula el progreso guardado para la próxima sesión.
export function nextProgress(prev, session) {
  const before = {
    level: prev?.level || 1,
    sessions: prev?.sessions || 0,
    stoppedStreak: prev?.stoppedStreak || 0,
    mastered: Boolean(prev?.mastered),
    seen: prev?.seen || {},
  };
  if (session.results.length === 0) return before; // salió sin practicar

  const next = { ...before, sessions: before.sessions + 1, stoppedStreak: 0 };

  // Recuerda en qué sesión se vio cada ejercicio, para no repetir los mismos enseguida
  next.seen = { ...before.seen };
  for (const result of session.results) next.seen[result.exerciseId] = next.sessions;

  if (session.outcome === 'completed') {
    next.level = MAX_LEVEL;
  } else if (session.outcome === 'stopped') {
    const failedLevel = session.level;
    next.level = failedLevel;
    next.stoppedStreak = failedLevel === session.startLevel ? before.stoppedStreak + 1 : 1;
    // Dos sesiones seguidas sin superar el mismo nivel: se baja uno
    if (next.stoppedStreak >= 2 && failedLevel > 1) {
      next.level = failedLevel - 1;
      next.stoppedStreak = 0;
    }
  } else if (session.highestPassed > 0) {
    // Salió después de superar algún nivel: la próxima vez empieza en el siguiente
    next.level = Math.min(session.highestPassed + 1, MAX_LEVEL);
  }

  // Módulo dominado: se conserva aunque un repaso posterior no salga perfecto
  if (before.mastered || session.outcome === 'completed') {
    next.mastered = true;
    next.level = MAX_LEVEL;
    next.stoppedStreak = 0;
  }
  return next;
}

export function summarize(session) {
  return {
    total: session.results.length,
    correct: session.results.filter((r) => r.correct).length,
    hints: session.results.reduce((sum, r) => sum + r.hintsUsed, 0),
  };
}