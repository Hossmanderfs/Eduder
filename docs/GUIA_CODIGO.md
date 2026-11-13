# Guía del código de EduDer

Esta guía explica en español cómo se organiza el repositorio y qué hacen las
funciones con nombre del producto ejecutable: API, aplicación móvil y panel de
administración. También describe los scripts, pruebas y documentos de diseño.
Los manejadores anónimos de eventos y de rutas se explican por su flujo o por
el endpoint al que pertenecen; no se repiten como funciones independientes.

## 1. Qué es el proyecto

EduDer es una aplicación educativa para practicar lógica matemática mediante
lecciones, ejercicios, seguimiento del progreso y elementos de gamificación.
Su arquitectura separa tres clientes/servicios:

1. **Aplicación móvil:** React Native y Expo. Presenta las pantallas y consume
   la API.
2. **Backend:** API REST con Express y Sequelize. Aplica las reglas de negocio
   y lee o escribe en MySQL.
3. **Panel administrativo web:** página servida por el backend para gestionar
   contenido, usuarios y métricas.

El recorrido típico es: la app móvil envía una petición HTTP → las rutas del
backend autentican y delegan la operación al servicio correspondiente → el
servicio consulta los modelos Sequelize → MySQL guarda o devuelve los datos.
Las tareas programadas ejecutan procesos de mantenimiento sin interacción del
usuario.

## 2. Mapa del repositorio

| Ruta | Responsabilidad |
|---|---|
| `src/backend/` | API, reglas de negocio, persistencia, procesos programados y pruebas del servidor. |
| `src/mobile/` | Aplicación móvil Expo: navegación, pantallas, tema, componentes y acceso a la API. |
| `src/admin/` | Panel web publicado bajo `/panel/` por el backend. |
| `docs/API.md` | Endpoints disponibles, permisos y formatos de operación. |
| `docs/analisis/` | Problema, alcance, objetivos, técnicas de elicitación y casos de uso. |
| `docs/diseno/fase1-arquitectura/` | Contexto, interacciones, componentes y despliegue. |
| `docs/diseno/fase2-datos/` | Diccionario de datos, modelos y DDL de MySQL. |
| `docs/diseno/fase3-componentes/` | Diagramas de clases, secuencia y estados. |
| `docs/diseno/fase4-interfaz/` | Mapa de navegación, wireframes y prototipo navegable. |
| `docs/diseno/imagenes/` | Diagramas exportados que acompañan los documentos de diseño. |
| `docs/trazabilidad/` | Correspondencia entre requisitos, casos de uso, modelos, pantallas y diagramas. |
| `README.md` | Descripción, instalación, configuración y ejecución. |
| `BITACORA.md`, `DECISIONES.md`, `Base de datos.md` | Registro de avance, decisiones técnicas y notas de persistencia del proyecto. |

Los directorios `.obsidian/` son preferencias del editor de notas, no código de
la aplicación. Las carpetas `node_modules/` contienen dependencias instaladas y
no forman parte del código propio documentado aquí.

## 3. Backend

### 3.1 Inicio y configuración

| Archivo / función | Qué hace |
|---|---|
| `src/backend/src/server.js` — inicialización | Carga variables de entorno, configura Express, CORS y JSON, publica el panel en `/panel`, registra las rutas, conecta con MySQL e inicia el servidor y el programador. |
| `GET /health` | Comprueba que el proceso HTTP responde; devuelve el estado del servicio. |
| `src/backend/src/config/database.js` | Crea y exporta la conexión Sequelize a MySQL, con pool de conexiones y opciones de nombres/fechas. |
| `src/backend/src/config/dominios.js` — `esCorreoInstitucional(correo)` | Comprueba que el correo tenga formato básico y que su dominio esté permitido por `DOMINIOS_PERMITIDOS`. |

### 3.2 Autenticación y permisos

En `src/backend/src/middleware/auth.middleware.js`:

- `verifyToken(req, res, next)`: exige un JWT Bearer válido, verifica que el
  usuario siga activo en la base de datos y agrega su identidad y rol a
  `req.usuario`. El rol vigente se consulta en MySQL.
- `requireAdmin(req, res, next)`: permite continuar únicamente cuando el rol
  autenticado es `admin`; en caso contrario responde con acceso prohibido.

