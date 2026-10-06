import { Post, Category, Photo, Comment, Author } from '../types';

export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Tecnologia', count: 0, iconName: 'laptop', slug: 'tecnologia' },
  { id: 'cat-2', name: 'Motivação', count: 0, iconName: 'sun', slug: 'motivacao' },
  { id: 'cat-3', name: 'Desenvolvimento Pessoal', count: 0, iconName: 'user', slug: 'desenvolvimento-pessoal' },
  { id: 'cat-4', name: 'Entretenimento', count: 0, iconName: 'gamepad', slug: 'entretenimento' },
  { id: 'cat-5', name: 'Lifestyle', count: 0, iconName: 'coffee', slug: 'lifestyle' },
  { id: 'cat-6', name: 'Educação', count: 0, iconName: 'graduation-cap', slug: 'educacao' },
];

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
