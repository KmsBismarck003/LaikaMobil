import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  withDelay,
  runOnJS
} from 'react-native-reanimated';
import { useAppTheme } from '../styles/ThemeProvider';

interface Props {
  isAppReady: boolean;
  onAnimationFinish: () => void;
}

const { width, height } = Dimensions.get('screen');
const LOGO_SIZE = width * 0.45;

export const AnimatedSplashScreen: React.FC<Props> = ({ isAppReady, onAnimationFinish }) => {
  const { isDark } = useAppTheme();
  
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Fase 1: Pop in (Fade In + Scale up to normal)
    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withSpring(1, { damping: 12, stiffness: 90 });
  }, []);

  useEffect(() => {
    if (isAppReady) {
      // Fase 2: Netflix style zoom in and fade out container
      // Damos 1200ms para que el logo se aprecie antes de la transición de salida
      const exitDelay = 1200;

      scale.value = withDelay(
        exitDelay,
        withTiming(20, { duration: 800 }) // Zoom in dramático
      );
      
      opacity.value = withDelay(
        exitDelay + 200, // Empieza a desvanecer un poco después de que empieza el zoom
        withTiming(0, { duration: 500 }) 
      );

      containerOpacity.value = withDelay(
        exitDelay + 400, // Desvanece el fondo para revelar la app suavemente
        withTiming(0, { duration: 500 }, (finished) => {
          if (finished) {
            runOnJS(onAnimationFinish)();
          }
        })
      );
    }
  }, [isAppReady]);

  const rStyle = useAnimatedStyle(() => {
    return {
      // Usamos el centro matemático absoluto en lugar de flexbox para que el scale sea perfecto
      transform: [
        { translateX: -LOGO_SIZE / 2 },
        { translateY: -LOGO_SIZE / 2 },
        { scale: scale.value }
      ],
      opacity: opacity.value,
    };
  });

  const rContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: containerOpacity.value,
    };
  });

  // Usamos el icono grande para mejor resolución durante el zoom
  const logoSource = require('../../assets/icon.png');

  return (
    <Animated.View style={[styles.container, { backgroundColor: isDark ? '#050B14' : '#FFFFFF' }, rContainerStyle]}>
      <Animated.Image 
        source={logoSource} 
        style={[styles.logo, rStyle]} 
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 99999,
    elevation: 99999,
  },
  logo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  }
});
