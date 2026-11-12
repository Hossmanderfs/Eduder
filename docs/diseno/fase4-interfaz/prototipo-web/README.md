# EduDer — Frontend web de los wireframes (WF-01 a WF-16)

Implementación funcional en HTML/CSS/JS (sin frameworks ni build) de los 16 wireframes de la sección **8.4.2** del documento, más las pantallas del **Mapa de navegación (8.4.1)** que no tenían wireframe propio. Ya está conectado a las rutas reales del backend Express del repositorio `Hossmanderfs/Eduder` (`src/backend`).

## Cómo abrirlo

- **Modo demostración (por defecto):** abre `index.html` con doble clic. Funciona sin servidor ni internet; los datos se guardan en el `localStorage` del navegador.
  - Estudiante: `juan.perez@miremington.edu.co` / `Eduder2026` (ya tiene el nivel 1 aprobado y avance en el nivel 2)
  - Administrador: `admin@uniremington.edu.co` / `Admin2026`
  - Para reiniciar los datos de prueba: en la consola del navegador, `localStorage.clear()`.
- **Modo API (backend real):** levanta el backend (`cd src/backend && npm start`, puerto 3000) y ejecuta en la consola:
  `localStorage.setItem('eduder_mode','api'); location.reload();`
  También puedes cambiar `MODE` y `API_BASE_URL` en `js/config.js`.

> Se recomienda servir la carpeta con un servidor local (por ejemplo `npx serve .` o la extensión Live Server de VS Code) cuando se use el modo API.

## Estructura

```
index.html                  WF-00 Splash / Bienvenida
pages/
  wf04-registro.html        WF-04 Registro            (RF-01, RF-02)
  wf05-login.html           WF-05 Login               (RF-03…RF-06, RF-20)
  wf06-recuperar.html       WF-06 Recuperar contraseña (RF-19)
  wf07-tutorial.html        WF-07 Tutorial de bienvenida
  wf01-menu.html            WF-01 Menú principal
  wf08-niveles.html         WF-08 Selección de nivel  (RF-07, RF-08)
  wf09-lecciones.html       WF-09 Selección de lección
  leccion-teoria.html       Lección: Teoría           (mapa de navegación, pantalla 9)
  wf02-ejercicio.html       WF-02 Ejercicio           (RF-10, RF-11)
  wf10-feedback.html        WF-10 Feedback de respuesta
  mini-juego.html           Mini-juego                (mapa de navegación, pantalla 12)
  wf11-resumen.html         WF-11 Resumen de lección  (RF-12…RF-15)
  wf03-perfil.html          WF-03 Perfil del estudiante (RF-18)
  historial.html            Historial de lecciones    (destino de WF-03)
  wf12-ranking.html         WF-12 Ranking semanal     (RF-17)
  perfil-publico.html       Perfil de otro usuario, solo lectura (destino de WF-12)
  wf13-medallas.html        WF-13 Medallas
  wf16-notificaciones.html  WF-16 Notificaciones      (RF-16)
admin/
  wf14-usuarios.html        WF-14 Gestión de usuarios (RF-20, RF-21)
  wf15-metricas.html        WF-15 Métricas y exportación CSV (RF-22)
css/eduder.css              Sistema visual (modo claro y oscuro)
css/admin.css               Estilos del panel admin
js/config.js                Modo (mock/api), URL del backend, reglas de negocio
js/api.js                   Capa de datos única + lógica de desbloqueo de niveles/lecciones
js/store.js                 Backend simulado (mismos contratos que el Express)
js/content.js               Contenido semilla: 5 niveles, 15 lecciones, 45 ejercicios, 12 medallas
js/ui.js                    Utilidades compartidas (sesión, tab bar, diálogos, avisos, tema)
js/admin.js                 Barra lateral del panel admin
js/icons.js, fonts/         Tabler Icons (MIT) y Lexend (OFL), incluidos para funcionar sin internet
```

## Flujo completo que funciona

Registro → Tutorial → Menú → Niveles → Lecciones → Teoría → Ejercicio (selección múltiple, completar, arrastrar) → Pistas (máx. 2) → Feedback → Mini-juego → Resumen con puntaje, XP, racha, medallas nuevas y desbloqueo de nivel (≥70 %) → Perfil → Historial → Medallas → Ranking → Notificaciones. Admin: métricas por rango de fechas con tendencia, exportación CSV, búsqueda de usuarios y activar/desactivar con confirmación (al desactivar, la sesión del estudiante se cierra).

