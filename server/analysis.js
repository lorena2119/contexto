import { sanitizeScene } from '../src/illustrations/vocab.js';
const TYPES = ['literal', 'sarcasmo', 'metafora', 'ambigua'];
const CONFIDENCE = ['alta', 'media', 'baja'];

// Convierte el texto de la IA en un objeto validado. Lanza error si no es JSON.
// Valida el borrador de ejercicio. Los mensajes con "JSON" hacen que el servidor reintente.

// Convierte el texto de la IA en un objeto validado. Lanza error si no es JSON.
export function parseAnalysis(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('La respuesta no contiene JSON');
  const data = JSON.parse(text.slice(start, end + 1));

  const list = (value) => (Array.isArray(value) ? value.map(String).slice(0, 6) : []);
  return {
    tipo: TYPES.includes(data.tipo) ? data.tipo : 'ambigua',
    significado: String(data.significado || ''),
    pistas: list(data.pistas),
    explicacion_para_nino: String(data.explicacion_para_nino || ''),
    interpretaciones: Array.isArray(data.interpretaciones)
      ? data.interpretaciones.slice(0, 3).map((i) => ({
          texto: String(i?.texto || ''),
          contexto: String(i?.contexto || ''),
        }))
      : [],
    confianza: CONFIDENCE.includes(data.confianza) ? data.confianza : 'media',
    nota_para_adulto: String(data.nota_para_adulto || ''),
  };
}
// Valida el borrador de ejercicio. Los mensajes con "JSON" hacen que el servidor reintente.
export function parseExercise(text, optionCount) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('La respuesta no contiene JSON');
  const data = JSON.parse(text.slice(start, end + 1));

  const options = Array.isArray(data.opciones)
    ? data.opciones.map((o) => String(o).trim()).filter(Boolean)
    : [];
  const correct = Number(data.correcta);

  if (options.length !== optionCount) {
    throw new Error(`JSON: se esperaban ${optionCount} opciones y llegaron ${options.length}`);
  }
  if (!Number.isInteger(correct) || correct < 0 || correct >= options.length) {
    throw new Error('JSON: el índice de la respuesta correcta no es válido');
  }
  const historia = String(data.historia || '').trim();
  const pregunta = String(data.pregunta || '').trim();
  if (!historia || !pregunta) throw new Error('JSON: faltan la historia o la pregunta');

  return {
    historia,
    pregunta,
    opciones: options,
    correcta: correct,
    explicacion: String(data.explicacion || '').trim(),
    pistas: Array.isArray(data.pistas) ? data.pistas.map(String).slice(0, 4) : [],
    escena: sanitizeScene(data.escena), // null si la IA no la describió bien
  };
}
// ---------- Modo demostración: respuestas preparadas ----------
const normalize = (text) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

