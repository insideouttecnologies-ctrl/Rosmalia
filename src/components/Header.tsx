import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import {
  Moon,
  Sun,
  Search,
  Sparkles,
  PlusCircle,
  LogIn,
  LogOut,
  Menu,
  X,
  Image as ImageIcon,
  User as UserIcon,
  Bookmark,
  ShieldCheck,
  HardDrive,
  Video
} from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  onOpenAdmin: () => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onOpenDrive?: () => void;
  onOpenVideoCall: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAdmin,
  onOpenSearch,
  onOpenAuth,
  onOpenDrive,
  onOpenVideoCall,
}) => {
  const {
    activeView,
    setActiveView,
    setSelectedCategory,
    setSelectedPost,
    darkMode,
    toggleDarkMode,
    currentUser,
    isAdmin,
    logout,
    loginWithGoogle,
    isDriveConnected,
    googleUser,
  } = useBlog();

  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNavClick = (view: ViewMode) => {
    setActiveView(view);
    setSelectedPost(null);
    if (view === 'home' || view === 'articles') {
      setSelectedCategory(null);
    }
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#12101e]/90 backdrop-blur-md border-b border-purple-100/80 dark:border-purple-950/40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Identity: Lume */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            {/* Elegant Floral/Botanical Sprout Icon */}
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-[#7C3AED] dark:text-purple-300 shadow-sm group-hover:scale-105 transition-transform">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-[#7C3AED] dark:text-[#A78BFA]"
              >
                <path d="M12 2C12 2 10 7 10 10C10 11.66 11.34 13 13 13C14.66 13 16 11.66 16 10C16 7 12 2 12 2Z" />
                <path d="M8.5 7.5C8.5 7.5 5 10 5 13C5 15.21 6.79 17 9 17C10.15 17 11.19 16.52 11.92 15.74C11.35 14.9 11 13.9 11 12.8C11 10.6 12.5 8.7 8.5 7.5Z" opacity="0.85" />
                <path d="M15.5 7.5C11.5 8.7 13 10.6 13 12.8C13 13.9 12.65 14.9 12.08 15.74C12.81 16.52 13.85 17 15 17C17.21 17 19 15.21 19 13C19 10 15.5 7.5 15.5 7.5Z" opacity="0.85" />
                <path d="M11 16C11 18 10 21 7 22C10 22 13 20 13 16H11Z" opacity="0.6" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                  Lume
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                O espaço das boas ideias
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-6 text-sm font-medium">
            <button
              onClick={() => handleNavClick('home')}
              className={`relative px-3 py-2 transition-colors ${
                activeView === 'home'
                  ? 'text-[#7C3AED] dark:text-purple-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Início
              {activeView === 'home' && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#7C3AED] dark:bg-purple-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('articles')}
              className={`relative px-3 py-2 transition-colors ${
                activeView === 'articles'
                  ? 'text-[#7C3AED] dark:text-purple-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Artigos
              {activeView === 'articles' && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#7C3AED] dark:bg-purple-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('gallery')}
              className={`relative px-3 py-2 flex items-center gap-1.5 transition-colors ${
                activeView === 'gallery'
                  ? 'text-[#7C3AED] dark:text-purple-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 opacity-70" />
              Galeria
              {activeView === 'gallery' && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#7C3AED] dark:bg-purple-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className={`relative px-3 py-2 transition-colors ${
                activeView === 'about'
                  ? 'text-[#7C3AED] dark:text-purple-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sobre
              {activeView === 'about' && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#7C3AED] dark:bg-purple-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('contact')}
              className={`relative px-3 py-2 transition-colors ${
                activeView === 'contact'
                  ? 'text-[#7C3AED] dark:text-purple-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Contato
              {activeView === 'contact' && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#7C3AED] dark:bg-purple-400 rounded-full" />
              )}
            </button>
          </nav>

          {/* Action Zone: Dark mode, Search, Auth/Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              title={darkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              aria-label="Alternar modo escuro e claro"
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-[#7C3AED] dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-full transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              )}
            </button>

            {/* Quick Search */}
            <button
              onClick={onOpenSearch}
              aria-label="Pesquisar"
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-[#7C3AED] dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-full transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* WebRTC Video Call (1-to-1) */}
            <button
              onClick={onOpenVideoCall}
              title="Iniciar Vídeo Chamada WebRTC (1-para-1)"
              aria-label="Vídeo Chamada WebRTC"
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-[#7C3AED] dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-full transition-colors relative group"
            >
              <Video className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#12101e]" />
            </button>

            {/* Google Drive Media Center - Exclusivo para Administrador */}
            {isAdmin && onOpenDrive && (
              <button
                onClick={onOpenDrive}
                title={isDriveConnected ? `Google Drive Conectado (${googleUser?.email})` : 'Conectar ao Google Drive (Admin)'}
                aria-label="Google Drive Media"
                className={`p-2 rounded-full transition-colors relative ${
                  isDriveConnected
                    ? 'text-[#7C3AED] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/70 hover:bg-purple-100'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#7C3AED] dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50'
                }`}
              >
                <HardDrive className="w-5 h-5" />
                {isDriveConnected && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#12101e]" />
                )}
              </button>
            )}

            {/* Admin Creator Quick Action if Admin */}
            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] rounded-xl shadow-sm transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Publicar</span>
              </button>
            )}

            {/* User Account / Profile Area */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-950/40 transition border border-transparent hover:border-purple-200"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-300 dark:ring-purple-700"
                  />
                  <span className="hidden lg:inline text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#161324] rounded-2xl shadow-xl border border-purple-500/20 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-purple-950/40">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {currentUser.email}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                        {currentUser.role === 'admin' ? 'Administrador' : 'Leitor'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleNavClick('profile')}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 flex items-center gap-2 transition"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-purple-600" />
                      <span>Minhas Atividades & Favoritos</span>
                    </button>

                    {isAdmin && onOpenDrive && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenDrive();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 flex items-center gap-2 transition"
                      >
                        <HardDrive className="w-3.5 h-3.5 text-[#7C3AED]" />
                        <span>Google Drive Media & Pastas</span>
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 flex items-center gap-2 transition"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-purple-600" />
                        <span>Publicar Artigo ou Foto</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 dark:border-purple-950/40 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Terminar Sessão</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    setIsGoogleSigningIn(true);
                    await loginWithGoogle();
                    setIsGoogleSigningIn(false);
                  }}
                  disabled={isGoogleSigningIn}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#161324] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-purple-950/60 rounded-xl shadow-xs transition active:scale-[0.98] disabled:opacity-60"
                  title="Entrar com a conta Google"
                >
                  {isGoogleSigningIn ? (
                    <div className="w-3.5 h-3.5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  )}
                  <span>Google</span>
                </button>

                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.98] rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 opacity-80" />
                  <span>Entrar</span>
                </button>
              </div>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-lg"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-purple-100 dark:border-purple-950/50 py-4 px-2 space-y-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeView === 'home'
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300'
                  : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              Início
            </button>
            <button
              onClick={() => handleNavClick('articles')}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeView === 'articles'
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300'
                  : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              Artigos
            </button>
            <button
              onClick={() => handleNavClick('gallery')}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                activeView === 'gallery'
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300'
                  : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-purple-600" />
              Galeria de Fotos
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeView === 'about'
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300'
                  : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              Sobre
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeView === 'contact'
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300'
                  : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              Contato
            </button>

            {currentUser && (
              <button
                onClick={() => handleNavClick('profile')}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                  activeView === 'profile'
                    ? 'bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300'
                    : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                <Bookmark className="w-4 h-4 text-purple-600" />
                <span>Minhas Atividades</span>
              </button>
            )}

            {/* Mobile WebRTC Video Call */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenVideoCall();
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 text-[#7C3AED] dark:text-purple-300 bg-purple-50/80 dark:bg-purple-950/40 hover:bg-purple-100 transition"
            >
              <Video className="w-4 h-4" />
              <span>Vídeo Chamada WebRTC (1-para-1)</span>
            </button>

            {/* Mobile Dark/Light Theme Toggle */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#7C3AED]" />}
                <span>Tema: {darkMode ? 'Modo Escuro' : 'Modo Claro'}</span>
              </div>
              <button
                onClick={toggleDarkMode}
                className="px-3 py-1 font-bold rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition active:scale-95"
              >
                Alternar
              </button>
            </div>

            <div className="pt-2 border-t border-purple-100 dark:border-purple-950/50">
              {currentUser ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-xs font-semibold text-rose-600"
                >
                  Terminar Sessão ({currentUser.name})
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      setIsGoogleSigningIn(true);
                      await loginWithGoogle();
                      setIsGoogleSigningIn(false);
                    }}
                    disabled={isGoogleSigningIn}
                    className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-[#161324] border border-slate-200 dark:border-purple-950/60 shadow-xs active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Entrar com o Google</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full text-center px-4 py-2 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50/60 dark:bg-purple-950/40"
                  >
                    Entrar com Email e Senha
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
