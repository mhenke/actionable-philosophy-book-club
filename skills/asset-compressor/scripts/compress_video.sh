#!/bin/bash
# scripts/compress_video.sh
# Wrapper that delegates to compress_video.py

set -euo pipefail
exec python3 "$(dirname "$0")/compress_video.py" "$@"
