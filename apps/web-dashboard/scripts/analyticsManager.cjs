const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'analytics_events.jsonl');

const SUPABASE_URL = 'https://dltqxfyrltgbudtzxzot.supabase.co/rest/v1/analytics_events';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdHF4ZnlybHRnYnVkdHp4em90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NTMzNzIsImV4cCI6MjA4MjQyOTM3Mn0.25dykN-BHp6B_iB0l-EDtKiGrOGSc9inmo_403yhsUQ';

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache of events
let eventsCache = [];
let isLoaded = false;

function loadEventsFromDisk() {
  if (!fs.existsSync(EVENTS_FILE)) {
    eventsCache = [];
    isLoaded = true;
    return;
  }
  try {
    const raw = fs.readFileSync(EVENTS_FILE, 'utf-8');
    const lines = raw.split('\n').filter(Boolean);
    eventsCache = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
    isLoaded = true;
  } catch (err) {
    console.error('Erro ao ler analytics_events.jsonl:', err);
    eventsCache = [];
  }
}

function resetAnalyticsCache() {
  eventsCache = [];
  isLoaded = true;
  if (fs.existsSync(EVENTS_FILE)) {
    fs.writeFileSync(EVENTS_FILE, '', 'utf-8');
  }
}

async function syncWithSupabase() {
  loadEventsFromDisk();

  try {
    const res = await fetch(`${SUPABASE_URL}?order=created_at.desc&limit=1000`, {
      headers: { apikey: SUPABASE_KEY }
    });
    if (!res.ok) return;
    const remote = await res.json();
    if (!Array.isArray(remote)) return;

    // Se o Supabase estiver vazio e o disco vazio, zerar cache
    if (remote.length === 0 && eventsCache.length === 0) {
      eventsCache = [];
      return;
    }

    const existingIds = new Set(eventsCache.map(e => e.id));
    let newEvents = 0;

    remote.forEach(r => {
      if (!existingIds.has(r.id)) {
        eventsCache.push({
          id: r.id,
          timestamp: r.created_at,
          sessionId: r.session_id || 'anonymous',
          cityId: r.city_id || 'unknown',
          cityName: r.city_name || r.city_id || '',
          uf: r.uf || '',
          eventType: r.event_type || 'pageview',
          pagePath: r.page_path || '/',
          pageTitle: r.page_title || '',
          elementId: r.element_id || '',
          referrer: r.referrer || '',
          device: r.device || 'desktop'
        });
        newEvents++;
      }
    });

    if (newEvents > 0) {
      // Sort chronologically
      eventsCache.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
  } catch (e) {
    // fallback to local cache
  }
}

function recordEvent(eventData) {
  if (!isLoaded) loadEventsFromDisk();

  const event = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: eventData.timestamp || new Date().toISOString(),
    sessionId: eventData.sessionId || 'anonymous',
    cityId: eventData.cityId || 'unknown',
    cityName: eventData.cityName || '',
    uf: eventData.uf || '',
    eventType: eventData.eventType || 'pageview', // pageview, whatsapp_click, phone_click, partner_click
    pagePath: eventData.pagePath || '/',
    pageTitle: eventData.pageTitle || '',
    elementId: eventData.elementId || '',
    referrer: eventData.referrer || '',
    userAgent: eventData.userAgent || '',
    device: eventData.device || (/mobile|android|iphone/i.test(eventData.userAgent || '') ? 'mobile' : 'desktop')
  };

  eventsCache.push(event);

  // Append to disk asynchronously
  const line = JSON.stringify(event) + '\n';
  fs.appendFile(EVENTS_FILE, line, (err) => {
    if (err) console.error('Erro ao salvar evento de analytics:', err);
  });

  return event;
}

