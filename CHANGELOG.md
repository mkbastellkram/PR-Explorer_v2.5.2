# PR Explorer Madeira · Changelog

## V2.5.7 · 2026-06-02 · POI-, Kalender- und Linien-Regression-Fix

- Concelhos-Grenzen aus App-UI entfernt und als Layer deaktiviert.
- POIs: transparente Liquid-Glass-Marker, editierbare Größe, Google-Maps-Übergabe und Radiusmodus um den aktiven PR.
- Kalenderfelder im Detail auf iOS-robuste Datum/Uhrzeit-Steuerung mit Stundenwahl und 30-Minuten-Raster umgestellt.
- IFCN-Termin berechnet Hotel-Abfahrt aus Google-Fahrzeit, Fahrzeit-Faktor, Parkplatzpuffer und Wegzeit zum Start.
- ICS-Export nutzt die berechnete Abfahrt und zwei editierbare Erinnerungen.
- GPX/KML-Konturbreiten wieder einstellbar.
- Sortierung im Filter-Sheet wieder ergänzt.
- Teilen-Button öffnet eine Auswahl für Audit, gefilterte PR-Liste und aktive PR-Daten.

- Fehlende `htmlEsc()` Hilfsfunktion ergänzt; Einstellungsaufbau bricht dadurch nicht mehr beim Home-PIN ab.
- Filteraufbau defensiv gemacht: Container, leere Datenmengen und alte Grenzwerte werden abgefangen.
- Fehlerkarten zeigen künftig die technische Kurzursache an.
- Initialer Filteraufbau wird geschützt ausgeführt.

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
