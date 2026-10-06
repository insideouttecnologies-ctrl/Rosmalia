import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Clock,
  ArrowRight,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Camera,
  MapPin,
  Sparkles,
  PenSquare,
  HardDrive,
  Database
} from 'lucide-react';
import { Post } from '../types';
import { useBlog } from '../context/BlogContext';

interface SlideItem {
  id: string;
  image: string;
  location: string;
  photographer: string;
  postId?: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
}

interface PixabayHeroSliderProps {
  onOpenAdmin?: () => void;
}

export const PixabayHeroSlider: React.FC<PixabayHeroSliderProps> = ({ onOpenAdmin }) => {
  const { posts, openPostDetail, bookmarkedIds, toggleBookmark, isAdmin } = useBlog();

  // Dynamically derive slides from real posts
  const featuredPosts = posts.filter((p) => p.isFeatured);
  const displayPosts = featuredPosts.length > 0 ? featuredPosts : posts.slice(0, 5);

  const slides: SlideItem[] = displayPosts.map((p) => ({
    id: `slide-${p.id}`,
    image: p.coverImage,
    location: 'Lume Editorial',
    photographer: p.author?.name || 'Admin',
    postId: p.id,
    category: p.category,
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    readTime: p.readTime,
  }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep currentIndex bounded if slides change
  useEffect(() => {
    if (currentIndex >= slides.length && slides.length > 0) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  // Auto-play timer when slides exist
  useEffect(() => {
    if (slides.length <= 1) return;
    if (isPlaying && !isHovered) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }, 5500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isHovered, slides.length]);

  const handleNext = () => {
    if (slides.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }
  };

  const handlePrev = () => {
    if (slides.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const handleSelect = (idx: number) => {
    setCurrentIndex(idx);
  };

  // If there are NO posts in the database yet: render a clean, production-grade Welcome Hero Banner
  if (slides.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl shadow-lg border border-purple-500/20 min-h-[380px] sm:min-h-[420px] flex flex-col justify-between bg-gradient-to-br from-[#1b1236] via-[#120c24] to-[#0a0714] p-6 sm:p-10 text-white">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#7C3AED]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold text-white bg-[#7C3AED]/80 backdrop-blur-md rounded-xl border border-purple-300/30 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            <span>Lume Editorial</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-purple-200 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Firebase Realtime DB Conectado</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-purple-200 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            <span>Google Drive Ready</span>
          </span>
        </div>

        {/* Center Welcome Typography */}
        <div className="relative z-10 my-8 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            O espaço das boas ideias e multimédia
          </h1>
          <p className="mt-3 text-base sm:text-lg text-purple-200/90 leading-relaxed font-light">
            Ambiente pronto para produção sem dados fictícios. Publica ensaios, fotos da galeria e conteúdos de vídeo ou áudio sincronizados em tempo real com a nuvem.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {isAdmin && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.98] rounded-xl shadow-lg shadow-purple-950/50 transition-all"
              >
                <PenSquare className="w-4 h-4" />
                <span>Criar Primeiro Artigo</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Status Row */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-purple-300/70">
          <span>Pronto para publicação • Autenticação & Gestão Ativa</span>
          <span>Sincronização bidirecional em tempo real</span>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentIndex] || slides[0];
  const matchedPost = posts.find((p) => p.id === currentSlide.postId);
  const isBookmarked = matchedPost ? bookmarkedIds.includes(matchedPost.id) : false;

  return (
    <div
      className="relative group overflow-hidden rounded-3xl shadow-lg border border-purple-500/10 min-h-[420px] sm:min-h-[480px] flex flex-col justify-between bg-slate-950 transition-all select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Layers with Smooth Cross-Fade Animation */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
        </div>
      ))}

      {/* Atmospheric Contrast Scrim (Pixabay style) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0e081f]/95 via-[#130b2c]/60 to-black/30 pointer-events-none z-10" />

      {/* Top Bar Controls Inside Hero */}
      <div className="relative z-20 p-5 sm:p-6 flex items-center justify-between">
        {/* Category Pill */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold text-white bg-[#7C3AED]/80 backdrop-blur-md rounded-xl border border-purple-300/30 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            <span>{currentSlide.category}</span>
          </span>
          <span className="hidden sm:inline-flex text-[11px] text-white/70 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-lg">
            Slide {currentIndex + 1} de {slides.length}
          </span>
        </div>

        {/* Action Controls: Pause/Play & Bookmark */}
        <div className="flex items-center gap-2">
          {slides.length > 1 && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pausar rotação automática' : 'Continuar rotação automática'}
              aria-label="Controle de rotação do carrossel"
              className="p-2 rounded-xl backdrop-blur-md bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          )}

          {matchedPost && (
            <button
              onClick={() => toggleBookmark(matchedPost.id)}
              aria-label={isBookmarked ? 'Remover dos favoritos' : 'Guardar nos favoritos'}
              className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                isBookmarked
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-black/30 hover:bg-black/50 text-white/80 hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Manual Arrow Controls (Left & Right) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Imagem anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white/90 hover:text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            aria-label="Próxima imagem"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white/90 hover:text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Main Bottom Overlay Content */}
      <div className="relative z-20 p-6 sm:p-8 lg:p-10 flex flex-col justify-end">
        <div className="max-w-2xl">
          {/* Title */}
          <h2
            onClick={() => matchedPost && openPostDetail(matchedPost)}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight cursor-pointer hover:text-purple-200 transition-colors line-clamp-2"
            style={{ textWrap: 'balance' }}
          >
            {currentSlide.title}
          </h2>

          {/* Excerpt */}
          <p className="mt-2.5 text-sm sm:text-base text-purple-100/90 leading-relaxed line-clamp-2 max-w-xl">
            {currentSlide.excerpt}
          </p>

          {/* Meta Info */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-purple-200/80">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 opacity-80" />
              <span>{currentSlide.date}</span>
            </div>
            <span className="opacity-40">·</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 opacity-80" />
              <span>{currentSlide.readTime}</span>
            </div>
          </div>

          {/* CTA Button and Indicators Row */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => matchedPost && openPostDetail(matchedPost)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] active:scale-[0.98] rounded-xl shadow-lg shadow-purple-950/40 transition-all group/btn"
            >
              <span>Ler artigo</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>

            {/* Photographer & Location Credit */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/70 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <Camera className="w-3.5 h-3.5 text-purple-300" />
              <span>{currentSlide.photographer}</span>
              <span className="text-white/40">·</span>
              <MapPin className="w-3 h-3 text-purple-300" />
              <span>{currentSlide.location}</span>
            </div>
          </div>
        </div>

        {/* Bottom Slide Indicators (Dots & Thumbnail Bars) */}
        {slides.length > 1 && (
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => handleSelect(idx)}
                  aria-label={`Ir para slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-8 bg-[#8B5CF6]'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>

            {/* Quick mini thumbnail strip on desktop */}
            <div className="hidden md:flex items-center gap-2">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => handleSelect(idx)}
                  className={`w-10 h-7 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentIndex
                      ? 'border-purple-400 scale-105 ring-2 ring-purple-500/50'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
