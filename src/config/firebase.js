/**
 * ==============================================================================
 * FIREBASE CONFIGURATION
 * ==============================================================================
 *
 * Firebase Authentication ve Firestore yapılandırması
 *
 * ÖZELLİKLER:
 * - Firebase Authentication (Google Sign-In + Email/Password)
 * - Cloud Firestore (kullanıcı verileri ve abonelikler)
 * - Güvenli credential yönetimi (.env dosyasından)
 *
 * KURULUM:
 * 1. Firebase Console'da proje oluşturun: https://console.firebase.google.com
 * 2. Web uygulaması ekleyin ve config bilgilerini alın
 * 3. .env dosyasına Firebase config değerlerini ekleyin
 * 4. Authentication ve Firestore'u Firebase Console'dan aktifleştirin
 * ==============================================================================
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from './env';

/**
 * Firebase yapılandırma objesi
 * Değerler .env dosyasından alınır
 */
const firebaseConfig = {
  apiKey: ENV.FIREBASE_API_KEY,
  authDomain: ENV.FIREBASE_AUTH_DOMAIN,
  projectId: ENV.FIREBASE_PROJECT_ID,
  storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.FIREBASE_APP_ID,
  measurementId: ENV.FIREBASE_MEASUREMENT_ID, // İsteğe bağlı (Analytics için)
};

/**
 * Firebase uygulamasını başlat
 * Çoklu initialization'ı önlemek için kontrol eder
 */
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

/**
 * Firebase Authentication
 * React Native için AsyncStorage persistence kullanır
 */
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // Eğer auth zaten initialize edilmişse, mevcut instance'ı kullan
  auth = getAuth(app);
}

/**
 * Cloud Firestore
 * Kullanıcı verileri ve abonelikleri saklamak için
 */
const db = getFirestore(app);

/**
 * Firebase instance'larını export et
 */
export { app, auth, db };

/**
 * Firebase yapılandırma kontrolü
 * Development ortamında config'in doğru yüklendiğini kontrol eder
 */
export const validateFirebaseConfig = () => {
  const requiredFields = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_APP_ID',
  ];

  const missingFields = requiredFields.filter(field => !ENV[field]);

  if (missingFields.length > 0) {
    console.error('❌ Eksik Firebase config değerleri:', missingFields);

    if (ENV.isProduction()) {
      throw new Error(
        `Production ortamında Firebase config eksik: ${missingFields.join(', ')}`
      );
    }

    return false;
  }

  if (ENV.isDevelopment()) {
    console.log('✅ Firebase config başarıyla yüklendi');
    console.log('📦 Project ID:', ENV.FIREBASE_PROJECT_ID);
  }

  return true;
};

// Development ortamında config'i doğrula
if (ENV.isDevelopment()) {
  validateFirebaseConfig();
}
