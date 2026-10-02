import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppTheme } from '../styles/ThemeProvider';
import { Button } from '../components/ui/Button';
import { useStyles } from '../styles/useStyles';
import { NotificationService } from '../funciones/notificaciones';

type Props = NativeStackScreenProps<RootStackParamList, 'Success'>;

const { width } = Dimensions.get('window');

export const SuccessScreen: React.FC<Props> = ({ route, navigation }) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const { userName, eventTitle, eventDate, quantity } = route.params;

  useEffect(() => {
    // Programar el recordatorio del evento una vez confirmada la compra
    NotificationService.scheduleEventReminder(
      'success-' + Date.now(), // ID referencial temporal si no se tiene el eventId real en route.params
      eventTitle,
      eventDate
    );
  }, [eventTitle, eventDate]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.successIconContainer}>
          <View style={styles.successCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </View>

        <Text style={styles.title}>¡Lo tienes, {userName}!</Text>
        <Text style={styles.subtitle}>Acabas de asegurar tu lugar en una experiencia increíble. ¡No te vas a arrepentir!</Text>

        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketTitle}>Pase de Acceso Oficial</Text>
          </View>
          
          <View style={styles.ticketBody}>
            <Text style={styles.eventTitle}>{eventTitle}</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha del evento</Text>
              <Text style={styles.infoValue}>{eventDate}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Boletos adquiridos</Text>
              <Text style={styles.infoValue}>{quantity} {quantity === 1 ? 'Boleto' : 'Boletos'}</Text>
            </View>

            <View style={styles.divider} />
            
            <Text style={styles.message}>
              Eres oficialmente parte de algo único. Prepárate para vivir momentos especiales que recordarás por siempre. ¡Qué emoción!
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button 
          title="Ver Mis Boletos"
          variant="primary"
          size="large"
          onPress={() => navigation.reset({
            index: 0,
            routes: [{ 
              name: 'MainTabs', 
              params: { screen: 'MisBoletos' } 
            }],
          })}
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
    alignItems: 'center',
    paddingTop: 60,
  },
  successIconContainer: {
    marginBottom: theme.spacing.xl,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.successBackground,
    borderWidth: 2,
    borderColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: theme.colors.success,
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    ...theme.typography.header,
    fontSize: 28,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
  },
  ticketCard: {
    width: width - 40,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ticketHeader: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    alignItems: 'center',
  },
  ticketTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  ticketBody: {
    padding: theme.spacing.l,
  },
  eventTitle: {
    ...theme.typography.title,
    fontSize: 22,
    color: theme.colors.text,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.m,
  },
  infoLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.l,
  },
  message: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  bottomBar: {
    padding: theme.spacing.l,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderFaint,
    paddingBottom: 40,
  }
});
