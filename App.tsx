import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { EventsScreen } from './src/screens/EventsScreen';
import { EventDetailScreen } from './src/screens/EventDetailScreen';
import { LoginScreen } from './src/screens/LoginScreen';
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

export type EventPreviewData = {
  eventId: string;
  functionId?: string | number | null;
  title: string;
  date: string;
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

const TabIcon: React.FC<{ name: any; color: string; size: number; focused: boolean }> = ({
  name,
  color,
  size,
  focused,
}) => {
  const { theme } = useAppTheme();
  return (
    <View style={{ 
      alignItems: 'center', 
      justifyContent: 'center',
      width: 46,
      height: 32,
      borderRadius: 16,
      backgroundColor: focused ? theme.colors.primaryFaint : 'transparent',
    }}>
      <Ionicons 
        name={name} 
        size={23} 
        color={color} 
      />
    </View>
  );
};

import { useAccessibility } from './src/funciones/accesibilidad/useAccessibility';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from './src/hooks/useAuth';
import { Text } from 'react-native';

const TAB_ICONS: Record<string, { active: any; inactive: any }> = {
  Eventos: { active: 'compass', inactive: 'compass-outline' },
  Carrito: { active: 'cart', inactive: 'cart-outline' },
  MisBoletos: { active: 'ticket', inactive: 'ticket-outline' },
  Perfil: { active: 'person', inactive: 'person-outline' },
};

const TAB_LABELS: Record<string, string> = {
  Eventos: 'Eventos',
  Carrito: 'Carrito',
  MisBoletos: 'Boletos',
  Perfil: 'Perfil',
};

/**
 * Tab bar custom: base negra de borde a borde hasta el filo de la pantalla
 * (tapa la franja del sistema) + pastilla interior flotante.
 * Sin BlurView para evitar la doble capa.
 */
const CustomTabBar: React.FC<any> = ({ state, navigation }) => {
  const { theme, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const user = useAuth();
  const activeRoute = state.routes[state.index]?.name;

  // Sin sesión, la tab Perfil muestra el login incrustado a pantalla
  // completa: se oculta el navigator para no mostrarlo en la vista login.
  if (activeRoute === 'Perfil' && !user) {
    return null;
  }

  const activeColor = isDark ? theme.colors.primary : '#FFFFFF';
  const inactiveColor = isDark ? theme.colors.textSecondary : 'rgba(255,255,255,0.55)';

  return (
    <View
      style={{
        position: 'absolute',
        left: 4,
        right: 4,
        bottom: Math.max(insets.bottom, 10),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#0D0D0F',
          borderRadius: 22,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.12)',
          paddingVertical: 3,
          paddingHorizontal: 8,
        }}
      >
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const color = focused ? activeColor : inactiveColor;
          const icons = TAB_ICONS[route.name] ?? TAB_ICONS.Eventos;
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 2 }}
            >
              <View
                style={{
                  width: 52,
                  height: 34,
                  borderRadius: 17,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: focused ? theme.colors.primary : 'transparent',
                }}
              >
                <Ionicons name={focused ? icons.active : icons.inactive} size={21} color={focused ? '#FFFFFF' : color} />
              </View>
              <Text style={{ color, fontSize: 9, fontWeight: '600', marginTop: 1 }}>
                {TAB_LABELS[route.name] ?? route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const MainTabs = () => {
  const { theme, isDark } = useAppTheme();
  const { reduceMotion } = useAccessibility();
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: reduceMotion ? 'none' : 'shift',
      }}
    >
      <Tab.Screen
        name="Eventos"
        component={EventsScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name={focused ? 'compass' : 'compass-outline'} color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Carrito"
        component={CartScreen as any}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surfaceElevated },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name={focused ? 'cart' : 'cart-outline'} color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MisBoletos"
        component={MyTicketsScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Boletos',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name={focused ? 'ticket' : 'ticket-outline'} color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen as any}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} color={color} size={size} focused={focused} />
          ),
        }}
      />
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

  // Fondo de la ventana raíz en negro para que la zona del gesto del
  // sistema se funda con la tab bar negra (efecto edge-to-edge estilo Instagram).
  useEffect(() => {
    try {
      const ui = SystemUI as any;
      if (typeof ui?.setBackgroundColorAsync === 'function') {
        ui.setBackgroundColorAsync('#0D0D0F').catch(() => {});
        console.log('[SYSUI] root background set to black');
      } else {
        console.log('[SYSUI] setBackgroundColorAsync NOT available');
      }
    } catch {}
  }, []);

    
  return (
    <>
      <StatusBar style="light" />
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
            animation: 'fade',
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
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false,
              presentation: 'modal',
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{
              title: 'Carrito de Compras',
              headerBackTitle: 'Eventos',
              animation: 'fade',
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
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="PersonalInfo"
            component={PersonalInfoScreen}
            options={{
              title: 'Información Personal',
              headerBackTitle: 'Perfil',
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Ajustes',
              headerBackTitle: 'Perfil',
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="Accessibility"
            component={AccessibilityScreen}
            options={{
              title: 'Accesibilidad',
              headerBackTitle: 'Perfil',
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="Achievements"
            component={AchievementsScreen}
            options={{
              title: 'Mis Logros',
              headerBackTitle: 'Perfil',
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="HelpSupport"
            component={require('./src/screens/HelpSupportScreen').HelpSupportScreen}
            options={{
              title: 'Ayuda y soporte',
              headerBackTitle: 'Perfil',
              animation: 'fade',
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
