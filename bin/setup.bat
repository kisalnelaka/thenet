@echo off
title TheNet - Windows Setup

echo 🌐 Starting TheNet Setup...

:: Check for Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js could not be found. Please install it from https://nodejs.org/
    pause
    exit /b
)

:: Install dependencies
echo 📦 Installing dependencies...
call npm install --production

:: Check if build exists
if not exist "dist" (
    echo 🏗️ Building frontend...
    call npm run build
)

:: Detect Local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :done
)
:done
set IP=%IP: =%

echo ✅ Setup Complete!
echo 🚀 To start the server, run: node server.js
echo 💻 On other devices, connect to: http://%IP%:3000
pause
