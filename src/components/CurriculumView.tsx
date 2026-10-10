import React, { useState } from 'react';
import {
  Download,
  Printer,
  PlusCircle,
  Edit3,
  Trash2,
  Briefcase,
  GraduationCap,
  Code,
  FolderGit2,
  Award,
  Languages,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Sparkles,
  ExternalLink,
  Calendar,
  X,
  Check,
  RotateCcw,
  ShieldCheck,
  FileText,
  Share2,
  Layers,
  ChevronRight,
  Info,
  Camera
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { CurriculumItem, CurriculumProfile } from '../types';
import { ProfilePhotoModal } from './ProfilePhotoModal';

export const CurriculumView: React.FC = () => {
  const {
    curriculum,
    isAdmin,
    currentUser,
    updateProfile,
    updateCurriculumProfile,
    addCurriculumItem,
    updateCurriculumItem,
    deleteCurriculumItem,
    resetCurriculumToDefault,
  } = useBlog();

  const { profile, items, customCategories } = curriculum;

  // Active category filter tab ('all' or specific category)
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Modal states for Admin
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CurriculumItem | null>(null);

  // Form states for Adding / Editing an Item
  const [itemCategory, setItemCategory] = useState<string>('Educação & Formação');
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');
  const [itemTitle, setItemTitle] = useState<string>('');
  const [itemSubtitle, setItemSubtitle] = useState<string>('');
  const [itemPeriod, setItemPeriod] = useState<string>('');
  const [itemLocation, setItemLocation] = useState<string>('');
  const [itemDescription, setItemDescription] = useState<string>('');
  const [itemTags, setItemTags] = useState<string>('');
  const [itemLink, setItemLink] = useState<string>('');

  // Form states for Editing Profile
  const [profileForm, setProfileForm] = useState<CurriculumProfile>({ ...profile });

  // Get all unique categories
  const allCategories = Array.from(
    new Set([
      ...(customCategories || []),
      ...items.map((i) => i.category),
    ])
  );

  // Filtered items
  const displayItems =
    selectedCategoryTab === 'all'
      ? items
      : items.filter((i) => i.category.toLowerCase() === selectedCategoryTab.toLowerCase());

  // Group items by category for full overview
  const groupedByCategory = allCategories.reduce<Record<string, CurriculumItem[]>>(
    (acc, cat) => {
      acc[cat] = items.filter((item) => item.category.toLowerCase() === cat.toLowerCase());
      return acc;
    },
    {}
  );

  // Trigger browser print dialog for native vector PDF download
  const handleDownloadPDF = () => {
    window.print();
  };

  const handleShareCurriculum = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Open modal to add a new field
  const handleOpenAddModal = (defaultCategory?: string) => {
    setItemCategory(defaultCategory || allCategories[0] || 'Educação & Formação');
    setCustomCategoryInput('');
    setItemTitle('');
    setItemSubtitle('');
    setItemPeriod('');
    setItemLocation('');
    setItemDescription('');
    setItemTags('');
    setItemLink('');
    setEditingItem(null);
    setIsAddItemModalOpen(true);
  };

  // Open modal to edit an existing field
  const handleOpenEditModal = (item: CurriculumItem) => {
    setEditingItem(item);
    setItemCategory(item.category);
    setCustomCategoryInput('');
    setItemTitle(item.title);
    setItemSubtitle(item.subtitle || '');
    setItemPeriod(item.period || '');
    setItemLocation(item.location || '');
    setItemDescription(item.description);
    setItemTags(item.tags ? item.tags.join(', ') : '');
    setItemLink(item.link || '');
    setIsAddItemModalOpen(true);
  };

  // Save Item (Create or Update)
  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim() || !itemDescription.trim()) {
      alert('Por favor preencha pelo menos o Nome/Título e a Descrição.');
      return;
    }

    const finalCategory =
      itemCategory === '__new__'
        ? customCategoryInput.trim() || 'Geral'
        : itemCategory;

    const tagsArray = itemTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editingItem) {
      updateCurriculumItem(editingItem.id, {
        category: finalCategory,
        title: itemTitle.trim(),
        subtitle: itemSubtitle.trim() || undefined,
        period: itemPeriod.trim() || undefined,
        location: itemLocation.trim() || undefined,
        description: itemDescription.trim(),
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        link: itemLink.trim() || undefined,
      });
    } else {
      addCurriculumItem({
        category: finalCategory,
        title: itemTitle.trim(),
        subtitle: itemSubtitle.trim() || undefined,
        period: itemPeriod.trim() || undefined,
        location: itemLocation.trim() || undefined,
        description: itemDescription.trim(),
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        link: itemLink.trim() || undefined,
      });
    }

    setIsAddItemModalOpen(false);
  };

  // Save Profile Details
  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurriculumProfile(profileForm);
    setIsEditProfileModalOpen(false);
  };

  // Helper to pick category icon
  const getCategoryIcon = (categoryName: string) => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('experiência') || lower.includes('trabalho') || lower.includes('carreira')) {
      return <Briefcase className="w-5 h-5 text-indigo-500" />;
    }
    if (lower.includes('educação') || lower.includes('formação') || lower.includes('académica')) {
      return <GraduationCap className="w-5 h-5 text-purple-500" />;
    }
    if (lower.includes('competência') || lower.includes('habilidade') || lower.includes('skill') || lower.includes('técnica')) {
      return <Code className="w-5 h-5 text-emerald-500" />;
    }
    if (lower.includes('projeto') || lower.includes('portfolio') || lower.includes('destaque')) {
      return <FolderGit2 className="w-5 h-5 text-amber-500" />;
    }
    if (lower.includes('certifica') || lower.includes('curso') || lower.includes('prémio')) {
      return <Award className="w-5 h-5 text-rose-500" />;
    }
    if (lower.includes('idioma') || lower.includes('língua')) {
      return <Languages className="w-5 h-5 text-cyan-500" />;
    }
    return <Layers className="w-5 h-5 text-purple-500" />;
  };

  return (
    <div className="curriculum-container max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Print-specific style tag for high-resolution A4 vector PDF output */}
      <style>{`
        @media print {
          /* Hide non-printable elements */
          header, footer, nav, .no-print, button, .admin-controls-badge {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .curriculum-container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10mm 15mm !important;
          }
          .curriculum-card {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            page-break-inside: avoid !important;
          }
          .curriculum-tag {
            border: 1px solid #cbd5e1 !important;
            background: #f8fafc !important;
            color: #1e293b !important;
          }
          a {
            text-decoration: none !important;
            color: #1e293b !important;
          }
        }
      `}</style>

      {/* Top Action & Announcement Bar (Hidden during PDF print) */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-purple-500/10 border border-purple-200/80 dark:border-purple-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#7C3AED] text-white shadow-md shadow-purple-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Currículo Digital & Portfólio Profissional
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                Interativo & PDF
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visualização moderna de competências, projetos e trajetória. Exportável em PDF de alta qualidade.
            </p>
          </div>
        </div>

        {/* Action Buttons: PDF Download, Share, Admin Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Share Button */}
          <button
            onClick={handleShareCurriculum}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#1a172c] hover:bg-slate-50 dark:hover:bg-[#231e3d] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-purple-900/50 transition shadow-sm active:scale-95"
            title="Copiar link do currículo"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copiado!' : 'Partilhar'}</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-md shadow-purple-600/25 transition active:scale-95"
            title="Descarregar currículo em PDF"
          >
            <Download className="w-4 h-4" />
            <span>Baixar em PDF</span>
          </button>

          {/* Admin Edit Controls */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 pl-1">
              <button
                onClick={() => {
                  setProfileForm({ ...profile });
                  setIsEditProfileModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow-sm active:scale-95"
                title="Editar informações pessoais e contactos"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Perfil</span>
              </button>

              <button
                onClick={() => handleOpenAddModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm active:scale-95"
                title="Adicionar novo campo (experiência, projeto, skill, etc.)"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Novo Campo</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Resume Profile Header Card */}
      <div className="curriculum-card relative p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#161324] border border-purple-100 dark:border-purple-950/60 shadow-xl overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          {/* Avatar with status ring */}
          <div className="relative shrink-0 group">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden ring-4 ring-purple-100 dark:ring-purple-950/80 shadow-2xl bg-slate-100 dark:bg-slate-800">
              <img
                src={
                  profile.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80'
                }
                alt={profile.fullName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80';
                }}
              />
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="no-print absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition cursor-pointer p-2 text-center z-10"
                title="Alterar Foto de Perfil do Currículo"
              >
                <Camera className="w-5 h-5 mb-1 text-purple-200" />
                <span className="text-[10px] font-bold">Mudar Foto</span>
              </button>
            )}
            {profile.statusBadge && (
              <span className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-md flex items-center gap-1 z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Ativo</span>
              </span>
            )}
          </div>

          {/* Profile Identity & Summary */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {profile.fullName}
                </h1>
                <p className="text-sm sm:text-base font-semibold text-[#7C3AED] dark:text-purple-300 mt-0.5">
                  {profile.headline}
                </p>
              </div>

              {profile.statusBadge && (
                <div className="no-print inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 self-center md:self-start">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{profile.statusBadge}</span>
                </div>
              )}
            </div>

            {/* Executive Summary */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              {profile.summary}
            </p>

            {/* Contact Details & Social Links Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-purple-950/60 flex flex-wrap items-center justify-center md:justify-start gap-y-2.5 gap-x-5 text-xs text-slate-600 dark:text-slate-400">
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-1.5 hover:text-[#7C3AED] dark:hover:text-purple-300 transition group"
                >
                  <Mail className="w-3.5 h-3.5 text-purple-500 group-hover:scale-110 transition-transform" />
                  <span>{profile.email}</span>
                </a>
              )}

              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center gap-1.5 hover:text-[#7C3AED] dark:hover:text-purple-300 transition group"
                >
                  <Phone className="w-3.5 h-3.5 text-purple-500 group-hover:scale-110 transition-transform" />
                  <span>{profile.phone}</span>
                </a>
              )}

              {profile.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-500" />
                  <span>{profile.location}</span>
                </span>
              )}

              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#7C3AED] dark:hover:text-purple-300 transition group"
                >
                  <Globe className="w-3.5 h-3.5 text-purple-500 group-hover:scale-110 transition-transform" />
                  <span>Website</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}

              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#7C3AED] dark:hover:text-purple-300 transition group"
                >
                  <Linkedin className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}

              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#7C3AED] dark:hover:text-purple-300 transition group"
                >
                  <Github className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform" />
                  <span>GitHub</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation Pills (Screen view only) */}
      <div className="no-print flex items-center justify-between gap-3 overflow-x-auto pb-2 border-b border-slate-200/60 dark:border-purple-950/40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedCategoryTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCategoryTab === 'all'
                ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-600/20'
                : 'bg-white dark:bg-[#161324] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#201c35] border border-slate-200/60 dark:border-purple-900/40'
            }`}
          >
            Todos os Campos ({items.length})
          </button>

          {allCategories.map((cat) => {
            const count = items.filter((i) => i.category.toLowerCase() === cat.toLowerCase()).length;
            const isSelected = selectedCategoryTab.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategoryTab(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-600/20'
                    : 'bg-white dark:bg-[#161324] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#201c35] border border-slate-200/60 dark:border-purple-900/40'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-purple-950/60 text-slate-500 dark:text-purple-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              if (window.confirm('Deseja restaurar os dados originais do currículo?')) {
                resetCurriculumToDefault();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition whitespace-nowrap pl-2"
            title="Restaurar dados padrão do currículo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>
        )}
      </div>

      {/* Main Content Sections: Grouped by Category */}
      <div className="space-y-10">
        {(selectedCategoryTab === 'all' ? allCategories : [selectedCategoryTab]).map((categoryName) => {
          const categoryItems = groupedByCategory[categoryName] || [];
          if (categoryItems.length === 0 && selectedCategoryTab !== 'all') {
            return null;
          }

          return (
            <section key={categoryName} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center justify-between pb-2 border-b border-purple-100 dark:border-purple-950/60">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300">
                    {getCategoryIcon(categoryName)}
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {categoryName}
                    </h2>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleOpenAddModal(categoryName)}
                    className="no-print inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] dark:text-purple-400 hover:underline"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Adicionar em {categoryName}</span>
                  </button>
                )}
              </div>

              {/* Items List */}
              {categoryItems.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#161324] border border-dashed border-slate-200 dark:border-purple-900/40 text-slate-400">
                  <p className="text-xs">Nenhum item adicionado a esta categoria ainda.</p>
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenAddModal(categoryName)}
                      className="mt-2 text-xs font-bold text-[#7C3AED] dark:text-purple-400 hover:underline"
                    >
                      + Adicionar primeiro item
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="curriculum-card relative p-5 rounded-2xl bg-white dark:bg-[#161324] border border-slate-100 dark:border-purple-950/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Header Row: Title, Subtitle, Dates */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5 flex-1">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                              {item.title}
                            </h3>
                            {item.subtitle && (
                              <p className="text-xs font-semibold text-[#7C3AED] dark:text-purple-300">
                                {item.subtitle}
                              </p>
                            )}
                          </div>

                          {/* Admin Edit & Delete buttons */}
                          {isAdmin && (
                            <div className="no-print flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title="Editar este campo"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Tem a certeza que deseja eliminar "${item.title}"?`)) {
                                    deleteCurriculumItem(item.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title="Eliminar este campo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Metadata row: Period & Location */}
                        {(item.period || item.location) && (
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                            {item.period && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-purple-400" />
                                <span>{item.period}</span>
                              </span>
                            )}
                            {item.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-purple-400" />
                                <span>{item.location}</span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Description */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed whitespace-pre-line">
                          {item.description}
                        </p>
                      </div>

                      {/* Footer Row: Tags & Link */}
                      <div className="mt-4 pt-3 border-t border-slate-50 dark:border-purple-950/40 flex flex-wrap items-center justify-between gap-2">
                        {item.tags && item.tags.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="curriculum-tag px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 border border-purple-100/60 dark:border-purple-900/30"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : <div />}

                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7C3AED] dark:text-purple-400 hover:underline ml-auto"
                          >
                            <span>Ver Detalhes</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* MODAL 1: Add or Edit Field (Admin 100% editable) */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#161324] rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-900/50 overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-purple-950/60 bg-slate-50/50 dark:bg-[#1c182d]/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingItem ? 'Editar Campo do Currículo' : 'Adicionar Novo Campo ao Currículo'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Defina categoria, nome e descrição detalhada do que será adicionado.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitItem} className="p-6 space-y-4">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Categoria *
                </label>
                <select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                >
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__new__">+ Criar Nova Categoria Personalizada...</option>
                </select>
              </div>

              {/* Custom Category Input if selected __new__ */}
              {itemCategory === '__new__' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nome da Nova Categoria *
                  </label>
                  <input
                    type="text"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    placeholder="Ex: Voluntariado, Patentes, Publicações Académicas..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
              )}

              {/* Title / Name (Required) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome / Título do Campo *
                </label>
                <input
                  type="text"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder="Ex: Estágio em Gestão Financeira / PAP: Plano de Negócios / Excel & BI"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>

              {/* Subtitle / Company / Institution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subtítulo / Empresa / Instituição
                  </label>
                  <input
                    type="text"
                    value={itemSubtitle}
                    onChange={(e) => setItemSubtitle(e.target.value)}
                    placeholder="Ex: Inovação & Consultoria / Escola Profissional / Simulação Empresarial"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Período / Ano
                  </label>
                  <input
                    type="text"
                    value={itemPeriod}
                    onChange={(e) => setItemPeriod(e.target.value)}
                    placeholder="Ex: 2025 - 2026 / 13º Ano"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
              </div>

              {/* Location & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Localização (Opcional)
                  </label>
                  <input
                    type="text"
                    value={itemLocation}
                    onChange={(e) => setItemLocation(e.target.value)}
                    placeholder="Ex: Lisboa, Portugal / Remoto"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Link / URL (Opcional)
                  </label>
                  <input
                    type="url"
                    value={itemLink}
                    onChange={(e) => setItemLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
              </div>

              {/* Description (Required) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição / Detalhes do Campo *
                </label>
                <textarea
                  rows={4}
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="Descreva as responsabilidades, resultados, ferramentas utilizadas ou conteúdo relevante..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tags / Palavras-chave (Separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={itemTags}
                  onChange={(e) => setItemTags(e.target.value)}
                  placeholder="Ex: Contabilidade, Excel, Power BI, FCT, PAP"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-purple-950/60">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl shadow-md transition"
                >
                  {editingItem ? 'Atualizar Campo' : 'Adicionar ao Currículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Profile Header & Contacts (Admin) */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#161324] rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-900/50 overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-purple-950/60 bg-slate-50/50 dark:bg-[#1c182d]/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Editar Perfil & Contactos do Currículo
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Atualize os dados principais do cabeçalho profissional.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditProfileModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitProfile} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título Profissional / Headline *
                </label>
                <input
                  type="text"
                  value={profileForm.headline}
                  onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Resumo Profissional / Bio Executiva *
                </label>
                <textarea
                  rows={3}
                  value={profileForm.summary}
                  onChange={(e) => setProfileForm({ ...profileForm, summary: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email de Contacto *
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={profileForm.phone || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+351 912 345 678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={profileForm.location || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    placeholder="Lisboa, Portugal"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Badge de Estado
                  </label>
                  <input
                    type="text"
                    value={profileForm.statusBadge || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, statusBadge: e.target.value })}
                    placeholder="Disponível para Projetos"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  URL do Avatar / Foto de Perfil
                </label>
                <input
                  type="url"
                  value={profileForm.avatarUrl || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={profileForm.website || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={profileForm.linkedin || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={profileForm.github || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-white dark:bg-[#1a172c] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-purple-950/60">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl shadow-md transition"
                >
                  Guardar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Profile Photo Customization Modal for Curriculum */}
      {isAdmin && (
        <ProfilePhotoModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          currentAvatar={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80'}
          userName={profile.fullName}
          onSaveAvatar={(newUrl) => {
            updateCurriculumProfile({ avatarUrl: newUrl });
            if (currentUser) {
              updateProfile({ avatar: newUrl });
            }
          }}
        />
      )}
    </div>
  );
};
