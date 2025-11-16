/**
 * ==============================================================================
 * THEME CONTEXT
 * ==============================================================================
 *
 * Uygulama genelinde tema yönetimi (Light/Dark mode)
 *
 * ÖZELLİKLER:
 * - Light/Dark mode geçişi
 * - Tema tercihini AsyncStorage'da sakla
 * - Tüm componentlerde tema bilgisine erişim
 *
 * KULLANIM:
 * import { useTheme } from './contexts/ThemeContext';
 *
 * function MyComponent() {
 *   const { theme, isDark, toggleTheme } = useTheme();
 *   return <View style={{ backgroundColor: theme.background }}>...</View>
 * }
 * ==============================================================================
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { lightTheme, darkTheme } from '../config/theme';
// AsyncStorage import edilecek (şimdilik state'de tutuyoruz)
// import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Theme Context
 */
const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

/**
 * Theme Provider Component
 * Tüm uygulamayı bu provider ile sarmalayın
 */
export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  /**
   * Tema tercihini yükle (AsyncStorage'dan)
   * TODO: AsyncStorage eklenince aktif edilecek
   */
  useEffect(() => {
    loadThemePreference();
  }, []);

  /**
   * AsyncStorage'dan tema tercihini yükle
   */
  const loadThemePreference = async () => {
    try {
      // TODO: AsyncStorage eklenince aktif edilecek
      // const savedTheme = await AsyncStorage.getItem('theme');
      // if (savedTheme !== null) {
      //   setIsDark(savedTheme === 'dark');
      // }

      // Şimdilik sistem tercihi (opsiyonel)
      // Appearance API ile sistem dark mode'unu tespit edebiliriz
      // const systemTheme = Appearance.getColorScheme();
      // setIsDark(systemTheme === 'dark');
    } catch (error) {
      console.error('Tema tercihi yüklenirken hata:', error);
    }
  };

  /**
   * Tema tercihini kaydet (AsyncStorage'a)
   */
  const saveThemePreference = async (theme) => {
    try {
      // TODO: AsyncStorage eklenince aktif edilecek
      // await AsyncStorage.setItem('theme', theme);
      console.log('Tema tercihi kaydedildi:', theme);
    } catch (error) {
      console.error('Tema tercihi kaydedilirken hata:', error);
    }
  };

  /**
   * Tema değiştir (Light <-> Dark)
   */
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    saveThemePreference(newTheme ? 'dark' : 'light');
  };

  /**
   * Aktif temayı belirle
   */
  const theme = isDark ? darkTheme : lightTheme;

  /**
   * Context value
   */
  const value = {
    theme,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

/**
 * Custom hook - Tema bilgisine kolay erişim
 *
 * KULLANIM:
 * const { theme, isDark, toggleTheme } = useTheme();
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
};

export default ThemeContext;
