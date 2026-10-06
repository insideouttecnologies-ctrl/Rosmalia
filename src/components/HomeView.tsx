import React from 'react';
import {
  LayoutGrid,
  ArrowRight,
  Sparkles,
  Camera,
  Quote,
  Laptop,
  Sun,
  User,
  Gamepad2,
  Coffee,
  GraduationCap,
  PenSquare,
  Image as ImageIcon
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { PixabayHeroSlider } from './PixabayHeroSlider';
import { PostCard } from './PostCard';
import { Sidebar } from './Sidebar';

interface HomeViewProps {
  onOpenAdmin?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onOpenAdmin }) => {
  const {
    posts,
    gallery,
    categories,
    setActiveView,
    setSelectedCategory,
    openPostDetail,
    isAdmin,
  } = useBlog();

  // 4 recent posts for the homepage grid matching layout
  const recentPosts = posts.slice(0, 4);
  // Preview 3 photos from the gallery
  const previewPhotos = gallery.slice(0, 3);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'laptop':
        return <Laptop className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'sun':
        return <Sun className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'user':
        return <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'gamepad':
        return <Gamepad2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'coffee':
        return <Coffee className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'graduation-cap':
        return <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
    }
  };

  return (
    <div className="space-y-12">
      {/* 1. Dynamic Pixabay-Style Hero Carousel Slider */}
      <section aria-label="Destaque Principal em Carrossel">
        <PixabayHeroSlider onOpenAdmin={onOpenAdmin} />
      </section>

      {/* 2. Quick Category Exploration Strip */}
      <section aria-label="Categorias em Destaque">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7C3AED]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Explora por Tema
            </h3>
          </div>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setActiveView('articles');
            }}
            className="text-xs font-semibold text-[#7C3AED] dark:text-purple-300 hover:underline"
          >
            Ver todos os temas
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.name);
                setActiveView('articles');
              }}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#161324] border border-purple-50/80 dark:border-purple-950/40 hover:border-purple-300 dark:hover:border-purple-700/60 shadow-sm hover:shadow-md transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                {getCategoryIcon(cat.iconName)}
              </div>
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#7C3AED] transition-colors truncate">
                {cat.name}
              </span>
              <span className="block text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {cat.count} {cat.count === 1 ? 'artigo' : 'artigos'}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Main 2-Column Grid (Left: Feed, Right: Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Articles Feed */}
        <div className="lg:col-span-8 space-y-8">
          <section aria-label="Artigos Recentes" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* Purple 6-dot icon matching layout.jpeg */}
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Artigos recentes
                </h2>
              </div>

              {recentPosts.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setActiveView('articles');
                  }}
                  className="group inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#7C3AED] dark:text-purple-300 hover:text-[#6D28D9] transition"
                >
                  <span>Ver todos</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

            {/* 2-Column Responsive Card Grid or Clean Empty State */}
            {recentPosts.length === 0 ? (
              <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#161324] border border-dashed border-purple-200 dark:border-purple-950/60 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 mx-auto flex items-center justify-center">
                  <PenSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Nenhum artigo publicado ainda
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Os dados fictícios foram removidos. Como administrador, cria o teu primeiro artigo ou importa fotos e vídeos diretamente do Google Drive!
                  </p>
                </div>
                {isAdmin && onOpenAdmin && (
                  <button
                    onClick={onOpenAdmin}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl shadow-sm transition active:scale-[0.98]"
                  >
                    <PenSquare className="w-4 h-4" />
                    <span>Publicar Novo Artigo</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {recentPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </section>

          {/* Integrated Photo Gallery Showcase Filmstrip */}
          <section
            aria-label="Galeria em Destaque"
            className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-50/70 via-purple-100/30 to-white dark:from-[#18142a] dark:via-[#151125] dark:to-[#110e1e] border border-purple-100 dark:border-purple-950/60"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 mb-2">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Galeria Fotográfica</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Instantes Capturados
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Uma seleção visual com dados técnicos de câmara e iluminação.
                </p>
              </div>

              <button
                onClick={() => setActiveView('gallery')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl shadow-sm transition"
              >
                <span>Ver Galeria Completa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {previewPhotos.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/70 dark:bg-[#151125]/80 border border-dashed border-purple-200 dark:border-purple-950/60 text-center py-8">
                <ImageIcon className="w-8 h-8 text-purple-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  A galeria está vazia e pronta para receber fotografias reais.
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Adiciona imagens através do painel de administração ou do Google Drive.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {previewPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setActiveView('gallery')}
                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-sm bg-slate-900"
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 opacity-90 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-purple-300 font-semibold uppercase">
                        {photo.category}
                      </span>
                      <h4 className="text-white text-xs font-bold truncate">
                        {photo.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Curated Thought Spotlight */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161324] border border-purple-50/80 dark:border-purple-950/40 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center shrink-0">
              <Quote className="w-5 h-5" />
            </div>
            <div>
              <blockquote className="text-sm sm:text-base font-serif italic text-slate-700 dark:text-purple-100 leading-relaxed">
                "A simplicidade não é a ausência de desordem, mas a presença de propósito. Cada detalhe que escolhemos manter deve ter uma razão clara de existir."
              </blockquote>
              <span className="block text-xs font-semibold text-purple-600 dark:text-purple-400 mt-2">
                — Caderno de Reflexões do Lume
              </span>
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-4">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};
