import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Platform, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon: React.FC<{ name: string; color: string; size: number; focused: boolean }> = ({
  name,
  color,
  size,
  focused,
}) => {
  const { theme } = useAppTheme();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Feather name={name as any} size={size} color={color} />
      {focused && (
        <View
          style={{
            position: 'absolute',
            bottom: -6,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.colors.primary,
          }}
        />
      )}
    </View>
  );
};

const MainTabs = () => {
  const { theme, isDark } = useAppTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 32 : 16,
          left: 16,
          right: 16,
          borderRadius: 24,
          height: 64,
          backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)',
          borderTopWidth: 0,
          elevation: 0,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        },
        tabBarBackground: () => (
          <BlurView
            tint={isDark ? 'dark' : 'light'}
            intensity={90}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Eventos"
        component={EventsScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="compass" color={color} size={size} focused={focused} />
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
            <TabIcon name="shopping-bag" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MisBoletos"
        component={MyTicketsScreen}
        options={{
          headerShown: false,
          title: 'Mis Boletos',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="credit-card" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen as any}
        options={{
          headerShown: false,
          title: 'Perfil',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="user" color={color} size={size} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  const { theme, isDark } = useAppTheme();
  
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <NavigationContainer
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
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default function App() {
  useEffect(() => {
    loadSession();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
