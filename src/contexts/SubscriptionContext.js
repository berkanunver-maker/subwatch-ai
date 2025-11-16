/**
 * ==============================================================================
 * SUBSCRIPTION CONTEXT
 * ==============================================================================
 *
 * Abonelik verilerini global olarak yöneten Context API
 *
 * ÖZELLİKLER:
 * - AsyncStorage ile kalıcı veri saklama
 * - CRUD işlemleri (Create, Read, Update, Delete)
 * - İstatistik hesaplamaları
 * - Filtreleme ve sıralama
 *
 * KULLANIM:
 * import { useSubscriptions } from './contexts/SubscriptionContext';
 *
 * const { subscriptions, addSubscription, deleteSubscription } = useSubscriptions();
 * ==============================================================================
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@subwatch_subscriptions';

/**
 * Subscription Context
 */
const SubscriptionContext = createContext({
  subscriptions: [],
  loading: false,
  addSubscription: () => {},
  updateSubscription: () => {},
  deleteSubscription: () => {},
  getStatistics: () => {},
  loadSampleData: () => {},
});

/**
 * Örnek abonelikler (ilk kullanım için)
 */
const SAMPLE_SUBSCRIPTIONS = [
  {
    id: '1',
    name: 'Netflix',
    price: 149.99,
    currency: 'TRY',
    billingCycle: 'monthly', // 'monthly' | 'yearly'
    category: 'streaming',
    nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 gün sonra
    isActive: true,
    createdAt: new Date().toISOString(),
    notes: 'Premium plan',
  },
  {
    id: '2',
    name: 'Spotify',
    price: 59.99,
    currency: 'TRY',
    billingCycle: 'monthly',
    category: 'music',
    nextBillingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 gün sonra
    isActive: true,
    createdAt: new Date().toISOString(),
    notes: 'Premium Individual',
  },
  {
    id: '3',
    name: 'YouTube Premium',
    price: 89.99,
    currency: 'TRY',
    billingCycle: 'monthly',
    category: 'streaming',
    nextBillingDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    notes: '',
  },
  {
    id: '4',
    name: 'Adobe Creative Cloud',
    price: 699.99,
    currency: 'TRY',
    billingCycle: 'monthly',
    category: 'productivity',
    nextBillingDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    notes: 'All Apps plan',
  },
  {
    id: '5',
    name: 'iCloud',
    price: 29.99,
    currency: 'TRY',
    billingCycle: 'monthly',
    category: 'storage',
    nextBillingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    notes: '200GB plan',
  },
];

/**
 * Subscription Provider Component
 */
