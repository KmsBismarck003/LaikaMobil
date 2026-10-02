import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationConfig } from '../domain/NotificationConfig';
import { DEFAULT_PREFERENCES, NotificationPreferences } from '../domain/NotificationTypes';
import { NotificationService } from '../services/NotificationService';

export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  const loadPrefs = async () => {
    try {
      const prefs = await NotificationService.getPreferences();
      setPreferences(prefs);
    } catch (e) {
      console.error('useNotificationPreferences: Error loading', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrefs();
  }, []);

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    // Si es transaccional y se intenta apagar, podríamos mostrar un warning, pero aquí simplemente lo aplicamos.
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    try {
      await AsyncStorage.setItem(NotificationConfig.STORAGE_KEYS.PREFERENCES, JSON.stringify(newPrefs));
      
      // Si apagan reminders, purgar los que ya estaban programados localmente
      if (key === 'reminders' && value === false) {
        import('../infrastructure/LocalScheduler').then(({ LocalScheduler }) => {
          LocalScheduler.cancelAllScheduledNotifications();
        });
      }
    } catch (e) {
      console.error('useNotificationPreferences: Error saving', e);
    }
  };

  return { preferences, loading, updatePreference };
};
