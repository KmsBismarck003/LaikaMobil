/**
 * Componente Card — LaikaMobil
 * Contenedor superficie genérico con variantes de elevación.
 * Reutilizable en toda la app.
 */

import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useAppTheme } from '../../styles/ThemeProvider';
import { useStyles } from '../../styles/useStyles';

export type CardElevation = 'flat' | 'raised' | 'floating';

export interface CardProps extends ViewProps {
  padding?: 'none' | 'small' | 'medium' | 'large';
  elevation?: CardElevation;
  noBorder?: boolean;
}

export const Card: React.FC<CardProps> = ({
  padding = 'medium',
  elevation = 'raised',
  noBorder = false,
  style,
  children,
  ...props
}) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const getPaddingValue = (): number => {
    switch (padding) {
      case 'none':   return 0;
      case 'small':  return theme.spacing.sm;
      case 'large':  return theme.spacing.xl;
      case 'medium':
      default:       return theme.spacing.m;
    }
  };

  const getElevationStyle = () => {
    switch (elevation) {
      case 'flat':     return {};
      case 'floating': return theme.shadows.medium;
      case 'raised':
      default:         return theme.shadows.small;
    }
  };

  const getBackgroundColor = (): string => {
    switch (elevation) {
      case 'floating': return theme.colors.surfaceElevated;
      default:         return theme.colors.surface;
    }
  };

  return (
    <View
      style={[
        styles.card,
        { padding: getPaddingValue(), backgroundColor: getBackgroundColor() },
        getElevationStyle(),
        noBorder && { borderWidth: 0 },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
    overflow: 'hidden',
  },
});
