// RF-18 — nivel_actual se mantiene en el backend al completar una lección
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

beforeEach(() => {
  Progress.limpiarCacheMeta();
  perfil.nivel_actual = 1; perfil.update.mockClear();
  mockModels.PerfilEstudiante.findOne.mockResolvedValue(perfil);
  mockModels.Leccion.findByPk.mockResolvedValue({ id_leccion: 'L1', xp_base: 100, id_nivel: 1, orden: 1 });
  mockModels.Leccion.findOne.mockResolvedValue(null);
  mockModels.Nivel.findByPk.mockResolvedValue({ id_nivel: 1, orden: 1 });
  mockModels.ProgresoLeccion.findOne.mockResolvedValue(null);
  mockModels.ProgresoLeccion.create.mockImplementation(async (d) => ({ ...d, toJSON: () => d }));
  mockModels.Nivel.findAll.mockResolvedValue([
    { id_nivel: 1, orden: 1, umbral_aprobacion: 70 }, { id_nivel: 2, orden: 2, umbral_aprobacion: 70 }]);
  mockModels.Leccion.findAll.mockResolvedValue([{ id_leccion: 'L1', id_nivel: 1 }]);
});

test('con promedio >= 70 % en todas las lecciones del nivel 1, nivel_actual pasa a 2 (RN-06)', async () => {
  mockModels.ProgresoLeccion.findAll.mockResolvedValue([{ id_leccion: 'L1', puntaje: 80 }]);
  const r = await Progress.updateProgress('L1', { estado: 'completada', puntaje: 80 }, 'u1');
  expect(perfil.nivel_actual).toBe(2);
  expect(r.resumen.nivel_actual).toBe(2);
});

test('si el nivel no está completo, nivel_actual no cambia', async () => {
  mockModels.Leccion.findAll.mockResolvedValue([{ id_leccion: 'L1', id_nivel: 1 }, { id_leccion: 'L2', id_nivel: 1 }]);
  mockModels.ProgresoLeccion.findAll.mockResolvedValue([{ id_leccion: 'L1', puntaje: 80 }]);
  await Progress.updateProgress('L1', { estado: 'completada', puntaje: 80 }, 'u1');
  expect(perfil.nivel_actual).toBe(1);
});

test('con promedio < 70 % el nivel no avanza aunque esté completo (RN-06)', async () => {
  mockModels.ProgresoLeccion.findAll.mockResolvedValue([{ id_leccion: 'L1', puntaje: 60 }]);
  await Progress.updateProgress('L1', { estado: 'completada', puntaje: 60 }, 'u1');
  expect(perfil.nivel_actual).toBe(1);
});

test('no supera el número de niveles activos', async () => {
  mockModels.Nivel.findAll.mockResolvedValue([{ id_nivel: 1, orden: 1, umbral_aprobacion: 70 }]);
  mockModels.ProgresoLeccion.findAll.mockResolvedValue([{ id_leccion: 'L1', puntaje: 80 }]);
  await Progress.updateProgress('L1', { estado: 'completada', puntaje: 80 }, 'u1');
  expect(perfil.nivel_actual).toBe(1);
});

describe('acceso secuencial (RF-08: RN-07, RN-09, RN-10)', () => {
  test('lección con anterior sin completar → 403', async () => {
    mockModels.Leccion.findByPk.mockResolvedValue({ id_leccion: 'L2', id_nivel: 1, orden: 2 });
    mockModels.Leccion.findOne.mockResolvedValue({ id_leccion: 'L1' });
    mockModels.ProgresoLeccion.findAll.mockResolvedValue([]);
    await expect(Progress.validarAcceso('u1', 'L2')).rejects.toMatchObject({ status: 403 });
  });
  test('lección cuya anterior está completada → permitido', async () => {
    mockModels.Leccion.findByPk.mockResolvedValue({ id_leccion: 'L2', id_nivel: 1, orden: 2 });
    mockModels.Leccion.findOne.mockResolvedValue({ id_leccion: 'L1' });
    mockModels.ProgresoLeccion.findAll.mockResolvedValue([]);
    mockModels.ProgresoLeccion.findOne.mockResolvedValue({ estado: 'completada' });
    await expect(Progress.validarAcceso('u1', 'L2')).resolves.toBeUndefined();
  });
  test('nivel aún no alcanzado → 403', async () => {
    mockModels.Leccion.findByPk.mockResolvedValue({ id_leccion: 'L9', id_nivel: 2, orden: 1 });
    mockModels.Nivel.findByPk.mockResolvedValue({ id_nivel: 2, orden: 2 });
    mockModels.ProgresoLeccion.findAll.mockResolvedValue([]);
    await expect(Progress.validarAcceso('u1', 'L9')).rejects.toMatchObject({ status: 403 });
  });
  test('lección inexistente → 404', async () => {
    mockModels.Leccion.findByPk.mockResolvedValue(null);
    await expect(Progress.validarAcceso('u1', 'x')).rejects.toMatchObject({ status: 404 });
  });
});
