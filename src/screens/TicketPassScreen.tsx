import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppTheme } from '../styles/ThemeProvider';
import QRCode from 'react-native-qrcode-svg';
import { useStyles } from '../styles/useStyles';
// Importamos react-native-qrcode-svg (necesitará instalación, si no, usamos un placeholder o instalamos el paquete)
// Ya que la instalación de un módulo nativo/bridge puede romper Expo Go si no se reinicia, 
// simularemos el QR con vistas por ahora o usaremos una imagen placeholder, pero lo ideal es react-native-qrcode-svg.
// Vamos a sugerir el uso y si no, pintamos cuadros. Mejor usamos la imagen estática por ahora o un componente básico.
// Dado el requerimiento "sin mocks", pero como QR es complejo sin librería, le agregaremos una librería QR si es posible.
// Por seguridad en Expo Go, usaremos un "Dummy QR" estilizado y pediremos instalar `react-native-qrcode-svg` si se requiere funcional.

type Props = NativeStackScreenProps<RootStackParamList, 'TicketPass'>;

const { width } = Dimensions.get('window');

export const TicketPassScreen: React.FC<Props> = ({ route, navigation }) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const { ticket } = route.params;

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
        
        {/* PARTE SUPERIOR (QR) */}
        <View style={styles.ticketTop}>
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
              <View style={[styles.statusBadge, ticket.status === 'active' ? styles.statusActive : styles.statusUsed]}>
                <Text style={styles.statusText}>
                  {ticket.status === 'active' ? 'ACTIVO' : 'USADO'}
                </Text>
              </View>
            </View>
          </View>
        </View>

      </View>
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
  statusUsed: {
    backgroundColor: theme.colors.border,
  },
  statusText: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: 'bold',
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
});
