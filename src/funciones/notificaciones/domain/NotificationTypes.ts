export enum NotificationPriority {
  CRITICAL = 'critical',
  IMPORTANT = 'important',
  NORMAL = 'normal',
  OPTIONAL = 'optional',
}

export enum NotificationCategory {
  TRANSACTIONAL = 'transactional', // Compras, pagos, cancelaciones
  REMINDER = 'reminder', // Recordatorios locales de boletos/eventos
  DISCOVERY = 'discovery', // Promociones, nuevos eventos
  SYSTEM = 'system', // Cambios de seguridad, alertas de sistema
}

export interface NotificationPayload {
  type: string;
  eventId?: string;
  ticketId?: string;
  url?: string;
  [key: string]: any; // Payload flexible adicional
}

export interface NotificationPreferences {
  transactional: boolean; // Usualmente siempre true, difícil de apagar
  reminders: boolean;
  discovery: boolean;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  transactional: true,
  reminders: true,
  discovery: false, // Por defecto promocional apagado
};
