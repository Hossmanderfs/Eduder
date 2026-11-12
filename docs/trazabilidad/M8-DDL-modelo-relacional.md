# M8 — Script DDL → Modelo Relacional

| Instrucción DDL | Tabla Relacional | PK Definida | FK(s) Definida(s) | Restricciones (CHECK / UNIQUE / DEFAULT) |
|---|---|---|---|---|
| CREATE TABLE usuarios | usuarios | pk_usuarios → id_usuario CHAR(36) | — | uq_correo (correo_institucional); chk_correo (REGEXP '@(miremington|uniremington)\\.edu\\.co$'); DEFAULT 'estudiante'; DEFAULT 'activo' |
| CREATE TABLE perfil_estudiante | perfil_estudiante | pk_perfil → id_perfil CHAR(36) | fk_perfil_usuario → id_usuario REF usuarios | uq_perfil_usuario (id_usuario); DEFAULT 1, 0, 0 para nivel, xp, streak |
| CREATE TABLE niveles | niveles | pk_niveles → id_nivel TINYINT UNSIGNED | — | DEFAULT 70 (umbral_aprobacion); DEFAULT 'activo' |
| CREATE TABLE lecciones | lecciones | pk_lecciones → id_leccion CHAR(36) | fk_leccion_nivel → id_nivel REF niveles ON DELETE RESTRICT | ENUM tipo ('teoria','ejercicio','mini_juego','caso_practico'); DEFAULT 50 (xp_base) |
| CREATE TABLE ejercicios | ejercicios | pk_ejercicios → id_ejercicio CHAR(36) | fk_ejercicio_leccion → id_leccion REF lecciones ON DELETE CASCADE | ENUM tipo_interaccion; NOT NULL enunciado, respuesta_correcta, explicacion |
| CREATE TABLE pistas | pistas | pk_pistas → id_pista CHAR(36) | fk_pista_ejercicio → id_ejercicio REF ejercicios ON DELETE CASCADE | chk_num_pista CHECK(numero_pista IN (1,2)) |
| CREATE TABLE progreso_leccion | progreso_leccion | pk_progreso → id_progreso CHAR(36) | fk_prog_usuario → id_usuario REF usuarios; fk_prog_leccion → id_leccion REF lecciones | chk_puntaje CHECK(puntaje BETWEEN 0 AND 100); DEFAULT 'no_iniciada' |
| CREATE TABLE medallas_catalogo | medallas_catalogo | pk_medallas_cat → id_medalla CHAR(36) | — | ENUM condicion_tipo; NOT NULL condicion_valor, icono_url, nombre; DEFAULT 'activo' (estado) |
| CREATE TABLE medallas_usuario | medallas_usuario | pk_med_usuario → id_med_usuario CHAR(36) | fk_med_usuario → id_usuario REF usuarios; fk_med_catalogo → id_medalla REF medallas_catalogo | UNIQUE(id_usuario, id_medalla); NOT NULL fecha_obtencion |
| CREATE TABLE notificaciones | notificaciones | pk_notificaciones → id_notificacion CHAR(36) | fk_noti_usuario → id_usuario REF usuarios | DEFAULT FALSE (leida); ENUM tipo; NOT NULL mensaje |
| CREATE TABLE ranking_semanal | ranking_semanal | pk_ranking → id_ranking CHAR(36) | fk_rank_usuario → id_usuario REF usuarios; fk_rank_nivel → id_nivel REF niveles | UNIQUE(semana_inicio, id_usuario, id_nivel); DEFAULT 0 (xp_semana, posicion) |
| CREATE TABLE tokens_recuperacion | tokens_recuperacion | pk_tokens → id_token CHAR(36) | fk_token_usuario → id_usuario REF usuarios | NOT NULL expira_en; DEFAULT FALSE (usado) |
