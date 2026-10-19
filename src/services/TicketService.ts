import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentToken } from '../store/AuthStore';
import { PILGRIM_API_URL } from '../api/config';

const ticketApi = axios.create({
  baseURL: PILGRIM_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

ticketApi.interceptors.request.use((config) => {
  const token = getCurrentToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Ticket {
  id: string;
  eventName: string;
  date: string;
  status: 'active' | 'in_progress' | 'history' | 'cancelled' | 'refunded' | 'transferred' | 'transfer_pending' | string;
  seatInfo?: string;
  qrCode?: string;
  price?: number;
}

export interface TicketTransfer {
  id: number;
  ticketIdOriginal: number;
  ticketIdNuevo?: number;
  senderUserId: number;
  senderEmail: string;
  recipientUserId?: number;
  recipientEmail: string;
  claimToken?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED' | string;
  expiresAt: string;
  completedAt?: string;
  createdAt: string;
  ticketSummary?: {
    eventName?: string;
    date?: string;
    seatInfo?: string;
    zoneName?: string;
  };
}

export interface TransferRequestResult {
  success: boolean;
  message: string;
  transfer: TicketTransfer;
  registeredUser: boolean;
  claimUrl?: string;
  expiresAt: string;
}

export const TicketService = {
  getMyTickets: async (userId: string): Promise<Ticket[]> => {
    const CACHE_KEY = `@tickets_cache_${userId}`;

    try {
      // Llamada real al backend enviando el Bearer token
      const response = await ticketApi.get(`/tickets/my-tickets`);
      
      // Mapeamos la respuesta real del backend a la interfaz
      if (response.data && Array.isArray(response.data)) {
        const parsedTickets = response.data.map((item: any) => ({
          id: item.id?.toString(),
          eventName: item.event?.title || item.event_name || 'Evento Desconocido',
          date: item.event?.date || item.date || '',
          status: item.status || 'history', 
          seatInfo: item.seat_label || item.zone_name || 'General',
          qrCode: item.qr_code || item.id?.toString(),
          price: item.price || 0
        }));

        // Guardamos en Caché Offline inmediatamente tras un fetch exitoso
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(parsedTickets));
        return parsedTickets;
      }
      return [];
    } catch (error) {
      console.warn('Error fetching real tickets, intentando cargar caché offline...', error);
      
      // Si la red falla o el backend no responde, intentamos recuperar la memoria local (Offline Mode)
      try {
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedData) {
          console.log('¡Boletos cargados desde caché offline!');
          return JSON.parse(cachedData) as Ticket[];
        }
      } catch (cacheError) {
        console.error('Error reading offline cache:', cacheError);
      }

      // Si no hay caché y falla, propagamos el error o devolvemos vacío.
      throw error;
    }
  },

  purchaseTicket: async (userId: string, purchaseData: any) => {
    try {
      // Endpoint real que guarda el boleto en la cuenta del usuario
      const response = await ticketApi.post('/tickets/purchase', {
        ...purchaseData,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      throw error;
    }
  },

  /**
   * Criterios 1, 2, 3 y 8: Solicitar transferencia de boleto a usuario registrado o invitación por correo.
   */
  requestTransfer: async (ticketId: string | number, recipientEmail: string, passwordConfirm: string): Promise<TransferRequestResult> => {
    try {
      const response = await ticketApi.post('/tickets/transfer/request', {
        ticket_id: Number(ticketId),
        recipient_email: recipientEmail.trim().toLowerCase(),
        password_confirm: passwordConfirm,
      });
      return {
        success: response.data.success,
        message: response.data.message,
        transfer: response.data.transfer,
        registeredUser: response.data.registered_user,
        claimUrl: response.data.claim_url,
        expiresAt: response.data.expires_at,
      };
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error al solicitar transferencia de boleto';
      throw new Error(msg);
    }
  },

  /**
   * Criterios 4, 5 y 6: Aceptar transferencia entrante de boleto.
   */
  acceptTransfer: async (transferId: number): Promise<any> => {
    try {
      const response = await ticketApi.post(`/tickets/transfer/${transferId}/accept`);
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error al aceptar la transferencia';
      throw new Error(msg);
    }
  },

  /**
   * Criterio 4: Rechazar transferencia entrante.
   */
  rejectTransfer: async (transferId: number): Promise<any> => {
    try {
      const response = await ticketApi.post(`/tickets/transfer/${transferId}/reject`);
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error al rechazar la transferencia';
      throw new Error(msg);
    }
  },

  /**
   * Criterio 3: Cancelar transferencia saliente pendiente.
   */
  cancelTransfer: async (transferId: number): Promise<any> => {
    try {
      const response = await ticketApi.post(`/tickets/transfer/${transferId}/cancel`);
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error al cancelar la transferencia';
      throw new Error(msg);
    }
  },

  /**
   * Consulta transferencias entrantes pendientes del usuario logueado.
   */
  getIncomingTransfers: async (): Promise<TicketTransfer[]> => {
    try {
      const response = await ticketApi.get('/tickets/transfer/incoming');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.warn('Error fetching incoming transfers:', error.message);
      return [];
    }
  },

  /**
   * Consulta transferencias salientes del usuario logueado.
   */
  getOutgoingTransfers: async (): Promise<TicketTransfer[]> => {
    try {
      const response = await ticketApi.get('/tickets/transfer/outgoing');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.warn('Error fetching outgoing transfers:', error.message);
      return [];
    }
  },
};

