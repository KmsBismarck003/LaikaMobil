/**
 * Componente GlassSearchBar — LaikaMobil
 * Barra de búsqueda flotante sobre el HeroCarousel.
 * Diseño glass/blur con campos de ubicación, fecha y búsqueda.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from './Typography';
import { useAppTheme } from '../../styles/ThemeProvider';
import { useStyles } from '../../styles/useStyles';

interface GlassSearchBarProps {
  location: string;
  date: string;
  onSearchPress: () => void;
}

export const GlassSearchBar: React.FC<GlassSearchBarProps> = ({
  location,
  date,
  onSearchPress,
}) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const topOffset = insets.top + theme.spacing.s;

  return (
    <View style={[styles.container, { top: topOffset }]}>
      <TouchableOpacity style={styles.searchBar} onPress={onSearchPress} activeOpacity={0.85}>
        {/* Icono de búsqueda */}
        <View style={styles.searchIconBox}>
          <Feather name="search" size={16} color={theme.colors.primary} />
        </View>

        {/* Ubicación */}
        <View style={styles.searchField}>
          <Typography variant="overline" color="rgba(255,255,255,0.5)" style={styles.fieldLabel}>
            UBICACIÓN
          </Typography>
          <Typography
            variant="footnote"
            weight="600"
            color={theme.colors.white}
            numberOfLines={1}
          >
            {location || 'Cualquier ubicación'}
          </Typography>
        </View>

        <View style={styles.divider} />

        {/* Fecha */}
        <View style={styles.searchField}>
          <Typography variant="overline" color="rgba(255,255,255,0.5)" style={styles.fieldLabel}>
            FECHA
          </Typography>
          <Typography
            variant="footnote"
            weight="600"
            color={theme.colors.white}
            numberOfLines={1}
          >
            {date || 'Cualquier fecha'}
          </Typography>
        </View>

        {/* Botón buscar */}
        <View style={styles.searchButton}>
          <Feather name="arrow-right" size={16} color={theme.colors.white} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    left: theme.spacing.m,
    right: theme.spacing.m,
    zIndex: 10,
  },
  searchBar: {
    height: 54,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(20, 20, 24, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.xs,
    // Simular blur en plataformas sin soporte nativo
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  searchIconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryFaint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primaryGlow,
  },
  searchField: {
    flex: 1,
    paddingHorizontal: theme.spacing.xs,
  },
  fieldLabel: {
    fontSize: 8,
    letterSpacing: 1,
    marginBottom: 1,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  searchButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.primary,
  },
});
