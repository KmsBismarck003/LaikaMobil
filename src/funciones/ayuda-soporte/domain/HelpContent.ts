export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  title: string;
  icon: string;
  faqs: FAQ[];
}

export const helpCategories: FAQCategory[] = [
  {
    id: 'cat_primeros_pasos',
    title: 'Primeros pasos y navegación',
    icon: 'compass',
    faqs: [
      {
        id: 'faq_1_1',
        question: '¿Qué es LaikaMobil?',
        answer: 'LaikaMobil es tu aplicación central para descubrir eventos increíbles, comprar boletos de manera segura y llevar tus entradas digitales siempre contigo en tu dispositivo.'
      },
      {
        id: 'faq_1_2',
        question: '¿Cómo navegar por la aplicación?',
        answer: 'Utiliza la barra inferior para moverte entre las secciones principales: "Eventos" para explorar, "Carrito" para revisar tus compras en curso, "Mis Boletos" para ver tus entradas adquiridas y "Perfil" para gestionar tu cuenta y preferencias.'
      }
    ]
  },
  {
    id: 'cat_cuenta',
    title: 'Registro y cuenta',
    icon: 'user',
    faqs: [
      {
        id: 'faq_2_1',
        question: '¿Cómo inicio sesión?',
        answer: 'Dirígete a la pestaña "Perfil" y selecciona "Iniciar Sesión". Necesitarás tu correo electrónico y contraseña registrados.'
      },
      {
        id: 'faq_2_2',
        question: '¿Qué pasa si olvidé mi contraseña o no puedo acceder?',
        answer: 'Por razones de seguridad, la recuperación de acceso se gestiona de forma centralizada. Si no puedes acceder, utiliza la opción de contacto con soporte al final de esta pantalla para ayudarte a restablecerla.'
      }
    ]
  },
  {
    id: 'cat_perfil',
    title: 'Perfil y configuración',
    icon: 'settings',
    faqs: [
      {
        id: 'faq_3_1',
        question: '¿Cómo consultar mi información personal?',
        answer: 'Ve a "Perfil" > "Información personal". Allí podrás ver los datos asociados a tu cuenta (nombre, correo y rol).'
      },
      {
        id: 'faq_3_2',
        question: '¿Cómo configurar las opciones de accesibilidad?',
        answer: 'En "Perfil" > "Accesibilidad y funciones", puedes activar la opción de "Reducir movimiento". Esto desactivará ciertas animaciones de la aplicación, ideal si eres sensible a los cambios bruscos de pantalla.'
      }
    ]
  },
  {
    id: 'cat_eventos',
    title: 'Eventos',
    icon: 'calendar',
    faqs: [
      {
        id: 'faq_4_1',
        question: '¿Cómo consultar los detalles de un evento?',
        answer: 'Toca sobre cualquier evento en la pantalla principal. Podrás ver la fecha, horario, descripción, recinto y explorar el mapa de asientos o funciones disponibles.'
      },
      {
        id: 'faq_4_2',
        question: '¿Cómo sé si los asientos están disponibles?',
        answer: 'Al entrar al detalle de un evento que incluye un mapa de asientos, el sistema carga en tiempo real la disponibilidad. Los asientos ocupados aparecerán bloqueados para evitar compras duplicadas.'
      }
    ]
  },
  {
    id: 'cat_compras',
    title: 'Compras y pagos',
    icon: 'shopping-bag',
    faqs: [
      {
        id: 'faq_5_1',
        question: '¿Cómo comprar boletos?',
        answer: '1. Selecciona el evento.\n2. Elige tu función y selecciona tus asientos.\n3. Presiona agregar al carrito.\n4. Ve a la pestaña "Carrito" y sigue las instrucciones para realizar el pago.'
      },
      {
        id: 'faq_5_2',
        question: '¿Qué métodos de pago existen?',
        answer: 'Actualmente, puedes utilizar tus tarjetas de crédito y débito que tengas asociadas. El sistema procesa los pagos de forma segura y directa.'
      },
      {
        id: 'faq_5_3',
        question: '¿Qué pasa si el pago falla o mi compra queda pendiente?',
        answer: 'Asegúrate de tener una conexión estable. Si el dinero fue descontado pero no recibiste confirmación ni ves los boletos en tu cuenta, por favor contacta a soporte de inmediato utilizando el botón inferior. NO vuelvas a intentar la compra para evitar cargos dobles.'
      }
    ]
  },
  {
    id: 'cat_boletos',
    title: 'Boletos y entradas digitales',
    icon: 'ticket',
    faqs: [
      {
        id: 'faq_6_1',
        question: '¿Dónde están mis boletos?',
        answer: 'Todos tus boletos adquiridos se encuentran en la pestaña "Mis Boletos" (ícono de ticket en la barra inferior).'
      },
      {
        id: 'faq_6_2',
        question: '¿Qué sucede si no tengo Internet en la entrada del evento?',
        answer: '¡No hay problema! LaikaMobil cuenta con un sistema de almacenamiento fuera de línea. Si ya habías iniciado sesión y abierto la app anteriormente, tus boletos estarán guardados en tu dispositivo y el código QR se mostrará perfectamente sin conexión.'
      },
      {
        id: 'faq_6_3',
        question: '¿Cómo presento mi boleto para ingresar?',
        answer: 'Abre la pestaña "Mis Boletos", selecciona el boleto correspondiente y muestra el código QR en la pantalla de tu dispositivo al personal de acceso. Asegúrate de tener el brillo de tu pantalla alto para facilitar la lectura.'
      }
    ]
  },
  {
    id: 'cat_notificaciones',
    title: 'Notificaciones',
    icon: 'bell',
    faqs: [
      {
        id: 'faq_7_1',
        question: '¿Por qué no recibo notificaciones?',
        answer: 'Verifica en los ajustes generales de tu teléfono que LaikaMobil tenga permisos para enviar notificaciones push. Nuestra app cuenta con un filtro inteligente para no saturarte de mensajes repetidos (Anti-Spam), por lo que solo recibirás las alertas importantes.'
      }
    ]
  },
  {
    id: 'cat_logros',
    title: 'Mis Logros y Recompensas',
    icon: 'award',
    faqs: [
      {
        id: 'faq_8_1',
        question: '¿Qué son los logros y cupones?',
        answer: 'LaikaMobil recompensa tu preferencia. Al interactuar con la app y asistir a eventos, sumas puntos y subes de rango. Puedes revisar tus puntos, insignias y cupones de descuento desde "Perfil" > "Mis Logros".'
      }
    ]
  }
];
