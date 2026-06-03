/* PR Explorer · V3.1.1 Clean Layer Reset Module */
(function(){
'use strict';

const PRX_VERSION='V3.1.1';
const KEY_STATE='prx310_state';
const KEY_AUDIT='prx310_audit';
const KEY_SETTINGS='prx310_settings';

const SIMPLIFICA_URL='https://simplifica.madeira.gov.pt/services/78-82-259/start';
const IFCN_STATUS_URL='https://ifcn.madeira.gov.pt/en/atividades-de-natureza/percursos-pedestres-recomendados/percursos-pedestres-recomendados.html';
const SCHMALE_PFADE_ALL='https://www.schmale-pfade.de/alle-offiziellen-wanderungen-auf-madeira-mit-gps/';
const SCHMALE_PFADE_KNOWN={
  'PR 1':'https://www.schmale-pfade.de/pico-do-arieiro-zum-pico-ruivo-pr-1/',
  'PR1':'https://www.schmale-pfade.de/pico-do-arieiro-zum-pico-ruivo-pr-1/',
  'PR 9':'https://www.schmale-pfade.de/caldeirao-verde-und-inferno-der-gruene-kessel/',
  'PR9':'https://www.schmale-pfade.de/caldeirao-verde-und-inferno-der-gruene-kessel/'
};

function $(s,r=document){return r.querySelector(s);}
function $$(s,r=document){return Array.from(r.querySelectorAll(s));}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function uid(p='id'){return p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);}
function n(v,d=0){const x=Number(v);return Number.isFinite(x)?x:d;}
function todayKey(){return new Date().toISOString().slice(0,10);}
function minTxt(min){min=Math.round(n(min,0));const h=Math.floor(min/60),m=min%60;return h?`${h} h ${String(m).padStart(2,'0')} min`:`${m} min`;}
function kmTxt(k){return `${n(k,0).toFixed(1).replace('.',',')} km`;}
function normId(id){return String(id||'').trim().replace(/_/g,'.').replace(/\s+/g,' ').toUpperCase();}
function data(){return Array.isArray(window.PR_DATA)?window.PR_DATA:(Array.isArray(window.DATA)?window.DATA:[]);}
function prNum(pr){return normId(pr?.id||pr?.num||pr?.nummer||'').replace(/^PR(\d)/,'PR $1');}
function prName(pr){return pr?.name||pr?.title||pr?.bezeichnung||prNum(pr);}
function prLat(pr){return n(pr?.lat??pr?.start_lat??pr?.start?.[0],NaN);}
function prLon(pr){return n(pr?.lon??pr?.start_lon??pr?.start?.[1],NaN);}
function prDriveKm(pr){return n(pr?.drive_km??pr?.driveKm,0);}
function prDriveMin(pr){return n(pr?.drive_min??pr?.driveMin,0);}
function prDurMin(pr){return n(pr?.dur_min??pr?.duration_min??pr?.durationMin??pr?.hikeMin??pr?.duration,0);}
function readJSON(k,f){try{return JSON.parse(localStorage.getItem(k)||'null')??f;}catch(e){return f;}}
function writeJSON(k,v){localStorage.setItem(k,JSON.stringify(v));}

function defaultState(){
 return {version:PRX_VERSION,settings:{zoomSliderEnabled:false,bottomSheetOpacity:.88,fuelConsumptionL100:6.5,mountainCorrectionPercent:30,fuelPrice:1.9,homeName:'Pestana Promenade',homeLat:32.63761,homeLon:-16.93679},pr:{},ideas:[],customRoutes:[],dayPlans:[],sortEditMode:false};
}
function state(){const s=Object.assign(defaultState(),readJSON(KEY_STATE,{}));s.settings=Object.assign(defaultState().settings,s.settings||{},readJSON(KEY_SETTINGS,{}));s.pr||={};s.ideas||=[];s.customRoutes||=[];s.dayPlans||=[];return s;}
function saveState(s){s.version=PRX_VERSION;writeJSON(KEY_STATE,s);writeJSON(KEY_SETTINGS,s.settings||{});applySettings();}
function toast(t){let el=$('#prx310-toast');if(!el){el=document.createElement('div');el.id='prx310-toast';document.body.appendChild(el);}el.textContent=t;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2300);}

function applySettings(){
 const s=state();
 document.documentElement.style.setProperty('--prx-sheet-opacity',String(s.settings.bottomSheetOpacity??.88));
 ensureZoomSlider();
}

