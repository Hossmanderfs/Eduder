# M8 — Script DDL → Modelo Relacional

| Elemento DDL | Construcción en Modelo Relacional | Verificación |
|-------------|----------------------------------|-------------|
| `CREATE TABLE rol` | Relación ROL(id_rol PK, tipo_rol) | ✓ Coincide con E9 |
| `CREATE TABLE usuarios` | Relación USUARIOS(id_usuario PK, …, id_rol FK) | ✓ FK tipo CHAR(10) = rol.id_rol CHAR(10) |
| `CREATE TABLE perfil_estudiante` | Relación PERFIL_ESTUDIANTE(id_perfil PK, id_usuario FK UNIQUE) | ✓ UNIQUE garantiza 1:1 |
| `CREATE TABLE tokens_recuperacion` | Relación TOKENS_RECUPERACION(id_token PK, id_usuario FK) | ✓ |
| `CREATE TABLE niveles` | Relación NIVELES(id_nivel PK, …) | ✓ 5 filas de seed |
| `CREATE TABLE tipo_leccion` | Relación TIPO_LECCION(id_tipo PK, …) | ✓ 4 filas de seed |
| `CREATE TABLE lecciones` | Relación LECCIONES(id_leccion PK, id_nivel FK, tipo FK) | ✓ Dos FK activas |
| `CREATE TABLE contenido_leccion` | Relación CONTENIDO_LECCION(id_bloque PK, id_leccion FK) | ✓ ON DELETE CASCADE |
| `CREATE TABLE ejercicios` | Relación EJERCICIOS(id_ejercicio PK, id_leccion FK) | ✓ ON DELETE CASCADE |
| `CREATE TABLE pistas` | Relación PISTAS(id_pista PK, id_ejercicio FK) | ✓ CHECK(numero_pista IN(1,2)) |
| `CREATE TABLE progreso_leccion` | Relación PROGRESO_LECCION(id_progreso PK, id_usuario FK, id_leccion FK) | ✓ UNIQUE compuesto |
| `CREATE TABLE medallas_catalogo` | Relación MEDALLAS_CATALOGO(id_medalla PK, …) | ✓ |
| `CREATE TABLE medallas_usuario` | Relación MEDALLAS_USUARIO(id_med_usuario PK, id_usuario FK, id_medalla FK) | ✓ Tabla asociativa |
| `CREATE TABLE notificaciones` | Relación NOTIFICACIONES(id_notificacion PK, id_usuario FK) | ✓ |
| `CREATE TABLE ranking_semanal` | Relación RANKING_SEMANAL(id_ranking PK, id_usuario FK, id_nivel FK) | ✓ UNIQUE(semana, usuario, nivel) |
| Datos de prueba (INSERT) | Poblan rol, usuarios, perfil_estudiante, niveles, tipo_leccion | ✓ FK válidas en orden de inserción |
