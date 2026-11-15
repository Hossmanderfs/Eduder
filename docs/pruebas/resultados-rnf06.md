# Resultado RNF-06 — integridad referencial (rnf06_integridad.sql)

Ejecutado 2026-11-15T18:01:49Z en MariaDB 10.11.14-MariaDB-0ubuntu0.24.04.1 con DDL v1.2. Criterio: 0 huérfanos por relación y rechazo de los borrados que violan RESTRICT.

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
```

Lectura: las 13 relaciones tienen 0 filas huérfanas y el DELETE de un nivel con lecciones fue rechazado por `fk_leccion_nivel` (ERROR 1451), como exige RNF-06.
