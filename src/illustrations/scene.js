// Motor de ilustraciones: dibuja escenas sencillas en SVG a partir de una descripción (datos).
// Origen de los objetos: centro de la base; y negativo = hacia arriba.
export const W = 400;
export const H = 240;
export const GROUND = 190;

const INK = '#464B66';
const SKINS = ['#f6d0aa', '#dca97a', '#b9794f', '#8b5a3c'];
const HAIRS = ['#3a2a24', '#5b3b2a', '#1f1c33', '#e2ae45'];
const KID_SHIRTS = ['#6D5DFC', '#4890E0', '#f08fb0', '#f2b94b', '#52b58a'];
const ADULT_SHIRTS = ['#52b58a', '#f2b94b', '#6D5DFC'];

let counter = 0;
const uid = () => `s${++counter}`;
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const at = (svg, x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${svg}</g>`;

function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }
export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = clamp(r + (t - r) * p); g = clamp(g + (t - g) * p); b = clamp(b + (t - b) * p);
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

// ---------- Cara ----------
function face(emocion, rubor) {
  const st = `stroke="${INK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const line = (d) => `<path d="${d}" ${st}/>`;
  let eyes = `<circle cx="-9" cy="-100" r="3" fill="${INK}"/><circle cx="9" cy="-100" r="3" fill="${INK}"/>`;
  let brows = '', mouth = '', extra = '';
  switch (emocion) {
    case 'feliz':
      mouth = line('M-9 -91 Q0 -80 9 -91'); break;
    case 'triste':
      brows = line('M-14 -108 L-5 -111') + line('M14 -108 L5 -111');
      mouth = line('M-7 -85 Q0 -91 7 -85'); break;
    case 'serio':
      brows = line('M-14 -110 L-5 -110') + line('M5 -110 L14 -110');
      mouth = line('M-7 -87 L7 -87'); break;
    case 'enojado':
      brows = line('M-14 -113 L-5 -107') + line('M14 -113 L5 -107');
      mouth = line('M-7 -85 Q0 -90 7 -85'); break;
    case 'sorprendido':
      brows = line('M-14 -112 Q-9 -116 -4 -112') + line('M4 -112 Q9 -116 14 -112');
      mouth = `<ellipse cx="0" cy="-87" rx="3.6" ry="4.6" fill="${INK}"/>`; break;
    case 'nervioso':
      brows = line('M-14 -108 L-5 -111') + line('M14 -108 L5 -111');
      mouth = line('M-9 -86 q2.5 -3 4.5 0 t4.5 0 t4.5 0');
      extra = `<path d="M30 -118 q5 7 0 12 q-5 -5 0 -12z" fill="#9ed0ff"/>`; break;
    case 'avergonzado':
      eyes = `<path d="M-13 -99 Q-9 -96 -5 -99" ${st}/><path d="M5 -99 Q9 -96 13 -99" ${st}/>`;
      brows = line('M-14 -108 L-5 -111') + line('M14 -108 L5 -111');
      mouth = line('M-6 -86 q2 -2.5 4 0 t4 0 t4 0'); break;
    case 'cansado':
      eyes = `<path d="M-13 -100 Q-9 -96 -5 -100" ${st}/><path d="M5 -100 Q9 -96 13 -100" ${st}/>`;
      brows = line('M-14 -108 L-5 -108') + line('M5 -108 L14 -108');
      mouth = line('M-6 -87 L6 -87'); break;
    case 'burlon':
      brows = line('M-14 -108 L-5 -110') + line('M5 -113 Q10 -117 14 -112');
      mouth = line('M-7 -88 Q3 -84 9 -92'); break;
    default:
      mouth = line('M-5 -88 Q0 -86 5 -88');
  }
  const cheeks = rubor
    ? `<circle cx="-15" cy="-93" r="7" fill="#ff7f86" opacity="0.65"/><circle cx="15" cy="-93" r="7" fill="#ff7f86" opacity="0.65"/>`
    : '';
  return cheeks + eyes + brows + mouth + extra;
}

function head({ skin, hair, rol, emocion, rubor, sudor }) {
  const out = [];
  out.push(`<circle cx="-25" cy="-99" r="5" fill="${skin}"/><circle cx="25" cy="-99" r="5" fill="${skin}"/>`);
  out.push(`<circle cx="0" cy="-100" r="25" fill="${skin}" stroke="${shade(skin, -0.22)}" stroke-width="1.6"/>`);
  out.push(`<path d="M-26 -102 C-28 -130 28 -130 26 -102 C19 -113 8 -116 0 -114 C-8 -116 -19 -113 -26 -102 Z" fill="${hair}"/>`);
  if (rol === 'adulta') out.push(`<circle cx="0" cy="-131" r="9" fill="${hair}"/>`);
  out.push(face(emocion, rubor));
  if (sudor) out.push(`<path d="M-31 -112 q4 7 0 12 q-4 -5 0 -12z" fill="#9ed0ff"/><path d="M33 -106 q4 7 0 12 q-4 -5 0 -12z" fill="#9ed0ff"/>`);
  return out.join('');
}

