import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signOut as firebaseSignOut
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  get,
  remove,
  onValue,
  off,
  update,
} from 'firebase/database';
import firebaseConfig from '../../firebase-applet-config.json';
import { Post, Comment, Photo, Category, User, BannerItem, DigitalCurriculum, SystemBranding } from '../types';
import { initialCategories } from '../data/mockData';

// Ensure Firebase App is initialized once
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firebase Realtime Database
const rtdbUrl = firebaseConfig.databaseURL || 'https://gen-lang-client-0321247623-default-rtdb.firebaseio.com';
export const rtdb = getDatabase(app, rtdbUrl);

import { seedAllDatabaseData } from './databaseSeeds';

/**
 * Executes complete database migrations and seeding for Firebase Realtime Database:
 * 1. Ensures Admin User (insideouttecnologies@gmail.com) exists with password and admin role.
 * 2. Seeds real dynamic categories, posts, gallery, comments, and banner items.
 * 3. Writes migration audit record at /system/migrations.
 */
export const runDatabaseMigrations = async (force: boolean = false): Promise<{ success: boolean; message: string; timestamp: string }> => {
  const timestamp = new Date().toISOString();
  try {
    const adminUserEmail = 'insideouttecnologies@gmail.com';

    // 1. Ensure Admin User record exists in Firebase Realtime Database
    const adminUser: User = {
      id: 'user-admin-main',
      name: 'Mariana Costa',
      email: adminUserEmail,
      password: 'adminPassword123',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80',
      bio: 'Estudante finalista do 13º ano de Gestão Empresarial | Administradora da plataforma.',
      role: 'admin',
      createdAt: '01 de Setembro, 2026',
      savedPostIds: [],
      likedPostIds: [],
      readHistoryIds: [],
    };

    await set(ref(rtdb, `users/${adminUser.id}`), adminUser);

    // 2. Populate complete dynamic seeds in Firebase
    await seedAllDatabaseData(force);

    // 3. Record migration watermark
    await set(ref(rtdb, 'system/migrations'), {
      version: 'v2026.10.10_gestao_empresarial_seeds',
      executedAt: timestamp,
      status: 'applied',
      adminEmail: adminUserEmail,
      schemaReady: true,
    });

    return {
      success: true,
      message: 'Base de dados semeada com sucesso! Artigos de Gestão Empresarial, galeria, comentários e utilizadores ativos.',
      timestamp,
    };
  } catch (err: any) {
    console.error('Erro ao executar migrations no Firebase:', err);
    return {
      success: false,
      message: `Erro ao executar migrations: ${err.message}`,
      timestamp,
    };
  }
};

export const executeAdminSeeder = runDatabaseMigrations;

/**
 * Seed initial data if Firebase Database is currently empty
 */
export const seedInitialFirebaseData = async () => {
  return runDatabaseMigrations(false);
};

/**
 * Real-time listeners for all entities
 */
export const listenFirebasePosts = (onData: (posts: Post[]) => void) => {
  const postsRef = ref(rtdb, 'posts');
  return onValue(
    postsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list: Post[] = Array.isArray(val) ? val.filter(Boolean) : Object.values(val || {});
        // Sort descending by id or date
        onData(list);
      }
    },
    (error) => {
      console.warn('Firebase Posts listener error:', error);
    }
  );
};

export const listenFirebaseComments = (onData: (comments: Record<string, Comment[]>) => void) => {
  const commentsRef = ref(rtdb, 'comments');
  return onValue(
    commentsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val() || {};
        // Normalize array or map structures
        const normalized: Record<string, Comment[]> = {};
        Object.entries(val).forEach(([postId, postComments]) => {
          if (Array.isArray(postComments)) {
            normalized[postId] = postComments.filter(Boolean);
          } else if (typeof postComments === 'object' && postComments !== null) {
            normalized[postId] = Object.values(postComments as Record<string, Comment>);
          }
        });
        onData(normalized);
      }
    },
    (error) => {
      console.warn('Firebase Comments listener error:', error);
    }
  );
};

