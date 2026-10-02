export const NotificationConfig = {
  // Límite de notificaciones push de descubrimiento por día
  DISCOVERY_DAILY_LIMIT: 1,

  // Tiempo de supresión para notificaciones idénticas (en milisegundos)
  // Ej: 10 minutos
  DEDUPLICATION_COOLDOWN_MS: 10 * 60 * 1000, 

  // Tiempos para recordatorios locales (en milisegundos)
  // 24 horas antes
  REMINDER_24H_MS: 24 * 60 * 60 * 1000,
  
  // 4 horas antes
  REMINDER_4H_MS: 4 * 60 * 60 * 1000,

  // Claves de AsyncStorage
  STORAGE_KEYS: {
    PREFERENCES: '@laika_notif_prefs',
    PUSH_TOKEN: '@laika_push_token',
    HISTORY: '@laika_notif_history', // Para anti-spam y rate limit
  }
};
