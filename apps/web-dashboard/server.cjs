const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const multer = require('multer');
const { deployCitySite } = require('./scripts/deployEngine.cjs');

const app = express();
const PORT = 5002;

// Fórmula padrão de metaTitle — regra de ouro 10 (CLAUDE_CODE_GUIDE.md):
// título tem que ficar entre 40 e 60 caracteres, nunca só "≤60". Achado
// real (30/08/2026): uma extensão de auditoria SEO no navegador marcou em
// VERMELHO um título de 36 caracteres por ser CURTO DEMAIS (desperdiça o
// espaço de exibição do Google, ~50-60 chars), não só por estourar o
// limite máximo. A fórmula original ("Desentupidora em {cidade} {uf}
// 24h") ficava entre 31 e 47 chars pra nomes reais de cidade — sempre
// abaixo do mínimo saudável. Correção: adiciona um complemento só quando
// cabe dentro do limite de 60, senão cai pro título curto (nunca estoura
// o máximo pra caber o complemento).
function buildDefaultMetaTitle(cidade, uf) {
  const base = `Desentupidora em ${cidade} ${uf} 24h`;
  const rich = `${base} - Atendimento Rápido`;
  return rich.length <= 60 ? rich : base;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}


app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const CITIES_FILE = path.join(DATA_DIR, 'cities.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const ASTRO_DIR = path.join(__dirname, '..', 'site-template-astro');
const ASTRO_CONFIG_FILE = path.join(ASTRO_DIR, 'src', 'data', 'cityConfig.json');
const ASTRO_PUBLIC_DIR = path.join(ASTRO_DIR, 'public');
const IMAGES_PUBLIC_DIR = path.join(ASTRO_DIR, 'public', 'images');
const REDIRECTS_FILE = path.join(ASTRO_PUBLIC_DIR, '_redirects');
const VERCEL_JSON_FILE = path.join(ASTRO_PUBLIC_DIR, 'vercel.json');

// As imagens ficam DENTRO da pasta pública do site Astro (não em serviço
// externo), pois é essa pasta que é enviada no deploy estático (Cloudflare
// Pages / Vercel / Netlify) — assim a imagem vai junto com o site publicado,
// hospedada de graça no mesmo provedor escolhido para aquela cidade.
if (!fs.existsSync(IMAGES_PUBLIC_DIR)) fs.mkdirSync(IMAGES_PUBLIC_DIR, { recursive: true });

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const cityId = (req.body.cityId || req.query.cityId || 'sem-cidade').replace(/[^a-z0-9\-]/gi, '');
      const dir = path.join(IMAGES_PUBLIC_DIR, cityId);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const kind = (req.body.kind || req.query.kind || 'imagem').replace(/[^a-z0-9\-]/gi, '');
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `${kind}${ext}`);
    }
  }),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return cb(new Error('Tipo de arquivo não permitido. Envie JPG, PNG, WEBP ou SVG.'));
    }
    cb(null, true);
  }
});

// Ensure data files exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(CITIES_FILE)) fs.writeFileSync(CITIES_FILE, '[]', 'utf-8');
if (!fs.existsSync(SETTINGS_FILE)) fs.writeFileSync(SETTINGS_FILE, '{}', 'utf-8');

function readCities() {
  try {
    return JSON.parse(fs.readFileSync(CITIES_FILE, 'utf-8'));
  } catch (e) {
    return [];
  }
}

function writeCities(cities) {
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');
}

function readSettings() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
  } catch (e) {
    return {};
  }
}

function writeSettings(settings) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

