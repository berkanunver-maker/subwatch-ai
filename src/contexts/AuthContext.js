/**
 * ==============================================================================
 * AUTHENTICATION CONTEXT
 * ==============================================================================
 *
 * Firebase Authentication ile kullanıcı yönetimi
 *
 * ÖZELLİKLER:
 * - Google Sign-In (OAuth 2.0)
 * - Email/Password kayıt ve giriş
 * - Şifre sıfırlama
 * - Otomatik giriş (persistence)
 * - Kullanıcı profil yönetimi
 * - Çıkış yapma
 * ==============================================================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth, db } from '../config/firebase';
import { ENV } from '../config/env';

// Context oluştur
const AuthContext = createContext();

/**
 * Google Sign-In yapılandırması
 */
GoogleSignin.configure({
  webClientId: ENV.GOOGLE_CLIENT_ID, // Google Cloud Console'dan alınan Web Client ID
  offlineAccess: true,
});

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  /**
   * Firebase auth state değişikliklerini dinle
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Email verification durumunu kontrol et
        setEmailVerified(firebaseUser.emailVerified);

        // Kullanıcı bilgilerini Firestore'dan al
        const userData = await getUserData(firebaseUser.uid);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          ...userData,
        });
      } else {
        setUser(null);
        setEmailVerified(false);
      }

      if (initializing) {
        setInitializing(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [initializing]);

  /**
   * Firestore'dan kullanıcı verilerini al
   */
  const getUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return {};
    } catch (error) {
      console.error('Kullanıcı verisi alma hatası:', error);
      return {};
    }
  };

  /**
   * Firestore'a kullanıcı verilerini kaydet
   */
  const saveUserData = async (uid, userData) => {
    try {
      await setDoc(
        doc(db, 'users', uid),
        {
          ...userData,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Kullanıcı verisi kaydetme hatası:', error);
      throw error;
    }
  };

  /**
   * Email/Password ile kayıt ol
   */
  const signUpWithEmail = async (email, password, displayName) => {
    try {
      setLoading(true);

      // Firebase Authentication'da kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Kullanıcı profil adını güncelle
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }

      // Email doğrulama maili gönder
      await sendEmailVerification(userCredential.user);
      console.log('✅ Email doğrulama maili gönderildi:', email);

      // Firestore'a kullanıcı bilgilerini kaydet
      await saveUserData(userCredential.user.uid, {
        email,
        displayName: displayName || '',
        createdAt: new Date().toISOString(),
        authProvider: 'email',
        emailVerified: false,
      });

      return userCredential.user;
    } catch (error) {
      console.error('Email kayıt hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Email/Password ile giriş yap
   */
  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      console.error('Email giriş hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Google ile giriş yap
   */
  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      // Google Sign-In başlat
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();

      // Google credential oluştur
      const googleCredential = GoogleAuthProvider.credential(idToken);

      // Firebase ile giriş yap
      const userCredential = await signInWithCredential(auth, googleCredential);

      // Firestore'a kullanıcı bilgilerini kaydet (ilk giriş ise)
      const userData = await getUserData(userCredential.user.uid);
      if (!userData.createdAt) {
        await saveUserData(userCredential.user.uid, {
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          createdAt: new Date().toISOString(),
          authProvider: 'google',
        });
      }

      return userCredential.user;
    } catch (error) {
      console.error('Google giriş hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Şifre sıfırlama maili gönder
   */
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Email doğrulama maili tekrar gönder
   */
  const resendVerificationEmail = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('Kullanıcı giriş yapmamış');
      }

      if (auth.currentUser.emailVerified) {
        throw new Error('Email zaten doğrulanmış');
      }

      setLoading(true);
      await sendEmailVerification(auth.currentUser);
      console.log('✅ Email doğrulama maili tekrar gönderildi');
    } catch (error) {
      console.error('Email doğrulama maili gönderme hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Email doğrulama durumunu kontrol et (manuel refresh)
   */
  const checkEmailVerification = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('Kullanıcı giriş yapmamış');
      }

      // Firebase'den güncel kullanıcı bilgisini çek
      await auth.currentUser.reload();
      const isVerified = auth.currentUser.emailVerified;

      setEmailVerified(isVerified);

      // Firestore'da güncelle
      if (isVerified && user) {
        await saveUserData(user.uid, {
          emailVerified: true,
        });
      }

      return isVerified;
    } catch (error) {
      console.error('Email doğrulama kontrolü hatası:', error);
      throw error;
    }
  };

  /**
   * Kullanıcı profil güncelle
   */
  const updateUserProfile = async (updates) => {
    try {
      setLoading(true);

      if (!user) {
        throw new Error('Kullanıcı giriş yapmamış');
      }

      // Firebase Auth profil güncelle
      if (updates.displayName || updates.photoURL) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName,
          photoURL: updates.photoURL,
        });
      }

      // Firestore'da kullanıcı verilerini güncelle
      await saveUserData(user.uid, updates);

      // Local state'i güncelle
      setUser((prev) => ({
        ...prev,
        ...updates,
      }));
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Çıkış yap
   */
  const signOut = async () => {
    try {
      setLoading(true);

      // Google Sign-In'den çıkış yap (eğer Google ile giriş yapılmışsa)
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        await GoogleSignin.signOut();
      }

      // Firebase'den çıkış yap
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Çıkış yapma hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    initializing,
    emailVerified,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    resetPassword,
    resendVerificationEmail,
    checkEmailVerification,
    updateUserProfile,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Auth Context Hook
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
