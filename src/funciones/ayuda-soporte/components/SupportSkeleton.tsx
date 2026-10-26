import React from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../../../styles/ThemeProvider';
import { useStyles } from '../../../styles/useStyles';
import { createSupportStyles } from '../../../styles/SupportService.styles';

export const SupportSkeleton: React.FC = () => {
  const styles = useStyles(createSupportStyles);
  const { theme } = useAppTheme();

  return (
    <View style={{ gap: theme.spacing.m, marginVertical: theme.spacing.m }}>
      {[1, 2, 3].map((key) => (
        <View key={key} style={styles.skeletonCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.m, marginBottom: theme.spacing.s }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.surfaceHighlight }} />
            <View style={[styles.skeletonLine, { width: '50%', marginBottom: 0 }]} />
          </View>
          <View style={[styles.skeletonLine, { width: '90%' }]} />
          <View style={[styles.skeletonLine, { width: '60%' }]} />
        </View>
      ))}
    </View>
  );
};
