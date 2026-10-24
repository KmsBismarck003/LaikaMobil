/**
 * Pantalla CartScreen — LaikaMobil
 * Gestión del carrito de compras y checkout seguro.
 * Incluye empty state enriquecido de alto nivel estético, badges de confianza
 * y flujo de pago biométrico anti-fallos.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { useAppTheme } from '../styles/ThemeProvider';
import { Button } from '../components/ui/Button';
import { Typography } from '../components/ui/Typography';
import { PaymentService, PaymentMethod } from '../services/PaymentService';
import { PaymentMethodSelector } from '../components/PaymentMethodSelector';
import { TicketService } from '../services/TicketService';
import { useAuth } from '../hooks/useAuth';
import { useStyles } from '../styles/useStyles';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { UnauthenticatedView } from '../components/ui/UnauthenticatedView';
import { getSafeImageSource } from '../utils/imageUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

const SUGGESTED_CATEGORIES = [
  { id: 'concert', label: 'Música', icon: 'music' },
  { id: 'festival', label: 'Festivales', icon: 'zap' },
  { id: 'sport', label: 'Deportes', icon: 'activity' },
  { id: 'theater', label: 'Teatro', icon: 'film' },
];

export const CartScreen: React.FC<Props> = ({ route, navigation }) => {
  const styles = useStyles(createStyles);
  const { theme, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { eventPreview } = route.params || {};
  const user = useAuth();
  const [loading, setLoading] = useState(false);

  // Payment State
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);

  const userName = user?.name || user?.email?.split('@')[0] || 'Invitado';

  // --- MOTOR ANTI-FALLOS Y TEMPORIZADOR ---
  const { isOffline } = useNetworkStatus();
  const idempotencyKey = React.useRef(
    `idem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [timeLeft, setTimeLeft] = useState(3 * 60); // 3 minutos

  useEffect(() => {
    if (!eventPreview) return;

    if (timeLeft <= 0) {
      Alert.alert(
        'Tiempo Agotado',
        'Tus lugares han sido liberados. Por favor, vuelve a intentar.'
      );
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Eventos' as any);
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, navigation, eventPreview]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!user) {
      setMethodsLoading(false);
      return;
    }
    const fetchMethods = async () => {
      try {
        const savedMethods = await PaymentService.getSavedMethods(user.id);
        setMethods(savedMethods);
        if (savedMethods.length > 0) {
          setSelectedMethodId(savedMethods[0].id);
        }
      } catch (error) {
        console.error('Error cargando métodos de pago:', error);
      } finally {
        setMethodsLoading(false);
      }
    };

    fetchMethods();
  }, [user?.id]);

  const handlePayment = async () => {
    if (!eventPreview) return;

    if (isOffline) {
      Alert.alert(
        'Sin Conexión',
        'Perdiste la conexión a internet. Tus lugares están reservados hasta que el contador llegue a cero.'
      );
      return;
    }

    if (!selectedMethodId) {
      Alert.alert('Atención', 'Por favor selecciona un método de pago.');
      return;
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const authResult = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Autoriza tu compra',
          cancelLabel: 'Cancelar',
          fallbackLabel: 'Usar PIN/Contraseña',
        });

        if (!authResult.success) {
          return;
        }
      }

      setLoading(true);

      const intentResponse = await PaymentService.createIntent({
        amount: eventPreview.total,
        currency: 'mxn',
        paymentMethodId: selectedMethodId,
      });

      await PaymentService.confirmPayment(intentResponse.paymentId);

      const purchaseItems = [];
      for (let i = 0; i < eventPreview.quantity; i++) {
        purchaseItems.push({
          eventId: eventPreview.eventId,
          quantity: 1,
          functionId: eventPreview.functionId || null,
          sectionId: null,
          sectionName: 'General',
          price: eventPreview.price,
          seatId: null,
        });
      }

      if (!user) {
        throw new Error('Debes iniciar sesión para comprar.');
      }
      await TicketService.purchaseTicket(user.id, {
        items: purchaseItems,
        paymentMethod: 'card',
        paymentId: intentResponse.paymentId || `pi_${Date.now()}`,
        idempotencyKey: idempotencyKey.current,
        shippingInfo: null,
        shippingMethod: 'digital',
      });

      navigation.navigate('Success', {
        userName,
        eventTitle: eventPreview.title,
        eventDate: eventPreview.date,
        quantity: eventPreview.quantity,
      });
    } catch (error: any) {
      console.error(error);
      const detail = error.response?.data?.detail || error.message;
      Alert.alert('Error', `Hubo un problema al procesar tu pago: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  // ── ESTADO 1: Sin sesión iniciada ─────────────────────────────────────────
  if (!eventPreview && !user) {
    return (
      <UnauthenticatedView
        title="Tus reservaciones"
        subtitle="Inicia sesión para explorar eventos, guardar tus lugares favoritos y completar tus compras en segundos."
        buttonText="Iniciar Sesión"
      />
    );
  }

  // ── ESTADO 2: Carrito Vacío con Sesión Activa ─────────────────────────────
  if (!eventPreview) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 14) }]}>
        {/* Cabecera unificada limpia */}
        <View style={styles.header}>
          <View>
            <Typography variant="display" color={theme.colors.text} style={styles.headerTitle}>
              Mi Carrito
            </Typography>
            <Typography variant="footnote" color={theme.colors.textSecondary}>
              Boletos y reservaciones activas
            </Typography>
          </View>

          <View style={styles.headerIconBadge}>
            <Feather name="shopping-bag" size={20} color={theme.colors.primary} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.emptyScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Tarjeta Hero de Carrito Vacío */}
          <View style={styles.emptyHeroCard}>
            <View style={styles.emptyIconGlowOuter}>
              <View style={styles.emptyIconGlowInner}>
                <Feather name="shopping-bag" size={38} color={theme.colors.primary} />
              </View>
            </View>

            <Typography
              variant="title"
              weight="bold"
              color={theme.colors.text}
              style={styles.emptyTitle}
            >
              Tu carrito está vacío
            </Typography>

            <Typography
              variant="body"
              color={theme.colors.textSecondary}
              align="center"
              style={styles.emptyDescription}
            >
              Aún no has agregado boletos a tu carrito. Explora nuestra cartelera de conciertos, festivales y deportes para reservar tus lugares.
            </Typography>

            <TouchableOpacity
              style={styles.explorePrimaryBtn}
              onPress={() => navigation.navigate('Eventos' as any)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Explorar Eventos"
            >
              <Feather name="compass" size={17} color="#FFFFFF" />
              <Typography variant="footnote" weight="bold" color="#FFFFFF">
                Explorar Eventos
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Sección de Descubrimiento Rápido */}
          <View style={styles.discoverySection}>
            <Typography
              variant="overline"
              weight="bold"
              color={theme.colors.textSecondary}
              style={styles.sectionOverline}
            >
              O DESCUBRE POR CATEGORÍA
            </Typography>

            <View style={styles.categoryChipsRow}>
              {SUGGESTED_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryChip}
                  onPress={() => navigation.navigate('Eventos' as any)}
                  activeOpacity={0.75}
                >
                  <Feather
                    name={cat.icon as any}
                    size={14}
                    color={theme.colors.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Typography variant="footnote" weight="600" color={theme.colors.text}>
                    {cat.label}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tarjetas Bento de Confianza y Garantía */}
          <View style={styles.bentoContainer}>
            <View style={styles.bentoItem}>
              <View style={styles.bentoIconWrapper}>
                <Feather name="shield" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.bentoTextGroup}>
                <Typography variant="footnote" weight="bold" color={theme.colors.text}>
                  Boletos 100% Oficiales
                </Typography>
                <Typography variant="caption" color={theme.colors.textSecondary}>
                  Entradas legítimas generadas con credencial QR dinámica anti-fraude.
                </Typography>
              </View>
            </View>

            <View style={styles.bentoItem}>
              <View style={styles.bentoIconWrapper}>
                <Feather name="clock" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.bentoTextGroup}>
                <Typography variant="footnote" weight="bold" color={theme.colors.text}>
                  Reserva Temporal Exclusiva
                </Typography>
                <Typography variant="caption" color={theme.colors.textSecondary}>
                  3 minutos para completar tu pago sin riesgo de que otra persona tome tus asientos.
                </Typography>
              </View>
            </View>

            <View style={styles.bentoItem}>
              <View style={styles.bentoIconWrapper}>
                <Feather name="lock" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.bentoTextGroup}>
                <Typography variant="footnote" weight="bold" color={theme.colors.text}>
                  Pago Protegido y Biométrico
                </Typography>
                <Typography variant="caption" color={theme.colors.textSecondary}>
                  Transacciones encriptadas y confirmación con Face ID o huella dactilar.
                </Typography>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── ESTADO 3: Checkout Activo con Reserva ─────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 14) }]}>
      <View style={styles.header}>
        <View>
          <Typography variant="display" color={theme.colors.text} style={styles.headerTitle}>
            Checkout
          </Typography>
          <Typography variant="footnote" color={theme.colors.textSecondary}>
            Finaliza tu compra para asegurar tus entradas
          </Typography>
        </View>

        <View style={styles.timerBadge}>
          <Feather name="clock" size={14} color={theme.colors.primary} />
          <Typography variant="footnote" weight="bold" color={theme.colors.primary}>
            {formatTime(timeLeft)}
          </Typography>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.checkoutContent} showsVerticalScrollIndicator={false}>
        {/* Resumen del Evento */}
        <View style={styles.previewCard}>
          {eventPreview.imageUrl && (
            <Image
              source={getSafeImageSource(eventPreview.imageUrl)}
              style={styles.previewImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.previewInfo}>
            <Typography variant="title" weight="bold" color={theme.colors.text} style={styles.previewTitle}>
              {eventPreview.title}
            </Typography>
            <Typography variant="footnote" weight="600" color={theme.colors.primary} style={styles.previewDate}>
              {eventPreview.date}
            </Typography>

            <View style={styles.previewRow}>
              <Typography variant="footnote" color={theme.colors.textSecondary}>
                Cantidad:
              </Typography>
              <Typography variant="footnote" weight="bold" color={theme.colors.text}>
                {eventPreview.quantity} boleto(s)
              </Typography>
            </View>

            <View style={styles.previewDivider} />

            <View style={styles.previewRow}>
              <Typography variant="body" weight="bold" color={theme.colors.text}>
                Total a pagar:
              </Typography>
              <Typography variant="title" weight="bold" color={theme.colors.primary}>
                {eventPreview.total === 0 ? 'GRATIS' : `$${eventPreview.total.toFixed(2)} MXN`}
              </Typography>
            </View>
          </View>
        </View>

        <PaymentMethodSelector
          methods={methods}
          selectedMethodId={selectedMethodId}
          onSelectMethod={setSelectedMethodId}
          isLoading={methodsLoading}
        />

        <View style={styles.reservationNotice}>
          <Feather name="shield" size={16} color={theme.colors.primary} style={{ marginRight: 8 }} />
          <Typography variant="caption" color={theme.colors.textSecondary} style={{ flex: 1 }}>
            Tus boletos están reservados durante {formatTime(timeLeft)} minutos. Tras este periodo, serán liberados al público.
          </Typography>
        </View>

        {isOffline && (
          <View style={styles.offlineBanner}>
            <Typography variant="caption" weight="bold" color={theme.colors.error}>
              ¡Perdiste la conexión! Tu lugar sigue reservado. Conéctate antes de que termine el tiempo.
            </Typography>
          </View>
        )}
      </ScrollView>

      {/* Barra de acción inferior flotante por encima del tab bar */}
      <View style={[styles.bottomBar, { paddingBottom: 100 }]}>
        <Button
          title={loading ? 'Procesando...' : `Confirmar Pago • $${eventPreview.total.toFixed(2)}`}
          onPress={handlePayment}
          loading={loading}
          size="large"
        />
      </View>
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
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.l,
      paddingTop: theme.spacing.m,
      paddingBottom: theme.spacing.s,
    },
    headerTitle: {
      fontSize: 28,
      letterSpacing: -0.5,
      marginBottom: 2,
    },
    headerIconBadge: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.l,
      backgroundColor: theme.colors.primaryFaint,
      borderWidth: 1,
      borderColor: theme.colors.primaryGlow,
      alignItems: 'center',
      justifyContent: 'center',
    },
    timerBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.colors.primaryFaint,
      borderWidth: 1,
      borderColor: theme.colors.primaryGlow,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.full,
    },
    emptyScrollContent: {
      paddingHorizontal: theme.spacing.l,
      paddingBottom: 110, // Libre del dock flotante
    },
    emptyHeroCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.borderFaint,
      marginTop: theme.spacing.m,
      ...Platform.select({
        ios: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    emptyIconGlowOuter: {
      width: 86,
      height: 86,
      borderRadius: 43,
      backgroundColor: 'rgba(124, 92, 252, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.m,
    },
    emptyIconGlowInner: {
      width: 66,
      height: 66,
      borderRadius: 33,
      backgroundColor: 'rgba(124, 92, 252, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primaryGlow,
    },
    emptyTitle: {
      fontSize: 20,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyDescription: {
      lineHeight: 20,
      fontSize: 13.5,
      paddingHorizontal: theme.spacing.s,
      marginBottom: theme.spacing.l,
    },
    explorePrimaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 26,
      borderRadius: theme.borderRadius.full,
      ...theme.shadows.primary,
    },
    discoverySection: {
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.m,
    },
    sectionOverline: {
      fontSize: 10.5,
      letterSpacing: 1.2,
      marginBottom: 10,
      paddingHorizontal: 4,
    },
    categoryChipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderFaint,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: theme.borderRadius.full,
    },
    bentoContainer: {
      marginTop: theme.spacing.m,
      gap: 10,
    },
    bentoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.l,
      padding: theme.spacing.m,
      borderWidth: 1,
      borderColor: theme.colors.borderFaint,
      gap: 12,
    },
    bentoIconWrapper: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.colors.primaryFaint,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primaryGlow,
    },
    bentoTextGroup: {
      flex: 1,
      gap: 2,
    },
    checkoutContent: {
      padding: theme.spacing.l,
      paddingBottom: 40,
    },
    previewCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.l,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.borderFaint,
      marginBottom: theme.spacing.m,
    },
    previewImage: {
      width: '100%',
      height: 140,
    },
    previewInfo: {
      padding: theme.spacing.m,
    },
    previewTitle: {
      fontSize: 18,
      marginBottom: 4,
    },
    previewDate: {
      marginBottom: theme.spacing.m,
    },
    previewRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 4,
    },
    previewDivider: {
      height: 1,
      backgroundColor: theme.colors.borderFaint,
      marginVertical: theme.spacing.m,
    },
    reservationNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.m,
      borderRadius: theme.borderRadius.m,
      borderWidth: 1,
      borderColor: theme.colors.borderFaint,
      marginTop: theme.spacing.m,
    },
    offlineBanner: {
      marginTop: theme.spacing.m,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 1,
      borderColor: theme.colors.error,
      padding: theme.spacing.m,
      borderRadius: theme.borderRadius.m,
    },
    bottomBar: {
      paddingHorizontal: theme.spacing.l,
      paddingTop: theme.spacing.m,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderFaint,
    },
  });
