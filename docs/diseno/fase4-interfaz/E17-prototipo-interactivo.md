# E17 — Prototipo Interactivo (Alta Fidelidad)

El prototipo interactivo existe en dos formas ejecutables, ambas basadas en los wireframes de E16:

| Prototipo | Ubicación | Cómo verlo |
|-----------|-----------|------------|
| **Prototipo web** (HTML/CSS/JS, sin build) | `docs/diseno/fase4-interfaz/prototipo-web/` | Abrir `index.html` con doble clic. Modo demostración con datos locales; cambia a la API real con `localStorage.setItem('eduder_mode','api')`. |
| **App móvil** (React Native + Expo) | `src/mobile/` | `npm install --legacy-peer-deps && npm start` y escanear el QR con Expo Go. |

> ⚠️ **Enlace Figma pendiente.** Si se entrega también un archivo Figma, compartirlo con permiso
> "Anyone with the link → can view" y registrar aquí la URL.
>
> 🔗 **Figma — EduDer Prototipo:** *(pendiente de publicar)*

---

## Flujos Prototipados

| # | Flujo | Pantallas Involucradas | CU |
|---|-------|----------------------|-----|
| F1 | Registro → Tutorial → Menú Principal | Splash, Registro, Tutorial, Menú Principal | CU-01 |
| F2 | Login (éxito) → Menú Principal | Login, Menú Principal | CU-02 |
| F3 | Login (fallo 5 veces) → bloqueo 15 min | Login | CU-02 |
| F4 | Menú → Nivel → Lección → Teoría → Ejercicio → Feedback → Resumen | Niveles, Lecciones, Teoría, Ejercicio, Feedback, Mini-juego, Resumen | CU-03 |
| F5 | Resumen → Nivel desbloqueado | Resumen, Niveles | CU-03 |
| F6 | Menú → Perfil → Historial / Medallas | Menú, Perfil, Historial, Medallas | CU-04 |
| F7 | Menú → Ranking semanal → Perfil público | Ranking, Perfil público | CU-04 |
| F8 | Login → Recuperar contraseña → Nueva contraseña | Login, Recuperar, Restablecer | CU-05 |
| F9 | Admin → Usuarios / Niveles / Lecciones / Ejercicios / Medallas / Métricas | Panel de administración | CU-06, CU-07 |

## Pantallas (mapa de navegación, E15)

Splash, Registro, Login, Recuperar contraseña, Tutorial de bienvenida, Menú principal, Niveles,
Lecciones, Lección-Teoría, Lección-Ejercicio (+ Feedback inmediato), Mini-juego, Resumen de lección,
Perfil, Historial, Medallas, Ranking, Perfil público, Notificaciones y Panel de administración.

## Guía de estilos aplicada

| Token | Valor (modo claro) | Modo oscuro |
|-------|--------------------|-------------|
| Azul institucional (carné, botones) | `#003DA5` | `#2F6CD8` (rellenos) |
| Rojo institucional (acentos, insignias) | `#C8102E` | `#E1384F` |
| Dorado XP / rachas | `#E3A82B` | `#F0B640` |
| Éxito / error | `#1F8A52` / `#D0342C` | `#34A86E` / `#E5534B` |
| Superficies | `#FFFFFF`, `#F3F5F9`, `#E6EBF2` | `#111A2B`, `#172238`, `#202D47` |
| Tipografía | Lexend 400/500/600/700 (legibilidad, RNF-05) | — |
| Radios | 8 px chips y campos pequeños · 12 px botones y campos · 18 px tarjetas | — |
| Accesibilidad | Objetivos táctiles ≥ 44 px, contraste WCAG AA, etiquetas para lector de pantalla | — |

Los tokens viven en `prototipo-web/css/eduder.css` y en `src/mobile/src/theme/index.js` (mismos valores).

## Diferencias deliberadas entre el prototipo web y la app

- El ejercicio *ordenar piezas* en la app funciona por toque (la pieza va al siguiente espacio libre; tocarla de nuevo la devuelve); el prototipo web además permite arrastrar.
- Las lecciones de tipo mini-juego se juegan como ronda contrarreloj sobre sus preguntas (el prototipo trae las afirmaciones V/F aparte; `npm run seed` las carga como ejercicios).
- El panel de administración de la app es el panel web (`/panel`) mostrado dentro de un WebView.
