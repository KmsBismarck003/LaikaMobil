/**
 * Componente AppHeader — LaikaMobil
 * Cabecera superior con logotipo oficial dinámico (LogoOsc para modo oscuro, LogoClaro para modo claro)
 * y botón de acceso / usuario con alto contraste en ambos temas.
 */

import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../styles/ThemeProvider';
import { useStyles } from '../../styles/useStyles';
import { Typography } from './Typography';
import { useAuth } from '../../hooks/useAuth';

interface AppHeaderProps {
  onLoginPress?: () => void;
  onProfilePress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onLoginPress,
  onProfilePress,
}) => {
  const { theme, isDark } = useAppTheme();
  const styles = useStyles(createStyles);
  const insets = useSafeAreaInsets();
  const user = useAuth();

  // Selección inteligente del logotipo según el tema activo
  const logoSource = isDark
    ? require('../../../assets/LogoOsc.png')
    : require('../../../assets/LogoClaro.png');

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      <View style={styles.contentRow}>
        {/* Logotipo oficial de LAIKA CLUB adaptado al tema */}
        <View style={styles.brandContainer}>
          <Image
            source={logoSource}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="LAIKA CLUB"
          />
        </View>

        {/* Acción de usuario / Iniciar sesión */}
        {user ? (
          <TouchableOpacity
            style={styles.userButton}
            onPress={onProfilePress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Ir a perfil"
          >
            <View style={styles.avatarCircle}>
              <Feather name="user" size={13} color={theme.colors.primary} />
            </View>
            <Typography
              variant="footnote"
              weight="bold"
              color={theme.colors.text}
              numberOfLines={1}
              style={styles.userNameText}
            >
              {user.firstName || 'Mi Cuenta'}
            </Typography>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.authButton,
              {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.18)',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              },
            ]}
            onPress={onLoginPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión"
          >
            <Feather
              name="user"
              size={13}
              color={isDark ? theme.colors.white : theme.colors.text}
            />
            <Typography
              variant="footnote"
              weight="bold"
              color={isDark ? theme.colors.white : theme.colors.text}
              style={styles.authButtonText}
            >
              Ingresa
            </Typography>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.m,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderFaint,
    },
    contentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 44,
    },
    brandContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoImage: {
      width: 125,
      height: 34,
    },
    authButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
    },
    authButtonText: {
      letterSpacing: 0.3,
      fontSize: 12,
    },
    userButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: theme.colors.primaryGlow,
      backgroundColor: theme.colors.primaryFaint,
      maxWidth: 150,
    },
    avatarCircle: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: 'rgba(124, 92, 252, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    userNameText: {
      maxWidth: 90,
      fontSize: 12,
    },
  });
