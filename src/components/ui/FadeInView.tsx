import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';
import { useAccessibility } from '../../funciones/accesibilidad/useAccessibility';

interface FadeInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  slideUp?: boolean;
}

export const FadeInView: React.FC<FadeInViewProps> = ({ 
  children, 
  duration = 500, 
  delay = 0,
  style,
  slideUp = false 
}) => {
  const { reduceMotion } = useAccessibility();
  
  const fadeAnim = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translateYAnim = useRef(new Animated.Value(reduceMotion ? 0 : (slideUp ? 20 : 0))).current;

  useEffect(() => {
    if (reduceMotion) {
      fadeAnim.setValue(1);
      translateYAnim.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: duration,
        delay: delay,
        useNativeDriver: true,
      }),
      ...(slideUp ? [
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: duration,
          delay: delay,
          useNativeDriver: true,
        })
      ] : [])
    ]).start();
  }, [fadeAnim, translateYAnim, duration, delay, slideUp, reduceMotion]);

  return (
    <Animated.View                 
      style={[
        style,
        {
          opacity: fadeAnim, 
          transform: slideUp ? [{ translateY: translateYAnim }] : undefined
        }
      ]}
    >
      {children}
    </Animated.View>
  );
};
