@echo off
echo ====================================
echo PDF wird erstellt...
echo ====================================
echo.

REM HTML öffnen in Edge
start msedge --new-window "file:///%CD%/KOCHBUCH_KOMPLETT.html"

echo.
echo ====================================
echo ANLEITUNG:
echo ====================================
echo 1. Edge hat das Kochbuch geöffnet
echo 2. Drücke STRG+P (Drucken)
echo 3. Wähle "Als PDF speichern"
echo 4. Speichern unter: "Veganes_Langlebigkeits_Kochbuch_VOLLSTÄNDIG.pdf"
echo.
echo TIPP: In den Druckeinstellungen:
echo - Ränder: Standard
echo - Skalierung: 100%%
echo - Hintergrundgrafiken: AN
echo ====================================
pause
