// Convierte una escena "semántica" (sin coordenadas) en una descripción lista para dibujar.
import { GROUND } from './scene.js';

const WIDTHS = {
  pelota: 30, caja: 70, mesa: 118, silla: 52, mochila: 42, casillero: 56, carro: 60, cama: 124, regalo: 38,
  comoda: 94, bolsa: 50, libro: 34, helado: 34, sopa: 80, bus: 160, parada: 44, dibujo: 104, examen: 54,
  bicicleta: 120, edificio: 160, armario: 80, galletas: 56,
};
const SCALES = { bus: 0.85, cama: 0.85 };
const ON_TABLE = ['galletas', 'sopa'];

const KID_SKINS = [0, 1, 2];
const KID_HAIRS = [1, 2, 0];
const KID_SHIRTS = [1, 3, 0];

export function layoutScene(sem) {
  // 1) Objetos: se acomodan de derecha a izquierda
  const names = [...sem.objetos];
  const onTable = names.filter((n) => ON_TABLE.includes(n));
  const base = names.filter((n) => !ON_TABLE.includes(n));
  if (onTable.length && !base.includes('mesa')) base.push('mesa');

  const objetos = [];
  let right = 392;
  let tableX = null;
  for (const name of base) {
    const scale = SCALES[name] ?? 1;
    const width = (WIDTHS[name] ?? 60) * scale;
    const x = Math.round(right - width / 2);
    right = x - width / 2 - 10;
    const obj = { tipo: name, x, y: name === 'dibujo' ? 142 : GROUND };
    if (scale !== 1) obj.escala = scale;
    if (name === 'caja') obj.color = '#4890E0';
    if (name === 'mesa') tableX = x;
    objetos.push(obj);
  }
  for (const item of onTable) objetos.push({ tipo: item, x: tableX, y: GROUND - 58 });

  // 2) Personajes: de izquierda a derecha en el espacio que queda
  const chars = sem.personajes;
  const n = chars.length;
  const x0 = n === 1 ? Math.max(80, Math.min(150, Math.round(right / 2))) : 70;
  const step = n > 1 ? Math.max(56, Math.min(85, (right - 40 - x0) / (n - 1))) : 0;
  const personajes = chars.map((c, i) => {
    const adult = c.rol === 'adulto' || c.rol === 'adulta';
    return {
      ...c,
      x: Math.round(x0 + step * i),
      piel: KID_SKINS[i % 3],
      pelo: KID_HAIRS[i % 3],
      camiseta: adult ? i % 3 : KID_SHIRTS[i % 3],
    };
  });

  // 3) Globos: sobre la cabeza del personaje que habla o piensa
  const used = [];
  const globos = sem.globos.map((g) => {
    const who = personajes[g.de] || personajes[0];
    const adult = who.rol === 'adulto' || who.rol === 'adulta';
    const headY = GROUND - 100 * (adult ? 1.15 : 1);
    let side = who.x > 280 ? -1 : 1;
    let bx = Math.max(46, Math.min(354, who.x + side * 66));
    if (used.some((u) => Math.abs(u - bx) < 70)) {
      side = -side;
      bx = Math.max(46, Math.min(354, who.x + side * 66));
    }
    used.push(bx);
    const piensa = g.tipo === 'piensa';
    return {
      tipo: g.tipo,
      x: bx,
      y: piensa ? 52 : 44,
      w: piensa ? 70 : 66,
      h: piensa ? 54 : 48,
      hacia: { x: who.x + side * (piensa ? 10 : 20), y: Math.round(headY - (piensa ? 18 : 12)) },
      contenido: [{ icono: g.icono, escala: 0.9 }],
    };
  });

  return {
    alt: 'Ilustración de la situación de la historia.',
    lugar: sem.lugar,
    clima: sem.clima,
    personajes,
    objetos,
    globos,
  };
}
