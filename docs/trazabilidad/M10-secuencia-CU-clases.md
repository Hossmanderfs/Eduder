# M10 — Diagramas de Secuencia → Casos de Uso → Clases Participantes

| Diagrama de Secuencia | Caso de Uso | Clases / Componentes Participantes | Flujos Alternativos Cubiertos |
|---|---|---|---|
| DS-01: Registro de Estudiante | CU-01 | Estudiante (UI), Auth Service, USUARIOS, PERFIL_ESTUDIANTE | Alt A: dominio incorrecto (el dominio no es @miremington.edu.co ni @miremington.edu.co (estudiantes) o @uniremington.edu.co (administración)); Alt B: correo ya registrado; Excepción: error de conexión BD |
| DS-02: Respuesta a Ejercicio con Feedback | CU-03 | Estudiante (UI), Exercise Engine, EJERCICIOS, Progress Service, PROGRESO_LECCION, PERFIL_ESTUDIANTE | 5A: respuesta correcta → XP otorgados; 5B: respuesta incorrecta → explicación paso a paso; latencia ≤ 1 seg (RNF-02) |
| DS-03: Desbloqueo de Siguiente Nivel | CU-03 (flujo alt. C) | Progress Service, PROGRESO_LECCION, PERFIL_ESTUDIANTE, NIVELES | 4A: promedio ≥ 70% → nivel desbloqueado + XP bonus; 4B: promedio < 70% → lista de lecciones a mejorar |
