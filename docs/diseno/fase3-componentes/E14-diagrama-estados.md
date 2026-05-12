# E14 — Diagrama de Estados

## Ciclo de vida de ProgresoLeccion

| Estado | Descripción | Evento de Entrada | Transición |
|--------|-------------|-------------------|-----------|
| [INICIAL] | Lección existe pero el usuario no ha interactuado | Lección desbloqueada | Usuario selecciona → NO_INICIADA |
| NO_INICIADA | Lección disponible pero no comenzada | Registro creado en PROGRESO_LECCION | Usuario pulsa 'Comenzar' → EN_PROGRESO |
| EN_PROGRESO | El usuario está resolviendo la lección | Usuario inicia la lección | Completa ejercicios → COMPLETADA / Sale → permanece EN_PROGRESO |
| COMPLETADA | Todos los ejercicios finalizados; puntaje registrado | Último ejercicio respondido | 'Repetir' → EN_PROGRESO (intentos+1) |

## Ciclo de vida del Usuario

| Estado | Evento | Efecto |
|--------|--------|--------|
| ACTIVO → BLOQUEADO_TEMP | 5 intentos fallidos de login | bloqueado_hasta = NOW() + 15 min |
| BLOQUEADO_TEMP → ACTIVO | NOW() > bloqueado_hasta | intentos_login = 0; acceso restaurado |
| ACTIVO → INACTIVO | Administrador desactiva cuenta | JWT invalidado; sin acceso |
| INACTIVO → ACTIVO | Administrador reactiva cuenta | Puede iniciar sesión nuevamente |

> 📎 Ver diagrama en `imagenes/E14-estados.png`
