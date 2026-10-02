/**
 * Pantalla ProfileScreen — LaikaMobil
 * Perfil del usuario autenticado.
 *
 * Estados:
 *  - Sin sesión: call-to-action de inicio de sesión
 *  - Con sesión: hero del avatar, nombre/rol, información personal y botón de logout
 *
 * Sub-componentes usados:
 *  - ProfileInfoSection: datos personales del usuario
 *  - Button: acciones (logout, login)
 *  - Typography: textos tipográficos
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../store/AuthStore';
import { useAppTheme } from '../styles/ThemeProvider';
import { Button } from '../components/ui/Button';
import { ProfileInfoSection } from '../components/ui/ProfileInfoSection';
import { Typography } from '../components/ui/Typography';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useStyles } from '../styles/useStyles';
import { useAchievements } from '../hooks/useAchievements';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const user = useAuth();
  const insets = useSafeAreaInsets();
  const { totalPoints, tier, loading: achievementsLoading } = useAchievements();

  // ── Sin sesión ───────────────────────────────────────────────────────────

  if (!user) {
    return (
      <View style={[styles.container, styles.centeredContainer, { paddingTop: insets.top }]}>
        <View style={styles.emptyIllustration}>
          <View style={styles.emptyIconOuter}>
            <View style={styles.emptyIconInner}>
              <Feather name="user" size={38} color={theme.colors.textTertiary} />
            </View>
          </View>
        </View>

        <Typography variant="headline" color={theme.colors.text} align="center" style={styles.emptyTitle}>
          Inicia sesión para ver tu perfil
        </Typography>
        <Typography variant="body" color={theme.colors.textSecondary} align="center" style={styles.emptySubtitle}>
          Accede a tu cuenta para gestionar tus boletos, compras y preferencias.
        </Typography>

        <View style={styles.emptyActions}>
          <Button
            title="Iniciar Sesión"
            variant="primary"
            size="large"
            onPress={() => navigation.navigate('Login', { eventPreview: undefined as any })}
            style={styles.loginButton}
          />
        </View>
      </View>
    );
  }

  // ── Con sesión ───────────────────────────────────────────────────────────

  const initials = (() => {
    if (user.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user.name) return user.name.charAt(0).toUpperCase();
    return user.email.charAt(0).toUpperCase();
  })();

  const displayName = user.firstName || user.name || 'Usuario';
  const roleLabel = (user.role || 'usuario').toUpperCase();

  const handleLogout = () => {
    logout();
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Hero del perfil */}
        <View style={styles.profileHero}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Typography variant="display" color={theme.colors.white} style={styles.avatarText}>
                  {initials}
                </Typography>
              </View>
            </View>

            {/* Indicador de estado online */}
            <View style={styles.onlineIndicator} />
          </View>

          {/* Nombre y email */}
          <Typography variant="headline" color={theme.colors.text} align="center" style={styles.displayName}>
            {displayName}
          </Typography>
          <Typography variant="body" color={theme.colors.textSecondary} align="center" style={styles.email}>
            {user.email}
          </Typography>

          {!achievementsLoading && tier && (
            <View style={styles.rankBadgeContainer}>
              <Feather name={tier.icon as any} size={14} color={tier.color} />
              <Typography variant="footnote" color={tier.color} style={{ fontWeight: '600' }}>
                Rango {tier.label} • {totalPoints} pts
              </Typography>
            </View>
          )}

          {/* Badge de rol */}
          <View style={styles.roleBadge}>
            <Feather name="shield" size={11} color={theme.colors.primary} />
            <Typography variant="overline" color={theme.colors.primary} style={styles.roleText}>
              {roleLabel}
            </Typography>
          </View>
        </View>

        {/* Acciones de perfil */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.75}
            onPress={() => navigation.navigate('PersonalInfo')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: theme.colors.primaryFaint }]}>
              <Feather name="user" size={16} color={theme.colors.primary} />
            </View>
            <Typography variant="subheadline" color={theme.colors.text} style={{ flex: 1 }}>
              Información personal
            </Typography>
            <Feather name="chevron-right" size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Achievements')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: theme.colors.warningFaint }]}>
              <Feather name="award" size={16} color={theme.colors.warning} />
            </View>
            <Typography variant="subheadline" color={theme.colors.text} style={{ flex: 1 }}>
              Mis Logros
            </Typography>
            <Feather name="chevron-right" size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: theme.colors.infoFaint }]}>
              <Feather name="settings" size={16} color={theme.colors.info} />
            </View>
            <Typography variant="subheadline" color={theme.colors.text} style={{ flex: 1 }}>
              Ajustes
            </Typography>
            <Feather name="chevron-right" size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Accessibility')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: theme.colors.successFaint }]}>
              <Feather name="eye" size={16} color={theme.colors.success} />
            </View>
            <Typography variant="subheadline" color={theme.colors.text} style={{ flex: 1 }}>
              Accesibilidad y funciones
            </Typography>
            <Feather name="chevron-right" size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.75}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: theme.colors.warningFaint }]}>
              <Feather name="help-circle" size={16} color={theme.colors.warning} />
            </View>
            <Typography variant="subheadline" color={theme.colors.text} style={{ flex: 1 }}>
              Ayuda y soporte
            </Typography>
            <Feather name="chevron-right" size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Botón de cierre de sesión */}
        <View style={styles.logoutSection}>
          <Button
            title="Cerrar Sesión"
            variant="outline"
            size="medium"
            onPress={handleLogout}
            leftIcon={<Feather name="log-out" size={16} color={theme.colors.text} />}
            style={styles.logoutButton}
          />
        </View>

      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // ── Sin sesión ────────────────────────────────────────────────────────────
  emptyIllustration: {
    marginBottom: theme.spacing.xl,
  },
  emptyIconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: theme.colors.borderMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginBottom: theme.spacing.s,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  emptyActions: {
    width: '100%',
  },
  loginButton: {
    borderRadius: theme.borderRadius.xl,
  },

  // ── Con sesión ────────────────────────────────────────────────────────────
  profileHero: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.l,
    paddingHorizontal: theme.spacing.l,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.l,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.primary,
  },
  avatar: {
    flex: 1,
    borderRadius: 47,
    backgroundColor: theme.colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -1,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.success,
    borderWidth: 2.5,
    borderColor: theme.colors.background,
  },
  displayName: {
    letterSpacing: -0.4,
    marginBottom: theme.spacing.xxs + 2,
  },
  email: {
    fontSize: 14,
    marginBottom: theme.spacing.s,
  },
  rankBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: theme.spacing.m,
    backgroundColor: theme.colors.warningFaint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.primaryFaint,
    borderWidth: 1,
    borderColor: theme.colors.primaryGlow,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
  },
  roleText: {
    letterSpacing: 1.5,
    fontSize: 10,
  },

  // ── Sección acciones ──────────────────────────────────────────────────────
  actionsSection: {
    marginHorizontal: theme.spacing.l,
    marginVertical: theme.spacing.s,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
    gap: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderFaint,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Logout ────────────────────────────────────────────────────────────────
  logoutSection: {
    marginHorizontal: theme.spacing.l,
    marginTop: theme.spacing.l,
  },
  logoutButton: {
    borderRadius: theme.borderRadius.xl,
  },
});
