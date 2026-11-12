// src/utils/progreso.js — EduDer
// RF-07, RF-08, RF-09: reglas de desbloqueo secuencial a partir del progreso.
//  · Una lección se desbloquea cuando todas las anteriores de su nivel están completadas.
//  · Un nivel se desbloquea si es el primero o si el nivel anterior está completo
//    y el promedio de puntaje de sus lecciones alcanza su umbral_aprobacion.
//  · Si un nivel no tiene lecciones, no bloquea al siguiente.

// detalle: arreglo de { id_leccion, estado, puntaje } (GET /profile/progress → detalle)
export function mapaProgreso(detalle = []) {
  const m = {};
  detalle.forEach(p => { m[p.id_leccion] = p; });
  return m;
}

export function calcularEstado(niveles = [], detalle = []) {
  const prog = mapaProgreso(detalle);
  const ordenados = [...niveles].sort((a, b) => a.orden - b.orden);
  let previoAprobado = true;
  return ordenados.map((nivel) => {
    const lecciones = [...(nivel.lecciones ?? [])].sort((a, b) => a.orden - b.orden);
    const nivelDesbloqueado = previoAprobado;
    let anteriorCompleta = true;
    const conEstado = lecciones.map((l) => {
      const p = prog[l.id_leccion];
      const completada = p?.estado === 'completada';
      const estado = completada
        ? 'completada'
        : (nivelDesbloqueado && anteriorCompleta ? 'desbloqueada' : 'bloqueada');
      anteriorCompleta = anteriorCompleta && completada;
      return { ...l, estado_ui: estado, puntaje: p?.puntaje ?? null };
    });
    const completadas = conEstado.filter(l => l.estado_ui === 'completada').length;
    const total = conEstado.length;
    const puntajes = conEstado.filter(l => l.estado_ui === 'completada').map(l => Number(l.puntaje) || 0);
    const promedio = puntajes.length ? puntajes.reduce((a, b) => a + b, 0) / puntajes.length : 0;
    const completo = total === 0 || completadas === total;
    const aprobado = completo && (total === 0 || promedio >= (nivel.umbral_aprobacion ?? 70));
    previoAprobado = nivelDesbloqueado && aprobado;
    return { ...nivel, lecciones: conEstado, desbloqueado: nivelDesbloqueado, completadas, total, promedio, aprobado };
  });
}

export const ICONO_TIPO = { teoria: '📖', ejercicio: '✏️', mini_juego: '🎮', caso_practico: '🧩' };
export const NOMBRE_TIPO = { teoria: 'Teoría', ejercicio: 'Ejercicio', mini_juego: 'Mini-juego', caso_practico: 'Caso práctico' };
