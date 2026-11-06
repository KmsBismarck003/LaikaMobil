/**
 * Componente TicketCard — LaikaMobil
 * Tarjeta individual de boleto para la pantalla "Mis Boletos".
 * Diseño sobrio Tier-1 tipo Wallet Pass sin saturación ni neón.
 *
 * Responsabilidades: presentación pura con alta ergonomía táctil.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../styles/ThemeProvider';
import { formatShortDate } from '../../styles/designUtils';
import { Ticket } from '../../services/TicketService';
import { useStyles } from '../../styles/useStyles';

interface TicketCardProps {
  ticket: Ticket;
  onPress: () => void;
  onOptionsPress: () => void;
}

const getStatusConfig = (theme: any): Record<string, { color: string; label: string }> => ({
  active: {
    color: theme.colors.success || '#30D158',
    label: 'ACTIVO',
  },
  in_progress: {
    color: theme.colors.warning || '#FF9F0A',
    label: 'EN VIVO',
  },
  history: {
    color: theme.colors.textTertiary || '#8E8E93',
    label: 'USADO',
  },
  cancelled: {
    color: theme.colors.error || '#FF453A',
    label: 'CANCELADO',
  },
  refunded: {
    color: theme.colors.textSecondary || '#636366',
    label: 'REEMBOLSADO',
  },
  transferred: {
    color: theme.colors.textTertiary || '#8E8E93',
    label: 'TRANSFERIDO',
  },
  transfer_pending: {
    color: theme.colors.warning || '#FF9F0A',
    label: 'EN TRANSFERENCIA',
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

  const formattedDate = formatShortDate(ticket.date) || ticket.date || 'Por confirmar';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.inner}>
        {/* Cabecera: Badges de estado/cortesía y botón de opciones */}
        <View style={styles.header}>
          <View style={styles.statusRow}>
            {ticket.isCourtesy ? (
              <View style={styles.courtesyBadge}>
                <Feather name="star" size={10} color="#fbbf24" style={{ marginRight: 4 }} />
                <Text style={styles.courtesyBadgeText}>CORTESÍA</Text>
              </View>
            ) : null}

            <View style={styles.statusPill}>
              <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.optionsButton}
            onPress={onOptionsPress}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Feather name="more-horizontal" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Nombre del evento */}
        <Text style={styles.eventName} numberOfLines={2}>
          {ticket.eventName}
        </Text>

        {/* Recinto con pin sutil */}
        {ticket.venueName ? (
          <View style={styles.venueRow}>
            <Feather
              name="map-pin"
              size={12}
              color={theme.colors.textSecondary}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.venueText} numberOfLines={1}>
              {ticket.venueName}
            </Text>
          </View>
        ) : null}

        {/* Bento Grid compacto: Fecha y Asiento */}
        <View style={styles.bentoBox}>
          <View style={[styles.bentoCol, styles.bentoColBorder]}>
            <Text style={styles.bentoLabel}>FECHA</Text>
            <Text style={styles.bentoValue} numberOfLines={1}>
              {formattedDate}
            </Text>
          </View>
          <View style={styles.bentoCol}>
            <Text style={styles.bentoLabel}>ZONA / ASIENTO</Text>
            <Text style={styles.bentoValue} numberOfLines={1}>
              {ticket.seatInfo || 'Acceso General'}
            </Text>
          </View>
        </View>

        {/* Footer: Invitación a mostrar pase digital */}
        <View style={styles.footer}>
          <View style={styles.passHint}>
            <View style={styles.qrMiniIcon}>
              <Feather name="grid" size={11} color="#000000" />
            </View>
            <Text style={styles.passHintText}>Mostrar pase digital</Text>
          </View>
          <Feather name="chevron-right" size={16} color={theme.colors.textTertiary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: theme.colors.borderMedium || 'rgba(255, 255, 255, 0.08)',
      overflow: 'hidden',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 4,
    },
    inner: {
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    courtesyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.25)',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 6,
    },
    courtesyBadgeText: {
      color: '#fbbf24',
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    optionsButton: {
      padding: 4,
    },
    eventName: {
      ...theme.typography.header,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: 4,
    },
    venueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    venueText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '500',
      flex: 1,
    },
    bentoBox: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceElevated || 'rgba(255, 255, 255, 0.03)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.06)',
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 12,
    },
    bentoCol: {
      flex: 1,
      justifyContent: 'center',
    },
    bentoColBorder: {
      borderRightWidth: 1,
      borderRightColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.06)',
      marginRight: 12,
      paddingRight: 6,
    },
    bentoLabel: {
      color: theme.colors.textTertiary,
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.8,
      marginBottom: 2,
    },
    bentoValue: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.06)',
    },
    passHint: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    qrMiniIcon: {
      width: 20,
      height: 20,
      borderRadius: 5,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    passHintText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
  });
