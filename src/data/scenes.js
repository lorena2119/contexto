// Descripción de la escena (ilustración) de cada ejercicio, por id.
// Las falsas creencias usan varias viñetas ("paneles") para mostrar quién vio qué.
const pensar = (x, y, hx, hy, contenido = [{ icono: 'pregunta' }]) =>
  ({ tipo: 'piensa', x, y, w: 64, h: 52, hacia: { x: hx, y: hy }, contenido });
const caja = (x, color, contiene) => ({ tipo: 'caja', x, y: 192, color, contiene });
const ROJO = '#e4574d';
const AZUL = '#4890E0';

export const SCENES = {
  // ---------- FALSAS CREENCIAS ----------
  'fc-n1-A': {
    paneles: [
      { alt: 'Sofía guarda su pelota en la caja roja.', lugar: 'interior', ventana: false,
        personajes: [{ rol: 'nina', x: 110, emocion: 'feliz', camiseta: 2, pelo: 1 }],
        objetos: [caja(250, ROJO, 'pelota'), caja(335, AZUL)] },
      { alt: 'Mateo cambia la pelota a la caja azul.', lugar: 'interior', ventana: false,
        personajes: [{ rol: 'nino', x: 150, emocion: 'feliz', camiseta: 0, pelo: 0, piel: 1 }],
        objetos: [caja(262, ROJO), caja(340, AZUL, 'pelota')],
        flechas: [{ x1: 262, y1: 125, x2: 338, y2: 125, alto: 36 }] },
      { alt: 'Sofía vuelve a buscar su pelota.', lugar: 'interior', ventana: false,
        personajes: [{ rol: 'nina', x: 110, emocion: 'neutral', camiseta: 2, pelo: 1 }],
        objetos: [caja(262, ROJO), caja(340, AZUL, 'pelota')],
        globos: [pensar(150, 52, 118, 74)] },
    ],
  },
  'fc-n1-B': {
    paneles: [
      { alt: 'Samuel deja sus galletas sobre la mesa.', lugar: 'interior', ventana: false,
        personajes: [{ rol: 'nino', x: 120, emocion: 'feliz', camiseta: 3, piel: 1 }],
        objetos: [{ tipo: 'mesa', x: 250, y: 192 }, { tipo: 'galletas', x: 250, y: 134 }] },
      { alt: 'Su hermana guarda las galletas en el armario.', lugar: 'interior', ventana: false,
        personajes: [{ rol: 'nina', x: 110, emocion: 'feliz', camiseta: 4, pelo: 1, piel: 1 }],
        objetos: [{ tipo: 'mesa', x: 235, y: 192 }, { tipo: 'armario', x: 350, abierto: true, contiene: 'galletas' }],
        flechas: [{ x1: 235, y1: 112, x2: 345, y2: 92, alto: 34 }] },
      { alt: 'Samuel regresa con hambre a buscar sus galletas.', lugar: 'interior', ventana: false,
        personajes: [{ rol: 'nino', x: 110, emocion: 'neutral', camiseta: 3, piel: 1 }],
        objetos: [{ tipo: 'mesa', x: 235, y: 192 }, { tipo: 'armario', x: 350 }],
        globos: [pensar(150, 52, 118, 74)] },
    ],
  },
  'fc-n2-A': {
    paneles: [
      { alt: 'Valentina deja su mochila debajo de su silla.', lugar: 'salon', pizarron: { x: 36, w: 240 },
        personajes: [{ rol: 'nina', x: 100, emocion: 'feliz', camiseta: 1, pelo: 0 }],
        objetos: [{ tipo: 'silla', x: 205 }, { tipo: 'mochila', x: 205, y: 194, escala: 0.8 }, { tipo: 'casillero', x: 340 }] },
      { alt: 'La profe guarda la mochila en el casillero.', lugar: 'salon', pizarron: { x: 36, w: 240 },
        personajes: [{ rol: 'adulta', x: 268, emocion: 'neutral', camiseta: 2, pelo: 1, piel: 1 }],
        objetos: [{ tipo: 'silla', x: 150 }, { tipo: 'casillero', x: 352, abierto: true, contiene: 'mochila' }] },
      { alt: 'Valentina vuelve al salón.', lugar: 'salon', pizarron: { x: 36, w: 240 },
        personajes: [{ rol: 'nina', x: 100, emocion: 'neutral', camiseta: 1, pelo: 0 }],
        objetos: [{ tipo: 'silla', x: 205 }, { tipo: 'casillero', x: 340 }],
        globos: [pensar(140, 52, 108, 74)] },
    ],
  },
  'fc-n2-B': {
    paneles: [
      { alt: 'Tomás guarda su carro de juguete en la caja de juguetes.', lugar: 'interior', ventana: false,
        personajes: [{ rol: 'nino', x: 85, emocion: 'feliz', camiseta: 0, pelo: 2 }],
        objetos: [caja(205, '#52b58a', 'carro'), { tipo: 'cama', x: 335, y: 190, escala: 0.85 }] },
      { alt: 'Su prima lo saca de la caja y lo deja sobre la cama.', lugar: 'interior', ventana: false,
        personajes: [{ rol: 'nina', x: 85, emocion: 'feliz', camiseta: 2, pelo: 3, piel: 2 }],
        objetos: [caja(205, '#52b58a'), { tipo: 'cama', x: 335, y: 190, escala: 0.85, contiene: 'carro' }],
        flechas: [{ x1: 205, y1: 125, x2: 330, y2: 118, alto: 36 }] },
      { alt: 'Tomás entra al cuarto.', lugar: 'interior', ventana: false,
        personajes: [{ rol: 'nino', x: 85, emocion: 'neutral', camiseta: 0, pelo: 2 }],
        objetos: [caja(205, '#52b58a'), { tipo: 'cama', x: 335, y: 190, escala: 0.85, contiene: 'carro' }],
        globos: [pensar(125, 52, 93, 74)] },
    ],
  },
  'fc-n3-A': {
    paneles: [
      { alt: 'La abuela esconde una sorpresa en el armario; Ana y Pablo la ven.', lugar: 'interior', ventana: false,
        personajes: [
          { rol: 'adulta', x: 125, escala: 1.15, emocion: 'feliz', camiseta: 1, pelo: 3, piel: 2 },
          { rol: 'nina', x: 205, emocion: 'neutral', camiseta: 2, pelo: 1 },
          { rol: 'nino', x: 265, emocion: 'neutral', camiseta: 0, pelo: 2, piel: 1 },
        ],
        objetos: [{ tipo: 'armario', x: 48, abierto: true, contiene: 'regalo' }, { tipo: 'cama', x: 345, y: 190, escala: 0.85 }] },
      { alt: 'Pablo sale. La abuela cambia la sorpresa a la cama y Ana lo ve.', lugar: 'interior', ventana: false,
        personajes: [
          { rol: 'adulta', x: 195, escala: 1.15, emocion: 'feliz', camiseta: 1, pelo: 3, piel: 2 },
          { rol: 'nina', x: 262, emocion: 'neutral', camiseta: 2, pelo: 1 },
        ],
        objetos: [{ tipo: 'armario', x: 48, abierto: true }, { tipo: 'cama', x: 345, y: 190, escala: 0.85, contiene: 'regalo' }] },
      { alt: 'Pablo mira por la ventana y ve todo, pero Ana no lo sabe.', lugar: 'interior',
        ventana: { x: 250, asomado: { rol: 'nino', emocion: 'sorprendido', piel: 1, pelo: 2 } },
        personajes: [
          { rol: 'nina', x: 120, emocion: 'neutral', camiseta: 2, pelo: 1 },
          { rol: 'adulta', x: 195, escala: 1.15, emocion: 'feliz', camiseta: 1, pelo: 3, piel: 2 },
        ],
        objetos: [{ tipo: 'armario', x: 48 }, { tipo: 'cama', x: 345, y: 190, escala: 0.85, contiene: 'regalo' }],
        globos: [pensar(92, 44, 112, 72)] },
    ],
  },
  'fc-n3-B': {
    paneles: [
      { alt: 'Mamá guarda las llaves en el cajón; Luisa y Camilo la ven.', lugar: 'interior', ventana: false,
        personajes: [
          { rol: 'adulta', x: 135, escala: 1.15, emocion: 'feliz', camiseta: 0, pelo: 1, piel: 2 },
          { rol: 'nina', x: 205, emocion: 'neutral', camiseta: 2, pelo: 3 },
          { rol: 'nino', x: 265, emocion: 'neutral', camiseta: 1, pelo: 0, piel: 1 },
        ],
        objetos: [{ tipo: 'comoda', x: 55, abierto: true, contiene: 'llaves' }, { tipo: 'bolsa', x: 345 }] },
      { alt: 'Camilo sale. Mamá mueve las llaves a la bolsa y Luisa lo ve.', lugar: 'interior', ventana: false,
        personajes: [
          { rol: 'adulta', x: 195, escala: 1.15, emocion: 'feliz', camiseta: 0, pelo: 1, piel: 2 },
          { rol: 'nina', x: 262, emocion: 'neutral', camiseta: 2, pelo: 3 },
        ],
        objetos: [{ tipo: 'comoda', x: 55, abierto: true }, { tipo: 'bolsa', x: 345, contiene: 'llaves' }] },
      { alt: 'Camilo mira por la ventana y ve todo, pero Luisa no lo sabe.', lugar: 'interior',
        ventana: { x: 250, asomado: { rol: 'nino', emocion: 'sorprendido', piel: 1, pelo: 0 } },
        personajes: [
          { rol: 'nina', x: 120, emocion: 'neutral', camiseta: 2, pelo: 3 },
          { rol: 'adulta', x: 195, escala: 1.15, emocion: 'feliz', camiseta: 0, pelo: 1, piel: 2 },
        ],
        objetos: [{ tipo: 'comoda', x: 55 }, { tipo: 'bolsa', x: 345, contiene: 'llaves' }],
        globos: [pensar(92, 44, 112, 72)] },
    ],
  },

  // ---------- TOMA DE PERSPECTIVA ----------
  'pe-n1-A': {
    alt: 'Ana se queda en casa, triste, mientras piensa en la fiesta a la que no la invitaron.',
    lugar: 'interior', clima: 'sol',
    personajes: [{ rol: 'nina', x: 140, emocion: 'triste', camiseta: 1, pelo: 3 }],
    globos: [{ tipo: 'piensa', x: 215, y: 62, w: 92, h: 64, hacia: { x: 160, y: 84 },
      contenido: [{ icono: 'globos', dx: -20, dy: 4, escala: 0.9 }, { icono: 'pastel', dx: 22, dy: 8, escala: 0.9 }] }],
  },
  'pe-n1-B': {
    alt: 'Mateo muestra su medalla y sus papás sonríen orgullosos.',
    lugar: 'interior', ventana: false,
    personajes: [
      { rol: 'adulta', x: 105, emocion: 'feliz', camiseta: 2, pelo: 1, piel: 2 },
      { rol: 'nino', x: 205, emocion: 'feliz', medalla: true, camiseta: 0, pelo: 0, piel: 1 },
      { rol: 'adulto', x: 305, emocion: 'feliz', camiseta: 0, pelo: 2, piel: 1 },
    ],
  },
  'pe-n2-A': {
    alt: 'Sofía quería un helado de fresa, pero solo quedaba de limón.',
    lugar: 'exterior', clima: 'sol',
    personajes: [{ rol: 'nina', x: 150, emocion: 'triste', camiseta: 2, pelo: 3 }],
    objetos: [{ tipo: 'helado', x: 182, y: 168, orden: 40, color: '#f2e16b' }],
    globos: [{ tipo: 'piensa', x: 258, y: 66, w: 72, h: 58, hacia: { x: 188, y: 88 },
      contenido: [{ icono: 'helado', color: '#f08fb0', dy: -2, escala: 0.9 }] }],
  },
  'pe-n2-B': {
    alt: 'Samuel esperaba ir al parque, pero su papá está muy cansado.',
    lugar: 'interior', ventana: false,
    personajes: [
      { rol: 'adulto', x: 120, emocion: 'cansado', camiseta: 1, pelo: 2, piel: 1 },
      { rol: 'nino', x: 255, emocion: 'triste', camiseta: 3, pelo: 0, piel: 1 },
    ],
    globos: [
      { tipo: 'habla', x: 192, y: 44, w: 70, h: 48, hacia: { x: 150, y: 74 }, contenido: [{ icono: 'zzz' }] },
      { tipo: 'piensa', x: 335, y: 66, w: 70, h: 56, hacia: { x: 278, y: 90 }, contenido: [{ icono: 'parque' }] },
    ],
  },
  'pe-n3-A': {
    alt: 'Valentina le regala un libro a Tomás, que ya lo tiene, pero sonríe.',
    lugar: 'interior', ventana: false,
    personajes: [
      { rol: 'nina', x: 115, emocion: 'feliz', camiseta: 1, pelo: 0 },
      { rol: 'nino', x: 255, emocion: 'feliz', camiseta: 4, pelo: 2, piel: 3 },
    ],
    objetos: [{ tipo: 'libro', x: 152, y: 172, orden: 30 }],
    globos: [{ tipo: 'piensa', x: 332, y: 64, w: 80, h: 58, hacia: { x: 280, y: 88 }, contenido: [{ icono: 'libros', escala: 0.9 }] }],
  },
  'pe-n3-B': {
    alt: 'Camilo se cayó y varios niños se ríen; Luisa se queda a su lado.',
    lugar: 'exterior', clima: 'sol',
    personajes: [
      { rol: 'nino', x: 55, y: 172, escala: 0.7, emocion: 'feliz', camiseta: 3, piel: 2 },
      { rol: 'nina', x: 105, y: 172, escala: 0.7, emocion: 'feliz', camiseta: 2, pelo: 3 },
      { rol: 'nino', x: 195, emocion: 'avergonzado', rubor: true, curita: true, camiseta: 1, pelo: 0, piel: 1 },
      { rol: 'nina', x: 265, emocion: 'neutral', camiseta: 4, pelo: 1 },
    ],
    globos: [
      { tipo: 'habla', x: 80, y: 50, w: 70, h: 40, hacia: { x: 80, y: 90 }, contenido: [{ icono: 'ja', escala: 0.8 }] },
      { tipo: 'habla', x: 330, y: 62, w: 64, h: 52, hacia: { x: 286, y: 86 }, contenido: [{ icono: 'corazon', escala: 0.8 }] },
    ],
  },

  // ---------- SARCASMO ----------
  'sa-n1-A': {
    alt: 'Llueve y Juan, con cara de enojo, dice «¡Qué día tan bonito!».',
    lugar: 'interior', clima: 'lluvia',
    personajes: [{ rol: 'nino', x: 150, emocion: 'enojado', camiseta: 3, pelo: 2, piel: 2 }],
    globos: [{ tipo: 'habla', x: 82, y: 50, w: 76, h: 56, hacia: { x: 118, y: 90 }, contenido: [{ icono: 'sol' }] }],
  },
  'sa-n1-B': {
    alt: 'Laura derrama la sopa y su hermano le dice «¡Qué buen trabajo!» en tono burlón.',
    lugar: 'interior', ventana: false,
    personajes: [
      { rol: 'nina', x: 125, emocion: 'avergonzado', camiseta: 2, pelo: 1 },
      { rol: 'nino', x: 305, emocion: 'burlon', camiseta: 0, pelo: 2, piel: 1 },
    ],
    objetos: [{ tipo: 'mesa', x: 215, y: 192 }, { tipo: 'sopa', x: 215, y: 134 }],
    globos: [{ tipo: 'habla', x: 312, y: 36, w: 66, h: 48, hacia: { x: 304, y: 76 }, contenido: [{ icono: 'pulgar', escala: 0.9 }] }],
  },
  'sa-n2-A': {
    alt: 'Nicolás espera el bus bajo el sol, cansado, y dice «¡Qué rápido llegó!».',
    lugar: 'exterior', clima: 'sol',
    personajes: [{ rol: 'nino', x: 135, emocion: 'cansado', sudor: true, camiseta: 1, pelo: 3, piel: 1 }],
    objetos: [{ tipo: 'parada', x: 62 }, { tipo: 'bus', x: 322, y: 190, escala: 0.85 }],
    globos: [{ tipo: 'habla', x: 175, y: 40, w: 70, h: 54, hacia: { x: 142, y: 78 }, contenido: [{ icono: 'rayo' }] }],
  },
  'sa-n2-B': {
    alt: 'El dibujo de Isabela quedó torcido y su amigo le dice «Igualito a una foto».',
    lugar: 'interior', ventana: false,
    personajes: [
      { rol: 'nina', x: 185, emocion: 'triste', camiseta: 3, pelo: 1, piel: 2 },
      { rol: 'nino', x: 300, emocion: 'burlon', camiseta: 2, pelo: 3 },
    ],
    objetos: [{ tipo: 'dibujo', x: 95, y: 142 }],
    globos: [{ tipo: 'habla', x: 306, y: 34, w: 66, h: 48, hacia: { x: 300, y: 74 }, contenido: [{ icono: 'camara', escala: 0.9 }] }],
  },
  'sa-n3-A': {
    alt: 'La profe pide silencio por tercera vez y un niño sigue hablando fuerte.',
    lugar: 'salon',
    personajes: [
      { rol: 'adulta', x: 95, emocion: 'serio', camiseta: 2, pelo: 1, piel: 1 },
      { rol: 'nino', x: 290, emocion: 'feliz', camiseta: 4, pelo: 0, piel: 1 },
    ],
    globos: [
      { tipo: 'habla', x: 192, y: 46, w: 70, h: 52, hacia: { x: 128, y: 72 }, contenido: [{ icono: 'pulgar', escala: 0.9 }] },
      { tipo: 'habla', x: 350, y: 36, w: 76, h: 44, hacia: { x: 316, y: 76 }, contenido: [{ icono: 'bla', escala: 0.8 }] },
    ],
  },
  'sa-n3-B': {
    alt: 'Daniela llega tarde a la fiesta y su amiga le dice «¡Llegaste justo a tiempo!».',
    lugar: 'interior', ventana: false, decoracion: 'fiesta',
    personajes: [
      { rol: 'nina', x: 125, emocion: 'serio', camiseta: 0, pelo: 1 },
      { rol: 'nina', x: 290, emocion: 'avergonzado', camiseta: 2, pelo: 3, piel: 2 },
    ],
    objetos: [{ tipo: 'regalo', x: 324, y: 178 }],
    globos: [{ tipo: 'habla', x: 205, y: 40, w: 64, h: 48, hacia: { x: 142, y: 78 }, contenido: [{ icono: 'reloj', escala: 0.8 }] }],
  },

  // ---------- METÁFORAS Y EXPRESIONES ----------
  'me-n1-A': {
    alt: 'Sofía, nerviosa, llega con su mamá al primer día de colegio.',
    lugar: 'exterior', clima: 'sol',
    objetos: [{ tipo: 'edificio', x: 300, y: 182 }],
    personajes: [
      { rol: 'adulta', x: 70, emocion: 'feliz', camiseta: 0, pelo: 1, piel: 2, y: 192 },
      { rol: 'nina', x: 150, emocion: 'nervioso', camiseta: 2, pelo: 3, mochila: true, y: 196 },
    ],
  },
  'me-n1-B': {
    alt: 'Camilo comparte su pelota con un niño pequeño y la abuela dice que tiene un corazón de oro.',
    lugar: 'interior', ventana: false,
    personajes: [
      { rol: 'adulta', x: 95, emocion: 'feliz', camiseta: 1, pelo: 3, piel: 2 },
      { rol: 'nino', x: 235, emocion: 'feliz', camiseta: 3, pelo: 0, piel: 1 },
      { rol: 'nino', x: 335, escala: 0.75, emocion: 'feliz', camiseta: 4, piel: 3 },
    ],
    objetos: [{ tipo: 'pelota', x: 278, y: 178 }],
    globos: [{ tipo: 'habla', x: 182, y: 46, w: 72, h: 54, hacia: { x: 128, y: 72 }, contenido: [{ icono: 'corazon', color: '#ffd36b', escala: 0.85 }] }],
  },
  'me-n2-A': {
    alt: 'La profe hace una pregunta, pero Daniel está distraído pensando en otra cosa.',
    lugar: 'salon', ventana: { x: 24 }, pizarron: { x: 170, w: 214 },
    personajes: [
      { rol: 'nino', x: 100, emocion: 'neutral', camiseta: 4, pelo: 2, piel: 1 },
      { rol: 'adulta', x: 348, emocion: 'serio', camiseta: 0, pelo: 1, piel: 1 },
    ],
    globos: [
      { tipo: 'piensa', x: 218, y: 62, w: 70, h: 52, hacia: { x: 128, y: 88 }, contenido: [{ icono: 'pelota' }] },
      { tipo: 'habla', x: 292, y: 44, w: 60, h: 50, hacia: { x: 320, y: 66 }, contenido: [{ icono: 'pregunta', escala: 0.8 }] },
    ],
  },
  'me-n2-B': {
    alt: 'Isabela, con la cara roja de pena, habla frente a todo el salón.',
    lugar: 'salon',
    personajes: [
      { rol: 'nino', x: 55, y: 205, escala: 0.8, emocion: 'neutral', camiseta: 4, pelo: 2, piel: 1 },
      { rol: 'nina', x: 345, y: 205, escala: 0.8, emocion: 'neutral', camiseta: 0, pelo: 0, piel: 3 },
      { rol: 'nina', x: 200, y: 200, escala: 1.15, emocion: 'avergonzado', rubor: true, camiseta: 1, pelo: 1 },
    ],
  },
  'me-n3-A': {
    alt: 'Tomás sale feliz del examen y su papá dice que fue pan comido.',
    lugar: 'interior', ventana: false,
    personajes: [
      { rol: 'nino', x: 140, emocion: 'feliz', camiseta: 3, pelo: 2, piel: 2 },
      { rol: 'adulto', x: 270, emocion: 'feliz', camiseta: 0, pelo: 1, piel: 1 },
    ],
    objetos: [{ tipo: 'examen', x: 178, y: 176 }],
    globos: [{ tipo: 'habla', x: 340, y: 46, w: 66, h: 50, hacia: { x: 298, y: 72 }, contenido: [{ icono: 'pulgar', escala: 0.9 }] }],
  },
  'me-n3-B': {
    alt: 'Tomás estrena su bicicleta nueva, que costó muchísimo dinero.',
    lugar: 'exterior', clima: 'sol',
    personajes: [{ rol: 'nino', x: 150, emocion: 'feliz', camiseta: 0, pelo: 2, piel: 2 }],
    objetos: [{ tipo: 'bicicleta', x: 268, y: 190 }],
    globos: [{ tipo: 'piensa', x: 78, y: 56, w: 84, h: 60, hacia: { x: 128, y: 86 }, contenido: [{ icono: 'billetes', escala: 0.9 }] }],
  },
};