// src/utils/formato.js — EduDer: formatos de fecha/número en español (Colombia)
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const num = (n) => Number(n || 0).toLocaleString('es-CO');
export const fecha = (iso) => { if (!iso) return '—'; const d = new Date(iso); return `${d.getDate()} ${MESES[d.getMonth()]}`; };
export const fechaLarga = (iso) => { if (!iso) return '—'; const d = new Date(iso); return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`; };
export const dias = (n) => `${n} ${n === 1 ? 'día' : 'días'}`;
export function hace(iso) {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'ahora';
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  if (s < 172800) return 'ayer';
  return fecha(iso);
}
export function mensajeError(err, porDefecto = 'No se pudo completar la acción.') {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.code === 'ECONNABORTED' || err?.message === 'Network Error') return 'No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.';
  return porDefecto;
}
