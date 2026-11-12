# M11 — Estados → Eventos → Acciones (Diagrama de Estados E14)

| Estado | Evento de Transición | Acción del Sistema | RF / Regla de Negocio |
|---|---|---|---|
| [INICIAL] (lección desbloqueada, sin interacción) | Usuario selecciona la lección | Crear registro en PROGRESO_LECCION con estado='no_iniciada' | RF-07, RF-08 / RN-09: desbloqueo secuencial |
| NO_INICIADA | Usuario pulsa 'Comenzar' | Cambiar estado a 'en_progreso'; cargar contenido de CONTENIDO_LECCION | RF-10 / RN-10: acceso ordenado a ejercicios |
| EN_PROGRESO | Usuario completa todos los ejercicios | Calcular puntaje; actualizar estado='completada'; sumar XP; evaluar medallas y streak | RF-10, RF-12, RF-14 / RN-13, RN-15 |
| EN_PROGRESO | Usuario sale de la app sin terminar | Persistir progreso parcial; mantener estado='en_progreso' | RF-10 / RN-14: se puede retomar |
| COMPLETADA | Usuario pulsa 'Repetir' | Crear nuevo intento (intentos+1); cambiar estado a 'en_progreso' | RF-10 / RN-14: repetición permitida |
| ACTIVO | 5 intentos de login fallidos | Establecer bloqueado_hasta = NOW() + 15min; rechazar acceso | RF-05, RF-06 / RN-03 |
| BLOQUEADO_TEMP | NOW() > bloqueado_hasta | Reiniciar intentos_login a 0; restaurar acceso | RF-06 / RN-03 |
| ACTIVO | Administrador desactiva cuenta | Cambiar estado='inactivo'; invalidar JWT activo; notificar usuario | RF-20 |
| INACTIVO | Administrador reactiva cuenta | Cambiar estado='activo'; permitir nuevo login | RF-20 |