Accesibilidad (RNF-05, WCAG 2.1 AA): etiquetas en todos los campos, mensajes de error anunciados, foco visible, objetivos táctiles de 44 px o más, arrastrar también se puede hacer tocando o con teclado, respeta “reducir movimiento” y funciona en modo claro y oscuro (botón de tema en Perfil y en el panel admin).

## Rutas del backend que usa

| Pantalla | Método y ruta |
|---|---|
| WF-04 | `POST /auth/register` |
| WF-05 | `POST /auth/login` |
| WF-06 | `POST /auth/recover` |
| Cerrar sesión | `DELETE /auth/session` |
| WF-01, WF-08, WF-09 | `GET /levels`, `GET /profile/progress`, `GET /profile/summary` |
| Teoría, WF-02 | `GET /lessons/:id/content`, `PUT /progress/:id` (`en_progreso`) |
| WF-02 | `POST /exercise/answer`, `GET /exercise/:id/hint?numero=1\|2` |
| WF-11 | `PUT /progress/:id` (`completada`, `puntaje`) |
| WF-03, Historial | `GET /profile/summary`, `GET /profile/progress` |
| WF-13 | `GET /gamification/medals` |
| WF-12 | `GET /gamification/ranking/:nivel` |
| WF-14 | `GET /admin/users`, `PATCH /admin/users/:id` |
| WF-15 | `GET /admin/metrics` |

## Brechas del backend encontradas (para completar la integración)

1. **Opciones de los ejercicios.** La tabla `EJERCICIOS` no tiene dónde guardar las opciones (selección múltiple/completar) ni las piezas (arrastrar), y `GET /lessons/:id/content` no las envía. Recomendado: columna `opciones JSON` y `piezas JSON` incluidas en esa respuesta. Mientras tanto, el frontend acepta el formato `"Enunciado || opción A | opción B | opción C"` dentro de `enunciado`.
2. **Formato de `respuesta_correcta`:** selección múltiple = texto de la opción; completar = la palabra del espacio; arrastrar = piezas en orden unidas con `" | "`.
3. **Notificaciones:** faltan `GET /notifications` (todas) y `PATCH /notifications/read-all`. Sin ellas, WF-16 muestra solo las no leídas que vienen en `/profile/summary` y no puede marcarlas.
4. **Métricas (WF-15):** `GET /admin/metrics` no filtra por fechas ni devuelve puntaje promedio, tendencia ni detalle diario. Forma propuesta:
   `GET /admin/metrics?desde=AAAA-MM-DD&hasta=AAAA-MM-DD` → `{ desde, hasta, kpis:{usuarios_activos, lecciones_completadas, puntaje_promedio}, previo:{…mismos campos}, serie:[{fecha, usuarios_activos, lecciones_completadas, puntaje_promedio}] }`. Con la respuesta actual, la pantalla muestra lo disponible.
5. **Desbloqueo de nivel:** `progress.service.js` no actualiza `nivel_actual` ni da XP bonus al aprobar un nivel (RF-12, DS-03). El frontend calcula el desbloqueo a partir del progreso, así que funciona igual, pero conviene hacerlo en el backend.
6. **Medallas:** `evaluarMedallas()` solo evalúa `xp_acumulado` y `streak`; faltan `nivel_completado` y `puntaje_perfecto` (RF-14).
7. **Desactivar cuenta (RF-20):** `verifyToken` no revisa `estado`, así que un usuario desactivado sigue usando su token hasta que expire. El comentario del código dice lo contrario.
8. **JWT:** expira en `7d` por `.env.example`; RF-03 pide 24 horas.
9. **Repetir lección:** el backend sobrescribe el puntaje con el último intento; el modo demo conserva el mejor. Definir cuál regla se quiere.
10. **App móvil existente:** `src/mobile/src/screens/LessonScreen.js` llama a `/exercise/evaluate` y `/exercise/:id/hint/:numero`, pero el backend expone `/exercise/answer` y `/exercise/:id/hint?numero=`.

## Decisiones tomadas donde el documento no especificaba

- Contraseña de registro: mínimo 8 caracteres con al menos una letra y un número (el backend hoy solo exige que no esté vacía).
- Puntaje de lección = % de ejercicios acertados al primer intento + aciertos del mini-juego. XP = `xp_base × puntaje / 100`, igual que `progress.service.js`.
- Tras 2 intentos fallidos aparece “Saltar este ejercicio” (cuenta como no acertado) para que el estudiante no quede bloqueado.
- La barra de pestañas usa “Niveles” (WF-01) en vez de “Lecciones” (WF-08), que eran inconsistentes.
- Colores: paleta institucional del repositorio (`src/mobile/src/theme/colors.js`): azul `#003DA5`, rojo `#C8102E`, dorado para XP.
