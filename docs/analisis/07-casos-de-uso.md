# 07 — Casos de Uso

## CU-01: Registro de Estudiante

| ID | CU-01 |
|---|---|
| Nombre | Registro de Estudiante |
| Actor Principal | Estudiante |
| Actores Secundarios | Sistema de Email (externo) |
| Historias de Usuario | HU-01 |
| Requisitos | RF-01, RF-02 |
| Precondición | El estudiante no posee cuenta activa en EduDer |
| Postcondición | Cuenta creada en estado 'activo'; PERFIL_ESTUDIANTE inicializado con nivel 1, XP 0, streak 0; tutorial de bienvenida mostrado |
| Flujo Normal | 1. El estudiante abre la app y selecciona 'Registrarse'. 2. Ingresa nombre, apellido, correo institucional (@miremington.edu.co para estudiantes) y contraseña. 3. El sistema valida el dominio del correo con regex. 4. El sistema verifica que el correo no exista en la BD. 5. El sistema encripta la contraseña con bcrypt (costo 10). 6. Se crea el registro en USUARIOS y PERFIL_ESTUDIANTE. 7. El sistema inicia sesión automáticamente y lanza el tutorial de bienvenida. |
| Flujo Alternativo A | 3a. El correo no termina en @miremington.edu.co (estudiantes) o @uniremington.edu.co (administración) → el sistema muestra: 'Debes usar tu correo institucional' → vuelve al paso 2. |
| Flujo Alternativo B | 4a. El correo ya está registrado → el sistema informa: 'Este correo ya tiene una cuenta' y ofrece enlace a 'Iniciar sesión'. |
| Excepción | Error de conexión a BD → el sistema muestra mensaje de error genérico y sugiere reintentar. |

## CU-02: Inicio de Sesión

| ID | CU-02 |
|---|---|
| Nombre | Inicio de Sesión |
| Actor Principal | Estudiante / Administrador |
| Historias de Usuario | HU-02 |
| Requisitos | RF-03, RF-04, RF-05, RF-06 |
| Precondición | El usuario posee cuenta registrada |
| Postcondición | Token JWT generado; usuario accede al menú principal con progreso cargado en < 3 segundos |
| Flujo Normal | 1. El usuario ingresa correo y contraseña. 2. El sistema verifica que la cuenta no esté bloqueada (bloqueado_hasta < NOW()). 3. El sistema compara la contraseña ingresada con contrasena_hash usando bcrypt.compare(). 4. Si coincide, reinicia intentos_login a 0 y genera token JWT con expiración de 24 horas. 5. El sistema carga el PERFIL_ESTUDIANTE y redirige al menú principal. |
| Flujo Alternativo A | 3a. Contraseña incorrecta → incrementa intentos_login en 1. Si intentos_login = 5, establece bloqueado_hasta = NOW() + 15min. Muestra mensaje de error y número de intentos restantes. |
| Flujo Alternativo B | 2a. Cuenta bloqueada → muestra: 'Tu cuenta está bloqueada hasta [hora]. Puedes intentar de nuevo más tarde.' |
| Flujo Alternativo C | 2b. Cuenta inactiva → muestra: 'Tu cuenta está inactiva. Contacta al soporte: soporte@uniremington.edu.co' |

## CU-03: Completar una Lección

| ID | CU-03 |
|---|---|
| Nombre | Seleccionar y Completar una Lección |
| Actor Principal | Estudiante |
| Historias | HU-04, HU-05, HU-06, HU-07 |
| Requisitos | RF-07, RF-08, RF-09, RF-10, RF-11, RF-12, RF-13, RF-14, RF-15, RF-17 |
| Precondición | El estudiante tiene sesión activa y la lección está desbloqueada |
| Postcondición | PROGRESO_LECCION actualizado (estado=completada, puntaje, fecha); XP sumado en PERFIL_ESTUDIANTE; streak y medallas evaluados |
| Flujo Normal | 1. El estudiante navega al mapa de niveles y selecciona una lección disponible. 2. El sistema carga bloques de CONTENIDO_LECCION y muestra la introducción animada. 3. El sistema presenta ejercicios en secuencia de menor a mayor dificultad. 4. Para cada ejercicio: a. El estudiante puede solicitar pista (máximo 2). b. El estudiante envía su respuesta. c. El sistema evalúa vs. respuesta_correcta y muestra feedback < 1 segundo. 5. Al completar todos los ejercicios, el sistema muestra el mini-juego final. 6. El sistema calcula el puntaje final (% aciertos), actualiza PROGRESO_LECCION y suma XP. 7. Se muestra la pantalla de resumen con XP ganados, medallas y botón de continuar. |
| Flujo Alternativo A | 4b (Error): el sistema muestra ícono de error, respuesta correcta y explicación paso a paso. |
| Flujo Alternativo B | 1a. La lección siguiente está bloqueada: el sistema muestra: 'Completa la lección anterior para desbloquear esta'. |
| Flujo Alternativo C | 7a. El puntaje promedio del nivel sube a ≥ 70%: el sistema desbloquea el siguiente nivel con animación de celebración y XP bonus. |

## CU-04: Consultar Perfil y Progreso

