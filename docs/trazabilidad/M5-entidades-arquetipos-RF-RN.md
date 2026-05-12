# M5 — Entidades de BD → Arquetipos → RF → Reglas de Negocio

| Tabla (BD) | Arquetipo | RF Relacionados | Reglas de Negocio Clave |
|------------|-----------|-----------------|------------------------|
| rol | — (catálogo) | RF-03 | Solo dos valores válidos: 'estudiante', 'admin'. No acepta otros valores. |
| usuarios | Usuario | RF-01, RF-02, RF-03, RF-04, RF-05, RF-06 | correo debe terminar en @uniremington.edu.co; bloqueo tras 5 intentos fallidos; bcrypt costo ≥ 10 |
| perfil_estudiante | PerfilEstudiante | RF-15, RF-17, RF-18 | Relación 1:1 con usuarios; nivel_actual entre 1 y 5; streak_dias se reinicia si ultima_actividad > ayer |
| tokens_recuperacion | TokenRecuperacion | RF-19 | Expira en 30 min; usado=TRUE lo invalida permanentemente; solo un token vigente por usuario |
| niveles | Nivel | RF-07, RF-08 | umbral_aprobacion=70%; acceso secuencial; nivel 1 desbloqueado por defecto |
| tipo_leccion | — (catálogo) | RF-08 | Valores: teoria, ejercicio, mini_juego, caso_practico |
| lecciones | Leccion | RF-08, RF-09 | Orden secuencial por (id_nivel, orden); xp_base × (puntaje/100) = XP ganados |
| contenido_leccion | ContenidoLeccion | RF-08 | tipo_bloque determina cómo se renderiza: texto, imagen, video, animacion |
| ejercicios | Ejercicio | RF-10, RF-11, RF-12 | respuesta_correcta almacenada serializada; explicacion siempre presente |
| pistas | Pista | RF-11 | Máximo 2 por ejercicio (CHECK numero_pista IN (1,2)); se revelan bajo demanda |
| progreso_leccion | ProgresoLeccion | RF-09, RF-15 | UNIQUE(id_usuario, id_leccion); puntaje 0–100; intentos incrementa en cada sesión |
| medallas_catalogo | MedallaCatalogo | RF-14 | condicion_valor es umbral numérico para condicion_tipo |
| medallas_usuario | MedallaUsuario | RF-14 | UNIQUE(id_usuario, id_medalla): cada medalla se otorga una sola vez |
| notificaciones | — | RF-13, RF-16 | leida=FALSE por defecto; tipo: racha, logro, sistema |
| ranking_semanal | RankingSemanal | RF-17 | UNIQUE(semana_inicio, id_usuario, id_nivel); posicion es caché recalculable |
