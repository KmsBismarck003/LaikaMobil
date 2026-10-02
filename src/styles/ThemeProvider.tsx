import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme, Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, Theme } from './theme';

type ThemeType = 'light' | 'dark' | 'auto';

const THEME_STORAGE_KEY = '@laika_theme_preference';

interface ThemeContextData {
  theme: Theme;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextData>({
  theme: darkTheme,
  themeType: 'auto',
  setThemeType: () => {},
  isDark: true,
});

export const useAppTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeType, setThemeTypeState] = useState<ThemeType>('auto');
  
  useEffect(() => {
    const loadThemePref = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto') {
          setThemeTypeState(savedTheme as ThemeType);
        }
      } catch (e) {
        console.error('Error loading theme preference', e);
      }
    };
    loadThemePref();
  }, []);

  const setThemeType = async (type: ThemeType) => {
    setThemeTypeState(type);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, type);
    } catch (e) {
      console.error('Error saving theme preference', e);
    }
  };

  // Determinamos si es oscuro basado en la preferencia
  const isDark = themeType === 'auto' 
    ? systemColorScheme === 'dark'
    : themeType === 'dark';

  const currentTheme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, themeType, setThemeType, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
