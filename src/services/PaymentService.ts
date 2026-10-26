import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentToken } from '../store/AuthStore';
import { PILGRIM_API_URL } from '../api/config';

const paymentApi = axios.create({
  baseURL: PILGRIM_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
  },
});

paymentApi.interceptors.request.use(async (config) => {
  let token = getCurrentToken();
  if (!token) {
    try {
      token = await AsyncStorage.getItem('@laika_auth_token');
    } catch {}
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: string;
  expYear: string;
}

export const PaymentService = {
  getSavedMethods: async (userId?: string): Promise<PaymentMethod[]> => {
    try {
      if (!userId) return [];
      const response = await paymentApi.get(`/users/${userId}/payment-methods`);
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  createIntent: async (paymentData: any) => {
    try {
      const response = await paymentApi.post('/payments/create-intent', paymentData);
      return response.data;
    } catch (error) {
      console.warn('Error creating payment intent');
      throw error;
    }
  },

  confirmPayment: async (paymentId: string) => {
    try {
      const response = await paymentApi.post(`/payments/${paymentId}/confirm`);
      return response.data;
    } catch (error) {
      console.warn('Error confirming payment');
      throw error;
    }
  }
};