### 3.3 Rutas HTTP

Los archivos de `src/backend/src/routes/` traducen las solicitudes HTTP a
llamadas de servicios. Validan permisos, envían el resultado JSON y convierten
los errores de negocio en respuestas HTTP.

| Archivo | Funciones expuestas |
|---|---|
| `auth.routes.js` | Registro, inicio de sesión, solicitud y cambio de contraseña, y cierre de sesión. Registro/login/recuperación son públicos; el cierre exige token. |
| `level.routes.js` | Consulta de niveles para usuarios autenticados y creación, edición o eliminación para administradores. |
| `lesson.routes.js` | Consulta de lección y contenido; listado y operaciones CRUD administrativas de lecciones. |
| `exercise.routes.js` | Envío de respuestas y consulta de pistas para usuarios autenticados; CRUD administrativo de ejercicios. `handle(fn)` adapta operaciones administrativas al formato HTTP común y conserva estados/códigos de error. |
| `progress.routes.js` | Actualiza el progreso de una lección para el usuario autenticado. |
| `profile.routes.js` | Devuelve el resumen del perfil y el progreso del usuario autenticado. |
| `gamification.routes.js` | Consulta de medallas y ranking; gestión administrativa del catálogo de medallas. `handle(fn)` centraliza el envío de resultados y errores en las rutas CRUD de medallas. |
| `admin.routes.js` | Lista/actualiza usuarios, presenta métricas y exporta los indicadores como CSV; todas sus rutas requieren rol administrador. |
| `notification.routes.js` | Lista notificaciones, marca una como leída o marca todas como leídas. `handle(fn)` comparte el manejo de respuesta y errores. |

Los manejadores declarados directamente dentro de `router.get/post/put/patch`
son funciones anónimas de transporte: toman parámetros de `req`, invocan el
servicio indicado y construyen la respuesta. Las reglas de negocio viven en
`services/`, no en esos manejadores.

### 3.4 Servicios y funciones de negocio

#### Autenticación — `services/auth.service.js`

- `signToken(usuario)`: firma el JWT con el identificador, correo y rol, y
  aplica la expiración configurada.
- `usuarioPublico(u)`: crea el objeto de usuario que puede enviarse al cliente,
  sin incluir el hash de contraseña.
- `validarContrasena(clave)`: aplica la política de longitud mínima, letra y
  número; lanza un error de validación si no se cumple.
- `register(body)`: valida los campos y dominio institucional, evita correos
  duplicados, cifra la contraseña, crea el usuario y su perfil inicial y
  devuelve usuario público y JWT.
- `login(body)`: verifica credenciales y estado, controla los intentos fallidos
  y el bloqueo temporal, limpia el bloqueo al autenticar correctamente y emite
  el JWT.
- `recover(body)`: genera un token de recuperación de un solo uso, invalida
  tokens anteriores y, si SMTP está configurado, envía el código/enlace. La
  respuesta no confirma si la cuenta existe.
- `logout()`: devuelve confirmación; al ser el JWT sin estado, la limpieza
  efectiva de la sesión se realiza en el cliente.
- `resetPassword(body)`: valida el token vigente, reemplaza el hash de
  contraseña y marca el token como usado.

#### Niveles — `services/level.service.js`

- `getLevels()`: obtiene niveles activos y sus lecciones activas en orden.
- `getLevelById(id)`: obtiene un nivel y sus lecciones o informa que no existe.
- `createLevel(body)`: valida los campos mínimos y crea el nivel.
- `updateLevel(id, body)`: actualiza solo los campos enviados del nivel.
- `deleteLevel(id)`: evita borrar un nivel que todavía tenga lecciones
  relacionadas; de lo contrario lo elimina.

#### Lecciones — `services/lesson.service.js`

- `validarTipo(tipo)`: restringe la lección a los tipos reconocidos por la app.
- `getLessonById(id)`: obtiene la información básica de una lección y su nivel.
- `getLessonContent(id)`: entrega bloques y ejercicios ordenados, sin exponer
  la respuesta correcta; solo incluye el número de cada pista.
