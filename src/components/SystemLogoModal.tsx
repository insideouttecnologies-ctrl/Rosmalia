import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  HardDrive,
  Eye,
  Sliders,
  Type
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { SystemBranding } from '../types';

interface SystemLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDrive?: () => void;
}

export const SystemLogoModal: React.FC<SystemLogoModalProps> = ({
  isOpen,
  onClose,
  onOpenDrive,
}) => {
  const {
    branding,
    updateBranding,
    resetBrandingToDefault,
    isDriveConnected,
    isAdmin,
  } = useBlog();

  const [siteName, setSiteName] = useState(branding?.siteName || 'Lume');
  const [tagline, setTagline] = useState(branding?.tagline || 'O espaço das boas ideias');
  const [logoUrl, setLogoUrl] = useState(branding?.logoUrl || '');
  const [logoPreset, setLogoPreset] = useState<'lotus-sprout' | 'modern-l' | 'minimal-circle' | 'geometric-prism'>(
    branding?.logoPreset || 'lotus-sprout'
  );
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecione um ficheiro de imagem válido (PNG, SVG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem é demasiado grande. Por favor escolha uma imagem até 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setLogoUrl(dataUrl);
        setFeedbackMsg('Imagem carregada com sucesso! Clique em "Guardar" para publicar.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSave = () => {
    updateBranding({
      siteName: siteName.trim() || 'Lume',
      tagline: tagline.trim() || 'O espaço das boas ideias',
      logoUrl: logoUrl.trim(),
      logoPreset,
    });

    setFeedbackMsg('Logótipo e identidade do sistema guardados com sucesso!');
    setTimeout(() => {
      setFeedbackMsg(null);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    if (window.confirm('Tem a certeza que deseja repor o logótipo e identidade padrão?')) {
      resetBrandingToDefault();
      setSiteName('Lume');
      setTagline('O espaço das boas ideias');
      setLogoUrl('');
      setLogoPreset('lotus-sprout');
      setFeedbackMsg('Identidade reposta para os valores de fábrica!');
      setTimeout(() => setFeedbackMsg(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#161324] rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-900/50 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-purple-950/40 flex items-center justify-between bg-slate-50/50 dark:bg-purple-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-[#7C3AED] dark:text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Logótipo & Marca do Sistema
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalize o logótipo, nome da plataforma e slogan em tempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {feedbackMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold rounded-2xl flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Live Preview Card */}
          <div className="bg-slate-50 dark:bg-[#1f1b33] p-4 rounded-2xl border border-slate-200/80 dark:border-purple-900/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
              Pré-visualização ao Vivo do Cabeçalho
            </span>
            <div className="bg-white dark:bg-[#12101e] p-4 rounded-xl shadow-xs border border-purple-100/80 dark:border-purple-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={siteName}
                    className="w-11 h-11 rounded-xl object-contain shadow-xs bg-white dark:bg-slate-900 p-0.5 border border-purple-100 dark:border-purple-900"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-[#7C3AED] dark:text-purple-300 shadow-sm">
                    {logoPreset === 'lotus-sprout' && (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M12 2C12 2 10 7 10 10C10 11.66 11.34 13 13 13C14.66 13 16 11.66 16 10C16 7 12 2 12 2Z" />
                        <path d="M8.5 7.5C8.5 7.5 5 10 5 13C5 15.21 6.79 17 9 17C10.15 17 11.19 16.52 11.92 15.74C11.35 14.9 11 13.9 11 12.8C11 10.6 12.5 8.7 8.5 7.5Z" opacity="0.85" />
                        <path d="M15.5 7.5C11.5 8.7 13 10.6 13 12.8C13 13.9 12.65 14.9 12.08 15.74C12.81 16.52 13.85 17 15 17C17.21 17 19 15.21 19 13C19 10 15.5 7.5 15.5 7.5Z" opacity="0.85" />
                        <path d="M11 16C11 18 10 21 7 22C10 22 13 20 13 16H11Z" opacity="0.6" />
                      </svg>
                    )}
                    {logoPreset === 'modern-l' && (
                      <span className="text-2xl font-black tracking-tighter text-[#7C3AED] dark:text-purple-300">
                        L
                      </span>
                    )}
                    {logoPreset === 'minimal-circle' && (
                      <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-current" />
                      </div>
                    )}
                    {logoPreset === 'geometric-prism' && (
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
                      {siteName || 'Lume'}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {tagline || 'O espaço das boas ideias'}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-1 rounded-md">
                {logoUrl ? 'Logótipo Personalizado' : 'Ícone SVG'}
              </span>
            </div>
          </div>

          {/* Form Fields: Name & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Nome do Sistema / Plataforma
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Ex: Lume"
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#12101e] border border-slate-200 dark:border-purple-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Slogan / Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Ex: O espaço das boas ideias"
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#12101e] border border-slate-200 dark:border-purple-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Logo Source Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Escolher Origem do Logótipo
            </label>
            <div className="flex border-b border-slate-200 dark:border-purple-950 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-1.5 pb-2 px-3 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'upload'
                    ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Carregar Ficheiro</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex items-center gap-1.5 pb-2 px-3 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'url'
                    ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Endereço URL</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`flex items-center gap-1.5 pb-2 px-3 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'presets'
                    ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ícones Predefinidos</span>
              </button>
            </div>

            {/* Tab 1: Upload */}
            {activeTab === 'upload' && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                    isDragging
                      ? 'border-[#7C3AED] bg-purple-50/50 dark:bg-purple-950/30'
                      : 'border-slate-300 dark:border-purple-900/60 hover:border-purple-400 bg-slate-50/50 dark:bg-purple-950/10'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-[#7C3AED] dark:text-purple-300 mb-2">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Clique para selecionar ou arraste o logótipo aqui
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Formatos suportados: PNG transparente, SVG, WebP ou JPG (máx. 5MB)
                  </p>
                </div>

                {logoUrl && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Logótipo personalizado carregado
                    </span>
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Remover logótipo e usar ícone
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: URL */}
            {activeTab === 'url' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://exemplo.com/meu-logotipo.png"
                    className="flex-1 px-3.5 py-2 text-sm bg-white dark:bg-[#12101e] border border-slate-200 dark:border-purple-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {onOpenDrive && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDrive();
                    }}
                    className="w-full py-2.5 px-3 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 border border-purple-200 dark:border-purple-800 transition"
                  >
                    <HardDrive className="w-4 h-4 text-[#7C3AED]" />
                    <span>Selecionar do Google Drive Media</span>
                  </button>
                )}
              </div>
            )}

            {/* Tab 3: Presets */}
            {activeTab === 'presets' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Preset 1 */}
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreset('lotus-sprout');
                      setLogoUrl('');
                    }}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition ${
                      logoPreset === 'lotus-sprout' && !logoUrl
                        ? 'border-[#7C3AED] bg-purple-50 dark:bg-purple-950/60 ring-2 ring-purple-300'
                        : 'border-slate-200 dark:border-purple-950/60 hover:bg-slate-50 dark:hover:bg-purple-950/20'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-[#7C3AED] dark:text-purple-300">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M12 2C12 2 10 7 10 10C10 11.66 11.34 13 13 13C14.66 13 16 11.66 16 10C16 7 12 2 12 2Z" />
                        <path d="M8.5 7.5C8.5 7.5 5 10 5 13C5 15.21 6.79 17 9 17C10.15 17 11.19 16.52 11.92 15.74C11.35 14.9 11 13.9 11 12.8C11 10.6 12.5 8.7 8.5 7.5Z" opacity="0.85" />
                        <path d="M15.5 7.5C11.5 8.7 13 10.6 13 12.8C13 13.9 12.65 14.9 12.08 15.74C12.81 16.52 13.85 17 15 17C17.21 17 19 15.21 19 13C19 10 15.5 7.5 15.5 7.5Z" opacity="0.85" />
                        <path d="M11 16C11 18 10 21 7 22C10 22 13 20 13 16H11Z" opacity="0.6" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      Botânico / Flor
                    </span>
                  </button>

                  {/* Preset 2 */}
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreset('modern-l');
                      setLogoUrl('');
                    }}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition ${
                      logoPreset === 'modern-l' && !logoUrl
                        ? 'border-[#7C3AED] bg-purple-50 dark:bg-purple-950/60 ring-2 ring-purple-300'
                        : 'border-slate-200 dark:border-purple-950/60 hover:bg-slate-50 dark:hover:bg-purple-950/20'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-[#7C3AED] dark:text-purple-300">
                      <span className="text-2xl font-black">L</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      Monograma L
                    </span>
                  </button>

                  {/* Preset 3 */}
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreset('minimal-circle');
                      setLogoUrl('');
                    }}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition ${
                      logoPreset === 'minimal-circle' && !logoUrl
                        ? 'border-[#7C3AED] bg-purple-50 dark:bg-purple-950/60 ring-2 ring-purple-300'
                        : 'border-slate-200 dark:border-purple-950/60 hover:bg-slate-50 dark:hover:bg-purple-950/20'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-[#7C3AED] dark:text-purple-300">
                      <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-current" />
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      Minimal Círculo
                    </span>
                  </button>

                  {/* Preset 4 */}
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreset('geometric-prism');
                      setLogoUrl('');
                    }}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition ${
                      logoPreset === 'geometric-prism' && !logoUrl
                        ? 'border-[#7C3AED] bg-purple-50 dark:bg-purple-950/60 ring-2 ring-purple-300'
                        : 'border-slate-200 dark:border-purple-950/60 hover:bg-slate-50 dark:hover:bg-purple-950/20'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-[#7C3AED] dark:text-purple-300">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                        <polygon points="12 2 2 22 22 22" />
                        <line x1="12" y1="2" x2="12" y2="22" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      Prisma Delta
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-purple-950/40 bg-slate-50/50 dark:bg-purple-950/20 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Repor Padrão</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Alterações</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
