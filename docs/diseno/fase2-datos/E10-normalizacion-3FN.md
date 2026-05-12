# E10 — Normalización (3FN)

El modelo cumple las tres primeras formas normales.

## 1FN — Atomicidad ✅
- Contenido multimedia separado en CONTENIDO_LECCION (un registro por bloque)
- Opciones de respuesta almacenadas como JSON en `respuesta_correcta`
- Pistas en entidad PISTAS separada

## 2FN — Sin Dependencias Parciales ✅
- Todas las tablas usan PK simple (UUID o TINYINT)
- PROGRESO_LECCION tiene PK propia (id_progreso) aunque posee dos FKs
- RANKING_SEMANAL tiene PK propia

## 3FN — Sin Dependencias Transitivas ✅

| Situación Analizada | Decisión de Diseño | Justificación 3FN |
|--------------------|--------------------|-------------------|
| xp_total, nivel_actual, streak_dias en USUARIOS | Se mueven a PERFIL_ESTUDIANTE | Evita: id_usuario → correo → xp_total |
| nombre, descripcion en MEDALLAS_USUARIO | Solo en MEDALLAS_CATALOGO | Evita: id_med_usuario → id_medalla → nombre_medalla |
| bloqueado_hasta depende de intentos_login | Ambos en USUARIOS | Es regla de negocio, no dependencia funcional |
| xp_semana_actual en PERFIL_ESTUDIANTE | Atributo desnormalizado deliberado | Caché justificado: RNF-02 (carga < 3 s) |
| posicion en RANKING_SEMANAL | Atributo calculado almacenado | Evita recálculo costoso con 5 000 usuarios (RNF-04) |
| MEDALLAS_USUARIO con PK propia | PK sustituta (UUID) + UNIQUE compuesto | Tabla asociativa con clave de negocio UNIQUE(id_usuario, id_medalla) |
