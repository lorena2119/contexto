import { el } from '../utils/dom.js';
import { icon } from './icons.js';
import { CATEGORIES } from '../data/categories.js';
import { LEVELS, VERSIONS, optionsCountForLevel, addCustomExercise, getExercises } from '../services/exerciseBank.js';
import { findByPhrase, findSimilar } from '../services/similarity.js';
import { generateExercise } from '../services/ai.js';
import { createSceneEditor } from './scene-editor.js';

const TYPE_TO_CATEGORY = { sarcasmo: 'sarcasmo', metafora: 'metafora' };

export function canBecomeLesson(result) {
  return Boolean(TYPE_TO_CATEGORY[result.tipo]);
}

function labeled(id, label, control) {
  return el('div', { class: 'field' }, el('label', { class: 'label', for: id }, label), control);
}

// Todas las lecciones de la categoría, aprobadas o no
const existingIn = (categoryId) => getExercises({ category: categoryId, status: null });

const describe = (ex) => `«${ex.story.length > 90 ? `${ex.story.slice(0, 90)}…` : ex.story}» (nivel ${ex.level}, versión ${ex.version})`;

export function createLessonEditor({ phrase, context, result, onDone }) {
  const category = CATEGORIES.find((c) => c.id === TYPE_TO_CATEGORY[result.tipo]);
  const root = el('section', { class: 'card lesson-editor' });

  // ---------- Paso 1: elegir nivel y versión ----------
  function renderStart(message) {
    const levelSelect = el('select', { id: 'lesson-level', class: 'input input--select' },
      LEVELS.map((l) =>
        el('option', { value: String(l), selected: l === 2 }, `Nivel ${l} (${optionsCountForLevel(l)} opciones)`)
      )
    );
    const versionSelect = el('select', { id: 'lesson-version', class: 'input input--select' },
      VERSIONS.map((v) => el('option', { value: v }, `Versión ${v}`))
    );
    const errorBox = el('p', { class: 'lesson-error', role: 'alert' }, message || '');
    const repeated = findByPhrase(phrase, existingIn(category.id));
    const repeatedNote = repeated.length
      ? el('div', { class: 'card ai-error lesson-warning', role: 'status' },
          el('p', {}, el('strong', {}, 'Ya hay una lección con esta frase en esta categoría. '),
            'Revisa si de verdad quieres otra:'),
          el('ul', {}, repeated.slice(0, 3).map((ex) => el('li', {}, describe(ex)))))
      : null;
    const createButton = el('button', { class: 'btn btn--small', type: 'button' }, 'Crear borrador con IA');

    createButton.addEventListener('click', async () => {
      const level = Number(levelSelect.value);
      const version = versionSelect.value;
      createButton.disabled = true;
      createButton.textContent = 'Creando borrador…';
      errorBox.textContent = '';
      try {
        const { ejercicio } = await generateExercise({
          frase: phrase,
          contexto: context,
          tipo: result.tipo,
          significado: result.significado,
          nivel: level,
        });
        renderForm(ejercicio, level, version);
      } catch (error) {
        errorBox.textContent = error.message;
        createButton.disabled = false;
        createButton.textContent = 'Crear borrador con IA';
      }
    });

    root.replaceChildren(
      el('h3', {}, `Agregar a «${category.label}»`),
      el('p', {}, 'La IA propone una lección con su ilustración y tú la revisas y la editas antes de guardarla.'),
      repeatedNote,
      el('div', { class: 'filters' },
        labeled('lesson-level', 'Nivel', levelSelect),
        labeled('lesson-version', 'Versión', versionSelect)
      ),
      errorBox,
      createButton
    );
  }

  // ---------- Paso 2: revisar y editar el borrador ----------
  function renderForm(draft, level, version) {
    const story = el('textarea', { id: 'lesson-story', class: 'input textarea', rows: '3' }, draft.historia);
    const question = el('input', { id: 'lesson-question', class: 'input', type: 'text', maxlength: '160', value: draft.pregunta });
    const explanation = el('textarea', { id: 'lesson-explanation', class: 'input textarea', rows: '2' }, draft.explicacion);
    const clues = el('textarea', { id: 'lesson-clues', class: 'input textarea', rows: '2' }, draft.pistas.join('\n'));
    const errorBox = el('p', { class: 'lesson-error', role: 'alert' });
    const similarBox = el('div', { class: 'lesson-warning', role: 'status' });
    const sceneEditor = createSceneEditor(draft.escena, result.tipo);

    const optionRows = draft.opciones.map((text, i) => {
      const radio = el('input', {
        type: 'radio', name: 'lesson-correct', value: String(i),
        checked: i === draft.correcta, 'aria-label': `Marcar la opción ${i + 1} como correcta`,
      });
      const input = el('input', {
        class: 'input', type: 'text', maxlength: '120', value: text, 'aria-label': `Opción ${i + 1}`,
      });
      return { radio, input, row: el('div', { class: 'option-row' }, radio, input) };
    });

    function save(force = false) {
      similarBox.replaceChildren();
      const correctIndex = optionRows.findIndex((r) => r.radio.checked);
      const texts = optionRows.map((r) => r.input.value.trim());
      if (correctIndex < 0) { errorBox.textContent = 'Marca cuál es la opción correcta.'; return; }
      if (texts.some((t) => !t)) { errorBox.textContent = 'Todas las opciones deben tener texto.'; return; }

      const exercise = {
        id: `custom-${Date.now()}`,
        category: category.id,
        level,
        version,
        story: story.value.trim(),
        question: question.value.trim(),
        options: texts.map((text, i) => ({ id: 'abcd'[i], text })),
        correct: 'abcd'[correctIndex],
        explanation: explanation.value.trim(),
        clues: clues.value.split('\n').map((line) => line.trim()).filter(Boolean),
        status: 'aprobado',
        source: 'ia',
      };
      const scene = sceneEditor.getDescriptor();
      if (scene) exercise.escena = scene;

      // Antes de guardar: ¿ya hay algo parecido en esta categoría?
      const similar = force === true ? [] : findSimilar(exercise, existingIn(category.id));
      if (similar.length) {
        similarBox.replaceChildren(el('div', { class: 'card ai-error' },
          el('p', {}, el('strong', {}, 'Se parece a lecciones que ya existen:')),
          el('ul', {}, similar.map((m) =>
            el('li', {}, `${describe(m.exercise)}${m.samePhrase ? ' · usa la misma frase' : ` · ${Math.round(m.score * 100)} % parecida`}`))),
          el('div', { class: 'actions' },
            el('button', { class: 'btn btn--small', type: 'button', onclick: () => save(true) }, 'Guardar de todos modos'),
            el('p', { class: 'ai-meta' }, 'O cambia la historia o la pregunta y vuelve a guardar.'))));
        return;
      }

      const outcome = addCustomExercise(exercise);
      if (!outcome.ok) { errorBox.textContent = outcome.errors.join(' '); return; }
      renderSaved();
    }

    root.replaceChildren(
      el('h3', {}, `Revisa la lección · ${category.label} · nivel ${level} · versión ${version}`),
      labeled('lesson-story', 'Historia', story),
      labeled('lesson-question', 'Pregunta', question),
      el('p', { class: 'label' }, 'Opciones (marca la correcta)'),
      ...optionRows.map((r) => r.row),
      labeled('lesson-explanation', 'Explicación para el niño', explanation),
      labeled('lesson-clues', 'Pistas (una por línea, opcional)', clues),
      el('h3', { class: 'lesson-subtitle' }, 'Ilustración'),
      sceneEditor.element,
      errorBox,
      similarBox,
      el('div', { class: 'actions' },
        el('button', { class: 'btn btn--small', type: 'button', onclick: () => save() }, icon('check', 20), `Guardar en ${category.label}`),
        el('button', { class: 'btn btn--ghost btn--small', type: 'button', onclick: () => renderStart() }, 'Volver atrás')
      )
    );
  }

  // ---------- Paso 3: confirmación ----------
  function renderSaved() {
    root.replaceChildren(
      el('h3', {}, 'Lección agregada'),
      el('p', {}, `Ya está en el banco de «${category.label}» y puede aparecer en la práctica.`),
      el('div', { class: 'actions' },
        el('a', { class: 'btn btn--small', href: '#/terapeuta/banco' }, 'Ver banco de ejercicios'),
        el('button', { class: 'btn btn--ghost btn--small', type: 'button', onclick: onDone }, 'Analizar otra frase')
      )
    );
  }

  renderStart();
  return root;
}