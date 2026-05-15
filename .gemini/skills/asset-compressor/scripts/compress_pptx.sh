#!/bin/bash
# scripts/compress_pptx.sh
# Usage: ./compress_pptx.sh input.pptx output.pptx

INPUT="$1"
OUTPUT="$2"

if [ -z "$INPUT" ] || [ -z "$OUTPUT" ]; then
  echo "Usage: $0 input.pptx output.pptx"
  exit 1
fi

TMP_DIR=$(mktemp -d)
unzip -q "$INPUT" -d "$TMP_DIR"

# Find images and compress them using mogrify if available, or just re-zip
# PPTX is already a zip. Most size comes from media/ folder.
# We will focus on re-zipping with maximum compression for now.
# Future enhancement: iterate through $TMP_DIR/ppt/media/ and shrink images.

cd "$TMP_DIR"
zip -9 -r "compressed.pptx" . > /dev/null < /dev/null
cd - > /dev/null

mv "$TMP_DIR/compressed.pptx" "$OUTPUT"
rm -rf "$TMP_DIR"

ORIG_SIZE=$(stat -c%s "$INPUT")
NEW_SIZE=$(stat -c%s "$OUTPUT")
echo "PPTX Compression Complete (Re-zipped with -9)."
echo "Original size: $((ORIG_SIZE/1024)) KB"
echo "New size: $((NEW_SIZE/1024)) KB"
