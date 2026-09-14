@echo off
echo Starting 3D Cadastral & Land Governance Platform...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)
echo Launching Vite Dev Server...
start http://localhost:5173
call npm run dev
pause
