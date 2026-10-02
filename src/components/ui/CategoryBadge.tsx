/**
 * Componente CategoryBadge — LaikaMobil
 * Badge de categoría para tarjetas y vistas de detalle.
 * Recibe la categoría y deriva color/icono del design system.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCategoryColor, getCategoryLabel } from '../../styles/designUtils';
import { useStyles } from '../../styles/useStyles';

interface CategoryBadgeProps {
  category?: string;
  size?: 'small' | 'medium';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'medium',
}) => {
  const styles = useStyles(createStyles);
  const color = getCategoryColor(category);
  const label = getCategoryLabel(category);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${color}22`,
          borderColor: `${color}55`,
          paddingHorizontal: size === 'small' ? 8 : 10,
          paddingVertical: size === 'small' ? 3 : 5,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text
        style={[
          styles.label,
          { color, fontSize: size === 'small' ? 9 : 10 },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
