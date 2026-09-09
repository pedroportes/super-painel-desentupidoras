import urllib.request
import json
import sys
from collections import Counter

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SUPABASE_URL = 'https://dltqxfyrltgbudtzxzot.supabase.co/rest/v1/analytics_events?select=*&order=created_at.desc'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdHF4ZnlybHRnYnVkdHp4em90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NTMzNzIsImV4cCI6MjA4MjQyOTM3Mn0.25dykN-BHp6B_iB0l-EDtKiGrOGSc9inmo_403yhsUQ'

req = urllib.request.Request(SUPABASE_URL, headers={
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY
})

try:
    with urllib.request.urlopen(req) as resp:
        events = json.loads(resp.read().decode('utf-8'))
        
    print(f"TOTAL DE EVENTOS COLETADOS NA NUVEM (SUPABASE): {len(events)}\n")
    
    types = Counter([e.get('event_type') for e in events])
    print("Distribuicao por Tipo de Evento:")
    for t, count in types.items():
        print(f"   * {t}: {count}")
        
    clicks = [e for e in events if e.get('event_type') in ['whatsapp_click', 'phone_click', 'partner_click']]
    print(f"\nCLIQUES EM CONVERSAO (WhatsApp / Telefone / Parceiro): {len(clicks)}")
    if clicks:
        for c in clicks:
            dt = c.get('created_at', '')
            print(f"   -> [{dt}] {c.get('event_type')} | Cidade: {c.get('city_name')} ({c.get('uf')}) | Dispositivo: {c.get('device')} | Referrer: {c.get('referrer')} | Link: {c.get('target_href')}")
    else:
        print("   (Nenhum clique de conversao em botao WhatsApp/Telefone registrado ainda)")
        
    print("\nTop Cidades com Visualizacoes de Pagina (Pageviews):")
    cities_pv = Counter([f"{e.get('city_name')} ({e.get('uf')})" for e in events if e.get('city_name')])
    for city, count in cities_pv.most_common(20):
        print(f"   * {city}: {count} pageviews")
        
    print("\nDispositivos:")
    devices = Counter([e.get('device') for e in events])
    for d, count in devices.items():
        print(f"   * {d}: {count}")
        
    print("\nOrigens / Referrers:")
    refs = Counter([e.get('referrer') for e in events])
    for r, count in refs.items():
        print(f"   * {r}: {count}")
        
    print("\nUltimos 15 eventos no geral:")
    for e in events[:15]:
        print(f"   * [{e.get('created_at')}] {e.get('event_type')} -> {e.get('city_name')} ({e.get('uf')}) | path: {e.get('page_path')} | device: {e.get('device')} | ref: {e.get('referrer')}")
        
except Exception as e:
    print("Erro ao analisar Supabase:", e)
