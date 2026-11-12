# M1 — Entidades Externas → RF → CU → DCA

| Entidad Externa | RF Relacionados | Caso de Uso | Elemento en DCA |
|---|---|---|---|
| Estudiante | RF-01, RF-02, RF-03, RF-04, RF-07–RF-19 | CU-01, CU-02, CU-03, CU-04, CU-05 | Actor principal — interactúa con Auth, Lesson, Exercise, Progress y Gamification Services |
| Administrador | RF-20, RF-21, RF-22, RF-25, RF-26, RF-27, RF-28 | CU-06, CU-07 | Actor secundario — interactúa con Admin Panel y Admin Service |
| Servidor Firebase / AWS S3 | RF-23 | — | Sistema externo de almacenamiento — recibe backups de Backup Service |
| FCM / APNs | RF-13, RF-16 | — | Sistema externo de push — invocado por Notification Service |
| Servicio de Email (SMTP) | RF-19 | CU-05 | Sistema externo de correo — invocado por Auth Service para recuperación |
| Base de Datos MySQL | Todos los RF | Todos los CU | Sistema interno — persistencia de todas las entidades del modelo |
| App Stores (Google Play / Apple) | RF-24 | — | Plataforma de distribución — canal de instalación de la app móvil |
