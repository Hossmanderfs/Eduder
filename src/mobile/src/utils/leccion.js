// src/utils/leccion.js — EduDer
// Normaliza ejercicios y guarda la sesión de la lección en curso (equivale a
// ui.lessonSession del frontend de referencia). Vive en memoria: si la app se cierra,
// la lección queda "en progreso" en el backend y se retoma desde la teoría.
export const SEP = ' | ';

// Opciones/piezas pueden venir como campos o embebidas en el enunciado:
//   "Pregunta || opción A | opción B | opción C"   (selección múltiple / completar)
//   "Ordena… || pieza 1 | pieza 2 | pieza 3"        (arrastrar; respuesta = piezas unidas con " | ")
export function normalizarLeccion(l) {
  const ejercicios = (l.ejercicios || []).slice().sort((a, b) => a.orden - b.orden).map((e) => {
    const x = { ...e };
    if (typeof x.opciones === 'string') { try { x.opciones = JSON.parse(x.opciones); } catch { x.opciones = null; } }
    if (typeof x.piezas === 'string') { try { x.piezas = JSON.parse(x.piezas); } catch { x.piezas = null; } }
    if (!x.opciones && !x.piezas && x.enunciado && x.enunciado.indexOf('||') > 0) {
      const partes = x.enunciado.split('||');
      x.enunciado = partes[0].trim();
      const items = partes[1].split('|').map((s) => s.trim()).filter(Boolean);
      if (x.tipo_interaccion === 'arrastrar') x.piezas = items; else x.opciones = items;
    }
    return x;
  });
  return { ...l, contenidos: (l.contenidos || []).slice().sort((a, b) => a.orden - b.orden), ejercicios };
}

let sesion = null;
export const sesionLeccion = {
  get: () => sesion,
  set: (s) => { sesion = s; },
  clear: () => { sesion = null; },
};
