/**
 * PR-STATUS-FETCHER — Modul für PR Explorer Madeira
 * ==========================================================
 * Quelle: madeirajourney.com/trails-status (liest von ifcn.madeira.gov.pt, Update alle 4h)
 * Kein API-Key erforderlich. Kein CORS-Problem (CORS-Proxy wird verwendet).
 *
 * Exportiert:
 *   fetchPrStatus()         → Promise<Map<string, PrStatusEntry>>
 *   getPrStatus(id)         → PrStatusEntry | null  (nach fetchPrStatus())
 *   PR_STATUS_LABELS        → { open, partial, closed } auf Deutsch
 *
 * PrStatusEntry: { id, name, status, statusRaw, lastUpdate, note }
 * status: 'open' | 'partial' | 'closed' | 'unknown'
 *
 * Integration in app.js:
 *   1. Dieses Modul einbinden (script-Tag vor app.js)
 *   2. Am App-Start: await fetchPrStatus()
 *   3. In renderDetail()/prCardHtml(): getPrStatus(r.id)?.status
 *
 * CORS-Hinweis:
 *   Browser kann ifcn.madeira.gov.pt nicht direkt abrufen (kein CORS-Header).
 *   Fallback-Kette: 1) corsproxy.io  2) allorigins.win  3) gespeicherter Cache (localStorage)
 * ===========================================================
 */

const PR_STATUS_LABELS = {
  open:    'Geöffnet',
  partial: 'Eingeschränkt',
  closed:  'Geschlossen',
  unknown: 'Status unbekannt'
};

// Intern: aktueller Datensatz
let _prStatusMap = new Map();
let _prStatusTimestamp = null;
const _CACHE_KEY  = 'prStatusCache';
const _CACHE_TTL  = 4 * 60 * 60 * 1000; // 4 Stunden (entspricht Update-Intervall der Quelle)

// ── Quell-URL ──────────────────────────────────────────────────────────────
const _SOURCE_URL = 'https://madeirajourney.com/trails-status/';

// CORS-Proxies in Fallback-Reihenfolge
const _PROXIES = [
  url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
];

// ── HTML-Parser ────────────────────────────────────────────────────────────
/**
 * Parst den HTML-Text der Statusseite.
 * Struktur auf madeirajourney.com/trails-status:
 *   <h3>PR1 Vereda do Areeiro</h3>
 *   <p>Open</p> (oder Partially Open / Closed)
 *   <p>...<strong>Last Update:</strong> 3 Jun 2026 15:40:05</p>
 */
function _parseStatusHtml(html) {
  const result = new Map();

  // DOMParser für sauberes Parsen (funktioniert im Browser)
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Alle h3-Elemente suchen, die PR-Namen enthalten
  const headers = Array.from(doc.querySelectorAll('h3'));

  for (const h3 of headers) {
    const text = h3.textContent.trim();

    // PR-Nummer extrahieren: "PR1 Vereda do Areeiro" → "PR 1"
    const idMatch = text.match(/^PR(\d+(?:\.\d+)?)\s/i);
    if (!idMatch) continue;

    const numericId = idMatch[1];
    const prId = `PR ${numericId}`;   // passt zu DATA[].id im PR Explorer
    const prName = text.replace(/^PR\d+(?:\.\d+)?\s*/, '').trim();

    // Nächstes Element nach h3 lesen (enthält Status-Text)
    let statusRaw = 'unknown';
    let note = '';
    let lastUpdate = '';

    let el = h3.nextElementSibling;
    let steps = 0;
    while (el && steps < 8) {
      const t = el.textContent.trim();

      // Status-Erkennung
      if (!statusRaw || statusRaw === 'unknown') {
        if (/^open$/i.test(t))            statusRaw = 'open';
        else if (/partially\s*open/i.test(t)) statusRaw = 'partial';
        else if (/^closed$/i.test(t))     statusRaw = 'closed';
      }

      // Notiz-Text (z.B. "Pico do Areeiro – Pico Ruivo* Vereda oeste – CLOSED")
      if (t.length > 10 && !t.startsWith('Last Update') && !/^\d+/.test(t) &&
          !/(open|closed|paid|free|trail|fee|today|tomorrow)/i.test(t) && note === '') {
        note = t;
      }

      // Letztes Update
      const luMatch = t.match(/Last Update[:\s]+(.+)/i);
      if (luMatch) lastUpdate = luMatch[1].trim();

      el = el.nextElementSibling;
      steps++;
    }

    result.set(prId, {
      id: prId,
      name: prName,
      status: statusRaw,
      statusRaw,
      lastUpdate,
      note
    });
  }

  return result;
}

