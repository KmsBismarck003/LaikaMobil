import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAppTheme } from '../../styles/ThemeProvider';
import { useStyles } from '../../styles/useStyles';
import { Ticket } from '../../services/TicketService';

interface TicketHeroQRProps {
  ticket: Ticket;
}

const { width } = Dimensions.get('window');

export const TicketHeroQR: React.FC<TicketHeroQRProps> = ({ ticket }) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const [copied, setCopied] = useState(false);

  const qrValue =
    ticket.qrCode?.toString() ||
    ticket.ticketCode ||
    ticket.id?.toString() ||
    'laikaclub-ticket';

  const displayCode = ticket.ticketCode || `TKT-${ticket.id}`;

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(displayCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Ignorar fallo de portapapeles
    }
  };

  const qrSize = Math.min(width * 0.48, 195);

  return (
    <View style={styles.container}>
      {/* Contenedor del QR: Blanco puro protegido con borde suave y sombra sobria */}
      <View style={styles.qrCard}>
        <QRCode
          value={qrValue}
          size={qrSize}
          color="#09090B"
          backgroundColor="#FFFFFF"
        />
      </View>

      {/* Identificador corto copiable en un toque */}
      <TouchableOpacity
        style={styles.codePill}
        onPress={handleCopyCode}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
      >
        <Text style={styles.codeText}>{displayCode}</Text>
        <Feather
          name={copied ? 'check' : 'copy'}
          size={13}
          color={copied ? theme.colors.success : theme.colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Alerta de confirmación sutil */}
      <View style={styles.alertSlot}>
        {copied ? (
          <Text style={styles.copiedText}>¡Código copiado al portapapeles!</Text>
        ) : (
          <Text style={styles.ticketIdText}>ID: #{ticket.id}</Text>
        )}
      </View>

      {/* Micro-sello de autenticidad criptográfica */}
      <View style={styles.securityRow}>
        <View style={styles.securityBadge}>
          <Feather name="shield" size={11} color={theme.colors.textTertiary} style={{ marginRight: 4 }} />
          <Text style={styles.securityText}>Cripto-Token Dinámico</Text>
        </View>
        <Text style={styles.securityHash}>SHA-256</Text>
      </View>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
    },
    qrCard: {
      backgroundColor: '#FFFFFF',
      padding: 14,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.08)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 14,
      elevation: 4,
    },
    codePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 14,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: theme.colors.surfaceElevated || 'rgba(255, 255, 255, 0.06)',
      borderWidth: 1,
      borderColor: theme.colors.borderMedium || 'rgba(255, 255, 255, 0.12)',
    },
    codeText: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.8,
      fontVariant: ['tabular-nums'],
    },
    alertSlot: {
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 4,
    },
    copiedText: {
      color: theme.colors.success || '#30D158',
      fontSize: 11,
      fontWeight: '600',
    },
    ticketIdText: {
      color: theme.colors.textTertiary,
      fontSize: 11,
      fontWeight: '500',
    },
    securityRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.06)',
    },
    securityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    securityText: {
      color: theme.colors.textTertiary,
      fontSize: 11,
      fontWeight: '500',
    },
    securityHash: {
      color: theme.colors.textTertiary,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });

