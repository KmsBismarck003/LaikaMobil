import AsyncStorage from '@react-native-async-storage/async-storage';
import { PushProvider } from '../infrastructure/PushProvider';
import { LocalScheduler } from '../infrastructure/LocalScheduler';
import { NotificationAntiSpam } from '../application/NotificationAntiSpam';
import { NotificationConfig } from '../domain/NotificationConfig';
import { DEFAULT_PREFERENCES, NotificationPreferences } from '../domain/NotificationTypes';

export const NotificationService = {
  /**
   * Registra el dispositivo para recibir notificaciones Push y guarda el token en el backend.
   * Se debe llamar al iniciar sesión.
   */
  async setupPushToken(userId: string) {
    try {
      const token = await PushProvider.getPushToken();
      if (token) {
        // Aquí iría la llamada al backend para vincular el token al usuario
        // await api.post('/users/push-token', { token, userId });
        await AsyncStorage.setItem(NotificationConfig.STORAGE_KEYS.PUSH_TOKEN, token);
        console.log('NotificationService: Token registered successfully');
      }
    } catch (e) {
      console.error('NotificationService: Error in setupPushToken', e);
    }
  },

  /**
   * Limpia el token y el historial local. Ideal para el logout.
   */
  async clearPushToken() {
    try {
      // Opcional: Llamada al backend para invalidar el token
      // const token = await AsyncStorage.getItem(NotificationConfig.STORAGE_KEYS.PUSH_TOKEN);
      // if (token) await api.post('/users/remove-token', { token });
      
      await AsyncStorage.removeItem(NotificationConfig.STORAGE_KEYS.PUSH_TOKEN);
      await NotificationAntiSpam.clearHistory();
      await LocalScheduler.cancelAllScheduledNotifications();
    } catch (e) {
      console.error('NotificationService: Error in clearPushToken', e);
    }
  },

  /**
   * Obtiene las preferencias del usuario. Si no existen, usa los defaults.
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const str = await AsyncStorage.getItem(NotificationConfig.STORAGE_KEYS.PREFERENCES);
      if (str) return JSON.parse(str);
      return DEFAULT_PREFERENCES;
    } catch (e) {
      return DEFAULT_PREFERENCES;
    }
  },

  /**
   * Programa notificaciones locales de recordatorio basadas en la fecha del evento.
   * Se programa para 24 horas antes si hay margen.
   */
  async scheduleEventReminder(eventId: string, eventName: string, eventDateStr: string) {
    const prefs = await this.getPreferences();
    if (!prefs.reminders) return; // Opt-out del usuario

    const eventDate = new Date(eventDateStr);
    
    // Si la fecha es inválida, no programamos nada
    if (isNaN(eventDate.getTime())) return;

    // Recordatorio para 24h antes
    const reminderDate24h = new Date(eventDate.getTime() - NotificationConfig.REMINDER_24H_MS);
    
    // Si ya pasó el margen de 24h, intentamos 4h antes.
    let targetDate = reminderDate24h;
    if (targetDate.getTime() <= Date.now()) {
      targetDate = new Date(eventDate.getTime() - NotificationConfig.REMINDER_4H_MS);
    }

    // Si aún es futuro, la programamos
    if (targetDate.getTime() > Date.now()) {
      await LocalScheduler.scheduleEventReminder(
        '⭐ Tu evento está cerca',
        `Recuerda llevar tu acceso para ${eventName}. Revisa tus boletos en la app.`,
        targetDate,
        { type: 'EVENT_REMINDER', eventId }
      );
    }
  }
};
