@echo off
echo ========================================
echo Verification des colonnes de branding
echo ========================================
echo.

mysql -u root -p flynova -e "DESCRIBE virtual_airlines;" > nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo Verification de la structure de la table virtual_airlines...
    echo.
    mysql -u root -p flynova -e "SHOW COLUMNS FROM virtual_airlines WHERE Field IN ('primary_color', 'secondary_color', 'accent_color', 'text_on_primary');"
    echo.
    echo ========================================
    echo.
    echo Si vous voyez 4 lignes ci-dessus avec les noms :
    echo - primary_color
    echo - secondary_color
    echo - accent_color
    echo - text_on_primary
    echo.
    echo Alors la migration a ete appliquee avec succes !
    echo.
    echo Si vous ne voyez rien, executez : apply-branding-migration.bat
    echo.
) else (
    echo ERREUR : Impossible de se connecter a la base de donnees.
    echo Verifiez que MySQL est lance et que la base flynova existe.
)

pause
