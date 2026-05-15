#!/bin/bash
# rename_files.sh

# Find all files with underscores, excluding hidden dirs and the skill itself
find . -type f -name "*_*" -not -path "./.git/*" -not -path "./asset-compressor/*" -not -path "./.gemini/*" -print0 | while IFS= read -r -d '' f; do
    dir=$(dirname "$f")
    base=$(basename "$f")
    
    # Replace underscores with hyphens
    # Also collapse multiple hyphens or " - " patterns if they appear
    new_base=$(echo "$base" | sed 's/_/-/g' | sed 's/---/-/g' | sed 's/--/-/g' | sed 's/- -/-/g')
    
    if [ "$base" != "$new_base" ]; then
        echo "Renaming: $base -> $new_base"
        mv "$f" "$dir/$new_base"
    fi
done
