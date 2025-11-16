/**
 * ==============================================================================
 * MAIL PARSER UTILITIES
 * ==============================================================================
 *
 * Gmail API'den gelen abonelik maillerini parse eder
 *
 * ÖZELLİKLER:
 * - Netflix, Spotify, YouTube, Apple, Adobe vb. için özel parser'lar
 * - Regex ile fiyat, tarih, plan bilgisi çıkarma
 * - Base64 decode (Gmail API mail body'leri base64 encoded)
 * - Hata toleranslı parsing (%80-90 doğruluk)
 * ==============================================================================
 */

/**
 * Gmail message'ından metin içeriği çıkar
 */
export function extractEmailBody(message) {
  try {
    if (!message || !message.payload) {
      return '';
    }

    let body = '';

    // Tek parçalı mail
    if (message.payload.body && message.payload.body.data) {
      body = decodeBase64(message.payload.body.data);
    }
    // Çok parçalı mail (multipart)
    else if (message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
          if (part.body && part.body.data) {
            body += decodeBase64(part.body.data);
          }
        }
        // Nested parts (örn: multipart/alternative içinde)
        if (part.parts) {
          for (const subpart of part.parts) {
            if (subpart.body && subpart.body.data) {
              body += decodeBase64(subpart.body.data);
            }
          }
        }
      }
    }

    return body;
  } catch (error) {
    console.error('Email body çıkarma hatası:', error);
    return '';
  }
}

/**
 * Base64 URL-safe string'i decode et
 */
function decodeBase64(str) {
  try {
    // URL-safe base64'ü normal base64'e çevir
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // Decode et
    return atob(base64);
  } catch (error) {
    console.error('Base64 decode hatası:', error);
    return '';
  }
}

/**
 * Mail header'larından değer al
 */
export function getHeader(message, headerName) {
  try {
    const headers = message.payload?.headers || [];
    const header = headers.find(
      (h) => h.name.toLowerCase() === headerName.toLowerCase()
    );
    return header ? header.value : '';
  } catch (error) {
    return '';
  }
}

/**
 * Ana parsing fonksiyonu - mail'den abonelik bilgisi çıkar
 */
export function parseSubscriptionEmail(message) {
  try {
    const from = getHeader(message, 'From');
    const subject = getHeader(message, 'Subject');
    const body = extractEmailBody(message);
    const date = getHeader(message, 'Date');

    // Hangi servis sağlayıcı?
    const provider = detectProvider(from, subject);

    if (!provider) {
      console.log('Bilinmeyen servis sağlayıcı:', from);
      return null;
    }

    // Provider'a özel parser çalıştır
    const parser = getParserForProvider(provider);
    const subscriptionData = parser(subject, body, date);

    if (!subscriptionData) {
      console.log('Abonelik bilgisi çıkarılamadı:', provider);
      return null;
    }

    return {
      ...subscriptionData,
      provider,
      sourceEmail: from,
      emailDate: date,
      rawSubject: subject,
    };
  } catch (error) {
    console.error('Mail parsing hatası:', error);
    return null;
  }
}

/**
 * Servis sağlayıcıyı tespit et
 */
function detectProvider(from, subject) {
  const fromLower = from.toLowerCase();
  const subjectLower = subject.toLowerCase();

  if (fromLower.includes('netflix') || subjectLower.includes('netflix')) {
    return 'netflix';
  }
  if (fromLower.includes('spotify') || subjectLower.includes('spotify')) {
    return 'spotify';
  }
  if (fromLower.includes('youtube') || subjectLower.includes('youtube')) {
    return 'youtube';
  }
  if (
    fromLower.includes('apple') ||
    fromLower.includes('icloud') ||
    subjectLower.includes('apple')
  ) {
    return 'apple';
  }
  if (fromLower.includes('adobe') || subjectLower.includes('adobe')) {
    return 'adobe';
  }
  if (fromLower.includes('amazon') || subjectLower.includes('amazon')) {
    return 'amazon';
  }
  if (fromLower.includes('microsoft') || subjectLower.includes('microsoft')) {
    return 'microsoft';
  }

  return null;
}

/**
 * Provider'a göre parser fonksiyonu al
 */
function getParserForProvider(provider) {
  const parsers = {
    netflix: parseNetflix,
    spotify: parseSpotify,
    youtube: parseYouTube,
    apple: parseApple,
    adobe: parseAdobe,
    amazon: parseAmazon,
    microsoft: parseMicrosoft,
  };

  return parsers[provider] || parseGeneric;
}

/**
 * Netflix mail parser
 */
