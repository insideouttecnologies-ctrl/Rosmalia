import { Post, Category, Photo, Comment, Author } from '../types';

export const initialCategories: Category[] = [];

export const defaultAuthor: Author = {
  name: 'Mariana Costa',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80',
  role: 'Estudante do 13º Ano de Gestão Empresarial',
  bio: 'Finalista do 13º ano do Curso Técnico de Gestão Empresarial. Escrevendo sobre estratégia, finanças práticas, liderança jovem e inovação.',
};

// No static dummy data - production clean state:
export const initialPosts: Post[] = [];
export const initialGallery: Photo[] = [];
export const initialComments: Record<string, Comment[]> = {};
export const popularArticles: { id: string; title: string; views: string; image: string }[] = [];
