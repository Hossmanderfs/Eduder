# E7 — Diccionario de Datos

## Módulo de Autenticación

### USUARIOS
| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_usuario | CHAR(36) | PK, NOT NULL | UUID v4 generado al registrarse |
| correo_institucional | VARCHAR(150) | UNIQUE, NOT NULL, CHECK regex | Correo @uniremington.edu.co |
| nombre | VARCHAR(80) | NOT NULL | Nombre(s) del usuario |
| apellido | VARCHAR(80) | NOT NULL | Apellido(s) del usuario |
| contrasena_hash | VARCHAR(255) | NOT NULL | bcrypt costo ≥ 10 |
| id_rol | VARCHAR(36) | FK → ROL(id_rol), NOT NULL | DEFAULT 'estudiante' |
| estado | BOOLEAN | NOT NULL DEFAULT TRUE | TRUE=activo, FALSE=inactivo |
| fecha_registro | DATETIME | NOT NULL DEFAULT NOW() | Timestamp de creación |
| intentos_login | TINYINT UNSIGNED | NOT NULL DEFAULT 0 | Reinicia a 0 en login exitoso |
| bloqueado_hasta | DATETIME | NULL | NULL=cuenta activa |

### ROL
> Catálogo simple. La FK vive en USUARIOS.id_rol → ROL.id_rol. ROL no contiene ninguna FK.

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_rol | CHAR(10) | PK, NOT NULL | Clave corta del rol ('estudiante', 'admin') |
| tipo_rol | VARCHAR(10) | NOT NULL | Etiqueta visible: estudiante \| admin |

### PERFIL_ESTUDIANTE
| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_perfil | CHAR(36) | PK, NOT NULL | UUID v4 |
| id_usuario | CHAR(36) | FK USUARIOS, UNIQUE, NOT NULL | Garantiza 1:1, ON DELETE CASCADE |
| nivel_actual | TINYINT UNSIGNED | NOT NULL DEFAULT 1 | Rango 1-5 |
| xp_total | INT UNSIGNED | NOT NULL DEFAULT 0 | XP histórico acumulado |
| streak_dias | TINYINT UNSIGNED | NOT NULL DEFAULT 0 | Días consecutivos de actividad |
| ultima_actividad | DATE | NULL | NULL si nunca completó lección |
| xp_semana_actual | INT UNSIGNED | NOT NULL DEFAULT 0 | Caché semanal para ranking |

### TOKENS_RECUPERACION
| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_token | CHAR(36) | PK, NOT NULL | UUID v4 |
| id_usuario | CHAR(36) | FK USUARIOS, NOT NULL | ON DELETE CASCADE |
| token_hash | VARCHAR(255) | NOT NULL | SHA-256; texto plano solo por correo |
| expira_en | DATETIME | NOT NULL | NOW() + 30 min |
| usado | BOOLEAN | NOT NULL DEFAULT FALSE | TRUE = inválido permanentemente |

---

## Módulo de Contenido Educativo

### NIVELES
| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_nivel | TINYINT UNSIGNED | PK, NOT NULL | 1=Fundamentos ... 5=Razonamiento |
| nombre | VARCHAR(100) | NOT NULL | Nombre descriptivo |
| descripcion | TEXT | NULL | Objetivos del nivel |
| orden | TINYINT UNSIGNED | NOT NULL | Orden de presentación |
| umbral_aprobacion | TINYINT UNSIGNED | NOT NULL DEFAULT 70 | % mínimo para desbloquear siguiente |
| estado | BOOLEAN | NOT NULL DEFAULT TRUE | activo/inactivo |

### TIPO_LECCION
| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_tipo | CHAR(36) | PK, NOT NULL | UUID v4 |
| nombre_tipo | CHAR(36) | NOT NULL | teoria \| ejercicio \| mini_juego \| caso_practico |
| descripcion_tipo | VARCHAR(150) | NOT NULL | Descripción funcional del tipo |

### LECCIONES
| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_leccion | CHAR(36) | PK, NOT NULL | UUID v4 |
| id_nivel | TINYINT UNSIGNED | FK NIVELES, NOT NULL, ON DELETE RESTRICT | Nivel al que pertenece |
| titulo | VARCHAR(150) | NOT NULL | Título visible al estudiante |
| tipo | VARCHAR(36) | FK TIPO_LECCION, NOT NULL | Tipo de lección |
| orden | TINYINT UNSIGNED | NOT NULL | Define desbloqueo secuencial |
| xp_base | SMALLINT UNSIGNED | NOT NULL DEFAULT 50 | XP base × (puntaje/100) |
| estado | ENUM | NOT NULL DEFAULT 'activo' | activo \| inactivo |

### CONTENIDO_LECCION
| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_bloque | CHAR(36) | PK, NOT NULL | UUID v4 |
| id_leccion | CHAR(36) | FK LECCIONES, NOT NULL, ON DELETE CASCADE | Lección propietaria |
| tipo_bloque | ENUM | NOT NULL | texto \| imagen \| video \| animacion |
| contenido | TEXT | NOT NULL | Texto o URL del recurso |
| orden | TINYINT UNSIGNED | NOT NULL | Orden de presentación |

