# Firebase Functions - OAuth Güvenlik Kurulumu

## ⚠️ GÜVENLİK UYARISI

**KRİTİK:** `GOOGLE_CLIENT_SECRET` client-side kodda olmamalı!

Şu anda geliştirme amaçlı olarak client-side OAuth akışı kullanılıyor. Production'a geçmeden önce **mutlaka** Firebase Functions ile server-side OAuth kurulumu yapılmalıdır.

---

## 🔒 Production İçin Firebase Functions Kurulumu

### 1. Firebase Functions Başlatma

```bash
# Firebase Functions klasörüne git
cd firebase-functions

# Firebase CLI yükle (global)
npm install -g firebase-tools

# Firebase'e giriş yap
firebase login

# Firebase Functions başlat
firebase init functions
```

### 2. OAuth Token Exchange Function

**functions/index.js:**

```javascript
const functions = require('firebase-functions');
const axios = require('axios');
const cors = require('cors')({ origin: true });

/**
 * Google OAuth Token Exchange
 *
 * Client-side'dan gelen authorization code'u
 * server-side'da access token'a çevirir.
 *
 * GÜVENLİK: Client Secret burada kalır, client'a gitmez!
 */
exports.exchangeGoogleToken = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Sadece POST kabul et
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { code, redirectUri } = req.body;

      if (!code || !redirectUri) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      // Google OAuth token endpoint'ine istek at
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: functions.config().google.client_id,
        client_secret: functions.config().google.client_secret, // ✅ Server-side'da güvende
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });

      const { access_token, refresh_token, expires_in } = response.data;

      // Token'ları client'a gönder
      res.status(200).json({
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
      });
    } catch (error) {
      console.error('Token exchange error:', error);
      res.status(500).json({ error: 'Token exchange failed' });
    }
  });
});

/**
 * Google OAuth Token Refresh
 */
exports.refreshGoogleToken = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'Missing refresh token' });
        return;
      }

      // Refresh token ile yeni access token al
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        refresh_token: refreshToken,
        client_id: functions.config().google.client_id,
        client_secret: functions.config().google.client_secret, // ✅ Server-side'da güvende
        grant_type: 'refresh_token',
      });

      const { access_token, expires_in } = response.data;

      res.status(200).json({
        accessToken: access_token,
        expiresIn: expires_in,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ error: 'Token refresh failed' });
    }
  });
});
```

### 3. Environment Variables Ayarlama

```bash
# Firebase Functions config'e Google credentials ekle
firebase functions:config:set google.client_id="YOUR_CLIENT_ID"
firebase functions:config:set google.client_secret="YOUR_CLIENT_SECRET"

# Config'i görüntüle
firebase functions:config:get
```

### 4. Functions Deploy

```bash
# Functions'ı deploy et
firebase deploy --only functions

# Sadece belirli bir function'ı deploy et
firebase deploy --only functions:exchangeGoogleToken
```

### 5. Client-Side Kodu Güncelleme

**src/contexts/GmailContext.js** dosyasında:

```javascript
const exchangeCodeForToken = async (code, redirectUri) => {
  try {
    // ✅ Server-side Firebase Function kullan
    const response = await axios.post(
      'https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/exchangeGoogleToken',
      {
        code,
        redirectUri,
      }
    );

    const { accessToken, refreshToken, expiresIn } = response.data;

    // Token'ları güvenli şekilde sakla
    await saveTokens(accessToken, refreshToken, expiresIn);

    // Kullanıcı bilgisini al
    await fetchUserInfo(accessToken);

    setIsAuthenticated(true);
  } catch (error) {
    console.error('Token exchange hatası:', error);
    throw error;
  }
};

const refreshAccessToken = async () => {
  try {
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.GMAIL_REFRESH);

    if (!refreshToken) {
      throw new Error('Refresh token bulunamadı');
    }

    // ✅ Server-side Firebase Function kullan
    const response = await axios.post(
      'https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/refreshGoogleToken',
      {
        refreshToken,
      }
    );

    const { accessToken, expiresIn } = response.data;

    // Yeni token'ı kaydet
    await saveTokens(accessToken, null, expiresIn);

    setIsAuthenticated(true);
  } catch (error) {
    console.error('Token yenileme hatası:', error);
    await signOut();
    throw error;
  }
};
```

---

## 📋 Checklist

Production'a geçmeden önce:

- [ ] Firebase Functions projesi oluşturuldu
- [ ] `exchangeGoogleToken` function yazıldı
- [ ] `refreshGoogleToken` function yazıldı
- [ ] Environment variables ayarlandı
- [ ] Functions deploy edildi
- [ ] Client-side kod güncellendi
- [ ] `.env` dosyasından `GOOGLE_CLIENT_SECRET` kaldırıldı
- [ ] Test edildi

---

## 🔍 Test

```bash
# Local test
firebase functions:shell

# Function test
curl -X POST https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/exchangeGoogleToken \
  -H "Content-Type: application/json" \
  -d '{"code":"AUTH_CODE","redirectUri":"YOUR_REDIRECT_URI"}'
```

---

## 💰 Maliyet

Firebase Functions:
- İlk 2M çağrı/ay: **ÜCRETSİZ**
- Sonrası: $0.40 / 1M çağrı

Gmail API:
- 1M requests/gün: **ÜCRETSİZ**

**Toplam: Küçük - orta ölçekli uygulamalar için ücretsiz**

---

## 📚 Ek Kaynaklar

- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Gmail API Quickstart](https://developers.google.com/gmail/api/quickstart/nodejs)

---

## ⚡ Alternatif: Cloud Run

Daha fazla kontrol için Firebase Functions yerine Google Cloud Run kullanılabilir:

```javascript
// Express.js server
const express = require('express');
const app = express();

app.post('/oauth/exchange', async (req, res) => {
  // Token exchange logic
});

app.listen(process.env.PORT || 8080);
```

Deploy:
```bash
gcloud run deploy oauth-service --source .
```

---

**Geliştirici:** SubWatch AI Team
**Versiyon:** 1.0.0
**Son Güncelleme:** {{ currentDate }}
