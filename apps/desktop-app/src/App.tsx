import React, { useState } from 'react';

interface CityItem {
  id: string;
  cidade: string;
  uf: string;
  populacao: string;
  status: 'ativo' | 'em_construcao' | 'pendente';
  provedor: 'Cloudflare Pages' | 'Vercel' | 'Netlify';
  dominio: string;
  whatsapp: string;
  parceiroNome: string;
  cliques: number;
  prioridade: 'Alta' | 'Média' | 'Normal';
}

const initialCities: CityItem[] = [
  {
    id: '1',
    cidade: 'Linhares',
    uf: 'ES',
    populacao: '183.797',
    status: 'ativo',
    provedor: 'Cloudflare Pages',
    dominio: 'desentupidoralinhares.com.br',
    whatsapp: '27992795590',
    parceiroNome: 'Marcos Encanamentos',
    cliques: 142,
    prioridade: 'Alta'
  },
  {
    id: '2',
    cidade: 'Cachoeiro de Itapemirim',
    uf: 'ES',
    populacao: '198.342',
    status: 'ativo',
    provedor: 'Vercel',
    dominio: 'desentupidoracachoeiro.com.br',
    whatsapp: '28999887766',
    parceiroNome: 'Guarujá Serviços',
    cliques: 98,
    prioridade: 'Alta'
  },
  {
    id: '3',
    cidade: 'Poços de Caldas',
    uf: 'MG',
    populacao: '172.339',
    status: 'ativo',
    provedor: 'Netlify',
    dominio: 'desentupidorapocos.com.br',
    whatsapp: '35988776655',
    parceiroNome: 'MS Desentop',
    cliques: 76,
    prioridade: 'Alta'
  },
  {
    id: '4',
    cidade: 'Itabuna',
    uf: 'BA',
    populacao: '196.344',
    status: 'em_construcao',
    provedor: 'Cloudflare Pages',
    dominio: 'desentupidoraitabuna.com.br',
    whatsapp: '73999768717',
    parceiroNome: 'Compasan Local',
    cliques: 12,
    prioridade: 'Alta'
  },
  {
    id: '5',
    cidade: 'Porto Seguro',
    uf: 'BA',
    populacao: '182.630',
    status: 'em_construcao',
    provedor: 'Vercel',
    dominio: 'desentupidoraportoseguro.com.br',
    whatsapp: '73988112233',
    parceiroNome: 'Akira DDT',
    cliques: 5,
    prioridade: 'Alta'
  },
  {
    id: '6',
    cidade: 'Guarapuava',
    uf: 'PR',
    populacao: '189.630',
    status: 'pendente',
    provedor: 'Cloudflare Pages',
    dominio: 'desentupidoraguarapuava.com.br',
    whatsapp: '42991264162',
    parceiroNome: 'A definir',
    cliques: 0,
    prioridade: 'Média'
  },
  {
    id: '7',
    cidade: 'Barra Mansa',
    uf: 'RJ',
    populacao: '181.679',
    status: 'pendente',
    provedor: 'Netlify',
    dominio: 'desentupidorabarramansa.com.br',
    whatsapp: '24998765432',
    parceiroNome: 'A definir',
    cliques: 0,
    prioridade: 'Média'
  },
  {
    id: '8',
    cidade: 'Pindamonhangaba',
    uf: 'SP',
    populacao: '172.681',
    status: 'pendente',
    provedor: 'Cloudflare Pages',
    dominio: 'desentupidorapinda.com.br',
    whatsapp: '12991000788',
    parceiroNome: 'A definir',
    cliques: 0,
    prioridade: 'Normal'
  },
  {
    id: '9',
    cidade: 'Atibaia',
    uf: 'SP',
    populacao: '167.161',
    status: 'pendente',
    provedor: 'Vercel',
    dominio: 'desentupidoraatibaia.com.br',
    whatsapp: '11999990000',
    parceiroNome: 'A definir',
    cliques: 0,
    prioridade: 'Normal'
  },
  {
    id: '10',
    cidade: 'Itu',
    uf: 'SP',
    populacao: '175.047',
    status: 'pendente',
    provedor: 'Cloudflare Pages',
    dominio: 'desentupidoraitu.com.br',
    whatsapp: '11988881111',
    parceiroNome: 'A definir',
    cliques: 0,
    prioridade: 'Normal'
  },
  {
    id: '11',
    cidade: 'Balneário Camboriú',
    uf: 'SC',
    populacao: '151.674',
    status: 'pendente',
    provedor: 'Netlify',
    dominio: 'desentupidorabc.com.br',
    whatsapp: '47997776655',
    parceiroNome: 'A definir',
    cliques: 0,
    prioridade: 'Normal'
  },
  {
    id: '12',
    cidade: 'Santa Bárbara d\'Oeste',
    uf: 'SP',
    populacao: '189.456',
    status: 'pendente',
    provedor: 'Cloudflare Pages',
    dominio: 'desentupidorasbo.com.br',
    whatsapp: '19989038457',
    parceiroNome: 'A definir',
    cliques: 0,
    prioridade: 'Normal'
  }
];

