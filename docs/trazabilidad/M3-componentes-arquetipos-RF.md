# M3 — Componentes de Arquitectura → Arquetipos → RF

| Componente (DCA / E5) | Arquetipo(s) que gestiona | RF Cubiertos |
|-----------------------|--------------------------|--------------|
| Auth Service | Usuario, TokenRecuperacion | RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-19 |
| Lesson Service | Nivel, Leccion, ContenidoLeccion | RF-07, RF-08 |
| Exercise Engine | Ejercicio, Pista | RF-10, RF-11, RF-12 |
| Progress Service | ProgresoLeccion, PerfilEstudiante | RF-09, RF-15, RF-16 |
| Gamification Service | MedallaCatalogo, MedallaUsuario, RankingSemanal | RF-13, RF-14, RF-17 |
| Notification Service | — (consume PerfilEstudiante y Notificacion) | RF-13, RF-16 |
| Admin Service | Usuario (rol=admin) | RF-20, RF-21, RF-22 |
| Backup Service | Todas las tablas | RF-23 |
| App Móvil (React Native) | Todos los arquetipos (capa de presentación) | RF-01 a RF-19, RF-24 |
| Panel Admin (React.js) | Usuario (admin), métricas | RF-20, RF-21, RF-22 |
| Base de Datos MySQL | Todos los arquetipos (persistencia) | Todos los RF |
