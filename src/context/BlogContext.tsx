import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Post,
  Comment,
  Photo,
  Category,
  ViewMode,
  Author,
  User,
  BannerItem,
  DigitalCurriculum,
  CurriculumItem,
  CurriculumProfile,
  SystemBranding,
} from '../types';
import { initialCategories } from '../data/mockData';
import { defaultCurriculumData } from '../data/defaultCurriculum';
import { seedCategories, seedUsers } from '../services/databaseSeeds';
import {
  signInWithGoogleDrive,
  disconnectGoogleDrive,
  uploadFileToDrive,
  listDriveMediaFiles,
  deleteDriveFile,
  initDriveAuth,
  DriveMediaFile,
  normalizeDriveImageUrl,
} from '../services/googleDrive';
import {
  seedInitialFirebaseData,
  executeAdminSeeder,
  listenFirebasePosts,
  listenFirebaseComments,
  listenFirebaseGallery,
  listenFirebaseUsers,
  listenFirebaseCategories,
  persistPostToFirebase,
  deletePostFromFirebase,
  persistCommentToFirebase,
  updateCommentLikesInFirebase,
  persistPhotoToFirebase,
  updatePhotoLikesInFirebase,
  persistUserToFirebase,
  persistBannerItemsToFirebase,
  loadBannerItemsFromFirebase,
  signInWithGooglePopup,
  signInWithGoogleIdToken,
  signInDirectGoogleAccount,
  GoogleAuthResult,
  signOutFromFirebase,
  saveCurriculumToFirebase,
  listenCurriculumInFirebase,
  saveSystemBrandingToFirebase,
  listenSystemBrandingInFirebase,
} from '../services/firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface BlogContextType {
  posts: Post[];
  categories: Category[];
  gallery: Photo[];
  comments: Record<string, Comment[]>;
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  selectedPost: Post | null;
  setSelectedPost: (post: Post | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentUser: User | null;
  users: User[];
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  // Digital Curriculum / Portfolio
  curriculum: DigitalCurriculum;
  updateCurriculumProfile: (profileUpdates: Partial<CurriculumProfile>) => void;
  addCurriculumItem: (itemData: Omit<CurriculumItem, 'id'>) => void;
  updateCurriculumItem: (itemId: string, updates: Partial<CurriculumItem>) => void;
  deleteCurriculumItem: (itemId: string) => void;
  resetCurriculumToDefault: () => void;
  login: (email: string, password?: string) => { success: boolean; message?: string };
  loginWithGoogle: () => Promise<GoogleAuthResult>;
  loginWithGoogleIdToken: (idToken: string) => Promise<GoogleAuthResult>;
  loginDirectGoogle: (email: string, name?: string) => Promise<GoogleAuthResult>;
  register: (userData: {
    name: string;
    email: string;
    password?: string;
    avatar?: string;
    role?: 'admin' | 'reader';
  }) => { success: boolean; message?: string };
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  // System Branding & Logo customization
  branding: SystemBranding;
  updateBranding: (updates: Partial<SystemBranding>) => void;
  resetBrandingToDefault: () => void;
  // Banner items customization (up to 3 items)
  bannerItems: BannerItem[];
  updateBannerItems: (items: BannerItem[]) => void;
  resetBannerToDefault: () => void;
  bookmarkedIds: string[];
  toggleBookmark: (postId: string) => void;
  likedPostIds: string[];
  readHistoryIds: string[];
  trackReadPost: (postId: string) => void;
  likePost: (postId: string) => void;
  addPost: (postData: {
    title: string;
    excerpt: string;
    content: string;
    coverImage: string;
    category: string;
    readTime: string;
    tags: string[];
    isFeatured?: boolean;
    author?: Author;
    mediaType?: 'image' | 'video' | 'audio';
    videoUrl?: string;
    audioUrl?: string;
    driveFileId?: string;
    driveFileName?: string;
  }) => void;
  deletePost: (postId: string) => void;
  addComment: (postId: string, comment: { authorName: string; authorEmail?: string; content: string }) => void;
  likeComment: (postId: string, commentId: string) => void;
  addPhoto: (photoData: {
    title: string;
    caption: string;
    category: string;
    imageUrl: string;
    location: string;
    exif: {
      camera: string;
      lens: string;
      aperture: string;
      shutterSpeed: string;
      iso: string;
    };
  }) => void;
  likePhoto: (photoId: string) => void;
  openPostDetail: (post: Post) => void;
  filteredPosts: Post[];
  // Google Drive integration
  googleUser: FirebaseUser | null;
  isDriveConnected: boolean;
  connectGoogleDrive: () => Promise<boolean>;
  disconnectDrive: () => Promise<void>;
  uploadMediaToDrive: (
    file: File,
    folderType: 'profiles' | 'posts' | 'gallery',
    onProgress?: (progress: number) => void
  ) => Promise<DriveMediaFile>;
  driveMediaFiles: DriveMediaFile[];
  fetchDriveFiles: (folderType?: 'profiles' | 'posts' | 'gallery') => Promise<void>;
  deleteDriveMedia: (fileId: string, fileName?: string) => Promise<boolean>;
  isFirebaseSyncing: boolean;
  triggerAdminSeeder: (force?: boolean) => Promise<{ success: boolean; message: string }>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

const STORAGE_KEYS = {
  POSTS: 'lume_blog_posts_v4',
  COMMENTS: 'lume_blog_comments_v4',
  GALLERY: 'lume_blog_gallery_v4',
  CATEGORIES: 'lume_blog_categories_v4',
  BOOKMARKS: 'lume_blog_bookmarks_v4',
  DARK_MODE: 'lume_blog_darkmode_v1',
  CURRENT_USER: 'lume_blog_current_user_v4',
  USERS: 'lume_blog_users_v4',
  LIKED_POSTS: 'lume_blog_liked_posts_v4',
  READ_HISTORY: 'lume_blog_read_history_v4',
  BANNER_ITEMS: 'lume_blog_banner_items_v4',
  CURRICULUM: 'lume_blog_curriculum_v4',
  BRANDING: 'lume_blog_branding_v4',
};

export const defaultBranding: SystemBranding = {
  siteName: 'Lume',
  tagline: 'O espaço das boas ideias',
  logoUrl: '',
  logoPreset: 'lotus-sprout',
  accentColor: '#7C3AED',
};

export const initialDefaultBannerItems: BannerItem[] = [
  {
    id: 'banner-item-1',
    title: 'Portfólio de Gestão Empresarial & Currículo Digital',
    subtitle: 'Finalista do 13º ano. Ensaios, simulação empresarial, projetos práticos e Prova de Aptidão Profissional (PAP).',
    badge: 'Gestão 13º Ano',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'Ver Currículo & Portfólio',
    ctaLink: 'curriculum',
    authorName: 'Mariana Costa',
    active: true,
  },
  {
    id: 'banner-item-2',
    title: 'Galeria Fotográfica & Narrativas Visuais',
    subtitle: 'Uma seleção visual autoral com metadados técnicos de câmara, lente e exposição.',
    badge: 'Galeria Exclusiva',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'Ver Galeria',
    ctaLink: 'gallery',
    authorName: 'Lume Visual',
    active: true,
  },
  {
    id: 'banner-item-3',
    title: 'Foco, Hábitos & Vida Minimalista',
    subtitle: 'Reflexões sobre atenção intencional, hábitos sólidos e clareza mental na era digital.',
    badge: 'Desenvolvimento',
    imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'Ler Reflexões',
    ctaLink: 'articles',
    authorName: 'Equipa Lume',
    active: true,
  },
];

export const ADMIN_USER: User = {
  id: 'user-admin-main',
  name: 'Mariana Costa',
  email: 'insideouttecnologies@gmail.com',
  password: 'adminPassword123',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80',
  bio: 'Finalista do 13º ano de Gestão Empresarial | Administradora da plataforma e criadora de conteúdos.',
  role: 'admin',
  createdAt: '05 de Outubro, 2026',
  savedPostIds: [],
  likedPostIds: [],
  readHistoryIds: [],
};

const initialDefaultUsers: User[] = seedUsers;

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POSTS);
      if (saved) {
        const parsed: Post[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [categories, setCategories] = useState<Category[]>(seedCategories);

  const [gallery, setGallery] = useState<Photo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GALLERY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [comments, setComments] = useState<Record<string, Comment[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialDefaultUsers;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null; // Visitors start logged out; access strictly requires valid credentials
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [likedPostIds, setLikedPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LIKED_POSTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [readHistoryIds, setReadHistoryIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.READ_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Main Hero Banner custom items (up to 3 items)
  const [bannerItems, setBannerItems] = useState<BannerItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BANNER_ITEMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 3);
      }
    } catch (e) {
      console.error(e);
    }
    return initialDefaultBannerItems;
  });

  // Digital Curriculum / Portfolio state
  const [curriculum, setCurriculum] = useState<DigitalCurriculum>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRICULUM);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.profile && Array.isArray(parsed.items)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return defaultCurriculumData;
  });

  // System Branding & Logo state
  const [branding, setBranding] = useState<SystemBranding>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BRANDING);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.siteName) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return defaultBranding;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return false;
  });

  const isAdmin = currentUser?.role === 'admin';

  const setIsAdmin = (value: boolean) => {
    if (!value && currentUser?.role === 'admin') {
      setCurrentUser(null);
    }
  };

  const [activeView, setActiveView] = useState<ViewMode>('home');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LIKED_POSTS, JSON.stringify(likedPostIds));
  }, [likedPostIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.READ_HISTORY, JSON.stringify(readHistoryIds));
  }, [readHistoryIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANNER_ITEMS, JSON.stringify(bannerItems));
  }, [bannerItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(curriculum));
  }, [curriculum]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(branding));
  }, [branding]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode-active');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode-active');
    }
  }, [darkMode]);

  // Recalculate categories count dynamically
  useEffect(() => {
    setCategories((prev) =>
      prev.map((cat) => {
        const count = posts.filter(
          (p) => p.category.toLowerCase() === cat.name.toLowerCase()
        ).length;
        return {
          ...cat,
          count: count > 0 ? count : cat.count,
        };
      })
    );
  }, [posts]);

  // Firebase Realtime Database Synchronization for all entities
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsFirebaseSyncing(true);

    // 1. Seed initial data to Firebase if database is empty
    seedInitialFirebaseData().finally(() => {
      if (isMounted) setIsFirebaseSyncing(false);
    });

    // 2. Real-time listener for Posts
    const unsubPosts = listenFirebasePosts((fbPosts) => {
      if (fbPosts) {
        setPosts(fbPosts);
      }
    });

    // 3. Real-time listener for Comments
    const unsubComments = listenFirebaseComments((fbComments) => {
      setComments(fbComments || {});
    });

    // 4. Real-time listener for Gallery Photos
    const unsubGallery = listenFirebaseGallery((fbGallery) => {
      if (fbGallery) {
        setGallery(fbGallery);
      }
    });

    // 5. Real-time listener for Users
    const unsubUsers = listenFirebaseUsers((fbUsers) => {
      if (fbUsers && fbUsers.length > 0) {
        setUsers(fbUsers);
      }
    });

    // 6. Real-time listener for Categories
    const unsubCats = listenFirebaseCategories((fbCats) => {
      if (fbCats && fbCats.length > 0) {
        setCategories(fbCats);
      }
    });

    // 7. Load customized banner items if available in Firebase
    loadBannerItemsFromFirebase().then((remoteBanner) => {
      if (isMounted && remoteBanner && Array.isArray(remoteBanner) && remoteBanner.length > 0) {
        setBannerItems(remoteBanner.slice(0, 3));
      }
    }).catch(() => {});

    // 8. Real-time listener for Digital Curriculum / Portfolio
    const unsubCurriculum = listenCurriculumInFirebase((remoteCurriculum) => {
      if (
        remoteCurriculum &&
        remoteCurriculum.profile &&
        Array.isArray(remoteCurriculum.items)
      ) {
        setCurriculum(remoteCurriculum);
      }
    });

    // 9. Real-time listener for System Branding & Logo
    const unsubBranding = listenSystemBrandingInFirebase((remoteBranding) => {
      if (remoteBranding && remoteBranding.siteName) {
        setBranding(remoteBranding);
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubPosts === 'function') unsubPosts();
      if (typeof unsubComments === 'function') unsubComments();
      if (typeof unsubGallery === 'function') unsubGallery();
      if (typeof unsubUsers === 'function') unsubUsers();
      if (typeof unsubCats === 'function') unsubCats();
      if (typeof unsubCurriculum === 'function') unsubCurriculum();
      if (typeof unsubBranding === 'function') unsubBranding();
    };
  }, []);

  const updateBannerItems = (items: BannerItem[]) => {
    const limited = items.slice(0, 3);
    setBannerItems(limited);
    localStorage.setItem(STORAGE_KEYS.BANNER_ITEMS, JSON.stringify(limited));
    persistBannerItemsToFirebase(limited);
  };

  const resetBannerToDefault = () => {
    setBannerItems(initialDefaultBannerItems);
    localStorage.setItem(STORAGE_KEYS.BANNER_ITEMS, JSON.stringify(initialDefaultBannerItems));
    persistBannerItemsToFirebase(initialDefaultBannerItems);
  };

  const updateBranding = (updates: Partial<SystemBranding>) => {
    setBranding((prev) => {
      const next: SystemBranding = {
        ...prev,
        ...updates,
      };
      localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(next));
      saveSystemBrandingToFirebase(next).catch(console.error);
      return next;
    });
  };

  const resetBrandingToDefault = () => {
    setBranding(defaultBranding);
    localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(defaultBranding));
    saveSystemBrandingToFirebase(defaultBranding).catch(console.error);
  };

  // Digital Curriculum / Portfolio Actions
  const updateCurriculumProfile = (profileUpdates: Partial<CurriculumProfile>) => {
    setCurriculum((prev) => {
      const updated: DigitalCurriculum = {
        ...prev,
        profile: {
          ...prev.profile,
          ...profileUpdates,
          updatedAt: new Date().getFullYear().toString(),
        },
      };
      localStorage.setItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(updated));
      saveCurriculumToFirebase(updated).catch(console.error);
      return updated;
    });
  };

  const addCurriculumItem = (itemData: Omit<CurriculumItem, 'id'>) => {
    const newItem: CurriculumItem = {
      ...itemData,
      id: `cv-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      order: (curriculum.items.length || 0) + 1,
    };

    setCurriculum((prev) => {
      const existingCats = prev.customCategories || [];
      const hasCategory = existingCats.some(
        (c) => c.toLowerCase() === itemData.category.toLowerCase()
      );
      const updatedCats = hasCategory ? existingCats : [...existingCats, itemData.category];

      const updated: DigitalCurriculum = {
        ...prev,
        customCategories: updatedCats,
        items: [newItem, ...prev.items],
      };
      localStorage.setItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(updated));
      saveCurriculumToFirebase(updated).catch(console.error);
      return updated;
    });
  };

  const updateCurriculumItem = (itemId: string, updates: Partial<CurriculumItem>) => {
    setCurriculum((prev) => {
      const updatedItems = prev.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      );

      // Check if new category was introduced
      let updatedCats = prev.customCategories || [];
      if (updates.category) {
        const hasCategory = updatedCats.some(
          (c) => c.toLowerCase() === updates.category!.toLowerCase()
        );
        if (!hasCategory) {
          updatedCats = [...updatedCats, updates.category];
        }
      }

      const updated: DigitalCurriculum = {
        ...prev,
        customCategories: updatedCats,
        items: updatedItems,
      };
      localStorage.setItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(updated));
      saveCurriculumToFirebase(updated).catch(console.error);
      return updated;
    });
  };

  const deleteCurriculumItem = (itemId: string) => {
    setCurriculum((prev) => {
      const updatedItems = prev.items.filter((item) => item.id !== itemId);
      const updated: DigitalCurriculum = {
        ...prev,
        items: updatedItems,
      };
      localStorage.setItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(updated));
      saveCurriculumToFirebase(updated).catch(console.error);
      return updated;
    });
  };

  const resetCurriculumToDefault = () => {
    setCurriculum(defaultCurriculumData);
    localStorage.setItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(defaultCurriculumData));
    saveCurriculumToFirebase(defaultCurriculumData).catch(console.error);
  };

  const triggerAdminSeeder = async (force: boolean = true) => {
    setIsFirebaseSyncing(true);
    const result = await executeAdminSeeder(force);
    setIsFirebaseSyncing(false);
    return result;
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const login = (email: string, password?: string) => {
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!foundUser) {
      return { success: false, message: 'Utilizador não encontrado. Verifica o email ou cria uma conta.' };
    }

    if (!password || !foundUser.password || foundUser.password !== password) {
      return { success: false, message: 'Credenciais inválidas. Insere a tua senha correta.' };
    }

    setCurrentUser(foundUser);
    return { success: true };
  };

  const handleSuccessfulGoogleUser = (user: User) => {
    setCurrentUser(user);
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = user;
        return next;
      }
      return [user, ...prev];
    });
  };

  const loginWithGoogle = async (): Promise<GoogleAuthResult> => {
    const result = await signInWithGooglePopup();
    if (result.success && result.user) {
      handleSuccessfulGoogleUser(result.user);
      return { success: true, user: result.user };
    }
    return result;
  };

  const loginWithGoogleIdToken = async (idToken: string): Promise<GoogleAuthResult> => {
    const result = await signInWithGoogleIdToken(idToken);
    if (result.success && result.user) {
      handleSuccessfulGoogleUser(result.user);
      return { success: true, user: result.user };
    }
    return result;
  };

  const loginDirectGoogle = async (email: string, name?: string): Promise<GoogleAuthResult> => {
    const result = await signInDirectGoogleAccount(email, name);
    if (result.success && result.user) {
      handleSuccessfulGoogleUser(result.user);
      return { success: true, user: result.user };
    }
    return result;
  };

  const register = (userData: {
    name: string;
    email: string;
    password?: string;
    avatar?: string;
    role?: 'admin' | 'reader';
  }) => {
    const existing = users.find(
      (u) => u.email.toLowerCase() === userData.email.trim().toLowerCase()
    );
    if (existing) {
      return { success: false, message: 'Já existe uma conta associada a este email.' };
    }

    const today = new Date();
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const dateFormatted = `${today.getDate()} de ${months[today.getMonth()]}, ${today.getFullYear()}`;

    const defaultAvatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    ];

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name.trim(),
      email: userData.email.trim(),
      password: userData.password || 'password123',
      avatar: userData.avatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)],
      role: userData.role || 'reader',
      bio: 'Membro entusiasta do Lume.',
      createdAt: dateFormatted,
      savedPostIds: [],
      likedPostIds: [],
      readHistoryIds: [],
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    // Persist to Firebase Realtime Database
    persistUserToFirebase(newUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    signOutFromFirebase().catch(() => {});
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const cleanUpdates = { ...updates };
    if (cleanUpdates.avatar) {
      cleanUpdates.avatar = normalizeDriveImageUrl(cleanUpdates.avatar);
    }
    const updated = { ...currentUser, ...cleanUpdates };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    // Persist to Firebase Realtime Database
    persistUserToFirebase(updated);

    // If updating avatar, synchronize to curriculum profile avatar as well
    if (cleanUpdates.avatar) {
      setCurriculum((prev) => {
        if (!prev || !prev.profile) return prev;
        const updatedCurr = {
          ...prev,
          profile: {
            ...prev.profile,
            avatarUrl: cleanUpdates.avatar!,
          },
        };
        localStorage.setItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(updatedCurr));
        saveCurriculumToFirebase(updatedCurr).catch(console.error);
        return updatedCurr;
      });
    }
  };

  const toggleBookmark = (postId: string) => {
    setBookmarkedIds((prev) => {
      const next = prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId];
      if (currentUser) {
        updateProfile({ savedPostIds: next });
      }
      return next;
    });
  };

  const trackReadPost = (postId: string) => {
    setReadHistoryIds((prev) => {
      if (prev.includes(postId)) return prev;
      const next = [postId, ...prev];
      if (currentUser) {
        updateProfile({ readHistoryIds: next });
      }
      return next;
    });
  };

  const likePost = (postId: string) => {
    let updatedPost: Post | undefined;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = p.isLiked;
          const next = {
            ...p,
            likes: isLiked ? p.likes - 1 : p.likes + 1,
            isLiked: !isLiked,
          };
          updatedPost = next;
          return next;
        }
        return p;
      })
    );

    if (updatedPost) {
      persistPostToFirebase(updatedPost);
    }

    setLikedPostIds((prev) => {
      const isAlready = prev.includes(postId);
      const next = isAlready ? prev.filter((id) => id !== postId) : [...prev, postId];
      if (currentUser) {
        updateProfile({ likedPostIds: next });
      }
      return next;
    });

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
              isLiked: !prev.isLiked,
            }
          : null
      );
    }
  };

  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [driveMediaFiles, setDriveMediaFiles] = useState<DriveMediaFile[]>([]);
  const isDriveConnected = !!googleUser;

  // Initialize Firebase Auth listener for Google Drive
  useEffect(() => {
    const unsubscribe = initDriveAuth(
      (user, _token) => {
        setGoogleUser(user);
        // Automatically fetch drive media files
        fetchDriveFiles();
      },
      () => {
        setGoogleUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const connectGoogleDrive = async (): Promise<boolean> => {
    try {
      const result = await signInWithGoogleDrive();
      if (result) {
        setGoogleUser(result.user);
        await fetchDriveFiles();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Falha ao conectar Google Drive:', err);
      return false;
    }
  };

  const disconnectDrive = async () => {
    await disconnectGoogleDrive();
    setGoogleUser(null);
    setDriveMediaFiles([]);
  };

  const uploadMediaToDrive = async (
    file: File,
    folderType: 'profiles' | 'posts' | 'gallery',
    onProgress?: (progress: number) => void
  ): Promise<DriveMediaFile> => {
    const uploaded = await uploadFileToDrive(file, folderType, onProgress);
    setDriveMediaFiles((prev) => [uploaded, ...prev]);
    return uploaded;
  };

  const fetchDriveFiles = async (folderType?: 'profiles' | 'posts' | 'gallery') => {
    const files = await listDriveMediaFiles(folderType);
    setDriveMediaFiles(files);
  };

  const deleteDriveMedia = async (fileId: string, fileName?: string): Promise<boolean> => {
    const confirmed = window.confirm(
      `Tens a certeza de que desejas eliminar "${fileName || 'este ficheiro'}" do teu Google Drive? Esta ação é irreversível.`
    );
    if (!confirmed) return false;

    const ok = await deleteDriveFile(fileId);
    if (ok) {
      setDriveMediaFiles((prev) => prev.filter((f) => f.id !== fileId));
    }
    return ok;
  };

  const addPost = (postData: {
    title: string;
    excerpt: string;
    content: string;
    coverImage: string;
    category: string;
    readTime: string;
    tags: string[];
    isFeatured?: boolean;
    author?: Author;
    mediaType?: 'image' | 'video' | 'audio';
    videoUrl?: string;
    audioUrl?: string;
    driveFileId?: string;
    driveFileName?: string;
  }) => {
    const today = new Date();
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const dateFormatted = `${today.getDate()} de ${months[today.getMonth()]}, ${today.getFullYear()}`;
    const slug = postData.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const authorToUse = {
      name: currentUser?.name || ADMIN_USER.name,
      avatar: currentUser?.avatar || ADMIN_USER.avatar,
      role: currentUser?.role === 'admin' ? 'Editor & Administrador' : 'Autor Convidado',
      bio: currentUser?.bio || ADMIN_USER.bio || 'Partilhando reflexões no Lume.',
    };

    const newPost: Post = {
      id: `post-${Date.now()}`,
      slug,
      title: postData.title,
      excerpt: postData.excerpt,
      content: postData.content,
      coverImage: postData.coverImage,
      category: postData.category,
      readTime: postData.readTime || '4 min de leitura',
      date: dateFormatted,
      views: '1.2k',
      viewCount: 1200,
      likes: 0,
      isFeatured: !!postData.isFeatured,
      author: postData.author || authorToUse,
      tags: postData.tags.length > 0 ? postData.tags : ['Geral'],
      mediaType: postData.mediaType || 'image',
      videoUrl: postData.videoUrl,
      audioUrl: postData.audioUrl,
      driveFileId: postData.driveFileId,
      driveFileName: postData.driveFileName,
    };

    setPosts((prev) => {
      if (newPost.isFeatured) {
        return [newPost, ...prev.map(p => ({ ...p, isFeatured: false }))];
      }
      return [newPost, ...prev];
    });

    // Persist post to Firebase Realtime Database
    persistPostToFirebase(newPost);
  };

  const deletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    // Remove from Firebase Realtime Database
    deletePostFromFirebase(postId);
    if (selectedPost?.id === postId) {
      setSelectedPost(null);
      setActiveView('home');
    }
  };

  const addComment = (
    postId: string,
    commentData: { authorName: string; authorEmail?: string; content: string }
  ) => {
    const avatarToUse = currentUser?.avatar ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      postId,
      authorName: currentUser?.name || commentData.authorName.trim(),
      authorEmail: currentUser?.email || commentData.authorEmail?.trim(),
      authorAvatar: avatarToUse,
      content: commentData.content.trim(),
      createdAt: 'Agora mesmo',
      likes: 0,
      isLiked: false,
    };

    setComments((prev) => ({
      ...prev,
      [postId]: [newComment, ...(prev[postId] || [])],
    }));

    // Persist comment to Firebase Realtime Database
    persistCommentToFirebase(postId, newComment);
  };

  const likeComment = (postId: string, commentId: string) => {
    let nextLikes = 0;
    setComments((prev) => {
      const postComments = prev[postId] || [];
      const updated = postComments.map((c) => {
        if (c.id === commentId) {
          const isLiked = c.isLiked;
          nextLikes = isLiked ? c.likes - 1 : c.likes + 1;
          return {
            ...c,
            likes: nextLikes,
            isLiked: !isLiked,
          };
        }
        return c;
      });
      return {
        ...prev,
        [postId]: updated,
      };
    });

    // Update in Firebase Realtime Database
    updateCommentLikesInFirebase(postId, commentId, nextLikes);
  };

  const addPhoto = (photoData: {
    title: string;
    caption: string;
    category: string;
    imageUrl: string;
    location: string;
    exif: {
      camera: string;
      lens: string;
      aperture: string;
      shutterSpeed: string;
      iso: string;
    };
  }) => {
    const today = new Date();
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const dateFormatted = `${today.getDate()} de ${months[today.getMonth()]}, ${today.getFullYear()}`;

    const newPhoto: Photo = {
      id: `photo-${Date.now()}`,
      title: photoData.title,
      caption: photoData.caption,
      category: photoData.category,
      imageUrl: photoData.imageUrl,
      date: dateFormatted,
      location: photoData.location,
      exif: photoData.exif,
      likes: 0,
      isLiked: false,
    };

    setGallery((prev) => [newPhoto, ...prev]);

    // Persist photo to Firebase Realtime Database
    persistPhotoToFirebase(newPhoto);
  };

  const likePhoto = (photoId: string) => {
    let nextLikes = 0;
    setGallery((prev) =>
      prev.map((photo) => {
        if (photo.id === photoId) {
          const isLiked = photo.isLiked;
          nextLikes = isLiked ? photo.likes - 1 : photo.likes + 1;
          return {
            ...photo,
            likes: nextLikes,
            isLiked: !isLiked,
          };
        }
        return photo;
      })
    );

    // Update photo likes in Firebase Realtime Database
    updatePhotoLikesInFirebase(photoId, nextLikes);
  };

  const openPostDetail = (post: Post) => {
    setSelectedPost(post);
    trackReadPost(post.id);
    setActiveView('article-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered posts based on category and search query
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory
      ? post.category.toLowerCase() === selectedCategory.toLowerCase()
      : true;

    const matchesSearch = searchQuery.trim()
      ? post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    return matchesCategory && matchesSearch;
  });

  return (
    <BlogContext.Provider
      value={{
        posts,
        categories,
        gallery,
        comments,
        activeView,
        setActiveView,
        selectedPost,
        setSelectedPost,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        darkMode,
        toggleDarkMode,
        currentUser,
        users,
        isAdmin,
        setIsAdmin,
        curriculum,
        updateCurriculumProfile,
        addCurriculumItem,
        updateCurriculumItem,
        deleteCurriculumItem,
        resetCurriculumToDefault,
        login,
        loginWithGoogle,
        loginWithGoogleIdToken,
        loginDirectGoogle,
        register,
        logout,
        updateProfile,
        bannerItems,
        updateBannerItems,
        resetBannerToDefault,
        branding,
        updateBranding,
        resetBrandingToDefault,
        bookmarkedIds,
        toggleBookmark,
        likedPostIds,
        readHistoryIds,
        trackReadPost,
        likePost,
        addPost,
        deletePost,
        addComment,
        likeComment,
        addPhoto,
        likePhoto,
        openPostDetail,
        filteredPosts,
        googleUser,
        isDriveConnected,
        connectGoogleDrive,
        disconnectDrive,
        uploadMediaToDrive,
        driveMediaFiles,
        fetchDriveFiles,
        deleteDriveMedia,
        isFirebaseSyncing,
        triggerAdminSeeder,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};
