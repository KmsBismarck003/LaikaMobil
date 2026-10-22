/**
 * Componente GlassSearchBar — LaikaMobil
 * Cápsula flotante segmentada de búsqueda y filtros (Ubicación, Fechas, Búsqueda).
 * Inspirada en el diseño de alto impacto visual y contraste de la plataforma.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, StyleProp, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Typography } from './Typography';
import { useAppTheme } from '../../styles/ThemeProvider';
import { useStyles } from '../../styles/useStyles';

interface GlassSearchBarProps {
  location: string;
  date: string;
  searchQuery?: string;
  onSearchPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const GlassSearchBar: React.FC<GlassSearchBarProps> = ({
  location,
  date,
  searchQuery,
  onSearchPress,
  style,
}) => {
  const styles = useStyles(createStyles);
  const { theme, isDark } = useAppTheme();

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.searchBar}
        onPress={onSearchPress}
        activeOpacity={0.92}
        accessibilityRole="button"
        accessibilityLabel="Abrir barra y filtros de búsqueda"
      >
        {/* Segmento 1: Ubicación */}
        <View style={styles.segment}>
          <Feather name="map-pin" size={13} color="#111827" style={styles.segmentIcon} />
          <View style={styles.segmentContent}>
            <Typography variant="overline" style={styles.segmentLabel}>
              UBICACIÓN
            </Typography>
            <Typography
              variant="footnote"
              weight="700"
              style={styles.segmentValue}
              numberOfLines={1}
            >
              {location || 'Todo México'}
            </Typography>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Segmento 2: Fechas */}
        <View style={styles.segment}>
          <Feather name="calendar" size={13} color="#111827" style={styles.segmentIcon} />
          <View style={styles.segmentContent}>
            <Typography variant="overline" style={styles.segmentLabel}>
              FECHAS
            </Typography>
            <View style={styles.valueRow}>
              <Typography
                variant="footnote"
                weight="700"
                style={styles.segmentValue}
                numberOfLines={1}
              >
                {date || 'Todas'}
              </Typography>
              <Feather name="chevron-down" size={10} color="#6B7280" style={{ marginLeft: 2 }} />
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Segmento 3: Buscar artista/evento */}
        <View style={[styles.segment, styles.segmentGrow]}>
          <Feather name="search" size={13} color="#111827" style={styles.segmentIcon} />
          <View style={styles.segmentContent}>
            <Typography variant="overline" style={styles.segmentLabel}>
              BUSCAR
            </Typography>
            <Typography
              variant="footnote"
              style={styles.placeholderValue}
              numberOfLines={1}
            >
              {searchQuery || 'Artista, evento'}
            </Typography>
          </View>
        </View>

        {/* Botón de acción Buscar */}
        <View style={styles.actionButton}>
          <Typography variant="overline" weight="bold" color="#FFFFFF" style={styles.actionButtonText}>
            BUSCAR
          </Typography>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.m,
      paddingVertical: 6,
      zIndex: 10,
    },
    searchBar: {
      height: 48,
      borderRadius: 14,
      backgroundColor: '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.08)',
      ...Platform.select({
        ios: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.16,
          shadowRadius: 10,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    segment: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 4,
      flexShrink: 1,
      minWidth: 62,
    },
    segmentGrow: {
      flex: 1,
      minWidth: 70,
    },
    segmentIcon: {
      marginRight: 4,
    },
    segmentContent: {
      flexShrink: 1,
      justifyContent: 'center',
    },
    segmentLabel: {
      fontSize: 8,
      lineHeight: 10,
      letterSpacing: 0.4,
      color: '#4B5563',
      fontWeight: '800',
    },
    segmentValue: {
      fontSize: 10.5,
      lineHeight: 13,
      color: '#111827',
      fontWeight: '700',
    },
    placeholderValue: {
      fontSize: 10.5,
      lineHeight: 13,
      color: '#6B7280',
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    divider: {
      width: 1,
      height: 24,
      backgroundColor: '#E5E7EB',
      marginHorizontal: 3,
    },
    actionButton: {
      backgroundColor: '#0F0F13',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 7,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4,
    },
    actionButtonText: {
      fontSize: 9.5,
      letterSpacing: 0.6,
      color: '#FFFFFF',
    },
  });
