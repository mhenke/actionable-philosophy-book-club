#!/bin/bash
# scripts/compress_pdf.sh
# Usage: ./compress_pdf.sh input.pdf output.pdf

INPUT="$1"
OUTPUT="$2"

if [ -z "$INPUT" ] || [ -z "$OUTPUT" ]; then
  echo "Usage: $0 input.pdf output.pdf"
  exit 1
fi

# Ghostscript settings for maximum compression (/ebook or /screen)
# /screen is lowest resolution (72 dpi), /ebook is medium (150 dpi)
# We use /ebook as a starting point for "maximum" that remains readable.
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook \
   -dNOPAUSE -dQUIET -dBATCH -sOutputFile="$OUTPUT" "$INPUT" < /dev/null

ORIG_SIZE=$(stat -c%s "$INPUT")
NEW_SIZE=$(stat -c%s "$OUTPUT")
echo "PDF Compression Complete."
echo "Original size: $((ORIG_SIZE/1024)) KB"
echo "New size: $((NEW_SIZE/1024)) KB"
