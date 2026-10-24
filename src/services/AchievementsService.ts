import { pilgrimApi } from '../api/config';

export const AchievementsService = {
  getAll: async () => {
    try {
      const response = await pilgrimApi.get('/achievements');
      return response.data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  },
  getCoupons: async () => {
    try {
      const response = await pilgrimApi.get('/achievements/coupons');
      return response.data;
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  }
};
