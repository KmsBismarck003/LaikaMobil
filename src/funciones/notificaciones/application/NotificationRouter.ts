import { NavigationContainerRef } from '@react-navigation/native';
import { NotificationPayload } from '../domain/NotificationTypes';

export const NotificationRouter = {
  /**
   * Traduce el payload de una notificación en una ruta de React Navigation.
   * Requiere el ref global del NavigationContainer.
   */
  navigate(navigationRef: NavigationContainerRef<any> | null, payload: NotificationPayload) {
    if (!navigationRef || !navigationRef.isReady()) {
      console.warn('NotificationRouter: Navigation is not ready yet');
      return;
    }

    try {
      switch (payload.type) {
        case 'TICKET_READY':
        case 'TICKET_UPDATE':
          // Navegar a MisBoletos (dentro de MainTabs)
          navigationRef.navigate('MainTabs', { screen: 'MisBoletos' });
          break;
        
        case 'EVENT_REMINDER':
        case 'EVENT_DETAIL':
        case 'NEW_EVENT':
          if (payload.eventId) {
            navigationRef.navigate('EventDetail', { 
              eventId: payload.eventId,
              eventTitle: payload.title || 'Detalle del Evento' 
            });
          } else {
            // Fallback a inicio
            navigationRef.navigate('MainTabs', { screen: 'Eventos' });
          }
          break;

        case 'PURCHASE_SUCCESS':
          // Redirige al perfil o boletos para ver su compra reciente
          navigationRef.navigate('MainTabs', { screen: 'MisBoletos' });
          break;

        default:
          console.log('NotificationRouter: Tipo de notificación no mapeada:', payload.type);
          break;
      }
    } catch (e) {
      console.error('NotificationRouter: Error during navigation routing', e);
    }
  }
};
