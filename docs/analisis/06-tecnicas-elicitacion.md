# 06 — Técnicas de Elicitación

## 6.1 Análisis de Referentes (Benchmarking)

Se analizaron **Duolingo** y **EBAC** como referentes principales:
- **Duolingo:** modelo de microlearning, repetición espaciada, feedback inmediato y gamificación motivacional.
- **EBAC:** estructura didáctica de introducción → ejercicio guiado → actividad autónoma → retroalimentación; diseño visual minimalista.

## 6.2 Revisión de Literatura Académica

| Fuente | Aporte al diseño |
|--------|-----------------|
| Kapp (2012) — Gamificación educativa | Base teórica del sistema de recompensas |
| Deci & Ryan (1985) — Teoría de la Autodeterminación | Motivación intrínseca y extrínseca |
| Vygotsky (1978) — Constructivismo social | Aprendizaje por andamiaje |
| Van Hiele (1986) — Taxonomía matemática | Progresión de niveles de lógica |
| El Colombiano (2023) — Estadísticas deserción | Contexto del problema colombiano |

## 6.3 Definición de Historias de Usuario

Se definieron **21 historias de usuario (HU-01 a HU-21)** con criterios de aceptación, que son la fuente primaria de RF-01 a RF-28 y RNF-01 a RNF-10.

