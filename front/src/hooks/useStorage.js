import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Fallback em memória para celular no Expo Go
let memoryStorage = {};

export const useStorage = () => {
  const getItem = async (key) => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.log('Storage indisponível, usando memória');
      return memoryStorage[key] || null;
    }
  };

  const setItem = async (key, value) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (e) {
      console.log('Storage indisponível, salvando em memória');
      memoryStorage[key] = value;
    }
  };

  return { getItem, setItem };
};