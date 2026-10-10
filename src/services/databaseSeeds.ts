import { ref, set, get } from 'firebase/database';
import { rtdb } from './firebase';
import { Post, Category, Photo, Comment, User, BannerItem, DigitalCurriculum } from '../types';
import { defaultCurriculumData } from '../data/defaultCurriculum';

export const seedCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Gestão Empresarial',
    slug: 'gestao-empresarial',
    iconName: 'folder',
    count: 4,
  },
  {
    id: 'cat-2',
    name: 'Finanças & Contabilidade',
    slug: 'financas-contabilidade',
    iconName: 'laptop',
    count: 3,
  },
  {
    id: 'cat-3',
    name: 'Projetos & PAP',
    slug: 'projetos-pap',
    iconName: 'graduation-cap',
    count: 3,
  },
  {
    id: 'cat-4',
    name: 'Tecnologia & BI',
    slug: 'tecnologia-bi',
    iconName: 'sparkles',
    count: 3,
  },
  {
    id: 'cat-5',
    name: 'Liderança & Simulação',
    slug: 'lideranca-simulacao',
    iconName: 'user',
    count: 2,
  },
  {
    id: 'cat-6',
    name: 'Educação & Exames',
    slug: 'educacao-exames',
    iconName: 'coffee',
    count: 2,
  },
];

export const seedUsers: User[] = [
  {
    id: 'user-admin-main',
    name: 'Mariana Costa',
    email: 'insideouttecnologies@gmail.com',
    password: 'adminPassword123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80',
    bio: 'Estudante finalista do 13º ano de Gestão Empresarial. Apaixonada por estratégia, finanças práticas e liderança jovem.',
    role: 'admin',
    createdAt: '01 de Setembro, 2026',
    savedPostIds: ['post-1', 'post-3'],
    likedPostIds: ['post-1', 'post-2', 'post-3'],
    readHistoryIds: ['post-1', 'post-2'],
  },
  {
    id: 'user-mentor',
    name: 'Prof. António Carvalho',
    email: 'antonio.carvalho@escola.pt',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    bio: 'Docente de Economia e Gestão | Orientador de PAP.',
    role: 'reader',
    createdAt: '05 de Setembro, 2026',
    savedPostIds: ['post-1'],
    likedPostIds: ['post-1'],
    readHistoryIds: ['post-1'],
  },
  {
    id: 'user-carlos-tutor',
    name: 'Dr. Carlos Mendonça',
    email: 'carlos.mendonca@gestao.pt',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    bio: 'Diretor Financeiro & Tutor de Estágio Curricular (FCT). Mentor de jovens talentos.',
    role: 'reader',
    createdAt: '08 de Setembro, 2026',
    savedPostIds: ['post-2', 'post-3'],
    likedPostIds: ['post-2'],
    readHistoryIds: ['post-2', 'post-3'],
  },
  {
    id: 'user-student',
    name: 'Inês Pires',
    email: 'ines.pires@aluno.pt',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    bio: 'Colega de curso no 13º ano. Focada em Marketing Digital e RH.',
    role: 'reader',
    createdAt: '10 de Setembro, 2026',
    savedPostIds: ['post-2', 'post-4'],
    likedPostIds: ['post-2'],
    readHistoryIds: ['post-2'],
  },
  {
    id: 'user-visitor-simulated',
    name: 'Visitante / Leitor Convidado',
    email: 'visitante@lume.pt',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    bio: 'Leitor assíduo de conteúdos de gestão e produtividade.',
    role: 'reader',
    createdAt: '15 de Setembro, 2026',
    savedPostIds: [],
    likedPostIds: [],
    readHistoryIds: [],
  },
];

const authorMariana = {
  name: 'Mariana Costa',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80',
  role: 'Estudante do 13º Ano de Gestão Empresarial',
  bio: 'Finalista do 13º ano do Curso Técnico de Gestão Empresarial. Escrevendo sobre estratégia organizacional, finanças e PAP.',
};