### EJERCICIOS
| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_ejercicio | CHAR(36) | PK, NOT NULL | UUID v4 |
| id_leccion | CHAR(36) | FK LECCIONES, NOT NULL, ON DELETE CASCADE | Lección a la que pertenece |
| enunciado | TEXT | NOT NULL | Pregunta o situación |
| tipo_interaccion | ENUM | NOT NULL | seleccion_multiple \| completar \| arrastrar |
| respuesta_correcta | TEXT | NOT NULL | Respuesta serializada |
| explicacion | TEXT | NOT NULL | Retroalimentación paso a paso |
| orden | TINYINT UNSIGNED | NOT NULL | Orden dentro de la lección |

### PISTAS
| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_pista | CHAR(36) | PK, NOT NULL | UUID v4 |
| id_ejercicio | CHAR(36) | FK EJERCICIOS, NOT NULL, ON DELETE CASCADE | Ejercicio al que pertenece |
| numero_pista | TINYINT UNSIGNED | NOT NULL, CHECK(IN (1,2)) | Máximo 2 por ejercicio |
| texto_pista | TEXT | NOT NULL | Orientación sin revelar respuesta |

---

## Módulo de Progreso

### PROGRESO_LECCION
| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_progreso | CHAR(36) | PK, NOT NULL | UUID v4 |
| id_usuario | CHAR(36) | FK USUARIOS, NOT NULL | Estudiante dueño del registro |
| id_leccion | CHAR(36) | FK LECCIONES, NOT NULL | Lección asociada |
| estado | ENUM | NOT NULL DEFAULT 'no_iniciada' | no_iniciada \| en_progreso \| completada |
| puntaje | TINYINT UNSIGNED | NOT NULL DEFAULT 0, CHECK(0-100) | % de aciertos |
| intentos | TINYINT UNSIGNED | NOT NULL DEFAULT 1 | Número de intentos |
| fecha_completado | DATETIME | NULL | NULL si no completada |
| (id_usuario, id_leccion) | — | UNIQUE compuesto | Un registro por usuario/lección |

---

## Módulo de Gamificación

### MEDALLAS_CATALOGO
| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_medalla | CHAR(36) | PK, NOT NULL | UUID v4 |
| nombre | VARCHAR(100) | NOT NULL | Nombre visible |
| descripcion | TEXT | NULL | Descripción del logro |
| condicion_tipo | ENUM | NOT NULL | nivel_completado \| puntaje_perfecto \| streak \| xp_acumulado |
| condicion_valor | INT UNSIGNED | NOT NULL | Umbral numérico |
| icono_url | VARCHAR(255) | NOT NULL | Color si obtenida; gris si pendiente |

### MEDALLAS_USUARIO (tabla asociativa N:M)
| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_med_usuario | CHAR(36) | PK, NOT NULL | UUID v4 |
| id_usuario | CHAR(36) | FK USUARIOS, NOT NULL | Usuario que obtuvo la medalla |
| id_medalla | CHAR(36) | FK MEDALLAS_CATALOGO, NOT NULL | Medalla del catálogo |
| fecha_obtencion | DATETIME | NOT NULL DEFAULT NOW() | Momento exacto de otorgamiento |
| (id_usuario, id_medalla) | — | UNIQUE compuesto | Cada medalla se otorga 1 sola vez |

### RANKING_SEMANAL
| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_ranking | CHAR(36) | PK, NOT NULL | UUID v4 |
| id_usuario | CHAR(36) | FK USUARIOS, NOT NULL | Estudiante clasificado |
| id_nivel | TINYINT UNSIGNED | FK NIVELES, NOT NULL | Nivel en que compite |
| semana_inicio | DATE | NOT NULL | Lunes que inicia la semana |
| xp_semana | INT UNSIGNED | NOT NULL DEFAULT 0 | XP de la semana activa |
| posicion | SMALLINT UNSIGNED | NOT NULL DEFAULT 0 | Caché para evitar recálculo |
| (semana_inicio, id_usuario, id_nivel) | — | UNIQUE compuesto | Sin duplicados por semana/usuario/nivel |

---

## Módulo de Notificaciones

### NOTIFICACIONES
| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_notificacion | CHAR(36) | PK, NOT NULL | UUID v4 |
| id_usuario | CHAR(36) | FK USUARIOS, NOT NULL | Destinatario |
| tipo | ENUM | NOT NULL | racha \| logro \| sistema |
| mensaje | VARCHAR(255) | NOT NULL | Texto enviado vía FCM/APNs |
| leida | BOOLEAN | NOT NULL DEFAULT FALSE | TRUE cuando el usuario la abre |
| fecha_envio | DATETIME | NOT NULL DEFAULT NOW() | Timestamp de envío |
