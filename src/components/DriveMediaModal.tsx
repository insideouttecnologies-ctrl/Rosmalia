import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  FileImage,
  FileAudio,
  FileVideo,
  Folder,
  Trash2,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  HardDrive,
  LogIn,
  LogOut,
  Play,
  Check
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { DriveMediaFile } from '../services/googleDrive';

interface DriveMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderType?: 'profiles' | 'posts' | 'gallery';
  onSelectMedia?: (media: DriveMediaFile) => void;
  title?: string;
  acceptType?: string; // 'image/*' | 'audio/*' | 'video/*' | '*'
}

export const DriveMediaModal: React.FC<DriveMediaModalProps> = ({
  isOpen,
  onClose,
  folderType = 'posts',
  onSelectMedia,
  title = 'Gestor Google Drive - Lume Media',
  acceptType = '*/*',
}) => {
  const {
    googleUser,
    isDriveConnected,
    connectGoogleDrive,
    disconnectDrive,
    uploadMediaToDrive,
    driveMediaFiles,
    fetchDriveFiles,
    deleteDriveMedia,
  } = useBlog();

  const [activeFolder, setActiveFolder] = useState<'posts' | 'profiles' | 'gallery'>(folderType);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && isDriveConnected) {
      fetchDriveFiles(activeFolder);
    }
  }, [isOpen, isDriveConnected, activeFolder]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const uploaded = await uploadMediaToDrive(file, activeFolder, (p) => {
        setUploadProgress(p);
      });

      setStatusMessage(`"${file.name}" carregado com sucesso para a pasta do Google Drive!`);
      setTimeout(() => setStatusMessage(null), 3500);

      if (onSelectMedia) {
        onSelectMedia(uploaded);
      }
    } catch (err: any) {
      alert(`Erro no upload: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleDelete = async (file: DriveMediaFile, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await deleteDriveMedia(file.id, file.name);
    if (ok) {
      setStatusMessage('Ficheiro eliminado do Google Drive.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const getMediaIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <FileImage className="w-5 h-5 text-purple-600" />;
    }
    if (mimeType.startsWith('audio/')) {
      return <FileAudio className="w-5 h-5 text-emerald-600" />;
    }
    if (mimeType.startsWith('video/')) {
      return <FileVideo className="w-5 h-5 text-rose-600" />;
    }
    return <Folder className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#161324] rounded-3xl shadow-2xl border border-purple-500/20 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-purple-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Armazenamento de imagens, áudios e vídeos diretamente na tua conta Google
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Account Connection Status Bar */}
        <div className="px-6 py-3 bg-purple-50/60 dark:bg-purple-950/40 border-b border-purple-100 dark:border-purple-900/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Conta Google Drive:
            </span>
            {isDriveConnected ? (
              <span className="px-2.5 py-0.5 rounded-full font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{googleUser?.email || 'Conectado'}</span>
              </span>
            ) : (
              <span className="text-slate-500 italic">Nenhuma conta associada</span>
            )}
          </div>

          <div>
            {isDriveConnected ? (
              <button
                onClick={disconnectDrive}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Desconectar</span>
              </button>
            ) : (
              <button
                onClick={() => connectGoogleDrive()}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Conectar Conta Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Dedicated Folder Selector */}
        <div className="flex border-b border-slate-100 dark:border-purple-950/40 px-6 pt-3 bg-slate-50/50 dark:bg-slate-900/30 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveFolder('posts')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeFolder === 'posts'
                ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-300'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Post Media (Imagens, Áudio, Vídeo)</span>
          </button>

          <button
            onClick={() => setActiveFolder('profiles')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeFolder === 'profiles'
                ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-300'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Profile Pictures</span>
          </button>

          <button
            onClick={() => setActiveFolder('gallery')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeFolder === 'gallery'
                ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-300'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Gallery Photos</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Status Alert */}
          {statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Upload Drop Zone */}
          <div className="p-6 rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 text-center relative hover:bg-purple-50/60 transition">
            <UploadCloud className="w-10 h-10 mx-auto text-[#7C3AED] dark:text-purple-400 mb-2" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Fazer upload de novo ficheiro para esta pasta
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Suporta imagens (PNG, JPG, WebP), áudio (MP3, WAV) e vídeos (MP4, WebM) com armazenamento seguro no Google Drive.
            </p>

            <input
              type="file"
              accept={acceptType}
              onChange={handleFileUpload}
              disabled={isUploading || !isDriveConnected}
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />

            {isUploading && (
              <div className="mt-4 max-w-xs mx-auto space-y-1.5">
                <div className="w-full h-2 rounded-full bg-purple-200 dark:bg-purple-900 overflow-hidden">
                  <div
                    className="h-full bg-[#7C3AED] transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-[11px] text-purple-600 font-semibold block">
                  A carregar para o Google Drive ({uploadProgress}%)...
                </span>
              </div>
            )}

            {!isDriveConnected && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                ⚠️ Conecta a tua conta Google acima para ativar o envio de ficheiros.
              </p>
            )}
          </div>

          {/* Files List in Drive */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ficheiros nesta pasta ({driveMediaFiles.length})
              </h4>
              <button
                onClick={() => fetchDriveFiles(activeFolder)}
                className="text-xs text-[#7C3AED] hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Atualizar</span>
              </button>
            </div>

            {driveMediaFiles.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 border border-dashed rounded-2xl border-slate-200 dark:border-purple-950/40">
                Nenhum ficheiro encontrado nesta pasta do Google Drive. Faz o primeiro upload acima!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {driveMediaFiles.map((file) => {
                  const isSelected = selectedFileId === file.id;
                  const isImage = file.mimeType.startsWith('image/');
                  const isAudio = file.mimeType.startsWith('audio/');
                  const isVideo = file.mimeType.startsWith('video/');

                  return (
                    <div
                      key={file.id}
                      onClick={() => {
                        setSelectedFileId(file.id);
                        if (onSelectMedia) {
                          onSelectMedia(file);
                        }
                      }}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-[#7C3AED] bg-purple-50 dark:bg-purple-950/50 shadow-sm'
                          : 'border-slate-100 dark:border-purple-950/40 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isImage ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                            <img
                              src={file.directUrl}
                              alt={file.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/70 flex items-center justify-center shrink-0">
                            {getMediaIcon(file.mimeType)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {file.name}
                          </h5>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {file.mimeType}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {onSelectMedia && (
                          <button
                            type="button"
                            onClick={() => onSelectMedia(file)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg"
                          >
                            Usar
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleDelete(file, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Eliminar do Google Drive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-purple-950/40 flex items-center justify-between text-xs text-slate-500">
          <span>Pasta: Lume Blog Media / {activeFolder}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