function getMap(){return window.PRX310_MAP||window.PRX302_MAP||window.PRX301_MAP||window.map||null;}
function configureMap(){
 const map=getMap(); if(!map||map.__prx310Configured)return;
 map.__prx310Configured=true;
 try{map.doubleClickZoom?.enable();map.touchZoom?.enable();map.tap?.enable?.();}catch(e){}
 installDoubleTapFallback();
}
function installDoubleTapFallback(){
 const el=$('#map'); if(!el||el.__prx310DoubleTap)return;
 el.__prx310DoubleTap=true;
 let last=0,lastPt=null;
 function pt(e){const t=e.changedTouches?e.changedTouches[0]:e;return{x:t.clientX,y:t.clientY};}
 function zoomAt(e){const m=getMap();if(!m)return;const p=pt(e);try{const ll=m.containerPointToLatLng([p.x,p.y]);m.setZoomAround(ll,m.getZoom()+1);}catch(_){m.zoomIn();}}
 el.addEventListener('touchend',e=>{if(e.changedTouches&&e.changedTouches.length!==1)return;const now=Date.now(),p=pt(e),d=lastPt?Math.hypot(p.x-lastPt.x,p.y-lastPt.y):999;if(now-last<330&&d<42){e.preventDefault();e.stopPropagation();zoomAt(e);last=0;lastPt=null;return;}last=now;lastPt=p;},{capture:true,passive:false});
 el.addEventListener('dblclick',e=>{e.preventDefault();e.stopPropagation();zoomAt(e);},{capture:true,passive:false});
}

function ensureZoomSlider(){
 $$('#prx301-zoom-slider,#prx302ZoomSlider,#prx303ZoomSlider,#prx305DockBg').forEach(x=>x.remove());
 const s=state();
 let z=$('#prx310ZoomSlider');
 if(!s.settings.zoomSliderEnabled){z?.remove();return;}
 if(!z){
  z=document.createElement('div');z.id='prx310ZoomSlider';
  z.innerHTML='<button type="button" data-z="+">+</button><input type="range" min="8" max="18" step="1"><button type="button" data-z="-">−</button>';
  document.body.appendChild(z);
  z.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const m=getMap();if(!m)return;b.dataset.z==='+'?m.zoomIn():m.zoomOut();const i=$('input',z);if(i)i.value=m.getZoom();});
  $('input',z).addEventListener('input',e=>{const m=getMap();if(m)m.setZoom(Number(e.target.value));});
 }
 const m=getMap(),i=$('input',z);if(m&&i)i.value=m.getZoom();
}

function ensureTools(){
 let t=$('#prx310-tools'); if(t)return;
 t=document.createElement('div');t.id='prx310-tools';
 t.innerHTML='<button type="button" data-open="roadmap">Roadmap</button><button type="button" data-open="audit">Audit</button><button type="button" data-open="settings">V3</button>';
 document.body.appendChild(t);
 t.addEventListener('click',e=>{const k=e.target.closest('button')?.dataset.open;if(k==='roadmap')openRoadmap();if(k==='audit')openAudit();if(k==='settings')openSettings();});
}

function closeOverlay(){$('#prx310-overlay')?.remove();}
function overlay(title,sub='',tabs=''){
 closeOverlay();
 const o=document.createElement('div');o.id='prx310-overlay';
 o.innerHTML=`<section class="prx310-sheet"><div class="prx310-head"><div><b>${esc(title)}</b><small>${esc(sub)}</small></div><button type="button" class="prx310-x">×</button></div>${tabs}<div class="prx310-body" id="prx310Body"></div></section>`;
 document.body.appendChild(o);
 $('.prx310-x',o).onclick=closeOverlay;
 return $('#prx310Body',o);
}

