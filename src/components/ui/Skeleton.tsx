import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useAppTheme } from '../../styles/ThemeProvider';

interface SkeletonBlockProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Skeleton estilo shimmer plateado del web (LaikaClub).
 * En móvil se implementa como pulso de opacidad sobre bloques grises
 * adaptados al tema (claro/oscuro).
 */
export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  width = '100%',
  height = 14,
  borderRadius = 8,
  style,
}) => {
  const { theme, isDark } = useAppTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: isDark ? '#2C2C2E' : '#D1D1D6',
          opacity,
        },
        style,
      ]}
    />
  );
};

/** Tarjeta de evento skeleton (imagen + líneas de texto). */
export const SkeletonEventCard: React.FC = () => {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.eventCard, { backgroundColor: theme.colors.surface }]}>
      <SkeletonBlock height={150} borderRadius={0} />
      <View style={styles.eventCardBody}>
        <SkeletonBlock width="35%" height={11} style={{ marginBottom: 8 }} />
        <SkeletonBlock width="90%" height={18} style={{ marginBottom: 8 }} />
        <SkeletonBlock width="65%" height={13} style={{ marginBottom: 12 }} />
        <View style={styles.rowBetween}>
          <SkeletonBlock width="30%" height={12} />
          <SkeletonBlock width="22%" height={12} />
        </View>
      </View>
    </View>
  );
};

/** Hero skeleton (bloque grande redondeado + textos). */
export const SkeletonHero: React.FC = () => {
  return (
    <View style={styles.hero}>
      <SkeletonBlock height={400} borderRadius={24} />
    </View>
  );
};

/** Fila de boleto/cuenta skeleton (círculo + líneas). */
export const SkeletonRow: React.FC = () => {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.row, { backgroundColor: theme.colors.surface }]}>
      <SkeletonBlock width={44} height={44} borderRadius={22} />
      <View style={styles.rowText}>
        <SkeletonBlock width="55%" height={12} style={{ marginBottom: 8 }} />
        <SkeletonBlock width="35%" height={16} />
      </View>
    </View>
  );
};

/** Detalle de evento skeleton (hero + título + filas + botón). */
export const SkeletonDetail: React.FC = () => {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.detail, { backgroundColor: theme.colors.background }]}>
      <SkeletonBlock height={300} borderRadius={0} />
      <View style={styles.detailBody}>
        <SkeletonBlock width="40%" height={12} style={{ marginBottom: 10 }} />
        <SkeletonBlock width="85%" height={26} style={{ marginBottom: 10 }} />
        <SkeletonBlock width="60%" height={14} style={{ marginBottom: 20 }} />
        <SkeletonBlock width="100%" height={14} style={{ marginBottom: 8 }} />
        <SkeletonBlock width="100%" height={14} style={{ marginBottom: 8 }} />
        <SkeletonBlock width="70%" height={14} style={{ marginBottom: 24 }} />
        <SkeletonBlock width="100%" height={52} borderRadius={26} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  eventCardBody: {
    padding: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hero: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  rowText: {
    flex: 1,
  },
  detail: {
    flex: 1,
  },
  detailBody: {
    padding: 20,
  },
});