export const seedPosts: Post[] = [
  {
    id: 'post-1',
    slug: 'como-estruturar-pap-gestao-empresarial-13-ano',
    title: 'Como Estruturar uma PAP (Prova de Aptidão Profissional) de Sucesso no 13º Ano',
    excerpt: 'Guia prático e estruturado para desenvolver o Plano de Negócios da PAP, desde a ideia inicial até à defesa perante o júri de avaliação.',
    content: `A Prova de Aptidão Profissional (PAP) é o ponto alto do 13º ano nos cursos profissionais e técnicos de Gestão Empresarial. Representa a oportunidade de aplicar, num projeto real e integrado, todos os conhecimentos adquiridos ao longo do ciclo formativo: Contabilidade, Marketing, Cálculo Financeiro, Direito Empresarial e Organização Organizacional.

### 1. Escolha da Ideia e Proposta de Valor
O primeiro passo fundamental é identificar uma lacuna de mercado ou uma oportunidade sustentável. No meu projeto, optei por uma empresa de logística urbana ecológica, aliando viabilidade comercial a princípios de responsabilidade ambiental (ESG).

### 2. Análise Estratégica (SWOT e PESTAL)
Antes de avançar para os números, é essencial conhecer a envolvente:
- **Forças (Strengths):** Flexibilidade operacional e foco digital.
- **Fraquezas (Weaknesses):** Necessidade de capital intensivo inicial.
- **Oportunidades (Opportunities):** Transição verde e incentivos comunitários.
- **Ameaças (Threats):** Concorrência de operadores consolidados.

### 3. O Estudo Económico-Financeiro
A espinha dorsal de qualquer plano de negócios é o modelo financeiro:
- Cálculo do Investimento Inicial (Capex e Opex).
- Demonstração de Resultados Previsional a 3 e 5 anos.
- Ponto de Equilíbrio (Break-Even Point em quantidade e valor).
- Critérios de Decisão de Investimento: Valor Atual Líquido (VAL), Taxa Interna de Rentabilidade (TIR) e Período de Recuperação do Investimento (Payback).

### 4. Dicas para a Apresentação e Defesa
1. **Domínio dos Dados:** Saiba de cor as premissas das suas vendas e margens.
2. **Visual Limpo:** Utilize slides no formato 16:9, com tabelas sintetizadas e gráficos em vez de texto denso.
3. **Simulação de Perguntas:** Antecipe questões críticas dos jurados sobre riscos de tesouraria.`,
    coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    category: 'Projetos & PAP',
    readTime: '7 min de leitura',
    date: '08 de Outubro, 2026',
    views: '4.2k',
    viewCount: 4200,
    likes: 184,
    isFeatured: true,
    author: authorMariana,
    tags: ['PAP', 'Gestão', 'Business Plan', '13º Ano', 'Finanças'],
  },
  {
    id: 'post-2',
    slug: 'analise-financeira-pratica-balanco-demonstracao-resultados',
    title: 'Análise Financeira Prática: Como Interpretar Balanços e Demonstrações de Resultados',
    excerpt: 'Desmistificando os principais rácios de liquidez, solvabilidade e rentabilidade para pequenas e médias empresas.',
    content: `Muitos estudantes sentem receio quando ouvem falar de análise de demonstrações financeiras. No entanto, quando entendemos a lógica por trás de cada rubrica, o balanço e a demonstração de resultados transformam-se numa verdadeira radiografia da saúde económica de qualquer organização.

### A Estrutura Básica do Balanço
O Balanço reflete a posição patrimonial da empresa num momento fixo:
- **Ativo:** O que a empresa possui ou tem a receber (Bens e Direitos).
- **Passivo:** O que a empresa deve a terceiros (Obrigações com bancos, fornecedores e Estado).
- **Capital Próprio:** O valor líquido que pertence aos sócios/acionistas (Ativo - Passivo).

### Rácios Fundamentais de Liquidez
1. **Liquidez Geral:** Ativo Corrente / Passivo Corrente (Idealmente superior a 1,2 para assegurar que os compromissos de curto prazo estão cobertos).
2. **Fundo de Maneio Líquido:** Ativo Corrente - Passivo Corrente. Revela a margem de segurança operacional para suportar o ciclo de exploração.

### A Demonstração de Resultados e Margens
Diferente do Balanço, a DR mede a performance dinâmica ao longo do período:
- **EBITDA:** Resultado antes de juros, impostos, amortizações e depreciações. É o indicador puro da capacidade de gerar caixa operacional.
- **Margem Líquida:** Resultado Líquido / Volume de Negócios. Mostra quantos cêntimos de lucro sobram por cada euro faturado.

Dominar estas métricas permitiu-me analisar com confiança relatórios de contas durante o meu estágio curricular e preparar projeções robustas para a PAP.`,
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    category: 'Finanças & Contabilidade',
    readTime: '6 min de leitura',
    date: '02 de Outubro, 2026',
    views: '3.8k',
    viewCount: 3800,
    likes: 156,
    isFeatured: false,
    author: authorMariana,
    tags: ['Contabilidade', 'Rácios', 'Balanço', 'EBITDA', 'Gestão'],
  },
  {
    id: 'post-3',
    slug: 'excel-power-bi-controlo-gestao-dashboards',
    title: 'Microsoft Excel e Power BI no Controlo de Gestão: Do Zero ao Dashboard Executivo',
    excerpt: 'As fórmulas essenciais e técnicas de visualização de dados que utilizei no estágio para automatizar o controlo orçamental.',
    content: `No mercado de trabalho atual, dominar ferramentas de produtividade e análise de dados não é um diferencial: é um requisito básico. No Curso de Gestão Empresarial, o Excel é o nosso companheiro diário, e o Power BI eleva essa capacidade para relatórios executivos de alto nível.

### As 5 Fórmulas Mais Poderosas no Excel para Gestão
1. **XLOOKUP (PROCX):** O sucessor moderno do PROCV. Permite pesquisas bidirecionais sem falhas e com tratamento nativo de erros.
2. **SUMIFS (SOMA.SE.S):** Indispensável para somar custos filtrados por centro de custo, mês e categoria.
3. **LET:** Permite definir variáveis dentro da fórmula, tornando cálculos complexos muito mais rápidos e legíveis.
4. **Tabelas Dinâmicas (Pivot Tables):** Para agregar milhares de linhas de faturação em segundos.
5. **Formatação Condicional com Fórmulas:** Para destacar instantaneamente desvios orçamentais superiores a 10%.

### A Transição para o Power BI
Ao conectar o Power BI a ficheiros Excel ou ao ERP da empresa, passamos de tabelas estáticas para painéis interativos:
- Criação de medidas em DAX (Year-over-Year, Margem Bruta acumulada).
- Filtros sincronizados por trimestre, região e vendedor.
- Visualização de KPIs com metas dinâmicas.

A automação destes mapas libertou mais de 5 horas semanais na rotina administrativa do meu estágio, permitindo focar em análise e interpretação em vez de preenchimento manual.`,
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    category: 'Tecnologia & BI',
    readTime: '5 min de leitura',
    date: '26 de Setembro, 2026',
    views: '5.1k',
    viewCount: 5100,
    likes: 210,
    isFeatured: true,
    author: authorMariana,
    tags: ['Excel', 'Power BI', 'BI', 'Dashboards', 'Automação'],
  },
  {
    id: 'post-4',
    slug: 'experiencia-diretora-financeira-empresa-simulada',
    title: 'A Minha Experiência como Diretora Financeira na Empresa Simulada Escolar',
    excerpt: 'Como a simulação empresarial desenvolve competências reais de negociação, liderança de equipas e tomada de decisões sob pressão.',
    content: `Durante o 12º e 13º ano, o projeto de Simulação Empresarial colocou a nossa turma a gerir uma empresa modelo em concorrência com outras escolas da rede nacional. Tive o desafio e a honra de assumir a Direção Financeira.

### As Responsabilidades Reais do Cargo
- **Gestão de Tesouraria:** Garantir liquidez diária para pagamento de salários simulados, impostos e fornecedores.
- **Emissão e Controlo de Ordens de Pagamento:** Conciliar extratos bancários e emitir faturas no software comercial.
- **Orçamentação:** Fixar limites de despesa para os departamentos de Marketing e Recursos Humanos.

### As Principais Lições Aprendidas
1. **Comunicação é Tudo:** Nem todas as decisões financeiras são populares. Explicar com empatia porque é que um orçamento de campanha publicitária precisava de ser revisto ensinou-me negociação construtiva.
2. **Rigor nos Detalhes:** Um pequeno erro numa fórmula de IVA afeta toda a cadeia de cálculo da faturação.
3. **Resiliência:** Quando as vendas mensais ficaram abaixo da meta, tivemos de renegociar prazos e reduzir custos sem comprometer a qualidade do serviço.`,
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    category: 'Liderança & Simulação',
    readTime: '6 min de leitura',
    date: '18 de Setembro, 2026',
    views: '2.9k',
    viewCount: 2900,
    likes: 132,
    isFeatured: false,
    author: authorMariana,
    tags: ['Simulação', 'Liderança', 'Finanças', 'Trabalho em Equipa'],
  },
  {
    id: 'post-5',
    slug: 'preparacao-ensino-superior-exames-economia-matematica',
    title: 'Preparação para o Ensino Superior: Estratégias de Estudo para Exames de Economia e Matemática',
    excerpt: 'Métodos de estudo ativo, resolução de provas modelo e gestão de tempo para quem termina o 13º ano e ambiciona a universidade.',
    content: `Concluir o 13º ano com média de excelência e, simultaneamente, preparar os exames nacionais de acesso ao Ensino Superior é uma maratona que exige método e equilíbrio mental.

### 1. Organização do Cronograma de Estudos
- **Técnica dos Blocos de Tempo (Time Blocking):** Reserve 90 minutos ininterruptos para resolução de exercícios práticos, seguidos de 15 minutos de descanso.
- **Alternância de Matérias:** Intercale Economia com Matemática Aplicada para manter o cérebro recetivo.

### 2. Resolução Ativa de Provas Anteriores
Apenas reler resumos é um método passivo e pouco eficaz. O segredo está em:
- Resolver exames dos últimos 5 anos sob condições reais de tempo e sem consulta.
- Estudar a fundo os critérios de correção para entender como os tópicos são pontuados.
- Criar um caderno de erros: apontar o motivo de cada questão falhada até consolidar a matéria.

### 3. Cuidado com o Sono e Bem-Estar
Chegar ao dia da prova exausto anula semanas de preparação. Dormir 8 horas e praticar atividade física mantém a memória de longo prazo afiada.`,
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    category: 'Educação & Exames',
    readTime: '5 min de leitura',
    date: '12 de Setembro, 2026',
    views: '3.4k',
    viewCount: 3400,
    likes: 167,
    isFeatured: false,
    author: authorMariana,
    tags: ['Exames', 'Economia', 'Matemática', 'Ensino Superior', 'Estudo'],
  },
  {
    id: 'post-6',
    slug: 'modelos-negocio-sustentaveis-esg-gestao-moderna',
    title: 'Modelos de Negócio Sustentáveis e Princípios ESG na Gestão Moderna',
    excerpt: 'Porque é que as organizações que priorizam sustentabilidade ambiental, governança e responsabilidade social superam o mercado.',
    content: `Os critérios ESG (Environmental, Social and Governance) deixaram de ser um tema periférico de relações públicas para se tornarem o núcleo da estratégia empresarial moderna.

### O Triplo Resultado (Triple Bottom Line)
A gestão tradicional focava exclusivamente no lucro financeiro (Profit). A gestão do século XXI avalia o desempenho em três dimensões integradas:
1. **Pessoas (People):** Bem-estar dos colaboradores, igualdade de oportunidades, segurança e impacto na comunidade local.
2. **Planeta (Planet):** Eficiência energética, redução da pegada carbónica e economia circular.
3. **Prosperidade (Profit):** Viabilidade económica duradoura e governança ética transparente.

### Vantagens Competitivas Tangíveis
- **Acesso a Financiamento:** Linhas de crédito bancário com taxas de juro bonificadas para projetos certificados como verdes.
- **Retenção de Talento:** As novas gerações de profissionais escolhem empresas com propósito autêntico.
- **Lealdade do Consumidor:** Clientes valorizam embalagens recicláveis, cadeias de fornecimento éticas e transparência corporativa.`,
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    category: 'Gestão Empresarial',
    readTime: '6 min de leitura',
    date: '05 de Setembro, 2026',
    views: '2.8k',
    viewCount: 2800,
    likes: 145,
    isFeatured: false,
    author: authorMariana,
    tags: ['ESG', 'Sustentabilidade', 'Estratégia', 'Inovação'],
  },
  {
    id: 'post-7',
    slug: 'guia-controlo-orcamental-tesouraria-pequenas-empresas',
    title: 'Guia de Controlo Orçamental e Gestão de Tesouraria para PMEs',
    excerpt: 'Metodologias práticas para gerir fluxos de caixa, calcular desvios orçamentais e evitar ruturas de liquidez.',
    content: `Uma empresa pode ser rentável no papel e, ainda assim, entrar em insolvência se ficar sem liquidez na conta bancária. Este é um dos princípios basilares que aprendemos no módulo de Cálculo Financeiro e Gestão de Tesouraria no 13º ano.

### O Mapa de Fluxos de Caixa (Cash Flow)
A distinção entre proveito/custo e recebimento/pagamento é crucial:
- **Fluxos Operacionais:** Recebimentos de clientes deduzidos de pagamentos a fornecedores, salários e impostos.
- **Fluxos de Investimento:** Aquisições ou alienações de equipamentos e software.
- **Fluxos de Financiamento:** Empréstimos bancários contraídos ou reembolsados.

### Metodologia dos 3 Cenários
Para garantir segurança financeira nas decisões da PAP e no estágio:
1. **Cenário Realista:** Baseado no histórico e contratos confirmados.
2. **Cenário Otimista (+15% em vendas):** Para prever necessidades extras de stock e tesouraria.
3. **Cenário Pessimista (-20% em vendas):** Para identificar imediatamente custos fixos que teriam de ser cortados.`,
    coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    category: 'Finanças & Contabilidade',
    readTime: '5 min de leitura',
    date: '28 de Agosto, 2026',
    views: '3.1k',
    viewCount: 3100,
    likes: 158,
    isFeatured: false,
    author: authorMariana,
    tags: ['Tesouraria', 'Orçamento', 'Finanças', 'Cash Flow', 'PME'],
  },
  {
    id: 'post-8',
    slug: 'preparacao-estagio-curricular-fct-direitos-relatorio',
    title: 'Preparação para o Estágio Curricular (FCT): Direitos, Deveres e Relatório de Sucesso',
    excerpt: 'Como tirar o máximo partido das 400 horas de Formação em Contexto de Trabalho no 13º ano de Gestão.',
    content: `A Formação em Contexto de Trabalho (FCT) é o momento da verdade no 13º ano dos cursos profissionais. Durante as cerca de 400 horas de estágio numa empresa real, deixamos as simulações em sala de aula e passamos a lidar com clientes, fornecedores e rotinas fiscais reais.

### 1. Postura Profissional no Primeiro Dia
- **Pontualidade e Rigor:** Chegar 10 minutos antes demonstra respeito pela equipa.
- **Caderno de Anotações:** Nunca confie apenas na memória; aponte processos, acessos e instruções logo na primeira explicação.
- **Curiosidade Ativa:** Peça para acompanhar tarefas de departamentos vizinhos (compras, faturação, recursos humanos).

### 2. O Relatório de Estágio Passo a Passo
- **Identificação da Entidade Acolhedora:** Enquadramento setorial, organograma e missão.
- **Tarefas Desempenhadas:** Descrição detalhada dos softwares utilizados (ex: Primavera BSS, Excel, SAP).
- **Autoavaliação e Contributo:** Que melhorias ou automatizações foram sugeridas à empresa.`,
    coverImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    category: 'Educação & Exames',
    readTime: '6 min de leitura',
    date: '20 de Agosto, 2026',
    views: '3.6k',
    viewCount: 3600,
    likes: 177,
    isFeatured: false,
    author: authorMariana,
    tags: ['FCT', 'Estágio', '13º Ano', 'Relatório', 'Carreira'],
  },
];

