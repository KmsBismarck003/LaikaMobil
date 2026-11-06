/**
 * Pantalla MyTicketsScreen — LaikaMobil
 * Muestra los boletos del usuario organizados por estado.
 *
 * Estructura:
 *  - Header con título y contador
 *  - Tab bar: Activos / En Vivo / Historial
 *  - Lista de TicketCard (componente separado)
 *  - TicketActionModal (componente separado)
 *  - Estado vacío y estado sin sesión
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../styles/ThemeProvider';
import { TicketService, Ticket, TicketTransfer } from '../services/TicketService';
import { TicketSyncService } from '../services/TicketSyncService';
import { SyncStatusBadge } from '../components/ui/SyncStatusBadge';
import { SyncState } from '../types/sync';
import { getCurrentUser } from '../store/AuthStore';
import { useAuth } from '../hooks/useAuth';
import { biometricService } from '../services/security/BiometricService';
import { TicketActionModal } from '../components/TicketActionModal';
import { TicketCard } from '../components/ui/TicketCard';
import { Typography } from '../components/ui/Typography';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useStyles } from '../styles/useStyles';
import { UnauthenticatedView } from '../components/ui/UnauthenticatedView';
import { CancelTicketModal } from '../components/CancelTicketModal';
import { TransferTicketModal } from '../components/TransferTicketModal';
import { RedeemCourtesyModal } from '../components/RedeemCourtesyModal';
import { CourtesyGiftModal } from '../components/CourtesyGiftModal';
import { IncomingTransferCard } from '../components/ui/IncomingTransferCard';
import { RefundRequestCard } from '../components/ui/RefundRequestCard';
import { CancellationService, CancellationDetail } from '../services/CancellationService';

type TabKey = 'active' | 'in_progress' | 'history' | 'refunds';

const TAB_CONFIG: { key: TabKey; label: string; icon: string }[] = [
  { key: 'active',      label: 'Activos',       icon: 'check-circle' },
  { key: 'in_progress', label: 'En Vivo',       icon: 'radio' },
  { key: 'history',     label: 'Historial',     icon: 'archive' },
  { key: 'refunds',     label: 'Cancelaciones', icon: 'rotate-ccw' },
];

export const MyTicketsScreen = () => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [refundRequests, setRefundRequests] = useState<CancellationDetail[]>([]);
  const [incomingTransfers, setIncomingTransfers] = useState<TicketTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('active');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketToCancel, setTicketToCancel] = useState<Ticket | null>(null);
  const [ticketToTransfer, setTicketToTransfer] = useState<Ticket | null>(null);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [isRedeemModalVisible, setIsRedeemModalVisible] = useState(false);
  const [giftTicket, setGiftTicket] = useState<Ticket | any | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number | null>(null);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const userFromHook = useAuth();
  const user = userFromHook || getCurrentUser();
  const insets = useSafeAreaInsets();

  const loadData = useCallback(async () => {
    const activeUser = user || getCurrentUser();
    if (!activeUser) {
      setLoading(false);
      setSyncState('idle');
      return;
    }
    setSyncState('syncing');
    try {
      const [syncResult, myReqs, myIncoming] = await Promise.all([
        TicketSyncService.syncTickets(String(activeUser.id)),
        CancellationService.getMyRequests(),
        TicketService.getIncomingTransfers(),
      ]);
      const myTickets = syncResult.data || [];
      setTickets(myTickets);
      setSyncState(syncResult.success ? 'synced' : (syncResult.fromCache ? 'offline' : 'error'));
      setLastSyncTimestamp(syncResult.syncTimestamp);
      setRefundRequests(myReqs);
      setIncomingTransfers(myIncoming.filter((t) => t.status === 'PENDING'));

      // Detección automática de cortesías no vistas para desplegar experiencia de regalo
      try {
        const seenStr = await AsyncStorage.getItem('@laika_seen_courtesies');
        const seenIds: string[] = seenStr ? JSON.parse(seenStr) : [];
        const unacknowledged = myTickets.find(
          (t) => t.isCourtesy && t.status === 'active' && !seenIds.includes(t.id)
        );
        if (unacknowledged) {
          setGiftTicket(unacknowledged);
        }
      } catch (err) {
        console.error('Error checking seen courtesies in mobile:', err);
      }
    } catch (error) {
      console.error('Error fetching tickets and transfers:', error);
      setSyncState('error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const promptUnlockAndLoad = useCallback(async () => {
    const activeUser = user || getCurrentUser();
    if (!activeUser) {
      setLoading(false);
      return;
    }

    const isAvailable = await biometricService.isBiometricAvailable();
    if (!isAvailable) {
      // Dispositivo sin hardware biométrico ni bloqueo de pantalla (PIN/patrón/clave)
      setIsUnlocked(true);
      await loadData();
      return;
    }

    setLoading(true);
    const success = await biometricService.authenticateUser(
      'Desbloquea con tu huella, rostro o PIN para ver tus boletos'
    );

    if (success) {
      setIsUnlocked(true);
      await loadData();
    } else {
      setIsUnlocked(false);
      setLoading(false);
    }
  }, [user, loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Recargar boletos y verificar seguridad de dispositivo cada vez que la pestaña entra en foco
  useFocusEffect(
    useCallback(() => {
      const activeUser = user || getCurrentUser();
      if (!activeUser) {
        setLoading(false);
        setIsUnlocked(false);
        return;
      }

      if (!isUnlocked) {
        promptUnlockAndLoad();
      } else {
        loadData();
      }
    }, [user, isUnlocked, promptUnlockAndLoad, loadData])
  );

  const handleAcceptTransfer = async (transfer: TicketTransfer) => {
    try {
      const isBioAvailable = await biometricService.isBiometricAvailable();
      if (isBioAvailable) {
        const bioSuccess = await biometricService.authenticateUser(
          'Confirma con tu huella o PIN para aceptar este boleto'
        );
        if (!bioSuccess) {
          return;
        }
      }
      await TicketService.acceptTransfer(transfer.id);
      Alert.alert('Boleto Aceptado', 'El boleto ha sido transferido a tu cuenta y se ha generado una nueva credencial con código QR.');
      await loadData();
      setActiveTab('active');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo aceptar la transferencia');
    }
  };

  const handleRejectTransfer = async (transfer: TicketTransfer) => {
    try {
      await TicketService.rejectTransfer(transfer.id);
      Alert.alert('Transferencia Rechazada', 'Has rechazado la transferencia del boleto.');
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo rechazar la transferencia');
    }
  };

  const displayedTickets = tickets.filter((t) => {
    if (activeTab === 'active') {
      return t.status === 'active' || t.status === 'transfer_pending';
    }
    if (activeTab === 'in_progress') {
      return t.status === 'in_progress';
    }
    if (activeTab === 'history') {
      return t.status === 'history' || t.status === 'transferred' || t.status === 'cancelled' || t.status === 'refunded';
    }
    return false;
  });

  const handleNavigateToPass = (ticket: Ticket) => {
    navigation.navigate('TicketPass', { ticket });
  };

  // ── Sin sesión ───────────────────────────────────────────────────────────
  const activeUser = user || getCurrentUser();

  if (!activeUser) {
    return (
      <UnauthenticatedView 
        title="Tus boletos te esperan"
        subtitle="Inicia sesión para ver y gestionar tus boletos comprados."
        buttonText="Iniciar Sesión"
        onPressLogin={() => navigation.navigate('Login', {})}
      />
    );
  }

  // ── Bloqueado por Biometría / Seguridad del Dispositivo ──────────────────
  if (!isUnlocked && activeUser) {
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.emptyIconBox}>
          <Feather name="lock" size={28} color={theme.colors.primary} />
        </View>
        <Typography variant="title" color={theme.colors.text} style={{ marginBottom: 8, marginTop: 16 }}>
          Apartado Protegido
        </Typography>
        <Typography variant="body" color={theme.colors.textSecondary} align="center" style={{ marginBottom: 24 }}>
          Tus boletos están protegidos por la seguridad de tu dispositivo. Desbloquea para continuar.
        </Typography>
        <TouchableOpacity
          style={[styles.tabItem, styles.tabItemActive, { paddingHorizontal: 24, paddingVertical: 12 }]}
          activeOpacity={0.7}
          onPress={promptUnlockAndLoad}
        >
          <Feather name="unlock" size={18} color={theme.colors.primary} />
          <Typography variant="body" weight="600" color={theme.colors.primary}>
            Desbloquear Boletos
          </Typography>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Loading inicial ──────────────────────────────────────────────────────
  if (loading && tickets.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  // ── Render principal ─────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Header Minimalista */}
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Typography variant="display" color={theme.colors.text} style={styles.headerTitle}>
            Mis Boletos
          </Typography>
          <View style={styles.subtitleRow}>
            <Typography variant="footnote" color={theme.colors.textSecondary}>
              {tickets.length} {tickets.length === 1 ? 'pase activo' : 'pases'}
            </Typography>
            <Typography variant="footnote" color={theme.colors.textTertiary}>
              •
            </Typography>
            <SyncStatusBadge
              status={syncState}
              lastSyncTimestamp={lastSyncTimestamp}
              onPressRetry={loadData}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.redeemButton}
          onPress={() => setIsRedeemModalVisible(true)}
          activeOpacity={0.75}
        >
          <Feather name="gift" size={13} color={theme.colors.text} style={{ marginRight: 6 }} />
          <Typography variant="footnote" color={theme.colors.text} weight="600">
            Canjear
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Segmented Control de Pestañas (Sin neón) */}
      <View style={styles.tabBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarScroll}
        >
          {TAB_CONFIG.map(({ key, label }) => {
            const isActive = activeTab === key;
            const count =
              key === 'refunds'
                ? refundRequests.length
                : tickets.filter((t) => t.status === key).length;

            return (
              <TouchableOpacity
                key={key}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => setActiveTab(key)}
                activeOpacity={0.8}
              >
                <Typography
                  variant="footnote"
                  weight={isActive ? '700' : '500'}
                  color={isActive ? theme.colors.text : theme.colors.textSecondary}
                  style={styles.tabText}
                >
                  {label}
                </Typography>
                {count > 0 && (
                  <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                    <Typography
                      variant="overline"
                      color={isActive ? theme.colors.background : theme.colors.textSecondary}
                      style={styles.countText}
                    >
                      {count}
                    </Typography>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Contenido según pestaña */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Sección de Transferencias Entrantes (Criterio 4) */}
        {activeTab === 'active' && incomingTransfers.length > 0 && (
          <View style={styles.incomingSection}>
            <View style={styles.sectionHeader}>
              <Feather name="gift" size={16} color={theme.colors.primary} />
              <Typography variant="subheadline" weight="700" color={theme.colors.text}>
                Transferencias Pendientes ({incomingTransfers.length})
              </Typography>
            </View>
            {incomingTransfers.map((transfer) => (
              <IncomingTransferCard
                key={transfer.id}
                transfer={transfer}
                onAccept={handleAcceptTransfer}
                onReject={handleRejectTransfer}
              />
            ))}
          </View>
        )}

        {activeTab === 'refunds' ? (
          refundRequests.length === 0 ? (
            <View style={styles.emptyTab}>
              <View style={styles.emptyIconBox}>
                <Feather name="rotate-ccw" size={28} color={theme.colors.textTertiary} />
              </View>
              <Typography variant="body" color={theme.colors.textSecondary} align="center">
                No tienes solicitudes de cancelación o reembolso registradas.
              </Typography>
            </View>
          ) : (
            refundRequests.map((req) => (
              <RefundRequestCard key={req.id} request={req} />
            ))
          )
        ) : displayedTickets.length === 0 && incomingTransfers.length === 0 ? (
          <View style={styles.emptyTab}>
            <View style={styles.emptyIconBox}>
              <Feather name="inbox" size={28} color={theme.colors.textTertiary} />
            </View>
            <Typography variant="body" color={theme.colors.textSecondary} align="center">
              No tienes boletos en esta sección.
            </Typography>
          </View>
        ) : (
          displayedTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onPress={() => handleNavigateToPass(ticket)}
              onOptionsPress={() => setSelectedTicket(ticket)}
            />
          ))
        )}
      </ScrollView>

      {/* Modal de opciones del boleto */}
      <TicketActionModal
        visible={!!selectedTicket}
        isCourtesy={Boolean(selectedTicket?.isCourtesy)}
        onClose={() => setSelectedTicket(null)}
        onViewItinerary={() => {
          setSelectedTicket(null);
        }}
        onViewTicket={() => {
          if (selectedTicket) {
            handleNavigateToPass(selectedTicket);
          }
          setSelectedTicket(null);
        }}
        onRequestTransfer={
          selectedTicket?.status === 'active' && !selectedTicket?.isCourtesy
            ? () => {
                const toTransfer = selectedTicket;
                setSelectedTicket(null);
                setTicketToTransfer(toTransfer);
                setIsTransferModalVisible(true);
              }
            : undefined
        }
        onRequestCancel={
          selectedTicket?.status === 'active' && !selectedTicket?.isCourtesy
            ? () => {
                const toCancel = selectedTicket;
                setSelectedTicket(null);
                setTicketToCancel(toCancel);
                setIsCancelModalVisible(true);
              }
            : undefined
        }
      />

      {/* Modal interactivo de transferencia de boletos (Criterios 1, 2, 8) */}
      <TransferTicketModal
        visible={isTransferModalVisible}
        ticket={ticketToTransfer}
        onClose={() => {
          setIsTransferModalVisible(false);
          setTicketToTransfer(null);
        }}
        onSuccess={async () => {
          await loadData();
        }}
      />

      {/* Modal interactivo de cancelación y desglose de reembolso */}
      <CancelTicketModal
        visible={isCancelModalVisible}
        ticket={ticketToCancel}
        onClose={() => {
          setIsCancelModalVisible(false);
          setTicketToCancel(null);
        }}
        onSuccess={async () => {
          await loadData();
          setActiveTab('refunds');
        }}
      />

      {/* Modal de Canje de Cortesías */}
      <RedeemCourtesyModal
        visible={isRedeemModalVisible}
        onClose={() => setIsRedeemModalVisible(false)}
        onSuccess={async (claimedData) => {
          await loadData();
          setActiveTab('active');
          if (claimedData) {
            setGiftTicket(claimedData);
          }
        }}
      />

      {/* Modal de Revelación de Regalo / Invitación VIP */}
      <CourtesyGiftModal
        visible={!!giftTicket}
        ticket={giftTicket}
        onClose={async () => {
          if (giftTicket?.id) {
            try {
              const seenStr = await AsyncStorage.getItem('@laika_seen_courtesies');
              const seenIds: string[] = seenStr ? JSON.parse(seenStr) : [];
              if (!seenIds.includes(giftTicket.id.toString())) {
                await AsyncStorage.setItem(
                  '@laika_seen_courtesies',
                  JSON.stringify([...seenIds, giftTicket.id.toString()])
                );
              }
            } catch (err) {
              console.error(err);
            }
          }
          setGiftTicket(null);
        }}
        onOpenTicket={async (tkt) => {
          if (tkt?.id) {
            try {
              const seenStr = await AsyncStorage.getItem('@laika_seen_courtesies');
              const seenIds: string[] = seenStr ? JSON.parse(seenStr) : [];
              if (!seenIds.includes(tkt.id.toString())) {
                await AsyncStorage.setItem(
                  '@laika_seen_courtesies',
                  JSON.stringify([...seenIds, tkt.id.toString()])
                );
              }
            } catch (err) {
              console.error(err);
            }
          }
          setGiftTicket(null);
          handleNavigateToPass(tkt);
        }}
      />
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.m,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    letterSpacing: -0.6,
    fontWeight: '800',
    marginBottom: 2,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  redeemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated || 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: theme.colors.borderMedium || 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  tabBarWrapper: {
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabBarScroll: {
    paddingHorizontal: theme.spacing.l,
    gap: 8,
    alignItems: 'center',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
    backgroundColor: theme.colors.surfaceElevated || 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.06)',
  },
  tabItemActive: {
    backgroundColor: theme.colors.surfaceHighlight || theme.colors.surface,
    borderColor: theme.colors.borderMedium || 'rgba(255, 255, 255, 0.16)',
  },
  tabText: {
    letterSpacing: 0.1,
    fontSize: 12,
  },
  countBadge: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeActive: {
    backgroundColor: theme.colors.text,
  },
  countText: {
    fontSize: 9,
    letterSpacing: 0,
    fontWeight: '800',
  },
  listContent: {
    padding: theme.spacing.l,
    paddingTop: theme.spacing.s,
    paddingBottom: 110, // Suficiente espacio para no ocultarse detrás del dock flotante
  },
  incomingSection: {
    marginBottom: theme.spacing.m,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.s,
  },
  emptyTab: {
    paddingTop: theme.spacing.xxl,
    alignItems: 'center',
    gap: theme.spacing.m,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.s,
  },
  emptyTitle: {
    marginBottom: theme.spacing.s,
  },
  emptyBody: {
    lineHeight: 22,
  },
});
