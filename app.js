/* ============================================================
   PR Explorer · app.js · Midnight Teal Pro
   V3.2.2: Navigations- und Rückweg-Logik
   ============================================================ */
'use strict';

const qs  = s => document.querySelector(s);
const qsa = s => [...document.querySelectorAll(s)];

const APP_VERSION = 'V3.2.2';
const APP_CHANGELOG = [
  { version:'V3.2.2', date:'2026-06-03', title:'Navigations- und Rückweg-Logik', changes:[
    'Interner Rückweg für Journal → Detail → Karte/Solo ergänzt.',
    'Detailansicht erhält Kopfzeile mit Zurück und Auf-Karte-zeigen.',
    'Solo-Kartenmodus erhält eine kleine Kartenleiste mit Zurück und Alle anzeigen.',
    'Bottom-Navigation setzt bewusst neue Hauptbereiche und zerstört keine Detail-Rückwege mehr unkontrolliert.',
    'Keine Safe-Area-, Bottom-Dock-, Overlay- oder Floating-HUD-Änderungen.'
  ]},
  { version:'V3.2.1', date:'2026-06-03', title:'Sheet- und Kartenstil-Fix', changes:[
    'Zweilagige Bottom-Sheet-Wirkung reduziert: äußere Sheets clippen, innere Inhalte scrollen sauber innerhalb der Rundung.',
    'Schließen-X in Sheet-Headern einheitlicher nach rechts ausgerichtet.',
    'Externe Aktivitäten typografisch an PR-Karten angenähert: Titel semibold, Metadaten gedimmt, Aktionen weniger dominant.',
    'Keine Safe-Area-, Bottom-Dock-, Overlay- oder Floatingbutton-Änderungen.'
  ]},
  { version:'V3.2.0', date:'2026-06-03', title:'UI-Flächen-Rebuild', changes:[
    'Alle aktiven prx-v*-Zusatzmodule entfernt; index.html lädt nur noch style.css, pr-data.js und app.js.',
    'Roadmap bleibt in der vorhandenen Seite Reisen; kein Roadmap-Floatingbutton mehr.',
    'Audit/Test wird in Optionen verankert; kein Test-Floatingbutton mehr.',
    'V3-/Planungseinstellungen werden in Optionen verankert; kein V3-Floatingbutton mehr.',
    'Zoomslider wird als echtes Karten-Control direkt in app.js erzeugt und nur auf der Karte angezeigt.',
    'Keine nachträglichen Sheet-Injektionen, keine transparenten Bedienlayer, keine body::before/body::after-Overlays.'
  ]},
  { version:'V3.1.1', date:'2026-06-03', title:'HUD-Scope-Fix', changes:[
    'Roadmap/Audit/V3-Entwicklungs-HUD wird nur noch auf der freien Kartenansicht angezeigt.',
    'Zoomslider wird nur noch angezeigt, wenn Karte aktiv, Zoomslider aktiviert und kein Panel/Sheet/Detail/Filter/Einstellungen offen ist.',
    'Filter-FAB und Testbutton werden bei geöffneten Panels/Sheets ausgeblendet.',
    'Keine erneuten Safe-Area- oder Bottom-Dock-Experimente; V3.1.1 ändert ausschließlich Sichtbarkeit und Layer-Scope der HUD-Elemente.'
  ]},
  { version:'V3.1.0', date:'2026-06-03', title:'Clean Layer Reset', changes:[
    'Alle experimentellen V3.0.x-Safe-Area-/Dock-/Overlay-Hotfixdateien aus dem aktiven Upload-Paket entfernt.',
    'Z-Index-Architektur zentral neu definiert: Map, Controls, Bottom-Nav, Zusatzbuttons, Panels, Settings, Modals, Toasts.',
    'Pseudo-Overlays wie body::after, #prx305DockBg und Safe-Area-Docks werden aktiv verboten.',
    'Bottom-Navigation bleibt bestehend, aber ohne überlagernde Fremdebenen.',
    'V3-Zusatzfunktionen Roadmap, Audit, V3-Einstellungen, Zoomslider und Journal-Fix werden in einem sauberen Modul neu geladen.',
    'Service Worker cached nur die aktiven V3.1.0-Dateien.'
  ]},
  { version:'V3.0.3', date:'2026-06-03', title:'Detail-, Audit-Export-, Zoomslider- und Viewport-Hotfix', changes:[
    'Doppelter Zoomslider beseitigt: alter V3.0.1/3.0.2-Slider wird beim Aktivieren entfernt; es bleibt nur ein sauberer vertikaler Slider mit + oben und − unten.',
    'Audit/Test-Schließen blockiert nicht mehr durch Export-/Kopierdialog: Export läuft nur noch über eine ausdrücklich gedrückte Export-Aktion, Schließen bleibt Schließen.',
    'Viewport-/Safe-Area-Fix verschärft: App-Root, Karte, Panels und Bottom-Navigation werden auf 100dvh und bottom:0 gezwungen.',
    'Journal-Kacheln repariert: ganze PR-Kachel öffnet wieder die Detailansicht; der kleine Pfeil wird ausgeblendet.',
    'Weiße Seite beim Öffnen aus Journal/Listen durch stabilere Detailöffnung und Fehlerfang entschärft.'
  ]},
  { version:'V3.0.2', date:'2026-06-03', title:'Audit-, Roadmap- und Bedienfixes nach Praxistest', changes:[
    'Alter Funktionstest auf erweiterten Audit-Umfang umgestellt; dadurch erzeugt auch der alte Test-Export keinen 0/18-Altbericht mehr.',
    'Kopierbutton oben rechts im Test-/Auditkopf entfernt; Export/Kopieren bleibt über Teilen bzw. Export-Aktion verfügbar.',
    'iPhone-Viewport und untere Safe-Area nochmals verschärft: Bottom-Navigation und Panels dürfen den unteren Displaybereich nicht mehr unnötig freilassen.',
    'Doppeltipp-Zoom zusätzlich über eigenen Touch-Fallback abgesichert.',
    'Zoomslider-Schalter in den normalen Einstellungen sichtbar ergänzt; V3-Zusatzmenü bleibt erhalten.',
    'Detailseite: nahegelegene PRs, SIMplifica, Schmale Pfade und Status-/Buchungsblock werden stabiler nachgerendert.',
    'Journal-Liste: PIN-/Status-Layout korrigiert und Suchfeld stabilisiert.',
    'Roadmap-Export bereinigt verwaiste Tagesplan-Einträge und schreibt UTF-8-Dateinamen im ZIP korrekt.'
  ]},
  { version:'V3.0.1', date:'2026-06-02', title:'Integrierte Roadmap-, Audit- und Planungsarchitektur', changes:[
    'V3.0.1 direkt in die aktuelle app.js-/style.css-/service-worker.js-Struktur eingebunden; keine app-claude-v21-Abhängigkeit mehr.',
    'Audit-Rapport V3 ergänzt: strukturierte Prüffragen nach App-Start, Karte, Bottom-Sheets, Einstellungen, Detailseite, Kalender, Status, Reiseliste, Journal, externen Unternehmungen, GPX, Export und Persistenz.',
    'Roadmap-Erweiterung ergänzt: Reiseliste mit editierbaren Ideen, externen Unternehmungen, freien GPX-Routen, Tageszuordnung und ZIP-Exportpaket für ChatGPT-Roadmap.',
    'Detailseiten erweitert: Termin/Buchung/IFCN-fix, Statusprüfung, SIMplifica-Chrome-Link, Schmale-Pfade-Zusatzlink, nahegelegene PRs und Planungskennwerte.',
    'Einstellungen ergänzt: Bottom-Sheet-Transparenz, Zoomslider, Verbrauch, Madeira-Bergkorrektur, Kraftstoffpreis und Home-PIN-Parameter.',
    'iPhone-/PWA-Cache aktualisiert: Cache-Version, Asset-Liste und Query-Strings auf V3.0.1 umgestellt.'
  ]},
  { version:'V2.5.8', date:'2026-06-02', title:'Reiseplan-Grundsystem', changes:[
    'Reiseplan-Ansicht aus dem Reisezeitraum ergänzt: jeder Urlaubstag wird als eigene Tageskarte mit geplanten PRs, gebuchten IFCN-Terminen und externen Unternehmungen dargestellt.',
    'Favoriten ohne Termin werden separat als Planungsrückstand angezeigt und können direkt einem Reisetag mit 30-Minuten-Zeitfenster zugeordnet werden.',
    'Externe Unternehmungen lassen sich lokal anlegen: Titel, Kategorie, Status, Datum, Uhrzeit, Dauer, Fahrzeit, Link und optionale Koordinaten.',
    'Reiseplan-Daten werden lokal gespeichert und können als JSON exportiert werden; der Reiseplan ist bewusst unabhängig von Google/Instagram und nutzt Links nur als Referenz.',
    'Statuslogik für Reiseelemente ergänzt: Idee, Favorit, geplant, gebucht, erledigt und verworfen.'
  ]},
  { version:'V2.5.7', date:'2026-06-02', title:'POI-, Kalender- und Linien-Regression-Fix', changes:[
    'Concelhos-Grenzen aus der App-UI entfernt und als Layer deaktiviert; die unsauberen Platzhalter-Polygone werden nicht mehr gezeichnet.',
    'POI-Darstellung bereinigt: transparente Markerhülle, editierbare POI-Größe, Google-Maps-Übergabe und Radiusmodus um den aktiven PR.',
    'Kalenderfelder auf iOS-robuste Datum/Uhrzeit-Steuerung mit Stundenwahl und 30-Minuten-Raster umgestellt.',
    'IFCN-Termin berechnet die Abfahrt am Hotel aus Fahrzeit, Korrekturfaktor, Parkplatzpuffer und Wegzeit zum PR-Start.',
    'ICS-Export nutzt die berechnete Hotel-Abfahrt und enthält zwei editierbare Erinnerungen.',
    'Konturbreiten für GPX und KML sind wieder einstellbar; Sortierung ist im Filter-Sheet wieder sichtbar.',
    'Teilen-Button öffnet eine Auswahl für Audit, gefilterte PR-Liste sowie aktive PR-Info/GPX/KML.'
  ]},
  { version:'V2.5.6', date:'2026-06-02', title:'Render-Fix für Filter- und Einstellungsinhalte', changes:[
    'Fehlende HTML-Escape-Hilfsfunktion ergänzt; Home-PIN und Einstellungsfelder können dadurch nicht mehr den Settings-Aufbau abbrechen.',
    'Filter-Rendering defensiv gemacht: fehlende Container, leere Datenmengen und alte localStorage-Grenzwerte werden abgefangen.',
    'Fehlerkarten zeigen jetzt die technische Kurzursache an, damit iPhone-Prüfungen nicht mehr blind enden.',
    'Initialisierung ruft Filter/Settings nicht mehr ungeprüft auf; Panels rendern erst beim Öffnen stabil nach.'
  ]},
  { version:'V2.5.4', date:'2026-06-01', title:'Notfall-Fix Button-Capture für Filter und Einstellungen', changes:[
    'Filter- und Einstellungsbutton werden zusätzlich in der Capture-Phase abgefangen, bevor Leaflet oder Map-Click eingreifen können.',
    'Direkte HTML-Fallbacks für Filter, Einstellungen, Schließen und Reset ergänzt.',
    'Filter- und Settings-Panel öffnen zuerst sichtbar und zeigen bei Renderfehlern eine Fehlerkarte statt still zu scheitern.',
    'iOS-Touchhandling für kritische App-Buttons mit pointerdown, touchstart und click abgesichert.'
  ]},
  { version:'V2.5.3', date:'2026-06-01', title:'Regression-Fix Panels & Detailmodus', changes:[
    'Filter- und Einstellungsbutton erhalten eine robuste iOS-Touchbindung mit Stop-Propagation.',
    'Detailmodus blendet bewusst alle nicht aktiven PR-Pins aus; der ausgewählte Pin bleibt sichtbar markiert.',
    'Statusänderungen rendern den aktiven Detail-Pin nach Layer-Neuaufbau stabil nach.',
    'Veralteter Wisch-Hinweis im Detail-Panel und im Audit wurde entfernt.'
  ]},
  { version:'V2.5.2', date:'2026-06-01', title:'Stabilisierung Maschinenraum, Cache und iOS-Bedienung', changes:[
    'Repository bereinigt: aktive Dateien heißen jetzt app.js und style.css; alte Versionsduplikate wurden aus dem Auslieferungsstand entfernt.',
    'Service Worker, Manifest, App-Version, Changelog und HTML sind auf einen eindeutigen Stand synchronisiert.',
    'Kartenwechsel entfernt Hybrid-Labels zuverlässig; ungültige oder alte Basemap-Werte fallen automatisch auf Topo zurück.',
    'Route einpassen und Detail-Zoom berechnen die sicheren Kartenränder dynamisch aus Hero, Bottom-Navigation, Test-Schalter und Safe-Area.',
    'PR-Pins reagieren robuster auf iPhone-Touch: Touch-End und Click öffnen beide kontrolliert dieselbe Detailansicht.',
    'Leaflet-Panes und Layer-Reihenfolge wurden definiert; Linien sind nicht interaktiv und blockieren keine Pin-Touches.',
    'Audit-Export besitzt zusätzlich einen sichtbaren manuellen Fallback, falls iOS Share oder Clipboard blockieren.'
  ]},
  { version:'V2.5.1', date:'2026-06-01', title:'POI-Fix, Home-Pin und Testspeicher', changes:[
    'POI-LayerGroups ergänzt; POI-Schalter und Kategorien reagieren wieder.',
    'Pestana Promenade als editierbarer Home-PIN ergänzt.',
    'Testnotizen zusätzlich versionunabhängig im lokalen Speicher gesichert.',
    'Filter-Button defensiv neu gebunden und Bottom-Navigation weiter nach unten gesetzt.'
  ]},

  { version:'V2.5', date:'2026-06-01', title:'Sheet-Stabilisierung, POI-Layer, Hybridkarte und Exportfunktionen', changes:[
    'Bottom-Sheets schließen jetzt einheitlich über X-Button oder gezielt über den Anfasser; Scrollflächen schließen nicht mehr versehentlich.',
    'Route einpassen berücksichtigt jetzt aktive PR-Tracks, KML-Anfahrten, OSM-Hiking-Vektorlinien und POIs mit sicherem Randabstand.',
    'OpenSeaMap wurde durch einen OSM-POI-Layer mit Kategorien Toiletten, Parkplätze, Cafés, Bars, Sehenswürdigkeiten, Strände, Lebensmittelgeschäfte und Tankstellen ersetzt.',
    'Satellit Hybrid ergänzt: Esri World Imagery mit Referenz-/Beschriftungs-Overlay.',
    'Detailseiten erhalten Export/Teilen von GPX/KML; iOS übergibt die Datei per Share-Sheet an kompatible Apps wie Google Earth.',
    'Farbpicker synchronisiert Raster, RGB-Regler und Abdunkeln; Testbericht ist über den Teilen-Button exportierbar.'
  ]},

  { version:'V2.4.4', date:'2026-06-01', title:'Teststabilisierung, Linien-Casing und Kalenderfelder', changes:[
    'Funktionstest als stabile Vollhöhen-Ansicht umgesetzt; Wisch-Schließen im Testmodus deaktiviert und Notizen werden sofort dauerhaft gespeichert.',
    'Teststatus um Anmerkung ergänzt; je Testfeld gibt es einen Leeren-Button für die Notiz.',
    'GPX- und KML-Linien erhalten neue Grundeinstellungen mit roter/blauer Kernlinie, weißem Casing und durchgezogener Linie.',
    'KML-Anfahrten werden bei großen Geometriesprüngen in Segmente getrennt, um ungewünschte Luftlinien zwischen Start und Ende zu vermeiden.',
    'Detailseiten erhalten geplante und IFCN-gebuchte Termine mit 30-Minuten-Raster; gebuchte Termine erzeugen ICS mit 1 Tag und 3 Stunden Erinnerung.'
  ]},
  { version:'V2.4.3', date:'2026-05-31', title:'Hiking-Modus und Farbmodus', changes:[
    'Waymarked Trails Raster und OSM Hiking Vektor werden nicht mehr als zwei freie Doppel-Schalter geführt, sondern über den eindeutigen Modus Aus / Raster-Referenz / Editierbare Linien / Vergleich gesteuert.',
    'Bestehende Alt-Konfigurationen mit gleichzeitig aktivem Raster und Vektor werden automatisch auf Editierbare Linien migriert, damit keine versehentliche Doppeloptik entsteht.',
    'OSM-Hiking-Vektorlinien erhalten den Farbmodus Einheitlich / Nach OSM-Farbe / Nach Netzwerk; Standard ist Einheitlich mit Madeira-Grün.',
    'Bezeichnungen in Optionen und Einstellungen präzisiert: Referenzkarte versus editierbare Rohdaten-Linien.'
  ]},
  { version:'V2.4.2', date:'2026-05-31', title:'Clean Release und Cache-Fix', changes:[
    'Aktive Startdatei auf index.html bereinigt und alle Referenzen auf V2.4.2 vereinheitlicht.',
    'Service-Worker-Cache auf V2.4.2 erhöht, damit keine V2.4-/V2.4.1-Mischdateien ausgeliefert werden.',
    'OSM-Hiking-Loader speichert keine 0-Linien-Antwort mehr als gültigen Cache und meldet diesen Zustand klar als Ladeproblem.'
  ]},
  { version:'V2.4.1', date:'2026-05-31', title:'OSM-Hiking Loader-Fix', changes:[
    'Overpass-Abfrage auf relation + rekursive way-Geometrien umgestellt, damit Routen nicht als 0 Linien gespeichert werden.',
    'Cache-Key erhöht und leere 0-Linien-Caches werden automatisch verworfen.',
    'Parser kann jetzt sowohl Relation-Member-Geometrien als auch separat geladene Way-Geometrien verarbeiten.',
    'Statusanzeige und Toasts präzisiert.'
  ]},
  { version:'V2.4', date:'2026-05-31', title:'OSM-Hiking als Vektorlayer', changes:[
    'Zusätzliche Ebene „OSM Hiking Vektor“ ergänzt: Wander-/Fußrouten werden aus OpenStreetMap/Overpass-Rohdaten geladen und als editierbare Leaflet-Vektorlinien gezeichnet.',
    'Linien erhalten eine separate Konturlinie: Auto, Weiß, Schwarz oder Aus.',
    'Vektorlinien besitzen deutsche Info-Popups mit Bezeichnung, Referenz, Netzwerk, Symbol, Betreiber und OSM-Relation.',
    'Optionen und Einstellungen um Vektor-Hiking, Labels, Linienstärke, Deckkraft, Konturmodus und Datenaktualisierung erweitert.',
    'Der bisherige Waymarked-Trails-PNG-Layer bleibt als Vergleichs-/Fallback-Ebene erhalten.'
  ]},
  { version:'V2.3', date:'2026-05-31', title:'Kartenansichten und freie Overlays', changes:[
    'Filter-Symbol nach unten versetzt und visuell an die neue Bottom-Navigation/Test-Schalter-Zone angepasst.',
    'Dark-OSM-Kartenansicht ersatzlos entfernt; gespeicherte Alt-Auswahl wird automatisch auf Topo zurückgesetzt.',
    'Kartenansichten auf OSM Standard, OpenTopoMap und Satellit reduziert.',
    'Freie Zusatzebenen Waymarked Trails Hiking und OpenSeaMap Seezeichen als Overlays ergänzt.',
    'Ebenen-Schalter in Optionen und Einstellungen erweitert.'
  ]},
  { version:'V2.2', date:'2026-05-31', title:'Apple-Safe-Area Layout und Test-Schalter', changes:[
    'Bottom-Navigation näher an den unteren Displayrand verschoben.',
    'Test-Schalter aus der Bottom-Navigation herausgelöst und oberhalb der Navigation platziert.',
    'Schriftzüge MADEIRA und PR Explorer nach unten versetzt, damit die obere linke Button-Gruppe am linken Bildschirmrand liegen kann.',
    'Grundeinstellung „Test-Schalter anzeigen“ ergänzt.',
    'Änderungslogbuch in den Einstellungen ergänzt.'
  ]},
  { version:'V2.1', date:'2026-05-24', title:'High-End Karten- und Teststand', changes:[
    'Topo als Standardkarte.',
    'Filter-Fix, Solo-Modus, Linienstil und Pin-Größe.',
    'Wischgesten für Panels und Funktionstest-Tab.'
  ]}
];

const DATA = (window.PR_DATA||[]).sort((a,b)=>
  parseFloat(a.id.replace('PR ',''))-parseFloat(b.id.replace('PR ','')));

const favs = new Set(JSON.parse(localStorage.getItem('prFavs')||'[]'));
let prStatus = JSON.parse(localStorage.getItem('prStatus')||'{}');
let cfg = Object.assign({
  gpxColor:'#FF3B30', kmlColor:'#007AFF',
  pinColor:'#ff9500', pinShape:'tag', pinIcon:'🥾',
  pinSize:1.0, gpxWeight:5, gpxDash:'solid', kmlWeight:5, kmlDash:'solid',
  gpxOutlineColor:'#ffffff', gpxOutlineWeight:1, kmlOutlineColor:'#ffffff', kmlOutlineWeight:1,
  splitKmlJumps:true, kmlJumpKm:1.8,
  tripStart:null, tripEnd:null, base:'topo', sort:'id',
  soloMode:false, soloId:null,
  layers:{ tracks:true, drive:true, heat:false, markers:true, regions:false, hiking:false, hikingVector:false, pois:false },
  hikingMode:'off',
  hikingVectorLabels:true, hikingVectorWeight:5.5, hikingVectorOpacity:.75,
  hikingVectorOutline:'auto', hikingVectorOutlineWeight:3, hikingVectorColor:'#34c759', hikingVectorColorMode:'uniform',
  poiCats:{toilets:true,parking:true,cafe:true,bar:true,attraction:true,beach:true,supermarket:true,fuel:true},
  poiSize:1.0, poiMode:'near', poiRadiusKm:3.0,
  driveTimeFactor:1.15, parkingBufferMin:15, walkStartBufferMin:10, reminderDayMin:1440, reminderDepartMin:120,
  home:{label:'Pestana Promenade',lat:32.6376,lon:-16.9382,show:true},
  showTestToggle:false,
  zoomSliderEnabled:false, bottomSheetOpacity:0.88, fuelConsumptionL100:6.5, mountainCorrectionPercent:30, fuelPrice:1.90,
}, JSON.parse(localStorage.getItem('prCfg')||'{}'));