export const seedGallery: Photo[] = [
  {
    id: 'photo-1',
    title: 'Apresentação da Prova de Aptidão Profissional (PAP)',
    caption: 'Defesa do Plano de Negócios perante o júri de avaliação no auditório principal.',
    category: 'Projetos',
    imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    date: '05 de Outubro, 2026',
    location: 'Auditório da Escola Profissional',
    likes: 89,
    exif: {
      camera: 'Sony Alpha 7 IV',
      lens: 'FE 24-70mm f/2.8 GM II',
      aperture: 'f/2.8',
      shutterSpeed: '1/250s',
      iso: '800',
    },
  },
  {
    id: 'photo-2',
    title: 'Ambiente de Trabalho e Modelagem Financeira',
    caption: 'Construção de mapas predimensionais em Excel e dashboards Power BI durante o estágio curricular.',
    category: 'Workspace',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    date: '28 de Setembro, 2026',
    location: 'Gabinete Financeiro, Lisboa',
    likes: 124,
    exif: {
      camera: 'Fujifilm X-T5',
      lens: 'XF 33mm f/1.4 R LM WR',
      aperture: 'f/2.0',
      shutterSpeed: '1/160s',
      iso: '400',
    },
  },
  {
    id: 'photo-3',
    title: 'Reunião de Simulação Empresarial',
    caption: 'Alinhamento orçamental e negociação de contratos simulados com a equipa de colegas.',
    category: 'Liderança',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    date: '15 de Setembro, 2026',
    location: 'Sala de Empreendedorismo',
    likes: 95,
    exif: {
      camera: 'Sony Alpha 7 IV',
      lens: 'FE 35mm f/1.4 GM',
      aperture: 'f/2.8',
      shutterSpeed: '1/200s',
      iso: '640',
    },
  },
  {
    id: 'photo-4',
    title: 'Visita ao Hub de Inovação de Lisboa',
    caption: 'Encontro com founders de startups e partilha de modelos de negócio sustentáveis.',
    category: 'Eventos',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    date: '02 de Setembro, 2026',
    location: 'Hub Criativo do Beato, Lisboa',
    likes: 110,
    exif: {
      camera: 'Leica Q2',
      lens: 'Summilux 28mm f/1.7 ASPH',
      aperture: 'f/2.8',
      shutterSpeed: '1/320s',
      iso: '200',
    },
  },
  {
    id: 'photo-5',
    title: 'Biblioteca e Preparação para os Exames',
    caption: 'Sessões intensivas de estudo de Economia e Matemática Aplicada.',
    category: 'Estudo',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
    date: '20 de Agosto, 2026',
    location: 'Biblioteca Municipal, Porto',
    likes: 78,
    exif: {
      camera: 'Fujifilm X-T5',
      lens: 'XF 23mm f/2.0 R WR',
      aperture: 'f/2.0',
      shutterSpeed: '1/125s',
      iso: '500',
    },
  },
  {
    id: 'photo-6',
    title: 'Cerimónia de Prémio de Empreendedorismo Regional',
    caption: 'Distinção do projeto de PAP no concurso inter-escolas de ideias inovadoras.',
    category: 'Conquistas',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    date: '10 de Julho, 2026',
    location: 'Palácio da Bolsa, Porto',
    likes: 142,
    exif: {
      camera: 'Sony Alpha 7 IV',
      lens: 'FE 24-70mm f/2.8 GM II',
      aperture: 'f/3.2',
      shutterSpeed: '1/250s',
      iso: '1000',
    },
  },
];

