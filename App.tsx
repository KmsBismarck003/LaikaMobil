import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { EventsScreen } from './src/screens/EventsScreen';
import { EventDetailScreen } from './src/screens/EventDetailScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { CartScreen } from './src/screens/CartScreen';
import { SuccessScreen } from './src/screens/SuccessScreen';
import { MyTicketsScreen } from './src/screens/MyTicketsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { TicketPassScreen } from './src/screens/TicketPassScreen';
import { theme } from './src/styles/theme';
import { loadSession } from './src/store/AuthStore';
import { ThemeProvider, useAppTheme } from './src/styles/ThemeProvider';
import { PersonalInfoScreen } from './src/screens/PersonalInfoScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AccessibilityScreen } from './src/screens/AccessibilityScreen';
import { AccessibilityProvider } from './src/funciones/accesibilidad';
import { AchievementsScreen } from './src/screens/AchievementsScreen';
import { useNotifications } from './src/funciones/notificaciones';
import { AnimatedSplashScreen } from './src/screens/AnimatedSplashScreen';
import { Typography } from './src/components/ui/Typography';

export type EventPreviewData = {
  eventId: string;
  functionId?: string | number | null;
  title: string;
  date: string;
  time?: string;
  quantity: number;
  price: number;
  total: number;
  imageUrl?: string;
};

