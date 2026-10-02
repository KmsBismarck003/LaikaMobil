import React from 'react';
import { View, Text, Switch, StyleSheet, ActivityIndicator } from 'react-native';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import { useAppTheme } from '../../../styles/ThemeProvider';

export const NotificationPreferencesView = () => {
  const { preferences, loading, updatePreference } = useNotificationPreferences();
  const { theme, isDark } = useAppTheme();

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceElevated }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Preferencias de Notificaciones</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Elige qué tipo de notificaciones deseas recibir.
      </Text>

      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Compras y Boletos</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Alertas sobre tus compras, boletos y reembolsos. (Recomendado)
          </Text>
        </View>
        <Switch
          value={preferences.transactional}
          onValueChange={(val) => updatePreference('transactional', val)}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        />
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.borderFaint }]} />

      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Recordatorios de Eventos</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Avisos 24 horas antes de que comience tu evento.
          </Text>
        </View>
        <Switch
          value={preferences.reminders}
          onValueChange={(val) => updatePreference('reminders', val)}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        />
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.borderFaint }]} />

      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Nuevos Eventos y Recomendaciones</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Información sobre nuevos eventos, preventas y promociones.
          </Text>
        </View>
        <Switch
          value={preferences.discovery}
          onValueChange={(val) => updatePreference('discovery', val)}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    padding: 20,
    alignItems: 'center',
  },
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    width: '100%',
  },
});
