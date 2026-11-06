import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentToken } from '../store/AuthStore';
import { pilgrimApi } from '../api/config';

export interface Ticket {
  id: string;
  eventName: string;
  date: string;
  time?: string;
  venueName?: string;
  status: 'active' | 'in_progress' | 'history' | 'cancelled' | 'refunded' | 'transferred' | 'transfer_pending' | string;
  seatInfo?: string;
  qrCode?: string;
  ticketCode?: string;
  price?: number;
  isCourtesy?: boolean;
  recipientType?: string;
  courtesyMotive?: string;
  category?: string;
}

export const normalizeTicket = (item: any): Ticket => {
  if (!item) return {} as Ticket;
  const id = String(item.id ?? item.ticketId ?? item.ticket_id ?? '');
  const eventName =
    item.eventName ||
    item.event_name ||
    item.event?.title ||
    item.event?.name ||
    item.title ||
    'Evento LAIKA Club';
  const date =
    item.date ||
    item.event_date ||
    item.eventDate ||
    item.event?.date ||
    item.purchase_date ||
    item.purchaseDate ||
    '';
  const time = item.time || item.event_time || item.eventTime || item.event?.time || '';
  const venueName =
    item.venueName ||
    item.venue_name ||
    item.venue ||
    item.event?.venue_name ||
    item.event?.venue ||
    '';
  const seatInfo =
    item.seatInfo ||
    item.seat_info ||
    item.section_name ||
    item.sectionName ||
    item.seat_label ||
    item.seatLabel ||
    item.zone_name ||
    item.zoneName ||
    (item.seat_id ? `Asiento #${item.seat_id}` : 'Acceso General');
  const qrCode =
    item.qrCode ||
    item.qr_code ||
    item.qr_data ||
    item.qrData ||
    item.ticket_code ||
    item.ticketCode ||
    id;
  const ticketCode =
    item.ticketCode ||
    item.ticket_code ||
    item.code ||
    item.qrCode ||
    item.qr_code ||
    id;
  const rawPrice = item.price ?? item.total_price ?? item.amount;
  const price = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice || 0);
  const isCourtesy = Boolean(
    item.isCourtesy ||
    item.is_courtesy ||
    item.paymentMethod === 'courtesy' ||
    item.payment_method === 'courtesy' ||
    price === 0
  );
  const recipientType =
    item.recipientType ||
    item.recipient_type ||
    (isCourtesy ? 'Invitado Especial' : undefined);
  const courtesyMotive =
    item.courtesyMotive ||
    item.courtesy_motive ||
    item.motive ||
    item.note;
  const category =
    item.category ||
    item.eventCategory ||
    item.event_category ||
    item.event?.category ||
    item.category_name ||
    '';

  return {
    id,
    eventName,
    date,
    time,
    venueName,
    status: item.status || 'active',
    seatInfo,
    qrCode,
    ticketCode,
    price,
    isCourtesy,
    recipientType,
    courtesyMotive,
    category,
  };
};

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
      const response = await pilgrimApi.get(`/tickets/my-tickets`);
      
      // Mapeamos la respuesta real del backend a la interfaz
      if (response.data && Array.isArray(response.data)) {
        const parsedTickets = response.data.map(normalizeTicket);

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
      const response = await pilgrimApi.post('/tickets/purchase', {
        ...purchaseData,
        user_id: userId
      });

      // Asegurar que la caché offline local se invalide para reconciliar con la nube
      try {
        await AsyncStorage.removeItem(`@tickets_cache_${userId}`);
      } catch {}

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
      const response = await pilgrimApi.post('/tickets/transfer/request', {
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
      const response = await pilgrimApi.post(`/tickets/transfer/${transferId}/accept`);
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
      const response = await pilgrimApi.post(`/tickets/transfer/${transferId}/reject`);
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
      const response = await pilgrimApi.post(`/tickets/transfer/${transferId}/cancel`);
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
      const response = await pilgrimApi.get('/tickets/transfer/incoming');
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
      const response = await pilgrimApi.get('/tickets/transfer/outgoing');
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
      const response = await pilgrimApi.get(`/tickets/courtesy/validate-token/${claimToken.trim()}`);
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
      const cleanToken = claimToken.trim().toUpperCase();
      const response = await pilgrimApi.post('/tickets/courtesy/claim', {
        claimToken: cleanToken,
        claim_token: cleanToken,
        token: cleanToken,
      });
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error al canjear boleto de cortesía';
      throw new Error(msg);
    }
  },
};

