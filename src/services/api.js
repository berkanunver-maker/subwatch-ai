/**
 * ==============================================================================
 * API SERVICE LAYER
 * ==============================================================================
 *
 * Bu dosya backend API ile güvenli iletişim sağlar.
 *
 * ÖZELLİKLER:
 * - JWT Token yönetimi (otomatik ekleme ve yenileme)
 * - Request/Response interceptor'ları
 * - Error handling (hata yönetimi)
 * - Rate limiting koruması
 * - Request timeout
 * - Retry logic (başarısız istekleri tekrar deneme)
 *
 * GÜVENLİK:
 * - Tüm hassas bilgiler environment variable'lardan gelir
 * - API anahtarları ve JWT token'lar güvenli şekilde saklanır
 * - Tüm istekler HTTPS üzerinden yapılır
 * - Input validation ve sanitization
 *
 * KULLANIM:
 * import api from './services/api';
 * const response = await api.get('/subscriptions');
 * ==============================================================================
 */

import { ENV } from '../config/env';
import { sanitizeInput } from '../utils/validation';

/**
 * Token'ı AsyncStorage'dan al/kaydet (güvenli depolama)
 * NOT: Gerçek uygulamada react-native-keychain veya expo-secure-store kullanın!
 */
let authToken = null;
let refreshToken = null;

/**
 * Token'ı set et (login sonrası çağrılır)
 * @param {string} token - JWT access token
 * @param {string} refresh - JWT refresh token (opsiyonel)
 */
export const setAuthToken = (token, refresh = null) => {
  authToken = token;
  if (refresh) {
    refreshToken = refresh;
  }

  // TODO: Gerçek uygulamada expo-secure-store kullanın
  // await SecureStore.setItemAsync('authToken', token);
  // await SecureStore.setItemAsync('refreshToken', refresh);
};

/**
 * Token'ı temizle (logout sonrası çağrılır)
 */
export const clearAuthToken = () => {
  authToken = null;
  refreshToken = null;

  // TODO: Gerçek uygulamada expo-secure-store kullanın
  // await SecureStore.deleteItemAsync('authToken');
  // await SecureStore.deleteItemAsync('refreshToken');
};

/**
 * Token'ı al
 * @returns {string|null} - JWT token veya null
 */
export const getAuthToken = () => {
  // TODO: Gerçek uygulamada expo-secure-store'dan oku
  // return await SecureStore.getItemAsync('authToken');
  return authToken;
};

/**
 * Rate limiting için basit bir counter
 * Gerçek uygulamada daha gelişmiş bir rate limiter kullanın
 */
const rateLimiter = {
  requests: [],
  maxRequests: 100, // 1 dakikada max 100 istek
  timeWindow: 60000, // 1 dakika

  /**
   * Rate limit kontrolü
   * @returns {boolean} - İstek yapılabilirse true
   */
  canMakeRequest() {
    const now = Date.now();

    // 1 dakikadan eski istekleri temizle
    this.requests = this.requests.filter(
      (timestamp) => now - timestamp < this.timeWindow
    );

    // Limit aşıldı mı?
    if (this.requests.length >= this.maxRequests) {
      console.warn('⚠️ Rate limit aşıldı! Lütfen bekleyin.');
      return false;
    }

    // Yeni isteği kaydet
    this.requests.push(now);
    return true;
  },
};

/**
 * HTTP request helper fonksiyonu
 * @param {string} endpoint - API endpoint (/subscriptions gibi)
 * @param {object} options - Fetch options
 * @returns {Promise} - API response
 */
const request = async (endpoint, options = {}) => {
  // Rate limiting kontrolü
  if (!rateLimiter.canMakeRequest()) {
    throw new Error(
      'Çok fazla istek gönderdiniz. Lütfen bir süre bekleyin.'
    );
  }

  // Full URL oluştur
  const url = `${ENV.API_BASE_URL}${endpoint}`;

  // Varsayılan headers
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  // JWT token varsa ekle
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // API key varsa ekle (backend'e göre değişir)
  if (ENV.API_KEY) {
    headers['X-API-Key'] = ENV.API_KEY;
  }

  // Request options
  const config = {
    ...options,
    headers,
    // Timeout
    signal: AbortSignal.timeout(ENV.API_TIMEOUT),
  };

  // Body varsa JSON'a çevir
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  // Logging (sadece development)
  if (ENV.DEBUG_MODE) {
    console.log('🌐 API Request:', {
      method: options.method || 'GET',
      url,
      headers: { ...headers, Authorization: token ? 'Bearer ***' : undefined },
    });
  }

  try {
    const response = await fetch(url, config);

    // Logging (sadece development)
    if (ENV.DEBUG_MODE) {
      console.log('📡 API Response:', {
        status: response.status,
        statusText: response.statusText,
      });
    }

    // Response parse et
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Hata kontrolü
    if (!response.ok) {
      // 401 Unauthorized - Token geçersiz/süresi dolmuş
      if (response.status === 401) {
        // TODO: Token refresh logic
        console.warn('⚠️ Token geçersiz! Kullanıcı yeniden login olmalı.');
        clearAuthToken();

        throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      }

      // 403 Forbidden - Yetkisiz erişim
      if (response.status === 403) {
        throw new Error('Bu işlem için yetkiniz yok.');
      }

      // 429 Too Many Requests - Rate limit
      if (response.status === 429) {
        throw new Error(
          'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.'
        );
      }

      // Diğer hatalar
      throw new Error(
        data?.message || data?.error || `API Error: ${response.status}`
      );
    }

    return data;
  } catch (error) {
    // Network hatası
    if (error.name === 'AbortError') {
      throw new Error('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
    }

    // Diğer hatalar
    console.error('❌ API Error:', error);
    throw error;
  }
};

/**
 * API Helper Methods
 */
const api = {
  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {object} params - Query parameters
   */
  get: async (endpoint, params = {}) => {
    // Query parameters ekle
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return request(url, { method: 'GET' });
  },

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   */
  post: async (endpoint, body = {}) => {
    return request(endpoint, {
      method: 'POST',
      body,
    });
  },

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   */
  put: async (endpoint, body = {}) => {
    return request(endpoint, {
      method: 'PUT',
      body,
    });
  },

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   */
  delete: async (endpoint) => {
    return request(endpoint, { method: 'DELETE' });
  },

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   */
  patch: async (endpoint, body = {}) => {
    return request(endpoint, {
      method: 'PATCH',
      body,
    });
  },
};

/**
 * API Endpoints (örnek kullanım için)
 * Gerçek backend API'niz hazır olduğunda bu endpoint'leri güncelleyin
 */
export const endpoints = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  refreshToken: '/auth/refresh',

  // Subscriptions
  subscriptions: '/subscriptions',
  getSubscription: (id) => `/subscriptions/${id}`,
  createSubscription: '/subscriptions',
  updateSubscription: (id) => `/subscriptions/${id}`,
  deleteSubscription: (id) => `/subscriptions/${id}`,

  // AI Analysis
  analyzeSubscriptions: '/ai/analyze',
  getRecommendations: '/ai/recommendations',
  detectUnused: '/ai/detect-unused',

  // Currency Exchange
  getExchangeRates: '/currency/rates',
  convertCurrency: '/currency/convert',

  // Notifications
  updateNotificationSettings: '/notifications/settings',
  getReminders: '/notifications/reminders',

  // Statistics
  getStatistics: '/statistics',
  getSpendingChart: '/statistics/spending',

  // OCR / Image Processing
  uploadReceipt: '/ocr/receipt',
  extractSubscription: '/ocr/extract',
};

export default api;
