import axios from 'axios';

const PILGRIM_API_URL = process.env.EXPO_PUBLIC_PILGRIM_API_URL || 'http://localhost:8000/api';

const paymentApi = axios.create({
  baseURL: PILGRIM_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: string;
  expYear: string;
}

export const PaymentService = {
  /**
   * Obtiene los métodos de pago guardados del usuario actual.
   * Por ahora retorna un listado base estructurado que podrá ser reemplazado
   * cuando el backend soporte GET /users/payment-methods.
   */
  getSavedMethods: async (userId?: string): Promise<PaymentMethod[]> => {
    try {
      // return await paymentApi.get(`/users/${userId}/payment-methods`);
      return Promise.resolve([
        { id: 'pm_1', brand: 'Visa', last4: '4242', expMonth: '12', expYear: '2028' },
        { id: 'pm_2', brand: 'MasterCard', last4: '5555', expMonth: '05', expYear: '2026' }
      ]);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  /**
   * Crea la intención de pago
   */
  createIntent: async (paymentData: any) => {
    try {
      // return await paymentApi.post('/payments/create-intent', paymentData);
      return Promise.resolve({ data: { clientSecret: 'cs_test_123', paymentId: 'pi_test_123' } });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  /**
   * Confirma el pago
   */
  confirmPayment: async (paymentId: string) => {
    try {
      // return await paymentApi.post(`/payments/${paymentId}/confirm`);
      return Promise.resolve({ data: { status: 'succeeded' } });
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }
};
