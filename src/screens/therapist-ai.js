import { el } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { getAiStatus, analyzePhrase } from '../services/ai.js';
import { canBecomeLesson, createLessonEditor } from '../components/lesson-editor.js';

const TYPE_INFO = {
  literal: { label: 'Literal', icon: 'check' },
  sarcasmo: { label: 'Sarcasmo', icon: 'irony' },
  metafora: { label: 'Metáfora o expresión', icon: 'sparkles' },
  ambigua: { label: 'Ambigua', icon: 'thought' },
};
const CONFIDENCE_LABELS = { alta: 'Confianza alta', media: 'Confianza media', baja: 'Confianza baja' };

const EXAMPLES = [
  '¡Qué día tan bonito!',
  'Tengo mariposas en el estómago',
  'Se me hizo un nudo en la garganta',
  'Eso fue pan comido',
  'Vi a la niña con el telescopio',
  'Mañana vamos al parque',
];

function block(title, text) {
  if (!text) return null;
  return el('section', { class: 'ai-block' }, el('h3', {}, title), el('p', {}, text));
}

function listBlock(title, items) {
  if (!items.length) return null;
  return el('section', { class: 'ai-block' },
    el('h3', {}, title),
    el('ul', {}, items.map((item) => el('li', {}, item)))
  );
}

function interpretationsBlock(items) {
  if (!items.length) return null;
  return el('section', { class: 'ai-block' },
    el('h3', {}, 'Interpretaciones posibles'),
    el('ul', {},
      items.map((item) =>
        el('li', {},
          el('strong', {}, item.texto),
          item.contexto ? el('div', { class: 'ai-meta' }, `Más probable si: ${item.contexto}`) : null
        )
      )
    )
  );
}

function lessonSection(result, phrase, context, onDone) {
  const lessonBox = el('div', { class: 'lesson-box' });
  if (!canBecomeLesson(result)) {
    return el('p', { class: 'ai-meta' }, 'Solo las frases con sarcasmo o metáfora se pueden agregar como lección.');
  }
  const addButton = el('button', { class: 'btn btn--small', type: 'button' },
    icon('plus', 20), 'Agregar como lección');
  addButton.addEventListener('click', () => {
    addButton.remove();
    lessonBox.replaceChildren(createLessonEditor({ phrase, context, result, onDone }));
  });
  return el('div', { class: 'ai-block' }, addButton, lessonBox);
}

function resultCard(result, phrase, context, onDone) {
  const info = TYPE_INFO[result.tipo] || TYPE_INFO.ambigua;
  return el('article', { class: 'card ai-card' },
    el('div', { class: 'tags' },
      el('span', { class: 'badge badge--icon' }, icon(info.icon, 16), info.label),
      el('span', { class: 'badge' }, CONFIDENCE_LABELS[result.confianza] || '')
    ),
    block('Qué quiso decir', result.significado),
    listBlock('Pistas para darse cuenta', result.pistas),
    block('Cómo explicárselo al niño', result.explicacion_para_nino),
    interpretationsBlock(result.interpretaciones),
    block('Nota para el adulto', result.nota_para_adulto),
    lessonSection(result, phrase, context, onDone)
  );
}

export function therapistAiScreen() {
  const statusBadge = el('span', { class: 'badge' }, 'Revisando conexión…');
  const demoHint = el('p', { class: 'note' });
  const phraseInput = el('textarea', {
    id: 'phrase', class: 'input textarea', rows: '2', maxlength: '300',
    required: true, placeholder: 'Ej.: ¡Qué día tan bonito!',
  });
  const contextInput = el('input', {
    id: 'context', class: 'input', type: 'text', maxlength: '300',
    placeholder: 'Ej.: Está lloviendo y quería salir al parque',
  });
  const submit = el('button', { class: 'btn', type: 'submit' }, 'Analizar');
  const resultBox = el('div', { class: 'ai-result', 'aria-live': 'polite' });

  const examples = el('div', { class: 'chips' },
    EXAMPLES.map((text) => {
      const chip = el('button', { class: 'chip', type: 'button' }, text);
      chip.addEventListener('click', () => {
        phraseInput.value = text;
        phraseInput.focus();
      });
      return chip;
    })
  );

  getAiStatus()
    .then(({ modo, proveedores }) => {
      statusBadge.textContent = modo === 'ia' ? `IA conectada (${proveedores.join(' + ')})` : 'Modo demostración';
      demoHint.textContent = modo === 'demo'
        ? 'En modo demostración solo se reconocen frases de ejemplo y no se pueden crear lecciones.'
        : '';
    })
    .catch(() => {
      statusBadge.textContent = 'Servidor sin conexión: ejecuta "npm run server"';
    });

  function reset() {
    resultBox.replaceChildren();
    phraseInput.value = '';
    contextInput.value = '';
    phraseInput.focus();
    window.scrollTo(0, 0);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const phrase = phraseInput.value.trim();
    const context = contextInput.value.trim();
    if (!phrase) return;

    submit.disabled = true;
    submit.textContent = 'Analizando…';
    resultBox.replaceChildren(el('p', { class: 'note' }, 'Un momento…'));
    try {
      const { resultado, modo } = await analyzePhrase(phrase, context);
      resultBox.replaceChildren(
        ...(modo === 'respaldo'
          ? [el('p', { class: 'note' }, 'La IA no estaba disponible: esta es una respuesta de ejemplo preparada.')]
          : []),
        resultCard(resultado, phrase, context, reset)
      );
    } catch (error) {
      resultBox.replaceChildren(el('div', { class: 'card ai-error' }, error.message));
    } finally {
      submit.disabled = false;
      submit.textContent = 'Analizar';
    }
  }

  return el('section', { class: 'screen' },
    el('h1', {}, 'Asistente de IA'),
    el('div', { class: 'tags' }, statusBadge),
    demoHint,
    el('p', { class: 'lead' },
      'Analiza una frase y te explica qué quiso decir y cómo darse cuenta. Revisa siempre lo que sugiere antes de usarlo con el niño.'),
    el('form', { class: 'stack stack--wide', onsubmit: handleSubmit },
      el('label', { class: 'label', for: 'phrase' }, 'Frase'),
      phraseInput,
      el('label', { class: 'label', for: 'context' }, 'Contexto (opcional)'),
      contextInput,
      submit
    ),
    el('p', { class: 'label' }, 'Prueba con un ejemplo'),
    examples,
    el('p', { class: 'note' },
      'No escribas nombres ni datos personales: el texto se envía a un servicio de IA externo y, en los planes gratuitos, el proveedor puede usarlo para mejorar sus productos. La IA puede equivocarse y no hace evaluaciones clínicas.'),
    resultBox,
    el('a', { class: 'btn btn--ghost', href: '#/terapeuta' }, 'Volver al panel')
  );
}