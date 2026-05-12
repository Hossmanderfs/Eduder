# E2 — Tabla de Interacciones

| Actor | Acción del Actor | Componente del Sistema | Respuesta Esperada |
|-------|-----------------|----------------------|-------------------|
| Estudiante | Registrarse | Auth Service + USUARIOS | Cuenta creada, sesión iniciada |
| Estudiante | Iniciar sesión | Auth Service + JWT | Token de sesión, menú principal |
| Estudiante | Seleccionar lección | Lesson Service + LECCIONES | Contenido de lección cargado |
| Estudiante | Responder ejercicio | Exercise Engine + EJERCICIOS | Feedback inmediato < 1 seg |
| Estudiante | Solicitar pista | Hint Service + PISTAS | Texto de pista contextual |
| Estudiante | Ver perfil | Profile Service + PERFIL_ESTUDIANTE | XP, nivel, streak, medallas |
| Estudiante | Ver ranking | Ranking Service + RANKING_SEMANAL | Tabla semanal del mismo nivel |
| Estudiante | Recuperar contraseña | Auth Service + TOKENS_RECUPERACION | Email con enlace válido 30 min |
| Administrador | Gestionar usuario | Admin Panel + USUARIOS | Estado actualizado, sesión invalidada |
| Administrador | Ver métricas | Analytics Service + vistas BD | Dashboard con KPIs filtrados |
| Sistema | Enviar notificación push | Notification Service + FCM/APNs | Push entregado al dispositivo |
| Sistema | Ejecutar backup | Backup Service + Almacenamiento Nube | Snapshot guardado, log actualizado |
