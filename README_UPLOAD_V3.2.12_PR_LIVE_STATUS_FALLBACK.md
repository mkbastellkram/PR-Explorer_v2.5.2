# PR Explorer V3.2.12 · PR-Live-Status-Fallback korrekt

Basis: V3.2.10 reviewed.

## Wichtigste Korrektur

Alte App-Logik:
`getSt(id)` gab bei nicht gesetztem Status automatisch `open` zurück.

Neue Logik:
- wenn `prStatus[id]` gesetzt ist: User-Status
- sonst Live-Status
- sonst Default `open`

## Test-URL

?v=3.2.12-20260604h

## Test

1. Karte lädt sofort.
2. Pins erscheinen.
3. Nach Statusabruf ändern geschlossene/eingeschränkte PRs ihre Farbe.
4. Optionen → PR-Live-Status Diagnose prüfen:
   PR 1.3 / PR 4 / PR 7 / PR 10 / PR 12 / PR 20 / PR 27 / PR 28.
5. Detail zeigt offiziellen Statusblock.
6. User-Status hat Vorrang.
