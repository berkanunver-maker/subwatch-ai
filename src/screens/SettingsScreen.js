/**
 * ==============================================================================
 * SETTINGS SCREEN
 * ==============================================================================
 *
 * Uygulama ayarları ekranı
 *
 * ÖZELLİKLER:
 * - Tema değiştirme (Dark/Light)
 * - Bildirim ayarları
 * - Para birimi tercihi
 * - Dil seçimi
 * - Veri yönetimi
 * - Hakkında bilgileri
 * - Gizlilik ve şartlar
 * ==============================================================================
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../config/theme';

export default function SettingsScreen() {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  // Settings state (placeholder for future implementation)
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: false,
    reminderNotifications: true,
  });
  const [currency, setCurrency] = useState('TRY');
  const [language, setLanguage] = useState('tr');

  /**
   * Bildirim ayarı değiştir
   */
  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  /**
   * Para birimi seçimi
   */
  const handleSelectCurrency = () => {
    Alert.alert(
      'Para Birimi Seçin',
      '',
      [
        {
          text: 'TRY (₺)',
          onPress: () => setCurrency('TRY'),
        },
        {
          text: 'USD ($)',
          onPress: () => setCurrency('USD'),
        },
        {
          text: 'EUR (€)',
          onPress: () => setCurrency('EUR'),
        },
        {
          text: 'İptal',
          style: 'cancel',
        },
      ]
    );
  };

  /**
   * Dil seçimi
   */
  const handleSelectLanguage = () => {
    Alert.alert(
      'Dil Seçin',
      '',
      [
        {
          text: 'Türkçe',
          onPress: () => setLanguage('tr'),
        },
        {
          text: 'English',
          onPress: () => setLanguage('en'),
        },
        {
          text: 'İptal',
          style: 'cancel',
        },
      ]
    );
  };

  /**
   * Önbelleği temizle
   */
  const handleClearCache = () => {
    Alert.alert(
      'Önbelleği Temizle',
      'Önbelleği temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement cache clearing
            Alert.alert('Başarılı', 'Önbellek temizlendi');
          },
        },
      ]
    );
  };

  /**
   * Verileri dışa aktar
   */
  const handleExportData = () => {
    Alert.alert(
      'Verileri Dışa Aktar',
      'Abonelik verileriniz JSON formatında dışa aktarılacak.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Dışa Aktar',
          onPress: () => {
            // TODO: Implement data export
            Alert.alert('Bilgi', 'Veri dışa aktarma özelliği yakında eklenecek');
          },
        },
      ]
    );
  };

  /**
   * Para birimi sembolü
   */
  const getCurrencySymbol = (code) => {
    switch (code) {
      case 'TRY':
        return '₺';
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      default:
        return code;
    }
  };

  /**
   * Dil adı
   */
  const getLanguageName = (code) => {
    switch (code) {
      case 'tr':
        return 'Türkçe';
      case 'en':
        return 'English';
      default:
        return code;
    }
  };

  // Dinamik stiller
  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Görünüm Ayarları */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Görünüm</Text>

        {/* Dark Mode Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Karanlık Mod</Text>
            <Text style={styles.settingDescription}>
              {isDarkMode ? 'Karanlık tema aktif' : 'Aydınlık tema aktif'}
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Bildirim Ayarları */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bildirimler</Text>

        {/* Push Notifications */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Anlık Bildirimler</Text>
            <Text style={styles.settingDescription}>
              Yeni abonelik ve hatırlatıcılar için
            </Text>
          </View>
          <Switch
            value={notifications.pushNotifications}
            onValueChange={() => toggleNotification('pushNotifications')}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
          />
        </View>

        {/* Email Notifications */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Email Bildirimleri</Text>
            <Text style={styles.settingDescription}>
              Haftalık özet ve raporlar
            </Text>
          </View>
          <Switch
            value={notifications.emailNotifications}
            onValueChange={() => toggleNotification('emailNotifications')}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
          />
        </View>

        {/* Reminder Notifications */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Hatırlatıcılar</Text>
            <Text style={styles.settingDescription}>
              Fatura ödeme hatırlatmaları
            </Text>
          </View>
          <Switch
            value={notifications.reminderNotifications}
            onValueChange={() => toggleNotification('reminderNotifications')}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Bölgesel Ayarlar */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bölgesel Ayarlar</Text>

        {/* Currency Selection */}
        <TouchableOpacity style={styles.settingRow} onPress={handleSelectCurrency}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Para Birimi</Text>
            <Text style={styles.settingDescription}>Varsayılan para birimi</Text>
          </View>
          <Text style={styles.settingValue}>
            {currency} ({getCurrencySymbol(currency)})
          </Text>
        </TouchableOpacity>

        {/* Language Selection */}
        <TouchableOpacity style={styles.settingRow} onPress={handleSelectLanguage}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Dil</Text>
            <Text style={styles.settingDescription}>Uygulama dili</Text>
          </View>
          <Text style={styles.settingValue}>{getLanguageName(language)}</Text>
        </TouchableOpacity>
      </View>

      {/* Veri Yönetimi */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Veri Yönetimi</Text>

        {/* Clear Cache */}
        <TouchableOpacity style={styles.settingRow} onPress={handleClearCache}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Önbelleği Temizle</Text>
            <Text style={styles.settingDescription}>
              Geçici dosyaları temizle
            </Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        {/* Export Data */}
        <TouchableOpacity style={styles.settingRow} onPress={handleExportData}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Verileri Dışa Aktar</Text>
            <Text style={styles.settingDescription}>
              JSON formatında indir
            </Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Hakkında */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hakkında</Text>

        {/* App Version */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Uygulama Sürümü</Text>
            <Text style={styles.settingDescription}>SubWatch AI</Text>
          </View>
          <Text style={styles.settingValue}>v1.0.0</Text>
        </View>

        {/* Privacy Policy */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => Alert.alert('Bilgi', 'Gizlilik politikası yakında eklenecek')}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Gizlilik Politikası</Text>
            <Text style={styles.settingDescription}>
              Verilerinizi nasıl koruduğumuz
            </Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        {/* Terms of Service */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => Alert.alert('Bilgi', 'Kullanım şartları yakında eklenecek')}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Kullanım Şartları</Text>
            <Text style={styles.settingDescription}>
              Hizmet kullanım koşulları
            </Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        {/* Contact Support */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => Alert.alert('Destek', 'Email: support@subwatch.ai')}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Destek</Text>
            <Text style={styles.settingDescription}>
              Yardım ve geri bildirim
            </Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

/**
 * Dinamik stiller (tema bazlı)
 */
const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      paddingBottom: spacing.xxl,
    },
    section: {
      marginTop: spacing.lg,
      backgroundColor: theme.backgroundCard,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.border,
    },
    sectionTitle: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: theme.textSecondary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      backgroundColor: theme.background,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: theme.backgroundCard,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    settingInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    settingLabel: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: theme.text,
      marginBottom: spacing.xs,
    },
    settingDescription: {
      fontSize: fontSize.sm,
      color: theme.textSecondary,
    },
    settingValue: {
      fontSize: fontSize.md,
      color: theme.textSecondary,
      fontWeight: fontWeight.medium,
    },
    settingArrow: {
      fontSize: fontSize.xl,
      color: theme.textLight,
      fontWeight: fontWeight.light,
    },
    bottomSpace: {
      height: spacing.xxl,
    },
  });
