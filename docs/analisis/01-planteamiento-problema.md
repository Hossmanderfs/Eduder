# 01 — Planteamiento del Problema

## Contexto

La Corporación Universitaria Remington enfrenta un índice de deserción académica aproximado del **10%** en los primeros semestres, con concentración significativa en materias cuantitativas como lógica matemática. Los estudiantes de ingeniería y STEM presentan dificultades para comprender proposiciones, tablas de verdad y álgebra booleana, en parte por la falta de herramientas didácticas digitales especializadas.

Las plataformas existentes (Duolingo, Khan Academy) no cubren el nicho específico de lógica matemática universitaria en español con enfoque gamificado y contextualizado al currículo colombiano.

## Pregunta de Investigación

> ¿Cómo diseñar e implementar una aplicación móvil gamificada que permita a los estudiantes de la Corporación Universitaria Remington fortalecer sus competencias en lógica matemática mediante microlearning, feedback inmediato y mecánicas de juego, reduciendo la tasa de deserción en materias cuantitativas durante los primeros semestres?

## Requisitos Funcionales y No Funcionales

### Requisitos Funcionales (RF-01 a RF-28)

| ID | Categoría | Descripción | Actor |
|---|---|---|---|
| RF-01 | Autenticación | El sistema debe permitir el registro de nuevos estudiantes validando que el correo termine en @miremington.edu.co (estudiantes) o @uniremington.edu.co (administración) mediante expresión regular. | Estudiante |
| RF-02 | Autenticación | Al registrarse, el sistema debe encriptar la contraseña con bcrypt (costo ≥ 10) y crear automáticamente un PERFIL_ESTUDIANTE con nivel 1, XP 0 y streak 0. | Sistema |
| RF-03 | Autenticación | El sistema debe autenticar usuarios registrados mediante correo y contraseña, generando un token JWT con expiración de 24 horas. | Estudiante / Admin |
| RF-04 | Autenticación | Tras un inicio de sesión exitoso, el sistema debe cargar el PERFIL_ESTUDIANTE y redirigir al menú principal en menos de 3 segundos. | Sistema |
| RF-05 | Autenticación | El sistema debe incrementar el contador de intentos_login fallidos y bloquear la cuenta por 15 minutos tras 5 intentos consecutivos incorrectos. | Sistema |
| RF-06 | Autenticación | El sistema debe restaurar automáticamente el acceso cuando expire el tiempo de bloqueo, reiniciando intentos_login a 0. | Sistema |
| RF-07 | Contenido | El sistema debe ofrecer 5 niveles de lógica matemática con estructura secuencial: Fundamentos, Tablas de Verdad, Álgebra Booleana, Demostración y Razonamiento Aplicado. | Estudiante |
| RF-08 | Contenido | El sistema debe desbloquear lecciones y niveles de forma secuencial: el estudiante solo puede acceder a la siguiente lección al completar la anterior. | Sistema |
| RF-09 | Progreso | El sistema debe registrar el avance por lección en PROGRESO_LECCION con estados NO_INICIADA → EN_PROGRESO → COMPLETADA, permitiendo retomar desde EN_PROGRESO. | Sistema |
| RF-10 | Ejercicios | El sistema debe presentar ejercicios interactivos de selección múltiple, completar espacios y arrastrar elementos, evaluando la respuesta y mostrando feedback en menos de 1 segundo. | Estudiante |
| RF-11 | Ejercicios | El sistema debe ofrecer al estudiante hasta 2 pistas por ejercicio. La segunda pista solo se muestra si el estudiante la solicita explícitamente. | Estudiante |
| RF-12 | Progreso | Al completar una lección, el sistema debe calcular el puntaje final (porcentaje de aciertos 0-100), sumar los XP correspondientes al PERFIL_ESTUDIANTE y evaluar si se desbloquea el siguiente nivel (umbral ≥ 70%). | Sistema |
| RF-13 | Gamificación | El sistema debe calcular y actualizar el streak de días consecutivos de estudio. Si la última actividad fue antes de ayer, el streak se reinicia a 0. | Sistema |
| RF-14 | Gamificación | El sistema debe otorgar medallas al estudiante cuando se cumplan las condiciones del MEDALLAS_CATALOGO (nivel completado, puntaje perfecto, streak, XP acumulado). Cada medalla se otorga solo una vez por usuario. | Sistema |
| RF-15 | Gamificación | Las condiciones de desbloqueo de medallas deben evaluarse automáticamente al finalizar cada lección. | Sistema |
| RF-16 | Notificaciones | El sistema debe enviar notificaciones push diarias a través de FCM (Android) y APNs (iOS) para mantener la racha de estudio del estudiante. | Sistema |
| RF-17 | Gamificación | El sistema debe mantener un ranking semanal por nivel basado en XP acumulados en la semana. El ranking se reinicia cada lunes a las 00:00. | Estudiante |
| RF-18 | Progreso | El sistema debe permitir al estudiante consultar su perfil con: nivel actual, XP total, streak, porcentaje de avance por nivel, medallas obtenidas e historial de lecciones completadas con fecha y puntaje. | Estudiante |
| RF-19 | Autenticación | El sistema debe permitir recuperar la contraseña enviando un enlace de recuperación al correo institucional. El token tiene validez de 30 minutos y se invalida tras ser usado | Estudiante |
| RF-20 | Administración | El administrador debe poder activar o desactivar cuentas de estudiantes desde el panel web. Al desactivar, las sesiones JWT activas del usuario afectado se invalidan inmediatamente. | Administrador |
| RF-21 | Administración | El administrador debe poder buscar usuarios por correo institucional y consultar su nombre, estado, nivel actual y fecha de registro. | Administrador |
| RF-22 | Administración | El administrador debe poder visualizar KPIs del sistema (usuarios activos, lecciones completadas, promedio de puntajes) filtrando por rango de fechas y exportarlos en formato CSV. | Administrador |
| RF-23 | Sistema | El sistema debe ejecutar un backup automático diario a las 02:00 h mediante cron job, almacenando el snapshot en AWS S3 o Firebase Storage y registrando un log de éxito o fallo. | Sistema |
| RF-24 | Sistema | La aplicación móvil debe estar disponible para distribución en Google Play Store (Android 8.0+, API 26) y Apple App Store (iOS 13+). | Sistema |
| RF-25 | Administración | El administrador debe poder crear, editar y eliminar los niveles del sistema (nombre, orden y descripción). | Administrador |
| RF-26 | Administración | El administrador debe poder crear, editar y eliminar lecciones dentro de un nivel, incluyendo su contenido y orden. | Administrador |
| RF-27 | Administración | El administrador debe poder crear, editar y eliminar ejercicios asociados a una lección, incluyendo enunciado, tipo, respuesta correcta y pistas. | Administrador |
| RF-28 | Administración | El administrador debe poder crear, editar y eliminar medallas del catálogo de gamificación (nombre, ícono y condición de desbloqueo). | Administrador |

