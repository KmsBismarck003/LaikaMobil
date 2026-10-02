# PORTADA

**Universidad:** Universidad Tecnológica del Valle de Toluca
**Carrera:** Ingeniería en Desarrollo y Gestión de Software
**Proyecto:** LaikaMobil
**Nombre de la práctica:** Implementación de mecanismos básicos de seguridad en una aplicación móvil
**Integrantes:** [Espacio para nombre de integrantes]
**Asignatura:** [Espacio para asignatura]
**Docente:** [Espacio para nombre de docente]
**Fecha:** 30 de Septiembre de 2026

## 1. Introducción
La seguridad en aplicaciones móviles es un aspecto crítico, especialmente cuando estas aplicaciones intercambian información sensible con servicios externos o API REST. En esta práctica, nos enfocaremos en **LaikaMobil**, una aplicación desarrollada en React Native y Expo. LaikaMobil se comunica con la API centralizada Pilgrim, la cual actúa como enlace hacia los microservicios desarrollados en Java que gestionan la lógica de negocio y autenticación. Este intercambio expone vectores de ataque comunes en aplicaciones móviles. Implementar mecanismos de codificación segura protege la integridad de los datos, previene ataques de inyección y garantiza que información crítica (como tokens de acceso) no sea comprometida.

## 2. Objetivo
Implementar mecanismos básicos de seguridad en la aplicación móvil LaikaMobil para proteger el intercambio de información y el almacenamiento de credenciales, aplicando principios de codificación segura para mitigar vulnerabilidades relacionadas con validaciones de entrada y almacenamiento inseguro.

## 3. Descripción de la funcionalidad seleccionada
La funcionalidad intervenida es el **Inicio de Sesión (LoginScreen)**. Esta pantalla permite a los usuarios ingresar sus credenciales (correo electrónico y contraseña) para autenticarse en la plataforma.
- **Funcionamiento actual:** Los datos se recaban a través de campos de texto y se envían mediante el servicio `AuthService.ts` hacia la API de Pilgrim. Esta API actúa procesando la solicitud y comunicándose con los microservicios Java en el backend. Una vez que el microservicio valida las credenciales y la API Pilgrim retorna la respuesta con el token de acceso y la información del usuario, estos datos se almacenaban localmente en el dispositivo para mantener la sesión activa.

## 4. Identificación del flujo de información
**Diagrama del Flujo:**
`Aplicación Móvil (LaikaMobil)` ➔ `API Pilgrim (AuthService)` ➔ `Microservicios Java / Base de Datos`

**Identificación:**
- **Información enviada:** Correo electrónico, Contraseña (texto plano a través de HTTPS).
- **Información recibida:** Datos del perfil de usuario (nombre, rol, ID) y Token de acceso (JWT o similar).
- **Información sensible:** Contraseña (en envío) y Token de acceso (en recepción y almacenamiento).
- **Posibles puntos vulnerables:** 
  1. Envío de peticiones malformadas debido a la falta de validación de entradas.
  2. Almacenamiento del token de acceso en texto plano utilizando `AsyncStorage`, el cual no está encriptado y puede ser extraído si el dispositivo es comprometido (root/jailbreak).

## 5. Mecanismos de seguridad seleccionados

### Mecanismo 1: Validación de Entradas (Client-Side Input Validation)
- **Descripción:** Implementación de validaciones con expresiones regulares y longitudes mínimas antes de procesar el envío de datos al servidor.
- **Justificación:** Previene peticiones innecesarias a la API y mitiga vulnerabilidades como inyección (CWE-20: Improper Input Validation).
- **Riesgo identificado:** El usuario podía intentar iniciar sesión enviando cadenas vacías, formatos incorrectos o payloads que podrían comprometer el backend o causar errores no controlados.
- **Funcionamiento anterior:** La aplicación deshabilitaba el botón si los campos estaban vacíos, pero no validaba el formato del correo ni la longitud de la contraseña.
- **Mejora implementada:** Se agregó una función de validación que se ejecuta al presionar el botón, mostrando un mensaje de error claro en la interfaz si los datos no cumplen los requisitos.

### Mecanismo 2: Almacenamiento Seguro de Credenciales (Secure Storage)
- **Descripción:** Sustitución de `AsyncStorage` por `expo-secure-store` para el almacenamiento del token de acceso.
- **Justificación:** Los tokens de autenticación otorgan acceso total a la cuenta del usuario y deben ser cifrados en el dispositivo. `expo-secure-store` utiliza el Keystore de Android y el Keychain de iOS para encriptar la información (CWE-922: Insecure Storage of Sensitive Information).
- **Riesgo identificado:** `AsyncStorage` guarda los datos en texto plano. Un atacante con acceso físico o malware en el dispositivo podría leer el token y secuestrar la sesión del usuario.
- **Funcionamiento anterior:** El token se guardaba mediante `AsyncStorage.setItem('token', currentToken)`.
- **Mejora implementada:** El token se guarda y recupera ahora mediante los métodos cifrados de `SecureStore`.

## 6. Implementación técnica

### Mecanismo 1: Validación de Entradas
Archivo intervenido: `src/screens/LoginScreen.tsx`

Se implementó la función `validateInputs()` que se ejecuta antes de realizar el llamado a `AuthService.login()`. Esta función evalúa la estructura del correo electrónico y la longitud de la contraseña, gestionando el estado de error de forma segura en la interfaz.

### Mecanismo 2: Almacenamiento Seguro
Archivo intervenido: `src/store/AuthStore.ts` y dependencias.

Se instaló el módulo `expo-secure-store` en el proyecto. Posteriormente, se importó el módulo en `AuthStore.ts` para gestionar exclusivamente el token, manteniendo `AsyncStorage` para los datos públicos del usuario.