function openSettings(){
 const s=state(),b=overlay('V3.1 Einstellungen','Clean Layer Reset · Darstellung · Planung');
 b.innerHTML=`<div class="prx310-card">
  ${toggleRow('Zoomslider anzeigen','zoomSliderEnabled',!!s.settings.zoomSliderEnabled)}
  ${rangeRow('Bottom-Sheet Transparenz','bottomSheetOpacity',Math.round((s.settings.bottomSheetOpacity??.88)*100),70,100,'%')}
  ${inputRow('Basisverbrauch l/100 km','fuelConsumptionL100',s.settings.fuelConsumptionL100,'number')}
  ${rangeRow('Madeira-Bergkorrektur','mountainCorrectionPercent',s.settings.mountainCorrectionPercent??30,0,60,'%')}
  ${inputRow('Kraftstoffpreis €/l','fuelPrice',s.settings.fuelPrice,'number')}
  <p style="color:rgba(240,250,248,.62);font-size:12px">Standard Madeira: +30 %. Safe-Area-Overlays sind in V3.1.0 deaktiviert.</p>
 </div>`;
 b.addEventListener('input',e=>{const key=e.target.dataset.key;if(!key)return;const st=state();let val=e.target.type==='checkbox'?e.target.checked:e.target.value;if(key==='bottomSheetOpacity'){st.settings[key]=Number(val)/100;const out=e.target.parentElement.querySelector('output');if(out)out.textContent=val+'%';}else if(['fuelConsumptionL100','mountainCorrectionPercent','fuelPrice'].includes(key)){st.settings[key]=Number(val);const out=e.target.parentElement.querySelector('output');if(out)out.textContent=val+(e.target.dataset.unit||'');}else st.settings[key]=val;saveState(st);});
}
function inputRow(label,key,val,type='text'){return `<label class="prx310-field"><span>${esc(label)}</span><input data-key="${key}" type="${type}" value="${esc(val)}" step="0.01"></label>`;}
function toggleRow(label,key,val){return `<label class="prx310-switch"><span>${esc(label)}</span><input data-key="${key}" type="checkbox" ${val?'checked':''}></label>`;}
function rangeRow(label,key,val,min,max,unit){return `<label class="prx310-field"><span>${esc(label)} <output>${esc(val)}${unit}</output></span><input data-key="${key}" data-unit="${unit}" type="range" min="${min}" max="${max}" value="${esc(val)}"></label>`;}