function syncCityToAstro(city) {
  try {
    const astroConfig = {
      cidade: city.cidade,
      estado: city.uf === 'ES' ? 'Espírito Santo' : city.uf === 'BA' ? 'Bahia' : city.uf === 'MG' ? 'Minas Gerais' : city.uf === 'PR' ? 'Paraná' : city.uf === 'SP' ? 'São Paulo' : 'Brasil',
      uf: city.uf,
      populacao: city.populacao || '150.000',
      ddd: city.whatsapp ? city.whatsapp.substring(0, 2) : '27',
      whatsapp: city.whatsapp || '27992795590',
      telefoneFixo: city.telefoneFixo || `(${city.whatsapp ? city.whatsapp.substring(0, 2) : '27'}) 3000-0000`,
      empresaNome: city.empresaNome || `Desentupidora ${city.cidade} 24h`,
      cnpj: city.cnpj || '',
      endereco: city.endereco || '',
      hospedagem: city.hospedagem || 'cloudflare',
      // BUG REAL CORRIGIDO (30/08/2026): esse campo nunca era passado pro
      // Astro, então o canonical/og:url/schema (Layout.astro) sempre caía
      // na fórmula "adivinhada" de URL em vez da URL real de deploy — e
      // quando a real tinha sufixo aleatório (Vercel "-zeta", Cloudflare
      // "-sns") ou a cidade era Netlify (fórmula nem cobria esse caso,
      // caía no domínio fake em `dominio`), o canonical publicado ficava
      // errado. Confirmado em produção: Linhares, Curitiba e Poços de
      // Caldas com canonical apontando pra URL/domínio que não é o real.
      deployUrl: city.deployUrl || '',
      paletaCores: city.paletaCores || 'urgencia-azul-laranja',
      logoUrl: city.logoUrl || '',
      logoHeight: city.logoHeight || 64,
      faviconUrl: city.faviconUrl || '',
      heroImage: city.heroImage || '',
      variants: {
        hero: city.heroVariant || 'HeroV1',
        services: city.servicesVariant || 'ServicesGridV1',
        faq: 'FAQV1'
      },
      // Liga/desliga seções da home por modelo (ver cityGenerator.ts) —
      // sem isso, index.astro sempre cai no "tudo ligado" (comportamento
      // antigo, nunca quebra cidade sem esse campo).
      sectionsConfig: city.sectionsConfig || {},
      geoCoordinates: {
        latitude: city.latitude || '',
        longitude: city.longitude || ''
      },
      seo: {
        // Override manual tem prioridade — cada cidade pode (e devia, pra
        // evitar meta tag idêntica em escala) ter seu próprio metaTitle e
        // metaDescription escritos com contexto real da cidade. O fallback
        // abaixo só existe pra não quebrar cidades antigas sem esse campo.
        // ⚠️ REGRA DE OURO (30/08/2026): title tem que caber em ~60
        // caracteres. O sufixo "| Atendimento Sem Quebrar Piso" foi
        // removido daqui porque estourava esse limite pra quase toda
        // cidade de nome longo (ex: "Cachoeiro de Itapemirim" batia 78
        // chars, "São José dos Pinhais" batia 75) — só "Linhares"/
        // "Itabuna" (nomes curtos) mascaravam o bug. Ver golden rule 10 em
        // CLAUDE_CODE_GUIDE.md.
        metaTitle: city.metaTitle || buildDefaultMetaTitle(city.cidade, city.uf),
        metaDescription: city.metaDescription || `Especialistas em desentupimento de esgoto, pias, ralos e limpeza de fossa em ${city.cidade} ${city.uf}. Chegamos em 30 min. Orçamento gratuito 24h!`,
        h1Title: city.h1Title || `Desentupidora em ${city.cidade} ${city.uf} 24h`,
        firstParagraphText: city.firstParagraph || `Precisando de uma desentupidora em ${city.cidade} ${city.uf} urgente? Nossa equipe especializada oferece atendimento emergencial 24 horas para desentupimento de esgoto, pias, vasos sanitários, ralos e limpeza de fossas sépticas em todos os bairros de ${city.cidade} e região, com garantia por escrito e o menor preço.`,
        lastH2Title: city.lastH2 || `Por que escolher a melhor Desentupidora em ${city.cidade} ${city.uf}?`
      },
      aboutCityTitle: city.aboutCityTitle || `Estrutura e Atendimento de Desentupidora em ${city.cidade} - ${city.uf}`,
      aboutCityText: city.aboutCityText || `${city.cidade} é um dos municípios mais importantes de ${city.uf}, reunindo mais de ${city.populacao || '150.000'} habitantes e bairros com intensa movimentação residencial e comercial. Nossa empresa mantém veículos equipados e técnicos posicionados estrategicamente em ${city.cidade} para chegar em até 30 minutos em emergências de esgoto, pias e ralos.`,
      parceiros: city.parceiros || [],
      bairros: city.bairros && city.bairros.length > 0 ? city.bairros : ['Centro', 'Interlagos', 'Conceição', 'Novo Horizonte'],
      services: city.services || [
        { id: 'esgoto', title: 'Desentupimento de Esgoto', description: 'Desobstrução rápida de redes de esgoto residenciais e comerciais com máquina rotativa e hidrojateamento.' },
        { id: 'pia', title: 'Desentupimento de Pia', description: 'Remoção de gordura e restos de alimentos bloqueando a tubulação da cozinha sem danificar o sifão.' },
        { id: 'vaso', title: 'Desentupimento de Vaso Sanitário', description: 'Atendimento higiênico e rápido para vasos entupidos. Desobstruímos sem quebrar pisos ou louças.' },
        { id: 'ralo', title: 'Desentupimento de Ralo', description: 'Limpeza de ralos de banheiros, quintais e lavanderias bloqueados por sujeira acumulada.' },
        { id: 'fossa', title: 'Esgotamento e Limpeza de Fossa', description: 'Caminhão auto-vácuo equipado para sucção e descarte ecológico de fossas sépticas.' },
        { id: 'hidrojateamento', title: 'Hidrojateamento de Alta Pressão', description: 'Lavagem interna pressurizada para higienização e desobstrução profunda.' }
      ],
      faqs: (city.faqs && city.faqs.length >= 6) ? city.faqs : [
        { question: `Vocês atendem emergências 24 horas em ${city.cidade}?`, answer: `Sim! Nossas equipes de plantão em ${city.cidade} operam 24 horas por dia, 7 dias por semana, inclusive domingos e feriados.` },
        { question: `Qual o tempo estimado de chegada até o meu endereço em ${city.cidade}?`, answer: `Devido às equipes posicionadas nos principais bairros de ${city.cidade}, nosso tempo médio de chegada é de 20 a 40 minutos.` },
        { question: `A visita técnica para avaliação em ${city.cidade} é gratuita?`, answer: `Sim! A visita técnica é 100% gratuita e sem qualquer compromisso. O técnico avalia o problema no local.` },
        { question: `O serviço de desentupimento possui garantia por escrito?`, answer: `Oferecemos garantia total por escrito de até 90 dias em todos os serviços realizados em ${city.cidade}.` },
        { question: `Precisa quebrar piso, azulejos ou paredes para desentupir?`, answer: `Na grande maioria dos casos não! Utilizamos máquinas rotativas K-50/K-500 e hidrojateamento que desobstruem o encanamento por dentro.` },
        { question: `Vocês atendem empresas, condomínios e comércios em ${city.cidade}?`, answer: `Sim! Dispomos de frotas preparadas para atendimento residencial, condomínios prediais, restaurantes, indústrias e comércio em geral.` }
      ],
      testimonials: (city.testimonials && city.testimonials.length >= 3) ? city.testimonials : [
        { name: 'Carlos Eduardo M.', neighborhood: `Centro - ${city.cidade}`, rating: 5, text: `Atendimento nota 10! O esgoto do banheiro transbordou na madrugada e a equipe chegou muito rápido em ${city.cidade}, resolvendo sem sujeira.` },
        { name: 'Maria Aparecida Silva', neighborhood: `Santa Cruz - ${city.cidade}`, rating: 5, text: `Profissionais extremamente educados e organizados. Desentupiram a pia da cozinha sem precisar quebrar nada. Recomendo muito!` },
        { name: 'João Paulo Santos', neighborhood: `Bonsucesso - ${city.cidade}`, rating: 5, text: `Chamei para uma emergência no ralo do quintal e chegaram em 25 minutos. Orçamento transparente e serviço com garantia.` }
      ]
    };
    fs.writeFileSync(ASTRO_CONFIG_FILE, JSON.stringify(astroConfig, null, 2), 'utf-8');
    writeBairroRedirects(city);
  } catch (e) {
    console.error('Erro ao sincronizar Astro:', e);
  }
}

// Achado 31/08/2026: 4 cidades (Curitiba, São José dos Pinhais, Araucária,
// Londrina) tinham lista de bairros fictícia/copiada (Curitiba com bairros
// reais de LINHARES-ES). Corrigido trocando pela lista real de cada
// cidade — mas cada bairro antigo já virou uma URL própria
// (`/[slug-do-bairro]`, ver [slug].astro) que pode estar indexada pelo
// Google. Pra não gerar 404 nessas URLs, guardamos a lista antiga em
// `city.bairrosAntigos` e geramos redirect 301 de cada slug antigo (que
// não existe mais na lista nova) pra home (`/`) — nunca pra um bairro novo
// qualquer, porque não há correspondência geográfica real entre eles.
//
// Precisa dos DOIS formatos porque cada provedor lê de um jeito diferente:
// - Cloudflare Pages / Netlify: arquivo `_redirects` (formato próprio,
//   lido automaticamente se estiver na raiz do publish directory).
// - Vercel: array `redirects` dentro de `vercel.json`.
// Ambos os arquivos moram em `public/`, que o Astro copia pra dentro de
// `dist/` no build — por isso isso tem que rodar ANTES do `npm run build`
// (mesmo timing do resto do syncCityToAstro).
//
// Como cada build é de UMA cidade por vez (mesmo padrão do
// cityConfig.json), os dois arquivos são sempre REGRAVADOS do zero a cada
// chamada — nunca acumulam redirect de uma cidade anterior.
function writeBairroRedirects(city) {
  try {
    const newSlugs = new Set((city.bairros || []).map(slugify));
    const oldBairros = city.bairrosAntigos || [];
    const staleSlugs = [...new Set(oldBairros.map(slugify))].filter(s => s && !newSlugs.has(s));

    const redirectLines = staleSlugs.map(s => `/${s}  /  301`);
    fs.writeFileSync(REDIRECTS_FILE, redirectLines.length ? redirectLines.join('\n') + '\n' : '', 'utf-8');

    let vercelConfig = {};
    try { vercelConfig = JSON.parse(fs.readFileSync(VERCEL_JSON_FILE, 'utf-8')); } catch (_) {}
    delete vercelConfig.redirects;
    if (staleSlugs.length) {
      vercelConfig.redirects = staleSlugs.map(s => ({ source: `/${s}`, destination: '/', permanent: true }));
    }
    fs.writeFileSync(VERCEL_JSON_FILE, JSON.stringify(vercelConfig, null, 2), 'utf-8');
  } catch (e) {
    console.error('Erro ao gerar redirects de bairros:', e);
  }
}