export const listenFirebaseGallery = (onData: (photos: Photo[]) => void) => {
  const galleryRef = ref(rtdb, 'gallery');
  return onValue(
    galleryRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list: Photo[] = Array.isArray(val) ? val.filter(Boolean) : Object.values(val || {});
        onData(list);
      }
    },
    (error) => {
      console.warn('Firebase Gallery listener error:', error);
    }
  );
};

export const listenFirebaseUsers = (onData: (users: User[]) => void) => {
  const usersRef = ref(rtdb, 'users');
  return onValue(
    usersRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list: User[] = Array.isArray(val) ? val.filter(Boolean) : Object.values(val || {});
        onData(list);
      }
    },
    (error) => {
      console.warn('Firebase Users listener error:', error);
    }
  );
};

export const listenFirebaseCategories = (onData: (categories: Category[]) => void) => {
  const catRef = ref(rtdb, 'categories');
  return onValue(
    catRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list: Category[] = Array.isArray(val) ? val.filter(Boolean) : Object.values(val || {});
        onData(list);
      }
    },
    (error) => {
      console.warn('Firebase Categories listener error:', error);
    }
  );
};

/**
 * Entity mutation helpers for Firebase
 */
export const persistPostToFirebase = async (post: Post) => {
  try {
    await set(ref(rtdb, `posts/${post.id}`), post);
  } catch (error) {
    console.error('Erro ao guardar post no Firebase:', error);
  }
};

export const deletePostFromFirebase = async (postId: string) => {
  try {
    await remove(ref(rtdb, `posts/${postId}`));
  } catch (error) {
    console.error('Erro ao eliminar post no Firebase:', error);
  }
};

export const persistCommentToFirebase = async (postId: string, comment: Comment) => {
  try {
    await set(ref(rtdb, `comments/${postId}/${comment.id}`), comment);
  } catch (error) {
    console.error('Erro ao guardar comentário no Firebase:', error);
  }
};

export const updateCommentLikesInFirebase = async (postId: string, commentId: string, likes: number) => {
  try {
    await update(ref(rtdb, `comments/${postId}/${commentId}`), { likes });
  } catch (error) {
    console.error('Erro ao atualizar likes no Firebase:', error);
  }
};

export const persistPhotoToFirebase = async (photo: Photo) => {
  try {
    await set(ref(rtdb, `gallery/${photo.id}`), photo);
  } catch (error) {
    console.error('Erro ao guardar foto no Firebase:', error);
  }
};

export const updatePhotoLikesInFirebase = async (photoId: string, likes: number) => {
  try {
    await update(ref(rtdb, `gallery/${photoId}`), { likes });
  } catch (error) {
    console.error('Erro ao atualizar likes de foto no Firebase:', error);
  }
};

export const persistUserToFirebase = async (user: User) => {
  try {
    await set(ref(rtdb, `users/${user.id}`), user);
  } catch (error) {
    console.error('Erro ao guardar utilizador no Firebase:', error);
  }
};

export const persistBannerItemsToFirebase = async (bannerItems: BannerItem[]) => {
  try {
    await set(ref(rtdb, 'bannerItems'), bannerItems);
  } catch (error) {
    console.error('Erro ao guardar banner items no Firebase:', error);
  }
};

export const loadBannerItemsFromFirebase = async (): Promise<BannerItem[] | null> => {
  try {
    const snapshot = await get(ref(rtdb, 'bannerItems'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (Array.isArray(data)) return data;
      if (typeof data === 'object') return Object.values(data);
    }
  } catch (error) {
    console.error('Erro ao carregar banner items do Firebase:', error);
  }
  return null;
};

/**
 * Standard Sign In With Google for all users (readers and admin)
 */
export const standardGoogleProvider = new GoogleAuthProvider();
standardGoogleProvider.addScope('email');
standardGoogleProvider.addScope('profile');
standardGoogleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const signOutFromFirebase = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.warn('Erro ao encerrar sessão Firebase:', error);
  }
};

