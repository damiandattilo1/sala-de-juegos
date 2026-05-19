# =============================================================================
# deploy.ps1 — Script de despliegue en Firebase Hosting (PowerShell)
# Proyecto: Sala de Juegos
# Uso:      .\deploy.ps1 [-SkipTests] [-DryRun]
# =============================================================================

[CmdletBinding()]
param(
    [switch]$SkipTests,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Helpers ------------------------------------------------------------------
function Log     { param($msg) Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Success { param($msg) Write-Host "[OK]    $msg" -ForegroundColor Green }
function Warn    { param($msg) Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Err     { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red; exit 1 }

# ── Banner -------------------------------------------------------------------
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Sala de Juegos — Deploy a Firebase      " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Verificar dependencias ------------------------------------------------
Log "Verificando dependencias..."

if (-not (Get-Command node  -ErrorAction SilentlyContinue)) { Err "Node.js no está instalado." }
if (-not (Get-Command npm   -ErrorAction SilentlyContinue)) { Err "npm no está instalado." }
if (-not (Get-Command ng    -ErrorAction SilentlyContinue)) { Err "Angular CLI no instalado. Ejecutá: npm install -g @angular/cli" }
if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) { Err "Firebase CLI no instalado. Ejecutá: npm install -g firebase-tools" }

$nodeVer = (node --version)
$ngVer   = try { (ng version 2>&1 | Select-String 'Angular CLI' | Select-Object -First 1).ToString().Trim().Split() | Select-Object -Last 1 } catch { "N/A" }
$fbVer   = (firebase --version)
Success "Node $nodeVer | Angular CLI $ngVer | Firebase CLI $fbVer"

# ── 2. Verificar sesión Firebase ---------------------------------------------
Log "Verificando sesión de Firebase..."
$fbUser = ""
try {
    $loginList = firebase login:list 2>&1
    $fbUser = ($loginList | Select-String -Pattern '[\w.+-]+@[\w.-]+').Matches.Value | Select-Object -First 1
} catch {}

if (-not $fbUser) {
    Warn "No hay sesión activa en Firebase CLI."
    Log "Iniciando sesión..."
    firebase login --no-localhost
} else {
    Success "Sesión activa: $fbUser"
}

# ── 3. Verificar proyecto Firebase -------------------------------------------
Log "Verificando proyecto Firebase..."
if (-not (Test-Path ".firebaserc")) {
    Err ".firebaserc no encontrado. Ejecutá 'firebase init hosting' primero."
}

$fbrcContent = Get-Content ".firebaserc" -Raw | ConvertFrom-Json
$fbProject   = $fbrcContent.projects.default
if (-not $fbProject) {
    Err "No se encontró el proyecto por defecto en .firebaserc"
}
Success "Proyecto: $fbProject"

# ── 4. Instalar dependencias -------------------------------------------------
Log "Instalando dependencias npm..."
npm ci --silent
if ($LASTEXITCODE -ne 0) { Err "npm ci falló." }
Success "Dependencias instaladas."

# ── 5. Tests (opcional) ------------------------------------------------------
if (-not $SkipTests) {
    Log "Ejecutando tests..."
    ng test --watch=false --browsers=ChromeHeadless 2>&1
    if ($LASTEXITCODE -ne 0) {
        Warn "Los tests fallaron. Continuando igualmente."
    } else {
        Success "Tests pasaron."
    }
} else {
    Warn "Tests omitidos (-SkipTests)."
}

# ── 6. Build de producción ---------------------------------------------------
Log "Compilando para producción..."
ng build --configuration=production
if ($LASTEXITCODE -ne 0) { Err "El build falló." }
Success "Build completado: dist/sala-de-juegos/browser"

# ── 7. Deploy ----------------------------------------------------------------
if ($DryRun) {
    Warn "Modo -DryRun: no se realizó el deploy."
    Log "Ejecutá sin -DryRun para desplegar."
} else {
    Log "Desplegando en Firebase Hosting..."
    firebase deploy --only hosting
    if ($LASTEXITCODE -ne 0) { Err "El deploy falló." }
    Write-Host ""
    Success "¡Deploy exitoso!"
    Write-Host "  URL: https://$($fbProject).web.app" -ForegroundColor Green
    Write-Host ""
}
