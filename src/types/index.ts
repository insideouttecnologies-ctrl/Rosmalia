export interface Author {
  name: string;
  avatar: string;
  role: string;
  bio: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail?: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  readTime: string;
  date: string;
  views: string;
  viewCount: number;
  likes: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isFeatured?: boolean;
  author: Author;
  tags: string[];
  mediaType?: 'image' | 'video' | 'audio';
  videoUrl?: string;
  audioUrl?: string;
  driveFileId?: string;
  driveFileName?: string;
}

export interface Category {
  id: string;
  name: string;
  count: number;
  iconName: 'laptop' | 'sun' | 'user' | 'gamepad' | 'coffee' | 'graduation-cap' | 'sparkles' | 'folder';
  slug: string;
}

export interface ExifData {
  camera: string;
  lens: string;
  aperture: string;
  shutterSpeed: string;
  iso: string;
}

export interface Photo {
  id: string;
  title: string;
  caption: string;
  category: string;
  imageUrl: string;
  date: string;
  location: string;
  exif: ExifData;
  likes: number;
  isLiked?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  bio?: string;
  role: 'admin' | 'reader';
  createdAt: string;
  savedPostIds: string[];
  likedPostIds: string[];
  readHistoryIds: string[];
}

export type ViewMode =
  | 'home'
  | 'articles'
  | 'article-detail'
  | 'gallery'
  | 'about'
  | 'contact'
  | 'profile'
  | 'curriculum';

export interface CurriculumProfile {
  fullName: string;
  headline: string;
  summary: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  avatarUrl?: string;
  statusBadge?: string;
  updatedAt?: string;
}

export interface CurriculumItem {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  period?: string;
  location?: string;
  description: string;
  tags?: string[];
  link?: string;
  order?: number;
}

export interface DigitalCurriculum {
  profile: CurriculumProfile;
  items: CurriculumItem[];
  customCategories?: string[];
}

export interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  ctaText: string;
  ctaLink?: string;
  postId?: string;
  authorName?: string;
  active?: boolean;
}

export interface WebRTCCallSession {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  calleeId: string;
  calleeName: string;
  calleeAvatar?: string;
  roomCode?: string;
  status: 'ringing' | 'accepted' | 'declined' | 'missed' | 'ended';
  createdAt: number;
  expiresAt: number;
  offer?: {
    type: 'offer';
    sdp: string;
  };
  answer?: {
    type: 'answer';
    sdp: string;
  };
  callerCandidates?: Record<string, { candidate: string; sdpMid: string | null; sdpMLineIndex: number | null }>;
  calleeCandidates?: Record<string, { candidate: string; sdpMid: string | null; sdpMLineIndex: number | null }>;
}
