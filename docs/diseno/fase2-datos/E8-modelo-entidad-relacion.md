# E8 — Modelo Entidad-Relación Conceptual (MER)

Notación Crow's Foot. Las líneas dobles indican participación obligatoria (mín. 1); el círculo indica opcional (mín. 0). La pata de cuervo indica máximo N; las dobles barras máximo 1.

## Relaciones y Cardinalidades

| Entidad Origen | Card. Origen | Card. Destino | Entidad Destino | Regla de Negocio / RF |
|---------------|-------------|--------------|----------------|----------------------|
| USUARIOS | 1:1 (obligatorio) | 1:1 (obligatorio) | PERFIL_ESTUDIANTE | Cada usuario estudiante tiene exactamente un perfil. RF-02 |
| USUARIOS | 1:1 (obligatorio) | 0:N (opcional-muchos) | PROGRESO_LECCION | Un usuario puede tener 0 o muchos registros de progreso. RF-09 |
| USUARIOS | 1:1 (obligatorio) | 0:N (opcional-muchos) | MEDALLAS_USUARIO | Un usuario puede tener 0 o muchas medallas. RF-14 |
| USUARIOS | 1:1 (obligatorio) | 0:N (opcional-muchos) | NOTIFICACIONES | Un usuario puede tener 0 o muchas notificaciones. RF-16 |
| USUARIOS | 1:1 (obligatorio) | 0:N (opcional-muchos) | RANKING_SEMANAL | Un usuario tiene 0 o muchos registros de ranking. RF-17 |
| USUARIOS | 1:1 (obligatorio) | 0:N (opcional-muchos) | TOKENS_RECUPERACION | Un usuario puede tener 0 o varios tokens; solo uno vigente. RF-19 |
| NIVELES | 1:1 (obligatorio) | 1:N (obligatorio-muchos) | LECCIONES | Un nivel tiene al menos 1 lección. RF-07, RF-08 |
| NIVELES | 1:1 (obligatorio) | 0:N (opcional-muchos) | RANKING_SEMANAL | Un nivel puede tener 0 o muchos rankings. RF-17 |
| LECCIONES | 1:1 (obligatorio) | 0:N (opcional-muchos) | CONTENIDO_LECCION | Una lección puede tener 0 o N bloques multimedia. RF-08 |
| LECCIONES | 1:1 (obligatorio) | 1:N (obligatorio-muchos) | EJERCICIOS | Una lección contiene al menos 1 ejercicio. RF-10, RF-11 |
| LECCIONES | 1:1 (obligatorio) | 0:N (opcional-muchos) | PROGRESO_LECCION | Una lección puede tener 0 o N registros de progreso. RF-09 |
| EJERCICIOS | 1:1 (obligatorio) | 0:N (opcional-muchos) | PISTAS | Un ejercicio puede tener 0, 1 o 2 pistas. RF-11 |
| MEDALLAS_CATALOGO | 1:1 (obligatorio) | 0:N (opcional-muchos) | MEDALLAS_USUARIO | Una medalla puede no estar obtenida (0) o estar en muchos perfiles. RF-14 |
| LECCIONES | 1:1 (Obligatorio) | 1:N (Obligatorio-muchos) | TIPO_LECCION | Una lección es solo un tipo; un tipo puede pertenecer a muchas lecciones |
| USUARIOS | 1:1 (Obligatorio) | 1:N (Obligatorio-Muchos) | ROL | Cada usuario tiene un rol; un rol puede pertenecer a muchos usuarios |

> 📎 Ver diagrama visual MER en `imagenes/E8-MER.png`