const AUDIT_SECTIONS=[
 ['A','App-Start & Grundlayout',['App startet ohne Fehlermeldung','Topo-Karte wird geladen','PR-Pins werden angezeigt','Home-/Hotel-PIN wird angezeigt','Keine störende Overlay-Fläche über Navigation','Safe-Area stört Bedienung nicht','Stabil nach App-Wechsel']],
 ['B','Karte & Gestensteuerung',['Ein-Finger-Verschieben funktioniert','Pinch-Zoom funktioniert','Doppeltippen zoomt hinein','Route einpassen ohne Abschneiden','Zoomslider aktivierbar','Zoomslider bedienbar','Zoomslider deaktivierbar']],
 ['C','Bottom-Sheets & Overlays',['Sheets öffnen zuverlässig','Sheets schließen zuverlässig','Kein Exportdialog beim Schließen','Keine Pseudo-Overlays sichtbar','Teilen/Kopieren bleibt über Export möglich','Transparenz wirkt sichtbar','Text bleibt lesbar']],
 ['D','Einstellungen',['Einstellungen öffnen/schließen','Schalter bedienbar','Zoomslider-Schalter vorhanden','Transparenz-Slider vorhanden','Verbrauch/Bergkorrektur/Kraftstoffpreis speicherbar']],
 ['E','PR-Pins & Detailseite',['Pin öffnet Detailseite','Journal-Kachel öffnet Detailseite','Solo-Kartenbutton bleibt separat','Nahegelegene PRs sichtbar','SIMplifica/Schmale-Pfade-Link vorhanden']],
 ['F','Roadmap & Export',['Roadmap öffnet','Ideenliste öffnet','GPX-Import öffnet','Export-ZIP funktioniert','Audit kopierbar']]
];
function auditDefaults(){const o={meta:{version:PRX_VERSION,createdAt:new Date().toISOString()},items:{},notes:''};AUDIT_SECTIONS.forEach(([p,c,a])=>a.forEach((title,i)=>{const id=p+String(i+1).padStart(2,'0');o.items[id]={cat:c,title,status:'',note:''};}));return o;}
function audit(){return Object.assign(auditDefaults(),readJSON(KEY_AUDIT,{}));}
function saveAudit(a){writeJSON(KEY_AUDIT,a);}
function openAudit(){
 const a=audit(),b=overlay(`Audit ${PRX_VERSION}`,'Clean Layer Reset');
 let html='';
 AUDIT_SECTIONS.forEach(([p,c,arr])=>{html+=`<h3>${p}. ${esc(c)}</h3>`;arr.forEach((title,i)=>{const id=p+String(i+1).padStart(2,'0'),it=a.items[id]||{};html+=`<div class="prx310-audit-item" data-id="${id}"><label><b>${id}</b> ${esc(title)}</label><div class="prx310-status-row">${['✓','✗','!','—'].map(v=>`<button type="button" class="${it.status===v?'on':''}" data-status="${v}">${v}</button>`).join('')}</div><textarea placeholder="Anmerkung">${esc(it.note||'')}</textarea></div>`;});});
 html+=`<h3>Sonstige Anmerkungen / Funktionswünsche</h3><textarea id="prx310AuditNotes" class="prx310-big-note">${esc(a.notes||'')}</textarea><div class="prx310-actions"><button type="button" data-act="copy">Bericht kopieren</button><button type="button" data-act="reset">Zurücksetzen</button></div>`;
 b.innerHTML=html;
 b.addEventListener('click',e=>{const st=e.target.closest('[data-status]');if(st){const box=st.closest('.prx310-audit-item'),x=audit();x.items[box.dataset.id].status=st.dataset.status;saveAudit(x);openAudit();return;}const act=e.target.closest('[data-act]')?.dataset.act;if(act==='copy')copyText(auditText());if(act==='reset'&&confirm('Audit zurücksetzen?')){saveAudit(auditDefaults());openAudit();}});
 b.addEventListener('input',e=>{const x=audit();if(e.target.id==='prx310AuditNotes'){x.notes=e.target.value;saveAudit(x);return;}const box=e.target.closest('.prx310-audit-item');if(box&&e.target.tagName==='TEXTAREA'){x.items[box.dataset.id].note=e.target.value;saveAudit(x);}});
}
function auditText(){const a=audit(),all=Object.entries(a.items);const count=s=>all.filter(([_,v])=>v.status===s).length;let txt=`PR Explorer · Audit ${PRX_VERSION}\n${new Date().toLocaleString('de-DE')}\nGesamt: ${all.filter(([_,v])=>v.status).length}/${all.length} · ✓ ${count('✓')} · ✗ ${count('✗')} · ! ${count('!')} · — ${count('—')}\n\n`;AUDIT_SECTIONS.forEach(([p,c,arr])=>{txt+=`[ ${c} ]\n`;arr.forEach((title,i)=>{const id=p+String(i+1).padStart(2,'0'),it=a.items[id]||{};txt+=`  ${it.status||'○'} ${id} ${title}\n`;if(it.note)txt+=`    → ${it.note.trim()}\n`;});txt+='\n';});if(a.notes)txt+=`[ Sonstige Anmerkungen ]\n${a.notes.trim()}\n`;return txt;}

