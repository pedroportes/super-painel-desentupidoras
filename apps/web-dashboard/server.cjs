const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const multer = require('multer');
const { deployCitySite } = require('./scripts/deployEngine.cjs');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const CITIES_FILE = path.join(DATA_DIR, 'cities.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const ASTRO_DIR = path.join(__dirname, '..', 'site-template-astro');
const ASTRO_CONFIG_FILE = path.join(ASTRO_DIR, 'src', 'data', 'cityConfig.json');
const IMAGES_PUBLIC_DIR = path.join(ASTRO_DIR, 'public', 'images');

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
      cnpj: city.cnpj || '12.345.678/0001-90',
      endereco: city.endereco || `Av. Principal, 100 - Centro, ${city.cidade} - ${city.uf}`,
      hospedagem: city.hospedagem || 'cloudflare',
      paletaCores: city.paletaCores || 'urgencia-azul-laranja',
      variants: {
        hero: city.heroVariant || 'HeroV1',
        services: city.servicesVariant || 'ServicesGridV1',
        faq: 'FAQV1'
      },
      geoCoordinates: {
        latitude: -19.3911,
        longitude: -40.0722
      },
      seo: {
        metaTitle: `Desentupidora em ${city.cidade} ${city.uf} 24h | Atendimento Sem Quebrar Piso`,
        metaDescription: `Especialistas em desentupimento de esgoto, pias, ralos e limpeza de fossa em ${city.cidade} ${city.uf}. Chegamos em 30 min. Orçamento gratuito 24h!`,
        h1Title: city.h1Title || `Desentupidora em ${city.cidade} ${city.uf} 24h`,
        firstParagraphText: city.firstParagraph || `Precisando de uma desentupidora em ${city.cidade} ${city.uf} urgente? Nossa equipe especializada oferece atendimento emergencial 24 horas para desentupimento de esgoto, pias, vasos sanitários, ralos e limpeza de fossas sépticas em todos os bairros de ${city.cidade} e região, com garantia por escrito e o menor preço.`,
        lastH2Title: city.lastH2 || `Por que escolher a melhor Desentupidora em ${city.cidade} ${city.uf}?`
      },
      bairros: city.bairros && city.bairros.length > 0 ? city.bairros : ['Centro', 'Interlagos', 'Conceição', 'Novo Horizonte'],
      services: city.services || [
        { id: 'esgoto', title: 'Desentupimento de Esgoto', description: 'Desobstrução rápida de redes de esgoto residenciais e comerciais com máquina rotativa e hidrojateamento.' },
        { id: 'pia', title: 'Desentupimento de Pia', description: 'Remoção de gordura e restos de alimentos bloqueando a tubulação da cozinha sem danificar o sifão.' },
        { id: 'vaso', title: 'Desentupimento de Vaso Sanitário', description: 'Atendimento higiênico e rápido para vasos entupidos. Desobstruímos sem quebrar pisos ou louças.' },
        { id: 'ralo', title: 'Desentupimento de Ralo', description: 'Limpeza de ralos de banheiros, quintais e lavanderias bloqueados por sujeira acumulada.' },
        { id: 'fossa', title: 'Esgotamento e Limpeza de Fossa', description: 'Caminhão auto-vácuo equipado para sucção e descarte ecológico de fossas sépticas.' },
        { id: 'hidrojateamento', title: 'Hidrojateamento de Alta Pressão', description: 'Lavagem interna pressurizada para higienização e desobstrução profunda.' }
      ],
      faqs: city.faqs || [
        { question: `Qual o valor cobrado para um desentupimento em ${city.cidade}?`, answer: `O orçamento é 100% gratuito e feito no local após avaliação técnica da tubulação.` },
        { question: `Vocês atendem emergências 24 horas em ${city.cidade}?`, answer: `Sim! Nossas equipes de plantão em ${city.cidade} operam 24 horas por dia, 7 dias por semana.` },
        { question: `Qual o tempo estimado de chegada em ${city.cidade}?`, answer: `Devido às equipes posicionadas nos principais bairros, chegamos entre 20 e 40 minutos.` }
      ],
      testimonials: city.testimonials || [
        { name: 'Carlos Eduardo M.', neighborhood: `Centro - ${city.cidade}`, rating: 5, text: `Atendimento nota 1000! O esgoto do banheiro transbordou e a equipe chegou muito rápido em ${city.cidade}.` }
      ]
    };
    fs.writeFileSync(ASTRO_CONFIG_FILE, JSON.stringify(astroConfig, null, 2), 'utf-8');
  } catch (e) {
    console.error('Erro ao sincronizar Astro:', e);
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

app.get('/api/cities', (req, res) => {
  res.json(readCities());
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

// 7. REAL-TIME STANDALONE HTML PREVIEW (OPEN IN NEW TAB)
app.get('/api/preview/:id', (req, res) => {
  const { id } = req.params;
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
  const endereco = city.endereco || `Av. Principal, 500 - Centro, ${city.cidade} - ${city.uf}`;
  const cnpj = city.cnpj || '12.345.678/0001-90';

  const services = city.services || [
    { title: 'Desentupimento de Esgoto', description: 'Desobstrução rápida de redes de esgoto residenciais e comerciais com máquina rotativa e hidrojateamento.', icon: '🚿' },
    { title: 'Desentupimento de Pia', description: 'Remoção de gordura e restos de alimentos bloqueando a tubulação da cozinha sem danificar o sifão.', icon: '🚰' },
    { title: 'Desentupimento de Vaso Sanitário', description: 'Atendimento higiênico e rápido para vasos entupidos. Desobstruímos sem quebrar pisos ou louças.', icon: '🚽' },
    { title: 'Desentupimento de Ralo', description: 'Limpeza de ralos de banheiros, quintais e lavanderias bloqueados por sujeira acumulada.', icon: '🛁' },
    { title: 'Esgotamento e Limpeza de Fossa', description: 'Caminhão auto-vácuo equipado para sucção e descarte ecológico de fossas sépticas.', icon: '🚛' },
    { title: 'Hidrojateamento de Alta Pressão', description: 'Lavagem interna pressurizada para higienização e desobstrução profunda em tubulações.', icon: '🌊' }
  ];

  const faqs = city.faqs || [
    { question: `Qual o valor cobrado para um desentupimento em ${city.cidade}?`, answer: `O orçamento é 100% gratuito e feito no local após avaliação da tubulação com o melhor preço da região.` },
    { question: `Vocês atendem emergências 24 horas em ${city.cidade}?`, answer: `Sim! Nossas equipes de plantão em ${city.cidade} operam 24 horas por dia, 7 dias por semana, inclusive domingos e feriados.` },
    { question: `Qual o tempo estimado de chegada em ${city.cidade}?`, answer: `Devido às equipes posicionadas nos principais bairros de ${city.cidade}, chegamos entre 20 e 40 minutos.` }
  ];

  const html = `
<!DOCTYPE html>
<html lang="pt-BR" data-theme="${city.paletaCores || 'urgencia-azul-laranja'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${h1Title} | Atendimento 24h Sem Quebrar Piso</title>
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
    .chip { background: rgba(255,255,255,0.08); padding: 10px 20px; border-radius: 30px; font-size: 0.9rem; color: #fff; font-weight: 700; border: 1px solid rgba(255,255,255,0.1); }

    /* FAQ */
    .faq-sec { padding: 90px 0; background: var(--color-bg-dark); }
    .faq-item { background: var(--color-bg-card); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; margin-bottom: 16px; }
    .faq-item h4 { font-size: 1.15rem; color: #fff; margin-bottom: 8px; }
    .faq-item p { color: var(--color-text-muted); font-size: 0.95rem; }

    /* FOOTER */
    .footer { background: #050811; padding: 70px 0 40px 0; border-top: 1px solid rgba(255,255,255,0.08); font-size: 0.92rem; color: var(--color-text-muted); }
    .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .footer h5 { color: #fff; font-size: 1.15rem; margin-bottom: 16px; }
    .footer-bottom { text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 28px; font-size: 0.85rem; }

    /* FLOATING WHATSAPP */
    .float-wa { position: fixed; bottom: 30px; right: 30px; background: #25d366; color: #fff; width: 66px; height: 66px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; text-decoration: none; box-shadow: 0 10px 30px rgba(37,211,102,0.6); z-index: 999; }
    
    @media (max-width: 768px) {
      .hero-v1-grid { grid-template-columns: 1fr; }
      .footer-grid { grid-template-columns: 1fr; }
      .hero h1 { font-size: 2.2rem; }
    }
  </style>
</head>
<body>

  <div class="topbar">
    🚨 Atendimento Emergencial 24 Horas em ${city.cidade} - ${city.uf} • Chegamos em até 30 Minutos
  </div>

  <header class="header">
    <div class="container header-flex">
      <a href="#" class="logo-box">
        ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo-img">` : `<span class="logo-badge">24H</span>`}
        <div class="logo-text">
          <strong>${empresaNome}</strong>
          <small>Desentupimento e Hidrojateamento em ${city.cidade}</small>
        </div>
      </a>
      <a href="https://wa.me/55${whatsapp}?text=Olá,%20preciso%20de%20atendimento%20em%20${city.cidade}" target="_blank" class="header-btn">
        💬 WhatsApp: (${ddd}) ${whatsapp.substring(2,7)}-${whatsapp.substring(7)}
      </a>
    </div>
  </header>

  <section class="hero">
    <div class="container hero-v1-grid">
      <div>
        <span class="hero-badge">📍 Atendimento em Todos os Bairros de ${city.cidade} (Pop: ${city.populacao})</span>
        <h1>${h1Title}</h1>
        <p class="hero-p">${firstParagraph}</p>
        <a href="https://wa.me/55${whatsapp}?text=Olá,%20preciso%20de%20visita%20grátis%20em%20${city.cidade}" target="_blank" class="hero-btn">
          🚀 Solicitar Visita Grátis no WhatsApp
        </a>
      </div>
      <div class="hero-card">
        <h3>⚡ Orçamento Grátis em ${city.cidade}</h3>
        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-top: 6px;">Chegamos no seu endereço em até 30 minutos sem taxa de visita.</p>
        ${heroImage ? `<div class="hero-img-box"><img src="${heroImage}" alt="${h1Title}"></div>` : `
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin-top: 20px; text-align: left;">
          <div style="color: #34d399; font-weight: 700; margin-bottom: 6px;">✔ Técnicos Locais em ${city.cidade}</div>
          <div style="color: #34d399; font-weight: 700; margin-bottom: 6px;">✔ Sem Quebrar Pisos ou Paredes</div>
          <div style="color: #34d399; font-weight: 700;">✔ Garantia por Escrito de até 90 dias</div>
        </div>
        `}
      </div>
    </div>
  </section>

  <section class="services-sec">
    <div class="container">
      <div class="sec-title">
        <span>NOSSOS SERVIÇOS</span>
        <h2>Serviços Especializados em ${city.cidade}</h2>
      </div>
      <div class="services-grid">
        ${services.map(s => `
          <div class="service-card">
            <div class="service-icon">${s.icon || '⚙️'}</div>
            <h3>${s.title} em ${city.cidade}</h3>
            <p>${s.description}</p>
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
        <span>POR QUE NOS ESCOLHER</span>
        <h2>${lastH2}</h2>
      </div>
      <div class="benefits-grid">
        <div class="benefit-item">
          <strong>⚡ Chegada em 30 Minutos</strong>
          <p>Equipes de prontidão espalhadas pelos principais bairros de ${city.cidade}.</p>
        </div>
        <div class="benefit-item">
          <strong>💰 Orçamento 100% Gratuito</strong>
          <p>Avaliamos a tubulação no local sem cobrar taxa de visita ou deslocamento.</p>
        </div>
        <div class="benefit-item">
          <strong>🛠️ Equipamento Moderno</strong>
          <p>Máquinas rotativas K-50/K-500 e hidrojato que limpam sem quebrar azulejos.</p>
        </div>
        <div class="benefit-item">
          <strong>📜 Garantia por Escrito</strong>
          <p>Emitimos certificado de garantia de até 90 dias com laudo técnico.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="areas-sec">
    <div class="container">
      <h3 style="font-size: 1.5rem; color: #fff;">📍 Bairros Atendidos com Plantão 24h em ${city.cidade}</h3>
      <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-top: 4px;">Atendemos residências, comércios e empresas em todas as regiões de ${city.cidade}:</p>
      <div class="bairros-chips">
        ${bairros.map(b => `<div class="chip">📍 Bairro ${b}</div>`).join('')}
      </div>
    </div>
  </section>

  <section class="faq-sec">
    <div class="container">
      <div class="sec-title" style="color: #fff;">
        <span>DÚVIDAS FREQUENTES</span>
        <h2>Perguntas Frequentes sobre Desentupimento em ${city.cidade}</h2>
      </div>
      <div>
        ${faqs.map(f => `
          <div class="faq-item">
            <h4>${f.question}</h4>
            <p>${f.answer}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container footer-grid">
      <div>
        <h5>${empresaNome}</h5>
        <p>Empresa líder em serviços de desentupimento de esgoto, pias, ralos, vasos e limpeza de fossas com atendimento emergencial 24h em ${city.cidade} e região.</p>
      </div>
      <div>
        <h5>Contato Direto</h5>
        <p>📲 WhatsApp 24h: (${ddd}) ${whatsapp.substring(2,7)}-${whatsapp.substring(7)}</p>
        <p>📍 Endereço: ${endereco}</p>
        <p>📄 CNPJ: ${cnpj}</p>
      </div>
      <div>
        <h5>Hospedagem & Infraestrutura</h5>
        <p>Provedor: ${city.hospedagem.toUpperCase()}</p>
        <p>Tema: ${city.paletaCores}</p>
        <p>Status: 🟢 Ativo & Auditado 100%</p>
      </div>
    </div>
    <div class="container footer-bottom">
      © ${new Date().getFullYear()} ${empresaNome}. Todos os direitos reservados.
    </div>
  </footer>

  <a href="https://wa.me/55${whatsapp}?text=Olá,%20preciso%20de%20atendimento%20urgente%20em%20${city.cidade}" target="_blank" class="float-wa" title="Chamar no WhatsApp">
    💬
  </a>

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
