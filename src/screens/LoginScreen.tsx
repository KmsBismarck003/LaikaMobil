import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, Animated, Easing } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppTheme } from '../styles/ThemeProvider';
import { AuthService } from '../services/AuthService';
import { setCurrentUser } from '../store/AuthStore';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

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
    Array.from({ length: 50 }).map((_, i) => ({
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

export const LoginScreen: React.FC<Props> = ({ route, navigation }) => {
  const { theme } = useAppTheme();
  const { eventPreview } = route.params || {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Por favor, ingresa un correo electrónico válido.');
      return false;
    }
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await AuthService.login(email, password);
      
      if (data && data.user) {
        setCurrentUser(data.user, data.access_token || data.token);
        const role = data.user.role?.toLowerCase() || 'usuario';
        
        if (role === 'usuario' || role === 'user') {
          if (eventPreview) {
            navigation.navigate('Cart', { user: data.user, eventPreview });
          } else {
            navigation.goBack();
          }
        } else {
          setErrorMsg('Tu cuenta no tiene permisos para comprar boletos.');
        }
      } else {
        setErrorMsg('Respuesta inesperada del servidor.');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Correo o contraseña incorrectos.');
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
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Hello!</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar tu viaje espacial</Text>
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
              style={[styles.input, { paddingRight: 50 }]}
              placeholder="Password"
              placeholderTextColor="rgba(255,255,255,0.4)"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={{ position: 'absolute', right: 15, top: 15 }}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color="rgba(255,255,255,0.4)"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.loginBtn, (!email || !password || loading) && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={!email || !password || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
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

            <View style={styles.registerRow}>
              <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register', { eventPreview })}>
                <Text style={styles.registerText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: 30,
    width: width,
    maxWidth: 500,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 56,
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
    borderColor: 'rgba(78, 168, 222, 0.3)', // Borde sutil azul
    borderRadius: 28,
    paddingHorizontal: 20,
    height: 55,
    color: '#FFF',
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginRight: 10,
  },
  forgotText: {
    color: '#4ea8de',
    fontSize: 12,
    fontWeight: '500',
  },
  loginBtn: {
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
  loginBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
  },
  socialText: {
    color: '#4ea8de',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 20,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 40,
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
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#a0a3b1',
    fontSize: 14,
  },
  registerText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: 'bold',
  }
});
