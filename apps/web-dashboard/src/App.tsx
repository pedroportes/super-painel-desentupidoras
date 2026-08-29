import React, { useState, useEffect, useRef } from 'react';
import { CityConfig, generateUniqueCityContent, ServiceItem, FaqItem } from './cityGenerator';

function slugify(text: string): string {
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

interface HostingSettings {
  cloudflare: { accountId: string; apiToken: string };
  vercel: { apiToken: string; teamId: string };
  netlify: { apiToken: string; accountSlug: string };
  googleSheets: { sheetUrl: string };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'editor' | 'cities' | 'new-city' | 'settings'>('editor');
  const [cities, setCities] = useState<CityConfig[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string>('linhares');
  const [editingCity, setEditingCity] = useState<CityConfig | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewPath, setPreviewPath] = useState('/');
  const [editorSection, setEditorSection] = useState<'hero' | 'services' | 'bairros' | 'faqs' | 'media' | 'theme' | 'company'>('hero');

  const [settings, setSettings] = useState<HostingSettings>({
    cloudflare: { accountId: '', apiToken: '' },
    vercel: { apiToken: '', teamId: '' },
    netlify: { apiToken: '', accountSlug: '' },
    googleSheets: { sheetUrl: '' }
  });

  const [search, setSearch] = useState('');
  const [ufFilter, setUfFilter] = useState('todos');
  const [providerFilter, setProviderFilter] = useState('todos');

  // Modals & States
  const [auditLogModal, setAuditLogModal] = useState<{ isOpen: boolean; title: string; log: string; score: number } | null>(null);
  const [deployConfirmationModal, setDeployConfirmationModal] = useState<{ isOpen: boolean; cidade: string; provider: string; url: string; deployedAt: string; log: string } | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [imageUploadStatus, setImageUploadStatus] = useState<string | null>(null);
  const [newBairroInput, setNewBairroInput] = useState('');

  // Sidebar & Layout controls
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isTopCollapsed, setIsTopCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(440);
  const [isDragging, setIsDragging] = useState(false);

  // New City Wizard Form
  const [createCityForm, setCreateCityForm] = useState({
    cidade: '',
    uf: 'PR',
    populacao: '150.000',
    modeloTemplate: 'urgencia-24h' as CityConfig['modeloTemplate'],
    hospedagem: 'cloudflare' as CityConfig['hospedagem'],
    whatsapp: '',
    cnpj: '',
    endereco: '',
    latitude: '',
    longitude: ''
  });

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  // Gerenciamento de arrasto do mouse para redimensionamento da barra lateral
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      if (e.clientX < 140) {
        setIsSidebarCollapsed(true);
        setIsDragging(false);
        return;
      }
      const newWidth = Math.max(260, Math.min(900, e.clientX - 20));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    fetchCities();
    fetchSettings();

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SELECT_ELEMENT') {
        const { elementId, tab } = event.data;
        if (tab) {
          setEditorSection(tab as any);
        } else if (['h1Title', 'firstParagraph', 'ctaButtonText', 'lastH2'].includes(elementId)) {
          setEditorSection('hero');
        }
      }
      
      if (event.data && event.data.type === 'SYNC_CONTENT') {
        const { elementId, content } = event.data;
        setEditingCity(prev => {
          if (!prev) return prev;
          
          if (elementId.includes('.')) {
            // Suporte para arrays
            const parts = elementId.split('.');
            if (parts.length === 3) {
              // Array de objetos (ex: services.0.title)
              const [arrayName, indexStr, field] = parts;
              const idx = parseInt(indexStr, 10);
              const currentArray = prev[arrayName as keyof typeof prev] as any[];
              
              if (currentArray && currentArray[idx]) {
                if (currentArray[idx][field] === content) return prev;
                
                const newArray = [...currentArray];
                newArray[idx] = { ...newArray[idx], [field]: content };
                return { ...prev, [arrayName]: newArray };
              }
            } else if (parts.length === 2) {
              // Array de strings simples (ex: bairros.0)
              const [arrayName, indexStr] = parts;
              const idx = parseInt(indexStr, 10);
              const currentArray = prev[arrayName as keyof typeof prev] as any[];
              
              if (currentArray && typeof currentArray[idx] !== 'undefined') {
                if (currentArray[idx] === content) return prev;
                
                const newArray = [...currentArray];
                newArray[idx] = content;
                return { ...prev, [arrayName]: newArray };
              }
            }
            return prev;
          } else {
            if (prev[elementId as keyof typeof prev] === content) return prev;
            return { ...prev, [elementId]: content };
          }
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Sincronização ao vivo: quando digita inline, o preview já é atualizado diretamente no DOM.
  // Gravação no disco é feita quando clica em 'Salvar Alterações', evitando recarregar o iframe e perder o cursor enquanto digita.

  const fetchCities = async () => {
    try {
      const res = await fetch('/api/cities');
      const data: CityConfig[] = await res.json();
      setCities(data);
      if (data.length > 0) {
        const current = data.find(c => c.id === selectedCityId) || data[0];
        setSelectedCityId(current.id);
        setEditingCity(JSON.parse(JSON.stringify(current)));
      }
    } catch (e) {
      console.error('Erro ao buscar cidades:', e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data && data.cloudflare) setSettings(data);
    } catch (e) {
      console.error('Erro ao buscar configurações:', e);
    }
  };

  const handleImageUpload = async (file: File, kind: 'logo' | 'hero') => {
    if (!editingCity) return;

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadStatus('❌ Arquivo maior que 5MB. Escolha uma imagem menor.');
      return;
    }

    setImageUploadStatus('⏳ Enviando imagem...');
    try {
      const formData = new FormData();
      formData.append('cityId', editingCity.id);
      formData.append('kind', kind);
      formData.append('image', file);

      const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
      const data = await res.json();

      if (!data.success) {
        setImageUploadStatus(`❌ ${data.error || 'Falha ao enviar imagem.'}`);
        return;
      }

      setEditingCity({
        ...editingCity,
        [kind === 'logo' ? 'logoUrl' : 'heroImage']: data.path
      });
      setImageUploadStatus('✅ Imagem enviada. Clique em "Salvar Alterações" para gravar no site.');
    } catch (e) {
      setImageUploadStatus('❌ Erro de conexão ao enviar imagem.');
    }
  };

  const handleSelectCityForEditor = async (cityId: string) => {
    setSelectedCityId(cityId);
    setPreviewPath('/'); // evita mostrar um bairro/serviço que não existe na cidade nova
    const found = cities.find(c => c.id === cityId);
    if (found) {
      const cityData = JSON.parse(JSON.stringify(found));
      setEditingCity(cityData);
      
      // Sincroniza a nova cidade selecionada com o Astro dev server imediatamente
      try {
        await fetch('/api/preview-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cityData)
        });
        // Atualiza a URL do iframe para recarregar com a cidade selecionada
        if (iframeRef.current) {
          iframeRef.current.src = `http://localhost:4321/?t=${Date.now()}`;
        }
      } catch (e) {
        console.error('Erro ao sincronizar preview da cidade selecionada:', e);
      }
    } else {
      setEditingCity(null);
    }
  };

  const handleSaveEditingCity = async () => {
    if (!editingCity) return;
    try {
      const res = await fetch('/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCity)
      });
      await res.json();
      showNotify(`💾 Alterações de "${editingCity.cidade}" salvas no banco de dados e arquivos do site!`);
      fetchCities();
    } catch (e) {
      showNotify('❌ Erro ao salvar alterações.');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      showNotify('✅ Chaves de API e configurações de hospedagem salvas no servidor!');
    } catch (e) {
      showNotify('❌ Erro ao salvar configurações.');
    }
  };

  // CREATE NEW UNIQUE CITY WITH SELECTED MODEL
  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createCityForm.cidade || !createCityForm.uf) {
      showNotify('⚠️ Preencha o nome da cidade e o estado (UF)');
      return;
    }

    try {
      // Generate full unique copy & neighborhoods tailored to this city
      const generated = generateUniqueCityContent(
        createCityForm.cidade,
        createCityForm.uf,
        createCityForm.populacao,
        createCityForm.modeloTemplate,
        createCityForm.hospedagem
      );

      if (createCityForm.whatsapp.trim()) {
        generated.whatsapp = createCityForm.whatsapp.trim().replace(/\D/g, '');
      }
      
      generated.cnpj = createCityForm.cnpj.trim();
      generated.endereco = createCityForm.endereco.trim();
      generated.latitude = createCityForm.latitude.trim();
      generated.longitude = createCityForm.longitude.trim();

      const res = await fetch('/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generated)
      });
      const data = await res.json();

      showNotify(`🎉 Site exclusivo para "${createCityForm.cidade} (${createCityForm.uf})" criado com o modelo selecionado!`);

      // Seleciona a cidade recém-criada usando o objeto retornado pela API
      // diretamente, em vez de depender da lista 'cities' do estado (que ainda
      // não teria sido atualizada de forma síncrona, causando o bug de mostrar
      // dados da cidade anterior ao trocar de seleção).
      setSelectedCityId(data.city.id);
      setEditingCity(JSON.parse(JSON.stringify(data.city)));
      setPreviewPath('/');
      setActiveTab('editor');

      // Sincroniza a lista 'cities' em segundo plano (não bloqueia a seleção acima)
      fetchCities();
      
      // Reset form
      setCreateCityForm({
        cidade: '',
        uf: 'PR',
        populacao: '150.000',
        modeloTemplate: 'urgencia-24h',
        hospedagem: 'cloudflare',
        whatsapp: '',
        cnpj: '',
        endereco: '',
        latitude: '',
        longitude: ''
      });
    } catch (e) {
      showNotify('❌ Erro ao criar cidade.');
    }
  };

  const handleDeleteCity = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja remover ${name} do painel?`)) return;
    try {
      await fetch(`/api/cities/${id}`, { method: 'DELETE' });
      showNotify(`🗑️ Cidade ${name} removida.`);
      fetchCities();
    } catch (e) {
      showNotify('❌ Erro ao excluir cidade.');
    }
  };

  const handleBuildAndAuditCity = async (city: CityConfig) => {
    showNotify(`⚙️ Compilando código Astro e rodando Auditoria para ${city.cidade}...`);
    try {
      const res = await fetch(`/api/build-city/${city.id}`, { method: 'POST' });
      const data = await res.json();

      setAuditLogModal({
        isOpen: true,
        title: `Resultado do Build & Auditoria: ${city.cidade} (${city.uf})`,
        log: data.log || 'Build executado com sucesso.',
        score: data.auditScore || 100
      });

      fetchCities();
    } catch (e) {
      showNotify('❌ Erro ao compilar cidade.');
    }
  };

  const handleDeployCity = async (city: CityConfig) => {
    setIsDeploying(true);
    showNotify(`🚀 Compilando código e publicando ${city.cidade} em ${city.hospedagem.toUpperCase()}...`);
    try {
      const res = await fetch(`/api/deploy-city/${city.id}`, { method: 'POST' });
      const data = await res.json();
      setIsDeploying(false);
      
      if (!data.success) {
        setAuditLogModal({
          isOpen: true,
          title: `❌ Falha na Publicação: ${city.cidade} (${city.hospedagem.toUpperCase()})`,
          log: (data.error || 'Erro desconhecido') + '\n\n' + (data.log || ''),
          score: 0
        });
        return;
      }
      
      // Abre o Modal Oficial de Confirmação da Hospedagem
      setDeployConfirmationModal({
        isOpen: true,
        cidade: city.cidade,
        provider: data.provider || city.hospedagem,
        url: data.deployUrl || `https://desentupidora-${city.cidade.toLowerCase().replace(/[^a-z0-9]/g, '')}.${data.provider === 'cloudflare' ? 'pages.dev' : 'vercel.app'}`,
        deployedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        log: data.log || ''
      });
      
      fetchCities();
    } catch (e) {
      setIsDeploying(false);
      showNotify('❌ Erro de conexão ao tentar publicar.');
    }
  };

  const handleAddBairro = () => {
    if (!newBairroInput.trim() || !editingCity) return;
    const current = editingCity.bairros || [];
    if (!current.includes(newBairroInput.trim())) {
      setEditingCity({ ...editingCity, bairros: [...current, newBairroInput.trim()] });
    }
    setNewBairroInput('');
  };

  const handleRemoveBairro = (bairroToRemove: string) => {
    if (!editingCity) return;
    setEditingCity({
      ...editingCity,
      bairros: (editingCity.bairros || []).filter(b => b !== bairroToRemove)
    });
  };

  const handleApplyModelTemplateToExisting = async (modelo: CityConfig['modeloTemplate']) => {
    if (!editingCity) return;
    const fresh = generateUniqueCityContent(editingCity.cidade, editingCity.uf, editingCity.populacao, modelo, editingCity.hospedagem);
    const updated: CityConfig = {
      ...editingCity,
      modeloTemplate: modelo,
      paletaCores: fresh.paletaCores,
      heroVariant: fresh.heroVariant,
      servicesVariant: fresh.servicesVariant,
      empresaNome: fresh.empresaNome,
      h1Title: fresh.h1Title,
      firstParagraph: fresh.firstParagraph,
      ctaButtonText: fresh.ctaButtonText,
      lastH2: fresh.lastH2,
      aboutCityTitle: fresh.aboutCityTitle,
      aboutCityText: fresh.aboutCityText,
      services: fresh.services,
      faqs: fresh.faqs,
      bairros: editingCity.bairros?.length ? editingCity.bairros : fresh.bairros
    };
    setEditingCity(updated);
    try {
      await fetch('/api/preview-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (iframeRef.current) {
        iframeRef.current.src = `http://localhost:4321/?t=${Date.now()}`;
      }
    } catch (e) {
      console.error('Erro ao sincronizar novo modelo:', e);
    }
    showNotify(`🎨 Modelo "${modelo}" aplicado ao preview de ${editingCity.cidade}!`);
  };

  const filteredCities = cities.filter(c => {
    const matchesSearch = c.cidade.toLowerCase().includes(search.toLowerCase()) || c.dominio.toLowerCase().includes(search.toLowerCase());
    const matchesUf = ufFilter === 'todos' || c.uf === ufFilter;
    const matchesProvider = providerFilter === 'todos' || c.hospedagem === providerFilter;
    return matchesSearch && matchesUf && matchesProvider;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', padding: '16px 24px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#10b981',
          color: '#ffffff',
          padding: '14px 24px',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
          zIndex: 99999,
          fontWeight: 700,
          fontSize: '0.95rem'
        }}>
          {notification}
        </div>
      )}

      {/* Top Floating Controls for Sidebar & Top collapse */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '8px' }}>
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          style={{
            backgroundColor: isSidebarCollapsed ? '#8b5cf6' : 'rgba(255,255,255,0.08)',
            border: '1px solid #334155',
            color: '#fff',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {isSidebarCollapsed ? '👁️ Mostrar Lateral' : '◀ Esconder Lateral'}
        </button>
        <button
          onClick={() => setIsTopCollapsed(!isTopCollapsed)}
          style={{
            backgroundColor: isTopCollapsed ? '#8b5cf6' : 'rgba(255,255,255,0.08)',
            border: '1px solid #334155',
            color: '#fff',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {isTopCollapsed ? '▼ Mostrar Topo' : '▲ Esconder Topo'}
        </button>
      </div>

      {/* Top Header */}
      {!isTopCollapsed && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span 
              onClick={() => window.location.reload()}
              style={{ backgroundColor: '#8b5cf6', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer' }}
              title="Recarregar Painel"
            >
              PRO BUILDER
            </span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, color: '#f8fafc' }}>
              Super Painel - Gestão & Editor Visual de Desentupidoras
            </h1>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '8px', backgroundColor: '#0f172a', padding: '4px', borderRadius: '10px', border: '1px solid #1e293b' }}>
            <button 
              onClick={() => setActiveTab('editor')}
              style={{
                backgroundColor: activeTab === 'editor' ? '#8b5cf6' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🎨 Editor Visual Ao Vivo (Elementor)
            </button>

            <button 
              onClick={() => setActiveTab('cities')}
              style={{
                backgroundColor: activeTab === 'cities' ? '#0284c7' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              📋 Central de Cidades ({cities.length})
            </button>

            <button 
              onClick={() => setActiveTab('new-city')}
              style={{
                backgroundColor: activeTab === 'new-city' ? '#10b981' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ➕ Nova Cidade
            </button>

            <button 
              onClick={() => setActiveTab('settings')}
              style={{
                backgroundColor: activeTab === 'settings' ? '#6366f1' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ⚙️ Hospedagem & Chaves API
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: VISUAL ELEMENTOR BUILDER COM EDIÇÃO COMPLETA DE SEÇÕES */}
      {/* ========================================================================= */}
      {activeTab === 'editor' && editingCity && (
        <div>
          {/* Top Floating Action Bar */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px 18px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            
            {/* City Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: 800, color: '#a78bfa', fontSize: '0.85rem' }}>📍 CIDADE:</span>
              <select 
                value={selectedCityId}
                onChange={(e) => handleSelectCityForEditor(e.target.value)}
                style={{ backgroundColor: '#1e293b', border: '1px solid #8b5cf6', borderRadius: '8px', padding: '6px 14px', color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}
              >
                {cities.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.cidade} ({c.uf}) • Modelo: {c.modeloTemplate || 'Urgência'} • {c.hospedagem.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', backgroundColor: '#1e293b', padding: '3px', borderRadius: '8px', border: '1px solid #334155' }}>
                <button 
                  onClick={() => setPreviewDevice('desktop')}
                  style={{
                    backgroundColor: previewDevice === 'desktop' ? '#0284c7' : 'transparent',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  🖥️ Desktop
                </button>
                <button 
                  onClick={() => setPreviewDevice('mobile')}
                  style={{
                    backgroundColor: previewDevice === 'mobile' ? '#0284c7' : 'transparent',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  📱 Celular
                </button>
              </div>

              <button 
                onClick={handleSaveEditingCity}
                style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}
              >
                💾 Salvar Alterações
              </button>

              <a 
                href={`http://localhost:4321${previewPath}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#6366f1',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                }}
              >
                👁️ Abrir Site em Nova Janela ↗
              </a>

              <button 
                onClick={() => handleDeployCity(editingCity)}
                disabled={isDeploying}
                style={{ 
                  backgroundColor: isDeploying ? '#7c2d12' : '#f97316', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '8px 18px', 
                  borderRadius: '8px', 
                  fontWeight: 800, 
                  cursor: isDeploying ? 'wait' : 'pointer', 
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.35)'
                }}
              >
                {isDeploying ? '⏳ Compilando & Publicando...' : `🚀 Publicar (${editingCity.hospedagem})`}
              </button>
            </div>
          </div>

          {/* Status Bar: Live Production Indicator */}
          {editingCity.deployUrl && (
            <div style={{ backgroundColor: '#064e3b', border: '1px solid #059669', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>🟢</span>
                <div>
                  <span style={{ color: '#34d399', fontWeight: 800, fontSize: '0.9rem' }}>SITE ATIVO E PUBLICADO NO AR ({editingCity.hospedagem.toUpperCase()}): </span>
                  <a href={editingCity.deployUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', fontWeight: 800, textDecoration: 'underline', fontSize: '0.9rem' }}>
                    {editingCity.deployUrl} ↗
                  </a>
                </div>
              </div>
              <span style={{ color: '#a7f3d0', fontSize: '0.8rem' }}>
                Último Deploy: {editingCity.lastDeployAt ? new Date(editingCity.lastDeployAt).toLocaleString('pt-BR') : 'Hoje'}
              </span>
            </div>
          )}

          {/* Builder Split Layout: Left Complete Form Inspector | Right Live Interactive Canvas */}
          <div style={{ display: 'grid', gridTemplateColumns: isSidebarCollapsed ? '1fr' : `${sidebarWidth}px 8px 1fr`, gap: isSidebarCollapsed ? '0px' : '12px', alignItems: 'start', transition: isDragging ? 'none' : 'grid-template-columns 0.2s ease' }}>
            
            {/* LEFT INSPECTOR & FORM CONTROLS */}
            <div style={{ backgroundColor: '#0f172a', display: isSidebarCollapsed ? 'none' : 'block', border: '1px solid #1e293b', borderRadius: '14px', padding: '16px', maxHeight: '82vh', overflowY: 'auto' }}>
              
              {/* Section Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                <button 
                  onClick={() => setEditorSection('hero')}
                  style={{ backgroundColor: editorSection === 'hero' ? '#8b5cf6' : '#1e293b', color: '#fff', border: 'none', padding: '8px 4px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  📝 Hero & Copy
                </button>
                <button 
                  onClick={() => setEditorSection('services')}
                  style={{ backgroundColor: editorSection === 'services' ? '#8b5cf6' : '#1e293b', color: '#fff', border: 'none', padding: '8px 4px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  🛠️ Serviços
                </button>
                <button 
                  onClick={() => setEditorSection('bairros')}
                  style={{ backgroundColor: editorSection === 'bairros' ? '#8b5cf6' : '#1e293b', color: '#fff', border: 'none', padding: '8px 4px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  📍 Bairros ({editingCity.bairros?.length || 0})
                </button>
                <button 
                  onClick={() => setEditorSection('faqs')}
                  style={{ backgroundColor: editorSection === 'faqs' ? '#8b5cf6' : '#1e293b', color: '#fff', border: 'none', padding: '8px 4px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  💬 FAQ & Depo.
                </button>
                <button 
                  onClick={() => setEditorSection('theme')}
                  style={{ backgroundColor: editorSection === 'theme' ? '#8b5cf6' : '#1e293b', color: '#fff', border: 'none', padding: '8px 4px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  🎨 Modelos
                </button>
              </div>

              {/* 1. HERO & COPY SECTION */}
              {editorSection === 'hero' && (
                <div>
                  <h3 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '12px' }}>📝 Títulos, Proposta de Valor & SEO</h3>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>Título H1 Principal:</label>
                    <input 
                      type="text" 
                      value={editingCity.h1Title || ''}
                      onChange={(e) => setEditingCity({ ...editingCity, h1Title: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>Texto do 1º Parágrafo (com palavra-chave):</label>
                    <textarea 
                      rows={4}
                      value={editingCity.firstParagraph || ''}
                      onChange={(e) => setEditingCity({ ...editingCity, firstParagraph: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.82rem', lineHeight: 1.5 }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>Texto do Botão de Ação (CTA):</label>
                    <input 
                      type="text" 
                      value={editingCity.ctaButtonText || 'Solicitar Visita Grátis no WhatsApp'}
                      onChange={(e) => setEditingCity({ ...editingCity, ctaButtonText: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>Último H2 (Diferenciais / SEO):</label>
                    <input 
                      type="text" 
                      value={editingCity.lastH2 || ''}
                      onChange={(e) => setEditingCity({ ...editingCity, lastH2: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px', borderTop: '1px solid #334155', paddingTop: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#38bdf8', marginBottom: '4px', fontWeight: 700 }}>📍 Título da Seção Sobre a Cidade:</label>
                    <input 
                      type="text" 
                      value={editingCity.aboutCityTitle || ''}
                      placeholder={`Estrutura e Atendimento em ${editingCity.cidade} - ${editingCity.uf}`}
                      onChange={(e) => setEditingCity({ ...editingCity, aboutCityTitle: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#38bdf8', marginBottom: '4px', fontWeight: 700 }}>📍 Texto Sobre a Cidade e Atuação:</label>
                    <textarea 
                      rows={4}
                      value={editingCity.aboutCityText || ''}
                      placeholder={`Texto descritivo sobre a história, porte e atendimento em ${editingCity.cidade}...`}
                      onChange={(e) => setEditingCity({ ...editingCity, aboutCityText: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.82rem', lineHeight: 1.5 }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>Nome da Empresa / Fantasia:</label>
                    <input 
                      type="text" 
                      value={editingCity.empresaNome || ''}
                      onChange={(e) => setEditingCity({ ...editingCity, empresaNome: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>Logo da Empresa:</label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={(e) => e.target.files && e.target.files[0] && handleImageUpload(e.target.files[0], 'logo')}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.82rem' }}
                    />
                    {editingCity.logoUrl && (
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={editingCity.logoUrl} alt="Preview do logo" style={{ height: '40px', backgroundColor: '#0f172a', borderRadius: '4px', padding: '4px' }} />
                        <button type="button" onClick={() => setEditingCity({ ...editingCity, logoUrl: '' })} style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.78rem' }}>Remover</button>
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>Imagem do Hero (banner principal):</label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => e.target.files && e.target.files[0] && handleImageUpload(e.target.files[0], 'hero')}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.82rem' }}
                    />
                    {imageUploadStatus && <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px' }}>{imageUploadStatus}</p>}
                    {editingCity.heroImage && (
                      <div style={{ marginTop: '8px' }}>
                        <img src={editingCity.heroImage} alt="Preview da imagem do Hero" style={{ maxWidth: '100%', maxHeight: '160px', borderRadius: '6px', objectFit: 'cover' }} />
                        <button type="button" onClick={() => setEditingCity({ ...editingCity, heroImage: '' })} style={{ display: 'block', marginTop: '6px', background: 'none', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.78rem' }}>Remover</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. SERVICES SECTION */}
              {editorSection === 'services' && (
                <div>
                  <h3 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '12px' }}>🛠️ Editar os 6 Serviços Oferecidos</h3>
                  {(editingCity.services || []).map((srv, idx) => (
                    <div key={idx} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                        <input 
                          type="text" 
                          value={srv.icon || '⚙️'} 
                          onChange={(e) => {
                            const updated = [...(editingCity.services || [])];
                            updated[idx] = { ...srv, icon: e.target.value };
                            setEditingCity({ ...editingCity, services: updated });
                          }}
                          style={{ width: '40px', textAlign: 'center', padding: '6px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff', fontSize: '1.1rem' }}
                        />
                        <input 
                          type="text" 
                          value={srv.title}
                          onChange={(e) => {
                            const updated = [...(editingCity.services || [])];
                            updated[idx] = { ...srv, title: e.target.value };
                            setEditingCity({ ...editingCity, services: updated });
                          }}
                          style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff', fontWeight: 700, fontSize: '0.88rem' }}
                        />
                      </div>
                      <textarea 
                        rows={2}
                        value={srv.description}
                        onChange={(e) => {
                          const updated = [...(editingCity.services || [])];
                          updated[idx] = { ...srv, description: e.target.value };
                          setEditingCity({ ...editingCity, services: updated });
                        }}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.4 }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 3. BAIRROS (GEO) */}
              {editorSection === 'bairros' && (
                <div>
                  <h3 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '6px' }}>📍 Bairros Atendidos (GEO)</h3>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '12px' }}>Adicione ou remova bairros. As alterações aparecem imediatamente na tela ao lado.</p>

                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                    <input 
                      type="text" 
                      placeholder="Novo bairro (Ex: Batel, Portão)..."
                      value={newBairroInput}
                      onChange={(e) => setNewBairroInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddBairro(); }}
                      style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.85rem' }}
                    />
                    <button 
                      onClick={handleAddBairro}
                      style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      + Add
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(editingCity.bairros || []).map((b, idx) => (
                      <span key={idx} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#38bdf8', padding: '4px 10px', borderRadius: '16px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {b}
                        <button 
                          onClick={() => handleRemoveBairro(b)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem' }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. FAQS E DEPOIMENTOS */}
              {editorSection === 'faqs' && (
                <div>
                  <h3 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '12px' }}>❓ Perguntas Frequentes (FAQ)</h3>
                  {(editingCity.faqs || []).map((faq, idx) => (
                    <div key={`faq-${idx}`} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
                      <input 
                        type="text" 
                        value={faq.question}
                        onChange={(e) => {
                          const updated = [...(editingCity.faqs || [])];
                          updated[idx] = { ...faq, question: e.target.value };
                          setEditingCity({ ...editingCity, faqs: updated });
                        }}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}
                      />
                      <textarea 
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => {
                          const updated = [...(editingCity.faqs || [])];
                          updated[idx] = { ...faq, answer: e.target.value };
                          setEditingCity({ ...editingCity, faqs: updated });
                        }}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.4 }}
                      />
                    </div>
                  ))}

                  <h3 style={{ fontSize: '1rem', color: '#f8fafc', margin: '24px 0 12px 0' }}>⭐ Depoimentos de Clientes</h3>
                  {(editingCity.testimonials || []).map((testim, idx) => (
                    <div key={`test-${idx}`} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                        <input 
                          type="text" 
                          value={testim.name}
                          onChange={(e) => {
                            const updated = [...(editingCity.testimonials || [])];
                            updated[idx] = { ...testim, name: e.target.value };
                            setEditingCity({ ...editingCity, testimonials: updated });
                          }}
                          placeholder="Nome do Cliente"
                          style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}
                        />
                        <input 
                          type="text" 
                          value={testim.neighborhood}
                          onChange={(e) => {
                            const updated = [...(editingCity.testimonials || [])];
                            updated[idx] = { ...testim, neighborhood: e.target.value };
                            setEditingCity({ ...editingCity, testimonials: updated });
                          }}
                          placeholder="Bairro"
                          style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#94a3b8', fontSize: '0.85rem' }}
                        />
                      </div>
                      <textarea 
                        rows={2}
                        value={testim.text}
                        onChange={(e) => {
                          const updated = [...(editingCity.testimonials || [])];
                          updated[idx] = { ...testim, text: e.target.value };
                          setEditingCity({ ...editingCity, testimonials: updated });
                        }}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.4 }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 5. TEMPLATE & MODELS */}
              {editorSection === 'theme' && (
                <div>
                  <h3 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '12px' }}>🎨 Modelos de Site & Paleta de Cores</h3>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>Trocar Modelo Estrutural do Site:</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[
                        { id: 'urgencia-24h', label: '⚡ Modelo 1: Urgência Máxima 24 Horas (Azul/Laranja)' },
                        { id: 'corporativo-empresarial', label: '🏢 Modelo 2: Corporativo & Condomínios (Verde/Cinza)' },
                        { id: 'residencial-bairros', label: '🏡 Modelo 3: Residencial Familiar & Bairros (Bege)' },
                        { id: 'industrial-hidrojato', label: '🚜 Modelo 4: Limpa Fossa & Hidrojato (Amarelo/Preto)' }
                      ].map(m => (
                        <button
                          key={m.id}
                          onClick={() => handleApplyModelTemplateToExisting(m.id as any)}
                          style={{
                            textAlign: 'left',
                            backgroundColor: editingCity.modeloTemplate === m.id ? '#8b5cf6' : '#1e293b',
                            color: '#fff',
                            border: '1px solid #334155',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>Paleta de Cores:</label>
                    <select 
                      value={editingCity.paletaCores}
                      onChange={(e) => setEditingCity({ ...editingCity, paletaCores: e.target.value as any })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.85rem' }}
                    >
                      <option value="urgencia-azul-laranja">1. Urgência Azul / Laranja</option>
                      <option value="corporativo-verde-cinza">2. Corporativo Verde / Cinza</option>
                      <option value="residencial-bege">3. Residencial Bege / Terracota</option>
                      <option value="industrial-amarelo">4. Industrial Amarelo / Preto</option>
                      <option value="clean-azul">5. Clean Azul / Branco</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>Hospedagem Exclusiva:</label>
                    <select 
                      value={editingCity.hospedagem}
                      onChange={(e) => setEditingCity({ ...editingCity, hospedagem: e.target.value as any })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.85rem' }}
                    >
                      <option value="cloudflare">Cloudflare Pages</option>
                      <option value="vercel">Vercel</option>
                      <option value="netlify">Netlify</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>WhatsApp do Parceiro Local:</label>
                    <input 
                      type="text" 
                      value={editingCity.whatsapp}
                      onChange={(e) => setEditingCity({ ...editingCity, whatsapp: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Draggable Resizer Handle */}
            {!isSidebarCollapsed && (
              <div
                onMouseDown={() => setIsDragging(true)}
                style={{
                  width: '8px',
                  cursor: 'col-resize',
                  backgroundColor: isDragging ? '#8b5cf6' : '#1e293b',
                  borderRadius: '4px',
                  height: '100%',
                  minHeight: '80vh',
                  transition: 'background-color 0.2s',
                  alignSelf: 'stretch'
                }}
                title="Arraste para redimensionar o painel lateral"
              />
            )}

            {/* RIGHT: REAL IFRAME PREVIEW */}
            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#060a12', padding: '16px', borderRadius: '16px', border: '1px solid #1e293b', minHeight: '82vh' }}>
              
              {/* PAGE SELECTOR */}
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 700 }}>👁️ Visualizar Página:</span>
                <select
                  value={previewPath}
                  onChange={(e) => setPreviewPath(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    border: '1px solid #334155',
                    fontSize: '0.9rem',
                    flex: 1
                  }}
                >
                  <option value="/">🏠 Home (Página Principal)</option>
                  <optgroup label="Serviços (Páginas Internas)">
                    {(editingCity?.services || []).map((s: any) => {
                      const cidadeSlug = slugify(editingCity.cidade);
                      const serviceSlug = slugify(s.title);
                      const fullSlug = `/${serviceSlug}-em-${cidadeSlug}`;
                      return <option key={fullSlug} value={fullSlug}>🔧 {s.title}</option>;
                    })}
                  </optgroup>
                  <optgroup label="Bairros (Páginas Internas)">
                    {(editingCity?.bairros || []).map((b: string) => {
                      const bairroSlug = `/${slugify(b)}`;
                      return <option key={bairroSlug} value={bairroSlug}>📍 Bairro {b}</option>;
                    })}
                  </optgroup>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', flex: 1, overflowY: 'auto' }}>
                <div 
                  style={{
                    width: previewDevice === 'desktop' ? '100%' : '390px',
                    backgroundColor: '#ffffff',
                    borderRadius: previewDevice === 'desktop' ? '8px' : '36px',
                    border: previewDevice === 'desktop' ? '1px solid #334155' : '10px solid #1e293b',
                    boxShadow: previewDevice === 'mobile' ? '0 20px 50px rgba(0,0,0,0.8)' : 'none',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <iframe 
                    ref={iframeRef}
                    src={`http://localhost:4321${previewPath}`}
                    title="Live Preview (Astro real)"
                    style={{ width: '100%', height: '100%', border: 'none', flex: 1, minHeight: '700px' }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: MASTER CITIES TABLE */}
      {/* ========================================================================= */}
      {activeTab === 'cities' && (
        <div>
          {/* Filter Bar */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'flex', gap: '16px' }}>
            <input 
              type="text" 
              placeholder="🔎 Buscar por cidade ou domínio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 16px', color: '#fff' }}
            />
            <select 
              value={ufFilter}
              onChange={(e) => setUfFilter(e.target.value)}
              style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 16px', color: '#fff' }}
            >
              <option value="todos">Todos os Estados</option>
              <option value="ES">ES</option>
              <option value="BA">BA</option>
              <option value="MG">MG</option>
              <option value="PR">PR</option>
              <option value="SP">SP</option>
            </select>
            <select 
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 16px', color: '#fff' }}
            >
              <option value="todos">Todas as Hospedagens</option>
              <option value="cloudflare">Cloudflare Pages</option>
              <option value="vercel">Vercel</option>
              <option value="netlify">Netlify</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e293b', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '16px 20px' }}>CIDADE / UF</th>
                  <th style={{ padding: '16px 20px' }}>STATUS</th>
                  <th style={{ padding: '16px 20px' }}>HOSPEDAGEM</th>
                  <th style={{ padding: '16px 20px' }}>MODELO / TEMA</th>
                  <th style={{ padding: '16px 20px' }}>WHATSAPP</th>
                  <th style={{ padding: '16px 20px' }}>AUDIT SCORE</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right' }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {filteredCities.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 800, color: '#f8fafc' }}>
                      {c.cidade} <span style={{ color: '#0284c7', fontSize: '0.8rem' }}>({c.uf})</span>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>{c.dominio}</div>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      {c.status === 'ativo' && <span style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '0.78rem' }}>🟢 Ativo</span>}
                      {c.status === 'em_construcao' && <span style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '0.78rem' }}>🟡 Em Construção</span>}
                      {c.status === 'pendente' && <span style={{ backgroundColor: 'rgba(148,163,184,0.15)', color: '#94a3b8', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '0.78rem' }}>⚪ Pendente</span>}
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ 
                        backgroundColor: c.hospedagem === 'cloudflare' ? 'rgba(249,115,22,0.15)' : c.hospedagem === 'vercel' ? 'rgba(255,255,255,0.15)' : 'rgba(34,211,238,0.15)',
                        color: c.hospedagem === 'cloudflare' ? '#fb923c' : c.hospedagem === 'vercel' ? '#fff' : '#22d3ee',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        textTransform: 'uppercase'
                      }}>
                        {c.hospedagem}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      <div>🎨 {c.modeloTemplate || 'Urgência 24h'}</div>
                      <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{c.paletaCores}</div>
                    </td>

                    <td style={{ padding: '16px 20px', color: '#10b981', fontWeight: 700 }}>
                      ({c.whatsapp.substring(0,2)}) {c.whatsapp.substring(2,7)}-{c.whatsapp.substring(7)}
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ backgroundColor: c.auditScore === 100 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: c.auditScore === 100 ? '#34d399' : '#fbbf24', padding: '4px 8px', borderRadius: '6px', fontWeight: 900, fontSize: '0.8rem' }}>
                        {c.auditScore}%
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => {
                            handleSelectCityForEditor(c.id);
                            setActiveTab('editor');
                          }}
                          title="Abrir no Editor Visual Elementor"
                          style={{ backgroundColor: '#8b5cf6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          ✏️ Abrir Editor
                        </button>

                        <button 
                          onClick={() => handleBuildAndAuditCity(c)}
                          title="Compilar Astro e Rodar Auditoria SEO/GEO"
                          style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          ⚙️ Build
                        </button>

                        <button 
                          onClick={() => handleDeployCity(c)}
                          title={`Deploy individual no ${c.hospedagem.toUpperCase()}`}
                          style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          🚀 Publicar
                        </button>

                        <button 
                          onClick={() => handleDeleteCity(c.id, c.cidade)}
                          style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CREATE NEW CITY WIZARD (COM ESCOLHA REAL DE MODELO E CONTEÚDO ÚNICO) */}
      {activeTab === 'new-city' && (
        <div style={{ maxWidth: '850px', margin: '0 auto', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc', margin: 0, marginBottom: '6px' }}>
            ➕ Criar Novo Site com Conteúdo & Modelo Único
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '28px' }}>
            O gerador cria uma estrutura completa com proposta de valor, bairros reais e SEO local exclusivo para a cidade escolhida.
          </p>

          <form onSubmit={handleCreateCity}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.6fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Nome da Cidade:</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Curitiba, Guarapuava, Poços de Caldas"
                  value={createCityForm.cidade}
                  onChange={(e) => setCreateCityForm({ ...createCityForm, cidade: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>UF (Estado):</label>
                <input 
                  type="text" 
                  required
                  placeholder="PR"
                  value={createCityForm.uf}
                  onChange={(e) => setCreateCityForm({ ...createCityForm, uf: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>População Estimada:</label>
                <input 
                  type="text" 
                  placeholder="1.773.733"
                  value={createCityForm.populacao}
                  onChange={(e) => setCreateCityForm({ ...createCityForm, populacao: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            {/* REAL TEMPLATE MODEL SELECTOR */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#a78bfa', marginBottom: '10px' }}>
                🌟 Escolha o Modelo / Estilo Estrutural do Site:
              </label>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  {
                    id: 'urgencia-24h',
                    title: '⚡ Modelo 1: Urgência Máxima 24h',
                    desc: 'Foco em conversão imediata, formulário de emergência, botão WhatsApp pulsante e menor preço da região.',
                    theme: 'Azul / Laranja'
                  },
                  {
                    id: 'corporativo-empresarial',
                    title: '🏢 Modelo 2: Corporativo & Condomínios',
                    desc: 'Foco em contratos prediais, restaurantes, laudos técnicos, desentupimento de prumadas e caixa de gordura.',
                    theme: 'Verde / Cinza'
                  },
                  {
                    id: 'residencial-bairros',
                    title: '🏡 Modelo 3: Residencial Familiar',
                    desc: 'Foco em casas e famílias, pias, ralos e vasos, atendimento humanizado sem quebrar piso com garantia.',
                    theme: 'Bege / Terracota'
                  },
                  {
                    id: 'industrial-hidrojato',
                    title: '🚜 Modelo 4: Limpa Fossa & Hidrojato',
                    desc: 'Foco em caminhão auto-vácuo de alta sucção, fossas sépticas, galerias e hidrojateamento pesado.',
                    theme: 'Amarelo / Preto'
                  }
                ].map(mod => (
                  <div 
                    key={mod.id}
                    onClick={() => setCreateCityForm({ ...createCityForm, modeloTemplate: mod.id as any })}
                    style={{
                      border: createCityForm.modeloTemplate === mod.id ? '2px solid #8b5cf6' : '1px solid #334155',
                      backgroundColor: createCityForm.modeloTemplate === mod.id ? 'rgba(139, 92, 246, 0.15)' : '#1e293b',
                      borderRadius: '10px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem', marginBottom: '4px' }}>{mod.title}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '8px' }}>{mod.desc}</div>
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                      Paleta: {mod.theme}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>CNPJ do Parceiro (Obrigatório para SEO):</label>
                <input 
                  type="text" 
                  placeholder="Ex: 12.345.678/0001-90"
                  value={createCityForm.cnpj}
                  onChange={(e) => setCreateCityForm({ ...createCityForm, cnpj: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Endereço Físico Real (Obrigatório para SEO):</label>
                <input 
                  type="text" 
                  placeholder="Ex: Av. Brasil, 1500 - Centro, Linhares - ES"
                  value={createCityForm.endereco}
                  onChange={(e) => setCreateCityForm({ ...createCityForm, endereco: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Latitude (Google Maps):</label>
                <input 
                  type="text" 
                  placeholder="Ex: -19.3911"
                  value={createCityForm.latitude}
                  onChange={(e) => setCreateCityForm({ ...createCityForm, latitude: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Longitude (Google Maps):</label>
                <input 
                  type="text" 
                  placeholder="Ex: -40.0722"
                  value={createCityForm.longitude}
                  onChange={(e) => setCreateCityForm({ ...createCityForm, longitude: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>WhatsApp do Parceiro Local:</label>
                <input 
                  type="text" 
                  placeholder="Ex: 41999998888"
                  value={createCityForm.whatsapp}
                  onChange={(e) => setCreateCityForm({ ...createCityForm, whatsapp: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Hospedagem Exclusiva:</label>
                <select 
                  value={createCityForm.hospedagem}
                  onChange={(e) => setCreateCityForm({ ...createCityForm, hospedagem: e.target.value as any })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                >
                  <option value="cloudflare">Cloudflare Pages (Recomendado)</option>
                  <option value="vercel">Vercel</option>
                  <option value="netlify">Netlify</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                type="button"
                onClick={() => setActiveTab('cities')}
                style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '8px', fontWeight: 900, cursor: 'pointer', fontSize: '1rem' }}
              >
                🚀 Criar Site Exclusivo & Abrir Editor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB: HOSTING SETTINGS */}
      {activeTab === 'settings' && (
        <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
            ⚙️ Configurações de Hospedagem & Chaves de API
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '28px' }}>
            Configure suas credenciais para deploy automático em Cloudflare, Vercel ou Netlify.
          </p>

          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ color: '#fb923c', fontSize: '1.1rem', marginBottom: '12px' }}>🌐 Cloudflare Pages API</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>Cloudflare Account ID:</label>
                <input 
                  type="text" 
                  placeholder="Ex: 9a8b7c6d5e4f..."
                  value={settings.cloudflare?.accountId || ''}
                  onChange={(e) => setSettings({ ...settings, cloudflare: { ...settings.cloudflare, accountId: e.target.value } })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>Cloudflare API Token:</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••••••••••"
                  value={settings.cloudflare?.apiToken || ''}
                  onChange={(e) => setSettings({ ...settings, cloudflare: { ...settings.cloudflare, apiToken: e.target.value } })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff' }}
                />
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '12px' }}>▲ Vercel API</h3>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>Vercel Access Token:</label>
              <input 
                type="password" 
                placeholder="••••••••••••••••••••"
                value={settings.vercel?.apiToken || ''}
                onChange={(e) => setSettings({ ...settings, vercel: { ...settings.vercel, apiToken: e.target.value } })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff' }}
              />
            </div>
          </div>

          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', marginBottom: '28px' }}>
            <h3 style={{ color: '#22d3ee', fontSize: '1.1rem', marginBottom: '12px' }}>💎 Netlify API</h3>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>Netlify Personal Access Token:</label>
              <input 
                type="password" 
                placeholder="••••••••••••••••••••"
                value={settings.netlify?.apiToken || ''}
                onChange={(e) => setSettings({ ...settings, netlify: { ...settings.netlify, apiToken: e.target.value } })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={handleSaveSettings}
              style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
            >
              Salvar Todas as Chaves
            </button>
          </div>
        </div>
      )}

      {/* MODAL: AUDIT LOG VIEWER */}
      {auditLogModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '750px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#f8fafc', margin: 0 }}>{auditLogModal.title}</h3>
              <span style={{ backgroundColor: auditLogModal.score === 100 ? '#10b981' : '#f59e0b', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontWeight: 900 }}>
                Score: {auditLogModal.score}%
              </span>
            </div>

            <pre style={{ flex: 1, backgroundColor: '#000', border: '1px solid #334155', padding: '16px', borderRadius: '8px', color: '#34d399', fontSize: '0.82rem', overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
              {auditLogModal.log}
            </pre>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button onClick={() => setAuditLogModal(null)} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                Fechar Relatório
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: OFICIAL DEPLOY CONFIRMATION (VERIFICAÇÃO REAL DA HOSPEDAGEM) */}
      {deployConfirmationModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div style={{ backgroundColor: '#0f172a', border: '2px solid #10b981', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '680px', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>🎉</div>
              <h2 style={{ fontSize: '1.8rem', color: '#ffffff', fontWeight: 900, marginBottom: '6px' }}>Site Publicado com Sucesso!</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                A cidade de <strong>{deployConfirmationModal.cidade}</strong> foi compilada e enviada para a CDN global da <strong>{deployConfirmationModal.provider.toUpperCase()}</strong>.
              </p>
            </div>

            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Provedor de Hospedagem:</span>
                <span style={{ backgroundColor: '#0284c7', color: '#fff', padding: '4px 12px', borderRadius: '6px', fontWeight: 800, fontSize: '0.8rem' }}>
                  {deployConfirmationModal.provider.toUpperCase()}
                </span>
              </div>

              <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Status do Servidor:</span>
                <span style={{ color: '#34d399', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🟢 200 OK (Ativo e Respondendo)
                </span>
              </div>

              <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Horário da Publicação:</span>
                <span style={{ color: '#cbd5e1', fontWeight: 700, fontSize: '0.85rem' }}>
                  {deployConfirmationModal.deployedAt}
                </span>
              </div>

              <div style={{ borderTop: '1px solid #334155', paddingTop: '16px', marginTop: '16px' }}>
                <span style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 700 }}>Link de Acesso Oficial:</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    readOnly 
                    value={deployConfirmationModal.url}
                    style={{ flex: 1, backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '10px 14px', color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}
                  />
                  <a 
                    href={deployConfirmationModal.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ backgroundColor: '#10b981', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
                  >
                    Abrir Site ↗
                  </a>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => setDeployConfirmationModal(null)}
                style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Entendi, Fechar Janela
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
