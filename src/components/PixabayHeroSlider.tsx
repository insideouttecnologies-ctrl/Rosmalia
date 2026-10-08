import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Sparkles,
  Sliders,
  PenSquare,
  Compass
} from 'lucide-react';
import { BannerItem, ViewMode } from '../types';
import { useBlog } from '../context/BlogContext';
import { CustomizeBannerModal } from './CustomizeBannerModal';

interface PixabayHeroSliderProps {
  onOpenAdmin?: () => void;
}

export const PixabayHeroSlider: React.FC<PixabayHeroSliderProps> = ({ onOpenAdmin }) => {
  const {
    bannerItems,
    posts,
    openPostDetail,
    setActiveView,
    bookmarkedIds,
    toggleBookmark,
    isAdmin,
  } = useBlog();

  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Take up to 3 items as requested
  const displayItems: BannerItem[] = bannerItems.slice(0, 3);

  // Keep currentIndex bounded if items length changes
  useEffect(() => {
    if (currentIndex >= displayItems.length && displayItems.length > 0) {
      setCurrentIndex(0);
    }
  }, [displayItems.length, currentIndex]);

  // Auto-play timer for slides
  useEffect(() => {
    if (displayItems.length <= 1) return;
    if (isPlaying && !isHovered) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % displayItems.length);
      }, 5500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isHovered, displayItems.length]);

  const handleNext = () => {
    if (displayItems.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % displayItems.length);
    }
  };

  const handlePrev = () => {
    if (displayItems.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length);
    }
  };

  const handleSelect = (idx: number) => {
    setCurrentIndex(idx);
  };

  const currentItem = displayItems[currentIndex] || displayItems[0];

  // Resolve matching post if linked
  let matchedPost = currentItem?.postId ? posts.find((p) => p.id === currentItem.postId) : undefined;
  if (!matchedPost && currentItem?.ctaLink?.startsWith('post:')) {
    const pId = currentItem.ctaLink.replace('post:', '');
    matchedPost = posts.find((p) => p.id === pId);
  }

  const isBookmarked = matchedPost ? bookmarkedIds.includes(matchedPost.id) : false;

  const handleCtaClick = () => {
    if (matchedPost) {
      openPostDetail(matchedPost);
      return;
    }
    const target = currentItem?.ctaLink || 'articles';
    if (target.startsWith('post:')) {
      const pId = target.replace('post:', '');
      const found = posts.find((p) => p.id === pId);
      if (found) {
        openPostDetail(found);
        return;
      }
    }
    if (['home', 'articles', 'gallery', 'about', 'contact', 'profile'].includes(target)) {
      setActiveView(target as ViewMode);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (target.startsWith('http://') || target.startsWith('https://')) {
      window.open(target, '_blank', 'noopener,noreferrer');
      return;
    }
    setActiveView('articles');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className="relative group overflow-hidden rounded-3xl shadow-xl border border-purple-500/20 min-h-[440px] sm:min-h-[500px] flex flex-col justify-between bg-slate-950 transition-all select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Layers with Smooth Cross-Fade Animation */}
        {displayItems.map((item, idx) => (
          <div
            key={item.id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            }`}
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80';
              }}
            />
          </div>
        ))}

        {/* Contrast Scrim Overlay for Crystal-Clear Typography */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0817]/95 via-[#120a26]/60 to-black/35 pointer-events-none z-10" />

        {/* Top Bar Controls Inside Hero */}
        <div className="relative z-20 p-5 sm:p-6 flex items-center justify-between gap-3">
          {/* Badge & Slide Count Indicator */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold text-white bg-[#7C3AED]/85 backdrop-blur-md rounded-xl border border-purple-300/30 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-200" />
              <span>{currentItem?.badge || 'Destaque'}</span>
            </span>

            {displayItems.length > 1 && (
              <span className="text-[11px] text-white/80 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                Item {currentIndex + 1} de {displayItems.length}
              </span>
            )}
          </div>

          {/* Action Zone: Admin Personalization button, Bookmark & Play/Pause */}
          <div className="flex items-center gap-2">
            {/* Admin Customize Banner Button */}
            {isAdmin && (
              <button
                onClick={() => setIsCustomizeModalOpen(true)}
                title="Personalizar carrossel principal (até 3 itens)"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md bg-purple-900/60 hover:bg-[#7C3AED] text-white text-xs font-semibold border border-purple-300/30 shadow-md transition active:scale-95"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-200" />
                <span className="hidden sm:inline">Personalizar Banner</span>
              </button>
            )}

            {/* Play/Pause Rotation */}
            {displayItems.length > 1 && (
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? 'Pausar rotação automática' : 'Continuar rotação automática'}
                aria-label="Controle de rotação do carrossel"
                className="p-2 rounded-xl backdrop-blur-md bg-black/40 hover:bg-black/60 text-white/80 hover:text-white border border-white/10 transition"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            )}

            {matchedPost && (
              <button
                onClick={() => toggleBookmark(matchedPost!.id)}
                aria-label={isBookmarked ? 'Remover dos favoritos' : 'Guardar nos favoritos'}
                className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                  isBookmarked
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-black/40 hover:bg-black/60 text-white/80 hover:text-white border border-white/10'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Manual Arrow Controls (Left & Right) */}
        {displayItems.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Item anterior"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110 border border-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              aria-label="Próximo item"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110 border border-white/10"
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
              onClick={handleCtaClick}
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight cursor-pointer hover:text-purple-200 transition-colors line-clamp-2 leading-tight"
            >
              {currentItem?.title}
            </h2>

            {/* Subtitle / Excerpt */}
            <p className="mt-2.5 text-sm sm:text-base text-purple-100/90 leading-relaxed line-clamp-2 max-w-xl">
              {currentItem?.subtitle}
            </p>

            {/* CTA Button and Indicators Row */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                onClick={handleCtaClick}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] active:scale-[0.98] rounded-xl shadow-lg shadow-purple-950/50 transition-all group/btn"
              >
                <span>{currentItem?.ctaText || 'Explorar'}</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>

              {isAdmin && onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-purple-200 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/10 transition"
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  <span>Novo Artigo</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Slide Indicators (Dots up to 3) */}
          {displayItems.length > 1 && (
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {displayItems.map((item, idx) => (
                  <button
                    key={item.id || idx}
                    onClick={() => handleSelect(idx)}
                    aria-label={`Ir para destaque ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? 'w-8 bg-[#8B5CF6]'
                        : 'w-2.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              {/* Mini thumbnails strip for the up to 3 items */}
              <div className="flex items-center gap-2">
                {displayItems.map((item, idx) => (
                  <button
                    key={item.id || idx}
                    onClick={() => handleSelect(idx)}
                    className={`w-11 h-7 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentIndex
                        ? 'border-purple-400 scale-105 ring-2 ring-purple-500/60 opacity-100'
                        : 'border-transparent opacity-40 hover:opacity-90'
                    }`}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80';
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Banner Customization Modal */}
      {isAdmin && (
        <CustomizeBannerModal
          isOpen={isCustomizeModalOpen}
          onClose={() => setIsCustomizeModalOpen(false)}
        />
      )}
    </>
  );
};
