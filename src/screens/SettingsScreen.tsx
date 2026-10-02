import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../styles/ThemeProvider';
import { Typography } from '../components/ui/Typography';
import { useStyles } from '../styles/useStyles';
import { NotificationPreferencesView } from '../funciones/notificaciones';

export const SettingsScreen: React.FC = () => {
  const styles = useStyles(createStyles);
  const { theme, themeType, setThemeType } = useAppTheme();
  const insets = useSafeAreaInsets();

  const themes = [
    { id: 'light', label: 'Claro', icon: 'sun' },
    { id: 'dark', label: 'Oscuro', icon: 'moon' },
    { id: 'auto', label: 'Sistema', icon: 'smartphone' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Sección: Tema */}
        <View style={styles.section}>
          <Typography variant="overline" color={theme.colors.textSecondary} style={styles.sectionTitle}>
            APARIENCIA
          </Typography>
          <View style={styles.card}>
            {themes.map((t, index) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.row,
                  index !== themes.length - 1 && styles.rowDivider
                ]}
                onPress={() => setThemeType(t.id as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBox, { backgroundColor: themeType === t.id ? theme.colors.primaryFaint : theme.colors.surfaceHighlight }]}>
                  <Feather name={t.icon as any} size={18} color={themeType === t.id ? theme.colors.primary : theme.colors.textTertiary} />
                </View>
                <Typography variant="subheadline" color={theme.colors.text} style={{ flex: 1 }}>
                  {t.label}
                </Typography>
                {themeType === t.id && (
                  <Feather name="check" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sección: Permisos */}
        <View style={styles.section}>
          <Typography variant="overline" color={theme.colors.textSecondary} style={styles.sectionTitle}>
            PERMISOS Y PRIVACIDAD
          </Typography>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.row} 
              activeOpacity={0.7}
              onPress={() => Linking.openSettings()}
            >
              <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <Feather name="bell" size={18} color={theme.colors.textTertiary} />
              </View>
              <Typography variant="subheadline" color={theme.colors.text} style={{ flex: 1 }}>
                Notificaciones Push
              </Typography>
              <Feather name="chevron-right" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
            <View style={styles.rowDivider} />
            <TouchableOpacity style={styles.row} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <Feather name="map-pin" size={18} color={theme.colors.textTertiary} />
              </View>
              <Typography variant="subheadline" color={theme.colors.text} style={{ flex: 1 }}>
                Ubicación
              </Typography>
              <Feather name="chevron-right" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
            <View style={styles.rowDivider} />
            <TouchableOpacity style={styles.row} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <Feather name="camera" size={18} color={theme.colors.textTertiary} />
              </View>
              <Typography variant="subheadline" color={theme.colors.text} style={{ flex: 1 }}>
                Cámara (Escáner QR)
              </Typography>
              <Feather name="chevron-right" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
            <View style={styles.rowDivider} />
            <TouchableOpacity 
              style={styles.row} 
              activeOpacity={0.7}
              onPress={() => Linking.openURL('https://laikaclub.com/privacidad')}
            >
              <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <Feather name="shield" size={18} color={theme.colors.textTertiary} />
              </View>
              <Typography variant="subheadline" color={theme.colors.text} style={{ flex: 1 }}>
                Política de Privacidad
              </Typography>
              <Feather name="external-link" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección: Notificaciones (Nueva) */}
        <View style={styles.section}>
          <Typography variant="overline" color={theme.colors.textSecondary} style={styles.sectionTitle}>
            PREFERENCIAS DE NOTIFICACIONES
          </Typography>
          <NotificationPreferencesView />
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
  scrollContent: {
    paddingVertical: theme.spacing.l,
  },
  section: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.l,
  },
  sectionTitle: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: theme.spacing.m,
    marginLeft: theme.spacing.s,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
    gap: theme.spacing.m,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderFaint,
    marginLeft: 54,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
