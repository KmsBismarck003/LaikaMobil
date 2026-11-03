/**
 * SyncStatusBadge — LaikaMobil
 * Clean Architecture - Capa 2: Componente UI Atómico y Presentacional
 *
 * Muestra el estado de sincronización bidireccional en tiempo real con la nube.
 * Cumple con el estándar de accesibilidad, tokens semánticos multitema (Dark/Light)
 * y cero emojis en la interfaz.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../styles/ThemeProvider';
import { SyncState } from '../../types/sync';

interface SyncStatusBadgeProps {
  status: SyncState;
  lastSyncTimestamp?: number | null;
  onPressRetry?: () => void;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  status,
  lastSyncTimestamp,
  onPressRetry,
}) => {
  const { theme } = useAppTheme();

  if (status === 'idle') return null;

  const formatLastSync = (ts: number | null | undefined): string => {
    if (!ts) return '';
    const date = new Date(ts);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return ` • ${hours}:${minutes}`;
  };

  let badgeBg = theme.colors.surface;
  let textColor = theme.colors.textSecondary;
  let iconElement = null;
  let labelText = '';

  switch (status) {
    case 'syncing':
      badgeBg = theme.colors.infoFaint;
      textColor = theme.colors.info;
      iconElement = <ActivityIndicator size={12} color={theme.colors.info} style={styles.spinner} />;
      labelText = 'Sincronizando con la nube...';
      break;

    case 'synced':
      badgeBg = theme.colors.successFaint;
      textColor = theme.colors.success;
      iconElement = <Feather name="check-circle" size={12} color={theme.colors.success} />;
      labelText = `Sincronizado${formatLastSync(lastSyncTimestamp)}`;
      break;

    case 'offline':
      badgeBg = theme.colors.warningFaint;
      textColor = theme.colors.warning;
      iconElement = <Feather name="cloud-off" size={12} color={theme.colors.warning} />;
      labelText = 'Modo local • Toca para sincronizar';
      break;

    case 'error':
      badgeBg = theme.colors.errorFaint;
      textColor = theme.colors.error;
      iconElement = <Feather name="alert-circle" size={12} color={theme.colors.error} />;
      labelText = 'Error de conexión • Reintentar';
      break;
  }

  const isInteractive = (status === 'offline' || status === 'error') && Boolean(onPressRetry);

  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: badgeBg,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.iconContainer}>{iconElement}</View>
      <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
        {labelText}
      </Text>
    </View>
  );

  if (isInteractive) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPressRetry}
        accessibilityRole="button"
        accessibilityLabel={labelText}
        style={styles.touchable}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.touchable}>{content}</View>;
};

const styles = StyleSheet.create({
  touchable: {
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 6,
  },
  spinner: {
    marginRight: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
