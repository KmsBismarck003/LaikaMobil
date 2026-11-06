/**
 * SyncStatusBadge — LaikaMobil
 * Clean Architecture - Capa 2: Componente UI Atómico y Presentacional
 *
 * Muestra el estado de sincronización bidireccional en tiempo real con la nube.
 * Rediseño minimalista sin cajas neón ni saturación.
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
    return ` ${hours}:${minutes}`;
  };

  let isClean = false;
  let badgeBg = theme.colors.surfaceElevated || 'rgba(255, 255, 255, 0.04)';
  let borderColor = theme.colors.borderFaint || 'rgba(255, 255, 255, 0.08)';
  let textColor = theme.colors.textSecondary;
  let iconElement = null;
  let labelText = '';

  switch (status) {
    case 'syncing':
      textColor = theme.colors.textSecondary;
      iconElement = <ActivityIndicator size={10} color={theme.colors.textSecondary} style={styles.spinner} />;
      labelText = 'Sincronizando...';
      break;

    case 'synced':
      isClean = true;
      textColor = theme.colors.textTertiary;
      iconElement = <View style={[styles.dot, { backgroundColor: theme.colors.success || '#30D158' }]} />;
      labelText = `Sincronizado${formatLastSync(lastSyncTimestamp)}`;
      break;

    case 'offline':
      textColor = theme.colors.warning;
      iconElement = <Feather name="cloud-off" size={11} color={theme.colors.warning} />;
      labelText = 'Modo local';
      break;

    case 'error':
      textColor = theme.colors.error;
      iconElement = <Feather name="alert-circle" size={11} color={theme.colors.error} />;
      labelText = 'Reintentar sync';
      break;
  }

  const isInteractive = (status === 'offline' || status === 'error') && Boolean(onPressRetry);

  const content = (
    <View
      style={[
        styles.container,
        isClean ? styles.cleanContainer : { backgroundColor: badgeBg, borderColor },
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
    alignSelf: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  cleanContainer: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 0,
  },
  iconContainer: {
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