export type MainTabParamList = {
  Eventos: undefined;
  Carrito: undefined;
  MisBoletos: undefined;
  Perfil: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  EventDetail: { eventId: string; eventTitle: string };
  Login: { eventPreview?: EventPreviewData };
  Register: { eventPreview?: EventPreviewData };
  Cart: { user?: any; eventPreview?: EventPreviewData };
  Success: { userName: string; eventTitle: string; eventDate: string; quantity: number };
  Profile: undefined;
  TicketPass: { ticket: any };
  PersonalInfo: undefined;
  Settings: undefined;
  Accessibility: undefined;
  Achievements: undefined;
  HelpSupport: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const CustomBottomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const { theme, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const TAB_ITEMS: Record<string, { label: string; iconFocused: any; iconUnfocused: any }> = {
    Eventos: {
      label: 'Eventos',
      iconFocused: 'compass',
      iconUnfocused: 'compass-outline',
    },
    Carrito: {
      label: 'Carrito',
      iconFocused: 'cart',
      iconUnfocused: 'cart-outline',
    },
    MisBoletos: {
      label: 'Boletos',
      iconFocused: 'ticket',
      iconUnfocused: 'ticket-outline',
    },
    Perfil: {
      label: 'Perfil',
      iconFocused: 'person',
      iconUnfocused: 'person-outline',
    },
  };

  // Safe bottom offset to clear Android gesture bar & iOS home indicator
  const bottomOffset = Math.max(insets.bottom + 6, Platform.OS === 'ios' ? 24 : 14);

  return (
    <View style={[tabBarStyles.floatingWrapper, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View
        style={[
          tabBarStyles.barContainer,
          {
            backgroundColor: isDark ? '#101014' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const item = TAB_ITEMS[route.name] || {
            label: route.name,
            iconFocused: 'square',
            iconUnfocused: 'square-outline',
          };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Colores de icono y texto con alto contraste garantizado en light y dark
          const activeColor = isDark ? '#FFFFFF' : theme.colors.primary;
          const inactiveColor = isDark ? '#8E8E9E' : '#8E8E93';

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.75}
              style={tabBarStyles.tabButton}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={item.label}
            >
              {/* Cápsula del icono (resaltada solo en la pestaña activa) */}
              <View
                style={[
                  tabBarStyles.iconBox,
                  isFocused && {
                    backgroundColor: isDark
                      ? 'rgba(124, 92, 252, 0.28)'
                      : 'rgba(107, 75, 224, 0.14)',
                    borderWidth: 1,
                    borderColor: isDark
                      ? 'rgba(124, 92, 252, 0.45)'
                      : 'rgba(107, 75, 224, 0.28)',
                  },
                ]}
              >
                <Ionicons
                  name={isFocused ? item.iconFocused : item.iconUnfocused}
                  size={19}
                  color={isFocused ? activeColor : inactiveColor}
                />
              </View>

              {/* Etiqueta visible y de alto contraste siempre */}
              <Typography
                variant="footnote"
                weight={isFocused ? '700' : '500'}
                color={isFocused ? activeColor : inactiveColor}
                style={tabBarStyles.tabText}
                numberOfLines={1}
              >
                {item.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const tabBarStyles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 100,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconBox: {
    width: 44,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabText: {
    fontSize: 10.5,
    letterSpacing: 0.2,
    marginTop: 1,
  },
});

import { useAccessibility } from './src/funciones/accesibilidad/useAccessibility';

const MainTabs = () => {
  const { theme } = useAppTheme();
  const { reduceMotion } = useAccessibility();
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomBottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: reduceMotion ? 'none' : 'shift',
      }}
    >
      <Tab.Screen name="Eventos" component={EventsScreen} />
      <Tab.Screen
        name="Carrito"
        component={CartScreen as any}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen name="MisBoletos" component={MyTicketsScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen as any} />
    </Tab.Navigator>
  );
};

import { useNavigationContainerRef } from '@react-navigation/native';

const RootNavigator = () => {
  const { theme, isDark } = useAppTheme();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  
  // Inicializamos el interceptor de notificaciones para atrapar los "taps" 
  // e inyectarle el enrutador de React Navigation
  useNotifications(navigationRef);
  
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <NavigationContainer
        ref={navigationRef}
        theme={{
          ...(isDark ? DarkTheme : DefaultTheme),
          colors: {
            ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.surfaceElevated,
            text: theme.colors.text,
            border: theme.colors.borderFaint,
            notification: theme.colors.accent,
          },
        }}
      >
        <Stack.Navigator
          initialRouteName="MainTabs"
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.backgroundElevated,
            },
            headerTintColor: theme.colors.text,
            headerTitleStyle: {
              fontWeight: '700',
            },
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
            animation: 'fade_from_bottom',
          }}
        >
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false, animation: 'fade' }}
          />
          <Stack.Screen
            name="EventDetail"
            component={EventDetailScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              title: 'Iniciar Sesión',
              headerBackTitle: 'Atrás',
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              title: 'Regístrate',
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{
              title: 'Carrito de Compras',
              headerBackTitle: 'Eventos',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Success"
            component={SuccessScreen}
            options={{
              headerShown: false,
              gestureEnabled: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              title: 'Mi Perfil',
              headerBackTitle: 'Atrás',
            }}
          />
          <Stack.Screen
            name="TicketPass"
            component={TicketPassScreen}
            options={{
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="PersonalInfo"
            component={PersonalInfoScreen}
            options={{
              title: 'Información Personal',
              headerBackTitle: 'Perfil',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Ajustes',
              headerBackTitle: 'Perfil',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Accessibility"
            component={AccessibilityScreen}
            options={{
              title: 'Accesibilidad',
              headerBackTitle: 'Perfil',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Achievements"
            component={AchievementsScreen}
            options={{
              title: 'Mis Logros',
              headerBackTitle: 'Perfil',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="HelpSupport"
            component={require('./src/screens/HelpSupportScreen').HelpSupportScreen}
            options={{
              title: 'Ayuda y soporte',
              headerBackTitle: 'Perfil',
              animation: 'slide_from_right',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default function App() {
  const [isAppReady, setAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    loadSession().then(() => {
      // Damos un pequeño extra de tiempo si queremos asegurar carga de fuentes o UI
      setAppReady(true);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AccessibilityProvider>
          {isAppReady && <RootNavigator />}
          
          {showSplash && (
            <AnimatedSplashScreen 
              isAppReady={isAppReady} 
              onAnimationFinish={() => setShowSplash(false)} 
            />
          )}
        </AccessibilityProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
