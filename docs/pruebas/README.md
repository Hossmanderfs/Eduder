# Pruebas de EduDer (Ficha de Plan y Registro de Ejecución de Pruebas)

Material para ejecutar las pruebas y obtener las capturas de evidencia.

| Archivo | Uso |
|---|---|
| `EduDer-QA.postman_collection.json` | Colección de Postman (importar con *Import*). Cubre los casos CP-02 a CP-06 y las verificaciones API-01 a API-07. Cada petición trae sus pruebas (`Tests`) y el Collection Runner muestra el código, el tiempo en ms y PASS/FAIL. |
| `rnf06_integridad.sql` | Consultas de huérfanos y borrados rechazados para el RNF-06. |

## Preparación

1. MySQL 8 con la base `eduder` creada con `docs/diseno/fase2-datos/E11-script-DDL.sql`.
2. `cd src/backend && cp .env.example .env` (completar credenciales y `JWT_SECRET`), `npm install`, `npm run seed`, `npm start`.
3. Importar la colección en Postman. En las variables de la colección:
   - `id_ejercicio` y `respuesta_correcta`: `SELECT id_ejercicio, respuesta_correcta FROM ejercicios LIMIT 1;`
   - `id_leccion`: `SELECT id_leccion, xp_base FROM lecciones WHERE xp_base > 0 LIMIT 1;`
4. Registrar la cuenta `bloqueo.qa@miremington.edu.co` (contraseña `Clave1234`) con *POST /auth/register* antes de CP-03.

## Orden sugerido

1. `0. Preparación` (crea la cuenta de prueba y guarda el token).
2. `1. Casos funcionales`, en orden. En CP-03 envíe cinco veces la petición de intento fallido y luego la del sexto intento.
3. `2. Verificación de API`.
4. Para el RNF-02 use *Run collection* sobre la petición *CP-04 / API-05* con **30 iteraciones**; Postman muestra promedio y tiempos.
5. `rnf06_integridad.sql` en MySQL Workbench.

Las pruebas automáticas del backend (`npm test`, 51 pruebas con Jest) se ejecutan sin base de datos.

## Prueba de carga (RNF-04)

`cd src/backend && npm run carga` simula 400 usuarios concurrentes y comprueba p95 ≤ 1000 ms sin errores 5xx. Resultados de referencia en `resultados-carga.md`.
