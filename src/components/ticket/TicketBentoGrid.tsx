import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../styles/ThemeProvider';
import { useStyles } from '../../styles/useStyles';
import { Ticket } from '../../services/TicketService';
import { formatShortDate, formatTime } from '../../styles/designUtils';

interface TicketBentoGridProps {
  ticket: Ticket;
}

export const TicketBentoGrid: React.FC<TicketBentoGridProps> = ({ ticket }) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();

  const formattedDate = formatShortDate(ticket.date) || ticket.date || 'Por confirmar';
  const formattedTimeStr = ticket.time ? formatTime(ticket.time) : '';

  const isTicketActive = ticket.status === 'active' || ticket.status === 'confirmed';

  const statusLabel =
    isTicketActive
      ? 'VÁLIDO'
      : ticket.status === 'transfer_pending'
      ? 'EN TRANSFERENCIA'
      : ticket.status === 'transferred'
      ? 'TRANSFERIDO'
      : ticket.status === 'cancelled'
      ? 'CANCELADO'
      : ticket.status === 'refunded'
      ? 'REEMBOLSADO'
      : ticket.status === 'unutilized'
      ? 'VENCIDO'
      : ticket.status === 'expired'
      ? 'EXPIRADO'
      : ticket.status === 'redeemed'
      ? 'CANJEADO'
      : 'USADO';

  const categoryLabel = (ticket.category || 'EVENTO LAIKA').toUpperCase();

  return (
    <View style={styles.container}>
      {/* Fila Superior: Categoría y Estado */}
      <View style={styles.topMetaRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{categoryLabel}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isTicketActive
              ? styles.statusActive
              : ticket.status === 'transfer_pending'
              ? styles.statusWarning
              : ticket.status === 'transferred'
              ? styles.statusMuted
              : ticket.status === 'cancelled'
              ? styles.statusError
              : styles.statusUsed,
          ]}
        >
          {isTicketActive ? <View style={styles.pulseDot} /> : null}
          <Text
            style={[
              styles.statusText,
              isTicketActive
                ? styles.statusTextActive
                : ticket.status === 'transfer_pending'
                ? styles.statusTextWarning
                : ticket.status === 'transferred'
                ? styles.statusTextMuted
                : ticket.status === 'cancelled'
                ? styles.statusTextError
                : styles.statusTextUsed,
            ]}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* Nombre del Evento y Recinto */}
      <Text style={styles.eventName}>{ticket.eventName}</Text>

      {ticket.venueName ? (
        <View style={styles.venueRow}>
          <Feather
            name="map-pin"
            size={12}
            color={theme.colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.venueText} numberOfLines={1}>
            {ticket.venueName}
          </Text>
        </View>
      ) : null}

      {/* Bento Grid 2x2 para lectura instantánea */}
      <View style={styles.bentoContainer}>
        {/* Celda 1: Fecha y Horario */}
        <View style={[styles.bentoCell, styles.cellBorderRight, styles.cellBorderBottom]}>
          <Text style={styles.cellLabel}>FECHA Y HORARIO</Text>
          <Text style={styles.cellValuePrimary} numberOfLines={1}>
            {formattedDate}
          </Text>
          {formattedTimeStr ? (
            <Text style={styles.cellValueSecondary}>{formattedTimeStr}</Text>
          ) : null}
        </View>

        {/* Celda 2: Zona y Asiento */}
        <View style={[styles.bentoCell, styles.cellBorderBottom]}>
          <Text style={styles.cellLabel}>ZONA / ASIENTO</Text>
          <Text style={styles.cellValuePrimary} numberOfLines={1}>
            {ticket.seatInfo || 'Acceso General'}
          </Text>
          <Text style={styles.cellValueSecondary}>
            {ticket.seatInfo?.includes('Fila') || ticket.seatInfo?.includes('Butaca')
              ? 'Asiento Reservado'
              : 'Acceso General'}
          </Text>
        </View>

        {/* Celda 3: Tipo de Acceso / Modalidad */}
        <View style={[styles.bentoCell, styles.cellBorderRight]}>
          <Text style={styles.cellLabel}>TIPO DE ACCESO</Text>
          {ticket.isCourtesy ? (
            <View style={styles.courtesyPill}>
              <Feather name="star" size={10} color="#fbbf24" style={{ marginRight: 4 }} />
              <Text style={styles.courtesyPillText}>Cortesía ($0)</Text>
            </View>
          ) : (
            <Text style={styles.cellValuePrimary}>
              ${ticket.price ? Number(ticket.price).toFixed(2) : '0.00'} MXN
            </Text>
          )}
        </View>

        {/* Celda 4: Identificador / Fila de control */}
        <View style={styles.bentoCell}>
          <Text style={styles.cellLabel}>EMISIÓN</Text>
          <Text style={styles.cellValuePrimary} numberOfLines={1}>
            Digital Pass
          </Text>
          <Text style={styles.cellValueSecondary}>ID #{ticket.id}</Text>
        </View>
      </View>

      {/* Nota de cortesía si aplica */}
      {ticket.courtesyMotive ? (
        <View style={styles.motiveContainer}>
          <Feather
            name="info"
            size={12}
            color={theme.colors.textSecondary}
            style={{ marginRight: 6, marginTop: 2 }}
          />
          <Text style={styles.motiveText}>
            Nota de emisión: &quot;{ticket.courtesyMotive}&quot;
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 14,
      backgroundColor: theme.colors.surface,
    },
    topMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    categoryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: theme.colors.surfaceElevated || 'rgba(255, 255, 255, 0.06)',
      borderWidth: 1,
      borderColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.08)',
    },
    categoryText: {
      color: theme.colors.textSecondary,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.8,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      gap: 5,
    },
    pulseDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.success || '#30D158',
    },
    statusActive: {
      backgroundColor: theme.colors.successFaint || 'rgba(48, 209, 88, 0.12)',
    },
    statusWarning: {
      backgroundColor: theme.colors.warningFaint || 'rgba(245, 158, 11, 0.12)',
    },
    statusMuted: {
      backgroundColor: theme.colors.surfaceHighlight || 'rgba(255, 255, 255, 0.08)',
    },
    statusError: {
      backgroundColor: theme.colors.errorFaint || 'rgba(255, 69, 58, 0.12)',
    },
    statusUsed: {
      backgroundColor: theme.colors.border || 'rgba(255, 255, 255, 0.08)',
    },
    statusText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    statusTextActive: {
      color: theme.colors.success || '#30D158',
    },
    statusTextWarning: {
      color: theme.colors.warning || '#FF9F0A',
    },
    statusTextMuted: {
      color: theme.colors.textTertiary,
    },
    statusTextError: {
      color: theme.colors.error || '#FF453A',
    },
    statusTextUsed: {
      color: theme.colors.textSecondary,
    },
    eventName: {
      ...theme.typography.header,
      fontSize: 20,
      lineHeight: 26,
      color: theme.colors.text,
      marginBottom: 4,
      textAlign: 'center',
      fontWeight: '800',
    },
    venueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
      paddingHorizontal: 12,
    },
    venueText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '500',
    },
    bentoContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      borderRadius: 14,
      backgroundColor: theme.colors.surfaceElevated || 'rgba(255, 255, 255, 0.03)',
      borderWidth: 1,
      borderColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.07)',
      overflow: 'hidden',
    },
    bentoCell: {
      width: '50%',
      paddingHorizontal: 12,
      paddingVertical: 10,
      justifyContent: 'center',
    },
    cellBorderRight: {
      borderRightWidth: 1,
      borderRightColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.07)',
    },
    cellBorderBottom: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.07)',
    },
    cellLabel: {
      color: theme.colors.textTertiary,
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.8,
      marginBottom: 2,
    },
    cellValuePrimary: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    cellValueSecondary: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontWeight: '500',
      marginTop: 1,
    },
    courtesyPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 6,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.25)',
    },
    courtesyPillText: {
      color: '#fbbf24',
      fontSize: 11,
      fontWeight: '700',
    },
    motiveContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.surfaceElevated || 'rgba(255, 255, 255, 0.04)',
      borderWidth: 1,
      borderColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.06)',
      borderRadius: 8,
      padding: 10,
      marginTop: 12,
    },
    motiveText: {
      flex: 1,
      color: theme.colors.textSecondary,
      fontSize: 11,
      lineHeight: 15,
    },
  });
