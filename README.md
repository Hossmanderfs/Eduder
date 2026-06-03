#  EduDer — Aplicación Móvil Educativa de Lógica Matemática

**Corporación Universitaria Remington**  
Facultad de Ingeniería · Ingeniería de Software · 2025

---

##  Descripción General

EduDer es una aplicación móvil educativa gamificada que fortalece las competencias en lógica matemática de estudiantes de primeros semestres de ingeniería y STEM, mediante microlearning estructurado, feedback inmediato y mecánicas de juego, contribuyendo a la reducción de la tasa de deserción académica en materias cuantitativas.

---

##  Estructura del Repositorio

```
proyecto-[nombre]-[apellido]/
├── src/                         → Código fuente del framework
├── docs/
│   ├── analisis/                → Fase de análisis
│   │   ├── 01-planteamiento-problema.md
│   │   ├── 02-espina-de-pescado.md
│   │   ├── 03-alcance.md
│   │   ├── 04-objetivo-general.md
│   │   ├── 05-objetivos-especificos.md
│   │   ├── 06-tecnicas-elicitacion.md
│   │   └── 07-casos-de-uso.md
│   ├── diseno/                  → Fase de diseño
│   │   ├── fase1-arquitectura/
│   │   ├── fase2-datos/
│   │   ├── fase3-componentes/
│   │   ├── fase4-interfaz/
│   │   └── imagenes/
│   └── trazabilidad/            → Matrices de trazabilidad
├── README.md
└── BITACORA.md
```

---
## Requisitos del readme para la última entrega
## 1. ¿Qué módulo implementas?

Módulo de **Aprendizaje Gamificado de Lógica Matemática**. Cubre el ciclo completo del estudiante: autenticación con correo institucional, navegación por niveles secuenciales, realización de lecciones con ejercicios interactivos, evaluación automática de respuestas, sistema de XP y streaks, medallas por logros y ranking semanal por nivel. Incluye también el módulo de administración (gestión de usuarios, niveles y lecciones, métricas del sistema).

---

## 2. ¿Qué tablas cubre tu módulo?

| Tabla | Tipo | Descripción |
|---|---|---|
| `USUARIO` | Maestra | Estudiantes y administradores del sistema |
| `ROL` | Maestra | Roles del sistema (estudiante, admin) |
| `PERFIL_ESTUDIANTE` | Maestra | XP, streak y nivel actual por usuario |
| `NIVEL` | Maestra | Niveles del camino de aprendizaje |
| `TIPO_LECCION` | Maestra | Tipos de lección (teoría, ejercicio, mini-juego) |
| `LECCION` | Transaccional | Lecciones por nivel con FK a NIVEL y TIPO_LECCION |
| `CONTENIDO_LECCION` | Transaccional | Bloques de contenido teórico por lección |
| `EJERCICIO` | Transaccional | Ejercicios por lección con respuesta correcta |
| `PISTA` | Transaccional | Pistas bajo demanda por ejercicio (máx. 2) |
| `PROGRESO_LECCION` | Transaccional | Estado y puntaje del estudiante por lección |
| `MEDALLA_CATALOGO` | Maestra | Catálogo de medallas con condición de obtención |
| `MEDALLA_USUARIO` | Transaccional | Medallas obtenidas por usuario |
| `RANKING_SEMANAL` | Transaccional | XP semanal por usuario y nivel |
| `NOTIFICACION` | Transaccional | Notificaciones de logro al obtener medallas |
| `TOKEN_RECUPERACION` | Transaccional | Tokens de recuperación de contraseña (30 min) |

---

## 3. ¿Qué framework elegiste y por qué?

**Backend:** Node.js con Express y Sequelize (ORM) sobre MySQL.

