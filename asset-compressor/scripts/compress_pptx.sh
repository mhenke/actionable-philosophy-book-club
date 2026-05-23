#!/bin/bash
# scripts/compress_pptx.sh
# Wrapper that delegates to compress_pptx.py

set -euo pipefail
exec python3 "$(dirname "$0")/compress_pptx.py" "$@"
