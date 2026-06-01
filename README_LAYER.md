# PR Explorer · Layer-Integration V2.4.4

## Kartenansichten

- OSM Standard
- OpenTopoMap
- Satellit / Esri World Imagery

Die bisherige Dark-OSM-Kartenansicht wurde ersatzlos entfernt. Falls lokal noch `base: "dark"` gespeichert ist, setzt die App automatisch auf `topo` zurück.

## Overlays

- GPX Wanderwege: eigene PR-Tracks aus den App-Daten
- KML Anfahrten: eigene Anfahrtsrouten aus den App-Daten
- Heatmap: interne Anfahrtsvisualisierung
- PR-Pins: eigene PR-Marker
- Concelhos-Grenzen: interne Madeira-Gemeindegrenzen
- Waymarked Trails Hiking: externe transparente Wanderwege-Ebene
- OpenSeaMap Seezeichen: externe Küsten-/Seezeichen-Ebene

## Hinweis

Externe Tile-Layer sind von Verfügbarkeit, Nutzungsbedingungen und Serverlast der jeweiligen Anbieter abhängig. Die verbindlichen PR-Daten bleiben die lokalen PR-Tracks und POIs der App.


## V2.4.4 Ergänzung

- Der Teilen-Button dient jetzt als Audit-Export für die Funktionstest-Liste.
- GPX- und KML-Linien besitzen eine getrennte Kontursteuerung in den Einstellungen.
- Die Journal-Liste kann über die Filtereinstellungen sortiert werden.