// Migration alter V2.4.x-Schalter in einen eindeutigen Hiking-Modus.
if(!['off','raster','vector','compare'].includes(cfg.hikingMode)){
  cfg.hikingMode = cfg.layers?.hikingVector ? 'vector' : (cfg.layers?.hiking ? 'raster' : 'off');
}
if(!['uniform','osm','network'].includes(cfg.hikingVectorColorMode)){
  cfg.hikingVectorColorMode = 'uniform';
  if((cfg.hikingVectorColor||'').toLowerCase()==='#bf5af2') cfg.hikingVectorColor = '#34c759';
}
function applyHikingModeToLegacyLayers(){
  cfg.layers.hiking = cfg.hikingMode==='raster' || cfg.hikingMode==='compare';
  cfg.layers.hikingVector = cfg.hikingMode==='vector' || cfg.hikingMode==='compare';
}
applyHikingModeToLegacyLayers();
// V2.5.2: Storage-Migration und harte Abwehr alter/ungültiger Kartenstände.
if(!['light','topo','sat','hybrid'].includes(cfg.base)) cfg.base='topo';
if(cfg.base==='dark') cfg.base='topo';
if(!cfg.layers || typeof cfg.layers!=='object') cfg.layers={};
cfg.layers.regions=false;
try { localStorage.setItem('prStorageSchema','V2.5.8'); } catch(e) {}
// V2.4.4: alte Standardwerte nur dann migrieren, wenn der Nutzer offenbar noch die früheren Defaults nutzt.
if((cfg.gpxColor||'').toLowerCase()==='#5ac8fa') cfg.gpxColor='#FF3B30';
if((cfg.kmlColor||'').toLowerCase()==='#ff9500') cfg.kmlColor='#007AFF';
if(+cfg.gpxWeight===3) cfg.gpxWeight=5;
if(+cfg.kmlWeight===2) cfg.kmlWeight=5;
if((cfg.kmlDash||'dashed')==='dashed') cfg.kmlDash='solid';
if(!cfg.gpxOutlineColor) cfg.gpxOutlineColor='#ffffff';
if(!cfg.kmlOutlineColor) cfg.kmlOutlineColor='#ffffff';
if(!cfg.gpxOutlineWeight) cfg.gpxOutlineWeight=1;
if(!cfg.kmlOutlineWeight) cfg.kmlOutlineWeight=1;
if(typeof cfg.splitKmlJumps!=='boolean') cfg.splitKmlJumps=true;
if(!cfg.kmlJumpKm) cfg.kmlJumpKm=1.8;
if(!['all','near'].includes(cfg.poiMode)) cfg.poiMode='near';
cfg.poiSize=Number.isFinite(+cfg.poiSize)?+cfg.poiSize:1.0;
cfg.poiRadiusKm=Number.isFinite(+cfg.poiRadiusKm)?+cfg.poiRadiusKm:3.0;
cfg.driveTimeFactor=Number.isFinite(+cfg.driveTimeFactor)?+cfg.driveTimeFactor:1.15;
cfg.parkingBufferMin=Number.isFinite(+cfg.parkingBufferMin)?+cfg.parkingBufferMin:15;
cfg.walkStartBufferMin=Number.isFinite(+cfg.walkStartBufferMin)?+cfg.walkStartBufferMin:10;
cfg.reminderDayMin=Number.isFinite(+cfg.reminderDayMin)?+cfg.reminderDayMin:1440;
cfg.reminderDepartMin=Number.isFinite(+cfg.reminderDepartMin)?+cfg.reminderDepartMin:120;

if(typeof cfg.zoomSliderEnabled!=='boolean') cfg.zoomSliderEnabled=false;
cfg.bottomSheetOpacity=Number.isFinite(+cfg.bottomSheetOpacity)?+cfg.bottomSheetOpacity:0.88;
cfg.fuelConsumptionL100=Number.isFinite(+cfg.fuelConsumptionL100)?+cfg.fuelConsumptionL100:6.5;
cfg.mountainCorrectionPercent=Number.isFinite(+cfg.mountainCorrectionPercent)?+cfg.mountainCorrectionPercent:30;
cfg.fuelPrice=Number.isFinite(+cfg.fuelPrice)?+cfg.fuelPrice:1.90;
cfg.showTestToggle=false;


let prSchedule = JSON.parse(localStorage.getItem('prSchedule')||'{}');
function savePrSchedule(){ localStorage.setItem('prSchedule', JSON.stringify(prSchedule)); }
function getPrSchedule(id){ return prSchedule[id] || { planned:'', booked:'' }; }
function updatePrSchedule(id,key,val){ if(!prSchedule[id]) prSchedule[id]={planned:'',booked:''}; prSchedule[id][key]=val||''; savePrSchedule(); if(key==='booked'&&val) setSt(id,'booked'); else { renderDetail(); renderPanel(); } }


let tripItems = JSON.parse(localStorage.getItem('prTripItems')||'[]');
function saveTripItems(){ localStorage.setItem('prTripItems', JSON.stringify(tripItems)); }
const TRIP_STATUS = {
  idea:{label:'Idee',dot:'#8e8e93'}, fav:{label:'Favorit',dot:'#ffd60a'},
  planned:{label:'Geplant',dot:'#5ac8fa'}, booked:{label:'Gebucht',dot:'#0a84ff'},
  done:{label:'Erledigt',dot:'#34c759'}, skip:{label:'Verworfen',dot:'#636366'}
};
function tripStatusPill(st){ const d=TRIP_STATUS[st]||TRIP_STATUS.idea; return `<span class="trip-pill" style="border-color:${d.dot}66;color:${d.dot};background:${d.dot}18"><i style="background:${d.dot}"></i>${d.label}</span>`; }
function tripDays(){
  if(!cfg.tripStart||!cfg.tripEnd)return [];
  const out=[], s=new Date(cfg.tripStart+'T00:00'), e=new Date(cfg.tripEnd+'T00:00');
  if(isNaN(s)||isNaN(e)||e<s)return out;
  for(let d=new Date(s); d<=e; d.setDate(d.getDate()+1)) out.push(new Date(d));
  return out;
}
function dateKey(d){ if(d instanceof Date) return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; return String(d||'').slice(0,10); }
function niceDay(d){ return d.toLocaleDateString('de',{weekday:'short',day:'2-digit',month:'2-digit'}); }
function timeOf(dt){ return String(dt||'').slice(11,16)||'–'; }
function scheduleKindLabel(k){ return k==='booked'?'IFCN gebucht':'geplant'; }
function prScheduleRows(){ const rows=[]; Object.entries(prSchedule).forEach(([id,sc])=>{ const r=DATA.find(x=>x.id===id); if(!r)return; if(sc.planned)rows.push({kind:'pr',id,type:'planned',dt:sc.planned,r}); if(sc.booked)rows.push({kind:'pr',id,type:'booked',dt:sc.booked,r}); }); return rows; }
function unscheduledFavs(){ return DATA.filter(r=>favs.has(r.id)&&!getPrSchedule(r.id).planned&&!getPrSchedule(r.id).booked); }
function tripItemsForDay(key){ return tripItems.filter(x=>dateKey(x.dt)===key && x.status!=='skip'); }
function travelEventsForDay(key){ return prScheduleRows().filter(x=>dateKey(x.dt)===key).concat(tripItemsForDay(key).map(x=>({kind:'item',dt:x.dt,item:x}))).sort((a,b)=>String(a.dt).localeCompare(String(b.dt))); }
function tripItemTitle(x){ return htmlEsc(x.title||'Unternehmung'); }
function addTripItemFromForm(){
  const title=(qs('#tiTitle')?.value||'').trim(); if(!title){toast('Titel fehlt');return;}
  const date=qs('#tiDate')?.value||''; const hour=qs('#tiHour')?.value||'09'; const min=qs('#tiMin')?.value||'00';
  const item={id:'ti-'+Date.now(),title,cat:qs('#tiCat')?.value||'poi',status:qs('#tiStatus')?.value||'idea',dt:date?`${date}T${hour}:${min}`:'',durationMin:+(qs('#tiDur')?.value||120),driveMin:+(qs('#tiDrive')?.value||0),link:(qs('#tiLink')?.value||'').trim(),lat:parseFloat(qs('#tiLat')?.value||''),lon:parseFloat(qs('#tiLon')?.value||'')};
  if(!Number.isFinite(item.lat)) delete item.lat; if(!Number.isFinite(item.lon)) delete item.lon;
  tripItems.push(item); saveTripItems(); renderPanel(); toast('Unternehmung gespeichert');
}
function deleteTripItem(id){ tripItems=tripItems.filter(x=>x.id!==id); saveTripItems(); renderPanel(); }
function setTripItemStatus(id,st){ const x=tripItems.find(i=>i.id===id); if(!x)return; x.status=st; saveTripItems(); renderPanel(); }
function openTripLink(id){ const x=tripItems.find(i=>i.id===id); if(!x||!x.link){toast('Kein Link gespeichert');return;} window.open(x.link,'_blank'); }
function planFavFromCard(id){ const date=qs('#pf-'+String(id).replace(/[^a-z0-9]+/gi,'-')+'-date')?.value||''; const hour=qs('#pf-'+String(id).replace(/[^a-z0-9]+/gi,'-')+'-hour')?.value||'09'; const min=qs('#pf-'+String(id).replace(/[^a-z0-9]+/gi,'-')+'-min')?.value||'00'; if(!date){toast('Reisetag wählen');return;} updatePrSchedule(id,'planned',`${date}T${hour}:${min}`); toast(id+' eingeplant'); }
function exportTravelPlanJson(){ const payload={version:APP_VERSION,tripStart:cfg.tripStart,tripEnd:cfg.tripEnd,prSchedule,tripItems,generated:new Date().toISOString()}; downloadBlob(JSON.stringify(payload,null,2),'pr-explorer-reiseplan.json','application/json'); }
function tripItemIcs(x){ const start=x.dt?new Date(x.dt):new Date(); const end=new Date(start.getTime()+(+(x.durationMin||120))*60000); const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''); return ['BEGIN:VCALENDAR','VERSION:2.0',`PRODID:-//PR Explorer ${APP_VERSION}//DE`,'BEGIN:VEVENT',`UID:${x.id}@pr-explorer`,`DTSTAMP:${stamp}`,`DTSTART:${icsDateFromDate(start)}`,`DTEND:${icsDateFromDate(end)}`,`SUMMARY:${escICS(x.title||'Madeira Unternehmung')}`,`DESCRIPTION:${escICS('Status: '+((TRIP_STATUS[x.status]||{}).label||x.status)+'\nDauer: '+(x.durationMin||0)+' min\nFahrzeit: '+(x.driveMin||0)+' min\n'+(x.link||''))}`,x.lat&&x.lon?`LOCATION:${x.lat}\, ${x.lon}`:'LOCATION:Madeira','END:VEVENT','END:VCALENDAR'].join('\n'); }
function exportTripItemICS(id){ const x=tripItems.find(i=>i.id===id); if(!x){return;} downloadBlob(tripItemIcs(x),String(x.title||'Unternehmung').replace(/[^a-z0-9äöüß-]+/gi,'-').slice(0,40)+'.ics','text/calendar'); }
function tripPlannerFormHtml(){ const days=tripDays(); const defDate=days[0]?dateKey(days[0]):''; return `<div class="trip-add"><div class="trip-add-head"><b>Externe Unternehmung</b><small>Manuell speichern, später einem Reisetag zuordnen.</small></div><input id="tiTitle" class="home-input" placeholder="Titel, z. B. Cabo Girão / Restaurant / Bootstour"><div class="trip-grid"><select id="tiCat"><option value="poi">POI</option><option value="food">Restaurant</option><option value="view">Aussichtspunkt</option><option value="beach">Strand</option><option value="city">Ort / Stadt</option><option value="tour">Tour</option><option value="other">Sonstiges</option></select><select id="tiStatus">${Object.entries(TRIP_STATUS).map(([k,d])=>`<option value="${k}">${d.label}</option>`).join('')}</select></div><div class="trip-grid"><input id="tiDate" type="date" class="home-input" value="${defDate}"><select id="tiHour">${timeSelectOptions('10',0,23,1)}</select><select id="tiMin"><option value="00">00</option><option value="30">30</option></select></div><div class="trip-grid"><input id="tiDur" class="home-input" type="number" min="15" step="15" value="120" placeholder="Dauer min"><input id="tiDrive" class="home-input" type="number" min="0" step="5" value="0" placeholder="Fahrzeit min"></div><input id="tiLink" class="home-input" placeholder="Link Google Maps / Website / Instagram / YouTube"><div class="trip-grid"><input id="tiLat" class="home-input" placeholder="Lat optional"><input id="tiLon" class="home-input" placeholder="Lon optional"></div><button class="btn-primary" onclick="addTripItemFromForm()">Unternehmung speichern</button></div>`; }
function prPlanControlsHtml(r){ const safe=String(r.id).replace(/[^a-z0-9]+/gi,'-'); const days=tripDays(); return `<div class="plan-mini"><select id="pf-${safe}-date"><option value="">Reisetag wählen</option>${days.map(d=>`<option value="${dateKey(d)}">${niceDay(d)}</option>`).join('')}</select><select id="pf-${safe}-hour">${timeSelectOptions('09',0,23,1)}</select><select id="pf-${safe}-min"><option value="00">00</option><option value="30">30</option></select><button onclick="event.stopPropagation();planFavFromCard('${r.id}')">Planen</button></div>`; }
function unscheduledFavsHtml(){ const rows=unscheduledFavs(); return `<div class="p-section">Favoriten ohne Termin</div>${rows.length?`<div class="list fav-backlog">${rows.map(r=>`<div class="pr-card backlog-card" onclick="openDetail('${r.id}',true)"><div class="pr-tag" style="background:${levelColor(r.level)}">${r.id}</div><div class="info"><b>${r.name}</b><span>${regionLabel(r)} · noch nicht eingeplant</span>${prPlanControlsHtml(r)}</div><span class="chevron">›</span></div>`).join('')}</div>`:'<div class="empty-state">Keine offenen PR-Favoriten ohne Termin.</div>'}`; }
function eventCardHtml(ev){
  if(ev.kind==='pr'){
    const r=ev.r;
    return `<div class="day-event pr ${ev.type}" onclick="openDetail('${r.id}',true)">
      <div class="event-main">
        <div class="event-title-line"><span class="event-time">${timeOf(ev.dt)}</span><b>${r.id}</b></div>
        <span class="event-title">${htmlEsc(r.name)}</span>
        <small class="event-meta">${scheduleKindLabel(ev.type)} · ${fmt(r.driveMin)} min Anfahrt · ${fmt(r.duration)}</small>
      </div>
      ${stPillHtml(getSt(r.id))}
    </div>`;
  }
  const x=ev.item;
  return `<div class="day-event item">
    <div class="event-main">
      <div class="event-title-line"><span class="event-time">${timeOf(x.dt)}</span><b>${tripItemTitle(x)}</b></div>
      <span class="event-meta">${htmlEsc(x.cat||'Unternehmung')} · ${x.durationMin||0} min · Fahrt ${x.driveMin||0} min</span>
      ${x.link?`<small class="event-link">${htmlEsc(x.link).slice(0,80)}</small>`:''}
    </div>
    <div class="event-actions">
      ${tripStatusPill(x.status)}
      ${x.link?`<button onclick="event.stopPropagation();openTripLink('${x.id}')">Link</button>`:''}
      <button onclick="event.stopPropagation();exportTripItemICS('${x.id}')">ICS</button>
      <button class="event-delete" onclick="event.stopPropagation();deleteTripItem('${x.id}')">×</button>
    </div>
  </div>`;
}
function tripDayCardsHtml(){ const days=tripDays(); if(!days.length)return '<div class="empty-state">Reisezeitraum in den Einstellungen setzen. Danach werden hier automatisch Tageskarten erzeugt.</div>'; return `<div class="trip-days">${days.map(d=>{ const k=dateKey(d), ev=travelEventsForDay(k); return `<div class="trip-day"><div class="trip-day-head"><b>${niceDay(d)}</b><span>${ev.length?ev.length+' Eintrag'+(ev.length>1?'e':''):'frei'}</span></div>${ev.length?ev.map(eventCardHtml).join(''):'<div class="free-slot">Noch keine feste Planung. Geeignet für POI, Reserve oder Ruhetag.</div>'}</div>`; }).join('')}</div>`; }
function travelPlannerHtml(){ return `<div class="p-section">Roadmap / Tagesplanung</div>${tripBannerHtml()}<div class="trip-toolbar"><button class="mini-btn" onclick="exportTravelPlanJson()">Reiseplan JSON sichern</button><button class="mini-btn" onclick="exportTripICS()">Reisezeitraum ICS</button></div>${tripDayCardsHtml()}${unscheduledFavsHtml()}${tripPlannerFormHtml()}`; }

function saveCfg()    { localStorage.setItem('prCfg',    JSON.stringify(cfg)); }
function saveFavs()   { localStorage.setItem('prFavs',   JSON.stringify([...favs])); }
function saveStatus() { localStorage.setItem('prStatus', JSON.stringify(prStatus)); }

const STATUS_DEF = {
  open:    { label:'Offen',          dot:'#34c759' },
  limited: { label:'Eingeschränkt',  dot:'#ffd60a' },
  closed:  { label:'Geschlossen',    dot:'#ff3b30' },
  booked:  { label:'Gebucht',        dot:'#0a84ff' },
  skip:    { label:'Kein Interesse', dot:'#636366' },
};
function getSt(id)   { return prStatus[id]||'open'; }
function setSt(id,s) {
  prStatus[id]=s;
  saveStatus();
  const activeId = S.selected?.id || id;
  renderLayers();
  renderDetail();
  renderPanel();
  if(activeId) setTimeout(()=>focusDetailPins(activeId),60);
}

const REGIONS = {
  center:'Zentrales Hochgebirge', west:'Rabaçal / Paul da Serra',
  north:'Ribeiro Frio / Santana', east:'Ostkap / Machico',
  coast:'Westküste', porto:'Porto Santo', other:'Sonstiges',
};
function groupOf(r) {
  const id=(r.id||'').trim();
  if(['PR 1','PR 1.1','PR 1.2','PR 1.3','PR 2','PR 3','PR 3.1','PR 4','PR 12','PR 17','PR 21','PR 22'].includes(id)) return 'center';
  if(['PR 6','PR 6.1','PR 6.2','PR 6.3','PR 6.4','PR 6.5','PR 6.6','PR 6.8','PR 13','PR 13.1','PR 14','PR 27','PR 28'].includes(id)) return 'west';
  if(['PR 9','PR 9.1','PR 10','PR 11','PR 16','PR 18'].includes(id)) return 'north';
  if(['PR 5','PR 8'].includes(id)) return 'east';
  if(['PR 7','PR 15','PR 19','PR 20'].includes(id)) return 'coast';
  if((r.name||'').toLowerCase().includes('porto')) return 'porto';
  return 'other';
}
function regionLabel(r) { return REGIONS[groupOf(r)]||REGIONS.other; }
function levelClass(l) { l=(l||'').toLowerCase(); if(l.includes('leicht')||l.includes('easy')) return 'easy'; if(l.includes('schwer')||l.includes('hard')) return 'hard'; return 'mid'; }
function levelColor(l) { const c=levelClass(l); return c==='easy'?'#34c759':c==='hard'?'#ff3b30':cfg.pinColor||'#ff9500'; }
function fmt(v)    { return (v===null||v===undefined||v===''||v===0)?'–':v; }
function fmtKm(v)  { return v?`${v} km`:'–'; }
function fmtMin(v) { if(!v)return '–'; const h=Math.floor(v/60),m=v%60; return h?`${h}h ${m}min`:`${m} min`; }

const F = { region:'all', status:'all', schedule:'all', distMin:0, distMax:999, driveKmMin:0, driveKmMax:999, driveMinMin:0, driveMinMax:9999, elevUpMin:0, elevUpMax:99999 };
let _fb = {};
const S = { tab:'map', selected:null, query:'', fullscreen:false, panel:false };
const V322_NAV = { detailFrom:null, soloFrom:null, lastMainTab:'map' };

/* MAP */
const map = L.map('map',{zoomControl:false,attributionControl:false,preferCanvas:true,tap:true,doubleClickZoom:true,touchZoom:true}).setView([32.755,-16.93],10);
window.PRX310_MAP = map; window.PRX302_MAP = map; window.PRX310_MAP = map; window.PRX301_MAP = map;
window.PRX310_MAP = map; window.PRX301_MAP = map;
function initMapPanes(){
  const panes = [
    ['regionPane', 310], ['drivePane', 360], ['trackPane', 410], ['heatPane', 430],
    ['hikingPane', 440], ['poiPane', 560], ['homePane', 590], ['prMarkerPane', 620]
  ];
  panes.forEach(([name,z])=>{ const p = map.createPane(name); p.style.zIndex = z; });
}
initMapPanes();
const TILES = {
  light: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom:19,
    attribution:'&copy; OpenStreetMap contributors'
  }),
  topo:  L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{
    maxZoom:17,
    attribution:'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap'
  }),
  sat:   L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{
    maxZoom:19,
    attribution:'Tiles &copy; Esri'
  }),
  hybrid: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{
    maxZoom:19,
    attribution:'Tiles &copy; Esri'
  }),
};
const HYBRID_LABELS = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,zIndex:220,attribution:'Labels &copy; Esri'});
const BASE_LABELS = { light:'☀️ OSM', topo:'🗻 Topo', sat:'🛰 Sat', hybrid:'🛰 Hybrid' };
const OVERLAY_TILES = {
  hiking: L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png',{
    maxZoom:18, opacity:.78, zIndex:250, pane:'hikingPane', interactive:false,
    attribution:'&copy; waymarkedtrails.org, OpenStreetMap contributors'
  }),
};
const OVERLAY_LABELS = {
  tracks:'GPX Wanderwege', drive:'KML Anfahrten', heat:'Heatmap', markers:'PR-Pins',
  pois:'OSM Reise-POIs', hiking:'Hiking Referenzkarte', hikingVector:'Editierbare Hiking-Linien'
};
const OVERLAY_ICONS = { tracks:'🗺️', drive:'🚗', heat:'🔥', markers:'📍', regions:'🌐', pois:'☕', hiking:'🥾', hikingVector:'〰️' };
const APP_LAYER_KEYS = ['tracks','drive','heat','markers','pois'];
if(!TILES[cfg.base]) cfg.base='topo';
APP_LAYER_KEYS.forEach(k=>{ if(typeof cfg.layers[k] !== 'boolean') cfg.layers[k]=false; });
['tracks','drive','markers'].forEach(k=>{ if(typeof cfg.layers[k] !== 'boolean') cfg.layers[k]=true; });
let activeBase = TILES[cfg.base||'topo'].addTo(map); if(cfg.base==='hybrid') HYBRID_LABELS.addTo(map);
const lgTrack=L.layerGroup().addTo(map), lgDrive=L.layerGroup().addTo(map), lgHeat=L.layerGroup().addTo(map), lgHikingCasing=L.layerGroup().addTo(map), lgHikingCore=L.layerGroup().addTo(map), lgHikingLabels=L.layerGroup().addTo(map), lgMarkers=L.layerGroup().addTo(map), lgPois=L.layerGroup().addTo(map), lgHome=L.layerGroup().addTo(map), lgRegions=L.layerGroup().addTo(map);
let locMarker=null, locCircle=null;

