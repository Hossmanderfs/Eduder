# E12 — Diagrama de Clases Detallado

| Clase | Atributos Principales | Métodos Principales | Relaciones |
|-------|-----------------------|--------------------|-----------| 
| **Usuario** | - id_usuario: String; - correo: String; - contrasena_hash: String; - rol: Enum; - estado: Enum; - intentos_login: int | +registrar(); +iniciarSesion(clave): JWT; +bloquear(); +recuperarContrasena(correo) | 1—1 PerfilEstudiante; 1—N ProgresoLeccion; 1—N TokenRecuperacion |
| **PerfilEstudiante** | - xp_total: int; - nivel_actual: int; - streak_dias: int; - ultima_actividad: Date; - xp_semana_actual: int | +sumarXP(cantidad); +calcularStreak(); +actualizarNivel(); +obtenerResumen(): PerfilDTO | 1—1 Usuario; N—N MedallaCatalogo |
| **Nivel** | - id_nivel: int; - nombre: String; - umbral_aprobacion: int; - estado: Enum | +estaDesbloqueado(idUsuario): boolean; +obtenerLecciones(): List; +calcularPromedioUsuario(): double | 1—N Leccion; 1—N RankingSemanal |
| **Leccion** | - id_leccion: String; - titulo: String; - tipo: Enum; - orden: int; - xp_base: int | +cargarContenido(): List; +calcularXPFinal(puntaje): int; +estaDesbloqueada(idUsuario): boolean | N—1 Nivel; 1—N Ejercicio; 1—N ProgresoLeccion |
| **Ejercicio** | - id_ejercicio: String; - enunciado: String; - tipo_interaccion: Enum; - respuesta_correcta: String; - explicacion: String | +evaluar(respuesta): Feedback; +obtenerPista(numero): Pista | N—1 Leccion; 1—N Pista (máx. 2) |
| **ProgresoLeccion** | - estado: Enum; - puntaje: int {0..100}; - intentos: int; - fecha_completado: DateTime | +registrar(puntaje); +estaCompletada(): boolean; +actualizarEstado(estado) | N—1 Usuario; N—1 Leccion |
| **MedallaCatalogo** | - condicion_tipo: Enum; - condicion_valor: int; - icono_url: String | +verificarCondicion(perfil: PerfilEstudiante): boolean | 1—N MedallaUsuario |
| **RankingSemanal** | - semana_inicio: Date; - xp_semana: int; - posicion: int | +actualizar(xp); +obtenerTop(nivel, limite): List; +reiniciarSemanal() | N—1 Usuario; N—1 Nivel |
| **TokenRecuperacion** | - token_hash: String; - expira_en: DateTime; - usado: boolean | +estaVigente(): boolean; +invalidar(); +generar(idUsuario): String | N—1 Usuario |

> 📎 Ver diagrama UML en `imagenes/E12-clases.png`
