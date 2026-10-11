import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, Animated, Easing, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppTheme } from '../styles/ThemeProvider';
import { AuthService } from '../services/AuthService';
import { setCurrentUser } from '../store/AuthStore';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

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

export const RegisterScreen: React.FC<Props> = ({ route, navigation }) => {
  const { eventPreview } = route.params || {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Por favor, ingresa un correo electrónico válido.');
      return false;
    }
    if (password.length < 8) {
      setErrorMsg('La contraseña debe tener al menos 8 caracteres.');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await AuthService.register({
        email: email.trim().toLowerCase(),
        password: password
      });
      
      if (data && data.user) {
        setCurrentUser(data.user, data.access_token || data.token);
        const role = data.user.role?.toLowerCase() || 'usuario';
        
        if (role === 'usuario' || role === 'user') {
          if (eventPreview) {
            navigation.navigate('Cart', { user: data.user, eventPreview });
          } else {
            navigation.navigate('MainTabs' as any);
          }
        } else {
          setErrorMsg('No tienes los permisos correctos en esta cuenta.');
        }
      } else {
        setErrorMsg('Respuesta inesperada del servidor.');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Hubo un error creando la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Starfield />

      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>Únete al club y vive la experiencia</Text>
          </View>

          {errorMsg ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="rgba(255,255,255,0.4)"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Confirmar Contraseña"
              placeholderTextColor="rgba(255,255,255,0.4)"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity 
            style={[styles.registerBtn, (!email || !password || !confirmPassword || loading) && { opacity: 0.7 }]} 
            onPress={handleRegister}
            disabled={!email || !password || !confirmPassword || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerBtnText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <View style={styles.loginRow}>
              <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.loginText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0c16',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
    width: width,
    maxWidth: 500,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 50,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#a0a3b1',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(78, 168, 222, 0.3)',
    borderRadius: 28,
    paddingHorizontal: 20,
    height: 55,
    color: '#FFF',
    fontSize: 16,
  },
  registerBtn: {
    height: 55,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  registerBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#a0a3b1',
    fontSize: 14,
  },
  loginText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: 'bold',
  }
});
