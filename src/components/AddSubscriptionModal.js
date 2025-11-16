/**
 * ==============================================================================
 * ADD SUBSCRIPTION MODAL
 * ==============================================================================
 *
 * Yeni abonelik ekleme formu modal'ı
 *
 * ÖZELLİKLER:
 * - Basit ve anlaşılır form
 * - Input validation
 * - Kategori seçimi
 * - Faturalama döngüsü (aylık/yıllık)
 * - Tema desteği
 * ==============================================================================
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../config/theme';
import { validateSubscriptionName, validateAmount } from '../utils/validation';

export default function AddSubscriptionModal({ visible, onClose }) {
  const { theme } = useTheme();
  const { addSubscription } = useSubscriptions();

  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly | yearly
  const [category, setCategory] = useState('other');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Formu temizle
   */
  const resetForm = () => {
    setName('');
    setPrice('');
    setBillingCycle('monthly');
    setCategory('other');
    setNextBillingDate('');
    setNotes('');
  };

  /**
   * Modal'ı kapat
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  /**
   * Abonelik kaydet
   */
  const handleSave = async () => {
    try {
      // Validation
      if (!validateSubscriptionName(name)) {
        Alert.alert('Hata', 'Lütfen geçerli bir abonelik adı girin');
        return;
      }

      if (!validateAmount(price)) {
        Alert.alert('Hata', 'Lütfen geçerli bir fiyat girin');
        return;
      }

      setLoading(true);

      // Yeni abonelik objesi
      const newSubscription = {
        name: name.trim(),
        price: parseFloat(price),
        currency: 'TRY',
        billingCycle,
        category,
        nextBillingDate:
          nextBillingDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 gün sonra
        notes: notes.trim(),
      };

      await addSubscription(newSubscription);

      Alert.alert('Başarılı', 'Abonelik eklendi!');
      handleClose();
    } catch (error) {
      console.error('Abonelik eklenirken hata:', error);
      Alert.alert('Hata', 'Abonelik eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Yeni Abonelik Ekle</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Abonelik Adı */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Abonelik Adı *</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Netflix, Spotify..."
                placeholderTextColor={theme.placeholder}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Fiyat */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Aylık Fiyat (₺) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={theme.placeholder}
                keyboardType="decimal-pad"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            {/* Faturalama Döngüsü */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Faturalama Döngüsü</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    billingCycle === 'monthly' && styles.radioButtonActive,
                  ]}
                  onPress={() => setBillingCycle('monthly')}
                >
                  <Text
                    style={[
                      styles.radioText,
                      billingCycle === 'monthly' && styles.radioTextActive,
                    ]}
                  >
                    Aylık
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    billingCycle === 'yearly' && styles.radioButtonActive,
                  ]}
                  onPress={() => setBillingCycle('yearly')}
                >
                  <Text
                    style={[
                      styles.radioText,
                      billingCycle === 'yearly' && styles.radioTextActive,
                    ]}
                  >
                    Yıllık
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Kategori */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Kategori</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryButton,
                      category === cat.value && styles.categoryButtonActive,
                    ]}
                    onPress={() => setCategory(cat.value)}
                  >
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                    <Text
                      style={[
                        styles.categoryText,
                        category === cat.value && styles.categoryTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Notlar */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Notlar (Opsiyonel)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Eklemek istediğiniz notlar..."
                placeholderTextColor={theme.placeholder}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </ScrollView>

          {/* Footer - Butonlar */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Kategori listesi
 */
const CATEGORIES = [
  { value: 'streaming', label: 'Video', emoji: '🎬' },
  { value: 'music', label: 'Müzik', emoji: '🎵' },
  { value: 'productivity', label: 'Üretkenlik', emoji: '💼' },
  { value: 'gaming', label: 'Oyun', emoji: '🎮' },
  { value: 'fitness', label: 'Fitness', emoji: '💪' },
  { value: 'news', label: 'Haber', emoji: '📰' },
  { value: 'education', label: 'Eğitim', emoji: '📚' },
  { value: 'storage', label: 'Depolama', emoji: '☁️' },
  { value: 'other', label: 'Diğer', emoji: '📦' },
];

/**
 * Dinamik stil oluşturma
 */
const createStyles = (theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme.background,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      maxHeight: '90%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: theme.text,
    },
    closeButton: {
      fontSize: fontSize.xxl,
      color: theme.textSecondary,
      fontWeight: fontWeight.bold,
    },
    content: {
      padding: spacing.xl,
      maxHeight: 500,
    },
    formGroup: {
      marginBottom: spacing.xl,
    },
    label: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: theme.text,
      marginBottom: spacing.sm,
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
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    radioGroup: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    radioButton: {
      flex: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.backgroundCard,
      alignItems: 'center',
    },
    radioButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    radioText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: theme.text,
    },
    radioTextActive: {
      color: '#fff',
    },
    categoryScroll: {
      flexDirection: 'row',
    },
    categoryButton: {
      alignItems: 'center',
      marginRight: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.backgroundCard,
      minWidth: 80,
    },
    categoryButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    categoryEmoji: {
      fontSize: fontSize.xxl,
      marginBottom: spacing.xs,
    },
    categoryText: {
      fontSize: fontSize.xs,
      color: theme.text,
      fontWeight: fontWeight.medium,
    },
    categoryTextActive: {
      color: '#fff',
    },
    footer: {
      flexDirection: 'row',
      padding: spacing.xl,
      gap: spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    button: {
      flex: 1,
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.backgroundCard,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cancelButtonText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: theme.text,
    },
    saveButton: {
      backgroundColor: theme.primary,
    },
    saveButtonText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: '#fff',
    },
  });