function syncOverlayTiles(){
  applyHikingModeToLegacyLayers();
  Object.entries(OVERLAY_TILES).forEach(([k,l])=>{
    if(cfg.layers[k]&&!map.hasLayer(l)) l.addTo(map);
    if(!cfg.layers[k]&&map.hasLayer(l)) map.removeLayer(l);
  });
}
function setBase(b){
  if(!TILES[b]) b='topo';
  if(map.hasLayer(HYBRID_LABELS)) map.removeLayer(HYBRID_LABELS);
  cfg.base=b; saveCfg();
  if(activeBase) map.removeLayer(activeBase);
  activeBase=TILES[b].addTo(map);
  if(b==='hybrid') HYBRID_LABELS.addTo(map);
  syncOverlayTiles(); renderHikingVectorLayers(); renderPanel();
}
function setLayer(k,on){ cfg.layers[k]=!!on; if(k==='regions')toggleRegions(); else if(k==='pois'){ togglePois(); } else if(k==='hiking'||k==='hikingVector'){ cfg.hikingMode = cfg.layers.hikingVector ? 'vector' : (cfg.layers.hiking ? 'raster' : 'off'); syncOverlayTiles(); renderHikingVectorLayers(); } else if(OVERLAY_TILES[k])syncOverlayTiles(); else renderLayers(); saveCfg(); renderPanel(); }
function setHikingMode(mode){
  cfg.hikingMode = ['off','raster','vector','compare'].includes(mode) ? mode : 'off';
  applyHikingModeToLegacyLayers();
  saveCfg();
  syncOverlayTiles();
  renderHikingVectorLayers();
  renderPanel();
  if(qs('#settingsContent'))renderSettings();
  toast({off:'Hiking aus',raster:'Hiking Referenzkarte',vector:'Editierbare Hiking-Linien',compare:'Vergleich Raster + Vektor'}[cfg.hikingMode]);
}
function hikingModeLabel(){ return ({off:'Aus',raster:'Raster-Referenz',vector:'Editierbare Linien',compare:'Vergleich'}[cfg.hikingMode]||'Aus'); }
function hikingModeControlsHtml(scope='panel'){
  const modes=[['off','Aus'],['raster','Raster-Referenz'],['vector','Editierbare Linien'],['compare','Vergleich']];
  return `<div class="hiking-mode-row">${modes.map(([m,l])=>`<button class="line-style-btn ${cfg.hikingMode===m?'ls-active':''}" onclick="setHikingMode('${m}')">${l}</button>`).join('')}</div><div class="hiking-mode-note">Raster = Waymarked-Trails-Kachel als Referenz. Editierbare Linien = OSM-Rohdaten als steuerbarer Vektorlayer. Vergleich legt beide bewusst übereinander.</div>`;
}
function updateZoom(){ const z=map.getZoom(),a=qs('#app'); a.classList.toggle('zoom-far',z<=10); a.classList.toggle('zoom-mid',z>10&&z<=13); a.classList.toggle('zoom-near',z>13); }
map.on('zoomend',updateZoom); updateZoom();
syncOverlayTiles();


/* OSM HIKING VECTOR LAYER · V2.4.2 */
const HIKING_VECTOR_BBOX = { south:32.55, west:-17.35, north:32.95, east:-16.55 };
const HIKING_VECTOR_CACHE_KEY = 'prHikingVectorGeojsonV243';
const HIKING_VECTOR_META_KEY = 'prHikingVectorMetaV243';
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter'
];
let hikingVectorGeojson = null;
let hikingVectorMeta = JSON.parse(localStorage.getItem(HIKING_VECTOR_META_KEY)||'{}');
let hikingVectorLoading = false;
let hikingVectorError = null;

function hikingVectorQueries(){
  const b=HIKING_VECTOR_BBOX;
  // Strategie 1: Standard für Waymarked-Trails-ähnliche Wander-/Fußrouten.
  const q1 = `[out:json][timeout:120];\nrel["type"="route"]["route"~"^(hiking|foot)$"](${b.south},${b.west},${b.north},${b.east});\nout body;\nway(r);\nout tags geom;`;
  // Strategie 2: breiter, falls Madeira-Routen abweichend als walking/path markiert wurden.
  const q2 = `[out:json][timeout:120];\nrel["type"="route"]["route"~"^(hiking|foot|walking)$"](${b.south},${b.west},${b.north},${b.east});\nout body;\nway(r);\nout tags geom;`;
  return [q1, q2];
}
function loadCachedHikingVector(){
  if(hikingVectorGeojson?.features?.length)return true;
  try{
    const raw=localStorage.getItem(HIKING_VECTOR_CACHE_KEY);
    if(!raw)return false;
    const cached=JSON.parse(raw);
    if(!cached?.features?.length){
      localStorage.removeItem(HIKING_VECTOR_CACHE_KEY);
      localStorage.removeItem(HIKING_VECTOR_META_KEY);
      return false;
    }
    hikingVectorGeojson=cached;
    return true;
  }catch(e){ return false; }
}
function networkDe(n){ return ({iwn:'internationaler Wanderweg',nwn:'nationaler Wanderweg',rwn:'regionaler Wanderweg',lwn:'lokaler Wanderweg'})[(n||'').toLowerCase()] || (n||'ohne Netzwerkangabe'); }
function routeColorByProps(p){
  const mode=cfg.hikingVectorColorMode||'uniform';
  const fallback=cfg.hikingVectorColor||'#34c759';
  const raw=(p.colour||p.color||'').trim();
  const net=(p.network||'').toLowerCase();
  const networkColor=net==='iwn'?'#ff3b30':net==='nwn'?'#007aff':net==='rwn'?'#bf5af2':net==='lwn'?'#34c759':fallback;
  if(mode==='uniform')return fallback;
  if(mode==='network')return networkColor;
  if(/^#?[0-9a-f]{6}$/i.test(raw))return raw.startsWith('#')?raw:'#'+raw;
  const ref=(p.ref||p.name||'').toUpperCase();
  if(ref.startsWith('PR'))return '#ff9500'; if(ref.startsWith('CR'))return '#8e8e93';
  return networkColor;
}
function overpassToGeoJSON(osm){
  const elements=osm.elements||[];
  const wayById=new Map();
  elements.filter(e=>e.type==='way').forEach(w=>{
    if(Array.isArray(w.geometry)&&w.geometry.length>1){
      const line=w.geometry.map(p=>[+p.lon,+p.lat]).filter(c=>isFinite(c[0])&&isFinite(c[1]));
      if(line.length>1)wayById.set(w.id,line);
    }
  });

  const features=[];
  elements.filter(e=>e.type==='relation').forEach(rel=>{
    const tags=rel.tags||{};
    const lines=[];
    (rel.members||[]).forEach(m=>{
      if(m.type!=='way')return;
      // Variante 1: Overpass hat Geometrie direkt am Relation-Member geliefert.
      if(Array.isArray(m.geometry)&&m.geometry.length>1){
        const line=m.geometry.map(p=>[+p.lon,+p.lat]).filter(c=>isFinite(c[0])&&isFinite(c[1]));
        if(line.length>1)lines.push(line);
        return;
      }
      // Variante 2: robuste rekursive Abfrage liefert Way-Geometrie separat.
      const byId=wayById.get(m.ref);
      if(byId)lines.push(byId);
    });
    const clean=lines.filter(l=>l.length>1);
    if(!clean.length)return;
    const props={
      osm_id:rel.id, name:tags.name||'', ref:tags.ref||'', route:tags.route||'', network:tags.network||'',
      operator:tags.operator||'', symbol:tags.symbol||'', osmc_symbol:tags['osmc:symbol']||'', colour:tags.colour||tags.color||'',
      source:'OpenStreetMap / Overpass', info_de:`${tags.ref?tags.ref+' · ':''}${tags.name||'Wanderroute'} · ${networkDe(tags.network)}`
    };
    props.routeColor=routeColorByProps(props);
    features.push({type:'Feature',properties:props,geometry:{type:'MultiLineString',coordinates:clean}});
  });
  features.sort((a,b)=>(a.properties.ref||a.properties.name||'').localeCompare(b.properties.ref||b.properties.name||'', 'de', {numeric:true}));
  return {type:'FeatureCollection',features};
}
async function fetchHikingVectorData(force=false){
  if(hikingVectorLoading)return;
  if(!force && loadCachedHikingVector())return;
  hikingVectorLoading=true; hikingVectorError=null; renderPanel(); if(qs('#settingsContent'))renderSettings();
  let lastErr=null, lastZero=null;
  for(const query of hikingVectorQueries()){
    for(const url of OVERPASS_ENDPOINTS){
      try{
        const res=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:query});
        if(!res.ok)throw new Error(`${res.status} ${res.statusText}`);
        const osm=await res.json();
        const gj=overpassToGeoJSON(osm);
        if(!gj.features.length){ lastZero={endpoint:url, raw:(osm.elements||[]).length}; continue; }
        hikingVectorGeojson=gj;
        hikingVectorMeta={fetchedAt:new Date().toISOString(), count:hikingVectorGeojson.features.length, endpoint:url, bbox:HIKING_VECTOR_BBOX};
        try{ localStorage.setItem(HIKING_VECTOR_CACHE_KEY,JSON.stringify(hikingVectorGeojson)); localStorage.setItem(HIKING_VECTOR_META_KEY,JSON.stringify(hikingVectorMeta)); }catch(e){}
        hikingVectorLoading=false; renderHikingVectorLayers(); renderPanel(); if(qs('#settingsContent'))renderSettings(); toast(`${hikingVectorGeojson.features.length} OSM-Hiking-Linien geladen`); return;
      }catch(e){ lastErr=e; }
    }
  }
  hikingVectorGeojson=null;
  hikingVectorMeta={fetchedAt:new Date().toISOString(), count:0, endpoint:lastZero?.endpoint||'', bbox:HIKING_VECTOR_BBOX};
  try{ localStorage.removeItem(HIKING_VECTOR_CACHE_KEY); localStorage.setItem(HIKING_VECTOR_META_KEY,JSON.stringify(hikingVectorMeta)); }catch(e){}
  hikingVectorLoading=false;
  hikingVectorError=lastZero ? `Overpass-Antwort ohne verwertbare Linien (${lastZero.raw} Rohobjekte)` : (lastErr?String(lastErr.message||lastErr):'Overpass nicht erreichbar');
  renderHikingVectorLayers(); renderPanel(); if(qs('#settingsContent'))renderSettings(); toast('OSM-Hiking-Rohdaten nicht geladen');
}
function hikingOutlineColor(){
  const v=cfg.hikingVectorOutline||'auto';
  if(v==='off')return null; if(v==='white')return '#ffffff'; if(v==='black')return '#06100e';
  return cfg.base==='sat' ? '#ffffff' : '#06100e';
}
function clearHikingVectorLayers(){ lgHikingCasing.clearLayers(); lgHikingCore.clearLayers(); lgHikingLabels.clearLayers(); }
function hikingPopupHtml(p){
  return `<div class="hv-pop"><b>${p.ref||p.name||'OSM-Wanderroute'}</b>${p.name&&p.name!==p.ref?`<span>${p.name}</span>`:''}<small>Typ: ${p.route==='foot'?'Fußroute':'Wanderroute'}<br>Netz: ${networkDe(p.network)}<br>${p.operator?`Betreiber: ${p.operator}<br>`:''}${p.osmc_symbol?`OSM-Symbol: ${p.osmc_symbol}<br>`:''}Quelle: OpenStreetMap / Overpass<br>Relation: ${p.osm_id}</small></div>`;
}
function longestLineCenter(feature){
  const lines=feature.geometry?.coordinates||[]; let best=[]; lines.forEach(l=>{ if(l.length>best.length)best=l; });
  if(!best.length)return null; const c=best[Math.floor(best.length/2)]; return [c[1],c[0]];
}
function renderHikingVectorLabels(){
  lgHikingLabels.clearLayers();
  applyHikingModeToLegacyLayers();
  if(!cfg.layers.hikingVector || !cfg.hikingVectorLabels || !hikingVectorGeojson?.features)return;
  hikingVectorGeojson.features.forEach(f=>{
    const p=f.properties||{}, c=longestLineCenter(f); if(!c)return;
    const txt=(p.ref||p.name||'').trim(); if(!txt)return;
    const html=`<div class="hiking-vector-label">${txt}</div>`;
    L.marker(c,{icon:L.divIcon({html,className:'hiking-vector-label-wrap',iconSize:null}),interactive:false}).addTo(lgHikingLabels);
  });
}
function renderHikingVectorLayers(){
  clearHikingVectorLayers();
  applyHikingModeToLegacyLayers();
  if(!cfg.layers.hikingVector)return;
  if(!loadCachedHikingVector()){ fetchHikingVectorData(false); return; }
  const out=hikingOutlineColor(), w=+(cfg.hikingVectorWeight||3), ow=+(cfg.hikingVectorOutlineWeight||3), op=+(cfg.hikingVectorOpacity||.95);
  if(out){
    L.geoJSON(hikingVectorGeojson,{style:()=>({pane:'hikingPane',color:out,weight:w+ow,opacity:Math.min(1,op),lineCap:'round',lineJoin:'round',interactive:false})}).addTo(lgHikingCasing);
  }
  L.geoJSON(hikingVectorGeojson,{style:f=>({pane:'hikingPane',interactive:false,color:routeColorByProps(f.properties||{}),weight:w,opacity:op,lineCap:'round',lineJoin:'round'}),onEachFeature:(f,l)=>{l.bindPopup(hikingPopupHtml(f.properties||{}),{className:'hv-popup'}); l.bindTooltip((f.properties.ref||f.properties.name||'OSM Hiking'),{sticky:true,className:'region-tt'});}}).addTo(lgHikingCore);
  renderHikingVectorLabels();
}
function setHikingOutline(v){ cfg.hikingVectorOutline=v; saveCfg(); renderHikingVectorLayers(); renderSettings(); }
function setHikingLabels(on){ cfg.hikingVectorLabels=!!on; saveCfg(); renderHikingVectorLabels(); renderSettings(); }
function setHikingColorMode(v){ cfg.hikingVectorColorMode=['uniform','osm','network'].includes(v)?v:'uniform'; saveCfg(); renderHikingVectorLayers(); renderSettings(); }
function refreshHikingVectorData(){ localStorage.removeItem(HIKING_VECTOR_CACHE_KEY); hikingVectorGeojson=null; fetchHikingVectorData(true); }
function hikingVectorStatusHtml(){
  const n=hikingVectorGeojson?.features?.length || hikingVectorMeta.count || 0;
  const dt=hikingVectorMeta.fetchedAt ? new Date(hikingVectorMeta.fetchedAt).toLocaleString('de') : 'noch nicht geladen';
  const err=hikingVectorError?`<br><span style="color:var(--red)">Fehler: ${hikingVectorError}</span>`:'';
  return `${hikingVectorLoading?'lädt …':`${n} Linien · ${dt}`}${err}`;
}

const CONCELHOS={"type":"FeatureCollection","features":[{"type":"Feature","properties":{"name":"Funchal"},"geometry":{"type":"Polygon","coordinates":[[[-16.87,32.63],[-16.88,32.68],[-16.93,32.70],[-16.98,32.68],[-16.95,32.63],[-16.87,32.63]]]}},{"type":"Feature","properties":{"name":"Câmara de Lobos"},"geometry":{"type":"Polygon","coordinates":[[[-16.98,32.63],[-16.95,32.63],[-16.98,32.68],[-17.03,32.68],[-17.03,32.63],[-16.98,32.63]]]}},{"type":"Feature","properties":{"name":"Ribeira Brava"},"geometry":{"type":"Polygon","coordinates":[[[-17.03,32.63],[-17.03,32.72],[-17.10,32.73],[-17.14,32.65],[-17.08,32.62],[-17.03,32.63]]]}},{"type":"Feature","properties":{"name":"Ponta do Sol"},"geometry":{"type":"Polygon","coordinates":[[[-17.14,32.65],[-17.10,32.73],[-17.19,32.75],[-17.22,32.67],[-17.14,32.65]]]}},{"type":"Feature","properties":{"name":"Calheta"},"geometry":{"type":"Polygon","coordinates":[[[-17.22,32.67],[-17.19,32.75],[-17.28,32.78],[-17.32,32.70],[-17.22,32.67]]]}},{"type":"Feature","properties":{"name":"Porto Moniz"},"geometry":{"type":"Polygon","coordinates":[[[-17.17,32.82],[-17.28,32.85],[-17.32,32.80],[-17.28,32.78],[-17.19,32.75],[-17.17,32.82]]]}},{"type":"Feature","properties":{"name":"São Vicente"},"geometry":{"type":"Polygon","coordinates":[[[-17.03,32.72],[-17.03,32.82],[-17.17,32.82],[-17.19,32.75],[-17.10,32.73],[-17.03,32.72]]]}},{"type":"Feature","properties":{"name":"Santana"},"geometry":{"type":"Polygon","coordinates":[[[-16.88,32.68],[-16.88,32.82],[-17.03,32.82],[-17.03,32.72],[-16.98,32.68],[-16.88,32.68]]]}},{"type":"Feature","properties":{"name":"Machico"},"geometry":{"type":"Polygon","coordinates":[[[-16.75,32.65],[-16.73,32.72],[-16.80,32.75],[-16.87,32.68],[-16.87,32.63],[-16.75,32.65]]]}},{"type":"Feature","properties":{"name":"Santa Cruz"},"geometry":{"type":"Polygon","coordinates":[[[-16.71,32.63],[-16.70,32.70],[-16.73,32.72],[-16.75,32.65],[-16.71,32.63]]]}},{"type":"Feature","properties":{"name":"Nordeste"},"geometry":{"type":"Polygon","coordinates":[[[-16.70,32.70],[-16.64,32.78],[-16.73,32.80],[-16.80,32.75],[-16.73,32.72],[-16.70,32.70]]]}}]};

function drawRegions(){ lgRegions.clearLayers(); L.geoJSON(CONCELHOS,{style:()=>({pane:'regionPane',color:'rgba(90,200,250,.6)',weight:1.2,fillColor:'#5ac8fa',fillOpacity:.05,dashArray:'4 6'}),onEachFeature:(f,l)=>{l.bindTooltip(f.properties.name,{sticky:true,className:'region-tt'});l.on('click',()=>{lgRegions.eachLayer(x=>{if(x.setStyle)x.setStyle({fillOpacity:.05,weight:1.2});});l.setStyle({fillOpacity:.18,weight:2});map.flyToBounds(l.getBounds(),{padding:[40,40],duration:.8});toast(f.properties.name);});}}).addTo(lgRegions); }
function toggleRegions(){ if(cfg.layers.regions)drawRegions();else lgRegions.clearLayers();saveCfg(); }

/* OSM POI LAYER */
const POI_DEF={
  toilets:{label:'Toiletten',icon:'🚻',q:'node["amenity"="toilets"]'},
  parking:{label:'Parkplätze',icon:'🅿️',q:'node["amenity"="parking"]'},
  cafe:{label:'Cafés',icon:'☕',q:'node["amenity"="cafe"]'},
  bar:{label:'Bars',icon:'🍹',q:'node["amenity"~"^(bar|pub)$"]'},
  attraction:{label:'Sehenswürdigkeiten',icon:'⭐',q:'node["tourism"~"^(attraction|viewpoint|museum|picnic_site)$"]'},
  beach:{label:'Strände',icon:'🏖️',q:'node["natural"="beach"]'},
  supermarket:{label:'Lebensmittel',icon:'🛒',q:'node["shop"~"^(supermarket|convenience|grocery)$"]'},
  fuel:{label:'Tankstellen',icon:'⛽',q:'node["amenity"="fuel"]'},
};
let poiGeojson=null, poiLoading=false, poiError='';
function poiQuery(){
  const bbox='32.55,-17.35,32.95,-16.55';
  const parts=Object.values(POI_DEF).map(d=>d.q+'('+bbox+');').join('\n  ');
  return `[out:json][timeout:90];\n(\n  ${parts}\n);\nout tags center;`;
}
function poiCatFromTags(t){
  if(t.amenity==='toilets')return 'toilets'; if(t.amenity==='parking')return 'parking'; if(t.amenity==='cafe')return 'cafe'; if(['bar','pub'].includes(t.amenity))return 'bar'; if(t.amenity==='fuel')return 'fuel'; if(['supermarket','convenience','grocery'].includes(t.shop))return 'supermarket'; if(t.natural==='beach')return 'beach'; if(['attraction','viewpoint','museum','picnic_site'].includes(t.tourism))return 'attraction'; return 'attraction';
}
function loadPoiCache(){ try{ poiGeojson=JSON.parse(localStorage.getItem('prPoiGeojsonV25')||'null'); }catch(e){poiGeojson=null;} }
loadPoiCache();
async function refreshPoiData(){
  if(poiLoading)return; poiLoading=true; poiError=''; toast('OSM-POIs werden geladen…');
  try{
    const body='data='+encodeURIComponent(poiQuery());
    const res=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body});
    if(!res.ok)throw new Error('Overpass '+res.status);
    const json=await res.json();
    const feats=(json.elements||[]).filter(e=>e.lat&&e.lon).map(e=>{const tags=e.tags||{},cat=poiCatFromTags(tags);return {type:'Feature',properties:{id:e.id,cat,name:tags.name||POI_DEF[cat].label,amenity:tags.amenity||'',tourism:tags.tourism||'',shop:tags.shop||''},geometry:{type:'Point',coordinates:[e.lon,e.lat]}};});
    poiGeojson={type:'FeatureCollection',features:feats,loadedAt:new Date().toISOString()};
    localStorage.setItem('prPoiGeojsonV25',JSON.stringify(poiGeojson));
    toast(`${feats.length} POIs geladen`);
  }catch(err){ poiError=err.message||String(err); toast('POI-Laden fehlgeschlagen'); }
  finally{ poiLoading=false; drawPois(); renderPanel(); renderSettings?.(); }
}
function activePoiCenter(){
  const id=S.selected?.id || (cfg.soloMode&&cfg.soloId?cfg.soloId:null);
  const r=id?DATA.find(x=>x.id===id):null;
  return r&&r.lat&&r.lon ? [r.lat,r.lon] : null;
}
function googleMapsPoint(lat,lon,label='POI'){
  const url=`https://www.google.com/maps/search/?api=1&query=${lat.toFixed(6)},${lon.toFixed(6)}`;
  window.open(url,'_blank');
}
function poiPopupHtml(def,p,lat,lon){
  const name=htmlEsc(p.name||def.label);
  return `<b>${def.icon} ${name}</b><br>${htmlEsc(def.label)}<br><small>OSM · ${htmlEsc(p.id||'')}</small><br><button class="popup-action" onclick="googleMapsPoint(${lat},${lon})">In Google Maps öffnen</button>`;
}
function drawPois(){
  lgPois.clearLayers();
  if(!cfg.layers.pois||!poiGeojson||!poiGeojson.features)return;
  const active=cfg.poiCats||{};
  const center=activePoiCenter();
  const radius=+(cfg.poiRadiusKm||3);
  const nearMode=(cfg.poiMode||'near')==='near';
  const size=Math.max(.55,Math.min(1.8,+(cfg.poiSize||1)));
  poiGeojson.features.forEach(f=>{
    const p=f.properties||{},cat=p.cat||'attraction'; if(active[cat]===false)return;
    const def=POI_DEF[cat]||POI_DEF.attraction, c=f.geometry.coordinates;
    const lat=+c[1], lon=+c[0]; if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
    if(nearMode && center && pointKm(center,[lat,lon])>radius)return;
    if(nearMode && !center)return;
    const px=Math.round(30*size);
    const fs=Math.max(12,Math.round(16*size));
    const ico=L.divIcon({className:'poi-pin',html:`<div class="poi-bubble" style="width:${px}px;height:${px}px;font-size:${fs}px">${def.icon}</div>`,iconSize:[px,px],iconAnchor:[px/2,px/2]});
    L.marker([lat,lon],{icon:ico,keyboard:false,pane:'poiPane'}).bindPopup(poiPopupHtml(def,p,lat,lon)).addTo(lgPois);
  });
}
function togglePois(){ if(cfg.layers.pois){ if(!poiGeojson) refreshPoiData(); else drawPois(); } else lgPois.clearLayers(); }
function setPoiCat(cat,on){ if(!cfg.poiCats)cfg.poiCats={}; cfg.poiCats[cat]=!!on; saveCfg(); drawPois(); renderSettings(); renderPanel(); }
function poiStatusHtml(){ const n=poiGeojson?.features?.length||0; const d=poiGeojson?.loadedAt?new Date(poiGeojson.loadedAt).toLocaleString('de',{day:'numeric',month:'numeric',hour:'2-digit',minute:'2-digit'}):'nicht geladen'; return `${n} POIs · ${d}${poiError?` · Fehler: ${poiError}`:''}`; }

