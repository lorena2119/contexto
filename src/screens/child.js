import { el } from '../utils/dom.js';
import { loadState, saveState } from '../state.js';

export function childScreen() {
  const state = loadState();
  const root = el('section', { class: 'screen' });

  function renderWelcome() {
    root.replaceChildren(
      el('h1', {}, `¡Hola, ${state.nickname}!`),
      el('p', { class: 'lead' },
        'Pronto aquí aparecerán tus ejercicios. Pide a tu acompañante que se siente contigo.'),
      el('div', { class: 'actions' },
        el('a', { class: 'btn btn--ghost', href: '#/' }, 'Volver al inicio'),
        el('button', {
          class: 'btn btn--ghost',
          type: 'button',
          onclick: () => { state.nickname = ''; saveState(state); renderNameForm(); }
        }, 'Cambiar apodo')
      )
    );
  }

  function renderNameForm() {
    const input = el('input', {
      id: 'nickname', class: 'input', type: 'text', maxlength: '20',
      autocomplete: 'off', required: true, placeholder: 'Escribe tu apodo'
    });
    const form = el('form', {
      class: 'stack',
      onsubmit: (event) => {
        event.preventDefault();
        const value = input.value.trim();
        if (!value) return;
        state.nickname = value;
        saveState(state);
        renderWelcome();
      }
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

  if (state.nickname) renderWelcome(); else renderNameForm();
  return root;
}
