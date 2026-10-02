/**
 * Componente TicketCard — LaikaMobil
 * Tarjeta individual de boleto para la pantalla "Mis Boletos".
 * Diseño con borde perforado (dashed) que evoca un boleto físico,
 * estado visual codificado por color y acceso rápido a opciones.
 *
 * Responsabilidades: solo presentación. Sin lógica de estado.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../styles/ThemeProvider';
import { Typography } from './Typography';
import { formatShortDate } from '../../styles/designUtils';
import { Ticket } from '../../services/TicketService';
import { useStyles } from '../../styles/useStyles';

interface TicketCardProps {
  ticket: Ticket;
  onPress: () => void;
  onOptionsPress: () => void;
}

const getStatusConfig = (theme: any): Record<string, { color: string; label: string; icon: string }> => ({
  active: {
    color: theme.colors.success,
    label: 'Activo',
    icon: 'check-circle',
  },
  in_progress: {
    color: theme.colors.warning,
    label: 'En Vivo',
    icon: 'radio',
  },
  history: {
    color: theme.colors.textTertiary,
    label: 'Usado',
    icon: 'archive',
  },
});

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onPress,
  onOptionsPress,
}) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const STATUS_CONFIG = getStatusConfig(theme);
  const statusConfig = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG['active'];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Barra de color lateral según estado */}
      <View style={[styles.colorBar, { backgroundColor: statusConfig.color }]} />

      <View style={styles.inner}>
        {/* Cabecera: evento + opciones */}
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <Feather
              name={statusConfig.icon as any}
              size={12}
              color={statusConfig.color}
            />
            <Typography
              variant="overline"
              color={statusConfig.color}
              style={styles.statusLabel}
            >
              {statusConfig.label}
            </Typography>
          </View>

          <TouchableOpacity
            style={styles.optionsButton}
            onPress={onOptionsPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Feather name="more-horizontal" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Nombre del evento */}
        <Typography
          variant="subheadline"
          color={theme.colors.text}
          weight="700"
          style={styles.eventName}
          numberOfLines={2}
        >
          {ticket.eventName}
        </Typography>

        {/* Separador punteado */}
        <View style={styles.separator} />

        {/* Metadatos del boleto */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="calendar" size={12} color={theme.colors.textSecondary} />
            <Typography variant="footnote" color={theme.colors.textSecondary}>
              {formatShortDate(ticket.date) || ticket.date}
            </Typography>
          </View>

          <View style={styles.metaItem}>
            <Feather name="map-pin" size={12} color={theme.colors.textSecondary} />
            <Typography
              variant="footnote"
              color={theme.colors.textSecondary}
              numberOfLines={1}
              style={{ flex: 1 }}
            >
              {ticket.seatInfo || 'General'}
            </Typography>
          </View>
        </View>

        {/* Pie: indicador de boleto digital */}
        <View style={styles.footer}>
          <View style={styles.qrHint}>
            <Feather name="grid" size={12} color={theme.colors.primary} />
            <Typography variant="footnote" color={theme.colors.primary}>
              Ver boleto
            </Typography>
          </View>
          <Feather name="chevron-right" size={16} color={theme.colors.textTertiary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  colorBar: {
    width: 4,
  },
  inner: {
    flex: 1,
    padding: theme.spacing.m,
    gap: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusLabel: {
    letterSpacing: 1,
    fontSize: 10,
  },
  optionsButton: {
    padding: theme.spacing.xxs,
  },
  eventName: {
    lineHeight: 22,
    fontSize: 16,
  },
  separator: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
    marginVertical: theme.spacing.xxs,
  },
  metaRow: {
    gap: theme.spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xxs,
  },
  qrHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.primaryFaint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
});
