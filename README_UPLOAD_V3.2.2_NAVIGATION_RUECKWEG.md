# PR Explorer V3.2.2 · Navigations- und Rückweg-Logik

Diese Version baut auf V3.2.1 auf.

## Ziel

- Journal → Detail → Karte/Solo → zurück
- Karte → Detail → zurück Karte
- Solo-Modus mit eindeutigem Zurück
- keine neuen Layer / keine Safe-Area-Änderung

## Test-URL

?v=3.2.2-20260603m

## Test

1. Journal → PR-Kachel → Detail.
2. Im Detail: „Auf Karte zeigen“.
3. In der Solo-Karte: „← Zurück“.
4. Erwartung: zurück zur Detailansicht.
5. Im Detail: „← Zurück Journal“.
6. Erwartung: zurück zur Journal-Liste.
7. Karte → PR-Pin → Detail → Zurück.
8. Erwartung: zurück zur Karte.
