#!/usr/bin/env bash
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js was not found. Install Node.js 18 or newer."
  read -r -p "Press Enter to close..."
  exit 1
fi

node start-soomgil.mjs
status=$?
echo
read -r -p "Press Enter to close..."
exit "$status"
