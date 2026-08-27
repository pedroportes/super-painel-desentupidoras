import React, { useState, useEffect } from 'react';
import { CityConfig, generateUniqueCityContent, ServiceItem, FaqItem } from './cityGenerator';

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
  
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
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
  const [notification, setNotification] = useState<string | null>(null);
  const [newBairroInput, setNewBairroInput] = useState('');

  // New City Wizard Form
  const [createCityForm, setCreateCityForm] = useState({
    cidade: '',
    uf: 'PR',
    populacao: '1.773.733',
    modeloTemplate: 'urgencia-24h' as CityConfig['modeloTemplate'],
    hospedagem: 'cloudflare' as CityConfig['hospedagem'],
    whatsapp: ''
  });

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  useEffect(() => {
    fetchCities();
    fetchSettings();
  }, []);

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

  const handleSelectCityForEditor = (cityId: string) => {
    setSelectedCityId(cityId);
    const found = cities.find(c => c.id === cityId);
    if (found) {
      setEditingCity(JSON.parse(JSON.stringify(found)));
    } else {
      // Nunca deixar o editor mostrando dados de uma cidade diferente da
      // selecionada. Se não achou (ex: lista ainda não sincronizada), limpa
      // o editor em vez de manter os dados antigos.
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
        whatsapp: ''
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
    showNotify(`🚀 Disparando Deploy de ${city.cidade} EXCLUSIVAMENTE para ${city.hospedagem.toUpperCase()}...`);
    try {
      const res = await fetch(`/api/deploy-city/${city.id}`, { method: 'POST' });
      const data = await res.json();
      showNotify(`🟢 ${data.message}! URL: ${data.deployUrl}`);
      fetchCities();
    } catch (e) {
      showNotify('❌ Erro no deploy da cidade.');
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

  const handleApplyModelTemplateToExisting = (modelo: CityConfig['modeloTemplate']) => {
    if (!editingCity) return;
    const fresh = generateUniqueCityContent(editingCity.cidade, editingCity.uf, editingCity.populacao, modelo, editingCity.hospedagem);
    setEditingCity({
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
      services: fresh.services,
      faqs: fresh.faqs,
      bairros: editingCity.bairros?.length ? editingCity.bairros : fresh.bairros
    });
    showNotify(`🔄 Modelo "${modelo}" aplicado ao site de ${editingCity.cidade}!`);
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

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ backgroundColor: '#8b5cf6', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontWeight: 900, fontSize: '0.85rem' }}>PRO BUILDER</span>
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
                href={`/api/preview/${editingCity.id}`}
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
                style={{ backgroundColor: '#f97316', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}
              >
                🚀 Publicar ({editingCity.hospedagem})
              </button>
            </div>
          </div>

          {/* Builder Split Layout: Left Complete Form Inspector | Right Live Interactive Canvas */}
          <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: '16px', alignItems: 'start' }}>
            
            {/* LEFT INSPECTOR & FORM CONTROLS */}
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '16px', maxHeight: '82vh', overflowY: 'auto' }}>
              
              {/* Section Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
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

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>Nome da Empresa / Fantasia:</label>
                    <input 
                      type="text" 
                      value={editingCity.empresaNome || ''}
                      onChange={(e) => setEditingCity({ ...editingCity, empresaNome: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.88rem' }}
                    />
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

              {/* 4. TEMPLATE & MODELS */}
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

            {/* RIGHT: LIVE WYSIWYG CANVAS WITH INLINE TEXT EDITING */}
            <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#060a12', padding: '16px', borderRadius: '16px', border: '1px solid #1e293b', minHeight: '82vh', overflowY: 'auto' }}>
              
              <div 
                style={{
                  width: previewDevice === 'desktop' ? '100%' : '390px',
                  backgroundColor: editingCity.paletaCores === 'corporativo-verde-cinza' ? '#052e16' : editingCity.paletaCores === 'residencial-bege' ? '#1c1917' : editingCity.paletaCores === 'industrial-amarelo' ? '#18181b' : '#0f172a',
                  color: '#f8fafc',
                  borderRadius: previewDevice === 'desktop' ? '8px' : '36px',
                  border: previewDevice === 'desktop' ? '1px solid #334155' : '10px solid #1e293b',
                  boxShadow: previewDevice === 'mobile' ? '0 20px 50px rgba(0,0,0,0.8)' : 'none',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                
                {/* 1. TOPBAR */}
                <div style={{ backgroundColor: editingCity.paletaCores === 'corporativo-verde-cinza' ? '#10b981' : editingCity.paletaCores === 'residencial-bege' ? '#d97706' : editingCity.paletaCores === 'industrial-amarelo' ? '#eab308' : '#0284c7', color: '#fff', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, textAlign: 'center' }}>
                  🚨 Atendimento Emergencial 24 Horas em {editingCity.cidade} - {editingCity.uf} • Chegamos em até 30 Minutos
                </div>

                {/* 2. HEADER */}
                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {editingCity.logoUrl ? (
                      <img src={editingCity.logoUrl} alt="Logo" style={{ maxHeight: '42px', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ backgroundColor: '#f97316', color: '#fff', padding: '6px 10px', borderRadius: '8px', fontWeight: 900, fontSize: '0.85rem' }}>24H</span>
                    )}
                    <div>
                      <strong 
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => setEditingCity({ ...editingCity, empresaNome: e.currentTarget.textContent || '' })}
                        style={{ display: 'block', fontSize: '1.2rem', color: '#f8fafc', outline: 'none', borderBottom: '1px dashed rgba(255,255,255,0.3)', cursor: 'text' }}
                        title="Clique para editar o nome da empresa"
                      >
                        {editingCity.empresaNome || `Desentupidora ${editingCity.cidade} 24h`}
                      </strong>
                      <small style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Desentupimento e Hidrojateamento em {editingCity.cidade}</small>
                    </div>
                  </div>

                  <a href="#" style={{ backgroundColor: '#f97316', color: '#fff', padding: '10px 18px', borderRadius: '8px', fontWeight: 800, textDecoration: 'none', fontSize: '0.85rem' }}>
                    💬 WhatsApp: ({editingCity.whatsapp.substring(0,2)}) {editingCity.whatsapp.substring(2,7)}-{editingCity.whatsapp.substring(7)}
                  </a>
                </div>

                {/* 3. HERO SECTION */}
                <div style={{ padding: '40px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: previewDevice === 'desktop' ? '1.2fr 0.8fr' : '1fr', gap: '30px', alignItems: 'center' }}>
                    <div>
                      <span style={{ display: 'inline-block', backgroundColor: 'rgba(2, 132, 199, 0.15)', border: '1px solid #0284c7', color: '#38bdf8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '14px' }}>
                        📍 Atendimento em Todos os Bairros de {editingCity.cidade} (Pop: {editingCity.populacao})
                      </span>

                      {/* H1 INLINE EDITABLE */}
                      <h1 
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => setEditingCity({ ...editingCity, h1Title: e.currentTarget.textContent || '' })}
                        style={{ fontSize: previewDevice === 'desktop' ? '2.3rem' : '1.7rem', fontWeight: 900, lineHeight: 1.15, marginBottom: '16px', outline: 'none', borderBottom: '1px dashed #38bdf8', cursor: 'text' }}
                        title="Clique para editar o H1 diretamente"
                      >
                        {editingCity.h1Title || `Desentupidora em ${editingCity.cidade} ${editingCity.uf} 24h`}
                      </h1>

                      {/* FIRST PARAGRAPH INLINE EDITABLE */}
                      <p 
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => setEditingCity({ ...editingCity, firstParagraph: e.currentTarget.textContent || '' })}
                        style={{ fontSize: '1rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '24px', outline: 'none', borderBottom: '1px dashed #94a3b8', cursor: 'text' }}
                        title="Clique para editar o 1º Parágrafo diretamente"
                      >
                        {editingCity.firstParagraph || `Precisando de uma desentupidora em ${editingCity.cidade} ${editingCity.uf} urgente? Nossa equipe especializada oferece atendimento emergencial 24 horas para desentupimento de esgoto, pias, vasos sanitários, ralos e limpeza de fossas sépticas em todos os bairros de ${editingCity.cidade} e região.`}
                      </p>

                      <a href="#" style={{ backgroundColor: '#f97316', color: '#fff', padding: '14px 28px', borderRadius: '10px', fontWeight: 800, textDecoration: 'none', display: 'inline-block', fontSize: '1rem', boxShadow: '0 8px 20px rgba(249, 115, 22, 0.4)' }}>
                        🚀 {editingCity.ctaButtonText || 'Solicitar Visita Grátis no WhatsApp'}
                      </a>
                    </div>

                    {/* HERO RIGHT CARD */}
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>⚡ Orçamento Grátis em {editingCity.cidade}</h3>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px' }}>Chegamos no seu endereço em até 30 minutos sem taxa de visita.</p>
                      
                      {editingCity.heroImage ? (
                        <div style={{ borderRadius: '10px', overflow: 'hidden', maxHeight: '180px' }}>
                          <img src={editingCity.heroImage} alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div style={{ textAlign: 'left', backgroundColor: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                          <div style={{ color: '#34d399', fontWeight: 700, marginBottom: '6px', fontSize: '0.85rem' }}>✔ Técnicos Locais em {editingCity.cidade}</div>
                          <div style={{ color: '#34d399', fontWeight: 700, marginBottom: '6px', fontSize: '0.85rem' }}>✔ Sem Quebrar Pisos ou Paredes</div>
                          <div style={{ color: '#34d399', fontWeight: 700, fontSize: '0.85rem' }}>✔ Garantia por Escrito de até 90 dias</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. SERVICES SECTION */}
                <div style={{ padding: '40px 24px', backgroundColor: '#f8fafc', color: '#0f172a' }}>
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <span style={{ color: '#0284c7', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>NOSSOS SERVIÇOS</span>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '4px' }}>Serviços Especializados em {editingCity.cidade}</h2>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: previewDevice === 'desktop' ? 'repeat(3, 1fr)' : '1fr', gap: '16px' }}>
                    {(editingCity.services || []).map((s, idx) => (
                      <div key={idx} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{s.icon || '⚙️'}</div>
                        
                        {/* SERVICE TITLE INLINE EDITABLE */}
                        <h3 
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => {
                            const updated = [...(editingCity.services || [])];
                            updated[idx] = { ...s, title: e.currentTarget.textContent || '' };
                            setEditingCity({ ...editingCity, services: updated });
                          }}
                          style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px', color: '#0f172a', outline: 'none', borderBottom: '1px dashed #cbd5e1', cursor: 'text' }}
                          title="Clique para editar o título do serviço"
                        >
                          {s.title}
                        </h3>

                        {/* SERVICE DESC INLINE EDITABLE */}
                        <p 
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => {
                            const updated = [...(editingCity.services || [])];
                            updated[idx] = { ...s, description: e.currentTarget.textContent || '' };
                            setEditingCity({ ...editingCity, services: updated });
                          }}
                          style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '12px', outline: 'none', borderBottom: '1px dashed #cbd5e1', cursor: 'text' }}
                          title="Clique para editar a descrição do serviço"
                        >
                          {s.description}
                        </p>

                        <a href="#" style={{ color: '#0284c7', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
                          Solicitar Orçamento →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. BENEFITS SECTION (WITH LAST H2) */}
                <div style={{ padding: '40px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <span style={{ color: '#0284c7', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>DIFERENCIAIS</span>
                    
                    {/* LAST H2 INLINE EDITABLE */}
                    <h2 
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => setEditingCity({ ...editingCity, lastH2: e.currentTarget.textContent || '' })}
                      style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '4px', outline: 'none', borderBottom: '1px dashed #38bdf8', cursor: 'text' }}
                      title="Clique para editar o Último H2 diretamente"
                    >
                      {editingCity.lastH2 || `Por que escolher a melhor Desentupidora em ${editingCity.cidade} ${editingCity.uf}?`}
                    </h2>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: previewDevice === 'desktop' ? 'repeat(4, 1fr)' : '1fr', gap: '14px' }}>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '18px', borderRadius: '10px' }}>
                      <strong style={{ display: 'block', fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>⚡ Chegada em 30 min</strong>
                      <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Técnicos nos principais bairros de {editingCity.cidade}.</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '18px', borderRadius: '10px' }}>
                      <strong style={{ display: 'block', fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>💰 Visita Grátis</strong>
                      <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Avaliamos no local sem cobrar deslocamento.</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '18px', borderRadius: '10px' }}>
                      <strong style={{ display: 'block', fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>🛠️ Sem Quebrar</strong>
                      <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Máquinas rotativas e hidrojato de precisão.</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '18px', borderRadius: '10px' }}>
                      <strong style={{ display: 'block', fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>📜 Garantia 90 Dias</strong>
                      <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Certificado e laudo técnico por escrito.</p>
                    </div>
                  </div>
                </div>

                {/* 6. BAIRROS SECTION (GEO) */}
                <div style={{ padding: '36px 24px', backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '4px' }}>
                    📍 Bairros Atendidos com Plantão 24h em {editingCity.cidade}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>
                    Atendemos residências, comércios e empresas em todas as regiões de {editingCity.cidade}:
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(editingCity.bairros || []).map((b, idx) => (
                      <div key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', color: '#fff', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' }}>
                        📍 Bairro {b}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. FAQ SECTION */}
                <div style={{ padding: '36px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '16px', textAlign: 'center' }}>
                    Perguntas Frequentes sobre Desentupimento em {editingCity.cidade}
                  </h3>

                  {(editingCity.faqs || []).map((f, idx) => (
                    <div key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px', marginBottom: '10px' }}>
                      <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '4px' }}>{f.question}</h4>
                      <p style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{f.answer}</p>
                    </div>
                  ))}
                </div>

                {/* 8. FOOTER */}
                <div style={{ backgroundColor: '#050811', padding: '32px 24px', fontSize: '0.85rem', color: '#94a3b8' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: previewDevice === 'desktop' ? '1.5fr 1fr 1fr' : '1fr', gap: '20px', marginBottom: '24px' }}>
                    <div>
                      <strong style={{ display: 'block', color: '#fff', fontSize: '1rem', marginBottom: '6px' }}>{editingCity.empresaNome || `Desentupidora ${editingCity.cidade} 24h`}</strong>
                      <p style={{ fontSize: '0.8rem' }}>Empresa líder em serviços de desentupimento 24h em {editingCity.cidade} e região.</p>
                    </div>
                    <div>
                      <strong style={{ display: 'block', color: '#fff', fontSize: '0.9rem', marginBottom: '6px' }}>Contatos</strong>
                      <p style={{ fontSize: '0.8rem' }}>📲 WhatsApp: ({editingCity.whatsapp.substring(0,2)}) {editingCity.whatsapp.substring(2,7)}-{editingCity.whatsapp.substring(7)}</p>
                      <p style={{ fontSize: '0.8rem' }}>📍 {editingCity.endereco || `Av. Principal, 500 - ${editingCity.cidade}`}</p>
                    </div>
                    <div>
                      <strong style={{ display: 'block', color: '#fff', fontSize: '0.9rem', marginBottom: '6px' }}>Hospedagem</strong>
                      <p style={{ fontSize: '0.8rem' }}>Provedor: {editingCity.hospedagem.toUpperCase()}</p>
                      <p style={{ fontSize: '0.8rem' }}>Tema: {editingCity.paletaCores}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', fontSize: '0.78rem' }}>
                    © {new Date().getFullYear()} {editingCity.empresaNome}. Todos os direitos reservados.
                  </div>
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

    </div>
  );
}