| ID | Historia de Usuario | Criterios de Aceptación | RF Relacionados |
|---|---|---|---|
| HU-01 | Como estudiante, quiero registrarme con mi correo institucional para acceder a la plataforma. | CA1: Solo se acepta correo institucional (@miremington.edu.co para estudiantes, @uniremington.edu.co para administración). CA2: Contraseña encriptada con bcrypt. CA3: Perfil inicializado con nivel 1, XP 0, streak 0. | RF-01, RF-02 |
| HU-02 | Como usuario registrado, quiero iniciar sesión con correo y contraseña para acceder a mi contenido. | CA1: Token JWT generado con expiración 24 h. CA2: Menú principal cargado en menos de 3 segundos. CA3: Cuenta bloqueada tras 5 intentos fallidos. | RF-03, RF-04, RF-05, RF-06 |
| HU-03 | Como estudiante, quiero ver los 5 niveles de lógica matemática disponibles para conocer la estructura del curso. | CA1: Se muestran los 5 niveles en orden. CA2: Niveles bloqueados muestran candado visual. CA3: El nivel 1 siempre aparece desbloqueado al registrarse. | RF-07, RF-08 |
| HU-04 | Como estudiante, quiero seleccionar y comenzar una lección desbloqueada para avanzar en el curso. | CA1: Solo se puede acceder a lecciones desbloqueadas. CA2: El estado cambia a EN_PROGRESO al iniciar. CA3: Se puede retomar una lección en progreso. | RF-08, RF-09 |
| HU-05 | Como estudiante, quiero responder ejercicios interactivos y recibir feedback inmediato para aprender de mis errores. | CA1: Feedback entregado en menos de 1 segundo. CA2: Respuesta correcta muestra XP ganados. CA3: Respuesta incorrecta muestra explicación paso a paso. | RF-10 |
| HU-06 | Como estudiante, quiero solicitar pistas durante un ejercicio para recibir orientación sin revelar la respuesta completa. | CA1: Máximo 2 pistas por ejercicio. CA2: La segunda pista requiere solicitud explícita. CA3: El botón de pista desaparece tras agotar el límite. | RF-11 |
| HU-07 | Como estudiante, quiero ver mi puntaje al finalizar una lección y los XP ganados para evaluar mi desempeño. | CA1: Puntaje entre 0 y 100 (% de aciertos). CA2: XP sumados al perfil inmediatamente. CA3: Animación de celebración si se desbloquea el siguiente nivel (umbral ≥ 70%). | RF-12 |
| HU-08 | Como estudiante, quiero mantener mi racha de estudio diario para motivarme a estudiar todos los días. | CA1: Streak incrementa al completar al menos una lección por día. CA2: Streak se reinicia a 0 si no hubo actividad antes de ayer. CA3: El streak es visible en el perfil y menú principal. | RF-13 |
| HU-09 | Como estudiante, quiero desbloquear medallas al alcanzar logros para sentir progreso y motivación. | CA1: Las condiciones se evalúan al finalizar cada lección. CA2: Cada medalla se otorga una sola vez por usuario. CA3: Las medallas se visualizan en el perfil (obtenidas en color, pendientes en gris). | RF-14, RF-15 |
| HU-10 | Como estudiante, quiero recibir notificaciones push diarias para recordarme estudiar y mantener mi racha. | CA1: Notificación enviada vía FCM (Android) y APNs (iOS). CA2: Solo se envía si el usuario no ha estudiado en el día. CA3: El usuario puede desactivar las notificaciones desde ajustes del dispositivo. | RF-16 |
| HU-11 | Como estudiante, quiero ver el ranking semanal por nivel para competir sanamente con mis compañeros. | CA1: El ranking muestra posición y XP de la semana. CA2: Solo se comparte posición y XP (no datos personales sensibles). CA3: El ranking se reinicia cada lunes a las 00:00. | RF-17 |
| HU-12 | Como estudiante, quiero consultar mi perfil con XP, nivel, streak y medallas para monitorear mi avance. | CA1: El perfil muestra nivel actual, XP total, streak, % de avance por nivel y medallas. CA2: El historial de lecciones incluye nombre, fecha y puntaje. CA3: Solo el propio estudiante puede ver su perfil completo. | RF-18 |
| HU-13 | Como usuario, quiero recuperar mi contraseña si la olvido, recibiendo un enlace de recuperación a mi correo. | CA1: El enlace caduca en 30 minutos. CA2: El token se invalida tras ser usado. CA3: El sistema no revela si el correo existe (por seguridad). | RF-19 |
| HU-14 | Como administrador, quiero activar o desactivar cuentas de estudiantes para gestionar el acceso al sistema. | CA1: El cambio de estado es inmediato. CA2: Las sesiones JWT activas del usuario afectado se invalidan al desactivar. CA3: El usuario recibe notificación del cambio de estado. | RF-20 |
| HU-15 | Como administrador, quiero buscar usuarios por correo para consultar su estado y datos básicos. | CA1: La búsqueda acepta correo parcial o completo. CA2: Se muestra nombre, estado, nivel actual y fecha de registro. CA3: El resultado es de solo lectura (sin edición directa de datos personales). | RF-21 |
| HU-16 | Como administrador, quiero visualizar KPIs del sistema y exportarlos en CSV para monitorear el uso de la plataforma. | CA1: KPIs incluyen usuarios activos, lecciones completadas y promedio de puntajes. CA2: Se puede filtrar por rango de fechas. CA3: La exportación genera un archivo CSV válido. | RF-22 |
| HU-17 | Como sistema, quiero ejecutar un backup automático diario y notificaciones push sin intervención humana para garantizar la continuidad del servicio. | CA1: Backup ejecutado a las 02:00 h mediante cron job. CA2: Snapshot almacenado en AWS S3 / Firebase Storage. CA3: Se registra log de éxito o fallo. CA4: Notificaciones push enviadas a las 18:00 h a usuarios inactivos. | RF-23, RF-16 |
| HU-18 | Como administrador, quiero crear, editar y eliminar niveles del curso, para mantener actualizada la estructura de contenidos. | CA1: Solo el administrador puede acceder al CRUD de niveles. CA2: No se puede eliminar un nivel con lecciones asociadas sin reasignarlas o eliminarlas primero. CA3: El orden de los niveles es editable. | RF-25 |
| HU-19 | Como administrador, quiero crear, editar y eliminar lecciones dentro de un nivel, para mantener actualizado el contenido educativo. | CA1: Toda lección debe pertenecer a un nivel existente. CA2: El orden de las lecciones dentro del nivel es editable. CA3: No se puede eliminar una lección con progreso de estudiantes registrado; se marca como inactiva. | RF-26 |
| HU-20 | Como administrador, quiero crear, editar y eliminar ejercicios de una lección, para ajustar la dificultad y variedad de las evaluaciones. | CA1: Todo ejercicio requiere al menos una respuesta correcta definida. CA2: Un ejercicio admite máximo 2 pistas. CA3: Eliminar un ejercicio no afecta el progreso ya registrado de los estudiantes. | RF-27 |
| HU-21 | Como administrador, quiero crear, editar y eliminar medallas del catálogo, para mantener vigente el sistema de gamificación. | CA1: Una medalla ya otorgada a algún estudiante no puede eliminarse, solo marcarse como inactiva. CA2: El ícono y la condición de desbloqueo son editables en cualquier momento. | RF-28 |

## 6.4 Prototipado Iterativo

Wireframes de baja fidelidad para validar flujos de navegación: WF-01 (Menú Principal), WF-02 (Ejercicio), WF-03 (Perfil del Estudiante).

## 6.5 Análisis de Contexto y Restricciones

- **Técnicas:** autenticación @miremington.edu.co (estudiantes) o @uniremington.edu.co (administración); Android 8+ / iOS 13+
- **Regulatorias:** WCAG 2.1 AA; OWASP Top Ten
- **Negocio:** MVP enfocado en lógica matemática, 5 niveles secuenciales
