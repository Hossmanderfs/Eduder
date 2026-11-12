# E16 — Wireframes (Baja Fidelidad)

Descripción por zonas de los 16 wireframes (sección 8.4.2 del documento). Cada uno tiene su implementación
navegable en el [prototipo web](prototipo-web/README.md) y su versión móvil en `src/mobile` (Expo).

## WF-01: Menú Principal

| Zona | Elementos |
|---|---|
| Zona superior | Avatar + Nombre del estudiante \| Barra de XP (progreso al siguiente nivel) \| Ícono de streak con contador de días |
| Zona central | Botón grande destacado: 'Continuar lección diaria' (animado con pulso). Acceso rápido a los 5 niveles en formato de tarjetas horizontales con estado visual (bloqueado/en progreso/completado) |
| Zona inferior | Tab bar: Inicio \| Niveles \| Ranking \| Perfil |
| Comportamiento | El botón 'Continuar lección diaria' redirige a la última lección en progreso o a la siguiente disponible. La barra de XP se anima al cargar la pantalla. |

## WF-02: Pantalla de Ejercicio

| Zona | Elementos |
|---|---|
| Zona superior | Barra de progreso de la lección (ejercicio X de Y) \| Botón X para salir con confirmación |
| Zona central | Enunciado del ejercicio en texto grande y claro. Área de respuesta según tipo: tarjetas de opciones (selección múltiple) \| espacios a completar \| elementos arrastrables. Botón '¿Necesitas una pista?' (max 2, se oculta tras agotarlas) |
| Zona inferior | Botón primario 'Enviar respuesta' (deshabilitado hasta que el usuario seleccione una opción) |
| Comportamiento | Al enviar: la pantalla se superpone con el panel de Feedback. El botón de pista está disponible antes de enviar. |

## WF-03: Perfil del Estudiante

| Zona | Elementos |
|---|---|
| Zona superior | Avatar circular \| Nombre y correo \| Nivel actual (badge) \| XP total \| Streak actual con ícono de fuego |
| Zona central | Sección 'Mi Progreso': barra por cada nivel con % completado. Sección 'Mis Medallas': grid de medallas (obtenidas en color, pendientes en gris con condición de desbloqueo) |
| Zona inferior | Botón 'Ver historial de lecciones' → lista con nombre, fecha y puntaje |

## WF-04: Pantalla de Registro

| Zona | Descripción |
|---|---|
| Zona superior | Logo EduDer centrado + título “Crear cuenta” |
| Zona central | Campos: Nombre, Apellido, Correo institucional (@miremington.edu.co para estudiantes), Contraseña, Confirmar contraseña. Cada campo tiene etiqueta y mensaje de validación inline |
| Zona inferior | Botón primario “Registrarse” (activo solo si formulario válido) + enlace “Ya tengo cuenta, iniciar sesión” |

## WF-05: Pantalla de Login

| Zona | Descripción |
|---|---|
| Zona superior | Logo EduDer + título “Iniciar sesión” |
| Zona central | Campo Correo institucional + Campo Contraseña (con toggle ver/ocultar). Banner de error “Credenciales incorrectas” visible solo tras fallo |
| Zona inferior | Botón “Entrar” + enlace “¿Olvidaste tu contraseña?” + enlace “Crear cuenta” |

## WF-06: Pantalla Recuperar Contraseña

| Zona | Descripción |
|---|---|
| Zona central | Instrucciones “Ingresa tu correo institucional y te enviaremos un enlace de recuperación” + campo Correo |
| Zona inferior | Botón “Enviar enlace” + mensaje de confirmación (toast) tras éxito. Enlace “Volver al login” |

## WF-07: Tutorial de Bienvenida (primer acceso)

| Zona | Descripción |
|---|---|
| Zona central | Carrusel de 3 diapositivas: (1) Bienvenido a EduDer, (2) ¿Cómo funciona?, (3) ¡Comienza tu primer nivel!. Indicador de puntos en la parte inferior |
| Zona inferior | Botón “Siguiente” / “Empezar” en la última diapositiva + enlace “Omitir tutorial” |

