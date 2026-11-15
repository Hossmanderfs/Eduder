jest.mock('../src/config/database', () => ({ transaction: async (fn) => fn({}) }));
jest.mock('../src/models', () => ({
  Usuario: { findOne: jest.fn(), findByPk: jest.fn() },
  PerfilEstudiante: { findAll: jest.fn(), findOne: jest.fn() },
  TokenRecuperacion: { findAll: jest.fn(), update: jest.fn(), create: jest.fn() },
  Notificacion: { count: jest.fn(), create: jest.fn(), findOne: jest.fn(), update: jest.fn(), findAll: jest.fn() },
}));
const bcrypt = require('bcryptjs');
const M = require('../src/models');
const Auth = require('../src/services/auth.service');
const Notif = require('../src/services/notification.service');
const { verifyToken, invalidarSesion, limpiarCacheSesiones } = require('../src/middleware/auth.middleware');
const jwt = require('jsonwebtoken');

describe('política de contraseña (RF-02)', () => {
  test('rechaza claves sin número o sin letra al registrar', async () => {
    for (const clave of ['sololetras', '12345678', 'Ab1']) {
      await expect(Auth.register({ correo_institucional: 'a@miremington.edu.co', nombre: 'A', apellido: 'B', contrasena: clave }))
        .rejects.toMatchObject({ status: 400 });
    }
  });
});

describe('resetPassword (RF-19)', () => {
  const user = () => ({ id_usuario: 'u1', update: jest.fn() });
  test('campos faltantes → 400', async () => {
    await expect(Auth.resetPassword({})).rejects.toMatchObject({ status: 400 });
  });
  test('contraseña corta → 400', async () => {
    await expect(Auth.resetPassword({ correo_institucional: 'a@uniremington.edu.co', token: 't', nueva_contrasena: '123' }))
      .rejects.toMatchObject({ status: 400 });
  });
  test('token incorrecto → 400', async () => {
    M.Usuario.findOne.mockResolvedValue(user());
    M.TokenRecuperacion.findAll.mockResolvedValue([{ token_hash: await bcrypt.hash('bueno', 4), update: jest.fn() }]);
    await expect(Auth.resetPassword({ correo_institucional: 'a@uniremington.edu.co', token: 'malo', nueva_contrasena: 'Clave1234' }))
      .rejects.toMatchObject({ status: 400 });
  });
  test('token correcto cambia la contraseña e invalida el token', async () => {
    const u = user(); const t = { token_hash: await bcrypt.hash('bueno', 4), update: jest.fn() };
    M.Usuario.findOne.mockResolvedValue(u); M.TokenRecuperacion.findAll.mockResolvedValue([t]);
    await Auth.resetPassword({ correo_institucional: 'a@uniremington.edu.co', token: 'bueno', nueva_contrasena: 'Clave1234' });
    expect(u.update).toHaveBeenCalled();
    expect(t.update).toHaveBeenCalledWith({ usado: true });
  });
});

describe('verifyToken (RF-20)', () => {
  process.env.JWT_SECRET = 'test';
  beforeEach(() => { limpiarCacheSesiones(); M.Usuario.findByPk.mockClear(); });
  const run = async (estado) => {
    M.Usuario.findByPk.mockResolvedValue(estado ? { estado, rol: 'estudiante' } : null);
    const token = jwt.sign({ id_usuario: 'u1', rol: 'admin' }, 'test');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await verifyToken(req, res, next);
    return { req, res, next };
  };
  test('usuario activo pasa y el rol viene de la BD', async () => {
    const { req, next } = await run('activo');
    expect(next).toHaveBeenCalled();
    expect(req.usuario.rol).toBe('estudiante');
  });
  test('usuario inactivo → 401', async () => {
    const { res, next } = await run('inactivo');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
  test('usuario inexistente → 401', async () => {
    const { res } = await run(null);
    expect(res.status).toHaveBeenCalledWith(401);
  });
  test('la segunda petición usa la caché y no consulta la BD (RNF-04)', async () => {
    await run('activo');
    await run('activo');
    expect(M.Usuario.findByPk).toHaveBeenCalledTimes(1);
  });
  test('al invalidar la sesión (admin desactiva la cuenta) la siguiente petición consulta la BD y se rechaza (RF-20)', async () => {
    await run('activo');
    invalidarSesion('u1');
    const { res, next } = await run('inactivo');
    expect(M.Usuario.findByPk).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('notificaciones (RF-16)', () => {
  test('recordatorio de racha no duplica el aviso del día', async () => {
    M.PerfilEstudiante.findAll.mockResolvedValue([{ id_usuario: 'a', streak_dias: 3 }, { id_usuario: 'b', streak_dias: 5 }]);
    M.Notificacion.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    M.Notificacion.create.mockResolvedValue({});
    const r = await Notif.sendStreakReminders(new Date('2026-11-12T23:00:00Z'));
    expect(r.enviadas).toBe(1);
    expect(M.Notificacion.create).toHaveBeenCalledWith(expect.objectContaining({ id_usuario: 'b', tipo: 'racha' }));
  });
  test('marcar leída de otro usuario → 404', async () => {
    M.Notificacion.findOne.mockResolvedValue(null);
    await expect(Notif.markRead('u1', 'x')).rejects.toMatchObject({ status: 404 });
  });
});

describe('longitudes y tipos en register (columnas de USUARIO)', () => {
  const ok = { correo_institucional: 'a@miremington.edu.co', nombre: 'Ana', apellido: 'Pérez', contrasena: 'Clave1234' };
  test.each([
    [{ ...ok, nombre: 'x'.repeat(81) }],
    [{ ...ok, apellido: 'x'.repeat(81) }],
    [{ ...ok, correo_institucional: 'x'.repeat(140) + '@miremington.edu.co' }],
    [{ ...ok, nombre: 123 }],
  ])('rechaza con 400: %#', async (body) => {
    await expect(Auth.register(body)).rejects.toMatchObject({ status: 400 });
  });
});
