# PR Explorer · Änderungslogbuch V3.0.1

## V3.0.1 · Reiseplanung, Audit V3 und externe Aktivitäten

- Audit-Rapport neu strukturiert nach App-Start, Karte, Bottom-Sheets, Einstellungen, PR-Detail, Kalender, Status, Reiseliste, Journal, externe Unternehmungen, GPX, Export und Persistenz.
- Audit mit Statuswerten ✓ / ✗ / ! / — und Notizfeld je Prüffrage.
- Freitextfeld für sonstige Anmerkungen und Funktionswünsche ergänzt.
- Audit-Export als Text integriert.
- Bottom-Sheet-Transparenz als zentrale Einstellung ergänzt.
- Zoomslider als aktivierbare Kartensteuerung ergänzt.
- Safe-Area-/100dvh-Fixes für iPhone-Viewport ergänzt.
- Detailseiten-Erweiterung:
  - Termin ohne automatisches Jetzt-Datum
  - Gebucht-Status abhängig vom Termin
  - IFCN-fix Markierung
  - Statusprüfung einmal pro Tag
  - SIMplifica-Link mit Chrome-Versuch und HTTPS-Fallback
  - Schmale-Pfade-Link
  - nahegelegene PRs
- Reiseliste/Roadmap:
  - Bearbeiten-Modus
  - Verschieben nicht fixer Einträge
  - Sperrlogik für IFCN-fixierte Einträge
  - Tageszeitfenster, Fahrt-km, Kraftstoff und Kosten
- Externe Unternehmungen:
  - Ideenliste
  - Anlegen, Editieren, Löschen
  - Dauer, Kategorie, Ort/Region, Link, Notiz
  - Zuordnung zu Reisetagen
- GPX:
  - Import aus Dateien-App
  - Komoot-/Strava-/manuelle GPX werden als freie Routen gespeichert
  - Distanz und Höhenmeter werden berechnet
- Export:
  - ZIP-Paket mit prx_trip_data.json, prx_ideas.json, prx_dayplans.json, prx_gpx_summary.json, PROMPT_CHATGPT_ROADMAP.md und aktuellem Audit.
