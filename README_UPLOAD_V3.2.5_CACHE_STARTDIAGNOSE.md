# PR Explorer V3.2.5 · Cache- und Startdiagnose

Basis: laufende V3.2.3-Recovery.

## Wichtig

Service Worker cached ohne Query-Strings:
- style.css
- app.js
- pr-data.js

index.html nutzt weiter:
- style.css?v=3.2.5-20260604a
- pr-data.js?v=3.2.5-20260604a
- app.js?v=3.2.5-20260604a

## Test-URL

?v=3.2.5-20260604a

## Test

1. Karte lädt.
2. Pins erscheinen.
3. Optionen → Startdiagnose prüfen.
4. Bei Fehler: Diagnose kopieren und zurückgeben.
