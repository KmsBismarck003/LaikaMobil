import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { AuthService } from '../services/AuthService';
import { NotificationService } from '../funciones/notificaciones';
import { tokenService } from '../services/security/TokenService';

let currentUser: any = null;
let currentToken: string | null = null;
const listeners = new Set<() => void>();

export const loadSession = async () => {
  try {
    const userStr = await AsyncStorage.getItem('user');
    let token: string | null = null;

    try {
      token = await SecureStore.getItemAsync('token');
      if (!token) {
        token = await SecureStore.getItemAsync('access_token');
      }
    } catch {
      // SecureStore temporalmente inaccesible
    }

    if (!token) {
      token = await AsyncStorage.getItem('@laika_auth_token');
    }

    if (userStr && token) {
      currentUser = JSON.parse(userStr);
      currentToken = token;

      // Sincronizar en ambos almacenamientos
      try {
        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('access_token', token);
      } catch {}
      await AsyncStorage.setItem('@laika_auth_token', token);
      await tokenService.setAccessToken(token);

      listeners.forEach(l => l());

      // Sincronización transparente en segundo plano
      refreshSession();
    }
  } catch (e) {
    console.warn('[AuthStore] Error cargando sesión local:', e);
  }
};

export const refreshSession = async () => {
  if (!currentToken) return;
  try {
    const freshUser = await AuthService.getMe(currentToken);
    if (freshUser) {
      currentUser = { ...currentUser, ...freshUser };
      await AsyncStorage.setItem('user', JSON.stringify(currentUser));
      listeners.forEach(l => l());
    }
  } catch (e: any) {
    if (e.response?.status === 401) {
      // Intentar auto-renovación silenciosa con el endpoint oficial /auth/refresh
      try {
        const refreshedToken = await AuthService.refreshToken(currentToken);
        if (refreshedToken) {
          currentToken = refreshedToken;
          try {
            await SecureStore.setItemAsync('token', refreshedToken);
            await SecureStore.setItemAsync('access_token', refreshedToken);
          } catch {}
          await AsyncStorage.setItem('@laika_auth_token', refreshedToken);
          await tokenService.setAccessToken(refreshedToken);

          const freshUser = await AuthService.getMe(refreshedToken);
          if (freshUser) {
            currentUser = { ...currentUser, ...freshUser };
            await AsyncStorage.setItem('user', JSON.stringify(currentUser));
            listeners.forEach(l => l());
          }
          return;
        }
      } catch {
        // Si no se puede renovar en background, NO desconectar al usuario;
        // mantener sesión activa en caché para que pueda seguir usando la app y comprando
        console.warn('ℹ️ [AuthStore] Sincronización en segundo plano pospuesta, manteniendo sesión local activa.');
      }
    } else {
      console.warn('⚠️ [AuthStore] Sincronización en segundo plano pospuesta:', e.message || 'Sin conexión');
    }
  }
};

export const setCurrentUser = async (user: any, token?: string) => {
  currentUser = user;
  if (token) currentToken = token;

  // Notificar de inmediato a los componentes reactivos
  listeners.forEach(l => l());

  try {
    if (user && currentToken) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('@laika_auth_token', currentToken);
      try {
        await SecureStore.setItemAsync('token', currentToken);
        await SecureStore.setItemAsync('access_token', currentToken);
      } catch {}
      await tokenService.setAccessToken(currentToken);

      // Registrar el token push al iniciar sesión
      NotificationService.setupPushToken(user.id);
    }
  } catch (e) {
    console.error('Error saving session', e);
  }
};

export const logout = async () => {
  currentUser = null;
  currentToken = null;
  listeners.forEach(l => l());

  try {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('@laika_auth_token');
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('access_token');
    } catch {}
    await tokenService.clearTokens();

    // Limpiar el token de notificaciones push local y remoto
    await NotificationService.clearPushToken();
  } catch (e) {}
};

export const getCurrentUser = () => currentUser;
export const getCurrentToken = () => currentToken;

export const subscribeAuth = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
