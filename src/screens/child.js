import { el } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { CATEGORIES } from '../data/categories.js';
import { loadState, saveState } from '../state.js';
import { createExerciseView } from '../components/exercise-view.js';
import {
  createFixedSession, currentExercise, recordResult, isFinished, summarize,
} from '../services/session.js';

export function childScreen() {
  const state = loadState();
  const root = el('section', { class: 'screen' });

  function renderNameForm() {
    const input = el('input', {
      id: 'nickname', class: 'input', type: 'text', maxlength: '20',
      autocomplete: 'off', required: true, placeholder: 'Escribe tu apodo',
    });
    const form = el('form', {
      class: 'stack',
      onsubmit: (event) => {
        event.preventDefault();
        const value = input.value.trim();
        if (!value) return;
        state.nickname = value;
        saveState(state);
        renderMenu();
      },
    },
      el('label', { class: 'label', for: 'nickname' }, '¿Cómo quieres que te llamemos?'),
      input,
      el('button', { class: 'btn', type: 'submit' }, 'Continuar')
    );
    root.replaceChildren(
      el('h1', {}, 'Vamos a empezar'),
      el('p', { class: 'lead' }, 'Solo necesitamos un apodo, no tu nombre completo.'),
      form
    );
  }

  function categoryButton(category) {
    const button = el('button', { class: 'card card--link card--button', type: 'button' },
      el('span', { class: 'card__icon' }, icon(category.icon, 28)),
      el('span', { class: 'card__title' }, category.childLabel),
      el('span', { class: 'card__text' }, category.childText)
    );
    button.addEventListener('click', () => startPractice(category.id));
    return button;
  }

  function renderMenu() {
    root.replaceChildren(
      el('h1', {}, `¡Hola, ${state.nickname}!`),
      el('p', { class: 'lead' }, '¿Qué quieres practicar hoy? Hazlo con un adulto a tu lado.'),
      el('div', { class: 'grid' }, CATEGORIES.map(categoryButton)),
      el('div', { class: 'actions' },
        el('a', { class: 'btn btn--ghost', href: '#/' }, 'Volver al inicio'),
        el('button', {
          class: 'btn btn--ghost',
          type: 'button',
          onclick: () => { state.nickname = ''; saveState(state); renderNameForm(); },
        }, 'Cambiar apodo')
      )
    );
  }

  function startPractice(categoryId) {
    showNext(createFixedSession(categoryId));
  }

  function showNext(session) {
    if (isFinished(session)) {
      renderSummary(session);
      return;
    }
    const view = createExerciseView(currentExercise(session), {
      position: session.index + 1,
      total: session.queue.length,
      onNext: (result) => { recordResult(session, result); showNext(session); },
      onExit: renderMenu,
    });
    root.replaceChildren(view);
    window.scrollTo(0, 0);
  }

  function renderSummary(session) {
    const { total, correct, hints } = summarize(session);
    const category = CATEGORIES.find((c) => c.id === session.category);
    root.replaceChildren(
      el('h1', {}, `¡Buen trabajo, ${state.nickname}!`),
      el('p', { class: 'lead' }, `Completaste los ${total} ejercicios de «${category.childLabel}».`),
      el('div', { class: 'card summary' },
        el('p', {}, el('strong', {}, `${correct} de ${total}`), ' respuestas acertadas a la primera.'),
        el('p', {}, hints === 0 ? 'No necesitaste ayudas.' : `Usaste ${hints} ${hints === 1 ? 'ayuda' : 'ayudas'}.`)
      ),
      el('div', { class: 'actions' },
        el('button', { class: 'btn', type: 'button', onclick: renderMenu }, 'Practicar otra cosa'),
        el('a', { class: 'btn btn--ghost', href: '#/' }, 'Volver al inicio')
      )
    );
    window.scrollTo(0, 0);
  }

  if (state.nickname) renderMenu(); else renderNameForm();
  return root;
}
