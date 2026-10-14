@echo off
echo =========================================
echo    FakeShield - Fake News Detection App
echo =========================================

:: -------- BACKEND SETUP --------
echo.
cd backend

IF NOT EXIST node_modules (
    echo Installing backend dependencies...
    call npm install
    if %errorlevel% neq 0 (echo Backend install failed & pause & exit /b 1)
) ELSE (
    echo Backend dependencies already installed.
)

:: -------- FRONTEND SETUP --------
echo.
cd ..\frontend

IF NOT EXIST node_modules (
    echo Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (echo Frontend install failed & pause & exit /b 1)
) ELSE (
    echo Frontend dependencies already installed.
)

:: -------- START BACKEND --------
echo.
echo Starting backend server...
cd ..\backend
start "FakeShield Backend" cmd /k "node server.js"

timeout /t 3 /nobreak > nul

:: -------- START FRONTEND --------
echo Starting frontend...
cd ..\frontend
start "FakeShield Frontend" cmd /k "npm start"

echo.
echo =========================================
echo    Servers are running
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo.
echo    Admin:  admin / admin123
echo    User:   testuser / user123
echo =========================================

pause