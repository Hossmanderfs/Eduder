// RN-05 / RF-13 — la racha (streak_dias) se recalcula al completar una lección
const perfil = { xp_total: 0, xp_semana_actual: 0, streak_dias: 0, nivel_actual: 1, ultima_actividad: null,
  update: jest.fn(async function (d) { Object.assign(this, d); }), dataValues: {} };
const mockModels = {
  ProgresoLeccion: { findOne: jest.fn(), create: jest.fn(), findAll: jest.fn(), count: jest.fn() },
  Leccion: { findByPk: jest.fn(), findAll: jest.fn(), findOne: jest.fn() },
  Nivel: { findAll: jest.fn(), findByPk: jest.fn() },
  PerfilEstudiante: { findOne: jest.fn() },
  MedallaCatalogo: { findAll: jest.fn(async () => []) },
  MedallaUsuario: { findAll: jest.fn(async () => []), create: jest.fn() },
  Notificacion: { create: jest.fn() },
};
jest.mock('../src/models', () => mockModels);
const Progress = require('../src/services/progress.service');

const HOY = '2026-11-17';
const dia = (d) => { const f = new Date(`${HOY}T12:00:00Z`); f.setUTCDate(f.getUTCDate() - d); return f.toISOString().split('T')[0]; };

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date(`${HOY}T15:00:00Z`));
  Progress.limpiarCacheMeta();
  Object.assign(perfil, { streak_dias: 5, nivel_actual: 1, ultima_actividad: null });
  mockModels.PerfilEstudiante.findOne.mockResolvedValue(perfil);
  mockModels.Leccion.findByPk.mockResolvedValue({ id_leccion: 'L1', xp_base: 50, id_nivel: 1, orden: 1 });
  mockModels.Leccion.findOne.mockResolvedValue(null);
  mockModels.Nivel.findByPk.mockResolvedValue({ id_nivel: 1, orden: 1 });
  mockModels.ProgresoLeccion.findOne.mockResolvedValue(null);
  mockModels.ProgresoLeccion.create.mockImplementation(async (d) => ({ ...d, toJSON: () => d }));
  mockModels.Nivel.findAll.mockResolvedValue([{ id_nivel: 1, orden: 1, umbral_aprobacion: 70 }]);
  mockModels.Leccion.findAll.mockResolvedValue([{ id_leccion: 'L1', id_nivel: 1 }, { id_leccion: 'L2', id_nivel: 1 }]);
  mockModels.ProgresoLeccion.findAll.mockResolvedValue([]);
});
afterEach(() => jest.useRealTimers());

const completar = () => Progress.updateProgress('L1', { estado: 'completada', puntaje: 100 }, 'u1');

test('RN-05: última actividad ayer → la racha suma 1', async () => {
  perfil.ultima_actividad = dia(1);
  const r = await completar();
  expect(r.resumen.streak_dias).toBe(6);
});

test('RN-05: última actividad hoy → la racha no cambia', async () => {
  perfil.ultima_actividad = dia(0);
  const r = await completar();
  expect(r.resumen.streak_dias).toBe(5);
});

test('RN-05: última actividad anterior a ayer (hace 3 días) → la racha se reinicia (queda en 1 con la lección de hoy)', async () => {
  perfil.ultima_actividad = dia(3);
  const r = await completar();
  expect(r.resumen.streak_dias).toBe(1);
});

test('RN-05: sin actividad previa → la racha empieza en 1', async () => {
  perfil.ultima_actividad = null;
  const r = await completar();
  expect(r.resumen.streak_dias).toBe(1);
});
