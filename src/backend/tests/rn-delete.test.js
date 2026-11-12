// Pruebas de las reglas de borrado RN-20, RN-21 y RN-22 (modelos simulados).
jest.mock('../src/config/database', () => ({ transaction: async (fn) => fn({}) }));
jest.mock('../src/models', () => ({
  Nivel: { findByPk: jest.fn() },
  Leccion: { findByPk: jest.fn(), count: jest.fn() },
  ContenidoLeccion: {}, Ejercicio: { findByPk: jest.fn() }, Pista: {},
  ProgresoLeccion: { count: jest.fn() },
  MedallaCatalogo: { findByPk: jest.fn() },
  MedallaUsuario: { count: jest.fn() },
  RankingSemanal: {}, PerfilEstudiante: {}, Usuario: {},
}));
const M = require('../src/models');
const LevelService = require('../src/services/level.service');
const LessonService = require('../src/services/lesson.service');
const GamificationService = require('../src/services/gamification.service');

const entidad = () => ({ destroy: jest.fn(), update: jest.fn() });

describe('RN-20 · eliminar nivel', () => {
  test('con lecciones asociadas responde 409 y no borra', async () => {
    const n = entidad(); M.Nivel.findByPk.mockResolvedValue(n); M.Leccion.count.mockResolvedValue(3);
    await expect(LevelService.deleteLevel(1)).rejects.toMatchObject({ status: 409 });
    expect(n.destroy).not.toHaveBeenCalled();
  });
  test('sin lecciones se elimina', async () => {
    const n = entidad(); M.Nivel.findByPk.mockResolvedValue(n); M.Leccion.count.mockResolvedValue(0);
    await expect(LevelService.deleteLevel(1)).resolves.toMatchObject({ archivado: false });
    expect(n.destroy).toHaveBeenCalled();
  });
  test('inexistente responde 404', async () => {
    M.Nivel.findByPk.mockResolvedValue(null);
    await expect(LevelService.deleteLevel(9)).rejects.toMatchObject({ status: 404 });
  });
});

describe('RN-21 · eliminar lección', () => {
  test('con progreso se archiva (inactivo)', async () => {
    const l = entidad(); M.Leccion.findByPk.mockResolvedValue(l); M.ProgresoLeccion.count.mockResolvedValue(2);
    await expect(LessonService.deleteLesson('x')).resolves.toMatchObject({ archivado: true });
    expect(l.update).toHaveBeenCalledWith({ estado: 'inactivo' });
    expect(l.destroy).not.toHaveBeenCalled();
  });
  test('sin progreso se elimina', async () => {
    const l = entidad(); M.Leccion.findByPk.mockResolvedValue(l); M.ProgresoLeccion.count.mockResolvedValue(0);
    await expect(LessonService.deleteLesson('x')).resolves.toMatchObject({ archivado: false });
    expect(l.destroy).toHaveBeenCalled();
  });
});

describe('RN-22 · eliminar medalla', () => {
  test('otorgada se marca inactiva', async () => {
    const m = entidad(); M.MedallaCatalogo.findByPk.mockResolvedValue(m); M.MedallaUsuario.count.mockResolvedValue(1);
    await expect(GamificationService.deleteMedal('x')).resolves.toMatchObject({ archivado: true });
    expect(m.update).toHaveBeenCalledWith({ estado: 'inactivo' });
  });
  test('no otorgada se elimina', async () => {
    const m = entidad(); M.MedallaCatalogo.findByPk.mockResolvedValue(m); M.MedallaUsuario.count.mockResolvedValue(0);
    await GamificationService.deleteMedal('x');
    expect(m.destroy).toHaveBeenCalled();
  });
});
