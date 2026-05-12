# M11 — Estados → Eventos → Acciones (Diagrama de Estados E14)

| Entidad / Objeto | Estado Origen | Evento | Acción / Efecto | Estado Destino |
|-----------------|---------------|--------|-----------------|----------------|
| ProgresoLeccion | no_iniciada | Estudiante selecciona lección desbloqueada | INSERT progreso_leccion con estado='en_progreso' | en_progreso |
| ProgresoLeccion | en_progreso | Estudiante completa todos los ejercicios | UPDATE puntaje, fecha_completado; evaluar medallas y XP | completada |
| ProgresoLeccion | en_progreso | Estudiante cierra la app antes de terminar | Guardar progreso parcial (puntaje=0, intentos se mantiene) | en_progreso |
| Usuario | activo | 5 intentos de login fallidos | UPDATE bloqueado_hasta = NOW() + intervalo | bloqueado |
| Usuario | bloqueado | Tiempo de bloqueo transcurrido | Sistema habilita login; intentos_login = 0 | activo |
| Usuario | activo | Admin desactiva la cuenta | UPDATE estado=FALSE; invalidar JWT activo | inactivo |
| Usuario | inactivo | Admin reactiva la cuenta | UPDATE estado=TRUE | activo |
| TokenRecuperacion | vigente | Estudiante usa el enlace | UPDATE usado=TRUE | invalidado |
| TokenRecuperacion | vigente | Transcurren 30 minutos sin uso | (verificación en consulta: NOW() > expira_en) | expirado |
| Nivel | bloqueado | Estudiante alcanza puntaje_promedio ≥ 70% en nivel anterior | Animar desbloqueo; actualizar nivel_actual en PerfilEstudiante | desbloqueado |
| PerfilEstudiante (streak) | streak activo | ultima_actividad = ayer → hoy completa lección | streak_dias++ | streak activo (+1) |
| PerfilEstudiante (streak) | streak activo | ultima_actividad < ayer | streak_dias = 0 | streak roto |
| Medalla | no_obtenida | GamificationService detecta condición cumplida | INSERT medallas_usuario; push notificación logro | obtenida |
