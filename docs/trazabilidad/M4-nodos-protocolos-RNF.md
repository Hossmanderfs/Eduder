# M4 — Nodos de Despliegue → Protocolos → Requisitos No Funcionales

| Nodo de Despliegue | Protocolo(s) | RNF Que Cumple | Componentes Alojados |
|---|---|---|---|
| Dispositivo Móvil (Android 8+ / iOS 13+) | HTTPS / TLS 1.2+ | RNF-01 (disponibilidad), RNF-02 (rendimiento UI), RNF-05 (usabilidad) | App EduDer (React Native), caché local de contenido |
| Servidor de Aplicaciones (AWS EC2 / GCP) | HTTPS port 443, TLS 1.2+ | RNF-02 (respuesta ≤ 1s ejercicios), RNF-03 (seguridad JWT), RNF-04 (escalabilidad 5 000 usuarios) | Auth Service, Lesson Service, Exercise Engine, Progress Service, Gamification Service, Notification Service, Backup Service |
| Servidor de Base de Datos (VPC privada) | TCP port 3306 (solo desde App Server) | RNF-04 (carga concurrente), RNF-06 (integridad referencial) | MySQL 8.0 + ORM Sequelize, todas las tablas del modelo relacional |
| Almacenamiento en Nube (AWS S3 / Firebase Storage) | HTTPS | RNF-01 (backups diarios), RNF-04 (contenido multimedia escalable) | Backups diarios, imágenes de medallas, animaciones/vídeos de lecciones |
| Servicios Externos (FCM, APNs, SMTP) | HTTPS / SDK REST | RNF-01 (notificaciones), RNF-05 (experiencia de usuario) | Push notifications (FCM / APNs), correos de recuperación (SMTP) |
| Navegador Web (Panel Admin) | HTTPS | RNF-03 (acceso seguro admin), RNF-05 (usabilidad panel) | Panel Admin (React.js) — últimas 2 versiones de Chrome, Firefox, Safari, Edge |
