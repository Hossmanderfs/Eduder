jest.mock('../src/config/database', () => ({ transaction: async (fn) => fn({}) }));
jest.mock('../src/models', () => ({
  Nivel: {}, Leccion: { findByPk: jest.fn() }, ContenidoLeccion: {}, Ejercicio: {}, Pista: {},
  ProgresoLeccion: {}, MedallaCatalogo: { create: jest.fn() }, MedallaUsuario: {},
  RankingSemanal: {}, PerfilEstudiante: {}, Usuario: {},
}));
const Gamification = require('../src/services/gamification.service');
const Exercise = require('../src/services/exercise.service');
const Lesson = require('../src/services/lesson.service');
const Admin = require('../src/services/admin.service');

const medalla = { nombre: 'Racha 7', condicion_tipo: 'streak', condicion_valor: 7, icono_url: 'x.png' };

describe('validación de medallas (RF-28)', () => {
  test.each([
    [{ ...medalla, nombre: '' }],
    [{ ...medalla, condicion_tipo: 'otra' }],
    [{ ...medalla, condicion_valor: 0 }],
    [{ ...medalla, condicion_valor: '7' }],
    [{ ...medalla, icono_url: '' }],
  ])('rechaza %j', async (body) => {
    await expect(Gamification.createMedal(body)).rejects.toMatchObject({ status: 400 });
  });
});

describe('validación de ejercicios (RF-27)', () => {
  const base = { id_leccion: 'l', enunciado: 'e', tipo_interaccion: 'completar', orden: 1, respuesta_correcta: 'r', explicacion: 'x' };
  test('faltan campos', async () => {
    await expect(Exercise.createExercise({ id_leccion: 'l' })).rejects.toMatchObject({ status: 400 });
  });
  test('tipo_interaccion inválido', async () => {
    await expect(Exercise.createExercise({ ...base, tipo_interaccion: 'x' })).rejects.toMatchObject({ status: 400 });
  });
  test('más de 2 pistas', async () => {
    await expect(Exercise.createExercise({ ...base, pistas: ['a', 'b', 'c'] })).rejects.toMatchObject({ status: 400 });
  });
});

describe('validación de lecciones', () => {
  test('tipo inválido', async () => {
    await expect(Lesson.createLesson({ id_nivel: 1, titulo: 't', tipo: 'otro', orden: 1 })).rejects.toMatchObject({ status: 400 });
  });
});

describe('RF-22 · rango de fechas y CSV', () => {
  test('rango válido', () => {
    const r = Admin.parseRango({ desde: '2026-01-01', hasta: '2026-01-31' });
    expect(r.desde.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(r.hasta.toISOString()).toBe('2026-01-31T23:59:59.999Z');
  });
  test('formato inválido', () => {
    expect(() => Admin.parseRango({ desde: 'ayer' })).toThrow();
  });
  test('desde posterior a hasta', () => {
    expect(() => Admin.parseRango({ desde: '2026-02-01', hasta: '2026-01-01' })).toThrow();
  });
  test('csvCell escapa comillas, comas y fórmulas', () => {
    expect(Admin.csvCell('a,b')).toBe('"a,b"');
    expect(Admin.csvCell('di "hola"')).toBe('"di ""hola"""');
    expect(Admin.csvCell('=SUM(A1)')).toBe("'=SUM(A1)");
    expect(Admin.csvCell(null)).toBe('');
  });
});