function parseNetflix(subject, body) {
  try {
    // Fiyat regex (örn: "₺149,99" veya "TRY 149.99")
    const priceMatch =
      body.match(/₺\s*(\d+[.,]\d{2})/) ||
      body.match(/TRY\s*(\d+[.,]\d{2})/) ||
      body.match(/(\d+[.,]\d{2})\s*TL/);

    // Sonraki ödeme tarihi
    const dateMatch =
      body.match(/next payment.*?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i) ||
      body.match(/billing date.*?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);

    // Plan tipi
    let planType = 'monthly';
    if (body.toLowerCase().includes('annual') || body.toLowerCase().includes('yearly')) {
      planType = 'yearly';
    }

    if (!priceMatch) {
      return null;
    }

    const price = parseFloat(priceMatch[1].replace(',', '.'));
    const nextBillingDate = dateMatch
      ? parseDate(dateMatch[1])
      : calculateNextMonth();

    return {
      name: 'Netflix',
      price,
      currency: 'TRY',
      billingCycle: planType,
      category: 'streaming',
      nextBillingDate: nextBillingDate.toISOString(),
      isActive: true,
    };
  } catch (error) {
    console.error('Netflix parsing hatası:', error);
    return null;
  }
}

/**
 * Spotify mail parser
 */
function parseSpotify(subject, body) {
  try {
    const priceMatch =
      body.match(/₺\s*(\d+[.,]\d{2})/) ||
      body.match(/TRY\s*(\d+[.,]\d{2})/) ||
      body.match(/(\d+[.,]\d{2})\s*TL/);

    const dateMatch = body.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);

    let planType = 'monthly';
    if (
      body.toLowerCase().includes('premium family') ||
      subject.toLowerCase().includes('family')
    ) {
      planType = 'monthly'; // Family hala aylık
    }

    if (!priceMatch) {
      return null;
    }

    const price = parseFloat(priceMatch[1].replace(',', '.'));
    const nextBillingDate = dateMatch
      ? parseDate(dateMatch[1])
      : calculateNextMonth();

    return {
      name: 'Spotify',
      price,
      currency: 'TRY',
      billingCycle: planType,
      category: 'music',
      nextBillingDate: nextBillingDate.toISOString(),
      isActive: true,
    };
  } catch (error) {
    console.error('Spotify parsing hatası:', error);
    return null;
  }
}

/**
 * YouTube Premium mail parser
 */
function parseYouTube(subject, body) {
  try {
    const priceMatch =
      body.match(/₺\s*(\d+[.,]\d{2})/) ||
      body.match(/TRY\s*(\d+[.,]\d{2})/) ||
      body.match(/(\d+[.,]\d{2})\s*TL/);

    const dateMatch = body.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);

    if (!priceMatch) {
      return null;
    }

    const price = parseFloat(priceMatch[1].replace(',', '.'));
    const nextBillingDate = dateMatch
      ? parseDate(dateMatch[1])
      : calculateNextMonth();

    return {
      name: 'YouTube Premium',
      price,
      currency: 'TRY',
      billingCycle: 'monthly',
      category: 'streaming',
      nextBillingDate: nextBillingDate.toISOString(),
      isActive: true,
    };
  } catch (error) {
    console.error('YouTube parsing hatası:', error);
    return null;
  }
}

/**
 * Apple / iCloud mail parser
 */
function parseApple(subject, body) {
  try {
    const priceMatch =
      body.match(/₺\s*(\d+[.,]\d{2})/) ||
      body.match(/TRY\s*(\d+[.,]\d{2})/) ||
      body.match(/(\d+[.,]\d{2})\s*TL/);

    const dateMatch = body.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);

    // Hangi Apple servisi?
    let serviceName = 'Apple';
    if (body.toLowerCase().includes('icloud')) {
      serviceName = 'iCloud Storage';
    } else if (body.toLowerCase().includes('apple music')) {
      serviceName = 'Apple Music';
    } else if (body.toLowerCase().includes('apple tv')) {
      serviceName = 'Apple TV+';
    }

    if (!priceMatch) {
      return null;
    }

    const price = parseFloat(priceMatch[1].replace(',', '.'));
    const nextBillingDate = dateMatch
      ? parseDate(dateMatch[1])
      : calculateNextMonth();

    const category = serviceName.includes('Music')
      ? 'music'
      : serviceName.includes('Storage')
      ? 'storage'
      : 'streaming';

    return {
      name: serviceName,
      price,
      currency: 'TRY',
      billingCycle: 'monthly',
      category,
      nextBillingDate: nextBillingDate.toISOString(),
      isActive: true,
    };
  } catch (error) {
    console.error('Apple parsing hatası:', error);
    return null;
  }
}

/**
 * Adobe mail parser
 */
