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
  CheckCircle2
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';

export const AboutView: React.FC = () => {
  const { currentUser } = useBlog();
  const author = {
    name: currentUser?.name || 'Admin InsideOut',
    avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    role: currentUser?.role === 'admin' ? 'Editor & Administrador' : 'Autor Editorial',
    bio: currentUser?.bio || 'Administrador e autor principal da plataforma Lume. Escrevendo sobre foco, hábitos e minimalismo.',
  };

  const [activeTab, setActiveTab] = useState<'mission' | 'gear' | 'faq'>('mission');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Com que frequência são publicados novos artigos?',
      a: 'Publicamos habitualmente 2 a 3 ensaios por semana, sempre às terças e quintas-feiras, com foco em qualidade e profundidade editorial em vez de volume superficial.'
    },
    {
      q: 'Posso utilizar as fotografias da galeria nos meus projetos?',
      a: 'Sim! As fotografias capturadas e partilhadas na galeria estão sob licença Creative Commons com atribuição ao Lume e ao respetivo fotógrafo.'
    },
    {
      q: 'Como posso sugerir um tema ou colaborar com um artigo?',
      a: 'Podes aceder à secção "Contato" e enviar a tua proposta de artigo ou tema. Respondemos habitualmente em menos de 48 horas úteis.'
    },
    {
      q: 'Como funciona o registo de conta no Lume?',
      a: 'O registo é 100% gratuito e permite guardar os teus artigos favoritos, acompanhar o teu histórico de leituras e participar com comentários nas publicações.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in space-y-10">
      {/* Hero Banner */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold text-[#7C3AED] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sobre o Projeto</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Lume: O espaço das boas ideias
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Um refúgio digital criado para cultivar clareza mental, boas conversas e partilha aberta
          de reflexões sobre tecnologia, hábitos duradouros e estética fotográfica.
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
              <Camera className="w-4 h-4 text-purple-500" />
              Fotógrafo & Desenvolvedor
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-500" />
              Ensaios Reflexivos
            </span>
            <span className="flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-purple-500" />
              Cultura Minimalista
            </span>
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
          Filosofia & Pilares
        </button>

        <button
          onClick={() => setActiveTab('gear')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'gear'
              ? 'bg-[#7C3AED] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
          }`}
        >
          Equipamento & Setup
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
              O que usamos para criar e fotografar
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Câmara Principal</span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Sony Alpha 7 IV (Full Frame)</h4>
              <p className="text-xs text-slate-500">Sensor de 33MP, cores precisas e excelente alcance dinâmico para crepúsculo.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Câmara Compacta</span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Fujifilm X-T5 & Leica Q2</h4>
              <p className="text-xs text-slate-500">Para fotografia de rua, café e notas visuais diárias discretas.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Objetivas Prediletas</span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">FE 24-70mm f/2.8 GM II & 35mm f/1.4</h4>
              <p className="text-xs text-slate-500">Nitidez cirúrgica e bokeh orgânico para composições minimalistas.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Ambiente de Trabalho</span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">MacBook Pro M3 Max & Monitor 4K</h4>
              <p className="text-xs text-slate-500">Teclado mecânico com switches lineares suaves e iluminação quente de 2700K.</p>
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
