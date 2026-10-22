import { pilgrimApi } from '../api/config';

export interface CancellationQuote {
  ticketId: number;
  ticketCode: string;
  eventId: number;
  eventName: string;
  eventDate: string;
  seatInfo: string;
  originalPrice: number;
  refundAmount: number;
  penaltyFee: number;
  paymentMethod: string;
  eligible: boolean;
  rejectionReason?: string;
  policySummary?: string;
  estimatedDays?: string;
}

export interface CancellationDetail {
  id: number;
  ticketId: number;
  ticketCode: string;
  eventId: number;
  eventName: string;
  seatInfo: string;
  originalPrice: number;
  refundAmount: number;
  penaltyFee: number;
  paymentMethod: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'FAILED' | string;
  statusLabel: string;
  cancellationReason?: string;
  rejectionReason?: string;
  gatewayRefundId?: string;
  createdAt: string;
  refundedAt?: string;
  message: string;
}

export const CancellationService = {
  /**
   * Criterio 3: Obtiene la cotización del reembolso e informa las condiciones
   * antes de confirmar la solicitud.
   */
  getQuote: async (ticketId: string | number): Promise<CancellationQuote> => {
    try {
      const response = await pilgrimApi.get<CancellationQuote>(`/refunds/quote/${ticketId}`);
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'No se pudo obtener la cotización de cancelación';
      throw new Error(msg);
    }
  },

  /**
   * Criterio 4, 5 y 7: Envía la solicitud de cancelación y procesamiento de reembolso.
   */
  requestCancellation: async (ticketId: string | number, reason?: string): Promise<CancellationDetail> => {
    try {
      const response = await pilgrimApi.post<CancellationDetail>('/refunds/request', {
        ticket_id: Number(ticketId),
        ticketId: Number(ticketId),
        reason: reason || 'Cancelación solicitada por el usuario desde LaikaMobil',
      });
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error al procesar la cancelación del boleto';
      throw new Error(msg);
    }
  },

  /**
   * Criterio 6: Consulta el historial de solicitudes de cancelación y su estado
   * (pendiente, aprobada, rechazada, reembolsada).
   */
  getMyRequests: async (): Promise<CancellationDetail[]> => {
    try {
      const response = await pilgrimApi.get<CancellationDetail[]>('/refunds/my-requests');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch {
      // Retornar array vacío de forma limpia sin advertencias intrusivas cuando no hay sesión o token
      return [];
    }
  },

  /**
   * Consulta el detalle específico de una solicitud.
   */
  getRequestDetail: async (requestId: number): Promise<CancellationDetail> => {
    try {
      const response = await pilgrimApi.get<CancellationDetail>(`/refunds/requests/${requestId}`);
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'No se pudo obtener el detalle de la solicitud';
      throw new Error(msg);
    }
  },
};
