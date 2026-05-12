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

Se definieron **17 historias de usuario (HU-01 a HU-17)** con criterios de aceptación, que son la fuente primaria de RF-01 a RF-24 y RNF-01 a RNF-06.

| ID | Historia | RF Relacionados |
|----|----------|-----------------|
| HU-01 | Registrarme con correo institucional | RF-01, RF-02 |
| HU-02 | Iniciar sesión con correo y contraseña | RF-03, RF-04, RF-05, RF-06 |
| HU-03 | Ver los 5 niveles disponibles | RF-07, RF-08 |
| HU-04 | Seleccionar y comenzar una lección | RF-08, RF-09 |
| HU-05 | Responder ejercicios y recibir feedback | RF-10 |
| HU-06 | Solicitar pistas durante un ejercicio | RF-11 |
| HU-07 | Ver puntaje y XP al finalizar lección | RF-12 |
| HU-08 | Mantener racha de estudio diario | RF-13 |
| HU-09 | Desbloquear medallas al alcanzar logros | RF-14, RF-15 |
| HU-10 | Recibir notificaciones push diarias | RF-16 |
| HU-11 | Ver ranking semanal por nivel | RF-17 |
| HU-12 | Consultar perfil y progreso | RF-18 |
| HU-13 | Recuperar contraseña olvidada | RF-19 |
| HU-14 | Administrador: activar/desactivar cuentas | RF-20 |
| HU-15 | Administrador: buscar usuarios por correo | RF-21 |
| HU-16 | Administrador: visualizar KPIs y exportar CSV | RF-22 |
| HU-17 | Sistema: backup y notificaciones automáticas | RF-23, RF-16 |

## 6.4 Prototipado Iterativo

Wireframes de baja fidelidad para validar flujos de navegación: WF-01 (Menú Principal), WF-02 (Ejercicio), WF-03 (Perfil del Estudiante).

## 6.5 Análisis de Contexto y Restricciones

- **Técnicas:** autenticación `@uniremington.edu.co`; Android 8+ / iOS 13+
- **Regulatorias:** WCAG 2.1 AA; OWASP Top Ten
- **Negocio:** MVP enfocado en lógica matemática, 5 niveles secuenciales
