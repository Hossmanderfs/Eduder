# E14 — Diagrama de Estados

## Ciclo de vida de ProgresoLeccion

| Estado | Descripción | Evento de Entrada | Evento de Salida / Transición |
|---|---|---|---|
| [INICIAL] | Lección existe en el sistema pero el usuario no ha interactuado | Lección desbloqueada para el usuario | Usuario selecciona la lección → NO_INICIADA |
| NO_INICIADA | El usuario ve la lección disponible pero no ha comenzado | Registro creado en PROGRESO_LECCION | Usuario pulsa 'Comenzar' → EN_PROGRESO |
| EN_PROGRESO | El usuario está activamente resolviendo la lección | Usuario inicia la lección | Completa todos los ejercicios → COMPLETADA. Sale de la app → permanece EN_PROGRESO (se puede retomar) |
| COMPLETADA | El usuario finalizó todos los ejercicios y mini-juego; puntaje registrado | Último ejercicio respondido | Usuario selecciona 'Repetir' → EN_PROGRESO (con intento+1) |

## Ciclo de vida del Usuario

| Estado | Evento | Efecto |
|---|---|---|
| ACTIVO → BLOQUEADO_TEMP | 5 intentos fallidos de login | bloqueado_hasta = NOW() + 15min; acceso denegado temporalmente (BLOQUEADO_TEMP es un estado derivado de bloqueado_hasta; el ENUM estado solo admite activo/inactivo) |
| BLOQUEADO_TEMP → ACTIVO | NOW() > bloqueado_hasta | intentos_login reinicia a 0; acceso restaurado automáticamente |
| ACTIVO → INACTIVO | Administrador desactiva la cuenta | Sesiones JWT invalidadas inmediatamente; usuario no puede iniciar sesión |
| INACTIVO → ACTIVO | Administrador reactiva la cuenta | El usuario puede iniciar sesión nuevamente con sus credenciales existentes |

> 📎 Ver diagrama en `imagenes/E14-estados.png`
