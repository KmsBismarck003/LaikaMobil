# Centro de Ayuda y Soporte - LaikaMobil

Este módulo contiene la implementación del Centro de Ayuda y Soporte de LaikaMobil, resultado de una auditoría profunda sobre el funcionamiento, posibles problemas y necesidades de los usuarios.

## Arquitectura y Estructura de Carpetas

La arquitectura sigue los principios de separación de responsabilidades y modularidad exigidos:

```
src/funciones/ayuda-soporte/
├── components/
│   ├── FAQCategory.tsx     # Renderiza cada categoría de preguntas
│   ├── FAQItem.tsx         # Item individual expandible y animado
│   └── FeedbackSection.tsx # Componente interactivo para valoración y contacto directo
├── domain/
│   └── HelpContent.ts      # Datos estructurados e interfaces de las preguntas/respuestas (FAQ)
└── index.ts                # Punto de entrada público (Barril de exportaciones)
```

La presentación recae en `src/screens/HelpSupportScreen.tsx`, manteniendo la pantalla independiente de la lógica de negocio.

## Resultado de la Auditoría

Se identificaron las siguientes categorías clave y dudas comunes basadas en las características de la aplicación:

1. **Primeros pasos y navegación**: Qué es LaikaMobil y cómo navegar usando las pestañas (Bottom Tabs).
2. **Registro y cuenta**: Cómo iniciar sesión y cómo manejar olvido de contraseña.
3. **Perfil y configuración**: Cómo ver detalles personales y ajustar la accesibilidad (reduce motion).
4. **Eventos**: Cómo consultar detalles y verificar lugares ocupados en mapas de asientos (se conecta con `EventService`).
5. **Compras y pagos**: Cómo seleccionar entradas, fallos de conexión en pagos y métodos permitidos (`PaymentService`).
6. **Boletos y entradas digitales**: Dónde consultarlos y manejo Offline Caché (AsyncStorage en `TicketService`).
7. **Notificaciones**: Por qué pueden no llegar y cómo el filtro `NotificationAntiSpam` previene saturación.
8. **Logros y Gamificación**: Cómo se gestionan los puntos, cupones y los rangos (`AchievementsService`).

## Sistema de Búsqueda
Se implementó un buscador en tiempo real en `HelpSupportScreen.tsx`. El algoritmo filtra en memoria el arreglo de `helpCategories` comparando el `searchQuery` con la pregunta y la respuesta. Si una categoría se queda sin FAQs pero su título coincide, se mantiene la categoría, en caso contrario se omiten. Si no hay resultados en absoluto, se despliega un "Empty State".

## Funcionamiento del Contacto Directo
El `FeedbackSection.tsx` implementa el flujo de valoración:
1. Pregunta al usuario: "¿Encontraste lo que buscabas?"
2. Si la respuesta es negativa (o mediante el botón "Envíanos tu mensaje"), se invoca la función `handleContactSupport`.
3. Esto utiliza la API `Linking` de React Native para intentar abrir un `mailto:redjar481@gmail.com` pre-configurado con asunto ("Soporte LaikaMobil") y cuerpo base.
4. Si falla (por falta de app de correo, error del simulador, etc.), se informa al usuario la dirección de correo a través de un `Alert` nativo para que pueda copiarlo.

## Consideraciones de Seguridad
- El módulo no contiene ninguna credencial, token ni URL sensible en su código fuente ni en el generador del correo.
- No almacena temporalmente los datos ingresados más allá de los estados locales de React (`searchQuery` y `feedbackGiven`).

## Pruebas Manuales
Para verificar el funcionamiento:
1. Inicia sesión o navega a la pestaña de **Perfil**.
2. Desplázate hacia abajo y selecciona la opción **"Ayuda y soporte"**.
3. **Validación visual**: Deberías ver el buscador y la lista de categorías generada.
4. **Interacción**: Presiona una pregunta para verificar que se expande de forma animada.
5. **Buscador**: Escribe "internet" en la barra de búsqueda y verifica que filtra la pregunta de "Mis Boletos" en modo offline.
6. **Contacto**: Presiona "Envíanos tu mensaje" y verifica que el simulador / dispositivo intenta abrir la app de correos y pre-rellena los datos hacia `redjar481@gmail.com`.

---
*Implementado siguiendo los principios de Clean Architecture, sin Mocks ni datos hardcodeados en las vistas.*
