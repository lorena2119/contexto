import { el } from '../utils/dom.js';

const sections = [
  { title: 'Progreso', text: 'Aciertos, pistas y nivel por categoría.', stage: 'Etapa 6' },
  { title: 'Banco de ejercicios', text: 'Revisar los ejercicios por categoría y nivel.', href: '#/terapeuta/banco' },
  { title: 'Asistente de IA', text: 'Analizar frases y resumir avances.', stage: 'Etapa 7' },
];

function sectionCard({ title, text, stage, href }) {
  if (href) {
    return el('a', { class: 'card card--link', href },
      el('h2', {}, title),
      el('p', {}, text)
    );
  }
  return el('div', { class: 'card card--disabled', 'aria-disabled': 'true' },
    el('h2', {}, title),
    el('p', {}, text),
    el('span', { class: 'badge' }, `Disponible en la ${stage}`)
  );
}

export function therapistScreen() {
  return el('section', { class: 'screen' },
    el('h1', {}, 'Panel del terapeuta'),
    el('p', { class: 'lead' }, 'Estas secciones se irán activando en las próximas etapas.'),
    el('div', { class: 'grid' }, sections.map(sectionCard)),
    el('a', { class: 'btn btn--ghost', href: '#/' }, 'Volver al inicio')
  );
}