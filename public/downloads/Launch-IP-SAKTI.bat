@echo off
title IP-SAKTI Enterprise AI RAG Launcher
setlocal

echo =========================================================
echo       IP-SAKTI Regulatory & Patent Intelligence
echo       Enterprise AI RAG Desktop Application
echo =========================================================
echo.
echo Initializing services...

:: Check if server is already running
powershell -Command "try { $res = Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 2; exit 0 } catch { exit 1 }" >nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo Starting IP-SAKTI local engine...
    start /B npm run dev >nul 2>&1
    timeout /t 3 /nobreak >nul
)

echo Launching Desktop Application Window...

:: Try launching in Edge App Mode (Clean borderless desktop window)
where msedge >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start msedge --app=http://localhost:3000/dashboard --start-maximized
    goto done
)

:: Try launching in Chrome App Mode
where chrome >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start chrome --app=http://localhost:3000/dashboard --start-maximized
    goto done
)

:: Fallback to default browser
start http://localhost:3000/dashboard

:done
echo IP-SAKTI Desktop App is running!
exit
