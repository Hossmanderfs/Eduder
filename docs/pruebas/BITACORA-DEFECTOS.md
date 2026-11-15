# Bitácora de defectos y re-test (Ficha de Pruebas, Bloque 4)

| ID | Detectado por | Descripción | Gravedad | Corrección (commit) | Re-test | Resultado |
|---|---|---|---|---|---|---|
| D-01 | Auditoría de código | Los `catch` de 31 rutas devolvían `err.message` en errores 500, exponiendo detalle SQL (RNF-03 / OWASP). | Alta | `3e45d67` (manejador global `responderError`) | `tests/errores.test.js` | Aprobado |
| D-02 | Auditoría diseño↔código | La clave del error era `error` en el backend y `message` en la app y el panel (mensajes vacíos al usuario). | Media | `3e45d67` | `tests/errores.test.js` + `integracion` («ruta inexistente» devuelve `message`) | Aprobado |
| D-03 | Auditoría de reglas | `PERFIL_ESTUDIANTE.nivel_actual` no avanzaba conforme a RN-06 (promedio ≥ umbral y lecciones completas). | Alta | `9b75d4b`, `bc157da` | `tests/nivel-actual.test.js` | Aprobado |
| D-04 | Prueba de integración (RF-25) | `POST /levels` respondía 500: `id_nivel` es TINYINT sin AUTO_INCREMENT en el DDL y el servicio no lo asignaba; tampoco validaba `orden`. | Alta | `9084df2` | `integracion`: «Crear nivel» 201 y «Nivel con orden repetido» 409 | Aprobado |

Re-test global tras la última corrección: 59 pruebas en verde (51 unitarias + 8 de integración), cobertura de `services/` 81,7 % de sentencias (RNF-07 ≥ 80 %). Reproducir: `npm run cobertura` en `src/backend`.
