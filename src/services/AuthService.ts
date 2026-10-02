import axios from 'axios';

// Usamos el mismo patrón de variables de entorno de Expo
const PILGRIM_API_URL = process.env.EXPO_PUBLIC_PILGRIM_API_URL || 'http://localhost:8000/api';

const authApi = axios.create({
  baseURL: PILGRIM_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AuthService = {
  login: async (email: string, password: string) => {
    try {
      const response = await authApi.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      console.error('Error in login:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Error de credenciales');
    }
  },
  getMe: async (token: string) => {
    try {
      const response = await authApi.get('/auth/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error in getMe:', error.response?.data || error.message);
      throw error;
    }
  }
};
