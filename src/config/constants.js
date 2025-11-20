/**
 * ==============================================================================
 * APPLICATION CONSTANTS
 * ==============================================================================
 *
 * Uygulama genelinde kullanılan sabit değerler
 *
 * Magic number'ları önlemek ve bakımı kolaylaştırmak için kullanılır
 * ==============================================================================
 */

// ============================================================================
// TIME CONSTANTS (milliseconds)
// ============================================================================
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000, // Yaklaşık
  YEAR: 365 * 24 * 60 * 60 * 1000, // Yaklaşık
};

// ============================================================================
// SUBSCRIPTION RENEWAL WARNING
// ============================================================================
export const SUBSCRIPTION = {
  RENEWAL_WARNING_DAYS: 3, // Yenileme X gün kala uyarı göster
  RENEWAL_CRITICAL_DAYS: 1, // Kritik uyarı
  INACTIVE_DAYS_THRESHOLD: 30, // X gün kullanılmamışsa "kullanılmıyor" olarak işaretle
};

// ============================================================================
// API RATE LIMITING
// ============================================================================
export const API = {
  RATE_LIMIT_MAX_REQUESTS: 100, // Dakikada maksimum istek
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 dakika
  REQUEST_TIMEOUT: 30 * 1000, // 30 saniye
  RETRY_MAX_ATTEMPTS: 3,
  RETRY_DELAY: 2 * 1000, // 2 saniye
  RETRY_BACKOFF_MULTIPLIER: 2, // Exponential backoff
};

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================
export const TOKEN = {
  REFRESH_THRESHOLD: 5 * 60 * 1000, // Token 5 dakika kala yenile
  MAX_AGE: 60 * 60 * 1000, // 1 saat
  STORAGE_KEY: 'authToken',
  REFRESH_KEY: 'refreshToken',
};

// ============================================================================
// GMAIL API
// ============================================================================
export const GMAIL = {
  MAX_RESULTS: 50, // Maksimum email getir
  MAX_RETRY: 1, // Maksimum retry sayısı (infinite loop önleme)
  SCOPES: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
};

// ============================================================================
// VALIDATION RULES
// ============================================================================
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  DISPLAY_NAME_MIN_LENGTH: 2,
  DISPLAY_NAME_MAX_LENGTH: 50,
  PRICE_MIN: 0,
  PRICE_MAX: 999999,
  DESCRIPTION_MAX_LENGTH: 500,
};

// ============================================================================
// CURRENCY
// ============================================================================
export const CURRENCY = {
  DEFAULT: 'TRY',
  SUPPORTED: ['TRY', 'USD', 'EUR', 'GBP'],
  SYMBOLS: {
    TRY: '₺',
    USD: '$',
    EUR: '€',
    GBP: '£',
  },
};

// ============================================================================
// LANGUAGE
// ============================================================================
export const LANGUAGE = {
  DEFAULT: 'tr',
  SUPPORTED: ['tr', 'en'],
  NAMES: {
    tr: 'Türkçe',
    en: 'English',
  },
};

// ============================================================================
// BILLING CYCLES
// ============================================================================
export const BILLING_CYCLE = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  WEEKLY: 'weekly',
  DAILY: 'daily',
  LABELS: {
    monthly: 'Aylık',
    yearly: 'Yıllık',
    weekly: 'Haftalık',
    daily: 'Günlük',
  },
};

// ============================================================================
// SUBSCRIPTION CATEGORIES
// ============================================================================
export const CATEGORY = {
  STREAMING: 'streaming',
  MUSIC: 'music',
  CLOUD_STORAGE: 'cloud',
  SOFTWARE: 'software',
  PRODUCTIVITY: 'productivity',
  GAMING: 'gaming',
  NEWS: 'news',
  FITNESS: 'fitness',
  EDUCATION: 'education',
  OTHER: 'other',
  LABELS: {
    streaming: 'Video Yayın',
    music: 'Müzik',
    cloud: 'Bulut Depolama',
    software: 'Yazılım',
    productivity: 'Üretkenlik',
    gaming: 'Oyun',
    news: 'Haber/Dergi',
    fitness: 'Spor/Sağlık',
    education: 'Eğitim',
    other: 'Diğer',
  },
  ICONS: {
    streaming: '🎬',
    music: '🎵',
    cloud: '☁️',
    software: '💻',
    productivity: '💼',
    gaming: '🎮',
    news: '📰',
    fitness: '💪',
    education: '📚',
    other: '📦',
  },
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'İnternet bağlantınızı kontrol edin',
  AUTH_FAILED: 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.',
  SESSION_EXPIRED: 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.',
  INVALID_EMAIL: 'Geçersiz email adresi',
  INVALID_PASSWORD: 'Şifre en az 8 karakter olmalıdır',
  UNKNOWN_ERROR: 'Beklenmeyen bir hata oluştu',
  RATE_LIMIT_EXCEEDED: 'Çok fazla istek gönderildi. Lütfen bekleyin.',
};

// ============================================================================
// STORAGE KEYS
// ============================================================================
export const STORAGE_KEYS = {
  THEME: 'app-theme',
  LANGUAGE: 'app-language',
  CURRENCY: 'app-currency',
  NOTIFICATIONS: 'app-notifications',
  GMAIL_TOKEN: 'gmail-access-token',
  GMAIL_REFRESH: 'gmail-refresh-token',
  LAST_SYNC: 'last-sync-timestamp',
};

// ============================================================================
// SENTRY
// ============================================================================
export const SENTRY = {
  ENABLED: !__DEV__, // Production'da aktif
  SAMPLE_RATE: 1.0, // %100 error capture
  TRACES_SAMPLE_RATE: 0.2, // %20 performance monitoring
};

// ============================================================================
// CHART COLORS
// ============================================================================
export const CHART_COLORS = {
  PRIMARY: '#6366f1', // Indigo
  SECONDARY: '#8b5cf6', // Purple
  SUCCESS: '#10b981', // Green
  WARNING: '#f59e0b', // Amber
  DANGER: '#ef4444', // Red
  INFO: '#3b82f6', // Blue
  GRADIENT: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'],
};

// ============================================================================
// APP VERSION
// ============================================================================
export const APP = {
  NAME: 'SubWatch AI',
  VERSION: '1.0.0',
  BUILD: 1,
  SUPPORT_EMAIL: 'support@subwatch.ai',
  PRIVACY_URL: 'https://subwatch.ai/privacy',
  TERMS_URL: 'https://subwatch.ai/terms',
};

// ============================================================================
// DEFAULT VALUES
// ============================================================================
export const DEFAULTS = {
  SUBSCRIPTION: {
    currency: CURRENCY.DEFAULT,
    billingCycle: BILLING_CYCLE.MONTHLY,
    isActive: true,
    category: CATEGORY.OTHER,
  },
};

export default {
  TIME,
  SUBSCRIPTION,
  API,
  TOKEN,
  GMAIL,
  VALIDATION,
  CURRENCY,
  LANGUAGE,
  BILLING_CYCLE,
  CATEGORY,
  ERROR_MESSAGES,
  STORAGE_KEYS,
  SENTRY,
  CHART_COLORS,
  APP,
  DEFAULTS,
};
