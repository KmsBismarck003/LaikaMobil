/**
 * Design System — LaikaMobil
 * Token centralizado: colores, tipografía, espaciado, sombras, radios.
 * Todas las pantallas y componentes deben importar únicamente desde aquí.
 */

const darkColors = {
  // Marca principal
  primary: '#7C5CFC',
  primaryLight: '#9B7EFD',
  primaryDark: '#5B3DD8',
  primaryFaint: 'rgba(124, 92, 252, 0.12)',
  primaryGlow: 'rgba(124, 92, 252, 0.25)',

  // Acento secundario
  accent: '#FF6B8A',
  accentFaint: 'rgba(255, 107, 138, 0.12)',

  // Fondos
  background: '#0D0D0F',
  backgroundElevated: '#141416',
  surface: '#1A1A1F',
  surfaceElevated: '#222228',
  surfaceHighlight: '#2A2A32',

  // Texto
  text: '#F2F2F7',
  textSecondary: '#8E8E9E',
  textTertiary: '#4A4A5A',
  textInverse: '#0D0D0F',

  // Estado
  success: '#30D158',
  successFaint: 'rgba(48, 209, 88, 0.15)',
  successDark: '#1A7A34',
  warning: '#FF9F0A',
  warningFaint: 'rgba(255, 159, 10, 0.15)',
  error: '#FF453A',
  errorFaint: 'rgba(255, 69, 58, 0.15)',
  info: '#32ADE6',
  infoFaint: 'rgba(50, 173, 230, 0.15)',

  // Compatibilidad retroactiva (legacy aliases)
  successBackground: 'rgba(48, 209, 88, 0.15)',
  cardBackground: 'rgba(255, 255, 255, 0.05)',

  // Bordes
  border: 'rgba(255, 255, 255, 0.08)',
  borderFaint: 'rgba(255, 255, 255, 0.05)',
  borderMedium: 'rgba(255, 255, 255, 0.14)',
  borderStrong: 'rgba(255, 255, 255, 0.24)',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayDark: 'rgba(0, 0, 0, 0.85)',
  overlayLight: 'rgba(0, 0, 0, 0.35)',

  // Categorías de eventos
  categoryMusica: '#8B5CF6',
  categorySport: '#10B981',
  categoryFestival: '#F59E0B',
  categoryTeatro: '#EC4899',
  categoryDefault: '#7C5CFC',

  // Utilidades
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

const lightColors = {
  // Marca principal (misma o similar)
  primary: '#6B4BE0',
  primaryLight: '#8A70EB',
  primaryDark: '#4A33A3',
  primaryFaint: 'rgba(107, 75, 224, 0.12)',
  primaryGlow: 'rgba(107, 75, 224, 0.25)',

  // Acento secundario
  accent: '#E65271',
  accentFaint: 'rgba(230, 82, 113, 0.12)',

  // Fondos
  background: '#F9F9FB',
  backgroundElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#F2F2F7',
  surfaceHighlight: '#E5E5EA',

  // Texto
  text: '#1C1C1E',
  textSecondary: '#636366',
  textTertiary: '#8E8E93',
  textInverse: '#FFFFFF',

  // Estado
  success: '#34C759',
  successFaint: 'rgba(52, 199, 89, 0.15)',
  successDark: '#248A3D',
  warning: '#FF9500',
  warningFaint: 'rgba(255, 149, 0, 0.15)',
  error: '#FF3B30',
  errorFaint: 'rgba(255, 59, 48, 0.15)',
  info: '#007AFF',
  infoFaint: 'rgba(0, 122, 255, 0.15)',

  // Compatibilidad retroactiva
  successBackground: 'rgba(52, 199, 89, 0.15)',
  cardBackground: '#FFFFFF',

  // Bordes
  border: 'rgba(0, 0, 0, 0.08)',
  borderFaint: 'rgba(0, 0, 0, 0.04)',
  borderMedium: 'rgba(0, 0, 0, 0.14)',
  borderStrong: 'rgba(0, 0, 0, 0.24)',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.15)',

  // Categorías de eventos
  categoryMusica: '#8B5CF6',
  categorySport: '#10B981',
  categoryFestival: '#F59E0B',
  categoryTeatro: '#EC4899',
  categoryDefault: '#6B4BE0',

  // Utilidades
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

const spacing = {
  xxs: 2,
  xs: 4,
  s: 8,
  sm: 12,
  m: 16,
  ml: 20,
  l: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

const borderRadius = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

// Generamos typografía base (colores se inyectarán en los componentes mejor)
const typography = {
  header: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
  },
  display: {
    fontSize: 36,
    fontWeight: 'bold' as const,
    letterSpacing: -1,
    lineHeight: 42,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
  },
  subheadline: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  footnote: {
    fontSize: 11,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
  },
  overline: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
};

const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  primary: {
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const darkTheme = {
  colors: darkColors,
  spacing,
  borderRadius,
  typography: {
    ...typography,
    header: { ...typography.header, color: darkColors.text },
    title: { ...typography.title, color: darkColors.text },
    body: { ...typography.body, color: darkColors.textSecondary },
    caption: { ...typography.caption, color: darkColors.textSecondary },
    display: { ...typography.display, color: darkColors.text },
    headline: { ...typography.headline, color: darkColors.text },
    subheadline: { ...typography.subheadline, color: darkColors.text },
    footnote: { ...typography.footnote, color: darkColors.textSecondary },
    overline: { ...typography.overline, color: darkColors.textSecondary },
  },
  shadows: {
    small: { ...shadows.small, shadowOpacity: 0.3 },
    medium: { ...shadows.medium, shadowOpacity: 0.4 },
    large: { ...shadows.large, shadowOpacity: 0.5 },
    primary: { ...shadows.primary, shadowOpacity: 0.4 },
  },
};

export const lightTheme = {
  colors: lightColors,
  spacing,
  borderRadius,
  typography: {
    ...typography,
    header: { ...typography.header, color: lightColors.text },
    title: { ...typography.title, color: lightColors.text },
    body: { ...typography.body, color: lightColors.textSecondary },
    caption: { ...typography.caption, color: lightColors.textSecondary },
    display: { ...typography.display, color: lightColors.text },
    headline: { ...typography.headline, color: lightColors.text },
    subheadline: { ...typography.subheadline, color: lightColors.text },
    footnote: { ...typography.footnote, color: lightColors.textSecondary },
    overline: { ...typography.overline, color: lightColors.textSecondary },
  },
  shadows: {
    small: { ...shadows.small, shadowOpacity: 0.1 },
    medium: { ...shadows.medium, shadowOpacity: 0.12 },
    large: { ...shadows.large, shadowOpacity: 0.15 },
    primary: { ...shadows.primary, shadowOpacity: 0.25, shadowColor: lightColors.primary },
  },
};

// Mantenemos `theme` por defecto apuntando a `darkTheme` para evitar romper el código existente temporalmente,
// pero a partir de ahora, todo nuevo desarrollo debe usar `useAppTheme()`
export const theme = darkTheme;

export type Theme = typeof darkTheme;
export type ThemeColors = typeof darkTheme.colors;
export type ThemeSpacing = typeof darkTheme.spacing;
