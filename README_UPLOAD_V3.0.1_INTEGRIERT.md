# PR Explorer V3.0.1 · Integrierter GitHub-Upload

Dieses ZIP ist kein Zusatzpaket mehr, sondern eine integrierte Fassung für die aktuelle Repository-Struktur:

- index.html
- app.js
- style.css
- pr-data.js
- prx-v3.0.1.js
- prx-v3.0.1.css
- service-worker.js
- manifest.webmanifest
- version.json

## Upload

Den Inhalt dieses Ordners vollständig in das GitHub-Repository hochladen und vorhandene Dateien ersetzen.

## Wichtiger Unterschied zur vorherigen Lieferung

Die vorherige Einbauanweisung bezog sich irrtümlich auf eine ältere app-claude-v21-Struktur.
Diese Fassung ist auf die tatsächlich vorhandene Struktur mit app.js und style.css angepasst.

## Kontrolle nach dem Upload

Nach GitHub Pages Deployment im Browser öffnen:

`index.html?v=3.0.1-20260602b`

In der App müssen sichtbar sein:

- Änderungslogbuch mit V3.0.1 als oberstem Eintrag
- unten links die Zusatzschalter Roadmap / Audit / V3
- Audit V3 mit thematischen Prüfgruppen
- Roadmap mit Reiseliste, Ideen, GPX und Export

## iPhone/PWA

1. Alte PR-Explorer-Icons vom Homescreen löschen.
2. Safari Website-Daten für die GitHub-Pages-Domain löschen.
3. Seite mit `?v=3.0.1-20260602b` öffnen.
4. Teilen → Zum Home-Bildschirm.
