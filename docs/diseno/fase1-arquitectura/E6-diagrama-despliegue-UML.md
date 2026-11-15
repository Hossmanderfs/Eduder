# E6 — Diagrama de Despliegue UML

> Nota (CRF-004): FCM/APNs aparecen como servicios externos de diseño; su integración queda fuera del alcance de esta entrega (RF-24). Hoy las notificaciones se guardan en la tabla NOTIFICACIONES y se muestran en la app.

| Nodo | Artefactos Desplegados | Tecnología / Protocolo |
|---|---|---|
| Dispositivo Móvil (Android/iOS) | App EduDer (React Native) | Android 8+ / iOS 13+; HTTPS |
| Navegador Web | Panel Admin (React.js) | Chrome/Firefox/Safari/Edge últimas 2 versiones; HTTPS |
| Servidor de Aplicaciones (Cloud) | API REST (Node.js/Express), Auth Service, Exercise Engine, servicios | AWS EC2 / GCP; TLS 1.2+; Port 443 |
| Servidor de Base de Datos | MySQL + ORM Sequelize | VPC privada; Puerto 3306 solo desde App Server |
| Almacenamiento en Nube | Backups diarios, imágenes de medallas, videos/animaciones | AWS S3 / Firebase Storage; HTTPS |
| Servicios Externos | FCM (Android push), APNs (iOS push), Servicio SMTP (email) | Integración via SDK / API; HTTPS |

> 📎 Ver diagrama visual UML en `imagenes/E6-despliegue.png`
