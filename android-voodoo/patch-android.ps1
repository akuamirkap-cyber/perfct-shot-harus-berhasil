$ErrorActionPreference = 'Stop'

$admobAppId = if ($env:ADMOB_APP_ID) { $env:ADMOB_APP_ID } else { 'ca-app-pub-3940256099942544~3347511713' }
$gaGameKey = if ($env:GA_GAME_KEY) { $env:GA_GAME_KEY } else { '' }
$gaSecretKey = if ($env:GA_SECRET_KEY) { $env:GA_SECRET_KEY } else { '' }
$adjustToken = if ($env:ADJUST_TOKEN) { $env:ADJUST_TOKEN } else { '' }
$adjustSandbox = if ($env:ADJUST_SANDBOX) { $env:ADJUST_SANDBOX } else { 'false' }
$fbAppId = if ($env:FB_APP_ID) { $env:FB_APP_ID } else { '' }
$fbClientToken = if ($env:FB_CLIENT_TOKEN) { $env:FB_CLIENT_TOKEN } else { '' }

# 1. Copy Capacitor Java plugin + MainActivity into the app package folder
$javaDir = 'android\app\src\main\java\com\amirkap\perfectshot'
if (-not (Test-Path $javaDir)) {
  New-Item -ItemType Directory -Path $javaDir -Force | Out-Null
}
if (Test-Path 'android-voodoo\MainActivity.java') {
  Copy-Item -Path 'android-voodoo\MainActivity.java' -Destination "$javaDir\MainActivity.java" -Force
}
if (Test-Path 'android-voodoo\VoodooAnalyticsPlugin.java') {
  Copy-Item -Path 'android-voodoo\VoodooAnalyticsPlugin.java' -Destination "$javaDir\VoodooAnalyticsPlugin.java" -Force
}

