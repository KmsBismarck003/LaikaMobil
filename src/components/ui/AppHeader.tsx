/**
 * Componente AppHeader — LaikaMobil
 * Cabecera superior con logotipo oficial de LAIKA CLUB y botón de acceso / usuario.
 * Diseño fiel al layout de cabecera con soporte para modo oscuro / claro y SafeAreaInsets.
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
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const insets = useSafeAreaInsets();
  const user = useAuth();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.contentRow}>
        {/* Logotipo oficial de LAIKA CLUB */}
        <View style={styles.brandContainer}>
          <Image
            source={require('../../../assets/logo.png')}
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
              <Feather name="user" size={14} color={theme.colors.primary} />
            </View>
            <Typography
              variant="footnote"
              weight="bold"
              color={theme.colors.white}
              numberOfLines={1}
              style={styles.userNameText}
            >
              {user.firstName || 'Mi Cuenta'}
            </Typography>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.authButton}
            onPress={onLoginPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión"
          >
            <Feather name="user" size={14} color={theme.colors.white} />
            <Typography
              variant="footnote"
              weight="bold"
              color={theme.colors.white}
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
      height: 48,
    },
    brandContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoImage: {
      width: 140,
      height: 32,
    },
    authButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.28)',
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },
    authButtonText: {
      letterSpacing: 0.3,
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
    },
  });
