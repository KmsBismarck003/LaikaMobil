import { useEffect, useRef, useState } from 'react';
import { PushProvider } from '../infrastructure/PushProvider';
import { NotificationRouter } from '../application/NotificationRouter';
import { NotificationAntiSpam } from '../application/NotificationAntiSpam';
import { NavigationContainerRef } from '@react-navigation/native';
import { NotificationPayload } from '../domain/NotificationTypes';

let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {}

export const useNotifications = (navigationRef: NavigationContainerRef<any> | null) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Solo solicita token para fines de log/debug visual o si necesitamos enviarlo manualmente
    PushProvider.getPushToken().then(token => setExpoPushToken(token));

    // Listener para cuando llega la notificación con app en primer plano
    notificationListener.current = PushProvider.addNotificationReceivedListener(async (notification) => {
      // Intentamos filtrar por anti-spam si es ráfaga
      const id = notification.request.identifier;
      const isSpam = await NotificationAntiSpam.shouldSuppress(id);
      
      if (isSpam) {
        console.log('useNotifications: Supressed notification (Anti-Spam)');
        // Nota: En Expo a veces es tarde para suprimir visualmente si el OS ya la manejó, 
        // pero esto sirve para pushes locales o data-only messages.
      }
    });

    // Listener para cuando el usuario TOCA la notificación
    responseListener.current = PushProvider.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as NotificationPayload;
      
      // Enviar al router para hacer deep-link
      NotificationRouter.navigate(navigationRef, data);
    });

    return () => {
      if (Notifications) {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      }
    };
  }, [navigationRef]);

  return {
    expoPushToken
  };
};
