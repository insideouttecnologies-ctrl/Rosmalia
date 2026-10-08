import React, { useState } from 'react';
import {
  User as UserIcon,
  Bookmark,
  Heart,
  MessageSquare,
  Clock,
  Settings,
  LogOut,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Trash2,
  CheckCircle,
  FileText,
  HardDrive,
  UploadCloud,
  Camera,
  Folder,
  LogIn,
  Database
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { PostCard } from './PostCard';
import { DriveMediaModal } from './DriveMediaModal';
import { DriveMediaFile, normalizeDriveImageUrl } from '../services/googleDrive';

interface UserProfileViewProps {
  onOpenAdminPost: () => void;
  onOpenAuth?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onOpenAdminPost, onOpenAuth }) => {
  const {
    currentUser,
    logout,
    updateProfile,
    posts,
    bookmarkedIds,
    likedPostIds,
    readHistoryIds,
    comments,
    openPostDetail,
    setActiveView,
    isDriveConnected,
    connectGoogleDrive,
    googleUser,
    uploadMediaToDrive,
    loginWithGoogle,
  } = useBlog();

  const [activeTab, setActiveTab] = useState<'saved' | 'liked' | 'comments' | 'history' | 'settings'>('saved');
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  // Edit profile form state
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Google Drive Avatar management
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [driveSuccessNotice, setDriveSuccessNotice] = useState<string | null>(null);

  const handleAvatarDriveUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setUploadPercent(20);

    try {
      if (isDriveConnected) {
        setUploadPercent(40);
        const uploaded = await uploadMediaToDrive(file, 'profiles', (p) => setUploadPercent(p));
        setEditAvatar(uploaded.directUrl);
        updateProfile({ avatar: uploaded.directUrl });
        setDriveSuccessNotice(`Foto guardada no Google Drive (Profile Pictures) e partilhada com todos!`);
        setTimeout(() => setDriveSuccessNotice(null), 4500);
      } else {
        // Fallback: Read as optimized data URL so anyone can update immediately without blocking
        setUploadPercent(50);
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            const dataUrl = ev.target.result as string;
            setEditAvatar(dataUrl);
            updateProfile({ avatar: dataUrl });
            setDriveSuccessNotice(`Foto de perfil atualizada e visível para todos os utilizadores!`);
            setTimeout(() => setDriveSuccessNotice(null), 4500);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      alert(`Falha no upload da foto: ${err.message}`);
    } finally {
      setIsUploadingAvatar(false);
      setUploadPercent(0);
      e.target.value = '';
    }
  };

  const handleSelectAvatarFromDrive = (media: DriveMediaFile) => {
    setEditAvatar(media.directUrl);
    updateProfile({ avatar: media.directUrl });
    setIsDrivePickerOpen(false);
    setDriveSuccessNotice(`Foto de perfil atualizada a partir do Google Drive!`);
    setTimeout(() => setDriveSuccessNotice(null), 4000);
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-100 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center shadow-xs">
          <UserIcon className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Acesso ao Perfil & Atividades
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Inicia sessão para gerir os teus artigos favoritados, histórico de leitura e comentários.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={async () => {
              setIsGoogleSigningIn(true);
              await loginWithGoogle();
              setIsGoogleSigningIn(false);
            }}
            disabled={isGoogleSigningIn}
            className="w-full py-3 px-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-purple-950/80 rounded-2xl shadow-xs transition active:scale-[0.98] flex items-center justify-center gap-3 font-semibold text-sm disabled:opacity-60"
          >
            {isGoogleSigningIn ? (
              <div className="w-5 h-5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>{isGoogleSigningIn ? 'A conectar conta Google...' : 'Entrar com o Google'}</span>
          </button>

          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="w-full py-2.5 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-2xl shadow-xs transition active:scale-[0.98] font-semibold text-sm"
            >
              Entrar com Email ou Criar Conta
            </button>
          )}

          <button
            onClick={() => setActiveView('home')}
            className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  // Filter user's saved posts
  const savedPosts = posts.filter((p) => bookmarkedIds.includes(p.id));
  // Filter user's liked posts
  const likedPosts = posts.filter((p) => likedPostIds.includes(p.id));
  // Filter user's read history
  const historyPosts = posts.filter((p) => readHistoryIds.includes(p.id));

  // Find all comments by this user
  const userComments: { post: typeof posts[0]; content: string; createdAt: string; id: string }[] = [];
  Object.entries(comments).forEach(([postId, postComments]) => {
    const parentPost = posts.find((p) => p.id === postId);
    if (!parentPost) return;
    postComments.forEach((c) => {
      if (
        c.authorName.toLowerCase() === currentUser.name.toLowerCase() ||
        (c.authorEmail && c.authorEmail.toLowerCase() === currentUser.email.toLowerCase())
      ) {
        userComments.push({
          post: parentPost,
          content: c.content,
          createdAt: c.createdAt,
          id: c.id,
        });
      }
    });
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName.trim(),
      bio: editBio.trim(),
      avatar: editAvatar.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 animate-fade-in space-y-8">
      {/* User Header Profile Card */}
      <div className="bg-white dark:bg-[#161324] p-6 sm:p-8 rounded-3xl border border-purple-50/80 dark:border-purple-950/40 shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative group">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-purple-100 dark:ring-purple-950 shadow-md"
            />
            {currentUser.role === 'admin' && (
              <span
                title="Administrador"
                className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl bg-[#7C3AED] text-white shadow-md z-10"
              >
                <ShieldCheck className="w-4 h-4" />
              </span>
            )}

            {/* Quick Upload Avatar Button (Disponível para Todos: Leitores e Admin) */}
            <label
              className="absolute inset-0 bg-black/60 text-white rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-center p-1.5"
              title="Carregar nova foto de perfil personalizada (Google Drive ou Ficheiro)"
            >
              <Camera className="w-5 h-5 mb-0.5 text-purple-200" />
              <span className="text-[10px] font-bold leading-tight">Mudar Foto</span>
              <span className="text-[9px] text-purple-200 leading-tight">Drive / Ficheiro</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarDriveUpload}
                disabled={isUploadingAvatar}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {currentUser.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold text-[#7C3AED] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60">
                {currentUser.role === 'admin' ? 'Editor & Administrador' : 'Membro da Comunidade'}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentUser.email}
            </p>

            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md pt-1 leading-relaxed">
              {currentUser.bio || 'Membro entusiasta do Lume partilhando boas ideias.'}
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400 pt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Membro desde {currentUser.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2">
          {currentUser.role === 'admin' && (
            <button
              onClick={onOpenAdminPost}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Criar Artigo</span>
            </button>
          )}

          <button
            onClick={() => {
              logout();
              setActiveView('home');
            }}
            className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-xl transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Upload Status Feedback */}
      {isUploadingAvatar && (
        <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-center gap-3">
          <UploadCloud className="w-5 h-5 text-[#7C3AED] animate-bounce shrink-0" />
          <div className="flex-1 space-y-1">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              A enviar foto para a pasta "Profile Pictures" do Google Drive... ({uploadPercent}%)
            </span>
            <div className="w-full h-1.5 bg-purple-200 dark:bg-purple-900 rounded-full overflow-hidden">
              <div className="h-full bg-[#7C3AED] transition-all" style={{ width: `${uploadPercent}%` }} />
            </div>
          </div>
        </div>
      )}

      {driveSuccessNotice && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{driveSuccessNotice}</span>
        </div>
      )}

      {/* Google Drive Account Card - Exclusivo para Administrador */}
      {currentUser.role === 'admin' ? (
        <div className="bg-gradient-to-r from-purple-50 via-white to-purple-50/40 dark:from-purple-950/40 dark:via-[#161324] dark:to-purple-950/30 p-5 sm:p-6 rounded-3xl border border-purple-100 dark:border-purple-900/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center shadow-sm shrink-0">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Google Drive Conectado (Armazenamento de Vídeos & Media)
                </h4>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                  {isDriveConnected ? 'Conectado' : 'Pronto'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {googleUser ? `Associado a ${googleUser.email}` : 'Armazenamento dedicado na tua conta Google para gravação de vídeos e ficheiros.'}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1 font-semibold text-[#7C3AED] dark:text-purple-300">
                  <Folder className="w-3.5 h-3.5" />
                  <span>Profile Pictures</span>
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-500">
                  <Folder className="w-3.5 h-3.5" />
                  <span>Post Media (Vídeos, Fotos, Áudio)</span>
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-500">
                  <Folder className="w-3.5 h-3.5" />
                  <span>Gallery Photos</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isDriveConnected ? (
              <button
                onClick={() => connectGoogleDrive()}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Conectar Google Drive</span>
              </button>
            ) : (
              <button
                onClick={() => setIsDrivePickerOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-900 rounded-xl hover:bg-purple-50 transition flex items-center gap-1.5"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Explorar Pastas</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-purple-50 via-white to-purple-50/40 dark:from-purple-950/40 dark:via-[#161324] dark:to-purple-950/30 p-5 sm:p-6 rounded-3xl border border-purple-100 dark:border-purple-900/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Membro Leitor da Comunidade Lume
                </h4>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                  Acesso Total
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Podes ler todas as publicações, reproduzir todos os vídeos e áudios, guardar favoritos e comentar livremente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Activity Metric Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('saved')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeTab === 'saved'
              ? 'bg-purple-50 dark:bg-purple-950/50 border-[#7C3AED] shadow-sm'
              : 'bg-white dark:bg-[#161324] border-purple-50/80 dark:border-purple-950/40 hover:border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Favoritos</span>
            <Bookmark className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="block text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {savedPosts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('liked')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeTab === 'liked'
              ? 'bg-purple-50 dark:bg-purple-950/50 border-[#7C3AED] shadow-sm'
              : 'bg-white dark:bg-[#161324] border-purple-50/80 dark:border-purple-950/40 hover:border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Curtidos</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <span className="block text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {likedPosts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeTab === 'comments'
              ? 'bg-purple-50 dark:bg-purple-950/50 border-[#7C3AED] shadow-sm'
              : 'bg-white dark:bg-[#161324] border-purple-50/80 dark:border-purple-950/40 hover:border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Comentários</span>
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </div>
          <span className="block text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {userComments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeTab === 'history'
              ? 'bg-purple-50 dark:bg-purple-950/50 border-[#7C3AED] shadow-sm'
              : 'bg-white dark:bg-[#161324] border-purple-50/80 dark:border-purple-950/40 hover:border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lidos</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="block text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {historyPosts.length}
          </span>
        </button>
      </div>

      {/* Activity Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-purple-950/50 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'saved'
              ? 'bg-[#7C3AED] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
          }`}
        >
          Artigos Guardados ({savedPosts.length})
        </button>

        <button
          onClick={() => setActiveTab('liked')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'liked'
              ? 'bg-[#7C3AED] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
          }`}
        >
          Artigos Curtidos ({likedPosts.length})
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'comments'
              ? 'bg-[#7C3AED] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
          }`}
        >
          Meus Comentários ({userComments.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-[#7C3AED] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
          }`}
        >
          Histórico ({historyPosts.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-[#7C3AED] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Definições</span>
        </button>
      </div>

      {/* TAB CONTENT 1: Saved Posts */}
      {activeTab === 'saved' && (
        <div>
          {savedPosts.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-[#161324] rounded-3xl border border-dashed border-purple-200 dark:border-purple-950/50 p-8">
              <Bookmark className="w-10 h-10 mx-auto text-purple-400 mb-3 opacity-60" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Ainda não guardaste nenhum artigo
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Clica no ícone de marcador nos artigos para guardá-los e lê-los mais tarde.
              </p>
              <button
                onClick={() => setActiveView('home')}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#7C3AED] rounded-xl"
              >
                Explorar Artigos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: Liked Posts */}
      {activeTab === 'liked' && (
        <div>
          {likedPosts.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-[#161324] rounded-3xl border border-dashed border-purple-200 dark:border-purple-950/50 p-8">
              <Heart className="w-10 h-10 mx-auto text-rose-400 mb-3 opacity-60" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Ainda não deste gosto em artigos
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Quando gostares de um texto inspirador, clica no coração para o reveres aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: User Comments */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          {userComments.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-[#161324] rounded-3xl border border-dashed border-purple-200 dark:border-purple-950/50 p-8">
              <MessageSquare className="w-10 h-10 mx-auto text-blue-400 mb-3 opacity-60" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Ainda não publicaste comentários
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Participa nas discussões ao fundo de cada artigo para enriquecer a comunidade!
              </p>
            </div>
          ) : (
            userComments.map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#161324] p-5 rounded-2xl border border-purple-50/80 dark:border-purple-950/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#7C3AED] dark:text-purple-300">
                    No artigo: {item.post.title}
                  </span>
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                    "{item.content}"
                  </p>
                  <span className="block text-xs text-slate-400">{item.createdAt}</span>
                </div>

                <button
                  onClick={() => openPostDetail(item.post)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 rounded-xl hover:bg-purple-100 transition whitespace-nowrap flex items-center gap-1"
                >
                  <span>Ver Artigo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT 4: Reading History */}
      {activeTab === 'history' && (
        <div>
          {historyPosts.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-[#161324] rounded-3xl border border-dashed border-purple-200 dark:border-purple-950/50 p-8">
              <Clock className="w-10 h-10 mx-auto text-emerald-400 mb-3 opacity-60" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Nenhum histórico recente
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 5: Settings / Edit Profile */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-[#161324] p-6 sm:p-8 rounded-3xl border border-purple-50/80 dark:border-purple-950/40 shadow-sm max-w-2xl">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Editar Perfil & Preferências
          </h3>

          {savedSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Perfil atualizado com sucesso!</span>
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nome de Exibição
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Biografia Pessoal
              </label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-900 dark:text-white"
              />
            </div>

            {/* Google Drive Profile Picture Uploader Box (Disponível para Todos: Leitores e Admin) */}
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Foto de Perfil Personalizada (Google Drive / Ficheiro)</span>
                </span>
                <span className="text-[10px] text-purple-600 dark:text-purple-300 font-semibold bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-full">
                  {currentUser.role === 'admin' ? 'Admin' : 'Leitor'}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pode enviar uma foto do seu dispositivo (guardada com acesso público no Google Drive) ou colar um link do Google Drive para que todos a vejam.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <label className="relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] cursor-pointer shadow-xs transition">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isUploadingAvatar ? `A carregar (${uploadPercent}%)...` : 'Enviar Foto do Dispositivo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarDriveUpload}
                    disabled={isUploadingAvatar}
                    className="hidden"
                  />
                </label>

                {isDriveConnected ? (
                  <button
                    type="button"
                    onClick={() => setIsDrivePickerOpen(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-50 transition flex items-center gap-1.5"
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>Ver Fotos em Profile Pictures</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => connectGoogleDrive()}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-50 transition flex items-center gap-1.5"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Conectar Google Drive</span>
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                URL da Foto de Perfil ou Link do Google Drive
              </label>
              <input
                type="text"
                value={editAvatar}
                onChange={(e) => setEditAvatar(normalizeDriveImageUrl(e.target.value))}
                placeholder="https://... ou https://drive.google.com/file/d/..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-900 dark:text-white"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Os links de partilha do Google Drive são convertidos automaticamente para visualização universal pública por todos os utilizadores.
              </p>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl shadow-sm transition"
            >
              Guardar Alterações
            </button>
          </form>
        </div>
      )}

      {/* Google Drive Profile Pictures Modal */}
      <DriveMediaModal
        isOpen={isDrivePickerOpen}
        onClose={() => setIsDrivePickerOpen(false)}
        folderType="profiles"
        onSelectMedia={handleSelectAvatarFromDrive}
        title="Fotos de Perfil - Google Drive (Profile Pictures)"
        acceptType="image/*"
      />
    </div>
  );
};