// ---------- Personas ----------
function person(p) {
  const {
    x = 200, y = GROUND, rol = 'nino', emocion = 'neutral', mojado = false, rubor = false, sudor = false,
    piel = 0, pelo = 0, camiseta = 0, mochila = false, medalla = false, curita = false, escala,
  } = p;
  const adult = rol === 'adulto' || rol === 'adulta';
  const long = rol === 'nina' || rol === 'adulta';
  const s = escala ?? (adult ? 1.15 : 1);
  const skin = SKINS[piel % SKINS.length];
  let hair = HAIRS[pelo % HAIRS.length];
  let shirt = adult ? ADULT_SHIRTS[camiseta % ADULT_SHIRTS.length] : KID_SHIRTS[camiseta % KID_SHIRTS.length];
  let pants = adult ? '#46506e' : '#3b4a8c';
  if (mojado) { hair = shade(hair, -0.25); shirt = shade(shirt, -0.3); pants = shade(pants, -0.25); }

  const out = [];
  out.push(`<ellipse cx="0" cy="2" rx="30" ry="6" fill="#000" opacity="0.10"/>`);
  if (mochila) out.push(`<rect x="-31" y="-74" width="62" height="46" rx="13" fill="${shade('#f2b94b', mojado ? -0.2 : 0)}"/>`);
  if (long) out.push(`<ellipse cx="0" cy="-92" rx="31" ry="36" fill="${hair}"/>`);
  out.push(`<rect x="-16" y="-32" width="13" height="30" rx="6" fill="${pants}"/><rect x="3" y="-32" width="13" height="30" rx="6" fill="${pants}"/>`);
  if (curita) out.push(`<g transform="rotate(-18 -9 -16)"><rect x="-16" y="-20" width="14" height="7" rx="3" fill="#f5c9a0" stroke="#d9a273" stroke-width="1"/></g>`);
  out.push(`<ellipse cx="-10" cy="-2" rx="12" ry="5.5" fill="#2e3250"/><ellipse cx="10" cy="-2" rx="12" ry="5.5" fill="#2e3250"/>`);
  out.push(`<rect x="-34" y="-74" width="13" height="40" rx="6.5" fill="${shirt}"/><rect x="21" y="-74" width="13" height="40" rx="6.5" fill="${shirt}"/>`);
  out.push(`<circle cx="-27.5" cy="-32" r="6.5" fill="${skin}"/><circle cx="27.5" cy="-32" r="6.5" fill="${skin}"/>`);
  out.push(`<rect x="-24" y="-78" width="48" height="52" rx="15" fill="${shirt}"/>`);
  if (mochila) out.push(`<rect x="-20" y="-76" width="7" height="36" rx="3" fill="${shade('#f2b94b', -0.25)}"/><rect x="13" y="-76" width="7" height="36" rx="3" fill="${shade('#f2b94b', -0.25)}"/>`);
  if (medalla) out.push(`<polygon points="-9,-76 0,-58 9,-76" fill="#6D5DFC"/><circle cx="0" cy="-52" r="10" fill="#ffd36b" stroke="#f2b94b" stroke-width="2.5"/><path d="M0 -58 l2.2 4.6 5 .7 -3.6 3.5 .9 5 -4.5 -2.4 -4.5 2.4 .9 -5 -3.6 -3.5 5 -.7z" fill="#fff" opacity="0.85"/>`);
  out.push(`<rect x="-6" y="-84" width="12" height="12" rx="4" fill="${skin}"/>`);
  out.push(head({ skin, hair, rol, emocion, rubor, sudor }));
  if (mojado) {
    out.push(`<path d="M-30 -84 q4 7 0 11 q-4 -4 0 -11z" fill="#8cc2ff"/><path d="M33 -76 q4 7 0 11 q-4 -4 0 -11z" fill="#8cc2ff"/><path d="M-12 -52 q3 5 0 8 q-3 -3 0 -8z" fill="#8cc2ff" opacity="0.8"/><path d="M14 -40 q3 5 0 8 q-3 -3 0 -8z" fill="#8cc2ff" opacity="0.8"/>`);
  }
  return `<g transform="translate(${x} ${y}) scale(${s})">${out.join('')}</g>`;
}

// ---------- Íconos (centrados en 0,0, para globos de diálogo) ----------
function cloud(x, y, s, color) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${color}"><circle cx="-18" cy="4" r="14"/><circle cx="2" cy="-5" r="19"/><circle cx="22" cy="4" r="14"/><rect x="-32" y="4" width="68" height="14" rx="7"/></g>`;
}