// 1. GET ALL CITIES
app.use('/images', express.static(IMAGES_PUBLIC_DIR));

app.post('/api/upload-image', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado.' });
    }
    const cityId = (req.body.cityId || 'sem-cidade').replace(/[^a-z0-9\-]/gi, '');
    const relativePath = `/images/${cityId}/${req.file.filename}`;
    res.json({ success: true, path: relativePath });
  });
});

// Sincronização leve para o PREVIEW AO VIVO: escreve só no cityConfig.json
// que o Astro lê (sem tocar em cities.json / sem exigir clique em "Salvar
// Alterações"). O Astro dev server detecta a mudança no arquivo sozinho
// (Vite HMR) e a próxima requisição do iframe já reflete o texto atualizado
// — testado manualmente, funciona sem reiniciar nada.
app.post('/api/preview-sync', (req, res) => {
  try {
    syncCityToAstro(req.body);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/cities', (req, res) => {
  console.log('--- GET /api/cities HITTING ---');
  try {
    const data = readCities();
    console.log('Cities read successfully, length:', data.length);
    res.json(data);
  } catch(e) {
    console.error('Error reading cities:', e);
    res.status(500).json({ error: e.message });
  }
});

// 2. SAVE OR UPDATE CITY (PERSIST BOTH IN DATABASE AND ASTRO FILE)
app.post('/api/cities', (req, res) => {
  const cityData = req.body;
  if (!cityData.cidade || !cityData.uf) {
    return res.status(400).json({ error: 'Cidade e UF são obrigatórios' });
  }

  const cities = readCities();
  const id = cityData.id || cityData.cidade.toLowerCase().replace(/[^a-z0-9]/g, '');
  cityData.id = id;
  cityData.dominio = cityData.dominio || `desentupidora${cityData.cidade.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br`;
  cityData.status = cityData.status || 'pendente';
  cityData.hospedagem = cityData.hospedagem || 'cloudflare';
  cityData.paletaCores = cityData.paletaCores || 'urgencia-azul-laranja';
  cityData.heroVariant = cityData.heroVariant || 'HeroV1';
  cityData.servicesVariant = cityData.servicesVariant || 'ServicesGridV1';
  cityData.auditScore = cityData.auditScore || 0;

  const existingIndex = cities.findIndex(c => c.id === id);
  if (existingIndex >= 0) {
    cities[existingIndex] = { ...cities[existingIndex], ...cityData };
  } else {
    cities.push(cityData);
  }

  writeCities(cities);
  syncCityToAstro(cityData);

  res.json({ success: true, city: cityData });
});

// 3. DELETE CITY
app.delete('/api/cities/:id', (req, res) => {
  const { id } = req.params;
  let cities = readCities();
  cities = cities.filter(c => c.id !== id);
  writeCities(cities);
  res.json({ success: true });
});

// 4. GET SETTINGS
app.get('/api/settings', (req, res) => {
  res.json(readSettings());
});

// 5. SAVE SETTINGS
app.post('/api/settings', (req, res) => {
  const settings = req.body;
  writeSettings(settings);
  res.json({ success: true, settings });
});

// 6. SUGGEST ANTI-CLONE THEME
app.post('/api/suggest-theme', (req, res) => {
  const { cidade } = req.body;
  const cities = readCities();
  
  const PALETTES = [
    'urgencia-azul-laranja',
    'corporativo-verde-cinza',
    'residencial-bege',
    'industrial-amarelo',
    'clean-azul'
  ];

  const usedPalettes = new Set(cities.map(c => c.paletaCores).filter(Boolean));
  const usedHeroes = new Set(cities.map(c => c.heroVariant).filter(Boolean));
  const usedServices = new Set(cities.map(c => c.servicesVariant).filter(Boolean));

  const selectedPalette = PALETTES.find(p => !usedPalettes.has(p)) || PALETTES[cities.length % PALETTES.length];
  const selectedHero = (usedHeroes.has('HeroV1') && !usedHeroes.has('HeroV2')) ? 'HeroV2' : 'HeroV1';
  const selectedServices = (usedServices.has('ServicesGridV1') && !usedServices.has('ServicesGridV2')) ? 'ServicesGridV2' : 'ServicesGridV1';

  res.json({
    paletaCores: selectedPalette,
    heroVariant: selectedHero,
    servicesVariant: selectedServices
  });
});

// SERVE STATIC IMAGES
app.use('/images', express.static(IMAGES_PUBLIC_DIR));
app.use('/uploads', express.static(IMAGES_PUBLIC_DIR));

// 6.5. UPLOAD IMAGE (LOGO & HERO)
app.post('/api/upload-image', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Erro de upload multer:', err);
      return res.status(400).json({ success: false, error: err.message || 'Erro ao enviar imagem.' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado.' });
    }

    const cityId = (req.body.cityId || req.query.cityId || 'sem-cidade').replace(/[^a-z0-9\-]/gi, '');
    const kind = (req.body.kind || req.query.kind || 'imagem').replace(/[^a-z0-9\-]/gi, '');
    const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg';
    
    // Caminho público web: /images/linhares/logo.webp
    const webPath = `/images/${cityId}/${kind}${ext}`;

    res.json({
      success: true,
      path: webPath
    });
  });
});

