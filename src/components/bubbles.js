import { fromHTML } from '../utils/dom.js';

// Ilustración: dos globos de conversación con efecto de vidrio
export function bubblesIllustration() {
  return fromHTML(`
    <svg viewBox="0 0 280 240" role="img" aria-label="Dos globos de conversación">
      <defs>
        <linearGradient id="gA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#8a7dff" />
          <stop offset="1" stop-color="#4890e0" />
        </linearGradient>
        <linearGradient id="gB" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.95" />
          <stop offset="1" stop-color="#d9ecff" stop-opacity="0.85" />
        </linearGradient>
        <radialGradient id="gC" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stop-color="#b6fafd" />
          <stop offset="1" stop-color="#19cfdb" />
        </radialGradient>
      </defs>

      <path d="M50 30h120a28 28 0 0 1 28 28v52a28 28 0 0 1-28 28H110l-34 28v-28H50a28 28 0 0 1-28-28V58a28 28 0 0 1 28-28z" fill="url(#gA)" />
      <ellipse cx="92" cy="48" rx="48" ry="10" fill="#fff" opacity="0.28" />
      <circle cx="76" cy="84" r="8" fill="#fff" opacity="0.95" />
      <circle cx="110" cy="84" r="8" fill="#fff" opacity="0.95" />
      <circle cx="144" cy="84" r="8" fill="#fff" opacity="0.95" />

      <path d="M150 112h82a26 26 0 0 1 26 26v38a26 26 0 0 1-26 26h-14v24l-30-24h-38a26 26 0 0 1-26-26v-38a26 26 0 0 1 26-26z" fill="url(#gB)" stroke="#ffffff" stroke-width="2" />
      <circle cx="172" cy="150" r="4.5" fill="#6d5dfc" />
      <circle cx="204" cy="150" r="4.5" fill="#6d5dfc" />
      <path d="M170 166q18 14 36 0" stroke="#6d5dfc" stroke-width="4" stroke-linecap="round" fill="none" />

      <circle cx="238" cy="40" r="18" fill="url(#gC)" />
      <ellipse cx="231" cy="33" rx="6" ry="4" fill="#fff" opacity="0.6" />
      <circle cx="38" cy="196" r="10" fill="url(#gC)" />
    </svg>
  `);
}