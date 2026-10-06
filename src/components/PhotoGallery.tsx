import React, { useState } from 'react';
import {
  Camera,
  MapPin,
  Heart,
  Maximize2,
  X,
  Sliders,
  Calendar,
  Share2,
  Check,
  Plus
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { Photo } from '../types';

interface PhotoGalleryProps {
  onOpenAdminPhoto: () => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ onOpenAdminPhoto }) => {
  const { gallery, likePhoto, isAdmin } = useBlog();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [copiedShare, setCopiedShare] = useState(false);

  const categories = ['Todos', 'Natureza', 'Lifestyle', 'Viagens', 'Minimalismo', 'Tech'];

  const filteredPhotos = activeCategory === 'Todos'
    ? gallery
    : gallery.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());

  const handleSharePhoto = (photo: Photo) => {
    if (navigator.share) {
      navigator.share({
        title: photo.title,
        text: photo.caption,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="py-6 animate-fade-in">
      {/* Gallery Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold text-[#7C3AED] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>Galeria Integrada</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Perspetivas Visuais
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Fotografias capturadas em viagens, estúdio e momentos de observação atenta.
          </p>
        </div>

        {/* Admin Quick Publish Photo Action */}
        {isAdmin && (
          <button
            onClick={onOpenAdminPhoto}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Foto</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills (Functional Buttons) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#7C3AED] text-white shadow-sm'
                  : 'bg-white dark:bg-[#171426] text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 border border-slate-200 dark:border-purple-950/40'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid of Photos or Clean Empty State */}
      {filteredPhotos.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-[#161324] rounded-3xl border border-dashed border-purple-200 dark:border-purple-950/60 p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 mx-auto flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
              Nenhuma fotografia encontrada
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {activeCategory !== 'Todos'
                ? `Não há fotografias na categoria "${activeCategory}".`
                : 'A galeria está vazia. Adiciona novas capturas fotográficas com detalhes EXIF.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {activeCategory !== 'Todos' && (
              <button
                onClick={() => setActiveCategory('Todos')}
                className="px-4 py-2 text-xs font-semibold text-[#7C3AED] bg-purple-50 dark:bg-purple-950/60 rounded-xl hover:bg-purple-100 transition"
              >
                Ver todas as categorias
              </button>
            )}
            {isAdmin && (
              <button
                onClick={onOpenAdminPhoto}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl shadow-sm transition"
              >
                Adicionar Fotografia
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-900 aspect-[4/3] shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <img
                src={photo.imageUrl}
                alt={photo.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              />

              {/* Gradient Scrim on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <span className="text-[11px] font-semibold tracking-wider text-purple-300 uppercase">
                  {photo.category}
                </span>
                <h3 className="text-white font-bold text-base mt-1 line-clamp-1">
                  {photo.title}
                </h3>
                <p className="text-white/80 text-xs mt-1 line-clamp-1">
                  {photo.caption}
                </p>

                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-purple-400" />
                    {photo.location}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-current text-rose-400" />
                      {photo.likes}
                    </span>
                    <Maximize2 className="w-3.5 h-3.5 text-white/90" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal with EXIF Data */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#151224] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-purple-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition"
              aria-label="Fechar visualizador"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo Preview Pane */}
            <div className="md:w-3/5 bg-black flex items-center justify-center relative min-h-[300px]">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                referrerPolicy="no-referrer"
                className="w-full h-full max-h-[70vh] md:max-h-[85vh] object-contain"
              />
            </div>

            {/* Photo Details & EXIF Pane */}
            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-md text-xs font-bold text-[#7C3AED] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60">
                    {selectedPhoto.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedPhoto.date}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {selectedPhoto.title}
                </h3>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedPhoto.caption}
                </p>

                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>{selectedPhoto.location}</span>
                </div>

                {/* Technical EXIF Metadata Section */}
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-purple-950/40">
                  <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Sliders className="w-3.5 h-3.5 text-purple-600" />
                    <span>Dados Técnicos (EXIF)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Câmara</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                        {selectedPhoto.exif.camera}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Objetiva</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                        {selectedPhoto.exif.lens}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Abertura</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {selectedPhoto.exif.aperture}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Obturador</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {selectedPhoto.exif.shutterSpeed}
                      </span>
                    </div>

                    <div className="col-span-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Sensibilidade</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        ISO {selectedPhoto.exif.iso}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-purple-950/40 flex items-center justify-between">
                <button
                  onClick={() => likePhoto(selectedPhoto.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    selectedPhoto.isLiked
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${selectedPhoto.isLiked ? 'fill-current text-rose-500' : ''}`} />
                  <span>{selectedPhoto.likes}</span>
                </button>

                <button
                  onClick={() => handleSharePhoto(selectedPhoto)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-50 hover:text-[#7C3AED] transition"
                >
                  {copiedShare ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Partilhar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
