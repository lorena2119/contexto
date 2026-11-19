import { el, fromHTML } from '../utils/dom.js';
import { renderPanels } from '../illustrations/scene.js';
import { SCENES } from '../data/scenes.js';

// Devuelve la ilustración de un ejercicio, o null si no tiene.
// "exercise.escena" queda listo para las lecciones creadas con IA.
export function illustrationFor(exercise) {
  const descriptor = exercise.escena || SCENES[exercise.id];
  if (!descriptor) return null;

  const panels = renderPanels(descriptor).map((svg) => fromHTML(svg));
  const isStrip = panels.length > 1;

  return el('div', { class: isStrip ? 'illustration illustration--strip' : 'illustration' },
    panels.map((svg, i) =>
      el('figure', { class: 'illustration__panel' },
        svg,
        isStrip ? el('span', { class: 'illustration__num', 'aria-hidden': 'true' }, String(i + 1)) : null
      )
    )
  );
}