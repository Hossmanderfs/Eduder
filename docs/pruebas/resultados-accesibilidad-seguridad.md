# Resultados RNF-05 (accesibilidad) y RNF-03 (seguridad básica)

Fecha: 15/11/2026 · Entorno: Node 22 + MariaDB 10.11 en contenedor (repetir en equipo del grupo).

## RNF-05 — Accesibilidad del panel web (`/panel/`)
Herramienta: axe-core 4.x (gratuita) ejecutada con Playwright/Chromium, reglas WCAG 2.0 A/AA y 2.1 AA, pantalla de acceso.

| Medición | Antes | Después |
|---|---|---|
| Violaciones axe (contraste ≥ 4,5:1, etiquetas, roles) | 0 (10 reglas aprobadas) | 0 |
| Objetivos táctiles < 44 px (campos correo/contraseña 37 px, botón 40 px) | 3 | 0 |

Corrección: `min-height: 44px` en `#auth-email`, `#auth-pass` y `.btn-full` (`src/admin/index.html`).
Límite: solo se auditó la pantalla de acceso del panel; la app móvil (React Native) requiere revisión manual con TalkBack/VoiceOver (pendiente del grupo).

## RNF-03 — Seguridad básica
| Verificación | Resultado |
|---|---|
| Contraseñas almacenadas con bcrypt (`$2b$10$`) | Verificado en `contrasena_hash`: todos los hashes son bcrypt con coste 10 (prefijos `$2a$10$` y `$2b$10$`) |
| Entrada mal formada / inyección SQL en login | Responde 400/401 con `{ "message": ... }`, sin detalles internos (ORM con consultas parametrizadas) |
| Ruta protegida sin token (`GET /profile/summary`, `GET /admin/users`) | 401 |
| Cabeceras: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, sin `X-Powered-By` | Añadidas en `app.js` (antes ausentes) |
| HSTS | Se envía solo si la petición llega por HTTPS (`X-Forwarded-Proto`); verificado |
| TLS/HTTPS | **No se termina TLS en la API de desarrollo**: se exige un proxy inverso (Nginx/Render/Railway) con certificado en producción. No medido aquí. |

## Verificación en el equipo del grupo (17/11/2026)
| Verificación | Resultado |
|---|---|
| Lighthouse (Chrome DevTools) sobre `/panel/`, tema oscuro | Rendimiento 100 · Accesibilidad 96 · Prácticas recomendadas 96 · SEO 90 |
| Hashes en `usuarios.contrasena_hash` (MySQL 8.0.43) | Prefijo `$2a$10$`, longitud 60 en todas las filas consultadas (RN-02) |
| `GET /profile/summary` sin token en el navegador | `{"message":"Token requerido"}` (401) |
| `rnf06_integridad.sql` en MySQL Shell (MySQL 8.0.43) | 13 relaciones con 0 huérfanos; ERROR 1451 al borrar un nivel con lecciones y una lección con progreso |

Pendiente: revisar la app móvil con TalkBack y llevar la accesibilidad del panel de 96 a 100.