function prState(id){const s=state(),key=normId(id);s.pr[key] ||= {dateTime:'',booked:false,fixedIFCN:false,status:'open',parkingMin:10,transferMin:0,pauseMin:45,returnWalkMin:0};saveState(s);return s.pr[key];}
function planningMetrics(pr,ps){const km=(prDriveKm(pr)||0)*2, drive=prDriveMin(pr)*2, hike=prDurMin(pr);const total=drive+n(ps.parkingMin,10)+n(ps.transferMin,0)+hike+n(ps.returnWalkMin,0)+n(ps.pauseMin,45);const s=state().settings,cons=n(s.fuelConsumptionL100,6.5)*(1+n(s.mountainCorrectionPercent,30)/100),lit=km*cons/100,cost=lit*n(s.fuelPrice,1.9);return{km,total,lit,cost};}
function hav(a,b,c,d){if(![a,b,c,d].every(Number.isFinite))return Infinity;const R=6371,tr=x=>x*Math.PI/180;const da=tr(c-a),db=tr(d-b);const x=Math.sin(da/2)**2+Math.cos(tr(a))*Math.cos(tr(c))*Math.sin(db/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}
function schmaleUrl(pr){const num=prNum(pr).replace(/\s+/g,' ');return SCHMALE_PFADE_KNOWN[num]||SCHMALE_PFADE_KNOWN[num.replace(' ','')]||SCHMALE_PFADE_ALL;}

function enhanceDetail(){
 const dc=$('#detailContent');if(!dc)return;
 if(dc.querySelector('.prx310-detail-extra'))return;
 const text=dc.textContent||'', selected=window.S?.selected?.id||'';
 const pr=data().find(p=>normId(p.id)===normId(selected)||text.includes(prName(p))||text.includes(prNum(p)));
 if(!pr)return;
 const id=prNum(pr),ps=prState(id),m=planningMetrics(pr,ps);
 const near=data().filter(x=>normId(prNum(x))!==normId(id)).map(x=>({x,d:hav(prLat(pr),prLon(pr),prLat(x),prLon(x))})).filter(o=>Number.isFinite(o.d)).sort((a,b)=>a.d-b.d).slice(0,5);
 const block=document.createElement('div');block.className='prx310-detail-extra';
 block.innerHTML=`<div class="prx310-card"><h3>V3.1 Planung</h3><label class="prx310-field"><span>Termin</span><input type="datetime-local" id="prx310Date" value="${esc(ps.dateTime||'')}"></label><div class="prx310-two"><label class="prx310-switch"><span>IFCN-fix</span><input type="checkbox" id="prx310Fixed" ${ps.fixedIFCN?'checked':''}></label><label class="prx310-switch"><span>Gebucht</span><input type="checkbox" id="prx310Booked" ${ps.booked?'checked':''} ${ps.dateTime?'':'disabled'}></label></div><p style="color:rgba(240,250,248,.62);font-size:12px"><b>Gesamt:</b> ${minTxt(m.total)} · <b>Fahrt:</b> ${kmTxt(m.km)} · <b>Sprit:</b> ${m.lit.toFixed(1).replace('.',',')} l · <b>Kosten:</b> ${m.cost.toFixed(2).replace('.',',')} €</p><div class="prx310-actions"><button type="button" data-simplifica>SIMplifica</button><a href="${esc(schmaleUrl(pr))}" target="_blank" rel="noopener">Schmale Pfade</a><a href="${IFCN_STATUS_URL}" target="_blank" rel="noopener">IFCN Status</a></div></div>${near.length?`<div class="prx310-card"><h3>Nahegelegene PRs</h3>${near.map(o=>`<button type="button" data-near="${esc(o.x.id)}"><b>${esc(prNum(o.x))}</b> · ${esc(prName(o.x))} · ${kmTxt(o.d)}</button>`).join('')}</div>`:''}`;
 dc.appendChild(block);
 $('#prx310Date',block).onchange=e=>{const s=state(),key=normId(id);s.pr[key]=Object.assign(prState(id),{dateTime:e.target.value,booked:prState(id).booked&&!!e.target.value});saveState(s);};
 $('#prx310Fixed',block).onchange=e=>{const s=state(),key=normId(id);s.pr[key]=Object.assign(prState(id),{fixedIFCN:e.target.checked});saveState(s);};
 $('#prx310Booked',block).onchange=e=>{const s=state(),key=normId(id);s.pr[key]=Object.assign(prState(id),{booked:e.target.checked});saveState(s);};
 $('[data-simplifica]',block).onclick=()=>window.open(SIMPLIFICA_URL,'_blank','noopener');
 $$('[data-near]',block).forEach(btn=>btn.onclick=()=>window.openDetail?.(btn.dataset.near,true));
}

function patchJournalCards(){
 $$('.pr-card').forEach(card=>{
  card.classList.add('pr-card-v310');
  $$('.chevron',card).forEach(x=>x.remove());
  if(card.__prx310)return;card.__prx310=true;
  card.addEventListener('click',e=>{if(e.target.closest('.card-map-btn,button,a,input,select,textarea'))return;const tag=$('.pr-tag',card),id=tag?tag.textContent.trim():'';if(id&&typeof window.openDetail==='function'){try{window.openDetail(id,true);}catch(err){console.error(err);alert('Detailansicht konnte nicht geöffnet werden: '+(err?.message||err));}}},false);
 });
}

function openRoadmap(){
 const tabs='<div class="prx310-tabs"><button class="on" data-tab="days">Reiseliste</button><button data-tab="ideas">Ideen</button><button data-tab="gpx">GPX</button><button data-tab="export">Export</button></div>';
 const b=overlay('Roadmap V3.1','Clean Layer Reset',tabs);
 $('#prx310-overlay .prx310-tabs').onclick=e=>{const btn=e.target.closest('button');if(!btn)return;$$('#prx310-overlay .prx310-tabs button').forEach(x=>x.classList.toggle('on',x===btn));renderRoadmap(btn.dataset.tab);};
 renderRoadmap('days');
}
function renderRoadmap(tab){
 const b=$('#prx310Body'),s=state();if(!b)return;
 if(tab==='days'){const totals=tripTotals(s);b.innerHTML=`<div class="prx310-kpis"><div><b>${kmTxt(totals.km)}</b><small>km</small></div><div><b>${totals.lit.toFixed(1).replace('.',',')} l</b><small>Sprit</small></div><div><b>${totals.cost.toFixed(2).replace('.',',')} €</b><small>Kosten</small></div></div>${s.dayPlans.map(d=>`<div class="prx310-card"><h3>${esc(d.date)}</h3>${(d.items||[]).map(it=>`<div class="prx310-plan-item"><div>•</div><div><b>${esc(it.id)}</b><small>${esc(it.type)}</small></div></div>`).join('')||'<small>leer</small>'}</div>`).join('')||'<p>Noch keine Tagesplanung.</p>'}`;}
 if(tab==='ideas'){b.innerHTML=`<div class="prx310-card"><h3>Neue Idee</h3>${inputRow('Titel','title','','text')}${inputRow('Kategorie','category','Aussichtspunkt','text')}${inputRow('Dauer min','durationMin',60,'number')}<button type="button" data-add-idea>Idee speichern</button></div>${s.ideas.map(i=>`<div class="prx310-plan-item"><div>💡</div><div><b>${esc(i.title)}</b><small>${esc(i.category)} · ${minTxt(i.durationMin)}</small></div></div>`).join('')}`;b.onclick=e=>{if(e.target.closest('[data-add-idea]')){const obj={id:uid('EXT'),title:$('[data-key="title"]',b).value,category:$('[data-key="category"]',b).value,durationMin:Number($('[data-key="durationMin"]',b).value)||60};const st=state();st.ideas.push(obj);saveState(st);renderRoadmap('ideas');}};}
 if(tab==='gpx'){b.innerHTML=`<div class="prx310-card"><h3>GPX importieren</h3><input id="prx310Gpx" type="file" accept=".gpx,application/gpx+xml,text/xml"></div>${s.customRoutes.map(r=>`<div class="prx310-plan-item"><div>🧭</div><div><b>${esc(r.name)}</b><small>${kmTxt(r.distanceKm)} · ↑ ${Math.round(r.eleGainM||0)} m</small></div></div>`).join('')}`;$('#prx310Gpx',b).onchange=e=>importGpx(e.target.files?.[0]);}
 if(tab==='export'){b.innerHTML=`<div class="prx310-card"><h3>Export</h3><button type="button" data-json>JSON exportieren</button></div>`;b.onclick=e=>{if(e.target.closest('[data-json]'))download('prx_trip_data_v3_1_0.json',JSON.stringify(exportData(),null,2),'application/json');};}
}
function tripTotals(s){let km=0,lit=0,cost=0;(s.dayPlans||[]).forEach(d=>(d.items||[]).forEach(it=>{if(it.type==='pr'){const pr=data().find(p=>normId(prNum(p))===normId(it.id)||normId(p.id)===normId(it.id));if(pr){const m=planningMetrics(pr,prState(it.id));km+=m.km;lit+=m.lit;cost+=m.cost;}}}));return{km,lit,cost};}
function importGpx(file){if(!file)return;const r=new FileReader();r.onload=()=>{const txt=String(r.result||''),doc=new DOMParser().parseFromString(txt,'application/xml'),pts=$$('trkpt',doc).map(p=>({lat:Number(p.getAttribute('lat')),lon:Number(p.getAttribute('lon')),ele:Number($('ele',p)?.textContent||NaN)})).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon));let dist=0,gain=0;for(let i=1;i<pts.length;i++){dist+=hav(pts[i-1].lat,pts[i-1].lon,pts[i].lat,pts[i].lon);const de=pts[i].ele-pts[i-1].ele;if(Number.isFinite(de)&&de>0)gain+=de;}const s=state();s.customRoutes.push({id:uid('GPX'),name:file.name.replace(/\.gpx$/i,''),fileName:file.name,distanceKm:dist,eleGainM:gain,pointCount:pts.length});saveState(s);renderRoadmap('gpx');};r.readAsText(file);}
function exportData(){const s=state();return{version:PRX_VERSION,exportedAt:new Date().toISOString(),settings:s.settings,pr:s.pr,ideas:s.ideas,dayPlans:s.dayPlans,customRoutes:s.customRoutes,totals:tripTotals(s)};}
function download(name,text,type='text/plain;charset=utf-8'){const a=document.createElement('a'),blob=new Blob([text],{type});a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500);}
function copyText(txt){navigator.clipboard?.writeText(txt).then(()=>toast('Kopiert')).catch(()=>{const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast('Kopiert');});}

