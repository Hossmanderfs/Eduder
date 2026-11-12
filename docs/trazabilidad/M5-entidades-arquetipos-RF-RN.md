# M5 — Entidades de BD → Arquetipos → RF → Reglas de Negocio

| Entidad / Tabla | Arquetipos Relacionados | RF que Soporta | Reglas de Negocio Aplicadas |
|---|---|---|---|
| USUARIOS | Usuario | RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-20 | RN-01: correo debe terminar en @miremington.edu.co (estudiantes) o @uniremington.edu.co (administración); RN-02: contraseña encriptada con bcrypt costo ≥ 10; RN-03: bloqueo de cuenta tras 5 intentos fallidos durante 15 minutos |
| PERFIL_ESTUDIANTE | PerfilEstudiante | RF-09, RF-12, RF-13, RF-14, RF-15, RF-17, RF-18 | RN-04: xp_total nunca disminuye; RN-05: streak_dias se reinicia si ultima_actividad es anterior a ayer; RN-06: nivel_actual solo avanza cuando promedio de puntajes del nivel actual ≥ 70% |
| NIVELES | Nivel | RF-07, RF-08, RF-25 | RN-07: los niveles son 5 y secuenciales, no se puede saltar; RN-08: umbral_aprobacion mínimo es 70%; RN-20: no se puede eliminar un nivel con lecciones asociadas sin reasignarlas |
| LECCIONES | Leccion | RF-07, RF-08, RF-10, RF-26 | RN-09: dentro de un nivel las lecciones se desbloquean en orden; RN-10: el estudiante debe completar la lección anterior para acceder a la siguiente; RN-21: no se elimina una lección con progreso registrado, se archiva |
| EJERCICIOS | Ejercicio | RF-10, RF-11, RF-27 | RN-11: el feedback debe entregarse en menos de 1 segundo; RN-12: un ejercicio tiene máximo 2 pistas |
| PISTAS | Ejercicio (relación) | RF-11 | RN-12: cada ejercicio puede tener 1 o 2 pistas (campo numero_pista CHECK IN (1,2)); la segunda pista solo se muestra si el estudiante la solicita |
| PROGRESO_LECCION | ProgresoLeccion | RF-09, RF-10, RF-12 | RN-13: puntaje entre 0 y 100 (porcentaje de aciertos); RN-14: el estado transita NO_INICIADA → EN_PROGRESO → COMPLETADA; se puede retomar desde EN_PROGRESO |
| MEDALLAS_CATALOGO / MEDALLAS_USUARIO | MedallaCatalogo | RF-14, RF-15, RF-28 | RN-15: una medalla se otorga una sola vez por usuario; RN-16: las condiciones de desbloqueo se evalúan al finalizar cada lección; RN-22: no se elimina una medalla ya otorgada, se marca inactiva |
| RANKING_SEMANAL | RankingSemanal | RF-17 | RN-17: el ranking es semanal y por nivel; el XP acumulado en la semana determina la posición; se reinicia cada lunes a las 00:00 |
| TOKENS_RECUPERACION | TokenRecuperacion | RF-19 | RN-18: el token tiene validez de 30 minutos; RN-19: un token usado (usado=TRUE) no puede reutilizarse |
| NOTIFICACIONES | Notificación (clase) | RF-13, RF-16 | Sin regla de negocio dedicada; tipo ∈ {racha, logro, sistema} |
| CONTENIDO_LECCION | ContenidoLeccion (clase) | RF-07, RF-26 | Sin regla de negocio dedicada; los bloques se ordenan por el campo orden dentro de la lección |
