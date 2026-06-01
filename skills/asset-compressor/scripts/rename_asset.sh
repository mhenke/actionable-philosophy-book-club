#!/bin/bash
# scripts/rename_asset.sh
# Backward-compatible wrapper that delegates to rename_asset.py

set -euo pipefail
exec python3 "$(dirname "$0")/rename_asset.py" "$@"
