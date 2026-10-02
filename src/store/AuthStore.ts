import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

let currentUser: any = null;
let currentToken: string | null = null;
const listeners = new Set<() => void>();

export const loadSession = async () => {
  try {
    const userStr = await AsyncStorage.getItem('user');
    const token = await SecureStore.getItemAsync('token');
    if (userStr && token) {
      currentUser = JSON.parse(userStr);
      currentToken = token;
      listeners.forEach(l => l());
    }
  } catch (e) {
    console.error('Error loading session', e);
  }
};

export const setCurrentUser = async (user: any, token?: string) => {
  currentUser = user;
  if (token) currentToken = token;
  
  try {
    if (user && currentToken) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await SecureStore.setItemAsync('token', currentToken);
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
  } catch (e) {}
  listeners.forEach(l => l());
};

export const getCurrentUser = () => currentUser;
export const getCurrentToken = () => currentToken;

export const subscribeAuth = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
