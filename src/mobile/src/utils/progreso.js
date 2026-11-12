// src/utils/progreso.js — EduDer
// RF-07, RF-08, RF-09, RF-12: lógica derivada del progreso (portada del frontend de referencia).
//  · Una lección se desbloquea cuando la anterior de su nivel está completada.
//  · Un nivel se desbloquea si es el primero, si el anterior está aprobado (promedio ≥ umbral)
//    o si el perfil ya lo marca como alcanzado (nivel_actual).
import api from '../services/api';

export const UMBRAL = 70;
export const TIPOS = {
  teoria: { icon: 'book', label: 'Teoría' },
  ejercicio: { icon: 'puzzle', label: 'Ejercicio' },
  mini_juego: { icon: 'device-gamepad-2', label: 'Mini-juego' },
  caso_practico: { icon: 'briefcase', label: 'Caso práctico' },
};

export function normTipo(t) {
  const s = String((t && (t.nombre_tipo || t)) || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (s.includes('juego')) return 'mini_juego';
  if (s.includes('caso')) return 'caso_practico';
  if (s.includes('teor')) return 'teoria';
  return 'ejercicio';
}

export function normalizarNiveles(lista) {
  return (lista || []).slice().sort((a, b) => a.orden - b.orden).map((n) => ({
    ...n,
    umbral_aprobacion: n.umbral_aprobacion || UMBRAL,
    lecciones: (n.lecciones || [])
      .filter((l) => !l.estado || l.estado === 'activo')
      .sort((a, b) => a.orden - b.orden)
      .map((l) => ({ ...l, tipo: normTipo(l.tipo) })),
  }));
}

export function construirEstado(niveles, progreso, perfil) {
  const porLeccion = {};
  ((progreso && progreso.detalle) || []).forEach((p) => { porLeccion[p.id_leccion] = p; });
  const nivelPerfil = perfil && perfil.nivel_actual ? perfil.nivel_actual : 1;
  let anteriorAprobado = true;
  let totalLecc = 0;
  let totalComp = 0;
  const levels = niveles.map((n, i) => {
    const desbloqueado = i === 0 || anteriorAprobado || n.orden <= nivelPerfil;
    let prevCompleta = true;
    let suma = 0;
    let comp = 0;
    const lecciones = n.lecciones.map((l) => {
      const pr = porLeccion[l.id_leccion];
      const estado = pr ? pr.estado : 'no_iniciada';
      const item = {
        id_leccion: l.id_leccion, titulo: l.titulo, tipo: l.tipo, orden: l.orden, xp_base: l.xp_base,
        estado, puntaje: pr && pr.puntaje !== null && pr.puntaje !== undefined ? Number(pr.puntaje) : null,
        fecha_completado: pr ? pr.fecha_completado : null,
        desbloqueada: desbloqueado && prevCompleta,
      };
      if (estado === 'completada') { comp += 1; suma += item.puntaje || 0; }
      prevCompleta = estado === 'completada';
      return item;
    });
    const completo = comp === lecciones.length && lecciones.length > 0;
    const promedio = comp ? Math.round(suma / comp) : null;
    const aprobado = completo && promedio >= n.umbral_aprobacion;
    anteriorAprobado = aprobado || lecciones.length === 0;
    totalLecc += lecciones.length;
    totalComp += comp;
    return {
      id_nivel: n.id_nivel, nombre: n.nombre, descripcion: n.descripcion, orden: n.orden, umbral_aprobacion: n.umbral_aprobacion,
      lecciones, desbloqueado, completadas: comp, total: lecciones.length,
      porcentaje: lecciones.length ? Math.round((comp / lecciones.length) * 100) : 0,
      promedio, completo, aprobado,
      estado: !desbloqueado ? 'bloqueado' : aprobado ? 'completado'
        : comp > 0 || lecciones.some((l) => l.estado === 'en_progreso') ? 'en_progreso' : 'disponible',
    };
  });
  let actual = 1;
  levels.forEach((l) => { if (l.desbloqueado) actual = l.orden; });
  return {
    niveles: levels, nivel_actual: actual,
    porcentaje_global: totalLecc ? Math.round((totalComp / totalLecc) * 100) : 0,
    lecciones_completadas: totalComp, lecciones_total: totalLecc,
  };
}

// "Continuar lección diaria" (WF-01): última en progreso o siguiente disponible
export function siguienteLeccion(state) {
  let enProgreso = null; let siguiente = null; let ultima = null;
  state.niveles.forEach((n) => {
    n.lecciones.forEach((l) => {
      if (!l.desbloqueada) return;
      ultima = { nivel: n, leccion: l };
      if (!enProgreso && l.estado === 'en_progreso') enProgreso = { nivel: n, leccion: l };
      if (!siguiente && l.estado !== 'completada') siguiente = { nivel: n, leccion: l };
    });
  });
  return enProgreso || siguiente || ultima;
}

// Carga niveles + progreso + perfil y deriva el estado (una sola vez por pantalla)
export async function cargarDashboard() {
  const [lv, pr, pf] = await Promise.all([
    api.get('/levels'), api.get('/profile/progress'), api.get('/profile/summary'),
  ]);
  const niveles = normalizarNiveles(lv.data);
  const perfilData = pf.data || {};
  const perfil = perfilData.perfil || {};
  return { niveles, progreso: pr.data, perfilData, perfil, state: construirEstado(niveles, pr.data, perfil) };
}
