/* ============================================================
   PR Explorer · V3.0.6 Additive Patch
   Ziel: Audit V3, Roadmap/Tagesplanung, Ideenliste, GPX-Import,
         Bottom-Sheet/Viewport-Fixes, Detail-Erweiterungen,
         SIMplifica/Schmale-Pfade-Links, Exportpakete.
   Einbau: nach Leaflet + vor/um app-claude-v21.js laden; siehe README.
   ============================================================ */
(function(){
'use strict';

const PRX_VERSION = 'V3.0.6';
const KEY_STATE = 'prx301_state';
const KEY_AUDIT = 'prx301_audit';
const KEY_SETTINGS = 'prx301_settings';

const SIMPLIFICA_URL = 'https://simplifica.madeira.gov.pt/services/78-82-259/start';
const IFCN_STATUS_URL = 'https://ifcn.madeira.gov.pt/en/atividades-de-natureza/percursos-pedestres-recomendados/percursos-pedestres-recomendados.html';
const SCHMALE_PFADE_ALL = 'https://www.schmale-pfade.de/alle-offiziellen-wanderungen-auf-madeira-mit-gps/';
const SCHMALE_PFADE_KNOWN = {
  'PR 1': 'https://www.schmale-pfade.de/pico-do-arieiro-zum-pico-ruivo-pr-1/',
  'PR1': 'https://www.schmale-pfade.de/pico-do-arieiro-zum-pico-ruivo-pr-1/',
  'PR 9': 'https://www.schmale-pfade.de/caldeirao-verde-und-inferno-der-gruene-kessel/',
  'PR9': 'https://www.schmale-pfade.de/caldeirao-verde-und-inferno-der-gruene-kessel/'
};

function $(s,root=document){ return root.querySelector(s); }
function $$(s,root=document){ return Array.from(root.querySelectorAll(s)); }
function esc(s){ return String(s ?? '').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function todayKey(){ return new Date().toISOString().slice(0,10); }
function uid(prefix='id'){ return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,7); }
function n(v,d=0){ const x=Number(v); return Number.isFinite(x)?x:d; }
function minTxt(min){ min=Math.round(n(min,0)); const h=Math.floor(min/60), m=min%60; return h?`${h} h ${String(m).padStart(2,'0')} min`:`${m} min`; }
function kmTxt(k){ return `${n(k,0).toFixed(1).replace('.',',')} km`; }
function normId(id){ return String(id||'').trim().replace(/_/g,'.').replace(/\s+/g,' ').toUpperCase(); }
function prNum(pr){ return normId(pr?.id || pr?.num || pr?.nummer || pr?.nummer_display || '').replace(/^PR(\d)/,'PR $1'); }
function prName(pr){ return pr?.name || pr?.title || pr?.bezeichnung || prNum(pr); }
function prLat(pr){ return n(pr?.lat ?? pr?.start_lat ?? pr?.start?.[0], NaN); }
function prLon(pr){ return n(pr?.lon ?? pr?.start_lon ?? pr?.start?.[1], NaN); }
function prDriveKm(pr){ return n(pr?.drive_km ?? pr?.driveKm, 0); }
function prDriveMin(pr){ return n(pr?.drive_min ?? pr?.driveMin, 0); }
function prDurMin(pr){ return n(pr?.dur_min ?? pr?.duration_min ?? pr?.durationMin ?? pr?.hikeMin, 0); }
function data(){ return Array.isArray(window.PR_DATA) ? window.PR_DATA : (Array.isArray(window.DATA)?window.DATA:[]); }

function readJSON(key, fallback){
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch(e){ return fallback; }
}
function writeJSON(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

function defaultState(){
  return {
    version: PRX_VERSION,
    settings: {
      zoomSliderEnabled: false,
      bottomSheetOpacity: 0.88,
      fuelConsumptionL100: 6.5,
      mountainCorrectionPercent: 30,
      fuelPrice: 1.85,
      homeName: 'Pestana Promenade',
      homeLat: 32.63761,
      homeLon: -16.93679
    },
    pr: {},
    ideas: [],
    customRoutes: [],
    dayPlans: [],
    sortEditMode: false
  };
}
function state(){
  const s = Object.assign(defaultState(), readJSON(KEY_STATE, {}));
  s.settings = Object.assign(defaultState().settings, s.settings || {}, readJSON(KEY_SETTINGS, {}));
  s.pr ||= {}; s.ideas ||= []; s.customRoutes ||= []; s.dayPlans ||= [];
  return s;
}
function saveState(s){
  s.version = PRX_VERSION;
  writeJSON(KEY_STATE, s);
  writeJSON(KEY_SETTINGS, s.settings || {});
  applySettings();
}
function toast(t){
  try { window.toast?.(t); return; } catch(e){}
  let el = $('#prx301-toast');
  if(!el){ el=document.createElement('div'); el.id='prx301-toast'; document.body.appendChild(el); }
  el.textContent=t; el.classList.add('show'); clearTimeout(el._t);
  el._t=setTimeout(()=>el.classList.remove('show'),2300);
}

function initLeafletHook(){
  if(window.L && L.Map && !L.Map.__prx301Hook){
    L.Map.__prx301Hook = true;
    L.Map.addInitHook(function(){
      window.PRX301_MAP = this;
      setTimeout(configureMap, 80);
    });
  }
}
function getMap(){ return window.PRX301_MAP || window.map || null; }
function configureMap(){
  const map = getMap();
  if(!map || map.__prx301Configured) return;
  map.__prx301Configured = true;
  try { map.doubleClickZoom?.enable(); map.touchZoom?.enable(); map.tap?.enable?.(); } catch(e){}
  try {
    map.on('dblclick', function(e){ map.setZoomAround(e.latlng, map.getZoom()+1); });
  } catch(e){}
  applyZoomSlider();
}

function applyZoomSlider(){
  const s = state();
  let c = $('#prx301-zoom-slider');
  if(!s.settings.zoomSliderEnabled){ c?.remove(); return; }
  if(!c){
    c = document.createElement('div');
    c.id = 'prx301-zoom-slider';
    c.innerHTML = `<button type="button" data-z="+">+</button><input type="range" min="8" max="18" step="1"><button type="button" data-z="-">−</button>`;
    document.body.appendChild(c);
    c.addEventListener('click', e=>{
      const b=e.target.closest('button'); if(!b) return;
      const m=getMap(); if(!m) return;
      if(b.dataset.z==='+') m.zoomIn(); else m.zoomOut();
      const inp=$('input',c); if(inp) inp.value=m.getZoom();
    });
    $('input',c).addEventListener('input', e=>{ const m=getMap(); if(m) m.setZoom(Number(e.target.value)); });
  }
  const m=getMap(), inp=$('input',c); if(m && inp) inp.value=m.getZoom();
}

function applySettings(){
  const s = state();
  document.documentElement.style.setProperty('--prx-sheet-opacity', String(s.settings.bottomSheetOpacity ?? .88));
  document.documentElement.style.setProperty('--sheet-opacity', String(s.settings.bottomSheetOpacity ?? .88));
  document.documentElement.classList.add('prx301-enabled');
  document.title = document.title.replace(/V\d+(\.\d+)*/,'') + ' · ' + PRX_VERSION;
  applyZoomSlider();
}
function injectCSSFixes(){
  const css = `
  html,body,#app{height:100dvh!important;min-height:100dvh!important;}
  .panel,.sheet,.settings-panel{background:rgba(10,24,22,var(--prx-sheet-opacity,.88))!important;}
  .panel,.sheet{bottom:0!important;}
  .panel{padding-bottom:calc(env(safe-area-inset-bottom) + 86px)!important;}
  .panel-detail{padding-bottom:calc(env(safe-area-inset-bottom) + 22px)!important;}
  .sheet{padding-bottom:calc(env(safe-area-inset-bottom) + 6px)!important;}
  .detail-close,.sheet-x{z-index:3;}
  `;
  const el=document.createElement('style'); el.id='prx301-runtime-css'; el.textContent=css; document.head.appendChild(el);
}

const AUDIT_SECTIONS = [
  ['A','App-Start & Grundlayout',['App startet ohne Fehlermeldung','Topo-Karte wird geladen','PR-Pins werden angezeigt','Home-/Hotel-PIN wird angezeigt','Unterer Displayrand wird vollständig genutzt','Safe-Area oben/unten korrekt','Stabil nach App-Wechsel']],
  ['B','Karte & Gestensteuerung',['Ein-Finger-Verschieben funktioniert','Pinch-Zoom funktioniert','Doppeltippen zoomt hinein','Apple-ähnliches Kartenverhalten','Route einpassen ohne Abschneiden','Zoomslider aktivierbar','Zoomslider bedienbar','Zoomslider deaktivierbar','Vollbildmodus funktioniert']],
  ['C','Bottom-Sheets & Overlays',['Sheets öffnen zuverlässig','Sheets schließen zuverlässig','Schließen-Button kollidiert nicht mit Kopierbutton','Audit-Sheet ohne doppelten Kopierbutton oben rechts','Teilen/Kopieren bleibt verfügbar','Transparenz-Slider vorhanden','Transparenz wirkt sichtbar','Transparenz bleibt gespeichert','Text bleibt lesbar']],
  ['D','Einstellungen',['Einstellungen öffnen/schließen','Zoomslider-Schalter vorhanden','Bottom-Sheet-Transparenz-Slider vorhanden','Home-/Hotel-PIN speicherbar','Verbrauch l/100 km speicherbar','Madeira-Bergkorrektur speicherbar','Kraftstoffpreis speicherbar','Einstellungen bleiben nach Neustart']],
  ['E','PR-Pins & Detailseite',['Pin öffnet passende Detailseite','Detailseite zeigt korrekten PR-Namen','GPX-Overlay passt','Nahegelegene PRs werden angezeigt','Nahegelegene PRs plausibel','IFCN/VisitMadeira-Link vorhanden','SIMplifica-Link vorhanden','SIMplifica bevorzugt Chrome','Schmale-Pfade-Link vorhanden','Schmale-Pfade-Link korrekt zugeordnet']],
  ['F','Kalender & Termine',['Kalenderfeld öffnet','Kein automatisches Jetzt-Datum beim Antippen','Picker bleibt bis Auswahl/Abbruch offen','Datum änderbar','Uhrzeit änderbar','Termin löschbar','Gebucht ohne Termin deaktiviert','Gebucht nach Termin aktiv','Termin löschen setzt Buchung zurück','IFCN-fixe Einträge erkennbar','Nicht-fixe Einträge verschiebbar']],
  ['G','PR-Status',['Status-Schalter vorhanden','Status manuell änderbar','Erster Status-Klick pro Tag öffnet/offert offizielle Quelle','Quelle nicht bei jedem Klick erneut','Datum letzter Statusprüfung gespeichert','Offizielle Quelle öffnet korrekt','Status lokal gespeichert']],
  ['H','Reiseliste & Tagesplanung',['Reiseliste öffnet','Geplante PRs erscheinen','Externe Unternehmungen erscheinen','Nicht-fixe Einträge im Bearbeiten-Modus verschiebbar','Bearbeiten-Schalter vorhanden','iOS-Anfasser rechts sichtbar','Reihenfolge bleibt gespeichert','IFCN-fixe Einträge gesperrt/gewarned','Tages-Zeitfenster angezeigt','Anfahrt berücksichtigt','Parken/Vorbereitung berücksichtigt','GPX-Hinweg berücksichtigt','Rückweg/Shuttle berücksichtigt','Rückfahrt berücksichtigt','Tageskilometer angezeigt','Reisekilometer kumuliert','Kraftstoffbedarf berechnet','Fahrkosten berechnet']],
  ['I','Journal-Liste',['Journal öffnet','PIN steht oben auf Höhe der Bezeichnung','Status unterhalb des Textes','Keine Textüberlagerung','Eintrag öffnet Detailseite','Filter/Sortierung funktionieren']],
  ['J','Externe Unternehmungen & Ideenliste',['Neue externe Unternehmung anlegbar','Landet zuerst in Ideenliste','Nachträglich editierbar','Titel editierbar','Ort/Region editierbar','Koordinaten editierbar','ca. Dauer eintragbar','Kategorie wählbar','Einem Reisetag zuordenbar','Innerhalb Tagesplanung verschiebbar','Zurück in Ideenliste verschiebbar','Löschbar']],
  ['K','GPX-Import & freie Routen',['GPX aus Dateien-App importierbar','Komoot-GPX wird geladen','Strava-GPX wird geladen','freie GPX-Route erscheint/ist erfasst','Distanz berechnet','Höhenmeter berechnet','Route Tagesplanung zuordenbar','Route editierbar','Route löschbar']],
  ['L','Export & Teilen',['Audit kopierbar','Audit über Teilen exportierbar','Reiseplanung exportierbar','Ideenliste exportierbar','ZIP-Paket funktioniert','ZIP enthält JSON-Daten','ZIP enthält GPX-Dateien soweit gespeichert','ZIP enthält Prompt','Import-Rückgabe vorgesehen']],
  ['M','Speicherung & Datenpersistenz',['Einstellungen bleiben erhalten','PR-Status bleibt erhalten','Termine bleiben erhalten','Buchungsstatus bleibt erhalten','Reiseliste bleibt erhalten','Sortierung bleibt erhalten','Externe Unternehmungen bleiben erhalten','importierte GPX-Routen bleiben erhalten','Offline/Online-Wechsel robust']]
];

function auditDefaults(){
  const out={ meta:{version:PRX_VERSION, createdAt:new Date().toISOString(), device:navigator.userAgent}, items:{}, notes:'' };
  AUDIT_SECTIONS.forEach(([prefix,cat,arr])=>arr.forEach((title,i)=>{ const id=prefix+String(i+1).padStart(2,'0'); out.items[id]={cat,title,status:'',note:''}; }));
  return out;
}
function audit(){ return Object.assign(auditDefaults(), readJSON(KEY_AUDIT, {})); }
function saveAudit(a){ writeJSON(KEY_AUDIT,a); }

function openAudit(){
  closeOverlay();
  const a=audit();
  const wrap=document.createElement('div');
  wrap.id='prx301-overlay';
  wrap.innerHTML = `<section class="prx301-sheet prx301-audit"><div class="prx301-head"><div><b>Audit-Rapport ${PRX_VERSION}</b><small>${new Date().toLocaleString('de-DE')}</small></div><button type="button" class="prx301-x">×</button></div><div class="prx301-body" id="prx301AuditBody"></div><div class="prx301-actions"><button data-act="copy">Bericht kopieren</button><button data-act="share">Teilen</button><button data-act="reset">Zurücksetzen</button></div></section>`;
  document.body.appendChild(wrap);
  $('.prx301-x',wrap).onclick=closeOverlay;
  $('.prx301-actions',wrap).onclick=e=>{
    const b=e.target.closest('button'); if(!b)return;
    if(b.dataset.act==='copy') copyText(auditText());
    if(b.dataset.act==='share') shareText('PRX-Audit-V3.0.1.txt', auditText());
    if(b.dataset.act==='reset' && confirm('Audit zurücksetzen?')){ saveAudit(auditDefaults()); openAudit(); }
  };
  renderAuditBody();
}
function renderAuditBody(){
  const a=audit(), body=$('#prx301AuditBody'); if(!body)return;
  let html='';
  AUDIT_SECTIONS.forEach(([prefix,cat,arr])=>{
    html += `<h3>${esc(prefix)}. ${esc(cat)}</h3>`;
    arr.forEach((title,i)=>{
      const id=prefix+String(i+1).padStart(2,'0'), it=a.items[id]||{status:'',note:''};
      html += `<div class="prx301-audit-item" data-id="${id}"><label><b>${id}</b> ${esc(title)}</label><div class="prx301-status-row">${['✓','✗','!','—'].map(v=>`<button type="button" class="${it.status===v?'on':''}" data-status="${v}">${v}</button>`).join('')}</div><textarea placeholder="Anmerkung">${esc(it.note||'')}</textarea></div>`;
    });
  });
  html += `<h3>Sonstige Anmerkungen / Funktionswünsche</h3><textarea id="prx301AuditNotes" class="prx301-big-note" placeholder="Was fehlt, was ist unlogisch, welche Funktion ist überflüssig?">${esc(a.notes||'')}</textarea>`;
  body.innerHTML=html;
  body.oninput = e=>{
    const box=e.target.closest('.prx301-audit-item'); const x=audit();
    if(e.target.id==='prx301AuditNotes'){ x.notes=e.target.value; saveAudit(x); return; }
    if(box && e.target.tagName==='TEXTAREA'){ x.items[box.dataset.id].note=e.target.value; saveAudit(x); }
  };
  body.onclick = e=>{
    const btn=e.target.closest('[data-status]'); if(!btn)return;
    const box=btn.closest('.prx301-audit-item'); const x=audit();
    x.items[box.dataset.id].status=btn.dataset.status; saveAudit(x); renderAuditBody();
  };
}
function auditText(){
  const a=audit();
  let all=Object.entries(a.items), done=all.filter(([_,v])=>v.status).length;
  const count=s=>all.filter(([_,v])=>v.status===s).length;
  let txt=`PR Explorer · Audit-Rapport ${PRX_VERSION}\n${new Date().toLocaleString('de-DE')}\n${'─'.repeat(44)}\nGesamt: ${done}/${all.length} · ✓ ${count('✓')} · ✗ ${count('✗')} · ! ${count('!')} · — ${count('—')}\n${'─'.repeat(44)}\n\n`;
  AUDIT_SECTIONS.forEach(([prefix,cat,arr])=>{
    txt += `[ ${cat} ]\n`;
    arr.forEach((title,i)=>{
      const id=prefix+String(i+1).padStart(2,'0'), it=a.items[id]||{};
      txt += `  ${it.status||'○'} ${id} ${title}\n`;
      if(it.note) txt += `    → ${it.note.trim()}\n`;
    });
    txt+='\n';
  });
  if(a.notes) txt += `[ Sonstige Anmerkungen / Funktionswünsche ]\n${a.notes.trim()}\n`;
  return txt;
}

function renderSettingsPanel(){
  closeOverlay();
  const s=state();
  const el=document.createElement('div'); el.id='prx301-overlay';
  el.innerHTML=`<section class="prx301-sheet"><div class="prx301-head"><div><b>PRX ${PRX_VERSION} Einstellungen</b><small>Planung · Darstellung · Verbrauch</small></div><button class="prx301-x">×</button></div>
  <div class="prx301-body">
    ${rangeRow('Bottom-Sheet Transparenz','sheetOpacity', Math.round((s.settings.bottomSheetOpacity??.88)*100),70,100,'%')}
    ${toggleRow('Zoomslider anzeigen','zoomSliderEnabled',!!s.settings.zoomSliderEnabled)}
    ${inputRow('Hotel/Home Name','homeName',s.settings.homeName,'text')}
    <div class="prx301-two">${inputRow('Home Lat','homeLat',s.settings.homeLat,'number')}${inputRow('Home Lon','homeLon',s.settings.homeLon,'number')}</div>
    ${inputRow('Basisverbrauch l/100 km','fuelConsumptionL100',s.settings.fuelConsumptionL100,'number')}
    ${rangeRow('Madeira-Bergkorrektur','mountainCorrectionPercent',s.settings.mountainCorrectionPercent,0,60,'%')}
    ${inputRow('Kraftstoffpreis €/l','fuelPrice',s.settings.fuelPrice,'number')}
    <p class="prx301-hint">Standard Madeira: +30 %. Für stark bergige Tage konservativ +40 bis +50 %.</p>
  </div></section>`;
  document.body.appendChild(el);
  $('.prx301-x',el).onclick=closeOverlay;
  el.oninput=e=>{
    const key=e.target.dataset.key; if(!key)return;
    const st=state();
    let val=e.target.type==='checkbox' ? e.target.checked : e.target.value;
    if(['sheetOpacity'].includes(key)){ st.settings.bottomSheetOpacity = Number(val)/100; }
    else if(['homeLat','homeLon','fuelConsumptionL100','mountainCorrectionPercent','fuelPrice'].includes(key)){ st.settings[key]=Number(val); }
    else st.settings[key]=val;
    if(key==='zoomSliderEnabled') st.settings.zoomSliderEnabled = e.target.checked;
    saveState(st);
    const out=e.target.parentElement.querySelector('output'); if(out) out.textContent=val + (e.target.dataset.unit||'');
  };
}
function inputRow(label,key,val,type='text'){ return `<label class="prx301-field"><span>${esc(label)}</span><input data-key="${key}" type="${type}" value="${esc(val)}" step="0.01"></label>`; }
function toggleRow(label,key,val){ return `<label class="prx301-switch"><span>${esc(label)}</span><input data-key="${key}" type="checkbox" ${val?'checked':''}></label>`; }
function rangeRow(label,key,val,min,max,unit){ return `<label class="prx301-field"><span>${esc(label)} <output>${esc(val)}${unit}</output></span><input data-key="${key}" data-unit="${unit}" type="range" min="${min}" max="${max}" value="${esc(val)}"></label>`; }

function ensureFab(){
  let b=$('#prx301-fab'); if(b)return;
  b=document.createElement('div'); b.id='prx301-fab';
  b.innerHTML=`<button data-open="roadmap">Roadmap</button><button data-open="audit">Audit</button><button data-open="settings">V3</button>`;
  document.body.appendChild(b);
  b.onclick=e=>{
    const x=e.target.closest('button')?.dataset.open;
    if(x==='audit') openAudit();
    if(x==='settings') renderSettingsPanel();
    if(x==='roadmap') openRoadmap();
  };
}

function prState(id){ const s=state(); const key=normId(id); s.pr[key] ||= {dateTime:'', booked:false, fixedIFCN:false, status:'open', parkingMin:10, transferMin:0, pauseMin:45, returnWalkMin:0}; saveState(s); return s.pr[key]; }
function setPrState(id, patch){ const s=state(), key=normId(id); s.pr[key]=Object.assign(prState(key), patch); if(!s.pr[key].dateTime) s.pr[key].booked=false; saveState(s); enhanceDetail(); }

function openChrome(url){
  const chrome = url.replace(/^https?:\/\//,'googlechrome://');
  const start=Date.now();
  window.location.href=chrome;
  setTimeout(()=>{ if(Date.now()-start < 1600) window.location.href=url; },850);
}
function schmaleUrl(pr){
  const num=prNum(pr).replace(/\s+/g,' ');
  return SCHMALE_PFADE_KNOWN[num] || SCHMALE_PFADE_KNOWN[num.replace(' ','')] || SCHMALE_PFADE_ALL;
}
function officialStatusCheckOnce(){
  const s=state();
  if(s.lastStatusCheckDate !== todayKey()){
    s.lastStatusCheckDate=todayKey(); saveState(s);
    if(confirm('Offizielle PR-Statusseite für heutige Prüfung öffnen?')) window.open(IFCN_STATUS_URL,'_blank','noopener');
  }
}

function hav(lat1,lon1,lat2,lon2){
  if(![lat1,lon1,lat2,lon2].every(Number.isFinite)) return Infinity;
  const R=6371, toRad=x=>x*Math.PI/180;
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function nearbyHtml(pr){
  const lat=prLat(pr), lon=prLon(pr), id=normId(prNum(pr));
  const rows=data().filter(x=>normId(prNum(x))!==id).map(x=>({x, d:hav(lat,lon,prLat(x),prLon(x))})).filter(o=>Number.isFinite(o.d)).sort((a,b)=>a.d-b.d).slice(0,5);
  if(!rows.length) return '';
  return `<div class="prx301-card"><h3>Nahegelegene PRs</h3>${rows.map(o=>`<button class="prx301-near" data-pr="${esc(o.x.id)}"><b>${esc(prNum(o.x))}</b><span>${esc(prName(o.x))}</span><em>${kmTxt(o.d)} Luftlinie</em></button>`).join('')}</div>`;
}
function planningMetrics(pr, ps){
  const driveOut=prDriveMin(pr), driveBack=prDriveMin(pr);
  const hike=prDurMin(pr);
  const total=driveOut + n(ps.parkingMin,10) + n(ps.transferMin,0) + hike + n(ps.returnWalkMin,0) + n(ps.pauseMin,45) + driveBack;
  const km=(prDriveKm(pr)||0)*2;
  const s=state().settings;
  const cons=n(s.fuelConsumptionL100,6.5)*(1+n(s.mountainCorrectionPercent,30)/100);
  const liters=km*cons/100, cost=liters*n(s.fuelPrice,1.85);
  return {total, km, cons, liters, cost};
}
function enhanceDetail(){
  const dc=$('#detailContent'); if(!dc) return;
  const text=dc.textContent || '';
  const selectedId = (window.S?.selected?.id || window.PRX302_SELECTED_ID || '');
  const pr = data().find(p=> normId(p.id)===normId(selectedId) || text.includes(prName(p)) || text.includes(prNum(p)));
  if(!pr) return;
  dc.__prx301Enhanced = true;
  const id=prNum(pr), ps=prState(id), met=planningMetrics(pr, ps);
  const block=document.createElement('div'); block.className='prx301-detail-extra';
  block.innerHTML=`
    <div class="prx301-card"><h3>V3.0.1 Planung</h3>
      <label class="prx301-field"><span>Termin</span><input id="prx301-pr-date" type="datetime-local" value="${esc(ps.dateTime||'')}"></label>
      <div class="prx301-two">
        <label class="prx301-switch"><span>IFCN-fix</span><input id="prx301-pr-fixed" type="checkbox" ${ps.fixedIFCN?'checked':''}></label>
        <label class="prx301-switch"><span>Gebucht</span><input id="prx301-pr-booked" type="checkbox" ${ps.booked?'checked':''} ${ps.dateTime?'':'disabled'}></label>
      </div>
      <div class="prx301-status-row" data-prx-status>${['open','limited','closed','skip'].map(v=>`<button class="${ps.status===v?'on':''}" data-s="${v}">${v==='open'?'Offen':v==='limited'?'Eingeschränkt':v==='closed'?'Geschlossen':'Kein Interesse'}</button>`).join('')}</div>
      <div class="prx301-two">
        ${smallNum('Parken/Vorbereitung min','parkingMin',ps.parkingMin)}
        ${smallNum('Transfer min','transferMin',ps.transferMin)}
        ${smallNum('Pause min','pauseMin',ps.pauseMin)}
        ${smallNum('Rückweg/Shuttle min','returnWalkMin',ps.returnWalkMin)}
      </div>
      <p class="prx301-hint"><b>Gesamtfenster:</b> ${minTxt(met.total)} · <b>Fahrt:</b> ${kmTxt(met.km)} · <b>Sprit:</b> ${met.liters.toFixed(1).replace('.',',')} l · <b>Kosten:</b> ${met.cost.toFixed(2).replace('.',',')} €</p>
      <div class="prx301-actions compact">
        <button type="button" data-prx-add-day="${esc(id)}">In Reiseliste</button>
        <button type="button" data-open-simplifica>Simplifica Chrome</button>
        <a href="${esc(schmaleUrl(pr))}" target="_blank" rel="noopener">Schmale Pfade</a>
        <a href="${IFCN_STATUS_URL}" target="_blank" rel="noopener">IFCN Status</a>
      </div>
    </div>
    ${nearbyHtml(pr)}
  `;
  dc.appendChild(block);
  $('#prx301-pr-date',block).onchange=e=>setPrState(id,{dateTime:e.target.value, booked: ps.booked && !!e.target.value});
  $('#prx301-pr-fixed',block).onchange=e=>setPrState(id,{fixedIFCN:e.target.checked});
  $('#prx301-pr-booked',block).onchange=e=>setPrState(id,{booked:e.target.checked});
  $$('input[data-num]',block).forEach(inp=>inp.onchange=e=>setPrState(id,{[e.target.dataset.num]:Number(e.target.value)}));
  $('[data-prx-status]',block).onclick=e=>{ const b=e.target.closest('button[data-s]'); if(!b)return; officialStatusCheckOnce(); setPrState(id,{status:b.dataset.s}); };
  $('[data-open-simplifica]',block).onclick=()=>openChrome(SIMPLIFICA_URL);
  $$('[data-pr]',block).forEach(btn=>btn.onclick=()=>{ window.openDetail?.(btn.dataset.pr,true); });
  $('[data-prx-add-day]',block).onclick=()=>{ addPrToDay(id); openRoadmap(); };
}
function smallNum(label,key,val){ return `<label class="prx301-field"><span>${esc(label)}</span><input data-num="${key}" type="number" value="${esc(val)}" step="5"></label>`; }

function openRoadmap(){
  closeOverlay();
  const el=document.createElement('div'); el.id='prx301-overlay';
  el.innerHTML = `<section class="prx301-sheet prx301-roadmap"><div class="prx301-head"><div><b>Roadmap ${PRX_VERSION}</b><small>PRs · Ideen · GPX · Tagesplanung</small></div><button class="prx301-x">×</button></div>
  <div class="prx301-tabs"><button class="on" data-tab="days">Reiseliste</button><button data-tab="ideas">Ideen</button><button data-tab="gpx">GPX</button><button data-tab="export">Export</button></div>
  <div class="prx301-body" id="prx301RoadmapBody"></div></section>`;
  document.body.appendChild(el);
  $('.prx301-x',el).onclick=closeOverlay;
  $('.prx301-tabs',el).onclick=e=>{ const b=e.target.closest('button'); if(!b)return; $$('.prx301-tabs button',el).forEach(x=>x.classList.toggle('on',x===b)); renderRoadmap(b.dataset.tab); };
  renderRoadmap('days');
}
function renderRoadmap(tab){
  const body=$('#prx301RoadmapBody'); if(!body)return;
  const s=state();
  if(tab==='days') renderDays(body,s);
  if(tab==='ideas') renderIdeas(body,s);
  if(tab==='gpx') renderGpx(body,s);
  if(tab==='export') renderExport(body,s);
}
function ensureDay(date){
  const s=state(); let d=s.dayPlans.find(x=>x.date===date);
  if(!d){ d={date, items:[]}; s.dayPlans.push(d); s.dayPlans.sort((a,b)=>a.date.localeCompare(b.date)); saveState(s); }
  return d;
}
function addPrToDay(prid){
  const ps=prState(prid), date=(ps.dateTime||'').slice(0,10) || todayKey();
  const s=state(); let d=s.dayPlans.find(x=>x.date===date); if(!d){ d={date,items:[]}; s.dayPlans.push(d); }
  if(!d.items.some(it=>it.type==='pr' && normId(it.id)===normId(prid))) d.items.push({type:'pr', id:prid, fixed:!!ps.fixedIFCN, sortOrder:d.items.length});
  saveState(s); toast('In Reiseliste aufgenommen');
}
function renderDays(body,s){
  const allPrWithDates = Object.entries(s.pr).filter(([_,v])=>v.dateTime).map(([id,v])=>({id,date:v.dateTime.slice(0,10),fixed:!!v.fixedIFCN}));
  allPrWithDates.forEach(x=>{ let d=s.dayPlans.find(y=>y.date===x.date); if(!d){ d={date:x.date,items:[]}; s.dayPlans.push(d); } if(!d.items.some(it=>it.type==='pr' && normId(it.id)===normId(x.id))) d.items.push({type:'pr',id:x.id,fixed:x.fixed,sortOrder:d.items.length}); });
  saveState(s);
  const totals=tripTotals(s);
  body.innerHTML=`<div class="prx301-actions"><button data-act="toggle-edit">${s.sortEditMode?'Fertig':'Bearbeiten'}</button><button data-act="add-today">Heute hinzufügen</button></div>
  <div class="prx301-kpis"><div><b>${kmTxt(totals.km)}</b><small>Reisekilometer</small></div><div><b>${totals.liters.toFixed(1).replace('.',',')} l</b><small>Kraftstoff</small></div><div><b>${totals.cost.toFixed(2).replace('.',',')} €</b><small>Fahrkosten</small></div></div>
  ${s.dayPlans.sort((a,b)=>a.date.localeCompare(b.date)).map(dayHtml).join('') || '<p class="prx301-empty">Noch keine Tagesplanung.</p>'}`;
  body.onclick=e=>{
    const act=e.target.closest('[data-act]')?.dataset.act;
    if(act==='toggle-edit'){ const x=state(); x.sortEditMode=!x.sortEditMode; saveState(x); renderRoadmap('days'); }
    if(act==='add-today'){ ensureDay(todayKey()); renderRoadmap('days'); }
    const rem=e.target.closest('[data-remove]'); if(rem){ removeItem(rem.dataset.day, rem.dataset.remove); renderRoadmap('days'); }
    const up=e.target.closest('[data-up]'); if(up){ moveItem(up.dataset.day, Number(up.dataset.up), -1); renderRoadmap('days'); }
    const down=e.target.closest('[data-down]'); if(down){ moveItem(down.dataset.day, Number(down.dataset.down), 1); renderRoadmap('days'); }
  };
}
function dayHtml(d){
  const s=state();
  return `<div class="prx301-day"><h3>${new Date(d.date+'T12:00').toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'})}</h3>${(d.items||[]).map((it,i)=>itemHtml(d,it,i,s.sortEditMode)).join('')||'<p class="prx301-empty">leer</p>'}</div>`;
}
function itemHtml(day,it,i,edit){
  let title='', sub='', fixed=!!it.fixed, metrics={total:0,km:0,liters:0,cost:0};
  if(it.type==='pr'){ const pr=data().find(p=>normId(prNum(p))===normId(it.id)||normId(p.id)===normId(it.id)); const ps=prState(it.id); title=pr?`${prNum(pr)} · ${prName(pr)}`:it.id; metrics=pr?planningMetrics(pr,ps):metrics; fixed=!!ps.fixedIFCN; sub=`${minTxt(metrics.total)} · ${kmTxt(metrics.km)} · ${metrics.cost.toFixed(2).replace('.',',')} €`; }
  if(it.type==='idea'){ const idea=state().ideas.find(x=>x.id===it.id); title=idea?.title||it.id; sub=`${idea?.category||'Aktivität'} · ${minTxt(idea?.durationMin||60)}`; }
  if(it.type==='gpx'){ const r=state().customRoutes.find(x=>x.id===it.id); title=r?.name||it.id; sub=`GPX · ${kmTxt(r?.distanceKm||0)} · ↑ ${Math.round(r?.eleGainM||0)} m`; }
  return `<div class="prx301-plan-item ${fixed?'fixed':''}"><div class="prx301-handle">${edit&&!fixed?`<button data-up="${i}" data-day="${day.date}">↑</button><button data-down="${i}" data-day="${day.date}">↓</button>`:fixed?'🔒':'⋮⋮'}</div><div><b>${esc(title)}</b><small>${esc(sub)}</small></div><button data-remove="${i}" data-day="${day.date}">×</button></div>`;
}
function moveItem(day,index,dir){
  const s=state(), d=s.dayPlans.find(x=>x.date===day); if(!d)return;
  const item=d.items[index]; if(!item || item.fixed) return;
  const ni=index+dir; if(ni<0 || ni>=d.items.length || d.items[ni].fixed) return;
  [d.items[index],d.items[ni]]=[d.items[ni],d.items[index]]; saveState(s);
}
function removeItem(day,index){
  const s=state(), d=s.dayPlans.find(x=>x.date===day); if(!d)return; d.items.splice(Number(index),1); saveState(s);
}
function tripTotals(s){
  let km=0, liters=0, cost=0;
  (s.dayPlans||[]).forEach(d=>(d.items||[]).forEach(it=>{
    if(it.type==='pr'){ const pr=data().find(p=>normId(prNum(p))===normId(it.id)||normId(p.id)===normId(it.id)); if(pr){ const m=planningMetrics(pr,prState(it.id)); km+=m.km; liters+=m.liters; cost+=m.cost; } }
  }));
  return {km,liters,cost};
}

function renderIdeas(body,s){
  body.innerHTML=`<div class="prx301-card"><h3>Neue externe Unternehmung</h3>
    ${inputRow('Titel','title','','text')}
    ${inputRow('Kategorie','category','Aussichtspunkt','text')}
    ${inputRow('Ort/Region','region','','text')}
    <div class="prx301-two">${inputRow('Lat optional','lat','','number')}${inputRow('Lon optional','lon','','number')}</div>
    ${inputRow('Dauer min','durationMin',60,'number')}
    ${inputRow('Link','url','','url')}
    <label class="prx301-field"><span>Notiz</span><textarea data-key="notes"></textarea></label>
    <button data-act="add-idea">Idee speichern</button>
  </div>
  <h3>Ideenliste</h3>${s.ideas.map(ideaHtml).join('')||'<p class="prx301-empty">Noch keine Ideen.</p>'}`;
  body.onclick=e=>{
    if(e.target.closest('[data-act="add-idea"]')){ addIdea(body); renderRoadmap('ideas'); }
    const del=e.target.closest('[data-del-idea]'); if(del){ const x=state(); x.ideas=x.ideas.filter(i=>i.id!==del.dataset.delIdea); saveState(x); renderRoadmap('ideas'); }
    const assign=e.target.closest('[data-assign-idea]'); if(assign){ assignToDay('idea',assign.dataset.assignIdea); renderRoadmap('ideas'); }
    const edit=e.target.closest('[data-edit-idea]'); if(edit){ editIdea(edit.dataset.editIdea); }
  };
}
function addIdea(root){
  const obj={id:uid('EXT'), status:'idea'};
  $$('[data-key]',root).forEach(el=>{ obj[el.dataset.key]=el.type==='number'?Number(el.value):el.value; });
  obj.durationMin = n(obj.durationMin,60);
  const s=state(); s.ideas.push(obj); saveState(s); toast('Idee gespeichert');
}
function ideaHtml(i){ return `<div class="prx301-plan-item"><div>💡</div><div><b>${esc(i.title||'Ohne Titel')}</b><small>${esc(i.category||'Aktivität')} · ${esc(i.region||'ohne Ort')} · ${minTxt(i.durationMin||60)}</small></div><button data-edit-idea="${i.id}">✎</button><button data-assign-idea="${i.id}">Tag</button><button data-del-idea="${i.id}">×</button></div>`; }
function editIdea(id){
  const s=state(), i=s.ideas.find(x=>x.id===id); if(!i)return;
  const title=prompt('Titel', i.title||''); if(title===null)return; i.title=title;
  const dur=prompt('Dauer in Minuten', i.durationMin||60); if(dur!==null)i.durationMin=Number(dur)||60;
  const region=prompt('Ort/Region', i.region||''); if(region!==null)i.region=region;
  saveState(s); renderRoadmap('ideas');
}
function assignToDay(type,id){
  const date=prompt('Datum YYYY-MM-DD', todayKey()); if(!date)return;
  const s=state(); let d=s.dayPlans.find(x=>x.date===date); if(!d){ d={date,items:[]}; s.dayPlans.push(d); }
  d.items.push({type,id,sortOrder:d.items.length}); saveState(s); toast('Tagesplanung zugeordnet');
}

function renderGpx(body,s){
  body.innerHTML=`<div class="prx301-card"><h3>GPX importieren</h3><input id="prx301-gpx-file" type="file" accept=".gpx,application/gpx+xml,text/xml"><p class="prx301-hint">Komoot-/Strava-/manuelle GPX-Dateien werden als freie Routen gespeichert. Große Original-GPX werden nur als Metadaten abgelegt.</p></div>
  ${s.customRoutes.map(gpxHtml).join('')||'<p class="prx301-empty">Noch keine freien GPX-Routen.</p>'}`;
  $('#prx301-gpx-file',body).onchange=e=>importGpx(e.target.files?.[0]);
  body.onclick=e=>{
    const del=e.target.closest('[data-del-gpx]'); if(del){ const x=state(); x.customRoutes=x.customRoutes.filter(r=>r.id!==del.dataset.delGpx); saveState(x); renderRoadmap('gpx'); }
    const assign=e.target.closest('[data-assign-gpx]'); if(assign){ assignToDay('gpx',assign.dataset.assignGpx); renderRoadmap('gpx'); }
  };
}
function gpxHtml(r){ return `<div class="prx301-plan-item"><div>🧭</div><div><b>${esc(r.name)}</b><small>${kmTxt(r.distanceKm)} · ↑ ${Math.round(r.eleGainM||0)} m · ${r.source}</small></div><button data-assign-gpx="${r.id}">Tag</button><button data-del-gpx="${r.id}">×</button></div>`; }
function importGpx(file){
  if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    const text=String(reader.result||'');
    const doc=new DOMParser().parseFromString(text,'application/xml');
    const pts=$$('trkpt',doc).map(p=>({lat:Number(p.getAttribute('lat')), lon:Number(p.getAttribute('lon')), ele:Number($('ele',p)?.textContent||NaN)})).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon));
    let dist=0, gain=0;
    for(let i=1;i<pts.length;i++){ dist += hav(pts[i-1].lat,pts[i-1].lon,pts[i].lat,pts[i].lon); const de=pts[i].ele-pts[i-1].ele; if(Number.isFinite(de)&&de>0)gain+=de; }
    const s=state();
    s.customRoutes.push({id:uid('GPX'), type:'custom_gpx_route', source: guessGpxSource(text,file.name), name:file.name.replace(/\.gpx$/i,''), fileName:file.name, distanceKm:dist, eleGainM:gain, pointCount:pts.length, importedAt:new Date().toISOString(), gpxText:text.length<800000?text:null});
    saveState(s); toast('GPX importiert'); renderRoadmap('gpx');
  };
  reader.readAsText(file);
}
function guessGpxSource(txt,name){ const x=(txt+' '+name).toLowerCase(); if(x.includes('komoot'))return'komoot'; if(x.includes('strava'))return'strava'; if(x.includes('garmin'))return'garmin'; return'unknown'; }

function renderExport(body,s){
  body.innerHTML=`<div class="prx301-card"><h3>Exportpaket</h3><p>Erzeugt ein ZIP mit Reisedaten, Ideen, Tagesplänen, GPX-Zusammenfassung und Prompt für ChatGPT-Roadmap.</p><button data-act="zip">ZIP exportieren</button><button data-act="json">JSON exportieren</button></div>`;
  body.onclick=e=>{
    if(e.target.closest('[data-act="json"]')) download('prx_trip_data_v3_0_1.json', JSON.stringify(exportData(),null,2), 'application/json');
    if(e.target.closest('[data-act="zip"]')) exportZip();
  };
}
function exportData(){ const s=state(); return {version:PRX_VERSION, exportedAt:new Date().toISOString(), settings:s.settings, pr:s.pr, ideas:s.ideas, dayPlans:s.dayPlans, customRoutes:s.customRoutes.map(({gpxText,...r})=>r), totals:tripTotals(s)}; }
const ROADMAP_PROMPT = `Du erhältst ein Exportpaket aus dem PR‑Explorer Madeira.

Ziel:
Erstelle eine optimierte Urlaubs-Roadmap auf Basis der vorhandenen PR-Wanderungen, freien GPX-Routen, externen Aktivitäten, fixen Buchungen und Tageslücken.

Arbeitsregeln:
- Fix gebuchte IFCN-Termine nicht verschieben.
- Nicht terminfixierte Einträge dürfen verschoben werden.
- Externe Aktivitäten zuerst nach geografischer Nähe, Dauer und Tageslücken zuordnen.
- Fahrstrecken minimieren.
- Keine überladenen Tage erzeugen.
- Kurze leichte Wanderungen können mit Aussichtspunkten, Orten, Restaurants oder Badestopps kombiniert werden.
- Bei unsicherer Datenlage markieren, nicht erfinden.
- Ergebnis als importierbares JSON zurückgeben.

Gib zurück:
1. Bewertung der vorhandenen Planung.
2. Optimierte Tagesstruktur.
3. Erkannte Lücken.
4. Vorschläge zur Lückenfüllung.
5. Importierbares prx_roadmap_import.json.`;
function exportZip(){
  const s=state();
  const files={
    'prx_trip_data.json': JSON.stringify(exportData(),null,2),
    'prx_ideas.json': JSON.stringify(s.ideas,null,2),
    'prx_dayplans.json': JSON.stringify(s.dayPlans,null,2),
    'prx_gpx_summary.json': JSON.stringify(s.customRoutes.map(({gpxText,...r})=>r),null,2),
    'PROMPT_CHATGPT_ROADMAP.md': ROADMAP_PROMPT,
    'audit_latest.txt': auditText()
  };
  s.customRoutes.forEach(r=>{ if(r.gpxText) files['gpx/'+(r.fileName||r.id+'.gpx')]=r.gpxText; });
  const blob=zipStore(files); downloadBlob('PRX-roadmap-export-v3.0.6.zip', blob);
}
function download(name,text,type='text/plain;charset=utf-8'){ downloadBlob(name,new Blob([text],{type})); }
function downloadBlob(name,blob){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),1500); }
function copyText(txt){ navigator.clipboard?.writeText(txt).then(()=>toast('Kopiert')).catch(()=>{ const ta=document.createElement('textarea'); ta.value=txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('Kopiert'); }); }
function shareText(name,txt){ if(navigator.share){ const file=new File([txt],name,{type:'text/plain'}); navigator.share({files:[file],title:name}).catch(()=>copyText(txt)); } else copyText(txt); }

