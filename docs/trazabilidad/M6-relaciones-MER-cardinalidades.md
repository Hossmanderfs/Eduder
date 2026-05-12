# M6 — Relaciones MER → Cardinalidades → Implementación en DDL

| Relación (MER) | Cardinalidad | Implementación en DDL | RF / RN Origen |
|----------------|-------------|----------------------|----------------|
| ROL → USUARIOS | 1:N (un rol agrupa muchos usuarios) | FK usuarios.id_rol → rol.id_rol; DEFAULT 'estudiante' | RF-03 |
| USUARIOS → PERFIL_ESTUDIANTE | 1:1 obligatorio | UNIQUE(id_usuario) + FK ON DELETE CASCADE | RF-02 |
| USUARIOS → TOKENS_RECUPERACION | 1:N (0 o varios) | FK fk_token_usuario ON DELETE CASCADE | RF-19 |
| USUARIOS → PROGRESO_LECCION | 1:N (0 o varios) | FK fk_prog_usuario; UNIQUE(id_usuario,id_leccion) | RF-09 |
| USUARIOS → MEDALLAS_USUARIO | 1:N (0 o varias) | FK fk_med_usuario; UNIQUE(id_usuario,id_medalla) | RF-14 |
| USUARIOS → NOTIFICACIONES | 1:N (0 o varias) | FK fk_noti_usuario | RF-16 |
| USUARIOS → RANKING_SEMANAL | 1:N (0 o varios) | FK fk_rank_usuario; UNIQUE compuesto | RF-17 |
| NIVELES → LECCIONES | 1:N obligatorio | FK fk_leccion_nivel ON DELETE RESTRICT | RF-07, RF-08 |
| NIVELES → RANKING_SEMANAL | 1:N (0 o varios) | FK fk_rank_nivel | RF-17 |
| TIPO_LECCION → LECCIONES | 1:N | FK fk_leccion_tipo | RF-08 |
| LECCIONES → CONTENIDO_LECCION | 1:N (0 o varios) | FK fk_bloque_leccion ON DELETE CASCADE | RF-08 |
| LECCIONES → EJERCICIOS | 1:N obligatorio | FK fk_ejercicio_leccion ON DELETE CASCADE | RF-10 |
| LECCIONES → PROGRESO_LECCION | 1:N (0 o varios) | FK fk_prog_leccion | RF-09 |
| EJERCICIOS → PISTAS | 1:N (0, 1 o 2) | FK fk_pista_ejercicio + CHECK(numero_pista IN (1,2)) | RF-11 |
| MEDALLAS_CATALOGO → MEDALLAS_USUARIO | 1:N (0 o varios) | FK fk_med_catalogo | RF-14 |
