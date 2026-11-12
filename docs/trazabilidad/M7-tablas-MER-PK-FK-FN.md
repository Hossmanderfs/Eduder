# M7 — Tablas → Entidades MER → PK / FK → Forma Normal

| Tabla Relacional | Entidad MER Origen | PK | FK(s) | Forma Normal Verificada |
|---|---|---|---|---|
| usuarios | USUARIOS | id_usuario (UUID) | — | 3FN: todos los atributos dependen únicamente de id_usuario |
| perfil_estudiante | PERFIL_ESTUDIANTE | id_perfil (UUID) | id_usuario → usuarios | 3FN: xp_total, streak_dias, etc. dependen de id_perfil, no de datos del usuario |
| niveles | NIVELES | id_nivel (TINYINT) | — | 3FN: sin dependencias transitivas; 5 filas fijas |
| lecciones | LECCIONES | id_leccion (UUID) | id_nivel → niveles | 3FN: todos los atributos dependen de id_leccion |
| ejercicios | EJERCICIOS | id_ejercicio (UUID) | id_leccion → lecciones (CASCADE) | 3FN: enunciado, respuesta_correcta, explicacion dependen de id_ejercicio |
| pistas | PISTAS | id_pista (UUID) | id_ejercicio → ejercicios (CASCADE) | 3FN: texto_pista depende de id_pista; numero_pista es atributo propio del ejercicio |
| progreso_leccion | PROGRESO_LECCION | id_progreso (UUID) | id_usuario → usuarios; id_leccion → lecciones | 3FN: estado, puntaje, intentos dependen del id_progreso completo |
| medallas_catalogo | MEDALLAS_CATALOGO | id_medalla (UUID) | — | 3FN: condicion_tipo, condicion_valor, icono_url dependen de id_medalla |
| medallas_usuario | MEDALLAS_USUARIO (asociativa) | id_med_usuario (UUID) | id_usuario → usuarios; id_medalla → medallas_catalogo | 3FN: fecha_obtencion es el único atributo no clave; depende del id propio |
| notificaciones | NOTIFICACIONES | id_notificacion (UUID) | id_usuario → usuarios | 3FN: tipo, mensaje, leida dependen de id_notificacion |
| ranking_semanal | RANKING_SEMANAL | id_ranking (UUID) | id_usuario → usuarios; id_nivel → niveles | 3FN: xp_semana, posicion dependen de id_ranking; UNIQUE(semana_inicio, id_usuario, id_nivel) |
| tokens_recuperacion | TOKENS_RECUPERACION | id_token (UUID) | id_usuario → usuarios | 3FN: token_hash, expira_en, usado dependen de id_token |