export const seedComments: Record<string, Comment[]> = {
  'post-1': [
    {
      id: 'comm-101',
      postId: 'post-1',
      authorName: 'Prof. António Carvalho',
      authorEmail: 'antonio.carvalho@escola.pt',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      content: 'Excelente síntese, Mariana! A clareza com que explicas a ligação entre a análise SWOT e os fluxos de caixa é exemplar para todos os alunos do 13º ano.',
      createdAt: '08 de Outubro, 2026 às 16:30',
      likes: 12,
    },
    {
      id: 'comm-102',
      postId: 'post-1',
      authorName: 'Inês Pires',
      authorEmail: 'ines.pires@aluno.pt',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
      content: 'Muito obrigada pelas dicas para a defesa! Vou utilizar a sugestão de antecipar as perguntas sobre tesouraria na minha apresentação.',
      createdAt: '09 de Outubro, 2026 às 11:15',
      likes: 5,
    },
  ],
  'post-3': [
    {
      id: 'comm-103',
      postId: 'post-3',
      authorName: 'Visitante / Leitor Convidado',
      authorEmail: 'visitante@lume.pt',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      content: 'O PROCX e o SUMIFS mudaram completamente o meu dia-a-dia de estágio. Parabéns pela partilha deste conteúdo tão prático!',
      createdAt: '27 de Setembro, 2026 às 14:20',
      likes: 8,
    },
  ],
  'post-2': [
    {
      id: 'comm-104',
      postId: 'post-2',
      authorName: 'Dr. Carlos Mendonça',
      authorEmail: 'carlos.mendonca@gestao.pt',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      content: 'Excelente abordagem à interpretação do Fundo de Maneio e EBITDA. A análise dinâmica de tesouraria é fundamental para o sucesso de qualquer jovem gestor.',
      createdAt: '03 de Outubro, 2026 às 10:45',
      likes: 9,
    },
  ],
  'post-7': [
    {
      id: 'comm-105',
      postId: 'post-7',
      authorName: 'Prof. António Carvalho',
      authorEmail: 'antonio.carvalho@escola.pt',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      content: 'A metodologia dos três cenários (otimista, realista e pessimista) deve constar obrigatoriamente em todos os relatórios de PAP. Muito bem sintetizado!',
      createdAt: '29 de Agosto, 2026 às 18:00',
      likes: 7,
    },
  ],
  'post-8': [
    {
      id: 'comm-106',
      postId: 'post-8',
      authorName: 'Inês Pires',
      authorEmail: 'ines.pires@aluno.pt',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
      content: 'Dicas valiosas para quem vai agora iniciar as 400 horas de FCT! O caderno de processos salva mesmo qualquer estagiário nos primeiros dias.',
      createdAt: '22 de Agosto, 2026 às 15:10',
      likes: 11,
    },
  ],
};

