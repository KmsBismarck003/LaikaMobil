import { useState, useEffect, useCallback } from 'react';
import { SupportService, ServiceCategory, CreateServiceTicketDTO, CreateTicketResponse, TicketRecord } from '../services/SupportService';
import { useAuth } from './useAuth';

export const useSupportService = () => {
  const user = useAuth();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [myTickets, setMyTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SupportService.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servicio remoto');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyTickets = useCallback(async () => {
    if (!user) return;
    try {
      const tickets = await SupportService.getMyTickets();
      setMyTickets(tickets);
    } catch {
      // Silencioso
    }
  }, [user]);

  /**
   * Validación local rigurosa y transmisión HTTP POST
   */
  const submitTicket = async (dto: CreateServiceTicketDTO): Promise<CreateTicketResponse> => {
    // 1. Validación de categoría seleccionada
    if (!dto.categoryId || dto.categoryId.trim() === '') {
      throw new Error('Selecciona una categoría para clasificar tu solicitud.');
    }

    // 2. Validación de longitud de asunto
    const cleanSubject = dto.subject?.trim() || '';
    if (cleanSubject.length < 5) {
      throw new Error('El asunto debe contener al menos 5 caracteres.');
    }

    // 3. Validación de longitud de descripción
    const cleanDesc = dto.description?.trim() || '';
    if (cleanDesc.length < 15) {
      throw new Error('La descripción debe detallar tu solicitud (mínimo 15 caracteres).');
    }

    // 4. Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = dto.contactEmail?.trim() || '';
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      throw new Error('Ingresa un correo electrónico de contacto con formato válido.');
    }

    try {
      setSubmitting(true);
      const response = await SupportService.createTicket({
        categoryId: dto.categoryId,
        subject: cleanSubject,
        description: cleanDesc,
        contactEmail: cleanEmail,
        priority: dto.priority || 'MEDIUM',
      });

      // Si el usuario tiene sesión activa, actualizar lista de tickets en segundo plano
      if (user) {
        fetchMyTickets();
      }

      return response;
    } catch (err: any) {
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMyTickets();
  }, [fetchCategories, fetchMyTickets]);

  return {
    categories,
    myTickets,
    loading,
    submitting,
    error,
    refresh: fetchCategories,
    submitTicket,
  };
};
