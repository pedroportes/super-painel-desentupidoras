const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const multer = require('multer');
const { deployCitySite } = require('./scripts/deployEngine.cjs');

const app = express();
const PORT = 5002;

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
      cnpj: city.cnpj || '',
      endereco: city.endereco || '',
      hospedagem: city.hospedagem || 'cloudflare',
      paletaCores: city.paletaCores || 'urgencia-azul-laranja',
      variants: {
        hero: city.heroVariant || 'HeroV1',
        services: city.servicesVariant || 'ServicesGridV1',
        faq: 'FAQV1'
      },
      geoCoordinates: {
        latitude: city.latitude || '',
        longitude: city.longitude || ''
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

  const faqs = city.faqs || [
    { question: `Qual o valor cobrado para um desentupimento em ${city.cidade}?`, answer: `O orçamento é 100% gratuito e feito no local após avaliação da tubulação com o melhor preço da região.` },
    { question: `Vocês atendem emergências 24 horas em ${city.cidade}?`, answer: `Sim! Nossas equipes de plantão em ${city.cidade} operam 24 horas por dia, 7 dias por semana, inclusive domingos e feriados.` },
    { question: `Qual o tempo estimado de chegada em ${city.cidade}?`, answer: `Devido às equipes posicionadas nos principais bairros de ${city.cidade}, chegamos entre 20 e 40 minutos.` }
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
  const faqSubtitle = city.faqSubtitle || `DÚVIDAS FREQUENTES`;
  const faqTitle = city.faqTitle || `Perguntas Frequentes sobre Desentupimento em ${city.cidade}`;
  const footerAboutText = city.footerAboutText || `Empresa líder em serviços de desentupimento de esgoto, pias, ralos, vasos e limpeza de fossas com atendimento emergencial 24h em ${city.cidade} e região.`;
  const footerContactTitle = city.footerContactTitle || `Contato Direto`;

  const metaTitle = `Desentupidora em ${city.cidade} ${city.uf} 24h | Atendimento Sem Quebrar Piso`;
  const metaDescription = `Especialistas em desentupimento de esgoto, pias, ralos e limpeza de fossa em ${city.cidade} ${city.uf}. Chegamos em 30 min. Orçamento gratuito 24h!`;
  
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
        ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo-img">` : `<span class="logo-badge">24H</span>`}
        <div class="logo-text">
          <strong data-editor-id="empresaNome">${empresaNome}</strong>
          <small data-editor-id="logoSubtitle">${logoSubtitle}</small>
        </div>
      </a>
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
        ${bairros.map((b, i) => `<a href="/${slugify(b)}" class="chip" data-editor-id="bairros.${i}">📍 Bairro ${b}</a>`).join('')}
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
        <span style="color: #10b981; font-weight: 700; font-size: 0.85rem;">AVALIAÇÕES DE CLIENTES</span>
        <h2 style="color: #0f172a;">O Que Dizem Nossos Clientes em ${city.cidade}</h2>
      </div>
      <div class="testim-grid">
        ${(city.testimonials || [
          {name: "João Carlos", neighborhood: "Centro", text: "Excelente atendimento! Chegaram rápido e resolveram sem sujeira."},
          {name: "Maria Silva", neighborhood: "Jardim América", text: "Preço justo e equipe muito educada. Recomendo muito!"},
          {name: "Carlos Eduardo", neighborhood: "Vila Nova", text: "Desentupiram o esgoto da minha padaria em plena madrugada. Salvou meu dia."}
        ]).map(t => `
          <div class="testim-card">
            <div class="stars">★★★★★</div>
            <p class="testim-text">"${t.text}"</p>
            <div style="color: #0f172a; font-weight: bold;">${t.name}</div>
            <div style="color: #64748b; font-size: 0.8rem;">${t.neighborhood}</div>
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
      </div>
      <div>
        <h5 data-editor-id="footerContactTitle">${footerContactTitle}</h5>
        <p data-editor-id="whatsappBtnText">${whatsappBtnText}</p>
        <p data-editor-id="endereco">📍 Endereço: ${endereco}</p>
        <p data-editor-id="cnpj">📄 CNPJ: ${cnpj}</p>
      </div>
    </div>
    <div class="container footer-bottom">
      © ${new Date().getFullYear()} ${empresaNome}. Todos os direitos reservados.
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

      // Escutar atualizações vindo do React Pai (quando digita no form da esquerda)
      window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_ELEMENT') {
          const { elementId, newContent } = event.data;
          const el = document.querySelector(\`[data-editor-id="\${elementId}"]\`);
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
