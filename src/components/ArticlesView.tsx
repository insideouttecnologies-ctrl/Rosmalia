import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Grid,
  List as ListIcon,
  Sparkles,
  Calendar,
  Clock,
  Heart,
  Eye,
  ArrowRight,
  Filter,
  X,
  Trash2
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { PostCard } from './PostCard';
import { Post } from '../types';

export const ArticlesView: React.FC = () => {
  const {
    posts,
    categories,
    selectedCategory,
    setSelectedCategory,
    openPostDetail,
    searchQuery,
    setSearchQuery,
    isAdmin,
    deletePost,
  } = useBlog();

  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'likes'>('recent');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  // Filter posts
  let displayPosts = posts.filter((post) => {
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

  // Sort posts
  if (sortBy === 'popular') {
    displayPosts = [...displayPosts].sort((a, b) => b.viewCount - a.viewCount);
  } else if (sortBy === 'likes') {
    displayPosts = [...displayPosts].sort((a, b) => b.likes - a.likes);
  }

  return (
    <div className="py-6 animate-fade-in space-y-8">
      {/* Page Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold text-[#7C3AED] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Arquivo Editorial</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Todos os Artigos & Ensaios
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Explora publicações aprofundadas sobre desenvolvimento pessoal, tecnologias emergentes,
          organização de rotina e reflexões com calma e profundidade.
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-[#161324] p-4 sm:p-5 rounded-2xl border border-purple-50/80 dark:border-purple-950/40 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Field */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por assunto ou palavra-chave..."
              className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-800 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort & Layout Toggles */}
          <div className="w-full md:w-auto flex items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-purple-950/60 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
              >
                <option value="recent">Mais Recentes</option>
                <option value="popular">Mais Lidos</option>
                <option value="likes">Mais Curtidos</option>
              </select>
            </div>

            {/* Layout switch: Grid or List */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  layoutMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-[#7C3AED] shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Visualização em Grelha"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  layoutMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-[#7C3AED] shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Visualização em Lista"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-100 dark:border-purple-950/40 pt-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === null
                ? 'bg-[#7C3AED] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-50'
            }`}
          >
            Todas as Categorias ({posts.length})
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-50'
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count Summary */}
      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 px-1">
        <span>A mostrar {displayPosts.length} {displayPosts.length === 1 ? 'artigo' : 'artigos'}</span>
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-[#7C3AED] hover:underline font-medium"
          >
            Limpar filtro de categoria
          </button>
        )}
      </div>

      {/* Posts Display: Grid or List */}
      {displayPosts.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-[#161324] rounded-3xl border border-dashed border-purple-200 dark:border-purple-950/50 p-8">
          <Filter className="w-10 h-10 mx-auto text-purple-400 mb-3 opacity-60" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Nenhum artigo encontrado
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Não encontramos nenhum artigo com os termos pesquisados.
          </p>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery('');
            }}
            className="mt-4 px-5 py-2 text-xs font-semibold text-white bg-[#7C3AED] rounded-xl"
          >
            Ver todos os artigos
          </button>
        </div>
      ) : layoutMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {displayPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => openPostDetail(post)}
              className="group cursor-pointer bg-white dark:bg-[#161324] p-5 rounded-2xl border border-purple-50/80 dark:border-purple-950/40 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 sm:w-28 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#7C3AED] dark:text-purple-300">
                    {post.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#7C3AED] line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {post.date}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="self-end sm:self-center shrink-0 flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          `Tem a certeza de que deseja eliminar o artigo "${post.title}"?\n\nEsta ação é permanente na base de dados Firebase.`
                        )
                      ) {
                        deletePost(post.id);
                      }
                    }}
                    title="Eliminar artigo (Admin)"
                    className="p-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-900 rounded-xl transition active:scale-95 shadow-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl flex items-center gap-1"
                >
                  <span>Ler</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
