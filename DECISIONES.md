# DECISIONES.md — EduDer

**Proyecto:** EduDer — App Móvil Educativa de Lógica Matemática  
**Curso:** Ingeniería de Software  
**Institución:** Corporación Universitaria Remington

---

## Decisión #01

**¿Qué decidí?**  
Usar Node.js con Express como framework del backend y Sequelize como ORM sobre MySQL.

**¿Por qué?**  
El sistema requiere responder evaluaciones de ejercicios en menos de 1 segundo (RNF-02) y soportar 5.000 usuarios concurrentes (RNF-04). Node.js con su modelo asíncrono no bloqueante es idóneo para cargas concurrentes como las que genera una app educativa (múltiples estudiantes completando lecciones simultáneamente). Sequelize permite mapear directamente los 15 modelos del diagrama de clases (E12) a la base de datos normalizada (E9), facilitando la trazabilidad entre el diseño y el código.

Se evaluó como alternativa Django (Python), pero su modelo síncrono requeriría configuración adicional de workers para alcanzar el objetivo de concurrencia, aumentando la complejidad operativa sin un beneficio claro para este tipo de carga.

**¿Qué artefacto de diseño respalda esta decisión?**  
- E5 — Diagrama de Componentes UML: define `BackendService (Node.js/Express)` como componente central del sistema.  
- E6 — Diagrama de Despliegue UML: muestra el nodo `API Server` con tecnología Node.js.  
- RNF-02, RNF-04: requisitos de rendimiento y escalabilidad que motivaron la elección.

---

## Decisión #02

**¿Qué decidí?**  
Implementar el bloqueo de cuenta como una regla de negocio en la capa de servicio (`auth.service.js`) y no como un trigger de base de datos.

**¿Por qué?**  
La regla establece que tras 5 intentos fallidos consecutivos la cuenta se bloquea 15 minutos (RF-05) y se restaura automáticamente al expirar el tiempo (RF-06). Implementarla en el servicio permite:
1. Retornar mensajes de error descriptivos con el tiempo restante de bloqueo.
2. Controlarla con lógica de aplicación sin depender de funcionalidades específicas del motor de BD.
3. Hacer la regla testeable de forma unitaria sin necesitar una conexión a base de datos.

La alternativa de usar un trigger MySQL habría acoplado la lógica de negocio al motor de base de datos, violando el principio de separación de capas definido en RNF-07 (arquitectura de servicios desacoplados).

**¿Qué artefacto de diseño respalda esta decisión?**  
- E12 — Diagrama de Clases: método `bloquear()` pertenece a la clase `Usuario`, no a la capa de persistencia.  
- E13 — Diagrama de Secuencia DS-01: muestra el flujo de autenticación con la verificación de intentos en el `AuthService`.  
- RF-05, RF-06: requisitos funcionales que definen la regla de bloqueo y restauración automática.

---

## Decisión #03

**¿Qué decidí?**  
Usar soft delete (marcar como `estado = 'inactivo'`) en lugar de eliminación física para Niveles y Lecciones.

**¿Por qué?**  
El sistema registra el progreso de los estudiantes (PROGRESO_LECCION) con FK a LECCIONES. Si se eliminara físicamente una lección, se violaría la integridad referencial (ON DELETE RESTRICT definido en el DDL, E11) y se perdería el historial de avance del estudiante. El soft delete permite desactivar contenido sin romper los registros históricos, cumpliendo con RNF-06 (integridad referencial) y RNF-10 (recuperabilidad).

**¿Qué artefacto de diseño respalda esta decisión?**  
- E11 — Script DDL: `ON DELETE RESTRICT` en la FK de `PROGRESO_LECCION → LECCIONES`.  
- E9 — Modelo Relacional: campo `estado` en las tablas `NIVELES` y `LECCIONES`.  
- RNF-06: integridad referencial en todas las relaciones de la base de datos.

---

## Decisión #04

**¿Qué decidí?**  
Unificar `main` y `backend` en una sola rama (`main`) y trabajar siempre desde ella.

**¿Por qué?**  
Las dos ramas tenían el mismo contenido y se habían desincronizado por merges manuales. Mantener dos ramas duplicaba el trabajo y generaba conflictos (p. ej. `package-lock.json`).

**¿Qué artefacto respalda esta decisión?**  
- Historial de git: `main` y `backend` apuntaban al mismo commit tras el merge; se conserva solo `main`.

---

## Decisión #05

**¿Qué decidí?**  
Aceptar dos dominios institucionales: `@miremington.edu.co` (estudiantes) y `@uniremington.edu.co` (administración), configurables con `DOMINIOS_PERMITIDOS`.