export const seedBannerItems: BannerItem[] = [
  {
    id: 'banner-item-1',
    title: 'Portfólio de Gestão Empresarial & Currículo Digital',
    subtitle: 'Finalista do 13º ano. Ensaios analíticos, simulação empresarial, finanças e Prova de Aptidão Profissional (PAP).',
    badge: 'Gestão 13º Ano',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'Ver Currículo & Portfólio',
    ctaLink: 'curriculum',
    authorName: 'Mariana Costa',
    active: true,
  },
  {
    id: 'banner-item-2',
    title: 'Projetos em Destaque & Prova de Aptidão Profissional',
    subtitle: 'Plano de negócios sustentável, viabilidade económico-financeira e estudo de mercado premiado.',
    badge: 'PAP Nota 18',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'Explorar Artigos',
    ctaLink: 'articles',
    authorName: 'Mariana Costa',
    active: true,
  },
  {
    id: 'banner-item-3',
    title: 'Galeria Fotográfica & Vivências no 13º Ano',
    subtitle: 'Registos visuais das apresentações, estágios em contexto de trabalho (FCT) e conferências.',
    badge: 'Galeria Autoral',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'Ver Galeria',
    ctaLink: 'gallery',
    authorName: 'Mariana Costa',
    active: true,
  },
];

