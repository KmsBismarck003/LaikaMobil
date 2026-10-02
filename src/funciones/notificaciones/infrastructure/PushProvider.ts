import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
  
  if (Notifications) {
    // Configuración de cómo se muestran las notificaciones cuando la app está en foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch (e) {
  console.warn('Expo Go SDK 53+: expo-notifications not fully available', e);
}

export const PushProvider = {
  async requestPermissions(): Promise<boolean> {
    if (!Notifications) return false;
    if (!Device.isDevice) {
      console.log('PushProvider: Must use physical device for Push Notifications');
      return false;
    }

    // Expo Go a partir del SDK 53 ya no soporta tokens remotos directamente. 
    // Evitamos el crash silencioso en desarrollo.
    if (Constants.appOwnership === 'expo') {
      console.log('PushProvider: Expo Go detectado. Las notificaciones remotas requieren un Development Build (EAS).');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('PushProvider: Failed to get push token for push notification!');
        return false;
      }

      return true;
    } catch (e) {
      console.warn('PushProvider: Fallo al solicitar permisos:', e);
      return false;
    }
  },

  async getPushToken(projectId?: string): Promise<string | null> {
    if (!Notifications) return null;
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId, // Opcional, dependiendo de la config de app.json
      });

      return tokenData.data;
    } catch (e) {
      console.error('PushProvider: Error getting push token:', e);
      return null;
    }
  },

  addNotificationReceivedListener(listener: (notification: any) => void) {
    if (!Notifications) return null;
    return Notifications.addNotificationReceivedListener(listener);
  },

  addNotificationResponseReceivedListener(listener: (response: any) => void) {
    if (!Notifications) return null;
    return Notifications.addNotificationResponseReceivedListener(listener);
  }
};
