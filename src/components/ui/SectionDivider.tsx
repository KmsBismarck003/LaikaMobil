/**
 * Componente SectionDivider — LaikaMobil
 * Separador de secciones con etiqueta opcional.
 * Reutilizable en pantallas de detalle y perfil.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '../../styles/ThemeProvider';
import { Typography } from './Typography';
import { useStyles } from '../../styles/useStyles';

interface SectionDividerProps {
  label?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({ label }) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  if (label) {
    return (
      <View style={styles.labeledContainer}>
        <View style={styles.line} />
        <Typography variant="overline" color={theme.colors.textTertiary} style={styles.label}>
          {label}
        </Typography>
        <View style={styles.line} />
      </View>
    );
  }

  return <View style={styles.plain} />;
};

const createStyles = (theme: any) => StyleSheet.create({
  labeledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.l,
    gap: theme.spacing.m,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.borderFaint,
  },
  label: {
    letterSpacing: 1.5,
  },
  plain: {
    height: 1,
    backgroundColor: theme.colors.borderFaint,
    marginVertical: theme.spacing.l,
  },
});
