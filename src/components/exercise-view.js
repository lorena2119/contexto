import { el } from '../utils/dom.js';
import { icon } from './icons.js';
import { CATEGORIES } from '../data/categories.js';
import { isSpeechAvailable, speak, stopSpeech } from '../services/speech.js';

const HINT_AFTER_MS = 10000; // sin respuesta: se repite la pregunta
const MAX_HINTS = 2;

const PRAISE = ['¡Muy bien!', '¡Eso es!', '¡Buen trabajo!'];
const GENTLE = ['Esta vez no era esa. Veámoslo juntos.', 'Casi. Veamos qué pasó.'];

const pick = (list) => list[Math.floor(Math.random() * list.length)];

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createExerciseView(exercise, { position, total, onNext, onExit }) {
  const category = CATEGORIES.find((c) => c.id === exercise.category);
  const shownAt = Date.now();
  const spokenText = `${exercise.story} ${exercise.question}`;
  let lastActivity = shownAt;
  let hintsUsed = 0;
  let answered = false;
  let ticker = null;

  const questionEl = el('h2', { class: 'exercise-q' }, exercise.question);
  const hintBox = el('p', { class: 'hint', role: 'status', 'aria-live': 'polite' });
  const feedback = el('div', { class: 'feedback', role: 'status', 'aria-live': 'polite' });

  function cleanup() {
    if (ticker) {
      clearInterval(ticker);
      ticker = null;
    }
    stopSpeech();
  }

  function giveHint() {
    hintsUsed += 1;
    lastActivity = Date.now();
    hintBox.textContent = 'Vamos a leerlo otra vez, con calma.';
    questionEl.classList.add('is-highlighted');
    speak(spokenText);
  }

  function choose(option, button) {
    if (answered) return;
    answered = true;
    cleanup();

    const correct = option.id === exercise.correct;
    buttons.forEach((b) => { b.disabled = true; });

    const correctButton = buttons.find((b) => b.dataset.id === exercise.correct);
    correctButton.classList.add('option--correct');
    correctButton.prepend(icon('check', 22));
    if (!correct) {
      button.classList.add('option--chosen');
      button.append(el('span', { class: 'option__tag' }, 'Tu respuesta'));
    }

    hintBox.textContent = '';
    const isLast = position === total;
    const nextButton = el('button', { class: 'btn', type: 'button' },
    isLast ? 'Continuar' : 'Siguiente', icon('arrow', 20));
    nextButton.addEventListener('click', () => onNext({
      exerciseId: exercise.id,
      category: exercise.category,
      level: exercise.level,
      version: exercise.version,
      correct,
      chosenId: option.id,
      hintsUsed,
      timeMs: Date.now() - shownAt,
    }));

    feedback.replaceChildren(
      el('div', { class: correct ? 'feedback__box feedback__box--ok' : 'feedback__box' },
        el('div', { class: 'feedback__title' },
          icon(correct ? 'star' : 'lightbulb', 24),
          el('strong', {}, correct ? pick(PRAISE) : pick(GENTLE))
        ),
        el('p', {}, exercise.explanation),
        !correct && exercise.clues.length
          ? el('p', {}, el('strong', {}, 'Fíjate en: '), exercise.clues.join(' · '))
          : null
      ),
      nextButton
    );
    nextButton.focus();
  }

  const buttons = shuffle(exercise.options).map((option) => {
    const button = el('button', { class: 'option', type: 'button', 'data-id': option.id }, option.text);
    button.addEventListener('click', () => choose(option, button));
    return button;
  });

  const listenButton = isSpeechAvailable()
    ? el('button', {
        class: 'btn btn--ghost btn--small',
        type: 'button',
        onclick: () => { lastActivity = Date.now(); speak(spokenText); },
      }, icon('volume', 20), 'Escuchar')
    : null;

  const dots = el('div', { class: 'progress', role: 'img', 'aria-label': `Ejercicio ${position} de ${total}` },
    Array.from({ length: total }, (_, i) => el('span', { class: i < position ? 'dot dot--on' : 'dot' }))
  );

  const root = el('div', { class: 'exercise-view' },
    el('div', { class: 'exercise-head' },
      el('span', { class: 'badge badge--icon' }, icon(category.icon, 16), category.childLabel),
      dots,
      el('button', {
        class: 'link-btn',
        type: 'button',
        onclick: () => { cleanup(); onExit(); },
      }, 'Salir')
    ),
    el('div', { class: 'card story' },
      el('p', { class: 'story__text' }, exercise.story),
      listenButton
    ),
    questionEl,
    hintBox,
    el('div', { class: 'options', role: 'group', 'aria-label': 'Opciones de respuesta' }, buttons),
    feedback
  );

  // Cada segundo revisa si hay que dar una pista; se detiene solo si la pantalla se cierra
  ticker = setInterval(() => {
    if (!root.isConnected) { cleanup(); return; }
    if (answered || hintsUsed >= MAX_HINTS) return;
    if (Date.now() - lastActivity >= HINT_AFTER_MS) giveHint();
  }, 1000);

  return root;
}