// Contenido semilla de EduDer (5 niveles, 15 lecciones, 45 ejercicios, 12 medallas).
// Origen: frontend de referencia (js/content.js). Lo consume scripts/seed-contenido.js.
/*
 * EduDer — Contenido semilla (modo mock)
 * ---------------------------------------------------------------
 * Replica la estructura de las tablas NIVELES, LECCIONES, CONTENIDO_LECCION,
 * EJERCICIOS, PISTAS y MEDALLAS_CATALOGO del modelo relacional, para que el
 * frontend funcione sin backend. En modo 'api' este archivo no se usa: el
 * contenido llega desde GET /levels y GET /lessons/:id/content.
 *
 * Convención de respuesta_correcta (se compara normalizada en el backend,
 * exercise.service.js → normalizar()):
 *   seleccion_multiple → texto exacto de la opción correcta
 *   completar          → texto que va en el espacio "___"
 *   arrastrar          → piezas en orden, unidas con " | "
 *
 * Los campos `opciones` y `piezas` no existen aún en la tabla EJERCICIOS
 * (ver README → "Brechas del backend").
 */
(function () {
  'use strict';

  var SEP = ' | ';

  var NIVELES = [
    {
      id_nivel: 1, orden: 1, umbral_aprobacion: 70, estado: 'activo',
      nombre: 'Fundamentos Lógicos', descripcion: 'Proposiciones y conectivos',
      lecciones: [
        {
          id_leccion: 'n1-l1', orden: 1, tipo: 'teoria', xp_base: 50,
          titulo: '¿Qué es una proposición?',
          contenidos: [
            { tipo_bloque: 'texto', contenido: 'Una proposición es un enunciado declarativo que puede ser verdadero (V) o falso (F), pero no ambas cosas a la vez.' },
            { tipo_bloque: 'texto', contenido: 'Las preguntas, las órdenes y las exclamaciones no son proposiciones: no tiene sentido decir si "¿Qué hora es?" es verdadero o falso.' },
            { tipo_bloque: 'texto', contenido: 'Las proposiciones se representan con letras minúsculas: p, q, r. Por ejemplo, p: "Medellín está en Antioquia".' }
          ],
          ejercicios: [
            {
              id_ejercicio: 'n1-l1-e1', orden: 1, tipo_interaccion: 'seleccion_multiple',
              enunciado: '¿Cuál de los siguientes enunciados es una proposición?',
              opciones: ['¿Qué hora es?', 'Cierra la puerta.', 'Medellín está en Antioquia.', '¡Qué buen día!'],
              respuesta_correcta: 'Medellín está en Antioquia.',
              explicacion: 'Solo "Medellín está en Antioquia." es un enunciado declarativo al que se le puede asignar un valor de verdad. Las otras opciones son una pregunta, una orden y una exclamación.',
              pistas: ['Una proposición se puede calificar como verdadera o falsa.', 'Descarta las preguntas, las órdenes y las exclamaciones.']
            },
            {
              id_ejercicio: 'n1-l1-e2', orden: 2, tipo_interaccion: 'completar',
              enunciado: 'Una proposición es un enunciado que puede ser verdadero o ___, pero no ambos a la vez.',
              opciones: ['falso', 'dudoso', 'abierto', 'incierto'],
              respuesta_correcta: 'falso',
              explicacion: 'Por definición, una proposición tiene exactamente uno de dos valores de verdad: verdadero o falso.',
              pistas: ['Piensa en los dos valores de verdad posibles.', 'Es el opuesto de "verdadero".']
            },
            {
              id_ejercicio: 'n1-l1-e3', orden: 3, tipo_interaccion: 'seleccion_multiple',
              enunciado: '¿El enunciado "x + 3 = 7" es una proposición?',
              opciones: ['Sí, siempre es verdadero', 'Sí, siempre es falso', 'No, su valor depende de x', 'No, porque es una pregunta'],
              respuesta_correcta: 'No, su valor depende de x',
              explicacion: '"x + 3 = 7" es un enunciado abierto: es verdadero si x = 4 y falso en cualquier otro caso. Mientras x no tenga valor, no es una proposición.',
              pistas: ['¿Puedes decir si es verdadero sin conocer x?', 'Prueba con x = 4 y con x = 5.']
            }
          ]
        },
        {
          id_leccion: 'n1-l2', orden: 2, tipo: 'ejercicio', xp_base: 60,
          titulo: 'Conectivos lógicos',
          contenidos: [
            { tipo_bloque: 'texto', contenido: 'Los conectivos combinan proposiciones: negación ¬ ("no"), conjunción ∧ ("y"), disyunción ∨ ("o"), condicional → ("si… entonces") y bicondicional ↔ ("si y solo si").' },
            { tipo_bloque: 'texto', contenido: 'p ∧ q es verdadera solo si ambas lo son. p ∨ q es verdadera si al menos una lo es. p → q solo es falsa cuando p es verdadera y q es falsa.' }
          ],
          ejercicios: [
            {
              id_ejercicio: 'n1-l2-e1', orden: 1, tipo_interaccion: 'seleccion_multiple',
              enunciado: '¿Cómo se escribe simbólicamente "p y q"?',
              opciones: ['p ∨ q', 'p ∧ q', 'p → q', '¬p'],
              respuesta_correcta: 'p ∧ q',
              explicacion: 'La conjunción "y" se representa con ∧. El símbolo ∨ es la disyunción ("o").',
              pistas: ['La conjunción une dos proposiciones con "y".', 'Su símbolo parece una "A" sin la barra.']
            },
            {
              id_ejercicio: 'n1-l2-e2', orden: 2, tipo_interaccion: 'arrastrar',
              enunciado: 'Con p: "llueve" y q: "salgo", ordena las piezas para escribir "Si llueve, entonces no salgo".',
              piezas: ['¬', 'q', 'p', '→'],
              respuesta_correcta: ['p', '→', '¬', 'q'].join(SEP),
              explicacion: '"Si llueve" es el antecedente (p) y "no salgo" es el consecuente (¬q). Queda p → ¬q.',
              pistas: ['La estructura es: antecedente → consecuente.', 'El consecuente "no salgo" se escribe ¬q.']
            },
            {
              id_ejercicio: 'n1-l2-e3', orden: 3, tipo_interaccion: 'completar',
              enunciado: 'El conectivo ___ solo es falso cuando el antecedente es verdadero y el consecuente es falso.',
              opciones: ['condicional', 'conjunción', 'disyunción', 'bicondicional'],
              respuesta_correcta: 'condicional',
              explicacion: 'p → q es falsa únicamente en el caso p = V, q = F. Una promesa solo se rompe si se cumple la condición y no el resultado.',
              pistas: ['Habla de "antecedente" y "consecuente".', 'Es el conectivo "si… entonces".']
            }
          ]
        },
        {
          id_leccion: 'n1-l3', orden: 3, tipo: 'mini_juego', xp_base: 70,
          titulo: 'Reto: valores de verdad',
          contenidos: [
            { tipo_bloque: 'texto', contenido: 'La negación cambia el valor de verdad: si p es V, ¬p es F. Para negar "todos…" basta con "al menos uno no…".' },
            { tipo_bloque: 'texto', contenido: 'Al final de esta lección te espera un mini-juego contrarreloj. ¡Responde rápido!' }
          ],
          ejercicios: [
            {
              id_ejercicio: 'n1-l3-e1', orden: 1, tipo_interaccion: 'seleccion_multiple',
              enunciado: '¿Cuál es la negación de "Todos los estudiantes aprobaron"?',
              opciones: ['Ningún estudiante aprobó', 'Al menos un estudiante no aprobó', 'Todos los estudiantes reprobaron', 'Algunos estudiantes aprobaron'],
              respuesta_correcta: 'Al menos un estudiante no aprobó',
              explicacion: 'Para que "todos aprobaron" sea falso basta con que uno no haya aprobado. "Ningún estudiante aprobó" es más fuerte de lo necesario.',
              pistas: ['¿Qué necesitas para que "todos aprobaron" sea falso?', 'Basta con encontrar un caso que no cumpla.']
            },
            {
              id_ejercicio: 'n1-l3-e2', orden: 2, tipo_interaccion: 'completar',
              enunciado: 'Si p es verdadera, entonces ¬p es ___.',
              opciones: ['falsa', 'verdadera', 'indefinida'],
              respuesta_correcta: 'falsa',
              explicacion: 'La negación invierte el valor de verdad: V se convierte en F y F en V.',
              pistas: ['La negación cambia el valor.', 'Lo contrario de verdadera.']
            },
            {
              id_ejercicio: 'n1-l3-e3', orden: 3, tipo_interaccion: 'seleccion_multiple',
              enunciado: 'p: "2 es par" (V) y q: "5 > 8" (F). ¿Cuál es el valor de p ∧ q?',
              opciones: ['Verdadero', 'Falso'],
              respuesta_correcta: 'Falso',
              explicacion: 'La conjunción solo es verdadera si ambas proposiciones lo son. Como q es falsa, p ∧ q es falsa.',
              pistas: ['Revisa el valor de cada proposición.', '∧ necesita que ambas sean verdaderas.']
            }
          ],
          minijuego: {
            segundos: 45,
            items: [
              { texto: '"¿Vienes mañana?" es una proposición.', valor: false },
              { texto: '"7 es un número primo" es una proposición verdadera.', valor: true },
              { texto: 'p ∨ q es verdadera si al menos una es verdadera.', valor: true },
              { texto: 'p ∧ q es verdadera si solo p es verdadera.', valor: false },
              { texto: 'La negación de una proposición falsa es verdadera.', valor: true },
              { texto: '"x > 5" es una proposición.', valor: false }
            ]
          }
        }
      ]
    },
    {
      id_nivel: 2, orden: 2, umbral_aprobacion: 70, estado: 'activo',
      nombre: 'Tablas de Verdad', descripcion: 'Construcción e interpretación',
      lecciones: [
        {
          id_leccion: 'n2-l1', orden: 1, tipo: 'teoria', xp_base: 50,
          titulo: 'Construcción de tablas',
          contenidos: [
            { tipo_bloque: 'texto', contenido: 'Una tabla de verdad lista todas las combinaciones posibles de valores. Con n variables hay 2ⁿ filas: 2 variables → 4 filas, 3 variables → 8 filas.' },
            { tipo_bloque: 'texto', contenido: 'Orden habitual con p y q: VV, VF, FV, FF. Para p ∧ q la columna resultado es V, F, F, F; para p ∨ q es V, V, V, F; para p → q es V, F, V, V.' }
          ],
          ejercicios: [
            {
              id_ejercicio: 'n2-l1-e1', orden: 1, tipo_interaccion: 'completar',
              enunciado: 'Una tabla de verdad con 3 variables tiene ___ filas.',
              opciones: ['3', '6', '8', '9'],
              respuesta_correcta: '8',
              explicacion: 'El número de filas es 2ⁿ. Con n = 3: 2³ = 8.',
              pistas: ['Cada variable puede valer V o F.', 'Calcula 2 elevado al número de variables.']
            },
            {
              id_ejercicio: 'n2-l1-e2', orden: 2, tipo_interaccion: 'seleccion_multiple',
              enunciado: '¿En qué fila es falsa p → q?',
              opciones: ['p = V, q = V', 'p = V, q = F', 'p = F, q = V', 'p = F, q = F'],
              respuesta_correcta: 'p = V, q = F',
              explicacion: 'El condicional solo es falso cuando el antecedente es verdadero y el consecuente falso.',
              pistas: ['Piensa en una promesa incumplida.', 'El antecedente se cumple y el consecuente no.']
            },
            {
              id_ejercicio: 'n2-l1-e3', orden: 3, tipo_interaccion: 'arrastrar',
              enunciado: 'Completa la columna de p ∧ q en el orden VV, VF, FV, FF.',
              piezas: ['F', 'V', 'F', 'F'],
              respuesta_correcta: ['V', 'F', 'F', 'F'].join(SEP),
              explicacion: 'p ∧ q solo es verdadera en la primera fila (VV). En las demás al menos una es falsa.',
              pistas: ['¿En cuántas filas son verdaderas ambas?', 'Solo la fila VV da verdadero.']
            }
          ]
        },
        {
          id_leccion: 'n2-l2', orden: 2, tipo: 'caso_practico', xp_base: 60,
          titulo: 'Tautologías y contradicciones',
          contenidos: [
            { tipo_bloque: 'texto', contenido: 'Una tautología es verdadera en todas las filas (ej. p ∨ ¬p). Una contradicción es falsa en todas (ej. p ∧ ¬p). Si tiene filas V y F, es una contingencia.' },
            { tipo_bloque: 'texto', contenido: 'Caso práctico: los sistemas de control (alarmas, semáforos, validaciones de formularios) se diseñan con tablas de verdad para no olvidar ningún caso.' }
          ],
          ejercicios: [
            {
              id_ejercicio: 'n2-l2-e1', orden: 1, tipo_interaccion: 'seleccion_multiple',
              enunciado: 'La fórmula p ∨ ¬p es una:',
              opciones: ['Tautología', 'Contradicción', 'Contingencia'],
              respuesta_correcta: 'Tautología',
              explicacion: 'Siempre una de las dos (p o ¬p) es verdadera, así que la disyunción es verdadera en todas las filas.',
              pistas: ['Evalúa con p = V y con p = F.', 'En ambos casos, ¿qué resultado da?']
            },
            {
              id_ejercicio: 'n2-l2-e2', orden: 2, tipo_interaccion: 'seleccion_multiple',
              enunciado: 'La fórmula p ∧ ¬p es una:',
              opciones: ['Tautología', 'Contradicción', 'Contingencia'],
              respuesta_correcta: 'Contradicción',
              explicacion: 'p y ¬p nunca son verdaderas al mismo tiempo, así que la conjunción es falsa en todas las filas.',
              pistas: ['¿Pueden p y ¬p ser verdaderas a la vez?', 'Si nunca es verdadera, ¿cómo se llama?']
            },
            {
              id_ejercicio: 'n2-l2-e3', orden: 3, tipo_interaccion: 'completar',
              enunciado: 'Una alarma suena si la puerta está abierta (p) o hay movimiento (q). De los 4 casos posibles, la alarma suena en ___.',
              opciones: ['1', '2', '3', '4'],
              respuesta_correcta: '3',
              explicacion: 'La alarma sigue p ∨ q: es verdadera en VV, VF y FV. Solo no suena cuando la puerta está cerrada y no hay movimiento.',
              pistas: ['La condición es una disyunción.', 'p ∨ q es falsa en un solo caso.']
            }
          ]
        },
        {
          id_leccion: 'n2-l3', orden: 3, tipo: 'mini_juego', xp_base: 70,
          titulo: 'Reto de tablas',
          contenidos: [
            { tipo_bloque: 'texto', contenido: 'El bicondicional p ↔ q es verdadero cuando p y q tienen el mismo valor de verdad.' },
            { tipo_bloque: 'texto', contenido: 'Repasa los resultados de cada conectivo: al final hay un mini-juego contrarreloj.' }
          ],
          ejercicios: [
            {
              id_ejercicio: 'n2-l3-e1', orden: 1, tipo_interaccion: 'seleccion_multiple',
              enunciado: '¿Cuál es el valor de p → q si p = F y q = F?',
              opciones: ['Verdadero', 'Falso'],
              respuesta_correcta: 'Verdadero',
              explicacion: 'Si el antecedente es falso, el condicional es verdadero sin importar el consecuente.',
              pistas: ['¿Se incumplió alguna promesa?', 'Con antecedente falso, p → q siempre es V.']
            },
            {
              id_ejercicio: 'n2-l3-e2', orden: 2, tipo_interaccion: 'completar',
              enunciado: 'p ↔ q es verdadera cuando p y q tienen el ___ valor de verdad.',
              opciones: ['mismo', 'distinto', 'opuesto'],
              respuesta_correcta: 'mismo',
              explicacion: 'El bicondicional es V en VV y FF, es decir, cuando ambos valores coinciden.',
              pistas: ['Revisa las filas VV y FF.', '"Si y solo si" exige coincidencia.']
            },
            {
              id_ejercicio: 'n2-l3-e3', orden: 3, tipo_interaccion: 'seleccion_multiple',
              enunciado: '¿Cuál de estas fórmulas es una contingencia?',
              opciones: ['p → p', 'p ∧ ¬p', 'p ∨ q', 'p ∨ ¬p'],
              respuesta_correcta: 'p ∨ q',
              explicacion: 'p ∨ q es V en tres filas y F en una (FF), así que no es tautología ni contradicción. p → p y p ∨ ¬p son tautologías; p ∧ ¬p es contradicción.',
              pistas: ['Busca la que tenga resultados V y F.', 'Descarta las que siempre dan el mismo valor.']
            }
          ],
          minijuego: {
            segundos: 45,
            items: [
              { texto: 'Con 2 variables la tabla tiene 4 filas.', valor: true },
              { texto: 'p → q es falsa cuando p = F y q = V.', valor: false },
              { texto: 'p ∨ ¬p es una tautología.', valor: true },
              { texto: 'p ↔ q es verdadera si p = V y q = F.', valor: false },
              { texto: 'Con 4 variables la tabla tiene 16 filas.', valor: true },
              { texto: 'p ∧ q es verdadera en 2 de las 4 filas.', valor: false }
            ]
          }
        }
      ]
    },
    {
      id_nivel: 3, orden: 3, umbral_aprobacion: 70, estado: 'activo',
      nombre: 'Álgebra Booleana', descripcion: 'Leyes De Morgan y simplificación',
      lecciones: [
        {
          id_leccion: 'n3-l1', orden: 1, tipo: 'teoria', xp_base: 50,
          titulo: 'Propiedades del álgebra booleana',
          contenidos: [
            { tipo_bloque: 'texto', contenido: 'En álgebra booleana: + es OR, · es AND y A\' es NOT A. Los valores son 1 (verdadero) y 0 (falso).' },
            { tipo_bloque: 'texto', contenido: 'Identidad: A + 0 = A, A · 1 = A. Nulidad: A + 1 = 1, A · 0 = 0. Idempotencia: A + A = A. Complemento: A + A\' = 1, A · A\' = 0.' }
          ],
          ejercicios: [
            {
              id_ejercicio: 'n3-l1-e1', orden: 1, tipo_interaccion: 'seleccion_multiple',
              enunciado: '¿A qué es igual A + 1?',
              opciones: ['A', '1', '0', 'A\''],
              respuesta_correcta: '1',
              explicacion: 'Ley de nulidad: un OR con 1 siempre da 1, sin importar el valor de A.',
              pistas: ['Piensa en "A o verdadero".', 'Si uno de los términos es 1, el OR es 1.']
            },
            {
              id_ejercicio: 'n3-l1-e2', orden: 2, tipo_interaccion: 'completar',
              enunciado: 'A · A\' = ___',
              opciones: ['0', '1', 'A', 'A\''],
              respuesta_correcta: '0',
              explicacion: 'Ley del complemento: A y su negación nunca valen 1 a la vez, así que su AND es 0.',
              pistas: ['Es el equivalente de p ∧ ¬p.', 'Una contradicción siempre vale 0.']
            },
            {
              id_ejercicio: 'n3-l1-e3', orden: 3, tipo_interaccion: 'seleccion_multiple',
              enunciado: '¿A qué es igual A + A?',
              opciones: ['2A', 'A', '1', '0'],
              respuesta_correcta: 'A',
              explicacion: 'Ley de idempotencia: A OR A es simplemente A. En álgebra booleana no existe "2A".',
              pistas: ['Recuerda que + significa OR, no suma.', 'Evalúa con A = 0 y A = 1.']
            }
          ]
        },
        {
          id_leccion: 'n3-l2', orden: 2, tipo: 'ejercicio', xp_base: 60,
          titulo: 'Leyes de De Morgan',
          contenidos: [
            { tipo_bloque: 'texto', contenido: 'Leyes de De Morgan: (A · B)\' = A\' + B\' y (A + B)\' = A\' · B\'. Al negar, el AND se vuelve OR y el OR se vuelve AND.' },
            { tipo_bloque: 'texto', contenido: 'En lógica proposicional: ¬(p ∧ q) ≡ ¬p ∨ ¬q y ¬(p ∨ q) ≡ ¬p ∧ ¬q.' }
          ],
          ejercicios: [
            {
              id_ejercicio: 'n3-l2-e1', orden: 1, tipo_interaccion: 'seleccion_multiple',
              enunciado: '¿A qué equivale (A · B)\'?',
              opciones: ['A\' · B\'', 'A\' + B\'', 'A + B', '(A + B)\''],
              respuesta_correcta: 'A\' + B\'',
              explicacion: 'Por De Morgan, negar un AND da el OR de las negaciones: (A · B)\' = A\' + B\'.',
              pistas: ['La negación "entra" y cambia el operador.', 'El · se convierte en +.']
            },
            {
              id_ejercicio: 'n3-l2-e2', orden: 2, tipo_interaccion: 'arrastrar',
              enunciado: 'Ordena los pasos para simplificar A · B + A · B\'.',
              piezas: ['A · 1', 'A', 'A · (B + B\')'],
              respuesta_correcta: ['A · (B + B\')', 'A · 1', 'A'].join(SEP),
              explicacion: 'Se factoriza A: A · (B + B\'). Por complemento, B + B\' = 1, queda A · 1, y por identidad, A.',
              pistas: ['Empieza sacando factor común.', 'B + B\' vale 1.']
            },
            {
              id_ejercicio: 'n3-l2-e3', orden: 3, tipo_interaccion: 'completar',
              enunciado: 'Por De Morgan, (A + B)\' = A\' ___ B\'.',
              opciones: ['·', '+'],
              respuesta_correcta: '·',
              explicacion: 'Negar un OR da el AND de las negaciones: (A + B)\' = A\' · B\'.',
              pistas: ['El operador se invierte.', 'El + se convierte en ·.']
            }
          ]
        },
        {
          id_leccion: 'n3-l3', orden: 3, tipo: 'mini_juego', xp_base: 70,
          titulo: 'Reto de simplificación',
          contenidos: [
            { tipo_bloque: 'texto', contenido: 'Absorción: A + A · B = A y A · (A + B) = A. Doble negación: (A\')\' = A.' },
            { tipo_bloque: 'texto', contenido: 'Simplificar circuitos ahorra compuertas lógicas. Al final te espera el mini-juego.' }
          ],
          ejercicios: [
            {
              id_ejercicio: 'n3-l3-e1', orden: 1, tipo_interaccion: 'seleccion_multiple',
              enunciado: 'Simplifica A + A · B.',
              opciones: ['A', 'B', 'A · B', '1'],
              respuesta_correcta: 'A',
              explicacion: 'Ley de absorción: si A = 1 el resultado es 1; si A = 0, A · B también es 0. El resultado siempre coincide con A.',
              pistas: ['Factoriza A: A · (1 + B).', '1 + B vale 1.']
            },
            {
              id_ejercicio: 'n3-l3-e2', orden: 2, tipo_interaccion: 'seleccion_multiple',
              enunciado: 'Simplifica (A\')\'.',
              opciones: ['A\'', 'A', '0', '1'],
              respuesta_correcta: 'A',
              explicacion: 'Doble negación: negar dos veces devuelve el valor original.',
              pistas: ['Niega A dos veces.', '"No es cierto que no" equivale a "sí".']
            },
            {
              id_ejercicio: 'n3-l3-e3', orden: 3, tipo_interaccion: 'completar',
              enunciado: 'A · (A + B) = ___',
              opciones: ['A', 'B', 'A · B', '1'],
              respuesta_correcta: 'A',
              explicacion: 'Absorción: A · (A + B) = A · A + A · B = A + A · B = A.',
              pistas: ['Distribuye A.', 'Luego aplica absorción.']
            }
          ],
          minijuego: {
            segundos: 45,
            items: [
              { texto: 'A + 0 = A', valor: true },
              { texto: 'A · 1 = 1', valor: false },
              { texto: '(A + B)\' = A\' · B\'', valor: true },
              { texto: 'A + A\' = 0', valor: false },
              { texto: 'A · A = A', valor: true },
              { texto: '(A · B)\' = A\' · B\'', valor: false }
            ]
          }
        }
      ]
    },
    {
      id_nivel: 4, orden: 4, umbral_aprobacion: 70, estado: 'activo',
      nombre: 'Métodos de Demostración', descripcion: 'Directa, contradicción, inducción',
      lecciones: [
        {
          id_leccion: 'n4-l1', orden: 1, tipo: 'teoria', xp_base: 60,
          titulo: 'Demostración directa',
          contenidos: [
            { tipo_bloque: 'texto', contenido: 'Para demostrar p → q de forma directa: se supone que p es verdadera y, con definiciones y propiedades conocidas, se deduce q.' },
            { tipo_bloque: 'texto', contenido: 'Ejemplo: si n es par, n = 2k. Entonces n² = 4k² = 2(2k²), que es par.' }
          ],
          ejercicios: [
            {
              id_ejercicio: 'n4-l1-e1', orden: 1, tipo_interaccion: 'arrastrar',
              enunciado: 'Ordena los pasos para demostrar: "si n es par, entonces n² es par".',
              piezas: ['Luego n² = 4k² = 2(2k²)', 'Supongamos que n es par', 'Por lo tanto n² es par', 'Entonces n = 2k para algún entero k'],
              respuesta_correcta: ['Supongamos que n es par', 'Entonces n = 2k para algún entero k', 'Luego n² = 4k² = 2(2k²)', 'Por lo tanto n² es par'].join(SEP),
              explicacion: 'Se parte de la hipótesis, se aplica la definición de número par, se opera y se concluye.',
              pistas: ['El primer paso siempre es suponer la hipótesis.', 'Antes de operar, aplica la definición de par.']
            },
            {
              id_ejercicio: 'n4-l1-e2', orden: 2, tipo_interaccion: 'seleccion_multiple',
              enunciado: 'En una demostración directa de p → q:',
              opciones: ['Se supone q y se deduce p', 'Se supone p y se deduce q', 'Se supone ¬q y se llega a un absurdo', 'Se prueba un caso particular'],
              respuesta_correcta: 'Se supone p y se deduce q',
              explicacion: 'La demostración directa avanza desde la hipótesis (p) hasta la conclusión (q).',
              pistas: ['"Directa" significa en el mismo sentido de la flecha.', 'Parte del antecedente.']
            },
            {
              id_ejercicio: 'n4-l1-e3', orden: 3, tipo_interaccion: 'completar',
              enunciado: 'Todo número impar se puede escribir como 2k + ___, con k entero.',
              opciones: ['0', '1', '2', 'k'],
              respuesta_correcta: '1',
              explicacion: 'Un impar es un par más uno: 2k + 1. Por ejemplo, 7 = 2·3 + 1.',
              pistas: ['Prueba con 7.', 'Un impar es un par más algo.']
            }
          ]
        },
        {
          id_leccion: 'n4-l2', orden: 2, tipo: 'caso_practico', xp_base: 70,
          titulo: 'Contradicción y contraejemplo',
          contenidos: [
            { tipo_bloque: 'texto', contenido: 'Por contradicción: se supone que la conclusión es falsa y se llega a un absurdo. Así se demuestra, por ejemplo, que √2 es irracional.' },
            { tipo_bloque: 'texto', contenido: 'Un contraejemplo basta para refutar una afirmación universal. La contrapositiva de p → q es ¬q → ¬p y es equivalente a la original.' }
          ],
          ejercicios: [
            {
              id_ejercicio: 'n4-l2-e1', orden: 1, tipo_interaccion: 'seleccion_multiple',
              enunciado: 'Para demostrar por contradicción que √2 es irracional, se empieza suponiendo que:',
              opciones: ['√2 es irracional', '√2 es racional', '√2 es entero', '√2 es negativo'],
              respuesta_correcta: '√2 es racional',
              explicacion: 'Se supone lo contrario de lo que se quiere probar (que √2 = a/b) y se llega a que a y b son ambos pares, lo cual es absurdo.',
              pistas: ['Se supone lo contrario de la conclusión.', '¿Qué es lo opuesto de "irracional"?']
            },
            {
              id_ejercicio: 'n4-l2-e2', orden: 2, tipo_interaccion: 'seleccion_multiple',
              enunciado: '¿Cuál es un contraejemplo de "todo número primo es impar"?',
              opciones: ['3', '9', '2', '15'],
              respuesta_correcta: '2',
              explicacion: '2 es primo y es par, así que refuta la afirmación. 9 y 15 son impares pero no primos.',
              pistas: ['Necesitas un número primo que NO sea impar.', 'Es el primo más pequeño.']
            },
            {
              id_ejercicio: 'n4-l2-e3', orden: 3, tipo_interaccion: 'seleccion_multiple',
              enunciado: '¿Cuál es la contrapositiva de p → q?',
              opciones: ['q → p', '¬p → ¬q', '¬q → ¬p', 'p ∧ ¬q'],
              respuesta_correcta: '¬q → ¬p',
              explicacion: 'La contrapositiva invierte y niega: ¬q → ¬p. q → p es la recíproca y ¬p → ¬q es la inversa; ninguna de las dos es equivalente a p → q.',
              pistas: ['Se invierten y se niegan ambos lados.', 'Empieza por ¬q.']
            }
          ]
        },
        {
          id_leccion: 'n4-l3', orden: 3, tipo: 'mini_juego', xp_base: 80,
          titulo: 'Inducción matemática',
          contenidos: [
            { tipo_bloque: 'texto', contenido: 'Inducción: (1) se verifica el caso base P(1); (2) se supone P(k) verdadera (hipótesis inductiva); (3) se demuestra P(k + 1). Entonces P(n) vale para todo n ≥ 1.' },
            { tipo_bloque: 'texto', contenido: 'Ejemplo clásico: 1 + 2 + … + n = n(n + 1)/2.' }
          ],
          ejercicios: [
            {
              id_ejercicio: 'n4-l3-e1', orden: 1, tipo_interaccion: 'arrastrar',
              enunciado: 'Ordena las etapas de una demostración por inducción.',
              piezas: ['Demostrar que P(k + 1) es verdadera', 'Concluir que P(n) vale para todo n ≥ 1', 'Verificar el caso base P(1)', 'Suponer que P(k) es verdadera'],
              respuesta_correcta: ['Verificar el caso base P(1)', 'Suponer que P(k) es verdadera', 'Demostrar que P(k + 1) es verdadera', 'Concluir que P(n) vale para todo n ≥ 1'].join(SEP),
              explicacion: 'Primero el caso base, luego la hipótesis inductiva, después el paso inductivo y al final la conclusión.',
              pistas: ['Todo empieza en el caso base.', 'La hipótesis se usa para probar k + 1.']
            },
            {
              id_ejercicio: 'n4-l3-e2', orden: 2, tipo_interaccion: 'completar',
              enunciado: '1 + 2 + … + n = n(n + 1) / ___',
              opciones: ['2', '3', '4', 'n'],
              respuesta_correcta: '2',
              explicacion: 'Con n = 3: 1 + 2 + 3 = 6 y 3·4/2 = 6. La fórmula es n(n + 1)/2.',
              pistas: ['Prueba con n = 3.', '1 + 2 + 3 = 6.']
            },
            {
              id_ejercicio: 'n4-l3-e3', orden: 3, tipo_interaccion: 'seleccion_multiple',
              enunciado: '¿Cuál es la hipótesis inductiva?',
              opciones: ['Verificar P(1)', 'Suponer que P(k) es verdadera', 'Demostrar P(k + 1)', 'Probar un contraejemplo'],
              respuesta_correcta: 'Suponer que P(k) es verdadera',
              explicacion: 'La hipótesis inductiva es suponer que la propiedad vale para un k cualquiera; con ella se prueba k + 1.',
              pistas: ['Es lo que se "supone", no lo que se demuestra.', 'Involucra a k.']
            }
          ],
          minijuego: {
            segundos: 45,
            items: [
              { texto: 'Un contraejemplo basta para refutar una afirmación universal.', valor: true },
              { texto: 'La contrapositiva de p → q es q → p.', valor: false },
              { texto: 'En inducción, el caso base suele ser n = 1.', valor: true },
              { texto: 'Probar un caso particular demuestra una afirmación universal.', valor: false },
              { texto: 'p → q es equivalente a ¬q → ¬p.', valor: true },
              { texto: 'En una prueba por contradicción se supone la conclusión verdadera.', valor: false }
            ]
          }
        }
      ]
    },
    {
      id_nivel: 5, orden: 5, umbral_aprobacion: 70, estado: 'activo',
      nombre: 'Razonamiento Aplicado', descripcion: 'Lógica de predicados y programación',
      lecciones: [
        {
          id_leccion: 'n5-l1', orden: 1, tipo: 'teoria', xp_base: 60,
          titulo: 'Cuantificadores',
          contenidos: [
            { tipo_bloque: 'texto', contenido: '∀ se lee "para todo" y ∃ se lee "existe". ∀x P(x) afirma que todos cumplen P; ∃x P(x) afirma que al menos uno la cumple.' },
            { tipo_bloque: 'texto', contenido: 'Negación: ¬∀x P(x) ≡ ∃x ¬P(x) y ¬∃x P(x) ≡ ∀x ¬P(x).' }
          ],
          ejercicios: [
            {
              id_ejercicio: 'n5-l1-e1', orden: 1, tipo_interaccion: 'seleccion_multiple',
              enunciado: '"Existe un número natural mayor que 100" se escribe:',
              opciones: ['∀x (x > 100)', '∃x (x > 100)', '∀x ¬(x > 100)', '¬∃x (x > 100)'],
              respuesta_correcta: '∃x (x > 100)',
              explicacion: '"Existe" corresponde al cuantificador existencial ∃.',
              pistas: ['¿"Para todo" o "existe"?', 'El símbolo es una E invertida.']
            },
            {
              id_ejercicio: 'n5-l1-e2', orden: 2, tipo_interaccion: 'seleccion_multiple',
              enunciado: '¿Cuál es la negación de ∀x P(x)?',
              opciones: ['∀x ¬P(x)', '∃x ¬P(x)', '∃x P(x)', '¬P(x)'],
              respuesta_correcta: '∃x ¬P(x)',
              explicacion: 'Que no todos cumplan P significa que existe al menos uno que no la cumple.',
              pistas: ['La negación cambia ∀ por ∃.', 'Y la negación pasa a P(x).']
            },
            {
              id_ejercicio: 'n5-l1-e3', orden: 3, tipo_interaccion: 'completar',
              enunciado: 'El símbolo ___ se lee "para todo".',
              opciones: ['∀', '∃', '¬', '→'],
              respuesta_correcta: '∀',
              explicacion: '∀ es el cuantificador universal; viene de una A invertida ("All").',
              pistas: ['Es una A invertida.', 'Es el cuantificador universal.']
            }
          ]
        },
        {
          id_leccion: 'n5-l2', orden: 2, tipo: 'caso_practico', xp_base: 70,
          titulo: 'Lógica en programación',
          contenidos: [
            { tipo_bloque: 'texto', contenido: 'En JavaScript y en muchos lenguajes: && es AND, || es OR y ! es NOT. Las condiciones de un if son proposiciones.' },
            { tipo_bloque: 'texto', contenido: 'De Morgan también aplica al código: !(a && b) equivale a !a || !b. Así se simplifican validaciones complejas.' }
          ],
          ejercicios: [
            {
              id_ejercicio: 'n5-l2-e1', orden: 1, tipo_interaccion: 'seleccion_multiple',
              enunciado: '¿Qué valor tiene true && false?',
              opciones: ['true', 'false'],
              respuesta_correcta: 'false',
              explicacion: '&& es una conjunción: solo es true si ambos operandos lo son.',
              pistas: ['&& equivale a ∧.', 'Uno de los dos es false.']
            },
            {
              id_ejercicio: 'n5-l2-e2', orden: 2, tipo_interaccion: 'seleccion_multiple',
              enunciado: '¿A qué equivale !(a && b)?',
              opciones: ['!a && !b', '!a || !b', 'a || b', '!(a || b)'],
              respuesta_correcta: '!a || !b',
              explicacion: 'Por De Morgan, la negación de un AND es el OR de las negaciones.',
              pistas: ['Aplica De Morgan.', 'El && se convierte en ||.']
            },
            {
              id_ejercicio: 'n5-l2-e3', orden: 3, tipo_interaccion: 'completar',
              enunciado: 'La condición edad >= 18 ___ tieneCedula exige que se cumplan ambas.',
              opciones: ['&&', '||', '!'],
              respuesta_correcta: '&&',
              explicacion: 'Para exigir ambas condiciones se usa la conjunción &&.',
              pistas: ['"Ambas" indica conjunción.', 'Es el AND de JavaScript.']
            }
          ]
        },
        {
          id_leccion: 'n5-l3', orden: 3, tipo: 'mini_juego', xp_base: 80,
          titulo: 'Reto final de razonamiento',
          contenidos: [
            { tipo_bloque: 'texto', contenido: 'Modus ponens: de p → q y p se concluye q. Modus tollens: de p → q y ¬q se concluye ¬p.' },
            { tipo_bloque: 'texto', contenido: 'Un silogismo parte de una premisa general, aplica una particular y obtiene una conclusión. ¡Último mini-juego del curso!' }
          ],
          ejercicios: [
            {
              id_ejercicio: 'n5-l3-e1', orden: 1, tipo_interaccion: 'arrastrar',
              enunciado: 'Ordena el silogismo.',
              piezas: ['Ana es ingeniera', 'Por lo tanto Ana sabe lógica', 'Todos los ingenieros saben lógica'],
              respuesta_correcta: ['Todos los ingenieros saben lógica', 'Ana es ingeniera', 'Por lo tanto Ana sabe lógica'].join(SEP),
              explicacion: 'Primero la premisa mayor (general), luego la menor (particular) y al final la conclusión.',
              pistas: ['Empieza por la afirmación general.', 'La conclusión empieza con "Por lo tanto".']
            },
            {
              id_ejercicio: 'n5-l3-e2', orden: 2, tipo_interaccion: 'seleccion_multiple',
              enunciado: 'De p → q y p, por modus ponens se concluye:',
              opciones: ['¬p', 'q', '¬q', 'p ∧ ¬q'],
              respuesta_correcta: 'q',
              explicacion: 'Si se cumple la condición (p) y la implicación es verdadera, se cumple el resultado (q).',
              pistas: ['La condición se cumplió.', '¿Qué dice el consecuente?']
            },
            {
              id_ejercicio: 'n5-l3-e3', orden: 3, tipo_interaccion: 'seleccion_multiple',
              enunciado: '"Si estudio, apruebo. No aprobé." ¿Qué se concluye?',
              opciones: ['Estudié', 'No estudié', 'Aprobé', 'No se puede concluir nada'],
              respuesta_correcta: 'No estudié',
              explicacion: 'Modus tollens: de p → q y ¬q se concluye ¬p.',
              pistas: ['Aplica modus tollens.', 'Si hubiera estudiado, habría aprobado.']
            }
          ],
          minijuego: {
            segundos: 45,
            items: [
              { texto: '∃x P(x) significa que al menos un x cumple P.', valor: true },
              { texto: '¬∃x P(x) ≡ ∀x ¬P(x)', valor: true },
              { texto: 'false || true vale false.', valor: false },
              { texto: 'Modus tollens: de p → q y ¬q se concluye ¬p.', valor: true },
              { texto: '∀x P(x) es verdadera si un solo x cumple P.', valor: false },
              { texto: '!(a || b) equivale a !a && !b.', valor: true }
            ]
          }
        }
      ]
    }
  ];

  // MEDALLAS_CATALOGO — condicion_tipo ∈ {nivel_completado, puntaje_perfecto, streak, xp_acumulado}
  var MEDALLAS = [
    { id_medalla: 'm-n1', nombre: 'Fundamentos dominados', descripcion: 'Completa el nivel 1', condicion_tipo: 'nivel_completado', condicion_valor: 1 },
    { id_medalla: 'm-n2', nombre: 'Maestro de tablas', descripcion: 'Completa el nivel 2', condicion_tipo: 'nivel_completado', condicion_valor: 2 },
    { id_medalla: 'm-n3', nombre: 'Álgebra en orden', descripcion: 'Completa el nivel 3', condicion_tipo: 'nivel_completado', condicion_valor: 3 },
    { id_medalla: 'm-n4', nombre: 'Demostrador', descripcion: 'Completa el nivel 4', condicion_tipo: 'nivel_completado', condicion_valor: 4 },
    { id_medalla: 'm-n5', nombre: 'Razonador experto', descripcion: 'Completa el nivel 5', condicion_tipo: 'nivel_completado', condicion_valor: 5 },
    { id_medalla: 'm-perfecto', nombre: 'Puntaje perfecto', descripcion: 'Obtén 100% en una lección', condicion_tipo: 'puntaje_perfecto', condicion_valor: 100 },
    { id_medalla: 'm-racha3', nombre: 'Racha de 3 días', descripcion: 'Estudia 3 días seguidos', condicion_tipo: 'streak', condicion_valor: 3 },
    { id_medalla: 'm-racha7', nombre: 'Racha de 7 días', descripcion: 'Estudia 7 días seguidos', condicion_tipo: 'streak', condicion_valor: 7 },
    { id_medalla: 'm-racha30', nombre: 'Racha de 30 días', descripcion: 'Estudia 30 días seguidos', condicion_tipo: 'streak', condicion_valor: 30 },
    { id_medalla: 'm-xp250', nombre: '250 XP', descripcion: 'Acumula 250 XP', condicion_tipo: 'xp_acumulado', condicion_valor: 250 },
    { id_medalla: 'm-xp500', nombre: '500 XP', descripcion: 'Acumula 500 XP', condicion_tipo: 'xp_acumulado', condicion_valor: 500 },
    { id_medalla: 'm-xp1000', nombre: '1000 XP', descripcion: 'Acumula 1000 XP', condicion_tipo: 'xp_acumulado', condicion_valor: 1000 }
  ];

  window.EduDer = window.EduDer || {};
  window.EduDer.content = { NIVELES: NIVELES, MEDALLAS: MEDALLAS, SEP: SEP };
})();
