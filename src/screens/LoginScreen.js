/**
 * ==============================================================================
 * LOGIN SCREEN
 * ==============================================================================
 *
 * Kullanıcı giriş ekranı
 *
 * ÖZELLİKLER:
 * - Email/Password ile giriş
 * - Google Sign-In
 * - Şifre unuttum linki
 * - Kayıt ol linki
 * - Form validation
 * - Hata mesajları
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
import { validateEmail } from '../utils/validation';

export default function LoginScreen({ navigation }) {
  const { signInWithEmail, signInWithGoogle, loading } = useAuth();
  const { theme } = useTheme();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  /**
   * Form validasyonu
   */
  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email adresi gerekli';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Geçerli bir email adresi girin';
    }

    if (!password) {
      newErrors.password = 'Şifre gerekli';
    } else if (password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Email/Password ile giriş
   */
  const handleEmailLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await signInWithEmail(email, password);
      // Navigation otomatik olarak AuthContext tarafından yapılacak
    } catch (error) {
      let errorMessage = 'Giriş yapılamadı. Lütfen tekrar deneyin.';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Yanlış şifre. Lütfen tekrar deneyin.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz email adresi.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Bu hesap devre dışı bırakılmış.';
      }

      Alert.alert('Giriş Hatası', errorMessage);
    }
  };

  /**
   * Google ile giriş
   */
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // Navigation otomatik olarak AuthContext tarafından yapılacak
    } catch (error) {
      let errorMessage = 'Google ile giriş yapılamadı.';

      if (error.code === 'auth/popup-closed-by-user') {
        return; // Kullanıcı popup'ı kapattı, hata gösterme
      } else if (error.code === 'auth/cancelled') {
        return; // Kullanıcı iptal etti
      }

      Alert.alert('Google Giriş Hatası', errorMessage);
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
          <Text style={styles.title}>SubWatch AI</Text>
          <Text style={styles.subtitle}>Aboneliklerinizi Akıllıca Yönetin</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
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
              placeholder="••••••••"
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

          {/* Şifre Unuttum */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={loading}
          >
            <Text style={styles.forgotPassword}>Şifremi Unuttum</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleEmailLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Giriş Yap</Text>
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
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Text style={styles.googleButtonIcon}>G</Text>
            <Text style={styles.googleButtonText}>Google ile Giriş Yap</Text>
          </TouchableOpacity>

          {/* Kayıt Ol Linki */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Hesabınız yok mu? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
            >
              <Text style={styles.signupLink}>Kayıt Olun</Text>
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
    forgotPassword: {
      fontSize: fontSize.sm,
      color: theme.primary,
      textAlign: 'right',
      marginBottom: spacing.lg,
    },
    loginButton: {
      backgroundColor: theme.primary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 50,
    },
    loginButtonDisabled: {
      opacity: 0.6,
    },
    loginButtonText: {
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
    signupContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.xl,
    },
    signupText: {
      fontSize: fontSize.md,
      color: theme.textSecondary,
    },
    signupLink: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      color: theme.primary,
    },
  });