function drawHomePin(){
  lgHome.clearLayers();
  const h=cfg.home||{};
  if(h.show===false || typeof h.lat!=='number' || typeof h.lon!=='number')return;
  const ico=L.divIcon({className:'home-pin',html:`<div class="home-bubble">🏨</div><div class="home-label">${htmlEsc(h.label||'Home')}</div>`,iconSize:[42,42],iconAnchor:[21,38]});
  L.marker([h.lat,h.lon],{icon:ico,keyboard:false,pane:'homePane'}).bindPopup(`<b>🏨 ${htmlEsc(h.label||'Home')}</b><br>${h.lat.toFixed(6)}, ${h.lon.toFixed(6)}`).addTo(lgHome);
}
function setHomeField(k,v){
  if(!cfg.home)cfg.home={};
  if(k==='lat'||k==='lon')cfg.home[k]=parseFloat(String(v).replace(',','.'));
  else if(k==='show')cfg.home.show=!!v;
  else cfg.home[k]=v;
  saveCfg(); drawHomePin(); renderSettings();
}

function googleMapsSearch(q){ const c=map.getCenter(); const url=`https://www.google.com/maps/search/${encodeURIComponent(q)}/@${c.lat.toFixed(5)},${c.lng.toFixed(5)},13z`; window.open(url,'_blank'); }


/* FILTER */
function regionFiltered(){ return DATA.filter(r=>{ if(getSt(r.id)==='skip' && F.status!=='skip')return false; if(F.region!=='all'&&groupOf(r)!==F.region)return false; if(F.status!=='all'&&getSt(r.id)!==F.status)return false; const sc=getPrSchedule(r.id); if(F.schedule==='planned'&&!sc.planned)return false; if(F.schedule==='booked'&&!sc.booked)return false; const q=S.query.trim().toLowerCase(); if(q&&!(r.id+' '+r.name+' '+regionLabel(r)).toLowerCase().includes(q))return false; return true; }); }
function computeFilterBounds(list){ const n=v=>(typeof v==='number'&&!isNaN(v))?v:null; const vals=k=>list.map(r=>n(r[k])).filter(v=>v!==null); const minOf=k=>{const v=vals(k);return v.length?Math.floor(Math.min(...v)):0;}; const maxOf=k=>{const v=vals(k);return v.length?Math.ceil(Math.max(...v)):0;}; return {distMin:minOf('distanceKm'),distMax:maxOf('distanceKm'),driveKmMin:minOf('driveKm'),driveKmMax:maxOf('driveKm'),driveMinMin:minOf('driveMin'),driveMinMax:maxOf('driveMin'),elevUpMin:minOf('elevUp'),elevUpMax:maxOf('elevUp')}; }
function globalFilterBounds(){ return computeFilterBounds(DATA.filter(r=>getSt(r.id)!=='skip')); }
function passRangeFilter(r){ const n=v=>(typeof v==='number'&&!isNaN(v))?v:null; const d=n(r.distanceKm);if(d!==null&&(d<F.distMin||d>F.distMax))return false; const k=n(r.driveKm);if(k!==null&&(k<F.driveKmMin||k>F.driveKmMax))return false; const m=n(r.driveMin);if(m!==null&&(m<F.driveMinMin||m>F.driveMinMax))return false; const u=n(r.elevUp);if(u!==null&&(u<F.elevUpMin||u>F.elevUpMax))return false; return true; }
function sortList(list){ const mode=cfg.sort||'id'; const idn=r=>parseFloat(String(r.id||'').replace('PR ',''))||0; const n=v=>(typeof v==='number'&&!isNaN(v))?v:99999; return [...list].sort((a,b)=>{ if(mode==='name')return String(a.name||'').localeCompare(String(b.name||''),'de'); if(mode==='distance')return n(a.distanceKm)-n(b.distanceKm); if(mode==='drive')return n(a.driveMin)-n(b.driveMin); if(mode==='elev')return n(a.elevUp)-n(b.elevUp); if(mode==='status')return String(getSt(a.id)).localeCompare(String(getSt(b.id))); return idn(a)-idn(b); }); }
function setSort(v){ cfg.sort=v; saveCfg(); renderLayers(); renderPanel(); renderFilterSheet?.(); }
function filtered(){ return sortList(regionFiltered().filter(passRangeFilter)); }
function extendWithLayerGroupBounds(bounds,lg){ lg.eachLayer(l=>{ try{ if(l.getBounds){ const b=l.getBounds(); if(b&&b.isValid&&b.isValid()) bounds=bounds?bounds.extend(b):b; } else if(l.getLatLng){ bounds=bounds?bounds.extend(l.getLatLng()):L.latLngBounds([l.getLatLng()]); } }catch(e){} }); return bounds; }
function allBounds(){ let b=null; const pts=[]; const list=cfg.soloMode&&cfg.soloId?DATA.filter(r=>r.id===cfg.soloId):filtered(); list.forEach(r=>{ if(cfg.layers.tracks&&r.track?.length)pts.push(...r.track.map(p=>[p[0],p[1]])); if(cfg.layers.drive&&r.driveRoute?.length)pts.push(...r.driveRoute); if(cfg.layers.markers&&r.lat&&r.lon)pts.push([r.lat,r.lon]); }); if(pts.length)b=L.latLngBounds(pts); if(cfg.layers.hikingVector)b=extendWithLayerGroupBounds(b,lgHikingCore); if(cfg.layers.pois)b=extendWithLayerGroupBounds(b,lgPois); b=extendWithLayerGroupBounds(b,lgHome); if(cfg.layers.regions)b=extendWithLayerGroupBounds(b,lgRegions); return b||L.latLngBounds([[32.60,-17.28],[32.90,-16.58]]); }
function routeBounds(r){ const pts=[]; if(r.track?.length)pts.push(...r.track.map(p=>[p[0],p[1]])); if(r.driveRoute?.length)pts.push(...r.driveRoute); if(r.lat&&r.lon)pts.push([r.lat,r.lon]); return pts.length?L.latLngBounds(pts):null; }

/* LAYERS */
function dashArr(style,weight){ if(style==='dashed')return `${weight*3} ${weight*2}`; if(style==='dotted')return `${weight} ${weight*2}`; return null; }
function _rad(d){return d*Math.PI/180;}
function pointKm(a,b){ if(!a||!b)return 0; const R=6371, dLat=_rad(b[0]-a[0]), dLon=_rad(b[1]-a[1]); const lat1=_rad(a[0]), lat2=_rad(b[0]); const x=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2; return 2*R*Math.asin(Math.sqrt(x)); }
function splitByJump(points,maxKm){ if(!points||points.length<2)return []; const segs=[]; let cur=[points[0]]; for(let i=1;i<points.length;i++){ if(maxKm && pointKm(points[i-1],points[i])>maxKm){ if(cur.length>1)segs.push(cur); cur=[points[i]]; } else cur.push(points[i]); } if(cur.length>1)segs.push(cur); return segs; }
function drawCasedPolyline(group,points,opts){ const casingWeight=+(opts.casingWeight||0); const segs=opts.splitKm?splitByJump(points,opts.splitKm):[points]; segs.forEach(seg=>{ if(!seg||seg.length<2)return; if(casingWeight>0){ L.polyline(seg,{pane:opts.pane,interactive:false,color:opts.casingColor||'#fff',weight:(+opts.weight||3)+casingWeight,opacity:opts.casingOpacity??0.95,lineCap:'round',lineJoin:'round',smoothFactor:opts.smoothFactor||1.1}).addTo(group); } const core={pane:opts.pane,interactive:false,color:opts.color,weight:opts.weight,opacity:opts.opacity,lineCap:'round',lineJoin:'round',smoothFactor:opts.smoothFactor||1.1}; const da=dashArr(opts.dash||'solid',opts.weight||3); if(da)core.dashArray=da; L.polyline(seg,core).addTo(group); }); }

function renderLayers(){
  lgTrack.clearLayers();lgDrive.clearLayers();lgHeat.clearLayers();lgMarkers.clearLayers();
  const list=cfg.soloMode&&cfg.soloId?DATA.filter(r=>r.id===cfg.soloId):filtered();
  const gw=+(cfg.gpxWeight||3),kw=+(cfg.kmlWeight||2),ps=+(cfg.pinSize||1.0);
  list.forEach(r=>{
    if(cfg.layers.tracks&&r.track?.length){drawCasedPolyline(lgTrack,r.track.map(p=>[p[0],p[1]]),{pane:'trackPane',color:cfg.gpxColor,weight:gw,opacity:.88,dash:cfg.gpxDash||'solid',casingColor:cfg.gpxOutlineColor||'#fff',casingWeight:+(cfg.gpxOutlineWeight||1),smoothFactor:1.1});}
    if(cfg.layers.drive&&r.driveRoute?.length){drawCasedPolyline(lgDrive,r.driveRoute,{pane:'drivePane',color:cfg.kmlColor,weight:kw,opacity:.82,dash:cfg.kmlDash||'solid',casingColor:cfg.kmlOutlineColor||'#fff',casingWeight:+(cfg.kmlOutlineWeight||1),smoothFactor:1.3,splitKm:cfg.splitKmlJumps?+(cfg.kmlJumpKm||1.8):0});}
    if(cfg.layers.heat&&r.driveRoute?.length){L.polyline(r.driveRoute,{pane:'heatPane',interactive:false,color:'#ffb000',weight:10,opacity:.14,lineCap:'round',smoothFactor:2}).addTo(lgHeat);L.polyline(r.driveRoute,{pane:'heatPane',interactive:false,color:'#ff4400',weight:4,opacity:.2,lineCap:'round',smoothFactor:2}).addTo(lgHeat);}
    if(cfg.layers.markers&&r.lat&&r.lon){const st=getSt(r.id),col=levelColor(r.level),nr=r.id.replace('PR ','');const fav=favs.has(r.id)?'<span class="pin-fav"></span>':'';const w=Math.round(58*ps),h=Math.round(48*ps),fs=Math.round(9.8*ps);const html=`<div class="pr-pin-hit"><div class="pr-pin-inner"><div class="pin-tag" style="background:${col};font-size:${fs}px">${nr}${fav}<span class="pin-sd ${st}"></span></div><div class="pin-tail" style="border-top-color:${col}"></div></div></div>`;const ico=L.divIcon({html,className:'pr-pin',iconSize:[w,h],iconAnchor:[w/2,h]});const m=L.marker([r.lat,r.lon],{icon:ico,riseOnHover:true,keyboard:false,bubblingMouseEvents:false,pane:'prMarkerPane'});let lastOpen=0;const openFromPin=e=>{L.DomEvent.stopPropagation(e);const now=Date.now();if(now-lastOpen<350)return;lastOpen=now;openDetail(r.id,true);};m._prId=r.id;m.on('click',openFromPin);m.on('touchend',openFromPin);m.on('touchstart',e=>{L.DomEvent.stopPropagation(e);},{passive:true});m.addTo(lgMarkers);}
  });
  drawPois();
  drawHomePin();
  updateZoom();
}
function focusDetailPins(id){
  lgMarkers.eachLayer(m=>{
    const el=m.getElement();
    if(!el)return;
    const active=m._prId===id;
    el.classList.toggle('pin-sel',active);
    el.classList.toggle('pin-hidden',!!id && !active);
  });
}
function clearPinFocus(){ lgMarkers.eachLayer(m=>{const el=m.getElement();if(el){el.classList.remove('pin-sel','pin-hidden');}}); }
function highlightPin(id){ focusDetailPins(id); }
function soloOnMap(id){
  v322SoloOnMap(id,{fromTab:S.tab,fromDetail:null});
}
function exitSoloMode(){
  cfg.soloMode=false;
  cfg.soloId=null;
  saveCfg();
  renderLayers();
  v322SyncSoloBar();
}

