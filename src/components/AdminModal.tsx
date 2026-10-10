import React, { useState } from 'react';
import {
  X,
  FileText,
  Camera,
  Image as ImageIcon,
  CheckCircle,
  Sparkles,
  UploadCloud,
  Eye,
  HardDrive,
  FileAudio,
  FileVideo,
  Play,
  Check,
  Database,
  Trash2,
  Search,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { DriveMediaModal } from './DriveMediaModal';
import { DriveMediaFile } from '../services/googleDrive';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'post' | 'photo' | 'manage' | 'branding';
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'post',
}) => {
  const {
    addPost,
    addPhoto,
    categories,
    setActiveView,
    isDriveConnected,
    connectGoogleDrive,
    googleUser,
    uploadMediaToDrive,
    triggerAdminSeeder,
    isFirebaseSyncing,
    posts,
    deletePost,
    branding,
    updateBranding,
    resetBrandingToDefault,
  } = useBlog();

  const [activeTab, setActiveTab] = useState<'post' | 'photo' | 'manage' | 'branding'>(initialTab);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [manageFilter, setManageFilter] = useState('');

  // Branding Form State inside Admin
  const [brandSiteName, setBrandSiteName] = useState(branding?.siteName || 'Lume');
  const [brandTagline, setBrandTagline] = useState(branding?.tagline || 'O espaço das boas ideias');
  const [brandLogoUrl, setBrandLogoUrl] = useState(branding?.logoUrl || '');
  const [brandLogoPreset, setBrandLogoPreset] = useState<'lotus-sprout' | 'modern-l' | 'minimal-circle' | 'geometric-prism'>(
    branding?.logoPreset || 'lotus-sprout'
  );

  const handleRunSeeder = async () => {
    setIsSeeding(true);
    const res = await triggerAdminSeeder(true);
    setIsSeeding(false);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      alert(res.message);
    }
  };

  // Post form state
  const [postTitle, setPostTitle] = useState('');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [postCategory, setPostCategory] = useState('Gestão Empresarial');
  const [postReadTime, setPostReadTime] = useState('5 min de leitura');
  const [postContent, setPostContent] = useState('');
  const [postCoverImage, setPostCoverImage] = useState(
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80'
  );
  const [postTags, setPostTags] = useState('Gestão, PAP, Finanças');
  const [postIsFeatured, setPostIsFeatured] = useState(false);

  // Media Type for Post: image, audio, video
  const [mediaType, setMediaType] = useState<'image' | 'audio' | 'video'>('image');
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [driveFileId, setDriveFileId] = useState<string | undefined>(undefined);
  const [driveFileName, setDriveFileName] = useState<string | undefined>(undefined);

  // Photo form state
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoCategory, setPhotoCategory] = useState('Projetos');
  const [photoImageUrl, setPhotoImageUrl] = useState(
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80'
  );
  const [photoLocation, setPhotoLocation] = useState('Lisboa, Portugal');
  const [photoCamera, setPhotoCamera] = useState('Sony Alpha 7 IV');
  const [photoLens, setPhotoLens] = useState('FE 24-70mm f/2.8 GM II');
  const [photoAperture, setPhotoAperture] = useState('f/2.8');
  const [photoShutter, setPhotoShutter] = useState('1/250s');
  const [photoIso, setPhotoIso] = useState('100');

  // Drive Explorer Modal
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [drivePickerTarget, setDrivePickerTarget] = useState<'postMedia' | 'gallery'>('postMedia');
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  if (!isOpen) return null;

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    addPost({
      title: postTitle.trim(),
      excerpt: postExcerpt.trim() || postContent.slice(0, 110) + '...',
      content: postContent.trim(),
      category: postCategory,
      coverImage: postCoverImage,
      readTime: postReadTime,
      tags: postTags.split(',').map((t) => t.trim()).filter(Boolean),
      isFeatured: postIsFeatured,
      mediaType,
      audioUrl: mediaType === 'audio' ? (audioUrl || postCoverImage) : undefined,
      videoUrl: mediaType === 'video' ? (videoUrl || postCoverImage) : undefined,
      driveFileId,
      driveFileName,
    });

    setSuccessMessage('Artigo publicado com sucesso para todo o mundo!');
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
      setActiveView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle.trim()) return;

    addPhoto({
      title: photoTitle.trim(),
      caption: photoCaption.trim(),
      category: photoCategory,
      imageUrl: photoImageUrl,
      location: photoLocation.trim(),
      exif: {
        camera: photoCamera,
        lens: photoLens,
        aperture: photoAperture,
        shutterSpeed: photoShutter,
        iso: photoIso,
      },
    });

    setSuccessMessage('Fotografia adicionada à galeria com sucesso!');
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
      setActiveView('gallery');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  const handleDirectDriveUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'postMedia' | 'gallery'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isDriveConnected) {
      await connectGoogleDrive();
    }

    setIsUploadingToDrive(true);
    setUploadPercent(15);

    try {
      const folderTarget = type === 'gallery' ? 'gallery' : 'posts';
      const uploaded = await uploadMediaToDrive(file, folderTarget, (p) => setUploadPercent(p));

      if (type === 'gallery') {
        setPhotoImageUrl(uploaded.directUrl);
        setPhotoTitle(file.name.replace(/\.[^/.]+$/, ''));
      } else {
        if (file.type.startsWith('audio/')) {
          setMediaType('audio');
          setAudioUrl(uploaded.directUrl);
        } else if (file.type.startsWith('video/')) {
          setMediaType('video');
          setVideoUrl(uploaded.directUrl);
        } else {
          setPostCoverImage(uploaded.directUrl);
        }
        setDriveFileId(uploaded.id);
        setDriveFileName(uploaded.name);
      }

      setSuccessMessage(`Ficheiro "${file.name}" carregado com sucesso para a pasta do Google Drive!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(`Falha no upload: ${err.message}`);
    } finally {
      setIsUploadingToDrive(false);
      setUploadPercent(0);
      e.target.value = '';
    }
  };

  const handleSelectFromDrive = (media: DriveMediaFile) => {
    if (drivePickerTarget === 'gallery') {
      setPhotoImageUrl(media.directUrl);
      setPhotoTitle(media.name.replace(/\.[^/.]+$/, ''));
    } else {
      if (media.mimeType.startsWith('audio/')) {
        setMediaType('audio');
        setAudioUrl(media.directUrl);
      } else if (media.mimeType.startsWith('video/')) {
        setMediaType('video');
        setVideoUrl(media.directUrl);
      } else {
        setPostCoverImage(media.directUrl);
      }
      setDriveFileId(media.id);
      setDriveFileName(media.name);
    }
    setIsDrivePickerOpen(false);
  };

  const imagePresets = [
    { label: 'Pôr do Sol & Céu', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
    { label: 'Setup & Laptop', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80' },
    { label: 'Montanha & Silhueta', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
    { label: 'Caderno & Café', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80' },
    { label: 'Código & Ecrã', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-2xl max-h-[92vh] bg-white dark:bg-[#151224] rounded-3xl shadow-2xl border border-purple-500/20 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-purple-950/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Painel do Administrador
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Partilha artigos, vídeos, podcasts e fotos com integração Google Drive
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Fechar janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Google Drive Status Bar inside Creator Modal */}
          <div className="px-6 py-2.5 bg-purple-50/70 dark:bg-purple-950/40 border-b border-purple-100 dark:border-purple-900/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#7C3AED]" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Google Drive:
              </span>
              {isDriveConnected ? (
                <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                  Conectado ({googleUser?.email})
                </span>
              ) : (
                <span className="text-slate-500 italic">Desconectado</span>
              )}
            </div>

            {!isDriveConnected ? (
              <button
                type="button"
                onClick={() => connectGoogleDrive()}
                className="text-xs font-semibold text-[#7C3AED] hover:underline"
              >
                Conectar Conta Google
              </button>
            ) : (
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                Pasta ativa: Lume Blog Media
              </span>
            )}
          </div>

          {/* Firebase Database Status & Admin Seeder Bar */}
          <div className="px-6 py-2 bg-slate-50 dark:bg-[#120f20] border-b border-slate-100 dark:border-purple-950/40 flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Firebase Realtime Database:
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {isFirebaseSyncing ? 'A sincronizar...' : 'Ativo & Sincronizado'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleRunSeeder}
              disabled={isSeeding}
              className="px-2.5 py-1 text-[11px] font-bold text-[#7C3AED] dark:text-purple-300 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
              title="Executar Migrations e Seeder do Firebase"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSeeding ? 'A executar migrations...' : 'Executar Migrations & Seeder'}</span>
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-slate-100 dark:border-purple-950/40 px-6 pt-3 bg-slate-50/50 dark:bg-slate-900/30">
            <button
              onClick={() => setActiveTab('post')}
              className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'post'
                  ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-300'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Novo Artigo & Multimédia</span>
            </button>

            <button
              onClick={() => setActiveTab('photo')}
              className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'photo'
                  ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-300'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Nova Fotografia para Galeria</span>
            </button>

            <button
              onClick={() => setActiveTab('manage')}
              className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'manage'
                  ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Gerir & Eliminar Artigos</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                {posts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('branding')}
              className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'branding'
                  ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-300'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              <span>Logótipo & Marca</span>
            </button>
          </div>

          {/* Success Alert Banner */}
          {successMessage && (
            <div className="m-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm font-medium animate-fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Tab 1: New Blog Post Form */}
          {activeTab === 'post' && (
            <form onSubmit={handlePostSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título do Artigo *
                </label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Ex: Como o minimalismo digital me ajudou a focar"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-900 dark:text-white"
                />
              </div>

              {/* Media Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Formato de Multimédia Principal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMediaType('image')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      mediaType === 'image'
                        ? 'border-[#7C3AED] bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Imagem</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaType('audio')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      mediaType === 'audio'
                        ? 'border-[#7C3AED] bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600'
                    }`}
                  >
                    <FileAudio className="w-3.5 h-3.5" />
                    <span>Áudio / Podcast</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      mediaType === 'video'
                        ? 'border-[#7C3AED] bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600'
                    }`}
                  >
                    <FileVideo className="w-3.5 h-3.5" />
                    <span>Vídeo / Gravação</span>
                  </button>
                </div>
              </div>

              {/* Google Drive Media Uploader & Attachment Box */}
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <HardDrive className="w-4 h-4 text-[#7C3AED]" />
                    <span>Anexo Multimédia Google Drive (Post Media)</span>
                  </div>
                  {driveFileName && (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{driveFileName}</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Upload from PC to Drive */}
                  <label className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] cursor-pointer shadow-sm transition">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{isUploadingToDrive ? `A carregar (${uploadPercent}%)...` : 'Upload p/ Google Drive'}</span>
                    <input
                      type="file"
                      accept={mediaType === 'audio' ? 'audio/*' : mediaType === 'video' ? 'video/*' : 'image/*'}
                      onChange={(e) => handleDirectDriveUpload(e, 'postMedia')}
                      disabled={isUploadingToDrive}
                      className="hidden"
                    />
                  </label>

                  {/* Pick from existing in Drive */}
                  <button
                    type="button"
                    onClick={() => {
                      setDrivePickerTarget('postMedia');
                      setIsDrivePickerOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-50 transition"
                  >
                    Navegar na Pasta do Drive
                  </button>
                </div>

                {/* Direct audio/video URL inputs if applicable */}
                {mediaType === 'audio' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      URL do Ficheiro de Áudio (preenchido automaticamente via Drive)
                    </label>
                    <input
                      type="text"
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      placeholder="https://lh3.googleusercontent.com/... ou URL externo"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-purple-950/60 rounded-xl text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                )}

                {mediaType === 'video' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      URL do Ficheiro de Vídeo (preenchido automaticamente via Drive)
                    </label>
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://lh3.googleusercontent.com/... ou URL externo"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-purple-950/60 rounded-xl text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-900 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    <option value="Inovação">Inovação</option>
                    <option value="Criatividade">Criatividade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tempo Estimado de Leitura
                  </label>
                  <input
                    type="text"
                    value={postReadTime}
                    onChange={(e) => setPostReadTime(e.target.value)}
                    placeholder="Ex: 5 min de leitura"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Resumo / Subtítulo
                </label>
                <input
                  type="text"
                  value={postExcerpt}
                  onChange={(e) => setPostExcerpt(e.target.value)}
                  placeholder="Breve frase descritiva para chamar a atenção no feed..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-900 dark:text-white"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Imagem de Capa (Presets ou Google Drive)
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {imagePresets.map((preset, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setPostCoverImage(preset.url)}
                      className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition relative ${
                        postCoverImage === preset.url
                          ? 'border-[#7C3AED] ring-2 ring-purple-300'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={postCoverImage}
                  onChange={(e) => setPostCoverImage(e.target.value)}
                  placeholder="Link direto ou URL do ficheiro no Google Drive..."
                  className="mt-2 w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl text-slate-700 dark:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Conteúdo do Artigo (suporta markdown: ### subtítulo, &gt; citação) *
                </label>
                <textarea
                  required
                  rows={6}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Escreve o teu artigo aqui com todas as tuas reflexões..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-900 dark:text-white font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={postIsFeatured}
                    onChange={(e) => setPostIsFeatured(e.target.checked)}
                    className="rounded text-[#7C3AED] focus:ring-[#7C3AED]"
                  />
                  <span>Colocar em destaque no topo do blog</span>
                </label>

                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl shadow-md transition"
                >
                  Publicar Artigo
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: New Gallery Photo Form */}
          {activeTab === 'photo' && (
            <form onSubmit={handlePhotoSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título da Fotografia *
                </label>
                <input
                  type="text"
                  required
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  placeholder="Ex: Névoa da Manhã na Floresta"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-900 dark:text-white"
                />
              </div>

              {/* Direct Upload to Google Drive for Gallery */}
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Upload direto para a pasta Gallery Photos no Google Drive</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] cursor-pointer shadow-sm transition">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{isUploadingToDrive ? 'A enviar...' : 'Enviar Fotografia do Computador'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleDirectDriveUpload(e, 'gallery')}
                      disabled={isUploadingToDrive}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setDrivePickerTarget('gallery');
                      setIsDrivePickerOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-50 transition"
                  >
                    Escolher do Google Drive
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={photoCategory}
                    onChange={(e) => setPhotoCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-900 dark:text-white"
                  >
                    <option value="Natureza">Natureza</option>
                    <option value="Viagens">Viagens</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Minimalismo">Minimalismo</option>
                    <option value="Tech">Tech</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={photoLocation}
                    onChange={(e) => setPhotoLocation(e.target.value)}
                    placeholder="Ex: Sintra, Portugal"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Legenda / Contexto
                </label>
                <textarea
                  rows={2}
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder="Breve história sobre o momento capturado..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  URL da Imagem
                </label>
                <input
                  type="text"
                  value={photoImageUrl}
                  onChange={(e) => setPhotoImageUrl(e.target.value)}
                  placeholder="Link direto ou URL do Google Drive..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl text-slate-700 dark:text-slate-300"
                />
              </div>

              {/* EXIF Data fields */}
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">
                  Parâmetros da Câmara (EXIF)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Câmara</label>
                    <input
                      type="text"
                      value={photoCamera}
                      onChange={(e) => setPhotoCamera(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Objetiva</label>
                    <input
                      type="text"
                      value={photoLens}
                      onChange={(e) => setPhotoLens(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Abertura</label>
                    <input
                      type="text"
                      value={photoAperture}
                      onChange={(e) => setPhotoAperture(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Velocidade</label>
                    <input
                      type="text"
                      value={photoShutter}
                      onChange={(e) => setPhotoShutter(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">ISO</label>
                    <input
                      type="text"
                      value={photoIso}
                      onChange={(e) => setPhotoIso(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl shadow-md transition"
                >
                  Publicar Fotografia
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: Manage & Delete Existing Posts */}
          {activeTab === 'manage' && (
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Header and Search filter */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-rose-500" />
                      <span>Gestão e Eliminação de Artigos</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Elimina artigos publicados diretamente da base de dados Firebase.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 shrink-0 self-start sm:self-auto">
                    {posts.length} {posts.length === 1 ? 'artigo' : 'artigos'} no total
                  </span>
                </div>

                {/* Search bar */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Pesquisar por título ou categoria..."
                    value={manageFilter}
                    onChange={(e) => setManageFilter(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#120f20] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
              </div>

              {/* Articles List */}
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {posts
                  .filter((p) => {
                    if (!manageFilter.trim()) return true;
                    const q = manageFilter.toLowerCase();
                    return (
                      p.title.toLowerCase().includes(q) ||
                      p.category.toLowerCase().includes(q)
                    );
                  })
                  .map((post) => (
                    <div
                      key={post.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-[#19152b] border border-slate-200/80 dark:border-purple-950/60 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-purple-800/60 transition"
                    >
                      {/* Post Thumbnail & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-[#7C3AED] dark:text-purple-300">
                              {post.category}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {post.date}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {post.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>

                      {/* Delete Action Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const confirmed = window.confirm(
                            `Tem a certeza de que deseja eliminar permanentemente o artigo:\n\n"${post.title}"?\n\nEsta ação removerá o artigo da base de dados Firebase em tempo real.`
                          );
                          if (confirmed) {
                            deletePost(post.id);
                            setSuccessMessage(`Artigo "${post.title}" eliminado com sucesso!`);
                            setTimeout(() => setSuccessMessage(null), 3000);
                          }
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 dark:bg-rose-950/50 dark:hover:bg-rose-600 border border-rose-200 dark:border-rose-900 transition flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95"
                        title="Eliminar este artigo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Eliminar</span>
                      </button>
                    </div>
                  ))}

                {posts.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#19152b] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                    Ainda não existem artigos publicados.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: BRANDING & SYSTEM LOGO */}
          {activeTab === 'branding' && (
            <div className="p-6 space-y-6">
              {/* Header explanation */}
              <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-2xl border border-purple-200 dark:border-purple-900/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-[#7C3AED] dark:text-purple-300 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Identidade Visual & Logótipo Oficial
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Defina o logótipo do sistema (upload de imagem ou ícone estilizado), nome da marca e slogan. Sincronizado em tempo real na base de dados.
                  </p>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="bg-slate-50 dark:bg-[#1f1b33] p-4 rounded-2xl border border-slate-200/80 dark:border-purple-900/40">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Pré-visualização do Cabeçalho & Rodapé
                </span>
                <div className="bg-white dark:bg-[#12101e] p-4 rounded-xl shadow-xs border border-purple-100/80 dark:border-purple-950/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {brandLogoUrl ? (
                      <img
                        src={brandLogoUrl}
                        alt={brandSiteName}
                        className="w-11 h-11 rounded-xl object-contain shadow-xs bg-white dark:bg-slate-900 p-0.5 border border-purple-100 dark:border-purple-900"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-[#7C3AED] dark:text-purple-300 shadow-sm">
                        {brandLogoPreset === 'lotus-sprout' && (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M12 2C12 2 10 7 10 10C10 11.66 11.34 13 13 13C14.66 13 16 11.66 16 10C16 7 12 2 12 2Z" />
                            <path d="M8.5 7.5C8.5 7.5 5 10 5 13C5 15.21 6.79 17 9 17C10.15 17 11.19 16.52 11.92 15.74C11.35 14.9 11 13.9 11 12.8C11 10.6 12.5 8.7 8.5 7.5Z" opacity="0.85" />
                            <path d="M15.5 7.5C11.5 8.7 13 10.6 13 12.8C13 13.9 12.65 14.9 12.08 15.74C12.81 16.52 13.85 17 15 17C17.21 17 19 15.21 19 13C19 10 15.5 7.5 15.5 7.5Z" opacity="0.85" />
                            <path d="M11 16C11 18 10 21 7 22C10 22 13 20 13 16H11Z" opacity="0.6" />
                          </svg>
                        )}
                        {brandLogoPreset === 'modern-l' && (
                          <span className="text-2xl font-black">L</span>
                        )}
                        {brandLogoPreset === 'minimal-circle' && (
                          <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-current" />
                          </div>
                        )}
                        {brandLogoPreset === 'geometric-prism' && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                            <polygon points="12 2 2 22 22 22" />
                            <line x1="12" y1="2" x2="12" y2="22" />
                          </svg>
                        )}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                          {brandSiteName || 'Lume'}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {brandTagline || 'O espaço das boas ideias'}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg">
                    {brandLogoUrl ? 'Logótipo Personalizado' : 'Ícone SVG'}
                  </span>
                </div>
              </div>

              {/* Site Name and Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Nome da Plataforma
                  </label>
                  <input
                    type="text"
                    value={brandSiteName}
                    onChange={(e) => setBrandSiteName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#12101e] border border-slate-200 dark:border-purple-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Slogan / Subtítulo
                  </label>
                  <input
                    type="text"
                    value={brandTagline}
                    onChange={(e) => setBrandTagline(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#12101e] border border-slate-200 dark:border-purple-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Logo Upload & URL Options */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Ficheiro de Imagem do Logótipo
                </label>

                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-xl border border-purple-200 dark:border-purple-800 transition">
                    <UploadCloud className="w-4 h-4 text-[#7C3AED]" />
                    <span>Carregar Logótipo do Computador (PNG, SVG, WebP)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) {
                          alert('Ficheiro inválido. Selecione uma imagem.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const res = ev.target?.result as string;
                          if (res) {
                            setBrandLogoUrl(res);
                            setSuccessMessage('Logótipo carregado!');
                            setTimeout(() => setSuccessMessage(null), 2500);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>

                  {isDriveConnected && (
                    <button
                      type="button"
                      onClick={() => {
                        setDrivePickerTarget('postMedia');
                        setIsDrivePickerOpen(true);
                      }}
                      className="px-4 py-3 bg-white dark:bg-[#12101e] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-purple-900/50 transition flex items-center justify-center gap-2"
                    >
                      <HardDrive className="w-4 h-4 text-[#7C3AED]" />
                      <span>Google Drive</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Ou insira o URL direto do logótipo:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={brandLogoUrl}
                      onChange={(e) => setBrandLogoUrl(e.target.value)}
                      placeholder="https://exemplo.com/logotipo.png"
                      className="flex-1 px-3.5 py-2 text-sm bg-white dark:bg-[#12101e] border border-slate-200 dark:border-purple-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                    />
                    {brandLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setBrandLogoUrl('')}
                        className="px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Ou selecione um Estilo de Ícone Oficial:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setBrandLogoPreset('lotus-sprout');
                      setBrandLogoUrl('');
                    }}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition ${
                      brandLogoPreset === 'lotus-sprout' && !brandLogoUrl
                        ? 'border-[#7C3AED] bg-purple-50 dark:bg-purple-950/60 ring-2 ring-purple-300'
                        : 'border-slate-200 dark:border-purple-950/60 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-[#7C3AED]">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12 2C12 2 10 7 10 10C10 11.66 11.34 13 13 13C14.66 13 16 11.66 16 10C16 7 12 2 12 2Z" />
                        <path d="M8.5 7.5C8.5 7.5 5 10 5 13C5 15.21 6.79 17 9 17C10.15 17 11.19 16.52 11.92 15.74C11.35 14.9 11 13.9 11 12.8C11 10.6 12.5 8.7 8.5 7.5Z" opacity="0.85" />
                        <path d="M15.5 7.5C11.5 8.7 13 10.6 13 12.8C13 13.9 12.65 14.9 12.08 15.74C12.81 16.52 13.85 17 15 17C17.21 17 19 15.21 19 13C19 10 15.5 7.5 15.5 7.5Z" opacity="0.85" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold">Botânico</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBrandLogoPreset('modern-l');
                      setBrandLogoUrl('');
                    }}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition ${
                      brandLogoPreset === 'modern-l' && !brandLogoUrl
                        ? 'border-[#7C3AED] bg-purple-50 dark:bg-purple-950/60 ring-2 ring-purple-300'
                        : 'border-slate-200 dark:border-purple-950/60 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-[#7C3AED] font-black text-xl">
                      L
                    </div>
                    <span className="text-[11px] font-bold">Monograma L</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBrandLogoPreset('minimal-circle');
                      setBrandLogoUrl('');
                    }}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition ${
                      brandLogoPreset === 'minimal-circle' && !brandLogoUrl
                        ? 'border-[#7C3AED] bg-purple-50 dark:bg-purple-950/60 ring-2 ring-purple-300'
                        : 'border-slate-200 dark:border-purple-950/60 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-[#7C3AED]">
                      <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      </div>
                    </div>
                    <span className="text-[11px] font-bold">Minimal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBrandLogoPreset('geometric-prism');
                      setBrandLogoUrl('');
                    }}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition ${
                      brandLogoPreset === 'geometric-prism' && !brandLogoUrl
                        ? 'border-[#7C3AED] bg-purple-50 dark:bg-purple-950/60 ring-2 ring-purple-300'
                        : 'border-slate-200 dark:border-purple-950/60 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-[#7C3AED]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                        <polygon points="12 2 2 22 22 22" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold">Prisma</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-purple-950/40 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Repor o logótipo e a marca padrão?')) {
                      resetBrandingToDefault();
                      setBrandSiteName('Lume');
                      setBrandTagline('O espaço das boas ideias');
                      setBrandLogoUrl('');
                      setBrandLogoPreset('lotus-sprout');
                      setSuccessMessage('Identidade reposta para padrão!');
                      setTimeout(() => setSuccessMessage(null), 2500);
                    }
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Repor Padrão</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateBranding({
                      siteName: brandSiteName.trim() || 'Lume',
                      tagline: brandTagline.trim() || 'O espaço das boas ideias',
                      logoUrl: brandLogoUrl.trim(),
                      logoPreset: brandLogoPreset,
                    });
                    setSuccessMessage('Logótipo e marca guardados com sucesso no Firebase!');
                    setTimeout(() => setSuccessMessage(null), 3000);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Identidade do Sistema</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Google Drive Media Explorer */}
      <DriveMediaModal
        isOpen={isDrivePickerOpen}
        onClose={() => setIsDrivePickerOpen(false)}
        folderType={drivePickerTarget === 'gallery' ? 'gallery' : 'posts'}
        onSelectMedia={handleSelectFromDrive}
        title={
          drivePickerTarget === 'gallery'
            ? 'Escolher Foto da Pasta Gallery Photos'
            : 'Escolher Ficheiro Multimédia (Post Media)'
        }
      />
    </>
  );
};
