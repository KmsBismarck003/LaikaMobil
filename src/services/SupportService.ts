import { pilgrimApi } from '../api/config';
import { getCurrentToken } from '../store/AuthStore';

export interface ServiceCategory {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  slaHours: number;
}

export interface CreateServiceTicketDTO {
  categoryId: string;
  subject: string;
  description: string;
  contactEmail: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface TicketSummary {
  ticketId: string;
  categoryId: string;
  categoryTitle: string;
  subject: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  estimatedSlaHours: number;
}

export interface CreateTicketResponse {
  success: boolean;
  message: string;
  ticket: TicketSummary;
}

export interface TicketRecord {
  id: string;
  category_id: string;
  category_title: string;
  subject: string;
  description: string;
  contact_email: string;
  user_id?: number | null;
  status: string;
  priority: string;
  created_at: string;
  sla_resolution_hours: number;
}

export const SupportService = {
  /**
   * Consulta remota de categorías de servicio (Fase 2: Consumo de Datos GET)
   */
  getCategories: async (): Promise<ServiceCategory[]> => {
    try {
      const response = await pilgrimApi.get('/support/categories');
      if (response.data && response.data.categories) {
        return response.data.categories;
      }
      return [];
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail 
        || error.response?.data?.message 
        || (error.message?.includes('Network Error') ? 'Sin conexión con el servidor central' : 'Error al consultar categorías de servicio');
      throw new Error(errorMsg);
    }
  },

  /**
   * Envío transaccional de nueva solicitud/ticket (Fase 3: Envío de Datos POST)
   */
  createTicket: async (dto: CreateServiceTicketDTO): Promise<CreateTicketResponse> => {
    try {
      const token = getCurrentToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await pilgrimApi.post<CreateTicketResponse>(
        '/support/tickets',
        {
          categoryId: dto.categoryId.trim(),
          subject: dto.subject.trim(),
          description: dto.description.trim(),
          contactEmail: dto.contactEmail.trim().toLowerCase(),
          priority: dto.priority || 'MEDIUM',
        },
        { headers }
      );

      return response.data;
    } catch (error: any) {
      // Sanitización estricta de mensajes de error (Fase 4: Seguridad)
      const sanitizedMsg = error.response?.data?.detail
        || error.response?.data?.message
        || (error.response?.status === 422 ? 'Verifica los campos obligatorios del formulario' : 'No se pudo registrar la solicitud en el servidor');
      throw new Error(sanitizedMsg);
    }
  },

  /**
   * Consulta remota de tickets asociados al usuario autenticado
   */
  getMyTickets: async (): Promise<TicketRecord[]> => {
    try {
      const token = getCurrentToken();
      if (!token) return [];

      const response = await pilgrimApi.get('/support/tickets/my', {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data?.tickets || [];
    } catch {
      // Retorno silencioso de fallback para no interrumpir la navegación si no hay sesión
      return [];
    }
  },
};

