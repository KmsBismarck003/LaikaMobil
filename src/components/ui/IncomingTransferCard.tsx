/**
 * Componente IncomingTransferCard — LaikaMobil
 * Muestra una transferencia entrante pendiente recibida por el usuario.
 * Permite Aceptar o Rechazar el boleto directamente (Criterio 4).
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../styles/ThemeProvider';
import { Typography } from './Typography';
import { Button } from './Button';
import { TicketTransfer } from '../../services/TicketService';
import { useStyles } from '../../styles/useStyles';

interface IncomingTransferCardProps {
  transfer: TicketTransfer;
  onAccept: (transfer: TicketTransfer) => Promise<void>;
  onReject: (transfer: TicketTransfer) => Promise<void>;
}

export const IncomingTransferCard: React.FC<IncomingTransferCardProps> = ({
  transfer,
  onAccept,
  onReject,
}) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();

  const [loadingAction, setLoadingAction] = useState<'accept' | 'reject' | null>(null);

  const handleAccept = async () => {
    setLoadingAction('accept');
    try {
      await onAccept(transfer);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async () => {
    setLoadingAction('reject');
    try {
      await onReject(transfer);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <View style={styles.card}>
      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Feather name="gift" size={16} color={theme.colors.primary} />
        </View>
        <View style={styles.headerTextBox}>
          <Typography variant="subheadline" weight="700" color={theme.colors.text}>
            Boleto Recibido
          </Typography>
          <Typography variant="footnote" color={theme.colors.textSecondary}>
            De: {transfer.senderEmail}
          </Typography>
        </View>
        <View style={styles.statusBadge}>
          <Feather name="clock" size={12} color={theme.colors.warning} />
          <Typography variant="overline" weight="700" color={theme.colors.warning}>
            PENDIENTE
          </Typography>
        </View>
      </View>

      {/* Info del evento y asiento */}
      <View style={styles.body}>
        <Typography variant="headline" weight="700" color={theme.colors.text} numberOfLines={2}>
          {transfer.ticketSummary?.eventName || 'Boleto LAIKA Club'}
        </Typography>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="map-pin" size={12} color={theme.colors.textSecondary} />
            <Typography variant="footnote" color={theme.colors.textSecondary}>
              {transfer.ticketSummary?.seatInfo || transfer.ticketSummary?.zoneName || 'General'}
            </Typography>
          </View>
          {transfer.ticketSummary?.date && (
            <View style={styles.metaItem}>
              <Feather name="calendar" size={12} color={theme.colors.textSecondary} />
              <Typography variant="footnote" color={theme.colors.textSecondary}>
                {transfer.ticketSummary.date}
              </Typography>
            </View>
          )}
        </View>

        <Typography variant="caption" color={theme.colors.textTertiary} style={{ marginTop: 4 }}>
          Expira: {transfer.expiresAt ? transfer.expiresAt.replace('T', ' ').substring(0, 16) : '48 horas'}
        </Typography>
      </View>

      {/* Botones de Aceptar / Rechazar */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.acceptBtn]}
          onPress={handleAccept}
          disabled={loadingAction !== null}
          activeOpacity={0.8}
        >
          {loadingAction === 'accept' ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Feather name="check" size={14} color="#FFFFFF" />
              <Typography variant="footnote" weight="700" color="#FFFFFF">
                Aceptar Boleto
              </Typography>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.rejectBtn]}
          onPress={handleReject}
          disabled={loadingAction !== null}
          activeOpacity={0.7}
        >
          {loadingAction === 'reject' ? (
            <ActivityIndicator size="small" color={theme.colors.error} />
          ) : (
            <>
              <Feather name="x" size={14} color={theme.colors.error} />
              <Typography variant="footnote" weight="600" color={theme.colors.error}>
                Rechazar
              </Typography>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1.5,
      borderColor: theme.colors.primaryGlow || theme.colors.primary,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      gap: theme.spacing.m,
      ...theme.shadows.small,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s,
    },
    iconBadge: {
      width: 34,
      height: 34,
      borderRadius: theme.borderRadius.m,
      backgroundColor: theme.colors.primaryFaint,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primaryGlow,
    },
    headerTextBox: {
      flex: 1,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.colors.warningFaint || 'rgba(245, 158, 11, 0.12)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.full,
    },
    body: {
      backgroundColor: theme.colors.surfaceHighlight,
      padding: theme.spacing.m,
      borderRadius: theme.borderRadius.m,
      gap: theme.spacing.xs,
    },
    metaRow: {
      flexDirection: 'row',
      gap: theme.spacing.m,
      marginTop: 2,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: theme.spacing.s,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: theme.spacing.m,
      borderRadius: theme.borderRadius.m,
    },
    acceptBtn: {
      flex: 2,
      backgroundColor: theme.colors.primary,
    },
    rejectBtn: {
      flex: 1,
      backgroundColor: theme.colors.errorFaint || 'rgba(239, 68, 68, 0.1)',
      borderWidth: 1,
      borderColor: theme.colors.errorGlow || 'rgba(239, 68, 68, 0.25)',
    },
  });
