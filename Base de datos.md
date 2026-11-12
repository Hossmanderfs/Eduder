# Base de datos

El script vigente (DDL v1.2, MySQL 8.0+, 13 tablas en 3FN) está en
[`docs/diseno/fase2-datos/E11-script-DDL.sql`](docs/diseno/fase2-datos/E11-script-DDL.sql).
Este archivo antes duplicaba una versión antigua del DDL; se reemplaza por este enlace para evitar inconsistencias.

```bash
mysql -u root -p < docs/diseno/fase2-datos/E11-script-DDL.sql
cd src/backend && npm run seed     # contenido semilla: 5 niveles, 15 lecciones, 45 ejercicios, 12 medallas
```
