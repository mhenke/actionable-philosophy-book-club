#!/usr/bin/env bash
set -euo pipefail

# Downloads Inter fonts (woff2) from Google Fonts CSS and generates assets/fonts/fonts.css
# Usage: ./scripts/download-inter.sh

DEST_DIR="assets/fonts"
CSS_URL="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
TMP_CSS=$(mktemp)

mkdir -p "$DEST_DIR"

# Fetch the Google Fonts CSS
curl -s -A 'Mozilla/5.0 (X11; Linux x86_64)' "$CSS_URL" -o "$TMP_CSS"

# Extract unique font URLs and download them
grep -o 'https://fonts.gstatic.com/[^)\"]*' "$TMP_CSS" | sort -u | while read -r url; do
  fname=$(basename "$url")
  if [ ! -f "$DEST_DIR/$fname" ]; then
    echo "Downloading $url -> $DEST_DIR/$fname"
    curl -L -s -o "$DEST_DIR/$fname" "$url"
  else
    echo "Skipping existing $DEST_DIR/$fname"
  fi
done

# Generate fonts.css with @font-face declarations
CSS_OUT="$DEST_DIR/fonts.css"
rm -f "$CSS_OUT"
echo "/* Generated fonts.css - self-hosted Inter */" > "$CSS_OUT"

for f in "$DEST_DIR"/*.woff2; do
  [ -e "$f" ] || continue
  base=$(basename "$f")
  weight=400
  if echo "$base" | grep -q "300"; then weight=300; fi
  if echo "$base" | grep -q "500"; then weight=500; fi
  if echo "$base" | grep -q "600"; then weight=600; fi
  if echo "$base" | grep -q "700"; then weight=700; fi
  cat >> "$CSS_OUT" <<EOF
@font-face {
  font-family: 'Inter';
  src: url('/$DEST_DIR/$base') format('woff2');
  font-weight: $weight;
  font-style: normal;
  font-display: swap;
}

EOF
done

# Clean up
rm -f "$TMP_CSS"

echo "Fonts downloaded to $DEST_DIR and $CSS_OUT generated."