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
npm start                   # Metro bundler
# En otra terminal:
npm run android             # o npm run ios
```

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