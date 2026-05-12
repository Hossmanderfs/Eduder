# M7 — Tablas → Entidades MER → PK / FK → Forma Normal

| Tabla | Entidad MER | PK | Claves Foráneas | Forma Normal | Observación |
|-------|------------|-----|-----------------|-------------|-------------|
| rol | ROL | id_rol | — | 3FN | Catálogo de 2 filas; sin dependencias transitivas |
| usuarios | USUARIOS | id_usuario | id_rol → rol | 3FN | correo_institucional en UNIQUE, no en PK |
| perfil_estudiante | PERFIL_ESTUDIANTE | id_perfil | id_usuario → usuarios | 3FN | xp_semana_actual es caché aceptada (excepción documentada) |
| tokens_recuperacion | TOKENS_RECUPERACION | id_token | id_usuario → usuarios | 3FN | |
| niveles | NIVELES | id_nivel | — | 3FN | |
| tipo_leccion | TIPO_LECCION | id_tipo | — | 3FN | |
| lecciones | LECCIONES | id_leccion | id_nivel → niveles, tipo → tipo_leccion | 3FN | |
| contenido_leccion | CONTENIDO_LECCION | id_bloque | id_leccion → lecciones | 3FN | |
| ejercicios | EJERCICIOS | id_ejercicio | id_leccion → lecciones | 3FN | |
| pistas | PISTAS | id_pista | id_ejercicio → ejercicios | 3FN | CHECK limita a 2 pistas por ejercicio |
| progreso_leccion | PROGRESO_LECCION | id_progreso | id_usuario → usuarios, id_leccion → lecciones | 3FN | UNIQUE compuesto garantiza 1 registro por par usuario-lección |
| medallas_catalogo | MEDALLAS_CATALOGO | id_medalla | — | 3FN | |
| medallas_usuario | MEDALLAS_USUARIO | id_med_usuario | id_usuario → usuarios, id_medalla → medallas_catalogo | 3FN | Tabla asociativa N:M |
| notificaciones | NOTIFICACIONES | id_notificacion | id_usuario → usuarios | 3FN | |
| ranking_semanal | RANKING_SEMANAL | id_ranking | id_usuario → usuarios, id_nivel → niveles | 3FN | posicion es caché aceptada (excepción documentada) |
