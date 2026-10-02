/**
 * Componente CategoryTabs — LaikaMobil
 * Barra horizontal de filtros por categoría.
 * Pill-style con indicador de selección destacado.
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Typography } from './Typography';
import { useAppTheme } from '../../styles/ThemeProvider';
import { useStyles } from '../../styles/useStyles';

interface CategoryTabItem {
  id: string;
  label: string;
  icon: string;
}

interface CategoryTabsProps {
  categories: CategoryTabItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedId,
  onSelect,
}) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
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
              style={[styles.tab, isSelected && styles.activeTab]}
              onPress={() => onSelect(cat.id)}
              activeOpacity={0.7}
            >
              <Typography
                variant="footnote"
                weight={isSelected ? '600' : '500'}
                color={isSelected ? theme.colors.background : theme.colors.textSecondary}
              >
                {cat.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.m,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.m,
    gap: theme.spacing.s,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.borderMedium, // faint border for unselected
  },
  activeTab: {
    backgroundColor: theme.colors.text,
    borderColor: theme.colors.text,
  },
});
