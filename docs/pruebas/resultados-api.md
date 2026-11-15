# Resultados de la prueba de integración de la API

Ejecución: 2026-11-15T18:03:44.611Z · Node v22.23.4 · BD: mysql

| Caso | RF/RNF | Esperado | Obtenido | Tiempo (ms) | ¿Cumple? |
|---|---|---|---|---|---|
| PS-01 Registro válido (Sunny Day) | RF-01, RF-02 | 201 | 201 | 125 | Sí |
| PR-01 Dominio no institucional (Rainy Day) | RF-01 / RN-01 | 400 | 400 | 5 | Sí |
| Registro duplicado | RF-01 | 409 | 409 | 5 | Sí |
| Contraseña débil | RF-02 | 400 | 400 | 3 | Sí |
| Login correcto | RF-03 | 200 | 200 | 102 | Sí |
| Login fallido 1 | RF-05 / RN-03 | 401 | 401 | 76 | Sí |
| Login fallido 2 | RF-05 / RN-03 | 401 | 401 | 71 | Sí |
| Login fallido 3 | RF-05 / RN-03 | 401 | 401 | 85 | Sí |
| Login fallido 4 | RF-05 / RN-03 | 401 | 401 | 84 | Sí |
| Login fallido 5 | RF-05 / RN-03 | 401 | 401 | 70 | Sí |
| PN-03 Cuenta bloqueada aunque la clave sea correcta | RF-05 / RN-03 | 429 | 429 | 3 | Sí |
| Logout | RF-03 | 200 | 200 | 4 | Sí |
| Sin token | RF-03 | 401 | 401 | 5 | Sí |
| Listar niveles | RF-07 | 200 | 200 | 7 | Sí |
| Nivel por id | RF-07 | 200 | 200 | 3 | Sí |
| Nivel inexistente | RF-07 | 404 | 404 | 3 | Sí |
| Lección por id | RF-08 | 200 | 200 | 3 | Sí |
| PN-05 Lección 2 bloqueada hasta completar la 1 (RN-09) | RF-08 / RN-09 | 403 | 403 | 9 | Sí |
| Completar lección 2 sin la 1 (RN-10) | RF-08 / RN-10 | 403 | 403 | 8 | Sí |
| PN-06 Nivel 3 bloqueado para quien está en el nivel 1 (RN-07) | RF-08 / RN-07 | 403 | 403 | 6 | Sí |
| Contenido de la lección 1 | RF-10 | 200 | 200 | 10 | Sí |
| PS-02 Respuesta correcta con feedback (RNF-02 ≤ 1 s) | RF-10 / RNF-02 | 200 | 200 | 3 | Sí |
| Respuesta incorrecta con feedback | RF-10 | 200 | 200 | 3 | Sí |
| Respuesta sin datos | RF-10 | 400 | 400 | 2 | Sí |
| Pista 1 | RF-11 / RN-12 | 200 | 200 | 3 | Sí |
| Pista 2 solicitada explícitamente | RF-11 / RN-12 | 200 | 200 | 4 | Sí |
| Pista 3 inexistente (máx. 2, RN-12) | RF-11 / RN-12 | 400 | 400 | 2 | Sí |
| Completar lección (XP, racha, medallas) | RF-09, RF-12, RF-13, RF-14 | 200 | 200 | 24 | Sí |
| Lección 2 se abre al completar la 1 (RN-10) | RF-08 / RN-10 | 200 | 200 | 11 | Sí |
| PN-01 Puntaje fuera de 0-100 (RN-13) | RF-12 / RN-13 | 400 | 400 | 2 | Sí |
| Estado inválido | RF-09 | 400 | 400 | 2 | Sí |
| Resumen de perfil (RNF-02 ≤ 3 s) | RF-18 | 200 | 200 | 8 | Sí |
| Progreso por nivel | RF-18 | 200 | 200 | 5 | Sí |
| Medallas del estudiante | RF-14 | 200 | 200 | 4 | Sí |
| Ranking semanal | RF-17 | 200 | 200 | 12 | Sí |
| Listar notificaciones | RF-16 | 200 | 200 | 4 | Sí |
| Marcar todas leídas | RF-16 | 200 | 200 | 3 | Sí |
| Notificación ajena/inexistente | RF-16 | 404 | 404 | 5 | Sí |
| Solicitar recuperación | RF-19 | 200 | 200 | 70 | Sí |
| Recuperación de correo inexistente (misma respuesta) | RF-19 | 200 | 200 | 2 | Sí |
| Token inválido | RF-19 / RN-18 | 400 | 400 | 73 | Sí |
| PN-02 Estudiante en ruta admin | RF-20 / roles | 403 | 403 | 2 | Sí |
| Login administrador | RF-03 | 200 | 200 | 84 | Sí |
| Buscar usuario por correo | RF-21 | 200 | 200 | 101 | Sí |
| Desactivar cuenta | RF-20 | 200 | 200 | 9 | Sí |
| PS-03 Sesión invalidada de inmediato tras desactivar | RF-20 | 401 | 401 | 3 | Sí |
| Reactivar cuenta | RF-20 | 200 | 200 | 5 | Sí |
| Usuario inexistente | RF-20 | 404 | 404 | 3 | Sí |
| KPIs por rango de fechas | RF-22 | 200 | 200 | 15 | Sí |
| Exportar KPIs en CSV | RF-22 | 200 | 200 | 9 | Sí |
| Crear nivel | RF-25 | 201 | 201 | 5 | Sí |
| Nivel con orden repetido | RF-25 / RN-07 | 409 | 409 | 3 | Sí |
| Editar nivel | RF-25 | 200 | 200 | 4 | Sí |
| Crear lección | RF-26 | 201 | 201 | 4 | Sí |
| Editar lección | RF-26 | 200 | 200 | 4 | Sí |
| Lecciones por nivel (admin) | RF-26 | 200 | 200 | 2 | Sí |
| Todas las lecciones (admin) | RF-26 | 200 | 200 | 4 | Sí |
| Crear ejercicio | RF-27 | 201 | 201 | 8 | Sí |
| Ejercicios por lección | RF-27 | 200 | 200 | 4 | Sí |
| Editar ejercicio | RF-27 | 200 | 200 | 11 | Sí |
| Ejercicio incompleto | RF-27 | 400 | 400 | 2 | Sí |
| PN-04 Nivel con lecciones no se elimina (RN-20) | RF-25 / RN-20 | 409 | 409 | 3 | Sí |
| Eliminar ejercicio | RF-27 | 200 | 200 | 6 | Sí |
| Eliminar lección sin progreso | RF-26 | 200 | 200 | 4 | Sí |
| Eliminar nivel vacío | RF-25 | 200 | 200 | 4 | Sí |
| PR-RN21 Lección con progreso se archiva (RN-21) | RF-26 / RN-21 | 200 | 200 | 5 | Sí |
| Crear medalla | RF-28 | 201 | 201 | 3 | Sí |
| Editar medalla | RF-28 | 200 | 200 | 5 | Sí |
| Catálogo de medallas (admin) | RF-28 | 200 | 200 | 4 | Sí |
| Medalla con condición inválida | RF-28 | 400 | 400 | 2 | Sí |
| Eliminar medalla | RF-28 | 200 | 200 | 5 | Sí |
| Ruta inexistente |  | 404 | 404 | 1 | Sí |

Tiempo máximo observado: 125 ms (umbral RNF-02: 1000 ms por evaluación de ejercicio).
