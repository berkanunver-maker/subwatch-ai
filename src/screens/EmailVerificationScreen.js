/**
 * ==============================================================================
 * EMAIL VERIFICATION SCREEN
 * ==============================================================================
 *
 * Email doğrulama ekranı
 *
 * ÖZELLİKLER:
 * - Email doğrulama hatırlatması
 * - Doğrulama mailini tekrar gönderme
 * - Manuel doğrulama kontrolü
 * - Çıkış yapma seçeneği
 * ==============================================================================
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../config/theme';

export default function EmailVerificationScreen({ navigation }) {
  const {
    user,
    emailVerified,
    resendVerificationEmail,
    checkEmailVerification,
    signOut,
    loading,
  } = useAuth();
  const { theme } = useTheme();

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  /**
   * Email doğrulamayı kontrol et
   */
  const handleCheckVerification = async () => {
    try {
      setChecking(true);
      const isVerified = await checkEmailVerification();

      if (isVerified) {
        Alert.alert(
          'Tebrikler! 🎉',
          'Email adresiniz başarıyla doğrulandı. Şimdi uygulamayı kullanmaya başlayabilirsiniz!',
          [{ text: 'Harika!' }]
        );
      } else {
        Alert.alert(
          'Henüz Doğrulanmadı',
          'Email adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin ve doğrulama linkine tıklayın.',
          [{ text: 'Tamam' }]
        );
      }
    } catch (error) {
      console.error('Doğrulama kontrolü hatası:', error);
      Alert.alert('Hata', 'Doğrulama kontrolü yapılamadı. Lütfen tekrar deneyin.');
    } finally {
      setChecking(false);
    }
  };

  /**
   * Doğrulama mailini tekrar gönder
   */
  const handleResendEmail = async () => {
    try {
      setResending(true);
      await resendVerificationEmail();
      Alert.alert(
        'Email Gönderildi',
        'Doğrulama maili email adresinize tekrar gönderildi. Lütfen gelen kutunuzu kontrol edin.',
        [{ text: 'Tamam' }]
      );
    } catch (error) {
      console.error('Email gönderme hatası:', error);

      let errorMessage = 'Email gönderilemedi. Lütfen tekrar deneyin.';
      if (error.message === 'Email zaten doğrulanmış') {
        errorMessage = 'Email adresiniz zaten doğrulanmış!';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Çok fazla istek gönderildi. Lütfen birkaç dakika bekleyin.';
      }

      Alert.alert('Hata', errorMessage);
    } finally {
      setResending(false);
    }
  };

  /**
   * Çıkış yap
   */
  const handleSignOut = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz? Email doğrulama işlemini daha sonra tamamlayabilirsiniz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Çıkış hatası:', error);
              Alert.alert('Hata', 'Çıkış yapılamadı.');
            }
          },
        },
      ]
    );
  };

  // Dinamik stiller
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <Text style={styles.icon}>📧</Text>

        {/* Title */}
        <Text style={styles.title}>Email Adresinizi Doğrulayın</Text>

        {/* Email */}
        <Text style={styles.email}>{user?.email}</Text>

        {/* Description */}
        <Text style={styles.description}>
          Email adresinize bir doğrulama linki gönderdik. Lütfen gelen kutunuzu kontrol
          edin ve linke tıklayarak email adresinizi doğrulayın.
        </Text>

        {/* Buttons */}
        <View style={styles.buttons}>
          {/* Check Verification Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCheckVerification}
            disabled={checking || loading}
          >
            {checking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Doğrulamayı Kontrol Et
              </Text>
            )}
          </TouchableOpacity>

          {/* Resend Email Button */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleResendEmail}
            disabled={resending || loading}
          >
            {resending ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <Text style={styles.secondaryButtonText}>
                Doğrulama Mailini Tekrar Gönder
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Email gelmedi mi?
            {'\n'}• Spam/Junk klasörünü kontrol edin
            {'\n'}• Birkaç dakika bekleyin
            {'\n'}• Doğrulama mailini tekrar gönderin
          </Text>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    icon: {
      fontSize: 80,
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    email: {
      fontSize: fontSize.md,
      color: theme.primary,
      fontWeight: fontWeight.semibold,
      marginBottom: spacing.lg,
    },
    description: {
      fontSize: fontSize.md,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: spacing.xxl,
    },
    buttons: {
      width: '100%',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    primaryButton: {
      backgroundColor: theme.primary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 50,
    },
    primaryButtonText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      color: '#fff',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.primary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 50,
    },
    secondaryButtonText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: theme.primary,
    },
    infoBox: {
      backgroundColor: theme.backgroundCard,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderLeftWidth: 4,
      borderLeftColor: theme.warning || theme.primary,
      width: '100%',
      marginBottom: spacing.xl,
    },
    infoText: {
      fontSize: fontSize.sm,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    signOutButton: {
      padding: spacing.sm,
    },
    signOutText: {
      fontSize: fontSize.sm,
      color: theme.textLight,
      textDecorationLine: 'underline',
    },
  });
