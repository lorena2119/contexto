import { STORAGE_KEY } from './config.js';

const defaultState = { nickname: '' };

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Si el navegador bloquea el almacenamiento, la app sigue funcionando sin guardar.
  }
}