function parseAdobe(subject, body) {
  try {
    const priceMatch =
      body.match(/₺\s*(\d+[.,]\d{2})/) ||
      body.match(/USD\s*(\d+[.,]\d{2})/) ||
      body.match(/(\d+[.,]\d{2})\s*USD/);

    const dateMatch = body.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);

    let planType = 'monthly';
    if (body.toLowerCase().includes('annual')) {
      planType = 'yearly';
    }

    if (!priceMatch) {
      return null;
    }

    const price = parseFloat(priceMatch[1].replace(',', '.'));
    const nextBillingDate = dateMatch
      ? parseDate(dateMatch[1])
      : calculateNextMonth();

    return {
      name: 'Adobe Creative Cloud',
      price,
      currency: body.includes('USD') ? 'USD' : 'TRY',
      billingCycle: planType,
      category: 'productivity',
      nextBillingDate: nextBillingDate.toISOString(),
      isActive: true,
    };
  } catch (error) {
    console.error('Adobe parsing hatası:', error);
    return null;
  }
}

/**
 * Amazon Prime mail parser
 */
function parseAmazon(subject, body) {
  try {
    const priceMatch =
      body.match(/₺\s*(\d+[.,]\d{2})/) ||
      body.match(/TRY\s*(\d+[.,]\d{2})/) ||
      body.match(/(\d+[.,]\d{2})\s*TL/);

    const dateMatch = body.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);

    if (!priceMatch) {
      return null;
    }

    const price = parseFloat(priceMatch[1].replace(',', '.'));
    const nextBillingDate = dateMatch
      ? parseDate(dateMatch[1])
      : calculateNextMonth();

    return {
      name: 'Amazon Prime',
      price,
      currency: 'TRY',
      billingCycle: 'monthly',
      category: 'streaming',
      nextBillingDate: nextBillingDate.toISOString(),
      isActive: true,
    };
  } catch (error) {
    console.error('Amazon parsing hatası:', error);
    return null;
  }
}

/**
 * Microsoft (Office 365) mail parser
 */
function parseMicrosoft(subject, body) {
  try {
    const priceMatch =
      body.match(/₺\s*(\d+[.,]\d{2})/) ||
      body.match(/USD\s*(\d+[.,]\d{2})/) ||
      body.match(/(\d+[.,]\d{2})\s*USD/);

    const dateMatch = body.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);

    let planType = 'monthly';
    if (body.toLowerCase().includes('annual') || body.toLowerCase().includes('yearly')) {
      planType = 'yearly';
    }

    if (!priceMatch) {
      return null;
    }

    const price = parseFloat(priceMatch[1].replace(',', '.'));
    const nextBillingDate = dateMatch
      ? parseDate(dateMatch[1])
      : calculateNextMonth();

    return {
      name: 'Microsoft 365',
      price,
      currency: body.includes('USD') ? 'USD' : 'TRY',
      billingCycle: planType,
      category: 'productivity',
      nextBillingDate: nextBillingDate.toISOString(),
      isActive: true,
    };
  } catch (error) {
    console.error('Microsoft parsing hatası:', error);
    return null;
  }
}

/**
 * Generic parser (bilinmeyen servisler için)
 */
function parseGeneric(subject, body) {
  try {
    const priceMatch =
      body.match(/₺\s*(\d+[.,]\d{2})/) ||
      body.match(/TRY\s*(\d+[.,]\d{2})/) ||
      body.match(/(\d+[.,]\d{2})\s*TL/);

    if (!priceMatch) {
      return null;
    }

    const price = parseFloat(priceMatch[1].replace(',', '.'));
    const nextBillingDate = calculateNextMonth();

    return {
      name: 'Unknown Subscription',
      price,
      currency: 'TRY',
      billingCycle: 'monthly',
      category: 'other',
      nextBillingDate: nextBillingDate.toISOString(),
      isActive: true,
    };
  } catch (error) {
    console.error('Generic parsing hatası:', error);
    return null;
  }
}

/**
 * Tarih string'ini Date objesine çevir
 */
function parseDate(dateStr) {
  try {
    // "DD/MM/YYYY" veya "DD-MM-YYYY" formatı
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // JS months 0-indexed
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    // Fallback: string'i direkt parse et
    return new Date(dateStr);
  } catch (error) {
    console.error('Tarih parsing hatası:', error);
    return calculateNextMonth();
  }
}

/**
 * Bir ay sonrasını hesapla
 */
function calculateNextMonth() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date;
}

/**
 * Toplu mail parsing - tüm mailleri parse et
 */
export function parseMultipleEmails(messages) {
  const results = [];

  for (const message of messages) {
    const subscription = parseSubscriptionEmail(message);
    if (subscription) {
      results.push(subscription);
    }
  }

  return results;
}
