import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Camera,
  Check,
  AlertCircle,
  Image as ImageIcon,
  User,
  RotateCcw
} from 'lucide-react';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  userName: string;
  onSaveAvatar: (newAvatarUrl: string) => Promise<void> | void;
}

const PRESET_AVATARS = [
  {
    label: 'Mariana (Executiva Jovem)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Profissional com Óculos',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Estudante Académica',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Consultora de Negócios',
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Liderança Jovem',
    url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Gestora de Projetos',
    url: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Apresentação & Pitch',
    url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Foco & Estratégia',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Inovação & Tech',
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Colega de Equipa',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Mentor / Docente',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Empreendedor',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
];

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  userName,
  onSaveAvatar,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar || '');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Process and compress uploaded image to a fast, clean data URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecione um ficheiro de imagem válido (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Draw to canvas with max dimension of 512px for optimal balance of sharpness and storage
        const canvas = document.createElement('canvas');
        const maxDim = 512;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setPreviewUrl(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setUrlError('Por favor insira um link de imagem válido.');
      return;
    }

    // Test load
    const img = new Image();
    img.onload = () => {
      setPreviewUrl(trimmed);
      setUrlError(null);
    };
    img.onerror = () => {
      setUrlError('Não foi possível carregar a imagem deste URL. Verifique o link.');
    };
    img.src = trimmed;
  };

  const handleSave = async () => {
    if (!previewUrl) return;
    setIsSaving(true);
    try {
      await onSaveAvatar(previewUrl);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      alert(`Falha ao guardar a foto de perfil: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#161324] rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-900/50 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-purple-950/60 bg-slate-50/50 dark:bg-[#1c182d]/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Alterar Foto de Perfil
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personaliza a tua imagem para o blog, currículo e chamadas em direto.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Circular Preview Badge */}
        <div className="py-6 px-6 bg-gradient-to-b from-purple-50/40 to-transparent dark:from-purple-950/20 text-center border-b border-purple-100/50 dark:border-purple-950/30 flex items-center justify-center gap-6">
          <div className="relative">
            <img
              src={previewUrl || currentAvatar}
              alt={userName}
              referrerPolicy="no-referrer"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-[#7C3AED] shadow-xl mx-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80';
              }}
            />
            <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-white dark:ring-[#161324]">
              <Check className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="text-left space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Pré-visualização
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {userName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Atualiza em tempo real no cabeçalho e currículo.
            </p>
            {previewUrl !== currentAvatar && (
              <button
                type="button"
                onClick={() => setPreviewUrl(currentAvatar)}
                className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 pt-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar foto original</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 flex items-center gap-2 border-b border-slate-100 dark:border-purple-950/40">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Ficheiro do Dispositivo</span>
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Avatares Sugeridos</span>
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'url'
                ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Link / URL</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* TAB 1: File Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-4 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-purple-300 dark:border-purple-800/60 rounded-3xl bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/50 dark:hover:bg-purple-950/40 cursor-pointer transition flex flex-col items-center justify-center gap-3 group"
              >
                <div className="p-4 rounded-2xl bg-white dark:bg-[#1f1b34] text-[#7C3AED] dark:text-purple-300 shadow-sm group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Clica para carregar uma foto do teu telemóvel ou computador
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Formatos suportados: JPG, PNG, WEBP, GIF (Redimensionado e otimizado automaticamente)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Escolhe um avatar profissional:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-56 overflow-y-auto p-1">
                {PRESET_AVATARS.map((avatar, idx) => {
                  const isSelected = previewUrl === avatar.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewUrl(avatar.url)}
                      className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-transform hover:scale-105 ${
                        isSelected
                          ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]'
                          : 'border-transparent hover:border-purple-300'
                      }`}
                      title={avatar.label}
                    >
                      <img
                        src={avatar.url}
                        alt={avatar.label}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#7C3AED]/40 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Insere o link público da imagem:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                    setUrlError(null);
                  }}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#7C3AED] dark:text-purple-300 hover:bg-purple-200 font-bold text-xs transition shrink-0"
                >
                  Testar
                </button>
              </div>

              {urlError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{urlError}</span>
                </p>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 mt-4 border-t border-slate-100 dark:border-purple-950/60">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || previewUrl === currentAvatar}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Foto Guardada!</span>
                </>
              ) : isSaving ? (
                <span>A Guardar...</span>
              ) : (
                <span>Guardar Nova Foto</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
