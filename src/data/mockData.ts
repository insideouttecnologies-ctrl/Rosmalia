import { Post, Category, Photo, Comment, Author } from '../types';

export const initialCategories: Category[] = [];

export const defaultAuthor: Author = {
  name: 'Admin InsideOut',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  role: 'Administrador & Autor Editorial',
  bio: 'Administrador e autor principal da plataforma Lume. Escrevendo sobre foco, hábitos e minimalismo.',
};

// No static dummy data - production clean state:
export const initialPosts: Post[] = [];
export const initialGallery: Photo[] = [];
export const initialComments: Record<string, Comment[]> = {};
export const popularArticles: { id: string; title: string; views: string; image: string }[] = [];
