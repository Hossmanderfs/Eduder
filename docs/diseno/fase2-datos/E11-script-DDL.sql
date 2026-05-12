-- ================================================
-- SCRIPT DDL — EduDer
-- Corporación Universitaria Remington
-- Ingeniería de Software | Parcial 1
-- Normalizado hasta 3FN | MySQL 8.0+
-- ================================================
-- CORRECCIONES v1.1:
--   · usuarios.id_rol cambiado de VARCHAR(36) a CHAR(10)
--     para que el tipo coincida exactamente con rol.id_rol CHAR(10)
--     y la FK sea válida sin conversión implícita.
--   · Tabla ROL queda como catálogo puro (id_rol, tipo_rol).
--     La FK vive en USUARIOS. ROL no tiene FK hacia ninguna tabla.
--   · tipo_leccion: añadidos 4 INSERT de prueba.
-- ================================================

CREATE DATABASE IF NOT EXISTS eduder
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE eduder;

-- -------------------------------------------------------
-- TABLA: rol  (catálogo puro)
-- -------------------------------------------------------
CREATE TABLE rol (
    id_rol   CHAR(10)    NOT NULL,
    tipo_rol VARCHAR(10) NOT NULL,
    CONSTRAINT pk_rol PRIMARY KEY (id_rol)
);

INSERT INTO rol (id_rol, tipo_rol) VALUES
    ('estudiante', 'estudiante'),
    ('admin',      'admin');