/* UI */
function toast(t){ const el=qs('#toast');el.textContent=t;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2200); }
function openTestPanel(){
  S.tab='test';
  qsa('#bottomNav button').forEach(x=>x.classList.remove('active'));
  qs('#testToggle')?.classList.add('active');
  qs('#panel').classList.remove('hidden');qs('#panel').classList.add('test-panel');qs('#app').classList.add('test-mode');qs('#hero').classList.add('hide');qs('.filter-fab')?.classList.add('hidden');S.panel=true;
  if(!_testActive){const f=TEST_STEPS.flatMap(c=>c.steps).find(s=>!_testResults[s.id]);if(f)_testActive=f.id;}
  renderTestTab();setTimeout(()=>{map.invalidateSize();if(_testActive){const el=qs(`#tc-${_testActive}`);if(el)el.scrollIntoView({behavior:'smooth',block:'center'});}},300);
}
function syncTestToggle(){ const t=qs('#testToggle'); if(!t)return; t.classList.toggle('hidden',!cfg.showTestToggle); t.classList.toggle('active',S.tab==='test'); }
function setTab(tab){
  qs('#panel')?.classList.remove('test-panel');
  qs('#app')?.classList.remove('test-mode');
  if(tab!==S.tab && tab!=='map') V322_NAV.lastMainTab=tab;
  // Hauptnavigation schließt eine offene Detailansicht bewusst, ohne den internen Rückweg zu benutzen.
  if(!qs('#detailPanel')?.classList.contains('hidden')){
    v322CloseDetailRaw();
  }
  S.tab=tab;
  qsa('#bottomNav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  qs('#testToggle')?.classList.remove('active');
  qs('#panel').classList.toggle('hidden',tab==='map');
  qs('#hero').classList.toggle('hide',tab!=='map');
  qs('.filter-fab')?.classList.toggle('hidden',tab!=='map');
  S.panel=tab!=='map';
  syncTestToggle();
  if(S.panel){renderPanel();setTimeout(()=>map.invalidateSize(),200);}
  v320SyncUI();
  v322SyncSoloBar();
}
function openDetailfunction openDetail(id,zoom=false,navOpts={}){
  const next = DATA.find(r=>r.id===id);
  if(!next)return;
  if(!navOpts.silent){
    V322_NAV.detailFrom = {
      tab: S.tab,
      query: S.query,
      panelScroll: qs('#panelContent') ? qs('#panelContent').scrollTop : 0,
      soloMode: !!cfg.soloMode,
      soloId: cfg.soloId || null
    };
  }
  S.selected=next;
  closeAllSheets(false);
  qs('#panel').classList.add('hidden');
  qs('#detailPanel').classList.remove('hidden');
  focusDetailPins(id);
  renderDetail();
  if(zoom){const b=routeBounds(S.selected);if(isValidBounds(b))map.flyToBounds(b,mapSafeFitOptions(true));}
  setTimeout(()=>{focusDetailPins(id);drawElevProfile(S.selected,'elevCanvas');},200);
  v322SyncSoloBar();
}
function v322CloseDetailRaw(){
  qs('#detailPanel').classList.add('hidden');
  S.selected=null;
  clearPinFocus();
  drawPois();
  v322SyncSoloBar();
}
function closeDetail(){
  v322BackFromDetail();
}
function setFullscreen(on){ S.fullscreen=on;qs('#app').classList.toggle('fullscreen',on);qs('#fullscreenClose').classList.toggle('hidden',!on);closeDetail();qs('#panel').classList.add('hidden');S.panel=false;setTimeout(()=>map.invalidateSize(),200); }
function pxHeight(sel){ const el=qs(sel); return el && !el.classList.contains('hidden') ? Math.ceil(el.getBoundingClientRect().height||0) : 0; }
function mapSafeFitOptions(detail=false){ const top=Math.max(112,pxHeight('#hero')+26); const bottomNav=pxHeight('#bottomNav')||72; const test=(cfg.showTestToggle&&!qs('#testToggle')?.classList.contains('hidden'))?(pxHeight('#testToggle')+8):0; const detailPanel=detail?Math.min(Math.round(window.innerHeight*0.46),pxHeight('#detailPanel')||280):0; const bottom=Math.max(150,bottomNav+test+detailPanel+42); return {paddingTopLeft:[34,top],paddingBottomRight:[42,bottom],maxZoom:13,duration:.85}; }
function isValidBounds(b){ return b && (!b.isValid || b.isValid()); }
function fitMadeira(){ map.flyToBounds([[32.60,-17.28],[32.90,-16.58]],{padding:[16,16],duration:.9}); }
function fitVisible(){ const b=allBounds(); if(isValidBounds(b)) map.flyToBounds(b,mapSafeFitOptions(false)); }


function filterFallbackHtml(err){
  const msg=htmlEsc(err?.stack||err?.message||String(err||'unbekannt'));
  return `<div class="empty-state" style="margin:18px;text-align:left">
    <b>Filter-Fallback aktiv · ${APP_VERSION}</b><br>
    <small style="display:block;margin-top:8px;color:#9fb3b0">Der reguläre Filteraufbau ist abgebrochen. Diese Notansicht bestätigt: Button und Sheet funktionieren, der Fehler liegt im Renderinhalt.</small>
    <details style="margin-top:12px;white-space:pre-wrap"><summary>Technische Meldung anzeigen</summary>${msg}</details>
    <button class="reset-btn" style="margin-top:16px" onclick="resetFilters();return false;">Filter zurücksetzen</button>
    <button class="reset-btn" style="margin-top:8px" onclick="try{localStorage.removeItem('prx_filters');localStorage.removeItem('prx_cfg');location.reload();}catch(e){location.reload();}return false;">Lokale App-Einstellungen zurücksetzen & neu laden</button>
  </div>`;
}
function settingsFallbackHtml(err){
  const msg=htmlEsc(err?.stack||err?.message||String(err||'unbekannt'));
  return `<div class="empty-state" style="margin:18px;text-align:left">
    <b>Einstellungs-Fallback aktiv · ${APP_VERSION}</b><br>
    <small style="display:block;margin-top:8px;color:#9fb3b0">Der reguläre Einstellungsaufbau ist abgebrochen. Diese Notansicht zeigt die technische Meldung und erlaubt einen lokalen Reset.</small>
    <details style="margin-top:12px;white-space:pre-wrap"><summary>Technische Meldung anzeigen</summary>${msg}</details>
    <div class="sg" style="margin-top:16px"><div class="sg-title">Notbedienung</div><div class="sg-box">
      <div class="sg-row" onclick="setBase('topo')"><span class="sg-label">Basiskarte auf OpenTopoMap setzen</span></div>
      <div class="sg-row" onclick="fitVisible()"><span class="sg-label">Sichtbare Routen einpassen</span></div>
      <div class="sg-row" onclick="try{localStorage.clear();location.reload();}catch(e){location.reload();}"><span class="sg-label">Lokalen Speicher komplett zurücksetzen & neu laden</span></div>
    </div></div>
  </div>`;
}

/* FILTER SHEET */
function openFilterSheet(){
  closeDetail();
  const sheet=qs('#filterSheet'), backdrop=qs('#backdrop');
  if(sheet)sheet.classList.remove('hidden');
  if(backdrop)backdrop.classList.remove('hidden');
  try{ renderFilterSheet(); }
  catch(err){
    console.error('Filter render failed',err);
    const body=qs('#filterSheet .sheet-body');
    if(body)body.innerHTML=filterFallbackHtml(err);
  }
  setTimeout(()=>map.invalidateSize(),80);
}
function closeFilterSheet(){ qs('#filterSheet').classList.add('hidden');qs('#backdrop').classList.add('hidden');renderLayers();renderPanel();v320SyncUI(); }
function _setHtml(sel,html){ const el=qs(sel); if(!el) throw new Error('Container fehlt: '+sel); el.innerHTML=html; return el; }
function _num(v,def=0){ v=Number(v); return Number.isFinite(v)?v:def; }
function _normRange(prefix,bounds){
  const lo=prefix+'Min', hi=prefix+'Max';
  const blo=_num(bounds[lo],0), bhi=_num(bounds[hi],blo);
  if(!Number.isFinite(F[lo])) F[lo]=blo;
  if(!Number.isFinite(F[hi])) F[hi]=bhi;
  F[lo]=Math.max(blo,Math.min(_num(F[lo],blo),bhi));
  F[hi]=Math.max(blo,Math.min(_num(F[hi],bhi),bhi));
  if(F[hi]<F[lo]){ F[lo]=blo; F[hi]=bhi; }
}
function renderFilterSheet(){
  const rSet=regionFiltered();
  const gb=globalFilterBounds();
  const rb=computeFilterBounds(rSet.length?rSet:DATA);
  _fb={global:gb,region:rb};
  _normRange('dist',gb); _normRange('driveKm',gb); _normRange('driveMin',gb); _normRange('elevUp',gb);
  const keys=[...new Set(DATA.map(groupOf))].filter(k=>REGIONS[k]);
  _setHtml('#regionFilters',`<button class="f-chip ${F.region==='all'?'active':''}" onclick="setRegion('all')">Alle</button>`+keys.map(k=>`<button class="f-chip ${F.region===k?'active':''}" onclick="setRegion('${k}')">${REGIONS[k]}</button>`).join(''));
  _setHtml('#statusFilters',`<div class="sf-chip ${F.status==='all'?'active-chip':''}" onclick="setSF('all')">Alle Status</div>`+Object.entries(STATUS_DEF).map(([k,d])=>`<div class="sf-chip ${F.status===k?'active-chip':''}" data-s="${k}" onclick="setSF('${k}')"><span class="dot" style="background:${d.dot}"></span>${d.label}</div>`).join('')+`<div class="sf-chip ${F.schedule==='planned'?'active-chip':''}" onclick="setScheduleFilter('planned')">🗓 geplant</div><div class="sf-chip ${F.schedule==='booked'?'active-chip':''}" onclick="setScheduleFilter('booked')">📘 gebucht</div>`);
  const sortOpts=[['id','PR-Nummer'],['name','Name'],['distance','Länge'],['drive','Fahrzeit'],['elev','Höhenmeter'],['status','Status']];
  const sortHtml=`<div class="fsec-label" style="margin-top:16px">Sortierung</div><div class="sort-row">${sortOpts.map(([k,l])=>`<button class="f-chip ${cfg.sort===k?'active':''}" onclick="setSort('${k}')">${l}</button>`).join('')}</div>`;
  const sliderHtml = sortHtml+`<div class="filter-note">Skala bleibt global. Die Griffe zeigen den gewählten Bereich innerhalb aller PRs.</div>`+
    dualSliderHtml('dist','Track-Länge',gb.distMin,gb.distMax,F.distMin,F.distMax,'km')+
    dualSliderHtml('drivekm','Anfahrt',gb.driveKmMin,gb.driveKmMax,F.driveKmMin,F.driveKmMax,'km')+
    dualSliderHtml('drivemin','Anfahrtszeit',gb.driveMinMin,gb.driveMinMax,F.driveMinMin,F.driveMinMax,'min')+
    dualSliderHtml('elevup','Höhenmeter ↑',gb.elevUpMin,gb.elevUpMax,F.elevUpMin,F.elevUpMax,'m');
  _setHtml('#rangeSliders', sliderHtml || '<div class="empty-state">Keine numerischen Filterdaten vorhanden.</div>');
  ['dist','drivekm','drivemin','elevup'].forEach(id=>{dualMove(id,'lo');dualMove(id,'hi');});
}
function dualSliderHtml(id,label,min,max,curMin,curMax,unit){ min=_num(min,0); max=_num(max,min); curMin=_num(curMin,min); curMax=_num(curMax,max); if(max<=min)return ''; const st=max-min<=10?0.1:max-min<=100?1:max-min<=1000?5:10;return `<div class="dual-slider-wrap"><div class="dual-sl-label"><span>${label}</span><span class="range-vals" id="${id}-val">${curMin}–${curMax} ${unit}</span></div><div class="dual-sl" id="${id}-wrap"><div class="track"></div><div class="fill" id="${id}-fill"></div><input type="range" id="${id}-lo" min="${min}" max="${max}" value="${curMin}" step="${st}" oninput="dualMove('${id}','lo')"><input type="range" id="${id}-hi" min="${min}" max="${max}" value="${curMax}" step="${st}" oninput="dualMove('${id}','hi')"></div></div>`; }
function dualMove(id,which){ const lo=qs(`#${id}-lo`),hi=qs(`#${id}-hi`);if(!lo||!hi)return;let vlo=parseFloat(lo.value),vhi=parseFloat(hi.value);if(which==='lo'&&vlo>vhi){vlo=vhi;lo.value=vlo;}if(which==='hi'&&vhi<vlo){vhi=vlo;hi.value=vhi;}const min=parseFloat(lo.min),max=parseFloat(lo.max),range=max-min||1;const left=((vlo-min)/range)*100,right=((max-vhi)/range)*100;const fill=qs(`#${id}-fill`);if(fill){fill.style.left=left+'%';fill.style.right=right+'%';}const unit={'dist':'km','drivekm':'km','drivemin':'min','elevup':'m'}[id]||'';const valEl=qs(`#${id}-val`);if(valEl)valEl.textContent=`${vlo}–${vhi} ${unit}`;const key={'dist':['distMin','distMax'],'drivekm':['driveKmMin','driveKmMax'],'drivemin':['driveMinMin','driveMinMax'],'elevup':['elevUpMin','elevUpMax']}[id];if(key){F[key[0]]=vlo;F[key[1]]=vhi;}renderLayers();renderPanel(); }
function setRegion(k){ F.region=k; const rb=computeFilterBounds(regionFiltered()); F.distMin=rb.distMin;F.distMax=rb.distMax;F.driveKmMin=rb.driveKmMin;F.driveKmMax=rb.driveKmMax;F.driveMinMin=rb.driveMinMin;F.driveMinMax=rb.driveMinMax;F.elevUpMin=rb.elevUpMin;F.elevUpMax=rb.elevUpMax;renderFilterSheet();renderLayers();renderPanel(); }
function setSF(k){ F.status=k||'all';renderFilterSheet();renderLayers();renderPanel(); }
function setScheduleFilter(k){ F.schedule=F.schedule===k?'all':k;renderFilterSheet();renderLayers();renderPanel(); }
function resetFilters(){ F.region='all';F.status='all';F.schedule='all';S.query='';F.distMin=0;F.distMax=999;F.driveKmMin=0;F.driveKmMax=999;F.driveMinMin=0;F.driveMinMax=9999;F.elevUpMin=0;F.elevUpMax=99999;renderFilterSheet();renderLayers();renderPanel(); }

/* PANEL */
function stPillHtml(st){ const d=STATUS_DEF[st]||STATUS_DEF.open;return `<span class="pr-card sf-pill" style="background:${d.dot}22;border:1px solid ${d.dot}44;color:${d.dot}"><span class="dot" style="background:${d.dot}"></span>${d.label}</span>`; }
function calendarOverviewHtml(){ return tripDayCardsHtml(); }
function prCardHtml(r,showMapBtn=false){ const st=getSt(r.id),col=levelColor(r.level); const rid=String(r.id).replace(/'/g,''); const mapBtn=showMapBtn?`<button class="card-map-btn" onclick="event.stopPropagation();soloOnMap('${rid}')" aria-label="Auf Karte"><svg viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg></button>`:''; return `<div class="pr-card pr-card-v303" role="button" tabindex="0" onclick="try{openDetail('${rid}',true)}catch(e){console.error(e);alert('Detailansicht konnte nicht geöffnet werden: '+(e&&e.message?e.message:e))}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();try{openDetail('${rid}',true)}catch(e){console.error(e)}}"><div class="pr-tag" style="background:${col}">${r.id}</div><div class="info"><b>${r.name}</b><span>${regionLabel(r)} · ${fmt(r.distanceKm)} km · ${fmt(r.duration)}</span></div><div class="journal-status-slot">${stPillHtml(st)}</div>${mapBtn}</div>`; }
function tripBannerHtml(){ if(!cfg.tripStart||!cfg.tripEnd)return '';const s=new Date(cfg.tripStart),e=new Date(cfg.tripEnd),now=new Date();const days=Math.round((e-s)/86400000)+1,rem=Math.max(0,Math.ceil((e-now)/86400000));const opts={day:'numeric',month:'short'};const sub=now<s?`Ab ${s.toLocaleDateString('de',opts)}`:now>e?'Reise beendet':`Noch ${rem} Tag${rem!==1?'e':''}`;return `<div class="travel-banner"><span class="tb-icon">✈️</span><div class="tb-text"><b>${s.toLocaleDateString('de',opts)} – ${e.toLocaleDateString('de',opts)}</b><small>${sub} · ${days} Tage gesamt</small></div><span class="tb-days">${days}</span></div>`; }

function renderPanel(){
  const el=qs('#panelContent');if(!el)return;
  if(S.tab==='test'){renderTestTab();return;}
  const list=filtered();let h='';
  if(S.tab==='overview'){ h=`${tripBannerHtml()}<div class="stats"><div class="stat"><b>${DATA.length}</b><small>PR gesamt</small></div><div class="stat"><b>${list.length}</b><small>Sichtbar</small></div><div class="stat"><b>${favs.size}</b><small>Favoriten</small></div></div><button class="btn-primary" onclick="setTab('journal')">Alle PR anzeigen</button>`; }
  else if(S.tab==='journal'){ const sb=cfg.soloMode?`<div class="solo-banner"><span>Solo: ${cfg.soloId}</span><button onclick="exitSoloMode();renderPanel()">× Alle</button></div>`:'';h=`<div class="search-row"><input class="search-input" placeholder="PR suchen…" value="${S.query}" oninput="S.query=this.value;clearTimeout(window.__prxSearchT);window.__prxSearchT=setTimeout(()=>{renderLayers();renderPanel()},450)"></div><div class="sort-row"><span>Sortierung</span><select onchange="setSort(this.value)"><option value="id" ${cfg.sort==='id'?'selected':''}>PR-Nummer</option><option value="name" ${cfg.sort==='name'?'selected':''}>Name</option><option value="distance" ${cfg.sort==='distance'?'selected':''}>Track-Länge</option><option value="drive" ${cfg.sort==='drive'?'selected':''}>Anfahrtszeit</option><option value="elev" ${cfg.sort==='elev'?'selected':''}>Höhenmeter</option><option value="status" ${cfg.sort==='status'?'selected':''}>Status</option></select></div>${sb}<div class="list">${list.map(r=>prCardHtml(r,true)).join('')||'<div class="empty-state">Keine PR gefunden.</div>'}</div>`; }
  else if(S.tab==='trips'){ h=travelPlannerHtml(); }
  else if(S.tab==='options'){ h=`<div class="p-section">Kartenstil</div><div class="mode-grid">${Object.keys(BASE_LABELS).map(m=>`<button class="mode-chip ${cfg.base===m?'active':''}" onclick="setBase('${m}')">${BASE_LABELS[m]}</button>`).join('')}</div><div class="p-section">Ebenen</div><div class="sg-box" style="border-radius:18px;overflow:hidden;background:rgba(90,200,250,.04);border:1px solid rgba(90,200,250,.1)">${APP_LAYER_KEYS.map(k=>`<div class="opt-row"><span style="font-size:18px;width:28px;text-align:center">${OVERLAY_ICONS[k]}</span><span class="opt-label">${OVERLAY_LABELS[k]}</span><input type="checkbox" class="s-tog" ${cfg.layers[k]?'checked':''} onchange="setLayer('${k}',this.checked)"></div>`).join('')}</div><div class="p-section">POI-Reiseziele</div><div class="vector-info-card"><b>OSM Reise-POIs</b><span>${poiStatusHtml()}</span><button class="mini-btn" onclick="refreshPoiData()">POIs laden / aktualisieren</button><div class="poi-cat-grid">${Object.entries(POI_DEF).map(([k,d])=>`<button class="poi-cat-btn ${cfg.poiCats?.[k]!==false?'active':''}" onclick="setPoiCat('${k}',!(cfg.poiCats?.['${k}']!==false));event.stopPropagation();"><span>${d.icon}</span>${d.label}</button>`).join('')}</div><button class="mini-btn" onclick="googleMapsSearch('Cafe Madeira')">Google-Maps-Suche Test</button></div><div class="p-section">Hiking-Darstellung</div><div class="vector-info-card"><b>${hikingModeLabel()}</b>${hikingModeControlsHtml('panel')}<span>${cfg.hikingMode==='raster'?'Waymarked Trails Raster-Referenz aktiv.':cfg.hikingMode==='vector'?'Editierbare OSM-Vektorlinien aktiv.':cfg.hikingMode==='compare'?'Vergleichsmodus: Raster und Vektor bewusst übereinander.':'Keine zusätzliche Hiking-Ebene aktiv.'}</span></div><div class="p-section">OSM Hiking Vektor</div><div class="vector-info-card"><b>Editierbare Rohdaten-Linien</b><span>${hikingVectorStatusHtml()}</span><button class="mini-btn" onclick="refreshHikingVectorData()">Rohdaten laden / aktualisieren</button></div><button class="btn-primary" style="margin-top:14px" onclick="fitVisible();setTab('map')">Sichtbare PR einpassen</button>${v320OptionsHtml()}`; }
  el.innerHTML=h;
}

/* ELEVATION PROFILE */
function drawElevProfile(pr,canvasId){ const canvas=document.getElementById(canvasId);if(!canvas||!pr.elev||pr.elev.length<2)return;const elev=pr.elev,W=canvas.offsetWidth||300,H=100,dpr=window.devicePixelRatio||1;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);const minE=Math.min(...elev),maxE=Math.max(...elev),range=maxE-minE||1;const pad={t:8,b:20,l:38,r:8},cw=W-pad.l-pad.r,ch=H-pad.t-pad.b;const xOf=i=>pad.l+(i/(elev.length-1))*cw;const yOf=e=>pad.t+ch-((e-minE)/range)*ch;const grad=ctx.createLinearGradient(0,pad.t,0,pad.t+ch);grad.addColorStop(0,'rgba(90,200,250,.35)');grad.addColorStop(1,'rgba(90,200,250,.03)');ctx.beginPath();elev.forEach((e,i)=>i===0?ctx.moveTo(xOf(i),yOf(e)):ctx.lineTo(xOf(i),yOf(e)));ctx.lineTo(xOf(elev.length-1),pad.t+ch);ctx.lineTo(pad.l,pad.t+ch);ctx.closePath();ctx.fillStyle=grad;ctx.fill();ctx.beginPath();elev.forEach((e,i)=>i===0?ctx.moveTo(xOf(i),yOf(e)):ctx.lineTo(xOf(i),yOf(e)));ctx.strokeStyle='#5ac8fa';ctx.lineWidth=2;ctx.lineJoin='round';ctx.stroke();ctx.fillStyle='rgba(240,250,248,.4)';ctx.font='9px -apple-system,sans-serif';ctx.textAlign='right';ctx.fillText(Math.round(maxE)+'m',pad.l-3,pad.t+9);ctx.fillText(Math.round(minE)+'m',pad.l-3,pad.t+ch);ctx.textAlign='left';ctx.fillStyle='rgba(240,250,248,.32)';ctx.fillText('0',pad.l,H-3);ctx.textAlign='right';ctx.fillText((pr.distanceKm||'?')+'km',pad.l+cw,H-3); }

/* LOGOS */
const LOGOS={madeira:`<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#006B54"/><text x="20" y="27" text-anchor="middle" font-size="20" font-family="serif" font-weight="bold" fill="white">M</text></svg>`,instagram:`<svg viewBox="0 0 40 40"><defs><linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#feda75"/><stop offset="25%" stop-color="#fa7e1e"/><stop offset="50%" stop-color="#d62976"/><stop offset="75%" stop-color="#962fbf"/><stop offset="100%" stop-color="#4f5bd5"/></linearGradient></defs><rect width="40" height="40" rx="10" fill="url(#ig)"/><rect x="9" y="9" width="22" height="22" rx="6" fill="none" stroke="white" stroke-width="2.2"/><circle cx="20" cy="20" r="5.5" fill="none" stroke="white" stroke-width="2.2"/><circle cx="27.5" cy="12.5" r="1.5" fill="white"/></svg>`,googlemaps:`<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="white"/><path d="M20 8C15.58 8 12 11.58 12 16c0 6 8 16 8 16s8-10 8-16c0-4.42-3.58-8-8-8z" fill="#EA4335"/><circle cx="20" cy="16" r="3.5" fill="white"/></svg>`,anfahrt:`<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#34A853"/><path d="M10 22l5-5h10l5 5v5H10v-5z" fill="white" opacity=".9"/><circle cx="15" cy="29" r="2.5" fill="white"/><circle cx="25" cy="29" r="2.5" fill="white"/><path d="M20 11l-4 9h8l-4-9z" fill="white" opacity=".8"/></svg>`,youtube:`<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#FF0000"/><path d="M30 15.5s-.3-2-1.2-2.9c-1.1-1.2-2.4-1.2-3-1.3C23 11 20 11 20 11s-3 0-5.8.3c-.6.1-1.9.1-3 1.3-.9.9-1.2 2.9-1.2 2.9S10 17.8 10 20.1v2.1c0 2.3.3 4.6.3 4.6s.3 2 1.2 2.9c1.1 1.2 2.6 1.1 3.3 1.2C16.9 31 20 31 20 31s3 0 5.8-.3c.6-.1 1.9-.1 3-1.3.9-.9 1.2-2.9 1.2-2.9s.3-2.3.3-4.6v-2.1c0-2.3-.3-4.6-.3-4.6z" fill="#FF0000"/><path d="M17 24.5v-9l8 4.5-8 4.5z" fill="white"/></svg>`,komoot:`<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#6BC46D"/><path d="M20 8L10 23h6v9h8v-9h6L20 8z" fill="white"/></svg>`,strava:`<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#FC4C02"/><path d="M16 30l4-8 4 8" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 22l4-11 4 11" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/></svg>`,google:`<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#4285F4"/><text x="20" y="27" text-anchor="middle" font-size="20" font-weight="bold" font-family="sans-serif" fill="white">G</text></svg>`};
function linkHtml(p,label,url){ return `<a class="lk" href="${url||'#'}" target="_blank" rel="noopener"><div class="li">${LOGOS[p]||''}</div><span>${label}</span></a>`; }

/* DETAIL */
function renderDetail(){
  const r=S.selected;if(!r)return;
  const st=getSt(r.id),col=levelColor(r.level),isFav=favs.has(r.id),isLoop=r.loop!==false,hasElev=r.elev&&r.elev.length>2;
  const stBtns=Object.entries(STATUS_DEF).map(([k,d])=>`<button class="st-btn ${st===k?'st-active':''}" data-st="${k}" onclick="setSt('${r.id}','${k}')"><span class="dot"></span>${d.label}</button>`).join('');
  qs('#detailContent').innerHTML=`
    ${v322DetailNavHtml(r)}
    <div class="d-tag" style="background:${col}">${r.id} · ${fmt(r.level)}</div>
    <div class="d-name">${r.name}</div><div class="d-sub">${regionLabel(r)}</div>
    <div class="d-meta">
      <span class="d-pill teal-pill">📏 ${fmtKm(r.distanceKm)}</span>
      <span class="d-pill teal-pill">🕐 ${fmt(r.duration)}</span>
      <span class="d-pill teal-pill">🚗 ${fmtKm(r.driveKm)} · ${fmtMin(r.driveMin)}</span>
      <span class="d-pill teal-pill">↑ ${fmt(r.elevUp||r.high)} m</span>
      ${!isLoop?'<span class="d-pill warn-pill">⚠️ Kein Rundkurs</span>':''}
      <span class="d-pill" style="background:${STATUS_DEF[st].dot}22;border-color:${STATUS_DEF[st].dot}44;color:${STATUS_DEF[st].dot}">● ${STATUS_DEF[st].label}</span>
    </div>
    ${hasElev?`<div class="elev-wrap"><div class="elev-title">Höhenprofil</div><canvas id="elevCanvas" class="elev-canvas" width="300" height="100"></canvas><div class="elev-stats"><div class="elev-stat"><b>${fmt(r.elevMin||r.low)} m</b><small>Tiefpunkt</small></div><div class="elev-stat"><b>${fmt(r.elevMax||r.high)} m</b><small>Hochpunkt</small></div><div class="elev-stat"><b>↑ ${fmt(r.elevUp)} m</b><small>Aufstieg</small></div><div class="elev-stat"><b>↓ ${fmt(r.elevDown)} m</b><small>Abstieg</small></div></div></div>`:''}
    <div class="p-section">Status setzen</div>
    <div class="status-btns">${stBtns}</div>

    <div class="p-section">Terminplanung</div>
    ${scheduleHtml(r)}
    <div class="p-section">Links & Dienste</div>
    <div class="link-grid">
      ${linkHtml('madeira','Madeira.pt',r.officialUrl)}
      ${linkHtml('instagram','Instagram',`https://www.instagram.com/explore/tags/madeira${r.id.replace(' ','').toLowerCase()}/`)}
      ${linkHtml('googlemaps','Maps',r.startUrl)}
      ${linkHtml('anfahrt','Anfahrt',r.driveUrl)}
      ${linkHtml('youtube','YouTube',`https://www.youtube.com/results?search_query=madeira+${encodeURIComponent(r.id)}`)}
      ${linkHtml('komoot','Komoot',`https://www.komoot.com/search?q=madeira+${encodeURIComponent(r.name)}`)}
      ${linkHtml('strava','Strava','https://www.strava.com/segments/explore?bounds=32.6,-17.3,32.9,-16.6')}
      ${linkHtml('google','Suche',`https://www.google.com/search?q=madeira+${encodeURIComponent(r.id)}+${encodeURIComponent(r.name)}`)}
    </div>
    <button class="book-btn" onclick="toast('Buchungsseite…')"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Timeslot buchen</button>
    <button class="btn-primary" style="margin-top:8px" onclick="${isFav?'favs.delete':'favs.add'}('${r.id}');saveFavs();renderDetail();renderPanel()">${isFav?'★ Aus Favoriten':'♡ Zu Favoriten'}</button>
    <button class="btn-primary" style="margin-top:8px;background:rgba(90,200,250,.12);color:#5ac8fa" onclick="exportICS('${r.id}')"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 14 11 16 15 12"/></svg>Als Kalender-Event (.ics)</button>
    <div class="export-row"><button onclick="exportRouteFile('${r.id}','gpx')">GPX</button><button onclick="exportRouteFile('${r.id}','kml')">KML</button><button onclick="shareRouteFile('${r.id}','kml')">An Google Earth / Teilen</button></div>
    ${r.hint?`<div class="d-pill" style="width:100%;margin-top:8px;border-radius:14px;padding:10px 13px">💡 ${r.hint}</div>`:''}`;
  setTimeout(()=>drawElevProfile(r,'elevCanvas'),60);
}

/* ICS */
function pad2(n){ return String(n).padStart(2,'0'); }
function dtParts(v){
  const now=new Date();
  const raw=String(v||'');
  const d=raw.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
  return {date:d?d[1]:'', hour:d?d[2]:pad2(now.getHours()), minute:d?d[3]:(now.getMinutes()<30?'00':'30')};
}
function scheduleDomId(id,key,suffix){ return 'dt-'+String(id).replace(/[^a-z0-9]+/gi,'-')+'-'+key+'-'+suffix; }
function composeDt(id,key){
  const d=qs('#'+scheduleDomId(id,key,'date'))?.value||'';
  const h=qs('#'+scheduleDomId(id,key,'hour'))?.value||'08';
  const m=qs('#'+scheduleDomId(id,key,'minute'))?.value||'00';
  updatePrSchedule(id,key,d?`${d}T${h}:${m}`:'');
}
function timeSelectOptions(cur,from,to,step=1){
  let out=''; for(let i=from;i<=to;i+=step){const v=pad2(i); out+=`<option value="${v}" ${String(cur)===v?'selected':''}>${v}</option>`;} return out;
}
function scheduleInputHtml(id,key,label,val){
  const p=dtParts(val);
  return `<div class="sched-row sched-grid"><span>${label}</span><input id="${scheduleDomId(id,key,'date')}" type="date" value="${p.date}" onchange="composeDt('${id}','${key}')"><select id="${scheduleDomId(id,key,'hour')}" onchange="composeDt('${id}','${key}')">${timeSelectOptions(p.hour,0,23,1)}</select><select id="${scheduleDomId(id,key,'minute')}" onchange="composeDt('${id}','${key}')"><option value="00" ${p.minute==='00'?'selected':''}>00</option><option value="30" ${p.minute==='30'?'selected':''}>30</option></select></div>`;
}
function departureInfo(r){
  const sc=getPrSchedule(r.id); const start=sc.booked||sc.planned; if(!start)return null;
  const routeMin=Math.round((+(r.driveMin||0))*(+(cfg.driveTimeFactor||1)));
  const extra=(+(cfg.parkingBufferMin||0))+(+(cfg.walkStartBufferMin||0));
  const total=routeMin+extra;
  const startDate=new Date(start); const dep=new Date(startDate.getTime()-total*60000);
  return {start:startDate,departure:dep,routeMin,extra,total};
}
function scheduleHtml(r){
  const sc=getPrSchedule(r.id); const info=departureInfo(r);
  const dep=info?`<div class="sched-calc"><b>Abfahrt Hotel:</b> ${info.departure.toLocaleString('de',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}<br><small>Rechnung: Google ${r.driveMin||0} min × ${cfg.driveTimeFactor||1} = ${info.routeMin} min + Parkplatz ${cfg.parkingBufferMin||0} min + Weg zum Start ${cfg.walkStartBufferMin||0} min</small></div>`:'';
  return `<div class="schedule-box">
  ${scheduleInputHtml(r.id,'planned','Geplanter Termin',sc.planned)}
  ${scheduleInputHtml(r.id,'booked','IFCN gebucht',sc.booked)}
  ${dep}
  <div class="sched-actions"><button onclick="clearPrSchedule('${r.id}','planned')">Planung leeren</button><button onclick="clearPrSchedule('${r.id}','booked')">Buchung leeren</button><button class="sched-ics" onclick="exportBookedICS('${r.id}')">Gebucht als iOS-Kalender</button></div>
</div>`;
}
function clearPrSchedule(id,key){ if(!prSchedule[id])return; prSchedule[id][key]=''; savePrSchedule(); renderDetail(); renderPanel(); }
function icsDateFromDate(d){ return `${d.getFullYear()}${pad2(d.getMonth()+1)}${pad2(d.getDate())}T${pad2(d.getHours())}${pad2(d.getMinutes())}00`; }
function icsDateLocal(v){ return icsDateFromDate(new Date(v)); }
function escICS(s){ return String(s||'').replace(/\\/g,'\\\\').replace(/,/g,'\\,').replace(/;/g,'\\;').replace(/\n/g,'\\n'); }
function triggerFromMinutes(min){ min=Math.max(0,Math.round(+min||0)); if(min%1440===0 && min>=1440)return `-P${min/1440}D`; const h=Math.floor(min/60),m=min%60; return `-PT${h?`${h}H`:''}${m?`${m}M`:(!h?'0M':'')}`; }
function buildPrICS(r,startLocal){
  const sc=getPrSchedule(r.id);
  const info=departureInfo(r);
  const eventStart=info?info.departure:new Date(startLocal);
  const prStart=sc.booked||sc.planned||startLocal;
  const end=new Date(new Date(prStart).getTime()+30*60000);
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  return [
    'BEGIN:VCALENDAR','VERSION:2.0',`PRODID:-//PR Explorer ${APP_VERSION}//DE`,'BEGIN:VEVENT',
    `UID:pr-${r.id.replace(/\s+/g,'-')}-${Date.now()}@pr-explorer`,
    `DTSTAMP:${stamp}`,`DTSTART:${icsDateFromDate(eventStart)}`,`DTEND:${icsDateFromDate(end)}`,
    `SUMMARY:${escICS('Abfahrt Hotel · '+r.id+' · '+r.name)}`,
    `DESCRIPTION:${escICS('IFCN/PR-Termin: '+new Date(prStart).toLocaleString('de')+'\nAbfahrt Hotel: '+eventStart.toLocaleString('de')+'\nFahrzeit Google: '+(r.driveMin||0)+' min · Faktor '+(cfg.driveTimeFactor||1)+' · Parkplatz '+(cfg.parkingBufferMin||0)+' min · Weg zum Start '+(cfg.walkStartBufferMin||0)+' min\n'+(r.distanceKm||'?')+' km · '+(r.duration||'?'))}`,
    'LOCATION:Pestana Promenade\, Funchal',
    'BEGIN:VALARM',`TRIGGER:${triggerFromMinutes(cfg.reminderDayMin||1440)}`,'ACTION:DISPLAY',`DESCRIPTION:${escICS(r.id+' morgen / Vorbereitung')}`,'END:VALARM',
    'BEGIN:VALARM',`TRIGGER:${triggerFromMinutes(cfg.reminderDepartMin||120)}`,'ACTION:DISPLAY',`DESCRIPTION:${escICS(r.id+' Abfahrt in '+(cfg.reminderDepartMin||120)+' Minuten')}`,'END:VALARM',
    'END:VEVENT','END:VCALENDAR'
  ].join('\n');
}
function exportBookedICS(id){ const r=DATA.find(x=>x.id===id); const sc=getPrSchedule(id); if(!r||!sc.booked){toast('Kein IFCN-Termin eingetragen');return;} downloadBlob(buildPrICS(r,sc.booked),`${r.id.replace(' ','-')}-IFCN-Abfahrt.ics`,'text/calendar'); toast('ICS mit Hotel-Abfahrt erstellt'); }
function exportICS(id){ const r=DATA.find(x=>x.id===id);if(!r)return; const sc=getPrSchedule(id); const start=sc.booked||sc.planned||(cfg.tripStart?cfg.tripStart+'T08:00':new Date().toISOString().slice(0,16)); downloadBlob(buildPrICS(r,start),`${r.id.replace(' ','-')}.ics`,'text/calendar');toast('Kalender-Event exportiert'); }


/* ROUTE EXPORT */
function xmlEsc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function htmlEsc(s){ return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function fileBase(r){ return String(r.id||'PR').replace(/\s+/g,'-')+'-'+String(r.name||'Route').replace(/[^a-z0-9äöüß-]+/gi,'-').slice(0,40); }
function kmlCoords(points){ return (points||[]).map(p=>`${p[1]},${p[0]},0`).join(' '); }
function buildKML(r){ const tr=r.track||[], dr=r.driveRoute||[]; return `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>${xmlEsc(r.id+' '+r.name)}</name>${tr.length?`<Placemark><name>${xmlEsc(r.id+' GPX Wanderweg')}</name><Style><LineStyle><color>ff303bff</color><width>5</width></LineStyle></Style><LineString><tessellate>1</tessellate><coordinates>${kmlCoords(tr.map(p=>[p[0],p[1]]))}</coordinates></LineString></Placemark>`:''}${dr.length?`<Placemark><name>${xmlEsc(r.id+' KML Anfahrt')}</name><Style><LineStyle><color>ffff7a00</color><width>5</width></LineStyle></Style><LineString><tessellate>1</tessellate><coordinates>${kmlCoords(dr)}</coordinates></LineString></Placemark>`:''}</Document></kml>`; }
function buildGPX(r){ const pts=(r.track||[]).map(p=>`<trkpt lat="${p[0]}" lon="${p[1]}"></trkpt>`).join(''); return `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="PR Explorer ${APP_VERSION}" xmlns="http://www.topografix.com/GPX/1/1"><metadata><name>${xmlEsc(r.id+' '+r.name)}</name></metadata><trk><name>${xmlEsc(r.id+' '+r.name)}</name><trkseg>${pts}</trkseg></trk></gpx>`; }
function downloadBlob(txt,name,type){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([txt],{type})); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }
function exportRouteFile(id,kind){ const r=DATA.find(x=>x.id===id); if(!r)return; if(kind==='gpx'){ if(!r.track?.length){toast('Keine GPX-Route vorhanden');return;} downloadBlob(buildGPX(r),fileBase(r)+'.gpx','application/gpx+xml'); } else { downloadBlob(buildKML(r),fileBase(r)+'.kml','application/vnd.google-earth.kml+xml'); } toast(kind.toUpperCase()+' exportiert'); }
async function shareRouteFile(id,kind='kml'){ const r=DATA.find(x=>x.id===id); if(!r)return; const txt=kind==='gpx'?buildGPX(r):buildKML(r); const name=fileBase(r)+'.'+kind; const type=kind==='gpx'?'application/gpx+xml':'application/vnd.google-earth.kml+xml'; const file=new File([txt],name,{type}); if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:name,text:r.id+' · '+r.name}); } else { downloadBlob(txt,name,type); toast('Datei erstellt – über Teilen/Dateien an Google Earth öffnen'); } }

