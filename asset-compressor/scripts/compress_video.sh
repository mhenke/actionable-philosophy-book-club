#!/bin/bash
# scripts/compress_video.sh
# Usage: ./compress_video.sh input.mp4 output.mp4

INPUT="$1"
OUTPUT="$2"

if [ -z "$INPUT" ] || [ -z "$OUTPUT" ]; then
  echo "Usage: $0 input.mp4 output.mp4"
  exit 1
fi

# FFmpeg settings for high compression
# We force the output format to match the input extension if not provided,
# but ffmpeg usually needs a proper extension in the filename for the muxer.
ffmpeg -i "$INPUT" -vcodec libx264 -crf 28 -preset medium \
       -vf "scale='min(1280,iw)':-2" -acodec aac -b:a 128k \
       -movflags +faststart -y "$OUTPUT" < /dev/null 2>/dev/null

# If ffmpeg failed (e.g. due to bad extension), try forcing the format based on input extension
if [ ! -s "$OUTPUT" ]; then
    EXT="${INPUT##*.}"
    ffmpeg -i "$INPUT" -vcodec libx264 -crf 28 -preset medium \
           -vf "scale='min(1280,iw)':-2" -acodec aac -b:a 128k \
           -movflags +faststart -f "$EXT" -y "$OUTPUT" < /dev/null 2>/dev/null
fi

ORIG_SIZE=$(stat -c%s "$INPUT")
NEW_SIZE=$(stat -c%s "$OUTPUT")
echo "Video Compression Complete."
echo "Original size: $((ORIG_SIZE/1024)) KB"
echo "New size: $((NEW_SIZE/1024)) KB"
