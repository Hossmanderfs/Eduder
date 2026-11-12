# M3 — Componentes de Arquitectura → Arquetipos → RF

| Componente / Módulo | Arquetipos que Gestiona | RF que Implementa | Interfaces Expuestas |
|---|---|---|---|
| Auth Service | Usuario, TokenRecuperacion | RF-01–RF-06, RF-19, RF-20 | POST /auth/register, POST /auth/login, POST /auth/recover, DELETE /auth/session |
| Lesson Service | Nivel, Leccion, ContenidoLeccion | RF-07, RF-08 | GET /levels, GET /lessons/:id, GET /lessons/:id/content |
| Exercise Engine | Ejercicio, Pista | RF-10, RF-11 | POST /exercise/answer, GET /exercise/:id/hint |
| Progress Service | ProgresoLeccion, PerfilEstudiante | RF-09, RF-12 | PUT /progress/:id, GET /profile/summary |
| Gamification Service | MedallaCatalogo, MedallaUsuario, RankingSemanal | RF-14, RF-15, RF-17 | GET /medals, GET /ranking/:nivel |
| Notification Service | Notificaciones | RF-13, RF-16 | POST /notifications/send (interno) |
| Backup Service | Todas las tablas BD | RF-23 | Cron job /backup/run (interno) |
| Admin Panel (Web) / Admin Service | Usuario (gestión), Nivel, Leccion, Ejercicio, MedallaCatalogo (contenido) | RF-20, RF-21, RF-22, RF-25, RF-26, RF-27, RF-28 | Panel web — GET /admin/users, PATCH /admin/users/:id, GET /admin/metrics, POST/PUT/DELETE /admin/niveles, /admin/lecciones, /admin/ejercicios, /admin/medallas |
| App Móvil (React Native) | Todas las entidades (UI) | Todos los RF de cara al estudiante | Pantallas: Splash, Registro, Login, Menú, Lección, Perfil, Ranking |
