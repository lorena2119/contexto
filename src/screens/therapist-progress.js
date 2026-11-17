import { el, fromHTML } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { CATEGORIES } from '../data/categories.js';
import { loadState, clearAllData } from '../state.js';
import { categoryStats, sessionAccuracy, toCsv } from '../services/history.js';

const OUTCOME_LABELS = {
  completed: 'Completó los 3 niveles',
  stopped: 'Se detuvo (nivel a reforzar)',
  exited: 'Salió antes de terminar',
};

const pct = (value) => (value == null ? '—' : `${Math.round(value * 100)} %`);
const decimal = (value) => (value == null ? '—' : value.toLocaleString('es-CO', { maximumFractionDigits: 1 }));
const seconds = (value) => (value == null ? '—' : `${Math.round(value)} s`);

function formatDate(iso) {
  const date = new Date(iso);
  const day = date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  const time = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  return `${day}, ${time}`;
}

// Gráfica de barras con los aciertos de las últimas 10 sesiones
function accuracyChart(sessions) {
  const last = sessions.slice(-10);
  const barWidth = 18;
  const gap = 6;
  const width = last.length * barWidth + (last.length - 1) * gap;
  const values = last.map((s) => Math.round(sessionAccuracy(s) * 100));

  const bars = values.map((value, i) => {
    const x = i * (barWidth + gap);
    const barHeight = Math.max(3, Math.round((value / 100) * 44));
    const y = 56 - barHeight;
    return `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="currentColor" opacity="0.85"/>
      <text x="${x + barWidth / 2}" y="${y - 4}" font-size="9" text-anchor="middle" fill="currentColor">${value}</text>`;
  }).join('');

  return fromHTML(`
    <svg class="chart" width="${width}" height="64" viewBox="0 0 ${width} 64" role="img"
      aria-label="Porcentaje de aciertos por sesión: ${values.join(', ')}">
      ${bars}
    </svg>
  `);
}

function statBlock(label, value) {
  return el('div', {}, el('dt', {}, label), el('dd', {}, value));
}

function categoryCard(category, sessions, progress) {
  const stats = categoryStats(sessions);
  const head = el('div', { class: 'progress-card__head' },
    el('span', { class: 'card__icon' }, icon(category.icon, 28)),
    el('div', {},
      el('h2', {}, category.label),
      el('p', { class: 'progress-card__sub' },
        progress && progress.level ? `Nivel actual: ${progress.level}` : 'Sin práctica todavía')
    )
  );

  if (!sessions.length) {
    return el('article', { class: 'card progress-card' }, head,
      el('p', {}, 'Aún no hay sesiones en esta categoría.'));
  }

  return el('article', { class: 'card progress-card' },
    head,
    el('dl', { class: 'stats' },
      statBlock('Sesiones', String(stats.sessions)),
      statBlock('Aciertos a la primera', pct(stats.accuracy)),
      statBlock('Ayudas por ejercicio', decimal(stats.hintsPerExercise)),
      statBlock('Tiempo por ejercicio', seconds(stats.avgSeconds))
    ),
    accuracyChart(sessions),
    el('p', { class: 'chart-caption' }, 'Aciertos por sesión, en % (últimas 10)')
  );
}

function downloadCsv(history) {
  const blob = new Blob([toCsv(history)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = el('a', { href: url, download: 'contexto-progreso.csv' });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function therapistProgressScreen() {
  const root = el('section', { class: 'screen' });

  function render() {
    const state = loadState();
    const history = state.history || [];
    const progress = state.progress || {};

    const children = [
      el('h1', {}, 'Progreso'),
      el('p', { class: 'lead' }, 'Los datos se guardan solo en este navegador y solo con el apodo.'),
    ];

    if (!history.length) {
      children.push(
        el('div', { class: 'card' },
          el('h2', {}, 'Todavía no hay sesiones'),
          el('p', {}, 'Cuando el niño practique, aquí verás su avance por categoría.')
        )
      );
    } else {
      children.push(
        el('div', { class: 'progress-grid' },
          CATEGORIES.map((category) =>
            categoryCard(category, history.filter((s) => s.category === category.id), progress[category.id])
          )
        ),
        el('h2', {}, 'Últimas sesiones'),
        el('ul', { class: 'session-list' },
          [...history].reverse().slice(0, 10).map((s) => {
            const category = CATEGORIES.find((c) => c.id === s.category);
            return el('li', {},
              el('strong', {}, `${category ? category.label : s.category} · ${pct(sessionAccuracy(s))}`),
              el('div', { class: 'session-list__meta' },
                `${formatDate(s.date)} · empezó en nivel ${s.startLevel} · ${OUTCOME_LABELS[s.outcome] || s.outcome}`)
            );
          })
        )
      );
    }

    children.push(
      el('div', { class: 'actions' },
        history.length
          ? el('button', {
              class: 'btn btn--small', type: 'button',
              onclick: () => downloadCsv(history),
            }, icon('download', 20), 'Descargar CSV')
          : null,
        el('button', {
          class: 'btn btn--ghost btn--small', type: 'button',
          onclick: () => {
            if (window.confirm('¿Borrar todos los datos guardados (historial, niveles y apodo)? Esto no se puede deshacer.')) {
              clearAllData();
              render();
            }
          },
        }, icon('trash', 20), 'Borrar datos'),
        el('a', { class: 'btn btn--ghost btn--small', href: '#/terapeuta' }, 'Volver al panel')
      )
    );

    root.replaceChildren(...children);
  }

  render();
  return root;
}