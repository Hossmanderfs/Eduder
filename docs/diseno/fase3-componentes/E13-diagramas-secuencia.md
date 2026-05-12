# E13 — Diagramas de Secuencia

## DS-01: Registro de Estudiante

| Paso | Actor/Componente | Descripción | Resultado |
|------|-----------------|-------------|-----------|
| 1 | Estudiante (UI) | Ingresa datos de registro | — |
| 2 | Auth Service | Recibe POST /auth/register | — |
| 3 | Auth Service | Valida regex @uniremington.edu.co | [Alt A] Error dominio |
| 4 | Auth Service → USUARIOS | SELECT correo — verifica unicidad | [Alt B] Correo existe |
| 5 | Auth Service | bcrypt.hash(clave, 10) | — |
| 6 | Auth Service → USUARIOS | INSERT usuarios | — |
| 7 | Auth Service → PERFIL_ESTUDIANTE | INSERT perfil_estudiante | — |
| 8 | Auth Service | Genera JWT (exp. 24 h) | Token de sesión |
| 9 | Estudiante (UI) | Muestra tutorial bienvenida | Cuenta creada |

---

## DS-02: Respuesta a Ejercicio con Feedback

| Paso | Actor/Componente | Descripción | Resultado |
|------|-----------------|-------------|-----------|
| 1 | Estudiante (UI) | Presiona 'Enviar respuesta' | — |
| 2 | Exercise Engine | Recibe POST /exercise/answer | — |
| 3 | Exercise Engine → EJERCICIOS | SELECT respuesta_correcta, explicacion | — |
| 4 | Exercise Engine | Compara respuesta vs. correcta | — |
| 5A | Exercise Engine | [CORRECTO] Prepara feedback positivo + XP | — |
| 5B | Exercise Engine | [INCORRECTO] Prepara feedback con explicacion[] | — |
| 6 | Exercise Engine → PROGRESO_LECCION | UPDATE progreso_leccion | — |
| 7 | Estudiante (UI) | Muestra feedback | < 1 segundo (RNF-02) |

---

## DS-03: Desbloqueo de Siguiente Nivel

| Paso | Actor/Componente | Descripción | Resultado |
|------|-----------------|-------------|-----------|
| 1 | Estudiante (UI) | Completa última lección del nivel | — |
| 2 | Progress Service | Evento: LECCION_COMPLETADA | — |
| 3 | Progress Service → BD | SELECT AVG(puntaje) por nivel | Calcula promedio |
| 4A | Progress Service → PERFIL_ESTUDIANTE | [prom ≥ 70] UPDATE nivel_actual += 1 | Nivel desbloqueado |
| 4B | Progress Service | [prom < 70] Lista lecciones con puntaje < 70 | — |
| 5 | Progress Service → PERFIL_ESTUDIANTE | Suma XP bonus si desbloqueó nivel | UPDATE perfil |
| 6 | Estudiante (UI) | Animación celebración / guía de mejora | Nivel desbloqueado o recomendaciones |

> 📎 Ver diagramas UML en `imagenes/E13-secuencia-DS01.png`, `E13-secuencia-DS02.png`, `E13-secuencia-DS03.png`
