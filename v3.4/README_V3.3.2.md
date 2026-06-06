# PR Explorer Madeira · V3.3.0

## Ziel dieser Version

V3.3.0 ist ein eigenständiger Navigations-Prototyp für das neue Strava-inspirierte Bedienkonzept:

- Hauptkarte bleibt als Gesamtübersicht erhalten.
- Filter grenzen die sichtbare PR-Menge ein.
- Tippen auf einen PR-Pin öffnet unten ein leichtes Floating-PR-Karussell.
- Links/rechts werden passende PRs aus der gefilterten Menge angezeigt, bevorzugt in räumlicher Nähe und gleicher Region.
- Der aktive PR synchronisiert Karte, GPX-Track, Anfahrtsroute und Detail-Sheet.
- Solo-Modus zeigt den aktiven PR als Kontext.
- Webcams und Sehenswürdigkeiten werden kontextgebunden zum aktiven PR eingeblendet.
- Beim Wechsel auf einen anderen PR werden alte POI-/Webcam-Kontextmarker gelöscht.
- Layersteuerung wurde optisch leichter als Floating-Card-System angelegt.

## Datenbasis

Erzeugt aus:

- `PR – V1.xlsx`
- `Gpx.zip`
- `KML.zip`

Generierter Bestand:

- 37 PR-Datensätze
- 37 GPX-Tracks
- 36 KML-Anfahrten
- statischer Startbestand Webcams / Sehenswürdigkeiten

## Upload auf GitHub Pages

Den kompletten Ordnerinhalt in das GitHub-Pages-Verzeichnis hochladen:

- `index.html`
- `style.css`
- `app.js`
- `data.js`
- `manifest.webmanifest`
- `service-worker.js`
- `README_V3.3.0.md`

Wichtig nach Upload:

1. Auf dem iPhone einmal mit Query-String öffnen, z. B. `index.html?v=3.3.0`.
2. Falls alte PWA-Versionen im Cache hängen: Safari Website-Daten für die GitHub-Pages-Domain löschen oder Homescreen-App neu anlegen.
3. Prüfen: Karte, Filter, Pin-Klick, Karussell, Solo, Details, Webcams, Sehenswürdigkeiten, Layer.

## Bekannte Grenzen

- Dies ist kein Patch auf die letzte V3.2.23-ZIP, weil diese ZIP in der aktuellen Arbeitsumgebung nicht vorlag.
- Die Version ist ein sauberer eigenständiger V3.3.0-Stand aus den verfügbaren Datenquellen.
- POI-Zuordnung erfolgt in dieser Fassung über räumliche Nähe, noch nicht über echte Distanzberechnung entlang der KML-Route.
- Wikipedia-/Webcam-Inhalte sind Links/Marker, noch keine dynamische Live-Vorschau.
- Reise-Sammlung ist lokal im Browser gespeichert, aber noch kein finaler Tagesplaner.

## Testliste

- App startet und Topo-Karte lädt.
- PR-Pins erscheinen.
- Filter `Alle/Leicht/Mittel/Schwer/Favoriten` funktionieren.
- Pin-Tipp öffnet unten PR-Karussell.
- Wischen im Karussell ist möglich.
- `Details` öffnet Sheet.
- `Solo` reduziert auf aktiven PR-Kontext.
- Webcams/Sehenswürdigkeiten im Sheet anwählbar.
- Marker erscheinen auf Karte.
- Wechsel auf anderen PR löscht alte Kontextmarker.
- Layerpanel öffnet leicht/floating, ohne massive dunkle Fläche.
