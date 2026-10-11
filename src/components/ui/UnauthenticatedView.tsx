import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// --- Componente de Estrella Resplandeciente ---
const GlowingStar = ({ top, left, size, delay, duration }: any) => {
  const opacity = useRef(new Animated.Value(0.1)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.8,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1.2,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.1,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.8,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    setTimeout(() => pulse.start(), delay);
  }, [opacity, scale, delay, duration]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#ffffff',
        opacity,
        transform: [{ scale }],
        shadowColor: '#4ea8de',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: size * 2,
        elevation: 5,
      }}
    />
  );
};

// --- Generador del Fondo de Estrellas ---
const Starfield = () => {
  const stars = useRef(
    Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      top: Math.random() * height,
      left: Math.random() * width,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 3000,
      duration: 1500 + Math.random() * 2000,
    }))
  ).current;

  return (
    <View style={StyleSheet.absoluteFill}>
      {stars.map((s) => (
        <GlowingStar key={s.id} top={s.top} left={s.left} size={s.size} delay={s.delay} duration={s.duration} />
      ))}
    </View>
  );
};

// --- Ícono Flotante ---
const FloatingIcon = () => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [floatAnim]);

  return (
    <Animated.View style={{
      transform: [{
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -15]
        })
      }],
      shadowColor: '#4ea8de',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
      marginBottom: 40,
    }}>
       <Image 
         source={require('../../../assets/icon.png')} 
         style={{ width: 120, height: 120, borderRadius: 24 }} 
         resizeMode="contain" 
       />
    </Animated.View>
  )
}

interface UnauthenticatedViewProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export const UnauthenticatedView: React.FC<UnauthenticatedViewProps> = ({ 
  title = "Tu portal exclusivo", 
  subtitle = "Inicia sesión para desbloquear tu perfil y acceder a beneficios únicos.", 
  buttonText = "Acceder a mi cuenta" 
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#0b0c16', paddingTop: insets.top }}>
      <Starfield />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
        <FloatingIcon />

        <Text style={{ fontSize: 26, fontWeight: '800', color: '#ffffff', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 }}>
          {title}
        </Text>
        <Text style={{ fontSize: 14, color: '#a0a3b1', textAlign: 'center', lineHeight: 22, marginBottom: 50 }}>
          {subtitle}
        </Text>

        <TouchableOpacity 
          style={{
            width: '100%',
            height: 55,
            borderRadius: 28,
            backgroundColor: '#3b82f6',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#3b82f6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 5,
          }}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Login', { eventPreview: undefined as any })}
        >
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700', letterSpacing: 1 }}>
            {buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
