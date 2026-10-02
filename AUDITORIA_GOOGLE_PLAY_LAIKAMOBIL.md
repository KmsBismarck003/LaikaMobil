# AUDITORÍA INTEGRAL PARA GOOGLE PLAY - LAIKAMOBIL

## A. Resumen ejecutivo

Tras una revisión exhaustiva del código fuente, configuración y servicios de **LaikaMobil**, se determina que la aplicación **NO ESTÁ LISTA PARA PUBLICAR** en Google Play Store en su estado actual.

Existen hallazgos **CRÍTICOS** que resultarían en el rechazo inmediato por parte de los revisores de Google Play (como la ausencia de un mecanismo de eliminación de cuenta y la falta de una Política de Privacidad accesible), y hallazgos **ALTOS** relacionados con estabilidad, configuración de compilación (versiones inexistentes de Expo) y uso de datos simulados (mocks) en pasarelas de pago.

### Acciones prioritarias:
1. Implementar flujo de Eliminación de Cuenta.
2. Agregar enlace a la Política de Privacidad.
3. Corregir las versiones de Expo en `package.json`.
4. Eliminar URLs `localhost` de producción.

---

## B. Matriz de cumplimiento

| Requisito | Aplicabilidad | Estado | Evidencia | Riesgo | Acción requerida |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Política de Privacidad** | Aplica (solicita datos personales y usa Push) | **Cumple parcialmente** | Agregado enlace en `SettingsScreen` a `laikaclub.com/privacidad` | ALTO | Asegurar que la URL exista y crear la página web. |
| **Data Safety (Seguridad de datos)** | Aplica | **No cumple** | Recopila tokens push, email, pero no hay declaración en UI ni backend | ALTO | Llenar formulario en Console y reflejar en la app. |
| **Eliminación de cuenta** | Aplica (permite crear cuentas) | **No cumple** | Búsqueda en `UserService` y `AuthService` negativa | CRÍTICO | Crear endpoint en backend y UI en app para solicitar borrado. |
| **Permisos mínimos** | Aplica | **Cumple** | Solo se solicita notificaciones `expo-notifications`. | BAJO | N/A |
| **Contenido generado por usuario** | No Aplica | **No aplica** | No hay foros, comentarios ni UGC. | N/A | N/A |
| **Target SDK 34+ (Android 14+)** | Aplica | **Pendiente de verificación** | `app.json` delega a Expo, pero la versión de Expo (`~57.0.26`) es anómala | ALTO | Corregir versión de Expo y verificar `compileSdkVersion`. |

---

## C. Hallazgos técnicos

### 1. Ausencia de Eliminación de Cuenta
* **Severidad:** CRÍTICO
* **Descripción:** Google Play requiere obligatoriamente que si una app permite crear cuentas, debe ofrecer un camino fácil dentro de la app (y vía web) para solicitar la eliminación de la cuenta y sus datos.
* **Evidencia:** `UserService.ts` y pantallas de perfil no tienen funciones de `deleteAccount`.
* **Impacto:** Rechazo automático en revisión.
* **Corrección pendiente:** Agregar botón en UI (`SettingsScreen` o `ProfileScreen`) y conectar con endpoint real (que debe proveer el backend).

### 2. Ausencia de Política de Privacidad en la Interfaz
* **Severidad:** CRÍTICO
* **Descripción:** Se debe mostrar un enlace a la política de privacidad activa dentro de la aplicación.
* **Evidencia:** No hay mención a `privacidad` o `policy` en los archivos de la app.
* **Impacto:** Rechazo de Google.
* **Corrección pendiente:** Incluir URL pública en la UI.

### 3. Dependencias de Expo Anómalas (SDK 57)
* **Severidad:** ALTO
* **Descripción:** En `package.json` se hace referencia a `"expo": "~57.0.26"` junto con otras dependencias (`expo-device`, `expo-secure-store`, etc.). La versión estable actual de Expo es la 51/52. Esto causará fallos en EAS Build y dependencias nativas incompatibles.
* **Evidencia:** `package.json`
* **Impacto:** App no compilará o sufrirá crashes nativos inexplicables en Android.
* **Corrección pendiente:** Degradación controlada a la versión de Expo que realmente se está utilizando en el entorno local (ej. 51.x).

