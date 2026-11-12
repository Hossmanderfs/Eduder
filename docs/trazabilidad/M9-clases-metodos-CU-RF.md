# M9 — Clases / Métodos → Casos de Uso → RF

| Clase | Métodos Principales | Caso de Uso que Activa | RF Implementado |
|---|---|---|---|
| Usuario | registrar():boolean | CU-01 | RF-01, RF-02 |
| Usuario | iniciarSesion(clave):JWT | CU-02 | RF-03, RF-04 |
| Usuario | bloquear():void | CU-02 (flujo alt. A) | RF-05, RF-06 |
| Usuario | recuperarContrasena(correo):void | CU-05 | RF-19 |
| PerfilEstudiante | sumarXP(cantidad):void | CU-03 | RF-12 |
| PerfilEstudiante | calcularStreak():void | CU-03 | RF-13 |
| PerfilEstudiante | actualizarNivel():void | CU-03 (flujo alt. C) | RF-12 |
| PerfilEstudiante | obtenerResumen():PerfilDTO | CU-04 | RF-18 |
| Nivel | estaDesbloqueado(idUsuario):boolean | CU-03 | RF-07, RF-08 |
| Nivel | obtenerLecciones():List<Leccion> | CU-03 | RF-07 |
| Leccion | cargarContenido():List<Bloque> | CU-03 | RF-10 |
| Leccion | calcularXPFinal(puntaje):int | CU-03 | RF-12 |
| Ejercicio | evaluar(respuesta):Feedback | CU-03 | RF-10, RF-11 |
| Ejercicio | obtenerPista(numero):Pista | CU-03 | RF-11 |
| ProgresoLeccion | registrar(puntaje):void | CU-03 | RF-09 |
| ProgresoLeccion | estaCompletada():boolean | CU-03 | RF-09 |
| MedallaCatalogo | verificarCondicion(perfil):boolean | CU-03 | RF-14, RF-15 |
| RankingSemanal | actualizar(xp):void | CU-03 | RF-17 |
| RankingSemanal | obtenerTop(nivel, limite):List<RankingDTO> | CU-04 | RF-17 |
| TokenRecuperacion | estaVigente():boolean | CU-05 | RF-19 |
| Nivel | crear(datos):void; editar(id,datos):void; eliminar(id):void | CU-07 | RF-25 |
| Leccion | crear(datos):void; editar(id,datos):void; eliminar(id):void | CU-07 | RF-26 |
| Ejercicio | crear(datos):void; editar(id,datos):void; eliminar(id):void | CU-07 | RF-27 |
| MedallaCatalogo | crear(datos):void; editar(id,datos):void; eliminar(id):void | CU-07 | RF-28 |
| Usuario | desbloquear():void | CU-06 | RF-20 |
| Usuario | cambiarEstado(estado):void | CU-06 | RF-20 |
| Usuario | buscarPorCorreo(correo):Usuario | CU-06 | RF-21 |
| Nivel | calcularPromedioUsuario(idUsuario):double | CU-03 (flujo alt. C) | RF-08, RF-12 |
| Leccion | estaDesbloqueada(idUsuario):boolean | CU-03 | RF-08 |
| ProgresoLeccion | actualizarEstado(estado):void | CU-03 | RF-09 |
| Pista | mostrar():String | CU-03 | RF-11 |
| ContenidoLeccion | renderizar():Bloque | CU-03 | RF-10 |
| MedallaUsuario | otorgar(idUsuario, idMedalla):void | CU-03 | RF-14 |
| RankingSemanal | reiniciarSemanal():void | — (tarea programada) | RF-17 |
| TokenRecuperacion | invalidar():void | CU-05 | RF-19 |
| TokenRecuperacion | generar(idUsuario):String | CU-05 | RF-19 |
| Notificacion | marcarLeida():void | — (sin CU; WF-16) | RF-16 |
| Notificacion | enviarPush():void | — (tarea programada) | RF-16 |