### Requisitos No Funcionales (RNF-01 a RNF-10)

| ID | Categoría | Descripción | Actor |
|---|---|---|---|
| RNF-01 | Disponibilidad | El sistema debe garantizar disponibilidad del 99.5% mensual. Los backups diarios automáticos y las notificaciones push deben ejecutarse sin intervención humana para asegurar la continuidad del servicio. | Sistema |
| RNF-02 | Rendimiento | El sistema debe responder a las evaluaciones de ejercicios y entregar feedback contextualizado en menos de 1 segundo. El menú principal y el perfil del estudiante deben cargarse en menos de 3 segundos. | Sistema |
| RNF-03 | Seguridad | Todas las comunicaciones deben realizarse sobre HTTPS con TLS 1.2+. Las contraseñas deben almacenarse encriptadas con bcrypt (costo ≥ 10). La autenticación debe basarse en JWT. El sistema debe seguir el estándar OWASP Top Ten. | Sistema |
| RNF-04 | Escalabilidad | El sistema debe soportar al menos 5.000 usuarios concurrentes sin degradación de rendimiento. El modelo de base de datos debe estar normalizado a 3FN para garantizar integridad y escalabilidad. | Sistema |
| RNF-05 | Usabilidad | La interfaz debe cumplir con las pautas de accesibilidad WCAG 2.1 nivel AA. El diseño debe seguir principios de microlearning para reducir la fatiga cognitiva. La app debe ser compatible con Android 8+ e iOS 13+. | Estudiante |
| RNF-06 | Integridad | La base de datos debe mantener integridad referencial en todas las relaciones (ON DELETE RESTRICT / CASCADE). Los campos críticos deben tener constraints CHECK para garantizar validez de datos (ej. puntaje 0-100, numero_pista IN (1,2)). | Sistema |
| RNF-07 | Mantenibilidad | El código fuente del backend debe seguir una arquitectura de servicios desacoplados de modo que la modificación o reemplazo de un servicio no afecte los demás. Cada servicio debe contar con pruebas unitarias con cobertura mínima del 80% antes de pasar a producción. | Equipo dev |
| RNF-08 | Portabilidad | La aplicación móvil debe ejecutarse de forma nativa en Android 8.0+ (API 26) e iOS 13+ sin pérdida de funcionalidad entre plataformas. El panel de administración web debe ser completamente funcional en las dos últimas versiones de Chrome, Firefox, Safari y Edge. | Sistema |
| RNF-09 | Privacidad | El sistema debe tratar los datos personales de los estudiantes (nombre, correo, progreso académico) conforme a la Ley 1581 de 2012 (Habeas Data, Colombia). Los datos de progreso y desempeño no deben ser accesibles entre estudiantes; únicamente el ranking semanal (posición y XP) puede ser visible para otros usuarios del mismo nivel. | Sistema / Legal |
| RNF-10 | Recuperabilidad | Ante una falla crítica, el sistema debe ser capaz de restaurarse a partir del backup diario más reciente en un tiempo máximo de 4 horas (RTO ≤ 4 h). La pérdida máxima de datos tolerable no debe superar 24 horas de actividad (RPO ≤ 24 h). | Sistema |

