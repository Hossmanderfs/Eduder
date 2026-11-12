/*
 * EduDer — Backend simulado (modo 'mock')
 * ---------------------------------------------------------------
 * Implementa en el navegador los mismos contratos que el backend Express
 * del repositorio (src/backend/src/routes/*.js), con las reglas de negocio
 * del documento: RF-01…RF-22. Los datos se guardan en localStorage.
 *
 * Solo para demostración y pruebas: el "hash" de contraseña de este archivo
 * NO es seguro. En producción la seguridad la da bcrypt en el backend.
 */
(function () {
  'use strict';

  var C = window.EduDer.content;
  var cfg = window.EduDer.config;
  var DB_KEY = 'eduder_mock_db_v1';
  var memoryDb = null; // respaldo si localStorage no está disponible

  // ── utilidades ────────────────────────────────────────────────────────────
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function isoDay(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function diffDays(a, b) { // b - a en días calendario locales
    var da = new Date(a + 'T00:00:00'), dbb = new Date(b + 'T00:00:00');
    return Math.round((dbb - da) / 86400000);
  }
  function mondayOf(d) { d = new Date(d || new Date()); var day = d.getDay(); d.setDate(d.getDate() - ((day + 6) % 7)); return isoDay(d); }
  function hash(str) { // FNV-1a — SOLO DEMO
    var h = 0x811c9dc5, s = 'eduder::' + str;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0; }
    return ('0000000' + h.toString(16)).slice(-8);
  }
  function seeded(n) { var x = Math.sin(n * 9301 + 49297) * 233280; return x - Math.floor(x); }
  function fail(status, message) { var e = new Error(message); e.status = status; throw e; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function normalizar(s) { return String(s).trim().toLowerCase().replace(/\s+/g, ' '); }

  function allLessons() {
    var out = [];
    C.NIVELES.forEach(function (n) { n.lecciones.forEach(function (l) { out.push({ nivel: n, leccion: l }); }); });
    return out;
  }
  function findLesson(id) {
    var r = null;
    allLessons().forEach(function (x) { if (x.leccion.id_leccion === id) r = x; });
    return r;
  }
  function findExercise(id) {
    var r = null;
    allLessons().forEach(function (x) { x.leccion.ejercicios.forEach(function (e) { if (e.id_ejercicio === id) r = e; }); });
    return r;
  }

  // ── persistencia ──────────────────────────────────────────────────────────
  function load() {
    var raw = null;
    try { raw = localStorage.getItem(DB_KEY); } catch (e) { /* bloqueado */ }
    if (raw) { try { return JSON.parse(raw); } catch (e) { /* corrupto: se reinicia */ } }
    if (memoryDb) return memoryDb;
    var db = seed();
    save(db);
    return db;
  }
  function save(db) {
    memoryDb = db;
    try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) { /* solo memoria */ }
  }
  function reset() { try { localStorage.removeItem(DB_KEY); } catch (e) { } memoryDb = null; return load(); }

  // ── datos semilla ─────────────────────────────────────────────────────────
  var ESTUDIANTES = [
    ['Laura', 'Gómez'], ['Santiago', 'Restrepo'], ['Valentina', 'Ríos'], ['Mateo', 'Cardona'],
    ['Sofía', 'Henao'], ['Daniel', 'Ospina'], ['Isabella', 'Zapata'], ['Samuel', 'Arango'],
    ['Mariana', 'López'], ['Juan José', 'Mejía'], ['Camila', 'Vélez'], ['Sebastián', 'Muñoz'],
    ['Manuela', 'Castaño'], ['Tomás', 'Giraldo']
  ];

  function correoDe(nombre, apellido) {
    var base = (nombre.split(' ')[0] + '.' + apellido).toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z.]/g, '');
    return base + '@' + cfg.DOMINIO;
  }

  function simulatedWeekXp(i, week) { return Math.round(40 + seeded(i * 31 + week.length + Number(week.replace(/-/g, '')) % 997) * 260); }

  function seed() {
    var hoy = new Date();
    var semana = mondayOf(hoy);
    var db = {
      version: 1, usuarios: [], perfiles: {}, progreso: [], medallas_usuario: [],
      notificaciones: [], tokens_recuperacion: [], actividad: {}
    };

    db.usuarios.push({
      id_usuario: 'admin-001', correo_institucional: 'admin@uniremington.edu.co', nombre: 'Admin', apellido: 'Sistema',
      hash: hash('Admin2026'), rol: 'admin', estado: true, intentos_login: 0, bloqueado_hasta: null,
      fecha_registro: addDays(hoy, -200).toISOString()
    });

    // Estudiante demo con progreso (coincide con el usuario de prueba del script DDL)
    var juan = 'est-001';
    db.usuarios.push({
      id_usuario: juan, correo_institucional: 'juan.perez@' + cfg.DOMINIO, nombre: 'Juan', apellido: 'Pérez',
      hash: hash('Eduder2026'), rol: 'estudiante', estado: true, intentos_login: 0, bloqueado_hasta: null,
      fecha_registro: addDays(hoy, -21).toISOString()
    });
    var ayer = isoDay(addDays(hoy, -1));
    [['n1-l1', 90, -9], ['n1-l2', 80, -7], ['n1-l3', 100, -5], ['n2-l1', 85, -1]].forEach(function (p) {
      var info = findLesson(p[0]);
      db.progreso.push({
        id_progreso: uuid(), id_usuario: juan, id_leccion: p[0], id_nivel: info.nivel.id_nivel,
        estado: 'completada', puntaje: p[1], intentos: 1, fecha_completado: addDays(hoy, p[2]).toISOString()
      });
    });
    db.progreso.push({ id_progreso: uuid(), id_usuario: juan, id_leccion: 'n2-l2', id_nivel: 2, estado: 'en_progreso', puntaje: null, intentos: 1, fecha_completado: null });
    var xpJuan = [['n1-l1', 90], ['n1-l2', 80], ['n1-l3', 100], ['n2-l1', 85]].reduce(function (acc, p) {
      return acc + Math.round(findLesson(p[0]).leccion.xp_base * p[1] / 100);
    }, 0);
    db.perfiles[juan] = { nivel_actual: 2, xp_total: xpJuan, streak_dias: 4, xp_semana_actual: 98, semana_inicio: semana, ultima_actividad: ayer };
    db.medallas_usuario.push(
      { id_usuario: juan, id_medalla: 'm-n1', fecha_obtencion: addDays(hoy, -5).toISOString() },
      { id_usuario: juan, id_medalla: 'm-perfecto', fecha_obtencion: addDays(hoy, -5).toISOString() },
      { id_usuario: juan, id_medalla: 'm-racha3', fecha_obtencion: addDays(hoy, -2).toISOString() }
    );
    db.notificaciones.push(
      { id_notificacion: uuid(), id_usuario: juan, tipo: 'sistema', mensaje: '¡Bienvenido a EduDer! Tu primer nivel ya está disponible.', leida: true, fecha_envio: addDays(hoy, -21).toISOString() },
      { id_notificacion: uuid(), id_usuario: juan, tipo: 'logro', mensaje: 'Obtuviste la medalla "Puntaje perfecto".', leida: true, fecha_envio: addDays(hoy, -5).toISOString() },
      { id_notificacion: uuid(), id_usuario: juan, tipo: 'logro', mensaje: 'Desbloqueaste el nivel 2: Tablas de Verdad.', leida: false, fecha_envio: addDays(hoy, -5).toISOString() },
      { id_notificacion: uuid(), id_usuario: juan, tipo: 'logro', mensaje: 'Obtuviste la medalla "Racha de 3 días".', leida: false, fecha_envio: addDays(hoy, -2).toISOString() }
    );

    // Otros estudiantes (gestión admin + ranking)
    ESTUDIANTES.forEach(function (n, i) {
      var id = 'est-' + pad(i + 2) + 'x';
      var nivel = 1 + Math.floor(seeded(i + 3) * 4);
      db.usuarios.push({
        id_usuario: id, correo_institucional: correoDe(n[0], n[1]), nombre: n[0], apellido: n[1],
        hash: hash('Eduder2026'), rol: 'estudiante', estado: !(i === 4 || i === 11), intentos_login: 0, bloqueado_hasta: null,
        fecha_registro: addDays(hoy, -Math.floor(5 + seeded(i + 11) * 150)).toISOString()
      });
      db.perfiles[id] = {
        nivel_actual: nivel, xp_total: Math.round(nivel * 150 + seeded(i + 7) * 200),
        streak_dias: Math.floor(seeded(i + 5) * 12), xp_semana_actual: simulatedWeekXp(i, semana),
        semana_inicio: semana, ultima_actividad: isoDay(addDays(hoy, -Math.floor(seeded(i + 2) * 3))), simulado: true, idx: i
      };
    });

    // Actividad diaria agregada (KPIs del panel admin, RF-22)
    for (var d = 120; d >= 1; d--) {
      var dia = addDays(hoy, -d);
      var finde = dia.getDay() === 0 || dia.getDay() === 6;
      var tendencia = 1 + (120 - d) / 240;
      var activos = Math.round((finde ? 18 : 34) * tendencia + seeded(d) * 10);
      var lecciones = Math.round(activos * (1.3 + seeded(d + 50) * 0.9));
      var prom = 66 + seeded(d + 99) * 20;
      db.actividad[isoDay(dia)] = { usuarios_activos: activos, lecciones_completadas: lecciones, suma_puntaje: Math.round(prom * lecciones), ids: [] };
    }
    return db;
  }

  // ── reglas auxiliares ─────────────────────────────────────────────────────
  function getUser(db, id) {
    var u = null;
    db.usuarios.forEach(function (x) { if (x.id_usuario === id) u = x; });
    return u;
  }
  function publicUser(u) {
    return { id_usuario: u.id_usuario, correo_institucional: u.correo_institucional, nombre: u.nombre, apellido: u.apellido, rol: u.rol, estado: u.estado, fecha_registro: u.fecha_registro };
  }
  function makeToken(u) {
    var payload = { id_usuario: u.id_usuario, correo: u.correo_institucional, rol: u.rol, exp: Date.now() + 24 * 3600 * 1000 };
    return 'mock.' + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  }
  function readToken(token) {
    if (!token || token.indexOf('mock.') !== 0) fail(401, 'Token requerido');
    var p;
    try { p = JSON.parse(decodeURIComponent(escape(atob(token.slice(5))))); } catch (e) { fail(401, 'Token inválido o expirado'); }
    if (p.exp < Date.now()) fail(401, 'Token inválido o expirado');
    return p;
  }

  // Reinicio semanal del ranking (RF-17) y de la racha (RF-13)
  function housekeeping(db) {
    var semana = mondayOf(new Date());
    var hoy = isoDay();
    Object.keys(db.perfiles).forEach(function (id) {
      var p = db.perfiles[id];
      if (p.semana_inicio !== semana) {
        p.semana_inicio = semana;
        p.xp_semana_actual = p.simulado ? simulatedWeekXp(p.idx, semana) : 0;
      }
      if (p.ultima_actividad && diffDays(p.ultima_actividad, hoy) > 1 && p.streak_dias !== 0) p.streak_dias = 0;
    });
  }

  function notify(db, id_usuario, tipo, mensaje) {
    db.notificaciones.push({ id_notificacion: uuid(), id_usuario: id_usuario, tipo: tipo, mensaje: mensaje, leida: false, fecha_envio: new Date().toISOString() });
  }

  // Recordatorio diario de racha (RF-16): equivalente local del push diario
  function streakReminder(db, id_usuario) {
    var p = db.perfiles[id_usuario];
    if (!p) return;
    var hoy = isoDay();
    if (p.ultima_actividad === hoy) return;
    var yaHoy = db.notificaciones.some(function (n) { return n.id_usuario === id_usuario && n.tipo === 'racha' && n.fecha_envio.slice(0, 10) === hoy; });
    if (yaHoy) return;
    var msg = p.streak_dias > 0
      ? 'Mantén tu racha de ' + p.streak_dias + ' ' + (p.streak_dias === 1 ? 'día' : 'días') + ': completa una lección hoy.'
      : 'Empieza una nueva racha: completa una lección hoy.';
    notify(db, id_usuario, 'racha', msg);
  }

  function levelStatus(db, id_usuario, nivel) {
    var lecciones = nivel.lecciones;
    var done = lecciones.map(function (l) {
      var pr = db.progreso.filter(function (p) { return p.id_usuario === id_usuario && p.id_leccion === l.id_leccion; })[0];
      return pr && pr.estado === 'completada' ? pr.puntaje : null;
    });
    var completas = done.every(function (x) { return x !== null; });
    var prom = completas ? done.reduce(function (a, b) { return a + b; }, 0) / done.length : null;
    return { completas: completas, promedio: prom, aprobado: completas && prom >= nivel.umbral_aprobacion };
  }

  function evaluarMedallas(db, id_usuario, contexto) {
    var p = db.perfiles[id_usuario];
    var tiene = {};
    db.medallas_usuario.forEach(function (m) { if (m.id_usuario === id_usuario) tiene[m.id_medalla] = true; });
    var nuevas = [];
    C.MEDALLAS.forEach(function (m) {
      if (tiene[m.id_medalla]) return;
      var ok = false;
      if (m.condicion_tipo === 'xp_acumulado') ok = p.xp_total >= m.condicion_valor;
      else if (m.condicion_tipo === 'streak') ok = p.streak_dias >= m.condicion_valor;
      else if (m.condicion_tipo === 'puntaje_perfecto') ok = contexto.puntaje >= m.condicion_valor;
      else if (m.condicion_tipo === 'nivel_completado') {
        var niv = C.NIVELES.filter(function (n) { return n.id_nivel === m.condicion_valor; })[0];
        ok = niv ? levelStatus(db, id_usuario, niv).aprobado : false;
      }
      if (ok) {
        db.medallas_usuario.push({ id_usuario: id_usuario, id_medalla: m.id_medalla, fecha_obtencion: new Date().toISOString() });
        notify(db, id_usuario, 'logro', 'Obtuviste la medalla "' + m.nombre + '".');
        nuevas.push(m.id_medalla);
      }
    });
    return nuevas;
  }

  // ── servicios (mismos contratos que el backend) ───────────────────────────
  var auth = {
    // POST /auth/register — RF-01, RF-02
    register: function (body) {
      var db = load();
      var correo = String(body.correo_institucional || '').trim().toLowerCase();
      if (!correo || !body.nombre || !body.apellido || !body.contrasena) fail(400, 'Faltan campos obligatorios: correo_institucional, nombre, apellido, contrasena');
      if (!new RegExp('^[^\\s@]+@' + cfg.DOMINIO.replace(/\./g, '\\.') + '$', 'i').test(correo)) fail(400, 'El correo debe terminar en @' + cfg.DOMINIO);
      if (db.usuarios.some(function (u) { return u.correo_institucional === correo; })) fail(409, 'El correo ya está registrado');
      var u = {
        id_usuario: uuid(), correo_institucional: correo, nombre: String(body.nombre).trim(), apellido: String(body.apellido).trim(),
        hash: hash(body.contrasena), rol: 'estudiante', estado: true, intentos_login: 0, bloqueado_hasta: null, fecha_registro: new Date().toISOString()
      };
      db.usuarios.push(u);
      db.perfiles[u.id_usuario] = { nivel_actual: 1, xp_total: 0, streak_dias: 0, xp_semana_actual: 0, semana_inicio: mondayOf(new Date()), ultima_actividad: null };
      notify(db, u.id_usuario, 'sistema', '¡Bienvenido a EduDer! Tu primer nivel ya está disponible.');
      save(db);
      return { token: makeToken(u), usuario: publicUser(u) };
    },

    // POST /auth/login — RF-03, RF-05, RF-06, RF-20
    login: function (body) {
      var db = load();
      var correo = String(body.correo_institucional || '').trim().toLowerCase();
      if (!correo || !body.contrasena) fail(400, 'correo_institucional y contrasena son obligatorios');
      var u = db.usuarios.filter(function (x) { return x.correo_institucional === correo; })[0];
      if (!u) fail(401, 'Credenciales incorrectas');
      if (!u.estado) fail(403, 'Cuenta desactivada');
      if (u.bloqueado_hasta && Date.now() < new Date(u.bloqueado_hasta).getTime()) {
        fail(429, 'Cuenta bloqueada. Intenta en ' + Math.ceil((new Date(u.bloqueado_hasta) - Date.now()) / 60000) + ' min');
      }
      if (u.hash !== hash(body.contrasena)) {
        u.intentos_login = (u.intentos_login || 0) + 1;
        if (u.intentos_login >= cfg.MAX_INTENTOS_LOGIN) {
          u.bloqueado_hasta = new Date(Date.now() + cfg.BLOQUEO_MINUTOS * 60000).toISOString();
          u.intentos_login = 0;
        }
        save(db);
        fail(401, 'Credenciales incorrectas');
      }
      u.intentos_login = 0; u.bloqueado_hasta = null;
      save(db);
      return { token: makeToken(u), usuario: publicUser(u) };
    },

    // POST /auth/recover — RF-19 (respuesta genérica, token 30 min)
    recover: function (body) {
      var db = load();
      var correo = String(body.correo_institucional || '').trim().toLowerCase();
      if (!correo) fail(400, 'correo_institucional es obligatorio');
      var u = db.usuarios.filter(function (x) { return x.correo_institucional === correo; })[0];
      if (u) {
        db.tokens_recuperacion.forEach(function (t) { if (t.id_usuario === u.id_usuario) t.usado = true; });
        db.tokens_recuperacion.push({ id_usuario: u.id_usuario, expira_en: new Date(Date.now() + cfg.TOKEN_RECUPERACION_MIN * 60000).toISOString(), usado: false });
        save(db);
      }
      return { message: 'Si el correo existe, recibirás un enlace de recuperación' };
    },

    logout: function () { return { message: 'Sesión cerrada correctamente' }; },

    // Valida token y estado de la cuenta (RF-20: al desactivar se invalida la sesión)
    verify: function (token) {
      var p = readToken(token);
      var db = load();
      var u = getUser(db, p.id_usuario);
      if (!u) fail(401, 'Token inválido o expirado');
      if (!u.estado) fail(403, 'Cuenta desactivada');
      return p;
    }
  };

  var content = {
    // GET /levels
    levels: function () {
      return clone(C.NIVELES).map(function (n) {
        n.lecciones = n.lecciones.map(function (l) {
          return { id_leccion: l.id_leccion, titulo: l.titulo, tipo: l.tipo, orden: l.orden, xp_base: l.xp_base, estado: 'activo' };
        });
        return n;
      });
    },
    // GET /lessons/:id/content — no expone respuesta_correcta ni el texto de las pistas
    lesson: function (id) {
      var info = findLesson(id);
      if (!info) fail(404, 'Lección no encontrada');
      var l = clone(info.leccion);
      return {
        id_leccion: l.id_leccion, titulo: l.titulo, tipo: l.tipo, orden: l.orden, xp_base: l.xp_base,
        id_nivel: info.nivel.id_nivel, nivel: { id_nivel: info.nivel.id_nivel, nombre: info.nivel.nombre },
        contenidos: l.contenidos.map(function (c, i) { return { id_bloque: l.id_leccion + '-b' + (i + 1), tipo_bloque: c.tipo_bloque, contenido: c.contenido, orden: i + 1 }; }),
        ejercicios: l.ejercicios.map(function (e) {
          return {
            id_ejercicio: e.id_ejercicio, enunciado: e.enunciado, tipo_interaccion: e.tipo_interaccion, orden: e.orden,
            opciones: e.opciones || null, piezas: e.piezas || null,
            pistas: e.pistas.map(function (_, i) { return { id_pista: e.id_ejercicio + '-p' + (i + 1), numero_pista: i + 1 }; })
          };
        }),
        minijuego: l.minijuego || null
      };
    }
  };

  var exercise = {
    // POST /exercise/answer — RF-10
    answer: function (body) {
      if (!body.id_ejercicio || body.respuesta === undefined || body.respuesta === null) fail(400, 'id_ejercicio y respuesta son obligatorios');
      var e = findExercise(body.id_ejercicio);
      if (!e) fail(404, 'Ejercicio no encontrado');
      var correcto = normalizar(body.respuesta) === normalizar(e.respuesta_correcta);
      var r = { id_ejercicio: e.id_ejercicio, correcto: correcto, explicacion: correcto ? null : e.explicacion };
      if (correcto) r.respuesta_correcta = e.respuesta_correcta;
      return r;
    },
    // GET /exercise/:id/hint?numero= — RF-11
    hint: function (id, numero) {
      var n = parseInt(numero, 10);
      if ([1, 2].indexOf(n) < 0) fail(400, 'El número de pista debe ser 1 o 2');
      var e = findExercise(id);
      if (!e || !e.pistas[n - 1]) fail(404, 'Pista no encontrada para este ejercicio');
      return { id_ejercicio: id, numero_pista: n, texto_pista: e.pistas[n - 1] };
    }
  };

  var progress = {
    // PUT /progress/:id_leccion — RF-09, RF-12, RF-13, RF-14, RF-15
    update: function (id_leccion, body, id_usuario) {
      var db = load();
      housekeeping(db);
      var estados = ['no_iniciada', 'en_progreso', 'completada'];
      if (body.estado && estados.indexOf(body.estado) < 0) fail(400, 'estado debe ser uno de: ' + estados.join(', '));
      if (body.puntaje !== undefined && (body.puntaje < 0 || body.puntaje > 100)) fail(400, 'puntaje debe estar entre 0 y 100');
      var info = findLesson(id_leccion);
      if (!info) fail(404, 'Lección no encontrada');

      var pr = db.progreso.filter(function (p) { return p.id_usuario === id_usuario && p.id_leccion === id_leccion; })[0];
      if (!pr) {
        pr = { id_progreso: uuid(), id_usuario: id_usuario, id_leccion: id_leccion, id_nivel: info.nivel.id_nivel, estado: 'no_iniciada', puntaje: null, intentos: 0, fecha_completado: null };
        db.progreso.push(pr);
      }
      // Transición unidireccional NO_INICIADA → EN_PROGRESO → COMPLETADA (RF-09)
      if (body.estado === 'en_progreso' && pr.estado !== 'completada') pr.estado = 'en_progreso';
      pr.intentos = (pr.intentos || 0) + 1;

      var extra = { xp_ganado: 0, medallas_nuevas: [], nivel_desbloqueado: null };
      if (body.estado === 'completada') {
        var puntaje = Math.round(body.puntaje || 0);
        var antes = levelStatus(db, id_usuario, info.nivel).aprobado; // estado del nivel ANTES de guardar
        pr.estado = 'completada';
        pr.puntaje = pr.puntaje === null || pr.puntaje === undefined ? puntaje : Math.max(pr.puntaje, puntaje); // se conserva el mejor
        pr.fecha_completado = new Date().toISOString();

        var p = db.perfiles[id_usuario];
        var hoy = isoDay();
        var xp = Math.round(info.leccion.xp_base * puntaje / 100); // RF-12 — igual que progress.service.js
        var nuevaRacha = !p.ultima_actividad ? 1 : diffDays(p.ultima_actividad, hoy) === 0 ? Math.max(p.streak_dias, 1) : diffDays(p.ultima_actividad, hoy) === 1 ? p.streak_dias + 1 : 1;
        p.xp_total += xp; p.xp_semana_actual += xp; p.ultima_actividad = hoy; p.streak_dias = nuevaRacha;
        extra.xp_ganado = xp;

        var estado = levelStatus(db, id_usuario, info.nivel);
        if (estado.aprobado && !antes && info.nivel.id_nivel < C.NIVELES.length) {
          var sig = info.nivel.id_nivel + 1;
          if (p.nivel_actual < sig) {
            p.nivel_actual = sig;
            var nombreSig = C.NIVELES[sig - 1].nombre;
            notify(db, id_usuario, 'logro', 'Desbloqueaste el nivel ' + sig + ': ' + nombreSig + '.');
            extra.nivel_desbloqueado = { id_nivel: sig, nombre: nombreSig };
          }
        }
        extra.medallas_nuevas = evaluarMedallas(db, id_usuario, { puntaje: puntaje });

        // Registro para KPIs del administrador (RF-22)
        var dia = db.actividad[hoy] || (db.actividad[hoy] = { usuarios_activos: 0, lecciones_completadas: 0, suma_puntaje: 0, ids: [] });
        dia.lecciones_completadas += 1; dia.suma_puntaje += puntaje;
        if (dia.ids.indexOf(id_usuario) < 0) { dia.ids.push(id_usuario); dia.usuarios_activos += 1; }
      }
      save(db);
      var out = clone(pr);
      out.resultado = extra; // campo adicional del mock (el backend real no lo envía)
      return out;
    }
  };

  var profile = {
    // GET /profile/summary — RF-18
    summary: function (id_usuario) {
      var db = load();
      housekeeping(db);
      streakReminder(db, id_usuario);
      save(db);
      var u = getUser(db, id_usuario);
      if (!u) fail(404, 'Usuario no encontrado');
      var out = publicUser(u);
      out.perfil = clone(db.perfiles[id_usuario] || { nivel_actual: 1, xp_total: 0, streak_dias: 0, xp_semana_actual: 0 });
      out.medallas = db.medallas_usuario.filter(function (m) { return m.id_usuario === id_usuario; }).map(function (m) {
        return { id_medalla: m.id_medalla, fecha_obtencion: m.fecha_obtencion, medalla: clone(C.MEDALLAS.filter(function (c) { return c.id_medalla === m.id_medalla; })[0]) };
      });
      out.notificaciones = db.notificaciones.filter(function (n) { return n.id_usuario === id_usuario && !n.leida; })
        .sort(function (a, b) { return b.fecha_envio.localeCompare(a.fecha_envio); }).slice(0, 10);
      return out;
    },
    // GET /profile/progress — RF-09, RF-18
    progress: function (id_usuario) {
      var db = load();
      housekeeping(db);
      var p = db.perfiles[id_usuario] || {};
      var mios = db.progreso.filter(function (x) { return x.id_usuario === id_usuario; });
      return {
        xp_total: p.xp_total || 0, streak_dias: p.streak_dias || 0, xp_semana_actual: p.xp_semana_actual || 0,
        lecciones: {
          completadas: mios.filter(function (x) { return x.estado === 'completada'; }).length,
          en_progreso: mios.filter(function (x) { return x.estado === 'en_progreso'; }).length,
          total: mios.length
        },
        detalle: mios.map(function (x) {
          var info = findLesson(x.id_leccion);
          var o = clone(x);
          o.leccion = { id_leccion: x.id_leccion, titulo: info.leccion.titulo, id_nivel: info.nivel.id_nivel, xp_base: info.leccion.xp_base, tipo: info.leccion.tipo };
          return o;
        })
      };
    }
  };

  var gamification = {
    // GET /gamification/medals — RF-14
    medals: function (id_usuario) {
      var db = load();
      var map = {};
      db.medallas_usuario.forEach(function (m) { if (m.id_usuario === id_usuario) map[m.id_medalla] = m.fecha_obtencion; });
      return C.MEDALLAS.map(function (m) {
        var o = clone(m); o.obtenida = !!map[m.id_medalla]; o.fecha_obtencion = map[m.id_medalla] || null; return o;
      });
    },
    // GET /gamification/ranking/:nivel — RF-17 (top 20 + fila propia)
    ranking: function (nivel, id_usuario) {
      var db = load();
      housekeeping(db);
      save(db);
      nivel = Number(nivel);
      var filas = db.usuarios.filter(function (u) {
        var p = db.perfiles[u.id_usuario];
        return u.rol === 'estudiante' && u.estado && p && p.nivel_actual === nivel && p.xp_semana_actual > 0;
      }).map(function (u) {
        return { id_usuario: u.id_usuario, nombre: u.nombre + ' ' + u.apellido, xp_semana: db.perfiles[u.id_usuario].xp_semana_actual, es_yo: u.id_usuario === id_usuario };
      }).sort(function (a, b) { return b.xp_semana - a.xp_semana; });
      filas.forEach(function (f, i) { f.posicion = i + 1; });
      var top = filas.slice(0, 20);
      if (!top.some(function (f) { return f.es_yo; })) {
        var yo = filas.filter(function (f) { return f.es_yo; })[0];
        if (yo) top.push(yo);
      }
      return { semana_inicio: mondayOf(new Date()), id_nivel: nivel, ranking: top };
    }
  };

  var notifications = {
    // GET /notifications (propuesto — ver README)
    list: function (id_usuario) {
      var db = load();
      streakReminder(db, id_usuario);
      save(db);
      return db.notificaciones.filter(function (n) { return n.id_usuario === id_usuario; })
        .sort(function (a, b) { return b.fecha_envio.localeCompare(a.fecha_envio); });
    },
    // PATCH /notifications/read-all (propuesto — ver README)
    readAll: function (id_usuario) {
      var db = load();
      var n = 0;
      db.notificaciones.forEach(function (x) { if (x.id_usuario === id_usuario && !x.leida) { x.leida = true; n++; } });
      save(db);
      return { actualizadas: n };
    }
  };

  var admin = {
    // GET /admin/users — RF-21
    users: function () {
      var db = load();
      return db.usuarios.map(function (u) {
        var o = publicUser(u);
        o.perfil = db.perfiles[u.id_usuario] ? clone(db.perfiles[u.id_usuario]) : null;
        return o;
      }).sort(function (a, b) { return b.fecha_registro.localeCompare(a.fecha_registro); });
    },
    // PATCH /admin/users/:id — RF-20
    updateUser: function (id, body) {
      var db = load();
      var u = getUser(db, id);
      if (!u) fail(404, 'Usuario no encontrado');
      if (body.estado === undefined) fail(400, 'No se enviaron campos válidos para actualizar');
      u.estado = !!body.estado;
      save(db);
      return publicUser(u);
    },
    // GET /admin/metrics?desde=&hasta= — RF-22 (forma extendida, ver README)
    metrics: function (q) {
      var db = load();
      var hasta = q && q.hasta ? q.hasta : isoDay();
      var desde = q && q.desde ? q.desde : isoDay(addDays(new Date(), -6));
      if (desde > hasta) fail(400, 'La fecha inicial no puede ser posterior a la final');
      var dias = diffDays(desde, hasta) + 1;
      function rango(a, n) {
        var serie = [], tot = { usuarios_activos: 0, lecciones_completadas: 0, suma: 0 };
        for (var i = 0; i < n; i++) {
          var f = isoDay(addDays(new Date(a + 'T00:00:00'), i));
          var d = db.actividad[f] || { usuarios_activos: 0, lecciones_completadas: 0, suma_puntaje: 0 };
          serie.push({ fecha: f, usuarios_activos: d.usuarios_activos, lecciones_completadas: d.lecciones_completadas, puntaje_promedio: d.lecciones_completadas ? Math.round(d.suma_puntaje / d.lecciones_completadas * 10) / 10 : null });
          tot.usuarios_activos += d.usuarios_activos; tot.lecciones_completadas += d.lecciones_completadas; tot.suma += d.suma_puntaje;
        }
        return {
          serie: serie,
          kpis: {
            usuarios_activos: Math.round(tot.usuarios_activos / n),
            lecciones_completadas: tot.lecciones_completadas,
            puntaje_promedio: tot.lecciones_completadas ? Math.round(tot.suma / tot.lecciones_completadas * 10) / 10 : 0
          }
        };
      }
      var actual = rango(desde, dias);
      var previo = rango(isoDay(addDays(new Date(desde + 'T00:00:00'), -dias)), dias);
      return { desde: desde, hasta: hasta, kpis: actual.kpis, previo: previo.kpis, serie: actual.serie, cuentas_activas: db.usuarios.filter(function (u) { return u.estado && u.rol === 'estudiante'; }).length };
    }
  };

  window.EduDer.mock = {
    auth: auth, content: content, exercise: exercise, progress: progress, profile: profile,
    gamification: gamification, notifications: notifications, admin: admin,
    reset: reset, util: { isoDay: isoDay, mondayOf: mondayOf, diffDays: diffDays }
  };
})();