const TXT = 'font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" text-anchor="middle"';
const ICONS = {
  sol: () => `<g stroke="#f2b94b" stroke-width="4" stroke-linecap="round">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<line x1="${(15 * Math.cos(a * Math.PI / 180)).toFixed(1)}" y1="${(15 * Math.sin(a * Math.PI / 180)).toFixed(1)}" x2="${(21 * Math.cos(a * Math.PI / 180)).toFixed(1)}" y2="${(21 * Math.sin(a * Math.PI / 180)).toFixed(1)}"/>`).join('')}</g><circle r="11" fill="#ffd36b"/><circle cx="-4" cy="-2" r="1.6" fill="${INK}"/><circle cx="4" cy="-2" r="1.6" fill="${INK}"/><path d="M-4 3 Q0 7 4 3" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  pregunta: () => `<text x="0" y="12" ${TXT} font-size="38" fill="#6D5DFC">?</text>`,
  pastel: () => `<rect x="-20" y="-2" width="40" height="18" rx="4" fill="#f7c6d9"/><rect x="-15" y="-14" width="30" height="13" rx="4" fill="#fff3d6"/><rect x="-2" y="-24" width="4" height="10" rx="2" fill="#6D5DFC"/><ellipse cx="0" cy="-28" rx="3" ry="4.5" fill="#ffb84d"/>`,
  globos: () => `<line x1="-8" y1="-8" x2="0" y2="18" stroke="#9aa0b8" stroke-width="1.6"/><line x1="10" y1="-12" x2="0" y2="18" stroke="#9aa0b8" stroke-width="1.6"/><ellipse cx="-9" cy="-14" rx="10" ry="13" fill="#6D5DFC"/><ellipse cx="11" cy="-18" rx="10" ry="13" fill="#f08fb0"/>`,
  helado: (c = {}) => `<polygon points="-11,-4 11,-4 0,24" fill="#e0a864"/><circle cx="0" cy="-12" r="14" fill="${c.color || '#f08fb0'}"/><circle cx="-5" cy="-17" r="3.5" fill="#fff" opacity="0.5"/>`,
  zzz: () => `<text x="0" y="9" ${TXT} font-size="26" fill="#6D5DFC">Zzz</text>`,
  parque: () => `<rect x="-3" y="2" width="6" height="18" rx="2" fill="#b9803f"/><circle cx="0" cy="-8" r="16" fill="#7bc98f"/><circle cx="-9" cy="-3" r="9" fill="#6bbd82"/><circle cx="9" cy="-3" r="9" fill="#6bbd82"/>`,
  pulgar: () => `<g transform="translate(-14 -14) scale(1.17)"><path d="M7 10v12" stroke="#e0a526" stroke-width="2" fill="none"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" fill="#ffd36b" stroke="#e0a526" stroke-width="2" stroke-linejoin="round"/></g>`,
  reloj: () => `<circle r="18" fill="#fff" stroke="${INK}" stroke-width="3.5"/><path d="M0 0 L0 -11 M0 0 L8 0" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle r="2" fill="${INK}"/>`,
  rayo: () => `<polygon points="3,-22 -12,3 -1,3 -5,22 13,-5 2,-5 9,-22" fill="#ffd36b" stroke="#e0a526" stroke-width="2.4" stroke-linejoin="round"/>`,
  camara: () => `<rect x="-20" y="-12" width="40" height="28" rx="7" fill="#9aa0b8"/><rect x="-8" y="-18" width="16" height="8" rx="3" fill="#9aa0b8"/><circle cx="0" cy="2" r="9" fill="#fff"/><circle cx="0" cy="2" r="5" fill="${INK}"/>`,
  corazon: (c = {}) => `<g transform="translate(-17 -17) scale(1.42)"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="${c.color || '#f08fb0'}" stroke="${shade(c.color || '#f08fb0', -0.2)}" stroke-width="1.6" stroke-linejoin="round"/></g>`,
  billetes: () => `<rect x="-22" y="-12" width="34" height="20" rx="4" fill="#7bc98f" stroke="#52a96c" stroke-width="2"/><circle cx="-5" cy="-2" r="5" fill="#bfe8c8"/><rect x="-12" y="-4" width="34" height="20" rx="4" fill="#8fd6a0" stroke="#52a96c" stroke-width="2"/><circle cx="5" cy="6" r="5" fill="#d3f0da"/><circle cx="-18" cy="16" r="7" fill="#ffd36b" stroke="#e0a526" stroke-width="2"/>`,
  puntos: () => `<circle cx="-12" cy="0" r="4.5" fill="#9aa0b8"/><circle cx="0" cy="0" r="4.5" fill="#9aa0b8"/><circle cx="12" cy="0" r="4.5" fill="#9aa0b8"/>`,
  bla: () => `<text x="0" y="7" ${TXT} font-size="20" fill="#9aa0b8">bla bla</text>`,
  ja: () => `<text x="0" y="8" ${TXT} font-size="22" fill="#f08fb0">ja ja</text>`,
  pelota: () => `<g transform="translate(0 14)"><circle cx="0" cy="-14" r="14" fill="#f2b94b"/><path d="M-14 -14 Q0 -27 14 -14" stroke="#fff" stroke-width="2.4" fill="none"/><path d="M-10 -4 Q0 -14 10 -4" stroke="#fff" stroke-width="2.4" fill="none"/></g>`,
  libros: () => `<rect x="-26" y="-18" width="24" height="34" rx="3" fill="#52b58a"/><rect x="-26" y="-18" width="5" height="34" fill="#3a8e6b"/><rect x="2" y="-18" width="24" height="34" rx="3" fill="#52b58a"/><rect x="2" y="-18" width="5" height="34" fill="#3a8e6b"/><circle cx="-12" cy="0" r="6" fill="#fff" opacity="0.8"/><circle cx="16" cy="0" r="6" fill="#fff" opacity="0.8"/>`,
};

