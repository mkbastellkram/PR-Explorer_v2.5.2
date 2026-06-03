# V3.0.7 · Overlay-Entfernung und Bedien-Recovery

- Schwarzes fixes body::after-Overlay aus V3.0.6 vollständig deaktiviert.
- Experimentelle Bottom-Docks aus V3.0.4/V3.0.5 werden entfernt.
- Navigation und Zusatzbuttons erhalten hohe z-index-Werte.
- Keine optische Safe-Area-Manipulation mehr durch Pseudo-Elemente.

# V3.0.6 · Recovery nach Safe-Area-Regression

- V3.0.4 und V3.0.5 wegen deaktivierter Schalter verworfen.
- Recovery basiert bewusst wieder auf V3.0.3.
- viewport-fit=cover bleibt erhalten.
- Keine großflächigen Safe-Area-/Dock-Overlays.
- Touch-Events für Schalter, Buttons, Navigation und Formularfelder explizit wieder aktiviert.
- Untere Restfläche wird nur farblich angeglichen, ohne Bedienebene darüber.

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
