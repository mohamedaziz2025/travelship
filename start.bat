@echo off
echo ===============================================
echo    TravelShip - Lancement de l'application
echo ===============================================
echo.

echo [1/3] Verification de MongoDB...
echo Si vous utilisez MongoDB local, assurez-vous qu'il est lance (mongod)
echo Si vous utilisez MongoDB Atlas, ignorez ce message
echo.
timeout /t 2 >nul

echo [2/3] Demarrage du Backend (Port 5000)...
start "TravelShip Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 >nul

echo [3/3] Demarrage du Frontend (Port 3000)...
start "TravelShip Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 2 >nul

echo.
echo ===============================================
echo    Application lancee avec succes !
echo ===============================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Ouvrez votre navigateur sur http://localhost:3000
echo.
echo Pour arreter l'application, fermez les fenetres de terminal
echo ===============================================
pause
