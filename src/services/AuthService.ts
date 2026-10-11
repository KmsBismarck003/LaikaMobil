import axios from 'axios';
import { PILGRIM_API_URL } from '../api/config';

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
      console.warn('Error in login');
      
      const detail = error.response?.data?.detail;
      let errorMessage = 'No cuentas con una cuenta registrada o verifica tus datos.';
      
      if (typeof detail === 'string') {
        const lowerDetail = detail.toLowerCase();
        if (lowerDetail.includes('not found') || lowerDetail.includes('no user') || lowerDetail.includes('does not exist')) {
          errorMessage = 'No existe una cuenta asociada a este correo. ¡Regístrate!';
        } else if (lowerDetail.includes('password') || lowerDetail.includes('credential') || lowerDetail.includes('incorrect')) {
          errorMessage = 'Contraseña incorrecta o verifica tus datos.';
        } else {
          errorMessage = detail;
        }
      }

      throw new Error(errorMessage);
    }
  },
  register: async (userData: { email: string; password: string }) => {
    try {
      const response = await authApi.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      console.warn('Error in register');
      throw new Error(error.response?.data?.detail || 'No se pudo crear la cuenta. Verifica tus datos.');
    }
  },
  getMe: async (token: string) => {
    try {
      const response = await authApi.get('/auth/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.warn('Error in getMe');
      throw error;
    }
  }
};
