#!/bin/bash
set -euo pipefail

# Faqat remote (web) muhitda ishlaydi
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# GitHub CLI token — barcha sessiyalarda gh ishlashi uchun
echo 'export GH_TOKEN="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"' >> "$CLAUDE_ENV_FILE"

# Dependencies o'rnatish
cd "$CLAUDE_PROJECT_DIR"
npm install
