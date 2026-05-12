# M10 — Diagramas de Secuencia → Casos de Uso → Clases Participantes

| Diagrama de Secuencia (E13) | Caso de Uso | Clases / Componentes Participantes | Orden de Mensajes |
|-----------------------------|-------------|-----------------------------------|-------------------|
| DS-01: Registro | CU-01 | AppMóvil → AuthService → Usuario → PerfilEstudiante → BD | 1. POST /auth/register · 2. validar correo · 3. bcrypt.hash · 4. INSERT usuarios · 5. INSERT perfil_estudiante · 6. JWT → cliente |
| DS-02: Login | CU-02 | AppMóvil → AuthService → Usuario → BD | 1. POST /auth/login · 2. verificar bloqueo · 3. bcrypt.compare · 4. generar JWT · 5. cargar perfil → cliente |
| DS-03: Completar Lección | CU-03 | AppMóvil → LessonService → ExerciseEngine → ProgressService → GamificationService | 1. GET /lessons/:id · 2. cargarContenido · 3. evaluar respuestas · 4. registrar puntaje · 5. sumarXP · 6. calcularStreak · 7. verificarMedallas · 8. actualizar ranking |
| DS-04: Consultar Perfil | CU-04 | AppMóvil → ProgressService → PerfilEstudiante → RankingSemanal | 1. GET /profile/summary · 2. obtenerResumen · 3. obtenerTop → cliente |
| DS-05: Recuperar Contraseña | CU-05 | AppMóvil → AuthService → TokenRecuperacion → SMTP | 1. POST /auth/recover · 2. generar token hash · 3. INSERT tokens_recuperacion · 4. enviarEmail · 5. usuario abre enlace · 6. estaVigente · 7. UPDATE contrasena · 8. invalidar token |
| DS-06: Gestión Admin | CU-06 | PanelAdmin → AdminService → Usuario → AuthService | 1. PATCH /admin/users/:id · 2. UPDATE estado · 3. invalidar JWT activo · 4. notificar usuario |
