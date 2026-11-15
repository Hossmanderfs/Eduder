# Línea Base 1 (LB-1) — Gestión de la configuración · EduDer

| Campo | Valor |
|---|---|
| Fecha de declaración | 15/11/2026 |
| Repositorio / rama | https://github.com/Hossmanderfs/Eduder · `main` |
| **Commit congelado** | `9b75d4b` (etiqueta Git `LB-1`) |
| Responsables | Hossman David Beltrán Quintero · Andrés Felipe Montoya Bedoya |
| Estado | Declarada por el equipo; **pendiente de visto bueno del docente** |

## Elementos de configuración (ECS) congelados

| ECS | Versión | Ubicación en el repositorio |
|---|---|---|
| Script DDL | v1.2 (13 tablas; rol y tipo como ENUM) | `docs/diseno/fase2-datos/E11-script-DDL.sql` |
| Diccionario de datos | E7 | `docs/diseno/fase2-datos/E7-diccionario-datos.md` |
| Modelo relacional y MER | E8, E9, E10 (3FN) | `docs/diseno/fase2-datos/` |
| Diagrama de clases | E12 | `docs/diseno/fase3-componentes/E12-diagrama-clases.md` |
| Diagramas de secuencia y estados | E13, E14 | `docs/diseno/fase3-componentes/` |
| Prototipo web de wireframes | E16, E17 | `docs/diseno/fase4-interfaz/prototipo-web/` |
| Requisitos (RF-01…RF-28, RNF-01…RNF-10) | Documento final | `docs/analisis/01-planteamiento-problema.md` |
| Matrices de trazabilidad | M1…M13 | `docs/trazabilidad/` |

## Regla de cambio

Todo cambio sobre un ECS de esta lista exige un **CRF** (Solicitud de Cambio, carpeta `docs/gestion-cambio/`) aprobado **antes** de modificar el artefacto, y la actualización de `DECISIONES.md`. Los cambios que solo tocan código sin alterar un ECS se documentan en `DECISIONES.md` y en el mensaje del commit.

## Nota de honestidad

Hasta esta fecha el proyecto no tenía CRF ni Línea Base documentados. Esta declaración se hace a posteriori sobre el estado vigente; los CRF anteriores a LB-1 se registran como retroactivos (ver `CRF-001`).
