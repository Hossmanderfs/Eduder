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
|---|---|---|
| xp_total, nivel_actual, streak_dias en USUARIOS | Se mueve a PERFIL_ESTUDIANTE | No se sustenta en una dependencia transitiva demostrable (correo → xp_total no aplica). El criterio real es de responsabilidad: USUARIOS administra identidad/autenticación; PERFIL_ESTUDIANTE administra el progreso gamificado del estudiante |
| nombre, descripcion en MEDALLAS_USUARIO | Se mantiene solo en MEDALLAS_CATALOGO | Evita que cada usuario repita la descripción de la medalla (dependencia transitiva id_med_usuario → id_medalla → nombre_medalla) |
| bloqueado_hasta depende de intentos_login | Ambos en USUARIOS como atributos directos | La relación entre intentos y bloqueo es regla de negocio, no dependencia funcional de datos |
| xp_semana_actual en PERFIL_ESTUDIANTE | Atributo desnormalizado deliberadamente | Caché de consulta rápida justificado por RNF de carga ≤ 3 segundos |
| posicion en RANKING_SEMANAL | Atributo calculado almacenado | Se persiste para evitar recálculo costoso con 5 000 usuarios concurrentes (RNF-04) |
