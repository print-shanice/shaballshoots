#!/usr/bin/env bash
# cleanup.sh
# Removes files that were only needed during development/debugging.
# Run once from the project root: bash cleanup.sh

set -e
cd "$(dirname "$0")"

files=(
  # Debugging and fix scripts
  "auto-fix.sh"
  "fix-login.sh"
  "debug-env.js"
  "generate-hash.js"
  "regenerate-env.js"
  "test-env-vars.js"
  "test-fix.js"
  "test-password.js"
  "verify-password.js"
  "final-check.js"

  # Personal notes / one-off instructions
  "COMPLETE_UI_IMPROVEMENTS.md"
  "DO_THIS_NOW.txt"
  "ENV_FIX.txt"
  "GUARANTEED_FIX.txt"
  "QUICK_START.txt"
  "START_HERE.txt"

  # Superseded by database-setup.sql
  "add-favourites-table.sql"
)

removed=0
for f in "${files[@]}"; do
  if [ -f "$f" ]; then
    rm "$f"
    echo "removed: $f"
    ((removed++))
  fi
done

echo ""
echo "done — $removed file(s) removed."
