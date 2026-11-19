import { EXERCISES } from '../data/exercises.js';
import { CATEGORIES } from '../data/categories.js';
import { loadState, saveState } from '../state.js';

export const LEVELS = [1, 2, 3];
export const VERSIONS = ['A', 'B'];

// Nivel 1 = 2 opciones, nivel 2 = 3, nivel 3 = 4
export function optionsCountForLevel(level) {
  return level + 1;
}

// ---------- Lecciones agregadas por el terapeuta (se guardan en localStorage) ----------
export function getCustomExercises() {
  const state = loadState();
  return Array.isArray(state.customExercises) ? state.customExercises : [];
}

// Banco completo: ejercicios base + lecciones del terapeuta
export function getAllExercises() {
  return [...EXERCISES, ...getCustomExercises()];
}

export function getExercises({ category, level, version, status = 'aprobado' } = {}) {
  return getAllExercises().filter((ex) =>
    (!category || ex.category === category) &&
    (!level || ex.level === level) &&
    (!version || ex.version === version) &&
    (!status || ex.status === status)
  );
}

export function getExerciseById(id) {
  return getAllExercises().find((ex) => ex.id === id) || null;
}

export function isCustomExercise(id) {
  return getCustomExercises().some((ex) => ex.id === id);
}

export function validateExercise(ex) {
  const errors = [];
  const required = ['id', 'category', 'level', 'version', 'story', 'question', 'options', 'correct', 'explanation', 'status'];
  for (const key of required) {
    if (ex[key] == null || ex[key] === '') errors.push(`Falta el campo "${key}"`);
  }
  if (!CATEGORIES.some((c) => c.id === ex.category)) errors.push('Categoría desconocida');
  if (!LEVELS.includes(ex.level)) errors.push('Nivel inválido');
  if (!VERSIONS.includes(ex.version)) errors.push('Versión inválida');
  if (Array.isArray(ex.options)) {
    if (ex.options.length !== optionsCountForLevel(ex.level)) {
      errors.push(`El nivel ${ex.level} debe tener ${optionsCountForLevel(ex.level)} opciones`);
    }
    if (!ex.options.some((o) => o.id === ex.correct)) {
      errors.push('La respuesta correcta no coincide con ninguna opción');
    }
    if (new Set(ex.options.map((o) => o.id)).size !== ex.options.length) {
      errors.push('Hay opciones con id repetido');
    }
  }
  return errors;
}

// Devuelve { ok: true } o { ok: false, errors: [...] }
export function addCustomExercise(exercise) {
  const errors = validateExercise(exercise);
  if (errors.length) return { ok: false, errors };
  const state = loadState();
  const current = Array.isArray(state.customExercises) ? state.customExercises : [];
  saveState({ ...state, customExercises: [...current, exercise] });
  return { ok: true };
}

export function deleteCustomExercise(id) {
  const state = loadState();
  const current = Array.isArray(state.customExercises) ? state.customExercises : [];
  saveState({ ...state, customExercises: current.filter((ex) => ex.id !== id) });
}

// Devuelve una lista de problemas (vacía si todo está bien). Revisa solo los ejercicios base.
export function validateBank() {
  const problems = [];
  const ids = new Set();
  for (const ex of EXERCISES) {
    if (ids.has(ex.id)) problems.push(`${ex.id}: id repetido`);
    ids.add(ex.id);
    for (const error of validateExercise(ex)) problems.push(`${ex.id}: ${error}`);
  }
  for (const c of CATEGORIES) {
    for (const l of LEVELS) {
      for (const v of VERSIONS) {
        const exists = EXERCISES.some((ex) => ex.category === c.id && ex.level === l && ex.version === v);
        if (!exists) problems.push(`Falta ejercicio: ${c.id}, nivel ${l}, versión ${v}`);
      }
    }
  }
  return problems;
}