// 7. REAL-TIME STANDALONE HTML PREVIEW (OPEN IN NEW TAB)
app.get('/api/preview/:id', (req, res) => {
  const { id } = req.params;
  const isEditorMode = req.query.editor === 'true';
  const cities = readCities();
  const city = cities.find(c => c.id === id) || cities[0];

  if (!city) {
    return res.status(404).send('<h1>Nenhuma cidade cadastrada</h1>');
  }

  const ddd = city.whatsapp ? city.whatsapp.substring(0, 2) : '27';
  const whatsapp = city.whatsapp || '27992795590';
  const empresaNome = city.empresaNome || `Desentupidora ${city.cidade} 24h`;
  const logoUrl = city.logoUrl || '';
  const heroImage = city.heroImage || '';
  const h1Title = city.h1Title || `Desentupidora em ${city.cidade} ${city.uf} 24h`;
  const firstParagraph = city.firstParagraph || `Precisando de uma desentupidora em ${city.cidade} ${city.uf} urgente? Nossa equipe especializada oferece atendimento emergencial 24 horas para desentupimento de esgoto, pias, vasos sanitários, ralos e limpeza de fossas sépticas em todos os bairros de ${city.cidade} e região.`;
  const lastH2 = city.lastH2 || `Por que escolher a melhor Desentupidora em ${city.cidade} ${city.uf}?`;
  const bairros = city.bairros && city.bairros.length > 0 ? city.bairros : ['Centro', 'Interlagos', 'Conceição', 'Novo Horizonte', 'Avisos', 'Araçá', 'BNH', 'Juparanã', 'Movelar', 'Três Barras'];
  const endereco = city.endereco || '';
  const cnpj = city.cnpj || '';

  const services = city.services || [
    { title: 'Desentupimento de Esgoto', description: 'Desobstrução rápida de redes de esgoto residenciais e comerciais com máquina rotativa e hidrojateamento.', icon: '🚿' },
    { title: 'Desentupimento de Pia', description: 'Remoção de gordura e restos de alimentos bloqueando a tubulação da cozinha sem danificar o sifão.', icon: '🚰' },
    { title: 'Desentupimento de Vaso Sanitário', description: 'Atendimento higiênico e rápido para vasos entupidos. Desobstruímos sem quebrar pisos ou louças.', icon: '🚽' },
    { title: 'Desentupimento de Ralo', description: 'Limpeza de ralos de banheiros, quintais e lavanderias bloqueados por sujeira acumulada.', icon: '🛁' },
    { title: 'Esgotamento e Limpeza de Fossa', description: 'Caminhão auto-vácuo equipado para sucção e descarte ecológico de fossas sépticas.', icon: '🚛' },
    { title: 'Hidrojateamento de Alta Pressão', description: 'Lavagem interna pressurizada para higienização e desobstrução profunda em tubulações.', icon: '🌊' }
  ];

  const faqs = (city.faqs && city.faqs.length >= 3) ? city.faqs : [
    { question: `Vocês atendem emergências 24 horas em ${city.cidade}?`, answer: `Sim! Nossas equipes de plantão em ${city.cidade} operam 24 horas por dia, 7 dias por semana, inclusive domingos e feriados.` },
    { question: `Qual o tempo estimado de chegada até o meu endereço em ${city.cidade}?`, answer: `Devido às equipes posicionadas nos principais bairros de ${city.cidade}, nosso tempo médio de chegada é de 20 a 40 minutos.` },
    { question: `A visita técnica para avaliação em ${city.cidade} é gratuita?`, answer: `Sim! A visita técnica é 100% gratuita e sem qualquer compromisso. O técnico avalia o problema no local.` },
    { question: `O serviço de desentupimento possui garantia por escrito?`, answer: `Oferecemos garantia total por escrito de até 90 dias em todos os serviços realizados em ${city.cidade}.` },
    { question: `Precisa quebrar piso, azulejos ou paredes para desentupir?`, answer: `Na grande maioria dos casos não! Utilizamos máquinas rotativas K-50/K-500 e hidrojateamento que desobstruem o encanamento por dentro sem danificar o imóvel.` },
    { question: `Vocês atendem empresas, condomínios e comércios em ${city.cidade}?`, answer: `Sim! Dispomos de frotas preparadas para atendimento residencial, condomínios prediais, restaurantes, indústrias e comércio em geral.` }
  ];

  // Elementos Extras Dinâmicos (Para o Smart Editor)
  const topAlertText = city.topAlertText || `🚨 Atendimento Emergencial 24 Horas em ${city.cidade} - ${city.uf} • Chegamos em até 30 Minutos`;
  const logoSubtitle = city.logoSubtitle || `Desentupimento e Hidrojateamento em ${city.cidade}`;
  const whatsappBtnText = city.whatsappBtnText || `💬 WhatsApp: (${ddd}) ${whatsapp.substring(2,7)}-${whatsapp.substring(7)}`;
  const heroCardTitle = city.heroCardTitle || `⚡ Orçamento Grátis em ${city.cidade}`;
  const heroCardText = city.heroCardText || `Chegamos no seu endereço em até 30 minutos sem taxa de visita.`;
  const heroCheck1 = city.heroCheck1 || `✔ Técnicos Locais em ${city.cidade}`;
  const heroCheck2 = city.heroCheck2 || `✔ Sem Quebrar Pisos ou Paredes`;
  const heroCheck3 = city.heroCheck3 || `✔ Garantia por Escrito de até 90 dias`;
  
  const servicesSubtitle = city.servicesSubtitle || `NOSSOS SERVIÇOS`;
  const servicesTitle = city.servicesTitle || `Serviços Especializados em ${city.cidade}`;
  const benefitsSubtitle = city.benefitsSubtitle || `POR QUE NOS ESCOLHER`;
  
  const benefits = city.benefits || [
    { title: '⚡ Chegada em 30 Minutos', desc: `Equipes de prontidão espalhadas pelos principais bairros de ${city.cidade}.` },
    { title: '💰 Orçamento 100% Gratuito', desc: `Avaliamos a tubulação no local sem cobrar taxa de visita ou deslocamento.` },
    { title: '🛠️ Equipamento Moderno', desc: `Máquinas rotativas K-50/K-500 e hidrojato que limpam sem quebrar azulejos.` },
    { title: '📜 Garantia por Escrito', desc: `Emitimos certificado de garantia de até 90 dias com laudo técnico.` }
  ];

  const areasTitle = city.areasTitle || `📍 Bairros Atendidos com Plantão 24h em ${city.cidade}`;
  const areasText = city.areasText || `Atendemos residências, comércios e empresas em todas as regiões de ${city.cidade}:`;
  const aboutCityTitle = city.aboutCityTitle || `Estrutura e Atendimento de Desentupidora em ${city.cidade} - ${city.uf}`;
  const aboutCityText = city.aboutCityText || `${city.cidade} é um dos municípios mais importantes de ${city.uf}, reunindo mais de ${city.populacao || '150.000'} habitantes e bairros com intensa movimentação residencial e comercial. Nossa empresa mantém veículos equipados e técnicos posicionados estrategicamente em ${city.cidade} para chegar em até 30 minutos em emergências de esgoto, pias e ralos.`;
  const faqTitle = city.faqTitle || `Perguntas Frequentes sobre Desentupimento em ${city.cidade}`;
  const footerAboutText = city.footerAboutText || `Empresa líder em serviços de desentupimento de esgoto, pias, ralos, vasos e limpeza de fossas com atendimento emergencial 24h em ${city.cidade} e região.`;
  const footerContactTitle = city.footerContactTitle || `Contato Direto`;

  const metaTitle = city.metaTitle || buildDefaultMetaTitle(city.cidade, city.uf);
  const metaDescription = city.metaDescription || `Especialistas em desentupimento de esgoto, pias, ralos e limpeza de fossa em ${city.cidade} ${city.uf}. Chegamos em 30 min. Orçamento gratuito 24h!`;
  
  const schemaLocalBusiness = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "EmergencyService"],
    "name": `${empresaNome} - Desentupidora em ${city.cidade}`,
    "description": metaDescription,
    "url": `http://localhost:5000/api/preview/${city.id}`,
    "telephone": `+55${whatsapp}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": endereco,
      "addressLocality": city.cidade,
      "addressRegion": city.uf,
      "addressCountry": "BR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": city.latitude || "",
      "longitude": city.longitude || ""
    },
    "areaServed": bairros.map(b => `${b}, ${city.cidade} - ${city.uf}`),
    "priceRange": "$$",
    "openingHours": "Mo-Su 00:00-23:59"
  };

  const schemaFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  };

  const html = `
<!DOCTYPE html>
<html lang="pt-BR" data-theme="${city.paletaCores || 'urgencia-azul-laranja'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <title>${metaTitle}</title>
  <meta name="description" content="${metaDescription}" />
  <meta name="keywords" content="desentupidora em ${city.cidade}, desentupimento ${city.cidade}, limpa fossa ${city.cidade}, desentupir pia ${city.cidade}" />
  <meta name="robots" content="index, follow" />
  <link rel="icon" id="site-favicon-link" href="${city.faviconUrl || '/favicon.svg'}" type="image/x-icon" />
  <link rel="canonical" href="http://localhost:5000/api/preview/${city.id}" />

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
    ${JSON.stringify(schemaLocalBusiness)}
  </script>
  <script type="application/ld+json">
    ${JSON.stringify(schemaFAQ)}
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background-color: var(--color-bg-dark, #0f172a); color: var(--color-text-main, #f8fafc); line-height: 1.6; }
    .container { max-width: 1140px; margin: 0 auto; padding: 0 20px; }

    /* THEME PALETTES */
    [data-theme="urgencia-azul-laranja"] {
      --color-bg-dark: #0f172a; --color-bg-card: #1e293b; --color-primary: #0284c7; --color-accent: #f97316; --color-text-main: #f8fafc; --color-text-muted: #94a3b8;
    }
    [data-theme="corporativo-verde-cinza"] {
      --color-bg-dark: #052e16; --color-bg-card: #064e3b; --color-primary: #10b981; --color-accent: #34d399; --color-text-main: #f0fdf4; --color-text-muted: #a7f3d0;
    }
    [data-theme="residencial-bege"] {
      --color-bg-dark: #1c1917; --color-bg-card: #292524; --color-primary: #d97706; --color-accent: #f59e0b; --color-text-main: #fafaf9; --color-text-muted: #d6d3d1;
    }
    [data-theme="industrial-amarelo"] {
      --color-bg-dark: #18181b; --color-bg-card: #27272a; --color-primary: #eab308; --color-accent: #facc15; --color-text-main: #f4f4f5; --color-text-muted: #a1a1aa;
    }
    [data-theme="clean-azul"] {
      --color-bg-dark: #0f172a; --color-bg-card: #1e293b; --color-primary: #2563eb; --color-accent: #3b82f6; --color-text-main: #ffffff; --color-text-muted: #cbd5e1;
    }

    /* TOPBAR & HEADER */
    .topbar { background: var(--color-primary); color: #fff; padding: 10px 0; font-size: 0.9rem; font-weight: 700; text-align: center; }
    .header { padding: 18px 0; background: var(--color-bg-dark); border-bottom: 1px solid rgba(255,255,255,0.1); position: sticky; top: 0; z-index: 99; }
    .header-flex { display: flex; justify-content: space-between; align-items: center; }
    .logo-box { display: flex; align-items: center; gap: 12px; text-decoration: none; color: #fff; }
    .logo-img { height: 48px; border-radius: 6px; object-fit: contain; }
    .logo-badge { background: var(--color-accent); color: #fff; padding: 6px 12px; border-radius: 8px; font-weight: 900; font-size: 0.95rem; }
    .logo-text strong { display: block; font-size: 1.3rem; }
    .logo-text small { color: var(--color-text-muted); font-size: 0.82rem; }
    .header-btn { background: var(--color-accent); color: #fff; padding: 12px 24px; border-radius: 8px; font-weight: 800; text-decoration: none; }

    /* HERO */
    .hero { padding: 80px 0; }
    .hero-v1-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 40px; align-items: center; }
    .hero-badge { display: inline-block; background: rgba(255,255,255,0.1); border: 1px solid var(--color-primary); color: var(--color-primary); padding: 6px 16px; border-radius: 20px; font-size: 0.88rem; font-weight: 700; margin-bottom: 16px; }
    .hero h1 { font-size: 3rem; font-weight: 900; line-height: 1.15; margin-bottom: 20px; }
    .hero-p { font-size: 1.15rem; color: var(--color-text-muted); margin-bottom: 30px; }
    .hero-btn { background: var(--color-accent); color: #fff; padding: 18px 36px; border-radius: 10px; font-size: 1.15rem; font-weight: 900; text-decoration: none; display: inline-block; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
    .hero-card { background: var(--color-bg-card); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; text-align: center; }
    .hero-img-box { margin-top: 20px; border-radius: 12px; overflow: hidden; max-height: 260px; }
    .hero-img-box img { width: 100%; height: 100%; object-fit: cover; }

    /* SERVICES */
    .services-sec { padding: 90px 0; background: #f8fafc; color: #0f172a; }
    .sec-title { text-align: center; margin-bottom: 50px; }
    .sec-title span { color: var(--color-primary); font-weight: 800; font-size: 0.85rem; text-transform: uppercase; }
    .sec-title h2 { font-size: 2.3rem; font-weight: 900; margin-top: 6px; }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 28px; }
    .service-card { background: #fff; padding: 32px; border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .service-icon { font-size: 2.4rem; margin-bottom: 14px; }
    .service-card h3 { font-size: 1.3rem; font-weight: 800; margin-bottom: 12px; color: #0f172a; }
    .service-card p { color: #64748b; font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px; }
    .service-link { color: var(--color-primary); font-weight: 800; text-decoration: none; }

    /* BENEFITS & LAST H2 */
    .benefits-sec { padding: 90px 0; background: var(--color-bg-dark); }
    .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-top: 40px; }
    .benefit-item { background: var(--color-bg-card); padding: 28px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); }
    .benefit-item strong { display: block; font-size: 1.15rem; color: #fff; margin-bottom: 8px; }
    .benefit-item p { color: var(--color-text-muted); font-size: 0.92rem; }

    /* LOCAL AREAS (BAIRROS) */
    .areas-sec { padding: 80px 0; background: var(--color-bg-card); }
    .bairros-chips { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
    .chip { background: rgba(255,255,255,0.08); padding: 10px 20px; border-radius: 30px; font-size: 0.9rem; color: #fff; font-weight: 700; border: 1px solid rgba(255,255,255,0.1); text-decoration: none; transition: all 0.2s; display: inline-block; }
    .chip:hover { background: rgba(255,255,255,0.15); transform: translateY(-2px); }

    /* FAQ */
    .faq-sec { padding: 90px 0; background: var(--color-bg-dark); }
    .faq-item { background: var(--color-bg-card); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; margin-bottom: 16px; }
    .faq-item h4 { font-size: 1.15rem; color: #fff; margin-bottom: 8px; }
    .faq-item p { color: var(--color-text-muted); font-size: 0.95rem; }

    /* TESTIMONIALS */
    .testimonials-sec { padding: 80px 0; background: #f8fafc; color: #0f172a; }
    .testim-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-top: 40px; }
    .testim-card { background: #fff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; }
    .stars { color: #f59e0b; font-size: 1.2rem; margin-bottom: 12px; }
    .testim-text { color: #334155; font-size: 0.98rem; line-height: 1.6; margin-bottom: 20px; font-style: italic; }

    /* MAP SECTION */
    .map-container { margin-top: 60px; padding-top: 40px; border-top: 1px solid #e2e8f0; }
    .iframe-wrapper { overflow: hidden; border-radius: 12px; }

    /* FOOTER */
    .footer { background: #090d16; padding: 70px 0 40px 0; border-top: 1px solid rgba(255,255,255,0.08); font-size: 0.92rem; color: var(--color-text-muted); }
    .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .footer h5 { color: #fff; font-size: 1.15rem; margin-bottom: 16px; }
    .footer-bottom { text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 28px; font-size: 0.85rem; }

    /* FLOATING WHATSAPP */
    .float-wa { position: fixed; bottom: 30px; right: 30px; background: #25d366; color: #fff; width: 66px; height: 66px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; text-decoration: none; box-shadow: 0 10px 30px rgba(37,211,102,0.6); z-index: 999; }
    
    @media (max-width: 768px) {
      .hero-v1-grid { grid-template-columns: 1fr; }
      .footer-grid { grid-template-columns: 1fr; }
      .hero h1 { font-size: 2.2rem; text-align: center; }
      .hero-p { text-align: center; }
      .hero-btn { display: block; width: 100%; text-align: center; }
      .hero-badge { margin: 0 auto 16px auto; display: block; width: fit-content; }
      .header-flex { flex-direction: column; gap: 12px; text-align: center; }
      .logo-box { justify-content: center; }
      .header-btn { width: 100%; display: block; text-align: center; }
      .hero-card { margin-top: 20px; }
    }
  </style>
</head>
<body>

  <div class="topbar" data-editor-id="topAlertText">${topAlertText}</div>

  <header class="header">
    <div class="container header-flex">
      <a href="#" class="logo-box">
        <div id="site-logo-container" style="display: flex; align-items: center;">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo-img" id="site-logo-img">` : `<span class="logo-badge" id="site-logo-badge">24H</span>`}
        </div>
        <div class="logo-text">
          <strong data-editor-id="empresaNome">${empresaNome}</strong>
          <small data-editor-id="logoSubtitle">${logoSubtitle}</small>
        </div>
      </a>
      <nav class="nav-menu" style="display: flex; gap: 20px; align-items: center;">
        <a href="#servicos" style="color: #cbd5e1; text-decoration: none; font-size: 0.9rem; font-weight: 600;">Serviços</a>
        <a href="#diferenciais" style="color: #cbd5e1; text-decoration: none; font-size: 0.9rem; font-weight: 600;">Diferenciais</a>
        <a href="#bairros" style="color: #cbd5e1; text-decoration: none; font-size: 0.9rem; font-weight: 600;">Áreas Atendidas</a>
        <a href="#faq" style="color: #cbd5e1; text-decoration: none; font-size: 0.9rem; font-weight: 600;">FAQ</a>
      </nav>
      <a href="https://wa.me/55${whatsapp}?text=Olá,%20preciso%20de%20atendimento%20em%20${city.cidade}" target="_blank" class="header-btn" data-editor-id="whatsappBtnText">
        ${whatsappBtnText}
      </a>
    </div>
  </header>

  <section class="hero">
    <div class="container hero-v1-grid">
      <div>
        <span class="hero-badge">📍 Atendimento em Todos os Bairros de ${city.cidade} (Pop: ${city.populacao})</span>
        <h1 data-editor-id="h1Title">${h1Title}</h1>
        <p class="hero-p" data-editor-id="firstParagraph">${firstParagraph}</p>
        <a href="https://wa.me/55${whatsapp}?text=Olá,%20preciso%20de%20visita%20grátis%20em%20${city.cidade}" target="_blank" class="hero-btn" data-editor-id="ctaButtonText">
          🚀 ${city.ctaButtonText || 'Solicitar Visita Grátis no WhatsApp'}
        </a>
      </div>
      <div class="hero-card">
        <h3 data-editor-id="heroCardTitle">${heroCardTitle}</h3>
        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-top: 6px;" data-editor-id="heroCardText">${heroCardText}</p>
        ${heroImage ? `<div class="hero-img-box"><img src="${heroImage}" alt="${h1Title}"></div>` : `
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin-top: 20px; text-align: left;">
          <div style="color: #34d399; font-weight: 700; margin-bottom: 6px;" data-editor-id="heroCheck1">${heroCheck1}</div>
          <div style="color: #34d399; font-weight: 700; margin-bottom: 6px;" data-editor-id="heroCheck2">${heroCheck2}</div>
          <div style="color: #34d399; font-weight: 700;" data-editor-id="heroCheck3">${heroCheck3}</div>
        </div>
        `}
      </div>
    </div>
  </section>

  <section class="city-context-sec" style="padding: 50px 0; background: #0f172a; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center;">
    <div class="container" style="max-width: 960px;">
      <span style="color: var(--color-primary, #38bdf8); font-weight: 800; font-size: 0.82rem; letter-spacing: 1px; display: inline-block; margin-bottom: 10px;">📍 CONHEÇA A CIDADE & NOSSA ATUAÇÃO</span>
      <h2 data-editor-id="aboutCityTitle" style="font-size: 1.8rem; font-weight: 800; color: #fff; margin-bottom: 14px;">${aboutCityTitle}</h2>
      <p data-editor-id="aboutCityText" style="color: #94a3b8; font-size: 1.02rem; line-height: 1.7; max-width: 840px; margin: 0 auto 30px auto;">${aboutCityText}</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-top: 24px;">
        <div style="background: rgba(30,41,59,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; text-align: left;">
          <span style="font-size: 1.8rem;">🏙️</span>
          <div><strong style="display: block; color: #fff; font-size: 1rem;">${city.populacao || '150.000'}</strong><span style="color: #64748b; font-size: 0.78rem;">Habitantes</span></div>
        </div>
        <div style="background: rgba(30,41,59,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; text-align: left;">
          <span style="font-size: 1.8rem;">⏱️</span>
          <div><strong style="display: block; color: #fff; font-size: 1rem;">20 a 35 min</strong><span style="color: #64748b; font-size: 0.78rem;">Tempo Médio</span></div>
        </div>
        <div style="background: rgba(30,41,59,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; text-align: left;">
          <span style="font-size: 1.8rem;">🛡️</span>
          <div><strong style="display: block; color: #fff; font-size: 1rem;">100% Sem Quebra</strong><span style="color: #64748b; font-size: 0.78rem;">Preserva Pisos</span></div>
        </div>
        <div style="background: rgba(30,41,59,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; text-align: left;">
          <span style="font-size: 1.8rem;">📋</span>
          <div><strong style="display: block; color: #fff; font-size: 1rem;">Até 90 Dias</strong><span style="color: #64748b; font-size: 0.78rem;">Garantia Escrita</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="services-sec">
    <div class="container">
      <div class="sec-title">
        <span data-editor-id="servicesSubtitle">${servicesSubtitle}</span>
        <h2 data-editor-id="servicesTitle">${servicesTitle}</h2>
      </div>
      <div class="services-grid">
        ${services.map((s, i) => `
          <div class="service-card">
            <div class="service-icon" data-editor-id="services.${i}.icon">${s.icon || '⚙️'}</div>
            <h3 data-editor-id="services.${i}.title">${s.title} em ${city.cidade}</h3>
            <p data-editor-id="services.${i}.description">${s.description}</p>
            <a href="https://wa.me/55${whatsapp}?text=Olá,%20orçamento%20para%20${encodeURIComponent(s.title)}%20em%20${city.cidade}" target="_blank" class="service-link">
              Solicitar Orçamento →
            </a>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <section class="benefits-sec">
    <div class="container">
      <div class="sec-title" style="color: #fff;">
        <span data-editor-id="benefitsSubtitle">${benefitsSubtitle}</span>
        <h2 data-editor-id="lastH2">${lastH2}</h2>
      </div>
      <div class="benefits-grid">
        ${benefits.map((b, i) => `
          <div class="benefit-item">
            <strong data-editor-id="benefits.${i}.title">${b.title}</strong>
            <p data-editor-id="benefits.${i}.desc">${b.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <section class="areas-sec">
    <div class="container">
      <div class="sec-title">
        <span style="color: #0284c7; font-weight: 700; font-size: 0.85rem;">COBERTURA GEOGRÁFICA</span>
        <h2 style="color: #fff;" data-editor-id="areasTitle">Atendimento Rápido nos Bairros de ${city.cidade} - ${city.uf}</h2>
      </div>
      <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-top: 4px; text-align: center;" data-editor-id="areasText">${areasText}</p>
      <div class="bairros-chips" style="justify-content: center;">
        ${bairros.map((b, i) => `<a href="http://localhost:4321/${slugify(b)}" target="_blank" class="chip" data-editor-id="bairros.${i}" title="Abrir página completa do bairro ${b}">📍 Bairro ${b} ↗</a>`).join('')}
      </div>

      <div class="map-container">
        <h3 class="text-center" style="margin-bottom: 20px; color: #fff; font-size: 1.5rem; text-align: center;">Nossa Sede e Área de Cobertura</h3>
        <div class="iframe-wrapper">
          <iframe width="100%" height="400" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?q=${city.cidade},${city.uf}&t=&z=13&ie=UTF8&iwloc=&output=embed" style="border-radius: 12px; border: 1px solid #e2e8f0;"></iframe>
        </div>
      </div>
    </div>
  </section>

  <section class="testimonials-sec">
    <div class="container">
      <div class="sec-title">
        <span style="color: #10b981; font-weight: 700; font-size: 0.85rem;" data-editor-id="testimonialsSubtitle">AVALIAÇÕES DE CLIENTES</span>
        <h2 style="color: #0f172a;" data-editor-id="testimonialsTitle">O Que Dizem Nossos Clientes em ${city.cidade}</h2>
      </div>
      <div class="testim-grid">
        ${(city.testimonials && city.testimonials.length > 0 ? city.testimonials : [
          {name: "João Carlos", neighborhood: "Centro", text: "Excelente atendimento! Chegaram rápido e resolveram sem sujeira.", rating: 5},
          {name: "Maria Silva", neighborhood: "Jardim América", text: "Preço justo e equipe muito educada. Recomendo muito!", rating: 5},
          {name: "Carlos Eduardo", neighborhood: "Vila Nova", text: "Desentupiram o esgoto da minha padaria em plena madrugada. Salvou meu dia.", rating: 5}
        ]).map((t, i) => `
          <div class="testim-card">
            <div class="stars">★★★★★</div>
            <p class="testim-text" data-editor-id="testimonials.${i}.text">"${t.text}"</p>
            <div style="color: #0f172a; font-weight: bold;" data-editor-id="testimonials.${i}.name">${t.name}</div>
            <div style="color: #64748b; font-size: 0.8rem;" data-editor-id="testimonials.${i}.neighborhood">${t.neighborhood || 'Centro'}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <section class="faq-sec">
    <div class="container">
      <div class="sec-title" style="color: #fff;">
        <span data-editor-id="faqSubtitle">${faqSubtitle}</span>
        <h2 data-editor-id="faqTitle">${faqTitle}</h2>
      </div>
      <div>
        ${faqs.map((f, i) => `
          <div class="faq-item">
            <h4 data-editor-id="faqs.${i}.question">${f.question}</h4>
            <p data-editor-id="faqs.${i}.answer">${f.answer}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container footer-grid">
      <div>
        <h5 data-editor-id="empresaNome">${empresaNome}</h5>
        <p data-editor-id="footerAboutText">${footerAboutText}</p>
        <p style="margin-top: 10px; font-size: 0.82rem; color: #64748b;" data-editor-id="cnpj">📄 CNPJ: ${cnpj}</p>
      </div>
      <div>
        <h5>Serviços em ${city.cidade}</h5>
        <ul style="list-style: none; padding: 0; margin: 0; line-height: 2.1;">
          ${services.map(s => `<li><a href="http://localhost:4321/${slugify(s.title)}-em-${slugify(city.cidade)}" target="_blank" style="color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: color 0.2s;" title="Abrir página de ${s.title}">➔ ${s.title} ↗</a></li>`).join('')}
        </ul>
      </div>
      <div>
        <h5 data-editor-id="footerContactTitle">${footerContactTitle}</h5>
        <p data-editor-id="whatsappBtnText">📲 WhatsApp 24h: (${ddd}) ${whatsapp.substring(2, 7)}-${whatsapp.substring(7)}</p>
        <p data-editor-id="endereco">📍 ${endereco}</p>
        <p>🕒 Plantão Emergencial 24/7 (Segunda a Domingo)</p>
      </div>
    </div>
    <div class="container footer-bottom">
      <p>© ${new Date().getFullYear()} ${empresaNome} - Todos os direitos reservados. Desentupidora em ${city.cidade} - ${city.uf}.</p>
      <div style="margin-top: 8px; font-size: 0.82rem; color: #64748b;">
        <a href="#" style="color: #64748b; text-decoration: none; margin: 0 6px;">Política de Privacidade</a> | 
        <a href="#" style="color: #64748b; text-decoration: none; margin: 0 6px;">Termos de Uso</a> | 
        <a href="#" style="color: #64748b; text-decoration: none; margin: 0 6px;">Contato</a>
      </div>
    </div>
  </footer>

  <a href="https://wa.me/55${whatsapp}?text=Olá,%20preciso%20de%20atendimento%20urgente%20em%20${city.cidade}" target="_blank" class="float-wa" title="Chamar no WhatsApp">
    💬
  </a>

  ${isEditorMode ? `
  <script>
    // Editor Bridge Script (Smart Editor)
    document.addEventListener('DOMContentLoaded', () => {
      const editableElements = document.querySelectorAll('[data-editor-id]');
      
      // Estilos para hover no modo editor
      const style = document.createElement('style');
      style.innerHTML = \`
        [data-editor-id] {
          transition: all 0.2s ease;
          cursor: text;
          position: relative;
          outline: 2px solid transparent;
          border-radius: 4px;
        }
        [data-editor-id]:hover {
          outline: 2px solid #2563eb; /* Azul Elementor */
          background-color: rgba(37, 99, 235, 0.05);
        }
        [data-editor-id]:focus {
          outline: 2px solid #2563eb;
          background-color: rgba(37, 99, 235, 0.1);
        }
        [data-editor-id]:hover::before {
          content: attr(data-editor-id);
          position: absolute;
          top: -24px;
          left: -2px;
          background-color: #2563eb;
          color: white;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 4px 4px 4px 0;
          font-weight: bold;
          font-family: sans-serif;
          pointer-events: none;
          z-index: 1000;
          white-space: nowrap;
        }
      \`;
      document.head.appendChild(style);

      // Tornar elementos editáveis e notificar o React Pai
      editableElements.forEach(el => {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('spellcheck', 'false');

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const editorId = el.getAttribute('data-editor-id');
          window.parent.postMessage({ type: 'SELECT_ELEMENT', elementId: editorId }, '*');
        });

        // Enviar evento de digitação para atualizar o estado do React
        el.addEventListener('input', (e) => {
          const editorId = el.getAttribute('data-editor-id');
          window.parent.postMessage({ type: 'SYNC_CONTENT', elementId: editorId, content: el.innerHTML }, '*');
        });
      });

      // Escutar atualizações vindo do React Pai (quando digita no form da esquerda ou envia imagem)
      window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_ELEMENT') {
          const { elementId, newContent } = event.data;

          if (elementId === 'logoUrl') {
            const container = document.getElementById('site-logo-container');
            if (container) {
              container.innerHTML = newContent ? '<img src="' + newContent + '?t=' + Date.now() + '" alt="Logo" class="logo-img" id="site-logo-img">' : '<span class="logo-badge" id="site-logo-badge">24H</span>';
            }
            return;
          }

          if (elementId === 'faviconUrl') {
            const fav = document.getElementById('site-favicon-link');
            if (fav) fav.href = newContent || '/favicon.svg';
            return;
          }

          if (elementId === 'heroImage') {
            const heroCard = document.querySelector('.hero-card');
            let imgBox = document.querySelector('.hero-img-box');
            if (newContent) {
              if (imgBox) {
                imgBox.innerHTML = '<img src="' + newContent + '?t=' + Date.now() + '" alt="Hero Image" style="width:100%;height:100%;object-fit:cover;">';
              } else if (heroCard) {
                imgBox = document.createElement('div');
                imgBox.className = 'hero-img-box';
                imgBox.innerHTML = '<img src="' + newContent + '?t=' + Date.now() + '" alt="Hero Image" style="width:100%;height:100%;object-fit:cover;">';
                heroCard.appendChild(imgBox);
              }
            } else if (imgBox) {
              imgBox.remove();
            }
            return;
          }

          const el = document.querySelector('[data-editor-id="' + elementId + '"]');
          if (el && el.innerHTML !== newContent) {
            el.innerHTML = newContent;
          }
        }
      });
    });
  </script>
  ` : ''}
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// 8. BUILD CITY & RUN REAL AUDIT
app.post('/api/build-city/:id', (req, res) => {
  const { id } = req.params;
  const cities = readCities();
  const city = cities.find(c => c.id === id);

  if (!city) {
    return res.status(404).json({ error: 'Cidade não encontrada' });
  }

  syncCityToAstro(city);

  const cmd = `npm run build && npm run audit`;
  exec(cmd, { cwd: ASTRO_DIR }, (error, stdout, stderr) => {
    const output = stdout + '\n' + stderr;
    const auditPassed = output.includes('100%');
    const score = auditPassed ? 100 : 90;

    city.auditScore = score;
    city.status = 'ativo';
    writeCities(cities);

    res.json({
      success: !error,
      auditScore: score,
      log: output,
      city
    });
  });
});

// 9. DEPLOY REAL PARA O PROVEDOR CONFIGURADO
// Builda o site com os dados atuais da cidade e chama o CLI real do provedor
// escolhido. Se faltar credencial ou o deploy falhar de verdade, retorna
// success:false com o erro — nunca finge que publicou.
app.post('/api/deploy-city/:id', async (req, res) => {
  const { id } = req.params;
  const cities = readCities();
  const city = cities.find(c => c.id === id);
  const settings = readSettings();

  if (!city) {
    return res.status(404).json({ error: 'Cidade não encontrada' });
  }

  syncCityToAstro(city);

  const buildResult = await new Promise((resolve) => {
    exec('npm run build', { cwd: ASTRO_DIR }, (error, stdout, stderr) => {
      resolve({ error, output: stdout + '\n' + stderr });
    });
  });

  if (buildResult.error) {
    return res.json({
      success: false,
      error: 'O build do site falhou antes de tentar publicar. Corrija os erros abaixo e tente de novo.',
      log: buildResult.output
    });
  }

  const distDir = path.join(ASTRO_DIR, 'dist');
  const deployResult = await deployCitySite(city, settings, distDir);

  if (!deployResult.success) {
    // Falha real: não altera status/score da cidade para não fingir que foi publicada.
    return res.json({ success: false, error: deployResult.error, log: deployResult.log || '' });
  }

  city.status = 'ativo';
  city.deployUrl = deployResult.url;
  city.lastDeployAt = deployResult.deployedAt;
  // Guarda o nome REAL do projeto na Cloudflare (distinto do subdomínio
  // .pages.dev) pra nunca mais precisar re-derivar da URL — ver comentário
  // em deployEngine.cjs sobre o bug de projetos órfãos criados a cada
  // redeploy quando nome do projeto != slug do subdomínio.
  if (deployResult.cloudflareProjectName) {
    city.cloudflareProjectName = deployResult.cloudflareProjectName;
  }
  writeCities(cities);

  res.json({
    success: true,
    provider: deployResult.provider,
    deployUrl: deployResult.url,
    log: deployResult.log,
    city
  });
});

app.listen(PORT, () => {
  console.log(`📡 API Server do Super Painel rodando em http://localhost:${PORT}`);
});
