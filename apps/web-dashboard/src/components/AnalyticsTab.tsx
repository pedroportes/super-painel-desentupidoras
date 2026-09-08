import React, { useState, useEffect } from 'react';

interface CityAnalytics {
  cityId: string;
  cityName: string;
  uf: string;
  pageviews: number;
  todayPageviews: number;
  whatsappClicks: number;
  todayWhatsappClicks: number;
  phoneClicks: number;
  partnerClicks: number;
  conversionRate: number;
  lastActivity: string;
  uniqueSessions: number;
}

interface AnalyticsSummary {
  overview: {
    totalPageviews: number;
    todayPageviews: number;
    totalWhatsappClicks: number;
    todayWhatsappClicks: number;
    totalPhoneClicks: number;
    totalPartnerClicks: number;
    globalConversionRate: number;
    activeCitiesCount: number;
  };
  cities: CityAnalytics[];
  topPages: { path: string; count: number }[];
  clickLocations: Record<string, number>;
  timeline: { date: string; pageviews: number; whatsapp: number; phone: number }[];
  recentEvents: Array<{
    id: string;
    timestamp: string;
    cityId: string;
    cityName: string;
    uf: string;
    eventType: string;
    pagePath: string;
    elementId: string;
    device: string;
    referrer: string;
  }>;
}

interface CityDetailData {
  cityId: string;
  pageviews: number;
  uniqueSessions: number;
  whatsappClicks: number;
  phoneClicks: number;
  partnerClicks: number;
  conversionRate: number;
  topPages: { path: string; count: number }[];
  clickLocations: Record<string, number>;
  recentEvents: Array<{
    id: string;
    timestamp: string;
    cityId: string;
    cityName: string;
    uf: string;
    eventType: string;
    pagePath: string;
    elementId: string;
    device: string;
    referrer: string;
  }>;
}

