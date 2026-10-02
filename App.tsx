import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Platform, StyleSheet } from 'react-native';
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
  size,
  focused,
}) => {
  const { theme } = useAppTheme();
  return (
    <View style={{ 
      alignItems: 'center', 
      justifyContent: 'center',
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: focused ? theme.colors.primaryFaint : 'transparent',
    }}>
      <Ionicons 
        name={name} 
        size={22} 
        color={focused ? theme.colors.primary : theme.colors.textTertiary} 
      />
    </View>
  );
};

import { useAccessibility } from './src/funciones/accesibilidad/useAccessibility';

const MainTabs = () => {
  const { theme, isDark } = useAppTheme();
  const { reduceMotion } = useAccessibility();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        animation: reduceMotion ? 'none' : 'shift',
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 32 : 16,
          left: 16,
          right: 16,
          borderRadius: 32,
          height: 64,
          backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
          borderTopWidth: 0,
          elevation: 0,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
        },
        tabBarBackground: () => (
          <BlurView
            tint={isDark ? 'dark' : 'light'}
            intensity={80}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarItemStyle: {
          paddingVertical: 0,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      <Tab.Screen
        name="Eventos"
        component={EventsScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ size, focused }) => (
            <TabIcon name={focused ? 'compass' : 'compass-outline'} color="ignored" size={size} focused={focused} />
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
          tabBarIcon: ({ size, focused }) => (
            <TabIcon name={focused ? 'cart' : 'cart-outline'} color="ignored" size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MisBoletos"
        component={MyTicketsScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ size, focused }) => (
            <TabIcon name={focused ? 'ticket' : 'ticket-outline'} color="ignored" size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen as any}
        options={{
          headerShown: false,
          tabBarIcon: ({ size, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} color="ignored" size={size} focused={focused} />
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
