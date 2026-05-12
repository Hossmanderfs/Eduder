# M2 — Arquetipos → Casos de Uso → Requisitos Funcionales

| Arquetipo | Caso de Uso | RF Cubiertos |
|-----------|-------------|--------------|
| Usuario | CU-01 Registro de Estudiante | RF-01 (capturar correo institucional), RF-02 (crear cuenta con bcrypt) |
| Usuario | CU-02 Inicio de Sesión | RF-03 (validar credenciales), RF-04 (generar JWT 24 h), RF-05 (bloqueo 5 intentos), RF-06 (mostrar tiempo de bloqueo) |
| Usuario | CU-05 Recuperar Contraseña | RF-19 (enviar enlace SMTP, token 30 min) |
| PerfilEstudiante | CU-04 Consultar Perfil y Progreso | RF-18 (mostrar XP, nivel, streak, medallas, historial) |
| Nivel | CU-03 Completar una Lección | RF-07 (desbloqueo secuencial ≥ 70%), RF-08 (carga de contenido del nivel) |
| Leccion | CU-03 Completar una Lección | RF-08 (presentar teoría y ejercicios ordenados), RF-09 (registrar progreso) |
| Ejercicio | CU-03 Completar una Lección | RF-10 (evaluar respuesta < 1 s), RF-11 (ofrecer hasta 2 pistas), RF-12 (mostrar explicación en fallo) |
| ProgresoLeccion | CU-03 Completar una Lección | RF-09 (actualizar estado, puntaje, intentos), RF-15 (acumular XP) |
| MedallaCatalogo | CU-03 Completar una Lección | RF-14 (verificar condición y otorgar medalla), RF-15 (animación de logro) |
| RankingSemanal | CU-04 Consultar Perfil y Progreso | RF-17 (mostrar ranking por nivel y semana) |
| Usuario (admin) | CU-06 Gestión de Usuarios | RF-20 (buscar usuario), RF-21 (cambiar estado, invalidar JWT), RF-22 (exportar métricas CSV) |
