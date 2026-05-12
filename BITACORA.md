#  Bitácora de Avance — EduDer

**Proyecto:** EduDer — App Móvil Educativa de Lógica Matemática  
**Curso:** Ingeniería de Software  
**Institución:** Corporación Universitaria Remington

---

## Semana 1

**Fecha:** 8 de Mayo de 2026  
**Actividades realizadas:**
- Framework inicializado: backend Node.js/Express en `src/backend/`, app móvil React Native en `src/mobile/`
- Estructura de carpetas creada con base en el Diagrama de Componentes (E5): `src/backend/src/{models,routes,services,middleware,config,utils}` y `src/mobile/src/{screens,components,navigation,hooks,services,store}`
- Repositorio creado con toda la estructura definida (docs + src + README + BITACORA + .gitignore)
- README.md completo con descripción del proyecto, estructura, alcance MVP y pasos de instalación

**Dificultades encontradas:**  
Ninguna en esta fase. La estructura se generó directamente desde los diagramas de diseño (E5 — Componentes UML).

**Próximos pasos:**  
Implementar los servicios de autenticación (AuthService) y comenzar con la pantalla de Login en React Native.

---

## Semana 2

**Fecha:** 10 de Mayo de 2026  
**Actividades realizadas:**
- Base de datos `eduder` creada desde el DDL (E11) en MySQL 8.0 — 15 tablas normalizadas a 3FN
- 15 modelos/entidades creados con Sequelize en `src/backend/src/models/`: `Rol`, `Usuario`, `PerfilEstudiante`, `TokenRecuperacion`, `Nivel`, `TipoLeccion`, `Leccion`, `ContenidoLeccion`, `Ejercicio`, `Pista`, `ProgresoLeccion`, `MedallaCatalogo`, `MedallaUsuario`, `Notificacion`, `RankingSemanal`
- Relaciones entre entidades definidas en `src/backend/src/models/index.js`:
  - `Rol` (1) → (N) `Usuario`
  - `Usuario` (1) → (1) `PerfilEstudiante`
  - `Usuario` (1) → (N) `TokenRecuperacion`
  - `Nivel` (1) → (N) `Leccion`
  - `TipoLeccion` (1) → (N) `Leccion`
  - `Leccion` (1) → (N) `ContenidoLeccion`
  - `Leccion` (1) → (N) `Ejercicio`
  - `Ejercicio` (1) → (N) `Pista` (máx. 2)
  - `Usuario` (N) ↔ (N) `MedallaCatalogo` (tabla intermedia `MedallaUsuario`)
  - `Usuario` (1) → (N) `ProgresoLeccion`, `Notificacion`, `RankingSemanal`
  - `Nivel` (1) → (N) `RankingSemanal`
- Rutas base creadas para todos los servicios del Diagrama de Componentes (E5)
- Pantallas stub de React Native creadas: `SplashScreen`, `LoginScreen`, `RegisterScreen`, `MenuScreen`, `LessonScreen`, `PerfilScreen`, `RankingScreen`

**Dificultades encontradas:**  
El tipo de columna `id_rol` en `usuarios` debía ser `CHAR(10)` para coincidir exactamente con la PK de `rol`. Esto ya estaba corregido en el DDL v1.1 y se replicó fielmente en el modelo Sequelize.

**Próximos pasos:**  
Implementar `AuthService` (registro, login JWT, recuperación de contraseña). Conectar `LoginScreen` con la API.

---

## Semana 3

**Fecha:** _______________  
**Actividades realizadas:**
- _[Describir aquí]_

**Dificultades encontradas:**  
_[Describir aquí]_

**Próximos pasos:**  
_[Describir aquí]_
