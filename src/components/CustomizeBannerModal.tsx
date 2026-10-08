import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sliders,
  Image as ImageIcon,
  Sparkles,
  Link as LinkIcon,
  Check,
  RotateCcw,
  Upload,
  HardDrive
} from 'lucide-react';
import { BannerItem, ViewMode } from '../types';
import { useBlog } from '../context/BlogContext';
import { normalizeDriveImageUrl } from '../services/googleDrive';

interface CustomizeBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomizeBannerModal: React.FC<CustomizeBannerModalProps> = ({ isOpen, onClose }) => {
  const { bannerItems, updateBannerItems, resetBannerToDefault, posts, isDriveConnected, connectGoogleDrive, uploadMediaToDrive } = useBlog();

  const [items, setItems] = useState<BannerItem[]>(() => {
    return JSON.parse(JSON.stringify(bannerItems.slice(0, 3)));
  });
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync with prop when opened
  React.useEffect(() => {
    if (isOpen) {
      setItems(JSON.parse(JSON.stringify(bannerItems.slice(0, 3))));
      setSelectedIdx(0);
      setSaveSuccess(false);
    }
  }, [isOpen, bannerItems]);

  if (!isOpen) return null;

  const currentItem = items[selectedIdx] || items[0];

  const handleUpdateCurrent = (field: keyof BannerItem, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      if (!copy[selectedIdx]) return prev;
      let finalVal = value;
      if (field === 'imageUrl') {
        finalVal = normalizeDriveImageUrl(value);
      }
      copy[selectedIdx] = { ...copy[selectedIdx], [field]: finalVal };
      return copy;
    });
  };

  const handleAddItem = () => {
    if (items.length >= 3) return;
    const newItem: BannerItem = {
      id: `banner-${Date.now()}`,
      title: 'Novo Destaque Personalizado',
      subtitle: 'Adicione uma breve descrição para inspirar os leitores.',
      badge: 'Destaque',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Ver Artigo',
      ctaLink: 'articles',
      active: true,
    };
    const next = [...items, newItem];
    setItems(next);
    setSelectedIdx(next.length - 1);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('O banner principal deve conter pelo menos 1 item.');
      return;
    }
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    setSelectedIdx(Math.max(0, index - 1));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      if (isDriveConnected) {
        // Upload to Drive and set public permission
        const driveMedia = await uploadMediaToDrive(file, 'posts');
        handleUpdateCurrent('imageUrl', driveMedia.directUrl);
      } else {
        // Read as local Data URL / optimized image
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            handleUpdateCurrent('imageUrl', ev.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      alert(`Falha no upload da imagem: ${err.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = () => {
    updateBannerItems(items);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    if (confirm('Deseja repor os banners padrão sugeridos pelo sistema?')) {
      resetBannerToDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#161324] rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-900/50 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-purple-950/60 bg-slate-50/50 dark:bg-[#1c182d]/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Personalizar Banner Principal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure até 3 destaques no carrossel de entrada (fotos, títulos e links).
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

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Top Item Selector Tabs (Max 3) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-purple-950/40">
            <div className="flex items-center gap-2">
              {items.map((item, idx) => (
                <button
                  key={item.id || idx}
                  onClick={() => setSelectedIdx(idx)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                    selectedIdx === idx
                      ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-950/30'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                  }`}
                >
                  <span>Destaque {idx + 1}</span>
                  <span className="text-[11px] opacity-75 max-w-[100px] truncate hidden sm:inline">
                    ({item.badge || item.title})
                  </span>
                </button>
              ))}

              {items.length < 3 && (
                <button
                  onClick={handleAddItem}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-[#7C3AED] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 transition border border-dashed border-purple-300 dark:border-purple-800 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar ({items.length}/3)</span>
                </button>
              )}
            </div>

            {items.length > 1 && (
              <button
                onClick={() => handleRemoveItem(selectedIdx)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1"
                title="Remover este item do banner"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Item</span>
              </button>
            )}
          </div>

          {/* Edit Form for currentItem */}
          {currentItem && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-7 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Título Principal
                  </label>
                  <input
                    type="text"
                    value={currentItem.title}
                    onChange={(e) => handleUpdateCurrent('title', e.target.value)}
                    placeholder="Ex: O espaço das boas ideias e multimédia"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-purple-950/60 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>

                {/* Subtitle / Excerpt */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Subtítulo / Descrição Curta
                  </label>
                  <textarea
                    rows={2}
                    value={currentItem.subtitle}
                    onChange={(e) => handleUpdateCurrent('subtitle', e.target.value)}
                    placeholder="Ex: Reflexões sobre hábitos, clareza mental e tecnologia."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-purple-950/60 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>

                {/* Badge / Category and Author */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Etiqueta / Badge
                    </label>
                    <input
                      type="text"
                      value={currentItem.badge}
                      onChange={(e) => handleUpdateCurrent('badge', e.target.value)}
                      placeholder="Ex: Editorial Lume"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-purple-950/60 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Texto do Botão (CTA)
                    </label>
                    <input
                      type="text"
                      value={currentItem.ctaText}
                      onChange={(e) => handleUpdateCurrent('ctaText', e.target.value)}
                      placeholder="Ex: Ler artigo, Explorar"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-purple-950/60 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                    />
                  </div>
                </div>

                {/* Link Target / Destination */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Destino do Botão
                  </label>
                  <div className="space-y-2">
                    <select
                      value={currentItem.ctaLink || 'articles'}
                      onChange={(e) => handleUpdateCurrent('ctaLink', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-purple-950/60 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                    >
                      <option value="articles">Página de Artigos (Geral)</option>
                      <option value="gallery">Galeria de Fotos</option>
                      <option value="about">Página Sobre</option>
                      <option value="contact">Página de Contato</option>
                      {posts.length > 0 && (
                        <optgroup label="Artigos Específicos Publicados">
                          {posts.map((p) => (
                            <option key={p.id} value={`post:${p.id}`}>
                              Artigo: {p.title}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                </div>

                {/* Image URL & Drive Support */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Imagem de Fundo (URL ou Google Drive)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentItem.imageUrl}
                      onChange={(e) => handleUpdateCurrent('imageUrl', e.target.value)}
                      placeholder="https://... ou link do Google Drive"
                      className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-purple-950/60 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                    />
                    <label
                      className="px-3 py-2.5 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl cursor-pointer flex items-center gap-1.5 transition shrink-0"
                      title="Carregar foto local ou para o Drive"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'A carregar...' : 'Ficheiro'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Pode colar links diretos do Unsplash, Google Drive (ex: drive.google.com/file/d/...) ou fazer upload de uma imagem do seu dispositivo.
                  </p>
                </div>
              </div>

              {/* Right Column: Live Mini Preview */}
              <div className="lg:col-span-5 space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Pré-visualização do Slide {selectedIdx + 1}
                </label>
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-lg border border-purple-500/20 bg-slate-950 flex flex-col justify-between p-4 text-white">
                  {/* Background Image */}
                  <img
                    src={currentItem.imageUrl}
                    alt={currentItem.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80';
                    }}
                  />
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Preview Top Badge */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#7C3AED]/90 text-white">
                      {currentItem.badge || 'Destaque'}
                    </span>
                    <span className="text-[10px] text-white/70 bg-black/40 px-2 py-0.5 rounded-md">
                      {selectedIdx + 1} de {items.length}
                    </span>
                  </div>

                  {/* Preview Content */}
                  <div className="relative z-10">
                    <h4 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-tight">
                      {currentItem.title || 'Título do Destaque'}
                    </h4>
                    <p className="text-[11px] text-purple-200/90 mt-1 line-clamp-2">
                      {currentItem.subtitle || 'Subtítulo descritivo.'}
                    </p>
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-[#8B5CF6] text-white">
                        {currentItem.ctaText || 'Ler mais'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-950/60 text-xs text-purple-800 dark:text-purple-300">
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Transição Automática</span>
                  </div>
                  O banner alterna automaticamente entre os {items.length} itens configurados com animação fluida de transição.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-slate-100 dark:border-purple-950/60 bg-slate-50/50 dark:bg-[#1c182d]/50">
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Repor Padrão</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] rounded-xl shadow-md transition flex items-center gap-2 active:scale-[0.98]"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Guardado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Guardar Alterações ({items.length} itens)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
