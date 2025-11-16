/**
 * ==============================================================================
 * EXPO APP CONFIGURATION
 * ==============================================================================
 *
 * Bu dosya Expo uygulamasının temel konfigürasyonunu ve
 * environment variable'ların nasıl yükleneceğini tanımlar.
 *
 * .env dosyasındaki değerleri bu dosya üzerinden Expo'ya aktarıyoruz.
 * ==============================================================================
 */

// dotenv kullanarak .env dosyasını yükle
// NOT: Expo'da dotenv kullanmak için 'dotenv' paketi yüklenmeli
// npm install dotenv
require('dotenv').config();

export default {
  expo: {
    name: 'SubWatch AI',
    slug: 'subwatch-ai',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#6366f1',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.subwatch.ai',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#6366f1',
      },
      package: 'com.subwatch.ai',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    /**
     * Environment variable'ları Expo'ya aktar
     * Bu değerler Constants.expoConfig.extra üzerinden erişilebilir
     */
    extra: {
      // Backend API
      API_BASE_URL: process.env.API_BASE_URL,
      API_TIMEOUT: process.env.API_TIMEOUT,

      // Security Keys
      JWT_SECRET: process.env.JWT_SECRET,
      API_KEY: process.env.API_KEY,

      // AI/ML Services
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      AI_MODEL: process.env.AI_MODEL,

      // Currency Exchange
      EXCHANGE_RATE_API_KEY: process.env.EXCHANGE_RATE_API_KEY,
      EXCHANGE_RATE_API_URL: process.env.EXCHANGE_RATE_API_URL,

      // Push Notifications
      ONESIGNAL_APP_ID: process.env.ONESIGNAL_APP_ID,
      FCM_SERVER_KEY: process.env.FCM_SERVER_KEY,

      // Analytics
      SENTRY_DSN: process.env.SENTRY_DSN,
      GA_TRACKING_ID: process.env.GA_TRACKING_ID,

      // Payment
      STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,

      // General
      ENVIRONMENT: process.env.ENVIRONMENT,
      DEBUG_MODE: process.env.DEBUG_MODE,
      LOG_LEVEL: process.env.LOG_LEVEL,
    },
  },
};
