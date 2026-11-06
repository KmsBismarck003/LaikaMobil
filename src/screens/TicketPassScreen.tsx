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
import { RootStackParamList } from '../../App';
import { useAppTheme } from '../styles/ThemeProvider';
import QRCode from 'react-native-qrcode-svg';
import { Feather } from '@expo/vector-icons';
import { useStyles } from '../styles/useStyles';
import { CancelTicketModal } from '../components/CancelTicketModal';
import { normalizeTicket } from '../services/TicketService';
import { formatShortDate } from '../styles/designUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'TicketPass'>;

const { width } = Dimensions.get('window');

export const TicketPassScreen: React.FC<Props> = ({ route, navigation }) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

  // Normalización exhaustiva para garantizar que ningún dato quede en blanco
  const ticket = useMemo(() => {
    return normalizeTicket(route.params?.ticket);
  }, [route.params?.ticket]);

  const formattedDate = formatShortDate(ticket.date) || ticket.date || 'Por confirmar';
  const timeStr = ticket.time ? ` · ${ticket.time} hrs` : '';
  const canRequestRefund =
    ticket.status === 'active' &&
    !ticket.isCourtesy &&
    typeof ticket.price === 'number' &&
    ticket.price > 0;

  return (
    <View style={styles.container}>
      {/* ── BARRA SUPERIOR FIJA RESPETANDO SAFE AREA (Cero recortes) ── */}
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

      {/* ── CONTENIDO CON SCROLL Y ESPACIADO SEGURO INFERIOR ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 24) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.ticketWrapper}>
          {/* PARTE SUPERIOR (QR O ESTADO REVOCADO/CONGELADO) */}
          <View style={styles.ticketTop}>
            {ticket.status === 'transferred' ? (
              <View style={styles.revokedCard}>
                <View style={styles.revokedIconBox}>
                  <Feather name="shield-off" size={32} color={theme.colors.error} />
                </View>
                <Text style={styles.revokedTitle}>Credencial Revocada</Text>
                <Text style={styles.revokedDescription}>
                  Este boleto fue transferido a otro usuario. Su código QR ha sido permanentemente invalidado y ya no permite el acceso al evento.
                </Text>
              </View>
            ) : ticket.status === 'transfer_pending' ? (
              <View style={styles.pendingCard}>
                <View style={styles.pendingIconBox}>
                  <Feather name="clock" size={32} color={theme.colors.warning} />
                </View>
                <Text style={styles.pendingTitle}>Transferencia en Proceso</Text>
                <Text style={styles.pendingDescription}>
                  El boleto se encuentra congelado a la espera de que el destinatario acepte la transferencia. Su código QR permanecerá inactivo hasta que se resuelva la operación.
                </Text>
              </View>
            ) : ticket.status === 'cancelled' || ticket.status === 'refunded' ? (
              <View style={styles.revokedCard}>
                <View style={styles.revokedIconBox}>
                  <Feather name="x-circle" size={32} color={theme.colors.error} />
                </View>
                <Text style={styles.revokedTitle}>Boleto Cancelado</Text>
                <Text style={styles.revokedDescription}>
                  Este boleto fue cancelado y su acceso al evento ha sido completamente deshabilitado.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.qrInstruction}>Presenta este código en el acceso al evento</Text>

                <View style={styles.qrContainer}>
                  <QRCode
                    value={ticket.qrCode?.toString() || ticket.ticketCode || ticket.id?.toString() || 'laikaclub-ticket'}
                    size={210}
                    color="#000000"
                    backgroundColor="#FFFFFF"
                  />
                </View>

                <View style={styles.idBadgeRow}>
                  <Text style={styles.ticketId}>ID: {ticket.id}</Text>
                  {ticket.ticketCode ? (
                    <>
                      <Text style={styles.idDivider}>•</Text>
                      <Text style={styles.ticketCode}>CÓDIGO: {ticket.ticketCode}</Text>
                    </>
                  ) : null}
                </View>
              </>
            )}
          </View>

          {/* CORTES LATERALES Y LÍNEA PUNTEADA TICKET-STUB */}
          <View style={styles.ticketDividerContainer}>
            <View style={styles.cutoutLeft} />
            <View style={styles.dashedLine} />
            <View style={styles.cutoutRight} />
          </View>

          {/* PARTE INFERIOR (INFORMACIÓN DEL EVENTO Y BENTO GRID) */}
          <View style={styles.ticketBottom}>
            <Text style={styles.eventName}>{ticket.eventName}</Text>

            {ticket.venueName ? (
              <View style={styles.venueRow}>
                <Feather name="map-pin" size={13} color={theme.colors.textSecondary} style={{ marginRight: 6 }} />
                <Text style={styles.venueText} numberOfLines={1}>
                  {ticket.venueName}
                </Text>
              </View>
            ) : null}

            {/* Fila 1: Fecha y Zona/Asiento */}
            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>FECHA Y HORA</Text>
                <Text style={styles.infoValue}>
                  {formattedDate}{timeStr}
                </Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>ZONA / ASIENTO</Text>
                <Text style={styles.infoValue}>{ticket.seatInfo || 'Acceso General'}</Text>
              </View>
            </View>

            {/* Fila 2: Modalidad y Estado */}
            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>TIPO DE ACCESO</Text>
                {ticket.isCourtesy ? (
                  <View style={styles.courtesyPill}>
                    <Feather name="star" size={10} color="#fbbf24" style={{ marginRight: 4 }} />
                    <Text style={styles.courtesyPillText}>
                      Cortesía Oficial ($0)
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.infoValue}>
                    ${ticket.price ? Number(ticket.price).toFixed(2) : '0.00'} MXN
                  </Text>
                )}
              </View>

              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>ESTADO</Text>
                <View
                  style={[
                    styles.statusBadge,
                    ticket.status === 'active'
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
                  <Text
                    style={[
                      styles.statusText,
                      ticket.status === 'active'
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
                    {ticket.status === 'active'
                      ? 'ACTIVO'
                      : ticket.status === 'transfer_pending'
                      ? 'EN TRANSFERENCIA'
                      : ticket.status === 'transferred'
                      ? 'TRANSFERIDO'
                      : ticket.status === 'cancelled'
                      ? 'CANCELADO'
                      : ticket.status === 'refunded'
                      ? 'REEMBOLSADO'
                      : 'USADO'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Nota o Motivo de la Cortesía si existe */}
            {ticket.courtesyMotive ? (
              <View style={styles.motiveContainer}>
                <Feather name="message-square" size={12} color="#a78bfa" style={{ marginRight: 6, marginTop: 2 }} />
                <Text style={styles.motiveText}>
                  Nota: &quot;{ticket.courtesyMotive}&quot;
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── SECCIÓN DE ACCIONES / POLÍTICAS ── */}
        {canRequestRefund ? (
          <TouchableOpacity
            style={styles.cancelTicketButton}
            onPress={() => setIsCancelModalVisible(true)}
            activeOpacity={0.8}
          >
            <Feather name="rotate-ccw" size={16} color={theme.colors.error} />
            <Text style={styles.cancelTicketText}>Solicitar Cancelación y Reembolso</Text>
          </TouchableOpacity>
        ) : ticket.isCourtesy ? (
          /* En boletos de cortesía NO aplica botón de reembolso monetario */
          <View style={styles.courtesyNoticeCard}>
            <Feather name="award" size={16} color="#fbbf24" style={{ marginRight: 8, marginTop: 1 }} />
            <Text style={styles.courtesyNoticeText}>
              Pase oficial de cortesía 100% bonificado. Este acceso es para uso personal en el evento y no califica para devoluciones o reembolsos monetarios.
            </Text>
          </View>
        ) : null}

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
      fontSize: 15,
      fontWeight: '600',
    },
    headerTitle: {
      ...theme.typography.header,
      fontSize: 18,
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
      backgroundColor: 'rgba(245, 158, 11, 0.14)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.35)',
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
    ticketWrapper: {
      width: Math.min(width - 32, 420),
      alignSelf: 'center',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 10,
    },
    ticketTop: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: theme.spacing.l,
      alignItems: 'center',
    },
    qrInstruction: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '500',
      marginBottom: theme.spacing.m,
      textAlign: 'center',
    },
    qrContainer: {
      backgroundColor: '#FFFFFF',
      padding: 16,
      borderRadius: 16,
      marginBottom: theme.spacing.m,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 4,
    },
    idBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 2,
    },
    ticketId: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.8,
    },
    idDivider: {
      color: theme.colors.textTertiary,
      fontSize: 10,
    },
    ticketCode: {
      color: theme.colors.textTertiary,
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.8,
    },
    /* Divider Notch */
    ticketDividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      height: 32,
      position: 'relative',
      zIndex: 1,
    },
    cutoutLeft: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.background,
      position: 'absolute',
      left: -12,
    },
    dashedLine: {
      flex: 1,
      height: 1,
      borderWidth: 1,
      borderColor: theme.colors.border || 'rgba(255, 255, 255, 0.12)',
      borderStyle: 'dashed',
      marginHorizontal: 16,
    },
    cutoutRight: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.background,
      position: 'absolute',
      right: -12,
    },
    ticketBottom: {
      backgroundColor: theme.colors.surface,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      padding: theme.spacing.l,
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
      marginBottom: theme.spacing.m,
    },
    venueText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '500',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.m,
      gap: 12,
    },
    infoCol: {
      flex: 1,
    },
    infoLabel: {
      color: theme.colors.textTertiary,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    infoValue: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    courtesyPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    courtesyPillText: {
      color: '#fbbf24',
      fontSize: 12,
      fontWeight: '700',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      alignSelf: 'flex-start',
    },
    statusActive: {
      backgroundColor: theme.colors.successBackground || 'rgba(16, 185, 129, 0.15)',
    },
    statusWarning: {
      backgroundColor: theme.colors.warningFaint || 'rgba(245, 158, 11, 0.12)',
    },
    statusMuted: {
      backgroundColor: theme.colors.surfaceHighlight || 'rgba(255, 255, 255, 0.08)',
    },
    statusError: {
      backgroundColor: theme.colors.errorFaint || 'rgba(239, 68, 68, 0.12)',
    },
    statusUsed: {
      backgroundColor: theme.colors.border || 'rgba(255, 255, 255, 0.1)',
    },
    statusText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    statusTextActive: {
      color: theme.colors.success || '#10b981',
    },
    statusTextWarning: {
      color: theme.colors.warning || '#f59e0b',
    },
    statusTextMuted: {
      color: theme.colors.textTertiary,
    },
    statusTextError: {
      color: theme.colors.error || '#ef4444',
    },
    statusTextUsed: {
      color: theme.colors.textSecondary,
    },
    motiveContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(139, 92, 246, 0.25)',
      borderRadius: 8,
      padding: 10,
      marginTop: 4,
    },
    motiveText: {
      flex: 1,
      color: '#ddd6fe',
      fontSize: 12,
      lineHeight: 16,
    },
    /* Estados Revocados / Congelados */
    revokedCard: {
      alignItems: 'center',
      paddingVertical: theme.spacing.m,
      paddingHorizontal: theme.spacing.s,
      width: '100%',
    },
    revokedIconBox: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.errorFaint || 'rgba(239, 68, 68, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.errorGlow || 'rgba(239, 68, 68, 0.25)',
      marginBottom: theme.spacing.m,
    },
    revokedTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.error,
      marginBottom: theme.spacing.s,
      textAlign: 'center',
    },
    revokedDescription: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
      paddingHorizontal: theme.spacing.s,
    },
    pendingCard: {
      alignItems: 'center',
      paddingVertical: theme.spacing.m,
      paddingHorizontal: theme.spacing.s,
      width: '100%',
    },
    pendingIconBox: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.warningFaint || 'rgba(245, 158, 11, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.warningGlow || 'rgba(245, 158, 11, 0.25)',
      marginBottom: theme.spacing.m,
    },
    pendingTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.warning,
      marginBottom: theme.spacing.s,
      textAlign: 'center',
    },
    pendingDescription: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
      paddingHorizontal: theme.spacing.s,
    },
    /* Acciones */
    cancelTicketButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 20,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: theme.borderRadius.l,
      backgroundColor: theme.colors.surfaceHighlight,
      borderWidth: 1,
      borderColor: theme.colors.borderFaint,
      width: Math.min(width - 32, 420),
    },
    cancelTicketText: {
      color: theme.colors.error,
      fontWeight: '600',
      fontSize: 14,
    },
    courtesyNoticeCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 18,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: 'rgba(245, 158, 11, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.2)',
      width: Math.min(width - 32, 420),
    },
    courtesyNoticeText: {
      flex: 1,
      color: theme.colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
    },
  });
