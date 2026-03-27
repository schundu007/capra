#!/bin/bash
# Run all 5 phases sequentially with Claude Code CLI
# Usage: ./prompts/run-all.sh [phase_number]
# Example: ./prompts/run-all.sh        # Run all phases
# Example: ./prompts/run-all.sh 3      # Run only phase 3

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

run_phase() {
  local phase=$1
  local file=$2
  local desc=$3

  echo ""
  echo "============================================"
  echo "  PHASE $phase: $desc"
  echo "============================================"
  echo ""
  echo "Starting in 5 seconds... (Ctrl+C to cancel)"
  sleep 5

  claude --print "$(cat "$SCRIPT_DIR/$file")"

  echo ""
  echo "Phase $phase complete."
  echo ""
}

# If a specific phase is requested
if [ -n "$1" ]; then
  case $1 in
    1) run_phase 1 "phase1-critical-fixes.md" "Critical Foundation Fixes" ;;
    2) run_phase 2 "phase2-state-architecture.md" "State Architecture & Code Splitting" ;;
    3) run_phase 3 "phase3-ux-modernization.md" "UX Modernization" ;;
    4) run_phase 4 "phase4-performance.md" "Performance Optimization" ;;
    5) run_phase 5 "phase5-quality-security.md" "Code Quality & Security" ;;
    *) echo "Invalid phase: $1 (use 1-5)" && exit 1 ;;
  esac
  exit 0
fi

# Run all phases
echo "Running all 5 phases sequentially."
echo "Each phase will be run as a separate Claude Code session."
echo ""

run_phase 1 "phase1-critical-fixes.md" "Critical Foundation Fixes"
run_phase 2 "phase2-state-architecture.md" "State Architecture & Code Splitting"
run_phase 3 "phase3-ux-modernization.md" "UX Modernization"
run_phase 4 "phase4-performance.md" "Performance Optimization"
run_phase 5 "phase5-quality-security.md" "Code Quality & Security"

echo ""
echo "============================================"
echo "  ALL PHASES COMPLETE"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Run: cd frontend && npm run dev"
echo "  2. Test the app manually"
echo "  3. Push: git push -u origin $(git branch --show-current)"
echo ""
