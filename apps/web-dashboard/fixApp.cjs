const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Import PartnerItem
code = code.replace(/import \{ CityConfig, generateUniqueCityContent, ServiceItem, FaqItem \} from '\.\/cityGenerator';/, "import { CityConfig, generateUniqueCityContent, ServiceItem, FaqItem, PartnerItem } from './cityGenerator';");

// 2. States
const statesCode = `
  // Partner Management
  const [partnerManagementModal, setPartnerManagementModal] = useState<{ isOpen: boolean; cityId: string } | null>(null);
  const [partnerEditorModal, setPartnerEditorModal] = useState<{ isOpen: boolean; partner: PartnerItem | null; sourceCityId: string } | null>(null);
  const [partnerEditorCheckedCities, setPartnerEditorCheckedCities] = useState<string[]>([]);

  const openPartnerManagement = (cityId: string) => {
    setPartnerManagementModal({ isOpen: true, cityId });
  };
  
  const openPartnerEditor = (sourceCityId: string, partner: PartnerItem | null) => {
    if (partner) {
      const selectedIds = cities.filter(c => c.parceiros?.some(p => p.id === partner.id)).map(c => c.id);
      if (selectedIds.length === 0 && sourceCityId) selectedIds.push(sourceCityId);
      setPartnerEditorCheckedCities(selectedIds);
      setPartnerEditorModal({ isOpen: true, partner, sourceCityId });
    } else {
      setPartnerEditorCheckedCities(sourceCityId ? [sourceCityId] : []);
      setPartnerEditorModal({ isOpen: true, partner: { id: Date.now().toString(), nome: '', cidade: '', uf: '', dominio: '', url: '', descricao: '', status: 'ativo', tipo: 'Parceiro de atendimento' }, sourceCityId });
    }
  };
`;
code = code.replace(/  const \[notification, setNotification\] = useState<string \| null>\(null\);/, statesCode + '\n  const [notification, setNotification] = useState<string | null>(null);');

