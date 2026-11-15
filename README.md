#  EduDer — Aplicación Móvil Educativa de Lógica Matemática

**Corporación Universitaria Remington**  
Facultad de Ingeniería · Ingeniería de Software · 2025

---

##  Descripción General

EduDer es una aplicación móvil educativa gamificada que fortalece las competencias en lógica matemática de estudiantes de primeros semestres de ingeniería y STEM, mediante microlearning estructurado, feedback inmediato y mecánicas de juego, contribuyendo a la reducción de la tasa de deserción académica en materias cuantitativas.

---

##  Estructura del Repositorio

```
eduder/
├── src/                         → Código fuente (backend, panel admin, app móvil)
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
│   │   ├── fase4-interfaz/      → E15–E17 + prototipo-web/ (wireframes navegables en HTML)
│   │   └── imagenes/
│   └── trazabilidad/            → Matrices de trazabilidad
├── README.md
└── BITACORA.md
```

---

##  Alcance del MVP

**Incluido en esta entrega**
- 5 niveles de lógica matemática secuenciales (RN-06: se avanza solo con el nivel anterior aprobado, promedio ≥ 70)
- 3 lecciones por nivel, cada una con teoría breve previa y ejercicios interactivos (el catálogo es ampliable desde el panel, RF-25 a RF-28)
- Gamificación: XP, rachas, medallas y ranking semanal
- Acceso restringido a correo institucional: estudiantes `@miremington.edu.co`; docentes y administración `@uniremington.edu.co` (RN-01, configurable con `DOMINIOS_PERMITIDOS`)
- Roles: Estudiante y Administrador/Docente; panel web de administración
- Notificaciones dentro de la app (RF-16)
- Capacidad objetivo: **400 usuarios simultáneos** (RNF-04), verificada con `npm run carga` (ver `docs/pruebas/resultados-carga.md`)
- Diseñada primero para celular (la mayoría de estudiantes dispone antes de un teléfono que de un computador); Android 8.0+ y iOS 13+

**Fuera de alcance (trabajo futuro)**
- Notificaciones push por FCM/APNs y publicación en Google Play / App Store (RF-24)
- Más de 400 usuarios simultáneos (requeriría balanceador y réplicas de base de datos)
- Funcionamiento sin conexión

**Arquitectura MVC**
| Capa | Backend (`src/backend/src`) | Móvil (`src/mobile/src`) |
|---|---|---|
| Modelo | `models/` (13 entidades Sequelize) | — |
| Controlador | `controllers/` (recibe, valida y delega) + `middleware/` | `hooks/`, `navigation/` |
| Lógica de negocio | `services/` (reglas RN-xx) | `services/`, `utils/` |
| Vista | JSON de la API; panel `src/admin/` | `screens/`, `ui/` |

Trazabilidad requisito → código → pantalla: `docs/trazabilidad/M14-RF-codigo-pantalla.md`. Cambios controlados: `docs/gestion-cambio/`.

---

##  Equipo

| Rol           | Nombre                           |
| ------------- | -------------------------------- |
| Desarrollador | [Hossman David Beltran Quintero] |

---

##  Recursos


- [Bitácora de avance](./BITACORA.md)
- [Guía del código y funciones](./docs/GUIA_CODIGO.md)

---

##  Instalación y Ejecución Local

### Prerequisitos
- Node.js 18+
- MySQL 8.0+ (y `mysqldump` en el PATH si se usa el backup automático)
- Expo Go en el celular (o Android Studio / Xcode para emulador)

### Backend (API REST)
```bash
cd src/backend
cp .env.example .env        # completar variables de entorno (DB, JWT_SECRET, SMTP opcional)
npm install
# Crear la base de datos (13 tablas, 3FN):
mysql -u root -p < ../../docs/diseno/fase2-datos/E11-script-DDL.sql
npm run seed                # carga 5 niveles, 15 lecciones, 45 ejercicios y 12 medallas (solo si no hay lecciones)
npm run dev                 # corre en http://localhost:3000
# GET http://localhost:3000/health  →  { "status": "ok" }
npm test                    # pruebas jest
```
Al arrancar se programan tres tareas (zona `CRON_TZ`, por defecto America/Bogota; `DISABLE_CRON=true` las desactiva):
reinicio semanal del ranking (lunes 00:00, RF-17), recordatorio de racha (18:00, RF-16) y backup diario con `mysqldump` (02:00, RF-23; carpeta `BACKUP_DIR`, log en `backup.log`).

> Correos institucionales: estudiantes `@miremington.edu.co`, administración `@uniremington.edu.co` (variable `DOMINIOS_PERMITIDOS`).
> Contraseñas: mínimo 8 caracteres con al menos una letra y un número. La sesión (JWT) dura 24 h (`JWT_EXPIRES_IN`).

### Panel de administración
Con el backend corriendo, abre `http://localhost:3000/panel/` en el navegador. En la app móvil, un usuario con rol `admin` entra directamente a este panel (pantalla *Panel de administración*). Entra con una cuenta de rol `admin`
(el DDL crea `admin@uniremington.edu.co`; ajusta su hash de contraseña). Permite gestionar usuarios, niveles, lecciones, ejercicios y medallas, ver KPIs por rango de fechas y exportarlos a CSV.

### App Móvil (React Native + Expo)
```bash
cd src/mobile
npm install --legacy-peer-deps
npm start                   # abre Metro y muestra un código QR
```
- **Celular físico (recomendado):** instala *Expo Go* (Play Store / App Store), conecta el celular a la misma red Wi-Fi que el computador y escanea el QR. La app detecta sola la IP del computador para llegar al backend (puerto 3000); si no la detecta define `EXPO_PUBLIC_API_URL=http://IP_DEL_PC:3000`.
- **Emulador Android:** con Android Studio instalado pulsa `a` en la terminal de Metro (usa `10.0.2.2` para el backend).
- **Diseño:** la app sigue los wireframes WF-00 a WF-16 (`docs/diseno/fase4-interfaz/prototipo-web/`, ábrelo con doble clic en `index.html`): sistema visual Uniremington, tipografía Lexend, modo claro/oscuro (botón en *Perfil*) y barra inferior *Inicio · Niveles · Ranking · Perfil*.
- Si Windows pregunta por el firewall al iniciar el backend, permite el acceso en redes privadas.

### Estructura de `src/`
```
src/
├── admin/index.html            ← Panel de administración (una sola página)
├── backend/
│   ├── src/
│   │   ├── server.js           ← Entrada del servidor Express
│   │   ├── config/database.js  ← Conexión Sequelize → MySQL
│   │   ├── models/             ← 13 entidades (rol, tipo y estado son ENUM)
│   │   ├── controllers/            ← auth, levels, lessons, exercise, progress, profile, gamification, admin, notifications
│   │   ├── services/           ← Lógica de negocio por servicio
│   │   ├── middleware/         ← JWT (verifyToken valida cuenta activa) y requireAdmin
│   │   └── jobs/               ← scheduler (node-cron) y backup
│   └── tests/                  ← pruebas jest
└── mobile/src/                 ← App Expo: screens, navigation, ui (componentes), theme (tokens claro/oscuro), hooks, utils, services
```

> Documentación de diseño en `docs/`; la fuente de verdad es el documento final del proyecto (EduDer_parcial1_FINAL).
