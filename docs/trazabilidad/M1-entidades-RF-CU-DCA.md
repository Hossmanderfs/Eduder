# M1 — Entidades Externas → RF → CU → DCA

| Entidad Externa | RF Relacionados | Caso de Uso | Elemento en DCA |
|----------------|----------------|-------------|----------------|
| Estudiante | RF-01 a RF-19 | CU-01, CU-02, CU-03, CU-04, CU-05 | Actor principal — Auth, Lesson, Exercise, Progress, Profile, Ranking Services |
| Administrador | RF-20, RF-21, RF-22 | CU-06 | Actor secundario — Admin Panel y Analytics Service |
| Firebase / AWS S3 | RF-23 | — | Sistema externo — almacenamiento backups |
| FCM / APNs | RF-13, RF-16 | — | Sistema externo push — invocado por Notification Service |
| SMTP | RF-19 | CU-05 | Sistema externo correo — invocado por Auth Service |
| Base de Datos MySQL | Todos los RF | Todos los CU | Sistema interno — persistencia de todas las entidades |
| App Stores (Google Play / Apple) | RF-24 | — | Plataforma de distribución |
