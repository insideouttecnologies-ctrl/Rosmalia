import { DigitalCurriculum } from '../types';

export const defaultCurriculumData: DigitalCurriculum = {
  profile: {
    fullName: 'Mariana Costa',
    headline: 'Estudante Finalista do 13º Ano de Gestão Empresarial | Estratégia, Análise Financeira & Empreendedorismo',
    summary:
      'Finalista dedicada do 13º ano do Curso Profissional Técnico de Gestão Empresarial. Experiência prática em gestão operacional, contabilidade financeira, orçamentação e análise de dados em Excel avançado e Power BI. Conclusão da Prova de Aptidão Profissional (PAP) com foco em modelos de negócios sustentáveis e estágio curricular (FCT). Dinâmica, organizada e com forte espírito de liderança e comunicação interpessoal.',
    email: 'mariana.costa.gestao@gmail.com',
    phone: '+351 925 184 729',
    location: 'Lisboa / Porto, Portugal',
    website: 'https://lume-portfolio.web.app',
    linkedin: 'https://linkedin.com/in/mariana-costa-gestao',
    github: 'https://github.com/marianacosta-gestao',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    statusBadge: 'Finalista 13º Ano • Disponível para Estágio & Projetos',
    updatedAt: 'Ano Letivo 2025/2026',
  },
  customCategories: [
    'Educação & Formação',
    'Experiência & Estágios',
    'Competências de Gestão',
    'Projetos & PAP',
    'Certificações',
    'Idiomas',
  ],
  items: [
    // Educação & Formação
    {
      id: 'edu-1',
      category: 'Educação & Formação',
      title: 'Curso Profissional Técnico de Gestão Empresarial (13º Ano)',
      subtitle: 'Escola Secundária e Profissional de Gestão & Tecnologia',
      period: '2023 - 2026 (Ano Corrente)',
      location: 'Portugal',
      description:
        'Ciclo formativo de nível 4 do QNQ/QEQ. Formação aprofundada em Contabilidade Financeira e de Gestão, Cálculo Financeiro, Direito Empresarial e do Trabalho, Gestão de Recursos Humanos, Marketing Estratégico, Economia e Organização de Empresas. Média atual de 17 valores.',
      tags: ['Contabilidade', 'Cálculo Financeiro', 'Direito Empresarial', 'Marketing', 'PAP'],
      order: 1,
    },
    {
      id: 'edu-2',
      category: 'Educação & Formação',
      title: 'Preparação para Acesso ao Ensino Superior',
      subtitle: 'Exames Nacionais de Economia & Matemática Aplicada',
      period: '2025 - 2026',
      location: 'Portugal',
      description:
        'Preparação intensiva para prosseguimento de estudos na Licenciatura em Gestão de Empresas / Economia, com foco nas provas de ingresso e métodos quantitativos.',
      tags: ['Economia', 'Matemática Aplicada', 'Ensino Superior'],
      order: 2,
    },

    // Experiência & Estágios
    {
      id: 'exp-1',
      category: 'Experiência & Estágios',
      title: 'Estágio Curricular em Gestão & Operações (FCT)',
      subtitle: 'Inovação & Consultoria Empresarial, Lda.',
      period: '2025 - 2026 (420 Horas)',
      location: 'Lisboa / Híbrido',
      description:
        'Formação em Contexto de Trabalho (FCT). Apoio direto ao departamento financeiro e de recursos humanos: reconciliação bancária, lançamento de faturas em software de faturação/ERP, elaboração de mapas de controlo de tesouraria em Excel e organização de dossiers fiscais.',
      tags: ['FCT', 'ERP/Software Faturação', 'Reconciliação Bancária', 'Excel Avançado', 'Organização'],
      order: 3,
    },
    {
      id: 'exp-2',
      category: 'Experiência & Estágios',
      title: 'Diretora Financeira da Empresa Simulada Escolar',
      subtitle: 'Projeto Educativo de Simulação Empresarial',
      period: '2024 - 2025',
      location: 'Escola Profissional',
      description:
        'Liderança da equipa financeira numa empresa modelo: planeamento de orçamentos mensais, cálculo de ponto de equilíbrio (break-even), negociação com fornecedores simulados e apresentação de relatórios de contas à administração.',
      tags: ['Simulação Empresarial', 'Orçamentação', 'Liderança', 'Break-even Point', 'Apresentações'],
      order: 4,
    },

    // Competências de Gestão
    {
      id: 'skill-1',
      category: 'Competências de Gestão',
      title: 'Análise Financeira & Contabilidade',
      subtitle: 'Avançado / Prático',
      description:
        'Interpretação de Balanços e Demonstrações de Resultados, rácios de liquidez e rentabilidade, amortizações, reconciliações e noções sólidas de IVA e IRC.',
      tags: ['Balanço', 'Demonstração de Resultados', 'Rácios Financeiros', 'Contabilidade'],
      order: 5,
    },
    {
      id: 'skill-2',
      category: 'Competências de Gestão',
      title: 'Excel para Gestão & Business Intelligence',
      subtitle: 'Especialista / Modelagem',
      description:
        'Tabelas dinâmicas, PROCV/XLOOKUP, funções condicionais aninhadas, gráficos interativos de KPI, dashboards de controlo orçamental e introdução a Power BI.',
      tags: ['Excel Avançado', 'Dashboards', 'KPIs', 'Power BI', 'Automação'],
      order: 6,
    },
    {
      id: 'skill-3',
      category: 'Competências de Gestão',
      title: 'Softwares de Gestão & Faturação (ERP)',
      subtitle: 'Prática em Ambiente de Estágio',
      description:
        'Emissão de faturas, recibos, guias de transporte, gestão de contas correntes de clientes e fornecedores e gestão de inventário.',
      tags: ['Primavera ERP', 'PHC Go', 'Moloni', 'Gestão Comercial'],
      order: 7,
    },
    {
      id: 'skill-4',
      category: 'Competências de Gestão',
      title: 'Comunicação, Negociação & Trabalho de Equipa',
      subtitle: 'Competências Interpessoais',
      description:
        'Capacidade de comunicação clara em contexto corporativo, mediação e resolução de conflitos, rigor no cumprimento de prazos e liderança positiva.',
      tags: ['Liderança Jovem', 'Negociação', 'Resolução de Problemas', 'Comunicação'],
      order: 8,
    },

    // Projetos & PAP
    {
      id: 'proj-1',
      category: 'Projetos & PAP',
      title: 'PAP: Plano de Negócios para Startup de Logística Verde',
      subtitle: 'Prova de Aptidão Profissional (Nota de Projeto: 18 Valores)',
      period: '2025 - 2026',
      description:
        'Elaboração integral de um Business Plan: estudo de mercado concorrencial, plano de marketing digital (4 Ps), estratégia operacional, estudo de viabilidade económico-financeira (VAL, TIR e Payback) e dossier de sustentabilidade ESG.',
      tags: ['PAP', 'Business Plan', 'Estudo de Viabilidade', 'Sustentabilidade', 'Investimento'],
      link: 'https://lume-portfolio.web.app',
      order: 9,
    },
    {
      id: 'proj-2',
      category: 'Projetos & PAP',
      title: '1º Lugar no Concurso Regional de Ideias Empreendedoras',
      subtitle: 'Concurso Inter-Escolas da Região',
      period: '2024',
      description:
        'Apresentação de pitch de 5 minutos perante um júri de investidores e docentes, com demonstração de protótipo de serviço e plano financeiro simplificado.',
      tags: ['Pitch', 'Empreendedorismo', 'Prémio Regional', 'Inovação'],
      order: 10,
    },

    // Certificações
    {
      id: 'cert-1',
      category: 'Certificações',
      title: 'Microsoft Office Specialist: Excel Associate',
      subtitle: 'Certificação Oficial Microsoft',
      period: '2025',
      description:
        'Validação técnica em criação de fórmulas complexas, formatação condicional avançada, gestão de dados e relatórios visuais.',
      tags: ['Microsoft', 'Excel', 'Certificação'],
      order: 11,
    },
    {
      id: 'cert-2',
      category: 'Certificações',
      title: 'Fundamentos de Gestão de Projetos & Metodologias Ágeis',
      subtitle: 'Formação Complementar Online',
      period: '2024',
      description:
        'Introdução aos princípios de Scrum, quadros Kanban (Trello/Asana), estimativa de tarefas e gestão de prazos em equipa.',
      tags: ['Scrum', 'Kanban', 'Gestão de Projetos'],
      order: 12,
    },

    // Idiomas
    {
      id: 'lang-1',
      category: 'Idiomas',
      title: 'Português',
      subtitle: 'Língua Materna',
      description: 'Domínio nativo com excelente redação comercial, contratos e documentação formal.',
      tags: ['Nativo', 'Comunicação Escrita'],
      order: 13,
    },
    {
      id: 'lang-2',
      category: 'Idiomas',
      title: 'Inglês',
      subtitle: 'Nível B2 / Utilizador Independente Avançado',
      description: 'Fluência em conversação de negócios, leitura de artigos de gestão internacional e redação de e-mails corporativos.',
      tags: ['B2', 'Inglês para Negócios'],
      order: 14,
    },
    {
      id: 'lang-3',
      category: 'Idiomas',
      title: 'Espanhol',
      subtitle: 'Nível B1 / Intermédio',
      description: 'Boa compreensão e comunicação em contexto ibérico e comercial.',
      tags: ['B1', 'Conversação'],
      order: 15,
    },
  ],
};
