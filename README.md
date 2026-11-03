# LaikaMobil - Aplicacion Movil (React Native + Expo)

Aplicacion movil oficial de LAIKA Club para compra de boletos, catalogo de eventos, boveda digital con codigos QR para acceso a recintos, y gestion de perfil, optimizada para Android e iOS.

---

## 1. Descripcion General

`LaikaMobil` traslada la experiencia de usuario de LAIKA Club a dispositivos moviles nativos. Proporciona autenticacion biometrica (FaceID y huella dactilar), persistencia segura de credenciales, navegacion por categorias de espectaculos, mapas visuales de recintos para eleccion de asientos, pasarela de compras integrada y una boveda de boletos digitales con codigos QR dinamicos legibles por las terminales de los operadores en torniquetes.

La aplicacion se conecta de forma transparente con el backend mediante el API Gateway Pilgrim, ya sea en red local durante desarrollo o a traves de tuneles seguros para pruebas en dispositivos fisicos externos.

---

## 2. Stack Tecnologico

- **Framework Movil**: React Native 0.88.0 con Expo SDK 58.0.0
- **Nucleo de Componentes**: React 19.3.0
- **Tipado Estatico**: TypeScript 6.0.3
- **Navegacion Nativa**: React Navigation 7.x (`@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`)
- **Animaciones de Alto Rendimiento**: React Native Reanimated 4.7.1
- **Almacenamiento Local Seguro**: Expo SecureStore (tokens JWT) y AsyncStorage (preferencias y cache)
- **Autenticacion Biometrica**: Expo Local Authentication (FaceID / Fingerprint)
- **Notificaciones Push**: Expo Notifications
- **Graficos Vectoriales y QR**: React Native SVG 15.16.0 y `react-native-qrcode-svg` 6.3.26
- **Efectos Visuales**: Expo Blur (desenfoques glassmorphic) y Expo Linear Gradient
- **Cliente de Red**: Axios 1.20.0

---

## 3. Arquitectura y Enlace con el API Gateway

La aplicacion canaliza todas sus consultas hacia el API Gateway Pilgrim mediante la variable de entorno `EXPO_PUBLIC_PILGRIM_API_URL`:

```
[ Dispositivo Fisico (Android / iOS) / Emulador ]
                      |
                      | HTTPS / HTTP
                      v
      [ Pilgrim API Gateway (Puerto 8000) ]
        (Directo en LAN o via LocalTunnel)
                      |
     +----------------+----------------+
     |                                 |
     v                                 v
[ Microservicios Java ]      [ Microservicios Python / Node ]
(Auth, Events, Tickets, Merch)    (BigData, Wearables)
```

### Modos de Conexion
1. **Emulador Android / Simulador iOS**:
   - Android Emulator: Conectar a `http://10.0.2.2:8000/api`
   - iOS Simulator: Conectar a `http://localhost:8000/api`
2. **Dispositivo Fisico en Red WiFi Local**:
   - Conectar a la IP local de tu estacion de trabajo: `http://192.168.X.X:8000/api`
3. **Dispositivo Fisico en Red Movil (4G / 5G / Remota)**:
   - Iniciar el tunel en la maquina anfitriona: `npm run tunnel` o ejecutando `iniciar_tunel_pilgrim.bat`.
   - Asignar la URL del tunel: `https://laika-pilgrim-dev.loca.lt/api`

---

## 4. Funcionalidades Principales

1. **Autenticacion y Seguridad Biometrica**:
   - Inicio de sesion y registro de nuevas cuentas con validacion de fortaleza de contrasena.
   - Activacion opcional de FaceID / Huella Dactilar para desbloqueo rapido de la boveda.
   - Renovacion transparente de sesion con tokens persistidos en almacenamiento cifrado.

2. **Exploracion de Cartelera y Eventos**:
   - Busqueda por artista, genero, fecha y recinto.
   - Detalle de evento con galeria visual, funciones disponibles y mapa de ubicacion.

3. **Seleccion de Asientos y Zonas**:
   - Visualizacion de zonas (General, Preferente, VIP, Palcos) y disponibilidad en tiempo real.
   - Carrito de compras integrado con temporizador de retencion de asientos.

4. **Boveda de Boletos Digitales (Wallet)**:
   - Despliegue de boletos adquiridos con renderizado SVG de codigos QR de alta definicion.
   - Consulta de detalles de acceso: fecha, recinto, puerta sugerida, zona, fila y numero de asiento.
   - Modo de alto brillo automatico para optimizar la lectura en escaneres opticos de torniquetes.

5. **Soporte Multitema (Dark / Light)**:
   - Adaptacion automatica a las preferencias del sistema del dispositivo o seleccion manual por el usuario.

---

## 5. Estructura del Proyecto

```
LaikaMobil/
├── src/
│   ├── api/                 # Configuracion de cliente Axios e interceptores
│   ├── components/          # Componentes reutilizables
│   │   ├── ui/              # Botones, inputs, tarjetas, badges
│   │   └── tickets/         # Renderizado de boletos digitales y codigos QR
│   ├── hooks/               # Custom hooks de navegacion, autenticacion y temas
│   ├── navigation/          # Configuracion de BottomTabs y Stacks
│   ├── screens/             # Pantallas de la aplicacion
│   │   ├── auth/            # Login, Registro y configuracion biometrica
│   │   ├── events/          # Catalogo de eventos y detalle
│   │   ├── checkout/        # Proceso de pago y confirmacion
│   │   ├── wallet/          # Boveda de boletos y visualizador de QR
│   │   └── profile/         # Perfil de usuario y ajustes
│   ├── services/            # Modulos de consumo API (Auth, Events, Tickets, Merch)
│   ├── store/               # Gestion de estado global y sesion
│   └── styles/              # Design System, tokens semanticos y paletas de color
├── App.tsx                  # Componente raiz y contenedor de navegacion
├── app.json                 # Metadatos del proyecto Expo
├── package.json
└── tsconfig.json
```

---

## 6. Instalacion y Puesta en Marcha

### Prerrequisitos
- Node.js version 18 o superior.
- Expo Go instalado en tu dispositivo movil (disponible en Google Play Store y Apple App Store) o emulador configurado (Android Studio / Xcode).
- API Gateway Pilgrim ejecutandose en el puerto 8000.

### Paso 1: Instalacion de Paquetes
```bash
cd LaikaMobil
npm install
```

### Paso 2: Configuracion de Variables de Entorno
Crea un archivo `.env` en la raiz de `LaikaMobil`:
```env
EXPO_PUBLIC_PILGRIM_API_URL=http://TU_IP_LOCAL:8000/api
```
*(Reemplaza `TU_IP_LOCAL` por la IP interna de tu computadora en la red WiFi, o la URL de LocalTunnel).*

### Paso 3: Inicializacion del Servidor de Desarrollo
```bash
npm run start
```
Se presentara un codigo QR en la terminal. Abre la aplicacion **Expo Go** en tu dispositivo movil y escanea el codigo QR para iniciar la ejecucion.

### Comandos Adicionales
- Iniciar en Emulador Android:
  ```bash
  npm run android
  ```
- Iniciar en Simulador iOS (requiere macOS):
  ```bash
  npm run ios
  ```
- Abrir tunel remoto para pruebas fuera de la red local:
  ```bash
  npm run tunnel
  ```
- Ejecutar analisis estatico con ESLint:
  ```bash
  npm run lint
  ```
