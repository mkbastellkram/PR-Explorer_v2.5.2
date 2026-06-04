# V3.2.19 · POI-Unterwegs im Detail

- Detail-Sheet zeigt „🏛 Unterwegs – Sehenswürdigkeiten“.
- KML-Parser per DOMParser ergänzt.
- KML-Dateiname wird automatisch aus PR-ID abgeleitet, z. B. `PR 6.3` → `kml/PR6.3.kml`.
- Falls KML fehlt, greift ein Startpunkt-Fallback bis 5 km.
- Wikipedia-Thumbnail und Kurzbeschreibung werden mit 24h sessionStorage-Cache geladen.
- POI-Kartenlayer aus V3.2.17 bleibt unverändert.
- Keine Änderung an Wetter, Webcams, PR-Statuslogik, Dashboard, `setTab()`, `openDetail()` oder `pr-data.js`.

# V3.2.18 · Webcams final

- `webcam-data.js` mit 20 Madeira-Webcams eingebunden.
- Webcam-Layer „📷 Webcams“ in Optionen/Ebenen ergänzt.
- Webcam-Popups zeigen Thumbnail und Live-Link.
- Detail-Sheet zeigt vier nächste Webcams im 2×2 Grid.
- Keine Änderung an Wetter, PR-Statuslogik, Dashboard, POI-Daten, `setTab()`, `openDetail()` oder `pr-data.js`.

# V3.2.17 · POI-Layer + Dashboard-Patch

- `poi-data.js` mit 90 Sehenswürdigkeiten eingebunden.
- Neuer Layer „🏛 Sehenswürdigkeiten“ in Optionen/Ebenen.
- POI-Popups mit Route und Wikipedia-Link.
- Dashboard-Eventkarten öffnen vertikal lesbar.
- Detail-Sheet-Unterwegs/KML bewusst noch nicht integriert.

# V3.2.16 · Dashboard Events erweitert

- `events-data.js` um Koordinaten und `infoUrl` erweitert.
- `mapsUrl` wird zur Laufzeit generiert: iOS Apple Maps, sonst Google Maps.
- Eventkarten im Dashboard sind per Tap aufklappbar.
- Aufgeklappte Events zeigen Beschreibung, Route-Button und Mehr-Info-Link.
- Keine Änderung an Karte, Detail, Wetter, PR-Statuslogik, `setTab()`, `openDetail()` oder `pr-data.js`.

# V3.2.15 · Dashboard Events & Märkte

- `events-data.js` und `markets-data.js` eingebunden.
- Home/Übersicht erhält Eventsektion „Diese Woche auf Madeira“.
- Wochenmärkte werden angezeigt und Heute/Morgen hervorgehoben.
- Optionale KI-Zusammenfassung per Anthropic API-Key in sessionStorage.
- Keine Änderung an Karte, Detail, Wetter, PR-Statuslogik, `setTab()`, `openDetail()` oder `pr-data.js`.

# V3.2.14 · Wetter im Detail-Sheet

- Open-Meteo-Wetterblock in der Detailansicht ergänzt.
- 7-Tage-Streifen mit Tageswerten, Wettericon und Regenwahrscheinlichkeit.
- Stündliche Canvas-Kurve für Temperatur und Regenwahrscheinlichkeit.
- sessionStorage-Cache je Trail/Tag für 6 Stunden.
- Fehlerfall bleibt weich: Wetterblock zeigt Hinweis oder bleibt leer.
- Keine Änderung an `setTab()`, `openDetail()`, Karteninitialisierung, PR-Statuslogik oder `pr-data.js`.

# V3.2.13 · Manueller PR-Status im Journal

- Automatischer PR-Live-Status-Abruf beim App-Start deaktiviert.
- Journal zeigt oben eine Statuskarte mit letztem Abruf und Aktualisieren-Button.
- Statushinweis wird warnend dargestellt, wenn der letzte Abruf älter als 24 Stunden ist.
- Button „Status aktualisieren“ lädt den offiziellen Status bewusst neu.
- Live-Status-Diagnose in Optionen bleibt erhalten.
- Lokale User-Status bleiben vorrangig.
- Keine Änderung an `setTab()`, `openDetail()`, Karteninitialisierung, Bottom-Dock oder `pr-data.js`.

