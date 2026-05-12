# 01 — Planteamiento del Problema

## Contexto

La Corporación Universitaria Remington enfrenta un índice de deserción académica aproximado del **10%** en los primeros semestres, con concentración significativa en materias cuantitativas como lógica matemática. Los estudiantes de ingeniería y STEM presentan dificultades para comprender proposiciones, tablas de verdad y álgebra booleana, en parte por la falta de herramientas didácticas digitales especializadas.

Las plataformas existentes (Duolingo, Khan Academy) no cubren el nicho específico de lógica matemática universitaria en español con enfoque gamificado y contextualizado al currículo colombiano.

## Pregunta de Investigación

> ¿Cómo diseñar e implementar una aplicación móvil gamificada que permita a los estudiantes de la Corporación Universitaria Remington fortalecer sus competencias en lógica matemática mediante microlearning, feedback inmediato y mecánicas de juego, reduciendo la tasa de deserción en materias cuantitativas durante los primeros semestres?

## Requisitos Funcionales y No Funcionales

### Requisitos Funcionales (RF-01 a RF-24)

| ID | Categoría | Descripción | Actor |
|----|-----------|-------------|-------|
| RF-01 | Autenticación | Registro validando correo `@uniremington.edu.co` | Estudiante |
| RF-02 | Autenticación | Encriptar contraseña con bcrypt (costo ≥ 10) y crear PERFIL_ESTUDIANTE | Sistema |
| RF-03 | Autenticación | Autenticar con JWT (expiración 24 h) | Estudiante / Admin |
| RF-04 | Autenticación | Cargar perfil y redirigir al menú en < 3 segundos | Sistema |
| RF-05 | Autenticación | Bloquear cuenta 15 min tras 5 intentos fallidos | Sistema |
| RF-06 | Autenticación | Restaurar acceso automáticamente al expirar bloqueo | Sistema |
| RF-07 | Contenido | Ofrecer 5 niveles secuenciales de lógica matemática | Estudiante |
| RF-08 | Contenido | Desbloqueo secuencial de lecciones y niveles | Sistema |
| RF-09 | Progreso | Registrar avance en PROGRESO_LECCION (NO_INICIADA → EN_PROGRESO → COMPLETADA) | Sistema |
| RF-10 | Ejercicios | Ejercicios interactivos con feedback < 1 segundo | Estudiante |
| RF-11 | Ejercicios | Máximo 2 pistas por ejercicio | Estudiante |
| RF-12 | Progreso | Calcular puntaje, sumar XP y evaluar desbloqueo de nivel (umbral ≥ 70%) | Sistema |
| RF-13 | Gamificación | Calcular y actualizar streak de días consecutivos | Sistema |
| RF-14 | Gamificación | Otorgar medallas al cumplir condiciones del catálogo | Sistema |
| RF-15 | Gamificación | Evaluar condiciones de medallas al finalizar cada lección | Sistema |
| RF-16 | Notificaciones | Notificaciones push diarias vía FCM y APNs | Sistema |
| RF-17 | Gamificación | Ranking semanal por nivel, reinicio cada lunes 00:00 | Estudiante |
| RF-18 | Progreso | Consultar perfil completo: XP, nivel, streak, medallas, historial | Estudiante |
| RF-19 | Autenticación | Recuperar contraseña con token válido 30 min | Estudiante |
| RF-20 | Administración | Activar/desactivar cuentas e invalidar JWT | Administrador |
| RF-21 | Administración | Buscar usuarios por correo institucional | Administrador |
| RF-22 | Administración | Visualizar KPIs y exportar en CSV | Administrador |
| RF-23 | Sistema | Backup automático diario a las 02:00 h en AWS S3 / Firebase Storage | Sistema |
| RF-24 | Sistema | Distribución en Google Play Store (Android 8+) y Apple App Store (iOS 13+) | Sistema |

### Requisitos No Funcionales (RNF-01 a RNF-10)

| ID | Categoría | Descripción |
|----|-----------|-------------|
| RNF-01 | Disponibilidad | 99.5% mensual; backups y notificaciones automáticas |
| RNF-02 | Rendimiento | Feedback ejercicios < 1 s; menú y perfil < 3 s |
| RNF-03 | Seguridad | HTTPS + TLS 1.2+; bcrypt; JWT; OWASP Top Ten |
| RNF-04 | Escalabilidad | 5 000 usuarios concurrentes; BD normalizada a 3FN |
| RNF-05 | Usabilidad | WCAG 2.1 AA; microlearning; Android 8+ / iOS 13+ |
| RNF-06 | Integridad | Integridad referencial; constraints CHECK en campos críticos |
| RNF-07 | Mantenibilidad | Arquitectura de servicios desacoplados; cobertura ≥ 80% |
| RNF-08 | Portabilidad | Nativo Android 8+ / iOS 13+; panel en 2 últimas versiones de navegadores |
| RNF-09 | Privacidad | Ley 1581/2012 (Habeas Data Colombia); datos privados excepto ranking |
| RNF-10 | Recuperabilidad | RTO ≤ 4 h; RPO ≤ 24 h |
