import React from 'react';
import { Calendar, Clock, Bookmark, Heart, MessageSquare, Play, Headphones, HardDrive, Trash2 } from 'lucide-react';
import { Post } from '../types';
import { useBlog } from '../context/BlogContext';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { openPostDetail, bookmarkedIds, toggleBookmark, likePost, comments, isAdmin, deletePost } = useBlog();
  const isBookmarked = bookmarkedIds.includes(post.id);
  const postComments = comments[post.id] || [];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Tem a certeza de que deseja eliminar o artigo "${post.title}"?\n\nEsta ação é permanente e removerá o post da base de dados Firebase.`
    );
    if (confirmed) {
      deletePost(post.id);
    }
  };

  return (
    <article
      onClick={() => openPostDetail(post)}
      className="group cursor-pointer flex flex-col bg-white dark:bg-[#171426] rounded-2xl border border-purple-50/80 dark:border-purple-950/40 overflow-hidden shadow-sm hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800/60 transition-all duration-300"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={post.coverImage}
          alt={post.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Media Badges: Video / Audio */}
        {post.mediaType === 'video' && (
          <span className="absolute top-3 left-3 bg-rose-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm backdrop-blur-xs">
            <Play className="w-3 h-3 fill-current" />
            <span>Vídeo</span>
          </span>
        )}

        {post.mediaType === 'audio' && (
          <span className="absolute top-3 left-3 bg-[#7C3AED]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm backdrop-blur-xs">
            <Headphones className="w-3 h-3" />
            <span>Áudio</span>
          </span>
        )}

        {/* Google Drive indicator if attached */}
        {post.driveFileId && (
          <span className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[9px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
            <HardDrive className="w-2.5 h-2.5 text-purple-300" />
            <span>Drive</span>
          </span>
        )}

        {/* Floating Quick Action Buttons */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
          {isAdmin && (
            <button
              onClick={handleDelete}
              aria-label="Eliminar artigo"
              title="Eliminar artigo (Admin)"
              className="p-2 rounded-full backdrop-blur-md bg-rose-600/90 hover:bg-rose-700 text-white shadow-md transition active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(post.id);
            }}
            aria-label={isBookmarked ? 'Remover favorito' : 'Favoritar'}
            className={`p-2 rounded-full backdrop-blur-md transition ${
              isBookmarked
                ? 'bg-purple-600 text-white'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Pill Tag */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="inline-block px-2.5 py-1 text-xs font-semibold text-[#7C3AED] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 rounded-md">
              {post.category}
            </span>

            {/* Comments Counter */}
            {postComments.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                <MessageSquare className="w-3 h-3" />
                <span>{postComments.length}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#7C3AED] dark:group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        {/* Footer Metadata */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-purple-950/40 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 opacity-80" />
            <span>{post.date}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 opacity-80" />
            <span>{post.readTime}</span>
          </div>
        </div>
      </div>
    </article>
  );
};
