import { pilgrimApi } from '../api/config';

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
      const response = await pilgrimApi.get(`/users/${userId}/payment-methods`);
      
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
      const response = await pilgrimApi.post('/payments/create-intent', paymentData);
      return response.data;
    } catch (error) {
      console.warn('Error creating payment intent');
      throw error;
    }
  },

  confirmPayment: async (paymentId: string) => {
    try {
      const response = await pilgrimApi.post(`/payments/${paymentId}/confirm`);
      return response.data;
    } catch (error) {
      console.warn('Error confirming payment');
      throw error;
    }
  }
};
