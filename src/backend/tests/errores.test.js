// Auditoría Bloque 3 pregunta 6 — errores JSON coherentes, sin trazas técnicas
const { notFound, errorHandler } = require('../src/middleware/errorHandler');

function resMock() {
  const r = { code: null, body: null };
  r.status = (c) => { r.code = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  return r;
}

describe('notFound', () => {
  test('responde 404 en JSON', () => {
    const r = resMock();
    notFound({ method: 'GET', path: '/no-existe' }, r);
    expect(r.code).toBe(404);
    expect(r.body.error).toMatch(/GET \/no-existe/);
  });
});

describe('errorHandler', () => {
  test.each([400, 401, 403, 404, 409, 429])('respeta err.status %i', (status) => {
    const r = resMock();
    errorHandler({ status, message: 'msg' }, {}, r, () => {});
    expect(r.code).toBe(status);
    expect(r.body).toEqual({ error: 'msg' });
  });
  test('JSON mal formado → 400', () => {
    const r = resMock();
    errorHandler(Object.assign(new SyntaxError('x'), { type: 'entity.parse.failed' }), {}, r, () => {});
    expect(r.code).toBe(400);
  });
  test('error inesperado → 500 sin exponer la traza', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const r = resMock();
    errorHandler(new Error('SequelizeDatabaseError: tabla x en /srv/app.js:10'), {}, r, () => {});
    expect(r.code).toBe(500);
    expect(JSON.stringify(r.body)).not.toMatch(/Sequelize|srv|\.js/);
    spy.mockRestore();
  });
});
