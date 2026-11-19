import { el } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { CATEGORIES } from '../data/categories.js';
import { loadState, saveState } from '../state.js';
import { createExerciseView } from '../components/exercise-view.js';
import {
  createSession, currentExercise, recordResult, closeBlock, advanceLevel,
  exitSession, nextProgress, summarize, isMastered, MASTERY_THRESHOLD,
} from '../services/session.js';
import { buildSessionRecord, addSession } from '../services/history.js';

export function childScreen() {
  const state = loadState();
  state.progress = state.progress || {};
  const root = el('section', { class: 'screen' });

  // ---------- Apodo ----------
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

  // ---------- Menú ----------
  function masteredBadge(label = 'Dominado') {
    return el('span', { class: 'badge badge--icon' }, icon('check', 16), label);
  }

  function categoryButton(category) {
    const mastered = isMastered(state.progress[category.id]);
    const button = el('button', { class: 'card card--link card--button', type: 'button' },
      el('span', { class: 'card__icon' }, icon(category.icon, 28)),
      el('span', { class: 'card__title' }, category.childLabel),
      el('span', { class: 'card__text' }, mastered ? 'Ya lo dominas. Toca para repasarlo.' : category.childText),
      mastered ? masteredBadge() : null
    );
    button.addEventListener('click', () => startPractice(category.id));
    return button;
  }

  function renderMenu() {
    root.replaceChildren(
      el('h1', {}, `¡Hola, ${state.nickname}!`),
      el('p', { class: 'lead' }, '¿Qué quieres practicar hoy? Hazlo con un adulto a tu lado.'),
      el('div', { class: 'grid' }, CATEGORIES.map(categoryButton)),
      el('details', { class: 'adult-details' },
        el('summary', {}, 'Opciones para el adulto'),
        el('p', {}, 'El nivel de cada categoría se guarda en este navegador y se ajusta según cómo le vaya en cada sesión.'),
        el('button', {
          class: 'btn btn--ghost btn--small',
          type: 'button',
          onclick: () => { state.progress = {}; saveState(state); renderMenu(); },
        }, 'Reiniciar niveles')
      ),
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

  // ---------- Práctica ----------
    function saveProgress(session) {
    if (session.saved) return;
    session.saved = true;
    state.progress[session.category] = nextProgress(state.progress[session.category], session);
    if (session.results.length > 0) {
      addSession(state, buildSessionRecord(session, state.nickname));
    }
    saveState(state);
  }

  function startPractice(categoryId) {
    const session = createSession(categoryId, state.progress[categoryId]);
    if (session.review) renderReviewIntro(session);
    else showNext(session);
  }

  // Aviso antes de un repaso (el tema ya está dominado)
  function renderReviewIntro(session) {
    const category = CATEGORIES.find((c) => c.id === session.category);
    root.replaceChildren(
      el('h1', {}, 'Vamos a repasar'),
      el('p', { class: 'lead' }, `Ya dominas «${category.childLabel}». Repasar ayuda a recordarlo mejor. Empezamos otra vez desde el principio.`),
      el('div', { class: 'actions' },
        el('button', { class: 'btn', type: 'button', onclick: () => showNext(session) }, 'Empezar el repaso', icon('arrow', 20)),
        el('button', { class: 'btn btn--ghost', type: 'button', onclick: renderMenu }, 'Volver al menú')
      )
    );
    window.scrollTo(0, 0);
  }

  function showNext(session) {
    const exercise = currentExercise(session);
    if (!exercise) {
      endOfBlock(session);
      return;
    }
    const view = createExerciseView(exercise, {
      position: session.blockIndex + 1,
      total: session.block.length,
      onNext: (result) => { recordResult(session, result); showNext(session); },
      onExit: () => { exitSession(session); saveProgress(session); renderMenu(); },
    });
    root.replaceChildren(view);
    window.scrollTo(0, 0);
  }

  function endOfBlock(session) {
    const result = closeBlock(session);
    if (result === 'levelUp') {
      renderLevelUp(session);
    } else {
      saveProgress(session);
      renderSummary(session);
    }
  }

  function renderLevelUp(session) {
    root.replaceChildren(
      el('h1', {}, '¡Vas muy bien!'),
      el('p', { class: 'lead' }, 'Ahora vienen ejercicios un poquito más difíciles. ¿Seguimos?'),
      el('div', { class: 'actions' },
        el('button', {
          class: 'btn',
          type: 'button',
          onclick: () => { advanceLevel(session); showNext(session); },
        }, 'Seguir', icon('arrow', 20)),
        el('button', {
          class: 'btn btn--ghost',
          type: 'button',
          onclick: () => { exitSession(session); saveProgress(session); renderSummary(session); },
        }, 'Terminar por hoy')
      )
    );
    window.scrollTo(0, 0);
  }

  // ---------- Resumen ----------
  function adultSummary(session) {
    const progress = state.progress[session.category];
    const rows = session.levelHistory.map((h) =>
      el('li', {}, `Nivel ${h.level}: ${h.correct} de ${h.total} aciertos a la primera (${h.passed ? 'superado' : 'a reforzar'})`)
    );
    return el('details', { class: 'adult-details' },
      el('summary', {}, 'Resumen para el adulto'),
      el('ul', {},
        el('li', {}, session.review ? 'Tipo de sesión: repaso de un módulo dominado' : 'Tipo de sesión: práctica'),
        el('li', {}, `Nivel de partida: ${session.startLevel}`),
        ...rows,
        el('li', {}, `Nivel más alto superado hoy: ${session.highestPassed || 'ninguno todavía'}`),
        el('li', {}, isMastered(progress)
          ? 'Módulo dominado: las próximas sesiones serán repasos desde el nivel 1'
          : `La próxima sesión empieza en el nivel ${progress ? progress.level : session.startLevel}`)
      ),
      el('p', {}, `Un nivel se supera con al menos ${Math.round(MASTERY_THRESHOLD * 100)} % de aciertos a la primera.`)
    );
  }

  function renderSummary(session) {
    const { total, correct, hints } = summarize(session);
    const category = CATEGORIES.find((c) => c.id === session.category);
    const name = state.nickname;
    const texts = session.review
      ? {
          completed: [`¡Buen repaso, ${name}!`, `Repasaste todos los niveles de «${category.childLabel}».`],
          stopped: [`¡Buen repaso, ${name}!`, 'Repasar también se aprende poco a poco. Este tema sigue siendo tuyo.'],
          exited: [`¡Buen trabajo, ${name}!`, `Repasaste «${category.childLabel}». Puedes seguir cuando quieras.`],
        }
      : {
          completed: [`¡Lo lograste, ${name}!`, `Completaste todos los niveles de «${category.childLabel}».`],
          stopped: [`¡Buen trabajo por intentarlo, ${name}!`, 'Esto se aprende poco a poco. Vamos a seguir practicando juntos.'],
          exited: [`¡Buen trabajo, ${name}!`, `Practicaste «${category.childLabel}». Puedes seguir cuando quieras.`],
        };
    const earnedMastery = session.outcome === 'completed' && !session.review;
    const [title, lead] = texts[session.outcome] || texts.exited;

    root.replaceChildren(
      el('h1', {}, title),
      el('p', { class: 'lead' }, lead),
      el('div', { class: 'card summary' },
        el('p', {}, el('strong', {}, `${correct} de ${total}`), ' respuestas acertadas a la primera.'),
        el('p', {}, hints === 0 ? 'No necesitaste ayudas.' : `Usaste ${hints} ${hints === 1 ? 'ayuda' : 'ayudas'}.`),
        earnedMastery ? masteredBadge('Módulo dominado') : null
      ),
      adultSummary(session),
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