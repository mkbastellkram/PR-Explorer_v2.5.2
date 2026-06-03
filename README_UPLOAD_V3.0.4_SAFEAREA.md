# PR Explorer V3.0.4 · iOS Safe-Area Fix

Diese Version setzt gezielt den von iOS benötigten Vollbildmodus für PWAs um:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

Zusätzlich wurde die CSS-Safe-Area-Logik korrigiert:

- Hintergrund bis zur Displaykante
- Bottom-Navigation mit `padding-bottom: env(safe-area-inset-bottom)`
- Panels mit getrenntem Inhaltsabstand
- 100dvh plus visualViewport-Fallback

## Upload

Kompletten ZIP-Inhalt in GitHub hochladen und vorhandene Dateien ersetzen.

## Test-URL

Nach Deployment öffnen mit:

?v=3.0.4-20260603c

## iPhone-Test

1. Alte Homescreen-PWA löschen.
2. Safari Website-Daten für die GitHub-Pages-Domain löschen.
3. Seite mit `?v=3.0.4-20260603c` öffnen.
4. Teilen → Zum Home-Bildschirm.
5. PWA vom Homescreen starten.
