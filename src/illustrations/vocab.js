// Vocabulario de las escenas: lo único que la IA puede elegir para describir una ilustración.
// Se usa en el servidor (para validar) y en la app (para dibujar y editar).
export const VOCAB = {
  lugares: ['interior', 'exterior', 'salon'],
  climas: ['sol', 'lluvia', 'nublado'],
  roles: ['nino', 'nina', 'adulto', 'adulta'],
  emociones: ['feliz', 'triste', 'serio', 'enojado', 'sorprendido', 'nervioso', 'avergonzado', 'cansado', 'burlon', 'neutral'],
  atributos: ['mojado', 'sudor', 'rubor', 'mochila', 'medalla', 'curita'],
  objetos: ['pelota', 'caja', 'mesa', 'silla', 'mochila', 'casillero', 'carro', 'cama', 'regalo', 'comoda', 'bolsa', 'libro', 'helado', 'sopa', 'bus', 'parada', 'dibujo', 'examen', 'bicicleta', 'edificio', 'armario', 'galletas'],
  iconos: ['sol', 'pregunta', 'pastel', 'globos', 'helado', 'zzz', 'parque', 'pulgar', 'reloj', 'rayo', 'camara', 'corazon', 'billetes', 'puntos', 'bla', 'ja', 'pelota', 'libros'],
  tiposGlobo: ['habla', 'piensa'],
};

// Nombres para mostrar en la interfaz
export const LABELS = {
  lugares: { interior: 'Dentro de una casa', exterior: 'Al aire libre', salon: 'Salón de clases' },
  climas: { sol: 'Soleado', lluvia: 'Lluvia', nublado: 'Nublado' },
  roles: { nino: 'Niño', nina: 'Niña', adulto: 'Adulto', adulta: 'Adulta' },
  emociones: {
    feliz: 'Feliz', triste: 'Triste', serio: 'Serio', enojado: 'Enojado', sorprendido: 'Sorprendido',
    nervioso: 'Nervioso', avergonzado: 'Avergonzado', cansado: 'Cansado', burlon: 'Burlón', neutral: 'Neutral',
  },
  objetos: {
    pelota: 'Pelota', caja: 'Caja', mesa: 'Mesa', silla: 'Silla', mochila: 'Mochila', casillero: 'Casillero',
    carro: 'Carro de juguete', cama: 'Cama', regalo: 'Regalo', comoda: 'Cómoda', bolsa: 'Bolsa', libro: 'Libro',
    helado: 'Helado', sopa: 'Sopa derramada', bus: 'Bus', parada: 'Parada de bus', dibujo: 'Dibujo',
    examen: 'Examen', bicicleta: 'Bicicleta', edificio: 'Colegio', armario: 'Armario', galletas: 'Galletas',
  },
  iconos: {
    sol: 'Sol', pregunta: 'Pregunta', pastel: 'Pastel', globos: 'Globos', helado: 'Helado', zzz: 'Sueño',
    parque: 'Parque', pulgar: 'Pulgar arriba', reloj: 'Reloj', rayo: 'Rayo', camara: 'Cámara', corazon: 'Corazón',
    billetes: 'Dinero', puntos: 'Puntos', bla: 'Hablar (bla bla)', ja: 'Risas (ja ja)', pelota: 'Pelota', libros: 'Libros',
  },
  tiposGlobo: { habla: 'Dice', piensa: 'Piensa' },
};

const pick = (value, list, fallback) => (list.includes(value) ? value : fallback);

// Escena "semántica": sin coordenadas. Devuelve una versión segura, o null si no sirve.
export function sanitizeScene(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const personajes = (Array.isArray(raw.personajes) ? raw.personajes : []).slice(0, 3).map((p) => {
    const out = { rol: pick(p?.rol, VOCAB.roles, 'nino'), emocion: pick(p?.emocion, VOCAB.emociones, 'neutral') };
    for (const attr of VOCAB.atributos) if (p?.[attr] === true) out[attr] = true;
    return out;
  });
  if (!personajes.length) return null;

  const objetos = [...new Set((Array.isArray(raw.objetos) ? raw.objetos : []).map(String).filter((o) => VOCAB.objetos.includes(o)))].slice(0, 3);

  const globos = (Array.isArray(raw.globos) ? raw.globos : []).slice(0, 2)
    .map((g) => ({
      tipo: pick(g?.tipo, VOCAB.tiposGlobo, 'habla'),
      de: Math.min(personajes.length - 1, Math.max(0, Math.trunc(Number(g?.de)) || 0)),
      icono: pick(g?.icono, VOCAB.iconos, null),
    }))
    .filter((g) => g.icono);

  return {
    lugar: pick(raw.lugar, VOCAB.lugares, 'interior'),
    clima: pick(raw.clima, VOCAB.climas, 'sol'),
    personajes,
    objetos,
    globos,
  };
}

// Escena de respaldo cuando la IA no describe una
export function defaultScene(tipo) {
  if (tipo === 'sarcasmo') {
    return { lugar: 'interior', clima: 'nublado', personajes: [{ rol: 'nino', emocion: 'serio' }], objetos: [], globos: [{ tipo: 'habla', de: 0, icono: 'sol' }] };
  }
  return { lugar: 'interior', clima: 'sol', personajes: [{ rol: 'nina', emocion: 'neutral' }], objetos: [], globos: [] };
}
