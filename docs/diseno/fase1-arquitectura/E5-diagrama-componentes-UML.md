# E5 — Diagrama de Componentes UML

| Capa / Componente | Interfaces Provistas | Dependencias |
|-------------------|---------------------|--------------|
| **App Móvil** (React Native) | IU Estudiante: Splash, Registro, Login, Menú, Lección, Perfil, Ranking | API Gateway (HTTPS); FCM SDK; APNs SDK |
| **Panel Admin** (React.js) | IU Administrador: Gestión Usuarios, Métricas, Exportación CSV | Admin API (HTTPS) |
| **Auth Service** | POST /auth/register; POST /auth/login; POST /auth/recover; DELETE /auth/session | BD: USUARIOS, TOKENS_RECUPERACION; SMTP |
| **Lesson Service** | GET /levels; GET /lessons/:id; GET /lessons/:id/content | BD: NIVELES, LECCIONES, CONTENIDO_LECCION |
| **Exercise Engine** | POST /exercise/answer; GET /exercise/:id/hint | BD: EJERCICIOS, PISTAS; Progress Service |
| **Progress Service** | PUT /progress/:id; GET /profile/summary | BD: PROGRESO_LECCION, PERFIL_ESTUDIANTE; Gamification Service |
| **Gamification Service** | GET /medals; GET /ranking/:nivel | BD: MEDALLAS_CATALOGO, MEDALLAS_USUARIO, RANKING_SEMANAL |
| **Notification Service** | POST /notifications/send (interno, cron) | FCM API; APNs API; BD: NOTIFICACIONES |
| **Backup Service** | Cron job /backup/run (02:00 h diario) | BD: todas las tablas; AWS S3 / Firebase Storage |
| **Admin Service** | GET /admin/users; PATCH /admin/users/:id; GET /admin/metrics | BD: USUARIOS; Auth Service |
| **Base de Datos MySQL** | Persistencia — 15 tablas, 3FN | — |

> 📎 Ver diagrama visual UML en `imagenes/E5-componentes.png`
