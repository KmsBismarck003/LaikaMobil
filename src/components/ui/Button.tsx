/**
 * Componente Button — LaikaMobil
 * Botón reutilizable con soporte para múltiples variantes, tamaños,
 * estado de carga y estado deshabilitado.
 * Los estilos siguen el sistema de diseño centralizado.
 */

import React from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
  Animated,
  Pressable,
} from 'react-native';
import { useAppTheme } from '../../styles/ThemeProvider';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  /** Ícono opcional (elemento React) mostrado a la izquierda del texto */
  leftIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  style,
  disabled,
  leftIcon,
  onPress,
  ...props
}) => {
  const { theme } = useAppTheme();
  
  // Animación de escala
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  const getBackgroundColor = (): string => {
    if (disabled || loading) {
      return variant === 'outline' || variant === 'ghost'
        ? theme.colors.transparent
        : theme.colors.surfaceHighlight;
    }
    switch (variant) {
      case 'primary':   return theme.colors.primary;
      case 'secondary': return theme.colors.surfaceElevated;
      case 'outline':   return theme.colors.transparent;
      case 'ghost':     return theme.colors.primaryFaint;
      case 'success':   return theme.colors.successDark;
      case 'danger':    return theme.colors.errorFaint;
      default:          return theme.colors.primary;
    }
  };

  const getTextColor = (): string => {
    if (disabled || loading) return theme.colors.textTertiary;
    switch (variant) {
      case 'outline':   return theme.colors.text;
      case 'ghost':     return theme.colors.primary;
      case 'success':   return theme.colors.success;
      case 'danger':    return theme.colors.error;
      case 'secondary': return theme.colors.textSecondary;
      default:          return theme.colors.white;
    }
  };

  const getBorderStyle = () => {
    switch (variant) {
      case 'outline': return { borderWidth: 1, borderColor: theme.colors.borderMedium };
      case 'ghost':   return { borderWidth: 1, borderColor: theme.colors.primary };
      default:        return {};
    }
  };

  const getShadowStyle = () => {
    if (disabled || loading || variant !== 'primary') return {};
    return theme.shadows.primary;
  };

  const getPaddingStyle = () => {
    switch (size) {
      case 'small':  return { paddingVertical: theme.spacing.xs + 2, paddingHorizontal: theme.spacing.m };
      case 'large':  return { paddingVertical: theme.spacing.ml, paddingHorizontal: theme.spacing.xl };
      default:       return { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.l };
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'small': return 13;
      case 'large': return 17;
      default:      return 15;
    }
  };

  const buttonStyle = [
    styles.button,
    { backgroundColor: getBackgroundColor(), borderRadius: theme.borderRadius.full },
    getBorderStyle(),
    getPaddingStyle(),
    getShadowStyle(),
    style,
    { transform: [{ scale: scaleAnim }] }
  ];

  return (
    <Animated.View style={buttonStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled || loading}
        style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} size="small" />
        ) : (
          <View style={styles.inner}>
            {leftIcon && <View style={[styles.iconWrapper, { marginRight: theme.spacing.xs + 2 }]}>{leftIcon}</View>}
            <Text style={[styles.text, { color: getTextColor(), fontSize: getFontSize() }]}>
              {title}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconWrapper: {
    // Margin set dynamically
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
