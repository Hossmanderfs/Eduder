/*
 * EduDer — Utilidades de interfaz compartidas por todas las pantallas
 */
(function () {
  'use strict';

  var E = window.EduDer;
  var icon = E.icon;

  // ── tema claro / oscuro ───────────────────────────────────────────────────
  var THEME_KEY = 'eduder_theme';
  function applyTheme() {
    var t = null;
    try { t = localStorage.getItem(THEME_KEY); } catch (e) { }
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
  }
  function currentTheme() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function toggleTheme() {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { }
    applyTheme();
    return next;
  }
  applyTheme();

  // ── rutas ─────────────────────────────────────────────────────────────────
  function root() {
    var p = location.pathname;
    return /\/(pages|admin)\/[^/]*$/.test(p) ? '../' : './';
  }
  function go(path) { location.href = root() + path; }
  function param(name) { return new URLSearchParams(location.search).get(name); }

  // ── DOM ───────────────────────────────────────────────────────────────────
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function reducedMotion() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  // ── formato ───────────────────────────────────────────────────────────────
  var MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var fmt = {
    num: function (n) { return Number(n || 0).toLocaleString('es-CO'); },
    date: function (iso) { if (!iso) return '—'; var d = new Date(iso); return d.getDate() + ' ' + MESES[d.getMonth()]; },
    dateLong: function (iso) { if (!iso) return '—'; var d = new Date(iso); return d.getDate() + ' ' + MESES[d.getMonth()] + ' ' + d.getFullYear(); },
    ago: function (iso) {
      var s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
      if (s < 60) return 'ahora';
      if (s < 3600) return 'hace ' + Math.floor(s / 60) + ' min';
      if (s < 86400) return 'hace ' + Math.floor(s / 3600) + ' h';
      var d = Math.floor(s / 86400);
      return d === 1 ? 'ayer' : 'hace ' + d + ' días';
    },
    initials: function (nombre, apellido) {
      var a = String(nombre || '').trim().charAt(0), b = String(apellido || '').trim().charAt(0);
      if (!b && nombre) { var parts = String(nombre).trim().split(/\s+/); b = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''; }
      return (a + b).toUpperCase() || '?';
    },
    dias: function (n) { return n + ' ' + (n === 1 ? 'día' : 'días'); }
  };

  var TIPOS = {
    teoria: { icon: 'book', label: 'Teoría' },
    ejercicio: { icon: 'puzzle', label: 'Ejercicio' },
    mini_juego: { icon: 'device-gamepad-2', label: 'Mini-juego' },
    caso_practico: { icon: 'briefcase', label: 'Caso práctico' }
  };

  // ── avisos (toast) ────────────────────────────────────────────────────────
  function toast(msg, type) {
    var region = $('#toast-region');
    if (!region) {
      region = document.createElement('div');
      region.id = 'toast-region'; region.className = 'toast-region';
      region.setAttribute('role', 'status'); region.setAttribute('aria-live', 'polite');
      document.body.appendChild(region);
    }
    var t = document.createElement('div');
    t.className = 'toast' + (type ? ' toast-' + type : '');
    t.innerHTML = icon(type === 'error' ? 'alert-triangle' : type === 'success' ? 'circle-check' : 'info-circle', { size: 18 }) + '<span>' + esc(msg) + '</span>';
    region.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 300); }, 3600);
  }

  // ── diálogo de confirmación accesible (<dialog>) ─────────────────────────
  function confirmDialog(opt) {
    return new Promise(function (resolve) {
      var d = document.createElement('dialog');
      d.className = 'dialog';
      d.setAttribute('aria-labelledby', 'dlg-title');
      d.innerHTML =
        '<form method="dialog" class="dialog-body">' +
        '<h2 id="dlg-title" class="dialog-title">' + esc(opt.title) + '</h2>' +
        (opt.message ? '<p class="dialog-text">' + esc(opt.message) + '</p>' : '') +
        '<div class="dialog-actions">' +
        '<button value="cancel" class="btn btn-ghost">' + esc(opt.cancelText || 'Cancelar') + '</button>' +
        '<button value="ok" class="btn ' + (opt.danger ? 'btn-danger' : 'btn-primary') + '">' + esc(opt.confirmText || 'Aceptar') + '</button>' +
        '</div></form>';
      document.body.appendChild(d);
      d.addEventListener('close', function () { var ok = d.returnValue === 'ok'; d.remove(); resolve(ok); });
      if (d.showModal) d.showModal(); else { resolve(window.confirm(opt.title)); d.remove(); }
    });
  }

  // ── autenticación de pantallas ────────────────────────────────────────────
  // Redirige al login si no hay sesión o si la cuenta fue desactivada (RF-20).
  function requireAuth(rol) {
    var u = E.api.session.user();
    var token = E.api.session.currentToken();
    if (!u || !token) { go('pages/wf05-login.html'); return new Promise(function () { }); }
    if (rol && u.rol !== rol) {
      go(u.rol === 'admin' ? 'admin/wf15-metricas.html' : 'pages/wf01-menu.html');
      return new Promise(function () { });
    }
    return E.api.verify().then(function () { return u; }).catch(function (err) {
      if (err.status === 401 || err.status === 403) {
        E.api.session.clear();
        location.href = root() + 'pages/wf05-login.html?motivo=' + (err.status === 403 ? 'desactivada' : 'expirada');
        return new Promise(function () { });
      }
      return u; // sin red: se deja continuar y cada pantalla mostrará su error
    });
  }

  // ── barra de pestañas (WF-01 / WF-08) ────────────────────────────────────
  function tabbar(active) {
    var items = [
      ['inicio', 'home', 'Inicio', 'pages/wf01-menu.html'],
      ['niveles', 'map-2', 'Niveles', 'pages/wf08-niveles.html'],
      ['ranking', 'trophy', 'Ranking', 'pages/wf12-ranking.html'],
      ['perfil', 'user', 'Perfil', 'pages/wf03-perfil.html']
    ];
    var nav = document.createElement('nav');
    nav.className = 'tabbar';
    nav.setAttribute('aria-label', 'Navegación principal');
    nav.innerHTML = items.map(function (it) {
      var on = it[0] === active;
      return '<a href="' + root() + it[3] + '" class="tab' + (on ? ' is-active' : '') + '"' + (on ? ' aria-current="page"' : '') + '>' +
        icon(it[1], { size: 22 }) + '<span>' + it[2] + '</span></a>';
    }).join('');
    var app = $('.app');
    app.appendChild(nav);
    app.classList.add('has-tabbar');
  }

  // ── estados de carga / error ──────────────────────────────────────────────
  function loading(el, text) {
    el.innerHTML = '<div class="state" aria-busy="true"><span class="spinner" aria-hidden="true"></span><p>' + esc(text || 'Cargando…') + '</p></div>';
  }
  function errorState(el, err, retry) {
    el.innerHTML = '<div class="state state-error" role="alert">' + icon('alert-triangle', { size: 28 }) +
      '<p>' + esc(err && err.message ? err.message : 'Algo salió mal.') + '</p>' +
      (retry ? '<button type="button" class="btn btn-secondary" data-retry>' + icon('refresh', { size: 18 }) + 'Reintentar</button>' : '') + '</div>';
    if (retry) $('[data-retry]', el).addEventListener('click', retry);
  }
  function busy(btn, on, text) {
    if (on) {
      btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.setAttribute('aria-busy', 'true');
      btn.innerHTML = '<span class="spinner spinner-sm" aria-hidden="true"></span>' + esc(text || 'Procesando…');
    } else {
      btn.disabled = false; btn.removeAttribute('aria-busy');
      if (btn.dataset.label) btn.innerHTML = btn.dataset.label;
    }
  }

  // ── animaciones ───────────────────────────────────────────────────────────
  function countUp(el, to, ms, prefix) {
    prefix = prefix || '';
    if (reducedMotion()) { el.textContent = prefix + fmt.num(to); return; }
    var start = performance.now();
    function step(now) {
      var k = Math.min(1, (now - start) / (ms || 900));
      var eased = 1 - Math.pow(1 - k, 3);
      el.textContent = prefix + fmt.num(Math.round(to * eased));
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function confetti() {
    if (reducedMotion()) return;
    var c = document.createElement('canvas');
    c.className = 'confetti'; c.setAttribute('aria-hidden', 'true');
    document.body.appendChild(c);
    var ctx = c.getContext('2d');
    var W = c.width = window.innerWidth, H = c.height = window.innerHeight;
    var styles = getComputedStyle(document.documentElement);
    var colors = ['--brand-blue', '--brand-red', '--gold', '--ok'].map(function (v) { return styles.getPropertyValue(v).trim() || '#003DA5'; });
    var parts = [];
    for (var i = 0; i < 140; i++) {
      parts.push({ x: W / 2 + (Math.random() - 0.5) * 120, y: H * 0.35, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4,
        w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: colors[i % colors.length] });
    }
    var t0 = performance.now();
    function frame(now) {
      ctx.clearRect(0, 0, W, H);
      parts.forEach(function (p) {
        p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      if (now - t0 < 3200) requestAnimationFrame(frame); else c.remove();
    }
    requestAnimationFrame(frame);
  }

  // ── sesión de lección en curso (sessionStorage) ──────────────────────────
  var LS_KEY = 'eduder_sesion_leccion';
  var lessonSession = {
    get: function () { try { return JSON.parse(sessionStorage.getItem(LS_KEY) || 'null'); } catch (e) { return null; } },
    set: function (s) { try { sessionStorage.setItem(LS_KEY, JSON.stringify(s)); } catch (e) { } },
    clear: function () { try { sessionStorage.removeItem(LS_KEY); } catch (e) { } }
  };

  // ── piezas visuales reutilizables ─────────────────────────────────────────
  function avatar(nombre, apellido, cls) {
    return '<span class="avatar ' + (cls || '') + '" aria-hidden="true">' + esc(fmt.initials(nombre, apellido)) + '</span>';
  }
  function logo(size) {
    return '<span class="logo" style="--logo-size:' + (size || 40) + 'px" aria-hidden="true"><span class="logo-mark">E</span></span>';
  }
  function modeNote() {
    if (!E.api.isMock()) return '';
    return '<p class="mode-note">' + icon('info-circle', { size: 14 }) + 'Modo demostración: los datos se guardan en este navegador.</p>';
  }

  // Coloca íconos declarados como <i data-icon="nombre"></i> en el HTML estático
  function hydrateIcons(ctx) {
    $$('[data-icon]', ctx).forEach(function (el) {
      el.outerHTML = icon(el.getAttribute('data-icon'), { size: Number(el.getAttribute('data-size')) || 20, label: el.getAttribute('data-label') || '' });
    });
  }
  document.addEventListener('DOMContentLoaded', function () { hydrateIcons(document); });

  E.ui = {
    root: root, go: go, param: param, $: $, $$: $$, esc: esc, fmt: fmt, TIPOS: TIPOS, icon: icon,
    toast: toast, confirm: confirmDialog, requireAuth: requireAuth, tabbar: tabbar,
    loading: loading, errorState: errorState, busy: busy, countUp: countUp, confetti: confetti,
    lessonSession: lessonSession, avatar: avatar, logo: logo, modeNote: modeNote, hydrateIcons: hydrateIcons,
    theme: { apply: applyTheme, toggle: toggleTheme, current: currentTheme }, reducedMotion: reducedMotion
  };
})();
