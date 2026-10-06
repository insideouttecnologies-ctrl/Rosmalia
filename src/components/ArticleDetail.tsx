import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  Share2,
  Bookmark,
  MessageSquare,
  Check,
  Send,
  Eye,
  User,
  ThumbsUp,
  Tag,
  Headphones,
  Play,
  Pause,
  Volume2,
  HardDrive,
  FileVideo,
  FileAudio
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { Post } from '../types';

interface ArticleDetailProps {
  post: Post;
  onBack: () => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({ post, onBack }) => {
  const {
    likePost,
    comments,
    addComment,
    likeComment,
    bookmarkedIds,
    toggleBookmark,
    posts,
    openPostDetail,
    currentUser,
    loginWithGoogle,
  } = useBlog();

  const isBookmarked = bookmarkedIds.includes(post.id);
  const postComments = comments[post.id] || [];

  const [commentName, setCommentName] = useState(currentUser?.name || '');
  const [commentEmail, setCommentEmail] = useState(currentUser?.email || '');
  const [commentText, setCommentText] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setCommentName(currentUser.name);
      setCommentEmail(currentUser.email);
    }
  }, [currentUser]);

  // Audio player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<'1x' | '1.5x'>('1x');

  // Reading progress percentage
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate audio playback progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + (playbackSpeed === '1x' ? 0.6 : 0.9);
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio, playbackSpeed]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addComment(post.id, {
        authorName: commentName,
        authorEmail: commentEmail,
        content: commentText,
      });
      setCommentText('');
      if (!currentUser) {
        setCommentName('');
        setCommentEmail('');
      }
      setIsSubmitting(false);
    }, 300);
  };

  // Related articles (same category or others, excluding current)
  const relatedPosts = posts
    .filter((p) => p.id !== post.id)
    .slice(0, 3);

  // Helper to render content with markdown-like syntax
  const renderFormattedContent = (content: string) => {
    const blocks = content.split('\n\n');

    return blocks.map((block, idx) => {
      const trimmed = block.trim();

      if (trimmed.startsWith('### ')) {
        return (
          <h3
            key={idx}
            className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4 tracking-tight"
          >
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      if (trimmed.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="my-6 pl-5 py-2 border-l-4 border-[#7C3AED] bg-purple-50/50 dark:bg-purple-950/30 rounded-r-xl italic text-slate-700 dark:text-purple-200 text-base sm:text-lg leading-relaxed font-serif"
          >
            {trimmed.replace('> ', '')}
          </blockquote>
        );
      }

      if (trimmed.startsWith('1. ') || trimmed.startsWith('- ')) {
        const items = trimmed.split('\n');
        return (
          <ul key={idx} className="my-4 space-y-2 text-slate-700 dark:text-slate-300 pl-5 list-disc">
            {items.map((it, i) => (
              <li key={i} className="leading-relaxed">
                {it.replace(/^[0-9]+\.\s+/, '').replace(/^-\s+/, '')}
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p
          key={idx}
          className="text-slate-700 dark:text-slate-300 text-base sm:text-lg leading-relaxed mb-5"
        >
          {trimmed}
        </p>
      );
    });
  };

  return (
    <article className="max-w-4xl mx-auto pb-20 animate-fade-in relative">
      {/* Sticky Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-purple-100/40 dark:bg-purple-950/40">
        <div
          className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Breadcrumb & Return Action */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-[#7C3AED] dark:hover:text-purple-300 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Voltar aos artigos</span>
        </button>

        <span className="px-3 py-1 text-xs font-semibold text-[#7C3AED] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 rounded-lg">
          {post.category}
        </span>
      </div>

      {/* Article Header */}
      <header className="mb-8">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]"
          style={{ textWrap: 'balance' }}
        >
          {post.title}
        </h1>

        <p className="mt-4 text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Audio Narration Bar (Surprise Feature: Listen to Article) */}
        <div className="mt-6 p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="w-10 h-10 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center hover:bg-[#6D28D9] transition shadow-sm shrink-0"
              aria-label={isPlayingAudio ? 'Pausar áudio' : 'Ouvir artigo'}
            >
              {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Ouvir Narração deste Artigo
                </span>
                <span className="text-[10px] text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-1.5 py-0.5 rounded font-semibold">
                  Áudio
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isPlayingAudio ? 'A reproduzir narração em português...' : 'Duração estimada: 4 min 30s'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress Bar for Audio */}
            <div className="w-32 sm:w-44 h-1.5 rounded-full bg-purple-200 dark:bg-purple-900/80 overflow-hidden">
              <div
                className="h-full bg-[#7C3AED] transition-all"
                style={{ width: `${audioProgress}%` }}
              />
            </div>

            {/* Playback speed toggle */}
            <button
              onClick={() => setPlaybackSpeed(playbackSpeed === '1x' ? '1.5x' : '1x')}
              className="text-xs font-semibold px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900 shadow-xs"
            >
              {playbackSpeed}
            </button>
          </div>
        </div>

        {/* Author Meta Row */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-purple-950/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-100 dark:ring-purple-900"
            />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {post.author.name}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {post.date}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {post.views} visualizações
                </span>
              </div>
            </div>
          </div>

          {/* Social and Interaction Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => likePost(post.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                post.isLiked
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current text-rose-500' : ''}`} />
              <span>{post.likes}</span>
            </button>

            <button
              onClick={() => toggleBookmark(post.id)}
              className={`p-2 rounded-xl text-sm transition ${
                isBookmarked
                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-purple-50'
              }`}
              title="Guardar artigo"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-purple-50 hover:text-[#7C3AED] transition"
              title="Partilhar artigo"
            >
              {copiedShare ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 text-xs">Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs">Partilhar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Media Presentation: Video, Audio or Cover Image */}
      {post.mediaType === 'video' && (post.videoUrl || post.coverImage) ? (
        <div className="mb-10 space-y-3">
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-lg bg-black ring-1 ring-purple-500/20">
            <video
              controls
              src={post.videoUrl || post.coverImage}
              poster={post.coverImage}
              className="w-full h-full object-contain"
              playsInline
            >
              O teu navegador não suporta reprodução de vídeo direto.
            </video>
          </div>
          {post.driveFileName && (
            <div className="flex items-center justify-between px-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <FileVideo className="w-3.5 h-3.5 text-rose-500" />
                <span>Vídeo alojado no Google Drive: {post.driveFileName}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
                Google Drive Post Media
              </span>
            </div>
          )}
        </div>
      ) : post.mediaType === 'audio' && (post.audioUrl || post.coverImage) ? (
        <div className="mb-10 space-y-4">
          <div className="relative aspect-[21/9] sm:aspect-[16/7] w-full rounded-3xl overflow-hidden shadow-md">
            <img
              src={post.coverImage}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end p-6 sm:p-8">
              <div className="text-white space-y-1">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#7C3AED] text-white inline-flex items-center gap-1.5 shadow-sm">
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Publicação em Áudio / Podcast</span>
                </span>
                <h3 className="text-lg sm:text-xl font-bold">{post.title}</h3>
              </div>
            </div>
          </div>

          {/* Integrated Audio Streamer */}
          <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileAudio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Faixa de Áudio (Google Drive)
                </span>
              </div>
              {post.driveFileName && (
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-mono">
                  {post.driveFileName}
                </span>
              )}
            </div>

            <audio
              controls
              src={post.audioUrl || post.coverImage}
              className="w-full"
              preload="metadata"
            >
              O teu navegador não suporta reprodução de áudio.
            </audio>
          </div>
        </div>
      ) : (
        <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden mb-10 shadow-sm">
          <img
            src={post.coverImage}
            alt={post.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          {post.driveFileName && (
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-[11px] font-medium flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-purple-300" />
              <span>Drive: {post.driveFileName}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Reading Body */}
      <div className="prose prose-purple dark:prose-invert max-w-none mb-12">
        {renderFormattedContent(post.content)}
      </div>

      {/* Tags Row */}
      {post.tags.length > 0 && (
        <div className="py-6 border-t border-b border-slate-100 dark:border-purple-950/40 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 mr-2">
            <Tag className="w-3.5 h-3.5" />
            Tags:
          </span>
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs px-3 py-1 bg-purple-50 dark:bg-purple-950/50 text-[#7C3AED] dark:text-purple-300 rounded-lg font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Author Bio Box */}
      <div className="mt-10 p-6 sm:p-8 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/30 flex flex-col sm:flex-row gap-5 items-start">
        <img
          src={post.author.avatar}
          alt={post.author.name}
          referrerPolicy="no-referrer"
          className="w-16 h-16 rounded-2xl object-cover shrink-0 ring-2 ring-[#7C3AED]/30"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {post.author.name}
            </h4>
            <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-md font-medium">
              Autor
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {post.author.role}
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {post.author.bio}
          </p>
        </div>
      </div>

      {/* Comments Section */}
      <section className="mt-14 pt-10 border-t border-slate-200 dark:border-purple-950/50">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Comentários
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {postComments.length} {postComments.length === 1 ? 'comentário publicado' : 'comentários publicados'}
              </p>
            </div>
          </div>
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleCommentSubmit} className="bg-white dark:bg-[#171426] p-6 rounded-2xl border border-purple-50/80 dark:border-purple-950/40 shadow-sm mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Deixa a tua reflexão ou dúvida
            </h4>

            {!currentUser ? (
              <button
                type="button"
                onClick={async () => {
                  setIsGoogleSigningIn(true);
                  const res = await loginWithGoogle();
                  setIsGoogleSigningIn(false);
                  if (res.success && res.user) {
                    setCommentName(res.user.name);
                    setCommentEmail(res.user.email);
                  }
                }}
                disabled={isGoogleSigningIn}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 border border-slate-200 dark:border-purple-950/60 rounded-xl transition shadow-2xs self-start sm:self-auto"
                title="Entrar com a conta Google para preencher automaticamente"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isGoogleSigningIn ? 'A autenticar...' : 'Entrar com Google para comentar'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-4 h-4 rounded-full object-cover ring-1 ring-purple-300"
                />
                <span>Comentando como {currentUser.name}</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Nome completo *
              </label>
              <input
                type="text"
                required
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Ex: Clara Sousa"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Email (não será publicado)
              </label>
              <input
                type="email"
                value={commentEmail}
                onChange={(e) => setCommentEmail(e.target.value)}
                placeholder="Ex: clara@exemplo.com"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              O teu comentário *
            </label>
            <textarea
              required
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Partilha a tua perspetiva ou experiência sobre este tema..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-800 dark:text-slate-100 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.98] rounded-xl shadow-sm transition"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'A publicar...' : 'Publicar comentário'}</span>
            </button>
          </div>
        </form>

        {/* Existing Comments List */}
        <div className="space-y-4">
          {postComments.length === 0 ? (
            <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-purple-950/40">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Ainda não há comentários neste artigo. Sê o primeiro a partilhar!
              </p>
            </div>
          ) : (
            postComments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white dark:bg-[#171426] p-5 rounded-2xl border border-purple-50/80 dark:border-purple-950/40 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100 dark:ring-purple-900"
                    />
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                        {comment.authorName}
                      </h5>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {comment.createdAt}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => likeComment(post.id, comment.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      comment.isLiked
                        ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                        : 'text-slate-400 hover:text-purple-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
                    <span>{comment.likes}</span>
                  </button>
                </div>

                <p className="mt-3.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-13">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 pt-10 border-t border-slate-200 dark:border-purple-950/50">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Pode também interessar-te
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedPosts.map((item) => (
              <div
                key={item.id}
                onClick={() => openPostDetail(item)}
                className="group cursor-pointer bg-white dark:bg-[#171426] rounded-2xl border border-purple-50/80 dark:border-purple-950/40 overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <span className="text-[11px] font-semibold text-[#7C3AED] dark:text-purple-300">
                    {item.category}
                  </span>
                  <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#7C3AED] line-clamp-2">
                    {item.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
