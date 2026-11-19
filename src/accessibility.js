// Ajustes de comodidad: bajo estímulo, tamaño de letra y contraste.
// Se activa con una sola línea en src/main.js:  import './accessibility.js';
import './accesibilidad.css';

const KEY = 'entrelineas:comodidad';
const SIZES = { normal: 'Normal', large: 'Grande', xlarge: 'Muy grande' };
const DEFAULTS = { lowStimulus: false, fontSize: 'normal', contrast: false };

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && typeof saved === 'object') {
      return {
        lowStimulus: saved.lowStimulus === true,
        fontSize: saved.fontSize in SIZES ? saved.fontSize : 'normal',
        contrast: saved.contrast === true,
      };
    }
  } catch { /* sin almacenamiento: se usan los valores por defecto */ }
  // Primera vez: respeta lo que ya pidió el sistema operativo
  const prefers = (query) => typeof matchMedia === 'function' && matchMedia(query).matches;
  return { ...DEFAULTS, contrast: prefers('(prefers-contrast: more)') };
}

function writeSettings(settings) {
  try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* no es grave */ }
}

function apply(settings) {
  const root = document.documentElement;
  root.dataset.bajoEstimulo = String(settings.lowStimulus);
  root.dataset.letra = settings.fontSize;
  root.dataset.contraste = String(settings.contrast);
}

const h = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    node.setAttribute(k, v === true ? '' : v);
  }
  node.append(...children.flat().filter((c) => c != null));
  return node;
};

const SLIDERS_ICON = `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
  <path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>`;

function switchRow(id, label, help, checked, onChange) {
  const input = h('input', { type: 'checkbox', id, class: 'a11y-switch__input', checked });
  input.addEventListener('change', () => onChange(input.checked));
  return h('div', { class: 'a11y-row' },
    h('label', { class: 'a11y-switch', for: id },
      input,
      h('span', { class: 'a11y-switch__text' },
        h('strong', {}, label),
        h('span', { class: 'a11y-help' }, help))
    )
  );
}

function build(settings, update, reset) {
  const toggle = h('button', {
    type: 'button', id: 'a11y-toggle', class: 'a11y-toggle',
    'aria-expanded': 'false', 'aria-controls': 'a11y-panel', 'aria-label': 'Ajustes de comodidad',
  });
  toggle.innerHTML = SLIDERS_ICON;

  const panel = h('div', { id: 'a11y-panel', class: 'a11y-panel', role: 'group', 'aria-labelledby': 'a11y-title', hidden: true });
  const sizeGroup = h('fieldset', { class: 'a11y-fieldset' },
    h('legend', {}, 'Tamaño de letra'),
    h('div', { class: 'a11y-sizes' },
      Object.entries(SIZES).map(([value, label]) => {
        const id = `a11y-size-${value}`;
        const radio = h('input', { type: 'radio', name: 'a11y-size', id, value, checked: settings.fontSize === value });
        radio.addEventListener('change', () => update({ fontSize: value }));
        return h('label', { class: `a11y-size a11y-size--${value}`, for: id }, radio, h('span', {}, label));
      }))
  );

  const close = h('button', { type: 'button', class: 'btn btn--ghost btn--small' }, 'Cerrar');
  const resetButton = h('button', { type: 'button', class: 'link-btn' }, 'Restablecer');
  resetButton.addEventListener('click', () => { reset(); render(); });

  function render() {
    const current = readSettings();
    panel.replaceChildren(
      h('h2', { id: 'a11y-title' }, 'Comodidad'),
      switchRow('a11y-low', 'Pocos estímulos',
        'Sin movimiento, sin transparencias y con colores más suaves.', current.lowStimulus,
        (v) => update({ lowStimulus: v })),
      sizeGroup,
      switchRow('a11y-contrast', 'Más contraste',
        'Textos más oscuros y bordes más marcados.', current.contrast,
        (v) => update({ contrast: v })),
      h('div', { class: 'a11y-actions' }, close, resetButton)
    );
    for (const radio of sizeGroup.querySelectorAll('input')) radio.checked = radio.value === current.fontSize;
  }
  render();

  function setOpen(open, returnFocus = false) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) panel.querySelector('input')?.focus();
    else if (returnFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  close.addEventListener('click', () => setOpen(false, true));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false, true);
  });

  return h('div', { class: 'a11y' }, panel, toggle);
}

export function initAccessibility() {
  let settings = readSettings();
  apply(settings);

  const update = (patch) => { settings = { ...settings, ...patch }; writeSettings(settings); apply(settings); };
  const reset = () => { settings = { ...DEFAULTS }; writeSettings(settings); apply(settings); };

  // Enlace para saltar directamente al contenido (teclado y lectores de pantalla)
  const skip = h('a', { class: 'skip-link', href: '#/' }, 'Saltar al contenido');
  skip.addEventListener('click', (event) => {
    event.preventDefault();
    const main = document.getElementById('app');
    if (main) { main.focus(); main.scrollIntoView(); }
  });

  document.body.prepend(skip);
  document.body.append(build(settings, update, reset));
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAccessibility);
  else initAccessibility();
}