function prInfoText(r){ return `${r.id} · ${r.name}
Region: ${regionLabel(r)}
Strecke: ${r.distanceKm||'–'} km · Dauer: ${r.duration||'–'}
Anfahrt: ${r.driveKm||'–'} km · ${r.driveMin||'–'} min
Höhenmeter: ↑ ${r.elevUp||'–'} m / ↓ ${r.elevDown||'–'} m
Status: ${(STATUS_DEF[getSt(r.id)]||{}).label||getSt(r.id)}
Madeira: ${r.officialUrl||''}
Maps: ${r.startUrl||''}`; }
function filteredCsv(){ const rows=filtered(); const head=['id','name','region','distanceKm','driveKm','driveMin','elevUp','status']; return [head.join(';')].concat(rows.map(r=>[r.id,r.name,regionLabel(r),r.distanceKm||'',r.driveKm||'',r.driveMin||'',r.elevUp||'',(STATUS_DEF[getSt(r.id)]||{}).label||getSt(r.id)].map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';'))).join('\n'); }
async function shareText(title,txt,name='pr-explorer.txt'){
  if(navigator.share){ try{ await navigator.share({title,text:txt}); return; }catch(e){} }
  if(navigator.clipboard){ try{ await navigator.clipboard.writeText(txt); toast('In Zwischenablage kopiert'); return; }catch(e){} }
  downloadBlob(txt,name,'text/plain');
}
function openShareSheet(){
  let box=qs('#shareChoiceBox');
  if(!box){ box=document.createElement('div'); box.id='shareChoiceBox'; box.className='manual-copy-box'; document.body.appendChild(box); }
  const r=S.selected;
  box.innerHTML=`<div class="manual-copy-card share-card"><div class="manual-copy-head"><b>Teilen / Export</b><button onclick="document.getElementById('shareChoiceBox').remove()">×</button></div>
    <p>Wähle den Datensatz. iOS entscheidet danach, ob Share-Sheet, Zwischenablage oder Datei verwendet wird.</p>
    <button class="share-opt" onclick="shareTestReport()">Audit / Testbericht teilen</button>
    <button class="share-opt" onclick="shareText('PR Explorer gefilterte Liste',filteredCsv(),'pr-gefiltert.csv')">Gefilterte PR-Liste CSV</button>
    ${r?`<button class="share-opt" onclick="shareText('${r.id} Info',prInfoText(S.selected),'${r.id.replace(' ','-')}-info.txt')">Aktive PR-Info</button><button class="share-opt" onclick="shareRouteFile('${r.id}','gpx')">Aktive PR · GPX teilen</button><button class="share-opt" onclick="shareRouteFile('${r.id}','kml')">Aktive PR · KML/Anfahrt teilen</button>`:'<small>Für PR-Info/GPX/KML zuerst eine PR-Detailseite öffnen.</small>'}
  </div>`;
}

function exportTripICS(){ if(!cfg.tripStart||!cfg.tripEnd)return;const s=cfg.tripStart.replace(/-/g,''),e=cfg.tripEnd.replace(/-/g,'');const ics=`BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//PR Explorer Claude V2.1//DE\nBEGIN:VEVENT\nUID:trip-madeira-${Date.now()}@pr-explorer\nDTSTAMP:${s}T120000Z\nDTSTART;VALUE=DATE:${s}\nDTEND;VALUE=DATE:${e}\nSUMMARY:🌴 Madeira Wanderurlaub\nDESCRIPTION:PR Explorer Reisezeitraum\nLOCATION:Madeira\\, Portugal\nEND:VEVENT\nEND:VCALENDAR`;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='Madeira-Urlaub.ics';a.click();toast('Reisezeitraum exportiert'); }

/* SETTINGS */
function openSettings(){
  closeDetail();
  closeAllSheets(false);
  const panel=qs('#settingsPanel');
  if(panel)panel.classList.remove('hidden');
  try{ renderSettings(); }
  catch(err){
    console.error('Settings render failed',err);
    const c=qs('#settingsContent');
    if(c)c.innerHTML=settingsFallbackHtml(err);
  }
  setTimeout(()=>map.invalidateSize(),80);
}
function closeSettings(){ qs('#settingsPanel').classList.add('hidden'); }
function fmtDate(d){ if(!d)return '–';return new Date(d).toLocaleDateString('de',{day:'numeric',month:'short',year:'numeric'}); }
function lineStyleBtns(cfgKey,def){ return ['solid','dashed','dotted'].map(s=>`<button class="line-style-btn ${(cfg[cfgKey]||def)===s?'ls-active':''}" onclick="cfg['${cfgKey}']='${s}';saveCfg();renderLayers();renderSettings()">${s==='solid'?'━━━':s==='dashed'?'╌╌╌':'···'}</button>`).join(''); }

function changelogHtml(){
  return `<div class="sg"><div class="sg-title">Änderungslogbuch</div><div class="sg-box"><div class="changelog-list">${APP_CHANGELOG.map(v=>`<div class="clog-item"><div class="clog-head"><b>${v.version} · ${v.title}</b><small>${v.date}</small></div><ul>${v.changes.map(c=>`<li>${c}</li>`).join('')}</ul></div>`).join('')}</div></div></div>`;
}
function renderSettings(){
  const dL=cfg.tripStart&&cfg.tripEnd?`${fmtDate(cfg.tripStart)} – ${fmtDate(cfg.tripEnd)}`:'Nicht gesetzt';
  qs('#settingsContent').innerHTML=`
    ${cfg.tripStart&&cfg.tripEnd?tripBannerHtml():''}
    <div class="sg"><div class="sg-title">Reisezeitraum</div><div class="sg-box">
      <div class="sg-row" onclick="openDateSheet()"><div class="sg-icon" style="background:rgba(90,200,250,.1)">📅</div><span class="sg-label">Zeitraum</span><span class="sg-val">${dL}<svg class="sg-chev" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></span></div>
      <div class="sg-row" style="cursor:default;flex-direction:column;align-items:stretch;padding:12px 16px;gap:8px"><span class="sg-label">Direkte Eingabe</span><div class="home-grid"><input class="home-input" type="date" value="${cfg.tripStart||''}" onchange="cfg.tripStart=this.value||null;saveCfg();renderSettings();renderPanel()"><input class="home-input" type="date" value="${cfg.tripEnd||''}" onchange="cfg.tripEnd=this.value||null;saveCfg();renderSettings();renderPanel()"></div></div>
    </div></div>
    <div class="sg"><div class="sg-title">Abfahrt & Kalender</div><div class="sg-box">
      <div class="sg-row" style="cursor:default"><span class="sg-label">Fahrzeit-Faktor</span><input class="mini-num" type="number" min="0.5" max="2.5" step="0.05" value="${cfg.driveTimeFactor}" onchange="cfg.driveTimeFactor=+this.value||1;saveCfg();renderSettings();renderDetail()"></div>
      <div class="sg-row" style="cursor:default"><span class="sg-label">Parkplatzsuche min</span><input class="mini-num" type="number" min="0" max="120" step="5" value="${cfg.parkingBufferMin}" onchange="cfg.parkingBufferMin=+this.value||0;saveCfg();renderSettings();renderDetail()"></div>
      <div class="sg-row" style="cursor:default"><span class="sg-label">Weg Parkplatz → Start min</span><input class="mini-num" type="number" min="0" max="120" step="5" value="${cfg.walkStartBufferMin}" onchange="cfg.walkStartBufferMin=+this.value||0;saveCfg();renderSettings();renderDetail()"></div>
      <div class="sg-row" style="cursor:default"><span class="sg-label">Erinnerung 1 min vorher</span><input class="mini-num" type="number" min="0" max="2880" step="30" value="${cfg.reminderDayMin}" onchange="cfg.reminderDayMin=+this.value||1440;saveCfg();renderSettings()"></div>
      <div class="sg-row" style="cursor:default"><span class="sg-label">Erinnerung 2 min vorher</span><input class="mini-num" type="number" min="0" max="1440" step="30" value="${cfg.reminderDepartMin}" onchange="cfg.reminderDepartMin=+this.value||120;saveCfg();renderSettings()"></div>
    </div></div>
    <div class="sg"><div class="sg-title">GPX Wanderweg</div><div class="sg-box">
      <div class="sg-row" onclick="openColorSheet('gpx','GPX Farbe')"><div class="sg-icon" style="background:rgba(90,200,250,.1)">🎨</div><span class="sg-label">Farbe</span><span class="sg-val"><div class="sg-cdot" style="background:${cfg.gpxColor}"></div><svg class="sg-chev" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></span></div>
      <div class="sg-row" style="cursor:default;flex-direction:column;align-items:stretch;padding:12px 16px;gap:8px">
        <div style="display:flex;justify-content:space-between"><span class="sg-label">Strichstärke</span><span id="gpwVal" style="font-size:13px;color:var(--teal);font-weight:700">${cfg.gpxWeight||3}px</span></div>
        <input type="range" min="1" max="8" step="0.5" value="${cfg.gpxWeight||3}" class="s-range-sl" oninput="cfg.gpxWeight=+this.value;saveCfg();renderLayers();qs('#gpwVal').textContent=this.value+'px'">
        <div class="line-style-row">${lineStyleBtns('gpxDash','solid')}</div>
      </div>
      <div class="sg-row" style="cursor:default;flex-direction:column;align-items:stretch;padding:12px 16px;gap:8px">
        <div style="display:flex;justify-content:space-between"><span class="sg-label">Konturbreite</span><span id="gpoxVal" style="font-size:13px;color:var(--teal);font-weight:700">${cfg.gpxOutlineWeight||0}px</span></div>
        <input type="range" min="0" max="8" step="0.5" value="${cfg.gpxOutlineWeight||0}" class="s-range-sl" oninput="cfg.gpxOutlineWeight=+this.value;saveCfg();renderLayers();qs('#gpoxVal').textContent=this.value+'px'">
      </div>
    </div></div>
    <div class="sg"><div class="sg-title">KML Anfahrt</div><div class="sg-box">
      <div class="sg-row" onclick="openColorSheet('kml','KML Farbe')"><div class="sg-icon" style="background:rgba(255,149,0,.1)">🎨</div><span class="sg-label">Farbe</span><span class="sg-val"><div class="sg-cdot" style="background:${cfg.kmlColor}"></div><svg class="sg-chev" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></span></div>
      <div class="sg-row" style="cursor:default;flex-direction:column;align-items:stretch;padding:12px 16px;gap:8px">
        <div style="display:flex;justify-content:space-between"><span class="sg-label">Strichstärke</span><span id="kmwVal" style="font-size:13px;color:var(--orange);font-weight:700">${cfg.kmlWeight||2}px</span></div>
        <input type="range" min="1" max="8" step="0.5" value="${cfg.kmlWeight||2}" class="s-range-sl" oninput="cfg.kmlWeight=+this.value;saveCfg();renderLayers();qs('#kmwVal').textContent=this.value+'px'">
        <div class="line-style-row">${lineStyleBtns('kmlDash','dashed')}</div>
      </div>
      <div class="sg-row" style="cursor:default;flex-direction:column;align-items:stretch;padding:12px 16px;gap:8px">
        <div style="display:flex;justify-content:space-between"><span class="sg-label">Konturbreite</span><span id="kmoxVal" style="font-size:13px;color:var(--orange);font-weight:700">${cfg.kmlOutlineWeight||0}px</span></div>
        <input type="range" min="0" max="8" step="0.5" value="${cfg.kmlOutlineWeight||0}" class="s-range-sl" oninput="cfg.kmlOutlineWeight=+this.value;saveCfg();renderLayers();qs('#kmoxVal').textContent=this.value+'px'">
      </div>
    </div></div>
    <div class="sg"><div class="sg-title">Kartenpin</div><div class="sg-box">
      <div class="sg-row" onclick="openColorSheet('pin','Pin Farbe')"><div class="sg-icon" style="background:rgba(255,149,0,.1)">📍</div><span class="sg-label">Farbe</span><span class="sg-val"><div class="sg-cdot" style="background:${cfg.pinColor}"></div><svg class="sg-chev" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></span></div>
      <div class="sg-row" onclick="openIconSheet()"><div class="sg-icon" style="font-size:20px">${cfg.pinIcon}</div><span class="sg-label">Icon</span><span class="sg-val">${cfg.pinIcon}<svg class="sg-chev" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></span></div>
      <div class="sg-row" style="cursor:default;flex-direction:column;align-items:stretch;padding:12px 16px;gap:8px">
        <div style="display:flex;justify-content:space-between"><span class="sg-label">Größe</span><span id="psVal" style="font-size:13px;color:var(--teal);font-weight:700">${Math.round((cfg.pinSize||1)*100)}%</span></div>
        <input type="range" min="0.5" max="2.0" step="0.1" value="${cfg.pinSize||1.0}" class="s-range-sl" oninput="cfg.pinSize=+this.value;saveCfg();renderLayers();qs('#psVal').textContent=Math.round(this.value*100)+'%'">
      </div>
      <div class="sg-row" style="cursor:default;flex-direction:column;align-items:stretch;padding:12px 16px">
        <span class="sg-label" style="margin-bottom:10px">Form</span>
        <div class="pin-shapes">${[['tag','🏷️'],['circle','⚪'],['square','🔲'],['diamond','🔷']].map(([sh,em])=>`<div class="pin-shape-opt ${cfg.pinShape===sh?'active':''}" onclick="setPinShape('${sh}')">${em}</div>`).join('')}</div>
      </div>
    </div></div>
    <div class="sg"><div class="sg-title">OSM Reise-POIs</div><div class="sg-box">
      <div class="sg-row" style="cursor:default"><span class="sg-label">POIs anzeigen</span><input type="checkbox" class="s-tog" ${cfg.layers.pois?'checked':''} onchange="setLayer('pois',this.checked);renderSettings()"></div>
      <div class="sg-row" style="cursor:default"><span class="sg-label">Anzeige nur im Radius</span><input type="checkbox" class="s-tog" ${(cfg.poiMode||'near')==='near'?'checked':''} onchange="cfg.poiMode=this.checked?'near':'all';saveCfg();drawPois();renderSettings()"></div>
      <div class="sg-row" style="cursor:default;flex-direction:column;align-items:stretch;padding:12px 16px;gap:8px"><div style="display:flex;justify-content:space-between"><span class="sg-label">POI-Radius aktiver PR</span><span id="poiRadVal" style="font-size:13px;color:var(--teal);font-weight:700">${cfg.poiRadiusKm||3} km</span></div><input type="range" min="0.5" max="12" step="0.5" value="${cfg.poiRadiusKm||3}" class="s-range-sl" oninput="cfg.poiRadiusKm=+this.value;saveCfg();drawPois();qs('#poiRadVal').textContent=this.value+' km'"></div>
      <div class="sg-row" style="cursor:default;flex-direction:column;align-items:stretch;padding:12px 16px;gap:8px"><div style="display:flex;justify-content:space-between"><span class="sg-label">POI-Größe</span><span id="poiSizeVal" style="font-size:13px;color:var(--teal);font-weight:700">${Math.round((cfg.poiSize||1)*100)}%</span></div><input type="range" min="0.6" max="1.8" step="0.1" value="${cfg.poiSize||1}" class="s-range-sl" oninput="cfg.poiSize=+this.value;saveCfg();drawPois();qs('#poiSizeVal').textContent=Math.round(this.value*100)+'%'"></div>
      <div class="poi-cat-grid">${Object.entries(POI_DEF).map(([k,d])=>`<button class="poi-cat-btn ${cfg.poiCats?.[k]!==false?'active':''}" onclick="setPoiCat('${k}',!(cfg.poiCats?.['${k}']!==false));event.stopPropagation();"><span>${d.icon}</span>${d.label}</button>`).join('')}</div>
    </div></div>
    <div class="sg"><div class="sg-title">Ebenen</div><div class="sg-box">
      ${APP_LAYER_KEYS.map(k=>`<div class="sg-row" style="cursor:default"><span class="sg-label">${OVERLAY_ICONS[k]} ${OVERLAY_LABELS[k]}</span><input type="checkbox" class="s-tog" ${cfg.layers[k]?'checked':''} onchange="setLayer('${k}',this.checked);renderSettings()"></div>`).join('')}
    </div></div>
    <div class="sg"><div class="sg-title">Hiking-Darstellung</div><div class="sg-box">
      <div class="sg-row" style="cursor:default;flex-direction:column;align-items:stretch;padding:12px 16px"><span class="sg-label" style="margin-bottom:10px">Modus: ${hikingModeLabel()}</span>${hikingModeControlsHtml('settings')}</div>
    </div></div>
    <div class="sg"><div class="sg-title">OSM Hiking Vektorlinien</div><div class="sg-box">
      <div class="sg-row" style="cursor:default"><span class="sg-label">Status</span><span class="sg-val">${hikingVectorStatusHtml()}</span></div>
      <div class="sg-row" onclick="refreshHikingVectorData()"><div class="sg-icon" style="background:rgba(191,90,242,.12)">↻</div><span class="sg-label">OSM-Rohdaten laden / aktualisieren</span><span class="sg-val">Overpass<svg class="sg-chev" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></span></div>
      <div class="sg-row" onclick="openColorSheet('hikingVector','Einheitliche Linienfarbe')"><div class="sg-icon" style="background:rgba(52,199,89,.12)">🎨</div><span class="sg-label">Linienfarbe</span><span class="sg-val"><div class="sg-cdot" style="background:${cfg.hikingVectorColor}"></div><svg class="sg-chev" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></span></div>
      <div class="sg-row" style="cursor:default;flex-direction:column;align-items:stretch;padding:12px 16px"><span class="sg-label" style="margin-bottom:10px">Farbmodus</span><div class="line-style-row">${[['uniform','Einheitlich'],['osm','OSM-Farbe'],['network','Netzwerk']].map(([v,l])=>`<button class="line-style-btn ${(cfg.hikingVectorColorMode||'uniform')===v?'ls-active':''}" onclick="setHikingColorMode('${v}')">${l}</button>`).join('')}</div></div>
      <div class="sg-row" style="cursor:default;flex-direction:column;align-items:stretch;padding:12px 16px;gap:8px"><div style="display:flex;justify-content:space-between"><span class="sg-label">Linienstärke</span><span id="hvwVal" style="font-size:13px;color:var(--purple);font-weight:700">${cfg.hikingVectorWeight||3}px</span></div><input type="range" min="1" max="8" step="0.5" value="${cfg.hikingVectorWeight||3}" class="s-range-sl" oninput="cfg.hikingVectorWeight=+this.value;saveCfg();renderHikingVectorLayers();qs('#hvwVal').textContent=this.value+'px'"></div>
      <div class="sg-row" style="cursor:default;flex-direction:column;align-items:stretch;padding:12px 16px;gap:8px"><div style="display:flex;justify-content:space-between"><span class="sg-label">Deckkraft</span><span id="hvoVal" style="font-size:13px;color:var(--purple);font-weight:700">${Math.round((cfg.hikingVectorOpacity||.95)*100)}%</span></div><input type="range" min="0.25" max="1" step="0.05" value="${cfg.hikingVectorOpacity||.95}" class="s-range-sl" oninput="cfg.hikingVectorOpacity=+this.value;saveCfg();renderHikingVectorLayers();qs('#hvoVal').textContent=Math.round(this.value*100)+'%'"></div>
      <div class="sg-row" style="cursor:default;flex-direction:column;align-items:stretch;padding:12px 16px"><span class="sg-label" style="margin-bottom:10px">Konturlinie</span><div class="line-style-row">${['auto','white','black','off'].map(v=>`<button class="line-style-btn ${(cfg.hikingVectorOutline||'auto')===v?'ls-active':''}" onclick="setHikingOutline('${v}')">${v==='auto'?'Auto':v==='white'?'Weiß':v==='black'?'Schwarz':'Aus'}</button>`).join('')}</div></div>
      <div class="sg-row" style="cursor:default"><span class="sg-label">Labels anzeigen</span><input type="checkbox" class="s-tog" ${cfg.hikingVectorLabels?'checked':''} onchange="setHikingLabels(this.checked)"></div>
    </div></div>
    <div class="sg"><div class="sg-title">Home-PIN</div><div class="sg-box">
      <div class="sg-row" style="cursor:default"><span class="sg-label">Home-PIN anzeigen</span><input type="checkbox" class="s-tog" ${cfg.home?.show!==false?'checked':''} onchange="setHomeField('show',this.checked)"></div>
      <div class="sg-row" style="cursor:default;flex-direction:column;align-items:stretch;padding:12px 16px;gap:8px"><span class="sg-label">Bezeichnung</span><input class="home-input" value="${htmlEsc(cfg.home?.label||'Pestana Promenade')}" onchange="setHomeField('label',this.value)"></div>
      <div class="sg-row" style="cursor:default;flex-direction:column;align-items:stretch;padding:12px 16px;gap:8px"><span class="sg-label">Koordinaten</span><div class="home-grid"><input class="home-input" value="${cfg.home?.lat??''}" onchange="setHomeField('lat',this.value)"><input class="home-input" value="${cfg.home?.lon??''}" onchange="setHomeField('lon',this.value)"></div><small class="home-note">Voreinstellung ist eine editierbare Näherungsposition. Vor Reisebeginn bitte gegen Karten-App prüfen.</small></div>
    </div></div>
    <div class="sg"><div class="sg-title">Grundeinstellungen</div><div class="sg-box">
      <div class="sg-row" style="cursor:default"><span class="sg-label">Test-Schalter anzeigen</span><input type="checkbox" class="s-tog" ${cfg.showTestToggle?'checked':''} onchange="cfg.showTestToggle=this.checked;saveCfg();syncTestToggle();renderSettings()"></div>
    </div></div>
    ${changelogHtml()}
    <div class="s-footer">PR Explorer · ${APP_VERSION} · Midnight Teal<br>Alle Einstellungen lokal gespeichert.</div>`;
}
function setPinShape(sh){ cfg.pinShape=sh;saveCfg();renderLayers();renderSettings(); }