# V3.2.12 · PR-Live-Status-Fallback korrekt

- `pr-status-fetcher.js` eingebunden.
- `getSt(id)` korrigiert: Lokaler User-Status gilt nur, wenn `prStatus[id]` wirklich gesetzt ist.
- Live-Status wirkt als Fallback; `partial` wird korrekt auf App-Status `limited` gemappt.
- Detailansicht zeigt offiziellen Statusblock.
- Optionen zeigen PR-Live-Status-Diagnose mit Stichproben.
- Service Worker cached `./pr-status-fetcher.js` ohne Query-String.
- Keine Änderung an `setTab()`, `openDetail()`, Karteninitialisierung, Bottom-Dock oder `pr-data.js`.

# V3.2.9 · Detail-Karte-Rückkehr

- Karten-Icon in der Detailansicht wechselt zur Karte und fokussiert den aktiven PR.
- Detail-Kontext bleibt gespeichert.
- Auf der Karte erscheint ein kleiner Button „Detail“, solange ein Detail-Kontext aktiv ist.
- Der Button „Detail“ öffnet die Detailansicht wieder.
- Keine Änderung an Karteninitialisierung, setTab, Service Worker, Safe-Area oder Bottom-Dock.

# V3.2.8 · Detail-Icon tatsächlich aktiv

- Korrigiert: Karten-Icon wird jetzt tatsächlich in `renderDetail()` eingebunden.
- Detailtitelbereich nutzt nun Text links und Karten-Icon rechts.
- Oberer Karte-Textbutton bleibt entfernt.
- Keine Änderung an Karteninitialisierung, Navigationstiefe, Service-Worker-Prinzip, Safe-Area oder Bottom-Dock.
- Startdiagnose bleibt enthalten.

# V3.2.7 · Detail-Header-Korrektur

- Karte-Textbutton aus der oberen Detail-Navigation entfernt.
- Kartenfunktion als rundes Karten-Icon im Titelbereich platziert.
- Schließen-X wird nicht mehr vom Kartenbutton überlagert.
- Keine Änderung an Karteninitialisierung, Navigationstiefe, Service-Worker-Prinzip, Safe-Area oder Bottom-Dock.
- Startdiagnose bleibt enthalten.

# V3.2.6 · Detail-Navigation Phase 1

- Detailansicht erhält Zurück zur vorherigen Hauptfläche.
- Herkunft wird beim Öffnen eines Details gespeichert.
- Zurück schließt nur das Detail und stellt Journal/Reisen/Optionen/Karte wieder her.
- Button „Karte“ fokussiert den aktiven PR auf der Karte, ohne Solo-/Parkmodus.
- Keine Änderung an Karteninitialisierung, setTab, Safe-Area, Bottom-Dock oder Service-Worker-Prinzip.
- Startdiagnose aus V3.2.5 bleibt enthalten.

# V3.2.5 · Cache- und Startdiagnose

- Service Worker CORE_ASSETS ohne Query-Strings.
- index.html behält Cache-Busting per `?v=3.2.5-20260604a`.
- Startdiagnose in Optionen ergänzt.
- Sichtbarer Warnhinweis bei schwerem Startfehler.
- Keine Navigations-, Detail-, Safe-Area-, Bottom-Dock- oder Overlay-Änderungen.
- Basis bleibt V3.2.3 Recovery.

# V3.2.3 · Recovery zurück auf V3.2.1

- V3.2.2 verworfen, weil die Navigationsänderung die Grundfunktion beschädigt hat.
- Recovery basiert wieder auf V3.2.1.
- Karte, Pins, Reisen, Optionen, Sheet-Fix und externe Aktivitäten sind wieder auf dem funktionierenden Stand.
- Keine V3.2.2-Navigationslogik enthalten.
- Weiterhin keine aktive prx-v*-Zusatzdatei.

# V3.2.1 · Sheet- und Kartenstil-Fix

