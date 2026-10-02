import { Platform } from 'react-native';

let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {}

export const LocalScheduler = {
  /**
   * Programa una notificación local para una fecha específica.
   */
  async scheduleEventReminder(
    title: string,
    body: string,
    triggerDate: Date,
    data: any = {}
  ): Promise<string | null> {
    if (!Notifications) return null;

    // No programar en el pasado
    if (triggerDate.getTime() <= Date.now()) {
      return null;
    }

    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: Platform.OS === 'android' ? true : 'default',
        },
        trigger: triggerDate,
      });

      return identifier;
    } catch (e) {
      console.error('LocalScheduler: Error scheduling notification:', e);
      return null;
    }
  },

  /**
   * Cancela una notificación programada previamente mediante su identificador.
   */
  async cancelScheduledNotification(identifier: string) {
    if (!Notifications) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (e) {
      console.error(`LocalScheduler: Error canceling notification ${identifier}:`, e);
    }
  },

  /**
   * Cancela todas las notificaciones locales programadas.
   */
  async cancelAllScheduledNotifications() {
    if (!Notifications) return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      console.error('LocalScheduler: Error canceling all notifications:', e);
    }
  }
};
