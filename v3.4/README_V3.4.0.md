# PR Explorer Madeira · V3.3.3

Statusmodul auf Basis von MadeiraJourney / IFCN-Aggregat, Stand 05.06.2026 15:40.

## Neu in V3.3.3

- lokale Statusdatei `window.PRX_DATA.statuses`
- Status-Ampel am PR-Pin aktiv: offen / eingeschränkt / gesperrt / unbekannt
- Status-Chip in PR-Karte und Detail-Sheet
- Statusfilter: Offen, Eingeschränkt, Gesperrt
- Quellen-/Stand-Hinweis im Detail-Sheet
- PR3 Madeira bleibt offen; Porto-Santo-PR3 ist geschlossen und wird nicht auf Madeira-PR3 übertragen

## Statusdaten

Quelle: MadeiraJourney Trails Status, laut Seite aus IFCN-Daten aggregiert.
Offizielle Prüfung vor jeder Wanderung weiterhin erforderlich.

Geschlossen:
- PR1.3
- PR7
- PR10
- PR20
- PR27
- PR28

Eingeschränkt:
- PR4
- PR12

Offen:
- übrige im Datenbestand vorhandene Madeira-PRs laut Statusliste / Einzelliste

## Test

Öffnen mit:

`index.html?v=3.3.3`

Testpunkte:

1. Ampelpunkte an Pins sichtbar.
2. Statusfilter begrenzt die PRs.
3. Detail-Sheet zeigt Quelle und Stand.
4. PR4 / PR12 orange.
5. PR1.3 / PR7 / PR10 / PR20 / PR27 / PR28 rot.
6. PR3 Madeira bleibt grün/offen.