function cleanupLegacyLayers(){
 $$('#prx305DockBg,#prx306SafeBg,#prx304SafeBg,#prx301-zoom-slider,#prx302ZoomSlider').forEach(x=>x.remove());
 document.documentElement.classList.add('prx310-clean');
}

function boot(){
 cleanupLegacyLayers();
 applySettings();
 ensureTools();
 configureMap();
 patchJournalCards();
 enhanceDetail();
 const mo=new MutationObserver(()=>{cleanupLegacyLayers();ensureTools();configureMap();patchJournalCards();enhanceDetail();});
 mo.observe(document.body,{childList:true,subtree:true});
 setInterval(()=>{cleanupLegacyLayers();ensureZoomSlider();patchJournalCards();},1500);
 window.PRX310={version:PRX_VERSION,state,saveState,openAudit,openRoadmap,openSettings};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

})();


/* PR Explorer · V3.1.1 HUD Scope Runtime
   Ziel: Map-HUD nur anzeigen, wenn die Karte wirklich frei ist.
*/
(function(){
  'use strict';

  function qs(s,r=document){ return r.querySelector(s); }
  function qsa(s,r=document){ return Array.from(r.querySelectorAll(s)); }

  function isVisible(el){
    if(!el) return false;
    const cs = getComputedStyle(el);
    if(cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 2 && r.height > 2;
  }

  function hasOpenV3Overlay(){
    return !!qs('#prx310-overlay');
  }

  function hasOpenSettings(){
    const el = qs('.settings-panel');
    if(!el) return false;
    return isVisible(el) && !el.classList.contains('hidden');
  }

  function hasOpenPanel(){
    const candidates = qsa('.panel,.panel-detail,.filter-panel,.sheet,.modal,.drawer');
    return candidates.some(el => {
      if(el.id === 'bottomNav') return false;
      if(el.id === 'prx310-tools') return false;
      if(el.id === 'prx310ZoomSlider') return false;
      if(el.classList.contains('hidden')) return false;
      if(el.closest('#bottomNav')) return false;
      return isVisible(el);
    });
  }

  function activeNavKey(){
    const active = qs('#bottomNav .active,.bnav .active,.nav-item.active,[data-tab].active');
    const txt = (active && active.textContent || '').trim().toLowerCase();
    if(txt.includes('karte')) return 'karte';
    if(txt.includes('übersicht')) return 'overview';
    if(txt.includes('journal')) return 'journal';
    if(txt.includes('reisen')) return 'reisen';
    if(txt.includes('option')) return 'optionen';
    return '';
  }

  function isMapFree(){
    if(hasOpenV3Overlay()) return false;
    if(hasOpenSettings()) return false;
    if(hasOpenPanel()) return false;

    const nav = activeNavKey();
    if(nav && nav !== 'karte') return false;

    // Fallback: if the map exists and no blocking panels exist, treat it as free.
    return !!qs('#map');
  }

  function applyHudScope(){
    const free = isMapFree();
    document.documentElement.classList.toggle('prx311-map-free', free);
    document.documentElement.classList.toggle('prx311-hud-hidden', !free);
    document.documentElement.classList.toggle('prx311-panel-open', !free);

    const z = qs('#prx310ZoomSlider');
    if(z){
      z.style.pointerEvents = free ? 'auto' : 'none';
    }
    const t = qs('#prx310-tools');
    if(t){
      t.style.pointerEvents = free ? 'auto' : 'none';
    }
  }

  function boot(){
    applyHudScope();
    const mo = new MutationObserver(applyHudScope);
    mo.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['class','style','aria-hidden'] });
    window.addEventListener('resize', applyHudScope, { passive:true });
    window.addEventListener('orientationchange', () => setTimeout(applyHudScope, 250), { passive:true });
    document.addEventListener('click', () => setTimeout(applyHudScope, 80), true);
    document.addEventListener('touchend', () => setTimeout(applyHudScope, 80), true);
    setInterval(applyHudScope, 1000);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.PRX311_applyHudScope = applyHudScope;
})();
