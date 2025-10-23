@echo off
echo ========================================
echo FlyNova - VA Branding Migration
echo ========================================
echo.
echo Cette migration va ajouter les colonnes de branding aux VAs.
echo.
echo Colonnes qui seront ajoutees :
echo - primary_color (couleur principale)
echo - secondary_color (couleur secondaire)
echo - accent_color (couleur accent)
echo - text_on_primary (couleur texte)
echo.
echo ========================================
echo.

set /p confirm="Voulez-vous continuer ? (O/N): "

if /i "%confirm%" NEQ "O" (
    echo.
    echo Migration annulee.
    pause
    exit /b
)

echo.
echo Application de la migration...
echo.

mysql -u root -p flynova < add-va-branding.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Migration appliquee avec succes !
    echo ========================================
    echo.
    echo Les Virtual Airlines peuvent maintenant avoir :
    echo - Leur propre logo
    echo - Leurs propres couleurs de marque
    echo.
    echo Le branding s'applique automatiquement dans le dashboard VA.
    echo.
) else (
    echo.
    echo ========================================
    echo ERREUR lors de la migration !
    echo ========================================
    echo.
    echo Verifiez que :
    echo - MySQL est en cours d'execution
    echo - La base flynova existe
    echo - Les identifiants sont corrects
    echo.
)

pause
