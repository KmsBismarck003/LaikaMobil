import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppTheme } from '../styles/ThemeProvider';
import { Button } from '../components/ui/Button';
import { PaymentService, PaymentMethod } from '../services/PaymentService';
import { PaymentMethodSelector } from '../components/PaymentMethodSelector';
import { TicketService } from '../services/TicketService';
import { useAuth } from '../hooks/useAuth';
import { useStyles } from '../styles/useStyles';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export const CartScreen: React.FC<Props> = ({ route, navigation }) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const { eventPreview } = route.params || {};
  const user = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Payment State
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  
  // Nombre del usuario (priorizamos 'name' o fallamos a 'email')
  const userName = user?.name || user?.email?.split('@')[0] || 'Invitado';

  // --- FASE 2: MOTOR ANTI-FALLOS ---
  const { isOffline } = useNetworkStatus();
  const idempotencyKey = React.useRef(`idem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [timeLeft, setTimeLeft] = useState(3 * 60); // 3 minutos

  useEffect(() => {
    if (timeLeft <= 0) {
      Alert.alert('Tiempo Agotado', 'Tus lugares han sido liberados. Por favor, vuelve a intentar.');
      navigation.goBack();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, navigation]);

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
        console.error('Error cargando metodos de pago:', error);
      } finally {
        setMethodsLoading(false);
      }
    };
    
    fetchMethods();
  }, [user?.id]);

  const handlePayment = async () => {
    if (isOffline) {
      Alert.alert('Sin Conexión', 'Perdiste la conexión a internet. Tus lugares están reservados hasta que el contador llegue a cero. Conéctate para pagar.');
      return;
    }

    if (!selectedMethodId) {
      Alert.alert('Atención', 'Por favor selecciona un método de pago.');
      return;
    }

    try {
      setLoading(true);
      
      // Simulando flujo real de pasarela (Crear Intent -> Confirmar)
      const intentResponse = await PaymentService.createIntent({
        amount: eventPreview.total,
        currency: 'mxn',
        paymentMethodId: selectedMethodId
      });
      
      await PaymentService.confirmPayment(intentResponse.data.paymentId);
      
      // Construimos los items según el esquema esperado por el backend
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

      // REGISTRO REAL DEL BOLETO EN LA CUENTA DEL USUARIO
      if (!user) {
        throw new Error('Debes iniciar sesión para comprar.');
      }
      await TicketService.purchaseTicket(user.id, {
        items: purchaseItems,
        paymentMethod: selectedMethodId === 'new' ? 'card' : 'card',
        paymentId: intentResponse.data.paymentId || `pi_${Date.now()}`,
        idempotencyKey: idempotencyKey.current, // Evitamos doble cobro si se reconecta
        shippingInfo: null,
        shippingMethod: 'digital'
      });

      navigation.navigate('Success', {
        userName,
        eventTitle: eventPreview.title,
        eventDate: eventPreview.date,
        quantity: eventPreview.quantity
      });
    } catch (error: any) {
      console.error(error);
      const detail = error.response?.data?.detail || error.message;
      Alert.alert('Error', `Hubo un problema al procesar tu pago: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  if (!eventPreview) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Tu Carrito</Text>
        </View>
        <View style={[styles.emptyCartContainer, { flex: 1, margin: theme.spacing.xl }]}>
          <Text style={styles.emptyText}>Tu carrito está vacío</Text>
          <Text style={styles.emptySubText}>Explora los eventos y agrega boletos para comprarlos.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Carrito de {userName}</Text>
          <Text style={styles.subtitle}>Revisa tus boletos antes de pagar</Text>
        </View>

        {/* Resumen del Evento */}
        <View style={styles.previewCard}>
          {eventPreview.imageUrl && (
            <Image source={{ uri: eventPreview.imageUrl }} style={styles.previewImage} resizeMode="cover" />
          )}
          <View style={styles.previewInfo}>
            <Text style={styles.previewTitle}>{eventPreview.title}</Text>
            <Text style={styles.previewDate}>Fecha: {eventPreview.date}</Text>
            
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Cantidad:</Text>
              <Text style={styles.previewValue}>{eventPreview.quantity} boleto(s)</Text>
            </View>
            
            <View style={styles.previewDivider} />
            
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Total a pagar:</Text>
              <Text style={styles.previewTotal}>
                {eventPreview.total === 0 ? 'GRATIS' : `$${eventPreview.total.toFixed(2)} MXN`}
              </Text>
            </View>
          </View>
        </View>

        <PaymentMethodSelector 
          methods={methods}
          selectedMethodId={selectedMethodId}
          onSelectMethod={setSelectedMethodId}
          isLoading={methodsLoading}
        />

        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyText}>Tu reservación está asegurada</Text>
          <Text style={styles.emptySubText}>
            Tienes {formatTime(timeLeft)} minutos para completar el pago antes de que se liberen tus boletos.
          </Text>
        </View>

        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>
              ¡Perdiste la conexión! Tu lugar sigue reservado. Recupera tu red antes de que acabe el tiempo.
            </Text>
          </View>
        )}
        
      </ScrollView>
      
      <View style={styles.bottomBar}>
        <Button 
          title="Continuar al Pago"
          onPress={handlePayment}
          loading={loading}
          size="large"
        />
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.header,
    fontSize: 28,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyCartContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
    marginTop: theme.spacing.l,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.m,
  },
  emptyText: {
    ...theme.typography.title,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  emptySubText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 14,
  },
  bottomBar: {
    padding: theme.spacing.l,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderFaint,
    paddingBottom: 40,
  },
  offlineBanner: {
    marginTop: theme.spacing.m,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
  },
  offlineBannerText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  // Estilos de la vista previa del evento
  previewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  previewImage: {
    width: '100%',
    height: 140,
  },
  previewInfo: {
    padding: theme.spacing.m,
  },
  previewTitle: {
    ...theme.typography.title,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  previewDate: {
    color: theme.colors.primary,
    fontSize: 14,
    marginBottom: theme.spacing.m,
    fontWeight: '600',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  previewLabel: {
    color: theme.colors.textSecondary,
    fontSize: 15,
  },
  previewValue: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  previewDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.m,
  },
  previewTotal: {
    color: theme.colors.success,
    fontSize: 20,
    fontWeight: 'bold',
  }
});
