#!/bin/sh
set -eu

BOOTSTRAP_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
node "$BOOTSTRAP_DIR/../tools/create-orchestration.mjs" init --config "$BOOTSTRAP_DIR/project.example.json" "$@"
