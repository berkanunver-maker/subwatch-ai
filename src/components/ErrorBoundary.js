/**
 * ==============================================================================
 * ERROR BOUNDARY
 * ==============================================================================
 *
 * React Error Boundary component
 * Uygulama crash'lerini yakalar ve kullanıcı dostu hata ekranı gösterir
 *
 * ÖZELLİKLER:
 * - JavaScript hata yakalama
 * - Kullanıcı dostu hata mesajı
 * - Uygulama yeniden başlatma
 * - Hata loglama (production için)
 * ==============================================================================
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  /**
   * Hata yakalandığında state güncelle
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * Hata detaylarını logla
   */
  componentDidCatch(error, errorInfo) {
    // Hata detaylarını kaydet
    this.setState({
      error,
      errorInfo,
    });

    // Production'da hata loglama servisi kullan (örn: Sentry)
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // TODO: Sentry veya Firebase Crashlytics'e gönder
    // if (ENV.isProduction()) {
    //   Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  /**
   * Uygulamayı yeniden başlat
   */
  handleRestart = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Hata ekranı
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Icon */}
            <Text style={styles.icon}>⚠️</Text>

            {/* Title */}
            <Text style={styles.title}>Bir Hata Oluştu</Text>

            {/* Description */}
            <Text style={styles.description}>
              Üzgünüz, beklenmeyen bir hata oluştu. Lütfen uygulamayı yeniden
              başlatmayı deneyin.
            </Text>

            {/* Error Details (Development only) */}
            {__DEV__ && this.state.error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Hata Detayları (Dev Mode):</Text>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            {/* Restart Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={this.handleRestart}
            >
              <Text style={styles.buttonText}>Uygulamayı Yeniden Başlat</Text>
            </TouchableOpacity>

            {/* Help Text */}
            <Text style={styles.helpText}>
              Sorun devam ederse lütfen uygulamayı kapatıp tekrar açın.
            </Text>
          </View>
        </View>
      );
    }

    // Hata yoksa children'ı render et
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
    maxHeight: 200,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 10,
    color: '#dc2626',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  helpText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default ErrorBoundary;
