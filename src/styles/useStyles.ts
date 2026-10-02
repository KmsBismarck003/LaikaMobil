import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useAppTheme } from './ThemeProvider';
import { Theme } from './theme';

export function useStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  createStyles: (theme: Theme) => T
) {
  const { theme } = useAppTheme();
  return useMemo(() => StyleSheet.create(createStyles(theme)), [theme]);
}
