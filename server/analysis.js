const TYPES = ['literal', 'sarcasmo', 'metafora', 'ambigua'];
const CONFIDENCE = ['alta', 'media', 'baja'];

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
];

export function demoAnalysis(frase) {
  const key = normalize(frase);
  const found = DEMOS.find((d) => key.includes(d.match));
  if (found) return found.result;
  return {
    tipo: 'ambigua',
    significado: 'En modo demostración solo se reconocen algunas frases de ejemplo.',
    pistas: [],
    explicacion_para_nino: '',
    interpretaciones: [],
    confianza: 'baja',
    nota_para_adulto:
      'Prueba con: "¡Qué día tan bonito!", "Tengo mariposas en el estómago", "Eso fue pan comido", "Vi a la niña con el telescopio" o "Mañana vamos al parque". Para analizar cualquier frase, conecta la IA en el archivo .env.',
  };
}