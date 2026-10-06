import React, { useState, useEffect } from 'react';
import { BlogProvider, useBlog } from './context/BlogContext';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { ArticlesView } from './components/ArticlesView';
import { PhotoGallery } from './components/PhotoGallery';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { UserProfileView } from './components/UserProfileView';
import { ArticleDetail } from './components/ArticleDetail';
import { AdminModal } from './components/AdminModal';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';
import { DriveMediaModal } from './components/DriveMediaModal';
import { Footer } from './components/Footer';

const BlogMainContent: React.FC = () => {
  const { activeView, setActiveView, selectedPost, setSelectedPost } = useBlog();

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<'post' | 'photo'>('post');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [isDriveMediaModalOpen, setIsDriveMediaModalOpen] = useState(false);

  // Dynamic SEO meta updates on route/view changes
  useEffect(() => {
    if (activeView === 'article-detail' && selectedPost) {
      document.title = `${selectedPost.title} – Lume`;
    } else if (activeView === 'articles') {
      document.title = 'Todos os Artigos & Ensaios – Lume';
    } else if (activeView === 'gallery') {
      document.title = 'Galeria Fotográfica – Lume';
    } else if (activeView === 'about') {
      document.title = 'Sobre o Projeto – Lume';
    } else if (activeView === 'contact') {
      document.title = 'Contato & Sugestões – Lume';
    } else if (activeView === 'profile') {
      document.title = 'Minhas Atividades – Lume';
    } else {
      document.title = 'Lume – Blog Editorial Minimalista & Galeria Multimédia';
    }
  }, [activeView, selectedPost]);

  const handleOpenAdminForPost = () => {
    setAdminInitialTab('post');
    setIsAdminModalOpen(true);
  };

  const handleOpenAdminForPhoto = () => {
    setAdminInitialTab('photo');
    setIsAdminModalOpen(true);
  };

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthInitialTab(tab);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FC] dark:bg-[#0E0C18] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Top Header */}
      <Header
        onOpenAdmin={handleOpenAdminForPost}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenAuth={() => handleOpenAuth('login')}
        onOpenDrive={() => setIsDriveMediaModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* VIEW 1: Article Detail */}
        {activeView === 'article-detail' && selectedPost && (
          <ArticleDetail
            post={selectedPost}
            onBack={() => {
              setActiveView('home');
              setSelectedPost(null);
            }}
          />
        )}

        {/* VIEW 2: Início (Dedicated Homepage with Pixabay-style Slider & Feed) */}
        {activeView === 'home' && <HomeView onOpenAdmin={handleOpenAdminForPost} />}

        {/* VIEW 3: Artigos (Dedicated Articles Archive & Filterable Catalog) */}
        {activeView === 'articles' && <ArticlesView />}

        {/* VIEW 4: Galeria (Dedicated Photo Gallery) */}
        {activeView === 'gallery' && (
          <PhotoGallery onOpenAdminPhoto={handleOpenAdminForPhoto} />
        )}

        {/* VIEW 5: Sobre (Dedicated Story & Equipment Page) */}
        {activeView === 'about' && <AboutView />}

        {/* VIEW 6: Contato (Dedicated Interactive Contact Page) */}
        {activeView === 'contact' && <ContactView />}

        {/* VIEW 7: Perfil & Minhas Atividades (User Activities Dashboard) */}
        {activeView === 'profile' && (
          <UserProfileView
            onOpenAdminPost={handleOpenAdminForPost}
            onOpenAuth={() => handleOpenAuth('login')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Admin Creator Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        initialTab={adminInitialTab}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      {/* User Authentication & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authInitialTab}
      />

      {/* Global Google Drive Media Explorer */}
      <DriveMediaModal
        isOpen={isDriveMediaModalOpen}
        onClose={() => setIsDriveMediaModalOpen(false)}
        folderType="posts"
        title="Gestor Google Drive - Lume Media"
      />
    </div>
  );
};

export default function App() {
  return (
    <BlogProvider>
      <BlogMainContent />
    </BlogProvider>
  );
}
