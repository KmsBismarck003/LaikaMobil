/**
 * Componente RefundRequestCard — LaikaMobil
 * Tarjeta individual para mostrar el estado y progreso de una solicitud de cancelación y reembolso.
 * Cumple con el Criterio 6 de la historia de usuario.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../styles/ThemeProvider';
import { Typography } from './Typography';
import { CancellationDetail } from '../../services/CancellationService';
import { useStyles } from '../../styles/useStyles';

interface RefundRequestCardProps {
  request: CancellationDetail;
  onPress?: () => void;
}

const getStatusBadgeConfig = (theme: any, status: string) => {
  switch (status?.toUpperCase()) {
    case 'REFUNDED':
      return {
        label: 'Reembolsado',
        color: theme.colors.success,
        bgColor: theme.colors.successFaint || 'rgba(34, 197, 94, 0.12)',
        icon: 'check-circle' as const,
      };
    case 'APPROVED':
      return {
        label: 'Aprobada',
        color: theme.colors.primary,
        bgColor: theme.colors.primaryFaint || 'rgba(59, 130, 246, 0.12)',
        icon: 'check' as const,
      };
    case 'PENDING':
      return {
        label: 'En Revisión',
        color: theme.colors.warning,
        bgColor: theme.colors.warningFaint || 'rgba(245, 158, 11, 0.12)',
        icon: 'clock' as const,
      };
    case 'REJECTED':
      return {
        label: 'Rechazada',
        color: theme.colors.error,
        bgColor: theme.colors.errorFaint || 'rgba(239, 68, 68, 0.12)',
        icon: 'x-circle' as const,
      };
    default:
      return {
        label: status || 'Procesando',
        color: theme.colors.textSecondary,
        bgColor: theme.colors.surfaceHighlight,
        icon: 'info' as const,
      };
  }
};

export const RefundRequestCard: React.FC<RefundRequestCardProps> = ({ request, onPress }) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const badge = getStatusBadgeConfig(theme, request.status);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* Encabezado: Título y Chip de Estado */}
      <View style={styles.header}>
        <View style={styles.titleBox}>
          <Typography variant="subheadline" weight="700" color={theme.colors.text} numberOfLines={1}>
            {request.eventName}
          </Typography>
          <Typography variant="footnote" color={theme.colors.textSecondary} style={{ marginTop: 2 }}>
            Código: {request.ticketCode}
          </Typography>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: badge.bgColor }]}>
          <Feather name={badge.icon} size={12} color={badge.color} />
          <Typography variant="overline" weight="700" color={badge.color} style={{ fontSize: 10 }}>
            {badge.label}
          </Typography>
        </View>
      </View>

      {/* Detalles del Asiento y Desglose Financiero */}
      <View style={styles.body}>
        <View style={styles.row}>
          <Typography variant="footnote" color={theme.colors.textSecondary}>
            Ubicación:
          </Typography>
          <Typography variant="footnote" weight="600" color={theme.colors.text}>
            {request.seatInfo}
          </Typography>
        </View>

        <View style={styles.row}>
          <Typography variant="footnote" color={theme.colors.textSecondary}>
            Importe Reembolsable:
          </Typography>
          <Typography variant="body" weight="700" color={theme.colors.success}>
            ${request.refundAmount.toFixed(2)} MXN
          </Typography>
        </View>

        <View style={styles.row}>
          <Typography variant="footnote" color={theme.colors.textSecondary}>
            Método:
          </Typography>
          <Typography variant="footnote" color={theme.colors.textSecondary} numberOfLines={1}>
            {request.paymentMethod}
          </Typography>
        </View>

        {request.createdAt && (
          <View style={styles.row}>
            <Typography variant="footnote" color={theme.colors.textSecondary}>
              Fecha de Solicitud:
            </Typography>
            <Typography variant="footnote" color={theme.colors.textSecondary}>
              {request.createdAt.replace('T', ' ').substring(0, 16)}
            </Typography>
          </View>
        )}
      </View>

      {/* Mensaje de estado / Motivo de rechazo */}
      <View style={[styles.footer, request.status === 'REJECTED' && styles.footerError]}>
        <Feather
          name={request.status === 'REJECTED' ? 'alert-triangle' : 'info'}
          size={14}
          color={request.status === 'REJECTED' ? theme.colors.error : theme.colors.textSecondary}
        />
        <Typography
          variant="footnote"
          color={request.status === 'REJECTED' ? theme.colors.error : theme.colors.textSecondary}
          style={styles.footerText}
          numberOfLines={2}
        >
          {request.message || request.rejectionReason || request.statusLabel}
        </Typography>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.l,
      borderWidth: 1,
      borderColor: theme.colors.borderFaint,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      gap: theme.spacing.m,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: theme.spacing.s,
    },
    titleBox: {
      flex: 1,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.full,
    },
    body: {
      gap: 4,
      backgroundColor: theme.colors.surfaceHighlight,
      padding: theme.spacing.s,
      borderRadius: theme.borderRadius.m,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingTop: 2,
    },
    footerError: {
      backgroundColor: theme.colors.errorFaint || 'rgba(239, 68, 68, 0.08)',
      padding: 6,
      borderRadius: theme.borderRadius.s,
    },
    footerText: {
      flex: 1,
    },
  });
