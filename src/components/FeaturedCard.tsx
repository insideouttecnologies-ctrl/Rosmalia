import React from 'react';
import { Calendar, Clock, ArrowRight, Bookmark } from 'lucide-react';
import { Post } from '../types';
import { useBlog } from '../context/BlogContext';

interface FeaturedCardProps {
  post: Post;
}

export const FeaturedCard: React.FC<FeaturedCardProps> = ({ post }) => {
  const { openPostDetail, bookmarkedIds, toggleBookmark } = useBlog();
  const isBookmarked = bookmarkedIds.includes(post.id);

  return (
    <div className="relative group overflow-hidden rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 min-h-[380px] sm:min-h-[420px] flex flex-col justify-end bg-slate-900">
      {/* Background Image with Fallback and Smooth Zoom on Hover */}
      <img
        src={post.coverImage}
        alt={post.title}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
      />

      {/* Measured Atmospheric Gradient Scrim for high text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#150d2a]/95 via-[#1a1133]/65 to-transparent pointer-events-none" />

      {/* Top right quick bookmark */}
      <div className="absolute top-5 right-5 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleBookmark(post.id);
          }}
          aria-label={isBookmarked ? 'Remover dos favoritos' : 'Guardar nos favoritos'}
          className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
            isBookmarked
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-black/30 hover:bg-black/50 text-white/80 hover:text-white'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Featured Content Overlay */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 max-w-2xl">
        {/* Category Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wide text-purple-100 bg-[#7C3AED]/80 backdrop-blur-sm rounded-lg border border-purple-400/30">
            Destaque
          </span>
        </div>

        {/* Title */}
        <h2
          onClick={() => openPostDetail(post)}
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight cursor-pointer hover:text-purple-200 transition-colors line-clamp-2"
          style={{ textWrap: 'balance' }}
        >
          {post.title}
        </h2>

        {/* Subtitle / Excerpt */}
        <p className="mt-3 text-sm sm:text-base text-purple-100/90 leading-relaxed line-clamp-2 max-w-xl">
          {post.excerpt}
        </p>

        {/* Meta Info */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-purple-200/80">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 opacity-80" />
            <span>{post.date}</span>
          </div>
          <span className="opacity-40">·</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 opacity-80" />
            <span>{post.readTime}</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-6">
          <button
            onClick={() => openPostDetail(post)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] active:scale-[0.98] rounded-xl shadow-lg shadow-purple-900/30 transition-all duration-200 group/btn"
          >
            <span>Ler artigo</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
