#!/bin/bash
# scripts/compress_pdf.sh
# Wrapper that delegates to compress_pdf.py

set -euo pipefail
exec python3 "$(dirname "$0")/compress_pdf.py" "$@"