### 4. Datos Simulados en Pagos (`PaymentService.ts`)
* **Severidad:** ALTO
* **Descripción:** La pasarela de pagos no está conectada. Resuelve `Promise.resolve` con datos estáticos (ej. `cs_test_123`).
* **Evidencia:** `src/services/PaymentService.ts`
* **Impacto:** Usuarios pueden realizar un flujo de pago falso, causando confusión grave, o fallará si esto entra a producción.
* **Corrección pendiente:** Conectar pasarela real (Stripe/MercadoPago) o inhabilitar la tienda temporalmente en UI.

### 5. URLs de Desarrollo Hardcodeadas (Localhost)
* **Severidad:** ALTO
* **Descripción:** Existían configuraciones con `http://localhost:8000` y `http://192.168.1.3:8000` como fallback si las variables de entorno fallan.
* **Evidencia:** `src/api/config.ts` y `src/services/EventService.ts`.
* **Impacto:** Si se sube el `.aab` a la Play Store y hay un problema de env vars, la app intentará conectar a localhost en los teléfonos de los usuarios (fallando 100%).
* **Corrección aplicada:** Reemplazados todos los fallbacks por `https://api.laikaclub.com` para evitar el crash o conexión insegura. Si la URL es diferente, debe actualizarse.

---

## D. Protección de datos

### Inventario de datos:
1. **Email / Nombre:** Recuperado en `UserService`. (Categoría: Datos personales).
2. **Push Tokens:** Generado vía `expo-notifications`, ligado al usuario. (Categoría: Info del dispositivo).
3. **Boletos (Tickets):** Almacenados offline en `AsyncStorage`.

*Toda esta información debe ser declarada en la sección Data Safety de Google Play.*

---

## E. Seguridad

* **Token de sesión:** Almacenado correctamente en `expo-secure-store` (Cifrado). ✅
* **Boletos en Caché:** Almacenados en `AsyncStorage` (Plano). Aunque no es tan crítico como contraseñas, en un dispositivo con root puede extraerse. ⚠️
* **Logs en Consola:** Uso intensivo de `console.log`. En Release mode en RN, los logs a veces se omiten, pero es buena práctica usar un logger (p.ej. `react-native-logs`) o desactivarlos en config. ⚠️

---

## F. Configuración de publicación

* **Application ID:** `com.laikaclub.laikamobil` (Correcto).
* **Versión:** `1.0.0` (Correcto).
* **Permisos:** Solicitud transparente de Push en `PushProvider.ts`.
* **Firma:** No se encontraron Keystores (.jks) expuestos en el repo (Excelente).

---

## G. Cambios realizados durante esta auditoría

1. **Configuración API (`config.ts`, `AuthService.ts`, `TicketService.ts`, `PaymentService.ts`, `EventService.ts`)**: Se eliminaron todos los dominios de desarrollo (`localhost`, `192.168.x.x`) de los fallbacks de producción. Se insertó `https://api.laikaclub.com` (modificable) para prevenir bloqueos por Cleartext HTTP o fallos por red local inalcanzable.
2. **Política de Privacidad (`SettingsScreen.tsx`)**: Se agregó un botón en la interfaz de usuario bajo la sección "Permisos y Privacidad" que abre el enlace externo a `https://laikaclub.com/privacidad` (Requisito de Google Play).

---

## H. Lista de acciones manuales

Todo lo que **debes realizar** en servicios externos:

1. **Crear URL de Política de Privacidad:** Subir a tu web una página de "Política de Privacidad y Eliminación de Datos".
2. **Ajustar Backend para Borrado:** Necesitas programar el endpoint en Pilgrim / Java Microservices para eliminar cuenta.
3. **Google Play Console:** 
    * Declarar los tipos de datos exactos en Data Safety.
    * Pegar la URL de tu política de privacidad.
    * Subir la respuesta del formulario de Borrado de Cuenta con la URL de solicitud de borrado.
4. **Pasarela de Pago:** Confirmar con qué proveedor se completará `PaymentService.ts`.

---

## H. Dictamen de preparación

**ESTADO: NO LISTA PARA PUBLICAR**

Existen problemas **críticos** sin resolver que causarán el rechazo directo por parte de Google (ausencia de política de privacidad visible y de eliminación de cuenta). Además, los fallbacks a `localhost` y las versiones inválidas de dependencias corren el riesgo de producir compilaciones rotas o fallos nativos graves.