- Zweilagige Bottom-Sheet-Wirkung reduziert: äußere Sheets clippen, innere Inhalte scrollen.
- Schließen-X in Sheet-Headern einheitlicher nach rechts ausgerichtet.
- Externe Aktivitäten typografisch an PR-Karten angenähert.
- Keine Safe-Area-, Bottom-Dock-, Overlay- oder Floatingbutton-Änderungen.
- Weiterhin keine aktive prx-v*-Zusatzdatei.

# V3.2.0 · UI-Flächen-Rebuild

- Aktive prx-v*-Zusatzdateien vollständig entfernt.
- Roadmap/Tagesplanung liegt in „Reisen“.
- Audit/Testbericht liegt in „Optionen“.
- V3-/Planungseinstellungen liegen in „Optionen“.
- Zoomslider ist ein direktes Karten-Control in app.js/style.css.
- Test-Floatingbutton, Roadmap/Audit/V3-Floatingbuttons und Zusatzoverlays entfernt.
- Keine body::before/body::after- oder Dock-/Safe-Area-Overlays.

# V3.1.1 · HUD-Scope-Fix

- Roadmap/Audit/V3-HUD nur noch bei freier Kartenansicht sichtbar.
- Zoomslider nur noch bei freier Kartenansicht sichtbar.
- Filter-FAB und Testbutton werden bei geöffneten Panels/Sheets/Einstellungen ausgeblendet.
- Keine Safe-Area- oder Bottom-Dock-Änderungen.

# V3.1.0 · Clean Layer Reset

- Alte V3.0.x-Hotfixdateien aus dem Upload-Paket entfernt.
- Z-Index-System neu definiert.
- Experimentelle Safe-Area-/Dock-/Pseudo-Overlays verboten.
- Aktives Zusatzmodul konsolidiert auf prx-v3.1.0.js und prx-v3.1.0.css.
- Service Worker cached nur aktive V3.1.0-Dateien.
- Bedienbarkeit hat Vorrang vor optischer Safe-Area-Finalisierung.

# V3.0.3 · Detail-, Audit-Export-, Zoomslider- und Viewport-Hotfix

- Doppelter Zoomslider entfernt; alter prx301-Slider wird zwangsweise ausgeblendet.
- Audit/Test-Schließen gegen versehentlichen Export-/Kopierdialog abgesichert.
- Viewport-Fix nochmals härter: 100dvh, bottom:0, keine Bottom-Margins.
- Journal-Kachel öffnet vollständig per Tippen; Pfeil rechts ausgeblendet.
- Solo-Kartenbutton bleibt als separater Button erhalten.
- Detailöffnung aus Journal mit Fehlerfang versehen, damit keine weiße Seite ohne Hinweis bleibt.

# V3.0.2 · Audit-, Roadmap- und Bedienfixes nach Praxistest

- Alter Testbericht auf vollständige V3-Auditstruktur erweitert.
- Kopierbutton oben rechts im Audit/Test-Kopf entfernt.
- Bottom-/Safe-Area nochmals verschärft.
- Doppeltipp-Zoom per Touch-Fallback abgesichert.
- Zoomslider-Schalter in normalen Einstellungen ergänzt.
- Detail-Nachrendern für nahegelegene PRs und Links stabilisiert.
- Journal-Layout und Suchfeld stabilisiert.
- Roadmap-Export bereinigt verwaiste Einträge.
- ZIP-Dateinamen werden mit UTF-8-Flag geschrieben.

# V3.0.1 · Integrierte Roadmap-, Audit- und Planungsarchitektur

- Direkte Integration in die aktuelle app.js-/style.css-/service-worker.js-Struktur.
- index.html lädt nun prx-v3.0.1.css und prx-v3.0.1.js mit Cache-Busting.
- app.js meldet APP_VERSION V3.0.1 und enthält den V3.0.1-Eintrag im Änderungslogbuch.
- service-worker.js nutzt eigenen V3.0.1-Cache und cached die neuen V3-Dateien.
- version.json und manifest.webmanifest auf V3.0.1 aktualisiert.
- Roadmap/Audit/V3-Zusatzmodule sind jetzt direkt über die laufende App erreichbar.