// ── Fetch mit Proxy-Fallback ───────────────────────────────────────────────
async function _fetchWithProxy(url) {
  for (const proxyFn of _PROXIES) {
    try {
      const proxyUrl = proxyFn(url);
      const res = await fetch(proxyUrl, { cache: 'no-store' });
      if (!res.ok) continue;

      // allorigins.win gibt { contents: '...' } zurück
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        if (json.contents) return json.contents;
        continue;
      }

      return await res.text();
    } catch (_) {
      // nächsten Proxy versuchen
    }
  }
  throw new Error('Alle Proxies fehlgeschlagen');
}

// ── localStorage Cache ─────────────────────────────────────────────────────
function _loadCache() {
  try {
    const raw = localStorage.getItem(_CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > _CACHE_TTL) return null;  // abgelaufen
    return { ts, data: new Map(Object.entries(data)) };
  } catch (_) {
    return null;
  }
}

function _saveCache(map) {
  try {
    const data = Object.fromEntries(map);
    localStorage.setItem(_CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch (_) { /* kein LocalStorage = kein Problem */ }
}

// ── Öffentliche API ────────────────────────────────────────────────────────

/**
 * Lädt den aktuellen PR-Status.
 * Gibt eine Map zurück: prId → PrStatusEntry
 * Nutzt localStorage-Cache (TTL 4h) als Fallback.
 */
async function fetchPrStatus() {
  // Cache prüfen
  const cached = _loadCache();
  if (cached) {
    _prStatusMap = cached.data;
    _prStatusTimestamp = cached.ts;
    console.log(`[PR-Status] Cache geladen (${_prStatusMap.size} Einträge, Alter: ${Math.round((Date.now()-_prStatusTimestamp)/60000)} min)`);
    return _prStatusMap;
  }

  try {
    const html = await _fetchWithProxy(_SOURCE_URL);
    const parsed = _parseStatusHtml(html);

    if (parsed.size === 0) {
      throw new Error('Keine PR-Einträge im geparsten HTML gefunden');
    }

    _prStatusMap = parsed;
    _prStatusTimestamp = Date.now();
    _saveCache(_prStatusMap);

    console.log(`[PR-Status] ${_prStatusMap.size} Einträge geladen (${new Date().toLocaleTimeString('de')})`);
    return _prStatusMap;

  } catch (err) {
    console.warn('[PR-Status] Laden fehlgeschlagen:', err.message);

    // Abgelaufenen Cache als Notfallwert nutzen
    try {
      const raw = localStorage.getItem(_CACHE_KEY);
      if (raw) {
        const { data } = JSON.parse(raw);
        _prStatusMap = new Map(Object.entries(data));
        console.warn('[PR-Status] Abgelaufener Cache wird verwendet');
        return _prStatusMap;
      }
    } catch (_) {}

    return new Map(); // leere Map, App bleibt stabil
  }
}

/**
 * Gibt den Status eines einzelnen PR zurück.
 * Muss nach fetchPrStatus() aufgerufen werden.
 * @param {string} id  z.B. "PR 1", "PR 6.3"
 * @returns {PrStatusEntry | null}
 */
function getPrStatus(id) {
  return _prStatusMap.get(id) || null;
}

/**
 * Gibt den aktuellen Ladezeitpunkt zurück (Unix-Timestamp oder null).
 */
function getPrStatusAge() {
  return _prStatusTimestamp;
}

// Im Browser global bereitstellen (für PR Explorer ohne Module-Bundler)
if (typeof window !== 'undefined') {
  window.fetchPrStatus    = fetchPrStatus;
  window.getPrStatus      = getPrStatus;
  window.getPrStatusAge   = getPrStatusAge;
  window.PR_STATUS_LABELS = PR_STATUS_LABELS;
}
