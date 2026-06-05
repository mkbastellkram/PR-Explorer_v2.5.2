(() => {
'use strict';
const D = window.PRX_DATA;
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmt = v => (v===null || v===undefined || v==='' || Number.isNaN(v)) ? '–' : v;
const fmtKm = v => v ? `${String(Math.round(v*10)/10).replace('.',',')} km` : '–';
const fmtMin = v => v ? `${v} min` : '–';
const normLevel = s => (String(s||'').toLowerCase().includes('leicht')?'leicht':String(s||'').toLowerCase().includes('schwer')?'schwer':String(s||'').toLowerCase().includes('mittel')?'mittel':'k.A.');
const hav = (a,b,c,d) => { const R=6371, to=x=>x*Math.PI/180; const dLat=to(c-a), dLon=to(d-b); const x=Math.sin(dLat/2)**2+Math.cos(to(a))*Math.cos(to(c))*Math.sin(dLon/2)**2; return 2*R*Math.asin(Math.sqrt(x)); };

let state = {
  mode:'map', level:'all', query:'', onlyFav:false, base:'topo',
  layers:{pins:true, tracks:true, drives:true, context:false},
  selectedTrailId:null, selectedPoiIds:[], selectedWebcamIds:[], solo:false,
  sheetTab:'overview', travel:JSON.parse(localStorage.getItem('prxTravel')||'[]'), favs:new Set(JSON.parse(localStorage.getItem('prxFavs')||'[]'))
};

const trails = D.trails;
const byId = Object.fromEntries(trails.map(t=>[t.id,t]));
let filtered = [...trails];
let map, bases={}, activeBase, layers={}, markers={};

function initMap(){
  map = L.map('map', {zoomControl:false, attributionControl:false, preferCanvas:true}).setView([32.755,-16.94],10);
  bases.light = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19});
  bases.topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{maxZoom:17});
  bases.sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19});
  activeBase = bases.topo.addTo(map);
  layers.pins=L.layerGroup().addTo(map); layers.tracks=L.layerGroup().addTo(map); layers.drives=L.layerGroup().addTo(map);
  layers.context=L.layerGroup().addTo(map); layers.highlight=L.layerGroup().addTo(map); layers.home=L.layerGroup().addTo(map);
  const homeIcon=L.divIcon({className:'',html:'<div class="home-marker">⌂</div>',iconSize:[34,34],iconAnchor:[17,17]});
  L.marker([D.home.lat,D.home.lon],{icon:homeIcon,title:D.home.name}).bindPopup(`<b>${esc(D.home.name)}</b><br>Hotel / Home-Pin`).addTo(layers.home);
  renderMap();
  fitAll();
}

function save(){ localStorage.setItem('prxFavs', JSON.stringify([...state.favs])); localStorage.setItem('prxTravel', JSON.stringify(state.travel)); }
function toast(msg){ const t=$('toast'); t.textContent=msg; t.classList.remove('hidden'); clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.add('hidden'),1900); }

function applyFilters(){
  const q=state.query.trim().toLowerCase();
  filtered = trails.filter(t => {
    const lev=normLevel(t.level);
    const hay=[t.number,t.id,t.name,t.region,t.level].join(' ').toLowerCase();
    return (state.level==='all'||lev===state.level) && (!q||hay.includes(q)) && (!state.onlyFav||state.favs.has(t.id));
  });
  $('resultCount').textContent = `${filtered.length} PRs im Filter`;
  renderMap(); renderJournal(); renderCarousel();
}

function markerHtml(t){
  const active = state.selectedTrailId===t.id; const dim=state.solo && !active;
  return `<div class="pr-marker ${active?'active':''} ${dim?'dim':''}">${esc(t.number.replace('PR ','').replace('.','·'))}</div>`;
}
function markerIcon(t){ return L.divIcon({className:'',html:markerHtml(t),iconSize:[34,34],iconAnchor:[17,17]}); }
function addLine(group, coords, opts){ if(!coords || coords.length<2) return null; return L.polyline(coords, opts).addTo(group); }

