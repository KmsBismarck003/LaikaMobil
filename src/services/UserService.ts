import { userApi } from '../api/config';

export interface UserProfile {
  id: string;
  username: string;
  role: string;
  email: string;
}

export const UserService = {
  getUserProfile: async (userId: string): Promise<UserProfile> => {
    try {
      const response = await userApi.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user from Java Microservice:', error);
      throw error;
    }
  },
  
  // Agregar aquí funciones de login, logout, registro según lo requiera el sistema.
  deleteAccount: async (userId: string, token: string): Promise<void> => {
    try {
      await userApi.delete(`/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error: any) {
      console.error('Error deleting user from Java Microservice:', error.response?.data || error.message);
      throw error;
    }
  },
};
