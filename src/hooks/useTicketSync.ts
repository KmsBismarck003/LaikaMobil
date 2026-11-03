/**
 * Hook useTicketSync — LaikaMobil
 * Clean Architecture - Capa 3: Lógica de Estado y Casos de Uso
 *
 * Expone de manera reactiva el estado de sincronización bidireccional,
 * el listado de boletos (nube o caché offline), la marca de tiempo y las
 * acciones de sincronización manual y transacciones de compra.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Ticket } from '../services/TicketService';
import { TicketSyncService } from '../services/TicketSyncService';
import {
  SyncState,
  TicketPurchasePayload,
  SyncExecutionResult,
} from '../types/sync';
import { getCurrentUser } from '../store/AuthStore';

interface UseTicketSyncOptions {
  autoSync?: boolean;
}

export const useTicketSync = (userId?: string, options: UseTicketSyncOptions = { autoSync: true }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const getActiveUserId = useCallback(() => {
    if (userId) return userId;
    const currentUser = getCurrentUser();
    return currentUser?.id ? String(currentUser.id) : null;
  }, [userId]);

  const sync = useCallback(
    async (isBackground: boolean = false) => {
      const activeId = getActiveUserId();
      if (!activeId) {
        if (isMountedRef.current) {
          setLoading(false);
          setSyncState('idle');
        }
        return;
      }

      if (isMountedRef.current) {
        if (!isBackground) setLoading(true);
        setIsSyncing(true);
        setSyncState('syncing');
      }

      const result = await TicketSyncService.syncTickets(activeId);

      if (!isMountedRef.current) return;

      if (result.success && result.data) {
        setTickets(result.data);
        setSyncState('synced');
        setLastSyncTimestamp(result.syncTimestamp);
        setSyncError(null);
      } else {
        // Fallback a caché
        if (result.data && result.data.length > 0) {
          setTickets(result.data);
        }
        setSyncState(result.fromCache ? 'offline' : 'error');
        setSyncError(result.errorMessage || 'Error de sincronización.');
      }

      setLoading(false);
      setIsSyncing(false);
    },
    [getActiveUserId]
  );

  // Inicialización o carga de metadatos existentes
  useEffect(() => {
    const activeId = getActiveUserId();
    if (!activeId) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;

    // Cargar metadatos previos
    TicketSyncService.getSyncMetadata(activeId).then((meta) => {
      if (isSubscribed && meta.lastSyncTimestamp) {
        setLastSyncTimestamp(meta.lastSyncTimestamp);
      }
    });

    if (options.autoSync) {
      sync(false);
    } else {
      setLoading(false);
    }

    return () => {
      isSubscribed = false;
    };
  }, [getActiveUserId, options.autoSync, sync]);

  const executePurchase = useCallback(
    async (payload: TicketPurchasePayload): Promise<SyncExecutionResult<any>> => {
      const activeId = getActiveUserId();
      if (!activeId) {
        return {
          success: false,
          fromCache: false,
          syncTimestamp: Date.now(),
          errorMessage: 'Sesión no iniciada. Inicia sesión para adquirir boletos.',
        };
      }

      setIsSyncing(true);
      const purchaseResult = await TicketSyncService.createTicketPurchase(activeId, payload);
      setIsSyncing(false);

      if (purchaseResult.success) {
        // Refrescar listado local de boletos inmediatamente
        await sync(true);
      }

      return purchaseResult;
    },
    [getActiveUserId, sync]
  );

  return {
    tickets,
    loading,
    isSyncing,
    syncState,
    lastSyncTimestamp,
    syncError,
    sync,
    executePurchase,
  };
};
