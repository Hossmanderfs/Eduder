# API REST — EduDer

Generado a partir de `src/backend/src/routes`. Autenticación: `Authorization: Bearer <JWT>`. `admin` = requiere rol administrador.

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/admin/metrics` | admin |
| GET | `/admin/metrics/export` | admin |
| GET | `/admin/users` | admin |
| PATCH | `/admin/users/:id` | admin |
| POST | `/auth/login` | público |
| POST | `/auth/recover` | público |
| POST | `/auth/register` | público |
| POST | `/auth/reset-password` | público |
| DELETE | `/auth/session` | token |
| POST | `/exercise` | admin |
| DELETE | `/exercise/:id` | admin |
| PUT | `/exercise/:id` | admin |
| GET | `/exercise/:id/hint` | token |
| POST | `/exercise/answer` | token |
| GET | `/exercise/by-lesson/:id_leccion` | admin |
| GET | `/gamification/admin/medals` | admin |
| GET | `/gamification/medals` | token |
| POST | `/gamification/medals` | admin |
| DELETE | `/gamification/medals/:id` | admin |
| PUT | `/gamification/medals/:id` | admin |
| GET | `/gamification/ranking/:nivel` | token |
| POST | `/lessons` | admin |
| DELETE | `/lessons/:id` | admin |
| GET | `/lessons/:id` | token |
| PUT | `/lessons/:id` | admin |
| GET | `/lessons/:id/content` | token |
| GET | `/lessons/all` | admin |
| GET | `/lessons/by-level/:id_nivel` | admin |
| GET | `/levels` | token |
| POST | `/levels` | admin |
| DELETE | `/levels/:id` | admin |
| GET | `/levels/:id` | token |
| PUT | `/levels/:id` | admin |
| GET | `/notifications` | token |
| PATCH | `/notifications/:id/read` | token |
| PATCH | `/notifications/read-all` | token |
| GET | `/profile/progress` | token |
| GET | `/profile/summary` | token |
| PUT | `/progress/:id` | token |

## Reglas de borrado (RN-20/21/22)
| Recurso | Regla | Respuesta |
|---|---|---|
| Nivel `DELETE /levels/:id` | Con lecciones asociadas no se elimina | 409 |
| Lección `DELETE /lessons/:id` | Con progreso de estudiantes se archiva (`estado=inactivo`); sin progreso se elimina | 200 `{archivado}` |
| Medalla `DELETE /gamification/medals/:id` | Si fue otorgada se marca inactiva; si no, se elimina | 200 `{archivado}` |

## KPIs y CSV (RF-22)
`GET /admin/metrics?desde=YYYY-MM-DD&hasta=YYYY-MM-DD` y `GET /admin/metrics/export` (CSV UTF-8).

## Tareas programadas
RF-17 reinicio semanal del XP (lunes 00:00) · RF-16 recordatorio de racha (18:00) · RF-23 backup diario (02:00). Ver `src/backend/src/jobs`.
