# Bitácora de Avance — EduDer

**Proyecto:** EduDer — App Móvil Educativa de Lógica Matemática  
**Curso:** Ingeniería de Software  
**Institución:** Corporación Universitaria Remington

---

## Entrada # primera semana

**¿Qué hice?**  
Inicialicé el repositorio completo del proyecto. Creé la estructura de carpetas para el backend (Node.js/Express en `src/backend/`) y la app móvil (React Native en `src/mobile/`) basándome directamente en el Diagrama de Componentes (E5). Configuré el `README.md` con la descripción del proyecto, el alcance del MVP, los pasos de instalación y la estructura del repositorio. Agregué el `.gitignore` para excluir `node_modules` y variables de entorno.
- Repositorio creado con toda la estructura definida (docs + src + README + BITACORA + .gitignore)

**¿Qué problema encontré?**  
Al crear el repositorio decidí optar por separar la documentación al main y el resto al backend.
Al definir la estructura de carpetas del backend surgió una duda: si separar los controladores de los servicios o manejar toda la lógica directamente en las rutas.

**¿Cómo lo resolví?**  
Revisé el E5 (Diagrama de Componentes) y el E6 (Despliegue), que muestran una arquitectura de servicios desacoplados (RNF-07). Decidí mantener la separación `routes → services`, donde las rutas solo delegan al servicio. Esto también facilita las pruebas unitarias requeridas por RNF-07.

**¿Usé IA?** Sí — Usé IA para generar la estructura inicial de carpetas. Ajusté los nombres de los directorios para que coincidieran exactamente con los artefactos del diseño (E5) y agregué el `.env.example` con las variables reales del proyecto.

---

## Entrada #segunda semana

**¿Qué hice?**  
Creé los 15 modelos Sequelize en `src/backend/src/models/` mapeando cada entidad del Modelo Relacional (E9) y el DDL (E11): `Rol`, `Usuario`, `PerfilEstudiante`, `TokenRecuperacion`, `Nivel`, `TipoLeccion`, `Leccion`, `ContenidoLeccion`, `Ejercicio`, `Pista`, `ProgresoLeccion`, `MedallaCatalogo`, `MedallaUsuario`, `Notificacion`, `RankingSemanal`. Definí todas las relaciones en `models/index.js` (1:1, 1:N, N:M). Creé las pantallas stub de React Native y las rutas base del backend para todos los módulos.

**¿Qué problema encontré?**  
El tipo de columna `id_rol` en la tabla `usuarios` debía ser `CHAR(10)` para coincidir exactamente con la PK de la tabla `rol`. Sequelize infería el tipo como `STRING` genérico y generaba errores de FK al sincronizar.

**¿Cómo lo resolví?**  
Revisé el DDL (E11) que especifica explícitamente `CHAR(10)` para `id_rol`. Corregí el modelo `Usuario.js` para usar `DataTypes.CHAR(10)` en ese campo. Documenté la corrección en el modelo con un comentario referenciando el DDL.

**¿Usé IA?** Sí — Usé IA para acelerar la escritura repetitiva de los 15 modelos. Revisé cada uno contra el DDL (E11) y el Diccionario de Datos (E7) para verificar tipos, restricciones y defaults. Corregí manualmente los tipos `ENUM` y las restricciones `CHECK` que la IA no modeló correctamente.

---

## Entrada tercera semana

**¿Qué hice?**  
Implementé todos los servicios del backend con lógica de negocio real: `auth.service.js` (registro con validación de correo institucional, login con bloqueo tras 5 intentos, recuperación de contraseña), `progress.service.js` (actualización de progreso, cálculo de XP y streak, evaluación automática de medallas), `exercise.service.js` (evaluación de respuestas, entrega de pistas bajo demanda), `gamification.service.js` (ranking semanal, catálogo de medallas), `level.service.js` y `lesson.service.js` con CRUD completo, `admin.service.js` (gestión de usuarios y KPIs), `profile.service.js`. Agregué comentarios de trazabilidad en cada método vinculando el código con los artefactos de diseño (CU, RF, E12). Creé el `DECISIONES.md` con 3 decisiones técnicas reales documentadas.

**¿Qué problema encontré?**  
Los servicios no tenían los comentarios de trazabilidad que vinculan el código con los casos de uso, requisitos funcionales y el Diagrama de Clases (E12). Sin esa trazabilidad el código está incompleto según la rúbrica de evaluación.

**¿Cómo lo resolví?**  
Usé la Matriz M9 (Clases → Métodos → CU → RF) como referencia para agregar el encabezado de trazabilidad a cada método en el formato `// CU-XX | RF-XX | E12 - método()`. Revisé que cada comentario correspondiera exactamente a las entradas de M9 para mantener la coherencia entre diseño y código.

**¿Usé IA?** Sí — Usé IA para generar los comentarios de trazabilidad basados en la Matriz M9. Verifiqué manualmente que cada comentario referenciara los CU y RF correctos según los artefactos de diseño del proyecto, y corregí los casos donde la IA sugirió referencias incorrectas.