**¿Por qué?**  
El requisito del cliente es que los estudiantes ingresen con el correo `@miremington.edu.co`, mientras que la cuenta de administración del sistema usa el dominio `@uniremington.edu.co`.

**¿Qué artefacto respalda esta decisión?**  
- RF-01 / RN-01 (docs/analisis/01), E11 (CHECK con REGEXP), `src/backend/src/config/dominios.js`, `src/mobile/src/config.js`.

---

## Decisión #06

**¿Qué decidí?**  
Basar la app móvil en el prototipo web de wireframes (sistema visual Uniremington, Lexend, modo claro/oscuro) y guardar ese prototipo en `docs/diseno/fase4-interfaz/prototipo-web/`.

**¿Por qué?**  
El prototipo ya implementa los 16 wireframes con las reglas del documento (pistas, saltar tras 2 fallos, umbral 70 %, ranking semanal), de modo que la app y la documentación comparten una misma referencia visual.

**¿Qué artefacto respalda esta decisión?**  
- E15 (mapa de navegación), E16 (wireframes) y E17 (prototipo); RNF-05 (accesibilidad).


---

## Decisión #07

**¿Qué decidí?**  
Agregar un manejador global de errores y la función `responderError()` (`src/backend/src/middleware/errorHandler.js`), usada por las 31 rutas, que responde siempre JSON `{ "message": "mensaje" }` (un fallo inesperado devuelve 500 genérico sin detalle SQL), validar tipos y longitudes máximas en `register()` según las columnas de USUARIO, y declarar `onDelete: 'RESTRICT'` en las asociaciones Sequelize que el DDL aprobado deja con la regla por defecto. `PERFIL_ESTUDIANTE.nivel_actual` se mantiene como número de nivel sin clave foránea, igual que en el DDL (Línea Base 1), y ahora `progress.service.js` lo actualiza al completar lecciones (avanza cuando el nivel anterior está aprobado: todas sus lecciones completadas con promedio ≥ umbral_aprobacion, RN-06/RN-07; nunca retrocede).

**¿Por qué?**  
La auditoría de calidad (Bloque 3, preguntas 3 y 6) detectó que Express respondía HTML con traza técnica ante rutas inexistentes o errores no controlados, y que algunas asociaciones no declaraban su regla de borrado. No se agregó FK a `nivel_actual` porque cambiaría el DDL aprobado y exigiría un CRF.

**¿Qué artefacto respalda esta decisión?**  
- RNF-03 y RNF-06 (docs/analisis/01), E11 (DDL), Ficha de Auditoría Bloque 3, `tests/errores.test.js`.

**¿Usé IA?** Sí — Claude (Anthropic) propuso e implementó el cambio; lo verifiqué con la suite de pruebas (49 en verde).

---

## Decisión #08

**¿Qué decidí?**  
Fijar como meta de capacidad del MVP **400 usuarios concurrentes** (RNF-04) en lugar de 5 000, y reforzar el backend para cumplirla: pool de conexiones configurable (30 por defecto), caché de 15 s para el estado de sesión (se invalida al instante cuando el administrador desactiva una cuenta, RF-20) y arranque multiproceso opcional (`npm run start:cluster`).

**¿Por qué?**  
5 000 usuarios exigirían varias instancias, balanceador y réplicas de la base de datos, un costo que el proyecto no puede asumir ahora. Con 400 usuarios el backend actual cumple el umbral de 1 segundo del RNF-02. Se midió con `npm run carga`: 400 conexiones simultáneas, p95 entre 705 y 963 ms y sin errores 5xx (ver `docs/pruebas/resultados-carga.md`).

**¿Qué artefacto respalda esta decisión?**  
- RNF-02 y RNF-04, `scripts/carga.js`, `src/cluster.js`, `middleware/auth.middleware.js`, pruebas de caché de sesión en `tests/auth-notif.test.js`.

**¿Qué problema encontré?**  
El pool de 10 conexiones y la consulta a la BD en cada petición limitaban el rendimiento; el arranque con dos procesos tuvo 13 timeouts en una de dos corridas.

**¿Cómo lo resolví?**  
Subí el pool a 30, agregué la caché de sesión y dejé el modo multiproceso como opción, con el arranque de un solo proceso como predeterminado.

**¿Usé IA?** Sí — Claude (Anthropic) implementó los cambios y ejecutó las mediciones; los resultados deben repetirse en el equipo del proyecto.

## Decisión #09 — Carpeta `routes/` renombrada a `controllers/` (CRF-004)
Se renombra la capa Controlador para que la estructura de carpetas refleje exactamente MVC: `models/` (Modelo), `controllers/` (Controlador: recibe, valida y delega), `services/` (lógica de negocio, RN-xx) y, como Vista, `src/mobile/src/screens` y `src/admin`. Sin cambio de comportamiento; 51 pruebas en verde.
