# E8 — Modelo Entidad-Relación Conceptual (MER)

Notación Crow's Foot. Las líneas dobles indican participación obligatoria (mín. 1); el círculo indica opcional (mín. 0). La pata de cuervo indica máximo N; las dobles barras máximo 1.

## Relaciones y Cardinalidades

| Entidad Origen | Cardinalidad Origen | Cardinalidad Destino | Entidad Destino | Descripción de la Relación |
|---|---|---|---|---|
| USUARIOS | 1 | 1 | PERFIL_ESTUDIANTE | Cada usuario estudiante tiene exactamente un perfil de progreso |
| USUARIOS | 1 | N | PROGRESO_LECCION | Un usuario puede tener progreso en muchas lecciones |
| USUARIOS | 1 | N | MEDALLAS_USUARIO | Un usuario puede obtener muchas medallas |
| USUARIOS | 1 | N | NOTIFICACIONES | Un usuario puede recibir muchas notificaciones |
| USUARIOS | 1 | N | RANKING_SEMANAL | Un usuario tiene un registro por cada semana y nivel participado |
| USUARIOS | 1 | N | TOKENS_RECUPERACION | Un usuario puede solicitar varios tokens de recuperación |
| NIVELES | 1 | N | LECCIONES | Un nivel contiene múltiples lecciones ordenadas secuencialmente |
| NIVELES | 1 | N | RANKING_SEMANAL | Un nivel puede tener muchos registros de ranking semanal |
| LECCIONES | 1 | N | CONTENIDO_LECCION | Una lección tiene múltiples bloques de contenido multimedia |
| LECCIONES | 1 | N | EJERCICIOS | Una lección contiene múltiples ejercicios interactivos |
| LECCIONES | 1 | N | PROGRESO_LECCION | Una lección puede tener registros de progreso de muchos usuarios |
| EJERCICIOS | 1 | N | PISTAS | Un ejercicio tiene hasta 2 pistas de apoyo |
| MEDALLAS_CATALOGO | 1 | N | MEDALLAS_USUARIO | Una medalla del catálogo puede ser obtenida por muchos usuarios |

> `rol` y `tipo` de lección son atributos ENUM (no entidades): el modelo tiene 13 tablas.

> 📎 Ver diagrama visual MER en `../imagenes/Modelo_Entidad_Relacion_MER.svg`
