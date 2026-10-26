import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { AuthService } from '../services/AuthService';
import { NotificationService } from '../funciones/notificaciones';

let currentUser: any = null;
let currentToken: string | null = null;
const listeners = new Set<() => void>();

export const loadSession = async () => {
  try {
    const userStr = await AsyncStorage.getItem('user');
    let token = await SecureStore.getItemAsync('token');
    if (!token) {
      token = await SecureStore.getItemAsync('access_token');
    }
    if (userStr && token) {
      currentUser = JSON.parse(userStr);
      currentToken = token;
      await SecureStore.setItemAsync('token', token);
      await SecureStore.setItemAsync('access_token', token);
      listeners.forEach(l => l());
      
      // Sincronización en segundo plano con el backend
      refreshSession();
    }
  } catch (e) {
    console.error('Error loading session', e);
  }
};

export const refreshSession = async () => {
  if (!currentToken) return;
  try {
    const freshUser = await AuthService.getMe(currentToken);
    if (freshUser) {
      // Actualizamos solo los datos del usuario manteniendo el token
      currentUser = { ...currentUser, ...freshUser };
      await AsyncStorage.setItem('user', JSON.stringify(currentUser));
      listeners.forEach(l => l());
    }
  } catch (e: any) {
    if (e.response?.status === 401) {
      // Sesión expirada en el backend: limpiar credenciales locales de forma transparente
      console.warn('ℹ️ [AuthStore] Sesión previa expirada en el servidor (401). Restableciendo sesión...');
      await logout();
    } else {
      console.warn('⚠️ [AuthStore] Sincronización en segundo plano no disponible:', e.message || 'Sin conexión');
    }
  }
};

export const setCurrentUser = async (user: any, token?: string) => {
  currentUser = user;
  if (token) currentToken = token;
  
  try {
    if (user && currentToken) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await SecureStore.setItemAsync('token', currentToken);
      await SecureStore.setItemAsync('access_token', currentToken);
      
      // Registrar el token push al iniciar sesión
      NotificationService.setupPushToken(user.id);
    }
  } catch (e) {
    console.error('Error saving session', e);
  }
  
  listeners.forEach(l => l());
};

export const logout = async () => {
  currentUser = null;
  currentToken = null;
  try {
    await AsyncStorage.removeItem('user');
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('access_token');
    
    // Limpiar el token de notificaciones push local y remoto
    await NotificationService.clearPushToken();
  } catch (e) {}
  listeners.forEach(l => l());
};

export const getCurrentUser = () => currentUser;
export const getCurrentToken = () => currentToken;

export const subscribeAuth = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
