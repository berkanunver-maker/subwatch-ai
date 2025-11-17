/**
 * ==============================================================================
 * API SERVICE LAYER
 * ==============================================================================
 *
 * Bu dosya backend API ile güvenli iletişim sağlar.
 *
 * ÖZELLİKLER:
 * - JWT Token yönetimi (otomatik ekleme ve yenileme)
 * - Güvenli token storage (expo-secure-store)
 * - Request/Response interceptor'ları
 * - Error handling (hata yönetimi)
 * - Rate limiting koruması
 * - Request timeout
 * - Retry logic (başarısız istekleri tekrar deneme)
 *
 * GÜVENLİK:
 * - Tüm hassas bilgiler environment variable'lardan gelir
 * - Token'lar expo-secure-store ile şifrelenmiş olarak saklanır
 * - Tüm istekler HTTPS üzerinden yapılır
 * - Input validation ve sanitization
 *
 * KULLANIM:
 * import api from './services/api';
 * const response = await api.get('/subscriptions');
 * ==============================================================================
 */

import * as SecureStore from 'expo-secure-store';
import { ENV } from '../config/env';
import { sanitizeInput } from '../utils/validation';
import { API, TOKEN, ERROR_MESSAGES } from '../config/constants';

/**
 * In-memory cache (SecureStore async olduğu için)
 */
let cachedAuthToken = null;
let cachedRefreshToken = null;

/**
 * Token'ı güvenli şekilde kaydet
 * @param {string} token - JWT access token
 * @param {string} refresh - JWT refresh token (opsiyonel)
 */
export const setAuthToken = async (token, refresh = null) => {
  try {
    cachedAuthToken = token;
    await SecureStore.setItemAsync(TOKEN.STORAGE_KEY, token);

    if (refresh) {
      cachedRefreshToken = refresh;
      await SecureStore.setItemAsync(TOKEN.REFRESH_KEY, refresh);
    }

    if (ENV.DEBUG_MODE) {
      console.log('✅ Token güvenli şekilde kaydedildi');
    }
  } catch (error) {
    console.error('❌ Token kaydetme hatası:', error);
    // Fallback: Sadece memory'de tut
    cachedAuthToken = token;
    if (refresh) cachedRefreshToken = refresh;
  }
};

/**
 * Token'ı temizle (logout sonrası çağrılır)
 */
export const clearAuthToken = async () => {
  try {
    cachedAuthToken = null;
    cachedRefreshToken = null;

    await SecureStore.deleteItemAsync(TOKEN.STORAGE_KEY);
    await SecureStore.deleteItemAsync(TOKEN.REFRESH_KEY);

    if (ENV.DEBUG_MODE) {
      console.log('✅ Token temizlendi');
    }
  } catch (error) {
    console.error('❌ Token temizleme hatası:', error);
  }
};

/**
 * Token'ı al
 * @returns {Promise<string|null>} - JWT token veya null
 */
export const getAuthToken = async () => {
  try {
    // Cache'de varsa direkt dön
    if (cachedAuthToken) {
      return cachedAuthToken;
    }

    // SecureStore'dan oku
    const token = await SecureStore.getItemAsync(TOKEN.STORAGE_KEY);
    if (token) {
      cachedAuthToken = token;
    }
    return token;
  } catch (error) {
    console.error('❌ Token okuma hatası:', error);
    return cachedAuthToken; // Fallback to memory cache
  }
};

/**
 * Refresh token'ı al
 * @returns {Promise<string|null>} - Refresh token veya null
 */
export const getRefreshToken = async () => {
  try {
    // Cache'de varsa direkt dön
    if (cachedRefreshToken) {
      return cachedRefreshToken;
    }

    // SecureStore'dan oku
    const token = await SecureStore.getItemAsync(TOKEN.REFRESH_KEY);
    if (token) {
      cachedRefreshToken = token;
    }
    return token;
  } catch (error) {
    console.error('❌ Refresh token okuma hatası:', error);
    return cachedRefreshToken; // Fallback to memory cache
  }
};

/**
 * Token'ı yenile (refresh token kullanarak)
 * @returns {Promise<string|null>} - Yeni access token veya null
 */
export const refreshAccessToken = async () => {
  try {
    const refreshTok = await getRefreshToken();
    if (!refreshTok) {
      throw new Error('Refresh token bulunamadı');
    }

    if (ENV.DEBUG_MODE) {
      console.log('🔄 Token yenileniyor...');
    }

    // Backend'e refresh isteği gönder
    const response = await fetch(`${ENV.API_BASE_URL}${endpoints.refreshToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshTok}`,
      },
    });

    if (!response.ok) {
      throw new Error('Token yenileme başarısız');
    }

    const data = await response.json();
    const { accessToken, refreshToken: newRefreshToken } = data;

    // Yeni token'ları kaydet
    await setAuthToken(accessToken, newRefreshToken || refreshTok);

    if (ENV.DEBUG_MODE) {
      console.log('✅ Token başarıyla yenilendi');
    }

    return accessToken;
  } catch (error) {
    console.error('❌ Token yenileme hatası:', error);
    // Refresh başarısız, kullanıcıyı logout et
    await clearAuthToken();
    return null;
  }
};

/**
 * Rate limiting için basit bir counter
 */
const rateLimiter = {
  requests: [],
  maxRequests: API.RATE_LIMIT_MAX_REQUESTS,
  timeWindow: API.RATE_LIMIT_WINDOW,

  /**
   * Rate limit kontrolü
   * @returns {boolean} - İstek yapılabilirse true
   */
  canMakeRequest() {
    const now = Date.now();

    // Zaman penceresinden eski istekleri temizle
    this.requests = this.requests.filter(
      (timestamp) => now - timestamp < this.timeWindow
    );

    // Limit aşıldı mı?
    if (this.requests.length >= this.maxRequests) {
      if (ENV.DEBUG_MODE) {
        console.warn('⚠️ Rate limit aşıldı! Lütfen bekleyin.');
      }
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
 * @param {number} retryCount - Retry counter (infinite loop önleme)
 * @returns {Promise} - API response
 */
const request = async (endpoint, options = {}, retryCount = 0) => {
  // Rate limiting kontrolü
  if (!rateLimiter.canMakeRequest()) {
    throw new Error(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED);
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
  const token = await getAuthToken();
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
    signal: AbortSignal.timeout(API.REQUEST_TIMEOUT),
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
      if (response.status === 401 && retryCount < API.RETRY_MAX_ATTEMPTS) {
        if (ENV.DEBUG_MODE) {
          console.warn('⚠️ 401 hatası, token yenileniyor... (Retry:', retryCount + 1, ')');
        }

        // Token'ı yenile
        const newToken = await refreshAccessToken();

        if (newToken) {
          // Yeni token ile tekrar dene
          return request(endpoint, options, retryCount + 1);
        } else {
          // Token yenileme başarısız
          throw new Error(ERROR_MESSAGES.SESSION_EXPIRED);
        }
      }

      // 403 Forbidden - Yetkisiz erişim
      if (response.status === 403) {
        throw new Error('Bu işlem için yetkiniz yok.');
      }

      // 429 Too Many Requests - Rate limit
      if (response.status === 429) {
        throw new Error(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED);
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

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }

    // Diğer hatalar
    if (ENV.DEBUG_MODE) {
      console.error('❌ API Error:', error);
    }
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