function renderMap(){
  if(!map) return;
  layers.pins.clearLayers(); layers.tracks.clearLayers(); layers.drives.clearLayers(); markers={};
  const showList = state.solo && state.selectedTrailId ? [byId[state.selectedTrailId]].filter(Boolean) : filtered;
  if(state.layers.pins){
    showList.forEach(t=>{
      const m=L.marker([t.lat,t.lon],{icon:markerIcon(t),title:`${t.number} ${t.name}`}).on('click',()=>selectTrail(t.id,{fromMap:true})).addTo(layers.pins);
      m.bindPopup(`<b>${esc(t.number)} · ${esc(t.name)}</b><br>${esc(t.region)}<br>${fmtKm(t.distanceKm)} · ${fmtMin(t.driveMin)}`);
      markers[t.id]=m;
    });
  }
  if(state.selectedTrailId){
    const id=state.selectedTrailId;
    const tr=D.tracks[id], dr=D.drives[id];
    if(state.layers.tracks) addLine(layers.tracks,tr,{color:'#ff3b30',weight:5,opacity:.95,lineCap:'round'});
    if(state.layers.drives) addLine(layers.drives,dr,{color:'#007aff',weight:5,opacity:.82,lineCap:'round'});
  } else if(!state.solo && state.layers.tracks){
    filtered.forEach(t=>{ if(D.tracks[t.id]) addLine(layers.tracks,D.tracks[t.id],{color:'#ff3b30',weight:2,opacity:.28}); });
  }
  renderContextMarkers();
}

function clearContext(){ state.selectedPoiIds=[]; state.selectedWebcamIds=[]; layers.context?.clearLayers(); layers.highlight?.clearLayers(); }
function selectTrail(id, opts={}){
  if(!byId[id]) return;
  if(state.selectedTrailId!==id) clearContext();
  state.selectedTrailId=id; state.sheetTab='overview';
  $('carouselShell').classList.remove('hidden');
  renderMap(); renderCarousel(); renderSheet(); renderJournal();
  if(opts.fromMap) centerTrail(id); else centerTrail(id, false);
}
function centerTrail(id, fit=false){
  const t=byId[id]; if(!t||!map) return;
  const pts=[]; if(D.tracks[id]) pts.push(...D.tracks[id]); if(D.drives[id]) pts.push(...D.drives[id]);
  if(fit && pts.length){ map.fitBounds(L.latLngBounds(pts),{paddingTopLeft:[28,128],paddingBottomRight:[28,190],maxZoom:14}); }
  else map.panTo([t.lat,t.lon],{animate:true,duration:.45});
}
function fitAll(){
  const pts = (state.selectedTrailId && state.solo) ? [[byId[state.selectedTrailId].lat,byId[state.selectedTrailId].lon],...(D.tracks[state.selectedTrailId]||[]),...(D.drives[state.selectedTrailId]||[])] : filtered.map(t=>[t.lat,t.lon]);
  if(pts.length) map.fitBounds(L.latLngBounds(pts),{paddingTopLeft:[30,140],paddingBottomRight:[30,190]});
}

