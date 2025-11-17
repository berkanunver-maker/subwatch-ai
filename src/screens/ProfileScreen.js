/**
 * ==============================================================================
 * PROFILE SCREEN
 * ==============================================================================
 *
 * Kullanıcı profil görüntüleme ve düzenleme ekranı
 *
 * ÖZELLİKLER:
 * - Profil bilgilerini görüntüleme
 * - İsim düzenleme
 * - Email görüntüleme (değiştirilemez)
 * - Email doğrulama durumu
 * - Hesap oluşturma tarihi
 * - Authentication provider bilgisi
 * - Çıkış yapma
 * - Tema desteği
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../config/theme';

export default function ProfileScreen() {
  const { user, updateUserProfile, signOut, loading } = useAuth();
  const { theme } = useTheme();

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Profil güncelleme
   */
  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Hata', 'İsim boş bırakılamaz');
      return;
    }

    if (displayName.trim().length < 2) {
      Alert.alert('Hata', 'İsim en az 2 karakter olmalı');
      return;
    }

    try {
      setIsSaving(true);
      await updateUserProfile({
        displayName: displayName.trim(),
      });

      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi');
      setIsEditing(false);
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      Alert.alert('Hata', 'Profil güncellenemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Düzenlemeyi iptal et
   */
  const handleCancelEdit = () => {
    setDisplayName(user?.displayName || '');
    setIsEditing(false);
  };

  /**
   * Çıkış yapma
   */
  const handleSignOut = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılamadı. Lütfen tekrar deneyin.');
            }
          },
        },
      ]
    );
  };

  /**
   * Tarih formatlama
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Bilinmiyor';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * Auth provider adı
   */
  const getProviderName = (provider) => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'email':
        return 'Email/Password';
      default:
        return provider || 'Bilinmiyor';
    }
  };

  // Dinamik stiller
  const styles = createStyles(theme);

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : '👤'}
          </Text>
        </View>
        <Text style={styles.headerTitle}>{user.displayName || 'Kullanıcı'}</Text>
        <Text style={styles.headerSubtitle}>{user.email}</Text>
      </View>

      {/* Profile Information Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profil Bilgileri</Text>

        {/* Display Name */}
        <View style={styles.infoGroup}>
          <Text style={styles.label}>İsim</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Adınız Soyadınız"
              placeholderTextColor={theme.textLight}
              autoCapitalize="words"
              editable={!isSaving}
            />
          ) : (
            <Text style={styles.value}>{user.displayName || 'Belirtilmemiş'}</Text>
          )}
        </View>

        {/* Email (read-only) */}
        <View style={styles.infoGroup}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
          <Text style={styles.hint}>Email adresi değiştirilemez</Text>
        </View>

        {/* Email Verification Status */}
        {user.authProvider === 'email' && (
          <View style={styles.infoGroup}>
            <Text style={styles.label}>Email Doğrulama</Text>
            <View style={styles.statusContainer}>
              <Text
                style={[
                  styles.statusBadge,
                  user.emailVerified ? styles.statusVerified : styles.statusUnverified,
                ]}
              >
                {user.emailVerified ? '✓ Doğrulandı' : '✗ Doğrulanmadı'}
              </Text>
            </View>
          </View>
        )}

        {/* Edit/Save Buttons */}
        {isEditing ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleCancelEdit}
              disabled={isSaving}
            >
              <Text style={styles.buttonSecondaryText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonPrimaryText}>Kaydet</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.buttonPrimaryText}>Profili Düzenle</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Account Information Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Hesap Bilgileri</Text>

        {/* Account Creation Date */}
        <View style={styles.infoGroup}>
          <Text style={styles.label}>Hesap Oluşturma Tarihi</Text>
          <Text style={styles.value}>{formatDate(user.createdAt)}</Text>
        </View>

        {/* Auth Provider */}
        <View style={styles.infoGroup}>
          <Text style={styles.label}>Giriş Yöntemi</Text>
          <Text style={styles.value}>{getProviderName(user.authProvider)}</Text>
        </View>

        {/* User ID (for debugging) */}
        {__DEV__ && (
          <View style={styles.infoGroup}>
            <Text style={styles.label}>User ID (Dev Mode)</Text>
            <Text style={[styles.value, styles.monoText]} numberOfLines={1}>
              {user.uid}
            </Text>
          </View>
        )}
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        style={[styles.button, styles.buttonDanger]}
        onPress={handleSignOut}
      >
        <Text style={styles.buttonDangerText}>Çıkış Yap</Text>
      </TouchableOpacity>

      {/* Version Info (bottom padding) */}
      <Text style={styles.versionText}>SubWatch AI v1.0.0</Text>
    </ScrollView>
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xl,
      paddingVertical: spacing.xl,
    },
    avatarContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    avatarText: {
      fontSize: fontSize.xxxl,
      fontWeight: fontWeight.bold,
      color: '#fff',
    },
    headerTitle: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.xs,
    },
    headerSubtitle: {
      fontSize: fontSize.md,
      color: theme.textSecondary,
    },
    card: {
      backgroundColor: theme.backgroundCard,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: theme.text,
      marginBottom: spacing.lg,
    },
    infoGroup: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: theme.textSecondary,
      marginBottom: spacing.xs,
    },
    value: {
      fontSize: fontSize.md,
      color: theme.text,
      paddingVertical: spacing.xs,
    },
    hint: {
      fontSize: fontSize.xs,
      color: theme.textLight,
      fontStyle: 'italic',
      marginTop: spacing.xs,
    },
    input: {
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: fontSize.md,
      color: theme.text,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusBadge: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.sm,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
    },
    statusVerified: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
    },
    statusUnverified: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.md,
    },
    button: {
      flex: 1,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 50,
    },
    buttonPrimary: {
      backgroundColor: theme.primary,
    },
    buttonPrimaryText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      color: '#fff',
    },
    buttonSecondary: {
      backgroundColor: theme.backgroundCard,
      borderWidth: 1,
      borderColor: theme.border,
    },
    buttonSecondaryText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: theme.text,
    },
    buttonDanger: {
      backgroundColor: theme.error,
      marginTop: spacing.xl,
    },
    buttonDangerText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      color: '#fff',
    },
    monoText: {
      fontFamily: 'monospace',
      fontSize: fontSize.sm,
    },
    versionText: {
      fontSize: fontSize.sm,
      color: theme.textLight,
      textAlign: 'center',
      marginTop: spacing.xxl,
      marginBottom: spacing.md,
    },
  });