Se eligió porque el sistema requiere responder evaluaciones en menos de 1 segundo (RNF-02) y soportar 5.000 usuarios concurrentes (RNF-04). El modelo asíncrono no bloqueante de Node.js es idóneo para cargas de I/O concurrentes como las que genera una app educativa. Sequelize mapea directamente los 15 modelos del diagrama de clases (E12) a la base de datos normalizada. Ver decisión técnica completa en [DECISIONES.md](./DECISIONES.md#decisión-01).

**Frontend móvil:** React Native CLI.

Permite compilar una sola base de código para Android e iOS (RNF-05), con acceso a APIs nativas como AsyncStorage para persistencia de sesión y notificaciones push. La comunidad activa y la compatibilidad con el ecosistema JavaScript del backend reducen la curva de aprendizaje del equipo.

**Panel de administración:** HTML/CSS/JS vanilla (single-file).

Consumido directamente por el administrador en el navegador sin requerir proceso de build, conectado al mismo backend mediante fetch + JWT.

---

##  Alcance del MVP

- 5 niveles de lógica matemática secuenciales
- 8–12 lecciones por nivel con ejercicios interactivos
- Sistema de gamificación: XP, streaks, medallas y ranking semanal
- Autenticación restringida a `@uniremington.edu.co`
- Roles: Estudiante y Administrador
- Panel de administración web
- Notificaciones push diarias
- Compatible con Android 8.0+ y iOS 13+

---

##  Equipo

| Rol           | Nombre                           |
| ------------- | -------------------------------- |
| Desarrollador | [Hossman David Beltran Quintero] |

---

##  Recursos


- [Bitácora de avance](./BITACORA.md)

---

##  Instalación y Ejecución Local

### Prerequisitos
- Node.js 18+
- MySQL 8.0+
- React Native CLI + Android Studio o Xcode

### Backend (API REST)
```bash
cd src/backend
cp .env.example .env        # completar variables de entorno
npm install
# Crear la base de datos primero:
mysql -u root -p < ../../docs/diseno/fase2-datos/E11-script-DDL.sql
npm run dev                 # corre en http://localhost:3000
# GET http://localhost:3000/health  →  { "status": "ok" }
```

### App Móvil (React Native)

```bash
cd src/mobile
npm install
npm start           # Metro bundler — dejar corriendo

# En otra terminal:
npm run android     # emulador Android
# o
npm run ios         # simulador iOS (solo macOS)
```

> La app se conecta a `http://10.0.2.2:3000` desde el emulador Android (equivale a `localhost` del PC). Para dispositivo físico, cambiar la URL en `src/mobile/src/services/api.js`.

### Panel de Administración

Abrir directamente en el navegador:
```
src/admin/index.html
```
Requiere que el backend esté corriendo. Ingresar con una cuenta de rol `admin`.

---

### Estructura de `src/`
```
src/
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js           ← Entrada del servidor Express
│       ├── config/
│       │   └── database.js     ← Conexión Sequelize → MySQL
│       ├── models/
│       │   ├── index.js        ← Relaciones entre entidades
│       │   ├── Rol.js
│       │   ├── Usuario.js
│       │   ├── PerfilEstudiante.js
│       │   ├── TokenRecuperacion.js
│       │   ├── Nivel.js
│       │   ├── TipoLeccion.js
│       │   ├── Leccion.js
│       │   ├── ContenidoLeccion.js
│       │   ├── Ejercicio.js
│       │   ├── Pista.js
│       │   ├── ProgresoLeccion.js
│       │   ├── MedallaCatalogo.js
│       │   ├── MedallaUsuario.js
│       │   ├── Notificacion.js
│       │   └── RankingSemanal.js
│       ├── routes/             ← Endpoints REST por servicio
│       ├── services/           ← Lógica de negocio (por implementar)
│       ├── middleware/         ← JWT auth, validación (por implementar)
│       └── utils/              ← Helpers (por implementar)
└── mobile/
    ├── package.json
    ├── index.js
    └── src/
        ├── App.js              ← Navegación principal (Stack + Tabs)
        └── screens/            ← Pantallas stub listas para implementar
            ├── SplashScreen.js
            ├── LoginScreen.js
            ├── RegisterScreen.js
            ├── MenuScreen.js
            ├── LessonScreen.js
            ├── PerfilScreen.js
            └── RankingScreen.js
```

# Notas para usuario.
## Archivo bases de datos
Este archivo existe porque contiene todos los **CREATE** necesarios para implementar la base de datos del programa.