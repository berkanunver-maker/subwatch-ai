/**
 * ==============================================================================
 * APP NAVIGATOR
 * ==============================================================================
 *
 * Ana navigasyon yapısı (React Navigation)
 *
 * KULLANIM:
 * Bu dosya uygulamanın tüm ekranları arasındaki geçişleri yönetir.
 * Bottom Tab Navigator kullanarak ana sayfalar arasında kolayca geçiş sağlar.
 *
 * NOT:
 * React Navigation kütüphaneleri package.json'a eklenmelidir:
 * - @react-navigation/native
 * - @react-navigation/bottom-tabs
 * - react-native-screens
 * - react-native-safe-area-context
 * ==============================================================================
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

// Screens
import HomeScreen from '../screens/HomeScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import StatisticsScreen from '../screens/StatisticsScreen';

const Tab = createBottomTabNavigator();

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
    </Tab.Navigator>
  );
}

/**
 * Root Navigator
 * Tüm navigasyon yapısını sarmallar
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}
