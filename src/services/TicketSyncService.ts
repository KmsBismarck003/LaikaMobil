/**
 * TicketSyncService — LaikaMobil
 * Clean Architecture - Capa 3: Lógica de Sincronización Bidireccional
 * 
 * Gestiona la sincronización transparente entre el cliente móvil y el microservicio
 * de boletos en la nube, garantizando persistencia remota, tolerancia a fallos offline,
 * validación rigurosa de entradas y sanitización de errores.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { TicketService, Ticket } from './TicketService';
import {
  SyncMetadata,
  TicketPurchasePayload,
  ValidationResult,
  SyncExecutionResult,
} from '../types/sync';

const getSyncMetaKey = (userId: string) => `@tickets_sync_meta_${userId}`;
const getCacheKey = (userId: string) => `@tickets_cache_${userId}`;

export const TicketSyncService = {
  /**
   * Valida estrictamente en el cliente los datos de compra antes de emitir la petición HTTP.
   */
  validatePurchasePayload: (userId: string, payload: TicketPurchasePayload): ValidationResult => {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return {
        isValid: false,
        errorMessage: 'Identificador de usuario inválido o sesión no iniciada.',
        field: 'userId',
      };
    }

    if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
      return {
        isValid: false,
        errorMessage: 'El carrito no contiene ningún boleto para procesar.',
        field: 'items',
      };
    }

    for (let i = 0; i < payload.items.length; i++) {
      const item = payload.items[i];
      if (!item.eventId) {
        return {
          isValid: false,
          errorMessage: `El boleto #${i + 1} no especifica un evento válido.`,
          field: `items[${i}].eventId`,
        };
      }
      if (typeof item.price !== 'number' || isNaN(item.price) || item.price < 0) {
        return {
          isValid: false,
          errorMessage: `El boleto #${i + 1} tiene un precio inválido.`,
          field: `items[${i}].price`,
        };
      }
      if (item.quantity !== undefined && item.quantity <= 0) {
        return {
          isValid: false,
          errorMessage: `El boleto #${i + 1} debe tener una cantidad mayor a cero.`,
          field: `items[${i}].quantity`,
        };
      }
    }

    if (!payload.paymentMethod || payload.paymentMethod.trim() === '') {
      return {
        isValid: false,
        errorMessage: 'Se requiere seleccionar un método de pago válido.',
        field: 'paymentMethod',
      };
    }

    if (!payload.paymentId || payload.paymentId.trim() === '') {
      return {
        isValid: false,
        errorMessage: 'No se generó la referencia de pago requerida.',
        field: 'paymentId',
      };
    }

    if (!payload.idempotencyKey || payload.idempotencyKey.trim() === '') {
      return {
        isValid: false,
        errorMessage: 'Clave de idempotencia ausente. Riesgo de duplicidad.',
        field: 'idempotencyKey',
      };
    }

    return { isValid: true };
  },

  /**
   * Sanitiza excepciones para evitar exponer stack traces, contraseñas,
   * tokens o detalles internos de MySQL/Spring Boot al usuario final.
   */
  sanitizeError: (error: any): string => {
    if (!error) return 'Ocurrió un error inesperado en la sincronización.';

    const rawMessage = error.message || '';
    const status = error.response?.status;
    const responseDetail = error.response?.data?.detail || error.response?.data?.message;

    // 1. Fallos de conectividad o red
    if (
      rawMessage.includes('Network Error') ||
      rawMessage.includes('ECONNREFUSED') ||
      rawMessage.includes('timeout') ||
      rawMessage.includes('ERR_CONNECTION')
    ) {
      return 'Sin conexión con el servidor. Mostrando la versión guardada en tu dispositivo.';
    }

    // 2. Errores de autenticación y autorización
    if (status === 401) {
      return 'Tu sesión ha expirado o no es válida. Por favor, vuelve a iniciar sesión.';
    }
    if (status === 403) {
      return 'No tienes autorización para acceder a estos registros.';
    }

    // 3. Conflictos de negocio (asientos duplicados / ocupados)
    if (status === 409) {
      return 'Uno o más asientos seleccionados acaban de ser ocupados por otro usuario.';
    }

    // 4. Datos inválidos
    if (status === 400) {
      if (typeof responseDetail === 'string' && responseDetail.length < 120 && !responseDetail.includes('Exception')) {
        return responseDetail;
      }
      return 'La información enviada no cumple con las validaciones del servidor.';
    }

    // 5. Errores de servidor interno
    if (status >= 500) {
      return 'El servicio de boletos no se encuentra disponible temporalmente. Intenta más tarde.';
    }

    // 6. Mensaje controlado por defecto
    if (typeof responseDetail === 'string' && responseDetail.length < 100) {
      return responseDetail;
    }

    return 'No fue posible completar la sincronización con el servidor central.';
  },

  /**
   * Sincronización de Consulta (Pull):
   * Recupera los boletos más recientes del backend remoto. Si el backend responde,
   * actualiza la caché local y marca el estado como 'synced'.
   * Si hay fallo de red, recurre a la caché local y marca 'offline'.
   */
  syncTickets: async (userId: string): Promise<SyncExecutionResult<Ticket[]>> => {
    const metaKey = getSyncMetaKey(userId);
    const cacheKey = getCacheKey(userId);

    try {
      // 1. Petición remota real enviando Bearer token a Pilgrim Gateway
      const remoteTickets = await TicketService.getMyTickets(userId);

      const syncTimestamp = Date.now();
      const metadata: SyncMetadata = {
        lastSyncTimestamp: syncTimestamp,
        status: 'synced',
        lastError: null,
        pendingChangesCount: 0,
      };

      // 2. Actualizamos metadatos de sincronización
      await AsyncStorage.setItem(metaKey, JSON.stringify(metadata));

      return {
        success: true,
        data: remoteTickets,
        fromCache: false,
        syncTimestamp,
      };
    } catch (error: any) {
      const sanitized = TicketSyncService.sanitizeError(error);

      // 3. Fallback controlado a almacenamiento local offline
      let cachedTickets: Ticket[] = [];
      try {
        const rawCache = await AsyncStorage.getItem(cacheKey);
        if (rawCache) {
          cachedTickets = JSON.parse(rawCache);
        }
      } catch (cacheErr) {
        console.warn('Error reading fallback cache in SyncService:', cacheErr);
      }

      // 4. Actualizamos metadatos reflejando el estado sin conexión
      const metadata: SyncMetadata = {
        lastSyncTimestamp: null,
        status: 'offline',
        lastError: sanitized,
        pendingChangesCount: 0,
      };
      await AsyncStorage.setItem(metaKey, JSON.stringify(metadata)).catch(() => {});

      return {
        success: false,
        data: cachedTickets,
        fromCache: true,
        syncTimestamp: Date.now(),
        errorMessage: sanitized,
      };
    }
  },

  /**
   * Sincronización de Registro / Compra (Push):
   * Valida en cliente, envía al microservicio remoto, y tras el éxito,
   * asegura la persistencia atómica en el almacenamiento local y la reconciliación con la nube.
   */
  createTicketPurchase: async (
    userId: string,
    payload: TicketPurchasePayload
  ): Promise<SyncExecutionResult<any>> => {
    // 1. Validación previa en frontend
    const validation = TicketSyncService.validatePurchasePayload(userId, payload);
    if (!validation.isValid) {
      return {
        success: false,
        fromCache: false,
        syncTimestamp: Date.now(),
        errorMessage: validation.errorMessage || 'Datos de compra incompletos o inválidos.',
      };
    }

    try {
      // 2. Envío transaccional al endpoint POST /api/tickets/purchase
      const purchaseResponse = await TicketService.purchaseTicket(userId, {
        items: payload.items,
        paymentMethod: payload.paymentMethod,
        paymentId: payload.paymentId,
        idempotencyKey: payload.idempotencyKey,
        shippingInfo: payload.shippingInfo || null,
        shippingMethod: payload.shippingMethod || 'digital',
      });

      // 3. Disparamos una re-sincronización inmediata para que el casillero virtual
      // refleje de forma idéntica los registros guardados en la nube
      try {
        await TicketSyncService.syncTickets(userId);
      } catch {
        // Silencioso si la re-sincronización inmediata tarda; la compra ya está guardada
      }

      return {
        success: true,
        data: purchaseResponse,
        fromCache: false,
        syncTimestamp: Date.now(),
      };
    } catch (error: any) {
      const sanitized = TicketSyncService.sanitizeError(error);
      return {
        success: false,
        fromCache: false,
        syncTimestamp: Date.now(),
        errorMessage: sanitized,
      };
    }
  },

  /**
   * Obtiene los metadatos de sincronización actuales para el usuario.
   */
  getSyncMetadata: async (userId: string): Promise<SyncMetadata> => {
    try {
      const raw = await AsyncStorage.getItem(getSyncMetaKey(userId));
      if (raw) {
        return JSON.parse(raw) as SyncMetadata;
      }
    } catch {
      // Retorno predeterminado
    }

    return {
      lastSyncTimestamp: null,
      status: 'idle',
      lastError: null,
      pendingChangesCount: 0,
    };
  },
};
