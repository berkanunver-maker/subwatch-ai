/**
 * ==============================================================================
 * APP NAVIGATOR
 * ==============================================================================
 *
 * Ana navigasyon yapısı (React Navigation)
 *
 * KULLANIM:
 * Bu dosya uygulamanın tüm ekranları arasındaki geçişleri yönetir.
 * - Auth Stack: Login, Register, ForgotPassword
 * - Main Stack: Bottom Tab Navigator (Home, Subscriptions, Statistics)
 *
 * Kullanıcı giriş yapmamışsa Auth Stack gösterilir
 * Giriş yapmışsa Main Stack gösterilir
 *
 * NOT:
 * React Navigation kütüphaneleri package.json'a eklenmelidir:
 * - @react-navigation/native
 * - @react-navigation/bottom-tabs
 * - @react-navigation/stack
 * - react-native-screens
 * - react-native-safe-area-context
 * ==============================================================================
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/**
 * Bottom Tab Navigator
 * Ana ekranlar arasında tab ile geçiş sağlar
 */
function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        // Tab bar styling (dinamik tema)
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textLight,
        tabBarStyle: {
          backgroundColor: theme.backgroundCard,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        // Header styling (dinamik tema)
        headerStyle: {
          backgroundColor: theme.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* Ana Sayfa */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Ana Sayfa',
          headerTitle: 'SubWatch AI',
          headerShown: false, // Custom header kullanıyoruz
          // Icon eklenebilir (react-native-vector-icons kullanarak)
          // tabBarIcon: ({ color, size }) => (
          //   <Icon name="home" size={size} color={color} />
          // ),
        }}
      />

      {/* Abonelikler */}
      <Tab.Screen
        name="Subscriptions"
        component={SubscriptionsScreen}
        options={{
          tabBarLabel: 'Abonelikler',
          headerTitle: 'Aboneliklerim',
          // tabBarIcon: ({ color, size }) => (
          //   <Icon name="list" size={size} color={color} />
          // ),
        }}
      />

      {/* İstatistikler */}
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          tabBarLabel: 'İstatistikler',
          headerTitle: 'İstatistikler',
          headerShown: false, // Custom header kullanıyoruz
          // tabBarIcon: ({ color, size }) => (
          //   <Icon name="bar-chart" size={size} color={color} />
          // ),
        }}
      />

      {/* Profil */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          headerTitle: 'Profilim',
          // tabBarIcon: ({ color, size }) => (
          //   <Icon name="user" size={size} color={color} />
          // ),
        }}
      />

      {/* Ayarlar */}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Ayarlar',
          headerTitle: 'Ayarlar',
          // tabBarIcon: ({ color, size }) => (
          //   <Icon name="settings" size={size} color={color} />
          // ),
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Auth Stack Navigator
 * Login, Register ve ForgotPassword ekranları
 */
function AuthStack() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          headerShown: true,
          title: 'Şifremi Unuttum',
          headerStyle: {
            backgroundColor: theme.primary,
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * Root Navigator
 * Auth durumuna göre AuthStack, EmailVerification veya TabNavigator gösterir
 */
export default function AppNavigator() {
  const { user, initializing, emailVerified } = useAuth();
  const { theme } = useTheme();

  // Auth kontrolü yapılıyorsa loading göster
  if (initializing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Kullanıcı durumuna göre ekran göster
  const getScreen = () => {
    if (!user) {
      // Kullanıcı giriş yapmamış → Login/Register
      return <AuthStack />;
    }

    // Email/Password ile giriş yapıp email doğrulanmamışsa → Verification
    if (user.email && !emailVerified && user.authProvider !== 'google') {
      return <EmailVerificationScreen />;
    }

    // Her şey tamam → Ana uygulama
    return <TabNavigator />;
  };

  return <NavigationContainer>{getScreen()}</NavigationContainer>;
}

/**
 * Stiller
 */
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
