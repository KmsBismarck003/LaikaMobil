import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useAppTheme } from '../styles/ThemeProvider';
import { ProfileInfoSection } from '../components/ui/ProfileInfoSection';
import { Typography } from '../components/ui/Typography';
import { useStyles } from '../styles/useStyles';

export const PersonalInfoScreen: React.FC = () => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const user = useAuth();
  const insets = useSafeAreaInsets();

  if (!user) {
    return (
      <View style={[styles.container, styles.centeredContainer]}>
        <Typography variant="body" color={theme.colors.textSecondary}>
          No hay información disponible.
        </Typography>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ProfileInfoSection user={user} />
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
    paddingVertical: theme.spacing.xl,
  },
});
