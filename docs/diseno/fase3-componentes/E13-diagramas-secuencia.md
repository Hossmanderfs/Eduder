# E13 — Diagramas de Secuencia

## DS-01: Registro de Estudiante

| Paso | Actor/Componente | Descripción | Resultado |
|---|---|---|---|
| 1 | Estudiante (UI) | Ingresa datos de registro | — |
| 2 | Auth Service | Recibe POST /auth/register | — |
| 3 | Auth Service | Valida regex @miremington.edu.co (estudiantes) o @uniremington.edu.co (administración) | [Alt A] Error dominio |
| 4 | Auth Service → USUARIOS (BD) | SELECT correo — verifica unicidad | [Alt B] Correo existe |
| 5 | Auth Service | bcrypt.hash(clave, 10) | — |
| 6 | Auth Service → USUARIOS (BD) | INSERT usuarios — crea registro | — |
| 7 | Auth Service → PERFIL_ESTUDIANTE (BD) | INSERT perfil_estudiante — crea perfil | — |
| 8 | Auth Service | Genera JWT (exp. 24h) | Token de sesión |
| 9 | Estudiante (UI) | Muestra tutorial bienvenida | Cuenta creada |

---

## DS-02: Respuesta a Ejercicio con Feedback

| Paso | Actor/Componente | Descripción | Resultado |
|---|---|---|---|
| 1 | Estudiante (UI) → Exercise Engine | POST /exercise/answer con {idEjercicio, respuesta} | — |
| 2 | Exercise Engine → EJERCICIOS (BD) | SELECT ejercicio + respuesta_correcta, explicacion | — |
| 3 | EJERCICIOS (BD) → Exercise Engine | Devuelve respuesta correcta + explicación | — |
| 4 | Exercise Engine | Compara respuesta del alumno vs. correcta | [Alt] Incorrecta → pista disponible si intentos < 2 |
| 5 | Exercise Engine | Calcula XP (acierto) o prepara feedback con explicación (error) | — |
| 6 | Exercise Engine → Progress Service | Evento RESPUESTA_CORRECTA | — |
| 7 | Progress Service → PROGRESO_LECCION | UPDATE progreso_leccion — registra resultado | — |
| 8 | Progress Service → PERFIL_ESTUDIANTE | UPDATE xp_total, streak | — |
| 9 | Progress Service | Evalúa condiciones de medallas | — |
| 10 | Progress Service → Exercise Engine | Devuelve feedback + XP ganado | — |
| 11 | Estudiante (UI) | Muestra feedback (ícono + explicación + XP) | < 1 segundo (RNF-02) |

---

## DS-03: Desbloqueo de Siguiente Nivel

| Paso | Actor/Componente | Descripción | Resultado |
|---|---|---|---|
| 1 | Estudiante (UI) | Completa última lección del nivel | — |
| 2 | Progress Service | Evento: LECCION_COMPLETADA | — |
| 3 | Progress Service → BD | SELECT AVG(puntaje) de progreso_leccion donde nivel | Calcula promedio |
| 4A | Progress Service → PERFIL_ESTUDIANTE | [prom ≥ 70] UPDATE perfil: nivel_actual += 1 | Nivel desbloqueado |
| 4B | Progress Service | [prom < 70] Calcula lecciones con puntaje < 70 | — |
| 5 | Progress Service → PERFIL_ESTUDIANTE | Suma XP bonus si desbloqueó nivel | UPDATE perfil_estudiante |
| 6 | Estudiante (UI) | Muestra animación de celebración / lista de lecciones a mejorar | Nivel desbloqueado o guía de mejora |

> 📎 Ver diagramas UML en `imagenes/E13-secuencia-DS01.png`, `E13-secuencia-DS02.png`, `E13-secuencia-DS03.png`
