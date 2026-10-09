import React from 'react';
import { useBlog } from '../context/BlogContext';
import { Sparkles, Heart, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveView, setSelectedCategory, setSelectedPost, isFirebaseSyncing } = useBlog();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (view: 'home' | 'articles' | 'gallery' | 'curriculum' | 'about' | 'contact') => {
    setActiveView(view);
    setSelectedPost(null);
    setSelectedCategory(null);
    scrollToTop();
  };

  return (
    <footer className="mt-20 border-t border-purple-100/80 dark:border-purple-950/40 bg-white/60 dark:bg-[#12101e]/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-[#7C3AED] dark:text-purple-300">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 2C12 2 10 7 10 10C10 11.66 11.34 13 13 13C14.66 13 16 11.66 16 10C16 7 12 2 12 2Z" />
                <path d="M8.5 7.5C8.5 7.5 5 10 5 13C5 15.21 6.79 17 9 17C10.15 17 11.19 16.52 11.92 15.74C11.35 14.9 11 13.9 11 12.8C11 10.6 12.5 8.7 8.5 7.5Z" opacity="0.85" />
                <path d="M15.5 7.5C11.5 8.7 13 10.6 13 12.8C13 13.9 12.65 14.9 12.08 15.74C12.81 16.52 13.85 17 15 17C17.21 17 19 15.21 19 13C19 10 15.5 7.5 15.5 7.5Z" opacity="0.85" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-lg">
                Lume
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">
                O espaço das boas ideias
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
            <button onClick={() => handleNav('home')} className="hover:text-[#7C3AED] transition">
              Início
            </button>
            <button onClick={() => handleNav('articles')} className="hover:text-[#7C3AED] transition">
              Artigos
            </button>
            <button onClick={() => handleNav('gallery')} className="hover:text-[#7C3AED] transition">
              Galeria
            </button>
            <button onClick={() => handleNav('curriculum')} className="hover:text-[#7C3AED] transition">
              Currículo
            </button>
            <button onClick={() => handleNav('about')} className="hover:text-[#7C3AED] transition">
              Sobre
            </button>
            <button onClick={() => handleNav('contact')} className="hover:text-[#7C3AED] transition">
              Contato
            </button>
          </div>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition"
          >
            <span>Voltar ao topo</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-purple-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
          <p>© 2026 Lume. Criado com foco em ideias intencionais e boas conversas.</p>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isFirebaseSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Firebase Database: <span className="text-[#7C3AED] dark:text-purple-300 font-semibold">{isFirebaseSyncing ? 'A sincronizar...' : 'Conectado'}</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
