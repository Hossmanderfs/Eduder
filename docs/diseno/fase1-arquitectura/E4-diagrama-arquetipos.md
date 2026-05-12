# E4 — Diagrama de Arquetipos

| Arquetipo | Responsabilidad | Atributos Clave | Relaciones |
|-----------|----------------|-----------------|------------|
| Usuario | Identidad y acceso al sistema | id, correo, contraseña_hash, rol, estado | 1→1 PerfilEstudiante; 1→N ProgresoLeccion |
| PerfilEstudiante | Progreso gamificado | xp_total, nivel_actual, streak_dias | 1→1 Usuario; N→N Medalla |
| Nivel | Unidad de aprendizaje mayor | id_nivel, nombre, umbral_aprobacion | 1→N Leccion |
| Leccion | Unidad didáctica específica | titulo, tipo, xp_base, orden | 1→N Ejercicio; 1→N ContenidoLeccion |
| Ejercicio | Ítem evaluativo interactivo | enunciado, tipo_interaccion, respuesta_correcta | 1→N Pista |
| ProgresoLeccion | Registro de avance por lección | estado, puntaje, intentos, fecha_completado | N→1 Usuario; N→1 Leccion |
| MedallaCatalogo | Definición de logros | condicion_tipo, condicion_valor, icono_url | 1→N MedallaUsuario |
| RankingSemanal | Clasificación semanal | semana_inicio, xp_semana, posicion | N→1 Usuario; N→1 Nivel |

> 📎 Ver diagrama visual en `imagenes/E4-arquetipos.png`
