import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentToken } from '../store/AuthStore';
import { PILGRIM_API_URL } from '../api/config';

const ticketApi = axios.create({
  baseURL: PILGRIM_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
  },
});

ticketApi.interceptors.request.use(async (config) => {
  let token = getCurrentToken();
  if (!token) {
    try {
      token = await AsyncStorage.getItem('@laika_auth_token');
    } catch {}
  }
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
  ticketCode?: string;
  price?: number;
  isCourtesy?: boolean;
  recipientType?: string;
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
  claimToken?: string;
  recipientEmail?: string;
  expiresAt?: string;
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
          eventName: item.event?.title || item.event?.name || item.event_name || item.eventName || 'Evento Desconocido',
          date: item.event?.date || item.date || item.purchase_date || '',
          status: item.status || 'history', 
          seatInfo: item.seat_label || item.seat_id || item.zone_name || item.section_name || 'General',
          qrCode: item.qr_code || item.qr_data || item.ticket_code || item.id?.toString(),
          ticketCode: item.ticket_code || item.ticketCode || item.code || item.qr_code,
          price: item.price || 0,
          isCourtesy: Boolean(item.is_courtesy || item.isCourtesy),
          recipientType: item.recipient_type || item.recipientType,
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

      const data = response.data || {};
      const cleanEmail = data.recipient_email || data.transfer?.recipientEmail || recipientEmail.trim().toLowerCase();
      const isRegistered = Boolean(data.is_registered_user ?? data.registered_user ?? data.transfer?.recipientUserId);
      const claimToken = data.claim_token || data.transfer?.claimToken || '';
      const claimUrl = data.claim_url || (claimToken ? `https://laikaclub.com/register?claim_token=${claimToken}` : '');

      const transferObj: TicketTransfer = data.transfer || {
        id: data.transfer_id || data.id || 0,
        ticketIdOriginal: Number(ticketId),
        senderUserId: data.sender_user_id || 0,
        senderEmail: data.sender_email || '',
        recipientEmail: cleanEmail,
        status: data.status || (isRegistered ? 'PENDING' : 'PENDING_REGISTRATION'),
        expiresAt: data.expires_at || '',
        createdAt: data.created_at || new Date().toISOString(),
      };

      return {
        success: data.success !== false,
        message: data.message || (isRegistered
          ? 'Solicitud de transferencia enviada al destinatario.'
          : 'Invitación de transferencia generada exitosamente.'),
        transfer: transferObj,
        registeredUser: isRegistered,
        claimUrl,
        claimToken,
        recipientEmail: cleanEmail,
        expiresAt: data.expires_at || transferObj.expiresAt,
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

  /**
   * Valida un código de canje de cortesía antes de reclamarlo.
   */
  validateCourtesyToken: async (claimToken: string): Promise<any> => {
    try {
      const response = await ticketApi.get(`/tickets/courtesy/validate-token/${claimToken.trim()}`);
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Código de cortesía inválido o expirado';
      throw new Error(msg);
    }
  },

  /**
   * Canjea un código de cortesía vinculándolo a la cuenta del usuario logueado.
   */
  claimCourtesyTicket: async (claimToken: string): Promise<any> => {
    try {
      const response = await ticketApi.post('/tickets/courtesy/claim', {
        claim_token: claimToken.trim(),
      });
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error al canjear boleto de cortesía';
      throw new Error(msg);
    }
  },
};

