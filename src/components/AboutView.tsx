import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  Heart,
  BookOpen,
  Coffee,
  Camera,
  ShieldCheck,
  Cpu,
  HelpCircle,
  ChevronDown,
  Layers,
  Award,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';

export const AboutView: React.FC = () => {
  const { currentUser, setActiveView } = useBlog();
  const author = {
    name: currentUser?.name || 'Mariana Costa',
    avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80',
    role: currentUser?.role === 'admin' ? 'Gestora & Administradora Editorial' : 'Finalista do 13º Ano de Gestão Empresarial',
    bio: currentUser?.bio || 'Estudante finalista do 13º ano de Gestão Empresarial. Escrevendo sobre estratégia organizacional, finanças práticas, análise de mercado e empreendedorismo jovem.',
  };

  const [activeTab, setActiveTab] = useState<'mission' | 'gear' | 'faq'>('mission');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Qual é o foco principal deste espaço digital?',
      a: 'Este espaço reúne ensaios práticos sobre gestão empresarial, resumos de estudos de caso, análises de mercado, apontamentos de preparação para o ensino superior e o meu currículo digital completo como finalista do 13º ano.'
    },
    {
      q: 'O que aborda a Prova de Aptidão Profissional (PAP)?',
      a: 'A minha PAP é focada no desenvolvimento integral de um Plano de Negócios sustentável, contemplando estudo de viabilidade económico-financeira, análise de break-even e estratégias de marketing digital.'
    },
    {
      q: 'O currículo digital pode ser descarregado em PDF?',
      a: 'Sim! Na secção "Currículo", podes clicar em "Baixar PDF" para obter uma versão formatada, limpa e pronta para impressão ou partilha institucional.'
    },
    {
      q: 'Como posso entrar em contacto para oportunidades de estágio ou projetos?',
      a: 'Podes aceder à secção "Contato", iniciar uma vídeo chamada WebRTC em direto ou enviar uma mensagem por e-mail.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in space-y-10">
      {/* Hero Banner */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold text-[#7C3AED] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sobre o Projeto & Perfil</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Lume: Portfólio & Gestão Empresarial
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          O meu espaço digital de partilha de conhecimento, projetos práticos de gestão, ensaios
          analíticos e portfólio profissional como finalista do 13º ano.
        </p>
      </div>

      {/* Author Profile Card */}
      <div className="bg-white dark:bg-[#171426] p-8 rounded-3xl border border-purple-50/80 dark:border-purple-950/40 shadow-sm flex flex-col md:flex-row gap-8 items-center">
        <img
          src={author.avatar}
          alt={author.name}
          referrerPolicy="no-referrer"
          className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl object-cover ring-4 ring-purple-100 dark:ring-purple-950 shadow-md shrink-0"
        />
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-block px-3 py-1 rounded-md text-xs font-bold text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60">
            {author.role}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {author.name}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {author.bio}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-500" />
              Gestão & Estratégia
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-500" />
              Finanças & Análise de Dados
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-500" />
              Finalista do 13º Ano (PAP & FCT)
            </span>
          </div>
          <div className="pt-2 flex justify-center md:justify-start">
            <button
              onClick={() => setActiveView('curriculum')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-md shadow-purple-600/20 transition active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Ver Currículo Digital & Portfólio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-center gap-2 border-b border-purple-100 dark:border-purple-950/60 pb-3">
        <button
          onClick={() => setActiveTab('mission')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'mission'
              ? 'bg-[#7C3AED] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
          }`}
        >
          Valores & Visão de Gestão
        </button>

        <button
          onClick={() => setActiveTab('gear')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'gear'
              ? 'bg-[#7C3AED] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
          }`}
        >
          Ferramentas & Metodologias
        </button>

        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'faq'
              ? 'bg-[#7C3AED] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
          }`}
        >
          Perguntas Frequentes (FAQ)
        </button>
      </div>

      {/* TAB 1: Mission & Pillars */}
      {activeTab === 'mission' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#171426] border border-purple-50/80 dark:border-purple-950/40 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Intencionalidade
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Em vez de excesso de estímulos e ruído diário, privilegiamos escrita consciente, profundidade e foco.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#171426] border border-purple-50/80 dark:border-purple-950/40 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center mb-4">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Comunidade Aberta
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Cada artigo é um convite à troca respeitosa de ideias através do nosso espaço de comentários integrado.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#171426] border border-purple-50/80 dark:border-purple-950/40 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Simplicidade & Elegância
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Design concebido para facilitar a leitura sem distrações, anúncios intrusivos ou pop-ups invasivos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Gear & Studio Setup */}
      {activeTab === 'gear' && (
        <div className="bg-white dark:bg-[#171426] p-6 sm:p-8 rounded-3xl border border-purple-50/80 dark:border-purple-950/40 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-[#7C3AED]" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Ferramentas de Gestão, Software & Metodologias
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Análise Financeira & Cálculo</span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Microsoft Excel Avançado & Modelagem</h4>
              <p className="text-xs text-slate-500">Tabelas dinâmicas, fórmulas condicionais, dashboards de KPI, análise de rentabilidade e ponto de equilíbrio.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Sistemas de Gestão Empresarial</span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Software ERP & Faturação Comercial</h4>
              <p className="text-xs text-slate-500">Operação em módulos de faturação, contas correntes, stocks e conformidade fiscal (ex: Primavera, PHC, Moloni).</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Visualização de Dados</span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Power BI & Relatórios Executivos</h4>
              <p className="text-xs text-slate-500">Construção de relatórios interativos para apoio à tomada de decisão e análise comparativa de receitas e despesas.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Organização & Métodos Ágeis</span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Notion, Trello (Kanban) & Google Workspace</h4>
              <p className="text-xs text-slate-500">Gestão de cronogramas da PAP, reuniões de equipa, atas e documentação empresarial estruturada.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FAQ */}
      {activeTab === 'faq' && (
        <div className="bg-white dark:bg-[#171426] p-6 sm:p-8 rounded-3xl border border-purple-50/80 dark:border-purple-950/40 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="w-6 h-6 text-[#7C3AED]" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Perguntas Frequentes
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-100 dark:border-purple-950/60 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-800 dark:text-slate-200 hover:text-[#7C3AED] transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-purple-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-purple-950/30 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
