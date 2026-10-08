import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle,
  Sparkles,
  ArrowRight,
  LogIn,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Globe,
  Key,
  ShieldAlert
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
}) => {
  const {
    login,
    register,
    loginWithGoogle,
    loginWithGoogleIdToken,
    loginDirectGoogle,
    setActiveView
  } = useBlog();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'reader' | 'admin'>('reader');
  const [selectedAvatar, setSelectedAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  );

  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Render & Firebase Domain helper states
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'rosmalia.onrender.com';
  const isRenderHost = currentHostname.includes('render.com') || currentHostname.includes('rosmalia');
  const [showDomainHelper, setShowDomainHelper] = useState(isRenderHost);
  const [domainCopied, setDomainCopied] = useState(false);

  // Direct Google Account input fallback (Render bypass)
  const [showDirectGoogleForm, setShowDirectGoogleForm] = useState(false);
  const [directGoogleEmail, setDirectGoogleEmail] = useState('');
  const [directGoogleName, setDirectGoogleName] = useState('');
  const [isDirectGoogleLoading, setIsDirectGoogleLoading] = useState(false);

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
  ];

  // Initialize Google Identity Services (GIS) if available in browser
  useEffect(() => {
    if (!isOpen) return;
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: '711607930997-atv15cu61hk0nd4cco0ifjahce7aj7sf.apps.googleusercontent.com',
          callback: async (response: any) => {
            if (response?.credential) {
              setIsGoogleLoading(true);
              setErrorMessage(null);
              const res = await loginWithGoogleIdToken(response.credential);
              setIsGoogleLoading(false);
              if (res.success) {
                setSuccessMessage('Sessão iniciada via Google com sucesso!');
                setTimeout(() => {
                  setSuccessMessage(null);
                  onClose();
                  setActiveView('home');
                }, 900);
              } else {
                setErrorMessage(res.message || 'Falha ao autenticar com a conta Google.');
              }
            }
          },
          auto_select: false,
        });

        // Delay render button slightly so DOM element is mounted
        const timer = setTimeout(() => {
          const btnEl = document.getElementById('gis-google-btn-container');
          if (btnEl && (window as any).google?.accounts?.id?.renderButton) {
            btnEl.innerHTML = '';
            (window as any).google.accounts.id.renderButton(btnEl, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              text: 'continue_with',
              shape: 'rectangular',
              width: 320,
            });
          }
        }, 150);

        return () => clearTimeout(timer);
      } catch (err) {
        console.warn('GIS error:', err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyDomain = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(currentHostname);
      setDomainCopied(true);
      setTimeout(() => setDomainCopied(false), 2500);
    }
  };

  const handleDirectAdminLogin = () => {
    setErrorMessage(null);
    setEmail('insideouttecnologies@gmail.com');
    setPassword('adminPassword123');
    const res = login('insideouttecnologies@gmail.com', 'adminPassword123');
    if (res.success) {
      setSuccessMessage('Sessão iniciada como Administrador com sucesso!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
        setActiveView('profile');
      }, 900);
    } else {
      setErrorMessage(res.message || 'Falha ao autenticar como administrador.');
    }
  };

  const handleDirectGoogleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!directGoogleEmail || !directGoogleEmail.includes('@')) {
      setErrorMessage('Por favor insere um endereço de email Google válido.');
      return;
    }
    setIsDirectGoogleLoading(true);
    setErrorMessage(null);
    const res = await loginDirectGoogle(directGoogleEmail, directGoogleName);
    setIsDirectGoogleLoading(false);
    if (res.success) {
      setSuccessMessage(`Bem-vindo, ${res.user?.name || directGoogleEmail}! Sessão iniciada.`);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
        setActiveView('profile');
      }, 900);
    } else {
      setErrorMessage(res.message || 'Erro ao sincronizar conta Google.');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    const res = await loginWithGoogle();
    setIsGoogleLoading(false);
    if (res.success) {
      setSuccessMessage('Sessão iniciada com a tua conta Google com sucesso!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
        setActiveView('home');
      }, 900);
    } else {
      if (res.errorCode === 'auth/unauthorized-domain' || isRenderHost) {
        setShowDomainHelper(true);
      }
      setErrorMessage(res.message || 'Falha ao autenticar com a conta Google.');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = login(email, password);
    if (!res.success) {
      setErrorMessage(res.message || 'Erro ao entrar na conta.');
      return;
    }

    setSuccessMessage('Sessão iniciada com sucesso! Bem-vindo de volta.');
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
      setActiveView('profile');
    }, 1000);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    const res = register({
      name,
      email,
      password,
      avatar: selectedAvatar,
      role,
    });

    if (!res.success) {
      setErrorMessage(res.message || 'Erro ao criar conta.');
      return;
    }

    setSuccessMessage('Conta criada com sucesso! Já podes controlar as tuas atividades.');
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
      setActiveView('profile');
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#161324] rounded-3xl shadow-2xl border border-purple-500/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-purple-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {activeTab === 'login' ? 'Entrar no Lume' : 'Criar Conta no Lume'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mantém o controlo dos teus favoritos e comentários
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 dark:border-purple-950/40 bg-slate-50/50 dark:bg-slate-900/30">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition border-b-2 ${
              activeTab === 'login'
                ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-300 bg-white dark:bg-[#161324]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition border-b-2 ${
              activeTab === 'register'
                ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-300 bg-white dark:bg-[#161324]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Criar Conta (Cadastro)
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab 1: Login Form */}
        {activeTab === 'login' && (
          <div className="p-6 space-y-4">
            {/* Google Sign In Button for all users */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-4 bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-purple-950/80 rounded-xl shadow-xs transition active:scale-[0.98] flex items-center justify-center gap-3 font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>{isGoogleLoading ? 'A conectar conta Google...' : 'Entrar com o Google'}</span>
              </button>

              {/* Google Identity Services native container if loaded */}
              <div id="gis-google-btn-container" className="flex justify-center empty:hidden my-1" />

              <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
                Acesso seguro e instantâneo com a tua conta Google
              </p>
            </div>

            {/* Render Domain Authorization & Instant Access Helper */}
            {showDomainHelper && (
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 text-xs space-y-3 animate-fade-in">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Configuração do Domínio Google no Render</span>
                  </div>
                  <button
                    onClick={() => setShowDomainHelper(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Ocultar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Para o Google Sign-In oficial por popup funcionar no Render, o Firebase exige que o domínio <strong className="text-slate-800 dark:text-slate-200 font-mono">{currentHostname}</strong> esteja adicionado na lista de <em>Domínios Autorizados</em> no Firebase Console.
                </p>

                {/* Domain Copy Box */}
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-xl border border-amber-500/20">
                  <Globe className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold truncate flex-1 text-[11px]">
                    {currentHostname}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyDomain}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300 hover:bg-purple-200 flex items-center gap-1 transition active:scale-95 shrink-0"
                  >
                    {domainCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{domainCopied ? 'Copiado!' : 'Copiar Domínio'}</span>
                  </button>
                </div>

                {/* Direct Link to Firebase Console */}
                <a
                  href="https://console.firebase.google.com/project/gen-lang-client-0321247623/authentication/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow-xs hover:opacity-95 transition"
                >
                  <span>Abrir Definições do Firebase Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Step by step */}
                <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-amber-500/10 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <p className="font-bold text-slate-700 dark:text-slate-200">Como autorizar em 3 passos simples:</p>
                  <p>1. Clica no botão laranja acima para abrir as Definições do Firebase.</p>
                  <p>2. Desce até <strong>Domínios autorizados</strong> (Authorized domains) e clica em <strong>Adicionar domínio</strong>.</p>
                  <p>3. Cola <strong>{currentHostname}</strong> (e também <strong>onrender.com</strong>) e clica em Guardar.</p>
                </div>

                {/* Instant Access Options without waiting */}
                <div className="pt-2 border-t border-amber-500/20 space-y-2">
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-[11px]">
                    ⚡ Entrar agora sem esperar pela configuração do Firebase:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleDirectAdminLogin}
                      className="w-full py-2 px-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Entrar como Admin (1 Clique)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDirectGoogleForm(!showDirectGoogleForm)}
                      className="w-full py-2 px-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 font-semibold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-purple-600" />
                      <span>{showDirectGoogleForm ? 'Fechar Entrada Direta' : 'Entrar com Email Google'}</span>
                    </button>
                  </div>
                </div>

                {/* Direct Google form toggle */}
                {showDirectGoogleForm && (
                  <form onSubmit={handleDirectGoogleLogin} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-purple-500/20 space-y-2.5 mt-2">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                      Entrada Direta com Email Google (Modo Rápido Render)
                    </p>
                    <input
                      type="email"
                      required
                      value={directGoogleEmail}
                      onChange={(e) => setDirectGoogleEmail(e.target.value)}
                      placeholder="ex: teuemail@gmail.com"
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={directGoogleName}
                      onChange={(e) => setDirectGoogleName(e.target.value)}
                      placeholder="Teu Nome (opcional)"
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={isDirectGoogleLoading}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition active:scale-95 disabled:opacity-50"
                    >
                      {isDirectGoogleLoading ? 'A autenticar...' : 'Entrar com esta Conta Google'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Visual Divider */}
            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-slate-200 dark:border-purple-950/60" />
              <span className="flex-shrink mx-3 text-xs font-medium text-slate-400 dark:text-slate-500">
                ou com email e senha
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-purple-950/60" />
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Endereço de Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar na Minha Conta</span>
              </button>

              {/* Admin Quick Credentials Box for Render / Production */}
              <div className="pt-2">
                <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-purple-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#7C3AED]" />
                      <span>Credenciais de Admin (Render):</span>
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      insideouttecnologies@gmail.com
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('insideouttecnologies@gmail.com');
                      setPassword('adminPassword123');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-[#7C3AED] dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800 hover:bg-purple-50 transition text-[11px] shrink-0"
                  >
                    Preencher Dados de Admin
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Register Form (Cadastro) */}
        {activeTab === 'register' && (
          <div className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
            {/* Quick Google Register Option */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-4 bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-purple-950/80 rounded-xl shadow-xs transition active:scale-[0.98] flex items-center justify-center gap-3 font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>{isGoogleLoading ? 'A conectar conta Google...' : 'Cadastrar com o Google'}</span>
              </button>
              <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
                Cria o teu perfil automaticamente com o teu avatar e email Google
              </p>
            </div>

            {/* Divider */}
            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-slate-200 dark:border-purple-950/60" />
              <span className="flex-shrink mx-3 text-xs font-medium text-slate-400 dark:text-slate-500">
                ou preenche os dados manualmente
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-purple-950/60" />
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nome Completo *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Beatriz Miranda"
                  className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Senha *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mín. 6 caracteres"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirmar Senha *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repete a senha"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-purple-950/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Escolhe o teu Avatar
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {avatarPresets.map((av, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedAvatar(av)}
                    className={`shrink-0 w-11 h-11 rounded-full overflow-hidden border-2 transition ${
                      selectedAvatar === av
                        ? 'border-[#7C3AED] ring-2 ring-purple-300 scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={av} alt="Avatar opção" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Role Choice */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tipo de Acesso
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('reader')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition ${
                    role === 'reader'
                      ? 'border-[#7C3AED] bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Leitor / Membro
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition ${
                    role === 'admin'
                      ? 'border-[#7C3AED] bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Criador / Admin
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl shadow-md transition active:scale-[0.98]"
            >
              Concluir Cadastro & Começar
            </button>
          </form>
          </div>
        )}
      </div>
    </div>
  );
};
