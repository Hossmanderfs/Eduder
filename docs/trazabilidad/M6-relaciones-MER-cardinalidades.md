# M6 — Relaciones MER → Cardinalidades → Implementación en DDL

| Relación MER | Cardinalidad | Regla de Negocio Derivada |
|---|---|---|
| USUARIOS — PERFIL_ESTUDIANTE | 1:1 obligatoria | Todo usuario con rol 'estudiante' debe tener exactamente un perfil; se crea automáticamente al registrarse. Un administrador no tiene perfil. |
| USUARIOS — PROGRESO_LECCION | 1:N | Un estudiante puede tener registros de progreso en múltiples lecciones. Se crea un registro por cada lección que el estudiante inicie. |
| USUARIOS — MEDALLAS_USUARIO | 1:N | Un estudiante puede acumular múltiples medallas a lo largo del tiempo; una medalla específica se otorga una sola vez por usuario. |
| USUARIOS — TOKENS_RECUPERACION | 1:N | Un usuario puede solicitar múltiples tokens de recuperación, pero solo el más reciente y no expirado es válido. |
| NIVELES — LECCIONES | 1:N obligatoria | Cada lección pertenece a exactamente un nivel. Un nivel debe tener entre 8 y 12 lecciones activas. |
| LECCIONES — EJERCICIOS | 1:N obligatoria | Cada ejercicio pertenece a exactamente una lección. Una lección puede tener múltiples ejercicios presentados en orden ascendente de dificultad. |
| EJERCICIOS — PISTAS | 1:N (máx. 2) | Cada ejercicio tiene entre 0 y 2 pistas. El límite de 2 se aplica tanto en BD (CHECK) como en capa de negocio. |
| MEDALLAS_CATALOGO — MEDALLAS_USUARIO | 1:N | Una medalla del catálogo puede ser obtenida por múltiples usuarios. La relación registra cuándo fue obtenida (fecha_obtencion). |
| NIVELES — RANKING_SEMANAL | 1:N | Cada nivel tiene su propio ranking semanal independiente; no existe un ranking global entre niveles. |
| USUARIOS — NOTIFICACIONES | 1:N | Un usuario puede recibir múltiples notificaciones (racha, logro, sistema). |
| USUARIOS — RANKING_SEMANAL | 1:N | Un usuario tiene un registro por cada semana y nivel participado (RN-17). |
| LECCIONES — CONTENIDO_LECCION | 1:N | Una lección tiene múltiples bloques de contenido ordenados. |
| LECCIONES — PROGRESO_LECCION | 1:N | Una lección puede tener registros de progreso de muchos usuarios (RN-21: no se elimina si hay progreso). |
