// tests/integracion.test.js — Pruebas de integración contra la BD real (MySQL/MariaDB con el DDL v1.2 y `npm run seed`).
// Ejecutar:  INTEGRACION=1 npx jest tests/integracion --coverage     (en Windows PowerShell: $env:INTEGRACION=1)
// Sin INTEGRACION=1 se omiten (no requieren BD en la suite unitaria). Guarda códigos HTTP y tiempos en
// docs/pruebas/resultados-api.md (Ficha de Pruebas, Bloque 3: RNF-02 ≤ 1 s).
const request = require('supertest');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const correr = process.env.INTEGRACION === '1' ? describe : describe.skip;
const filas = [];
let app, M;

async function llamar(metodo, ruta, { token, body, caso, rf, esperado } = {}) {
  const t0 = process.hrtime.bigint();
  let r = request(app)[metodo](ruta);
  if (token) r = r.set('Authorization', `Bearer ${token}`);
  if (body !== undefined) r = r.send(body);
  const res = await r;
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  filas.push({ caso: caso || `${metodo.toUpperCase()} ${ruta}`, rf: rf || '', esperado: esperado || '', codigo: res.status, ms: Math.round(ms) });
  return res;
}

correr('integración API (BD real)', () => {
  const sufijo = Date.now();
  const correoEst = `int.${sufijo}@miremington.edu.co`;
  const correoAdm = `adm.${sufijo}@uniremington.edu.co`;
  let tokEst, tokAdm, idEst, niveles, leccion, ejercicio;

  beforeAll(async () => {
    process.env.DISABLE_CRON = 'true';
    app = require('../src/app');
    M = require('../src/models');
    await M.sequelize.authenticate();
    await M.Usuario.create({ id_usuario: uuid(), correo_institucional: correoAdm, nombre: 'Adm', apellido: 'Int', contrasena_hash: await bcrypt.hash('Clave1234', 10), rol: 'admin', estado: 'activo' });
  });
  afterAll(async () => {
    const ordenadas = filas.slice();
    const lineas = ['# Resultados de la prueba de integración de la API', '',
      `Ejecución: ${new Date().toISOString()} · Node ${process.version} · BD: ${M ? M.sequelize.getDialect() : ''}`, '',
      '| Caso | RF/RNF | Esperado | Obtenido | Tiempo (ms) | ¿Cumple? |', '|---|---|---|---|---|---|',
      ...ordenadas.map((f) => `| ${f.caso} | ${f.rf} | ${f.esperado} | ${f.codigo} | ${f.ms} | ${String(f.codigo) === String(f.esperado) && f.ms <= 1000 ? 'Sí' : (f.esperado === '' ? '—' : 'No')} |`),
      '', `Tiempo máximo observado: ${Math.max(...ordenadas.map((f) => f.ms))} ms (umbral RNF-02: 1000 ms por evaluación de ejercicio).`];
    fs.writeFileSync(path.join(__dirname, '../../../docs/pruebas/resultados-api.md'), lineas.join('\n') + '\n');
    await M.sequelize.close();
  });

  test('registro estudiante (201) y rechazos 400/409', async () => {
    let r = await llamar('post', '/auth/register', { body: { correo_institucional: correoEst, nombre: 'Ana', apellido: 'Pérez', contrasena: 'Clave1234' }, caso: 'PS-01 Registro válido (Sunny Day)', rf: 'RF-01, RF-02', esperado: 201 });
    expect(r.status).toBe(201); tokEst = r.body.token; idEst = r.body.usuario.id_usuario;
    r = await llamar('post', '/auth/register', { body: { correo_institucional: 'x@gmail.com', nombre: 'A', apellido: 'B', contrasena: 'Clave1234' }, caso: 'PR-01 Dominio no institucional (Rainy Day)', rf: 'RF-01 / RN-01', esperado: 400 });
    expect(r.status).toBe(400);
    r = await llamar('post', '/auth/register', { body: { correo_institucional: correoEst, nombre: 'Ana', apellido: 'Pérez', contrasena: 'Clave1234' }, caso: 'Registro duplicado', rf: 'RF-01', esperado: 409 });
    expect(r.status).toBe(409);
    r = await llamar('post', '/auth/register', { body: { correo_institucional: `d${sufijo}@miremington.edu.co`, nombre: 'A', apellido: 'B', contrasena: 'corta' }, caso: 'Contraseña débil', rf: 'RF-02', esperado: 400 });
    expect(r.status).toBe(400);
  });

  test('login, bloqueo a los 5 intentos (RN-03) y logout', async () => {
    let r = await llamar('post', '/auth/login', { body: { correo_institucional: correoEst, contrasena: 'Clave1234' }, caso: 'Login correcto', rf: 'RF-03', esperado: 200 });
    expect(r.status).toBe(200);
    const c = `blq.${sufijo}@miremington.edu.co`;
    await request(app).post('/auth/register').send({ correo_institucional: c, nombre: 'B', apellido: 'L', contrasena: 'Clave1234' });
    for (let i = 0; i < 5; i++) await llamar('post', '/auth/login', { body: { correo_institucional: c, contrasena: 'mala' }, caso: `Login fallido ${i + 1}`, rf: 'RF-05 / RN-03', esperado: 401 });
    r = await llamar('post', '/auth/login', { body: { correo_institucional: c, contrasena: 'Clave1234' }, caso: 'PN-03 Cuenta bloqueada aunque la clave sea correcta', rf: 'RF-05 / RN-03', esperado: 429 });
    expect(r.status).toBe(429);
    r = await llamar('delete', '/auth/session', { token: tokEst, caso: 'Logout', rf: 'RF-03', esperado: 200 });
    expect(r.status).toBe(200);
    r = await llamar('get', '/levels', { caso: 'Sin token', rf: 'RF-03', esperado: 401 });
    expect(r.status).toBe(401);
  });

  test('contenido, ejercicio, pistas y progreso (RN-06, RN-11, RN-12)', async () => {
    let r = await llamar('get', '/levels', { token: tokEst, caso: 'Listar niveles', rf: 'RF-07', esperado: 200 });
    expect(r.status).toBe(200); niveles = r.body;
    expect(niveles.length).toBe(5);
    leccion = niveles.flatMap((n) => n.lecciones).find((l) => l.tipo !== 'teoria');
    r = await llamar('get', `/levels/${niveles[0].id_nivel}`, { token: tokEst, caso: 'Nivel por id', rf: 'RF-07', esperado: 200 });
    r = await llamar('get', '/levels/9999', { token: tokEst, caso: 'Nivel inexistente', rf: 'RF-07', esperado: 404 });
    r = await llamar('get', `/lessons/${leccion.id_leccion}`, { token: tokEst, caso: 'Lección por id', rf: 'RF-08', esperado: 200 });
    r = await llamar('get', `/lessons/${leccion.id_leccion}/content`, { token: tokEst, caso: 'Contenido de la lección', rf: 'RF-10', esperado: 200 });
    expect(r.status).toBe(200); ejercicio = r.body.ejercicios[0];
    const ej = await M.Ejercicio.findByPk(ejercicio.id_ejercicio);
    r = await llamar('post', '/exercise/answer', { token: tokEst, body: { id_ejercicio: ejercicio.id_ejercicio, respuesta: ej.respuesta_correcta }, caso: 'PS-02 Respuesta correcta con feedback (RNF-02 ≤ 1 s)', rf: 'RF-10 / RNF-02', esperado: 200 });
    expect(r.status).toBe(200); expect(r.body.correcto).toBe(true);
    r = await llamar('post', '/exercise/answer', { token: tokEst, body: { id_ejercicio: ejercicio.id_ejercicio, respuesta: 'zzz' }, caso: 'Respuesta incorrecta con feedback', rf: 'RF-10', esperado: 200 });
    expect(r.body.correcto).toBe(false);
    r = await llamar('post', '/exercise/answer', { token: tokEst, body: {}, caso: 'Respuesta sin datos', rf: 'RF-10', esperado: 400 });
    const conPistas = (await M.Pista.findOne({ where: { numero_pista: 2 } })).id_ejercicio;
    r = await llamar('get', `/exercise/${conPistas}/hint`, { token: tokEst, caso: 'Pista 1', rf: 'RF-11 / RN-12', esperado: 200 });
    expect(r.status).toBe(200);
    r = await llamar('get', `/exercise/${conPistas}/hint?numero=2`, { token: tokEst, caso: 'Pista 2 solicitada explícitamente', rf: 'RF-11 / RN-12', esperado: 200 });
    expect(r.status).toBe(200);
    r = await llamar('get', `/exercise/${conPistas}/hint?numero=3`, { token: tokEst, caso: 'Pista 3 inexistente (máx. 2, RN-12)', rf: 'RF-11 / RN-12', esperado: 400 });
    expect([400, 404]).toContain(r.status);
    r = await llamar('put', `/progress/${leccion.id_leccion}`, { token: tokEst, body: { estado: 'completada', puntaje: 100 }, caso: 'Completar lección (XP, racha, medallas)', rf: 'RF-09, RF-12, RF-13, RF-14', esperado: 200 });
    expect(r.status).toBe(200);
    r = await llamar('put', `/progress/${leccion.id_leccion}`, { token: tokEst, body: { estado: 'completada', puntaje: 150 }, caso: 'PN-01 Puntaje fuera de 0-100 (RN-13)', rf: 'RF-12 / RN-13', esperado: 400 });
    expect(r.status).toBe(400);
    r = await llamar('put', `/progress/${leccion.id_leccion}`, { token: tokEst, body: { estado: 'volando' }, caso: 'Estado inválido', rf: 'RF-09', esperado: 400 });
    r = await llamar('get', '/profile/summary', { token: tokEst, caso: 'Resumen de perfil (RNF-02 ≤ 3 s)', rf: 'RF-18', esperado: 200 });
    r = await llamar('get', '/profile/progress', { token: tokEst, caso: 'Progreso por nivel', rf: 'RF-18', esperado: 200 });
    r = await llamar('get', '/gamification/medals', { token: tokEst, caso: 'Medallas del estudiante', rf: 'RF-14', esperado: 200 });
    r = await llamar('get', `/gamification/ranking/${niveles[0].id_nivel}`, { token: tokEst, caso: 'Ranking semanal', rf: 'RF-17', esperado: 200 });
    r = await llamar('get', '/notifications', { token: tokEst, caso: 'Listar notificaciones', rf: 'RF-16', esperado: 200 });
    r = await llamar('patch', '/notifications/read-all', { token: tokEst, caso: 'Marcar todas leídas', rf: 'RF-16', esperado: 200 });
    r = await llamar('patch', `/notifications/${uuid()}/read`, { token: tokEst, caso: 'Notificación ajena/inexistente', rf: 'RF-16', esperado: 404 });
  });

  test('recuperación de contraseña (RF-19)', async () => {
    let r = await llamar('post', '/auth/recover', { body: { correo_institucional: correoEst }, caso: 'Solicitar recuperación', rf: 'RF-19', esperado: 200 });
    expect(r.status).toBe(200);
    r = await llamar('post', '/auth/recover', { body: { correo_institucional: `no.existe${sufijo}@miremington.edu.co` }, caso: 'Recuperación de correo inexistente (misma respuesta)', rf: 'RF-19', esperado: 200 });
    r = await llamar('post', '/auth/reset-password', { body: { correo_institucional: correoEst, token: 'falso', nueva_contrasena: 'Nueva1234' }, caso: 'Token inválido', rf: 'RF-19 / RN-18', esperado: 400 });
    expect(r.status).toBe(400);
  });

  test('roles: estudiante no accede a rutas admin (403)', async () => {
    const r = await llamar('get', '/admin/users', { token: tokEst, caso: 'PN-02 Estudiante en ruta admin', rf: 'RF-20 / roles', esperado: 403 });
    expect(r.status).toBe(403);
  });

  test('administración: usuarios, métricas y CSV (RF-20 a RF-22)', async () => {
    let r = await llamar('post', '/auth/login', { body: { correo_institucional: correoAdm, contrasena: 'Clave1234' }, caso: 'Login administrador', rf: 'RF-03', esperado: 200 });
    tokAdm = r.body.token;
    r = await llamar('get', `/admin/users?q=${correoEst}`, { token: tokAdm, caso: 'Buscar usuario por correo', rf: 'RF-21', esperado: 200 });
    expect(r.status).toBe(200);
    r = await llamar('patch', `/admin/users/${idEst}`, { token: tokAdm, body: { estado: 'inactivo' }, caso: 'Desactivar cuenta', rf: 'RF-20', esperado: 200 });
    expect(r.status).toBe(200);
    r = await llamar('get', '/levels', { token: tokEst, caso: 'PS-03 Sesión invalidada de inmediato tras desactivar', rf: 'RF-20', esperado: 401 });
    expect(r.status).toBe(401);
    r = await llamar('patch', `/admin/users/${idEst}`, { token: tokAdm, body: { estado: 'activo' }, caso: 'Reactivar cuenta', rf: 'RF-20', esperado: 200 });
    r = await llamar('patch', `/admin/users/${uuid()}`, { token: tokAdm, body: { estado: 'activo' }, caso: 'Usuario inexistente', rf: 'RF-20', esperado: 404 });
    r = await llamar('get', '/admin/metrics?desde=2020-01-01&hasta=2099-12-31', { token: tokAdm, caso: 'KPIs por rango de fechas', rf: 'RF-22', esperado: 200 });
    expect(r.status).toBe(200);
    r = await llamar('get', '/admin/metrics/export', { token: tokAdm, caso: 'Exportar KPIs en CSV', rf: 'RF-22', esperado: 200 });
    expect(r.headers['content-type']).toMatch(/csv/);
  });

  test('CRUD de contenido y reglas de borrado (RF-25 a RF-28, RN-20/21/22)', async () => {
    let r = await llamar('post', '/levels', { token: tokAdm, body: { nombre: `Nivel QA ${sufijo}`, descripcion: 'x', orden: 100 + (sufijo % 100), umbral_aprobacion: 70 }, caso: 'Crear nivel', rf: 'RF-25', esperado: 201 });
    expect(r.status).toBe(201); const idN = r.body.id_nivel;
    r = await llamar('post', '/levels', { token: tokAdm, body: { nombre: 'dup', orden: 1 }, caso: 'Nivel con orden repetido', rf: 'RF-25 / RN-07', esperado: 409 });
    expect(r.status).toBe(409);
    r = await llamar('put', `/levels/${idN}`, { token: tokAdm, body: { nombre: `Nivel QA ed ${sufijo}` }, caso: 'Editar nivel', rf: 'RF-25', esperado: 200 });
    r = await llamar('post', '/lessons', { token: tokAdm, body: { id_nivel: idN, titulo: 'Lección QA', tipo: 'ejercicio', orden: 1, xp_base: 10 }, caso: 'Crear lección', rf: 'RF-26', esperado: 201 });
    expect(r.status).toBe(201); const idL = r.body.id_leccion;
    r = await llamar('put', `/lessons/${idL}`, { token: tokAdm, body: { titulo: 'Lección QA editada' }, caso: 'Editar lección', rf: 'RF-26', esperado: 200 });
    r = await llamar('get', `/lessons/by-level/${idN}`, { token: tokAdm, caso: 'Lecciones por nivel (admin)', rf: 'RF-26', esperado: 200 });
    r = await llamar('get', '/lessons/all', { token: tokAdm, caso: 'Todas las lecciones (admin)', rf: 'RF-26', esperado: 200 });
    r = await llamar('post', '/exercise', { token: tokAdm, body: { id_leccion: idL, enunciado: '¿p ∧ q con p=V, q=F? || V | F', tipo_interaccion: 'seleccion_multiple', orden: 1, respuesta_correcta: 'F', explicacion: 'La conjunción es falsa si un operando es falso.', pistas: ['Piensa en la tabla del AND.'] }, caso: 'Crear ejercicio', rf: 'RF-27', esperado: 201 });
    expect(r.status).toBe(201); const idE = r.body.id_ejercicio;
    r = await llamar('get', `/exercise/by-lesson/${idL}`, { token: tokAdm, caso: 'Ejercicios por lección', rf: 'RF-27', esperado: 200 });
    r = await llamar('put', `/exercise/${idE}`, { token: tokAdm, body: { explicacion: 'Explicación editada.' }, caso: 'Editar ejercicio', rf: 'RF-27', esperado: 200 });
    r = await llamar('post', '/exercise', { token: tokAdm, body: { id_leccion: idL }, caso: 'Ejercicio incompleto', rf: 'RF-27', esperado: 400 });
    r = await llamar('delete', `/levels/${idN}`, { token: tokAdm, caso: 'PN-04 Nivel con lecciones no se elimina (RN-20)', rf: 'RF-25 / RN-20', esperado: 409 });
    expect(r.status).toBe(409);
    r = await llamar('delete', `/exercise/${idE}`, { token: tokAdm, caso: 'Eliminar ejercicio', rf: 'RF-27', esperado: 200 });
    r = await llamar('delete', `/lessons/${idL}`, { token: tokAdm, caso: 'Eliminar lección sin progreso', rf: 'RF-26', esperado: 200 });
    r = await llamar('delete', `/levels/${idN}`, { token: tokAdm, caso: 'Eliminar nivel vacío', rf: 'RF-25', esperado: 200 });
    // lección con progreso → se archiva (RN-21)
    r = await llamar('delete', `/lessons/${leccion.id_leccion}`, { token: tokAdm, caso: 'PR-RN21 Lección con progreso se archiva (RN-21)', rf: 'RF-26 / RN-21', esperado: 200 });
    expect(r.body.archivado).toBe(true);
    await M.Leccion.update({ estado: 'activo' }, { where: { id_leccion: leccion.id_leccion } });
    // medallas
    r = await llamar('post', '/gamification/medals', { token: tokAdm, body: { nombre: `Medalla QA ${sufijo}`, descripcion: 'x', condicion_tipo: 'xp_acumulado', condicion_valor: 999999, icono_url: 'qa' }, caso: 'Crear medalla', rf: 'RF-28', esperado: 201 });
    expect(r.status).toBe(201); const idM = r.body.id_medalla;
    r = await llamar('put', `/gamification/medals/${idM}`, { token: tokAdm, body: { descripcion: 'editada' }, caso: 'Editar medalla', rf: 'RF-28', esperado: 200 });
    r = await llamar('get', '/gamification/admin/medals', { token: tokAdm, caso: 'Catálogo de medallas (admin)', rf: 'RF-28', esperado: 200 });
    r = await llamar('post', '/gamification/medals', { token: tokAdm, body: { nombre: 'x', condicion_tipo: 'inventada', condicion_valor: 1, icono_url: 'a' }, caso: 'Medalla con condición inválida', rf: 'RF-28', esperado: 400 });
    r = await llamar('delete', `/gamification/medals/${idM}`, { token: tokAdm, caso: 'Eliminar medalla', rf: 'RF-28', esperado: 200 });
  });

  test('ruta inexistente y JSON inválido (formato {message})', async () => {
    let r = await llamar('get', '/no-existe', { caso: 'Ruta inexistente', esperado: 404 });
    expect(r.body.message).toBeDefined();
    r = await request(app).post('/auth/login').set('Content-Type', 'application/json').send('{mal');
    expect(r.status).toBe(400);
    r = await request(app).get('/health'); expect(r.status).toBe(200);
  });
});
