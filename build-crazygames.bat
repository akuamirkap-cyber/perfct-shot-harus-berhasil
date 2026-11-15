@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Perfect Shot - CrazyGames Single index.html Builder

echo ========================================================
echo   PERFECT SHOT: GUN HIT - CRAZYGAMES BUILDER
echo ========================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js tidak ditemukan! Silakan install Node.js LTS dulu.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm tidak ditemukan!
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [1/3] Menginstall dependency project...
  call npm install
  if errorlevel 1 goto :fail
) else (
  echo [1/3] node_modules sudah siap.
)

echo [2/3] Menggabungkan seluruh game ke satu file index.html...
call node scripts\build-crazygames.mjs
if errorlevel 1 goto :fail

if exist "PerfectShot-CrazyGames.zip" del /f /q "PerfectShot-CrazyGames.zip"

echo.
echo [3/3] SELESAI!
echo.
echo   File siap upload: crazygames-upload\index.html
echo.
echo   Cara upload ke CrazyGames:
echo     - Buka halaman upload CrazyGames Developer Portal.
echo     - JANGAN upload file .zip (CrazyGames menolak file arsip).
echo     - Drag ^& drop file "crazygames-upload\index.html" LANGSUNG ke kotak upload!
echo.
pause
exit /b 0

:fail
echo.
echo [GAGAL] Proses build terhenti. Periksa pesan error di atas.
pause
exit /b 1
