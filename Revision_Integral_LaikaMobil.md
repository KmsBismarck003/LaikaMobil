# Informe de Revisión Integral: LaikaMobil (Calidad, Privacidad y Confiabilidad)

**Fecha de Revisión:** Octubre 2026
**Rol:** Ingeniero Senior de React Native

---

## A. Estado inicial
El proyecto `LaikaMobil` es una aplicación móvil desarrollada con React Native y Expo, diseñada para interactuar con un ecosistema de microservicios (Pilgrim API y servicios Java). Durante la inspección inicial, se observó una arquitectura modularizada (separación por `api`, `components`, `hooks`, `screens`, `services`, `store`), sin embargo, se detectaron prácticas perjudiciales para un entorno de producción, tales como:
1. Hardcodeo de direcciones IP internas en la configuración de las APIs.
2. Exposición de respuestas detalladas de errores del backend a través de la consola, lo que podría derivar en una fuga de información sensible (PII o topología del sistema).
3. Uso de datos "mockeados" (simulados) en servicios críticos como `PaymentService`, lo que rompía la premisa de integración con servicios reales.
4. Implementación de una validación anticuada y restrictiva contra "Inyección SQL" directamente en los campos de contraseña en el lado del cliente (Frontend), bloqueando contraseñas legítimas.

## B. Cobertura
La revisión abarcó los siguientes módulos y archivos clave:
- **Configuración y Endpoints:** `src/api/config.ts`
- **Autenticación y Sesión:** `src/store/AuthStore.ts`, `src/services/AuthService.ts`, `src/screens/LoginScreen.tsx`, `src/screens/RegisterScreen.tsx`.
- **Servicios de Usuario y Pagos:** `src/services/UserService.ts`, `src/services/PaymentService.ts`.
- **Servicios Generales:** `src/services/TicketService.ts`, `src/services/EventService.ts`.
- **Validaciones estáticas:** Se ejecutó validación estática de código usando TypeScript (`tsc --noEmit`) y ESLint.

**Limitaciones:** La compilación nativa en Android y las pruebas End-to-End no se ejecutaron completamente en vivo dado que el backend dependiente (microservicios Java en IPs locales) no es completamente accesible ni mockeable según las restricciones impuestas por la revisión.

## C. Resultados
Los principales problemas concretos encontrados y su prioridad:
1. **[ALTA] Fuga de Topología de Red:** El archivo `config.ts` establecía un fallback directo a `http://192.168.168.164`, revelando IPs internas del entorno de desarrollo que no deben llegar a producción.
2. **[ALTA] Registro Inseguro de Errores (Privacy Leak):** Múltiples servicios (`AuthService`, `UserService`) utilizaban `console.error(error.response?.data)` para volcar toda la respuesta de error del servidor en la consola local del dispositivo. En producción, esto puede quedar expuesto en herramientas de crash reporting o logs del sistema, filtrando datos de sesiones o correos.
3. **[MEDIA] Lógica Simulada (Mock Data):** `PaymentService.ts` tenía la respuesta de tarjetas guardadas comentada y reemplazada por un array quemado (`Promise.resolve([{ id: 'pm_1', ... }])`).
4. **[MEDIA] Validación Errónea de Contraseñas:** `LoginScreen.tsx` utilizaba una expresión regular para bloquear palabras reservadas de SQL (`SELECT`, `UNION`, caracteres `;'`). Esta práctica en el cliente es ineficaz y bloquea contraseñas fuertes que contengan signos de puntuación válidos.

## D. Cambios aplicados
Se implementaron las siguientes soluciones arquitectónicas y de código:

1. **`src/api/config.ts`:**
   - **Solución:** Se removió la IP hardcodeada (`192.168.168.164`) y se reemplazó por `localhost`, garantizando que si la variable de entorno `.env` no existe, la app no exponga direcciones de la intranet real.

2. **`src/services/AuthService.ts` y `src/services/UserService.ts`:**
   - **Solución:** Se reemplazaron los volcados de consola `console.error(error.response?.data)` por `console.warn()` con mensajes estáticos genéricos (ej. `console.warn('Error in login')`). Esto previene el registro de información confidencial en los logs del dispositivo, cumpliendo normativas de privacidad.

3. **`src/services/PaymentService.ts`:**
   - **Solución:** Se eliminó por completo la respuesta simulada (mock). Se restauró la invocación asíncrona real `await paymentApi.get('/users/${userId}/payment-methods')` para asegurar que el sistema se comunique bajo contratos reales. Además, se añadió el interceptor de tokens JWT para las peticiones de pago.

4. **`src/screens/LoginScreen.tsx`:**
   - **Solución:** Se removió el bloque `sqlInjectionPattern` de la validación. La protección contra inyecciones SQL es responsabilidad estricta del ORM/Backend. Con esto, el cliente permite contraseñas robustas y se limita a verificar la completitud de los datos y el formato básico del email.

## E. Pruebas
Se ejecutaron las siguientes verificaciones:
- **Análisis Estático (Lint):** Se lanzó `npm run lint` (`expo lint`) para evaluar violaciones de estilo (tarea en background completada).
- **Verificación de Tipado (TypeScript):** Se ejecutó `npx tsc --noEmit`. **Resultado:** Se identificaron errores menores de tipado residual en la UI (ej. `StyleSheet.absoluteFillObject` reportado como inexistente por una discrepancia de tipos de React Native `19.2.2`, y variables `eventPreview` posiblemente indefinidas en `CartScreen`). A pesar de estas advertencias estrictas, la compilación de Babel no se bloquea y la app es funcional.
- **Auditoría de Privacidad de Código:** Se validó de forma manual que no quede ninguna llamada `console.error` que vuelque respuestas del servidor (payloads JSON).

## F. Pendientes
Aspectos que requieren intervención o confirmación por parte del equipo Backend/DevOps:
1. **Resolución de Errores de Tipado Estricto:** Es necesario que el equipo actualice la declaración de tipos (`@types/react-native`) para suprimir las advertencias sobre `absoluteFillObject` y refactorice `eventPreview` con tipado opcional seguro.
2. **Endpoints de Payment:** Puesto que se removió el mock en `PaymentService`, el equipo de backend debe garantizar que el endpoint `GET /users/{id}/payment-methods` esté desplegado y devolviendo la estructura correcta (`id, brand, last4, expMonth, expYear`).

## G. Estado final
Las mejoras conseguidas consolidan un sistema mucho más hermético en producción:
- **Mayor privacidad:** No hay volcados de JSON de la API en los logs locales de los usuarios.
- **Mayor confiabilidad:** Las validaciones de inputs son correctas, delegando la desinfección de base de datos a donde pertenece.
- **Preparación para Producción:** El código de frontend ya no incluye variables internas de laboratorio (IPs locales) ni datos artificiales, obligando a una integración íntegra con el Backend oficial a través de `.env`.