/**
 * Seeds all entities into Firebase Realtime Database
 */
export const seedAllDatabaseData = async (force: boolean = false): Promise<{ success: boolean; message: string; seededCount: any }> => {
  try {
    // 1. Check if posts already exist
    const postsSnap = await get(ref(rtdb, 'posts'));
    const shouldSeed = force || !postsSnap.exists() || Object.keys(postsSnap.val() || {}).length < 8;

    if (!shouldSeed) {
      return {
        success: true,
        message: 'Base de dados já possui dados suficientes.',
        seededCount: { alreadySeeded: true },
      };
    }

    // 2. Seed Categories
    const categoriesMap: Record<string, Category> = {};
    seedCategories.forEach((c) => {
      categoriesMap[c.id] = c;
    });
    await set(ref(rtdb, 'categories'), categoriesMap);

    // 3. Seed Posts
    const postsMap: Record<string, Post> = {};
    seedPosts.forEach((p) => {
      postsMap[p.id] = p;
    });
    await set(ref(rtdb, 'posts'), postsMap);

    // 4. Seed Gallery
    const galleryMap: Record<string, Photo> = {};
    seedGallery.forEach((ph) => {
      galleryMap[ph.id] = ph;
    });
    await set(ref(rtdb, 'gallery'), galleryMap);

    // 5. Seed Comments
    await set(ref(rtdb, 'comments'), seedComments);

    // 6. Seed Banner Items
    await set(ref(rtdb, 'bannerItems'), seedBannerItems);

    // 7. Seed Users
    const usersMap: Record<string, User> = {};
    seedUsers.forEach((u) => {
      usersMap[u.id] = u;
    });
    await set(ref(rtdb, 'users'), usersMap);

    // 8. Seed Digital Curriculum
    await set(ref(rtdb, 'curriculum'), defaultCurriculumData);

    // 9. Watermark
    await set(ref(rtdb, 'system/seeds'), {
      seededAt: new Date().toISOString(),
      version: 'v2026.10.10_gestao_empresarial_complete',
      postsCount: seedPosts.length,
      categoriesCount: seedCategories.length,
      galleryCount: seedGallery.length,
    });

    return {
      success: true,
      message: 'Base de dados semeada com sucesso com artigos de Gestão Empresarial, galeria, comentários e currículo!',
      seededCount: {
        posts: seedPosts.length,
        categories: seedCategories.length,
        gallery: seedGallery.length,
        bannerItems: seedBannerItems.length,
        users: seedUsers.length,
      },
    };
  } catch (err: any) {
    console.error('Erro ao semear base de dados no Firebase:', err);
    return {
      success: false,
      message: `Erro ao semear banco de dados: ${err.message}`,
      seededCount: null,
    };
  }
};
