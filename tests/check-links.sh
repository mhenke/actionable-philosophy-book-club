#!/bin/bash
set -euo pipefail

ERRORS=0

while IFS= read -r path; do
  [[ "$path" =~ ^\$\{ ]] && continue
  if [ ! -f "$path" ]; then
    echo "BROKEN: #p=$path"
    ERRORS=$((ERRORS + 1))
  fi
done < <(grep -oP '(?<=href="#p=)[^"]+' index.html)

while IFS= read -r path; do
  [[ "$path" =~ ^\$\{ ]] && continue
  [[ "$path" == http* ]] && continue
  if [ ! -f "$path" ]; then
    echo "BROKEN asset href: $path"
    ERRORS=$((ERRORS + 1))
  fi
done < <(grep -oP '(?<=href=")[^"]+\.(mp4|pptx|png)(?=")' index.html)

if [ "$ERRORS" -gt 0 ]; then
  exit 1
fi

echo "Link check passed."
