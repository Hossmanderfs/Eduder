# E5 — Diagrama de Componentes UML

| Capa / Componente | Interfaces Provistas | Dependencias (usa) |
|---|---|---|
| «Componente» App Móvil (React Native) | IU Estudiante: Splash, Registro, Login, Menú, Lección, Perfil, Ranking | API Gateway (HTTPS); FCM SDK; APNs SDK |
| «Componente» Panel Admin (React.js) | IU Administrador: Gestión Usuarios, Métricas, Exportación CSV | API Gateway (HTTPS) |
| «Componente» API Gateway | Punto único de entrada HTTPS desde la app móvil y el panel; enruta hacia los servicios de aplicación (única interfaz pública del backend) | Auth Service; Lesson Service; Exercise Engine; Progress Service; Gamification Service; Admin Service |
| «Componente» Auth Service | POST /auth/register; POST /auth/login; POST /auth/recover; DELETE /auth/session | BD: USUARIOS, TOKENS_RECUPERACION; SMTP Service |
| «Componente» Lesson Service | GET /levels; GET /lessons/:id; GET /lessons/:id/content | BD: NIVELES, LECCIONES, CONTENIDO_LECCION |
| «Componente» Exercise Engine | POST /exercise/answer; GET /exercise/:id/hint | BD: EJERCICIOS, PISTAS; Progress Service |
| «Componente» Progress Service | PUT /progress/:id; GET /profile/summary | BD: PROGRESO_LECCION, PERFIL_ESTUDIANTE; Gamification Service |
| «Componente» Gamification Service | GET /medals; GET /ranking/:nivel | BD: MEDALLAS_CATALOGO, MEDALLAS_USUARIO, RANKING_SEMANAL |
| «Componente» Notification Service | POST /notifications/send (interno, invocado por cron) | FCM API (Android); APNs API (iOS); BD: NOTIFICACIONES |
| «Componente» Backup Service | Cron job /backup/run (interno, 02:00 h diario) | BD: todas las tablas; AWS S3 / Firebase Storage |
| «Componente» Admin Service | GET /admin/users; PATCH /admin/users/:id; GET /admin/metrics | BD: USUARIOS; Auth Service (invalidar JWT) |
| «Componente» Base de Datos MySQL | Persistencia de todas las entidades del modelo relacional (13 tablas, 3FN) | Ninguna (capa de almacenamiento base) |

> 📎 Ver diagrama visual UML en `imagenes/E5-componentes.png`
