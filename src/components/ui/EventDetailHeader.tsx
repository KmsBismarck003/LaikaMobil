/**
 * Componente EventDetailHeader — LaikaMobil
 * Sección de cabecera de la pantalla de detalle de evento.
 * Muestra la imagen en modo hero, con gradiente inferior y metadatos superpuestos.
 * Componente puro: recibe datos, no contiene lógica de estado.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../styles/ThemeProvider';
import { Typography } from './Typography';
import { CategoryBadge } from './CategoryBadge';
import { parseDateParts, formatTime } from '../../styles/designUtils';
import { useStyles } from '../../styles/useStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_WIDTH * 0.9;

interface EventDetailHeaderProps {
  imageUrl?: string;
  title: string;
  date?: string;
  eventTime?: string;
  location?: string;
  category?: string;
  onBack: () => void;
  onMapPress: () => void;
}

export const EventDetailHeader: React.FC<EventDetailHeaderProps> = ({
  imageUrl,
  title,
  date,
  eventTime,
  location,
  category,
  onBack,
  onMapPress,
}) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const { day, month, weekday } = parseDateParts(date);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={imageUrl ? { uri: imageUrl } : undefined}
        style={styles.image}
        imageStyle={{ resizeMode: 'cover' }}
      >
        {/* Overlay gradiente inferior */}
        <View style={styles.overlayTop} />
        <View style={styles.overlayBottom} />

        {/* Botón atrás */}
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
          <Feather name="chevron-left" size={22} color={theme.colors.white} />
        </TouchableOpacity>

        {/* Metadatos en la parte inferior de la imagen */}
        <View style={styles.metaContainer}>
          <CategoryBadge category={category} />

          <Typography
            variant="display"
            color={theme.colors.white}
            style={styles.title}
            numberOfLines={3}
          >
            {title}
          </Typography>

          <View style={styles.infoRow}>
            {day && month ? (
              <View style={styles.infoChip}>
                <Feather name="calendar" size={12} color={theme.colors.primary} />
                <Typography variant="footnote" color={theme.colors.white} style={styles.chipText}>
                  {weekday ? `${weekday} ${day} ${month}` : `${day} ${month}`}
                  {eventTime ? ` · ${formatTime(eventTime)}` : ''}
                </Typography>
              </View>
            ) : null}

            {location ? (
              <TouchableOpacity style={styles.infoChip} onPress={onMapPress} activeOpacity={0.8}>
                <Feather name="map-pin" size={12} color={theme.colors.accent} />
                <Typography
                  variant="footnote"
                  color={theme.colors.white}
                  style={[styles.chipText, { flex: 1 }]}
                  numberOfLines={1}
                >
                  {location}
                </Typography>
                <Feather name="external-link" size={10} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    height: HEADER_HEIGHT,
    backgroundColor: theme.colors.surfaceHighlight,
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
    // Gradiente simulado: empieza transparente arriba y termina opaco abajo
    backgroundColor: 'rgba(13,13,15,0.9)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    margin: theme.spacing.m,
    marginTop: theme.spacing.l,
  },
  metaContainer: {
    padding: theme.spacing.l,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.s,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.5,
    marginTop: theme.spacing.xs,
  },
  infoRow: {
    gap: theme.spacing.s,
    marginTop: theme.spacing.xs,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 12,
  },
});
