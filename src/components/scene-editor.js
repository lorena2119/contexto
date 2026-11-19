import { el, fromHTML } from '../utils/dom.js';
import { VOCAB, LABELS, sanitizeScene, defaultScene } from '../illustrations/vocab.js';
import { layoutScene } from '../illustrations/layout.js';
import { renderPanels } from '../illustrations/scene.js';

const MAX_OBJECTS = 3;

function selectField(id, label, group, current, onChange) {
  const select = el('select', {
    id,
    class: 'input input--select',
    onchange: (event) => onChange(event.target.value),
  }, VOCAB[group].map((value) =>
    el('option', { value, selected: value === current }, LABELS[group][value])
  ));
  return el('div', { class: 'field' }, el('label', { class: 'label', for: id }, label), select);
}

// Editor de la ilustración: el adulto puede cambiar lugar, clima, personajes, globos y objetos
// y ve la imagen actualizada al instante.
export function createSceneEditor(initial, tipo) {
  const scene = structuredClone(sanitizeScene(initial) || defaultScene(tipo));
  let enabled = true;

  const preview = el('div', { class: 'scene-preview', 'aria-live': 'polite' });
  const body = el('div', { class: 'scene-controls' });
  const root = el('div', { class: 'scene-editor' });

  function refreshPreview() {
    if (!enabled) {
      preview.replaceChildren(el('p', { class: 'note' }, 'Esta lección no tendrá ilustración.'));
      return;
    }
    const [svg] = renderPanels(layoutScene(scene));
    preview.replaceChildren(el('div', { class: 'illustration' }, fromHTML(svg)));
  }

  function objectsBlock() {
    const chips = scene.objetos.map((name, i) =>
      el('span', { class: 'chip chip--static' },
        LABELS.objetos[name],
        el('button', {
          class: 'chip__x',
          type: 'button',
          'aria-label': `Quitar ${LABELS.objetos[name]}`,
          onclick: () => { scene.objetos.splice(i, 1); renderControls(); refreshPreview(); },
        }, '×')
      )
    );
    const adder = el('select', {
      id: 'scene-add-object',
      class: 'input input--select',
      onchange: (event) => {
        const value = event.target.value;
        if (value && !scene.objetos.includes(value) && scene.objetos.length < MAX_OBJECTS) {
          scene.objetos.push(value);
          renderControls();
          refreshPreview();
        }
      },
    },
      el('option', { value: '' }, scene.objetos.length >= MAX_OBJECTS ? 'Máximo 3 objetos' : 'Agregar objeto…'),
      VOCAB.objetos.filter((o) => !scene.objetos.includes(o)).map((o) => el('option', { value: o }, LABELS.objetos[o]))
    );
    adder.disabled = scene.objetos.length >= MAX_OBJECTS;
    return el('div', { class: 'field' },
      el('span', { class: 'label' }, 'Objetos'),
      el('div', { class: 'chips' }, chips.length ? chips : el('span', { class: 'note' }, 'Sin objetos')),
      adder
    );
  }

  function renderControls() {
    body.replaceChildren(
      el('div', { class: 'filters' },
        selectField('scene-place', 'Lugar', 'lugares', scene.lugar, (v) => { scene.lugar = v; refreshPreview(); }),
        selectField('scene-weather', 'Clima', 'climas', scene.clima, (v) => { scene.clima = v; refreshPreview(); })
      ),
      ...scene.personajes.map((p, i) =>
        el('div', { class: 'filters' },
          selectField(`scene-role-${i}`, `Personaje ${i + 1}`, 'roles', p.rol, (v) => { p.rol = v; refreshPreview(); }),
          selectField(`scene-emotion-${i}`, `Emoción del personaje ${i + 1}`, 'emociones', p.emocion, (v) => { p.emocion = v; refreshPreview(); })
        )
      ),
      ...scene.globos.map((g, i) =>
        selectField(
          `scene-icon-${i}`,
          `Globo ${i + 1} (${LABELS.tiposGlobo[g.tipo]}, personaje ${g.de + 1})`,
          'iconos', g.icono,
          (v) => { g.icono = v; refreshPreview(); }
        )
      ),
      objectsBlock()
    );
  }

  const toggle = el('input', {
    id: 'scene-enabled', type: 'checkbox', checked: true,
    onchange: (event) => {
      enabled = event.target.checked;
      body.hidden = !enabled;
      refreshPreview();
    },
  });

  root.append(
    el('label', { class: 'check-row', for: 'scene-enabled' }, toggle, 'Incluir ilustración'),
    preview,
    body
  );
  renderControls();
  refreshPreview();

  return {
    element: root,
    // Descripción lista para dibujar, o null si el adulto no quiere ilustración
    getDescriptor() {
      return enabled ? layoutScene(scene) : null;
    },
  };
}
