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
      const response = await userApi.get(`/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user from Java Microservice:', error);
      throw error;
    }
  },
  
  // Agregar aquí funciones de login, logout, registro según lo requiera el sistema.
};
