/**
 * ==============================================================================
 * ENVIRONMENT CONFIGURATION
 * ==============================================================================
 *
 * Bu dosya environment variable'ları yönetir ve uygulama genelinde
 * güvenli bir şekilde kullanılmasını sağlar.
 *
 * KULLANIM:
 * import { ENV } from './config/env';
 * console.log(ENV.API_BASE_URL);
 *
 * GÜVENLİK NOTU:
 * - Bu dosya sadece .env dosyasından okuma yapar
 * - Hiçbir hassas bilgi bu dosyada hardcoded olmamalıdır
 * - Tüm kritik değerler .env dosyasından gelmelidir
 * ==============================================================================
 */

// React Native'de environment variable okumak için
// expo-constants kullanıyoruz
import Constants from 'expo-constants';

/**
 * Environment variable'ları okur ve varsayılan değerlerle döner
 * UYARI: Varsayılan değerler sadece development için kullanılmalıdır
 */
const getEnvVar = (key, defaultValue = '') => {
  // Expo'da .env dosyasını kullanmak için extra config'den okuyoruz
  const value = Constants.expoConfig?.extra?.[key] || process.env[key];

  if (!value && !defaultValue) {
    console.warn(`⚠️ Environment variable '${key}' bulunamadı!`);
  }

  return value || defaultValue;
};

/**
 * Uygulama genelinde kullanılacak configuration objesi
 * Tüm hassas bilgiler buradan erişilir
 */
export const ENV = {
  // ------------------------------------------------------------------------------
  // BACKEND API AYARLARI
  // ------------------------------------------------------------------------------
  API_BASE_URL: getEnvVar(
    'API_BASE_URL',
    'https://api-demo.subwatch.example.com/v1' // Demo endpoint (sadece örnek)
  ),

  API_TIMEOUT: parseInt(getEnvVar('API_TIMEOUT', '30000'), 10),

  // ------------------------------------------------------------------------------
  // GÜVENLİK ANAHTARLARI
  // ------------------------------------------------------------------------------
  JWT_SECRET: getEnvVar('JWT_SECRET', ''), // ASLA varsayılan değer verme!

  API_KEY: getEnvVar('API_KEY', ''), // ASLA varsayılan değer verme!

  // ------------------------------------------------------------------------------
  // AI/ML SERVIS AYARLARI
  // ------------------------------------------------------------------------------
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY', ''), // ASLA varsayılan değer verme!

  AI_MODEL: getEnvVar('AI_MODEL', 'gpt-3.5-turbo'),

  // ------------------------------------------------------------------------------
  // DÖVİZ KURU API
  // ------------------------------------------------------------------------------
  EXCHANGE_RATE_API_KEY: getEnvVar('EXCHANGE_RATE_API_KEY', ''),

  EXCHANGE_RATE_API_URL: getEnvVar(
    'EXCHANGE_RATE_API_URL',
    'https://api.exchangerate-api.com/v4/latest'
  ),

  // ------------------------------------------------------------------------------
  // PUSH NOTIFICATION
  // ------------------------------------------------------------------------------
  ONESIGNAL_APP_ID: getEnvVar('ONESIGNAL_APP_ID', ''),

  FCM_SERVER_KEY: getEnvVar('FCM_SERVER_KEY', ''),

  // ------------------------------------------------------------------------------
  // ANALYTICS & MONITORING
  // ------------------------------------------------------------------------------
  SENTRY_DSN: getEnvVar('SENTRY_DSN', ''),

  GA_TRACKING_ID: getEnvVar('GA_TRACKING_ID', ''),

  // ------------------------------------------------------------------------------
  // ÖDEME SİSTEMLERİ
  // ------------------------------------------------------------------------------
  STRIPE_PUBLIC_KEY: getEnvVar('STRIPE_PUBLIC_KEY', ''),

  // ------------------------------------------------------------------------------
  // GENEL AYARLAR
  // ------------------------------------------------------------------------------
  ENVIRONMENT: getEnvVar('ENVIRONMENT', 'development'),

  DEBUG_MODE: getEnvVar('DEBUG_MODE', 'true') === 'true',

  LOG_LEVEL: getEnvVar('LOG_LEVEL', 'debug'),

  // ------------------------------------------------------------------------------
  // YARDIMCI FONKSİYONLAR
  // ------------------------------------------------------------------------------

  /**
   * Ortamın production olup olmadığını kontrol eder
   */
  isProduction: () => {
    return ENV.ENVIRONMENT === 'production';
  },

  /**
   * Ortamın development olup olmadığını kontrol eder
   */
  isDevelopment: () => {
    return ENV.ENVIRONMENT === 'development';
  },

  /**
   * Tüm kritik environment variable'ların set edilip edilmediğini kontrol eder
   * Uygulama başlarken bu fonksiyonu çağırın
   */
  validateConfig: () => {
    const requiredVars = [
      'API_BASE_URL',
      // Production'da mutlaka olması gerekenler:
      // 'JWT_SECRET',
      // 'API_KEY',
      // 'OPENAI_API_KEY',
    ];

    const missingVars = requiredVars.filter(key => !ENV[key]);

    if (missingVars.length > 0) {
      console.error('❌ Eksik environment variable\'lar:', missingVars);

      if (ENV.isProduction()) {
        throw new Error(
          `Production ortamında zorunlu environment variable'lar eksik: ${missingVars.join(', ')}`
        );
      }
    }

    return missingVars.length === 0;
  },
};

// Development ortamında tüm config'i logla (debugging için)
if (ENV.DEBUG_MODE && !ENV.isProduction()) {
  console.log('📋 Environment Configuration:', {
    ENVIRONMENT: ENV.ENVIRONMENT,
    API_BASE_URL: ENV.API_BASE_URL,
    DEBUG_MODE: ENV.DEBUG_MODE,
    LOG_LEVEL: ENV.LOG_LEVEL,
    // Hassas bilgileri loglama!
    // JWT_SECRET: '***',
    // API_KEY: '***',
  });
}
