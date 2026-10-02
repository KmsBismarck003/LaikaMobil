import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../styles/ThemeProvider';
import { Button } from './Button';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../../App';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OfflineStateViewProps {
  onRetry?: () => void;
  onBack?: () => void;
  message?: string;
  showTicketsButton?: boolean;
}

const { width } = Dimensions.get('window');

export const OfflineStateView: React.FC<OfflineStateViewProps> = ({ 
  onRetry, 
  onBack,
  message = "Parece que perdimos la conexión al servidor. Revisa tu internet para seguir explorando.",
  showTicketsButton = true
}) => {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {onBack && (
        <TouchableOpacity 
          style={[styles.backBtn, { top: Math.max(insets.top, 20) }]} 
          onPress={onBack}
        >
          <Feather name="chevron-left" size={28} color={theme.colors.text} />
        </TouchableOpacity>
      )}

      <View style={styles.imageContainer}>
        {/* Usamos la imagen Sinconexion.png proporcionada en assets */}
        <Image 
          source={require('../../../assets/Sinconexion.png')} 
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          ¡Oops! Sin Conexión
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {message}
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        {showTicketsButton && (
          <Button 
            title="Ver Mis Boletos"
            variant="primary"
            size="large"
            onPress={() => navigation.navigate('MisBoletos')}
            style={styles.mainButton}
          />
        )}
        
        {onRetry && (
          <TouchableOpacity 
            style={[styles.retryButton, { borderColor: theme.colors.border }]} 
            onPress={onRetry}
            activeOpacity={0.7}
          >
            <Feather name="refresh-cw" size={16} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
            <Text style={[styles.retryText, { color: theme.colors.textSecondary }]}>
              Reintentar
            </Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(128,128,128,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  imageContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    // Hacemos que el fondo gris se vea como un círculo/burbuja intencional
    borderRadius: (width * 0.65) / 2,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  image: {
    width: width * 0.65,
    height: width * 0.65,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  mainButton: {
    width: '100%',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderRadius: 100,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  }
});
