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
 * - AI önerileri
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
import api, { endpoints } from '../services/api';

export default function HomeScreen({ navigation }) {
  // State yönetimi
  const [loading, setLoading] = useState(true);
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
  const loadStatistics = async () => {
    try {
      setLoading(true);

      // API'den istatistikleri al
      // NOT: Gerçek backend hazır olana kadar mock data kullanıyoruz
      const data = await api.get(endpoints.getStatistics);

      setStatistics(data);
    } catch (error) {
      console.error('İstatistik yüklenirken hata:', error);
      // Hata durumunda kullanıcıya bilgi ver
      // Alert.alert('Hata', 'İstatistikler yüklenirken bir hata oluştu.');
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
        <Text style={styles.headerTitle}>SubWatch AI</Text>
        <Text style={styles.headerSubtitle}>
          Aboneliklerinizi Akıllıca Yönetin
        </Text>
      </View>

      {/* Özet Kartları */}
      <View style={styles.summaryContainer}>
        {/* Aylık Toplam */}
        <View style={[styles.card, styles.primaryCard]}>
          <Text style={styles.cardLabel}>Aylık Toplam</Text>
          <Text style={styles.cardValue}>
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
          <Text style={styles.actionButtonText}>Aboneliklerim</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Statistics')}
        >
          <Text style={styles.actionButtonText}>İstatistikler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.aiButton]}
          onPress={() => {
            // AI analiz sayfasına git
            console.log('AI Analiz');
          }}
        >
          <Text style={[styles.actionButtonText, styles.aiButtonText]}>
            AI Analiz
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bilgi Notu */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 İpucu</Text>
        <Text style={styles.infoText}>
          Abonelik eklemek için "Aboneliklerim" sayfasına gidin veya fatura
          fotoğrafı yükleyin - AI otomatik olarak tespit edecektir!
        </Text>
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
  summaryContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 15,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
    marginHorizontal: 15,
  },
  primaryCard: {
    backgroundColor: '#6366f1',
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  actionsContainer: {
    padding: 15,
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  aiButton: {
    backgroundColor: '#10b981',
  },
  aiButtonText: {
    color: '#fff',
  },
  infoBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 15,
    margin: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
});
