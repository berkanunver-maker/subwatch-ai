/**
 * ==============================================================================
 * ANA SAYFA (HOME SCREEN)
 * ==============================================================================
 *
 * Kullanıcının aktif aboneliklerini, toplam harcamalarını ve
 * yaklaşan yenilemeleri gösterir.
 *
 * ÖZELLİKLER:
 * - Toplam aylık/yıllık harcama özeti
 * - Aktif abonelik sayısı
 * - Yaklaşan yenileme tarihleri
 * - Tema değiştirme (Light/Dark mode)
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../config/theme';

export default function HomeScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { loading: subsLoading, getStatistics } = useSubscriptions();

  // State yönetimi
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState({
    totalMonthly: 0,
    totalYearly: 0,
    activeCount: 0,
    upcomingRenewals: [],
  });

  /**
   * Abonelik istatistiklerini yükle
   */
  const loadStatistics = () => {
    try {
      const stats = getStatistics();
      setStatistics(stats);
      setRefreshing(false);
    } catch (error) {
      console.error('İstatistik yüklenirken hata:', error);
      setRefreshing(false);
    }
  };

  /**
   * Sayfa yüklendiğinde ve subscriptions değiştiğinde istatistikleri getir
   */
  useEffect(() => {
    if (!subsLoading) {
      loadStatistics();
    }
  }, [subsLoading]);

  /**
   * Pull-to-refresh
   */
  const onRefresh = () => {
    setRefreshing(true);
    loadStatistics();
  };

  // Dinamik stiller
  const styles = createStyles(theme);

  // Yüklenme durumu
  if (subsLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    >
      {/* Başlık */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SubWatch AI</Text>
          <Text style={styles.headerSubtitle}>
            Aboneliklerinizi Akıllıca Yönetin
          </Text>
        </View>

        {/* Tema Değiştirme Butonu */}
        <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
          <Text style={styles.themeButtonText}>{isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      {/* Özet Kartları */}
      <View style={styles.summaryContainer}>
        {/* Aylık Toplam */}
        <View style={[styles.card, styles.primaryCard]}>
          <Text style={styles.cardLabelPrimary}>Aylık Toplam</Text>
          <Text style={styles.cardValuePrimary}>
            ₺{statistics.totalMonthly.toFixed(2)}
          </Text>
        </View>

        {/* Yıllık Toplam */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Yıllık Toplam</Text>
          <Text style={styles.cardValue}>
            ₺{statistics.totalYearly.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Aktif Abonelikler */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Aktif Abonelikler</Text>
        <Text style={styles.cardValue}>{statistics.activeCount}</Text>
      </View>

      {/* Hızlı Aksiyonlar */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Subscriptions')}
        >
          <Text style={styles.actionButtonIcon}>📋</Text>
          <Text style={styles.actionButtonText}>Aboneliklerim</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Statistics')}
        >
          <Text style={styles.actionButtonIcon}>📊</Text>
          <Text style={styles.actionButtonText}>İstatistikler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.aiButton]}
          onPress={() => {
            // AI analiz sayfasına git
            console.log('AI Analiz - Yakında eklenecek');
          }}
        >
          <Text style={styles.actionButtonIcon}>🤖</Text>
          <Text style={[styles.actionButtonText, styles.aiButtonText]}>
            AI Analiz
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bilgi Notu */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 İpucu</Text>
        <Text style={styles.infoText}>
          Abonelik eklemek için "Aboneliklerim" sayfasına gidin. Henüz abonelik
          eklemediniz, hemen başlayın!
        </Text>
      </View>
    </ScrollView>
  );
}

/**
 * Dinamik stil oluşturma fonksiyonu
 * Temaya göre stiller değişir
 */
const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: fontSize.md,
      color: theme.textSecondary,
    },
    header: {
      backgroundColor: theme.primary,
      padding: spacing.xl,
      paddingTop: 60,
      paddingBottom: spacing.xxxl,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    headerTitle: {
      fontSize: fontSize.xxxl,
      fontWeight: fontWeight.bold,
      color: '#fff',
      marginBottom: spacing.xs,
    },
    headerSubtitle: {
      fontSize: fontSize.sm,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    themeButton: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.round,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    themeButtonText: {
      fontSize: fontSize.xl,
    },
    summaryContainer: {
      flexDirection: 'row',
      padding: spacing.lg,
      gap: spacing.lg,
    },
    card: {
      flex: 1,
      backgroundColor: theme.backgroundCard,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.shadowOpacity,
      shadowRadius: 4,
      elevation: 3,
      marginBottom: spacing.lg,
      marginHorizontal: spacing.lg,
    },
    primaryCard: {
      backgroundColor: theme.primary,
    },
    cardLabel: {
      fontSize: fontSize.sm,
      color: theme.textSecondary,
      marginBottom: spacing.sm,
    },
    cardLabelPrimary: {
      fontSize: fontSize.sm,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: spacing.sm,
    },
    cardValue: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: theme.text,
    },
    cardValuePrimary: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: '#fff',
    },
    actionsContainer: {
      padding: spacing.lg,
      gap: spacing.md,
    },
    actionButton: {
      backgroundColor: theme.backgroundCard,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.shadowOpacity,
      shadowRadius: 4,
      elevation: 3,
    },
    actionButtonIcon: {
      fontSize: fontSize.xxl,
      marginRight: spacing.md,
    },
    actionButtonText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: theme.text,
    },
    aiButton: {
      backgroundColor: theme.success,
    },
    aiButtonText: {
      color: '#fff',
    },
    infoBox: {
      backgroundColor: isDark => (isDark ? 'rgba(251, 191, 36, 0.1)' : '#fffbeb'),
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      margin: spacing.lg,
      borderLeftWidth: 4,
      borderLeftColor: theme.warning,
    },
    infoTitle: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.sm,
    },
    infoText: {
      fontSize: fontSize.sm,
      color: theme.textSecondary,
      lineHeight: 20,
    },
  });