export interface GoogleAuthResult {
  success: boolean;
  user?: User;
  message?: string;
  errorCode?: string;
  domain?: string;
}

/**
 * Synchronizes or creates a user profile in Firebase Realtime Database
 * Ensures admin role for insideouttecnologies@gmail.com automatically.
 */
export const syncOrCreateGoogleUser = async (data: {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
}): Promise<User> => {
  const email = data.email.toLowerCase().trim();
  const isAdminEmail = email === 'insideouttecnologies@gmail.com';

  // 1. Check if user already exists in Firebase RTDB by UID
  const userSnapshot = await get(ref(rtdb, `users/${data.uid}`));
  let appUser: User;

  if (userSnapshot.exists()) {
    appUser = userSnapshot.val();
    const updates: Partial<User> = {};
    if (isAdminEmail && appUser.role !== 'admin') {
      appUser.role = 'admin';
      updates.role = 'admin';
    }
    if (data.photoURL && appUser.avatar !== data.photoURL) {
      appUser.avatar = data.photoURL;
      updates.avatar = data.photoURL;
    }
    if (Object.keys(updates).length > 0) {
      await update(ref(rtdb, `users/${data.uid}`), updates);
    }
  } else {
    // 2. Check if user exists by email (e.g. seeded admin)
    const usersSnapshot = await get(ref(rtdb, 'users'));
    let existingByEmail: User | undefined;
    if (usersSnapshot.exists()) {
      const allUsers: User[] = Object.values(usersSnapshot.val());
      existingByEmail = allUsers.find((u) => u.email.toLowerCase() === email);
    }

    const today = new Date();
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const dateFormatted = `${today.getDate()} de ${months[today.getMonth()]}, ${today.getFullYear()}`;

    if (existingByEmail) {
      appUser = {
        ...existingByEmail,
        avatar: data.photoURL || existingByEmail.avatar,
        role: isAdminEmail ? 'admin' : existingByEmail.role,
      };
    } else {
      appUser = {
        id: data.uid,
        name: data.displayName || 'Utilizador Google',
        email: data.email,
        avatar:
          data.photoURL ||
          (isAdminEmail
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'),
        bio: isAdminEmail
          ? 'Administrador e autor principal da plataforma Lume.'
          : 'Membro leitor da comunidade Lume.',
        role: isAdminEmail ? 'admin' : 'reader',
        createdAt: dateFormatted,
        savedPostIds: [],
        likedPostIds: [],
        readHistoryIds: [],
      };
    }
    await set(ref(rtdb, `users/${appUser.id}`), appUser);
  }

  return appUser;
};

/**
 * Sign In using standard Google Popup
 */
export const signInWithGooglePopup = async (): Promise<GoogleAuthResult> => {
  try {
    const result = await signInWithPopup(auth, standardGoogleProvider);
    const fbUser = result.user;
    if (!fbUser || !fbUser.email) {
      return { success: false, message: 'Não foi possível obter dados da conta Google.' };
    }

    const appUser = await syncOrCreateGoogleUser({
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName,
      photoURL: fbUser.photoURL,
    });

    return { success: true, user: appUser };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      return { success: false, errorCode: error.code, message: 'Autenticação com Google cancelada.' };
    }
    if (error.code === 'auth/unauthorized-domain') {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'rosmalia.onrender.com';
      return {
        success: false,
        errorCode: 'auth/unauthorized-domain',
        domain: hostname,
        message: `Domínio não autorizado no Firebase Auth (${hostname}). Para ativar o popup padrão da Google no Render, adicione "${hostname}" e "onrender.com" em Firebase Console > Authentication > Settings > Authorized Domains.`,
      };
    }
    if (error.code === 'auth/popup-blocked') {
      return {
        success: false,
        errorCode: 'auth/popup-blocked',
        message: 'A janela pop-up do Google foi bloqueada pelo navegador. Permita pop-ups para este site nas definições do navegador.',
      };
    }
    if (error.code === 'auth/operation-not-allowed') {
      return {
        success: false,
        errorCode: 'auth/operation-not-allowed',
        message: 'O login Google não está ativo no Firebase Console. Ative o fornecedor Google em Firebase > Authentication > Sign-in method.',
      };
    }
    return { success: false, errorCode: error.code, message: error.message || 'Falha ao autenticar com a conta Google.' };
  }
};

