/**
 * ==============================================================================
 * THEME CONFIGURATION
 * ==============================================================================
 *
 * Uygulama genelinde kullanılacak renk şeması ve tema ayarları
 *
 * LIGHT MODE: Profesyonel İndigo/Mor ton
 * DARK MODE: Koyu arka plan, göz yormayan renkler
 *
 * KULLANIM:
 * import { lightTheme, darkTheme } from './config/theme';
 * ==============================================================================
 */

/**
 * LIGHT THEME (Aydınlık Mod)
 * Modern fintech uygulamaları için profesyonel renk paleti
 */
export const lightTheme = {
  // Mod bilgisi
  mode: 'light',

  // Ana renkler
  primary: '#6366f1', // İndigo - Ana marka rengi
  primaryLight: '#818cf8', // Açık indigo
  primaryDark: '#4f46e5', // Koyu indigo

  // İkincil renkler
  secondary: '#8b5cf6', // Mor
  secondaryLight: '#a78bfa',
  secondaryDark: '#7c3aed',

  // Durum renkleri
  success: '#10b981', // Yeşil - Başarı, aktif
  warning: '#f59e0b', // Turuncu - Uyarı, dikkat
  error: '#ef4444', // Kırmızı - Hata, sil
  info: '#3b82f6', // Mavi - Bilgi

  // Arka plan renkleri
  background: '#f5f5f5', // Ana arka plan
  backgroundCard: '#ffffff', // Kart arka planı
  backgroundSecondary: '#f9fafb', // İkincil arka plan

  // Metin renkleri
  text: '#1f2937', // Ana metin
  textSecondary: '#6b7280', // İkincil metin
  textLight: '#9ca3af', // Açık metin
  textInverse: '#ffffff', // Ters metin (dark bg üzerinde)

  // Kenarlık renkleri
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  borderDark: '#d1d5db',

  // Gölge
  shadow: '#000000',
  shadowOpacity: 0.1,

  // Özel durumlar
  overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlay
  disabled: '#d1d5db',
  placeholder: '#9ca3af',

  // Gradient (opsiyonel)
  gradientStart: '#6366f1',
  gradientEnd: '#8b5cf6',
};

/**
 * DARK THEME (Karanlık Mod)
 * Göz yormayan, modern dark mode renk paleti
 */
export const darkTheme = {
  // Mod bilgisi
  mode: 'dark',

  // Ana renkler (Dark mode'da daha parlak tonlar)
  primary: '#818cf8', // Açık indigo
  primaryLight: '#a5b4fc',
  primaryDark: '#6366f1',

  // İkincil renkler
  secondary: '#a78bfa', // Açık mor
  secondaryLight: '#c4b5fd',
  secondaryDark: '#8b5cf6',

  // Durum renkleri (Dark mode'da daha yumuşak)
  success: '#34d399', // Açık yeşil
  warning: '#fbbf24', // Açık turuncu
  error: '#f87171', // Açık kırmızı
  info: '#60a5fa', // Açık mavi

  // Arka plan renkleri (Koyu tonlar)
  background: '#111827', // Ana arka plan (çok koyu)
  backgroundCard: '#1f2937', // Kart arka planı (koyu gri)
  backgroundSecondary: '#374151', // İkincil arka plan

  // Metin renkleri (Dark mode'da açık tonlar)
  text: '#f9fafb', // Ana metin (beyaza yakın)
  textSecondary: '#d1d5db', // İkincil metin
  textLight: '#9ca3af', // Açık metin
  textInverse: '#111827', // Ters metin (light bg üzerinde)

  // Kenarlık renkleri
  border: '#374151',
  borderLight: '#4b5563',
  borderDark: '#1f2937',

  // Gölge
  shadow: '#000000',
  shadowOpacity: 0.3,

  // Özel durumlar
  overlay: 'rgba(0, 0, 0, 0.7)', // Modal overlay (daha koyu)
  disabled: '#4b5563',
  placeholder: '#6b7280',

  // Gradient
  gradientStart: '#818cf8',
  gradientEnd: '#a78bfa',
};

/**
 * Ortak stil sabitleri (tema bağımsız)
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 36,
};

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

/**
 * Elevation (gölge seviyeleri)
 */
export const elevation = {
  low: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  high: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

/**
 * Kategori renkleri (Abonelik kategorileri için)
 */
export const categoryColors = {
  streaming: '#ef4444', // Kırmızı - Netflix, Disney+
  music: '#10b981', // Yeşil - Spotify, Apple Music
  productivity: '#3b82f6', // Mavi - Microsoft, Adobe
  gaming: '#8b5cf6', // Mor - PlayStation, Xbox
  fitness: '#f59e0b', // Turuncu - Gym, fitness apps
  news: '#6366f1', // İndigo - Newspapers
  education: '#14b8a6', // Teal - Courses
  storage: '#ec4899', // Pink - Cloud storage
  other: '#6b7280', // Gri - Diğer
};

/**
 * Abonelik logoları için renk eşleştirmeleri
 * Gerçek logolar yerine background color olarak kullanılacak
 */
export const subscriptionBrandColors = {
  netflix: '#E50914',
  spotify: '#1DB954',
  youtube: '#FF0000',
  'apple music': '#FA243C',
  'disney+': '#113CCF',
  'amazon prime': '#00A8E1',
  hbo: '#9D34DA',
  hulu: '#1CE783',
  'adobe creative cloud': '#DA1F26',
  'microsoft 365': '#0078D4',
  dropbox: '#0061FF',
  'google one': '#4285F4',
  icloud: '#3693F3',
  evernote: '#00A82D',
  linkedin: '#0077B5',
  'the new york times': '#000000',
  medium: '#000000',
  default: '#6366f1', // Varsayılan renk
};

export default {
  lightTheme,
  darkTheme,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  elevation,
  categoryColors,
  subscriptionBrandColors,
};
