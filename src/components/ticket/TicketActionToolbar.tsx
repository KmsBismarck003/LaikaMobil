import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAppTheme } from '../../styles/ThemeProvider';
import { useStyles } from '../../styles/useStyles';
import { Ticket } from '../../services/TicketService';

interface TicketActionToolbarProps {
  ticket: Ticket;
  canRequestRefund: boolean;
  onCancelPress: () => void;
}

const { width } = Dimensions.get('window');

export const TicketActionToolbar: React.FC<TicketActionToolbarProps> = ({
  ticket,
  canRequestRefund,
  onCancelPress,
}) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const [shareFeedback, setShareFeedback] = useState(false);

  const handleOpenMaps = async () => {
    if (!ticket.venueName) return;
    const query = encodeURIComponent(ticket.venueName);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch {
      // Ignorar fallo de navegación externa
    }
  };

  const handleSharePass = async () => {
    try {
      const summary = `Pase LaikaClub: ${ticket.eventName}\nLugar: ${ticket.venueName || 'Por confirmar'}\nCódigo: ${ticket.ticketCode || ticket.id}`;
      await Clipboard.setStringAsync(summary);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2200);
    } catch {
      // Ignorar
    }
  };

  return (
    <View style={styles.container}>
      {/* Barra de utilidades funcionales rápidas */}
      <View style={styles.utilityRow}>
        {ticket.venueName ? (
          <TouchableOpacity
            style={styles.utilityButton}
            onPress={handleOpenMaps}
            activeOpacity={0.7}
          >
            <Feather name="navigation" size={15} color={theme.colors.text} style={{ marginBottom: 4 }} />
            <Text style={styles.utilityText}>Cómo llegar</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.utilityButton}
          onPress={handleSharePass}
          activeOpacity={0.7}
        >
          <Feather
            name={shareFeedback ? 'check' : 'share-2'}
            size={15}
            color={shareFeedback ? theme.colors.success : theme.colors.text}
            style={{ marginBottom: 4 }}
          />
          <Text style={styles.utilityText}>
            {shareFeedback ? '¡Copiado!' : 'Compartir'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Acción de cancelación/reembolso o aclaración de cortesía */}
      {canRequestRefund ? (
        <TouchableOpacity
          style={styles.cancelTicketButton}
          onPress={onCancelPress}
          activeOpacity={0.8}
        >
          <Feather name="rotate-ccw" size={14} color={theme.colors.error} />
          <Text style={styles.cancelTicketText}>Solicitar Reembolso</Text>
        </TouchableOpacity>
      ) : ticket.isCourtesy ? (
        <View style={styles.courtesyNoticeCard}>
          <Feather name="award" size={14} color="#fbbf24" style={{ marginRight: 8, marginTop: 1 }} />
          <Text style={styles.courtesyNoticeText}>
            Pase de cortesía 100% bonificado. Acceso intransferible una vez canjeado. No aplica para reembolso monetario.
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: Math.min(width - 32, 420),
      alignSelf: 'center',
      marginTop: 16,
    },
    utilityRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 12,
    },
    utilityButton: {
      flex: 1,
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceElevated || 'rgba(255, 255, 255, 0.05)',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.08)',
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    utilityText: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontWeight: '600',
    },
    cancelTicketButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceElevated || 'rgba(255, 255, 255, 0.04)',
      borderWidth: 1,
      borderColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.06)',
      marginTop: 4,
    },
    cancelTicketText: {
      color: theme.colors.error || '#FF453A',
      fontWeight: '600',
      fontSize: 13,
    },
    courtesyNoticeCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: 'rgba(245, 158, 11, 0.06)',
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.18)',
      marginTop: 4,
    },
    courtesyNoticeText: {
      flex: 1,
      color: theme.colors.textSecondary,
      fontSize: 11,
      lineHeight: 16,
    },
  });