function carouselList(){
  if(!state.selectedTrailId) return filtered;
  const a=byId[state.selectedTrailId];
  return [...filtered].sort((x,y)=>{
    if(x.id===a.id) return -1; if(y.id===a.id) return 1;
    const dx=hav(a.lat,a.lon,x.lat,x.lon), dy=hav(a.lat,a.lon,y.lat,y.lon);
    const rx=(x.region===a.region? -8:0), ry=(y.region===a.region? -8:0);
    return (dx+rx)-(dy+ry);
  }).slice(0, Math.min(filtered.length, 16));
}
function renderCarousel(){
  const root=$('carousel'); if(!root) return;
  if(!state.selectedTrailId){ root.innerHTML=''; return; }
  const list=carouselList();
  root.innerHTML=list.map(t=>cardHtml(t)).join('');
  root.querySelectorAll('.trail-card').forEach(el=>{
    el.addEventListener('click', e=>{ if(e.target.closest('button')) return; selectTrail(el.dataset.id); });
  });
  root.querySelectorAll('[data-act="detail"]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation(); openSheet('overview');}));
  root.querySelectorAll('[data-act="solo"]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation(); toggleSolo();}));
  root.querySelectorAll('[data-act="fav"]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation(); toggleFav(b.closest('.trail-card').dataset.id);}));
  const active=root.querySelector('.trail-card.active'); if(active) setTimeout(()=>active.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'}),50);
}
function cardHtml(t){
  const lev=normLevel(t.level); const active=t.id===state.selectedTrailId; const fav=state.favs.has(t.id);
  return `<article class="trail-card ${active?'active':''}" data-id="${esc(t.id)}">
    <div class="card-top"><div class="num">${esc(t.number)}</div><div class="level ${esc(lev)}">${esc(t.level||'k.A.')}</div></div>
    <h3>${esc(t.name)}</h3>
    <div class="meta"><span>${fmtKm(t.distanceKm)}</span><span>${fmt(t.duration)}</span><span>${fmtMin(t.driveMin)}</span></div>
    <div class="card-actions"><button class="pillbtn primary" data-act="detail">Details</button><button class="pillbtn" data-act="solo">${state.solo&&active?'Übersicht':'Solo'}</button><button class="pillbtn warn" data-act="fav">${fav?'★':'☆'}</button></div>
  </article>`;
}
function toggleSolo(){
  if(!state.selectedTrailId) return;
  state.solo=!state.solo; clearContext(); renderMap(); renderCarousel(); renderSheet(); fitAll(); toast(state.solo?'Solo-PR aktiv':'Gesamtkarte aktiv');
}
function toggleFav(id){ state.favs.has(id)?state.favs.delete(id):state.favs.add(id); save(); applyFilters(); renderSheet(); }

function openSheet(tab='overview'){ state.sheetTab=tab; $('detailSheet').classList.remove('hidden'); renderSheet(); }
function closeSheet(){ $('detailSheet').classList.add('hidden'); }
function renderSheet(){
  const id=state.selectedTrailId, t=byId[id], root=$('sheetContent'); if(!t){root.innerHTML=''; return;}
  root.innerHTML = `<div class="sheet-head"><div class="sheet-title"><small>${esc(t.number)} · ${esc(t.region||'Madeira')}</small><h2>${esc(t.name)}</h2></div><button class="close" id="closeSheet">×</button></div>
    <div class="seg"><button data-tab="overview">Übersicht</button><button data-tab="webcams">Webcams</button><button data-tab="pois">Sehenswürdigkeiten</button><button data-tab="drive">Anfahrt</button></div>
    <div class="facts"><div class="fact"><small>Distanz</small><b>${fmtKm(t.distanceKm)}</b></div><div class="fact"><small>Dauer</small><b>${fmt(t.duration)}</b></div><div class="fact"><small>Anfahrt</small><b>${fmtMin(t.driveMin)}</b></div><div class="fact"><small>Höhenmeter</small><b>${fmt(t.elev)} m</b></div></div>
    <div id="tabContent"></div>`;
  root.querySelector('#closeSheet').onclick=closeSheet;
  root.querySelectorAll('[data-tab]').forEach(b=>{ b.classList.toggle('active',b.dataset.tab===state.sheetTab); b.onclick=()=>{state.sheetTab=b.dataset.tab; renderSheet();}; });
  const tab=$('tabContent');
  if(state.sheetTab==='overview') tab.innerHTML=overviewHtml(t);
  if(state.sheetTab==='webcams') tab.innerHTML=contextHtml('webcam', relatedWebcams(t));
  if(state.sheetTab==='pois') tab.innerHTML=contextHtml('poi', relatedPois(t));
  if(state.sheetTab==='drive') tab.innerHTML=driveHtml(t);
  tab.querySelectorAll('[data-focus-poi]').forEach(b=>b.onclick=()=>togglePoi(b.dataset.focusPoi));
  tab.querySelectorAll('[data-focus-webcam]').forEach(b=>b.onclick=()=>toggleWebcam(b.dataset.focusWebcam));
  tab.querySelectorAll('[data-add-travel]').forEach(b=>b.onclick=()=>addTravel(b.dataset.addTravel,b.dataset.kind));
  tab.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>window.open(b.dataset.open,'_blank'));
}
function overviewHtml(t){
  return `<div class="sheet-section"><h4>Kontextnavigation</h4><p class="muted">Kachel nach oben = Details. Webcams und Sehenswürdigkeiten werden nur für den aktiven PR-Kontext eingeblendet. Beim Wechsel zum nächsten PR werden alte Kontextmarker gelöscht.</p></div>
  <div class="card-actions"><button class="pillbtn primary" onclick="window.PRX.openTab('webcams')">Webcams</button><button class="pillbtn primary" onclick="window.PRX.openTab('pois')">Sehenswürdigkeiten</button><button class="pillbtn" onclick="window.PRX.addTrailTravel()">Zur Reise</button></div>
  <div class="sheet-section"><h4>Hinweis</h4><p class="muted">${esc(t.hint||'Keine Zusatznotiz vorhanden.')}</p></div>`;
}
function driveHtml(t){
  const g=`https://www.google.com/maps/dir/?api=1&origin=${D.home.lat},${D.home.lon}&destination=${t.lat},${t.lon}&travelmode=driving`;
  return `<div class="sheet-section"><h4>Anfahrt ab ${esc(D.home.name)}</h4><p class="muted">${fmtKm(t.driveKm)} · ${fmtMin(t.driveMin)} · Zielkoordinate ${t.lat.toFixed(5)}, ${t.lon.toFixed(5)}</p></div><div class="card-actions"><button class="pillbtn primary" data-open="${g}">Google Maps</button><button class="pillbtn" onclick="window.PRX.fitSelected()">Route einpassen</button></div>`;
}
function contextHtml(kind, items){
  if(!items.length) return '<p class="muted">Keine passenden Einträge im aktuellen Datenstand.</p>';
  return `<div class="context-grid">${items.map(x=>`<div class="context-card"><div class="ct"><b>${esc(x.name)}</b><small>${esc(x.cat||x.region||'Kontext')} · ${distanceText(x)}</small></div><div class="context-actions"><button class="mini" data-focus-${kind}="${esc(x.id)}">Karte</button><button class="mini" data-add-travel="${esc(x.id)}" data-kind="${kind}">+</button>${x.url?`<button class="mini" data-open="${esc(x.url)}">Link</button>`:''}</div></div>`).join('')}</div>`;
}
function distanceText(x){ const t=byId[state.selectedTrailId]; return t?`${hav(t.lat,t.lon,x.lat,x.lon).toFixed(1).replace('.',',')} km`:'–'; }
function relatedPois(t){ return [...D.pois].sort((a,b)=>hav(t.lat,t.lon,a.lat,a.lon)-hav(t.lat,t.lon,b.lat,b.lon)).slice(0,8); }
function relatedWebcams(t){ return [...D.webcams].sort((a,b)=>hav(t.lat,t.lon,a.lat,a.lon)-hav(t.lat,t.lon,b.lat,b.lon)).slice(0,5); }
function togglePoi(id){ toggleId(state.selectedPoiIds,id); state.layers.context=true; updateLayerButtons(); renderContextMarkers(); focusContext(id,'poi'); }
function toggleWebcam(id){ toggleId(state.selectedWebcamIds,id); state.layers.context=true; updateLayerButtons(); renderContextMarkers(); focusContext(id,'webcam'); }
function toggleId(arr,id){ const i=arr.indexOf(id); i>=0?arr.splice(i,1):arr.push(id); }
function renderContextMarkers(){
  if(!layers.context) return; layers.context.clearLayers(); layers.highlight.clearLayers();
  if(!state.layers.context && !state.selectedPoiIds.length && !state.selectedWebcamIds.length) return;
  const poiIcon=L.divIcon({className:'',html:'<div class="context-marker">⌾</div>',iconSize:[30,30],iconAnchor:[15,15]});
  const camIcon=L.divIcon({className:'',html:'<div class="context-marker webcam-marker">◉</div>',iconSize:[30,30],iconAnchor:[15,15]});
  const showPois = state.selectedPoiIds.length ? D.pois.filter(p=>state.selectedPoiIds.includes(p.id)) : (state.layers.context&&state.solo&&state.selectedTrailId?relatedPois(byId[state.selectedTrailId]).slice(0,4):[]);
  const showCams = state.selectedWebcamIds.length ? D.webcams.filter(p=>state.selectedWebcamIds.includes(p.id)) : (state.layers.context&&state.solo&&state.selectedTrailId?relatedWebcams(byId[state.selectedTrailId]).slice(0,3):[]);
  showPois.forEach(p=>L.marker([p.lat,p.lon],{icon:poiIcon,title:p.name}).bindPopup(`<b>${esc(p.name)}</b><br>${esc(p.cat||'Sehenswürdigkeit')}`).addTo(layers.context));
  showCams.forEach(p=>L.marker([p.lat,p.lon],{icon:camIcon,title:p.name}).bindPopup(`<b>${esc(p.name)}</b><br>${esc(p.note||'Webcam')}`).addTo(layers.context));
}
function focusContext(id, kind){
  const arr=kind==='poi'?D.pois:D.webcams; const x=arr.find(p=>p.id===id); if(!x) return;
  map.panTo([x.lat,x.lon],{animate:true});
  L.circleMarker([x.lat,x.lon],{radius:22,color:kind==='poi'?'#007aff':'#9b59ff',weight:3,fill:false,opacity:.9}).addTo(layers.highlight);
}
function addTravel(id, kind){
  const src=kind==='poi'?D.pois:kind==='webcam'?D.webcams:trails; const x=src.find(a=>a.id===id); if(!x) return;
  if(!state.travel.find(e=>e.id===id && e.kind===kind)) state.travel.push({id,kind,name:x.name||x.number,trail:state.selectedTrailId});
  save(); renderTravel(); toast('Zur Reise-Sammlung hinzugefügt');
}

function renderJournal(){
  const root=$('journalList'); $('journalCount').textContent=`${filtered.length} Treffer`;
  root.innerHTML=filtered.map(t=>`<button class="journal-item" data-id="${esc(t.id)}"><b>${esc(t.number)} · ${esc(t.name)}</b><small>${esc(t.region)} · ${fmtKm(t.distanceKm)} · ${fmtMin(t.driveMin)} · ${esc(t.level||'k.A.')}</small></button>`).join('');
  root.querySelectorAll('button').forEach(b=>b.onclick=()=>{setMode('map');selectTrail(b.dataset.id,{fromMap:true});});
}
function renderTravel(){
  const root=$('travelList');
  if(!state.travel.length){ root.innerHTML='<div class="muted">Noch keine PRs, Webcams oder Sehenswürdigkeiten gesammelt.</div>'; return; }
  root.innerHTML=state.travel.map((e,i)=>`<div class="travel-item"><b>${esc(e.name)}</b><br><small>${esc(e.kind)}${e.trail?' · zu '+esc(e.trail):''}</small><button class="mini" data-del="${i}">Entfernen</button></div>`).join('');
  root.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{state.travel.splice(+b.dataset.del,1);save();renderTravel();});
}
function setMode(mode){
  state.mode=mode; document.querySelectorAll('.mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  $('journal').classList.toggle('hidden',mode!=='journal'); $('travelPanel').classList.toggle('hidden',mode!=='travel');
  if(mode==='journal') renderJournal(); if(mode==='travel') renderTravel();
}
function updateLayerButtons(){
  document.querySelectorAll('[data-base]').forEach(b=>b.classList.toggle('active',b.dataset.base===state.base));
  document.querySelectorAll('[data-layer]').forEach(b=>b.classList.toggle('active',!!state.layers[b.dataset.layer]));
}
function setBase(base){ if(activeBase) map.removeLayer(activeBase); state.base=base; activeBase=bases[base].addTo(map); updateLayerButtons(); }

function bind(){
  $('fitBtn').onclick=fitAll; $('locateBtn').onclick=()=>map.locate({setView:true,maxZoom:14});
  $('layerBtn').onclick=()=>$('layerPanel').classList.toggle('hidden'); $('closeLayers').onclick=()=>$('layerPanel').classList.add('hidden');
  $('searchBtn').onclick=()=>$('searchPanel').classList.toggle('hidden'); $('closeSearch').onclick=()=>$('searchPanel').classList.add('hidden');
  $('searchInput').oninput=e=>{state.query=e.target.value; applyFilters();};
  document.querySelectorAll('.filter-chip[data-filter="level"]').forEach(b=>b.onclick=()=>{state.level=b.dataset.value;document.querySelectorAll('.filter-chip[data-filter="level"]').forEach(x=>x.classList.toggle('active',x===b));applyFilters();fitAll();});
  document.querySelector('.filter-chip[data-filter="fav"]').onclick=e=>{state.onlyFav=!state.onlyFav;e.currentTarget.classList.toggle('active',state.onlyFav);applyFilters();};
  document.querySelectorAll('[data-base]').forEach(b=>b.onclick=()=>setBase(b.dataset.base));
  document.querySelectorAll('[data-layer]').forEach(b=>b.onclick=()=>{const k=b.dataset.layer; state.layers[k]=!state.layers[k]; updateLayerButtons(); renderMap();});
  document.querySelectorAll('.mode').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
  $('closeTravel').onclick=()=>setMode('map');
  $('sheetHandle').onclick=()=>openSheet('overview'); $('sheetGrip').onclick=closeSheet;
}

window.PRX={
  openTab(tab){ openSheet(tab); },
  addTrailTravel(){ if(state.selectedTrailId) addTravel(state.selectedTrailId,'trail'); },
  fitSelected(){ if(state.selectedTrailId) centerTrail(state.selectedTrailId,true); }
};

function boot(){ initMap(); bind(); applyFilters(); updateLayerButtons(); if('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(()=>{}); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
