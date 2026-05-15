#!/bin/bash
# batch_compress_v2.sh

SKILL_DIR="asset-compressor/scripts"
TOTAL_ORIG=0
TOTAL_NEW=0

# Use a temp file for output to avoid subshell issues
find . -type f \( -name "*.pdf" -o -name "*.mp4" -o -name "*.pptx" \) -not -path "./asset-compressor/*" > candidates.txt

while IFS= read -r f; do
    [ -z "$f" ] && continue
    echo "Processing: $f"
    orig_size=$(stat -c%s "$f")
    
    ext="${f##*.}"
    script=""
    case "$ext" in
        pdf)  script="$SKILL_DIR/compress_pdf.sh" ;;
        mp4)  script="$SKILL_DIR/compress_video.sh" ;;
        pptx) script="$SKILL_DIR/compress_pptx.sh" ;;
    esac

    temp_file="${f}.tmp.${ext}"
    bash "$script" "$f" "$temp_file" < /dev/null
    
    if [ -f "$temp_file" ]; then
        new_size=$(stat -c%s "$temp_file")
        if [ "$new_size" -lt "$orig_size" ]; then
            mv "$temp_file" "$f"
            echo "  Reduced: $((orig_size/1024))KB -> $((new_size/1024))KB"
            TOTAL_ORIG=$((TOTAL_ORIG + orig_size))
            TOTAL_NEW=$((TOTAL_NEW + new_size))
        else
            echo "  No improvement."
            rm "$temp_file"
            TOTAL_ORIG=$((TOTAL_ORIG + orig_size))
            TOTAL_NEW=$((TOTAL_NEW + orig_size))
        fi
    else
        echo "  Failed to create compressed file."
        TOTAL_ORIG=$((TOTAL_ORIG + orig_size))
        TOTAL_NEW=$((TOTAL_NEW + orig_size))
    fi
done < candidates.txt

rm candidates.txt

echo "------------------------------------------"
echo "Total Original Size: $((TOTAL_ORIG/1024)) KB"
echo "Total Compressed Size: $((TOTAL_NEW/1024)) KB"
echo "Total Savings: $(((TOTAL_ORIG - TOTAL_NEW)/1024)) KB"
