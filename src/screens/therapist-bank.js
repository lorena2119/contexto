import { el } from '../utils/dom.js';
import { CATEGORIES } from '../data/categories.js';
import { LEVELS, getExercises } from '../services/exerciseBank.js';
import { icon } from '../components/icons.js';

function field(id, label, options, onChange) {
  const select = el('select', {
    id,
    class: 'input input--select',
    onchange: (event) => onChange(event.target.value),
  }, options.map(([value, text]) => el('option', { value }, text)));
  return el('div', { class: 'field' },
    el('label', { class: 'label', for: id }, label),
    select
  );
}

function exerciseCard(ex) {
  const category = CATEGORIES.find((c) => c.id === ex.category);
  return el('article', { class: 'card exercise' },
    el('div', { class: 'tags' },
      el('span', { class: 'badge badge--icon' }, icon(category.icon, 16), category.label),
      el('span', { class: 'badge' }, `Nivel ${ex.level}`),
      el('span', { class: 'badge' }, `Versión ${ex.version}`)
    ),
    el('p', { class: 'exercise__story' }, ex.story),
    el('h2', { class: 'exercise__question' }, ex.question),
    el('ul', { class: 'exercise__options' },
      ex.options.map((option) =>
        option.id === ex.correct
          ? el('li', { class: 'is-correct' }, icon('check', 18), `${option.text} (correcta)`)
          : el('li', {}, option.text)
      )
    ),
    el('p', { class: 'exercise__explanation' }, el('strong', {}, 'Explicación: '), ex.explanation),
    ex.clues && ex.clues.length
      ? el('p', { class: 'exercise__explanation' }, el('strong', {}, 'Pistas: '), ex.clues.join(' · '))
      : null
  );
}

export function therapistBankScreen() {
  const filters = { category: 'todas', level: 'todos' };
  const list = el('div', { class: 'bank' });
  const count = el('p', { class: 'note', 'aria-live': 'polite' });

  function render() {
    const items = getExercises({
      category: filters.category === 'todas' ? undefined : filters.category,
      level: filters.level === 'todos' ? undefined : Number(filters.level),
    });
    list.replaceChildren(...items.map(exerciseCard));
    count.textContent = `${items.length} ejercicio${items.length === 1 ? '' : 's'}`;
  }

  const categoryField = field(
    'filter-category', 'Categoría',
    [['todas', 'Todas'], ...CATEGORIES.map((c) => [c.id, c.label])],
    (value) => { filters.category = value; render(); }
  );
  const levelField = field(
    'filter-level', 'Nivel',
    [['todos', 'Todos'], ...LEVELS.map((l) => [String(l), `Nivel ${l}`])],
    (value) => { filters.level = value; render(); }
  );

  render();

  return el('section', { class: 'screen' },
    el('h1', {}, 'Banco de ejercicios'),
    el('p', { class: 'lead' }, 'Vista de revisión: aquí ves las respuestas correctas, que el niño no ve.'),
    el('div', { class: 'filters' }, categoryField, levelField),
    count,
    list,
    el('a', { class: 'btn btn--ghost', href: '#/terapeuta' }, 'Volver al panel')
  );
}