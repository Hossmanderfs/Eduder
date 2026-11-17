# Generar el APK de EduDer (Android)

Requisitos: Node 20+, cuenta gratuita en https://expo.dev, el backend corriendo en tu computador (MySQL + `node src/server.js`).

1. Averigua la IP de tu computador en la red WiFi (`ipconfig` → "Dirección IPv4", p. ej. 192.168.1.20). El celular debe estar en la misma red y el firewall debe permitir el puerto 3000.
2. En `src/mobile/eas.json` cambia `EXPO_PUBLIC_API_URL` por `http://TU_IP:3000`. (El APK la lleva fija; si cambia la IP hay que regenerarlo.)
3. En una terminal:
   ```
   cd src/mobile
   npm install
   npm install -g eas-cli
   eas login
   eas build -p android --profile preview
   ```
   La primera vez acepta crear el proyecto y el keystore (responde Y). La compilación es en la nube (≈10–20 min).
4. Al terminar, EAS entrega un enlace/QR: descarga el `.apk`, ábrelo en el celular y permite "instalar apps de orígenes desconocidos".
5. Haz commit de los cambios que EAS agregue a `app.json` (projectId).

Notas: el tráfico HTTP está permitido (`usesCleartextTraffic`) solo para desarrollo/pruebas en red local; en producción se debe usar HTTPS (RNF-03).
