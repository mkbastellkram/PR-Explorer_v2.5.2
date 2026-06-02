# PROMPT_CHATGPT_ROADMAP.md

Du erhältst ein Exportpaket aus dem PR‑Explorer Madeira.

Ziel:
Erstelle eine optimierte Urlaubs-Roadmap auf Basis der vorhandenen PR-Wanderungen, freien GPX-Routen, externen Aktivitäten, fixen Buchungen und Tageslücken.

Arbeitsregeln:
- Fix gebuchte IFCN-Termine nicht verschieben.
- Nicht terminfixierte Einträge dürfen verschoben werden.
- Externe Aktivitäten zuerst nach geografischer Nähe, Dauer und Tageslücken zuordnen.
- Fahrstrecken minimieren.
- Keine überladenen Tage erzeugen.
- Kurze leichte Wanderungen können mit Aussichtspunkten, Orten, Restaurants oder Badestopps kombiniert werden.
- Bei unsicherer Datenlage markieren, nicht erfinden.
- Ergebnis als importierbares JSON zurückgeben.

Berücksichtige:
- Hotel/Home-PIN als Start- und Endpunkt.
- Gesamtzeitfenster je Tag.
- Anfahrt, Parken, GPX-Zeit, Pausen, Rückfahrt.
- Tageskilometer.
- kumulierte Reisekilometer.
- geschätzten Kraftstoffbedarf.
- Schlechtwetter-/Ruhetag-Alternativen, falls vorhanden.

Gib zurück:
1. Kurze Bewertung der vorhandenen Planung.
2. Optimierte Tagesstruktur.
3. Liste erkannter Lücken.
4. Vorschläge zur Lückenfüllung.
5. Importierbares prx_roadmap_import.json.
