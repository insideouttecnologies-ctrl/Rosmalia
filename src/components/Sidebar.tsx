import React, { useState } from 'react';
import {
  Search,
  Folder,
  Laptop,
  Sun,
  User,
  Gamepad2,
  Coffee,
  GraduationCap,
  Sparkles,
  Flame,
  Eye,
  Mail,
  CheckCircle2,
  X
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';

export const Sidebar: React.FC = () => {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    posts,
    openPostDetail,
    setActiveView,
  } = useBlog();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Derive popular articles dynamically from real posts
  const popularArticles = [...posts]
    .sort((a, b) => b.likes - a.likes || b.viewCount - a.viewCount)
    .slice(0, 4);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'laptop':
        return <Laptop className="w-4 h-4 text-purple-500" />;
      case 'sun':
        return <Sun className="w-4 h-4 text-purple-500" />;
      case 'user':
        return <User className="w-4 h-4 text-purple-500" />;
      case 'gamepad':
        return <Gamepad2 className="w-4 h-4 text-purple-500" />;
      case 'coffee':
        return <Coffee className="w-4 h-4 text-purple-500" />;
      case 'graduation-cap':
        return <GraduationCap className="w-4 h-4 text-purple-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setSubscribed(false);
    }, 4500);
  };

  const handleCategoryClick = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryName);
      setActiveView('articles');
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  return (
    <aside className="w-full space-y-6">
      {/* 1. Quick Search Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar artigos..."
          className="w-full pl-10 pr-9 py-3 text-sm bg-white dark:bg-[#171426] border border-purple-50/80 dark:border-purple-950/40 rounded-2xl shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Categorias Box */}
      <div className="bg-white dark:bg-[#171426] rounded-2xl border border-purple-50/80 dark:border-purple-950/40 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-purple-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-100/70 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300">
              <Folder className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Categorias
            </h3>
          </div>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-[#7C3AED] dark:text-purple-300 hover:underline font-medium"
            >
              Limpar filtro
            </button>
          )}
        </div>

        <ul className="mt-3 space-y-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
            return (
              <li key={cat.id}>
                <button
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`w-full flex items-center justify-between py-2 px-2.5 rounded-xl text-sm transition-all ${
                    isSelected
                      ? 'bg-purple-50 dark:bg-purple-950/70 text-[#7C3AED] dark:text-purple-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="opacity-90">{getCategoryIcon(cat.iconName)}</span>
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isSelected
                        ? 'bg-[#7C3AED] text-white'
                        : 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 3. Mais lidos Box */}
      <div className="bg-white dark:bg-[#171426] rounded-2xl border border-purple-50/80 dark:border-purple-950/40 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-purple-950/40">
          <div className="p-1.5 rounded-lg bg-purple-100/70 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300">
            <Flame className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Mais lidos
          </h3>
        </div>

        <div className="mt-4 space-y-4">
          {popularArticles.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-2 text-center">
              Ainda não há artigos suficientes para o ranking de mais lidos.
            </p>
          ) : (
            popularArticles.map((item) => (
              <div
                key={item.id}
                onClick={() => openPostDetail(item)}
                className="group flex items-center gap-3.5 cursor-pointer"
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#7C3AED] dark:group-hover:text-purple-300 line-clamp-2 transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    <Eye className="w-3 h-3 opacity-70" />
                    <span>{item.views || `${item.viewCount} leituras`}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Recebe novidades Box */}
      <div className="bg-white dark:bg-[#171426] rounded-2xl border border-purple-50/80 dark:border-purple-950/40 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2.5 pb-2">
          <div className="p-1.5 rounded-lg bg-purple-100/70 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300">
            <Mail className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Recebe novidades
          </h3>
        </div>

        <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Subscreve a nossa newsletter e recebe os melhores artigos diretamente no teu email.
        </p>

        {subscribed ? (
          <div className="mt-4 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-[#7C3AED] dark:text-purple-300 flex items-center gap-2 text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>Obrigado por subscrever! Boas leituras a caminho.</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="mt-4 space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="O teu email"
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] active:scale-[0.98] rounded-xl shadow-sm transition-all"
            >
              Subscrever
            </button>
          </form>
        )}
      </div>
    </aside>
  );
};
