import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  get,
  remove,
  onValue,
  update,
} from 'firebase/database';
import firebaseConfig from '../../firebase-applet-config.json';
import { Post, Comment, Photo, Category, User } from '../types';
import { initialCategories } from '../data/mockData';

// Ensure Firebase App is initialized once
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firebase Realtime Database
const rtdbUrl = firebaseConfig.databaseURL || 'https://gen-lang-client-0321247623-default-rtdb.firebaseio.com';
export const rtdb = getDatabase(app, rtdbUrl);

/**
 * Executes complete database migrations and admin setup for Firebase Realtime Database:
 * 1. Ensures Admin User (insideouttecnologies@gmail.com) exists with password and admin role.
 * 2. Seeds production category entities if missing.
 * 3. Cleanses any legacy static mock IDs.
 * 4. Writes migration audit record at /system/migrations.
 */
export const runDatabaseMigrations = async (force: boolean = false): Promise<{ success: boolean; message: string; timestamp: string }> => {
  const timestamp = new Date().toISOString();
  try {
    const adminUserEmail = 'insideouttecnologies@gmail.com';

    // 1. Ensure Admin User record exists in Firebase Realtime Database
    const adminUser: User = {
      id: 'user-admin-main',
      name: 'Admin InsideOut',
      email: adminUserEmail,
      password: 'adminPassword123',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      bio: 'Administrador e autor principal da plataforma Lume.',
      role: 'admin',
      createdAt: '06 de Outubro, 2026',
      savedPostIds: [],
      likedPostIds: [],
      readHistoryIds: [],
    };

    await set(ref(rtdb, `users/${adminUser.id}`), adminUser);

    // 2. Seed clean categories if missing or forced
    const categoriesSnapshot = await get(ref(rtdb, 'categories'));
    if (!categoriesSnapshot.exists() || force) {
      const categoriesMap: Record<string, Category> = {};
      initialCategories.forEach((c) => {
        categoriesMap[c.id] = c;
      });
      await set(ref(rtdb, 'categories'), categoriesMap);
    }

    // 3. Purge legacy static mock items from Firebase to ensure production cleanliness
    const mockPostIds = ['post-1', 'post-2', 'post-3', 'post-4', 'post-5'];
    for (const pid of mockPostIds) {
      await remove(ref(rtdb, `posts/${pid}`)).catch(() => {});
      await remove(ref(rtdb, `comments/${pid}`)).catch(() => {});
    }

    const mockPhotoIds = ['photo-1', 'photo-2', 'photo-3', 'photo-4', 'photo-5', 'photo-6'];
    for (const phid of mockPhotoIds) {
      await remove(ref(rtdb, `gallery/${phid}`)).catch(() => {});
    }

    // 4. Record migration watermark
    await set(ref(rtdb, 'system/migrations'), {
      version: 'v2026.10.06_prod_cleanup',
      executedAt: timestamp,
      status: 'applied',
      adminEmail: adminUserEmail,
      schemaReady: true,
    });

    return {
      success: true,
      message: 'Migrations executadas com sucesso! Base de dados limpa, admin configurado e registo de migração gravado.',
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

export const signInWithGooglePopup = async (): Promise<{ success: boolean; user?: User; message?: string }> => {
  try {
    const result = await signInWithPopup(auth, standardGoogleProvider);
    const fbUser = result.user;
    if (!fbUser || !fbUser.email) {
      return { success: false, message: 'Não foi possível obter dados da conta Google.' };
    }

    const email = fbUser.email.toLowerCase();
    const isAdminEmail = email === 'insideouttecnologies@gmail.com';

    // 1. Check if user already exists in Firebase RTDB by UID
    const userSnapshot = await get(ref(rtdb, `users/${fbUser.uid}`));
    let appUser: User;

    if (userSnapshot.exists()) {
      appUser = userSnapshot.val();
      const updates: Partial<User> = {};
      if (isAdminEmail && appUser.role !== 'admin') {
        appUser.role = 'admin';
        updates.role = 'admin';
      }
      if (fbUser.photoURL && appUser.avatar !== fbUser.photoURL) {
        appUser.avatar = fbUser.photoURL;
        updates.avatar = fbUser.photoURL;
      }
      if (Object.keys(updates).length > 0) {
        await update(ref(rtdb, `users/${fbUser.uid}`), updates);
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
          avatar: fbUser.photoURL || existingByEmail.avatar,
          role: isAdminEmail ? 'admin' : existingByEmail.role,
        };
      } else {
        appUser = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Utilizador Google',
          email: fbUser.email,
          avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
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

    return { success: true, user: appUser };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      return { success: false, message: 'Autenticação com Google cancelada.' };
    }
    return { success: false, message: error.message || 'Falha ao autenticar com a conta Google.' };
  }
};
