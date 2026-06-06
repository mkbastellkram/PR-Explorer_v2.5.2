<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
  <title>PR Explorer Madeira · V3.4.0</title>
  <meta name="theme-color" content="#06211e">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="PR Explorer">
  <link rel="manifest" href="./manifest.webmanifest">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <link rel="stylesheet" href="./style.css">
</head>
<body data-theme="madeira_deep_forest" data-glass="light" data-icon-size="medium">
<div id="app">
  <div id="map" aria-label="Madeira Karte"></div>

  <header class="topbar">
    <div class="brand">
      <span>MADEIRA</span>
      <strong>PR Explorer</strong>
      <em>V3.4.0</em>
    </div>
    <div class="top-actions">
      <button id="locateBtn" class="glass-btn" title="Standort">⌖</button>
      <button id="fitBtn" class="glass-btn" title="Karte einpassen">⛶</button>
      <button id="layerBtn" class="glass-btn" title="Layer">▧</button>
      <button id="settingsBtn" class="glass-btn" title="Einstellungen">⚙</button>
    </div>
  </header>

  <section class="quick-layer-chips" id="quickLayerChips" aria-label="Schnell-Layer">
    <button data-quick-base="topo">Topo</button>
    <button data-quick-base="sat">Satellit</button>
    <button data-quick-layer="hiking">Hiking</button>
    <button data-quick-layer="tracks">GPX</button>
    <button data-quick-layer="drives">KML</button>
    <button data-quick-layer="context">POI/Webcam</button>
  </section>

  <section class="filter-rail" id="filterRail">
    <button class="filter-chip active" data-filter="level" data-value="all">Alle</button>
    <button class="filter-chip" data-filter="level" data-value="leicht">Leicht</button>
    <button class="filter-chip" data-filter="level" data-value="mittel">Mittel</button>
    <button class="filter-chip" data-filter="level" data-value="schwer">Schwer</button>
    <button class="filter-chip" data-filter="fav" data-value="fav">☆ Favoriten</button>
    <button class="filter-chip" data-filter="collected" data-value="collected">＋ Reise</button>
    <button class="filter-chip" data-filter="status" data-value="open">● Offen</button>
    <button class="filter-chip" data-filter="status" data-value="limited">● Eingeschränkt</button>
    <button class="filter-chip" data-filter="status" data-value="closed">● Gesperrt</button>
    <button class="filter-chip" id="searchBtn">Suchen</button>
  </section>

  <aside class="search-panel hidden" id="searchPanel">
    <div class="panel-head"><strong>PR suchen</strong><button id="closeSearch">×</button></div>
    <input id="searchInput" type="search" placeholder="PR, Name, Region …">
    <div id="resultCount" class="muted"></div>
  </aside>

  <aside class="layer-panel hidden" id="layerPanel">
    <div class="panel-head"><strong>Karten & Layer</strong><button id="closeLayers">×</button></div>
    <h4>Basiskarte</h4>
    <div class="layer-grid">
      <button class="layer-card active" data-base="light">OSM</button>
      <button class="layer-card" data-base="topo">Topo</button>
      <button class="layer-card" data-base="sat">Satellit</button>
    </div>
    <h4>Overlays</h4>
    <div class="layer-grid">
      <button class="layer-card toggle active" data-layer="pins">PR-Pins</button>
      <button class="layer-card toggle active" data-layer="tracks">GPX</button>
      <button class="layer-card toggle active" data-layer="drives">KML</button>
      <button class="layer-card toggle active" data-layer="hiking">OSM Hiking</button>
      <button class="layer-card toggle" data-layer="context">POI/Webcam</button>
    </div>
    <h4>Linienbild</h4>
    <div class="settings-row"><label>Linienstärke <input id="lineWidth" type="range" min="3" max="9" value="5"></label></div>
    <div class="settings-row"><label>Konturstärke <input id="outlineWidth" type="range" min="0" max="4" value="1"></label></div>
    <div class="settings-row"><label>Transparenz <input id="lineOpacity" type="range" min="45" max="100" value="92"></label></div>
  </aside>

  <nav class="modebar" aria-label="Hauptnavigation">
    <button class="mode active" data-mode="map"><span>⌖</span>Karte</button>
    <button class="mode" data-mode="journal"><span>☰</span>Journal</button>
    <button class="mode" data-mode="travel"><span>◇</span>Reise</button>
    <button class="mode" data-mode="dashboard"><span>▦</span>Dashboard</button>
  </nav>

  <section class="journal hidden" id="journal">
    <div class="journal-head"><strong>Journal</strong><span id="journalCount"></span></div>
    <div class="type-tabs"><button class="active" data-route-type="all">Alle</button><button data-route-type="official_pr">Offizielle PRs</button><button data-route-type="external_route">Externe Routen</button><button data-route-type="collected">Zur Reise</button></div>
    <div id="journalList" class="journal-list"></div>
  </section>

  <section class="travel-panel hidden" id="travelPanel">
    <div class="panel-head"><strong>Reise-Sammlung</strong><button id="closeTravel">×</button></div>
    <div class="muted">V3.4 sammelt PRs und POIs. Tagesplanung und Teilnehmer folgen später.</div>
    <div id="travelList" class="travel-list"></div>
  </section>

  <section class="dashboard hidden" id="dashboard">
    <div class="panel-head"><strong>Dashboard</strong><button id="closeDashboard">×</button></div>
    <div id="dashboardContent" class="dashboard-grid"></div>
  </section>

  <section class="carousel-shell hidden" id="carouselShell" aria-label="PR Karussell">
    <button class="carousel-close" id="closeCarousel" title="Karussell schließen">×</button>
    <div class="carousel-handle" id="sheetHandle"></div>
    <div class="carousel" id="carousel"></div>
  </section>

  <section class="detail-sheet hidden" id="detailSheet" aria-label="PR Detail">
    <div class="sheet-grip" id="sheetGrip"></div>
    <div id="sheetContent"></div>
  </section>

  <section class="settings-panel hidden" id="settingsPanel">
    <div class="panel-head"><strong>Einstellungen</strong><button id="closeSettings">×</button></div>
    <div class="settings-grid">
      <button class="settings-card" data-open-layers>▧<span>Karten & Layer</span><small>Basiskarte, OSM Hiking, GPX, KML, POI/Webcams</small></button>
      <button class="settings-card" data-fit-selected>⛶<span>Aktive PR einpassen</span><small>GPX + KML der aktiven PR</small></button>
      <button class="settings-card" data-reset-view>⌖<span>Gesamtkarte</span><small>Alle gefilterten PRs anzeigen</small></button>
      <button class="settings-card" data-clear-selection>×<span>Auswahl lösen</span><small>Karussell und Kontextmarker ausblenden</small></button>
    </div>
    <h4>Darstellung</h4>
    <div class="settings-row"><label>Theme <select id="themeSelect"><option value="madeira_deep_forest">Madeira Deep Forest</option><option value="atlantic_teal">Atlantic Teal</option><option value="volcanic_graphite">Volcanic Graphite</option><option value="laurel_light">Laurel Light</option><option value="sunrise_canyon">Sunrise Canyon</option></select></label></div>
    <div class="settings-row"><label>Glass <select id="glassSelect"><option value="light">Leicht</option><option value="medium">Mittel</option><option value="solid">Solide</option></select></label></div>
    <div class="settings-row"><label>Icon-Größe <select id="iconSizeSelect"><option value="small">Klein</option><option value="medium">Mittel</option><option value="large">Groß</option></select></label></div>
    <div class="settings-row"><label>Höhenprofil <select id="profileStyleSelect"><option value="clean_area">Clean Area</option></select></label></div>
    <button class="wide-btn" id="resetVisuals">Darstellung zurücksetzen</button>
    <div class="diagnostic" id="diagnosticBox"></div>
  </section>

  <div id="toast" class="toast hidden"></div>
</div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="./data.js"></script>
<script src="./app.js"></script>
</body>
</html>
