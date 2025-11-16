/**
 * ==============================================================================
 * SUBWATCH AI - MAIN APP FILE
 * ==============================================================================
 *
 * AI destekli mobil abonelik takip uygulaması
 *
 * ÖZELLİKLER:
 * - Abonelik yönetimi (ekleme, düzenleme, silme)
 * - AI destekli analiz ve öneriler
 * - Harcama grafikleri ve istatistikler
 * - Otomatik fatura/ekran görüntüsü tanıma
 * - Döviz dönüştürme
 * - Hatırlatıcılar ve bildirimler
 *
 * GÜVENLİK:
 * - Tüm hassas bilgiler .env dosyasında saklanır
 * - JWT token ile backend authentication
 * - Input validation ve sanitization
 * - HTTPS zorunlu iletişim
 *
 * KURULUM:
 * 1. npm install
 * 2. .env.example'ı kopyalayıp .env oluşturun
 * 3. .env içindeki değerleri gerçek bilgilerle doldurun
 * 4. npm start veya expo start
 * ==============================================================================
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { ENV } from './src/config/env';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { SubscriptionProvider } from './src/contexts/SubscriptionContext';
import { GmailProvider } from './src/contexts/GmailContext';

export default function App() {
  /**
   * Uygulama başlangıcında environment config'i doğrula
   */
  useEffect(() => {
    // Config validation
    ENV.validateConfig();

    // Production'da debug mode kapalı olmalı
    if (ENV.isProduction() && ENV.DEBUG_MODE) {
      console.warn('⚠️ UYARI: Production ortamında DEBUG_MODE açık!');
    }

    // Development ortamında bilgilendirme
    if (ENV.isDevelopment()) {
      console.log('🚀 SubWatch AI başlatılıyor...');
      console.log('📍 Ortam:', ENV.ENVIRONMENT);
      console.log('🔗 API URL:', ENV.API_BASE_URL);
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <GmailProvider>
              {/* Status Bar dinamik olarak tema ile ayarlanacak */}
              <StatusBar style="auto" />

              {/* Ana navigasyon yapısı */}
              <AppNavigator />
            </GmailProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
