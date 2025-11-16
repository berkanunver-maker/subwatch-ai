/**
 * ==============================================================================
 * FORGOT PASSWORD SCREEN
 * ==============================================================================
 *
 * Şifre sıfırlama ekranı
 *
 * ÖZELLİKLER:
 * - Email ile şifre sıfırlama linki gönderme
 * - Form validation
 * - Başarı/hata mesajları
 * - Geri dön linki
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

export default function ForgotPasswordScreen({ navigation }) {
  const { resetPassword, loading } = useAuth();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  /**
   * Email validasyonu
   */
  const validateForm = () => {
    if (!email.trim()) {
      setError('Email adresi gerekli');
      return false;
    }

    if (!validateEmail(email)) {
      setError('Geçerli bir email adresi girin');
      return false;
    }

    setError('');
    return true;
  };

  /**
   * Şifre sıfırlama maili gönder
   */
  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await resetPassword(email);
      setEmailSent(true);
      Alert.alert(
        'Email Gönderildi',
        'Şifre sıfırlama linki email adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      let errorMessage = 'Şifre sıfırlama maili gönderilemedi.';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz email adresi.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.';
      }

      Alert.alert('Hata', errorMessage);
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>🔒</Text>
          <Text style={styles.title}>Şifremi Unuttum</Text>
          <Text style={styles.subtitle}>
            Email adresinizi girin, size şifre sıfırlama linki gönderelim.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Adresi</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="ornek@email.com"
              placeholderTextColor={theme.textLight}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) {
                  setError('');
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading && !emailSent}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            style={[styles.resetButton, loading && styles.resetButtonDisabled]}
            onPress={handleResetPassword}
            disabled={loading || emailSent}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.resetButtonText}>
                {emailSent ? 'Email Gönderildi ✓' : 'Şifre Sıfırlama Linki Gönder'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>← Giriş Sayfasına Dön</Text>
          </TouchableOpacity>
        </View>

        {/* Info Text */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            💡 Email gelmedi mi? Spam klasörünüzü kontrol edin.
          </Text>
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
    icon: {
      fontSize: 80,
      marginBottom: spacing.md,
    },
    title: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: fontSize.md,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    form: {
      width: '100%',
      marginBottom: spacing.xl,
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
    resetButton: {
      backgroundColor: theme.primary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 50,
      marginBottom: spacing.md,
    },
    resetButtonDisabled: {
      opacity: 0.6,
    },
    resetButtonText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      color: '#fff',
    },
    backButton: {
      padding: spacing.sm,
      alignItems: 'center',
    },
    backButtonText: {
      fontSize: fontSize.md,
      color: theme.primary,
      fontWeight: fontWeight.semibold,
    },
    infoContainer: {
      backgroundColor: theme.backgroundCard,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderLeftWidth: 4,
      borderLeftColor: theme.warning || theme.primary,
    },
    infoText: {
      fontSize: fontSize.sm,
      color: theme.textSecondary,
      lineHeight: 20,
    },
  });