- `createLesson(body)`: valida tipo y nivel padre, y crea una lección activa.
- `updateLesson(id, body)`: valida la lección y actualiza sus campos enviados.
- `deleteLesson(id)`: archiva la lección cuando ya hay progreso asociado; si no,
  la elimina.
- `getLessonsByLevel(id_nivel)`: lista las lecciones de un nivel en orden.
- `getAllLessons()`: lista todas las lecciones con el nivel asociado, para el
  panel administrativo.

#### Ejercicios — `services/exercise.service.js`

- `httpError(status, message)`: construye errores de negocio con código HTTP.
- `evaluate(body)`: compara la respuesta con la correcta después de normalizar
  mayúsculas y espacios; devuelve acierto y, si falla, la explicación.
- `getHint(id_ejercicio, numero)`: entrega la pista 1 o 2 solicitada.
- `normalizar(str)`: recorta y unifica espacios y convierte texto a minúsculas
  antes de comparar.
- `normalizarPistas(pistas)`: valida y ordena una colección de hasta dos pistas.
- `listByLesson(id_leccion)`: lista los ejercicios de la lección con sus
  respuestas y pistas, para uso administrativo.
- `createExercise(body)`: valida los datos y la lección, y crea ejercicio y
  pistas dentro de una transacción.
- `updateExercise(id, body)`: modifica los campos enviados; si se envían
  pistas, reemplaza las anteriores dentro de una transacción.
- `deleteExercise(id)`: elimina el ejercicio existente; la relación de base de
  datos elimina también sus pistas.

#### Progreso y recompensas — `services/progress.service.js`

- `updateProgress(id_leccion, body, id_usuario)`: valida el estado y puntaje,
  crea o actualiza el registro de progreso y, en la primera finalización,
  calcula el XP y actualiza el perfil.
- `actualizarPerfil(id_usuario, xp_ganado, leccion, ahora, puntaje)`: suma XP
  total/semanal, actualiza la actividad y la racha, y revisa recompensas.
- `getSummary(id_usuario)`: devuelve totales de XP y racha, conteos de lecciones
  y el detalle del progreso.
- `evaluarMedallas(id_usuario, perfil, ctx)`: compara el perfil y contexto con
  condiciones del catálogo, evita duplicados, registra logros y crea
  notificaciones.
- `contarPerfectas(id_usuario)`: cuenta lecciones finalizadas con puntaje 100.
- `contarNivelesCompletados(id_usuario)`: cuenta niveles cuyas lecciones activas
  ya fueron completadas.
- `diffDias(fecha1, fecha2)`: calcula la diferencia en días usada para mantener
  o reiniciar la racha.

#### Perfil — `services/profile.service.js`

- `getSummary(id_usuario)`: reúne datos públicos del usuario, perfil de
  estudiante, medallas obtenidas y hasta diez notificaciones no leídas.

#### Gamificación — `services/gamification.service.js`

- `getMedals(id_usuario)`: devuelve el catálogo visible para la persona y marca
  qué medallas ya obtuvo.
- `getRanking(id_nivel, id_usuario)`: sincroniza XP semanal, ordena las filas
  por XP y devuelve el top 20 incluyendo al usuario actual si quedó por fuera.
- `resetWeeklyXP()`: pone a cero el XP semanal de los perfiles al iniciar una
  nueva semana.
- `inicioSemana()`: obtiene la fecha del lunes de la semana actual.
- `httpError(status, message)`: construye errores con estado HTTP.
- `validarMedalla(body, parcial)`: valida campos requeridos o campos parciales
  del catálogo de medallas.
- `listCatalog()`: lista todas las medallas para administración y cuenta
  cuántas veces se otorgó cada una.
- `createMedal(body)`: valida y agrega una medalla activa al catálogo.
- `updateMedal(id, body)`: valida y actualiza los campos enviados.
- `deleteMedal(id)`: archiva una medalla ya otorgada; elimina las que nunca se
  han otorgado.

#### Administración y métricas — `services/admin.service.js`

- `getUsers(query)`: lista usuarios filtrando opcionalmente por rol/estado y
  excluyendo el hash de contraseña.
- `getUserByEmail(correo)`: consulta un usuario y su perfil por correo
  institucional.
