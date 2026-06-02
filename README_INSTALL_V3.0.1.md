# PR Explorer V3.0.1 · Installationspaket

## Zweck

Dieses Paket ergänzt die vorhandene V2.3-Basis um die V3.0.1-Funktionen:

- strukturierter Audit-Rapport nach Seiten/Funktionsbereichen
- Roadmap-/Tagesplanung mit iOS-ähnlichem Bearbeiten-Modus
- externe Unternehmungen als Ideenliste mit Editierbarkeit
- freie GPX-Routen via Import aus der Dateien-App
- Tageszeitfenster, Fahrt-km, Kraftstoffbedarf und Fahrkosten
- Bottom-Sheet-Transparenz zentral steuerbar
- Zoomslider per Einstellung
- Doppeltipp-Zoom, soweit Leaflet-Instanz erreichbar
- PR-Detail-Erweiterung mit Termin, gebucht, IFCN-fix, Status, SIMplifica, Schmale Pfade und nahegelegenen PRs
- ZIP-Exportpaket für spätere ChatGPT-/Agenten-Roadmap

## Einbau in index.html

Im `<head>` ergänzen:

```html
<link rel="stylesheet" href="./prx-v3.0.1.css">
```

Im Script-Bereich so einordnen, dass `prx-v3.0.1.js` nach Leaflet, aber vor oder spätestens nach `app-claude-v21.js` geladen wird.

Empfohlene Reihenfolge:

```html
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="./pr-data.js"></script>
<script src="./prx-v3.0.1.js"></script>
<script src="./app-claude-v21.js"></script>
```

Falls die bestehende App schon eine andere Reihenfolge nutzt: `prx-v3.0.1.js` kann auch nach `app-claude-v21.js` geladen werden. Für das Abgreifen der Leaflet-Map ist die obige Reihenfolge robuster.

## Service Worker

In `service-worker.js` Cache-Version auf `pr-explorer-v3-0-1` erhöhen und folgende Dateien ergänzen:

```js
'./prx-v3.0.1.css',
'./prx-v3.0.1.js'
```

Eine fertige Vorlage liegt als `service-worker-v3.0.1.js` bei.

## Bedienung

Nach dem Laden erscheinen unten links drei neue Schalter:

- `Roadmap`
- `Audit`
- `V3`

Diese sind bewusst additiv gehalten, damit die bestehende V2.3-Oberfläche nicht beschädigt wird.

## Einschränkung

Die V3.0.1-Erweiterung speichert ihre Daten separat in `localStorage` unter:

- `prx301_state`
- `prx301_audit`
- `prx301_settings`

Bestehende V2.x-Daten werden nicht gelöscht.
