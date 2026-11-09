import { el } from '../utils/dom.js';

const sections = [
  ['Progreso', 'Aciertos, pistas y nivel por categoría.', 'Etapa 6'],
  ['Banco de ejercicios', 'Revisar y aprobar los ejercicios.', 'Etapa 3'],
  ['Asistente de IA', 'Analizar frases y resumir avances.', 'Etapa 7'],
];

export function therapistScreen() {
  return el('section', { class: 'screen' },
    el('h1', {}, 'Panel del terapeuta'),
    el('p', { class: 'lead' }, 'Estas secciones se irán activando en las próximas etapas.'),
    el('div', { class: 'grid' },
      sections.map(([title, text, stage]) =>
        el('div', { class: 'card card--disabled', 'aria-disabled': 'true' },
          el('h2', {}, title),
          el('p', {}, text),
          el('span', { class: 'badge' }, `Disponible en la ${stage}`)
        )
      )
    ),
    el('a', { class: 'btn btn--ghost', href: '#/' }, 'Volver al inicio')
  );
}