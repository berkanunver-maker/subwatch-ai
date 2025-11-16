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
import api, { endpoints } from '../services/api';

export default function StatisticsScreen() {
  // State yönetimi
  const [loading, setLoading] = useState(true);
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
  const loadStatistics = async () => {
    try {
      setLoading(true);

      // API'den istatistikleri al
      const data = await api.get(endpoints.getStatistics);

      setStatistics(data);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Sayfa yüklendiğinde istatistikleri getir
   */
  useEffect(() => {
    loadStatistics();
  }, []);

  /**
   * Pull-to-refresh
   */
  const onRefresh = () => {
    setRefreshing(true);
    loadStatistics();
  };

  // Yüklenme durumu
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
        <Text style={styles.largeValue}>₺{statistics.totalSpent}</Text>
      </View>

      {/* Aylık Ortalama */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Aylık Ortalama</Text>
        <Text style={styles.mediumValue}>₺{statistics.monthlyAverage}</Text>
      </View>

      {/* Tasarruf Potansiyeli */}
      {statistics.savingsPotential > 0 && (
        <View style={[styles.card, styles.savingsCard]}>
          <Text style={styles.savingsEmoji}>💰</Text>
          <Text style={styles.savingsTitle}>Tasarruf Potansiyeli</Text>
          <Text style={styles.savingsValue}>
            ₺{statistics.savingsPotential} / ay
          </Text>
          <Text style={styles.savingsText}>
            Kullanmadığınız abonelikleri iptal ederek bu kadar tasarruf
            edebilirsiniz!
          </Text>
        </View>
      )}

      {/* En Çok Harcanan Abonelikler */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>En Çok Harcanan Abonelikler</Text>

        {statistics.topSubscriptions.length > 0 ? (
          statistics.topSubscriptions.map((sub, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listItemInfo}>
                <Text style={styles.listItemName}>{sub.name}</Text>
                <Text style={styles.listItemPrice}>₺{sub.price} / ay</Text>
              </View>
              <View
                style={[
                  styles.listItemBar,
                  { width: `${(sub.price / statistics.monthlyAverage) * 50}%` },
                ]}
              />
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Henüz veri yok</Text>
        )}
      </View>

      {/* Kategori Dağılımı */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kategori Dağılımı</Text>

        {statistics.categoryBreakdown.length > 0 ? (
          statistics.categoryBreakdown.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryAmount}>₺{category.amount}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Henüz veri yok</Text>
        )}
      </View>

      {/* AI Önerileri */}
      <View style={[styles.card, styles.aiCard]}>
        <Text style={styles.aiTitle}>🤖 AI Önerileri</Text>
        <Text style={styles.aiText}>
          • Netflix aboneliğinizi son 30 gündür kullanmıyorsunuz. İptal
          etmeyi düşünebilirsiniz.{'\n\n'}
          • Spotify'da Family plan'e geçerek aylık ₺20 tasarruf
          edebilirsiniz.{'\n\n'}
          • Adobe Creative Cloud için daha uygun alternatifler mevcut.
        </Text>
      </View>

      {/* Grafik Placeholder */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aylık Harcama Grafiği</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>
            📊 Grafik yakında eklenecek
          </Text>
          <Text style={styles.chartPlaceholderSubtext}>
            Aylık harcama trendlerinizi burada görebileceksiniz
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#6366f1',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 15,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  largeValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  mediumValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  savingsCard: {
    backgroundColor: '#ecfdf5',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  savingsEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 10,
  },
  savingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065f46',
    textAlign: 'center',
    marginBottom: 8,
  },
  savingsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 12,
  },
  savingsText: {
    fontSize: 14,
    color: '#047857',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  listItemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  listItemPrice: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  listItemBar: {
    height: 6,
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 16,
    color: '#1f2937',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    padding: 20,
  },
  aiCard: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
  },
  aiText: {
    fontSize: 14,
    color: '#1e3a8a',
    lineHeight: 22,
  },
  chartPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  chartPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 8,
  },
  chartPlaceholderSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
