#!/usr/bin/env bash
#
# GSMAXALL — one script to build, lint, typecheck the JS workspace and run every
# Python service test suite. The single "execute everything" entrypoint.
#
# Usage:
#   scripts/gsmaxall.sh            # full pipeline (js + python)
#   scripts/gsmaxall.sh js         # JS workspace only
#   scripts/gsmaxall.sh py         # Python services only
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

GREEN='\033[0;32m'; YELLOW='\033[0;33m'; RED='\033[0;31m'; NC='\033[0m'
step() { echo -e "\n${YELLOW}==> $*${NC}"; }
ok()   { echo -e "${GREEN}✓ $*${NC}"; }
die()  { echo -e "${RED}✗ $*${NC}"; exit 1; }

run_js() {
  command -v pnpm >/dev/null 2>&1 || die "pnpm not found (install Node 22 + pnpm 9)"
  step "Installing JS workspace deps"
  pnpm install --frozen-lockfile || pnpm install
  step "Typecheck";  pnpm typecheck
  step "Lint";       pnpm lint
  step "Build";      pnpm build
  ok "JS workspace: typecheck + lint + build passed"
}

run_py() {
  command -v python3 >/dev/null 2>&1 || die "python3 not found (need 3.11+)"
  step "Installing Python deps"
  python3 -m pip install -q -r requirements-dev.txt
  python3 -m pip install -q "fastapi==0.115.6" "pydantic==2.10.4"
  local failed=0 total=0
  for svc in services/*/; do
    if [ -d "${svc}tests" ]; then
      total=$((total+1))
      step "pytest: ${svc}"
      if ( cd "$svc" && PYTHONPATH=. python3 -m pytest -q ); then
        ok "${svc} tests passed"
      else
        echo -e "${RED}✗ ${svc} tests failed${NC}"; failed=$((failed+1))
      fi
    fi
  done
  [ "$failed" -eq 0 ] || die "${failed}/${total} Python service test suites failed"
  ok "All ${total} Python service test suites passed"
}

case "${1:-all}" in
  js) run_js ;;
  py) run_py ;;
  all) run_js; run_py ;;
  *) die "unknown target '${1}' (use: js | py | all)" ;;
esac

echo -e "\n${GREEN}GSMAXALL pipeline complete.${NC}"
