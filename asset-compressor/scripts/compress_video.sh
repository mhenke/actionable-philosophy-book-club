#!/bin/bash
# scripts/compress_video.sh
# Usage: ./compress_video.sh input.(mp4|m4a) output.(mp4|m4a)

INPUT="$1"
OUTPUT="$2"

if [ -z "$INPUT" ] || [ -z "$OUTPUT" ]; then
  echo "Usage: $0 input.(mp4|m4a) output.(mp4|m4a)" >&2
  exit 1
fi

EXT="${INPUT##*.}"
EXT_LOWER="${EXT,,}"

if [ "$EXT_LOWER" = "m4a" ]; then
  # Audio-only: remux to AAC at 128k, no video codec needed
  ffmpeg -i "$INPUT" -acodec aac -b:a 128k -vn -y "$OUTPUT" < /dev/null 2>/dev/null
else
  # Video: x264 with 720p cap and AAC audio
  ffmpeg -i "$INPUT" -vcodec libx264 -crf 28 -preset medium \
         -vf "scale='min(1280,iw)':-2" -acodec aac -b:a 128k \
         -movflags +faststart -y "$OUTPUT" < /dev/null 2>/dev/null

  if [ ! -s "$OUTPUT" ]; then
    ffmpeg -i "$INPUT" -vcodec libx264 -crf 28 -preset medium \
           -vf "scale='min(1280,iw)':-2" -acodec aac -b:a 128k \
           -movflags +faststart -f "$EXT_LOWER" -y "$OUTPUT" < /dev/null 2>/dev/null
  fi
fi

if [ ! -s "$OUTPUT" ]; then
  echo "Error: compression failed — output file is empty." >&2
  exit 1
fi

ORIG_SIZE=$(stat -c%s "$INPUT")
NEW_SIZE=$(stat -c%s "$OUTPUT")
echo "Compression complete."
echo "Original: $((ORIG_SIZE/1024)) KB"
echo "Output:   $((NEW_SIZE/1024)) KB"
