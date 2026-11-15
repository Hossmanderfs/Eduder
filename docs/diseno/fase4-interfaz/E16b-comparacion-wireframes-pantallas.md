# E16b — Comparación wireframes vs. pantallas implementadas

**Fecha:** 15/11/2026 · **Referencia (fuente de verdad del diseño):** prototipo `eduder-frontend.zip` (WF-01 a WF-16 + 4 pantallas del mapa de navegación sin WF propio).
**Implementación comparada:** `src/mobile/src/screens` (20 pantallas, Expo/React Native) y `src/admin` (panel web servido en `/panel/`).
**Método:** se revisó, por pantalla, estructura (zonas, campos, botones), textos de interfaz, validaciones y comportamiento, leyendo el HTML del prototipo y el código de cada pantalla móvil.

## 1. Cobertura (20 de 20 pantallas del prototipo con equivalente)

| Wireframe / pantalla del prototipo | Pantalla móvil | Resultado |
|---|---|---|
| WF-00 Splash / Bienvenida | `SplashScreen` | Conforme |
| WF-04 Registro | `RegisterScreen` | Conforme (nombre, apellido, correo, contraseña, confirmación, mostrar/ocultar, reglas en vivo) |
| WF-05 Login | `LoginScreen` | Conforme; diferencia D3 |
| WF-06 Recuperar contraseña | `RecoverScreen` + `ResetPasswordScreen` | **Diferencia D1** |
| WF-07 Tutorial | `TutorialScreen` | Conforme (omitir, siguiente, empezar) |
| WF-01 Menú principal | `MenuScreen` | Conforme (avatar, XP, racha, botón "Continuar lección diaria", tarjetas de nivel, tab bar) |
| WF-08 Selección de nivel | `MapaNivelesScreen` | Conforme |
| WF-09 Selección de lección | `ListaLeccionesScreen` | Conforme |
| Lección · Teoría | `TeoriaScreen` | Conforme; ver D6 |
| WF-02 Ejercicio | `EjercicioScreen` | Conforme (2 pistas, salir con confirmación, barra de progreso) |
| WF-10 Feedback | `EjercicioScreen` (panel de feedback) | Conforme (se integra en la misma pantalla, como describe E16) |
| Mini-juego | `MiniJuegoScreen` | Conforme; atajos de teclado solo en web (D5) |
| WF-11 Resumen | `ResumenScreen` | Conforme (puntaje, XP, medallas nuevas, nivel desbloqueado) |
| WF-03 Perfil | `PerfilScreen` | Conforme (tema claro/oscuro, cerrar sesión con confirmación) |
| Historial de lecciones | `HistorialScreen` | Conforme |
| WF-12 Ranking semanal | `RankingScreen` | Conforme; diferencia D4 |
| Perfil de otro usuario | `PerfilPublicoScreen` | Conforme (solo lectura) |
| WF-13 Medallas | `MedallasScreen` | Conforme |
| WF-16 Notificaciones | `NotificacionesScreen` | Conforme; diferencia D7 |
| WF-14 Usuarios / WF-15 Métricas (admin) | `AdminPanelScreen` → panel `/panel/` | **Diferencia D2** |

Navegación: la tab bar del prototipo (Inicio · Niveles · Ranking · Perfil) coincide con `AppNavigator.js`.

## 2. Diferencias y decisión

| Id | Wireframe / prototipo | Implementación | Tipo | Decisión |
|---|---|---|---|---|
| D1 | WF-06: se envía un **enlace** de recuperación | Se envía un **código** y existe una pantalla adicional `ResetPasswordScreen` (código + nueva contraseña). Mismas reglas: vence en 30 min y un solo uso | Adaptación a móvil (sin enlaces profundos / deep links) | Aceptada. Pendiente actualizar el texto de WF-06 en el documento ("código" en lugar de "enlace") |
| D2 | WF-14 y WF-15: dos pantallas de administración separadas | La app abre el panel web `/panel/` en un WebView (`AdminPanelScreen`) con gestión de usuarios, métricas con CSV y además CRUD de niveles, lecciones, ejercicios y medallas (RF-25…RF-28) | Ampliación de alcance | Aceptada: el panel cubre WF-14/WF-15 y los supera; el administrador usa el panel desde el navegador o la app |
| D3 | WF-05 muestra "Cuentas de prueba" (modo demostración) | No existe: la app siempre usa la API | Solo prototipo | Correcta: las cuentas demo no deben estar en el producto |
| D4 | WF-12: selector de nivel por chips | Igual, y además muestra cuenta regresiva hasta el reinicio semanal | Mejora menor | Aceptada |
| D5 | Prototipo web: atajos de teclado (V/F, flechas) | No aplican en móvil | Específico de plataforma | Aceptada |
| D6 | Prototipo: botón "Volver a las lecciones" en teoría | Se usa la navegación nativa (atrás) y el botón "Ver lecciones" en estado bloqueado | Convención de plataforma | Aceptada |
| D7 | WF-16: marcar notificaciones como leídas en bloque | `PATCH /notifications/:id/read` por elemento y botón "Marcar todo como leído" | Equivalente | Conforme |
| D8 | El prototipo usa correos `@uniremington.edu.co` también para estudiantes (zip entregado) | Estudiantes `@miremington.edu.co`, docentes y administración `@uniremington.edu.co` (RN-01, `config/dominios.js`) | **Corrección** del prototipo | La copia del repositorio (`prototipo-web/`) ya está corregida; el zip entregado conserva el dominio anterior |
| D9 | Contenido semilla del prototipo: 5 niveles, 15 lecciones, 45 ejercicios, 12 medallas | Catálogo semilla del backend con 5 niveles y 3 lecciones por nivel; ampliable desde el panel | Alcance (ver README) | Conforme con el alcance acordado |

## 3. Conclusión
Las 20 pantallas del prototipo tienen equivalente implementado; la estructura, los textos, los estados vacíos, las validaciones y las reglas de negocio coinciden. Las 9 diferencias son adaptaciones de plataforma, ampliaciones o la corrección del dominio (D8); ninguna elimina funcionalidad de un wireframe. Queda como acción de documentación D1 (texto de WF-06).

**Limitaciones:** la comparación es por lectura de código y del prototipo; no se ejecutó la app móvil en un emulador (requiere Expo y dispositivo). Se recomienda anexar capturas lado a lado (wireframe vs. pantalla real) tomadas por el grupo.