// 3. handleSavePartner
const savePartnerCode = `
  const handleSavePartner = async (partner: PartnerItem, selectedCityIds: string[]) => {
    try {
      const updatedCities = cities.map(c => {
        let parceiros = c.parceiros ? [...c.parceiros] : [];
        const isSelected = selectedCityIds.includes(c.id);
        const existingIndex = parceiros.findIndex(p => p.id === partner.id);
        
        if (isSelected) {
          if (existingIndex >= 0) parceiros[existingIndex] = partner;
          else parceiros.push(partner);
        } else {
          if (existingIndex >= 0) parceiros.splice(existingIndex, 1);
        }
        return { ...c, parceiros };
      });
      
      setNotification('💾 Salvando rede de parceiros...');
      for (const c of updatedCities) {
        await fetch('/api/cities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c) });
      }
      
      setCities(updatedCities);
      setPartnerEditorModal(null);
      showNotify('✅ Parceiro salvo e distribuído com sucesso!');
    } catch(e) {
      console.error(e);
      showNotify('❌ Erro ao salvar parceiro');
    }
  };
`;
code = code.replace(/  const handleSaveEditingCity = async \(\) => \{/, savePartnerCode + '\n  const handleSaveEditingCity = async () => {');

// 4. Stats bar
const statsCode = `
          {/* Top Dashboard Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700 }}>TOTAL DE CIDADES</span>
              <span style={{ color: '#f8fafc', fontSize: '2rem', fontWeight: 900 }}>{cities.length}</span>
            </div>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700 }}>SITES ATIVOS</span>
              <span style={{ color: '#34d399', fontSize: '2rem', fontWeight: 900 }}>{cities.filter(c => c.status === 'ativo').length}</span>
            </div>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700 }}>EM CONSTRUÇÃO</span>
              <span style={{ color: '#fbbf24', fontSize: '2rem', fontWeight: 900 }}>{cities.filter(c => c.status === 'em_construcao').length}</span>
            </div>
            <div style={{ backgroundColor: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.3)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 800 }}>PARCEIROS CADASTRADOS</span>
              <span style={{ color: '#fff', fontSize: '2rem', fontWeight: 900 }}>
                {Array.from(new Set(cities.flatMap(c => c.parceiros || []).map(p => p.id))).length}
              </span>
              <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 700 }}>Distribuídos pela rede</span>
            </div>
          </div>
`;
code = code.replace(/\{\/\* Filter Bar \*\/\}/, statsCode + '\n          {/* Filter Bar */}');

// 5. Columns
code = code.replace(/<th style=\{\{ padding: '16px 20px' \}\}>WHATSAPP<\/th>/, "<th style={{ padding: '16px 20px' }}>WHATSAPP</th>\n                  <th style={{ padding: '16px 20px', textAlign: 'center' }}>PARCEIROS</th>");

const parceirosTd = `
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <button 
                        onClick={() => openPartnerManagement(c.id)}
                        style={{
                          backgroundColor: c.parceiros && c.parceiros.length > 0 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                          color: c.parceiros && c.parceiros.length > 0 ? '#38bdf8' : '#94a3b8',
                          border: \`1px solid \${c.parceiros && c.parceiros.length > 0 ? 'rgba(56, 189, 248, 0.3)' : 'rgba(148, 163, 184, 0.2)'}\`,
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        🤝 Parceiros: {c.parceiros?.length || 0}
                      </button>
                    </td>`;
code = code.replace(/<\/td>\s*<td style=\{\{ padding: '16px 20px' \}\}>\s*<span style=\{\{ backgroundColor: c\.auditScore/, '</td>' + parceirosTd + "\n                    <td style={{ padding: '16px 20px' }}>\n                      <span style={{ backgroundColor: c.auditScore");


// 6. Modals
const modalsCode = `
      {/* MODAL: PARTNER MANAGEMENT */}
      {partnerManagementModal && (() => {
        const city = cities.find(c => c.id === partnerManagementModal.cityId);
        if (!city) return null;
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '800px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: '#f8fafc', margin: 0, marginBottom: '6px' }}>Gerenciar parceiros</h3>
                  <p style={{ color: '#94a3b8', margin: 0 }}>{city.cidade} - {city.uf}</p>
                </div>
                <button 
                  onClick={() => setPartnerManagementModal(null)} 
                  style={{ backgroundColor: 'transparent', border: 'none', color: '#64748b', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <button 
                  onClick={() => openPartnerEditor(city.id, null)}
                  style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  + Adicionar parceiro
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {(!city.parceiros || city.parceiros.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🤝</div>
                    <p>Nenhum parceiro cadastrado para esta cidade.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {city.parceiros.map(p => (
                      <div key={p.id} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ color: '#f8fafc', fontSize: '1.1rem', margin: '0 0 6px 0' }}>{p.nome}</h4>
                          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 6px 0' }}>{p.cidade} - {p.uf}</p>
                          <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontSize: '0.85rem', textDecoration: 'none' }}>{p.dominio}</a>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ backgroundColor: p.status === 'ativo' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: p.status === 'ativo' ? '#34d399' : '#f87171', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                            {p.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </span>
                          <button 
                            onClick={() => openPartnerEditor(city.id, p)}
                            style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm('Tem certeza que deseja excluir este parceiro de todas as cidades?')) {
                                handleSavePartner(p, []);
                              }
                            }}
                            style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '6px 14px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: PARTNER EDITOR */}
      {partnerEditorModal && partnerEditorModal.partner && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.4rem', color: '#f8fafc', margin: '0 0 24px 0' }}>{partnerEditorModal.partner.id.length > 13 ? 'Editar Parceiro' : 'Novo Parceiro'}</h3>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '12px', display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ color: '#38bdf8', margin: '0 0 8px 0' }}>Informações Principais</h4>
                
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>Nome da empresa</label>
                  <input type="text" value={partnerEditorModal.partner.nome} onChange={e => setPartnerEditorModal({...partnerEditorModal, partner: {...partnerEditorModal.partner, nome: e.target.value}})} style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff' }} placeholder="Ex: Desentupidora Poços de Caldas" />
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>Cidade</label>
                    <input type="text" value={partnerEditorModal.partner.cidade} onChange={e => setPartnerEditorModal({...partnerEditorModal, partner: {...partnerEditorModal.partner, cidade: e.target.value}})} style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff' }} placeholder="Ex: Poços de Caldas" />
                  </div>
                  <div style={{ width: '100px' }}>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>Estado</label>
                    <input type="text" value={partnerEditorModal.partner.uf} onChange={e => setPartnerEditorModal({...partnerEditorModal, partner: {...partnerEditorModal.partner, uf: e.target.value}})} style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff' }} placeholder="Ex: MG" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>Domínio</label>
                    <input type="text" value={partnerEditorModal.partner.dominio} onChange={e => setPartnerEditorModal({...partnerEditorModal, partner: {...partnerEditorModal.partner, dominio: e.target.value}})} style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff' }} placeholder="Ex: desentupidorapocos.com.br" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>URL do Site</label>
                    <input type="text" value={partnerEditorModal.partner.url} onChange={e => setPartnerEditorModal({...partnerEditorModal, partner: {...partnerEditorModal.partner, url: e.target.value}})} style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff' }} placeholder="Ex: https://desentupidorapocos.com.br" />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>Descrição curta</label>
                  <textarea rows={3} value={partnerEditorModal.partner.descricao} onChange={e => setPartnerEditorModal({...partnerEditorModal, partner: {...partnerEditorModal.partner, descricao: e.target.value}})} style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff' }} placeholder="Ex: Empresa especializada em desentupimento..." />
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>Status</label>
                    <select value={partnerEditorModal.partner.status} onChange={e => setPartnerEditorModal({...partnerEditorModal, partner: {...partnerEditorModal.partner, status: e.target.value as 'ativo' | 'inativo'}})} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff' }}>
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>Tipo de parceria</label>
                    <select value={partnerEditorModal.partner.tipo} onChange={e => setPartnerEditorModal({...partnerEditorModal, partner: {...partnerEditorModal.partner, tipo: e.target.value as any}})} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff' }}>
                      <option value="Parceiro de atendimento">Parceiro de atendimento</option>
                      <option value="Empresa parceira">Empresa parceira</option>
                      <option value="Rede de atendimento">Rede de atendimento</option>
                      <option value="Indicação regional">Indicação regional</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ width: '300px', borderLeft: '1px solid #1e293b', paddingLeft: '24px' }}>
                <h4 style={{ color: '#38bdf8', margin: '0 0 12px 0' }}>Exibir este parceiro em:</h4>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 16px 0' }}>Selecione em quais sites esta empresa deve aparecer como recomendação.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                  {cities.map(c => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.9rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={partnerEditorCheckedCities.includes(c.id)} 
                        onChange={(e) => {
                          if (e.target.checked) setPartnerEditorCheckedCities([...partnerEditorCheckedCities, c.id]);
                          else setPartnerEditorCheckedCities(partnerEditorCheckedCities.filter(id => id !== c.id));
                        }}
                      />
                      {c.cidade} ({c.uf})
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #1e293b' }}>
              <button onClick={() => setPartnerEditorModal(null)} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={() => handleSavePartner(partnerEditorModal.partner, partnerEditorCheckedCities)} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
                Salvar Parceiro na Rede
              </button>
            </div>
          </div>
        </div>
      )}
`;
code = code.replace(/    <\/div>\s*\);\s*\}/, modalsCode + "\n    </div>\n  );\n}");

fs.writeFileSync('src/App.tsx', code);



