#!/bin/bash
# scripts/rename_asset.sh
# Rename and organize a meeting asset to match the project naming convention.
#
# Usage:
#   bash scripts/rename_asset.sh <file> --meeting NN --slug <kebab-slug> [--type deep-dive|critique|debate] [--dry-run]
#
# Extension → category → subdirectory:
#   .mp4 .m4a  →  recording  →  meetings/NN-*/recordings/
#   .pptx .pdf →  slides     →  meetings/NN-*/slides/
#   .png .jpg .jpeg → resource → meetings/NN-*/resources/

set -euo pipefail

INPUT=""
MEETING=""
SLUG=""
TYPE=""
DRY_RUN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --meeting) MEETING="$2"; shift 2 ;;
        --slug)    SLUG="$2";    shift 2 ;;
        --type)    TYPE="$2";    shift 2 ;;
        --dry-run) DRY_RUN=true; shift ;;
        -*) echo "Unknown option: $1" >&2; exit 1 ;;
        *)  INPUT="$1"; shift ;;
    esac
done

if [ -z "$INPUT" ]; then
    echo "Usage: $0 <file> --meeting NN --slug <kebab-slug> [--type deep-dive|critique|debate] [--dry-run]" >&2
    exit 1
fi

if [ ! -f "$INPUT" ]; then
    echo "Error: file not found: $INPUT" >&2
    exit 1
fi

if [ -z "$SLUG" ]; then
    echo "Error: --slug is required (e.g. --slug clean-code-paradox)" >&2
    exit 1
fi

# Infer category from extension
EXT="${INPUT##*.}"
EXT_LOWER="${EXT,,}"
case "$EXT_LOWER" in
    mp4|m4a)        CATEGORY="recording";  SUBDIR="recordings" ;;
    pptx|pdf)       CATEGORY="slides";     SUBDIR="slides"     ;;
    png|jpg|jpeg)   CATEGORY="resource";   SUBDIR="resources"  ;;
    *)
        echo "Error: unsupported extension .$EXT_LOWER" >&2
        echo "Supported: .mp4 .m4a .pptx .pdf .png .jpg .jpeg" >&2
        exit 1
        ;;
esac

echo "Inferred: $CATEGORY → $SUBDIR/"

# Resolve meeting directory
if [ -z "$MEETING" ]; then
    # Try to infer: list meeting dirs, pick the only one if unambiguous
    MEETING_DIRS=($(find meetings -maxdepth 1 -type d -name 'meeting-[0-9]*' 2>/dev/null | grep -v 'meeting-99' | sort))
    if [ "${#MEETING_DIRS[@]}" -eq 1 ]; then
        MEETING=$(basename "${MEETING_DIRS[0]}" | sed 's/meeting-//')
        echo "Inferred meeting: $MEETING (only meeting directory found)"
    else
        echo "Error: multiple meeting directories found; specify --meeting NN" >&2
        echo "Available:" >&2
        for d in "${MEETING_DIRS[@]}"; do basename "$d"; done >&2
        exit 1
    fi
fi

# Pad meeting number to 2 digits
MEETING_PAD=$(printf '%02d' "$MEETING")

# Find meeting directory
MEETING_DIR=$(find meetings -maxdepth 1 -type d -name "meeting-${MEETING_PAD}*" 2>/dev/null | head -1)
if [ -z "$MEETING_DIR" ]; then
    echo "Error: no directory found matching meeting-${MEETING_PAD}*" >&2
    exit 1
fi

# Build target filename
if [ "$CATEGORY" = "recording" ] && [ -n "$TYPE" ]; then
    # Validate type
    case "$TYPE" in
        deep-dive|critique|debate) ;;
        *) echo "Error: --type must be deep-dive, critique, or debate (got: $TYPE)" >&2; exit 1 ;;
    esac
    FILENAME="${MEETING_PAD}-${SLUG}-${TYPE}.${EXT_LOWER}"
else
    FILENAME="${MEETING_PAD}-${SLUG}.${EXT_LOWER}"
fi

TARGET_DIR="${MEETING_DIR}/${SUBDIR}"
TARGET="${TARGET_DIR}/${FILENAME}"

echo "Rename:  $(basename "$INPUT")"
echo "      →  ${TARGET}"

if [ "$DRY_RUN" = true ]; then
    echo "(dry run — no files moved)"
    exit 0
fi

read -r -p "Move? [y/N] " CONFIRM
if [[ "${CONFIRM,,}" != "y" ]]; then
    echo "Aborted."
    exit 0
fi

mkdir -p "$TARGET_DIR"
mv "$INPUT" "$TARGET"
echo "Done."
