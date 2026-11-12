/*
 * EduDer — Capa de acceso a datos
 * ---------------------------------------------------------------
 * Todas las pantallas llaman a EduDer.api.*. Según config.MODE:
 *   'mock' → EduDer.mock (store.js), sin red.
 *   'api'  → fetch al backend Express (rutas reales del repositorio).
 *
 * Mapa de rutas (backend/src/server.js):
 *   POST   /auth/register            POST /auth/login       POST /auth/recover
 *   DELETE /auth/session             GET  /levels           GET  /lessons/:id/content
 *   POST   /exercise/answer          GET  /exercise/:id/hint?numero=1|2
 *   PUT    /progress/:id_leccion     GET  /profile/summary  GET  /profile/progress
 *   GET    /gamification/medals      GET  /gamification/ranking/:nivel
 *   GET    /admin/users              PATCH /admin/users/:id GET  /admin/metrics
 *   Propuestas (aún no existen): GET /notifications, PATCH /notifications/read-all,
 *   GET /admin/metrics?desde=&hasta= con serie diaria.
 */
(function () {
  'use strict';

  var cfg = window.EduDer.config;
  var mock = window.EduDer.mock;

  // ── sesión ────────────────────────────────────────────────────────────────
  function storeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function storeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function storeDel(k) { try { localStorage.removeItem(k); } catch (e) { } }

  var session = {
    save: function (token, usuario) {
      storeSet(usuario.rol === 'admin' ? cfg.ADMIN_TOKEN_KEY : cfg.TOKEN_KEY, token);
      storeSet(cfg.USER_KEY, JSON.stringify(usuario));
    },
    token: function (rol) { return storeGet(rol === 'admin' ? cfg.ADMIN_TOKEN_KEY : cfg.TOKEN_KEY); },
    user: function () { try { return JSON.parse(storeGet(cfg.USER_KEY) || 'null'); } catch (e) { return null; } },
    clear: function () { storeDel(cfg.TOKEN_KEY); storeDel(cfg.ADMIN_TOKEN_KEY); storeDel(cfg.USER_KEY); },
    currentToken: function () {
      var u = session.user();
      return u ? session.token(u.rol) : null;
    },
    // id del usuario dentro del token (necesario en modo mock)
    uid: function () {
      var t = session.currentToken();
      if (!t) return null;
      try {
        if (t.indexOf('mock.') === 0) return JSON.parse(decodeURIComponent(escape(atob(t.slice(5))))).id_usuario;
        var p = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return p.id_usuario;
      } catch (e) { return null; }
    }
  };

  // ── transporte ────────────────────────────────────────────────────────────
  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // Ejecuta una función del mock como si fuera una petición HTTP
  function viaMock(fn, needsAuth) {
    return delay(90 + Math.random() * 120).then(function () {
      var uid = null;
      if (needsAuth) {
        var p = mock.auth.verify(session.currentToken());
        uid = p.id_usuario;
      }
      return fn(uid);
    });
  }

  function http(method, path, body) {
    var headers = { 'Content-Type': 'application/json' };
    var t = session.currentToken();
    if (t) headers.Authorization = 'Bearer ' + t;
    return fetch(cfg.API_BASE_URL + path, { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined })
      .catch(function () {
        var e = new Error('No se pudo conectar con el servidor. Verifica que el backend esté en ' + cfg.API_BASE_URL);
        e.status = 0; throw e;
      })
      .then(function (res) {
        var ct = res.headers.get('content-type') || '';
        var parse = ct.indexOf('application/json') >= 0 ? res.json() : res.text();
        return parse.then(function (data) {
          if (!res.ok) {
            var e = new Error((data && data.message) || ('Error ' + res.status));
            e.status = res.status; throw e;
          }
          return data;
        });
      });
  }

  var isMock = function () { return cfg.MODE === 'mock'; };

  // ── API pública ───────────────────────────────────────────────────────────
  var api = {
    session: session,
    isMock: isMock,

    register: function (body) {
      return isMock() ? viaMock(function () { return mock.auth.register(body); }) : http('POST', '/auth/register', body);
    },
    login: function (body) {
      return isMock() ? viaMock(function () { return mock.auth.login(body); }) : http('POST', '/auth/login', body);
    },
    recover: function (body) {
      return isMock() ? viaMock(function () { return mock.auth.recover(body); }) : http('POST', '/auth/recover', body);
    },
    logout: function () {
      var p = isMock() ? viaMock(function () { return mock.auth.logout(); }) : http('DELETE', '/auth/session').catch(function () { return {}; });
      return p.then(function (r) { session.clear(); return r; });
    },
    verify: function () {
      if (isMock()) return viaMock(function (uid) { return { id_usuario: uid }; }, true);
      return http('GET', '/profile/summary');
    },

    levels: function () {
      var p = isMock() ? viaMock(function () { return mock.content.levels(); }, true) : http('GET', '/levels');
      return p.then(normalizeLevels);
    },
    lessonContent: function (id) {
      var p = isMock() ? viaMock(function () { return mock.content.lesson(id); }, true) : http('GET', '/lessons/' + encodeURIComponent(id) + '/content');
      return p.then(normalizeLesson);
    },
    answer: function (id_ejercicio, respuesta) {
      var body = { id_ejercicio: id_ejercicio, respuesta: respuesta };
      return isMock() ? viaMock(function () { return mock.exercise.answer(body); }, true) : http('POST', '/exercise/answer', body);
    },
    hint: function (id_ejercicio, numero) {
      return isMock() ? viaMock(function () { return mock.exercise.hint(id_ejercicio, numero); }, true)
        : http('GET', '/exercise/' + encodeURIComponent(id_ejercicio) + '/hint?numero=' + numero);
    },
    updateProgress: function (id_leccion, body) {
      return isMock() ? viaMock(function (uid) { return mock.progress.update(id_leccion, body, uid); }, true)
        : http('PUT', '/progress/' + encodeURIComponent(id_leccion), body);
    },
    profile: function () {
      return isMock() ? viaMock(function (uid) { return mock.profile.summary(uid); }, true) : http('GET', '/profile/summary');
    },
    progress: function () {
      return isMock() ? viaMock(function (uid) { return mock.profile.progress(uid); }, true) : http('GET', '/profile/progress');
    },
    medals: function () {
      return isMock() ? viaMock(function (uid) { return mock.gamification.medals(uid); }, true) : http('GET', '/gamification/medals');
    },
    ranking: function (nivel) {
      return isMock() ? viaMock(function (uid) { return mock.gamification.ranking(nivel, uid); }, true) : http('GET', '/gamification/ranking/' + nivel);
    },
    notifications: function () {
      if (isMock()) return viaMock(function (uid) { return mock.notifications.list(uid); }, true);
      // Ruta propuesta; si no existe aún, se usan las no leídas de /profile/summary
      return http('GET', '/notifications').catch(function (e) {
        if (e.status !== 404) throw e;
        return http('GET', '/profile/summary').then(function (p) { return p.notificaciones || []; });
      });
    },
    readAllNotifications: function () {
      if (isMock()) return viaMock(function (uid) { return mock.notifications.readAll(uid); }, true);
      return http('PATCH', '/notifications/read-all');
    },

    admin: {
      users: function () {
        return isMock() ? viaMock(function () { return mock.admin.users(); }, true) : http('GET', '/admin/users');
      },
      updateUser: function (id, body) {
        return isMock() ? viaMock(function () { return mock.admin.updateUser(id, body); }, true) : http('PATCH', '/admin/users/' + encodeURIComponent(id), body);
      },
      metrics: function (desde, hasta) {
        if (isMock()) return viaMock(function () { return mock.admin.metrics({ desde: desde, hasta: hasta }); }, true);
        return http('GET', '/admin/metrics?desde=' + desde + '&hasta=' + hasta).then(function (m) {
          if (m.kpis) return m;
          // Forma actual de admin.service.js → se adapta (sin serie ni tendencia)
          return {
            desde: desde, hasta: hasta, serie: [], previo: null, cuentas_activas: m.usuarios && m.usuarios.activos,
            kpis: { usuarios_activos: m.usuarios ? m.usuarios.activos : 0, lecciones_completadas: m.progreso ? m.progreso.completadas : 0, puntaje_promedio: null, xp_promedio: m.xp_promedio }
          };
        });
      }
    }
  };

  // ── normalización (el backend puede enviar tipo como FK de TIPO_LECCION) ─
  function normTipo(t) {
    var s = String((t && (t.nombre_tipo || t)) || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (s.indexOf('juego') >= 0) return 'mini_juego';
    if (s.indexOf('caso') >= 0) return 'caso_practico';
    if (s.indexOf('teor') >= 0) return 'teoria';
    return 'ejercicio';
  }
  function normalizeLevels(list) {
    return (list || []).slice().sort(function (a, b) { return a.orden - b.orden; }).map(function (n) {
      n.umbral_aprobacion = n.umbral_aprobacion || cfg.UMBRAL_APROBACION;
      n.lecciones = (n.lecciones || []).filter(function (l) { return !l.estado || l.estado === 'activo'; })
        .sort(function (a, b) { return a.orden - b.orden; })
        .map(function (l) { l.tipo = normTipo(l.tipoLeccion || l.tipo); return l; });
      return n;
    });
  }
  // Las opciones pueden venir en `opciones` (recomendado) o embebidas en el enunciado:
  //   "Pregunta || opción A | opción B | opción C"
  function normalizeLesson(l) {
    l.tipo = normTipo(l.tipoLeccion || l.tipo);
    l.contenidos = (l.contenidos || []).slice().sort(function (a, b) { return a.orden - b.orden; });
    l.ejercicios = (l.ejercicios || []).slice().sort(function (a, b) { return a.orden - b.orden; }).map(function (e) {
      if (typeof e.opciones === 'string') { try { e.opciones = JSON.parse(e.opciones); } catch (x) { e.opciones = null; } }
      if (typeof e.piezas === 'string') { try { e.piezas = JSON.parse(e.piezas); } catch (x) { e.piezas = null; } }
      if (!e.opciones && !e.piezas && e.enunciado && e.enunciado.indexOf('||') > 0) {
        var parts = e.enunciado.split('||');
        e.enunciado = parts[0].trim();
        var items = parts[1].split('|').map(function (s) { return s.trim(); }).filter(Boolean);
        if (e.tipo_interaccion === 'arrastrar') e.piezas = items; else e.opciones = items;
      }
      e.pistas = e.pistas || [];
      return e;
    });
    return l;
  }

  // ── lógica de progreso derivada (RF-08, RF-12) ───────────────────────────
  // Combina niveles + detalle de progreso y calcula bloqueos, porcentajes,
  // promedios y el nivel actual. Se usa igual en ambos modos.
  function buildState(niveles, progreso, perfil) {
    var porLeccion = {};
    (progreso && progreso.detalle || []).forEach(function (p) { porLeccion[p.id_leccion] = p; });
    var nivelActualPerfil = perfil && perfil.nivel_actual ? perfil.nivel_actual : 1;
    var anteriorAprobado = true;
    var totalLecc = 0, totalComp = 0;
    var levels = niveles.map(function (n, i) {
      var desbloqueado = i === 0 || anteriorAprobado || n.orden <= nivelActualPerfil;
      var prevCompleta = true;
      var suma = 0, comp = 0;
      var lecciones = n.lecciones.map(function (l) {
        var pr = porLeccion[l.id_leccion];
        var estado = pr ? pr.estado : 'no_iniciada';
        var item = {
          id_leccion: l.id_leccion, titulo: l.titulo, tipo: l.tipo, orden: l.orden, xp_base: l.xp_base,
          estado: estado, puntaje: pr && pr.puntaje !== null && pr.puntaje !== undefined ? pr.puntaje : null,
          fecha_completado: pr ? pr.fecha_completado : null,
          desbloqueada: desbloqueado && prevCompleta
        };
        if (estado === 'completada') { comp++; suma += item.puntaje || 0; }
        prevCompleta = estado === 'completada';
        return item;
      });
      var completo = comp === lecciones.length && lecciones.length > 0;
      var promedio = comp ? Math.round(suma / comp) : null;
      var aprobado = completo && promedio >= n.umbral_aprobacion;
      anteriorAprobado = aprobado;
      totalLecc += lecciones.length; totalComp += comp;
      return {
        id_nivel: n.id_nivel, nombre: n.nombre, descripcion: n.descripcion, orden: n.orden, umbral_aprobacion: n.umbral_aprobacion,
        lecciones: lecciones, desbloqueado: desbloqueado, completadas: comp, total: lecciones.length,
        porcentaje: lecciones.length ? Math.round(comp / lecciones.length * 100) : 0,
        promedio: promedio, completo: completo, aprobado: aprobado,
        estado: !desbloqueado ? 'bloqueado' : aprobado ? 'completado' : comp > 0 || lecciones.some(function (l) { return l.estado === 'en_progreso'; }) ? 'en_progreso' : 'disponible'
      };
    });
    var actual = 1;
    levels.forEach(function (l) { if (l.desbloqueado) actual = l.orden; });
    return {
      niveles: levels, nivel_actual: actual, porcentaje_global: totalLecc ? Math.round(totalComp / totalLecc * 100) : 0,
      lecciones_completadas: totalComp, lecciones_total: totalLecc
    };
  }

  // "Continuar lección diaria" (WF-01): última en progreso o siguiente disponible
  function nextLesson(state) {
    var enProgreso = null, siguiente = null, ultima = null;
    state.niveles.forEach(function (n) {
      n.lecciones.forEach(function (l) {
        if (!l.desbloqueada) return;
        ultima = { nivel: n, leccion: l };
        if (!enProgreso && l.estado === 'en_progreso') enProgreso = { nivel: n, leccion: l };
        if (!siguiente && l.estado !== 'completada') siguiente = { nivel: n, leccion: l };
      });
    });
    return enProgreso || siguiente || ultima;
  }

  // Nivel actual = lo que diga el perfil o lo derivado, lo que sea mayor
  function loadDashboard() {
    return Promise.all([api.levels(), api.progress(), api.profile()]).then(function (r) {
      var perfilData = r[2];
      var perfil = perfilData.perfil || {};
      var state = buildState(r[0], r[1], perfil);
      return { niveles: r[0], progreso: r[1], perfilData: perfilData, perfil: perfil, state: state };
    });
  }

  api.logic = { buildState: buildState, nextLesson: nextLesson, loadDashboard: loadDashboard, normTipo: normTipo };

  window.EduDer.api = api;
})();
