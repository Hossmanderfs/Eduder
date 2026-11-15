# Resultado RNF-06 — integridad referencial (rnf06_integridad.sql)

Ejecutado 2026-11-15T18:28:19Z en MariaDB 10.11.14-MariaDB-0ubuntu0.24.04.1 con DDL v1.2 y contenido de `npm run seed` más un flujo de registro y lección completada. Criterio: 0 huérfanos en las 13 relaciones y 100 % de los borrados que violan RESTRICT rechazados. Se ejecuta con `mysql --force` para que el segundo borrado también se intente.

```
+----------------------------------------+-----------+
| relacion                               | huerfanos |
+----------------------------------------+-----------+
| perfil_estudiante → usuarios         |         0 |
| tokens_recuperacion → usuarios       |         0 |
| lecciones → niveles                  |         0 |
| contenido_leccion → lecciones        |         0 |
| ejercicios → lecciones               |         0 |
| pistas → ejercicios                  |         0 |
| progreso_leccion → usuarios          |         0 |
| progreso_leccion → lecciones         |         0 |
| medallas_usuario → usuarios          |         0 |
| medallas_usuario → medallas_catalogo |         0 |
| notificaciones → usuarios            |         0 |
| ranking_semanal → usuarios           |         0 |
| ranking_semanal → niveles            |         0 |
+----------------------------------------+-----------+
--------------
DELETE FROM niveles WHERE id_nivel = (SELECT id_nivel FROM lecciones LIMIT 1)
--------------

ERROR 1451 (23000) at line 25: Cannot delete or update a parent row: a foreign key constraint fails (`eduder`.`lecciones`, CONSTRAINT `fk_leccion_nivel` FOREIGN KEY (`id_nivel`) REFERENCES `niveles` (`id_nivel`))
--------------
DELETE FROM lecciones WHERE id_leccion = (SELECT id_leccion FROM progreso_leccion LIMIT 1)
--------------

ERROR 1451 (23000) at line 27: Cannot delete or update a parent row: a foreign key constraint fails (`eduder`.`progreso_leccion`, CONSTRAINT `fk_prog_leccion` FOREIGN KEY (`id_leccion`) REFERENCES `lecciones` (`id_leccion`))
```

Lectura: 13 relaciones con 0 huérfanos; los 2 borrados físicos indebidos (nivel con lecciones y lección con progreso) fueron rechazados por `fk_leccion_nivel` y `fk_prog_leccion` (ERROR 1451): 2 de 2, como exige RNF-06.
