import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../styles/ThemeProvider';
import { PaymentMethod } from '../services/PaymentService';
import { useStyles } from '../styles/useStyles';

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedMethodId: string | null;
  onSelectMethod: (id: string) => void;
  isLoading: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  methods,
  selectedMethodId,
  onSelectMethod,
  isLoading
}) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Método de Pago</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando métodos guardados...</Text>
        </View>
      ) : (
        <>
          {methods.map((method) => {
            const isSelected = selectedMethodId === method.id;
            return (
              <TouchableOpacity 
                key={method.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => onSelectMethod(method.id)}
                activeOpacity={0.8}
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>{method.brand.charAt(0)}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.name}>{method.brand} terminada en {method.last4}</Text>
                  <Text style={styles.sub}>Expiración: {method.expMonth}/{method.expYear.slice(-2)}</Text>
                </View>
                <View style={[styles.radio, isSelected && styles.radioSelected]} />
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity 
            style={[styles.card, selectedMethodId === 'new' && styles.cardSelected]}
            onPress={() => onSelectMethod('new')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Text style={styles.iconText}>+</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.name}>Agregar nueva tarjeta</Text>
              <Text style={styles.sub}>Crédito o débito</Text>
            </View>
            <View style={[styles.radio, selectedMethodId === 'new' && styles.radioSelected]} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    marginTop: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    fontSize: 20,
    color: '#FFF',
    marginBottom: theme.spacing.m,
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  loadingText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.m,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.s,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  iconContainer: {
    width: 40,
    height: 30,
    backgroundColor: '#1a365d',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.m,
  },
  iconText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  sub: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  radioSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
    borderWidth: 5,
  }
});
