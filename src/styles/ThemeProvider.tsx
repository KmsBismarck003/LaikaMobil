import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme, Appearance, ColorSchemeName } from 'react-native';
import { lightTheme, darkTheme, Theme } from './theme';

type ThemeType = 'light' | 'dark' | 'auto';

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
  const [themeType, setThemeType] = useState<ThemeType>('auto');
  
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
