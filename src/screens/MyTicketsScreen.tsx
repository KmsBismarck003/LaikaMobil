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

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../styles/ThemeProvider';
import { TicketService, Ticket } from '../services/TicketService';
import { getCurrentUser } from '../store/AuthStore';
import { TicketActionModal } from '../components/TicketActionModal';
import { TicketCard } from '../components/ui/TicketCard';
import { Typography } from '../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useStyles } from '../styles/useStyles';

type TabKey = 'active' | 'in_progress' | 'history';

const TAB_CONFIG: { key: TabKey; label: string; icon: string }[] = [
  { key: 'active',      label: 'Activos',   icon: 'check-circle' },
  { key: 'in_progress', label: 'En Vivo',   icon: 'radio' },
  { key: 'history',     label: 'Historial', icon: 'archive' },
];

export const MyTicketsScreen = () => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('active');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = getCurrentUser();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchTickets = async () => {
      try {
        const myTickets = await TicketService.getMyTickets(user.id);
        setTickets(myTickets);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const displayedTickets = tickets.filter((t) => t.status === activeTab);

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
      <View style={[styles.container, styles.centered]}>
        <View style={styles.emptyIconBox}>
          <Feather name="credit-card" size={36} color={theme.colors.textTertiary} />
        </View>
        <Typography variant="title" color={theme.colors.text} style={styles.emptyTitle}>
          Tus boletos te esperan
        </Typography>
        <Typography variant="body" align="center" color={theme.colors.textSecondary} style={styles.emptyBody}>
          Inicia sesión para ver y gestionar tus boletos.
        </Typography>
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
        <View style={styles.ticketIconBadge}>
          <Feather name="credit-card" size={20} color={theme.colors.primary} />
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TAB_CONFIG.map(({ key, label, icon }) => {
          const isActive = activeTab === key;
          const count = tickets.filter((t) => t.status === key).length;

          return (
            <TouchableOpacity
              key={key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setActiveTab(key)}
              activeOpacity={0.7}
            >
              <Feather
                name={icon as any}
                size={14}
                color={isActive ? theme.colors.primary : theme.colors.textTertiary}
              />
              <Typography
                variant="footnote"
                weight={isActive ? '700' : '500'}
                color={isActive ? theme.colors.primary : theme.colors.textSecondary}
              >
                {label}
              </Typography>
              {count > 0 && (
                <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                  <Typography
                    variant="overline"
                    color={isActive ? theme.colors.primary : theme.colors.textTertiary}
                    style={styles.countText}
                  >
                    {count}
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Lista de boletos */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {displayedTickets.length === 0 ? (
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
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.m,
    gap: theme.spacing.xs,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.l,
    gap: 5,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
  },
  tabItemActive: {
    backgroundColor: theme.colors.primaryFaint,
    borderColor: theme.colors.primaryGlow,
  },
  countBadge: {
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  countBadgeActive: {
    backgroundColor: theme.colors.primaryGlow,
  },
  countText: {
    fontSize: 9,
    letterSpacing: 0,
  },
  listContent: {
    padding: theme.spacing.l,
    paddingTop: theme.spacing.s,
    paddingBottom: theme.spacing.xxl,
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
