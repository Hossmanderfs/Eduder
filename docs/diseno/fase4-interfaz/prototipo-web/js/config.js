/*
 * EduDer — Configuración del frontend web
 * ---------------------------------------------------------------
 * MODE:
 *   'mock' → funciona sin backend. Los datos viven en localStorage del
 *            navegador y replican las reglas de negocio del documento
 *            (RF-01 … RF-22). Ideal para revisar y probar los wireframes.
 *   'api'  → todas las llamadas van al backend Express del repositorio
 *            (src/backend). Requiere el servidor corriendo y CORS activo
 *            (ya viene con app.use(cors())).
 *
 * Para cambiar de modo sin editar este archivo, ejecuta en la consola:
 *   localStorage.setItem('eduder_mode', 'api'); location.reload();
 */
(function () {
  'use strict';

  var override = null;
  try { override = localStorage.getItem('eduder_mode'); } catch (e) { /* almacenamiento bloqueado */ }

  window.EduDer = window.EduDer || {};
  window.EduDer.config = {
    MODE: override === 'api' || override === 'mock' ? override : 'mock',

    // Misma base que src/admin/src/services/api.js del repositorio.
    // En un emulador Android usar http://10.0.2.2:3000
    API_BASE_URL: 'http://localhost:3000',

    // Claves de almacenamiento compatibles con la app móvil y el panel admin
    TOKEN_KEY: 'eduder_token',
    ADMIN_TOKEN_KEY: 'eduder_admin_token',
    USER_KEY: 'eduder_usuario',

    // Reglas de negocio (documento EduDer, sección 4)
    DOMINIO: 'miremington.edu.co', // estudiantes (RF-01). La administración usa @uniremington.edu.co
    UMBRAL_APROBACION: 70,     // RF-12 / RN-08
    MAX_INTENTOS_LOGIN: 5,     // RF-05
    BLOQUEO_MINUTOS: 15,       // RF-05
    MAX_PISTAS: 2,             // RF-11
    TOKEN_RECUPERACION_MIN: 30 // RF-19
  };
})();
