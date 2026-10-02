import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../styles/ThemeProvider';

export const ThemeToggleButton: React.FC = () => {
  const { theme, themeType, setThemeType, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  
  // Animación de escala al tocar
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const toggleTheme = () => {
    // Si estamos en 'auto', pasamos al contrario del sistema.
    // Si ya estamos forzando uno, pasamos al otro.
    const newTheme = isDark ? 'light' : 'dark';
    setThemeType(newTheme);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  return (
    <View
      style={[
        styles.container,
        {
          bottom: Math.max(insets.bottom + 20, 90), // Respetar el tab bar y safe area
        },
      ]}
      pointerEvents="box-none"
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleTheme}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.borderFaint,
              shadowColor: theme.colors.black,
            },
          ]}
        >
          <Feather
            name={isDark ? 'sun' : 'moon'}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    zIndex: 9999, // Mantenerlo siempre arriba
    elevation: 9999,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
