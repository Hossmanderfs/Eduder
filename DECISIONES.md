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