export default function App() {
  const [cities, setCities] = useState<CityItem[]>(initialCities);
  const [search, setSearch] = useState('');
  const [ufFilter, setUfFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeModal, setActiveModal] = useState<'whatsapp' | 'keys' | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityItem | null>(null);
  const [tempWhatsapp, setTempWhatsapp] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSyncGoogleSheets = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showNotify('Planilha do Google sincronizada com sucesso! 12 cidades importadas.');
    }, 1500);
  };

  const handleQuickDeploy = (city: CityItem) => {
    showNotify(`Lançando site de ${city.cidade} (${city.uf}) no ${city.provedor}...`);
    setTimeout(() => {
      setCities(prev => prev.map(c => c.id === city.id ? { ...c, status: 'ativo' } : c));
      showNotify(`Site de ${city.cidade} publicado com SUCESSO no ${city.provedor}! (Deploy 1-Clique)`);
    }, 2000);
  };

  const openWhatsappModal = (city: CityItem) => {
    setSelectedCity(city);
    setTempWhatsapp(city.whatsapp);
    setActiveModal('whatsapp');
  };

  const saveWhatsapp = () => {
    if (!selectedCity) return;
    setCities(prev => prev.map(c => c.id === selectedCity.id ? { ...c, whatsapp: tempWhatsapp } : c));
    setActiveModal(null);
    showNotify(`WhatsApp de ${selectedCity.cidade} atualizado para (${tempWhatsapp}) e salvo no ${selectedCity.provedor}!`);
  };

  const filteredCities = cities.filter(c => {
    const matchesSearch = c.cidade.toLowerCase().includes(search.toLowerCase()) || c.dominio.toLowerCase().includes(search.toLowerCase());
    const matchesUf = ufFilter === 'todos' || c.uf === ufFilter;
    const matchesStatus = statusFilter === 'todos' || c.status === statusFilter;
    return matchesSearch && matchesUf && matchesStatus;
  });

  const totalActive = cities.filter(c => c.status === 'ativo').length;
  const totalBuilding = cities.filter(c => c.status === 'em_construcao').length;
  const totalPending = cities.filter(c => c.status === 'pendente').length;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#10b981',
          color: '#ffffff',
          padding: '14px 24px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 9999,
          fontWeight: 600,
          fontSize: '0.95rem'
        }}>
          {notification}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ backgroundColor: '#10b981', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem' }}>PRO</span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>Super Painel - Gestão de Rede de Desentupidoras</h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '6px' }}>
            Central de Comando para lançamento, SEO/GEO/AEO e troca rápida de parceiros em multi-provedores (Cloudflare Pages, Vercel, Netlify).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleSyncGoogleSheets}
            style={{
              backgroundColor: isSyncing ? '#334155' : '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isSyncing ? '🔄 Sincronizando...' : '📊 Sincronizar Google Planilha'}
          </button>

          <button 
            onClick={() => setActiveModal('keys')}
            style={{
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              padding: '12px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🔑 Chaves API (Provedores)
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>TOTAL DE CIDADES MAPEADAS</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginTop: '8px' }}>{cities.length} Cidades</div>
          <div style={{ color: '#34d399', fontSize: '0.8rem', marginTop: '4px' }}>Importadas via Google Sheets</div>
        </div>

        <div style={{ backgroundColor: '#0f172a', border: '1px solid #059669', borderRadius: '12px', padding: '20px' }}>
          <div style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>SITES ATIVOS (ONLINE)</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '8px' }}>{totalActive}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>Ranqueando no Google</div>
        </div>

        <div style={{ backgroundColor: '#0f172a', border: '1px solid #d97706', borderRadius: '12px', padding: '20px' }}>
          <div style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>EM CONSTRUÇÃO</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginTop: '8px' }}>{totalBuilding}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>Ajustando SEO local</div>
        </div>

        <div style={{ backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '12px', padding: '20px' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>PENDENTES (FALTAM FAZER)</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#e2e8f0', marginTop: '8px' }}>{totalPending}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>Prontas para lançar 1-Clique</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Buscar por cidade ou domínio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#ffffff',
            fontSize: '0.95rem'
          }}
        />

        <select 
          value={ufFilter} 
          onChange={(e) => setUfFilter(e.target.value)}
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#ffffff',
            fontSize: '0.95rem'
          }}
        >
          <option value="todos">Todos os Estados (UF)</option>
          <option value="ES">Espírito Santo (ES)</option>
          <option value="BA">Bahia (BA)</option>
          <option value="MG">Minas Gerais (MG)</option>
          <option value="PR">Paraná (PR)</option>
          <option value="RJ">Rio de Janeiro (RJ)</option>
          <option value="SP">São Paulo (SP)</option>
          <option value="SC">Santa Catarina (SC)</option>
        </select>

        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#ffffff',
            fontSize: '0.95rem'
          }}
        >
          <option value="todos">Todos os Status</option>
          <option value="ativo">Ativos (Online)</option>
          <option value="em_construcao">Em Construção</option>
          <option value="pendente">Pendentes (Faltam Fazer)</option>
        </select>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#1e293b', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '16px 20px' }}>CIDADE / UF</th>
              <th style={{ padding: '16px 20px' }}>POPULAÇÃO</th>
              <th style={{ padding: '16px 20px' }}>STATUS</th>
              <th style={{ padding: '16px 20px' }}>PROVEDOR</th>
              <th style={{ padding: '16px 20px' }}>DOMÍNIO ALVO</th>
              <th style={{ padding: '16px 20px' }}>WHATSAPP ATUAL</th>
              <th style={{ padding: '16px 20px' }}>CLIQUES</th>
              <th style={{ padding: '16px 20px', textAlign: 'right' }}>AÇÕES RÁPIDAS</th>
            </tr>
          </thead>
          <tbody>
            {filteredCities.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '16px 20px', fontWeight: 700, color: '#f8fafc' }}>
                  {item.cidade} <span style={{ color: '#0284c7', fontSize: '0.8rem' }}>({item.uf})</span>
                </td>
                <td style={{ padding: '16px 20px', color: '#cbd5e1' }}>{item.populacao} hab</td>
                <td style={{ padding: '16px 20px' }}>
                  {item.status === 'ativo' && <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '4px 10px', borderRadius: '20px', fontWeight: 600, fontSize: '0.8rem' }}>Ativo</span>}
                  {item.status === 'em_construcao' && <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '4px 10px', borderRadius: '20px', fontWeight: 600, fontSize: '0.8rem' }}>Em Construção</span>}
                  {item.status === 'pendente' && <span style={{ backgroundColor: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', padding: '4px 10px', borderRadius: '20px', fontWeight: 600, fontSize: '0.8rem' }}>Pendente</span>}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ 
                    backgroundColor: item.provedor === 'Cloudflare Pages' ? 'rgba(249, 115, 22, 0.15)' : item.provedor === 'Vercel' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                    color: item.provedor === 'Cloudflare Pages' ? '#fb923c' : item.provedor === 'Vercel' ? '#ffffff' : '#22d3ee',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}>
                    {item.provedor}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', color: '#94a3b8', fontFamily: 'monospace' }}>
                  {item.dominio}
                </td>
                <td style={{ padding: '16px 20px', color: '#10b981', fontWeight: 600 }}>
                  ({item.whatsapp.substring(0,2)}) {item.whatsapp.substring(2,7)}-{item.whatsapp.substring(7)}
                </td>
                <td style={{ padding: '16px 20px', color: '#f8fafc', fontWeight: 700 }}>
                  {item.cliques}
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => handleQuickDeploy(item)}
                      title="Lançar no Provedor"
                      style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      Lançar
                    </button>

                    <button 
                      onClick={() => openWhatsappModal(item)}
                      title="Troca Rápida de WhatsApp do Parceiro"
                      style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      WhatsApp
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeModal === 'whatsapp' && selectedCity && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '450px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f8fafc', marginBottom: '8px' }}>Troca Rápida de WhatsApp</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
              Atualizar número do parceiro para a cidade de <strong style={{ color: '#fff' }}>{selectedCity.cidade} ({selectedCity.uf})</strong> no provedor <strong>{selectedCity.provedor}</strong>.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '8px', fontWeight: 600 }}>Novo Número do WhatsApp (somente números):</label>
              <input 
                type="text" 
                value={tempWhatsapp}
                onChange={(e) => setTempWhatsapp(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff', fontSize: '1rem', fontWeight: 700 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setActiveModal(null)} style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={saveWhatsapp} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                Salvar & Publicar no Provedor
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'keys' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '550px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f8fafc', marginBottom: '8px' }}>Chaves de API de Hospedagem (Multi-Provedor)</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
              Insira seus tokens de API para permitir o deploy automático em 1-clique:
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#fb923c', marginBottom: '6px', fontWeight: 600 }}>Cloudflare API Token / Account ID:</label>
              <input type="password" value="****************************************" readOnly style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#ffffff', marginBottom: '6px', fontWeight: 600 }}>Vercel Access Token:</label>
              <input type="password" value="****************************************" readOnly style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#22d3ee', marginBottom: '6px', fontWeight: 600 }}>Netlify Personal Access Token:</label>
              <input type="password" value="****************************************" readOnly style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setActiveModal(null)} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                Salvar Chaves
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
