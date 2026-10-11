import axios from 'axios';
import { getCurrentToken } from '../store/AuthStore';
import { PILGRIM_API_URL } from '../api/config';

const paymentApi = axios.create({
  baseURL: PILGRIM_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

paymentApi.interceptors.request.use((config) => {
  const token = getCurrentToken();
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
      
      if (response.data && response.data.length > 0) {
        return response.data;
      }
    } catch (error) {
      console.warn('Error fetching payment methods, cayendo a mocks locales para pruebas', error);
    }

    // Fallback de prueba para que la pasarela no se bloquee en desarrollo
    return [
      { id: 'pm_1', brand: 'Visa', last4: '4242', expMonth: '12', expYear: '2025' },
      { id: 'pm_2', brand: 'MasterCard', last4: '5555', expMonth: '10', expYear: '2024' }
    ];
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
