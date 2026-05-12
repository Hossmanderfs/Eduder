# M9 — Clases / Métodos → Casos de Uso → RF

| Clase (E12) | Método | Caso de Uso | RF |
|-------------|--------|-------------|-----|
| Usuario | registrar() | CU-01 | RF-01, RF-02 |
| Usuario | iniciarSesion(clave): JWT | CU-02 | RF-03, RF-04 |
| Usuario | bloquear() | CU-02 | RF-05, RF-06 |
| Usuario | recuperarContrasena(correo) | CU-05 | RF-19 |
| PerfilEstudiante | sumarXP(cantidad) | CU-03 | RF-15 |
| PerfilEstudiante | calcularStreak() | CU-03 | RF-13 |
| PerfilEstudiante | actualizarNivel() | CU-03 | RF-07 |
| PerfilEstudiante | obtenerResumen(): PerfilDTO | CU-04 | RF-18 |
| Nivel | estaDesbloqueado(idUsuario): boolean | CU-03 | RF-07 |
| Nivel | obtenerLecciones(): List | CU-03 | RF-08 |
| Leccion | cargarContenido(): List | CU-03 | RF-08 |
| Leccion | calcularXPFinal(puntaje): int | CU-03 | RF-15 |
| Leccion | estaDesbloqueada(idUsuario): boolean | CU-03 | RF-07 |
| Ejercicio | evaluar(respuesta): Feedback | CU-03 | RF-10, RF-12 |
| Ejercicio | obtenerPista(numero): Pista | CU-03 | RF-11 |
| ProgresoLeccion | registrar(puntaje) | CU-03 | RF-09 |
| ProgresoLeccion | estaCompletada(): boolean | CU-03 | RF-09 |
| ProgresoLeccion | actualizarEstado(estado) | CU-03 | RF-09 |
| MedallaCatalogo | verificarCondicion(perfil): boolean | CU-03 | RF-14 |
| RankingSemanal | actualizar(xp) | CU-03 | RF-17 |
| RankingSemanal | obtenerTop(nivel, limite): List | CU-04 | RF-17 |
| RankingSemanal | reiniciarSemanal() | Sistema (cron) | RF-17 |
| TokenRecuperacion | estaVigente(): boolean | CU-05 | RF-19 |
| TokenRecuperacion | invalidar() | CU-05 | RF-19 |
| TokenRecuperacion | generar(idUsuario): String | CU-05 | RF-19 |
