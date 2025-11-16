/**
 * ==============================================================================
 * GMAIL CONTEXT
 * ==============================================================================
 *
 * Gmail API entegrasyonu için güvenli OAuth 2.0 akışı
 *
 * ÖZELLİKLER:
 * - Google OAuth 2.0 ile giriş
 * - Secure token storage (expo-secure-store)
 * - Gmail API ile mail okuma (gmail.readonly scope)
 * - Abonelik maillerini otomatik tespit
 * - Token yenileme (refresh token)
 * ==============================================================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import axios from 'axios';
import { ENV } from '../config/env';

// OAuth 2.0 completion için gerekli
WebBrowser.maybeCompleteAuthSession();

// Context oluştur
const GmailContext = createContext();

// Secure storage keys
const GMAIL_TOKEN_KEY = 'gmail_access_token';
const GMAIL_REFRESH_TOKEN_KEY = 'gmail_refresh_token';
const GMAIL_EXPIRY_KEY = 'gmail_token_expiry';

/**
 * Gmail Provider Component
 */
export function GmailProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Uygulama başladığında token kontrolü
   */
  useEffect(() => {
    checkExistingToken();
  }, []);

  /**
   * Mevcut token'ı kontrol et
   */
  const checkExistingToken = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync(GMAIL_TOKEN_KEY);
      const expiryStr = await SecureStore.getItemAsync(GMAIL_EXPIRY_KEY);

      if (accessToken && expiryStr) {
        const expiry = parseInt(expiryStr, 10);
        const now = Date.now();

        // Token hala geçerli mi?
        if (now < expiry) {
          // Token geçerli, kullanıcı bilgisini al
          await fetchUserInfo(accessToken);
          setIsAuthenticated(true);
        } else {
          // Token süresi dolmuş, refresh token ile yenile
          await refreshAccessToken();
        }
      }
    } catch (error) {
      console.error('Token kontrolü hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Google ile giriş yap (OAuth 2.0)
   *
   * NOT: Bu fonksiyon client-side OAuth flow kullanır.
   * Production'da Firebase Functions kullanılacak.
   */
  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      // Redirect URI oluştur
      const redirectUri = makeRedirectUri({
        scheme: 'subwatch-ai',
        path: 'oauth-redirect',
      });

      // OAuth 2.0 Authorization URL
      const authUrl = createAuthorizationUrl(redirectUri);

      console.log('Opening OAuth URL:', authUrl);
      console.log('Redirect URI:', redirectUri);

      // Web tarayıcısında OAuth sayfasını aç
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success') {
        // Authorization code'u al
        const code = extractAuthCode(result.url);

        if (code) {
          // Firebase Function'a gönder (production)
          // Şimdilik direct token exchange (development only)
          await exchangeCodeForToken(code, redirectUri);
        } else {
          throw new Error('Authorization code alınamadı');
        }
      } else {
        console.log('OAuth iptal edildi veya başarısız oldu');
      }
    } catch (error) {
      console.error('Google Sign-In hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * OAuth Authorization URL oluştur
   */
  const createAuthorizationUrl = (redirectUri) => {
    const params = new URLSearchParams({
      client_id: ENV.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/gmail.readonly email profile',
      access_type: 'offline', // Refresh token almak için
      prompt: 'consent', // Her zaman onay ekranı göster
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  /**
   * URL'den authorization code'u çıkar
   */
  const extractAuthCode = (url) => {
    const match = url.match(/[?&]code=([^&]+)/);
    return match ? match[1] : null;
  };

  /**
   * Authorization code'u access token'a çevir
   *
   * GÜVENLIK: Production'da bu işlem Firebase Functions'da yapılmalı!
   * Client secret asla client-side'da bulunmamalı.
   */
  const exchangeCodeForToken = async (code, redirectUri) => {
    try {
      // DEVELOPMENT ONLY - Production'da Firebase Function kullanılacak
      console.warn('⚠️ DEVELOPMENT MODE: Token exchange client-side yapılıyor');
      console.warn('⚠️ Production için Firebase Functions kullanın!');

      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          code,
          client_id: ENV.GOOGLE_CLIENT_ID,
          client_secret: ENV.GOOGLE_CLIENT_SECRET, // Bu production'da client-side'da olmamalı!
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;

      // Token'ları güvenli şekilde sakla
      await saveTokens(access_token, refresh_token, expires_in);

      // Kullanıcı bilgisini al
      await fetchUserInfo(access_token);

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token exchange hatası:', error.response?.data || error.message);
      throw error;
    }
  };

  /**
   * Token'ları SecureStore'a kaydet
   */
  const saveTokens = async (accessToken, refreshToken, expiresIn) => {
    try {
      const expiry = Date.now() + expiresIn * 1000;

      await SecureStore.setItemAsync(GMAIL_TOKEN_KEY, accessToken);
      if (refreshToken) {
        await SecureStore.setItemAsync(GMAIL_REFRESH_TOKEN_KEY, refreshToken);
      }
      await SecureStore.setItemAsync(GMAIL_EXPIRY_KEY, expiry.toString());
    } catch (error) {
      console.error('Token kaydetme hatası:', error);
      throw error;
    }
  };

  /**
   * Access token'ı yenile (refresh token ile)
   */
  const refreshAccessToken = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(GMAIL_REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        throw new Error('Refresh token bulunamadı');
      }

      // DEVELOPMENT ONLY - Production'da Firebase Function kullanılacak
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        refresh_token: refreshToken,
        client_id: ENV.GOOGLE_CLIENT_ID,
        client_secret: ENV.GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
      });

      const { access_token, expires_in } = response.data;

      // Yeni token'ı kaydet
      await saveTokens(access_token, null, expires_in);

      // Kullanıcı bilgisini güncelle
      await fetchUserInfo(access_token);

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token yenileme hatası:', error);
      // Token yenilenemezse çıkış yap
      await signOut();
      throw error;
    }
  };

  /**
   * Kullanıcı bilgisini Google'dan al
   */
  const fetchUserInfo = async (accessToken) => {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setUser(response.data);
    } catch (error) {
      console.error('Kullanıcı bilgisi alma hatası:', error);
      throw error;
    }
  };

  /**
   * Gmail'den subscription maillerini al
   *
   * @param {string} query - Gmail search query (örn: "from:netflix.com OR from:spotify.com")
   * @param {number} maxResults - Maksimum sonuç sayısı
   */
  const fetchSubscriptionEmails = async (query = '', maxResults = 50) => {
    try {
      const accessToken = await SecureStore.getItemAsync(GMAIL_TOKEN_KEY);

      if (!accessToken) {
        throw new Error('Giriş yapılmamış');
      }

      // Gmail API query - abonelik mail'leri
      const searchQuery = query || buildSubscriptionQuery();

      const response = await axios.get(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            q: searchQuery,
            maxResults,
          },
        }
      );

      // Her mail için detayları al
      const messages = response.data.messages || [];
      const detailedMessages = await Promise.all(
        messages.map((msg) => fetchMessageDetails(msg.id, accessToken))
      );

      return detailedMessages;
    } catch (error) {
      console.error('Mail çekme hatası:', error);

      // Token süresi dolduysa yenile
      if (error.response?.status === 401) {
        await refreshAccessToken();
        // Tekrar dene
        return fetchSubscriptionEmails(query, maxResults);
      }

      throw error;
    }
  };

  /**
   * Mail detaylarını al
   */
  const fetchMessageDetails = async (messageId, accessToken) => {
    try {
      const response = await axios.get(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            format: 'full',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Mail detayı alma hatası (${messageId}):`, error);
      return null;
    }
  };

  /**
   * Abonelik mail'leri için Gmail search query oluştur
   */
  const buildSubscriptionQuery = () => {
    const providers = [
      'netflix.com',
      'spotify.com',
      'youtube.com',
      'apple.com',
      'adobe.com',
      'amazon.com',
      'microsoft.com',
    ];

    const fromQueries = providers.map((provider) => `from:${provider}`).join(' OR ');
    const keywords = 'subject:(subscription OR invoice OR receipt OR payment OR billing)';

    return `(${fromQueries}) AND ${keywords}`;
  };

  /**
   * Çıkış yap
   */
  const signOut = async () => {
    try {
      // Token'ları sil
      await SecureStore.deleteItemAsync(GMAIL_TOKEN_KEY);
      await SecureStore.deleteItemAsync(GMAIL_REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(GMAIL_EXPIRY_KEY);

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Çıkış yapma hatası:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    signInWithGoogle,
    signOut,
    fetchSubscriptionEmails,
  };

  return (
    <GmailContext.Provider value={value}>
      {children}
    </GmailContext.Provider>
  );
}

/**
 * Gmail Context Hook
 */
export function useGmail() {
  const context = useContext(GmailContext);
  if (!context) {
    throw new Error('useGmail must be used within GmailProvider');
  }
  return context;
}
