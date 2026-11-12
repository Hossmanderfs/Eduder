# E1 — Tabla de Contexto

| ENTRADAS | PROCESOS | SALIDAS |
|---|---|---|
| Correo institucional y contraseña | Validación de dominio @miremington.edu.co (estudiantes) o @uniremington.edu.co (administración); encriptación bcrypt; creación de sesión JWT | Confirmación de registro o mensaje de error |
| Selección de lección por parte del estudiante | Carga de contenido desde BD (bloques JSON/HTML); secuencia de ejercicios graduales | Pantalla de lección con introducción animada, ejercicios y mini-juego |
| Respuesta del estudiante a un ejercicio | Evaluación de respuesta contra respuesta_correcta; cálculo de XP; actualización de progreso_leccion | Feedback inmediato (acierto/error + explicación paso a paso + XP ganados) |
| Finalización de lección | Suma de XP a perfil; evaluación de condiciones de medalla; actualización de streak; verificación de umbral de nivel (≥70%) | Pantalla de resumen: XP, medallas desbloqueadas, animación de celebración si aplica |
| Solicitud de pista | Consulta de tabla PISTAS para el ejercicio activo; control de máximo 2 pistas | Texto de pista contextual sin revelar respuesta completa |
| Cron job diario 02:00 h | Snapshot de todas las tablas de la BD; compresión y almacenamiento en nube (S3/Firebase) | Log de backup exitoso; alerta por fallo |
| Cron job 18:00 h por usuario inactivo | Revisión de ultima_actividad en PERFIL_ESTUDIANTE; generación de notificación push | Notificación push al dispositivo del estudiante |
| Acción del administrador (activar/desactivar usuario) | Actualización de campo estado en USUARIOS; invalidación inmediata de sesiones activas | Confirmación en panel admin; notificación al usuario afectado |