# PR Explorer Madeira · Changelog

## V2.5.8 · 2026-06-02 · Reiseplan-Grundsystem

- Reise-Tab erweitert: Reisetage werden aus dem Reisezeitraum erzeugt und als eigene Tageskarten angezeigt.
- Geplante PR-Termine und IFCN-Buchungen erscheinen chronologisch in den jeweiligen Tageskarten.
- PR-Favoriten ohne Termin werden separat als offener Planungsrückstand angezeigt.
- Offene PR-Favoriten können direkt mit Reisetag, Stunde und 00/30-Minutenraster eingeplant werden.
- Externe Unternehmungen können lokal gespeichert werden: Titel, Kategorie, Status, Datum, Uhrzeit, Dauer, Fahrzeit, Link und optionale Koordinaten.
- Externe Unternehmungen können als ICS exportiert oder per gespeichertem Link geöffnet werden.
- Reiseplan kann als JSON gesichert werden.
- Statuslogik für Reiseelemente: Idee, Favorit, geplant, gebucht, erledigt, verworfen.

## V2.5.7 · 2026-06-02 · POI-, Kalender- und Linien-Regression-Fix

- Concelhos-Grenzen aus App-UI entfernt und als Layer deaktiviert.
- POIs: transparente Liquid-Glass-Marker, editierbare Größe, Google-Maps-Übergabe und Radiusmodus um den aktiven PR.
- Kalenderfelder im Detail auf iOS-robuste Datum/Uhrzeit-Steuerung mit Stundenwahl und 30-Minuten-Raster umgestellt.
- IFCN-Termin berechnet Hotel-Abfahrt aus Google-Fahrzeit, Fahrzeit-Faktor, Parkplatzpuffer und Wegzeit zum Start.
- ICS-Export nutzt die berechnete Abfahrt und zwei editierbare Erinnerungen.
- GPX/KML-Konturbreiten wieder einstellbar.
- Sortierung im Filter-Sheet wieder ergänzt.
- Teilen-Button öffnet eine Auswahl für Audit, gefilterte PR-Liste und aktive PR-Daten.

## V2.5.2 · 2026-06-01 · Stabilisierung Maschinenraum

- Repository bereinigt: aktive App-Dateien heißen jetzt `app.js` und `style.css`.
- Alte Versionierungsreste aus dem Auslieferungsstand entfernt.
- `index.html`, `app.js`, `style.css`, `service-worker.js`, `version.json` und `CHANGELOG.md` auf V2.5.2 synchronisiert.
- Service Worker auf eindeutigen Cache `pr-explorer-V2.5.2` umgestellt.
- Alte `pr-explorer-*` Caches werden beim Aktivieren gelöscht.
- Navigation/HTML wird network-first geladen; zentrale Assets besitzen Cache-Busting.
- Dark-/ungültige Altwerte in `cfg.base` fallen auf `topo` zurück.
- Hybrid-Kartenwechsel entfernt Beschriftungs-Overlay zuverlässig beim Wechsel auf andere Basemaps.
- Dynamische Safe-Area-Paddinglogik für `fitVisible()` und Detail-Zoom ergänzt.
- Leaflet-Panes für Regionen, KML, GPX, Heatmap, Hiking, POI, Home und PR-Pins definiert.
- GPX/KML/Heat-Linien sind nicht interaktiv und blockieren keine Marker-Touches.
- PR-Pins öffnen Details robuster über `click` und `touchend` mit Debounce.
- Audit-Export über Teilen-Button; sichtbarer manueller Fallback bei iOS Clipboard-/Share-Blockade.
- Liquid-Glass-Overrides konsolidieren Bottom-Navigation, Test-Schalter, Filter-FAB und Panels.

## Vorbestand aus V2.5.1

- Bottom-Sheet-Stabilisierung, POI-Layer, Hybridkarte und Exportfunktionen.
- GPX/KML-Export aus Detailseiten.
- Farbpicker-Synchronisierung.
- Testbericht-Export über Teilen-Button.