/* COLOR PICKER */
const PALETTE=['#ff3b30','#ff6b4a','#ff9500','#ff9f0a','#ffd60a','#34c759','#30d158','#5ac8fa','#32ade6','#007aff','#0a84ff','#5e5ce6','#bf5af2','#ff375f','#0c8f74','#1a6b5a','#e18b21','#fc4c02','#6bc46d','#1a73e8','#4285f4','#000000','#1c1c1e','#636366','#8e8e93','#ffffff'];
let _cpTarget='gpx',_cpColor='#5ac8fa';
function openColorSheet(t,title){ _cpTarget=t;_cpColor=cfg[t+'Color']||'#5ac8fa';qs('#colorSheetTitle').textContent=title||'Farbe';buildColorGrid();syncSwatch();qs('#colorSheet').classList.remove('hidden');qs('#backdrop').classList.remove('hidden');setColorTab('grid'); }
function buildColorGrid(){ qs('#colorGrid').innerHTML=PALETTE.map(c=>`<div class="cc ${c===_cpColor?'sel':''}" style="background:${c}" onclick="pickColor('${c}')"></div>`).join(''); }
function pickColor(c){ _cpColor=c;buildColorGrid();syncSwatch();syncSliders(); }
function syncSwatch(){ qs('#colorSwatch').style.background=_cpColor;qs('#colorSwatchHex').textContent='#'+_cpColor.replace('#','').toUpperCase(); }
function setColorTab(tab){ qsa('.ctab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab)); qs('#colorGrid').classList.toggle('hidden',tab!=='grid'); qs('#colorSliders').classList.toggle('hidden',tab!=='sliders'); syncSliders(); }
function paintColorSliders(){ const r=qs('#slR'),g=qs('#slG'),b=qs('#slB'); if(!r||!g||!b)return; r.style.background='linear-gradient(90deg,#000,rgb(255,0,0))'; g.style.background='linear-gradient(90deg,#000,rgb(0,255,0))'; b.style.background='linear-gradient(90deg,#000,rgb(0,0,255))'; }
function syncSliders(){ const h=_cpColor.replace('#','');const r=parseInt(h.slice(0,2),16)||0,g=parseInt(h.slice(2,4),16)||0,b=parseInt(h.slice(4,6),16)||0;qs('#slR').value=r;qs('#slRv').textContent=r;qs('#slG').value=g;qs('#slGv').textContent=g;qs('#slB').value=b;qs('#slBv').textContent=b; if(qs('#slDark')){qs('#slDark').value=0;qs('#slDarkv').textContent='0%';} qs('#hexInput').value=h.toUpperCase();paintColorSliders(); }
function sliderChanged(){ const r=+qs('#slR').value,g=+qs('#slG').value,b=+qs('#slB').value;qs('#slRv').textContent=r;qs('#slGv').textContent=g;qs('#slBv').textContent=b;_cpColor=`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;qs('#hexInput').value=_cpColor.replace('#','').toUpperCase();syncSwatch();paintColorSliders(); }
function hexChanged(){ const v=qs('#hexInput').value.replace('#','');if(v.length===6){_cpColor='#'+v;syncSwatch();buildColorGrid();syncSliders();} }
function darkenChanged(){ const d=(+qs('#slDark').value||0)/100; qs('#slDarkv').textContent=Math.round(d*100)+'%'; const h=_cpColor.replace('#',''); let r=parseInt(h.slice(0,2),16)||0,g=parseInt(h.slice(2,4),16)||0,b=parseInt(h.slice(4,6),16)||0; r=Math.round(r*(1-d)); g=Math.round(g*(1-d)); b=Math.round(b*(1-d)); _cpColor=`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`; syncSwatch(); qs('#hexInput').value=_cpColor.replace('#','').toUpperCase(); qs('#slR').value=r; qs('#slG').value=g; qs('#slB').value=b; qs('#slRv').textContent=r; qs('#slGv').textContent=g; qs('#slBv').textContent=b; buildColorGrid(); }
function confirmColor(){ cfg[_cpTarget+'Color']=_cpColor;saveCfg();renderLayers();renderHikingVectorLayers();renderSettings();closeColorSheet(); }
function closeColorSheet(){ qs('#colorSheet').classList.add('hidden');closeBackdrop(); }

/* ICON PICKER */
const ICONS={'Wandern & Natur':['🥾','⛰️','🏔️','🌋','🗻','🏕️','⛺','🌿','🍃','🌱','🌊','🏞️','🛤️','🗺️'],'Navigation':['📍','📌','🚩','🏁','⭐','⚡','🔵','🟢','🔴','🟡','⚪','🔲','🔷'],'Transport':['🚗','🚌','🚶','🚴','🛵','⛵','✈️'],'Aktivitäten':['🏃','🧗','🏊','🤿','🏄','🎯','🏆','🥇']};
let _iconPick=cfg.pinIcon||'🥾';
function openIconSheet(){ _iconPick=cfg.pinIcon||'🥾';buildIconGrid('');qs('#iconSheet').classList.remove('hidden');qs('#backdrop').classList.remove('hidden');qs('#iconSearchInput').value=''; }
function buildIconGrid(q){ const g=qs('#iconGrid');g.innerHTML='';Object.entries(ICONS).forEach(([sec,arr])=>{const f=q?arr.filter(i=>i.includes(q)):arr;if(!f.length)return;g.innerHTML+=`<div class="ic-section">${sec}</div>`;f.forEach(i=>{g.innerHTML+=`<div class="ic ${i===_iconPick?'sel':''}" onclick="pickIcon('${i}')">${i}</div>`;});}); }
function filterIcons(q){ buildIconGrid(q); }
function pickIcon(i){ _iconPick=i;buildIconGrid(qs('#iconSearchInput').value); }
function confirmIcon(){ cfg.pinIcon=_iconPick;saveCfg();renderLayers();renderSettings();closeIconSheet(); }
function closeIconSheet(){ qs('#iconSheet').classList.add('hidden');closeBackdrop(); }

/* DATE PICKER */
let _calY=new Date().getFullYear(),_calM=new Date().getMonth(),_selS=cfg.tripStart,_selE=cfg.tripEnd,_step=0;
function openDateSheet(){ _selS=cfg.tripStart;_selE=cfg.tripEnd;_step=0;buildCal();qs('#dateSheet').classList.remove('hidden');qs('#backdrop').classList.remove('hidden'); }
function buildCal(){ const MONTHS=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],DOWS=['MO','DI','MI','DO','FR','SA','SO'];const today=new Date();today.setHours(0,0,0,0);const first=new Date(_calY,_calM,1),startDow=(first.getDay()+6)%7,dim=new Date(_calY,_calM+1,0).getDate();const s=_selS?new Date(_selS):null,e=_selE?new Date(_selE):null;const sub=s&&e?`${s.toLocaleDateString('de',{day:'numeric',month:'short'})} – ${e.toLocaleDateString('de',{day:'numeric',month:'short',year:'numeric'})}`:s?`${s.toLocaleDateString('de',{day:'numeric',month:'short'})} → Enddatum`:'Startdatum wählen';qs('#dateSub').textContent=sub;let h=`<div class="cal-nav"><button class="cal-nav-btn" onclick="calPrev()">‹</button><span class="cal-month-label">${MONTHS[_calM]} ${_calY}</span><button class="cal-nav-btn" onclick="calNext()">›</button></div><div class="cal-grid">`;DOWS.forEach(d=>h+=`<div class="cal-dow">${d}</div>`);for(let i=0;i<startDow;i++)h+=`<div class="cal-day other-m"></div>`;for(let d=1;d<=dim;d++){const dt=new Date(_calY,_calM,d),ds=dt.toISOString().split('T')[0];let cls='cal-day';if(dt.toDateString()===today.toDateString())cls+=' today';if(s&&e){if(dt.toDateString()===s.toDateString())cls+=' r-start';else if(dt.toDateString()===e.toDateString())cls+=' r-end';else if(dt>s&&dt<e)cls+=' in-r';}else if(s&&dt.toDateString()===s.toDateString())cls+=' r-start';h+=`<div class="${cls}" onclick="calDay('${ds}')">${d}</div>`;}h+='</div>';qs('#calWidget').innerHTML=h;qs('#icsExport').innerHTML=_selS&&_selE?`<button class="ics-btn" onclick="exportTripICS()"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 14 11 16 15 12"/></svg>Reisezeitraum als .ics</button>`:''; }
function calPrev(){ _calM--;if(_calM<0){_calM=11;_calY--;}buildCal(); }
function calNext(){ _calM++;if(_calM>11){_calM=0;_calY++;}buildCal(); }
function calDay(ds){ if(_step===0||(_selS&&_selE)){_selS=ds;_selE=null;_step=1;}else{if(ds<_selS){_selE=_selS;_selS=ds;}else _selE=ds;_step=0;}buildCal(); }
function confirmDate(){ if(_selS)cfg.tripStart=_selS;if(_selE)cfg.tripEnd=_selE;saveCfg();renderPanel();renderSettings();qs('#dateSheet').classList.add('hidden');closeBackdrop(); }
function closeDateSheet(){ qs('#dateSheet').classList.add('hidden');closeBackdrop(); }

/* BACKDROP */
function closeBackdrop(){ const any=['#colorSheet','#iconSheet','#dateSheet','#filterSheet'].some(s=>!qs(s).classList.contains('hidden'));if(!any)qs('#backdrop').classList.add('hidden'); }
function closeAllSheets(refresh=true){ ['#colorSheet','#iconSheet','#dateSheet','#filterSheet'].forEach(s=>qs(s).classList.add('hidden'));qs('#backdrop').classList.add('hidden'); if(refresh){renderLayers();renderPanel();} }

/* SWIPE GESTURES */
function addSwipeClose(el,closeFn,directions,handleOnly=false){
  if(!el||el._swipeInit)return;el._swipeInit=true;
  let sx=0,sy=0,st=0,dragging=false,axis=null,fromHandle=false;

  el.addEventListener('touchstart',e=>{
    sx=e.touches[0].clientX; sy=e.touches[0].clientY;
    st=Date.now(); dragging=false; axis=null;
    if(directions.includes('down')&&!directions.includes('left')){
      const rect=el.getBoundingClientRect();
      const tag=(e.target&&e.target.tagName||'').toLowerCase();
      const isControl=['input','button','select','textarea'].includes(tag)||e.target.closest('.dual-sl,.chip-row,.sf-chips');
      const body=el.querySelector('.sheet-body,.settings-scroll,#panelContent');
      fromHandle=!!e.target.closest('.sheet-bar,.sheet-drag-handle') || (!handleOnly && ((sy - rect.top) < 56) && !isControl && (!body || body.scrollTop<=0));
    } else {
      fromHandle=true;
    }
  },{passive:true});

  el.addEventListener('touchmove',e=>{
    if(!fromHandle&&!dragging) return; // ignore scroll area touches
    const dx=e.touches[0].clientX-sx,dy=e.touches[0].clientY-sy;
    if(!dragging){
      const horiz=Math.abs(dx)>14&&Math.abs(dx)>Math.abs(dy)*1.4;
      const down=Math.abs(dy)>14&&dy>0&&Math.abs(dy)>Math.abs(dx)*1.4;
      if(horiz&&(directions.includes('left')||directions.includes('right'))){dragging=true;axis='h';}
      else if(down&&directions.includes('down')&&fromHandle){dragging=true;axis='v';}
    }
    if(!dragging)return;
    e.preventDefault();
    if(axis==='h'){el.style.transform=`translateX(${dx}px)`;el.style.opacity=String(Math.max(0,1-Math.abs(dx)/180));}
    else{const c=Math.max(0,dy);el.style.transform=`translateY(${c}px)`;el.style.opacity=String(Math.max(0,1-c/200));}
  },{passive:false});

  el.addEventListener('touchend',e=>{
    if(!dragging){el.style.transform='';el.style.opacity='';return;}
    const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
    const vel=axis==='h'?Math.abs(dx)/(Date.now()-st):Math.max(0,dy)/(Date.now()-st);
    const dismiss=axis==='h'?(Math.abs(dx)>90||vel>0.35):(dy>80||vel>0.4);
    if(dismiss){
      el.style.transition='transform .26s ease,opacity .22s ease';
      el.style.transform=axis==='h'?`translateX(${dx>0?'110%':'-110%'})`:'translateY(110%)';
      el.style.opacity='0';
      setTimeout(()=>{el.style.transition='';el.style.transform='';el.style.opacity='';closeFn();},260);
    } else {
      el.style.transition='transform .22s var(--sp),opacity .18s';
      el.style.transform='';el.style.opacity='';
      setTimeout(()=>el.style.transition='',240);
    }
    dragging=false;axis=null;
  },{passive:true});
}
function initAllSwipe(){
  addSwipeClose(qs('#detailPanel'),closeDetail,['down'],true);
  addSwipeClose(qs('#panel'),()=>{if(S.tab!=='map')setTab('map');},['down'],true);
  addSwipeClose(qs('#filterSheet'),closeFilterSheet,['down'],true);
  addSwipeClose(qs('#settingsPanel'),closeSettings,['down'],true);
  addSwipeClose(qs('#colorSheet'),closeColorSheet,['down'],true);
  addSwipeClose(qs('#iconSheet'),closeIconSheet,['down'],true);
  addSwipeClose(qs('#dateSheet'),closeDateSheet,['down'],true);
}



/* V3.2.2 NAVIGATION / RÜCKWEG */
function v322DetailNavHtml(r){
  const backLabel = (V322_NAV.detailFrom?.tab && V322_NAV.detailFrom.tab !== 'map') ? `Zurück ${v322TabLabel(V322_NAV.detailFrom.tab)}` : 'Zurück';
  return `<div class="v322-detail-nav">
    <button class="v322-back" onclick="v322BackFromDetail()">← ${backLabel}</button>
    <button class="v322-map" onclick="v322ShowDetailOnMap('${r.id}')">Auf Karte zeigen</button>
  </div>`;
}
function v322TabLabel(tab){
  return ({overview:'Übersicht',journal:'Journal',trips:'Reisen',options:'Optionen',map:'Karte',test:'Audit'})[tab]||'zurück';
}
function v322BackFromDetail(){
  const from = V322_NAV.detailFrom || {tab:'map'};
  v322CloseDetailRaw();
  if(from.soloMode && from.soloId){
    cfg.soloMode=true; cfg.soloId=from.soloId; saveCfg(); renderLayers();
  }
  if(from.tab && from.tab !== 'map'){
    setTab(from.tab);
    if(typeof from.query==='string') S.query=from.query;
    setTimeout(()=>{
      renderPanel();
      const pc=qs('#panelContent');
      if(pc && Number.isFinite(from.panelScroll)) pc.scrollTop=from.panelScroll;
    },80);
  } else {
    setTab('map');
  }
}
function v322ShowDetailOnMap(id){
  const currentId = S.selected?.id || id;
  V322_NAV.soloFrom = {
    type:'detail',
    id:currentId,
    detailFrom: V322_NAV.detailFrom ? {...V322_NAV.detailFrom} : {tab:'map'}
  };
  v322CloseDetailRaw();
  v322SoloOnMap(currentId,{fromTab:'detail',fromDetail:currentId});
}
function v322SoloOnMap(id,opts={}){
  cfg.soloMode=true;
  cfg.soloId=id;
  cfg.layers.tracks=true;
  cfg.layers.drive=true;
  cfg.layers.markers=true;
  saveCfg();
  renderLayers();
  setTab('map');
  const r=DATA.find(x=>x.id===id);
  if(r){
    setTimeout(()=>{
      const b=routeBounds(r);
      if(isValidBounds(b))map.flyToBounds(b,mapSafeFitOptions(false));
      toast(`${id} · Soloansicht`);
    },200);
  }
  v322SyncSoloBar();
}
function v322BackFromSolo(){
  const from = V322_NAV.soloFrom;
  cfg.soloMode=false;
  cfg.soloId=null;
  saveCfg();
  renderLayers();
  v322SyncSoloBar();
  if(from?.type==='detail' && from.id){
    V322_NAV.detailFrom = from.detailFrom || {tab:'map'};
    openDetail(from.id,false,{silent:true});
  } else if(from?.tab && from.tab!=='map'){
    setTab(from.tab);
  } else {
    setTab('map');
  }
  V322_NAV.soloFrom=null;
}
function v322ExitSoloAll(){
  cfg.soloMode=false;
  cfg.soloId=null;
  saveCfg();
  renderLayers();
  V322_NAV.soloFrom=null;
  v322SyncSoloBar();
  toast('Alle PR wieder sichtbar');
}
function v322SyncSoloBar(){
  let bar=qs('#v322SoloBar');
  if(!cfg.soloMode || S.tab!=='map'){
    if(bar)bar.remove();
    return;
  }
  if(!bar){
    bar=document.createElement('div');
    bar.id='v322SoloBar';
    qs('#app')?.appendChild(bar);
  }
  bar.innerHTML=`<button onclick="v322BackFromSolo()">← Zurück</button><span>Solo: ${cfg.soloId||''}</span><button onclick="v322ExitSoloAll()">Alle anzeigen</button>`;
}

/* V3.2.0 DIRECT UI FLÄCHEN — keine Zusatzlayer */
function v320OptionsHtml(){
  const op = Math.round((cfg.bottomSheetOpacity||0.88)*100);
  return `<div class="p-section">Planung & Audit</div>
    <div class="sg-box v320-box">
      <button class="btn-primary" onclick="setTab('test')">Audit / Testbericht öffnen</button>
      <button class="mini-btn" onclick="shareTestReport()">Audit teilen</button>
    </div>
    <div class="p-section">Karte & Planung</div>
    <div class="sg-box v320-box">
      <label class="v320-row"><span>Zoomslider anzeigen</span><input type="checkbox" class="v320-switch" ${cfg.zoomSliderEnabled?'checked':''} onchange="v320SetBool('zoomSliderEnabled',this.checked)"></label>
      <label class="v320-row"><span>Bottom-Sheet Transparenz <b>${op}%</b></span><input type="range" min="70" max="100" value="${op}" oninput="v320SetOpacity(this.value)"></label>
      <label class="v320-row"><span>Basisverbrauch l/100 km</span><input class="mini-num" type="number" step="0.1" value="${cfg.fuelConsumptionL100}" onchange="v320SetNum('fuelConsumptionL100',this.value)"></label>
      <label class="v320-row"><span>Madeira-Bergkorrektur %</span><input class="mini-num" type="number" step="5" value="${cfg.mountainCorrectionPercent}" onchange="v320SetNum('mountainCorrectionPercent',this.value)"></label>
      <label class="v320-row"><span>Kraftstoffpreis €/l</span><input class="mini-num" type="number" step="0.01" value="${cfg.fuelPrice}" onchange="v320SetNum('fuelPrice',this.value)"></label>
      <small class="v320-note">V3.2.0: Funktionen sind in Optionen/Reisen verankert. Keine Floating-Buttons, keine Zusatzlayer.</small>
    </div>`;
}
function v320SetBool(key,val){ cfg[key]=!!val; saveCfg(); v320EnsureZoomSlider(); renderPanel(); }
function v320SetNum(key,val){ const n=Number(val); if(Number.isFinite(n)) cfg[key]=n; saveCfg(); }
function v320SetOpacity(val){ cfg.bottomSheetOpacity=(Number(val)||88)/100; document.documentElement.style.setProperty('--sheet-opacity', cfg.bottomSheetOpacity); document.documentElement.style.setProperty('--v320-sheet-opacity', cfg.bottomSheetOpacity); saveCfg(); }
function v320MapFree(){ return S.tab==='map' && !S.panel && qs('#detailPanel')?.classList.contains('hidden') && qs('#filterSheet')?.classList.contains('hidden') && qs('#settingsPanel')?.classList.contains('hidden'); }
function v320EnsureZoomSlider(){
  let z=qs('#v320ZoomSlider');
  if(!cfg.zoomSliderEnabled){ if(z) z.remove(); return; }
  if(!z){
    z=document.createElement('div');
    z.id='v320ZoomSlider';
    z.innerHTML='<button type="button" data-z="+">+</button><input type="range" min="8" max="18" step="1"><button type="button" data-z="-">−</button>';
    qs('#app')?.appendChild(z);
    z.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; b.dataset.z==='+'?map.zoomIn():map.zoomOut(); const i=qs('input',z); if(i)i.value=map.getZoom(); });
    qs('input',z).addEventListener('input',e=>map.setZoom(Number(e.target.value)));
  }
  const i=qs('input',z); if(i)i.value=map.getZoom();
  z.classList.toggle('hidden', !v320MapFree());
}
function v320SyncUI(){
  // Remove old experimental add-on layers if they survived browser/PWA cache.
  qsa('#prx310-tools,#prx310-overlay,#prx310ZoomSlider,#prx301-zoom-slider,#prx302ZoomSlider,#prx305DockBg,#prx306SafeBg,#prx304SafeBg,.prx312-handle-hit,.prx312-handle').forEach(el=>el.remove());
  v320EnsureZoomSlider();
  document.documentElement.style.setProperty('--v320-sheet-opacity', cfg.bottomSheetOpacity||0.88);
}

/* TEST TAB */
const TEST_STEPS=[{cat:'Karte & Navigation',steps:[{id:'map-load',icon:'🗺️',title:'App startet & Topo-Karte lädt',sub:'Topo-Karte als Standard',tap:'App öffnen – warte 2 Sek.',expect:'<b>Topo-Karte</b> erscheint (grün/braun). "MADEIRA / PR Explorer" oben. Teal-Fußleiste.'},{id:'map-pins',icon:'📍',title:'PR-Pins erscheinen',sub:'Label-Tags',tap:'Warte nach dem Laden',expect:'Farbige Tags auf der Karte. Grün=leicht, Orange=mittel, Rot=schwer.'},{id:'map-locate',icon:'📡',title:'Standort-Button',sub:'Linke Pill',tap:'Obere linke Pill → Pfeil-Button',expect:'Browser fragt Standort. Karte springt zu deiner Position.'},{id:'map-fit',icon:'⬜',title:'Route einpassen',sub:'Mittlerer Button',tap:'Obere linke Pill → Rechteck-Button',expect:'Karte zeigt alle sichtbaren PRs.'},{id:'map-fs',icon:'⛶',title:'Vollbild',sub:'Rechter Button',tap:'Obere linke Pill → Pfeile → dann × oben',expect:'Nur Karte sichtbar. × beendet Vollbild.'}]},{cat:'Pin & Detail',steps:[{id:'pin-tap',icon:'👆',title:'Pin → Detail öffnet',sub:'Label-Tag antippen',tap:'Einen PR-Tag antippen',expect:'Detail-Panel von unten. Pin leuchtet Teal.'},{id:'detail-elev',icon:'⛰️',title:'Höhenprofil',sub:'Canvas-Chart',tap:'Im Detail nach unten scrollen',expect:'Teal-Gradient-Chart. Meter-Labels. 4 Stat-Boxen darunter.',note:'Nur bei PRs mit GPX-Daten. Teste PR 1, PR 6.3, PR 10.'},{id:'detail-close',icon:'✕',title:'Schließen-Kreuz im Detail',sub:'Kein Wischen mehr',tap:'Detail-Panel öffnen → Kreuz oben rechts antippen',expect:'Detail-Panel schließt. Alle PR-Pins erscheinen wieder.'},{id:'detail-status',icon:'🚦',title:'Status setzen',sub:'4 Buttons',tap:'"Eingeschränkt" antippen',expect:'Status-Dot am Pin wechselt auf gelb.'},{id:'detail-solo',icon:'🎯',title:'Solo auf Karte',sub:'Karten-Button im Journal',tap:'Journal → Karten-Icon bei einem PR antippen',expect:'Nur dieser PR auf der Karte mit Route + Anfahrt.'}]},{cat:'Filter',steps:[{id:'flt-open',icon:'🔽',title:'Filter öffnen & schließen',sub:'FAB + Wischen',tap:'Trichter antippen → nach unten wischen zum Schließen',expect:'Filter-Sheet öffnet. Schließt per Wischen.'},{id:'flt-region',icon:'🗾',title:'Regions-Filter + Slider-Anpassung',sub:'Dynamische Grenzen',tap:'"Zentrales Hochgebirge" antippen',expect:'Slider passen <b>automatisch</b> Min/Max an.'},{id:'flt-slider',icon:'📏',title:'Dual-Slider',sub:'Zwei Anfasser',tap:'Track-Länge: beide Anfasser verschieben',expect:'Karte aktualisiert live. Anfasser nicht aneinander vorbei.'},{id:'flt-reset',icon:'↺',title:'Filter zurücksetzen',sub:'Reset-Button',tap:'"Filter zurücksetzen"',expect:'Alle PRs wieder sichtbar.'}]},{cat:'Einstellungen',steps:[{id:'set-gpx',icon:'📏',title:'GPX Strichstärke + Stil',sub:'Slider + Stil-Buttons',tap:'Einstellungen → GPX Strichstärke + Stil',expect:'Linien ändern sich live.'},{id:'set-pinsize',icon:'🔎',title:'Pin-Größe',sub:'50%–200%',tap:'Einstellungen → Pin Größe Slider',expect:'Pins werden live größer/kleiner.'},{id:'set-color',icon:'🎨',title:'Farbpicker',sub:'Gitter + RGB-Regler',tap:'GPX Farbe → andere Farbe → Sichern',expect:'GPX-Linien wechseln Farbe sofort.'},{id:'set-date',icon:'📅',title:'Reisezeitraum',sub:'Kalender-Picker',tap:'Zeitraum → zwei Daten → Sichern',expect:'Travel-Banner in Übersicht erscheint.'}]}];
let _testResults=JSON.parse(localStorage.getItem('prTestResultsPersistent')||localStorage.getItem('prTestResults')||'{}');
let _testActive=null;
function saveTestResults(){ const v=JSON.stringify(_testResults); localStorage.setItem('prTestResults',v); localStorage.setItem('prTestResultsPersistent',v); _updateTestBadge(); }
function _updateTestBadge(){ const b=qs('#testBadge');if(!b)return;b.style.display=TEST_STEPS.flatMap(c=>c.steps).some(s=>_testResults[s.id]==='fail')?'block':'none'; }
function renderTestTab(){
  const el=qs('#panelContent');if(!el)return;
  const all=TEST_STEPS.flatMap(c=>c.steps),total=all.length,done=all.filter(s=>_testResults[s.id]).length,pass=all.filter(s=>_testResults[s.id]==='pass').length,fail=all.filter(s=>_testResults[s.id]==='fail').length,noteCnt=all.filter(s=>_testResults[s.id]==='note').length,skip=all.filter(s=>_testResults[s.id]==='skip').length,pct=Math.round(done/total*100);
  let h=`<div class="test-wrap"><div class="test-header"><div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><div><h2>Audit ${APP_VERSION}</h2><p>${done} von ${total} geprüft · ${pct}%</p></div></div><div class="test-progress"><div class="test-progress-fill" style="width:${pct}%"></div></div></div>`;
  let num=0;
  TEST_STEPS.forEach(cat=>{h+=`<div class="test-section-title">${cat.cat}</div>`;cat.steps.forEach(step=>{num++;const r=_testResults[step.id],isActive=_testActive===step.id;const cls=isActive?'tc-active':(r?`tc-${r}`:'');const numTxt=r==='pass'?'✓':r==='fail'?'✗':r==='skip'?'—':r==='note'?'!':num;const noteVal=(_testResults['note_'+step.id]||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');h+=`<div class="test-card ${cls}" id="tc-${step.id}"><div class="test-card-head" onclick="tcToggle('${step.id}')"><div class="tc-num">${numTxt}</div><div class="tc-title"><b>${step.title}</b><span>${step.sub}</span></div><div class="tc-icon">${step.icon}</div></div><div class="test-card-body"><div class="tap-box"><div class="tap-lbl">👆 Tippe jetzt</div><div class="tap-action">${step.tap}</div><div class="tap-expect">📋 Erwartet: ${step.expect}</div>${step.note?`<div class="tap-note">ℹ️ ${step.note}</div>`:''}</div><div class="tc-note-head"><div class="tc-note-label">Anmerkung</div><button class="tc-clear" onclick="tcClearNote('${step.id}');event.stopPropagation()">Leeren</button></div><textarea class="tc-note" id="tcn-${step.id}" placeholder="Was ist aufgefallen?" oninput="tcSaveNote('${step.id}',this.value)" onclick="event.stopPropagation()">${noteVal}</textarea><div class="tc-btns"><button class="tc-btn tc-pass-btn" onclick="tcResult('${step.id}','pass');event.stopPropagation()">✓ Funktioniert</button><button class="tc-btn tc-fail-btn" onclick="tcResult('${step.id}','fail');event.stopPropagation()">✗ Fehler</button><button class="tc-btn tc-note-btn" onclick="tcResult('${step.id}','note');event.stopPropagation()">Anmerkung</button></div></div></div>`;});});
  if(done===total){h+=`<div class="test-summary"><h3>Test abgeschlossen</h3><div class="ts-grid"><div class="ts-stat ts-pass"><b>${pass}</b><small>Bestanden</small></div><div class="ts-stat ts-fail"><b>${fail}</b><small>Fehler</small></div><div class="ts-stat ts-note"><b>${noteCnt}</b><small>Anmerkung</small></div><div class="ts-stat ts-skip"><b>${skip}</b><small>Übersprungen</small></div></div>${all.filter(s=>_testResults[s.id]==='fail').map(s=>`<div class="ts-fail-item">✗ ${s.icon} ${s.title}</div>`).join('')}<button class="ts-reset" onclick="tcReset()">↺ Zurücksetzen</button><button class="ts-export" onclick="tcExport()">📋 Ergebnisse kopieren</button></div>`;}
  el.innerHTML=h+'</div>';
}
function tcSaveNote(id,val){ _testResults[`note_${id}`]=val; saveTestResults(); }
function tcClearNote(id){ _testResults[`note_${id}`]=''; saveTestResults(); const n=qs(`#tcn-${id}`); if(n)n.value=''; }
function tcToggle(id){ if(_testActive&&_testActive!==id){const n=qs(`#tcn-${_testActive}`);if(n)_testResults[`note_${_testActive}`]=n.value;}_testActive=_testActive===id?null:id;renderTestTab(); }
function tcResult(id,result){ const n=qs(`#tcn-${id}`);if(n)_testResults[`note_${id}`]=n.value;_testResults[id]=result;saveTestResults();_testActive=id;renderTestTab(); }
function tcReset(){ if(!confirm('Teststatus zurücksetzen? Notizen bleiben erhalten.'))return;TEST_STEPS.flatMap(c=>c.steps).forEach(s=>{delete _testResults[s.id];});_testActive=null;saveTestResults();renderTestTab(); }

function buildTestReportText(){
  const all = TEST_STEPS.flatMap(c=>c.steps);
  const now = new Date().toLocaleDateString('de',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const pass = all.filter(s=>_testResults[s.id]==='pass').length;
  const fail = all.filter(s=>_testResults[s.id]==='fail').length;
  const skip = all.filter(s=>_testResults[s.id]==='skip').length;
  const noteCnt = all.filter(s=>_testResults[s.id]==='note').length;
  const done = pass+fail+skip+noteCnt;
  let txt = `PR Explorer · Testergebnisse ${APP_VERSION}\n${now}\n${'─'.repeat(36)}\n`;
  txt += `Gesamt: ${done}/${all.length} · ✓ ${pass} · ✗ ${fail} · ! ${noteCnt} · — ${skip}\n${'─'.repeat(36)}\n\n`;
  TEST_STEPS.forEach(cat=>{
    txt += `[ ${cat.cat} ]\n`;
    cat.steps.forEach(step=>{
      const r=_testResults[step.id];
      const icon = r==='pass'?'✓':r==='fail'?'✗':r==='note'?'!':r==='skip'?'—':'○';
      txt += `  ${icon} ${step.title}`;
      const note = _testResults['note_'+step.id];
      if(note && note.trim()) txt += `\n    → ${note.trim()}`;
      txt += '\n';
    });
    txt += '\n';
  });
  return txt;
}
function tcExport(){ const txt=buildTestReportText(); if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(()=>toast('Ergebnisse kopiert ✓')).catch(()=>tcFallbackCopy(txt)); } else { tcFallbackCopy(txt); } }
async function shareTestReport(){ const txt=buildTestReportText(); if(navigator.share){ try{ await navigator.share({title:'PR Explorer Testergebnisse',text:txt}); return; }catch(e){} } tcExport(); }

function tcFallbackCopy(txt){
  const ta=document.createElement('textarea');
  ta.value=txt; ta.style.position='fixed'; ta.style.left='-9999px'; ta.style.top='0';
  document.body.appendChild(ta); ta.focus(); ta.select();
  let copied=false;
  try{ copied=document.execCommand('copy'); }catch(e){ copied=false; }
  document.body.removeChild(ta);
  if(copied){ toast('Ergebnisse kopiert ✓'); return; }
  showManualCopySheet(txt);
}
function showManualCopySheet(txt){
  let box=qs('#manualCopyBox');
  if(!box){ box=document.createElement('div'); box.id='manualCopyBox'; box.className='manual-copy-box'; document.body.appendChild(box); }
  box.innerHTML=`<div class="manual-copy-card"><div class="manual-copy-head"><b>Audit manuell kopieren</b><button onclick="document.getElementById('manualCopyBox').remove()">×</button></div><p>iOS hat Share/Clipboard blockiert. Text markieren, kopieren und an ChatGPT übergeben.</p><textarea readonly>${txt.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</textarea></div>`;
  const area=box.querySelector('textarea'); setTimeout(()=>{area?.focus();area?.select();},80);
}

/* BIND */
function bindTap(sel,fn){
  const el=qs(sel); if(!el)return;
  let last=0;
  const run=e=>{ e?.preventDefault?.(); e?.stopPropagation?.(); if(window.L?.DomEvent)L.DomEvent.stop(e); const now=Date.now(); if(now-last<260)return; last=now; fn(e); };
  el.addEventListener('click',run,{passive:false});
  el.addEventListener('touchend',run,{passive:false});
  el.style.pointerEvents='auto';
}
function installCriticalTapGuards(){
  const actions={
    filterBtn:()=>openFilterSheet(),
    settingsBtn:()=>openSettings(),
    filterClose:()=>closeFilterSheet(),
    settingsClose:()=>closeSettings(),
    resetFilters:()=>resetFilters()
  };
  const last={};
  const guard=e=>{
    const t=e.target?.closest?.('#filterBtn,#settingsBtn,#filterClose,#settingsClose,#resetFilters');
    if(!t || !actions[t.id])return;
    e.preventDefault?.();
    e.stopPropagation?.();
    e.stopImmediatePropagation?.();
    if(window.L?.DomEvent)L.DomEvent.stop(e);
    const now=Date.now();
    if(now-(last[t.id]||0)<360)return;
    last[t.id]=now;
    actions[t.id]();
  };
  ['pointerdown','touchstart','click'].forEach(ev=>document.addEventListener(ev,guard,{capture:true,passive:false}));
}

function bind(){
  installCriticalTapGuards();
  window.addEventListener('resize',()=>{ if(S.tab==='test') setTimeout(()=>window.scrollTo(0,0),50); });
  window.visualViewport?.addEventListener('resize',()=>{ if(S.tab==='test') setTimeout(()=>window.scrollTo(0,0),50); });
  qsa('#bottomNav button').forEach(b=>{ b.onclick=()=>setTab(b.dataset.tab); });
  const tt=qs('#testToggle'); if(tt)tt.onclick=()=>openTestPanel();
  bindTap('#locateBtn',()=>{map.locate({setView:true,maxZoom:15,enableHighAccuracy:true,timeout:9000});});
  map.on('locationfound',e=>{ if(locMarker)map.removeLayer(locMarker); if(locCircle)map.removeLayer(locCircle); locCircle=L.circle(e.latlng,{radius:e.accuracy||20,color:'#5ac8fa',weight:1,opacity:.7,fillColor:'#5ac8fa',fillOpacity:.12}).addTo(map); locMarker=L.circleMarker(e.latlng,{radius:8,color:'#fff',weight:2,fillColor:'#0a84ff',fillOpacity:1}).addTo(map); toast('Standort markiert'); });
  map.on('locationerror',()=>toast('Standort nicht verfügbar'));
  bindTap('#fitAllBtn',()=>fitVisible());
  bindTap('#fullscreenBtn',()=>setFullscreen(true));
  bindTap('#fullscreenClose',()=>setFullscreen(false));
  bindTap('#settingsBtn',()=>openSettings());
  bindTap('#shareBtn',()=>openShareSheet());
  bindTap('#filterBtn',()=>openFilterSheet());
  bindTap('#filterClose',()=>closeFilterSheet());
  bindTap('#resetFilters',()=>resetFilters());
  bindTap('#detailClose',()=>closeDetail());
  bindTap('#settingsClose',()=>closeSettings());
  qs('#backdrop').onclick=()=>closeAllSheets();
  map.on('click',()=>{closeAllSheets();clearPinFocus();if(cfg.soloMode){v322ExitSoloAll();}});
  initAllSwipe();
}

/* CSS additions */
const _addCSS=`
.trip-toolbar{display:flex;gap:8px;margin:8px 0 14px;flex-wrap:wrap}
.trip-days{display:flex;flex-direction:column;gap:12px;margin:10px 0 18px}
.trip-day{border:1px solid rgba(90,200,250,.14);background:rgba(10,24,22,.58);border-radius:20px;overflow:hidden;box-shadow:0 8px 26px rgba(0,0,0,.22)}
.trip-day-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(90,200,250,.08);background:rgba(90,200,250,.05)}
.trip-day-head b{font-size:17px}.trip-day-head span{font-size:12px;color:var(--muted);font-weight:700}
.day-event{margin:10px;border-radius:16px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.045);padding:11px;display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
.day-event b{display:block;font-size:14px}.day-event span{display:block;font-size:13px;color:rgba(240,250,248,.7);margin-top:2px}.day-event small{display:block;font-size:11px;color:var(--muted);margin-top:3px;word-break:break-all}
.day-event.pr.booked{border-color:rgba(10,132,255,.35);background:rgba(10,132,255,.08)}
.free-slot{margin:10px;padding:13px;border-radius:16px;background:rgba(90,200,250,.04);color:var(--muted);font-size:13px;text-align:center}
.trip-pill{height:25px;border-radius:999px;border:1px solid;display:inline-flex;align-items:center;gap:5px;padding:0 8px;font-size:11px;font-weight:700;white-space:nowrap}.trip-pill i{width:7px;height:7px;border-radius:50%;display:block}
.event-actions{display:flex;flex-direction:column;gap:5px;align-items:flex-end}.event-actions button{height:26px;padding:0 8px;border-radius:999px;background:rgba(90,200,250,.1);border:1px solid rgba(90,200,250,.16);font-size:11px;color:var(--teal);font-weight:700}
.trip-add{margin-top:16px;padding:14px;border:1px solid rgba(90,200,250,.14);border-radius:20px;background:rgba(90,200,250,.045);display:flex;flex-direction:column;gap:9px}.trip-add-head b{display:block}.trip-add-head small{display:block;color:var(--muted);font-size:12px;margin-top:2px}
.trip-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.trip-grid select,.plan-mini select{min-height:42px;border-radius:12px;background:rgba(255,255,255,.07);border:1px solid rgba(90,200,250,.12);padding:0 10px;color:var(--text)}
.trip-grid:has(select:nth-child(3)){grid-template-columns:1fr .62fr .62fr}.trip-add input{min-height:42px}
.plan-mini{display:grid;grid-template-columns:1fr .55fr .55fr .85fr;gap:6px;margin-top:8px}.plan-mini select,.plan-mini button{height:34px;font-size:12px;border-radius:10px;background:rgba(90,200,250,.08);border:1px solid rgba(90,200,250,.12);padding:0 6px}.plan-mini button{color:var(--teal);font-weight:800}
.backlog-card{align-items:flex-start}.fav-backlog .info{width:100%}

.card-map-btn{width:36px;height:36px;border-radius:50%;background:rgba(90,200,250,.1);border:1px solid rgba(90,200,250,.2);display:grid;place-items:center;flex:0 0 36px;color:var(--teal)}
.card-map-btn svg{width:18px;height:18px;stroke:var(--teal);fill:none;stroke-width:2;stroke-linecap:round}
.card-map-btn:active{transform:scale(.88)}
.solo-banner{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-radius:12px;background:rgba(90,200,250,.08);border:1px solid rgba(90,200,250,.2);margin-bottom:10px;font-size:13px;font-weight:600;color:var(--teal)}
.solo-banner button{height:28px;padding:0 10px;border-radius:999px;background:rgba(90,200,250,.15);font-size:12px;font-weight:700;color:var(--teal)}
.line-style-row{display:flex;gap:7px}
.line-style-btn{flex:1;height:36px;border-radius:10px;background:rgba(90,200,250,.06);border:1.5px solid var(--border-sub);font-size:14px;color:var(--muted);transition:.15s}
.line-style-btn.ls-active{background:rgba(90,200,250,.15);border-color:var(--teal);color:var(--teal)}
.s-range-sl{width:100%;height:28px;border-radius:14px;-webkit-appearance:none;appearance:none;background:rgba(90,200,250,.2);outline:none}
.s-range-sl::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:white;box-shadow:0 2px 8px rgba(0,0,0,.3);cursor:pointer;border:2px solid var(--teal)}
`;
const _styleEl=document.createElement('style');_styleEl.textContent=_addCSS;document.head.appendChild(_styleEl);

/* GLOBALS */
Object.assign(window,{S,F,cfg,favs,saveFavs,saveCfg,saveStatus,openDetail,closeDetail,setTab,setSt,setBase,setLayer,setHikingMode,setHikingColorMode,soloOnMap,exitSoloMode,openSettings,closeSettings,renderSettings,setPinShape,openColorSheet,closeColorSheet,confirmColor,setColorTab,sliderChanged,hexChanged,pickColor,openIconSheet,closeIconSheet,confirmIcon,filterIcons,pickIcon,openDateSheet,closeDateSheet,confirmDate,calPrev,calNext,calDay,exportICS,exportTripICS,exportBookedICS,updatePrSchedule,composeDt,clearPrSchedule,tripItems,saveTripItems,addTripItemFromForm,deleteTripItem,setTripItemStatus,openTripLink,planFavFromCard,exportTravelPlanJson,exportTripItemICS,resetFilters,setRegion,setSF,toggleRegions,dualMove,renderFilterSheet,closeAllSheets,closeBackdrop,fitVisible,googleMapsPoint,renderLayers,renderPanel,renderDetail,tcToggle,tcResult,tcReset,tcExport,tcSaveNote,tcClearNote,renderTestTab,openTestPanel,syncTestToggle,APP_VERSION,APP_CHANGELOG,qs,lineStyleBtns,setSort,setScheduleFilter,refreshPoiData,setPoiCat,googleMapsSearch,exportRouteFile,shareRouteFile,shareTestReport,openShareSheet,shareText,prInfoText,filteredCsv,darkenChanged,setHomeField,drawHomePin,togglePois,focusDetailPins,clearPinFocus,openFilterSheet,installCriticalTapGuards,v320OptionsHtml,v320SetBool,v320SetNum,v320SetOpacity,v320SyncUI,v320EnsureZoomSlider,v322BackFromDetail,v322ShowDetailOnMap,v322BackFromSolo,v322ExitSoloAll});

/* INIT */
bind();try{renderFilterSheet();}catch(e){console.warn('Initial filter render skipped',e);}renderLayers();setTab('map');syncTestToggle();v320SyncUI();setTimeout(fitMadeira,300);_updateTestBadge();
if('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
