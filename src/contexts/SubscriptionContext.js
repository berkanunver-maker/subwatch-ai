/**
 * ==============================================================================
 * SUBSCRIPTION CONTEXT
 * ==============================================================================
 *
 * Abonelik verilerini global olarak yöneten Context API
 *
 * ÖZELLİKLER:
 * - Firebase Firestore ile cloud storage
 * - Real-time updates (onSnapshot listeners)
 * - Kullanıcı bazlı veri saklama
 * - CRUD işlemleri (Create, Read, Update, Delete)
 * - İstatistik hesaplamaları
 * - Local -> Cloud migration
 *
 * KULLANIM:
 * import { useSubscriptions } from './contexts/SubscriptionContext';
 *
 * const { subscriptions, addSubscription, deleteSubscription } = useSubscriptions();
 * ==============================================================================
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

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
  migrateToCloud: () => {},
});

/**
 * Örnek abonelikler (ilk kullanım için)
 */
const SAMPLE_SUBSCRIPTIONS = [
  {
    name: 'Netflix',
    price: 149.99,
    currency: 'TRY',
    billingCycle: 'monthly', // 'monthly' | 'yearly'
    category: 'streaming',
    nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    notes: 'Premium plan',
  },
  {
    name: 'Spotify',
    price: 59.99,
    currency: 'TRY',
    billingCycle: 'monthly',
    category: 'music',
    nextBillingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    notes: 'Premium Individual',
  },
  {
    name: 'YouTube Premium',
    price: 89.99,
    currency: 'TRY',
    billingCycle: 'monthly',
    category: 'streaming',
    nextBillingDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    notes: '',
  },
  {
    name: 'Adobe Creative Cloud',
    price: 699.99,
    currency: 'TRY',
    billingCycle: 'monthly',
    category: 'productivity',
    nextBillingDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    notes: 'All Apps plan',
  },
  {
    name: 'iCloud',
    price: 29.99,
    currency: 'TRY',
    billingCycle: 'monthly',
    category: 'storage',
    nextBillingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    notes: '200GB plan',
  },
];

/**
 * Subscription Provider Component
 */
export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unsubscribe, setUnsubscribe] = useState(null);

  /**
   * Kullanıcı değiştiğinde abonelikleri yükle
   */
  useEffect(() => {
    if (user) {
      // Kullanıcı giriş yapmışsa Firestore'dan dinle
      setupFirestoreListener();
    } else {
      // Kullanıcı çıkış yapmışsa listener'ı temizle
      if (unsubscribe) {
        unsubscribe();
        setUnsubscribe(null);
      }
      setSubscriptions([]);
      setLoading(false);
    }

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  /**
   * Firestore real-time listener kurulumu
   */
  const setupFirestoreListener = () => {
    try {
      setLoading(true);

      // Kullanıcıya ait abonelikler collection'ı
      const subscriptionsRef = collection(db, 'users', user.uid, 'subscriptions');

      // Real-time listener
      const unsubscribeFn = onSnapshot(
        subscriptionsRef,
        async (snapshot) => {
          const subs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setSubscriptions(subs);

          // İlk kullanımdaysa ve abonelik yoksa örnek verileri yükle
          if (snapshot.empty) {
            console.log('📦 İlk kullanım - örnek abonelikler yükleniyor...');
            await loadSampleData();
          } else {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Firestore listener hatası:', error);
          setLoading(false);
        }
      );

      setUnsubscribe(() => unsubscribeFn);
    } catch (error) {
      console.error('Firestore listener kurulumu hatası:', error);
      setLoading(false);
    }
  };

  /**
   * Yeni abonelik ekle (Firestore)
   */
  const addSubscription = async (subscription) => {
    if (!user) {
      throw new Error('Kullanıcı giriş yapmamış');
    }

    try {
      const subscriptionsRef = collection(db, 'users', user.uid, 'subscriptions');

      const newSubscription = {
        ...subscription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: subscription.isActive ?? true,
      };

      const docRef = await addDoc(subscriptionsRef, newSubscription);

      console.log('✅ Abonelik eklendi:', docRef.id);
      return { id: docRef.id, ...newSubscription };
    } catch (error) {
      console.error('Abonelik eklenirken hata:', error);
      throw error;
    }
  };

  /**
   * Abonelik güncelle (Firestore)
   */
  const updateSubscription = async (id, updates) => {
    if (!user) {
      throw new Error('Kullanıcı giriş yapmamış');
    }

    try {
      const docRef = doc(db, 'users', user.uid, 'subscriptions', id);

      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      console.log('✅ Abonelik güncellendi:', id);
    } catch (error) {
      console.error('Abonelik güncellenirken hata:', error);
      throw error;
    }
  };

  /**
   * Abonelik sil (Firestore)
   */
  const deleteSubscription = async (id) => {
    if (!user) {
      throw new Error('Kullanıcı giriş yapmamış');
    }

    try {
      const docRef = doc(db, 'users', user.uid, 'subscriptions', id);
      await deleteDoc(docRef);

      console.log('✅ Abonelik silindi:', id);
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
      totalSpent: totalYearly,
      savingsPotential: 0, // AI analizi ile hesaplanacak
    };
  };

  /**
   * Örnek verileri yükle (Firestore)
   */
  const loadSampleData = async () => {
    if (!user) {
      console.warn('Kullanıcı giriş yapmamış');
      return;
    }

    try {
      setLoading(true);

      for (const sub of SAMPLE_SUBSCRIPTIONS) {
        await addSubscription(sub);
      }

      console.log('✅ Örnek veriler yüklendi');
    } catch (error) {
      console.error('Örnek veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Local AsyncStorage'dan Cloud Firestore'a migration
   * (Eski kullanıcılar için)
   */
  const migrateToCloud = async () => {
    if (!user) {
      throw new Error('Kullanıcı giriş yapmamış');
    }

    try {
      setLoading(true);

      // Local storage'dan oku
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (!stored) {
        console.log('📦 Local storage\'da veri yok');
        return;
      }

      const localSubs = JSON.parse(stored);

      if (localSubs.length === 0) {
        console.log('📦 Local storage boş');
        return;
      }

      console.log(`🔄 ${localSubs.length} abonelik Cloud'a taşınıyor...`);

      // Firestore'a taşı
      for (const sub of localSubs) {
        // ID'yi kaldır (Firestore yeni ID oluşturacak)
        const { id, ...subData } = sub;
        await addSubscription(subData);
      }

      // Local storage'ı temizle
      await AsyncStorage.removeItem(STORAGE_KEY);

      console.log('✅ Migration tamamlandı!');
    } catch (error) {
      console.error('Migration hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tüm verileri temizle (debug için)
   */
  const clearAllData = async () => {
    if (!user) {
      return;
    }

    try {
      const subscriptionsRef = collection(db, 'users', user.uid, 'subscriptions');
      const snapshot = await getDocs(subscriptionsRef);

      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      console.log('✅ Tüm veriler temizlendi');
    } catch (error) {
      console.error('Veri temizleme hatası:', error);
      throw error;
    }
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
    migrateToCloud,
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
