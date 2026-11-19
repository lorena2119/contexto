import { STORAGE_KEY } from './config.js';

function freshState() {
  // progress: { [categoria]: { level, sessions, stoppedStreak } }
  // history: lista de sesiones (ver services/history.js)
  return { nickname: '', progress: {}, history: [], customExercises: [] };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...freshState(), ...JSON.parse(raw) } : freshState();
  } catch {
    return freshState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Si el navegador bloquea el almacenamiento, la app sigue funcionando sin guardar.
  }
}

export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada que borrar si no hay almacenamiento disponible.
  }
}