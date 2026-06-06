# PR Explorer Madeira · V3.3.1

Zwischenstand auf Basis V3.3.0 mit Rückführung wichtiger Produktfunktionen in das neue Floating-/Strava-Navigationsmuster.

## Änderungen gegenüber V3.3.0

- OSM Hiking / Waymarked Trails als Layer wieder eingebunden.
- Solo-Modus freigestellt: Im Solo-Modus werden nur der aktive PR, dessen GPX und dessen KML-Anfahrt priorisiert angezeigt.
- Start-/Ziel-/Anfahrtsmarker im Solo-Modus ergänzt.
- GPX/KML-Linien mit weißer Kontur und stärkerer Sichtbarkeit im Solo-Modus.
- Höhenprofil-Vorschau im Detail-Sheet ergänzt.
- Hinweis: Die aktuelle GPX-Extraktion enthält keine Höhenpunkte; das Profil nutzt vorhandene Hoch-/Tiefwerte als Vorschau.
- Safe-Area unten entschärft, damit weniger Displayfläche verschenkt wird.
- Detail-Bottom-Sheet mit besser greifbarem Drag-Handle; nach unten ziehen schließt das Sheet.
- Status-Badges vorbereitet: offen / eingeschränkt / gesperrt / Status prüfen. Aktuell ohne Live-IFCN-Abruf, sofern keine Statusdaten im Datenbestand vorhanden sind.
- Layersteuerung um OSM Hiking erweitert.
- Kontextmarker für Webcams/Sehenswürdigkeiten bleiben an den aktiven PR gebunden und werden beim PR-Wechsel gelöscht.

## Testpunkte iPhone

1. Hauptkarte lädt und nutzt die untere Displayfläche besser.
2. OSM Hiking Layer ist sichtbar und schaltbar.
3. PR-Pin antippen → unten erscheint Floating-Karussell.
4. Solo-Button → nur aktiver PR mit GPX/KML-Fokus.
5. Detail öffnen → Höhenprofil sichtbar.
6. Griff oben am Sheet nach unten ziehen → Sheet schließt.
7. Webcams/Sehenswürdigkeiten auswählen → Marker erscheinen.
8. Wechsel auf nächsten PR → alte Kontextmarker verschwinden.

## Bekannte Einschränkungen

- Status offen/eingeschränkt/gesperrt ist vorbereitet, aber noch kein echter Live-Abruf.
- Sehenswürdigkeiten/Webcams sind noch bewusst schlank und nicht vollständig redaktionell ausgearbeitet.
- Höhenprofil ist eine Vorschau auf Basis vorhandener Höhenstammdaten, kein echtes Punktprofil aus GPX-Elevation.
