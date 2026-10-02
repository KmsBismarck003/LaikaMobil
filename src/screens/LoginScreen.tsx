import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppTheme } from '../styles/ThemeProvider';
import { Button } from '../components/ui/Button';
import { AuthService } from '../services/AuthService';
import { setCurrentUser } from '../store/AuthStore';
import { useStyles } from '../styles/useStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const { width } = Dimensions.get('window');

export const LoginScreen: React.FC<Props> = ({ route, navigation }) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const { eventPreview } = route.params;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.formContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenido de vuelta</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar con tu compra</Text>
        </View>

        {errorMsg ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="rgba(255,255,255,0.3)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="rgba(255,255,255,0.3)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <Button
          title="Iniciar Sesión"
          size="large"
          loading={loading}
          disabled={!email || !password}
          onPress={handleLogin}
          style={{ marginBottom: theme.spacing.xl, height: 54 }}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => console.log('Ir a Registro')}>
            <Text style={styles.registerText}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
  },
  formContainer: {
    padding: theme.spacing.xl,
    width: width,
    maxWidth: 500,
    alignSelf: 'center',
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.header,
    fontSize: 28,
    marginBottom: theme.spacing.s,
    color: '#fff',
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.5)',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    marginBottom: theme.spacing.l,
  },
  errorText: {
    color: '#f87171',
    textAlign: 'center',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: theme.spacing.l,
  },
  label: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: theme.spacing.s,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    color: '#FFF',
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.xl,
  },
  forgotText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  registerText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  }
});
