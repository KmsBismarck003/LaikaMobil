import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { useAppTheme } from '../styles/ThemeProvider';
import { useStyles } from '../styles/useStyles';
import { CancelTicketModal } from '../components/CancelTicketModal';
import { normalizeTicket } from '../services/TicketService';
import { TicketBentoGrid } from '../components/ticket/TicketBentoGrid';
import { TicketPerforation } from '../components/ticket/TicketPerforation';
import { TicketHeroQR } from '../components/ticket/TicketHeroQR';
import { TicketActionToolbar } from '../components/ticket/TicketActionToolbar';

type Props = NativeStackScreenProps<RootStackParamList, 'TicketPass'>;

const { width } = Dimensions.get('window');

export const TicketPassScreen: React.FC<Props> = ({ route, navigation }) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

  // Normalización integral de datos
  const ticket = useMemo(() => {
    return normalizeTicket(route.params?.ticket);
  }, [route.params?.ticket]);

  const canRequestRefund =
    ticket.status === 'active' &&
    !ticket.isCourtesy &&
    typeof ticket.price === 'number' &&
    ticket.price > 0;

  const isRevoked =
    ticket.status === 'transferred' ||
    ticket.status === 'transfer_pending' ||
    ticket.status === 'cancelled' ||
    ticket.status === 'refunded';

  return (
    <View style={styles.container}>
      {/* ── BARRA SUPERIOR FIJA RESPETANDO SAFE AREA ── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={20} color={theme.colors.text} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Pase Digital</Text>

        <View style={styles.headerRight}>
          {ticket.isCourtesy ? (
            <View style={styles.courtesyHeaderBadge}>
              <Feather name="award" size={11} color="#fbbf24" style={{ marginRight: 4 }} />
              <Text style={styles.courtesyHeaderBadgeText}>VIP</Text>
            </View>
          ) : (
            <View style={{ width: 44 }} />
          )}
        </View>
      </View>

      {/* ── CONTENIDO SCROLL CON PROTECCIÓN INFERIOR ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 24) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* TARJETA DEL BOLETO: DISEÑO MINIMALISTA TIER-1 */}
        <View style={styles.ticketCard}>
          {/* Módulo Bento: Evento, Recinto, Fecha, Asiento, Categoría y Estado */}
          <TicketBentoGrid ticket={ticket} />

          {/* Muescas y Perforación Ticket-Stub */}
          <TicketPerforation />

          {/* Módulo Inferior: QR Hero o Estado Inhabilitado */}
          {ticket.status === 'transferred' ? (
            <View style={styles.revokedCard}>
              <View style={styles.revokedIconBox}>
                <Feather name="shield-off" size={30} color={theme.colors.error} />
              </View>
              <Text style={styles.revokedTitle}>Credencial Revocada</Text>
              <Text style={styles.revokedDescription}>
                Este boleto fue transferido a otro usuario. Su código QR ha sido permanentemente invalidado y ya no permite el acceso al evento.
              </Text>
            </View>
          ) : ticket.status === 'transfer_pending' ? (
            <View style={styles.pendingCard}>
              <View style={styles.pendingIconBox}>
                <Feather name="clock" size={30} color={theme.colors.warning} />
              </View>
              <Text style={styles.pendingTitle}>Transferencia en Proceso</Text>
              <Text style={styles.pendingDescription}>
                El boleto se encuentra congelado a la espera de que el destinatario acepte la transferencia. Su código QR permanecerá inactivo hasta que se resuelva la operación.
              </Text>
            </View>
          ) : ticket.status === 'cancelled' || ticket.status === 'refunded' ? (
            <View style={styles.revokedCard}>
              <View style={styles.revokedIconBox}>
                <Feather name="x-circle" size={30} color={theme.colors.error} />
              </View>
              <Text style={styles.revokedTitle}>Boleto Cancelado</Text>
              <Text style={styles.revokedDescription}>
                Este boleto fue cancelado y su acceso al evento ha sido completamente deshabilitado.
              </Text>
            </View>
          ) : (
            <TicketHeroQR ticket={ticket} />
          )}
        </View>

        {/* ── BARRA DE ACCIONES Y UTILIDADES FUNCIONALES ── */}
        <TicketActionToolbar
          ticket={ticket}
          canRequestRefund={canRequestRefund}
          onCancelPress={() => setIsCancelModalVisible(true)}
        />

        {/* Modal de confirmación y cotización de cancelación */}
        <CancelTicketModal
          visible={isCancelModalVisible}
          ticket={ticket}
          onClose={() => setIsCancelModalVisible(false)}
          onSuccess={() => {
            setIsCancelModalVisible(false);
            navigation.goBack();
          }}
        />
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.m,
      paddingBottom: 12,
      backgroundColor: theme.colors.surface || theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.06)',
      zIndex: 10,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      minWidth: 70,
      paddingVertical: 6,
    },
    backText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    headerTitle: {
      ...theme.typography.header,
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
    },
    headerRight: {
      minWidth: 70,
      alignItems: 'flex-end',
    },
    courtesyHeaderBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    courtesyHeaderBadgeText: {
      color: '#fbbf24',
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.m,
      paddingTop: 16,
      alignItems: 'center',
    },
    ticketCard: {
      width: Math.min(width - 32, 420),
      borderRadius: 24,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderMedium || 'rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 18,
      elevation: 8,
    },
    /* Estados Revocados / Congelados */
    revokedCard: {
      alignItems: 'center',
      paddingVertical: 24,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.surface,
    },
    revokedIconBox: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.errorFaint || 'rgba(239, 68, 68, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.25)',
      marginBottom: 12,
    },
    revokedTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.error,
      marginBottom: 6,
      textAlign: 'center',
    },
    revokedDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
      paddingHorizontal: 12,
    },
    pendingCard: {
      alignItems: 'center',
      paddingVertical: 24,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.surface,
    },
    pendingIconBox: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.warningFaint || 'rgba(245, 158, 11, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.25)',
      marginBottom: 12,
    },
    pendingTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.warning,
      marginBottom: 6,
      textAlign: 'center',
    },
    pendingDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
      paddingHorizontal: 12,
    },
  });
