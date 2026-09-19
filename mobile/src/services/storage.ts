import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@gym_bruhh_token';
const UNIT_KEY = '@gym_bruhh_unit';
const API_URL_KEY = '@gym_bruhh_api_url';
const USER_KEY = '@gym_bruhh_user';

export const StorageService = {
  // Token
  saveToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('Error saving token:', e);
    }
  },

  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.error('Error getting token:', e);
      return null;
    }
  },

  clearToken: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Error clearing token:', e);
    }
  },

  // Units (metric / imperial)
  saveUnit: async (unit: 'metric' | 'imperial'): Promise<void> => {
    try {
      await AsyncStorage.setItem(UNIT_KEY, unit);
    } catch (e) {
      console.error('Error saving unit:', e);
    }
  },

  getUnit: async (): Promise<'metric' | 'imperial'> => {
    try {
      const u = await AsyncStorage.getItem(UNIT_KEY);
      return (u === 'imperial' ? 'imperial' : 'metric');
    } catch (e) {
      return 'metric';
    }
  },

  // Custom API URL
  saveApiUrl: async (url: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(API_URL_KEY, url);
    } catch (e) {
      console.error('Error saving API URL:', e);
    }
  },

  getApiUrl: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(API_URL_KEY);
    } catch (e) {
      return null;
    }
  },

  clearApiUrl: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(API_URL_KEY);
    } catch (e) {
      console.error('Error clearing API URL:', e);
    }
  },

  // Clear all storage on logout
  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  },
};

export default StorageService;
