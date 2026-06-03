# PR Explorer V3.2.0 · UI-Flächen-Rebuild

Diese Version setzt das besprochene Esstisch-Prinzip um:

Eine Fläche, klare Elemente, keine zusätzlichen Tischplatten.

## Aktive Dateien

- index.html
- style.css
- pr-data.js
- app.js
- service-worker.js
- manifest.webmanifest
- version.json

Keine aktive prx-v*-Datei mehr.

## Bedienlogik

- Roadmap/Tagesplanung: in Reisen
- Audit/Testbericht: in Optionen
- Planungseinstellungen: in Optionen
- Zoomslider: als echtes Karten-Control, nur Karte
- keine Floatingbuttons Roadmap/Audit/V3/Test

## Upload

Kompletten ZIP-Inhalt in GitHub hochladen und vorhandene Dateien ersetzen.

Bitte alte Dateien im Repository löschen:

- prx-v3.0.x.*
- prx-v3.1.x.*

## Test-URL

?v=3.2.0-20260603k

## Test

1. Optionen öffnen: Audit/Test und Planungseinstellungen sichtbar?
2. Reisen öffnen: Roadmap/Tagesplanung sichtbar?
3. Karte öffnen: keine Roadmap/Audit/V3-Floatingbuttons?
4. Zoomslider in Optionen aktivieren: erscheint nur auf Karte?
5. Journal/Detail/Filter: keine transparenten Fremdebenen?
