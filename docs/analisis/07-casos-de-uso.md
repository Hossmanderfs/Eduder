# 07 — Casos de Uso

## CU-01: Registro de Estudiante

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Estudiante |
| **Requisitos** | RF-01, RF-02 |
| **Precondición** | El estudiante no posee cuenta activa |
| **Postcondición** | Cuenta creada; PERFIL_ESTUDIANTE inicializado (nivel 1, XP 0, streak 0) |
| **Flujo Normal** | 1. Abre app → 'Registrarse' · 2. Ingresa datos · 3. Valida dominio correo · 4. Verifica unicidad · 5. bcrypt.hash(clave, 10) · 6. INSERT usuarios + perfil_estudiante · 7. Genera JWT · 8. Muestra tutorial |
| **Alternativo A** | Correo dominio incorrecto → mensaje de error |
| **Alternativo B** | Correo ya registrado → redirige a Login |

---

## CU-02: Inicio de Sesión

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Estudiante / Administrador |
| **Requisitos** | RF-03, RF-04, RF-05, RF-06 |
| **Precondición** | Usuario con cuenta registrada |
| **Postcondición** | Token JWT generado; menú cargado en < 3 s |
| **Flujo Normal** | 1. Ingresa correo + contraseña · 2. Verifica bloqueo · 3. bcrypt.compare() · 4. Genera JWT 24 h · 5. Carga perfil |
| **Alternativo A** | Contraseña incorrecta → incrementa intentos; bloqueo a los 5 |
| **Alternativo B** | Cuenta bloqueada → muestra tiempo restante |
| **Alternativo C** | Cuenta inactiva → contactar soporte |

---

## CU-03: Completar una Lección

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Estudiante |
| **Requisitos** | RF-07 a RF-12 |
| **Precondición** | Sesión activa; lección desbloqueada |
| **Postcondición** | PROGRESO_LECCION actualizado; XP sumado; streak y medallas evaluados |
| **Flujo Normal** | 1. Selecciona lección · 2. Carga contenido · 3. Ejercicios secuenciales (pistas, respuesta, feedback < 1 s) · 4. Mini-juego final · 5. Pantalla resumen con XP y medallas |
| **Alternativo A** | Respuesta incorrecta → explicación paso a paso |
| **Alternativo C** | Puntaje promedio ≥ 70% → desbloquea siguiente nivel con animación |

---

## CU-04: Consultar Perfil y Progreso

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Estudiante |
| **Requisitos** | RF-18 |
| **Flujo Normal** | 1. 'Mi Perfil' · 2. Carga PERFIL_ESTUDIANTE (nivel, XP, streak, % avance) · 3. Medallas · 4. Historial de lecciones |

---

## CU-05: Recuperar Contraseña

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Estudiante |
| **Requisitos** | RF-19 |
| **Flujo Normal** | 1. 'Olvidé contraseña' · 2. Ingresa correo · 3. Genera token hash · 4. Envía email · 5. Usuario accede al enlace · 6. Actualiza contraseña; token usado=TRUE |
| **Alternativo A** | Correo no existe → mismo mensaje (seguridad) |
| **Alternativo B** | Enlace expirado → solicitar nuevo |

---

## CU-06: Gestión de Usuarios (Administrador)

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Administrador |
| **Requisitos** | RF-20, RF-21, RF-22 |
| **Precondición** | Sesión activa con rol='admin' |
| **Flujo Normal** | 1. Panel Admin · 2. Busca usuario por correo · 3. Visualiza datos · 4. Cambia estado · 5. Invalida JWT activo · 6. Notifica usuario · 7. Consulta KPIs por rango fechas · 8. Exporta CSV |
