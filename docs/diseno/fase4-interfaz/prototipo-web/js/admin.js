/*
 * EduDer — Estructura común del panel de administración (barra lateral)
 * WF-14: "Barra lateral con navegación: Dashboard | Usuarios | Métricas"
 */
(function () {
  'use strict';
  var E = window.EduDer, ui = E.ui;

  function shell(active) {
    var u = E.api.session.user() || { nombre: 'Admin', apellido: '' };
    var links = [
      ['dashboard', 'layout-dashboard', 'Dashboard', 'wf15-metricas.html'],
      ['usuarios', 'users', 'Usuarios', 'wf14-usuarios.html'],
      ['metricas', 'chart-bar', 'Métricas', 'wf15-metricas.html#detalle']
    ];
    var aside = document.createElement('aside');
    aside.className = 'sidebar';
    aside.setAttribute('aria-label', 'Panel de administración');
    aside.innerHTML =
      '<div class="side-brand">' + ui.logo(36) + '<div><strong>EduDer</strong><span>Panel de administración</span></div></div>' +
      '<nav class="side-nav" aria-label="Secciones">' + links.map(function (l) {
        return '<a class="side-link" href="' + l[3] + '"' + (l[0] === active ? ' aria-current="page"' : '') + '>' + ui.icon(l[1], { size: 20 }) + '<span>' + l[2] + '</span></a>';
      }).join('') + '</nav>' +
      '<div class="side-foot">' +
      '<div class="side-user">' + ui.avatar(u.nombre, u.apellido, 'sm') + '<div style="min-width:0"><p class="small" style="font-weight:600">' + ui.esc(u.nombre + ' ' + (u.apellido || '')) + '</p><p class="tiny">Administrador</p></div></div>' +
      '<div class="side-actions"><button type="button" class="icon-btn" id="adm-theme" aria-label="Cambiar tema"></button>' +
      '<button type="button" class="icon-btn" id="adm-logout" aria-label="Cerrar sesión">' + ui.icon('logout', { size: 20 }) + '</button></div></div>';
    document.querySelector('.admin').prepend(aside);

    function themeIcon() {
      var dark = ui.theme.current() === 'dark';
      var b = document.getElementById('adm-theme');
      b.innerHTML = ui.icon(dark ? 'sun' : 'moon', { size: 20 });
      b.setAttribute('aria-label', dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    }
    themeIcon();
    document.getElementById('adm-theme').addEventListener('click', function () { ui.theme.toggle(); themeIcon(); });
    document.getElementById('adm-logout').addEventListener('click', function () {
      ui.confirm({ title: '¿Cerrar sesión?', confirmText: 'Cerrar sesión' }).then(function (ok) {
        if (ok) E.api.logout().then(function () { ui.go('pages/wf05-login.html'); });
      });
    });
  }

  E.adminShell = shell;
})();
