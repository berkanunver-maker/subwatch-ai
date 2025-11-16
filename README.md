# 🚀 SubWatch AI - AI Destekli Abonelik Takip Uygulaması

[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0-000020.svg)](https://expo.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**SubWatch AI**, kullanıcıların tüm aylık ve yıllık aboneliklerini akıllıca yönetmelerine yardımcı olan, AI destekli bir mobil uygulamadır.

## 📋 İçindekiler

- [Özellikler](#özellikler)
- [Güvenlik](#güvenlik)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [Proje Yapısı](#proje-yapısı)
- [Environment Variables](#environment-variables)
- [API Dokümantasyonu](#api-dokümantasyonu)
- [Geliştirme](#geliştirme)
- [Katkıda Bulunma](#katkıda-bulunma)
- [Lisans](#lisans)

---

## ✨ Özellikler

### 🔐 Kullanıcı Yönetimi
- ✅ Google Sign-In (OAuth 2.0)
- ✅ Email/Password ile kayıt ve giriş
- ✅ Şifre sıfırlama
- ✅ Firebase Authentication entegrasyonu
- ✅ Güvenli token yönetimi
- ✅ Çoklu cihaz desteği

### 📊 Abonelik Yönetimi
- ✅ Aylık/Yıllık abonelikleri kolayca ekleyin, düzenleyin ve silin
- ✅ Aktif ve pasif abonelikleri filtreleyin
- ✅ Yenileme tarihlerini ve ücretleri takip edin
- ✅ Otomatik ödeme durumunu yönetin
- ✅ Gmail API ile otomatik abonelik tespiti

### 🤖 AI Destekli Özellikler
- ✅ **Akıllı Analiz**: AI ile kullanmadığınız abonelikleri tespit edin
- ✅ **Fiyat Optimizasyonu**: Daha uygun alternatifleri keşfedin
- ✅ **Tasarruf Önerileri**: Kişiselleştirilmiş tasarruf tavsiyeleri alın
- ✅ **OCR Teknolojisi**: Fatura/ekran görüntüsü yükleyerek otomatik abonelik ekleyin

### 📈 İstatistikler ve Analizler
- ✅ Aylık/Yıllık harcama grafikleri
- ✅ Kategori bazlı analiz
- ✅ Harcama trendleri
- ✅ Tasarruf potansiyeli hesaplama

### 🔔 Hatırlatıcılar ve Bildirimler
- ✅ Yenileme tarihi yaklaşan abonelikler için bildirim
- ✅ İptal hatırlatıcıları
- ✅ Özelleştirilebilir bildirim ayarları

### 💱 Döviz Desteği
- ✅ Çoklu para birimi desteği
- ✅ Otomatik döviz kuru güncellemesi
- ✅ TL, USD, EUR, GBP ve daha fazlası

---

## 🔒 Güvenlik

Bu proje **güvenlik odaklı** olarak geliştirilmiştir. Aşağıdaki güvenlik önlemleri alınmıştır:

### ✅ Client-Side Güvenlik
- **ASLA** API anahtarları, secret key'ler veya hassas bilgiler client-side kodda yer almaz
- Tüm environment variable'lar `.env` dosyasında saklanır ve `.gitignore` ile korunur
- Input validation ve sanitization ile XSS, SQL Injection ve diğer saldırılardan korunma
- React Native güvenlik best practice'leri uygulanmıştır

### ✅ API Güvenlik
- JWT (JSON Web Token) ile authentication ve authorization
- Rate limiting ile DDoS koruması
- Request timeout ile uzun süren isteklerin önlenmesi
- HTTPS zorunlu iletişim
- API endpoint'lerinde yetkilendirme kontrolü

### ✅ Veri Güvenliği
- Hassas veriler için Expo SecureStore kullanımı (önerilen)
- Tüm kullanıcı girdileri validate edilir ve sanitize edilir
- OWASP Top 10 güvenlik açıklarına karşı koruma

### 🚨 Güvenlik Kuralları
1. **ASLA** `.env` dosyasını Git'e commit etmeyin
2. **ASLA** API anahtarlarını veya secret key'leri kodda hardcode etmeyin
3. **DAIMA** `.env.example` dosyasını kullanın ve gerçek değerleri `.env`'ye yazın
4. **DAIMA** production ortamında debug mode'u kapatın
5. **DAIMA** HTTPS kullanın (HTTP asla!)

---

## 🛠️ Kurulum

### Gereksinimler
- Node.js (v18 veya üzeri)
- npm veya yarn
- Expo CLI
- iOS Simulator (Mac) veya Android Emulator
- Expo Go App (fiziksel cihazda test için)

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone https://github.com/your-username/subwatch-ai.git
cd subwatch-ai
```

2. **Bağımlılıkları yükleyin**
```bash
npm install --legacy-peer-deps
# veya
yarn install
```

3. **Environment variables'ı ayarlayın**
```bash
# .env.example dosyasını kopyalayın
cp .env.example .env

# .env dosyasını açın ve gerçek değerleri doldurun
nano .env  # veya istediğiniz editör
```

**ÖNEMLİ:** `.env` dosyasındaki tüm placeholder değerleri gerçek bilgilerle değiştirin!

4. **Firebase Kurulumu** (Authentication ve Firestore için)

   a. Firebase projesi oluşturun:
   - [Firebase Console](https://console.firebase.google.com)'a gidin
   - "Add project" butonuna tıklayın
   - Proje adı girin (örn: "SubWatch AI")
   - Google Analytics'i enable/disable edin (isteğe bağlı)
   - "Create project" butonuna tıklayın

   b. Firebase Authentication'ı etkinleştirin:
   - Sol menüden "Build" > "Authentication" seçin
   - "Get Started" butonuna tıklayın
   - "Sign-in method" tab'ına gidin
   - "Email/Password" provider'ını enable edin
   - "Google" provider'ını enable edin ve Web SDK configuration kopyalayın

   c. Cloud Firestore'u etkinleştirin:
   - Sol menüden "Build" > "Firestore Database" seçin
   - "Create database" butonuna tıklayın
   - "Start in production mode" seçin (şimdilik)
   - Location seçin ve "Enable" butonuna tıklayın

   d. Web uygulaması ekleyin ve config alın:
   - Sol menüden "Project Overview" > "Project settings"
   - "Your apps" bölümünde "Add app" > Web icon (</>) seçin
   - App nickname girin (örn: "SubWatch AI Web")
   - "Register app" butonuna tıklayın
   - Firebase config değerlerini kopyalayın:
     ```javascript
     const firebaseConfig = {
       apiKey: "...",
       authDomain: "...",
       projectId: "...",
       storageBucket: "...",
       messagingSenderId: "...",
       appId: "...",
       measurementId: "..." // İsteğe bağlı
     };
     ```
   - Bu değerleri `.env` dosyasına ekleyin (FIREBASE_* değişkenleri)

   e. **Firestore Security Rules ekleyin (ÇOK ÖNEMLİ!)** ⚠️
   - Sol menüden "Firestore Database" > "Rules" tab'ına gidin
   - Projedeki `firestore.rules` dosyasının içeriğini kopyalayın
   - Firebase Console'daki Rules editörüne yapıştırın
   - "Publish" butonuna tıklayın

   **UYARI:** Bu adım yapılmazsa VERİLERİNİZ HERKESE AÇIK OLUR! ⚠️

5. **Uygulamayı başlatın**
```bash
npm start
# veya
expo start
```

5. **Test edin**
- iOS için: `i` tuşuna basın (Mac gerekli)
- Android için: `a` tuşuna basın
- Web için: `w` tuşuna basın
- Fiziksel cihaz için: Expo Go uygulamasıyla QR kodu tarayın

---

## 📱 Kullanım

### İlk Kurulum
1. Uygulamayı açın
2. Kayıt olun veya giriş yapın
3. İlk aboneliğinizi ekleyin

### Abonelik Ekleme
Üç farklı yöntemle abonelik ekleyebilirsiniz:

1. **Manuel Ekleme**
   - "Aboneliklerim" sekmesine gidin
   - "+" butonuna tıklayın
   - Abonelik bilgilerini doldurun

2. **Fatura Yükleme** (OCR)
   - Fatura/fatura ekran görüntüsü yükleyin
   - AI otomatik olarak bilgileri çıkarır

3. **Ekran Görüntüsü Paylaşma**
   - Uygulamadan abonelik ekran görüntüsü alın
   - SubWatch AI ile paylaşın

### İstatistik Görüntüleme
- "İstatistikler" sekmesinden tüm harcamalarınızı görüntüleyin
- Aylık/Yıllık grafikleri inceleyin
- AI önerilerini değerlendirin

---

## 📁 Proje Yapısı

```
subwatch-ai/
├── src/
│   ├── components/          # Yeniden kullanılabilir UI bileşenleri
│   ├── config/              # Konfigürasyon dosyaları
│   │   └── env.js          # Environment variable yönetimi
│   ├── contexts/            # React Context API (state management)
│   ├── hooks/               # Custom React hooks
│   ├── navigation/          # React Navigation setup
│   │   └── AppNavigator.js # Ana navigasyon yapısı
│   ├── screens/             # Uygulama ekranları
│   │   ├── HomeScreen.js
│   │   ├── SubscriptionsScreen.js
│   │   └── StatisticsScreen.js
│   ├── services/            # API ve servis katmanı
│   │   └── api.js          # API client (JWT, rate limiting)
│   └── utils/               # Yardımcı fonksiyonlar
│       └── validation.js   # Input validation & sanitization
├── assets/                  # Görseller, fontlar, iconlar
├── .env.example             # Environment variable şablonu
├── .gitignore              # Git ignore kuralları
├── App.js                  # Ana uygulama dosyası
├── app.config.js           # Expo konfigürasyonu
├── package.json            # NPM bağımlılıkları
└── README.md               # Bu dosya
```

### Klasör Açıklamaları

- **src/components**: Button, Input, Card gibi UI bileşenleri
- **src/config**: Uygulama genelinde kullanılan konfigürasyonlar
- **src/contexts**: Global state yönetimi (kullanıcı bilgisi, tema vb.)
- **src/hooks**: Custom React hooks (useAuth, useSubscriptions vb.)
- **src/navigation**: Ekranlar arası gezinme yapısı
- **src/screens**: Her bir ekran (sayfa) için ayrı dosyalar
- **src/services**: Backend API iletişimi, third-party servisler
- **src/utils**: Yardımcı fonksiyonlar (validation, formatting vb.)

---

## 🔐 Environment Variables

`.env.example` dosyasını `.env` olarak kopyalayın ve aşağıdaki değişkenleri doldurun:

### Backend API
```env
API_BASE_URL=https://your-backend-api.com/api/v1
API_TIMEOUT=30000
```

### Güvenlik Anahtarları
```env
JWT_SECRET=your-super-secret-jwt-key
API_KEY=your-api-key
```

### AI Servisleri
```env
OPENAI_API_KEY=sk-your-openai-api-key
AI_MODEL=gpt-3.5-turbo
```

### Döviz Kuru API
```env
EXCHANGE_RATE_API_KEY=your-exchange-rate-api-key
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest
```

### Push Notification
```env
ONESIGNAL_APP_ID=your-onesignal-app-id
FCM_SERVER_KEY=your-fcm-server-key
```

### Analytics
```env
SENTRY_DSN=your-sentry-dsn
GA_TRACKING_ID=UA-XXXXXXXXX-X
```

### Genel Ayarlar
```env
ENVIRONMENT=development
DEBUG_MODE=true
LOG_LEVEL=debug
```

**⚠️ UYARI:** Production ortamında mutlaka `DEBUG_MODE=false` yapın!

---

## 📧 Gmail API Entegrasyonu

SubWatch AI, Gmail hesabınızdaki abonelik maillerini otomatik olarak okuyabilir ve tespit edebilir. Bu özellik sayesinde Netflix, Spotify, YouTube gibi servislerin ödeme maillerini otomatik olarak bulup abonelik olarak ekleyebilirsiniz.

### 📝 Kurulum Adımları

#### 1. Google Cloud Console Projesi Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com)'a gidin
2. Yeni bir proje oluşturun:
   - Sol üst köşedeki proje seçiciye tıklayın
   - "New Project" butonuna tıklayın
   - Proje adı girin (örn: "SubWatch AI")
   - "Create" butonuna tıklayın

#### 2. Gmail API'yi Etkinleştirme

1. Sol menüden "APIs & Services" > "Library" seçin
2. "Gmail API" araması yapın
3. Gmail API'yi seçin
4. "Enable" butonuna tıklayın

#### 3. OAuth 2.0 Credentials Oluşturma

1. Sol menüden "APIs & Services" > "Credentials" seçin
2. "Create Credentials" > "OAuth client ID" seçin
3. Eğer OAuth consent screen yapılandırılmamışsa:
   - "Configure Consent Screen" butonuna tıklayın
   - "External" seçin (kişisel kullanım için)
   - Uygulama adı girin: "SubWatch AI"
   - Kullanıcı desteği email'i ekleyin
   - Geliştirici iletişim email'i ekleyin
   - "Save and Continue" tıklayın
   - Scopes ekranında "Add or Remove Scopes" tıklayın
   - `https://www.googleapis.com/auth/gmail.readonly` scope'unu ekleyin
   - "Save and Continue" tıklayın
   - Test users ekranında email adresinizi ekleyin
   - "Save and Continue" tıklayın

4. OAuth client ID oluşturmaya devam edin:
   - Application type: "Web application" seçin
   - Name: "SubWatch AI Web Client"
   - Authorized redirect URIs ekleyin:
     ```
     https://auth.expo.io/@your-expo-username/subwatch-ai
     exp://localhost:8081/--/oauth-redirect
     ```
   - "Create" butonuna tıklayın

5. Client ID ve Client Secret'ı kaydedin (bir sonraki adımda kullanacaksınız)

#### 4. Environment Variables'ı Ayarlama

`.env` dosyanıza aşağıdaki değerleri ekleyin:

```env
# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GMAIL_API_SCOPE=https://www.googleapis.com/auth/gmail.readonly
```

**⚠️ GÜVENLİK UYARISI:**
- `GOOGLE_CLIENT_SECRET` değeri ÇOK GİZLİDİR!
- Development ortamında client-side'da kullanılabilir ancak **Production'da MUTLAKA Firebase Functions veya backend kullanın**
- Asla `.env` dosyasını Git'e commit etmeyin

#### 5. Firebase Functions Kurulumu (Production için ÖNERİLİR)

Production ortamında Google Client Secret'ı client-side'da saklamak GÜVENLİK RİSKİDİR. Firebase Functions kullanarak token exchange işlemini sunucu tarafında yapın:

1. Firebase projenizi oluşturun: [Firebase Console](https://console.firebase.google.com)
2. Functions'ı etkinleştirin:
   ```bash
   firebase init functions
   ```

3. `functions/index.js` dosyasına token exchange endpoint'i ekleyin:
   ```javascript
   const functions = require('firebase-functions');
   const axios = require('axios');

   exports.exchangeGoogleToken = functions.https.onCall(async (data, context) => {
     const { code, redirectUri } = data;

     try {
       const response = await axios.post('https://oauth2.googleapis.com/token', {
         code,
         client_id: functions.config().google.client_id,
         client_secret: functions.config().google.client_secret,
         redirect_uri: redirectUri,
         grant_type: 'authorization_code',
       });

       return response.data;
     } catch (error) {
       throw new functions.https.HttpsError('internal', error.message);
     }
   });
   ```

4. Firebase config'e secret'ları ekleyin:
   ```bash
   firebase functions:config:set google.client_id="YOUR_CLIENT_ID"
   firebase functions:config:set google.client_secret="YOUR_CLIENT_SECRET"
   ```

5. Deploy edin:
   ```bash
   firebase deploy --only functions
   ```

6. `src/contexts/GmailContext.js` dosyasını güncelleyin ve Firebase Function'ı kullanacak şekilde değiştirin.

### 🎯 Kullanım

1. Uygulamayı açın
2. Ana sayfadaki "Gmail Senkronizasyonu" kartını bulun
3. "Google ile Giriş Yap" butonuna tıklayın
4. Google hesabınızı seçin ve izinleri onaylayın
5. "Abonelikleri Senkronize Et" butonuna tıklayın
6. Bulunan abonelikleri gözden geçirin ve onaylayın

### 📋 Desteklenen Servisler

Gmail entegrasyonu şu servislerin maillerini otomatik olarak tanır:
- ✅ Netflix
- ✅ Spotify
- ✅ YouTube Premium
- ✅ Apple (iCloud, Apple Music, Apple TV+)
- ✅ Adobe Creative Cloud
- ✅ Amazon Prime
- ✅ Microsoft 365

**Not:** Yeni servisler eklemek için `src/utils/mailParser.js` dosyasını düzenleyin.

### 🔒 Gizlilik ve Güvenlik

- **Sadece Okuma İzni:** Uygulama Gmail'inizi sadece OKUYUR, asla mail göndermez veya silmez
- **Güvenli Saklama:** OAuth token'ları Expo SecureStore'da güvenli şekilde saklanır
- **Kullanıcı Onayı:** Tespit edilen abonelikler otomatik eklenmez, kullanıcı onayı gerektirir
- **Minimal Scope:** Sadece `gmail.readonly` scope'u kullanılır

### ⚠️ Sınırlamalar

- Gmail API ücretsiz tier'da günlük **1 milyon** quota vardır (normal kullanım için fazlasıyla yeterli)
- Mail parsing %80-90 doğrulukla çalışır (basit regex kullanır)
- Sadece İngilizce ve Türkçe mailleri destekler
- Eski mailleri tespit etmek için 50 mail limiti vardır (değiştirilebilir)

### 🐛 Sorun Giderme

**"OAuth redirect URI mismatch" hatası:**
- Google Cloud Console'daki redirect URI'yi kontrol edin
- Expo username'inizi doğru girdiğinizden emin olun

**"Invalid client" hatası:**
- Client ID ve Client Secret'ı kontrol edin
- `.env` dosyasının doğru yüklendiğinden emin olun

**Mail bulunamadı:**
- Gmail hesabınızda ilgili servislerin maillerinin olduğundan emin olun
- Spam klasörünü kontrol edin
- Mail parser'ı geliştirmek için `src/utils/mailParser.js`'i düzenleyin

---

## 🔌 API Dokümantasyonu

### Authentication

#### Login
```javascript
POST /auth/login
Body: { email, password }
Response: { token, refreshToken, user }
```

#### Register
```javascript
POST /auth/register
Body: { email, password, name }
Response: { token, user }
```

### Subscriptions

#### Tüm abonelikleri getir
```javascript
GET /subscriptions
Headers: { Authorization: Bearer <token> }
Response: [{ id, name, price, billingCycle, nextBillingDate, isActive }]
```

#### Yeni abonelik ekle
```javascript
POST /subscriptions
Headers: { Authorization: Bearer <token> }
Body: { name, price, billingCycle, category, nextBillingDate }
Response: { id, ...subscriptionData }
```

#### Abonelik güncelle
```javascript
PUT /subscriptions/:id
Headers: { Authorization: Bearer <token> }
Body: { name?, price?, isActive?, ... }
Response: { success: true }
```

#### Abonelik sil
```javascript
DELETE /subscriptions/:id
Headers: { Authorization: Bearer <token> }
Response: { success: true }
```

### AI Analysis

#### AI analiz
```javascript
POST /ai/analyze
Headers: { Authorization: Bearer <token> }
Response: { insights, recommendations, unusedSubscriptions }
```

### Statistics

#### İstatistikleri getir
```javascript
GET /statistics
Headers: { Authorization: Bearer <token> }
Response: { totalSpent, monthlyAverage, categoryBreakdown }
```

---

## 🧪 Geliştirme

### Kod Yapısı Kuralları

1. **Sade ve Anlaşılır Kod**
   - Her fonksiyon için açıklayıcı yorum ekleyin
   - Değişken isimleri açıklayıcı olmalı (örn: `usr` yerine `user`)
   - Karmaşık işlemler için adım adım açıklama yazın

2. **Güvenlik**
   - Hiçbir hassas bilgi kodda hardcode edilmemeli
   - Tüm kullanıcı girdileri validate edilmeli
   - API isteklerinde her zaman authorization kontrol edilmeli

3. **Hata Yönetimi**
   - Try-catch blokları kullanın
   - Kullanıcıya anlaşılır hata mesajları gösterin
   - Hataları console'a loglayın (development modunda)

### Test Etme

```bash
# Tüm testleri çalıştır
npm test

# Belirli bir test dosyasını çalıştır
npm test -- validation.test.js
```

### Linting

```bash
# Kod kalitesini kontrol et
npm run lint

# Otomatik düzeltmeler yap
npm run lint -- --fix
```

### Build

```bash
# Production build
expo build:android
expo build:ios
```

---

## 🐛 Sorun Giderme

### Yaygın Sorunlar

**1. Expo başlamıyor**
```bash
# Cache temizle
expo start -c
```

**2. Metro bundler hatası**
```bash
# Node_modules'ı sil ve yeniden yükle
rm -rf node_modules
npm install --legacy-peer-deps
```

**3. Environment variables çalışmıyor**
- `.env` dosyasının root dizinde olduğundan emin olun
- Uygulamayı yeniden başlatın (env değişiklikleri sonrası)
- `app.config.js` dosyasını kontrol edin

**4. Navigation hatası**
```bash
# Navigation paketlerini kontrol et
npm ls @react-navigation/native
```

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:

1. Bu repoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

### Commit Message Kuralları
- `feat:` - Yeni özellik
- `fix:` - Bug fix
- `docs:` - Dokümantasyon değişikliği
- `style:` - Kod formatı değişikliği
- `refactor:` - Kod iyileştirme
- `test:` - Test ekleme/düzenleme
- `chore:` - Build/config değişiklikleri

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 📞 İletişim

Sorularınız için:
- Issue açın: [GitHub Issues](https://github.com/your-username/subwatch-ai/issues)
- Email: your-email@example.com

---

## 🙏 Teşekkürler

Bu projeyi kullandığınız için teşekkür ederiz! Geri bildirimlerinizi bekliyoruz.

---

**Not:** Bu proje aktif geliştirme aşamasındadır. Özellikler eklenmeye devam edilmektedir.

Made with ❤️ by SubWatch AI Team