async function getAnalyticsSummary(filterDays = 30) {
  await syncWithSupabase();

  const now = new Date();
  const cutoff = new Date(now.getTime() - filterDays * 24 * 60 * 60 * 1000);
  const todayStr = now.toISOString().split('T')[0];

  const filtered = eventsCache.filter(e => new Date(e.timestamp) >= cutoff);

  let totalPageviews = 0;
  let todayPageviews = 0;
  let totalWhatsappClicks = 0;
  let todayWhatsappClicks = 0;
  let totalPhoneClicks = 0;
  let totalPartnerClicks = 0;

  const cityStats = {};
  const topPages = {};
  const clickLocations = {};
  const timeline = {};

  filtered.forEach(e => {
    const isToday = e.timestamp.startsWith(todayStr);
    const dateKey = e.timestamp.split('T')[0];

    // Timeline
    if (!timeline[dateKey]) timeline[dateKey] = { date: dateKey, pageviews: 0, whatsapp: 0, phone: 0 };

    // City stats bucket
    const key = e.cityId || 'unknown';
    if (!cityStats[key]) {
      cityStats[key] = {
        cityId: key,
        cityName: e.cityName || key,
        uf: e.uf || '',
        pageviews: 0,
        todayPageviews: 0,
        whatsappClicks: 0,
        todayWhatsappClicks: 0,
        phoneClicks: 0,
        partnerClicks: 0,
        lastActivity: e.timestamp,
        sessions: new Set()
      };
    }

    const c = cityStats[key];
    if (new Date(e.timestamp) > new Date(c.lastActivity)) {
      c.lastActivity = e.timestamp;
    }
    c.sessions.add(e.sessionId);

    if (e.eventType === 'pageview') {
      totalPageviews++;
      c.pageviews++;
      timeline[dateKey].pageviews++;
      if (isToday) {
        todayPageviews++;
        c.todayPageviews++;
      }
      topPages[e.pagePath] = (topPages[e.pagePath] || 0) + 1;
    } else if (e.eventType === 'whatsapp_click') {
      totalWhatsappClicks++;
      c.whatsappClicks++;
      timeline[dateKey].whatsapp++;
      if (isToday) {
        todayWhatsappClicks++;
        c.todayWhatsappClicks++;
      }
      const loc = e.elementId || 'geral';
      clickLocations[loc] = (clickLocations[loc] || 0) + 1;
    } else if (e.eventType === 'phone_click') {
      totalPhoneClicks++;
      c.phoneClicks++;
      timeline[dateKey].phone++;
    } else if (e.eventType === 'partner_click') {
      totalPartnerClicks++;
      c.partnerClicks++;
    }
  });

  // Calculate conversion rates
  const citiesArray = Object.values(cityStats).map(c => {
    const convRate = c.pageviews > 0 ? ((c.whatsappClicks / c.pageviews) * 100).toFixed(1) : '0.0';
    return {
      ...c,
      uniqueSessions: c.sessions.size,
      conversionRate: Number(convRate),
      sessions: undefined
    };
  }).sort((a, b) => b.whatsappClicks - a.whatsappClicks || b.pageviews - a.pageviews);

  const globalConversionRate = totalPageviews > 0 
    ? ((totalWhatsappClicks / totalPageviews) * 100).toFixed(1) 
    : '0.0';

  const recentEvents = filtered.slice(-30).reverse();

  return {
    overview: {
      totalPageviews,
      todayPageviews,
      totalWhatsappClicks,
      todayWhatsappClicks,
      totalPhoneClicks,
      totalPartnerClicks,
      globalConversionRate: Number(globalConversionRate),
      activeCitiesCount: citiesArray.length
    },
    cities: citiesArray,
    topPages: Object.entries(topPages).map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 10),
    clickLocations,
    timeline: Object.values(timeline).sort((a, b) => a.date.localeCompare(b.date)),
    recentEvents
  };
}

async function getCityAnalytics(cityId, filterDays = 30) {
  await syncWithSupabase();

  const cutoff = new Date(Date.now() - filterDays * 24 * 60 * 60 * 1000);
  const cityEvents = eventsCache.filter(e => e.cityId === cityId && new Date(e.timestamp) >= cutoff);

  let pageviews = 0;
  let whatsappClicks = 0;
  let phoneClicks = 0;
  let partnerClicks = 0;
  const topPages = {};
  const clickLocations = {};
  const sessions = new Set();

  cityEvents.forEach(e => {
    sessions.add(e.sessionId);
    if (e.eventType === 'pageview') {
      pageviews++;
      topPages[e.pagePath] = (topPages[e.pagePath] || 0) + 1;
    } else if (e.eventType === 'whatsapp_click') {
      whatsappClicks++;
      const loc = e.elementId || 'geral';
      clickLocations[loc] = (clickLocations[loc] || 0) + 1;
    } else if (e.eventType === 'phone_click') {
      phoneClicks++;
    } else if (e.eventType === 'partner_click') {
      partnerClicks++;
    }
  });

  return {
    cityId,
    pageviews,
    uniqueSessions: sessions.size,
    whatsappClicks,
    phoneClicks,
    partnerClicks,
    conversionRate: pageviews > 0 ? Number(((whatsappClicks / pageviews) * 100).toFixed(1)) : 0,
    topPages: Object.entries(topPages).map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count),
    clickLocations,
    recentEvents: cityEvents.slice(-50).reverse()
  };
}

module.exports = {
  recordEvent,
  getAnalyticsSummary,
  getCityAnalytics,
  resetAnalyticsCache
};
