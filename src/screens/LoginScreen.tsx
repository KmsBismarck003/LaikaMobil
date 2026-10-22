import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppTheme } from '../styles/ThemeProvider';
import { AuthService } from '../services/AuthService';
import { setCurrentUser } from '../store/AuthStore';
import { useStyles } from '../styles/useStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Svg, Path } from 'react-native-svg';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const { width } = Dimensions.get('window');

/**
 * Login móvil réplica exacta del Login web (LaikaClub):
 * tarjeta con título, labels con *, inputs gris perla,
 * recordar + olvido, botón negro, divisor social, Gmail,
 * pie de registro y panel de bienvenida.
 */
export const LoginScreen: React.FC<Props> = ({ route, navigation }) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { eventPreview } = route.params ?? {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
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

      // Validamos que exista un usuario y revisamos su rol (ej: user, usuario)
      if (data && data.user) {
        console.log('✅ Usuario logueado exitosamente:', data.user);
        setCurrentUser(data.user, data.access_token || data.token);

        const role = data.user.role?.toLowerCase() || 'usuario';

        if (role === 'usuario' || role === 'user') {
          if (eventPreview) {
            navigation.navigate('Cart', {
              user: data.user,
              eventPreview: eventPreview
            });
          } else if (navigation.canGoBack?.()) {
            // Solo regresa si hay historial (evita el warning GO_BACK
            // cuando el login se muestra incrustado en la tab Perfil).
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

  const goBack = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
    } else {
      (navigation as any).navigate('MainTabs', { screen: 'Eventos' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity
        style={[styles.backBtn, { top: Math.max(insets.top, 16) + 4 }]}
        onPress={goBack}
        accessibilityLabel="Volver"
      >
        <Feather name="chevron-left" size={28} color="#FFFFFF" />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 16) + 16 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta estilo login-card del web */}
        <View style={styles.card}>
          <View style={styles.accentBar} />

          <View style={styles.header}>
            <Text style={styles.title}>LAIKA CLUB</Text>
            <Text style={styles.subtitle}>INICIA SESIÓN EN TU CUENTA</Text>
          </View>

          {errorMsg ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL *</Text>
            <TextInput
              style={styles.input}
              placeholder="admin@laikaclub.com"
              placeholderTextColor="#8E8E93"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(t) => { setEmail(t); setErrorMsg(''); }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONTRASEÑA *</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor="#8E8E93"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(t) => { setPassword(t); setErrorMsg(''); }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color="#636366"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Feather name="check" size={13} color="#FFFFFF" />}
              </View>
              <Text style={styles.rememberText}>Recordarme</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => console.log('Ir a recuperar contraseña')}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={!email || !password || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginBtnText}>INICIAR SESIÓN</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O CONTINÚA CON</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.gmailBtn}
            onPress={() => setErrorMsg('El acceso con Gmail aún no está disponible en la app. Usa tu email y contraseña.')}
            activeOpacity={0.8}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </Svg>
            <Text style={styles.gmailText}>GMAIL</Text>
          </TouchableOpacity>

          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => console.log('Registro próximamente')}>
              <Text style={styles.registerText}>REGÍSTRATE AQUÍ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.xl,
  },
  backBtn: {
    position: 'absolute',
    left: 12,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  card: {
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: theme.spacing.l,
    width: width - theme.spacing.l * 2,
    maxWidth: 480,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#000000',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.l,
    marginTop: theme.spacing.s,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.5)',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    marginBottom: theme.spacing.m,
  },
  errorText: {
    color: '#f87171',
    textAlign: 'center',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: theme.spacing.m,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#E8E8ED',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: 10,
    padding: theme.spacing.m,
    color: '#1C1C1E',
    fontSize: 15,
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8ED',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: 10,
    paddingHorizontal: theme.spacing.m,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: theme.spacing.m,
    color: '#1C1C1E',
    fontSize: 15,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: theme.spacing.s,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#636366',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  rememberText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  forgotText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  loginBtn: {
    backgroundColor: '#000000',
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.s,
  },
  loginBtnDisabled: {
    opacity: 0.55,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.l,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  gmailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    height: 50,
  },
  gmailText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.text,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.l,
    paddingTop: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  registerText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  welcome: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  welcomeTitle: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 8,
  },
  welcomeText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