| ID | CU-04 |
|---|---|
| Nombre | Consultar Perfil y Progreso Personal |
| Actor Principal | Estudiante |
| Historias | HU-13 |
| Requisitos | RF-17, RF-18 |
| Precondición | El estudiante tiene sesión activa |
| Postcondición | Solo lectura; no hay cambios en la BD |
| Flujo Normal | 1. El estudiante selecciona 'Mi Perfil' desde el menú principal. 2. El sistema consulta PERFIL_ESTUDIANTE: nivel actual, XP total, streak, porcentaje de avance por nivel. 3. El sistema consulta MEDALLAS_USUARIO JOIN MEDALLAS_CATALOGO y muestra medallas obtenidas y pendientes. 4. El estudiante puede seleccionar 'Ver historial de lecciones'. 5. El sistema consulta PROGRESO_LECCION y muestra lista con lección, fecha y puntaje obtenido. |

## CU-05: Recuperar Contraseña

| ID | CU-05 |
|---|---|
| Nombre | Recuperar Contraseña Olvidada |
| Actor Principal | Estudiante |
| Historias | HU-14 |
| Requisitos | RF-19 |
| Precondición | El usuario tiene cuenta registrada pero no recuerda su contraseña |
| Postcondición | Token de recuperación creado con expira_en = NOW() + 30min; correo enviado |
| Flujo Normal | 1. El usuario presiona 'Olvidé mi contraseña' en la pantalla de login. 2. Ingresa su correo institucional. 3. El sistema verifica que el correo exista en USUARIOS. 4. Genera un token aleatorio seguro, lo hashea y lo almacena en TOKENS_RECUPERACION. 5. Envía email al correo institucional con enlace de recuperación válido por 30 minutos. 6. El sistema muestra: 'Revisa tu correo institucional para restablecer tu contraseña'. 7. El usuario accede al enlace, ingresa nueva contraseña → el sistema actualiza contrasena_hash y marca el token como usado=TRUE. |
| Flujo Alternativo A | 3a. El correo no existe → el sistema muestra el mismo mensaje del paso 6 (por seguridad no se revela si el correo existe). |
| Flujo Alternativo B | 7a. El enlace expiró: el sistema informa que el enlace caducó y permite solicitar uno nuevo. |

## CU-06: Gestión de Usuarios (Administrador)

| ID | CU-06 |
|---|---|
| Nombre | Gestión de Usuarios — Panel Administrador |
| Actor Principal | Administrador |
| Historias | HU-15, HU-16 |
| Requisitos | RF-20, RF-21, RF-22 |
| Precondición | El administrador tiene sesión activa con rol='admin' |
| Postcondición | Estado del usuario actualizado en USUARIOS; sesiones activas del usuario afectado invalidadas inmediatamente |
| Flujo Normal | 1. El administrador accede al Panel de Administración (web). 2. Busca un usuario por correo institucional. 3. El sistema muestra: nombre, estado, nivel actual y fecha de registro. 4. El administrador cambia el estado (activo ↔ inactivo). 5. El sistema actualiza USUARIOS.estado e invalida el token JWT del usuario afectado. 6. El usuario afectado recibe notificación informativa. 7. Para métricas: el administrador selecciona rango de fechas → el sistema consulta KPIs y los muestra en dashboard. 8. Opcionalmente, el administrador exporta los KPIs en formato CSV. |

## CU-07: Gestión de Contenido Educativo (Administrador)

| ID | CU-07 |
|---|---|
| Nombre | Gestión de Contenido Educativo (Niveles, Lecciones, Ejercicios y Medallas) |
| Actor Principal | Administrador |
| Historias de Usuario | HU-18, HU-19, HU-20, HU-21 |
| Requisitos | RF-25, RF-26, RF-27, RF-28 |
| Precondición | El administrador tiene sesión activa con rol='admin'. |
| Postcondición | La tabla NIVELES, LECCIONES, EJERCICIOS o MEDALLAS_CATALOGO queda creada, actualizada o marcada como inactiva, según la operación CRUD ejecutada. |
| Flujo Normal | 1. El administrador accede al módulo de Gestión de Contenido Educativo desde el Panel de Administración (web). 2. Selecciona la entidad a gestionar: Niveles, Lecciones, Ejercicios o Medallas. 3. Para crear: completa el formulario correspondiente (nombre/enunciado, orden, descripción u otros campos según la entidad) y confirma. 4. Para editar: selecciona un registro existente, modifica los campos permitidos y guarda los cambios. 5. Para eliminar: selecciona un registro y confirma la eliminación. 6. El sistema valida las reglas de negocio aplicables (RN-20, RN-21, RN-22) antes de ejecutar la operación. 7. El sistema actualiza la tabla correspondiente (NIVELES, LECCIONES, EJERCICIOS o MEDALLAS_CATALOGO) y confirma la operación al administrador. |
| Flujo Alternativo A | 3a/4a. Datos incompletos o inválidos → el sistema muestra un mensaje de validación y no guarda el cambio. |
| Flujo Alternativo B | 5a. El registro a eliminar tiene dependencias activas (lecciones de un nivel, progreso de estudiantes o medallas ya otorgadas) → el sistema bloquea la eliminación física y ofrece marcar el registro como inactivo/archivado, conforme a RN-20, RN-21 y RN-22. |
| Excepción | Error de conexión a BD → el sistema muestra un mensaje de error genérico, no aplica cambios parciales y sugiere reintentar. |
