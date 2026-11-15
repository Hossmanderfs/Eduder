// RF-18 — nivel_actual se mantiene en el backend al completar una lección
const perfil = { xp_total: 0, xp_semana_actual: 0, streak_dias: 0, nivel_actual: 1, ultima_actividad: null,
  update: jest.fn(async function (d) { Object.assign(this, d); }), dataValues: {} };
const mockModels = {
  ProgresoLeccion: { findOne: jest.fn(), create: jest.fn(), findAll: jest.fn(), count: jest.fn() },
  Leccion: { findByPk: jest.fn(), findAll: jest.fn() },
  Nivel: { count: jest.fn() },
  PerfilEstudiante: { findOne: jest.fn() },
  MedallaCatalogo: { findAll: jest.fn(async () => []) },
  MedallaUsuario: { findAll: jest.fn(async () => []), create: jest.fn() },
  Notificacion: { create: jest.fn() },
};
jest.mock('../src/models', () => mockModels);
const Progress = require('../src/services/progress.service');

beforeEach(() => {
  perfil.nivel_actual = 1; perfil.update.mockClear();
  mockModels.PerfilEstudiante.findOne.mockResolvedValue(perfil);
  mockModels.Leccion.findByPk.mockResolvedValue({ id_leccion: 'L1', xp_base: 100, id_nivel: 1 });
  mockModels.ProgresoLeccion.findOne.mockResolvedValue(null);
  mockModels.ProgresoLeccion.create.mockImplementation(async (d) => ({ ...d, toJSON: () => d }));
  mockModels.Nivel.count.mockResolvedValue(5);
  mockModels.Leccion.findAll.mockResolvedValue([{ id_leccion: 'L1', id_nivel: 1 }]);
});

test('al completar todas las lecciones del nivel 1, nivel_actual pasa a 2', async () => {
  mockModels.ProgresoLeccion.findAll.mockResolvedValue([{ id_leccion: 'L1' }]);
  const r = await Progress.updateProgress('L1', { estado: 'completada', puntaje: 80 }, 'u1');
  expect(perfil.nivel_actual).toBe(2);
  expect(r.resumen.nivel_actual).toBe(2);
});

test('si el nivel no está completo, nivel_actual no cambia', async () => {
  mockModels.Leccion.findAll.mockResolvedValue([{ id_leccion: 'L1', id_nivel: 1 }, { id_leccion: 'L2', id_nivel: 1 }]);
  mockModels.ProgresoLeccion.findAll.mockResolvedValue([{ id_leccion: 'L1' }]);
  await Progress.updateProgress('L1', { estado: 'completada', puntaje: 80 }, 'u1');
  expect(perfil.nivel_actual).toBe(1);
});

test('no supera el número de niveles activos', async () => {
  mockModels.Nivel.count.mockResolvedValue(1);
  mockModels.ProgresoLeccion.findAll.mockResolvedValue([{ id_leccion: 'L1' }]);
  await Progress.updateProgress('L1', { estado: 'completada', puntaje: 80 }, 'u1');
  expect(perfil.nivel_actual).toBe(1);
});
