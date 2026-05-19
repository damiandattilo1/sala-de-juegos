#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Script de despliegue en Firebase Hosting
# Proyecto: Sala de Juegos
# Uso:      ./deploy.sh [--skip-tests] [--dry-run]
# =============================================================================

set -euo pipefail

# ── Colores ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # Sin color

# ── Opciones -----------------------------------------------------------------
SKIP_TESTS=false
DRY_RUN=false

for arg in "$@"; do
  case $arg in
    --skip-tests) SKIP_TESTS=true ;;
    --dry-run)    DRY_RUN=true ;;
  esac
done

log()     { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ── Banner -------------------------------------------------------------------
echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}   Sala de Juegos — Deploy a Firebase      ${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# ── 1. Verificar dependencias ------------------------------------------------
log "Verificando dependencias..."

command -v node  &>/dev/null || error "Node.js no está instalado."
command -v npm   &>/dev/null || error "npm no está instalado."
command -v ng    &>/dev/null || error "Angular CLI no está instalado. Ejecutá: npm install -g @angular/cli"
command -v firebase &>/dev/null || error "Firebase CLI no está instalado. Ejecutá: npm install -g firebase-tools"

NODE_VER=$(node --version)
NG_VER=$(ng version 2>/dev/null | grep -i 'Angular CLI' | head -1 | awk '{print $3}' || echo "N/A")
FB_VER=$(firebase --version)
success "Node ${NODE_VER} | Angular CLI ${NG_VER:-N/A} | Firebase CLI ${FB_VER}"

# ── 2. Verificar sesión Firebase ---------------------------------------------
log "Verificando sesión de Firebase..."
FB_USER=$(firebase login:list 2>/dev/null | grep -oP '[\w.+-]+@[\w.-]+' | head -1 || echo "")

if [[ -z "$FB_USER" ]]; then
  warn "No hay sesión activa en Firebase CLI."
  log "Iniciando sesión..."
  firebase login --no-localhost
else
  success "Sesión activa: ${FB_USER}"
fi

# ── 3. Verificar proyecto Firebase -------------------------------------------
log "Verificando proyecto Firebase..."
if [[ ! -f ".firebaserc" ]]; then
  error ".firebaserc no encontrado. Ejecutá 'firebase init hosting' primero."
fi

FB_PROJECT=$(node -e "const fs=require('fs'); try { const rc=JSON.parse(fs.readFileSync('.firebaserc','utf8')); process.stdout.write(rc.projects.default||''); } catch(e) { process.stdout.write(''); }" 2>/dev/null || echo "")
if [[ -z "$FB_PROJECT" ]]; then
  error "No se encontró el proyecto por defecto en .firebaserc"
fi
success "Proyecto: ${FB_PROJECT}"

# ── 4. Instalar dependencias -------------------------------------------------
log "Instalando dependencias npm..."
npm ci --silent
success "Dependencias instaladas."

# ── 5. Tests (opcional) ------------------------------------------------------
if [[ "$SKIP_TESTS" == false ]]; then
  log "Ejecutando tests..."
  if ng test --watch=false --browsers=ChromeHeadless 2>/dev/null; then
    success "Tests pasaron."
  else
    warn "Los tests fallaron. Continuando igualmente (usar --skip-tests para omitir)."
  fi
else
  warn "Tests omitidos (--skip-tests)."
fi

# ── 6. Build de producción ---------------------------------------------------
log "Compilando para producción..."
ng build --configuration=production
success "Build completado: dist/sala-de-juegos/browser"

# ── 7. Deploy ----------------------------------------------------------------
if [[ "$DRY_RUN" == true ]]; then
  warn "Modo --dry-run: no se realizó el deploy."
  log "Ejecutá sin --dry-run para desplegar."
else
  log "Desplegando en Firebase Hosting..."
  firebase deploy --only hosting
  echo ""
  success "¡Deploy exitoso!"
  echo -e "${GREEN}  URL: https://${FB_PROJECT}.web.app${NC}"
  echo ""
fi
