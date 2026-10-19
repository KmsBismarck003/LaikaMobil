import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppTheme } from '../styles/ThemeProvider';
import QRCode from 'react-native-qrcode-svg';
import { Feather } from '@expo/vector-icons';
import { useStyles } from '../styles/useStyles';
import { CancelTicketModal } from '../components/CancelTicketModal';

type Props = NativeStackScreenProps<RootStackParamList, 'TicketPass'>;

const { width } = Dimensions.get('window');

export const TicketPassScreen: React.FC<Props> = ({ route, navigation }) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const { ticket } = route.params;
  const [isCancelModalVisible, setIsCancelModalVisible] = React.useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>{'< Volver'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pase Digital</Text>
        <View style={{ width: 60 }} />
      </View>

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
              <Text style={styles.qrInstruction}>Escanea este código en la entrada</Text>
              
              <View style={styles.qrContainer}>
                <QRCode
                  value={ticket.qrCode?.toString() || ticket.id?.toString() || 'laikaclub-ticket'}
                  size={200}
                  color={theme.colors.background}
                  backgroundColor={theme.colors.white}
                />
              </View>

              <Text style={styles.ticketId}>ID: {ticket.id}</Text>
            </>
          )}
        </View>

        {/* CORTES LATERALES Y LÍNEA PUNTEADA */}
        <View style={styles.ticketDividerContainer}>
          <View style={styles.cutoutLeft} />
          <View style={styles.dashedLine} />
          <View style={styles.cutoutRight} />
        </View>

        {/* PARTE INFERIOR (Info del Evento) */}
        <View style={styles.ticketBottom}>
          <Text style={styles.eventName}>{ticket.eventName}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>FECHA</Text>
              <Text style={styles.infoValue}>{ticket.date}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>ZONA / ASIENTO</Text>
              <Text style={styles.infoValue}>{ticket.seatInfo}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>ESTADO</Text>
              <View style={[
                styles.statusBadge,
                ticket.status === 'active' ? styles.statusActive :
                ticket.status === 'transfer_pending' ? styles.statusWarning :
                ticket.status === 'transferred' ? styles.statusMuted :
                ticket.status === 'cancelled' ? styles.statusError :
                styles.statusUsed
              ]}>
                <Text style={[
                  styles.statusText,
                  ticket.status === 'active' ? styles.statusTextActive :
                  ticket.status === 'transfer_pending' ? styles.statusTextWarning :
                  ticket.status === 'transferred' ? styles.statusTextMuted :
                  ticket.status === 'cancelled' ? styles.statusTextError :
                  styles.statusTextUsed
                ]}>
                  {ticket.status === 'active' ? 'ACTIVO' :
                   ticket.status === 'transfer_pending' ? 'EN TRANSFERENCIA' :
                   ticket.status === 'transferred' ? 'TRANSFERIDO' :
                   ticket.status === 'cancelled' ? 'CANCELADO' :
                   ticket.status === 'refunded' ? 'REEMBOLSADO' : 'USADO'}
                </Text>
              </View>
            </View>
          </View>
        </View>

      </View>

      {ticket.status === 'active' && (
        <TouchableOpacity
          style={styles.cancelTicketButton}
          onPress={() => setIsCancelModalVisible(true)}
          activeOpacity={0.8}
        >
          <Feather name="rotate-ccw" size={16} color={theme.colors.error} />
          <Text style={styles.cancelTicketText}>Solicitar Cancelación y Reembolso</Text>
        </TouchableOpacity>
      )}

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
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.m,
    paddingTop: 60,
    alignItems: 'center',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    padding: theme.spacing.s,
  },
  backText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    ...theme.typography.header,
    fontSize: 20,
    color: theme.colors.text,
  },
  ticketWrapper: {
    width: width - theme.spacing.l * 2,
    alignSelf: 'center',
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  ticketTop: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  eventName: {
    ...theme.typography.header,
    fontSize: 24,
    color: theme.colors.text,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.m,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusActive: {
    backgroundColor: theme.colors.successBackground,
  },
  statusWarning: {
    backgroundColor: theme.colors.warningFaint || 'rgba(245, 158, 11, 0.12)',
  },
  statusMuted: {
    backgroundColor: theme.colors.surfaceHighlight,
  },
  statusError: {
    backgroundColor: theme.colors.errorFaint || 'rgba(239, 68, 68, 0.12)',
  },
  statusUsed: {
    backgroundColor: theme.colors.border,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusTextActive: {
    color: theme.colors.success,
  },
  statusTextWarning: {
    color: theme.colors.warning,
  },
  statusTextMuted: {
    color: theme.colors.textTertiary,
  },
  statusTextError: {
    color: theme.colors.error,
  },
  statusTextUsed: {
    color: theme.colors.textSecondary,
  },
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
  ticketDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    height: 40,
    position: 'relative',
    zIndex: 1,
  },
  cutoutLeft: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.background,
    position: 'absolute',
    left: -15,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    marginHorizontal: 20,
  },
  cutoutRight: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.background,
    position: 'absolute',
    right: -15,
  },
  ticketBottom: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: theme.spacing.xl,
  },
  qrInstruction: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: theme.spacing.l,
  },
  qrContainer: {
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: theme.spacing.m,
  },
  qrMock: {
    width: 200,
    height: 200,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  qrMockText: {
    color: '#94a3b8',
    fontWeight: 'bold',
    fontSize: 18,
  },
  qrMockSub: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 8,
  },
  ticketId: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    letterSpacing: 1,
  },
  cancelTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.l,
    backgroundColor: theme.colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
    width: '90%',
  },
  cancelTicketText: {
    color: theme.colors.error,
    fontWeight: '600',
    fontSize: 14,
  },
});
