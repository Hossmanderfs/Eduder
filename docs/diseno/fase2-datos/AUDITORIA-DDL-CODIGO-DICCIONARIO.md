# Auditoría DDL ↔ código ↔ diccionario (Construcción 2 / Calidad 3)

Fecha: 15/11/2026 · DDL: `E11-script-DDL.sql` v1.2 · Diccionario: Tablas 18–25.6 del documento (v3).

| Comparación | Método | Resultado |
|---|---|---|
| DDL ↔ modelos Sequelize | `npm run auditoria-ddl` en `src/backend` (crea una BD limpia desde el DDL y compara en `information_schema` nombre, tipo, tamaño, nulabilidad, PK y ENUM de cada columna) | 13 tablas, 13 modelos, **81 columnas, 0 diferencias** |
| Reglas ON DELETE | `referential_constraints` frente a `onDelete` de `models/index.js` | 13 FK coinciden (RESTRICT / CASCADE) |
| DDL ↔ diccionario del documento | Cotejo de atributos y tipos de las 13 tablas del diccionario con las columnas del DDL | 13/13 coinciden, sin atributos faltantes ni sobrantes |
| Sensibilidad de la prueba | Se cambió `usuarios.nombre` a VARCHAR(60) en una BD de prueba | El script lo detectó (1 diferencia) y se revirtió |

Única divergencia deliberada ya documentada: `PERFIL_ESTUDIANTE.nivel_actual` no tiene FK (decisión #07 en `DECISIONES.md`); no es diferencia entre código y DDL.
Reproducir: crear la BD con el DDL (`eduder_ddl`) y ejecutar `AUDIT_DB=eduder_ddl npm run auditoria-ddl`.
