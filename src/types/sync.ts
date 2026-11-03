/**
 * Tipos y contratos para la sincronización bidireccional de datos en LaikaMobil
 * Clean Architecture - Capa 5: Modelos y Contratos
 */

export type SyncState = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export interface SyncMetadata {
  lastSyncTimestamp: number | null;
  status: SyncState;
  lastError: string | null;
  pendingChangesCount: number;
}

export interface PurchaseItemPayload {
  eventId: number | string;
  quantity: number;
  functionId?: number | string | null;
  sectionId?: number | string | null;
  sectionName: string;
  price: number;
  seatId?: string | null;
}

export interface TicketPurchasePayload {
  items: PurchaseItemPayload[];
  paymentMethod: string;
  paymentId: string;
  idempotencyKey: string;
  shippingInfo?: any | null;
  shippingMethod: 'digital' | string;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  field?: string;
}

export interface SyncExecutionResult<T> {
  success: boolean;
  data?: T;
  fromCache: boolean;
  syncTimestamp: number;
  errorMessage?: string;
}