- `updateUser(id, body)`: actualiza estado, rol, nombre o apellido.
- `parseRango(query)`: convierte y valida las fechas inclusivas de las métricas.
- `filtroFecha(rango)`: convierte el rango en condiciones Sequelize.
- `getMetrics(query)`: calcula conteos, progreso y promedios para el tablero.
- `csvCell(v)`: escapa valores CSV y previene que un valor se interprete como
  fórmula de hoja de cálculo.
- `exportMetricsCsv(query)`: crea el CSV de indicadores usando las métricas
  calculadas.

#### Notificaciones — `services/notification.service.js`

- `httpError(status, message)`: construye errores con estado HTTP.
- `list(id_usuario, query)`: lista las notificaciones más recientes con límite
  acotado y conteo de no leídas.
- `markRead(id_usuario, id_notificacion)`: marca como leída una notificación
  perteneciente a ese usuario.
- `markAllRead(id_usuario)`: marca como leídas todas las notificaciones
  pendientes y devuelve cuántas cambió.
- `create(id_usuario, tipo, mensaje)`: registra una notificación para uso de
  los servicios y tareas automáticas.
- `sendStreakReminders(ahora)`: envía recordatorios a estudiantes activos con
  racha que aún no han estudiado ese día, evitando duplicados diarios.

### 3.5 Modelos y relaciones

`src/backend/src/models/` define las entidades Sequelize. `models/index.js`
importa y exporta los modelos y establece sus relaciones y claves foráneas.
No contiene servicios de negocio.

| Modelo | Datos que representa |
|---|---|
| `Usuario` | Identidad, correo, rol, estado y credenciales protegidas. Su validador `isInstitucional(value)` verifica el dominio del correo. |
| `PerfilEstudiante` | Nivel, XP acumulado/semanal, racha y última actividad del estudiante. |
| `TokenRecuperacion` | Tokens de cambio de contraseña, expiración y uso. |
| `Nivel` | Nivel de aprendizaje, orden y umbral de aprobación. |
| `Leccion` | Lección de un nivel, tipo, orden, XP base y estado. |
| `ContenidoLeccion` | Bloques de teoría o contenido ordenados de una lección. |
| `Ejercicio` | Enunciado, interacción, orden, respuesta y explicación. |
| `Pista` | Texto y número de pista asociado a un ejercicio. |
| `ProgresoLeccion` | Estado, puntaje, intentos y fecha de finalización por usuario/lección. |
| `MedallaCatalogo` | Definición y condición de las medallas. |
| `MedallaUsuario` | Relación entre usuario y medalla obtenida, con fecha. |
| `Notificacion` | Mensajes del sistema para cada usuario y estado de lectura. |
| `RankingSemanal` | XP y posición de cada usuario por nivel y semana. |

### 3.6 Tareas automáticas y carga inicial

En `src/backend/src/jobs/scheduler.js`:

- `safe(nombre, fn)`: envuelve una tarea programada, registra su resultado y
  reporta sus errores.
- `start()`: registra el reinicio semanal de XP, el recordatorio diario de
  racha y el backup diario, usando la zona horaria configurada. Puede
  desactivarse con `DISABLE_CRON=true`.

En `src/backend/src/jobs/backup.js`:

- `DIR()` y `LOG()`: determinan las rutas del directorio y archivo de log.
- `log(linea)`: añade una entrada fechada al log.
- `dump(file)`: ejecuta `mysqldump` y escribe una copia de la base de datos.
- `limpiar()`: conserva la cantidad de copias definida por
  `BACKUP_RETENTION`.
- `runBackup()`: crea el backup, opcionalmente ejecuta el comando de subida,
  limpia copias antiguas y registra éxito o fallo.

En `src/backend/scripts/`:

- `data/contenido.js` contiene los datos de niveles, lecciones, ejercicios y
  medallas que se usan para la carga semilla; no implementa reglas de negocio.
- `seed-contenido.js` — `enunciadoConOpciones(e)` convierte opciones o piezas
  al formato embebido en el enunciado; `ejerciciosDe(l)` prepara ejercicios
  normales y los ítems de mini-juego; `main()` se conecta a MySQL y carga los
  datos en una transacción. `--reiniciar` reemplaza contenido y progreso según
  las reglas descritas en el propio script.

