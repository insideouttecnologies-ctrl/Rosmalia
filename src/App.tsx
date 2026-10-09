import React, { useState, useEffect } from 'react';
import { BlogProvider, useBlog } from './context/BlogContext';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { ArticlesView } from './components/ArticlesView';
import { PhotoGallery } from './components/PhotoGallery';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { UserProfileView } from './components/UserProfileView';
import { CurriculumView } from './components/CurriculumView';
import { ArticleDetail } from './components/ArticleDetail';
import { AdminModal } from './components/AdminModal';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';
import { DriveMediaModal } from './components/DriveMediaModal';
import { Footer } from './components/Footer';
import { IncomingCallModal } from './components/IncomingCallModal';
import { WebRTCVideoCallModal } from './components/WebRTCVideoCallModal';
import { StartVideoCallModal } from './components/StartVideoCallModal';
import { WebRTCCallSession } from './types';
import { listenIncomingCallsForUser } from './services/webrtcService';

const BlogMainContent: React.FC = () => {
  const { activeView, setActiveView, selectedPost, setSelectedPost, currentUser } = useBlog();

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<'post' | 'photo'>('post');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [isDriveMediaModalOpen, setIsDriveMediaModalOpen] = useState(false);

  // WebRTC Video Call states
  const [isStartCallModalOpen, setIsStartCallModalOpen] = useState(false);
  const [activeCallSession, setActiveCallSession] = useState<WebRTCCallSession | null>(null);
  const [isCaller, setIsCaller] = useState(false);
  const [incomingCall, setIncomingCall] = useState<WebRTCCallSession | null>(null);

  // Global listener for incoming WebRTC video calls
  useEffect(() => {
    const targetId = currentUser?.id || 'guest-user';
    const targetEmail = currentUser?.email || 'guest@lume.pt';

    const unsubscribe = listenIncomingCallsForUser(targetId, targetEmail, (call) => {
      if (call && (!activeCallSession || activeCallSession.status === 'ended')) {
        setIncomingCall(call);
      } else {
        setIncomingCall(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser?.id, currentUser?.email, activeCallSession]);

  // Handle incoming call acceptance
  const handleAcceptIncomingCall = (call: WebRTCCallSession) => {
    setIncomingCall(null);
    setIsCaller(false);
    setActiveCallSession(call);
  };

  const handleDeclineIncomingCall = () => {
    setIncomingCall(null);
  };

  const handleCallInitiated = (session: WebRTCCallSession) => {
    setIsCaller(true);
    setActiveCallSession(session);
  };

  // Dynamic SEO meta updates on route/view changes
  useEffect(() => {
    if (activeView === 'article-detail' && selectedPost) {
      document.title = `${selectedPost.title} – Lume`;
    } else if (activeView === 'articles') {
      document.title = 'Todos os Artigos & Ensaios – Lume';
    } else if (activeView === 'gallery') {
      document.title = 'Galeria Fotográfica – Lume';
    } else if (activeView === 'curriculum') {
      document.title = 'Currículo Digital & Portfólio – Lume';
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
        onOpenVideoCall={() => setIsStartCallModalOpen(true)}
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

        {/* VIEW: Currículo Digital & Portfólio */}
        {activeView === 'curriculum' && <CurriculumView />}

        {/* VIEW 5: Sobre (Dedicated Story & Equipment Page) */}
        {activeView === 'about' && <AboutView />}

        {/* VIEW 6: Contato (Dedicated Interactive Contact Page) */}
        {activeView === 'contact' && <ContactView />}

        {/* VIEW 7: Perfil & Minhas Atividades (User Activities Dashboard) */}
        {activeView === 'profile' && (
          <UserProfileView
            onOpenAdminPost={handleOpenAdminForPost}
            onOpenAuth={() => handleOpenAuth('login')}
            onOpenVideoCall={() => setIsStartCallModalOpen(true)}
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

      {/* WebRTC Start Call Modal */}
      <StartVideoCallModal
        isOpen={isStartCallModalOpen}
        onClose={() => setIsStartCallModalOpen(false)}
        onCallInitiated={handleCallInitiated}
        onJoinCall={(session) => {
          setIsCaller(false);
          setActiveCallSession(session);
        }}
        onOpenAuth={() => handleOpenAuth('login')}
      />

      {/* WebRTC Incoming Call Alert Modal with 8-second countdown */}
      {incomingCall && (
        <IncomingCallModal
          call={incomingCall}
          onAccept={handleAcceptIncomingCall}
          onDecline={handleDeclineIncomingCall}
        />
      )}

      {/* WebRTC Active / Outgoing Video Call Window */}
      {activeCallSession && (
        <WebRTCVideoCallModal
          session={activeCallSession}
          isCaller={isCaller}
          onClose={() => setActiveCallSession(null)}
        />
      )}
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
