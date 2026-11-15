-- RNF-06 · Integridad referencial — verificación para la Ficha de Auditoría (Bloque 2)
-- Ejecutar en MySQL Workbench o cliente mysql sobre la base `eduder`, DESPUÉS de completar
-- un flujo de registro, lección y medalla. Resultado esperado: 0 filas en cada consulta A
-- y error 1451 en cada intento B.
USE eduder;

-- A. Registros huérfanos (esperado: 0 en todas)
SELECT 'perfil_estudiante → usuarios' AS relacion, COUNT(*) AS huerfanos FROM perfil_estudiante c LEFT JOIN usuarios p ON p.id_usuario = c.id_usuario WHERE p.id_usuario IS NULL
UNION ALL SELECT 'tokens_recuperacion → usuarios', COUNT(*) FROM tokens_recuperacion c LEFT JOIN usuarios p ON p.id_usuario = c.id_usuario WHERE p.id_usuario IS NULL
UNION ALL SELECT 'lecciones → niveles', COUNT(*) FROM lecciones c LEFT JOIN niveles p ON p.id_nivel = c.id_nivel WHERE p.id_nivel IS NULL
UNION ALL SELECT 'contenido_leccion → lecciones', COUNT(*) FROM contenido_leccion c LEFT JOIN lecciones p ON p.id_leccion = c.id_leccion WHERE p.id_leccion IS NULL
UNION ALL SELECT 'ejercicios → lecciones', COUNT(*) FROM ejercicios c LEFT JOIN lecciones p ON p.id_leccion = c.id_leccion WHERE p.id_leccion IS NULL
UNION ALL SELECT 'pistas → ejercicios', COUNT(*) FROM pistas c LEFT JOIN ejercicios p ON p.id_ejercicio = c.id_ejercicio WHERE p.id_ejercicio IS NULL
UNION ALL SELECT 'progreso_leccion → usuarios', COUNT(*) FROM progreso_leccion c LEFT JOIN usuarios p ON p.id_usuario = c.id_usuario WHERE p.id_usuario IS NULL
UNION ALL SELECT 'progreso_leccion → lecciones', COUNT(*) FROM progreso_leccion c LEFT JOIN lecciones p ON p.id_leccion = c.id_leccion WHERE p.id_leccion IS NULL
UNION ALL SELECT 'medallas_usuario → usuarios', COUNT(*) FROM medallas_usuario c LEFT JOIN usuarios p ON p.id_usuario = c.id_usuario WHERE p.id_usuario IS NULL
UNION ALL SELECT 'medallas_usuario → medallas_catalogo', COUNT(*) FROM medallas_usuario c LEFT JOIN medallas_catalogo p ON p.id_medalla = c.id_medalla WHERE p.id_medalla IS NULL
UNION ALL SELECT 'notificaciones → usuarios', COUNT(*) FROM notificaciones c LEFT JOIN usuarios p ON p.id_usuario = c.id_usuario WHERE p.id_usuario IS NULL
UNION ALL SELECT 'ranking_semanal → usuarios', COUNT(*) FROM ranking_semanal c LEFT JOIN usuarios p ON p.id_usuario = c.id_usuario WHERE p.id_usuario IS NULL
UNION ALL SELECT 'ranking_semanal → niveles', COUNT(*) FROM ranking_semanal c LEFT JOIN niveles p ON p.id_nivel = c.id_nivel WHERE p.id_nivel IS NULL;

-- B. Borrados físicos que deben ser rechazados por la clave foránea (esperado: ERROR 1451 en cada uno)
START TRANSACTION;
-- B1. Un nivel que tiene lecciones
DELETE FROM niveles WHERE id_nivel = (SELECT id_nivel FROM lecciones LIMIT 1);
-- B2. Una lección que tiene progreso asociado
DELETE FROM lecciones WHERE id_leccion = (SELECT id_leccion FROM progreso_leccion LIMIT 1);
ROLLBACK;
-- Nota: si el cliente se detiene en el primer error, ejecute B1 y B2 por separado.
