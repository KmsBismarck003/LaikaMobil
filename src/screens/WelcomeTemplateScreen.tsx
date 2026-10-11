import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// --- Componente de Estrella Resplandeciente ---
const GlowingStar = ({ top, left, size, delay, duration }: any) => {
  const [opacity] = useState(() => new Animated.Value(0.1));
  const [scale] = useState(() => new Animated.Value(0.8));

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
    
    // Iniciar con un delay para que no todas parpadeen al mismo tiempo
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
        shadowColor: '#4ea8de', // Resplandor azulado
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
  // Generar 50 estrellas aleatorias solo en el montaje inicial
  const stars = React.useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      top: Math.random() * height,
      left: Math.random() * width,
      size: Math.random() * 3 + 1, // Tamaño entre 1 y 4
      delay: Math.random() * 3000, // Delay hasta 3s
      duration: 1500 + Math.random() * 2000, // Duración del pulso 1.5s - 3.5s
    }));
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      {stars.map((s) => (
        <GlowingStar
          key={s.id}
          top={s.top}
          left={s.left}
          size={s.size}
          delay={s.delay}
          duration={s.duration}
        />
      ))}
    </View>
  );
};

export function WelcomeTemplateScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Fondo estelar */}
      <Starfield />

      <View style={styles.content}>
        {/* Sección central: Textos */}
        <View style={styles.header}>
          <Text style={styles.title}>Hello!</Text>
          <Text style={styles.subtitle}>
            Descubre los mejores eventos de Laika, conecta con la comunidad y vive experiencias únicas bajo las estrellas.
          </Text>
        </View>

        {/* Sección inferior: Botones y Redes */}
        <View style={styles.footer}>
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={[styles.button, styles.loginBtn]} activeOpacity={0.8}>
              <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.signupBtn]} activeOpacity={0.8}>
              <Text style={styles.signupBtnText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.socialText}>or via social media</Text>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialIconBtn} activeOpacity={0.8}>
              <Ionicons name="logo-google" size={20} color="#4ea8de" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.socialIconBtn} activeOpacity={0.8}>
              <Ionicons name="logo-apple" size={20} color="#4ea8de" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.socialIconBtn} activeOpacity={0.8}>
              <Ionicons name="logo-facebook" size={20} color="#4ea8de" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0c16', // Color de fondo espacial oscuro
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 56,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#a0a3b1',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  button: {
    flex: 1,
    height: 55,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  loginBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#4ea8de', // Azul brillante estilo neon
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  signupBtn: {
    backgroundColor: '#3b82f6', // Azul solido
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  signupBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  socialText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 20,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialIconBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