/* Minimal ZIP writer: store-only, no compression */
function crc32(str){
  const table=crc32.table||(crc32.table=Array.from({length:256},(_,n)=>{let c=n; for(let k=0;k<8;k++) c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1); return c>>>0;}));
  let crc=-1; const bytes=new TextEncoder().encode(str);
  for(const b of bytes) crc=(crc>>>8)^table[(crc^b)&255];
  return (crc^(-1))>>>0;
}
function u16(n){ return [n&255,(n>>>8)&255]; }
function u32(n){ return [n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255]; }
function dosTime(d=new Date()){ return [(d.getSeconds()/2|0)|((d.getMinutes())<<5)|((d.getHours())<<11), (d.getDate())|((d.getMonth()+1)<<5)|((d.getFullYear()-1980)<<9)]; }
function arr(...xs){ return new Uint8Array(xs.flat()); }
function zipStore(files){
  const enc=new TextEncoder(); let offset=0; const chunks=[], central=[]; const [tm,dt]=dosTime();
  for(const [name,content] of Object.entries(files)){
    const nameB=enc.encode(name), dataB=enc.encode(content), crc=crc32(content);
    const local=arr(u32(0x04034b50),u16(20),u16(0x0800),u16(0),u16(tm),u16(dt),u32(crc),u32(dataB.length),u32(dataB.length),u16(nameB.length),u16(0));
    chunks.push(local,nameB,dataB);
    central.push(arr(u32(0x02014b50),u16(20),u16(20),u16(0x0800),u16(0),u16(tm),u16(dt),u32(crc),u32(dataB.length),u32(dataB.length),u16(nameB.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset)),nameB);
    offset += local.length + nameB.length + dataB.length;
  }
  const csize=central.reduce((a,b)=>a+b.length,0), coff=offset;
  const end=arr(u32(0x06054b50),u16(0),u16(0),u16(Object.keys(files).length),u16(Object.keys(files).length),u32(csize),u32(coff),u16(0));
  return new Blob([...chunks,...central,end],{type:'application/zip'});
}