// ---------- Objetos ----------
function wobblyDog() {
  return `<g stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">`
    + `<ellipse cx="-4" cy="-26" rx="22" ry="12" fill="#f6dcb4" transform="rotate(-14 -4 -26)"/>`
    + `<circle cx="22" cy="-40" r="11" fill="#f6dcb4"/>`
    + `<path d="M16 -48 L12 -62 L24 -52 Z" fill="#d9a066"/><path d="M28 -50 L36 -60 L33 -44 Z" fill="#d9a066"/>`
    + `<path d="M-14 -16 L-18 -2 M-4 -14 L2 2 M8 -18 L10 -4 M-24 -30 Q-36 -42 -28 -50" fill="none"/>`
    + `<circle cx="20" cy="-42" r="1.6" fill="${INK}"/><circle cx="27" cy="-41" r="1.6" fill="${INK}"/></g>`;
}

const OBJ = {
  pelota: () => `<circle cx="0" cy="-14" r="14" fill="#f2b94b"/><path d="M-14 -14 Q0 -27 14 -14" stroke="#fff" stroke-width="2.4" fill="none"/><path d="M-10 -4 Q0 -14 10 -4" stroke="#fff" stroke-width="2.4" fill="none"/>`,
  caja: (o) => {
    const c = o.color || '#e4574d';
    const inside = o.contiene && OBJ[o.contiene] ? at(OBJ[o.contiene]({}), 0, -39, 0.9) : '';
    return `${inside}<rect x="-34" y="-44" width="68" height="44" rx="7" fill="${c}"/><rect x="-34" y="-44" width="68" height="9" rx="4" fill="${shade(c, -0.18)}"/>`;
  },
  mesa: () => `<rect x="-58" y="-58" width="116" height="10" rx="5" fill="#d9b48a"/><rect x="-50" y="-48" width="9" height="48" rx="3" fill="#c79d6e"/><rect x="41" y="-48" width="9" height="48" rx="3" fill="#c79d6e"/>`,
  galletas: () => `<ellipse cx="0" cy="-3" rx="26" ry="6" fill="#fff" stroke="#cbbff0" stroke-width="2"/><g fill="#d9a066"><circle cx="-12" cy="-9" r="8"/><circle cx="6" cy="-10" r="8"/><circle cx="-2" cy="-18" r="8"/></g><g fill="#8a5a33"><circle cx="-14" cy="-10" r="1.6"/><circle cx="-9" cy="-7" r="1.4"/><circle cx="5" cy="-12" r="1.6"/><circle cx="9" cy="-8" r="1.4"/><circle cx="-3" cy="-20" r="1.6"/><circle cx="1" cy="-16" r="1.4"/></g>`,
  armario: (o) => {
    const wood = '#c9a77e';
    if (o.abierto) {
      const inside = o.contiene && OBJ[o.contiene] ? at(OBJ[o.contiene]({}), 0, -62, 0.8) : '';
      return `<rect x="-38" y="-122" width="76" height="122" rx="6" fill="${shade(wood, -0.35)}"/><rect x="-32" y="-64" width="64" height="4" fill="${wood}"/>${inside}<rect x="-38" y="-122" width="76" height="122" rx="6" fill="none" stroke="${wood}" stroke-width="6"/><polygon points="-38,-118 -56,-108 -56,-6 -38,-4" fill="${wood}"/><polygon points="38,-118 56,-108 56,-6 38,-4" fill="${shade(wood, -0.08)}"/>`;
    }
    return `<rect x="-38" y="-122" width="76" height="122" rx="6" fill="${wood}"/><line x1="0" y1="-118" x2="0" y2="-4" stroke="${shade(wood, -0.3)}" stroke-width="3"/><rect x="-30" y="-110" width="26" height="98" rx="4" fill="none" stroke="${shade(wood, -0.15)}" stroke-width="2.5"/><rect x="4" y="-110" width="26" height="98" rx="4" fill="none" stroke="${shade(wood, -0.15)}" stroke-width="2.5"/><circle cx="-8" cy="-60" r="3.5" fill="#8a6b4a"/><circle cx="8" cy="-60" r="3.5" fill="#8a6b4a"/>`;
  },
  silla: () => `<rect x="-24" y="-82" width="8" height="52" rx="3" fill="#d9b48a"/><rect x="-24" y="-42" width="50" height="9" rx="4" fill="#d9b48a"/><rect x="-22" y="-34" width="7" height="34" rx="3" fill="#c79d6e"/><rect x="17" y="-34" width="7" height="34" rx="3" fill="#c79d6e"/>`,
  mochila: () => `<rect x="-20" y="-40" width="40" height="40" rx="12" fill="#f2b94b"/><rect x="-14" y="-20" width="28" height="14" rx="5" fill="#d99a2b"/><path d="M-10 -40 q10 -14 20 0" stroke="#d99a2b" stroke-width="4" fill="none"/>`,
  casillero: (o) => {
    const c = '#7fa6d6';
    if (o.abierto) {
      const inside = o.contiene && OBJ[o.contiene] ? at(OBJ[o.contiene]({}), 0, -8, 0.9) : '';
      return `<rect x="-28" y="-132" width="56" height="132" rx="4" fill="${shade(c, -0.45)}"/>${inside}<rect x="-28" y="-132" width="56" height="132" rx="4" fill="none" stroke="${c}" stroke-width="5"/><polygon points="-28,-128 -50,-116 -50,-4 -28,-2" fill="${c}"/>`;
    }
    return `<rect x="-28" y="-132" width="56" height="132" rx="4" fill="${c}"/><g stroke="${shade(c, -0.3)}" stroke-width="3" stroke-linecap="round"><line x1="-14" y1="-116" x2="14" y2="-116"/><line x1="-14" y1="-108" x2="14" y2="-108"/><line x1="-14" y1="-100" x2="14" y2="-100"/></g><circle cx="14" cy="-60" r="4" fill="${shade(c, -0.4)}"/>`;
  },
  carro: () => `<rect x="-28" y="-20" width="56" height="15" rx="6" fill="#e4574d"/><path d="M-15 -20 L-9 -33 H9 L17 -20 Z" fill="#e4574d"/><path d="M-10 -21 L-6 -30 H-1 V-21 Z M3 -21 V-30 H8 L12 -21 Z" fill="#cfe8ff"/><circle cx="-15" cy="-5" r="7.5" fill="#2e3250"/><circle cx="15" cy="-5" r="7.5" fill="#2e3250"/><circle cx="-15" cy="-5" r="3" fill="#9aa0b8"/><circle cx="15" cy="-5" r="3" fill="#9aa0b8"/>`,
  cama: (o) => {
    const inside = o.contiene && OBJ[o.contiene] ? at(OBJ[o.contiene]({}), 14, -42, 0.9) : '';
    return `<rect x="-72" y="-62" width="12" height="62" rx="4" fill="#c79d6e"/><rect x="-72" y="-34" width="144" height="34" rx="6" fill="#d9b48a"/><rect x="-66" y="-48" width="132" height="20" rx="8" fill="#fff"/><ellipse cx="-44" cy="-54" rx="20" ry="9" fill="#e4e8f7"/><rect x="-24" y="-48" width="90" height="20" rx="8" fill="#8fb6f0"/>${inside}`;
  },
  regalo: () => `<rect x="-18" y="-30" width="36" height="30" rx="4" fill="#f08fb0"/><rect x="-3" y="-30" width="6" height="30" fill="#fff"/><rect x="-18" y="-18" width="36" height="6" fill="#fff"/><path d="M0 -30 q-14 -14 -16 -4 q8 6 16 4 q8 2 16 -4 q-2 -10 -16 4z" fill="#fff" stroke="#f08fb0" stroke-width="2"/>`,
  comoda: (o) => {
    const wood = '#c9a77e';
    const inside = o.contiene && OBJ[o.contiene] ? at(OBJ[o.contiene]({}), 0, -44, 0.9) : '';
    if (o.abierto) {
      return `<rect x="-46" y="-72" width="92" height="72" rx="5" fill="${wood}"/><rect x="-40" y="-66" width="80" height="26" rx="3" fill="${shade(wood, -0.4)}"/>${inside}<rect x="-44" y="-52" width="88" height="14" rx="3" fill="${shade(wood, 0.1)}"/><line x1="-40" y1="-30" x2="40" y2="-30" stroke="${shade(wood, -0.25)}" stroke-width="3"/><circle cx="0" cy="-20" r="3.5" fill="#8a6b4a"/><circle cx="0" cy="-45" r="3.5" fill="#8a6b4a"/>`;
    }
    return `<rect x="-46" y="-72" width="92" height="72" rx="5" fill="${wood}"/><line x1="-42" y1="-36" x2="42" y2="-36" stroke="${shade(wood, -0.25)}" stroke-width="3"/><circle cx="0" cy="-54" r="3.5" fill="#8a6b4a"/><circle cx="0" cy="-18" r="3.5" fill="#8a6b4a"/>`;
  },
  bolsa: (o) => {
    const inside = o.contiene && OBJ[o.contiene] ? at(OBJ[o.contiene]({}), 0, -30, 0.7) : '';
    return `${inside}<rect x="-24" y="-34" width="48" height="34" rx="9" fill="#6D5DFC"/><path d="M-14 -34 q14 -28 28 0" stroke="#4a3bd0" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  },
  llaves: () => `<circle cx="-8" cy="-12" r="8" fill="none" stroke="#e0a526" stroke-width="3.5"/><path d="M-1 -12 H22 M16 -12 V-4 M22 -12 V-6" stroke="#e0a526" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
  libro: () => `<rect x="-16" y="-44" width="32" height="44" rx="3" fill="#52b58a"/><rect x="-16" y="-44" width="6" height="44" fill="#3a8e6b"/><path d="M-2 -30 q6 -8 14 -2 q-2 8 -8 8 l-4 8 l-1 -8 q-5 -2 -1 -6z" fill="#fff" opacity="0.85"/>`,
  helado: (o) => `<polygon points="-12,-38 12,-38 0,0" fill="#e0a864"/><circle cx="0" cy="-48" r="16" fill="${o.color || '#f2e16b'}"/><circle cx="-5" cy="-53" r="4" fill="#fff" opacity="0.5"/>`,
  sopa: () => `<ellipse cx="4" cy="-3" rx="36" ry="6" fill="#f2a65a" opacity="0.9"/><g transform="rotate(-24 -26 -14)"><path d="M-44 -22 h34 q-2 22 -17 22 q-15 0 -17 -22z" fill="#fff" stroke="#cbbff0" stroke-width="2.5"/></g><circle cx="22" cy="-8" r="3" fill="#f2a65a"/><circle cx="34" cy="-4" r="2.2" fill="#f2a65a"/>`,
  bus: () => `<rect x="-92" y="-74" width="184" height="62" rx="16" fill="#f2b94b"/><rect x="-80" y="-64" width="30" height="24" rx="5" fill="#cfe8ff"/><rect x="-42" y="-64" width="30" height="24" rx="5" fill="#cfe8ff"/><rect x="-4" y="-64" width="30" height="24" rx="5" fill="#cfe8ff"/><rect x="40" y="-66" width="40" height="54" rx="6" fill="#cfe8ff"/><rect x="-92" y="-30" width="184" height="8" fill="#6D5DFC"/><circle cx="-52" cy="-12" r="14" fill="#2e3250"/><circle cx="52" cy="-12" r="14" fill="#2e3250"/><circle cx="-52" cy="-12" r="6" fill="#9aa0b8"/><circle cx="52" cy="-12" r="6" fill="#9aa0b8"/>`,
  parada: () => `<rect x="-3" y="-128" width="6" height="128" rx="3" fill="#9aa0b8"/><circle cx="0" cy="-138" r="20" fill="#fff" stroke="${INK}" stroke-width="4"/><path d="M0 -138 L0 -150 M0 -138 L10 -138" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/><circle cx="0" cy="-138" r="2.4" fill="${INK}"/><rect x="-20" y="-108" width="40" height="14" rx="4" fill="#4890E0"/>`,
  edificio: () => `<rect x="-78" y="-110" width="156" height="110" rx="6" fill="#f4c27a"/><polygon points="-90,-108 0,-156 90,-108" fill="#c97b63"/><rect x="-17" y="-54" width="34" height="54" rx="5" fill="#7a5bd6"/><rect x="-62" y="-92" width="30" height="30" rx="4" fill="#cfe8ff"/><rect x="32" y="-92" width="30" height="30" rx="4" fill="#cfe8ff"/><line x1="0" y1="-156" x2="0" y2="-176" stroke="#9aa0b8" stroke-width="3"/><polygon points="0,-176 20,-170 0,-164" fill="#6D5DFC"/>`,
  dibujo: () => `<rect x="-50" y="-78" width="100" height="78" rx="5" fill="#fff" stroke="#cbbff0" stroke-width="4"/>${at(wobblyDog(), -2, -4, 0.95)}`,
  examen: () => `<g transform="rotate(-6)"><rect x="-26" y="-64" width="52" height="64" rx="4" fill="#fff" stroke="#cbbff0" stroke-width="2.5"/><path d="M-14 -34 l9 10 l19 -24" stroke="#52b58a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M-16 -12 h32 M-16 -5 h22" stroke="#cbbff0" stroke-width="3" stroke-linecap="round"/></g>`,
  bicicleta: () => `<circle cx="-40" cy="-26" r="26" fill="none" stroke="${INK}" stroke-width="5"/><circle cx="40" cy="-26" r="26" fill="none" stroke="${INK}" stroke-width="5"/><path d="M-40 -26 L-8 -62 L22 -62 L40 -26 M-8 -62 L8 -26 L-40 -26 M8 -26 L22 -62 M22 -62 L30 -78 M18 -80 H40 M-12 -68 H4" stroke="#6D5DFC" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="-26" r="5" fill="#9aa0b8"/>`,
};

function drawObject(o) {
  const fn = OBJ[o.tipo];
  if (!fn) return '';
  return at(fn(o), o.x ?? 200, o.y ?? GROUND, o.escala ?? 1);
}

// ---------- Globos de diálogo ----------
function bubble(b) {
  const { x, y, w = 76, h = 60, tipo = 'habla', hacia = { x: x, y: y + 80 }, contenido = [] } = b;
  const inner = contenido.map((c) => at(ICONS[c.icono](c), x + (c.dx || 0), y + (c.dy || 0), c.escala || 1)).join('');
  if (tipo === 'piensa') {
    const dx = hacia.x - x, dy = hacia.y - (y + h / 2);
    const dots = [0.35, 0.6, 0.82].map((t, i) => `<circle cx="${(x + dx * t).toFixed(1)}" cy="${(y + h / 2 + dy * t).toFixed(1)}" r="${[7, 5, 3.4][i]}" fill="#fff" stroke="#cbbff0" stroke-width="2.4"/>`).join('');
    return `${dots}<ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="${h / 2}" fill="#fff" stroke="#cbbff0" stroke-width="3"/>${inner}`;
  }
  const bx = x - w / 2, by = y - h / 2;
  const tx = Math.max(bx + 14, Math.min(bx + w - 14, hacia.x));
  return `<rect x="${bx}" y="${by}" width="${w}" height="${h}" rx="18" fill="#fff" stroke="#cbbff0" stroke-width="3"/>`
    + `<polygon points="${tx - 9},${by + h - 1} ${tx + 9},${by + h - 1} ${hacia.x},${hacia.y}" fill="#fff" stroke="#cbbff0" stroke-width="3" stroke-linejoin="round"/>`
    + `<rect x="${tx - 8}" y="${by + h - 4}" width="16" height="6" fill="#fff"/>${inner}`;
}

function arrow(a) {
  const { x1, y1, x2, y2, alto = 40 } = a;
  const cx = (x1 + x2) / 2, cy = Math.min(y1, y2) - alto;
  const ang = Math.atan2(y2 - cy, x2 - cx);
  const hx = (d) => (x2 - Math.cos(ang + d) * 12).toFixed(1);
  const hy = (d) => (y2 - Math.sin(ang + d) * 12).toFixed(1);
  return `<path d="M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}" stroke="#6D5DFC" stroke-width="3.5" stroke-dasharray="7 6" stroke-linecap="round" fill="none"/>`
    + `<polygon points="${x2},${y2} ${hx(0.5)},${hy(0.5)} ${hx(-0.5)},${hy(-0.5)}" fill="#6D5DFC"/>`;
}

// ---------- Fondos ----------
function rainLines(x0, y0, w, h, step = 26) {
  let out = '';
  for (let i = 0, cx = x0 + 8; cx < x0 + w - 6; cx += step, i++) {
    for (let row = 0; row < 3; row++) {
      const yy = y0 + 8 + ((i * 17 + row * 31) % Math.max(20, h - 22));
      if (yy + 14 > y0 + h) continue;
      out += `<line x1="${cx}" y1="${yy}" x2="${cx - 4}" y2="${yy + 12}" stroke="#6f93d6" stroke-width="2.4" stroke-linecap="round" opacity="0.8"/>`;
    }
  }
  return out;
}

function skyColors(clima) {
  if (clima === 'lluvia') return ['#aab4cf', '#d3d9e8'];
  if (clima === 'nublado') return ['#cdd8ec', '#e7edf8'];
  return ['#bfe0ff', '#eaf5ff'];
}

function backgroundExterior(clima, id) {
  const [top, bottom] = skyColors(clima);
  const grass = clima === 'lluvia' ? '#9fcfa6' : '#b8e2b8';
  let sky = '';
  if (clima === 'sol') sky = `<circle cx="338" cy="50" r="42" fill="#ffe9a8" opacity="0.5"/><circle cx="338" cy="50" r="26" fill="#ffd36b"/>${cloud(120, 56, 0.9, '#ffffff')}`;
  else if (clima === 'lluvia') sky = `${cloud(110, 52, 1.2, '#8f9bbd')}${cloud(290, 44, 1.3, '#8993b3')}${rainLines(0, 80, W, 100, 24)}`;
  else sky = `${cloud(110, 54, 1.1, '#ffffff')}${cloud(290, 46, 1.2, '#ffffff')}`;
  return `<defs><linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>`
    + `<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>${sky}`
    + `<path d="M0 170 Q90 140 190 164 T400 154 L400 240 L0 240 Z" fill="${shade(grass, -0.08)}"/><rect x="0" y="176" width="${W}" height="64" fill="${grass}"/>`;
}

function windowSvg(clima, x, id, asomado) {
  const [top] = skyColors(clima);
  let inner = `<rect x="${x}" y="34" width="112" height="86" rx="6" fill="${top}"/>`;
  if (clima === 'sol') inner += `<circle cx="${x + 84}" cy="52" r="12" fill="#ffd36b"/>`;
  else inner += cloud(x + 36, 62, 0.8, clima === 'lluvia' ? '#8f9bbd' : '#ffffff');
  if (clima === 'lluvia') inner += rainLines(x, 34, 112, 86, 20);
  let peek = '';
  if (asomado) {
    const a = asomado;
    const skin = SKINS[(a.piel ?? 0) % SKINS.length];
    const hair = HAIRS[(a.pelo ?? 0) % HAIRS.length];
    const back = (a.rol === 'nina' || a.rol === 'adulta') ? `<ellipse cx="0" cy="-92" rx="31" ry="36" fill="${hair}"/>` : '';
    peek = `<clipPath id="${id}-win"><rect x="${x}" y="34" width="112" height="86" rx="6"/></clipPath>`
      + `<g clip-path="url(#${id}-win)">${at(back + head({ skin, hair, rol: a.rol || 'nino', emocion: a.emocion || 'sorprendido' }), x + 56, 238, 1.5)}</g>`;
  }
  const bar = asomado ? 0.55 : 1;
  return `${inner}${peek}<rect x="${x + 52}" y="34" width="8" height="86" fill="#fff" opacity="${bar}"/><rect x="${x}" y="73" width="112" height="8" fill="#fff" opacity="${bar}"/>`
    + `<rect x="${x - 4}" y="30" width="120" height="94" rx="10" fill="none" stroke="#fff" stroke-width="8"/><rect x="${x - 14}" y="124" width="140" height="10" rx="5" fill="#fff"/>`;
}

function party() {
  const flags = ['#6D5DFC', '#f08fb0', '#ffd36b', '#4890E0', '#52b58a'];
  let tri = '';
  for (let i = 0, px = 14; px < 390; px += 24, i++) tri += `<polygon points="${px},14 ${px + 18},14 ${px + 9},34" fill="${flags[i % flags.length]}"/>`;
  return `<path d="M10 14 H390" stroke="#9aa0b8" stroke-width="2"/>${tri}`
    + at(ICONS.globos(), 40, 92, 1.5) + at(ICONS.globos(), 362, 92, 1.5);
}

function backgroundInterior(clima, id, scene) {
  const v = scene.ventana;
  const win = v === false ? '' : windowSvg(clima, v?.x ?? 255, id, v?.asomado);
  const deco = scene.decoracion === 'fiesta' ? party() : '';
  return `<rect width="${W}" height="${H}" fill="#efe9ff"/><rect y="172" width="${W}" height="${H - 172}" fill="#d8cbf2"/><rect y="168" width="${W}" height="8" fill="#c4b4ec"/>${win}${deco}`;
}

function backgroundSalon(clima, id, scene) {
  const p = scene.pizarron || { x: 70, w: 260 };
  const v = scene.ventana;
  const win = v ? windowSvg(clima, v.x ?? 255, id, v.asomado) : '';
  return `<rect width="${W}" height="${H}" fill="#efe9ff"/><rect y="172" width="${W}" height="${H - 172}" fill="#d8cbf2"/><rect y="168" width="${W}" height="8" fill="#c4b4ec"/>${win}`
    + `<rect x="${p.x}" y="24" width="${p.w}" height="104" rx="8" fill="#4f8f7a" stroke="#d3ae78" stroke-width="8"/>`
    + `<path d="M${p.x + 28} 56 H${p.x + 130} M${p.x + 28} 78 H${p.x + 96} M${p.x + 28} 100 H${p.x + 150}" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.65" fill="none"/>`;
}

// ---------- Escena completa ----------
export function renderScene(scene) {
  const id = uid();
  const { lugar = 'interior', clima = 'sol', personajes = [], objetos = [], globos = [], flechas = [], alt = '' } = scene;
  const bg = lugar === 'exterior' ? backgroundExterior(clima, id)
    : lugar === 'salon' ? backgroundSalon(clima, id, scene)
      : backgroundInterior(clima, id, scene);
  const items = [
    ...objetos.map((o) => ({ y: (o.y ?? GROUND) + (o.orden || 0), svg: drawObject(o) })),
    ...personajes.map((p) => ({ y: p.y ?? GROUND, svg: person(p) })),
  ].sort((a, b) => a.y - b.y);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(alt)}">`
    + `<defs><clipPath id="${id}-clip"><rect width="${W}" height="${H}" rx="22"/></clipPath></defs>`
    + `<g clip-path="url(#${id}-clip)">${bg}${items.map((i) => i.svg).join('')}${flechas.map(arrow).join('')}${globos.map(bubble).join('')}</g></svg>`;
}

// Devuelve una lista de SVG: una por viñeta (o una sola si la escena no tiene viñetas)
export function renderPanels(descriptor) {
  const panels = descriptor.paneles || [descriptor];
  return panels.map(renderScene);
}