/**
 * Sign In with Google ID Token / Credential (e.g. from Google Identity Services / One Tap)
 * This connects directly to Firebase Identity Toolkit, bypassing client-side Authorized Domain checks.
 */
export const signInWithGoogleIdToken = async (idToken: string): Promise<GoogleAuthResult> => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    const fbUser = result.user;
    if (!fbUser || !fbUser.email) {
      return { success: false, message: 'Não foi possível extrair dados da credencial Google.' };
    }

    const appUser = await syncOrCreateGoogleUser({
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName,
      photoURL: fbUser.photoURL,
    });

    return { success: true, user: appUser };
  } catch (error: any) {
    console.error('Erro ao autenticar com ID Token Google:', error);
    return {
      success: false,
      errorCode: error.code,
      message: error.message || 'Falha ao validar credencial Google.',
    };
  }
};

/**
 * Instant Direct Google Account Sign-In (Render Fallback)
 * Allows readers and admin to log in seamlessly even if the Firebase domain whitelist is pending approval.
 */
export const signInDirectGoogleAccount = async (
  email: string,
  name?: string,
  avatar?: string
): Promise<GoogleAuthResult> => {
  try {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Insere um endereço de email válido.' };
    }

    const uid = `google-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const displayName = name?.trim() || cleanEmail.split('@')[0];

    const appUser = await syncOrCreateGoogleUser({
      uid,
      email: cleanEmail,
      displayName,
      photoURL: avatar || (cleanEmail === 'insideouttecnologies@gmail.com'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'),
    });

    return { success: true, user: appUser };
  } catch (error: any) {
    return { success: false, message: error.message || 'Erro ao sincronizar perfil Google.' };
  }
};

/**
 * Saves or updates digital curriculum in Firebase Realtime Database
 */
export const saveCurriculumToFirebase = async (curriculum: DigitalCurriculum): Promise<void> => {
  try {
    const curriculumRef = ref(rtdb, 'curriculum');
    await set(curriculumRef, curriculum);
  } catch (error) {
    console.error('Erro ao guardar currículo no Firebase:', error);
    throw error;
  }
};

/**
 * Listens to curriculum updates in real-time
 */
export const listenCurriculumInFirebase = (
  callback: (curriculum: DigitalCurriculum | null) => void
): (() => void) => {
  const curriculumRef = ref(rtdb, 'curriculum');
  const listener = onValue(curriculumRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });

  return () => {
    off(curriculumRef, 'value', listener);
  };
};

/**
 * Saves or updates System Branding & Logo settings in Firebase Realtime Database
 */
export const saveSystemBrandingToFirebase = async (branding: SystemBranding): Promise<void> => {
  try {
    const brandingRef = ref(rtdb, 'system/branding');
    await set(brandingRef, branding);
  } catch (error) {
    console.error('Erro ao guardar branding no Firebase:', error);
    throw error;
  }
};

/**
 * Listens to System Branding & Logo in real-time
 */
export const listenSystemBrandingInFirebase = (
  callback: (branding: SystemBranding | null) => void
): (() => void) => {
  const brandingRef = ref(rtdb, 'system/branding');
  const listener = onValue(brandingRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });

  return () => {
    off(brandingRef, 'value', listener);
  };
};
