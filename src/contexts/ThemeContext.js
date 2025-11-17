/**
 * ==============================================================================
 * THEME CONTEXT
 * ==============================================================================
 *
 * Uygulama genelinde tema yönetimi (Light/Dark mode)
 *
 * ÖZELLİKLER:
 * - Light/Dark mode geçişi
 * - Tema tercihini AsyncStorage'da kalıcı olarak sakla
 * - Tüm componentlerde tema bilgisine erişim
 * - Sistem teması desteği (opsiyonel)
 *
 * KULLANIM:
 * import { useTheme } from './contexts/ThemeContext';
 *
 * function MyComponent() {
 *   const { theme, isDarkMode, toggleTheme } = useTheme();
 *   return <View style={{ backgroundColor: theme.background }}>...</View>
 * }
 * ==============================================================================
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../config/theme';
import { STORAGE_KEYS } from '../config/constants';
import { ENV } from '../config/env';

/**
 * Theme Context
 */
const ThemeContext = createContext({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
});

/**
 * Theme Provider Component
 * Tüm uygulamayı bu provider ile sarmalayın
 */
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Tema tercihini yükle (AsyncStorage'dan)
   */
  useEffect(() => {
    loadThemePreference();
  }, []);

  /**
   * AsyncStorage'dan tema tercihini yükle
   */
  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);

      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');

        if (ENV.DEBUG_MODE) {
          console.log('✅ Tema tercihi yüklendi:', savedTheme);
        }
      } else {
        // İlk kez açılıyorsa, sistem temasını kullan (opsiyonel)
        // Şimdilik light mode default
        setIsDarkMode(false);

        if (ENV.DEBUG_MODE) {
          console.log('ℹ️ İlk açılış: Light mode aktif');
        }
      }
    } catch (error) {
      console.error('❌ Tema tercihi yüklenirken hata:', error);
      // Hata durumunda light mode kullan
      setIsDarkMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Tema tercihini kaydet (AsyncStorage'a)
   */
  const saveThemePreference = async (themeMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, themeMode);

      if (ENV.DEBUG_MODE) {
        console.log('✅ Tema tercihi kaydedildi:', themeMode);
      }
    } catch (error) {
      console.error('❌ Tema tercihi kaydedilirken hata:', error);
    }
  };

  /**
   * Tema değiştir (Light <-> Dark)
   */
  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await saveThemePreference(newTheme ? 'dark' : 'light');
  };

  /**
   * Aktif temayı belirle
   */
  const theme = isDarkMode ? darkTheme : lightTheme;

  /**
   * Context value
   */
  const value = {
    theme,
    isDarkMode,
    isLoading,
    toggleTheme,
  };

  // Tema yüklenene kadar bekle (opsiyonel, animasyon için)
  // if (isLoading) {
  //   return <SplashScreen />;
  // }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

/**
 * Custom hook - Tema bilgisine kolay erişim
 *
 * KULLANIM:
 * const { theme, isDarkMode, toggleTheme } = useTheme();
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
};

export default ThemeContext;
