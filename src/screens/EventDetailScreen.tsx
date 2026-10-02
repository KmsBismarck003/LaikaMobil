/**
 * Pantalla EventDetailScreen — LaikaMobil
 * Vista de detalle de un evento: imagen hero, información, selección de boletos,
 * galería, funciones disponibles, descripción y reglas.
 *
 * Separación de responsabilidades:
 *  - EventDetailHeader (ui/): imagen hero + metadatos superpuestos
 *  - TicketSelectionPanel: selección de sección y cantidad
 *  - InteractiveVenueMap: mapa de asientos (cuando aplica)
 *  - AuthPromptModal: modal de inicio de sesión
 *  - Button (ui/): CTA de compra en barra inferior
 *  - SectionDivider (ui/): separadores de secciones
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { EventService } from '../services/EventService';
import { useAppTheme } from '../styles/ThemeProvider';
import { formatTime } from '../styles/designUtils';
import { Button } from '../components/ui/Button';
import { Typography } from '../components/ui/Typography';
import { SectionDivider } from '../components/ui/SectionDivider';
import { EventDetailHeader } from '../components/ui/EventDetailHeader';
import { InteractiveVenueMap } from '../components/InteractiveVenueMap';
import { AuthPromptModal } from '../components/AuthPromptModal';
import { TicketSelectionPanel } from '../components/TicketSelectionPanel';
import { useAuth } from '../hooks/useAuth';
import { useStyles } from '../styles/useStyles';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { OfflineStateView } from '../components/ui/OfflineStateView';

type Props = NativeStackScreenProps<RootStackParamList, 'EventDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const EventDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const { eventId } = route.params;
  const [event, setEvent] = useState<any>(null);
  const [busySeats, setBusySeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [selectedFunction, setSelectedFunction] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const user = useAuth();
  const { isOffline } = useNetworkStatus();

  const fetchDetail = async () => {
      try {
        setLoading(true);
        const [data, busy] = await Promise.all([
          EventService.getEventById(eventId),
          EventService.getBusySeats(eventId),
        ]);
        setEvent(data);
        setBusySeats(busy);
        if (data?.functions && data.functions.length > 0) {
          setSelectedFunction(data.functions[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar el evento');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDetail();
  }, [eventId]);

  const openMap = () => {
    const query = encodeURIComponent(event.location);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'No se puede abrir el mapa en este dispositivo.');
        }
      })
      .catch((err) => console.error('Error al abrir mapa:', err));
  };

  const handleBuyPress = () => {
    const price = selectedSection ? selectedSection.price : 0;
    const total = price * quantity;
    const functionId = selectedFunction ? selectedFunction.id : (event.functions && event.functions.length > 0 ? event.functions[0].id : null);

    const eventPreview = {
      eventId: event.id,
      functionId,
      title: event.title,
      date: selectedFunction ? selectedFunction.date : event.date,
      time: selectedFunction ? selectedFunction.time : event.event_time,
      quantity,
      price,
      total,
      imageUrl: event.imageUrl,
    };

    if (user) {
      navigation.navigate('Cart', { eventPreview });
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginPress = () => {
    setShowLoginModal(false);
    const price = selectedSection ? selectedSection.price : 0;
    const total = price * quantity;
    navigation.navigate('Login', {
      eventPreview: {
        eventId: event.id,
        functionId: selectedFunction ? selectedFunction.id : (event.functions && event.functions.length > 0 ? event.functions[0].id : null),
        title: event.title,
        date: selectedFunction ? selectedFunction.date : event.date,
        time: selectedFunction ? selectedFunction.time : event.event_time,
        quantity,
        price,
        total,
        imageUrl: event.imageUrl,
      },
    });
  };

  // ── Estados de carga y error ─────────────────────────────────────────────

  // 1. Si sabemos por el OS que no hay internet, corto circuito inmediato (sin loader)
  if (isOffline) {
    return (
      <View style={styles.mainContainer}>
        <OfflineStateView 
          onRetry={fetchDetail} 
          onBack={() => navigation.goBack()} 
        />
      </View>
    );
  }

  // 2. Cargando
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // 3. Errores
  if (error || !event) {
    // Si el error es de red (ej. Backend Apagado pero sí hay WiFi)
    const isServerDown = error?.toLowerCase().includes('network error') || error?.toLowerCase().includes('conectar');
    
    if (isServerDown) {
      return (
        <View style={styles.mainContainer}>
          <OfflineStateView 
            onRetry={fetchDetail} 
            onBack={() => navigation.goBack()} 
          />
        </View>
      );
    }

    // Otro tipo de errores (404, etc)
    return (
      <View style={styles.centerContainer}>
        <Typography variant="title" color={theme.colors.error} style={{ marginBottom: theme.spacing.s }}>
          Ocurrió un problema
        </Typography>
        <Typography variant="body" align="center">
          {error}
        </Typography>
        <Button title="Volver" onPress={() => navigation.goBack()} style={{ marginTop: 24 }} />
      </View>
    );
  }

  // ── Etiqueta del botón principal ─────────────────────────────────────────

  const buyButtonLabel =
    selectedSection?.price === 0
      ? 'Obtener Entrada Gratis'
      : event.useSeatingMap
      ? 'Seleccionar Asientos'
      : 'Comprar Boletos';

  const buyButtonVariant = selectedSection?.price === 0 ? 'success' : 'primary';

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero con imagen, metadatos y botón atrás */}
        <EventDetailHeader
          imageUrl={event.imageUrl}
          title={event.title}
          date={event.date}
          eventTime={event.event_time}
          location={event.location}
          category={event.category}
          onBack={() => navigation.goBack()}
          onMapPress={openMap}
        />

        {/* Cuerpo del contenido */}
        <View style={styles.body}>

          {/* Selector de boletos */}
          <TicketSelectionPanel
            sections={event.sections || []}
            selectedSection={selectedSection}
            onSelectSection={setSelectedSection}
            quantity={quantity}
            onQuantityChange={setQuantity}
            isSeatingMap={event.useSeatingMap}
            fallbackPrice={event.price || 0}
          />

          {/* Mapa de asientos interactivo */}
          {event.useSeatingMap && event.room?.layout_json?.components && (
            <>
              <SectionDivider label="MAPA DE ASIENTOS" />
              <InteractiveVenueMap
                mapData={event.room.layout_json.components}
                busySeats={busySeats}
                onSeatSelect={(id) => console.log('Asiento seleccionado:', id)}
              />
            </>
          )}

          {event.useSeatingMap && !event.room?.layout_json?.components && (
            <>
              <SectionDivider />
              <View style={styles.mapBanner}>
                <View style={styles.mapBannerIcon}>
                  <Typography style={{ fontSize: 22 }}>
                  </Typography>
                </View>
                <View style={{ flex: 1 }}>
                  <Typography variant="subheadline" color={theme.colors.primary}>
                    Mapa de Asientos
                  </Typography>
                  <Typography variant="footnote" color={theme.colors.textSecondary}>
                    Elige tu lugar exacto durante el proceso de compra.
                  </Typography>
                </View>
              </View>
            </>
          )}

          {/* Funciones disponibles */}
          {event.functions && event.functions.length > 0 && (
            <>
              <SectionDivider label="FUNCIONES" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.functionsRow}
              >
                {event.functions.map((func: any, index: number) => {
                  const isSelected = selectedFunction?.id === func.id;
                  return (
                    <TouchableOpacity 
                      key={index} 
                      style={[styles.functionCard, isSelected && styles.functionCardSelected]}
                      onPress={() => setSelectedFunction(func)}
                      activeOpacity={0.8}
                    >
                      <Typography variant="subheadline" color={isSelected ? theme.colors.primary : theme.colors.text} weight="700">
                        {func.date}
                      </Typography>
                      <Typography variant="footnote" color={isSelected ? theme.colors.primary : theme.colors.textSecondary}>
                        {func.time ? formatTime(func.time) : ''}
                      </Typography>
                      {func.room_name && (
                        <View style={styles.functionRoomBadge}>
                          <Typography variant="overline" color={theme.colors.primary}>
                            {func.room_name}
                          </Typography>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          {/* Descripción */}
          {event.description && (
            <>
              <SectionDivider label="DESCRIPCIÓN" />
              <Typography variant="body" style={styles.description}>
                {event.description}
              </Typography>
            </>
          )}

          {/* Galería */}
          {event.galleryUrls && event.galleryUrls.length > 0 && (
            <>
              <SectionDivider label="GALERÍA" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryRow}
              >
                {event.galleryUrls.map((url: string, index: number) => (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    style={styles.galleryThumb}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </>
          )}

          {/* Reglas y políticas */}
          {event.rules && event.rules.length > 0 && (
            <>
              <SectionDivider label="REGLAS Y POLÍTICAS" />
              {event.rules.map((rule: any, index: number) => (
                <View key={index} style={styles.ruleItem}>
                  <View style={styles.ruleBullet} />
                  <View style={{ flex: 1 }}>
                    <Typography variant="subheadline" color={theme.colors.text} style={styles.ruleTitle}>
                      {rule.title}
                    </Typography>
                    <Typography variant="body" style={styles.ruleDesc}>
                      {rule.description}
                    </Typography>
                  </View>
                </View>
              ))}
            </>
          )}

        </View>
      </ScrollView>

      {/* Barra de acción inferior */}
      <View style={styles.bottomBar}>
        <Button
          title={buyButtonLabel}
          variant={buyButtonVariant}
          size="large"
          disabled={!selectedSection}
          onPress={handleBuyPress}
          style={styles.buyButton}
        />
      </View>

      {/* Modal de autenticación */}
      <AuthPromptModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginPress={handleLoginPress}
        onRegisterPress={() => {
          setShowLoginModal(false);
          console.log('Ir a crear cuenta');
        }}
      />
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  body: {
    padding: theme.spacing.l,
    gap: 0,
  },
  mapBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryFaint,
    borderWidth: 1,
    borderColor: theme.colors.primaryGlow,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    gap: theme.spacing.m,
  },
  mapBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.m,
    backgroundColor: theme.colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  functionsRow: {
    gap: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
  },
  functionCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    minWidth: 130,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
    gap: theme.spacing.xxs + 2,
  },
  functionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(124, 92, 252, 0.1)',
  },
  functionRoomBadge: {
    marginTop: theme.spacing.xs,
    backgroundColor: theme.colors.primaryFaint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.primaryGlow,
  },
  description: {
    lineHeight: 24,
    color: theme.colors.textSecondary,
  },
  galleryRow: {
    gap: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
  },
  galleryThumb: {
    width: 200,
    height: 140,
    borderRadius: theme.borderRadius.l,
    backgroundColor: theme.colors.surface,
  },
  ruleItem: {
    flexDirection: 'row',
    gap: theme.spacing.m,
    marginBottom: theme.spacing.m,
    alignItems: 'flex-start',
  },
  ruleBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 7,
  },
  ruleTitle: {
    marginBottom: theme.spacing.xxs,
    fontSize: 15,
  },
  ruleDesc: {
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.l,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderFaint,
  },
  buyButton: {
    borderRadius: theme.borderRadius.xl,
  },
});
