@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Perfect Shot - Android APK ^& Voodoo AAB Builder

echo ========================================================
echo   PERFECT SHOT: GUN HIT - ANDROID APK / AAB BUILDER
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
  echo [1/7] Menginstall dependency project...
  call npm install
  if errorlevel 1 goto :fail
) else (
  echo [1/7] node_modules sudah siap.
)

if not exist "node_modules\@capacitor\android" (
  echo [2/7] Menginstall Capacitor Android, App, dan AdMob plugin...
  call npm install @capacitor/core @capacitor/android @capacitor/app @capacitor-community/admob
  if errorlevel 1 goto :fail
  call npm install -D @capacitor/cli
  if errorlevel 1 goto :fail
) else (
  echo [2/7] Capacitor Android & AdMob plugin sudah terpasang.
)

if not exist ".env" if exist ".env.txt" (
  echo [INFO] Menemukan .env.txt, menyalin otomatis ke .env...
  copy /Y ".env.txt" ".env" >nul
)

echo [3/7] Membangun web bundle produksi (dist)...
call npm run build
if errorlevel 1 goto :fail

if not exist "android" (
  echo [4/7] Membuat project Android Capacitor...
  call npx cap add android
  if errorlevel 1 goto :fail
) else (
  echo [4/7] Folder android sudah ada.
)

echo [5/7] Menyinkronkan aset ke Android...
call npx cap sync android
if errorlevel 1 goto :fail

set "ADMOB_APP_ID=ca-app-pub-3940256099942544~3347511713"
set "GA_GAME_KEY="
set "GA_SECRET_KEY="
set "ADJUST_TOKEN="
set "ADJUST_SANDBOX=false"
set "FB_APP_ID="
set "FB_CLIENT_TOKEN="

set "ENV_FILE="
if exist ".env" (
  set "ENV_FILE=.env"
) else if exist ".env.txt" (
  set "ENV_FILE=.env.txt"
)

if defined ENV_FILE (
  for /f "usebackq tokens=1,* delims==" %%A in ("%ENV_FILE%") do (
    set "K=%%~A"
    set "V=%%~B"
    if defined V set "V=!V:"=!"
    if "!K!"=="VITE_ADMOB_APP_ID" if not "!V!"=="" set "ADMOB_APP_ID=!V!"
    if "!K!"=="VITE_VOODOO_GA_GAME_KEY" set "GA_GAME_KEY=!V!"
    if "!K!"=="VITE_VOODOO_GA_SECRET_KEY" set "GA_SECRET_KEY=!V!"
    if "!K!"=="VITE_VOODOO_ADJUST_TOKEN" set "ADJUST_TOKEN=!V!"
    if "!K!"=="VITE_VOODOO_ADJUST_SANDBOX" if not "!V!"=="" set "ADJUST_SANDBOX=!V!"
    if "!K!"=="VITE_VOODOO_FB_APP_ID" set "FB_APP_ID=!V!"
    if "!K!"=="VITE_VOODOO_FB_CLIENT_TOKEN" set "FB_CLIENT_TOKEN=!V!"
  )
)

echo [6/7] Memasang plugin Voodoo (GameAnalytics + Adjust + Facebook) ^& Manifest...
powershell -NoProfile -ExecutionPolicy Bypass -File "android-voodoo\patch-android.ps1"
if errorlevel 1 goto :fail

echo [7/7] Mencoba build Debug APK lewat Gradle...
if not defined JAVA_HOME (
  if exist "C:\Program Files\Android\Android Studio\jbr\bin\java.exe" set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
  if not defined JAVA_HOME if exist "C:\Program Files\Android\Android Studio\jre\bin\java.exe" set "JAVA_HOME=C:\Program Files\Android\Android Studio\jre"
  if not defined JAVA_HOME if exist "%LOCALAPPDATA%\Programs\Android Studio\jbr\bin\java.exe" set "JAVA_HOME=%LOCALAPPDATA%\Programs\Android Studio\jbr"
)
if defined JAVA_HOME set "PATH=%JAVA_HOME%\bin;%PATH%"

if not defined ANDROID_HOME if exist "%LOCALAPPDATA%\Android\Sdk" set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
if not defined ANDROID_SDK_ROOT if defined ANDROID_HOME set "ANDROID_SDK_ROOT=%ANDROID_HOME%"

if not defined CAPACITOR_ANDROID_STUDIO_PATH (
  if exist "C:\Program Files\Android\Android Studio\bin\studio64.exe" set "CAPACITOR_ANDROID_STUDIO_PATH=C:\Program Files\Android\Android Studio\bin\studio64.exe"
  if not defined CAPACITOR_ANDROID_STUDIO_PATH if exist "%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe" set "CAPACITOR_ANDROID_STUDIO_PATH=%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe"
)

if exist "android\gradlew.bat" (
  pushd android
  call gradlew.bat assembleDebug
  set "GRADLE_ERR=!errorlevel!"
  popd
  if "!GRADLE_ERR!"=="0" (
    if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
      copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "PerfectShot-debug.apk" >nul
      echo.
      echo [SUKSES] APK jadi! File tersimpan di: PerfectShot-debug.apk
    )
  ) else (
    echo.
    echo [INFO] Gradle CLI gagal build otomatis. Cek apakah Android Studio ^& Android SDK sudah terpasang.
    echo        Jika belum punya Android Studio, download di: https://developer.android.com/studio
  )
)

echo.
echo Membuka Android Studio...
call npx cap open android
if errorlevel 1 (
  echo [INFO] Android Studio tidak bisa dibuka otomatis.
  echo        Buka Android Studio secara manual, lalu pilih Open folder: %CD%\android
)
echo.
echo Selesai!
echo   - File APK tes HP (jika sukses): PerfectShot-debug.apk
echo   - Atau di Android Studio: Build ^> Build Bundle(s) / APK(s) ^> Build APK(s)
echo   - Untuk Google Play (.aab): Build ^> Generate Signed Bundle / APK ^> Android App Bundle
echo.
pause
exit /b 0

:fail
echo.
echo [GAGAL] Proses build terhenti. Periksa pesan error di atas.
pause
exit /b 1