## 7. Comparación antes y después

### Comparación 1: LoginScreen.tsx
**ANTES:**
```typescript
  const handleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      
      const data = await AuthService.login(email, password);
      // ...
```
**Problema:** No se validaba el formato antes de invocar la API, lo que consumía recursos y exponía posibles vectores de inyección.

**DESPUÉS:**
```typescript
  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Por favor, ingresa un correo electrónico válido.');
      return false;
    }
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      setErrorMsg('');
      
      const data = await AuthService.login(email, password);
      // ...
```
**Beneficio:** Filtra peticiones maliciosas o malformadas en el frontend, mejorando el rendimiento y la seguridad del servicio.

### Comparación 2: AuthStore.ts
**ANTES:**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const setCurrentUser = async (user: any, token?: string) => {
  // ...
  if (user && currentToken) {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem('token', currentToken);
  }
};
```
**Problema:** Se guardaba el token en texto plano dentro del dispositivo.

**DESPUÉS:**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export const setCurrentUser = async (user: any, token?: string) => {
  // ...
  if (user && currentToken) {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await SecureStore.setItemAsync('token', currentToken);
  }
};
```
**Beneficio:** El token queda protegido por cifrado nativo del hardware del dispositivo (Keystore/Keychain), reduciendo drásticamente la probabilidad de robo de sesión en caso de acceso físico al equipo.

## 8. Pruebas realizadas

| Prueba 01 | Validación de información inválida (Cliente) |
|---|---|
| **Objetivo** | Comprobar que la aplicación rechaza credenciales con formato inválido antes de enviarlas al servicio. |
| **Precondiciones** | La aplicación debe estar ejecutándose y el usuario en la pantalla de inicio de sesión. |
| **Datos de entrada** | Correo: `usuario.com`, Contraseña: `123` |
| **Procedimiento** | 1. Ingresar el correo sin arroba ni dominio.<br>2. Ingresar una contraseña corta.<br>3. Presionar "Iniciar Sesión". |
| **Resultado esperado** | El sistema debe cancelar la petición a la API y mostrar un mensaje de error indicando que el correo es inválido o la contraseña es muy corta. |
| **Resultado obtenido** | Se mostró el mensaje: "Por favor, ingresa un correo electrónico válido." sin realizar petición. |
| **Estado** | APROBADA |
| **Evidencia requerida** | [INSERTAR EVIDENCIA: Captura de pantalla mostrando el mensaje de error de correo inválido] |

| Prueba 02 | Verificación de protección de token (Análisis Estático/Funcional) |
|---|---|
| **Objetivo** | Confirmar que el token de acceso se gestiona a través de la API cifrada del sistema operativo en lugar de almacenamiento persistente no seguro. |
| **Precondiciones** | Haber iniciado sesión correctamente en la aplicación. |
| **Datos de entrada** | Credenciales correctas de un usuario registrado. |
| **Procedimiento** | 1. Iniciar sesión.<br>2. Revisar el código fuente/logs para constatar que `SecureStore` invoca la API nativa de almacenamiento.<br>3. Comprobar que al cerrar la aplicación y reabrirla, la sesión carga el token de manera segura. |
| **Resultado esperado** | El token de autenticación se escribe y lee desde `expo-secure-store` y la sesión persiste correctamente tras el reinicio de la app. |
| **Resultado obtenido** | El método `SecureStore.getItemAsync` y `setItemAsync` se ejecutan sin arrojar errores y la sesión se mantiene correctamente. |
| **Estado** | APROBADA |
| **Evidencia requerida** | [INSERTAR EVIDENCIA: Captura del código de `AuthStore.ts` implementando `SecureStore` o fragmento de log demostrando inicio de sesión exitoso] |

## 9. Evidencias

- **EVIDENCIA 01 - Validación de campos**
  [INSERTAR EVIDENCIA: Captura del dispositivo mostrando el mensaje "Por favor, ingresa un correo electrónico válido" en LoginScreen]

- **EVIDENCIA 02 - Almacenamiento del Token**
  [INSERTAR EVIDENCIA: Captura de pantalla del IDE demostrando que AuthStore.ts ha sido actualizado utilizando `expo-secure-store`]

## 10. Resultados
Se consiguió incrementar la postura de seguridad de la aplicación móvil sin alterar su funcionalidad original. La inclusión de la validación de formularios ahora actúa como la primera línea de defensa contra entradas malformadas. Adicionalmente, el almacenamiento del JWT se realiza mediante cifrado apoyado en hardware, corrigiendo una vulnerabilidad crítica documentada ampliamente (CWE-922). 

## 11. Conclusiones
La práctica demostró la facilidad con la cual vulnerabilidades comunes pueden ser integradas o remediadas en aplicaciones de React Native y Expo. 
- **Se aprendió:** Que las APIs de almacenamiento local, como AsyncStorage, no deben utilizarse para datos sensibles y cómo gestionar este almacenamiento correctamente con `SecureStore`.
- **Riesgos identificados:** Fuga de tokens e inyección/saturación del servidor por inputs no validados.
- **Contribución de los mecanismos:** Elevan drásticamente el costo de un ataque. Las credenciales comprometidas son el principal vector de vulneración de las plataformas.
- **Importancia de la seguridad en el desarrollo móvil:** En dispositivos que se pueden perder o comprometer con malware, aplicar controles a nivel de aplicación protege tanto al usuario final como a la infraestructura del sistema.

## 12. Anexos
- Paquete instalado: `expo-secure-store` (mediante `npx expo install expo-secure-store`).
- Archivos modificados: `package.json`, `src/screens/LoginScreen.tsx`, `src/store/AuthStore.ts`.
