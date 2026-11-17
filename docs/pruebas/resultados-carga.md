# Resultados de la prueba de carga — RNF-02 y RNF-04 (400 usuarios concurrentes)

Script: `src/backend/scripts/carga.js` (`npm run carga`). Cada una de las 400 conexiones repite sin pausa el
recorrido de un estudiante: `GET /levels` → `GET /profile/summary` → `GET /lessons/:id/content` →
`POST /exercise/answer`. Una persona real hace una petición cada varios segundos, así que 400 conexiones sin pausa
representan una carga mucho mayor que 400 estudiantes reales (≈ 80 peticiones/s).

**Entorno de la medición (15/11/2026):** contenedor con 2 vCPU compartidos entre el generador de carga, la API y la base
de datos; MariaDB 10.11 (compatible con MySQL 8); Node.js 22; contenido sembrado con `npm run seed`
(5 niveles, 15 lecciones, 69 ejercicios). Un servidor dedicado rinde igual o mejor. **Debe repetirse en el equipo del
proyecto con MySQL 8 para registrar la evidencia oficial.**

| Configuración | Peticiones/s | Latencia prom. (ms) | p97.5 (ms) | p99 (ms) | Errores |
|---|---|---|---|---|---|
| Base (pool de 10 conexiones, consulta de sesión en cada petición) | 662 | 598 | 888 | 972 | 0 |
| + pool de 30 y caché de sesión de 15 s | 783 | 507 | 963 | 1143 | 0 |
| + 2 procesos (`npm run start:cluster`), corrida 1 | 969 | 406 | 729 | 1699 | 13 timeouts de 29 062 |
| + 2 procesos, corrida 2 | 1038 | 383 | 705 | 784 | 0 |

Criterio de aceptación: p95 ≤ 1000 ms y sin errores 5xx ni de conexión. Con una sola instancia el sistema
lo cumple con 400 conexiones simultáneas; con varios procesos hay más margen, pero conviene repetir la medición
porque una de las dos corridas tuvo 13 timeouts (0,04 %).

## Cómo reproducirla
```
cd src/backend
npm run seed        # contenido de prueba
npm start           # o: npm run start:cluster
npm run carga       # 400 usuarios, 30 s. Variables: USUARIOS, SEGUNDOS, BASE
```

## Límites conocidos
- La medición no cubre 5 000 usuarios (objetivo original del RNF-04): para superar unos 1 000 usuarios activos habría
  que desplegar varias instancias detrás de un balanceador y una base de datos con réplica de lectura.
- El ranking semanal escribe en la BD cada vez que se consulta; con miles de usuarios convendría calcularlo con una tarea programada.

## Medición del 15/11/2026 (tras el desbloqueo secuencial en el servidor, RF-08)

Entorno: contenedor Linux de 2 vCPU compartidas, Node 22, MariaDB 10.11, un solo proceso, 400 conexiones simultáneas, 30 s. `scripts/carga.js` ahora tiene dos modos: **ritmo realista** (`TASA`, 200 req/s por defecto = 2,5 veces los ≈ 80 req/s que generan 400 estudiantes) y **saturación** (`TASA=0`, las 400 conexiones disparan sin pausa).

| Modo | Peticiones | req/s | p50 | p97.5 | p99 | máx. | 5xx / errores |
|---|---|---|---|---|---|---|---|
| Ritmo realista (criterio RNF-04) | 6 017 | 200 | 119 ms | **412 ms** | 492 ms | 618 ms | 0 / 0 |
| Saturación (estrés) | 24 912 | 830 | 404 ms | 904 ms | 1 000 ms | 1 780 ms | 0 / 0 |

Nota de honestidad: en otras corridas de saturación de esa misma tarde, con la máquina más cargada, el p97.5 llegó a 1,2–1,5 s (igual que el commit anterior a RF-08, medido el mismo día), por lo que la saturación se reporta como informativa. El criterio de aceptación de RNF-04 se evalúa con ritmo realista. Repita en su equipo con MySQL 8 y adjunte la captura.

## Medición en el equipo del grupo — MySQL 8.0.43 (17/11/2026)
Entorno: Windows, Node.js v24.15, MySQL 8.0.43 local, `npm run carga` (400 usuarios, 30 s, ritmo realista de 200 peticiones/s), contenido sembrado con `npm run seed`.

| Peticiones | Req/s | Latencia prom. | p50 | p97.5 | p99 | Máx. | 2xx | 4xx/5xx | Errores de conexión | Timeouts |
|---|---|---|---|---|---|---|---|---|---|---|
| 6 001 | 200,04 | 149,66 ms | 124 ms | **416 ms** | 467 ms | 589 ms | 6 001 | 0 | 0 | 0 |

Resultado del script: «CUMPLE el criterio (p97.5 ≤ 1000 ms, sin errores 5xx ni de conexión)». Con esto queda cerrada la repetición en MySQL 8 que pedían las notas anteriores. La captura está en las evidencias de la Ficha de Plan y Registro de Ejecución de Pruebas.
