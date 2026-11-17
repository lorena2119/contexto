import { el } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { bubblesIllustration } from '../components/bubbles.js';

function profileCard(href, iconName, title, text) {
  return el('a', { class: 'card card--link', href },
    el('div', { class: 'card__icon' }, icon(iconName, 28)),
    el('h2', {}, title),
    el('p', {}, text)
  );
}

export function homeScreen() {
  return el('section', { class: 'screen' },
    el('div', { class: 'hero' },
      el('div', {},
        el('h1', {},
          'Practica entender ',
          el('span', { class: 'accent' }, 'lo que quieren decir'),
          ' los demás'
        ),
        el('p', { class: 'lead' },
          'Ejercicios cortos sobre creencias, sentimientos, sarcasmo y metáforas.')
      ),
      el('div', { class: 'hero__art' }, bubblesIllustration())
    ),
    el('div', { class: 'grid' },
      profileCard('#/nino', 'smile', 'Soy niño o niña', 'Practica con un adulto a tu lado.'),
      profileCard('#/terapeuta', 'clipboard', 'Soy terapeuta o cuidador', 'Prepara ejercicios y revisa avances.')
    ),
    el('p', { class: 'note' },
      'Esta herramienta es un apoyo y no reemplaza el trabajo de un profesional.')
  );
}