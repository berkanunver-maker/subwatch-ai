/**
 * ==============================================================================
 * İSTATİSTİKLER SAYFASI (STATISTICS SCREEN)
 * ==============================================================================
 *
 * Kullanıcının abonelik harcamalarını, trend analizlerini ve
 * grafikleri gösterir.
 *
 * ÖZELLİKLER:
 * - Aylık/Yıllık harcama grafikleri
 * - Kategori bazlı analiz
 * - Harcama trendleri
 * - En çok harcanan abonelikler
 * - Tasarruf önerileri
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../config/theme';

export default function StatisticsScreen() {
  const { theme } = useTheme();
  const { loading: subsLoading, getStatistics } = useSubscriptions();

  // State yönetimi
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState({
    totalSpent: 0,
    monthlyAverage: 0,
    topSubscriptions: [],
    categoryBreakdown: [],
    savingsPotential: 0,
  });

  /**
   * İstatistikleri yükle
   */
  const loadStatistics = () => {
    try {
      const stats = getStatistics();
      setStatistics(stats);
      setRefreshing(false);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
      setRefreshing(false);
    }
  };

  /**
   * Sayfa yüklendiğinde istatistikleri getir
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
        <Text style={styles.headerTitle}>İstatistikler</Text>
        <Text style={styles.headerSubtitle}>
          Harcama analiziniz ve tasarruf önerileriniz
        </Text>
      </View>

      {/* Toplam Harcama */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Toplam Harcama (Bu Yıl)</Text>
        <Text style={styles.largeValue}>₺{statistics.totalSpent.toFixed(2)}</Text>
      </View>

      {/* Aylık Ortalama */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Aylık Ortalama</Text>
        <Text style={styles.mediumValue}>
          ₺{statistics.monthlyAverage.toFixed(2)}
        </Text>
      </View>

      {/* Tasarruf Potansiyeli */}
      {statistics.savingsPotential > 0 && (
        <View style={[styles.card, styles.savingsCard]}>
          <Text style={styles.savingsEmoji}>💰</Text>
          <Text style={styles.savingsTitle}>Tasarruf Potansiyeli</Text>
          <Text style={styles.savingsValue}>
            ₺{statistics.savingsPotential.toFixed(2)} / ay
          </Text>
          <Text style={styles.savingsText}>
            Kullanmadığınız abonelikleri iptal ederek bu kadar tasarruf
            edebilirsiniz!
          </Text>
        </View>
      )}

      {/* Boş Durum - Henüz veri yok */}
      {statistics.totalSpent === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>Henüz istatistik yok</Text>
          <Text style={styles.emptyText}>
            Abonelik ekledikçe harcama analizleriniz burada görünecek
          </Text>
        </View>
      )}

      {/* En Çok Harcanan Abonelikler */}
      {statistics.topSubscriptions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>En Çok Harcanan Abonelikler</Text>

          {statistics.topSubscriptions.map((sub, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listItemInfo}>
                <Text style={styles.listItemName}>{sub.name}</Text>
                <Text style={styles.listItemPrice}>₺{sub.price} / ay</Text>
              </View>
              <View
                style={[
                  styles.listItemBar,
                  {
                    width: `${
                      (sub.price / statistics.monthlyAverage) * 50
                    }%`,
                  },
                ]}
              />
            </View>
          ))}
        </View>
      )}

      {/* Kategori Dağılımı */}
      {statistics.categoryBreakdown.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategori Dağılımı</Text>

          {statistics.categoryBreakdown.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryAmount}>₺{category.amount}</Text>
            </View>
          ))}
        </View>
      )}

      {/* AI Önerileri Placeholder */}
      <View style={[styles.card, styles.aiCard]}>
        <Text style={styles.aiTitle}>🤖 AI Önerileri</Text>
        <Text style={styles.aiText}>
          {statistics.totalSpent === 0
            ? 'Abonelik ekledikçe AI size kişiselleştirilmiş tasarruf önerileri sunacak.'
            : 'AI analizleriniz yakında eklenecek. Kullanım verilerinizi analiz ederek size özel öneriler sunulacak.'}
        </Text>
      </View>

      {/* Grafik Placeholder */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aylık Harcama Grafiği</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderIcon}>📈</Text>
          <Text style={styles.chartPlaceholderText}>
            Grafik yakında eklenecek
          </Text>
          <Text style={styles.chartPlaceholderSubtext}>
            Aylık harcama trendlerinizi burada görebileceksiniz
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * Dinamik stil oluşturma fonksiyonu
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
    card: {
      backgroundColor: theme.backgroundCard,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      marginHorizontal: spacing.lg,
      marginTop: spacing.lg,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.shadowOpacity,
      shadowRadius: 4,
      elevation: 3,
    },
    cardLabel: {
      fontSize: fontSize.sm,
      color: theme.textSecondary,
      marginBottom: spacing.sm,
    },
    largeValue: {
      fontSize: fontSize.display,
      fontWeight: fontWeight.bold,
      color: theme.text,
    },
    mediumValue: {
      fontSize: fontSize.xxxl,
      fontWeight: fontWeight.bold,
      color: theme.primary,
    },
    savingsCard: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
      borderLeftWidth: 4,
      borderLeftColor: theme.success,
    },
    savingsEmoji: {
      fontSize: 48,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    savingsTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: theme.mode === 'dark' ? theme.success : '#065f46',
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    savingsValue: {
      fontSize: fontSize.xxxl,
      fontWeight: fontWeight.bold,
      color: theme.success,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    savingsText: {
      fontSize: fontSize.sm,
      color: theme.mode === 'dark' ? theme.textSecondary : '#047857',
      textAlign: 'center',
      lineHeight: 20,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: spacing.xl,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: spacing.lg,
    },
    emptyTitle: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.sm,
    },
    emptyText: {
      fontSize: fontSize.md,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    section: {
      marginTop: spacing.xl,
      marginHorizontal: spacing.lg,
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.lg,
    },
    listItem: {
      backgroundColor: theme.backgroundCard,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    listItemInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    listItemName: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: theme.text,
    },
    listItemPrice: {
      fontSize: fontSize.md,
      color: theme.primary,
      fontWeight: fontWeight.semibold,
    },
    listItemBar: {
      height: 6,
      backgroundColor: theme.primary,
      borderRadius: borderRadius.sm,
    },
    categoryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: theme.backgroundCard,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    categoryName: {
      fontSize: fontSize.md,
      color: theme.text,
    },
    categoryAmount: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      color: theme.primary,
    },
    aiCard: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#f0f9ff',
      borderLeftWidth: 4,
      borderLeftColor: theme.info,
    },
    aiTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: theme.mode === 'dark' ? theme.info : '#1e40af',
      marginBottom: spacing.md,
    },
    aiText: {
      fontSize: fontSize.sm,
      color: theme.mode === 'dark' ? theme.textSecondary : '#1e3a8a',
      lineHeight: 22,
    },
    chartPlaceholder: {
      backgroundColor: theme.backgroundCard,
      borderRadius: borderRadius.lg,
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200,
    },
    chartPlaceholderIcon: {
      fontSize: 48,
      marginBottom: spacing.md,
    },
    chartPlaceholderText: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.sm,
    },
    chartPlaceholderSubtext: {
      fontSize: fontSize.sm,
      color: theme.textSecondary,
      textAlign: 'center',
    },
  });