export default function AnalyticsTab() {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [cityDetail, setCityDetail] = useState<CityDetailData | null>(null);
  const [cityDetailLoading, setCityDetailLoading] = useState<boolean>(false);

  const fetchSummary = async (filterDays = days) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/summary?days=${filterDays}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Erro ao carregar dados de analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCityDetails = async (cityId: string) => {
    setCityDetailLoading(true);
    try {
      const res = await fetch(`/api/analytics/city/${cityId}?days=${days}`);
      const json = await res.json();
      setCityDetail(json);
    } catch (err) {
      console.error('Erro ao carregar detalhes da cidade:', err);
    } finally {
      setCityDetailLoading(false);
    }
  };

  const handleToggleCity = (cityId: string) => {
    if (selectedCityId === cityId) {
      setSelectedCityId(null);
      setCityDetail(null);
    } else {
      setSelectedCityId(cityId);
      setCityDetail(null); // Clear previous city immediately to avoid mix-up
      fetchCityDetails(cityId);
    }
  };

  useEffect(() => {
    fetchSummary(days);
    const interval = setInterval(() => {
      fetch(`/api/analytics/summary?days=${days}`)
        .then(r => r.json())
        .then(json => setData(json))
        .catch(() => {});

      if (selectedCityId) {
        fetch(`/api/analytics/city/${selectedCityId}?days=${days}`)
          .then(r => r.json())
          .then(json => setCityDetail(json))
          .catch(() => {});
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [days, selectedCityId]);

  const filteredCities = (data?.cities || []).filter(c =>
    c.cityName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.uf.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.cityId.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const formatTimeAgo = (iso: string) => {
    if (!iso) return 'Nunca';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Agora mesmo';
    if (mins < 60) return `Há ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Há ${hours}h`;
    const d = Math.floor(hours / 24);
    return `Há ${d} dias`;
  };

  return (
    <div style={{ padding: '10px 0', color: '#f8fafc' }}>
      {/* Top Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📊</span> Métricas, Conversões & Pixel Próprio
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
            Rastreamento em tempo real de cliques no WhatsApp, ligações e navegação de páginas sem depender do Google ou Facebook.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', backgroundColor: '#0f172a', borderRadius: '8px', padding: '3px', border: '1px solid #334155' }}>
            <button
              onClick={() => setDays(1)}
              style={{
                backgroundColor: days === 1 ? '#0284c7' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Hoje
            </button>
            <button
              onClick={() => setDays(7)}
              style={{
                backgroundColor: days === 7 ? '#0284c7' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              7 Dias
            </button>
            <button
              onClick={() => setDays(30)}
              style={{
                backgroundColor: days === 30 ? '#0284c7' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              30 Dias
            </button>
            <button
              onClick={() => setDays(365)}
              style={{
                backgroundColor: days === 365 ? '#0284c7' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Tudo
            </button>
          </div>

          <button
            onClick={() => fetchSummary(days)}
            disabled={loading}
            style={{
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #334155',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🔄</span> {loading ? 'Atualizando...' : 'Atualizar'}
          </button>

          <button
            onClick={async () => {
              if (window.confirm('Tem certeza que deseja zerar todas as métricas acumuladas de analytics para reiniciar os dados limpos?')) {
                try {
                  const res = await fetch('/api/analytics/reset', { method: 'POST' });
                  const data = await res.json();
                  if (data.success) {
                    await fetchSummary(days);
                    alert('Métricas zeradas com sucesso!');
                  }
                } catch (e) {
                  alert('Erro ao zerar métricas');
                }
              }
            }}
            style={{
              backgroundColor: '#3f1515',
              color: '#f87171',
              border: '1px solid #7f1d1d',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🗑️</span> Zerar Métricas
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {/* Total Pageviews */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>VISITAS TOTAIS</span>
            <span style={{ fontSize: '1.4rem' }}>👁️</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
            {data?.overview.totalPageviews.toLocaleString('pt-BR') || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginTop: '6px', fontWeight: 500 }}>
            +{data?.overview.todayPageviews || 0} visitas hoje
          </div>
        </div>

        {/* Total WhatsApp Clicks */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #10b981', position: 'relative', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ color: '#a7f3d0', fontSize: '0.85rem', fontWeight: 700 }}>CLIQUES NO WHATSAPP</span>
            <span style={{ fontSize: '1.4rem' }}>📲</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>
            {data?.overview.totalWhatsappClicks.toLocaleString('pt-BR') || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6ee7b7', marginTop: '6px', fontWeight: 600 }}>
            +{data?.overview.todayWhatsappClicks || 0} contatos hoje
          </div>
        </div>

        {/* Global Conversion Rate */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>TAXA DE CONVERSÃO</span>
            <span style={{ fontSize: '1.4rem' }}>🎯</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>
            {data?.overview.globalConversionRate || 0}%
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>
            Média de cliques por visitante
          </div>
        </div>

        {/* Phone Calls */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>LIGAÇÕES (TELEFONE)</span>
            <span style={{ fontSize: '1.4rem' }}>📞</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>
            {data?.overview.totalPhoneClicks || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>
            Cliques em números fixos
          </div>
        </div>
      </div>

      {/* Main Content: Cities Table & Realtime Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: Cities Performance Table */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Desempenho por Cidade ({filteredCities.length})
            </h3>

            <input
              type="text"
              placeholder="Buscar cidade..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                width: '180px'
              }}
            />
          </div>

          {filteredCities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📡</div>
              <p style={{ fontWeight: 600, color: '#e2e8f0', margin: '0 0 6px 0' }}>Nenhum evento registrado no período selecionado.</p>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>
                Os cliques e visitas aparecerão aqui assim que as pessoas acessarem qualquer site publicado.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left', color: '#94a3b8', fontSize: '0.8rem' }}>
                    <th style={{ padding: '10px 8px' }}>CIDADE</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>VISITAS</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>WHATSAPP</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>CONVERSÃO</th>
                    <th style={{ padding: '10px 8px' }}>ÚLTIMA ATIVIDADE</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>AÇÃO</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCities.map((city) => (
                    <tr
                      key={city.cityId}
                      style={{
                        borderBottom: '1px solid #334155',
                        transition: 'background-color 0.15s',
                        backgroundColor: selectedCityId === city.cityId ? 'rgba(2, 132, 199, 0.15)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '12px 8px', fontWeight: 600 }}>
                        <div style={{ color: '#f8fafc' }}>{city.cityName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{city.uf} • ID: {city.cityId}</div>
                      </td>

                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#f8fafc' }}>{city.pageviews}</span>
                        {city.todayPageviews > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>+{city.todayPageviews} hoje</div>
                        )}
                      </td>

                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <span style={{
                          backgroundColor: city.whatsappClicks > 0 ? '#064e3b' : 'rgba(255,255,255,0.05)',
                          color: city.whatsappClicks > 0 ? '#34d399' : '#94a3b8',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}>
                          📲 {city.whatsappClicks}
                        </span>
                        {city.todayWhatsappClicks > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '2px' }}>+{city.todayWhatsappClicks} hoje</div>
                        )}
                      </td>

                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <span style={{
                          fontWeight: 700,
                          color: city.conversionRate >= 10 ? '#34d399' : city.conversionRate >= 5 ? '#38bdf8' : '#94a3b8'
                        }}>
                          {city.conversionRate}%
                        </span>
                      </td>

                      <td style={{ padding: '12px 8px', color: '#94a3b8', fontSize: '0.8rem' }}>
                        {formatTimeAgo(city.lastActivity)}
                      </td>

                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleCity(city.cityId)}
                          style={{
                            backgroundColor: selectedCityId === city.cityId ? '#475569' : '#0284c7',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {selectedCityId === city.cityId ? '✕ Fechar' : 'Detalhes'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: City Deep Dive or Global Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {selectedCityId && cityDetail ? (
            /* City Deep Dive Box */
            <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #0284c7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#38bdf8' }}>
                    🔍 Detalhes: {filteredCities.find(c => c.cityId === selectedCityId)?.cityName || selectedCityId}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Métricas detalhadas de navegação e cliques</span>
                </div>
                <button
                  onClick={() => setSelectedCityId(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                  ✕
                </button>
              </div>

              {/* Botões que Mais Converteram */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🎯 Onde os Cliques Aconteceram
                </h4>
                {Object.keys(cityDetail.clickLocations).length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Nenhum clique no WhatsApp ainda nesta cidade.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(cityDetail.clickLocations).map(([loc, count]) => (
                      <div key={loc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '8px 12px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>
                          {loc === 'whatsapp-flutuante' ? '🟢 Botão Flutuante (WhatsApp)' :
                           loc === 'whatsapp-topo' ? '⚡ Barra do Topo' :
                           loc === 'whatsapp-hero' ? '⭐ Botão Principal (Hero)' :
                           loc === 'whatsapp-bairros' ? '📍 Área de Bairros' :
                           loc === 'whatsapp-header' ? '📲 Cabeçalho' : loc}
                        </span>
                        <span style={{ backgroundColor: '#10b981', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                          {count} cliques
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Páginas Internas Mais Visitadas */}
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📄 Páginas Internas Mais Visitadas
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {cityDetail.topPages.slice(0, 6).map((page, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                      <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{page.path}</span>
                      <span style={{ color: '#94a3b8', fontWeight: 600 }}>{page.count} visitas</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Global Top Pages */
            <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 14px 0', color: '#f8fafc' }}>
                🔥 Páginas Mais Visitadas na Rede
              </h3>
              {(data?.topPages || []).length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Nenhum acesso registrado ainda.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data?.topPages.map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '8px 12px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontFamily: 'monospace' }}>{p.path}</span>
                      <span style={{ backgroundColor: '#334155', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                        {p.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Live Recent Events Feed */}
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
                {selectedCityId ? `Atividade: ${filteredCities.find(c => c.cityId === selectedCityId)?.cityName || selectedCityId}` : 'Atividade ao Vivo (Toda a Rede)'}
              </h3>
              {selectedCityId && (
                <button
                  onClick={() => { setSelectedCityId(null); setCityDetail(null); }}
                  style={{ background: 'transparent', border: '1px solid #475569', color: '#94a3b8', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Ver Todas
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
              {((selectedCityId && cityDetail ? cityDetail.recentEvents : data?.recentEvents) || []).slice(0, 15).map((evt) => (
                <div key={evt.id} style={{ backgroundColor: '#0f172a', padding: '10px 12px', borderRadius: '8px', borderLeft: evt.eventType === 'whatsapp_click' ? '4px solid #10b981' : '4px solid #0284c7', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ color: evt.eventType === 'whatsapp_click' ? '#34d399' : '#38bdf8' }}>
                      {evt.eventType === 'whatsapp_click' ? '📲 Clique no WhatsApp' : evt.eventType === 'phone_click' ? '📞 Ligação' : '👁️ Visualização'}
                    </strong>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{formatTimeAgo(evt.timestamp)}</span>
                  </div>
                  <div style={{ color: '#cbd5e1' }}>
                    <strong>{evt.cityName}</strong> • <span style={{ color: '#94a3b8' }}>{evt.pagePath}</span>
                  </div>
                  {evt.elementId && (
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>
                      Botão: {evt.elementId} ({evt.device})
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
