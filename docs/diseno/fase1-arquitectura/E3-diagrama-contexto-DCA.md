# E3 — Diagrama de Contexto Arquitectónico (DCA)

EduDer como caja negra e interacciones con actores y sistemas externos.

| Entidad Externa | Tipo | Interacción con EduDer |
|---|---|---|
| Estudiante | Actor principal | Aprende lógica, registra progreso, consume gamificación |
| Administrador | Actor secundario | Gestiona usuarios, visualiza métricas, monitorea sistema |
| FCM / APNs | Sistema externo | Entrega notificaciones push a dispositivos Android e iOS |
| Servicio de Email (SMTP) | Sistema externo | Envía enlaces de recuperación de contraseña |
| Base de Datos (MySQL) | Sistema interno | Persiste usuarios, lecciones, progreso, medallas, rankings |
| Servidor Firebase / AWS S3 | Sistema externo | Almacena los backups diarios generados por el Backup Service |
| App Stores (Google Play / Apple) | Plataforma de distribución | Canal de instalación de la app móvil |

> 📎 Ver diagrama visual en `imagenes/E3-DCA.png`