### 3.7 Pruebas del backend

`src/backend/tests/` contiene pruebas Jest:

- `auth-notif.test.js`: comportamiento de autenticación y notificaciones.
- `rn-delete.test.js`: reglas de borrado/archivo de nivel, lección y medalla.
- `validaciones.test.js`: validaciones de datos y reglas de entrada.

## 4. Aplicación móvil

### 4.1 Arranque, configuración y navegación

- `src/mobile/index.js`: registra `App` como punto de entrada de Expo.
- `src/mobile/src/App.js` — `App()`: carga las fuentes Lexend; mientras carga
  muestra un indicador y, al terminar, monta el proveedor de áreas seguras, el
  tema y la navegación.
- `src/mobile/src/config.js`:
  - `esCorreoInstitucional(correo)`: comprueba que el dominio esté permitido.
  - `detectarUrl()`: selecciona la URL del backend desde
    `EXPO_PUBLIC_API_URL`, la dirección del servidor Metro o la dirección por
    defecto del emulador.
- `src/mobile/src/navigation/AppNavigator.js`:
  - `MainTabs()`: presenta las pestañas Inicio, Niveles, Ranking y Perfil.
  - `AppNavigator()`: configura tema, rutas de autenticación, pestañas,
    pantallas de lección, perfil, notificaciones y panel administrativo.
- `src/mobile/src/navigation/navigationRef.js`: expone una referencia de
  navegación para que servicios como el interceptor HTTP puedan volver al login
  aunque no estén dentro de una pantalla.

### 4.2 Estado de usuario y datos

- `hooks/useAuth.js` — `useAuth()`: lee usuario y JWT de AsyncStorage y expone
  `loading`, `estaAutenticado` y `esAdmin`. Su función interna `cargar()`
  recupera la sesión al montar el hook.
- `hooks/useDashboard.js` — `useDashboard()`: obtiene el tablero al montar y
  cuando la pantalla recupera el foco. La función interna `cargar(silencioso)`
  administra carga, error y actualización.
- `services/api.js`: configura Axios con URL y timeout. El interceptor de
  solicitud agrega el JWT; el interceptor de respuesta limpia la sesión y
  navega al login ante un `401` de una ruta protegida.
- `services/auth.service.js`:
  - `register(datos)` y `login(datos)`: llaman a los endpoints de autenticación
    y guardan token/usuario.
  - `logout()`: elimina esos datos locales.
  - `getStoredSession()`: devuelve la sesión guardada o `null`.

### 4.3 Reglas y utilidades móviles

En `utils/progreso.js`:

- `normTipo(t)`: lleva variantes de nombres de tipo a una categoría que entiende
  la app.
- `normalizarNiveles(lista)`: ordena niveles/lecciones, filtra lecciones
  inactivas y normaliza sus tipos.
- `construirEstado(niveles, progreso, perfil)`: combina los datos del servidor
  para calcular estados, desbloqueos, puntajes, promedios y avance total.
- `siguienteLeccion(state)`: selecciona la lección en curso o la siguiente
  disponible.
- `cargarDashboard()`: solicita niveles, progreso y perfil en paralelo y
  construye el estado de presentación.

En `utils/leccion.js`:

- `normalizarLeccion(l)`: ordena contenido/ejercicios y separa opciones o piezas
  embebidas en el enunciado.
- `sesionLeccion.get()`, `set(s)` y `clear()`: consultan, guardan en memoria o
  limpian el contexto temporal de la lección en ejecución.

En `utils/formato.js`:

- `num(n)`, `fecha(iso)`, `fechaLarga(iso)` y `dias(n)`: formatean valores para
  mostrarlos en español de Colombia.
- `hace(iso)`: convierte una fecha en expresiones relativas como “ahora”,
  “hace 5 min” o “ayer”.
- `mensajeError(err, porDefecto)`: traduce errores HTTP o de conexión a un
  mensaje apto para la interfaz.

En `utils/sesion.js`:

- `irAMain(navigation)`: decide el destino después de autenticar: panel para
  administradores, tutorial para primera entrada o inicio para quien ya lo vio.

En `utils/validacion.js`:

- `errorClave(v)`: comprueba los requisitos de contraseña del formulario de
  registro y devuelve el mensaje de validación correspondiente.

### 4.4 Tema y componentes visuales

- `theme/index.js` — `ThemeProvider({ children })` proporciona colores y modo
  visual; su función interna `alternar()` cambia y guarda el modo claro/oscuro,
  y `useTheme()` permite leer el tema desde las pantallas.
- `ui/Icon.js` — `Icon({ name, size, color, style })` representa iconos del
  conjunto visual utilizado por la app.
- `ui/index.js` contiene estas funciones de componentes reutilizables:

| Componente | Qué representa |
|---|---|
| `Txt` | Texto con familia, peso, tamaño y color del tema. |
| `Screen` | Estructura base con áreas seguras, barra de estado, desplazamiento, refresco opcional y pie. |
| `BottomBar` | Franja inferior para las acciones principales, respetando el área segura. |
| `IconBtn` | Botón compacto de icono con etiqueta accesible y distintivo opcional. |
| `AppBar` | Barra superior con título, botón para volver y acciones opcionales. |
| `Carne` | Encabezado azul institucional para pantallas principales. |
| `CarneTop` | Fila superior del encabezado institucional con título y contenido auxiliar. |
| `Btn` | Botón con variantes visuales, tamaños, icono, carga y estado deshabilitado. |
| `LinkBtn` | Acción con apariencia y semántica de enlace. |
| `Card` | Superficie con bordes y fondo para agrupar contenido. |
| `Chip` | Etiqueta compacta con tono e icono opcional. |
| `Bar` | Indicador visual de progreso limitado al rango 0–100 %. |
| `Stat` | Tarjeta de métrica con icono, valor y etiqueta. |
| `Banner` | Mensaje informativo, preventivo, de error o éxito. |
| `SectionHead` | Título de sección con acción opcional. |
| `ListRow` | Fila de lista con icono, título, descripción, acción o estado bloqueado. |
| `Avatar` | Círculo de iniciales de nombre y apellido. |
| `Logo` | Marca EduDer con la letra E y colores institucionales. |
| `Loading` | Indicador de carga con texto. |
| `ErrorState` | Mensaje de error con acción opcional para reintentar. |
| `Empty` | Estado vacío con icono, título, texto y contenido adicional opcional. |
| `Field` | Campo de texto con etiqueta, ayuda, validación y opción para mostrar contraseña. |
| `Row` | Contenedor horizontal para alinear elementos. |

### 4.5 Pantallas y funciones de pantalla

Cada componente de pantalla administra el estado de su flujo y representa la
interfaz correspondiente. Los nombres indican su punto de entrada:

| Archivo / componente | Función en el flujo |
|---|---|
| `SplashScreen.js` — `SplashScreen()` | Comprueba la sesión y dirige al usuario al destino apropiado. |
| `TutorialScreen.js` — `TutorialScreen()` | Presenta la introducción inicial; `siguiente()` avanza diapositivas y `terminar()` guarda que ya se mostró. |
| `LoginScreen.js` — `LoginScreen()` | Captura credenciales; `entrar()` autentica y continúa según rol. |
| `RegisterScreen.js` — `RegisterScreen()` | Registra un estudiante; `enviar()` valida campos y envía el formulario. `set`, `toca`, `ver` y `okMsg` preparan actualización, estado de interacción y mensajes por campo. |
| `RecoverScreen.js` — `RecoverScreen()` | Solicita recuperación; `enviar()` valida correo institucional y solicita el enlace/código. |
| `ResetPasswordScreen.js` — `ResetPasswordScreen()` | Recibe el token y envía la nueva contraseña mediante `enviar()`. |
| `MenuScreen.js` — `MenuScreen()` | Muestra el inicio del estudiante y accesos al aprendizaje y actividad. |
| `MapaNivelesScreen.js` — `MapaNivelesScreen()` | Presenta el mapa de niveles y el estado de desbloqueo. |
| `ListaLeccionesScreen.js` — `ListaLeccionesScreen()` | Muestra las lecciones disponibles de un nivel. |
| `TeoriaScreen.js` — `TeoriaScreen()` | Carga y presenta bloques de contenido; `comenzar()` inicia la práctica o el mini-juego. |
| `EjercicioScreen.js` — `EjercicioScreen()` | Controla el contexto de la lección y presenta el ejercicio actual. |
| `EjercicioScreen.js` — `Pantalla()` | Administra respuestas, pistas, feedback, intentos y avance. `salir()` confirma salida; `pedirPista()` consulta la pista siguiente; `enviar()` evalúa; `avanzar()` pasa al siguiente ejercicio o resumen; `reintentar()` vuelve al ejercicio. |
| `EjercicioScreen.js` — `Opciones()`, `Blanco()`, `Libre()` | Capturan selección múltiple, completar una frase y respuesta de texto, respectivamente. |
| `EjercicioScreen.js` — `Arrastrar()` y `toca(i)` | Permiten ordenar piezas tocándolas; `toca` coloca o devuelve una pieza y actualiza la respuesta ordenada. `Pieza()` representa cada pieza seleccionable. |
| `MiniJuegoScreen.js` — `MiniJuegoScreen()` | Presenta una ronda contrarreloj de ejercicios de la lección. |
| `MiniJuegoScreen.js` — `empezar()` | Inicia el temporizador del juego. |
| `MiniJuegoScreen.js` — `responder(valor)` | Envía una respuesta, cuenta aciertos, muestra feedback y avanza o termina la ronda. |
| `MiniJuegoScreen.js` — `terminar(porTiempo)` | Detiene el reloj y guarda el resultado temporal para el resumen. |
| `MiniJuegoScreen.js` — `salir()` | Confirma el abandono y limpia el estado temporal de la lección. |
| `ResumenScreen.js` — `calcularPuntaje(S)` | Calcula el porcentaje a partir de aciertos al primer intento o, para el mini-juego, de los aciertos de la ronda. |
| `ResumenScreen.js` — `ResumenScreen()` | Guarda la finalización, muestra XP/racha/medallas y ofrece el siguiente destino. |
| `ResumenScreen.js` — `guardar()` | Registra el puntaje en el backend, recarga el tablero y compone el resumen. Evita enviar la operación dos veces simultáneamente. |
| `ResumenScreen.js` — `salir(destino, params)` | Limpia el contexto de la lección y restablece la pila de navegación. |
| `RankingScreen.js` — `RankingScreen()` | Consulta y muestra el ranking del nivel. `cuentaRegresiva()` calcula el tiempo restante; `abrir(r)` navega al perfil público de otra persona; `Podio()` presenta los primeros puestos. |
| `PerfilScreen.js` — `PerfilScreen()` | Presenta los datos y accesos del perfil; `cerrarSesion()` limpia sesión y navega fuera del área autenticada. |
| `PerfilPublicoScreen.js` — `PerfilPublicoScreen()` | Presenta la información pública disponible desde el ranking. |
| `MedallasScreen.js` — `MedallasScreen()` | Consulta y muestra el catálogo y logros; `condicion(m)` traduce el tipo de condición a una explicación visual. |
| `HistorialScreen.js` — `HistorialScreen()` | Muestra el historial de progreso de las lecciones. |
| `NotificacionesScreen.js` — `NotificacionesScreen()` | Consulta mensajes del usuario; `marcar(n)` marca una notificación y `marcarTodo()` actualiza todas. |
| `AdminPanelScreen.js` — `AdminPanelScreen()` | Abre el panel web para el rol administrador; `salir()` cierra la sesión administrativa desde la pantalla móvil. |

Los callbacks de botones y los efectos de React que aparecen dentro de estas
pantallas son conexiones entre eventos de interfaz y las funciones descritas.

## 5. Panel de administración web

El backend publica `src/admin/` en `/panel/`. La interfaz principal está en
`src/admin/index.html` y contiene la navegación, formularios y acciones de
administración. Sus funciones se agrupan así:

| Funciones | Qué hacen |
|---|---|
| `getToken()`, `api(path, opts)` | Obtienen la sesión del navegador y envían peticiones HTTP con token; `api` convierte respuestas no exitosas en errores visibles. |
| `toast(msg, type)`, `showErr(id, msg)`, `clearErr(id)` | Muestran avisos generales o errores junto a un formulario. |
| `bootApp(usuario)`, `doLogout()`, `showPage(name)`, `init()` | Inician la sesión visual, cierran sesión, cambian de sección y restauran la sesión al cargar la página. |
| `metricsQuery()`, `loadMetrics()`, `exportMetricsCsv()` | Construyen el filtro temporal, cargan los indicadores y descargan el CSV. |
| `loadLevels()`, `openLevelModal(nivel)`, `closeLevelModal()`, `saveLevel()` | Listan y crean/actualizan niveles mediante el modal. |
| `askConfirm(...)`, `closeConfirm()`, `confirmDelete(id)` | Presentan y ejecutan confirmaciones antes de operaciones destructivas. |
| `loadUsers()`, `toggleUserEstado(id, estadoActual, correo)` | Cargan usuarios y cambian su estado activo/inactivo. |
| `cargarMaestros()`, `poblarSelect(...)`, `poblarFiltroNivel()` | Cargan datos de referencia y opciones de los selectores de nivel. |
| `loadLessonsPage()`, `openLessonModal(leccion)`, `closeLessonModal()`, `saveLesson()`, `deleteLessonConfirm(id)` | Cargan, filtran, editan y eliminan lecciones. |
| `loadExercisesPage()`, `loadExercises()`, `openExerciseModal(idx)`, `closeExerciseModal()`, `saveExercise()`, `deleteExercise(id)` | Cargan y administran ejercicios y sus pistas para la lección seleccionada. |
| `loadMedals()`, `openMedalModal(idx)`, `closeMedalModal()`, `saveMedal()`, `deleteMedal(id)` | Listan y administran el catálogo de medallas. |
| `esc(v)` | Escapa texto antes de insertarlo como contenido HTML, evitando que datos del servidor se interpreten como marcado. |

`src/admin/src/services/api.js` ofrece un cliente modular alternativo:
`apiFetch(path, options)` agrega autorización y procesa errores; `adminApi`
agrupa operaciones de login, niveles, usuarios y métricas. La página
`index.html` actualmente realiza sus llamadas con su propio cliente interno.

## 6. Prototipo de interfaz y recursos visuales

`docs/diseno/fase4-interfaz/prototipo-web/` es un prototipo estático para
explorar pantallas y flujos; no reemplaza la app móvil ni el panel que usa la
API del backend. Sus carpetas contienen páginas HTML, estilos, fuentes y
scripts:

- `js/config.js`: valores visuales y modo de presentación.
- `js/api.js`: adaptador de datos del prototipo, con modo simulado o conexión
  a la API; también normaliza niveles/lecciones y deriva estados de progreso.
- `js/store.js`: datos simulados y operaciones locales de usuarios, contenido,
  progreso, ranking, notificaciones y métricas.
- `js/ui.js`: utilidades DOM, tema, formato, navegación, estados visuales y
  componentes comunes del prototipo.
- `js/admin.js`: estructura y acciones de navegación del prototipo
  administrativo.
- `js/content.js`: datos de demostración.
- `js/icons.js`: representación de iconos.
- `pages/` y `admin/`: pantallas HTML enlazadas desde el prototipo.
- `css/` y `fonts/`: estilos, tipografía y licencias de recursos.

El prototipo contiene sus propias funciones de demostración; no son las mismas
funciones de negocio que ejecuta el backend. Los documentos E15–E17 explican
el mapa, los wireframes y el prototipo.

## 7. Base de datos, API y requisitos

- `docs/diseno/fase2-datos/E11-script-DDL.sql` crea la estructura inicial de
  MySQL. Se ejecuta al instalar la base de datos.
- `docs/diseno/fase2-datos/` documenta entidades, relaciones, normalización y
  modelo relacional.
- `docs/API.md` describe rutas y convenciones para los clientes.
- `docs/trazabilidad/` conecta requisitos y casos de uso con los modelos,
  endpoints, métodos, estados y pantallas.
- `docs/analisis/` conserva la definición del problema y los requisitos de
  producto.
- `docs/diseno/fase1-arquitectura/` y `fase3-componentes/` ofrecen la vista
  arquitectónica y el comportamiento entre componentes.

Para instrucciones operativas, variables de entorno y comandos de ejecución,
consulta el [README](../README.md).
