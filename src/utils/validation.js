/**
 * ==============================================================================
 * VALIDATION & SANITIZATION UTILITIES
 * ==============================================================================
 *
 * Bu dosya kullanıcı girdilerini doğrulamak (validate) ve
 * temizlemek (sanitize) için fonksiyonlar içerir.
 *
 * GÜVENLİK: Tüm kullanıcı girdileri bu fonksiyonlardan geçirilmelidir!
 *
 * KULLANIM:
 * import { validateEmail, sanitizeInput } from './utils/validation';
 * if (!validateEmail(email)) {
 *   alert('Geçersiz email adresi!');
 * }
 * ==============================================================================
 */

/**
 * Email adresi doğrulama
 * @param {string} email - Kontrol edilecek email adresi
 * @returns {boolean} - Email geçerliyse true
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // RFC 5322 Email validation regex (basitleştirilmiş)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Telefon numarası doğrulama (Türkiye formatı)
 * @param {string} phone - Kontrol edilecek telefon numarası
 * @returns {boolean} - Telefon geçerliyse true
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Türkiye telefon formatları: 05XX XXX XX XX veya +90 5XX XXX XX XX
  const phoneRegex = /^(\+90|0)?5\d{9}$/;
  const cleanPhone = phone.replace(/\s|-/g, ''); // Boşluk ve tire temizle
  return phoneRegex.test(cleanPhone);
};

/**
 * Şifre güçlülüğü doğrulama
 * @param {string} password - Kontrol edilecek şifre
 * @returns {object} - { isValid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Şifre gereklidir'] };
  }

  // Minimum 8 karakter
  if (password.length < 8) {
    errors.push('Şifre en az 8 karakter olmalıdır');
  }

  // En az bir büyük harf
  if (!/[A-Z]/.test(password)) {
    errors.push('En az bir büyük harf içermelidir');
  }

  // En az bir küçük harf
  if (!/[a-z]/.test(password)) {
    errors.push('En az bir küçük harf içermelidir');
  }

  // En az bir rakam
  if (!/\d/.test(password)) {
    errors.push('En az bir rakam içermelidir');
  }

  // En az bir özel karakter
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('En az bir özel karakter içermelidir (!@#$%^&* vb.)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Kredi kartı numarası doğrulama (Luhn algoritması)
 * @param {string} cardNumber - Kontrol edilecek kart numarası
 * @returns {boolean} - Kart numarası geçerliyse true
 */
export const validateCreditCard = (cardNumber) => {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return false;
  }

  // Sadece rakamları al
  const digits = cardNumber.replace(/\D/g, '');

  // 13-19 rakam arası olmalı
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  // Luhn algoritması
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * URL doğrulama
 * @param {string} url - Kontrol edilecek URL
 * @returns {boolean} - URL geçerliyse true
 */
export const validateURL = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Fiyat/Tutar doğrulama
 * @param {string|number} amount - Kontrol edilecek tutar
 * @returns {boolean} - Tutar geçerliyse true (pozitif sayı)
 */
export const validateAmount = (amount) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num > 0 && isFinite(num);
};

/**
 * Tarih doğrulama
 * @param {string|Date} date - Kontrol edilecek tarih
 * @returns {boolean} - Tarih geçerliyse true
 */
export const validateDate = (date) => {
  if (!date) {
    return false;
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

/**
 * XSS (Cross-Site Scripting) koruması için input temizleme
 * @param {string} input - Temizlenecek metin
 * @returns {string} - Temizlenmiş metin
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // HTML özel karakterleri escape et
  const map = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '&': '&amp;',
  };

  return input.replace(/[<>"'/&]/g, (char) => map[char]);
};

/**
 * SQL Injection koruması için input temizleme
 * @param {string} input - Temizlenecek metin
 * @returns {string} - Temizlenmiş metin
 */
export const sanitizeSQL = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // SQL özel karakterlerini temizle
  // NOT: Gerçek SQL işlemleri için prepared statements kullanın!
  return input
    .replace(/'/g, "''") // Tek tırnak escape
    .replace(/;/g, '') // Noktalı virgül temizle
    .replace(/--/g, '') // SQL yorum temizle
    .replace(/\/\*/g, '') // SQL çoklu yorum başlangıcı temizle
    .replace(/\*\//g, ''); // SQL çoklu yorum bitişi temizle
};

/**
 * Sadece alfanumerik karakterlere izin ver
 * @param {string} input - Temizlenecek metin
 * @param {boolean} allowSpaces - Boşluklara izin verilsin mi?
 * @returns {string} - Temizlenmiş metin
 */
export const sanitizeAlphanumeric = (input, allowSpaces = false) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const pattern = allowSpaces ? /[^a-zA-Z0-9\s]/g : /[^a-zA-Z0-9]/g;
  return input.replace(pattern, '');
};

/**
 * Dosya adı güvenli hale getirme
 * @param {string} filename - Temizlenecek dosya adı
 * @returns {string} - Güvenli dosya adı
 */
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return '';
  }

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Sadece güvenli karakterler
    .replace(/\.+/g, '.') // Çoklu noktaları tek nokta yap
    .replace(/^\./, '') // Başlangıçtaki noktayı kaldır
    .substring(0, 255); // Max 255 karakter
};

/**
 * Abonelik adı doğrulama
 * @param {string} name - Kontrol edilecek abonelik adı
 * @returns {boolean} - Geçerliyse true
 */
export const validateSubscriptionName = (name) => {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
};

/**
 * Form verisi toplu doğrulama
 * @param {object} data - Doğrulanacak form verisi
 * @param {object} rules - Doğrulama kuralları
 * @returns {object} - { isValid: boolean, errors: object }
 *
 * ÖRNEK KULLANIM:
 * const rules = {
 *   email: 'email',
 *   password: 'password',
 *   phone: 'phone',
 *   amount: 'amount'
 * };
 * const result = validateForm(formData, rules);
 */
export const validateForm = (data, rules) => {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = data[field];

    switch (rule) {
      case 'email':
        if (!validateEmail(value)) {
          errors[field] = 'Geçerli bir email adresi giriniz';
          isValid = false;
        }
        break;

      case 'password':
        const passwordResult = validatePassword(value);
        if (!passwordResult.isValid) {
          errors[field] = passwordResult.errors.join(', ');
          isValid = false;
        }
        break;

      case 'phone':
        if (!validatePhone(value)) {
          errors[field] = 'Geçerli bir telefon numarası giriniz';
          isValid = false;
        }
        break;

      case 'amount':
        if (!validateAmount(value)) {
          errors[field] = 'Geçerli bir tutar giriniz';
          isValid = false;
        }
        break;

      case 'url':
        if (!validateURL(value)) {
          errors[field] = 'Geçerli bir URL giriniz';
          isValid = false;
        }
        break;

      case 'required':
        if (!value || (typeof value === 'string' && !value.trim())) {
          errors[field] = 'Bu alan zorunludur';
          isValid = false;
        }
        break;

      default:
        break;
    }
  });

  return { isValid, errors };
};

/**
 * Tüm validation fonksiyonlarını export et
 */
export default {
  validateEmail,
  validatePhone,
  validatePassword,
  validateCreditCard,
  validateURL,
  validateAmount,
  validateDate,
  validateSubscriptionName,
  sanitizeInput,
  sanitizeSQL,
  sanitizeAlphanumeric,
  sanitizeFilename,
  validateForm,
};
