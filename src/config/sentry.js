/**
 * ==============================================================================
 * SENTRY CONFIGURATION
 * ==============================================================================
 *
 * Sentry error tracking ve performance monitoring konfigürasyonu
 *
 * ÖZELLİKLER:
 * - Production error tracking
 * - Performance monitoring
 * - Breadcrumbs (hata öncesi kullanıcı aksiyonları)
 * - User context (kullanıcı bilgileri)
 * - Release tracking
 *
 * KULLANIM:
 * import { initializeSentry } from './config/sentry';
 * initializeSentry(); // App.js'de çağır
 *
 * SETUP:
 * 1. Sentry hesabı oluştur: https://sentry.io
 * 2. Proje oluştur (React Native seç)
 * 3. DSN'i .env dosyasına ekle: SENTRY_DSN=...
 * ==============================================================================
 */

import * as Sentry from 'sentry-expo';
import { ENV } from './env';
import { SENTRY, APP } from './constants';

/**
 * Sentry'yi başlat
 */
export const initializeSentry = () => {
  // Sadece production'da aktif
  if (!SENTRY.ENABLED || !ENV.SENTRY_DSN) {
    if (ENV.DEBUG_MODE) {
      console.log('ℹ️ Sentry devre dışı (development mode veya DSN eksik)');
    }
    return;
  }

  try {
    Sentry.init({
      // Sentry DSN (Data Source Name)
      dsn: ENV.SENTRY_DSN,

      // Environment (production, staging, development)
      environment: ENV.isDevelopment() ? 'development' : 'production',

      // App release version
      release: `${APP.NAME}@${APP.VERSION}`,
      dist: APP.BUILD.toString(),

      // Error sampling rate (1.0 = %100)
      sampleRate: SENTRY.SAMPLE_RATE,

      // Performance monitoring (traces)
      tracesSampleRate: SENTRY.TRACES_SAMPLE_RATE,

      // Breadcrumbs (kullanıcı aksiyonları)
      beforeBreadcrumb: (breadcrumb) => {
        // Hassas bilgileri filtrele
        if (breadcrumb.category === 'console') {
          return null; // Console log'ları gönderme
        }
        return breadcrumb;
      },

      // Error filtering
      beforeSend: (event, hint) => {
        // Development'ta console'a da yaz
        if (ENV.DEBUG_MODE) {
          console.error('Sentry Event:', event);
          console.error('Hint:', hint);
        }

        // Hassas bilgileri temizle
        if (event.request?.headers) {
          delete event.request.headers.Authorization;
          delete event.request.headers['X-API-Key'];
        }

        return event;
      },

      // Enable automatic session tracking
      enableAutoSessionTracking: true,

      // Sessions close after app is 10 seconds in the background
      sessionTrackingIntervalMillis: 10000,

      // Enable Native (Crash handling)
      enableNative: true,

      // Enable JavaScript error tracking
      enableNativeNagger: false,
    });

    if (ENV.DEBUG_MODE) {
      console.log('✅ Sentry başlatıldı');
    }
  } catch (error) {
    console.error('❌ Sentry başlatma hatası:', error);
  }
};

/**
 * Kullanıcı bilgisini Sentry'ye kaydet
 */
export const setSentryUser = (user) => {
  if (!SENTRY.ENABLED) return;

  try {
    Sentry.setUser({
      id: user.uid,
      email: user.email,
      username: user.displayName || user.email,
    });

    if (ENV.DEBUG_MODE) {
      console.log('✅ Sentry user set:', user.email);
    }
  } catch (error) {
    console.error('❌ Sentry user set hatası:', error);
  }
};

/**
 * Kullanıcı bilgisini Sentry'den temizle
 */
export const clearSentryUser = () => {
  if (!SENTRY.ENABLED) return;

  try {
    Sentry.setUser(null);

    if (ENV.DEBUG_MODE) {
      console.log('✅ Sentry user cleared');
    }
  } catch (error) {
    console.error('❌ Sentry user clear hatası:', error);
  }
};

/**
 * Manuel hata gönderme (özel durumlar için)
 */
export const captureException = (error, context = {}) => {
  if (!SENTRY.ENABLED) {
    console.error('Error (Sentry disabled):', error, context);
    return;
  }

  try {
    Sentry.captureException(error, {
      extra: context,
    });
  } catch (err) {
    console.error('❌ Sentry capture hatası:', err);
  }
};

/**
 * Manuel mesaj gönderme (info/warning için)
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  if (!SENTRY.ENABLED) {
    console.log(`Message (Sentry disabled) [${level}]:`, message, context);
    return;
  }

  try {
    Sentry.captureMessage(message, {
      level, // 'fatal', 'error', 'warning', 'log', 'info', 'debug'
      extra: context,
    });
  } catch (err) {
    console.error('❌ Sentry message hatası:', err);
  }
};

/**
 * Breadcrumb ekle (kullanıcı aksiyonları)
 */
export const addBreadcrumb = (category, message, data = {}) => {
  if (!SENTRY.ENABLED) return;

  try {
    Sentry.addBreadcrumb({
      category,
      message,
      data,
      level: 'info',
    });
  } catch (err) {
    console.error('❌ Sentry breadcrumb hatası:', err);
  }
};

/**
 * Transaction başlat (performance monitoring)
 */
export const startTransaction = (name, op = 'task') => {
  if (!SENTRY.ENABLED) return null;

  try {
    return Sentry.startTransaction({
      name,
      op,
    });
  } catch (err) {
    console.error('❌ Sentry transaction hatası:', err);
    return null;
  }
};

export default {
  initializeSentry,
  setSentryUser,
  clearSentryUser,
  captureException,
  captureMessage,
  addBreadcrumb,
  startTransaction,
};