function closeOverlay(){ $('#prx301-overlay')?.remove(); }

function boot(){
  initLeafletHook();
  injectCSSFixes();
  applySettings();
  ensureFab();
  configureMap();
  const obs=new MutationObserver(()=>{ enhanceDetail(); ensureFab(); configureMap(); });
  obs.observe(document.body,{childList:true,subtree:true});
  setTimeout(()=>{ enhanceDetail(); configureMap(); },500);
  window.PRX301 = {version:PRX_VERSION, openAudit, openRoadmap, renderSettingsPanel, exportZip, state, saveState, openChromeSimplifica:()=>openChrome(SIMPLIFICA_URL)};
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();

})();

/* ============================================================
   PR Explorer · V3.0.6 Runtime Hotfixes
   ============================================================ */
(function(){
  'use strict';
  const KEY_STATE='prx301_state';
  const KEY_SETTINGS='prx301_settings';
  function read(k,f){ try{return JSON.parse(localStorage.getItem(k)||'null')??f;}catch(e){return f;} }
  function write(k,v){ localStorage.setItem(k,JSON.stringify(v)); }
  function state(){ const s=read(KEY_STATE,{}); s.settings=Object.assign({zoomSliderEnabled:false,bottomSheetOpacity:.88,fuelConsumptionL100:6.5,mountainCorrectionPercent:30,fuelPrice:1.9}, s.settings||{}, read(KEY_SETTINGS,{})); s.ideas=s.ideas||[]; s.dayPlans=s.dayPlans||[]; s.customRoutes=s.customRoutes||[]; s.pr=s.pr||{}; return s; }
  function save(s){ write(KEY_STATE,s); write(KEY_SETTINGS,s.settings||{}); document.documentElement.style.setProperty('--prx-sheet-opacity', String(s.settings?.bottomSheetOpacity??.88)); }
  function cleanRoadmap(){
    const s=state(), ideaIds=new Set(s.ideas.map(x=>x.id)), routeIds=new Set(s.customRoutes.map(x=>x.id));
    let changed=false;
    (s.dayPlans||[]).forEach(d=>{
      const before=(d.items||[]).length;
      d.items=(d.items||[]).filter(it=>{
        if(it.type==='idea') return ideaIds.has(it.id);
        if(it.type==='gpx') return routeIds.has(it.id);
        return true;
      }).map((it,i)=>Object.assign({},it,{sortOrder:i}));
      if(d.items.length!==before) changed=true;
    });
    if(changed) save(s);
  }
  function ensureMainSettings(){
    const sc=document.querySelector('#settingsContent');
    if(!sc || document.querySelector('#prx302MainSettings')) return;
    const s=state(), box=document.createElement('div');
    box.className='sg';
    box.id='prx302MainSettings';
    box.innerHTML=`<div class="sg-title">V3.0.2 Planung & Darstellung</div><div class="sg-box">
      <label class="sg-row prx302-row"><span class="sg-label">Zoomslider anzeigen</span><input id="prx302ZoomToggle" type="checkbox" class="s-tog" ${s.settings.zoomSliderEnabled?'checked':''}></label>
      <label class="sg-row prx302-range"><span class="sg-label">Bottom-Sheet Transparenz <b id="prx302OpacityVal">${Math.round((s.settings.bottomSheetOpacity??.88)*100)}%</b></span><input id="prx302Opacity" type="range" min="70" max="100" value="${Math.round((s.settings.bottomSheetOpacity??.88)*100)}" class="s-range-sl"></label>
      <label class="sg-row prx302-range"><span class="sg-label">Madeira-Bergkorrektur <b id="prx302MountainVal">${s.settings.mountainCorrectionPercent??30}%</b></span><input id="prx302Mountain" type="range" min="0" max="60" step="5" value="${s.settings.mountainCorrectionPercent??30}" class="s-range-sl"></label>
      <label class="sg-row"><span class="sg-label">Kraftstoffpreis €/l</span><input id="prx302FuelPrice" class="mini-num" type="number" step="0.01" value="${s.settings.fuelPrice??1.9}"></label>
      <label class="sg-row"><span class="sg-label">Basisverbrauch l/100 km</span><input id="prx302FuelCons" class="mini-num" type="number" step="0.1" value="${s.settings.fuelConsumptionL100??6.5}"></label>
    </div>`;
    sc.prepend(box);
    box.addEventListener('input', e=>{
      const st=state();
      if(e.target.id==='prx302ZoomToggle') st.settings.zoomSliderEnabled=e.target.checked;
      if(e.target.id==='prx302Opacity'){ st.settings.bottomSheetOpacity=Number(e.target.value)/100; const v=document.querySelector('#prx302OpacityVal'); if(v)v.textContent=e.target.value+'%'; }
      if(e.target.id==='prx302Mountain'){ st.settings.mountainCorrectionPercent=Number(e.target.value); const v=document.querySelector('#prx302MountainVal'); if(v)v.textContent=e.target.value+'%'; }
      if(e.target.id==='prx302FuelPrice') st.settings.fuelPrice=Number(e.target.value)||0;
      if(e.target.id==='prx302FuelCons') st.settings.fuelConsumptionL100=Number(e.target.value)||0;
      save(st);
      try{ window.PRX301?.saveState?.(st); }catch(_){}
      ensureZoomSlider();
    });
  }
  function ensureZoomSlider(){
    const s=state();
    document.querySelectorAll('#prx301-zoom-slider').forEach(x=>x.remove());
    let z=document.querySelector('#prx302ZoomSlider');
    if(!s.settings.zoomSliderEnabled){ if(z)z.remove(); return; }
    if(!z){
      z=document.createElement('div'); z.id='prx302ZoomSlider';
      z.innerHTML='<button type="button" data-z="+">+</button><input type="range" min="8" max="18" step="1"><button type="button" data-z="-">−</button>';
      document.body.appendChild(z);
      z.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; const m=window.PRX302_MAP||window.PRX301_MAP||window.map; if(!m)return; b.dataset.z==='+'?m.zoomIn():m.zoomOut(); const i=z.querySelector('input'); if(i)i.value=m.getZoom(); });
      z.querySelector('input').addEventListener('input',e=>{ const m=window.PRX302_MAP||window.PRX301_MAP||window.map; if(m)m.setZoom(Number(e.target.value)); });
    }
    const m=window.PRX302_MAP||window.PRX301_MAP||window.map, i=z.querySelector('input'); if(m&&i)i.value=m.getZoom();
  }
  function installDoubleTapFallback(){
    const el=document.querySelector('#map'); if(!el || el.__prx302DoubleTap) return;
    el.__prx302DoubleTap=true;
    let last=0,lastPt=null;
    function pt(e){ const t=e.changedTouches?e.changedTouches[0]:e; return {x:t.clientX,y:t.clientY}; }
    function zoomAt(e){
      const m=window.PRX302_MAP||window.PRX301_MAP||window.map; if(!m) return;
      const p=pt(e);
      const ll=m.containerPointToLatLng([p.x,p.y]);
      try{ m.setZoomAround(ll, m.getZoom()+1); }catch(_){ m.zoomIn(); }
    }
    el.addEventListener('touchend',e=>{
      if(e.changedTouches && e.changedTouches.length!==1) return;
      const now=Date.now(), p=pt(e), d=lastPt?Math.hypot(p.x-lastPt.x,p.y-lastPt.y):999;
      if(now-last<330 && d<42){ e.preventDefault(); e.stopPropagation(); zoomAt(e); last=0; lastPt=null; return; }
      last=now; lastPt=p;
    },{capture:true,passive:false});
    el.addEventListener('dblclick',e=>{ e.preventDefault(); e.stopPropagation(); zoomAt(e); },{capture:true,passive:false});
  }
  function markSelectedFromDetail(){
    const dc=document.querySelector('#detailContent'); if(!dc) return;
    const t=dc.textContent||'';
    const m=t.match(/\bPR\s*\d+(?:\.\d+)?\b/i);
    if(m) window.PRX302_SELECTED_ID=m[0].replace(/\s+/,' ');
  }
  function boot(){
    cleanRoadmap();
    ensureMainSettings();
    ensureZoomSlider();
    installDoubleTapFallback();
    markSelectedFromDetail();
    const mo=new MutationObserver(()=>{ cleanRoadmap(); ensureMainSettings(); ensureZoomSlider(); installDoubleTapFallback(); markSelectedFromDetail(); });
    mo.observe(document.body,{childList:true,subtree:true});
    setInterval(()=>{ ensureZoomSlider(); },1500);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();



/* ============================================================
   PR Explorer · V3.0.6 Final Runtime Corrections
   ============================================================ */
(function(){
  'use strict';
  function q(s,r=document){ return r.querySelector(s); }
  function qa(s,r=document){ return Array.from(r.querySelectorAll(s)); }

  function killDuplicateZoomSlider(){
    qa('#prx301-zoom-slider').forEach(x=>x.remove());
    const sliders=qa('#prx302ZoomSlider');
    sliders.slice(1).forEach(x=>x.remove());
  }

  function hardViewportFix(){
    document.documentElement.classList.add('prx303-viewport');
    const app=q('#app'), map=q('#map'), bnav=q('#bottomNav');
    [document.documentElement, document.body, app, map].filter(Boolean).forEach(el=>{
      el.style.height='100dvh';
      el.style.minHeight='100dvh';
      el.style.maxHeight='100dvh';
      el.style.marginBottom='0px';
      el.style.paddingBottom='0px';
    });
    if(bnav){
      bnav.style.bottom='0px';
      bnav.style.transform='translateY(0)';
      bnav.style.marginBottom='0px';
      bnav.style.paddingBottom='0px';
    }
  }

  function neutralizeExportOnClose(){
    qa('button, .btn, [role="button"]').forEach(el=>{
      const txt=(el.textContent||'').trim().toLowerCase();
      const aria=(el.getAttribute('aria-label')||'').toLowerCase();
      const title=(el.getAttribute('title')||'').toLowerCase();
      if(txt==='×' || txt==='✕' || txt==='schließen' || aria.includes('schließen') || title.includes('schließen')){
        el.dataset.prx303CloseOnly='1';
      }
    });
  }

  function installCloseGuard(){
    if(window.__prx303CloseGuard) return;
    window.__prx303CloseGuard=true;
    document.addEventListener('click', function(e){
      const close=e.target.closest('[data-prx303-close-only="1"]');
      if(!close) return;
      const maybeExport = /export|kopier|copy|share|teilen/i.test(close.getAttribute('onclick')||'') || /export|kopier|copy|share|teilen/i.test(close.className||'');
      if(maybeExport){
        e.preventDefault();
        e.stopImmediatePropagation();
        const panel=close.closest('.panel,.sheet,.test-panel,.settings-panel,#prx301-overlay,#prx302-overlay');
        if(panel && panel.id && panel.id.startsWith('prx')) panel.remove();
        else if(panel) panel.classList.add('hidden');
      }
    }, true);
  }

  function safeJournalCards(){
    qa('.pr-card').forEach(card=>{
      card.classList.add('pr-card-v303');
      qa('.chevron', card).forEach(x=>x.remove());
      if(card.__prx303Safe) return;
      card.__prx303Safe=true;
      card.addEventListener('click', function(e){
        if(e.target.closest('.card-map-btn,button,a,input,select,textarea')) return;
        const tag=q('.pr-tag', card);
        const id=tag ? tag.textContent.trim() : '';
        if(id && typeof window.openDetail === 'function'){
          try { window.openDetail(id, true); } catch(err){ console.error(err); alert('Detailansicht konnte nicht geöffnet werden: ' + (err?.message || err)); }
        }
      }, false);
    });
  }

  function boot(){
    hardViewportFix();
    killDuplicateZoomSlider();
    neutralizeExportOnClose();
    installCloseGuard();
    safeJournalCards();
    const mo=new MutationObserver(()=>{ hardViewportFix(); killDuplicateZoomSlider(); neutralizeExportOnClose(); safeJournalCards(); });
    mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
    window.addEventListener('resize', hardViewportFix);
    window.addEventListener('orientationchange', ()=>setTimeout(hardViewportFix,250));
    setInterval(()=>{ killDuplicateZoomSlider(); hardViewportFix(); safeJournalCards(); }, 1200);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();

/* PR Explorer · V3.0.6 Conservative Safe-Area Background Only */
(function(){
  'use strict';
  function boot(){
    document.documentElement.classList.add('prx306-recovery');
    document.querySelectorAll('#prx305DockBg').forEach(el => el.remove());
    document.querySelectorAll('#prx301-zoom-slider').forEach(el => el.remove());
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
