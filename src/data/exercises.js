// Banco de ejercicios del prototipo.
// Reglas: nivel 1 = 2 opciones, nivel 2 = 3, nivel 3 = 4. Cada nivel tiene versión A y B.
const opts = (...texts) => texts.map((text, i) => ({ id: 'abcd'[i], text }));
const make = (data) => ({ status: 'aprobado', source: 'manual', clues: [], ...data });

export const EXERCISES = [
  // ---------- FALSAS CREENCIAS ----------
  make({
    id: 'fc-n1-A', category: 'falsa_creencia', level: 1, version: 'A',
    story: 'Sofía guarda su pelota en la caja roja y sale al patio. Mientras ella no está, Mateo cambia la pelota a la caja azul. Sofía vuelve a buscar su pelota.',
    question: '¿Dónde va a buscar la pelota Sofía?',
    options: opts('En la caja roja', 'En la caja azul'), correct: 'a',
    explanation: 'Sofía no vio que Mateo cambió la pelota. Ella cree que sigue en la caja roja, aunque en realidad esté en la azul.',
  }),
  make({
    id: 'fc-n1-B', category: 'falsa_creencia', level: 1, version: 'B',
    story: 'Samuel deja sus galletas sobre la mesa y sale a ponerse los zapatos. Su hermana guarda las galletas en el armario. Samuel regresa con hambre.',
    question: '¿Dónde va a buscar las galletas Samuel?',
    options: opts('En el armario', 'Sobre la mesa'), correct: 'b',
    explanation: 'Samuel no vio que su hermana las guardó. Él cree que siguen sobre la mesa.',
  }),
  make({
    id: 'fc-n2-A', category: 'falsa_creencia', level: 2, version: 'A',
    story: 'Valentina deja su mochila debajo de su silla y sale al recreo. La profe guarda la mochila en el casillero. Valentina vuelve al salón.',
    question: '¿Dónde piensa Valentina que está su mochila?',
    options: opts('En el casillero', 'Debajo de su silla', 'En el patio'), correct: 'b',
    explanation: 'Valentina no vio a la profe mover la mochila. Piensa que sigue donde la dejó, aunque ahora esté en el casillero.',
  }),
  make({
    id: 'fc-n2-B', category: 'falsa_creencia', level: 2, version: 'B',
    story: 'Tomás guarda su carro de juguete en la caja de juguetes y se va a bañar. Su prima saca el carro y lo deja sobre la cama. Tomás entra al cuarto.',
    question: '¿Dónde cree Tomás que está su carro?',
    options: opts('Sobre la cama', 'Debajo de la mesa', 'En la caja de juguetes'), correct: 'c',
    explanation: 'Tomás no vio que su prima movió el carro. Cree que sigue en la caja, aunque esté sobre la cama.',
  }),
  make({
    id: 'fc-n3-A', category: 'falsa_creencia', level: 3, version: 'A',
    story: 'Ana y Pablo ven que la abuela esconde una sorpresa en el armario. Pablo sale del cuarto. Entonces Ana ve que la abuela cambia la sorpresa a la cama. Pablo mira por la ventana y lo ve todo, pero Ana no se da cuenta de que Pablo vio.',
    question: '¿Dónde cree Ana que Pablo va a buscar la sorpresa?',
    options: opts('En el armario', 'En la cama', 'En la cocina', 'Debajo de la mesa'), correct: 'a',
    explanation: 'Ana no sabe que Pablo vio el cambio. Ella cree que Pablo piensa que la sorpresa sigue en el armario.',
  }),
  make({
    id: 'fc-n3-B', category: 'falsa_creencia', level: 3, version: 'B',
    story: 'Luisa y Camilo ven que mamá guarda las llaves en el cajón. Camilo sale al patio. Luisa ve que mamá mueve las llaves a la bolsa. Camilo, desde el patio, lo ve todo por la ventana, pero Luisa no lo sabe.',
    question: '¿Dónde cree Luisa que Camilo va a buscar las llaves?',
    options: opts('En la bolsa', 'En el carro', 'Sobre el sofá', 'En el cajón'), correct: 'd',
    explanation: 'Luisa no sabe que Camilo vio el cambio. Ella cree que Camilo piensa que las llaves siguen en el cajón.',
  }),

  // ---------- TOMA DE PERSPECTIVA ----------
  make({
    id: 'pe-n1-A', category: 'perspectiva', level: 1, version: 'A',
    story: 'A Ana no la invitaron al cumpleaños de su mejor amiga. Ana se queda en casa.',
    question: '¿Cómo se siente Ana?',
    options: opts('Triste', 'Feliz'), correct: 'a',
    explanation: 'Ana quería ir y no pudo. Cuando no nos invitan a algo que queremos, solemos sentirnos tristes.',
  }),
  make({
    id: 'pe-n1-B', category: 'perspectiva', level: 1, version: 'B',
    story: 'Mateo se ganó un premio en el colegio. Sus papás lo abrazan y le dicen que están muy orgullosos.',
    question: '¿Cómo se siente Mateo?',
    options: opts('Asustado', 'Contento'), correct: 'b',
    explanation: 'Mateo logró algo importante y sus papás lo celebran. Por eso se siente contento y orgulloso.',
  }),
  make({
    id: 'pe-n2-A', category: 'perspectiva', level: 2, version: 'A',
    story: 'Sofía quería un helado de fresa. En la tienda solo quedaba de limón, y a ella no le gusta el limón.',
    question: '¿Cómo se siente Sofía?',
    options: opts('Muy feliz', 'Desilusionada', 'Asustada'), correct: 'b',
    explanation: 'Sofía esperaba algo que quería y no lo consiguió. Esa sensación se llama desilusión.',
  }),
  make({
    id: 'pe-n2-B', category: 'perspectiva', level: 2, version: 'B',
    story: 'Samuel esperaba ir al parque con su papá. Pero su papá dijo que estaba muy cansado y que no podían ir.',
    question: '¿Cómo se siente Samuel?',
    options: opts('Desilusionado', 'Sorprendido y feliz', 'Con mucha emoción'), correct: 'a',
    explanation: 'Samuel esperaba algo que quería y no pasó. Por eso se siente desilusionado.',
  }),
  make({
    id: 'pe-n3-A', category: 'perspectiva', level: 3, version: 'A',
    story: 'Valentina le regaló a su amigo Tomás un libro de dinosaurios. Tomás ya tenía ese libro, pero sonrió y dijo: «Gracias».',
    question: '¿Por qué sonrió Tomás?',
    options: opts(
      'Porque no le importa el regalo',
      'Porque no quiere que Valentina se sienta mal',
      'Porque el libro era nuevo para él',
      'Porque quiere otro libro igual'
    ), correct: 'b',
    explanation: 'Tomás pensó en los sentimientos de Valentina. Quiso agradecer su intención para que ella no se sintiera mal.',
  }),
  make({
    id: 'pe-n3-B', category: 'perspectiva', level: 3, version: 'B',
    story: 'Camilo se cayó en el recreo y varios niños se rieron. Luisa no se rio y le ayudó a levantarse.',
    question: '¿Por qué crees que Luisa no se rio?',
    options: opts(
      'Porque no vio nada',
      'Porque pensó que Camilo podía sentirse avergonzado o con dolor',
      'Porque le gusta caerse',
      'Porque estaba enojada con todos'
    ), correct: 'b',
    explanation: 'Luisa se puso en el lugar de Camilo. Pensó que él podía sentirse mal y prefirió ayudarlo.',
  }),

  // ---------- SARCASMO ----------
  make({
    id: 'sa-n1-A', category: 'sarcasmo', level: 1, version: 'A',
    story: 'Está lloviendo muy fuerte y Juan quería ir al parque. Juan mira por la ventana, hace cara de enojo y dice: «¡Qué día tan bonito!».',
    question: '¿Qué quiso decir Juan?',
    options: opts('Que el día está feo y no le gusta', 'Que el día está bonito'), correct: 'a',
    explanation: 'Juan dijo lo contrario de lo que piensa. A esto se le llama sarcasmo.',
    clues: ['Está lloviendo y él quería ir al parque', 'Tiene cara de enojo', 'Lo dijo con tono molesto'],
  }),
  make({
    id: 'sa-n1-B', category: 'sarcasmo', level: 1, version: 'B',
    story: 'Laura derrama la sopa sobre la mesa. Su hermano mira el desorden y dice con tono burlón: «¡Qué buen trabajo, Laura!».',
    question: '¿Qué quiso decir el hermano?',
    options: opts('Que Laura hizo bien su trabajo', 'Que a Laura no le salió bien'), correct: 'b',
    explanation: 'El hermano dijo lo contrario de lo que piensa. Lo sabemos por el desorden y por su tono burlón.',
    clues: ['La sopa quedó regada', 'Usó un tono burlón'],
  }),
  make({
    id: 'sa-n2-A', category: 'sarcasmo', level: 2, version: 'A',
    story: 'Nicolás esperó el bus durante una hora bajo el sol. Cuando por fin llegó, suspiró y dijo: «¡Qué rápido llegó el bus!».',
    question: '¿Qué quiso decir Nicolás?',
    options: opts('Que el bus llegó muy rápido', 'Que el bus se demoró mucho', 'Que quiere seguir esperando'), correct: 'b',
    explanation: 'Nicolás esperó una hora. Dijo lo contrario de lo que piensa para mostrar que se cansó de esperar.',
    clues: ['Esperó una hora', 'Suspiró al hablar'],
  }),
  make({
    id: 'sa-n2-B', category: 'sarcasmo', level: 2, version: 'B',
    story: 'Isabela dibujó un perro con mucho cuidado, pero le quedó torcido. Su amigo mira el dibujo, levanta las cejas y dice: «Sí, igualito a una foto».',
    question: '¿Qué quiso decir su amigo?',
    options: opts(
      'Que el dibujo es igual a una foto',
      'Que el dibujo no se parece mucho a un perro de verdad',
      'Que quiere tomar una foto'
    ), correct: 'b',
    explanation: 'Un dibujo no es una foto. Su amigo dijo algo que no es cierto para señalar, de forma burlona, que el dibujo quedó torcido.',
    clues: ['Levantó las cejas', 'Un dibujo torcido no se parece a una foto'],
  }),
  make({
    id: 'sa-n3-A', category: 'sarcasmo', level: 3, version: 'A',
    story: 'La profe pide silencio por tercera vez, pero un niño sigue hablando fuerte. La profe lo mira y dice con voz calmada: «Gracias por ayudarnos a practicar la paciencia».',
    question: '¿Qué quiere decir la profe?',
    options: opts(
      'Que le gusta que él hable fuerte',
      'Que él está ayudando a la clase',
      'Que quiere que deje de hablar, aunque no lo dice directamente',
      'Que quiere que hable más fuerte'
    ), correct: 'c',
    explanation: 'La profe ya pidió silencio tres veces. Usó una frase amable para decir, de forma indirecta, que necesita que él se calle.',
    clues: ['Ya pidió silencio tres veces', 'Habló con voz calmada pero lo miró fijamente'],
  }),
  make({
    id: 'sa-n3-B', category: 'sarcasmo', level: 3, version: 'B',
    story: 'Daniela llega tarde a la fiesta de su amiga por tercera vez. Su amiga abre la puerta y dice: «¡Qué sorpresa, llegaste justo a tiempo!».',
    question: '¿Qué piensa realmente la amiga?',
    options: opts(
      'Que Daniela llegó a la hora exacta',
      'Que Daniela llegó tarde otra vez',
      'Que quiere que Daniela se vaya',
      'Que está muy contenta de esperar'
    ), correct: 'b',
    explanation: 'Daniela ya llegó tarde otras veces. Su amiga dijo lo contrario de lo que piensa para señalar que volvió a llegar tarde.',
    clues: ['Es la tercera vez que llega tarde', 'La fiesta ya empezó'],
  }),

  // ---------- METÁFORAS Y EXPRESIONES ----------
  make({
    id: 'me-n1-A', category: 'metafora', level: 1, version: 'A',
    story: 'Mañana es el primer día de colegio. Sofía le dice a su mamá: «¡Tengo mariposas en el estómago!».',
    question: '¿Qué quiere decir Sofía?',
    options: opts('Que tiene mariposas de verdad en la barriga', 'Que está nerviosa o emocionada'), correct: 'b',
    explanation: 'Es una forma de hablar. Cuando estamos nerviosos o emocionados, sentimos cosquillas en la barriga, como si hubiera mariposas.',
  }),
  make({
    id: 'me-n1-B', category: 'metafora', level: 1, version: 'B',
    story: 'La abuela dice: «Camilo tiene un corazón de oro».',
    question: '¿Qué quiere decir la abuela?',
    options: opts('Que Camilo tiene un corazón hecho de oro', 'Que Camilo es muy bondadoso'), correct: 'b',
    explanation: 'El oro es valioso. Decir que alguien tiene un corazón de oro significa que es muy bueno y generoso.',
  }),
  make({
    id: 'me-n2-A', category: 'metafora', level: 2, version: 'A',
    story: 'En clase, la profe le hace una pregunta a Daniel, pero él mira por la ventana sin escuchar. Su compañero dice: «Daniel está en las nubes».',
    question: '¿Qué quiso decir el compañero?',
    options: opts(
      'Que Daniel está volando',
      'Que Daniel está distraído, pensando en otra cosa',
      'Que Daniel quiere salir al patio'
    ), correct: 'b',
    explanation: 'Estar en las nubes significa estar distraído. Daniel no está escuchando porque su mente está en otro lado.',
  }),
  make({
    id: 'me-n2-B', category: 'metafora', level: 2, version: 'B',
    story: 'A Isabela le dio mucha pena hablar frente a todo el salón y se le puso la cara como un tomate.',
    question: '¿Qué quiere decir «se le puso la cara como un tomate»?',
    options: opts(
      'Que se convirtió en un tomate',
      'Que se puso roja por la pena',
      'Que tiene hambre de tomate'
    ), correct: 'b',
    explanation: 'Los tomates son rojos. Cuando sentimos pena, la cara se pone roja, y por eso se usa esta comparación.',
  }),
  make({
    id: 'me-n3-A', category: 'metafora', level: 3, version: 'A',
    story: 'Después del examen, papá dice: «Eso fue pan comido».',
    question: '¿Qué quiere decir papá?',
    options: opts(
      'Que el examen estaba hecho de pan',
      'Que papá comió pan durante el examen',
      'Que el examen fue muy difícil',
      'Que el examen fue muy fácil'
    ), correct: 'd',
    explanation: 'El pan se come sin esfuerzo. Decir que algo fue pan comido significa que fue muy fácil.',
  }),
  make({
    id: 'me-n3-B', category: 'metafora', level: 3, version: 'B',
    story: 'Tomás dice: «Esa bicicleta nueva me costó un ojo de la cara».',
    question: '¿Qué quiere decir Tomás?',
    options: opts(
      'Que perdió un ojo',
      'Que la bicicleta fue muy cara',
      'Que la bicicleta tiene ojos',
      'Que la bicicleta fue barata'
    ), correct: 'b',
    explanation: 'Un ojo vale muchísimo. Decir que algo costó un ojo de la cara significa que fue carísimo.',
  }),
];