export const SubscriptionProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Uygulama başladığında abonelikleri yükle
   */
  useEffect(() => {
    loadSubscriptions();
  }, []);

  /**
   * AsyncStorage'dan abonelikleri yükle
   */
  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);
        setSubscriptions(parsed);
      } else {
        // İlk kullanım - örnek verileri yükle
        console.log('📦 İlk kullanım - örnek abonelikler yükleniyor...');
        await saveSubscriptions(SAMPLE_SUBSCRIPTIONS);
        setSubscriptions(SAMPLE_SUBSCRIPTIONS);
      }
    } catch (error) {
      console.error('Abonelikler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abonelikleri AsyncStorage'a kaydet
   */
  const saveSubscriptions = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Abonelikler kaydedilirken hata:', error);
      throw error;
    }
  };

  /**
   * Yeni abonelik ekle
   */
  const addSubscription = async (subscription) => {
    try {
      const newSubscription = {
        ...subscription,
        id: Date.now().toString(), // Basit ID oluşturma
        createdAt: new Date().toISOString(),
        isActive: subscription.isActive ?? true,
      };

      const updated = [...subscriptions, newSubscription];
      await saveSubscriptions(updated);
      setSubscriptions(updated);

      return newSubscription;
    } catch (error) {
      console.error('Abonelik eklenirken hata:', error);
      throw error;
    }
  };

  /**
   * Abonelik güncelle
   */
  const updateSubscription = async (id, updates) => {
    try {
      const updated = subscriptions.map((sub) =>
        sub.id === id ? { ...sub, ...updates } : sub
      );

      await saveSubscriptions(updated);
      setSubscriptions(updated);
    } catch (error) {
      console.error('Abonelik güncellenirken hata:', error);
      throw error;
    }
  };

  /**
   * Abonelik sil
   */
  const deleteSubscription = async (id) => {
    try {
      const updated = subscriptions.filter((sub) => sub.id !== id);
      await saveSubscriptions(updated);
      setSubscriptions(updated);
    } catch (error) {
      console.error('Abonelik silinirken hata:', error);
      throw error;
    }
  };

  /**
   * İstatistikleri hesapla
   */
  const getStatistics = () => {
    // Aktif abonelikler
    const activeSubscriptions = subscriptions.filter((sub) => sub.isActive);

    // Toplam aylık harcama
    const totalMonthly = activeSubscriptions.reduce((sum, sub) => {
      const monthlyPrice =
        sub.billingCycle === 'yearly' ? sub.price / 12 : sub.price;
      return sum + monthlyPrice;
    }, 0);

    // Toplam yıllık harcama
    const totalYearly = totalMonthly * 12;

    // En çok harcanan abonelikler (top 5)
    const topSubscriptions = [...activeSubscriptions]
      .sort((a, b) => {
        const aMonthly = a.billingCycle === 'yearly' ? a.price / 12 : a.price;
        const bMonthly = b.billingCycle === 'yearly' ? b.price / 12 : b.price;
        return bMonthly - aMonthly;
      })
      .slice(0, 5)
      .map((sub) => ({
        name: sub.name,
        price: sub.billingCycle === 'yearly' ? sub.price / 12 : sub.price,
      }));

    // Kategori bazlı dağılım
    const categoryBreakdown = activeSubscriptions.reduce((acc, sub) => {
      const category = sub.category || 'other';
      const monthlyPrice =
        sub.billingCycle === 'yearly' ? sub.price / 12 : sub.price;

      if (!acc[category]) {
        acc[category] = { name: getCategoryName(category), amount: 0 };
      }

      acc[category].amount += monthlyPrice;
      return acc;
    }, {});

    // Yaklaşan yenilemeler (30 gün içinde)
    const upcomingRenewals = activeSubscriptions
      .filter((sub) => {
        const daysUntil = Math.ceil(
          (new Date(sub.nextBillingDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        return daysUntil <= 30 && daysUntil > 0;
      })
      .sort(
        (a, b) =>
          new Date(a.nextBillingDate) - new Date(b.nextBillingDate)
      );

    return {
      totalMonthly,
      totalYearly,
      activeCount: activeSubscriptions.length,
      totalCount: subscriptions.length,
      topSubscriptions,
      categoryBreakdown: Object.values(categoryBreakdown),
      upcomingRenewals,
      monthlyAverage: totalMonthly,
      totalSpent: totalYearly, // Bu yıl için (basitleştirilmiş)
      savingsPotential: 0, // AI analizi ile hesaplanacak
    };
  };

  /**
   * Örnek verileri yükle (debug için)
   */
  const loadSampleData = async () => {
    await saveSubscriptions(SAMPLE_SUBSCRIPTIONS);
    setSubscriptions(SAMPLE_SUBSCRIPTIONS);
  };

  /**
   * Tüm verileri temizle (debug için)
   */
  const clearAllData = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setSubscriptions([]);
  };

  const value = {
    subscriptions,
    loading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    getStatistics,
    loadSampleData,
    clearAllData,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

/**
 * Custom hook - Abonelik verilerine kolay erişim
 */
export const useSubscriptions = () => {
  const context = useContext(SubscriptionContext);

  if (!context) {
    throw new Error(
      'useSubscriptions must be used within SubscriptionProvider'
    );
  }

  return context;
};

/**
 * Kategori adlarını Türkçe'ye çevir
 */
const getCategoryName = (category) => {
  const names = {
    streaming: 'Video Streaming',
    music: 'Müzik',
    productivity: 'Üretkenlik',
    gaming: 'Oyun',
    fitness: 'Sağlık & Fitness',
    news: 'Haber',
    education: 'Eğitim',
    storage: 'Depolama',
    other: 'Diğer',
  };

  return names[category] || 'Diğer';
};

export default SubscriptionContext;