### Reglas de Negocio (RN-01 a RN-22)

| ID | Descripción |
|---|---|
| RN-01 | El correo institucional debe terminar en @miremington.edu.co (estudiantes) o @uniremington.edu.co (administración). |
| RN-02 | La contraseña se almacena encriptada con bcrypt, con un factor de costo mínimo de 10. |
| RN-03 | La cuenta se bloquea durante 15 minutos tras 5 intentos fallidos de inicio de sesión. |
| RN-04 | El campo xp_total nunca disminuye. |
| RN-05 | El streak_dias se reinicia a 0 si la última actividad es anterior a ayer. |
| RN-06 | El nivel_actual solo avanza cuando el promedio de puntajes del nivel actual es igual o superior al 70%. |
| RN-07 | Los niveles son 5 y secuenciales; no se puede saltar de nivel. |
| RN-08 | El umbral de aprobación mínimo por nivel (umbral_aprobacion) es 70%. |
| RN-09 | Dentro de un nivel, las lecciones se desbloquean en orden. |
| RN-10 | El estudiante debe completar la lección anterior para acceder a la siguiente. |
| RN-11 | El feedback de un ejercicio debe entregarse en menos de 1 segundo. |
| RN-12 | Un ejercicio admite máximo 2 pistas (numero_pista CHECK IN (1,2)); la segunda pista solo se muestra si el estudiante la solicita explícitamente. |
| RN-13 | El puntaje de una lección está entre 0 y 100 (porcentaje de aciertos). |
| RN-14 | El estado de PROGRESO_LECCION transita NO_INICIADA → EN_PROGRESO → COMPLETADA; se puede retomar desde EN_PROGRESO. |
| RN-15 | Una medalla se otorga una sola vez por usuario. |
| RN-16 | Las condiciones de desbloqueo de medallas se evalúan al finalizar cada lección. |
| RN-17 | El ranking es semanal y por nivel; el XP acumulado en la semana determina la posición y se reinicia cada lunes a las 00:00. |
| RN-18 | El token de recuperación de contraseña tiene una validez de 30 minutos. |
| RN-19 | Un token de recuperación usado (usado=TRUE) no puede reutilizarse. |
| RN-20 | No se puede eliminar un nivel que tenga lecciones asociadas sin antes reasignarlas o eliminarlas (integridad referencial). |
| RN-21 | No se puede eliminar una lección con progreso de estudiantes registrado; en su lugar se marca como inactiva o archivada. |
| RN-22 | No se puede eliminar una medalla ya otorgada a algún estudiante; se marca como inactiva en el catálogo. |
