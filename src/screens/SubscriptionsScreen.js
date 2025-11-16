/**
 * ==============================================================================
 * ABONELİKLER SAYFASI (SUBSCRIPTIONS SCREEN)
 * ==============================================================================
 *
 * Kullanıcının tüm aboneliklerini listeler ve yönetir.
 *
 * ÖZELLİKLER:
 * - Abonelik listesi (aktif/pasif)
 * - Yeni abonelik ekleme
 * - Abonelik düzenleme/silme
 * - Arama ve filtreleme
 * - Kategori bazlı gruplama
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import api, { endpoints } from '../services/api';

export default function SubscriptionsScreen({ navigation }) {
  // State yönetimi
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'

  /**
   * Abonelikleri yükle
   */
  const loadSubscriptions = async () => {
    try {
      setLoading(true);

      // API'den abonelikleri al
      // NOT: Gerçek backend hazır olana kadar mock data kullanıyoruz
      const data = await api.get(endpoints.subscriptions);

      setSubscriptions(data || []);
    } catch (error) {
      console.error('Abonelikler yüklenirken hata:', error);
      Alert.alert('Hata', 'Abonelikler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Abonelik sil
   */
  const deleteSubscription = (id) => {
    Alert.alert(
      'Aboneliği Sil',
      'Bu aboneliği silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(endpoints.deleteSubscription(id));
              Alert.alert('Başarılı', 'Abonelik silindi.');
              loadSubscriptions(); // Listeyi yenile
            } catch (error) {
              console.error('Abonelik silinirken hata:', error);
              Alert.alert('Hata', 'Abonelik silinirken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  /**
   * Sayfa yüklendiğinde abonelikleri getir
   */
  useEffect(() => {
    loadSubscriptions();
  }, []);

  /**
   * Pull-to-refresh
   */
  const onRefresh = () => {
    setRefreshing(true);
    loadSubscriptions();
  };

  /**
   * Filtrelenmiş abonelikler
   */
  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (filter === 'active') return sub.isActive;
    if (filter === 'inactive') return !sub.isActive;
    return true;
  });

  /**
   * Abonelik kartı render et
   */
  const renderSubscriptionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.subscriptionCard}
      onPress={() => {
        // Detay sayfasına git
        console.log('Detay:', item.id);
      }}
    >
      <View style={styles.subscriptionInfo}>
        <Text style={styles.subscriptionName}>{item.name}</Text>
        <Text style={styles.subscriptionPrice}>
          ₺{item.price} / {item.billingCycle === 'monthly' ? 'Aylık' : 'Yıllık'}
        </Text>
        <Text style={styles.subscriptionDate}>
          Yenileme: {new Date(item.nextBillingDate).toLocaleDateString('tr-TR')}
        </Text>
      </View>

      <View style={styles.subscriptionActions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteSubscription(item.id)}
        >
          <Text style={styles.deleteButtonText}>Sil</Text>
        </TouchableOpacity>
      </View>

      {/* Aktif/Pasif Badge */}
      <View
        style={[
          styles.badge,
          item.isActive ? styles.activeBadge : styles.inactiveBadge,
        ]}
      >
        <Text style={styles.badgeText}>
          {item.isActive ? 'Aktif' : 'Pasif'}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
    <View style={styles.container}>
      {/* Filtreler */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.activeFilterText,
            ]}
          >
            Tümü
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'active' && styles.activeFilter,
          ]}
          onPress={() => setFilter('active')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'active' && styles.activeFilterText,
            ]}
          >
            Aktif
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'inactive' && styles.activeFilter,
          ]}
          onPress={() => setFilter('inactive')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'inactive' && styles.activeFilterText,
            ]}
          >
            Pasif
          </Text>
        </TouchableOpacity>
      </View>

      {/* Abonelik Listesi */}
      <FlatList
        data={filteredSubscriptions}
        renderItem={renderSubscriptionItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz abonelik eklemediniz</Text>
            <Text style={styles.emptySubtext}>
              Yeni abonelik eklemek için + butonuna tıklayın
            </Text>
          </View>
        }
      />

      {/* Yeni Abonelik Ekle Butonu */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // Yeni abonelik ekleme sayfasına git
          console.log('Yeni abonelik ekle');
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#6366f1',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContainer: {
    padding: 15,
  },
  subscriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  subscriptionInfo: {
    marginBottom: 10,
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subscriptionPrice: {
    fontSize: 16,
    color: '#6366f1',
    marginBottom: 5,
  },
  subscriptionDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  subscriptionActions: {
    flexDirection: 'row',
    gap: 10,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#10b981',
  },
  inactiveBadge: {
    backgroundColor: '#6b7280',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
});