-- -------------------------------------------------------
-- TABLA: usuarios
-- FIX: id_rol CHAR(10) para coincidir con rol.id_rol CHAR(10)
-- -------------------------------------------------------
CREATE TABLE usuarios (
    id_usuario              CHAR(36)         NOT NULL,
    correo_institucional    VARCHAR(150)     NOT NULL,
    nombre                  VARCHAR(80)      NOT NULL,
    apellido                VARCHAR(80)      NOT NULL,
    contrasena_hash         VARCHAR(255)     NOT NULL,
    id_rol                  CHAR(10)         NOT NULL DEFAULT 'estudiante',
    estado                  BOOLEAN          NOT NULL DEFAULT TRUE,
    fecha_registro          DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    intentos_login          TINYINT UNSIGNED NOT NULL DEFAULT 0,
    bloqueado_hasta         DATETIME         NULL,
    CONSTRAINT pk_usuarios    PRIMARY KEY (id_usuario),
    CONSTRAINT uq_correo      UNIQUE (correo_institucional),
    CONSTRAINT chk_correo     CHECK (correo_institucional LIKE '%@uniremington.edu.co'),
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

-- -------------------------------------------------------
-- TABLA: perfil_estudiante
-- -------------------------------------------------------
CREATE TABLE perfil_estudiante (
    id_perfil           CHAR(36)         NOT NULL,
    id_usuario          CHAR(36)         NOT NULL,
    nivel_actual        TINYINT UNSIGNED NOT NULL DEFAULT 1,
    xp_total            INT UNSIGNED     NOT NULL DEFAULT 0,
    streak_dias         TINYINT UNSIGNED NOT NULL DEFAULT 0,
    ultima_actividad    DATE             NULL,
    xp_semana_actual    INT UNSIGNED     NOT NULL DEFAULT 0,
    CONSTRAINT pk_perfil         PRIMARY KEY (id_perfil),
    CONSTRAINT uq_perfil_usuario UNIQUE (id_usuario),
    CONSTRAINT fk_perfil_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- -------------------------------------------------------
-- TABLA: tokens_recuperacion
-- -------------------------------------------------------
CREATE TABLE tokens_recuperacion (
    id_token    CHAR(36)     NOT NULL,
    id_usuario  CHAR(36)     NOT NULL,
    token_hash  VARCHAR(255) NOT NULL,
    expira_en   DATETIME     NOT NULL,
    usado       BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_tokens        PRIMARY KEY (id_token),
    CONSTRAINT fk_token_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- -------------------------------------------------------
-- TABLA: niveles
-- -------------------------------------------------------
CREATE TABLE niveles (
    id_nivel            TINYINT UNSIGNED          NOT NULL,
    nombre              VARCHAR(100)              NOT NULL,
    descripcion         TEXT                      NULL,
    orden               TINYINT UNSIGNED          NOT NULL,
    umbral_aprobacion   TINYINT UNSIGNED          NOT NULL DEFAULT 70,
    estado              ENUM('activo','inactivo') NOT NULL DEFAULT 'activo',
    CONSTRAINT pk_niveles PRIMARY KEY (id_nivel)
);

INSERT INTO niveles (id_nivel, nombre, descripcion, orden, umbral_aprobacion, estado) VALUES
    (1, 'Fundamentos Lógicos',     'Proposiciones y conectivos lógicos',            1, 70, 'activo'),
    (2, 'Tablas de Verdad',        'Construcción e interpretación de tablas',        2, 70, 'activo'),
    (3, 'Álgebra Booleana',        'Leyes De Morgan y simplificación algebraica',    3, 70, 'activo'),
    (4, 'Métodos de Demostración', 'Demostración directa, contradicción, inducción', 4, 70, 'activo'),
    (5, 'Razonamiento Aplicado',   'Lógica de predicados y programación lógica',     5, 70, 'activo');

-- -------------------------------------------------------
-- TABLA: tipo_leccion (catálogo de tipos)
-- -------------------------------------------------------
CREATE TABLE tipo_leccion (
    id_tipo          CHAR(36)     NOT NULL,
    nombre_tipo      CHAR(36)     NOT NULL,
    descripcion_tipo VARCHAR(150) NOT NULL,
    CONSTRAINT pk_tipo_leccion PRIMARY KEY (id_tipo)
);

INSERT INTO tipo_leccion (id_tipo, nombre_tipo, descripcion_tipo) VALUES
    ('teoria',        'teoria',        'Contenido expositivo con texto, imágenes y video'),
    ('ejercicio',     'ejercicio',     'Secuencia de preguntas interactivas evaluadas'),
    ('mini_juego',    'mini_juego',    'Actividad lúdica de refuerzo al final de lección'),
    ('caso_practico', 'caso_practico', 'Situación aplicada que integra varios conceptos');

-- -------------------------------------------------------
-- TABLA: lecciones
-- -------------------------------------------------------
CREATE TABLE lecciones (
    id_leccion  CHAR(36)                  NOT NULL,
    id_nivel    TINYINT UNSIGNED          NOT NULL,
    titulo      VARCHAR(150)              NOT NULL,
    tipo        CHAR(36)                  NOT NULL,
    orden       TINYINT UNSIGNED          NOT NULL,
    xp_base     SMALLINT UNSIGNED         NOT NULL DEFAULT 50,
    estado      ENUM('activo','inactivo') NOT NULL DEFAULT 'activo',
    CONSTRAINT pk_lecciones     PRIMARY KEY (id_leccion),
    CONSTRAINT fk_leccion_nivel FOREIGN KEY (id_nivel)
        REFERENCES niveles(id_nivel) ON DELETE RESTRICT,
    CONSTRAINT fk_leccion_tipo  FOREIGN KEY (tipo)
        REFERENCES tipo_leccion(id_tipo)
);

-- -------------------------------------------------------
-- TABLA: contenido_leccion
-- -------------------------------------------------------
CREATE TABLE contenido_leccion (
    id_bloque   CHAR(36)                                   NOT NULL,
    id_leccion  CHAR(36)                                   NOT NULL,
    tipo_bloque ENUM('texto','imagen','video','animacion') NOT NULL,
    contenido   TEXT                                       NOT NULL,
    orden       TINYINT UNSIGNED                           NOT NULL,
    CONSTRAINT pk_contenido      PRIMARY KEY (id_bloque),
    CONSTRAINT fk_bloque_leccion FOREIGN KEY (id_leccion)
        REFERENCES lecciones(id_leccion) ON DELETE CASCADE
);

-- -------------------------------------------------------
-- TABLA: ejercicios
-- -------------------------------------------------------
CREATE TABLE ejercicios (
    id_ejercicio        CHAR(36)                                           NOT NULL,
    id_leccion          CHAR(36)                                           NOT NULL,
    enunciado           TEXT                                               NOT NULL,
    tipo_interaccion    ENUM('seleccion_multiple','completar','arrastrar') NOT NULL,
    orden               TINYINT UNSIGNED                                   NOT NULL,
    respuesta_correcta  TEXT                                               NOT NULL,
    explicacion         TEXT                                               NOT NULL,
    CONSTRAINT pk_ejercicios        PRIMARY KEY (id_ejercicio),
    CONSTRAINT fk_ejercicio_leccion FOREIGN KEY (id_leccion)
        REFERENCES lecciones(id_leccion) ON DELETE CASCADE
);

-- -------------------------------------------------------
-- TABLA: pistas
-- -------------------------------------------------------
CREATE TABLE pistas (
    id_pista        CHAR(36)         NOT NULL,
    id_ejercicio    CHAR(36)         NOT NULL,
    numero_pista    TINYINT UNSIGNED NOT NULL,
    texto_pista     TEXT             NOT NULL,
    CONSTRAINT pk_pistas          PRIMARY KEY (id_pista),
    CONSTRAINT fk_pista_ejercicio FOREIGN KEY (id_ejercicio)
        REFERENCES ejercicios(id_ejercicio) ON DELETE CASCADE,
    CONSTRAINT chk_num_pista      CHECK (numero_pista IN (1,2))
);

-- -------------------------------------------------------
-- TABLA: progreso_leccion
-- -------------------------------------------------------
CREATE TABLE progreso_leccion (
    id_progreso         CHAR(36)                                       NOT NULL,
    id_usuario          CHAR(36)                                       NOT NULL,
    id_leccion          CHAR(36)                                       NOT NULL,
    estado              ENUM('no_iniciada','en_progreso','completada') NOT NULL DEFAULT 'no_iniciada',
    puntaje             TINYINT UNSIGNED                               NOT NULL DEFAULT 0,
    intentos            TINYINT UNSIGNED                               NOT NULL DEFAULT 1,
    fecha_completado    DATETIME                                       NULL,
    CONSTRAINT pk_progreso     PRIMARY KEY (id_progreso),
    CONSTRAINT fk_prog_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_prog_leccion FOREIGN KEY (id_leccion) REFERENCES lecciones(id_leccion),
    CONSTRAINT chk_puntaje     CHECK (puntaje BETWEEN 0 AND 100),
    CONSTRAINT uq_usr_leccion  UNIQUE (id_usuario, id_leccion)
);

-- -------------------------------------------------------
-- TABLA: medallas_catalogo
-- -------------------------------------------------------
CREATE TABLE medallas_catalogo (
    id_medalla      CHAR(36)                                                            NOT NULL,
    nombre          VARCHAR(100)                                                        NOT NULL,
    descripcion     TEXT                                                                NULL,
    condicion_tipo  ENUM('nivel_completado','puntaje_perfecto','streak','xp_acumulado') NOT NULL,
    condicion_valor INT UNSIGNED                                                        NOT NULL,
    icono_url       VARCHAR(255)                                                        NOT NULL,
    CONSTRAINT pk_medallas_cat PRIMARY KEY (id_medalla)
);

-- -------------------------------------------------------
-- TABLA: medallas_usuario  (asociativa N:M)
-- -------------------------------------------------------
CREATE TABLE medallas_usuario (
    id_med_usuario  CHAR(36) NOT NULL,
    id_usuario      CHAR(36) NOT NULL,
    id_medalla      CHAR(36) NOT NULL,
    fecha_obtencion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_med_usuario     PRIMARY KEY (id_med_usuario),
    CONSTRAINT uq_usuario_medalla UNIQUE (id_usuario, id_medalla),
    CONSTRAINT fk_med_usuario     FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_med_catalogo    FOREIGN KEY (id_medalla) REFERENCES medallas_catalogo(id_medalla)
);

-- -------------------------------------------------------
-- TABLA: notificaciones
-- -------------------------------------------------------
CREATE TABLE notificaciones (
    id_notificacion CHAR(36)                       NOT NULL,
    id_usuario      CHAR(36)                       NOT NULL,
    tipo            ENUM('racha','logro','sistema') NOT NULL,
    mensaje         VARCHAR(255)                   NOT NULL,
    leida           BOOLEAN                        NOT NULL DEFAULT FALSE,
    fecha_envio     DATETIME                       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_notificaciones PRIMARY KEY (id_notificacion),
    CONSTRAINT fk_noti_usuario   FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- -------------------------------------------------------
-- TABLA: ranking_semanal
-- -------------------------------------------------------
CREATE TABLE ranking_semanal (
    id_ranking      CHAR(36)          NOT NULL,
    id_usuario      CHAR(36)          NOT NULL,
    id_nivel        TINYINT UNSIGNED  NOT NULL,
    semana_inicio   DATE              NOT NULL,
    xp_semana       INT UNSIGNED      NOT NULL DEFAULT 0,
    posicion        SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    CONSTRAINT pk_ranking      PRIMARY KEY (id_ranking),
    CONSTRAINT uq_ranking      UNIQUE (semana_inicio, id_usuario, id_nivel),
    CONSTRAINT fk_rank_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_rank_nivel   FOREIGN KEY (id_nivel)   REFERENCES niveles(id_nivel)
);

-- -------------------------------------------------------
-- DATOS DE PRUEBA
-- -------------------------------------------------------

INSERT INTO usuarios (id_usuario, correo_institucional, nombre, apellido, contrasena_hash, id_rol, estado)
VALUES ('admin-001', 'admin@uniremington.edu.co', 'Admin', 'Sistema', '$2b$10$hashejemplo', 'admin', TRUE);

INSERT INTO usuarios (id_usuario, correo_institucional, nombre, apellido, contrasena_hash, id_rol, estado)
VALUES ('est-001', 'juan.perez@uniremington.edu.co', 'Juan', 'Pérez', '$2b$10$hashejemplo', 'estudiante', TRUE);

INSERT INTO perfil_estudiante (id_perfil, id_usuario, nivel_actual, xp_total, streak_dias, xp_semana_actual)
VALUES ('perfil-001', 'est-001', 1, 0, 0, 0);

-- FIN DEL SCRIPT DDL (15 tablas, 3FN) — EduDer v1.1
