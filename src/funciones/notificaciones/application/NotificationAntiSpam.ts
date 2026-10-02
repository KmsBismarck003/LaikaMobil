import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationConfig } from '../domain/NotificationConfig';

interface NotificationRecord {
  id: string; // Puede ser un tipo + eventId (ej. 'UPDATE_123')
  timestamp: number;
}

export const NotificationAntiSpam = {
  /**
   * Determina si una notificación debe ser suprimida porque es idéntica a una reciente.
   * Útil cuando el backend envía ráfagas de pushes sobre el mismo evento.
   */
  async shouldSuppress(notificationId: string): Promise<boolean> {
    try {
      const historyStr = await AsyncStorage.getItem(NotificationConfig.STORAGE_KEYS.HISTORY);
      let history: NotificationRecord[] = historyStr ? JSON.parse(historyStr) : [];
      
      const now = Date.now();
      
      // Limpiar historial antiguo
      history = history.filter(
        (record) => now - record.timestamp < NotificationConfig.DEDUPLICATION_COOLDOWN_MS
      );

      // Verificar si ya existe este ID en el historial reciente
      const exists = history.some((record) => record.id === notificationId);

      if (!exists) {
        // Registrar la nueva notificación
        history.push({ id: notificationId, timestamp: now });
        await AsyncStorage.setItem(NotificationConfig.STORAGE_KEYS.HISTORY, JSON.stringify(history));
        return false; // NO suprimir
      }

      return true; // SÍ suprimir (es spam/ráfaga)
    } catch (e) {
      console.error('NotificationAntiSpam: Error in shouldSuppress', e);
      return false; // En caso de fallo, permitir para no perder info importante
    }
  },

  /**
   * Limpia el historial, idealmente a llamar durante logout.
   */
  async clearHistory() {
    try {
      await AsyncStorage.removeItem(NotificationConfig.STORAGE_KEYS.HISTORY);
    } catch (e) {
      // Ignore
    }
  }
};
