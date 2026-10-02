/**
 * Componente EventCard — LaikaMobil
 * Tarjeta de evento para el listado de la pantalla principal.
 * Diseño horizontal compacto con imagen, metadatos y acción de compra.
 *
 * Usa parseDateParts() de designUtils para obtener día/mes reales del evento
 * (sin hardcodeo).
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Event } from '../services/EventService';
import { useAppTheme } from '../styles/ThemeProvider';
import { parseDateParts, getCategoryColor } from '../styles/designUtils';
import { Typography } from './ui/Typography';
import { CategoryBadge } from './ui/CategoryBadge';
import { useStyles } from '../styles/useStyles';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const { day, month, weekday } = parseDateParts(event.date);
  
  // Format the date like "SÁB. 16 MAR"
  const formattedDate = `${weekday ? weekday.toUpperCase() + '. ' : ''}${day} ${month ? month.toUpperCase() : ''}`;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageWrapper}>
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Feather name="image" size={24} color={theme.colors.textTertiary} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Typography variant="overline" color={theme.colors.textSecondary} style={styles.dateText}>
          {formattedDate} {event.date && event.date.includes('T') ? `| ${event.date.split('T')[1].substring(0, 5)} H` : ''}
        </Typography>
        
        <Typography
          variant="subheadline"
          color={theme.colors.text}
          weight="bold"
          style={styles.title}
          numberOfLines={2}
        >
          {event.title.toUpperCase()}
        </Typography>
        
        <Typography variant="footnote" color={theme.colors.textSecondary} numberOfLines={1} style={styles.location}>
          {event.location}
        </Typography>

        <Typography variant="subheadline" color={theme.colors.text} weight="bold" style={styles.price}>
          {event.minPrice && event.minPrice > 0 ? `Desde $${event.minPrice}` : 'Gratuito'}
        </Typography>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface, // Should be a very dark grey, like #1a1a1a
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.m,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
  },
  imageWrapper: {
    width: 90,
    height: 90,
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceHighlight,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: theme.spacing.m,
    justifyContent: 'center',
    flexShrink: 1, // Fixes horizontal text cutoff
    gap: 4,
  },
  dateText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.3,
  },
  location: {
    fontSize: 12,
  },
  price: {
    fontSize: 14,
    marginTop: 2,
  },
});