## WF-08: Pantalla de Selección de Nivel

| Zona | Descripción |
|---|---|
| Zona superior | Título “Niveles de Lógica Matemática” + barra de progreso global del usuario |
| Zona central | Lista vertical de 5 tarjetas de nivel. Nivel desbloqueado: nombre, ícono a color y porcentaje de avance. Nivel bloqueado: fondo gris, ícono de candado, leyenda “Completa el nivel anterior” |
| Tab bar | Inicio \| Niveles \| Ranking \| Perfil |

## WF-09: Pantalla de Selección de Lección

| Zona | Descripción |
|---|---|
| Zona superior | Encabezado con nombre del nivel seleccionado y botón “Atrás” |
| Zona central | Lista de lecciones del nivel con ícono de tipo (teoría / ejercicio / mini-juego / caso práctico), título, estado (no iniciada / en progreso / completada) y XP ganables |

## WF-10: Pantalla de Feedback de Respuesta

| Zona | Descripción |
|---|---|
| Respuesta correcta | Banner verde “✔ ¡Correcto!” + XP ganados animados (+50 XP) + botón “Siguiente ejercicio” |
| Respuesta incorrecta | Banner rojo “✖ Incorrecto” + explicación paso a paso colapsable + botón “Intentar de nuevo” |

## WF-11: Pantalla de Resumen de Lección

| Zona | Descripción |
|---|---|
| Zona central | Puntaje circular (0-100%) + XP totales ganados en la sesión + streak actual + si puntaje ≥70% y se desbloquea nivel nuevo: animación de celebración con confeti y badge del nuevo nivel |
| Zona inferior | Botones: “Siguiente lección” (si existe) \| “Volver al nivel” \| “Volver al menú principal” |

## WF-12: Pantalla de Ranking Semanal

| Zona | Descripción |
|---|---|
| Zona superior | Selector de nivel (chips horizontales: Nivel 1 … Nivel 5) + leyenda “Semana actual” con cuenta regresiva al reset del lunes |
| Zona central | Lista de posiciones (podio destacado para top-3) mostrando nº, avatar genérico y XP semanales. La fila del usuario actual aparece resaltada |

## WF-13: Pantalla de Medallas

| Zona | Descripción |
|---|---|
| Zona central | Cuadrícula 3 columnas con todas las medallas del catálogo. Medalla obtenida: ícono a color + nombre + fecha. Medalla pendiente: ícono en escala de grises + condición de desbloqueo |

## WF-14: Panel de Administración — Gestión de Usuarios

| Zona | Descripción |
|---|---|
| Zona superior | Barra lateral con navegación: Dashboard \| Usuarios \| Métricas. Barra de búsqueda por correo institucional |
| Zona central | Tabla de usuarios: correo, nombre, nivel actual, estado (chip color), fecha registro. Botón de acción por fila: Activar/Desactivar con diálogo de confirmación |

## WF-15: Panel de Administración — Métricas y Exportación

| Zona | Descripción |
|---|---|
| KPI Cards | 3 tarjetas: Usuarios activos, Lecciones completadas (semana), Puntaje promedio. Con indicador de tendencia (↑↓) |
| Filtro y exportación | Date picker rango de fechas + botón “Exportar CSV” que inicia descarga del archivo formateado |

## WF-16: Pantalla de Notificaciones

| Zona | Descripción |
|---|---|
| Zona central | Lista cronológica de notificaciones recibidas con ícono de tipo (racha / logro / sistema), mensaje y tiempo transcurrido. Notificaciones no leídas con fondo destacado. Botón “Marcar todo como leído” |

> 📎 Implementación de referencia: `prototipo-web/` (HTML/CSS/JS, abre `index.html`). App móvil: `src/mobile`.
