/**
 * Utilidades de diseño compartidas.
 * Funciones puras para derivar valores del tema: colores de categoría,
 * parseo de fechas, gradientes, etc.
 * No contienen lógica de negocio ni estado de React.
 */

import { theme } from './theme';

/**
 * Retorna el color de acento asociado a una categoría de evento.
 */
export const getCategoryColor = (category?: string): string => {
  if (!category) return theme.colors.categoryDefault;
  const lower = category.toLowerCase();
  if (lower === 'concert' || lower === 'concierto' || lower === 'musica' || lower === 'música') {
    return theme.colors.categoryMusica;
  }
  if (lower === 'sport' || lower === 'deporte' || lower === 'deportes') {
    return theme.colors.categorySport;
  }
  if (lower === 'festival' || lower === 'festivales') {
    return theme.colors.categoryFestival;
  }
  if (lower === 'teatro' || lower === 'theater') {
    return theme.colors.categoryTeatro;
  }
  return theme.colors.categoryDefault;
};

/**
 * Retorna la etiqueta corta de categoría (para badges).
 */
export const getCategoryLabel = (category?: string): string => {
  if (!category) return 'EVENTO';
  return category.toUpperCase();
};

/**
 * Parsea un string de fecha ISO o YYYY-MM-DD y retorna { month, day, weekday }.
 * No usa valores hardcodeados — si el parseo falla, retorna strings vacíos.
 */
export const parseDateParts = (
  dateStr?: string
): { month: string; day: string; weekday: string } => {
  if (!dateStr) return { month: '', day: '', weekday: '' };
  try {
    // Forzar parseo en zona local (evitar off-by-one de UTC)
    const normalized = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`;
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return { month: '', day: '', weekday: '' };

    const month = d.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase().replace('.', '');
    const day = d.getDate().toString();
    const weekday = d.toLocaleDateString('es-MX', { weekday: 'short' }).toUpperCase().replace('.', '');
    return { month, day, weekday };
  } catch {
    return { month: '', day: '', weekday: '' };
  }
};

/**
 * Formatea una fecha completa legible.
 */
export const formatFullDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const normalized = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`;
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Formatea fecha corta tipo "16 oct 2025".
 */
export const formatShortDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const normalized = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`;
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Formatea hora de "HH:MM:SS" a "HH:MM hrs".
 */
export const formatTime = (timeStr?: string): string => {
  if (!timeStr) return '';
  return `${timeStr.substring(0, 5)} hrs`;
};