# 1b. Ensure android\local.properties points to Android SDK when available
$sdkCandidates = @(
  @(
    $env:ANDROID_HOME,
    $env:ANDROID_SDK_ROOT,
    "$env:LOCALAPPDATA\Android\Sdk",
    "C:\Android\Sdk"
  ) | Where-Object { $_ -and (Test-Path $_) }
)
if ($sdkCandidates.Count -gt 0) {
  $sdkFirst = [string]$sdkCandidates[0]
  $sdkEscaped = ($sdkFirst -replace '\\', '\\') -replace ':', '\:'
  Set-Content -Path 'android\local.properties' -Value "sdk.dir=$sdkEscaped" -Encoding ASCII
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
function Write-Utf8NoBom([string]$Path, [string]$Content) {
  $clean = $Content.TrimStart([char]0xFEFF)
  $full = (Resolve-Path $Path).Path
  [System.IO.File]::WriteAllText($full, $clean, $utf8NoBom)
}

# 2. Add GameAnalytics Maven repository to root build.gradle or settings.gradle
$gaMaven = "maven { url 'https://maven.gameanalytics.com/release' }"
$rootGradle = 'android\build.gradle'
if (Test-Path $rootGradle) {
  $txt = (Get-Content -Raw -Encoding UTF8 $rootGradle).TrimStart([char]0xFEFF)
  if (($txt -match 'allprojects\s*\{\s*repositories\s*\{') -and ($txt -notmatch 'maven\.gameanalytics\.com')) {
    $txt = [regex]::Replace($txt, '(allprojects\s*\{\s*repositories\s*\{)', "`$1`r`n        $gaMaven", 1)
  }
  Write-Utf8NoBom $rootGradle $txt
}

$settingsGradle = 'android\settings.gradle'
if (Test-Path $settingsGradle) {
  $stxt = (Get-Content -Raw -Encoding UTF8 $settingsGradle).TrimStart([char]0xFEFF)
  if (($stxt -match 'dependencyResolutionManagement') -and ($stxt -notmatch 'maven\.gameanalytics\.com')) {
    $stxt = [regex]::Replace($stxt, '(dependencyResolutionManagement[\s\S]*?repositories\s*\{)', "`$1`r`n        $gaMaven", 1)
  }
  Write-Utf8NoBom $settingsGradle $stxt
}

# 3. Add GameAnalytics, Adjust, Install Referrer, and Facebook dependencies to app/build.gradle
$appGradle = 'android\app\build.gradle'
if (Test-Path $appGradle) {
  $gtxt = (Get-Content -Raw -Encoding UTF8 $appGradle).TrimStart([char]0xFEFF)
  $deps = @(
    "implementation 'com.gameanalytics.sdk:gameanalytics-android:6.5.2'",
    "implementation 'com.adjust.sdk:adjust-android:4.38.5'",
    "implementation 'com.android.installreferrer:installreferrer:2.2'",
    "implementation 'com.facebook.android:facebook-android-sdk:17.0.2'"
  )
  $missing = @()
  foreach ($d in $deps) {
    $pkg = ($d -split "'")[1] -split ':' | Select-Object -First 2
    $pattern = [regex]::Escape(($pkg -join ':'))
    if ($gtxt -notmatch $pattern) {
      $missing += "    $d"
    }
  }
  if ($missing.Count -gt 0) {
    $insert = ($missing -join "`r`n")
    $gtxt = [regex]::Replace($gtxt, '(dependencies\s*\{)', "`$1`r`n$insert", 1)
  }
  Write-Utf8NoBom $appGradle $gtxt
}

# 4. Write Voodoo & Facebook keys into res/values/strings.xml
$stringsPath = 'android\app\src\main\res\values\strings.xml'
if (Test-Path $stringsPath) {
  $sxml = [xml](Get-Content -Raw -Encoding UTF8 $stringsPath)
  $pairs = [ordered]@{
    'ga_game_key' = $gaGameKey
    'ga_secret_key' = $gaSecretKey
    'adjust_app_token' = $adjustToken
    'adjust_sandbox' = $adjustSandbox
    'facebook_app_id' = $fbAppId
    'facebook_client_token' = $fbClientToken
  }
  foreach ($k in $pairs.Keys) {
    $node = $sxml.resources.SelectSingleNode("string[@name='$k']")
    if (-not $node) {
      $node = $sxml.CreateElement('string')
      $node.SetAttribute('name', $k)
      $sxml.resources.AppendChild($node) | Out-Null
    }
    $node.InnerText = $pairs[$k]
  }
  $sxml.Save((Resolve-Path $stringsPath))
}

# 5. Patch AndroidManifest.xml with required permissions and AdMob / Facebook meta-data
$manifestPath = 'android\app\src\main\AndroidManifest.xml'
if (Test-Path $manifestPath) {
  $xml = [xml](Get-Content -Raw -Encoding UTF8 $manifestPath)
  $ns = 'http://schemas.android.com/apk/res/android'
  $reqPerms = @('android.permission.INTERNET', 'com.google.android.gms.permission.AD_ID')
  foreach ($perm in $reqPerms) {
    $found = $false
    foreach ($p in $xml.manifest.SelectNodes('uses-permission')) {
      if ($p.GetAttribute('name', $ns) -eq $perm) { $found = $true }
    }
    if (-not $found) {
      $el = $xml.CreateElement('uses-permission')
      $el.SetAttribute('name', $ns, $perm) | Out-Null
      $xml.manifest.PrependChild($el) | Out-Null
    }
  }

  $app = $xml.manifest.application
  $metas = [ordered]@{
    'com.google.android.gms.ads.APPLICATION_ID' = $admobAppId
  }
  if ($fbAppId) {
    $metas['com.facebook.sdk.ApplicationId'] = '@string/facebook_app_id'
  }
  if ($fbClientToken) {
    $metas['com.facebook.sdk.ClientToken'] = '@string/facebook_client_token'
  }

  foreach ($mName in $metas.Keys) {
    $meta = $null
    foreach ($m in $app.SelectNodes('meta-data')) {
      if ($m.GetAttribute('name', $ns) -eq $mName) { $meta = $m }
    }
    if (-not $meta) {
      $meta = $xml.CreateElement('meta-data')
      $meta.SetAttribute('name', $ns, $mName) | Out-Null
      $app.AppendChild($meta) | Out-Null
    }
    $meta.SetAttribute('value', $ns, $metas[$mName]) | Out-Null
  }

  $xml.Save((Resolve-Path $manifestPath))
}

Write-Host "[Voodoo/AdMob] Native Android configuration synced."
