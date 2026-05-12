# M4 — Nodos de Despliegue → Protocolos → Requisitos No Funcionales

| Nodo (E6) | Protocolo / Tecnología | RNF Cubierto |
|-----------|----------------------|--------------|
| Dispositivo Móvil (Android 8+ / iOS 13+) | HTTPS (TLS 1.2+), FCM SDK, APNs SDK | RNF-01 Compatibilidad multiplataforma; RNF-05 Seguridad en tránsito |
| Navegador Web (Panel Admin) | HTTPS, JWT en header Authorization | RNF-05 Autenticación segura; RNF-06 Acceso restringido por rol |
| Servidor de Aplicaciones (Cloud EC2/GCP) | REST sobre HTTPS puerto 443, Node.js/Express | RNF-02 Respuesta ejercicio < 1 s; RNF-03 Disponibilidad 99.5% |
| Servidor de Base de Datos MySQL | Puerto 3306 solo desde VPC interna, Sequelize ORM | RNF-04 Integridad referencial 3FN; RNF-05 Aislamiento de red |
| Almacenamiento en Nube (AWS S3 / Firebase) | HTTPS, cron 02:00 h | RNF-07 Backup diario; RNF-08 Recuperación ante fallos |
| FCM / APNs | SDK REST sobre HTTPS | RNF-09 Notificaciones push en < 5 s |
| Servicio SMTP | SMTP/TLS | RNF-10 Entrega de correo de recuperación en < 60 s |