const DEMOS = [
  {
    match: 'que dia tan bonito',
    result: {
      tipo: 'sarcasmo',
      significado: 'Quien lo dice piensa que el día NO es bonito y lo expresa diciendo lo contrario.',
      pistas: ['La situación no es agradable (por ejemplo, está lloviendo)', 'El tono de voz suena molesto', 'La cara no muestra alegría', 'Lo que dice no coincide con lo que se ve'],
      explicacion_para_nino: 'La persona dijo "qué día tan bonito", pero en realidad no le gusta el día. Dijo lo contrario de lo que piensa. Eso se llama sarcasmo.',
      interpretaciones: [],
      confianza: 'media',
      nota_para_adulto: 'Sin contexto podría ser literal. Si hay una situación desagradable o un tono molesto, es sarcasmo.',
    },
  },
  {
    match: 'mariposas en el estomago',
    result: {
      tipo: 'metafora',
      significado: 'La persona está nerviosa o emocionada.',
      pistas: ['No hay mariposas de verdad en el cuerpo', 'Se usa cuando algo importante va a pasar', 'Se siente como cosquillas en la barriga'],
      explicacion_para_nino: 'Cuando alguien está nervioso o emocionado, siente cosquillas en la barriga. Por eso dice que tiene mariposas, aunque no son mariposas de verdad.',
      interpretaciones: [],
      confianza: 'alta',
      nota_para_adulto: 'Puede ayudar acompañar la explicación con un ejemplo vivido por el niño.',
    },
  },
  {
    match: 'pan comido',
    result: {
      tipo: 'metafora',
      significado: 'Algo fue muy fácil de hacer.',
      pistas: ['El pan se come sin esfuerzo', 'Se dice después de hacer algo sin dificultad'],
      explicacion_para_nino: 'Decir que algo fue pan comido significa que fue muy fácil, como comer pan.',
      interpretaciones: [],
      confianza: 'alta',
      nota_para_adulto: '',
    },
  },
  {
    match: 'vi a la nina con el telescopio',
    result: {
      tipo: 'ambigua',
      significado: 'La frase puede entenderse de dos maneras distintas.',
      pistas: ['"Con el telescopio" puede describir cómo vi o qué tenía la niña'],
      explicacion_para_nino: 'Esta frase puede significar dos cosas diferentes. Hay que preguntar o mirar el contexto para saber cuál es.',
      interpretaciones: [
        { texto: 'Yo usé un telescopio para ver a la niña.', contexto: 'Si quien habla estaba mirando con un telescopio' },
        { texto: 'La niña tenía un telescopio.', contexto: 'Si la niña llevaba un telescopio en las manos' },
      ],
      confianza: 'media',
      nota_para_adulto: 'Es una ambigüedad de estructura de la oración; sirve para practicar pedir más información.',
    },
  },
  {
    match: 'manana vamos al parque',
    result: {
      tipo: 'literal',
      significado: 'Mañana irán al parque.',
      pistas: ['Dice exactamente lo que va a pasar', 'No hay exageración ni doble sentido'],
      explicacion_para_nino: 'Esta frase dice lo que quiere decir: mañana iremos al parque.',
      interpretaciones: [],
      confianza: 'alta',
      nota_para_adulto: '',
    },
  },
    {
    match: 'nudo en la garganta',
    result: {
      tipo: 'metafora',
      significado: 'La persona siente una emoción fuerte, como tristeza, miedo o ganas de llorar, y le cuesta hablar.',
      pistas: ['No hay un nudo de verdad en el cuerpo', 'Se usa cuando una emoción fuerte aprieta la garganta', 'Suele pasar antes de llorar o ante algo muy emotivo'],
      explicacion_para_nino: 'Cuando alguien siente una emoción muy fuerte, la garganta se siente apretada, como si tuviera un nudo. Por eso dice que se le hizo un nudo, aunque no haya ningún nudo de verdad.',
      interpretaciones: [],
      confianza: 'alta',
      nota_para_adulto: 'Es un buen momento para hablar de cómo se siente el cuerpo cuando hay emociones fuertes.',
    },
  },
  {
    match: 'ojo de la cara',
    result: {
      tipo: 'metafora',
      significado: 'Algo costó muchísimo dinero.',
      pistas: ['Nadie paga con un ojo de verdad', 'Se usa para decir que algo es carísimo'],
      explicacion_para_nino: 'Decir que algo costó un ojo de la cara significa que fue muy, muy caro. No es que se haya pagado con un ojo.',
      interpretaciones: [],
      confianza: 'alta',
      nota_para_adulto: '',
    },
  },
  {
    match: 'en las nubes',
    result: {
      tipo: 'metafora',
      significado: 'La persona está distraída, pensando en otra cosa.',
      pistas: ['La persona no está de verdad en las nubes', 'Se dice de quien no presta atención a lo que pasa'],
      explicacion_para_nino: 'Estar en las nubes significa estar distraído, pensando en otra cosa y no en lo que pasa ahora.',
      interpretaciones: [],
      confianza: 'alta',
      nota_para_adulto: '',
    },
  },
  {
    match: 'que buen trabajo',
    result: {
      tipo: 'sarcasmo',
      significado: 'Quien lo dice piensa que el trabajo salió mal y lo expresa diciendo lo contrario.',
      pistas: ['Hay un error o un desorden a la vista', 'El tono suena burlón o molesto', 'Dice algo bueno sobre algo que salió mal'],
      explicacion_para_nino: 'La persona dijo "qué buen trabajo", pero en realidad piensa que algo no salió bien. Dijo lo contrario de lo que piensa. Eso es sarcasmo.',
      interpretaciones: [],
      confianza: 'media',
      nota_para_adulto: 'Sin contexto también podría ser un elogio de verdad. Conviene fijarse en la situación y en el tono.',
    },
  },
];

// Devuelve la respuesta de ejemplo si la frase está en la lista, o null si no
export function findDemo(frase) {
  const key = normalize(frase);
  const found = DEMOS.find((d) => key.includes(d.match));
  return found ? found.result : null;
}

export function demoAnalysis(frase) {
  const key = normalize(frase);
  const found = DEMOS.find((d) => key.includes(d.match));
  if (found) return found.result;
  return {
    tipo: 'ambigua',
    significado: 'Esta frase no está entre los ejemplos del modo demostración.',
    pistas: [],
    explicacion_para_nino: '',
    interpretaciones: [],
    confianza: 'baja',
    nota_para_adulto:
      'El modo demostración solo reconoce frases de ejemplo. Toca uno de los ejemplos que aparecen debajo del formulario, o conecta la IA en .env para analizar cualquier frase.',
  };
}