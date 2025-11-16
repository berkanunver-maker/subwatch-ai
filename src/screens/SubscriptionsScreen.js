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
import { useTheme } from '../contexts/ThemeContext';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../config/theme';
import AddSubscriptionModal from '../components/AddSubscriptionModal';

export default function SubscriptionsScreen({ navigation }) {
  const { theme } = useTheme();
  const {
    subscriptions,
    loading,
    deleteSubscription: removeSubscription,
  } = useSubscriptions();

  // State yönetimi
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [modalVisible, setModalVisible] = useState(false);

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
              await removeSubscription(id);
              Alert.alert('Başarılı', 'Abonelik silindi.');
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
   * Pull-to-refresh (veriler otomatik güncelleniyor)
   */
  const onRefresh = () => {
    setRefreshing(true);
    // Context'ten veri geldiği için sadece refreshing state'ini güncelle
    setTimeout(() => setRefreshing(false), 500);
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
      style={styles(theme).subscriptionCard}
      onPress={() => {
        // Detay sayfasına git
        console.log('Detay:', item.id);
      }}
    >
      <View style={styles(theme).subscriptionInfo}>
        <Text style={styles(theme).subscriptionName}>{item.name}</Text>
        <Text style={styles(theme).subscriptionPrice}>
          ₺{item.price} / {item.billingCycle === 'monthly' ? 'Aylık' : 'Yıllık'}
        </Text>
        <Text style={styles(theme).subscriptionDate}>
          Yenileme: {new Date(item.nextBillingDate).toLocaleDateString('tr-TR')}
        </Text>
      </View>

      <View style={styles(theme).subscriptionActions}>
        <TouchableOpacity
          style={styles(theme).deleteButton}
          onPress={() => deleteSubscription(item.id)}
        >
          <Text style={styles(theme).deleteButtonText}>Sil</Text>
        </TouchableOpacity>
      </View>

      {/* Aktif/Pasif Badge */}
      <View
        style={[
          styles(theme).badge,
          item.isActive ? styles(theme).activeBadge : styles(theme).inactiveBadge,
        ]}
      >
        <Text style={styles(theme).badgeText}>
          {item.isActive ? 'Aktif' : 'Pasif'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Dinamik stiller
  const dynamicStyles = styles(theme);

  // Yüklenme durumu
  if (loading) {
    return (
      <View style={dynamicStyles.centerContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={dynamicStyles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      {/* Filtreler */}
      <View style={dynamicStyles.filterContainer}>
        <TouchableOpacity
          style={[
            dynamicStyles.filterButton,
            filter === 'all' && dynamicStyles.activeFilter,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              dynamicStyles.filterText,
              filter === 'all' && dynamicStyles.activeFilterText,
            ]}
          >
            Tümü
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            dynamicStyles.filterButton,
            filter === 'active' && dynamicStyles.activeFilter,
          ]}
          onPress={() => setFilter('active')}
        >
          <Text
            style={[
              dynamicStyles.filterText,
              filter === 'active' && dynamicStyles.activeFilterText,
            ]}
          >
            Aktif
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            dynamicStyles.filterButton,
            filter === 'inactive' && dynamicStyles.activeFilter,
          ]}
          onPress={() => setFilter('inactive')}
        >
          <Text
            style={[
              dynamicStyles.filterText,
              filter === 'inactive' && dynamicStyles.activeFilterText,
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
        contentContainerStyle={dynamicStyles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={
          <View style={dynamicStyles.emptyContainer}>
            <Text style={dynamicStyles.emptyIcon}>📭</Text>
            <Text style={dynamicStyles.emptyText}>Henüz abonelik eklemediniz</Text>
            <Text style={dynamicStyles.emptySubtext}>
              Yeni abonelik eklemek için + butonuna tıklayın
            </Text>
          </View>
        }
      />

      {/* Yeni Abonelik Ekle Butonu */}
      <TouchableOpacity
        style={dynamicStyles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={dynamicStyles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Abonelik Ekleme Modal'ı */}
      <AddSubscriptionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

/**
 * Dinamik stil oluşturma fonksiyonu
 */
const styles = (theme) =>
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
    filterContainer: {
      flexDirection: 'row',
      padding: spacing.lg,
      gap: spacing.md,
      backgroundColor: theme.backgroundCard,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    filterButton: {
      flex: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      backgroundColor: theme.background,
      alignItems: 'center',
    },
    activeFilter: {
      backgroundColor: theme.primary,
    },
    filterText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: theme.textSecondary,
    },
    activeFilterText: {
      color: '#fff',
    },
    listContainer: {
      padding: spacing.lg,
      flexGrow: 1,
    },
    subscriptionCard: {
      backgroundColor: theme.backgroundCard,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.shadowOpacity,
      shadowRadius: 4,
      elevation: 3,
      position: 'relative',
    },
    subscriptionInfo: {
      marginBottom: spacing.md,
    },
    subscriptionName: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.xs,
    },
    subscriptionPrice: {
      fontSize: fontSize.md,
      color: theme.primary,
      marginBottom: spacing.xs,
    },
    subscriptionDate: {
      fontSize: fontSize.sm,
      color: theme.textSecondary,
    },
    subscriptionActions: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    deleteButton: {
      backgroundColor: theme.error,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.sm,
    },
    deleteButtonText: {
      color: '#fff',
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
    },
    badge: {
      position: 'absolute',
      top: spacing.lg,
      right: spacing.lg,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.lg,
    },
    activeBadge: {
      backgroundColor: theme.success,
    },
    inactiveBadge: {
      backgroundColor: theme.textLight,
    },
    badgeText: {
      color: '#fff',
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 80,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: spacing.lg,
    },
    emptyText: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.sm,
    },
    emptySubtext: {
      fontSize: fontSize.sm,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    fab: {
      position: 'absolute',
      bottom: spacing.xl,
      right: spacing.xl,
      width: 60,
      height: 60,
      borderRadius: borderRadius.round,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
    fabText: {
      fontSize: fontSize.display,
      color: '#fff',
      fontWeight: fontWeight.bold,
    },
  });
