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
import { getCurrentUser } from '../store/AuthStore';
import { biometricService } from '../services/security/BiometricService';
import { TicketActionModal } from '../components/TicketActionModal';
import { TicketCard } from '../components/ui/TicketCard';
import { Typography } from '../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
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

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = getCurrentUser();
  const insets = useSafeAreaInsets();

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [myTickets, myReqs, myIncoming] = await Promise.all([
        TicketService.getMyTickets(user.id),
        CancellationService.getMyRequests(),
        TicketService.getIncomingTransfers(),
      ]);
      setTickets(myTickets);
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
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const authenticateAndFetch = async () => {
      try {
        const success = await biometricService.authenticateUser('Desbloquea para ver tus boletos');
        setIsUnlocked(success);

        if (success) {
          await loadData();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    authenticateAndFetch();
  }, [user, loadData]);

  const handleAcceptTransfer = async (transfer: TicketTransfer) => {
    try {
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

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  // ── Sin sesión ───────────────────────────────────────────────────────────

  if (!user) {
    return (
      <UnauthenticatedView 
        title="Tus boletos te esperan"
        subtitle="Inicia sesión para ver y gestionar tus boletos comprados."
        buttonText="Iniciar Sesión"
      />
    );
  }

  // ── Bloqueado por Biometría ──────────────────────────────────────────────

  if (!isUnlocked && user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.emptyIconBox}>
          <Feather name="lock" size={28} color={theme.colors.primary} />
        </View>
        <Typography variant="title" color={theme.colors.text} style={{ marginBottom: 8, marginTop: 16 }}>
          Apartado Protegido
        </Typography>
        <Typography variant="body" color={theme.colors.textSecondary} align="center" style={{ marginBottom: 24 }}>
          Tus boletos están bloqueados por seguridad.
        </Typography>
        <TouchableOpacity
          style={[styles.tabItem, styles.tabItemActive, { paddingHorizontal: 24, paddingVertical: 12 }]}
          activeOpacity={0.7}
          onPress={async () => {
            const success = await biometricService.authenticateUser('Desbloquea para ver tus boletos');
            if (success) {
              setIsUnlocked(true);
              setLoading(true);
              try {
                const myTickets = await TicketService.getMyTickets(user.id);
                setTickets(myTickets);
              } catch (e) {
                console.error(e);
              } finally {
                setLoading(false);
              }
            }
          }}
        >
          <Feather name="unlock" size={18} color={theme.colors.primary} />
          <Typography variant="body" weight="600" color={theme.colors.primary}>
            Desbloquear Boletos
          </Typography>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Render principal ─────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Typography variant="display" color={theme.colors.text} style={styles.headerTitle}>
            Mis Boletos
          </Typography>
          <Typography variant="footnote" color={theme.colors.textSecondary}>
            {tickets.length} {tickets.length === 1 ? 'boleto' : 'boletos'} en total
          </Typography>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              borderWidth: 1,
              borderColor: 'rgba(139, 92, 246, 0.4)',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              gap: 6,
            }}
            onPress={() => setIsRedeemModalVisible(true)}
            activeOpacity={0.7}
          >
            <Feather name="gift" size={14} color="#a78bfa" />
            <Typography variant="footnote" color="#c4b5fd" weight="600">
              Canjear
            </Typography>
          </TouchableOpacity>

          <View style={styles.ticketIconBadge}>
            <Feather name="credit-card" size={20} color={theme.colors.primary} />
          </View>
        </View>
      </View>

      {/* Tab bar horizontal scrollable */}
      <View style={styles.tabBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarScroll}
        >
          {TAB_CONFIG.map(({ key, label, icon }) => {
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
                activeOpacity={0.75}
              >
                <Feather
                  name={icon as any}
                  size={14}
                  color={isActive ? theme.colors.primary : theme.colors.textSecondary}
                />
                <Typography
                  variant="footnote"
                  weight={isActive ? '700' : '500'}
                  color={isActive ? theme.colors.primary : theme.colors.textSecondary}
                  style={styles.tabText}
                >
                  {label}
                </Typography>
                {count > 0 && (
                  <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                    <Typography
                      variant="overline"
                      color={isActive ? theme.colors.primary : theme.colors.textSecondary}
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
    paddingTop: theme.spacing.l,
    paddingBottom: theme.spacing.m,
  },
  headerTitle: {
    fontSize: 28,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  ticketIconBadge: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.l,
    backgroundColor: theme.colors.primaryFaint,
    borderWidth: 1,
    borderColor: theme.colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarWrapper: {
    paddingBottom: theme.spacing.s,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.full,
    gap: 6,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
  },
  tabItemActive: {
    backgroundColor: theme.colors.primaryFaint,
    borderColor: theme.colors.primaryGlow,
  },
  tabText: {
    letterSpacing: 0.2,
  },
  countBadge: {
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  countBadgeActive: {
    backgroundColor: theme.colors.primaryGlow,
  },
  countText: {
    fontSize: 9.5,
    letterSpacing: 0,
    fontWeight: '700',
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
