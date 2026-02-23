#!/bin/bash
set -euo pipefail

# Faqat remote (web) muhitda ishlaydi
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# GH_TOKEN endi global hook da (~/.claude/hooks/session-start.sh)
# Bu yerda faqat proyektga xos ishlar

# Dependencies o'rnatish
cd "$CLAUDE_PROJECT_DIR"
npm install
