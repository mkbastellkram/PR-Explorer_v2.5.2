# PR Explorer · Test- und Audit-Hinweise

## Pflichtprüfung nach Upload

1. App öffnen und Versionsanzeige/Changelog prüfen: V2.5.7.
2. iPhone-PWA/Safari hart neu laden, falls alte Dateien sichtbar sind.
3. Einstellungen öffnen und Kartenstil einmal auf Topo, OSM, Satellit, Hybrid, zurück auf Topo wechseln.
4. Route einpassen testen: sichtbare Overlays dürfen nicht unter Bottom-Navigation/Test-Schalter verschwinden.
5. PR-Pin antippen: Detail muss zuverlässig öffnen.
6. Filter-FAB öffnen/schließen.
7. Testprotokoll öffnen, Status und Anmerkung setzen, App schließen/öffnen, Persistenz prüfen.
8. Teilen-Button oben rechts drücken: Audit-Protokoll muss per iOS Share-Sheet, Clipboard oder manuellem Textfeld exportierbar sein.
9. Home-Pin Pestana Promenade prüfen.
10. Fullscreen öffnen/schließen.

## Audit-Status

Zulässige Zustände:

- ✓ Funktioniert
- ✗ Fehler
- ! Anmerkung
- ○ ungeprüft

## Bei Cache-Verdacht

- Safari: Website-Daten für die GitHub-Pages-Domain löschen.
- PWA vom Home-Bildschirm entfernen und neu hinzufügen.
- Danach prüfen, ob `version.json` V2.5.7 meldet.
