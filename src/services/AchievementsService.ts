import axios from 'axios';
import { getCurrentToken } from '../store/AuthStore';

const PILGRIM_API_URL = process.env.EXPO_PUBLIC_PILGRIM_API_URL || 'http://localhost:8000/api';

const achievementsApi = axios.create({
  baseURL: PILGRIM_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

achievementsApi.interceptors.request.use((config) => {
  const token = getCurrentToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AchievementsService = {
  getAll: async () => {
    try {
      const response = await achievementsApi.get('/achievements');
      return response.data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  },
  getCoupons: async () => {
    try {
      const response = await achievementsApi.get('/achievements/coupons');
      return response.data;
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  }
};
