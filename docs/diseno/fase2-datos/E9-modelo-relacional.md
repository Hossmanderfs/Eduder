# E9 — Modelo Relacional

Esquema físico con tipos de dato, PK y FK. Normalizado hasta 3FN. Soporta 5 000 usuarios concurrentes.

| Tabla.Columna | Tipo | Constraint | Notas |
|--------------|------|------------|-------|
| usuarios.id_usuario | CHAR(36) | PK | UUID v4 generado por la aplicación |
| usuarios.correo_institucional | VARCHAR(150) | UNIQUE, NOT NULL | Validado con regex @uniremington.edu.co |
| usuarios.rol | ENUM('estudiante','admin') | NOT NULL | DEFAULT 'estudiante' |
| usuarios.estado | ENUM('activo','inactivo') | NOT NULL | DEFAULT 'activo' |
| perfil_estudiante.id_usuario | CHAR(36) | FK USUARIOS, UNIQUE | Garantiza relación 1:1 |
| niveles.id_nivel | TINYINT UNSIGNED | PK | Valor fijo 1-5 |
| lecciones.id_nivel | TINYINT UNSIGNED | FK NIVELES, NOT NULL | ON DELETE RESTRICT |
| lecciones.tipo | ENUM('teoria','ejercicio','mini_juego','caso_practico') | NOT NULL | Sin tabla de catálogo |
| ejercicios.id_leccion | CHAR(36) | FK LECCIONES, NOT NULL | ON DELETE CASCADE |
| pistas.numero_pista | TINYINT | NOT NULL, CHECK(1 OR 2) | Máximo 2 pistas por ejercicio |
| progreso_leccion.puntaje | TINYINT UNSIGNED | CHECK (0-100) | % de aciertos en la lección |
| medallas_catalogo.condicion_tipo | ENUM | NOT NULL | nivel_completado \| puntaje_perfecto \| streak \| xp_acumulado |
| ranking_semanal (semana_inicio, id_usuario, id_nivel) | — | UNIQUE compuesto | Sin duplicados por semana/usuario/nivel |
| tokens_recuperacion.expira_en | DATETIME | NOT NULL | 30 minutos tras generación |

> 📎 Ver diagrama visual en `imagenes/E9-modelo-relacional.png`
