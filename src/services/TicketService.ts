import axios from 'axios';
import { getCurrentToken } from '../store/AuthStore';

const PILGRIM_API_URL = process.env.EXPO_PUBLIC_PILGRIM_API_URL || 'http://localhost:8000/api';

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
  status: 'active' | 'in_progress' | 'history';
  seatInfo?: string;
  qrCode?: string;
  price?: number;
}

export const TicketService = {
  getMyTickets: async (userId: string): Promise<Ticket[]> => {
    try {
      // Llamada real al backend enviando el Bearer token (el userId se queda por compatibilidad local)
      const response = await ticketApi.get(`/tickets/my-tickets`);
      
      // Mapeamos la respuesta real del backend a la interfaz
      if (response.data && Array.isArray(response.data)) {
        return response.data.map((item: any) => ({
          id: item.id,
          eventName: item.event?.title || item.event_name || 'Evento Desconocido',
          date: item.event?.date || item.date || '',
          status: item.status || 'history', // Asumiendo que el backend envía el status
          seatInfo: item.seat_label || item.zone_name || 'General',
          qrCode: item.qr_code || item.id,
          price: item.price || 0
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching real tickets:', error);
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
  }
};
