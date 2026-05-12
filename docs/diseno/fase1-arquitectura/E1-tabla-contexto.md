# E1 — Tabla de Contexto

| ENTRADAS | PROCESOS | SALIDAS |
|----------|----------|---------|
| Correo institucional y contraseña | Validación regex; encriptación bcrypt; creación JWT | Confirmación de registro o error |
| Selección de lección | Carga de contenido desde BD; secuencia de ejercicios | Pantalla de lección con contenido animado |
| Respuesta del estudiante a ejercicio | Evaluación vs. respuesta_correcta; cálculo XP; actualización progreso_leccion | Feedback inmediato (< 1 s) + XP ganados |
| Finalización de lección | Suma XP; evaluación medallas; actualización streak; verificación umbral nivel (≥ 70%) | Pantalla resumen: XP, medallas, animación si aplica |
| Solicitud de pista | Consulta tabla PISTAS (máx. 2) | Texto de pista contextual |
| Cron job 02:00 h | Snapshot BD; compresión; almacenamiento S3/Firebase | Log de backup exitoso o alerta fallo |
| Cron job 18:00 h (usuario inactivo) | Revisión ultima_actividad; generación notificación push | Push al dispositivo del estudiante |
| Acción del administrador (activar/desactivar) | UPDATE estado en USUARIOS; invalidación JWT | Confirmación en panel; notificación al usuario |
