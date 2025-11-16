/**
 * ==============================================================================
 * REGISTER SCREEN
 * ==============================================================================
 *
 * Kullanıcı kayıt ekranı
 *
 * ÖZELLİKLER:
 * - Email/Password ile kayıt
 * - Google Sign-In
 * - İsim girişi
 * - Form validation
 * - Şifre güvenlik kontrolü
 * - Giriş yap linki
 * ==============================================================================
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../config/theme';
import { validateEmail, validatePassword } from '../utils/validation';

export default function RegisterScreen({ navigation }) {
  const { signUpWithEmail, signInWithGoogle, loading } = useAuth();
  const { theme } = useTheme();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  /**
   * Form validasyonu
   */
  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'İsim gerekli';
    } else if (name.trim().length < 2) {
      newErrors.name = 'İsim en az 2 karakter olmalı';
    }

    if (!email.trim()) {
      newErrors.email = 'Email adresi gerekli';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Geçerli bir email adresi girin';
    }

    if (!password) {
      newErrors.password = 'Şifre gerekli';
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Şifre tekrarı gerekli';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Email/Password ile kayıt
   */
  const handleEmailRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await signUpWithEmail(email, password, name.trim());
      Alert.alert(
        'Kayıt Başarılı! 🎉',
        `Email doğrulama linki ${email} adresine gönderildi.\n\nLütfen gelen kutunuzu kontrol edin ve email adresinizi doğrulayın.`,
        [{ text: 'Tamam' }]
      );
      // Navigation otomatik olarak AuthContext tarafından yapılacak
      // Email verification screen gösterilecek
    } catch (error) {
      let errorMessage = 'Kayıt olunamadı. Lütfen tekrar deneyin.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu email adresi zaten kullanımda.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz email adresi.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Şifre çok zayıf. Daha güçlü bir şifre seçin.';
      }

      Alert.alert('Kayıt Hatası', errorMessage);
    }
  };

  /**
   * Google ile kayıt
   */
  const handleGoogleRegister = async () => {
    try {
      await signInWithGoogle();
      Alert.alert(
        'Kayıt Başarılı',
        'Google hesabınızla başarıyla kayıt oldunuz!',
        [{ text: 'Tamam' }]
      );
      // Navigation otomatik olarak AuthContext tarafından yapılacak
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled') {
        return; // Kullanıcı iptal etti
      }

      Alert.alert('Google Kayıt Hatası', 'Google ile kayıt olunamadı.');
    }
  };

  // Dinamik stiller
  const styles = createStyles(theme);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo/Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>💳</Text>
          <Text style={styles.title}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>
            Aboneliklerinizi takip etmeye başlayın
          </Text>
        </View>

        {/* Register Form */}
        <View style={styles.form}>
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>İsim</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Adınız Soyadınız"
              placeholderTextColor={theme.textLight}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: null }));
                }
              }}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="ornek@email.com"
              placeholderTextColor={theme.textLight}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: null }));
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="En az 8 karakter"
              placeholderTextColor={theme.textLight}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: null }));
                }
              }}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre Tekrar</Text>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              placeholder="Şifrenizi tekrar girin"
              placeholderTextColor={theme.textLight}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: null }));
                }
              }}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleEmailRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleRegister}
            disabled={loading}
          >
            <Text style={styles.googleButtonIcon}>G</Text>
            <Text style={styles.googleButtonText}>Google ile Kayıt Ol</Text>
          </TouchableOpacity>

          {/* Login Linki */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Zaten hesabınız var mı? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={styles.loginLink}>Giriş Yapın</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/**
 * Dinamik stiller (tema bazlı)
 */
const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: spacing.xl,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xxl,
    },
    logo: {
      fontSize: 80,
      marginBottom: spacing.md,
    },
    title: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: fontSize.md,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    form: {
      width: '100%',
    },
    inputGroup: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: theme.text,
      marginBottom: spacing.xs,
    },
    input: {
      backgroundColor: theme.backgroundCard,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: fontSize.md,
      color: theme.text,
    },
    inputError: {
      borderColor: theme.error,
    },
    errorText: {
      fontSize: fontSize.sm,
      color: theme.error,
      marginTop: spacing.xs,
    },
    registerButton: {
      backgroundColor: theme.primary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 50,
    },
    registerButtonDisabled: {
      opacity: 0.6,
    },
    registerButtonText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      color: '#fff',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.xl,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.border,
    },
    dividerText: {
      fontSize: fontSize.sm,
      color: theme.textSecondary,
      marginHorizontal: spacing.md,
    },
    googleButton: {
      backgroundColor: '#4285F4',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      minHeight: 50,
    },
    googleButtonIcon: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      backgroundColor: '#fff',
      color: '#4285F4',
      width: 32,
      height: 32,
      textAlign: 'center',
      lineHeight: 32,
      borderRadius: 4,
      marginRight: spacing.md,
    },
    googleButtonText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: '#fff',
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.xl,
    },
    loginText: {
      fontSize: fontSize.md,
      color: theme.textSecondary,
    },
    loginLink: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      color: theme.primary,
    },
  });
