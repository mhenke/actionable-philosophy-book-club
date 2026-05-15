#!/bin/bash
# batch_compress.sh

SKILL_DIR="asset-compressor/scripts"
TOTAL_ORIG=0
TOTAL_NEW=0

TMP_STATS=$(mktemp)
echo "0 0" > "$TMP_STATS"

find . -type f \( -name "*.pdf" -o -name "*.mp4" -o -name "*.pptx" \) -not -path "./asset-compressor/*" -print0 | while IFS= read -r -d '' f; do
    echo "Processing: $f"
    orig_size=$(stat -c%s "$f")
    
    ext="${f##*.}"
    script=""
    case "$ext" in
        pdf)  script="$SKILL_DIR/compress_pdf.sh" ;;
        mp4)  script="$SKILL_DIR/compress_video.sh" ;;
        pptx) script="$SKILL_DIR/compress_pptx.sh" ;;
    esac

    temp_file="${f}.tmp"
    bash "$script" "$f" "$temp_file"
    
    if [ -f "$temp_file" ]; then
        new_size=$(stat -c%s "$temp_file")
        if [ "$new_size" -lt "$orig_size" ]; then
            mv "$temp_file" "$f"
            echo "  Reduced: $((orig_size/1024))KB -> $((new_size/1024))KB"
            read o n < "$TMP_STATS"
            echo "$((o + orig_size)) $((n + new_size))" > "$TMP_STATS"
        else
            echo "  No improvement."
            rm "$temp_file"
            read o n < "$TMP_STATS"
            echo "$((o + orig_size)) $((n + orig_size))" > "$TMP_STATS"
        fi
    else
        echo "  Failed."
        read o n < "$TMP_STATS"
        echo "$((o + orig_size)) $((n + orig_size))" > "$TMP_STATS"
    fi
done

read TOTAL_ORIG TOTAL_NEW < "$TMP_STATS"
rm "$TMP_STATS"

echo "------------------------------------------"
echo "Total Original Size: $((TOTAL_ORIG/1024)) KB"
echo "Total Compressed Size: $((TOTAL_NEW/1024)) KB"
echo "Total Savings: $(((TOTAL_ORIG - TOTAL_NEW)/1024)) KB"
