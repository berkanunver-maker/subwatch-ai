/**
 * ==============================================================================
 * SUBSCRIPTION DETAIL SCREEN
 * ==============================================================================
 *
 * Abonelik detaylarını gösterir
 *
 * ÖZELLİKLER:
 * - Tam abonelik bilgileri
 * - Ödeme geçmişi
 * - Düzenleme/silme aksiyonları
 * - Kategori ve durum bilgisi
 * ==============================================================================
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../config/theme';
import { CATEGORY, BILLING_CYCLE } from '../config/constants';

export default function SubscriptionDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { subscriptions, deleteSubscription } = useSubscriptions();

  // Route'dan gelen subscription ID
  const { subscriptionId } = route.params;

  // Subscription bilgisini bul
  const subscription = subscriptions.find(sub => sub.id === subscriptionId);

  // Subscription bulunamadıysa geri dön
  if (!subscription) {
    return (
      <View style={[styles(theme).container, styles(theme).centerContent]}>
        <Text style={styles(theme).errorText}>Abonelik bulunamadı</Text>
        <TouchableOpacity
          style={styles(theme).button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles(theme).buttonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * Abonelik sil
   */
  const handleDelete = () => {
    Alert.alert(
      'Aboneliği Sil',
      `${subscription.name} aboneliğini silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSubscription(subscriptionId);
              Alert.alert('Başarılı', 'Abonelik silindi');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Hata', 'Abonelik silinirken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  /**
   * Kategori ikonu
   */
  const getCategoryIcon = (category) => {
    return CATEGORY.ICONS[category] || CATEGORY.ICONS.other;
  };

  /**
   * Kategori adı
   */
  const getCategoryName = (category) => {
    return CATEGORY.LABELS[category] || CATEGORY.LABELS.other;
  };

  /**
   * Billing cycle adı
   */
  const getBillingCycleName = (cycle) => {
    return BILLING_CYCLE.LABELS[cycle] || cycle;
  };

  /**
   * Para birimi sembolü
   */
  const getCurrencySymbol = (currency) => {
    const symbols = { TRY: '₺', USD: '$', EUR: '€', GBP: '£' };
    return symbols[currency] || currency;
  };

  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{getCategoryIcon(subscription.category)}</Text>
        </View>
        <Text style={styles.subscriptionName}>{subscription.name}</Text>
        <Text style={styles.category}>{getCategoryName(subscription.category)}</Text>

        {/* Status Badge */}
        <View style={[
          styles.statusBadge,
          subscription.isActive ? styles.statusActive : styles.statusInactive
        ]}>
          <Text style={styles.statusText}>
            {subscription.isActive ? '✓ Aktif' : '✗ Pasif'}
          </Text>
        </View>
      </View>

      {/* Price Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fiyat Bilgisi</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceAmount}>
            {getCurrencySymbol(subscription.currency)}{subscription.price}
          </Text>
          <Text style={styles.pricePeriod}>
            / {getBillingCycleName(subscription.billingCycle)}
          </Text>
        </View>
      </View>

      {/* Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Detaylar</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Sonraki Ödeme</Text>
          <Text style={styles.detailValue}>
            {new Date(subscription.nextBillingDate).toLocaleDateString('tr-TR')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Oluşturulma Tarihi</Text>
          <Text style={styles.detailValue}>
            {new Date(subscription.createdAt).toLocaleDateString('tr-TR')}
          </Text>
        </View>

        {subscription.description && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Açıklama</Text>
            <Text style={[styles.detailValue, styles.descriptionText]}>
              {subscription.description}
            </Text>
          </View>
        )}

        {subscription.website && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Website</Text>
            <Text style={[styles.detailValue, styles.linkText]}>
              {subscription.website}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsCard}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => Alert.alert('Bilgi', 'Düzenleme özelliği yakında eklenecek')}
        >
          <Text style={styles.editButtonText}>Düzenle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Sil</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

/**
 * Dinamik stiller
 */
const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerCard: {
      backgroundColor: theme.primary,
      paddingVertical: spacing.xxl,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    iconText: {
      fontSize: fontSize.xxxl * 1.5,
    },
    subscriptionName: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: '#fff',
      marginBottom: spacing.xs,
    },
    category: {
      fontSize: fontSize.md,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    statusBadge: {
      marginTop: spacing.md,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.sm,
    },
    statusActive: {
      backgroundColor: '#d1fae5',
    },
    statusInactive: {
      backgroundColor: '#fee2e2',
    },
    statusText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: '#065f46',
    },
    card: {
      backgroundColor: theme.backgroundCard,
      margin: spacing.lg,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
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
      marginBottom: spacing.md,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    priceAmount: {
      fontSize: fontSize.xxxl,
      fontWeight: fontWeight.bold,
      color: theme.primary,
    },
    pricePeriod: {
      fontSize: fontSize.md,
      color: theme.textSecondary,
      marginLeft: spacing.xs,
    },
    detailRow: {
      marginBottom: spacing.md,
    },
    detailLabel: {
      fontSize: fontSize.sm,
      color: theme.textSecondary,
      marginBottom: spacing.xs,
    },
    detailValue: {
      fontSize: fontSize.md,
      color: theme.text,
      fontWeight: fontWeight.medium,
    },
    descriptionText: {
      fontWeight: fontWeight.normal,
      lineHeight: 20,
    },
    linkText: {
      color: theme.primary,
    },
    actionsCard: {
      flexDirection: 'row',
      marginHorizontal: spacing.lg,
      gap: spacing.md,
    },
    actionButton: {
      flex: 1,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      minHeight: 50,
      justifyContent: 'center',
    },
    editButton: {
      backgroundColor: theme.backgroundCard,
      borderWidth: 1,
      borderColor: theme.border,
    },
    editButtonText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      color: theme.text,
    },
    deleteButton: {
      backgroundColor: theme.error,
    },
    deleteButtonText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      color: '#fff',
    },
    errorText: {
      fontSize: fontSize.lg,
      color: theme.textSecondary,
      marginBottom: spacing.lg,
    },
    button: {
      backgroundColor: theme.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.md,
    },
    buttonText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      color: '#fff',
    },
  });
