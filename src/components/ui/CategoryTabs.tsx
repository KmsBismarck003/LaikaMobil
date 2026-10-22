/**
 * Componente CategoryTabs — LaikaMobil
 * Barra horizontal de filtros por categoría tipo pills/chips.
 * Diseño optimizado con micro-interacciones y alto contraste.
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from './Typography';
import { useAppTheme } from '../../styles/ThemeProvider';
import { useStyles } from '../../styles/useStyles';

interface CategoryTabItem {
  id: string;
  label: string;
  icon?: string;
}

interface CategoryTabsProps {
  categories: CategoryTabItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  rightAction?: React.ReactNode;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedId,
  onSelect,
  rightAction,
}) => {
  const styles = useStyles(createStyles);
  const { theme, isDark } = useAppTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isSelected = cat.id === selectedId;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.tab,
                isSelected ? styles.activeTab : styles.inactiveTab,
              ]}
              onPress={() => onSelect(cat.id)}
              activeOpacity={0.75}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Filtrar por categoría ${cat.label}`}
            >
              <Typography
                variant="footnote"
                weight={isSelected ? '700' : '500'}
                color={isSelected ? theme.colors.white : theme.colors.textSecondary}
                style={styles.tabText}
              >
                {cat.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Acción o widget flotante a la derecha si existe */}
      {rightAction && <View style={styles.rightActionContainer}>{rightAction}</View>}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.m,
      gap: 8,
      alignItems: 'center',
    },
    tab: {
      paddingVertical: 8,
      paddingHorizontal: 18,
      borderRadius: theme.borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
    activeTab: {
      backgroundColor: '#1E1E24',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.28)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    inactiveTab: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    tabText: {
      letterSpacing: 0.3,
      fontSize: 12,
    },
    rightActionContainer: {
      paddingRight: theme.spacing.m,
      marginLeft: 'auto',
    },
  });
