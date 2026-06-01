#!/usr/bin/env python3
# skills/asset-compressor/scripts/compress_video.py
# Compress video (MP4) or audio (M4A) using FFmpeg.
#
# Usage:
#   python3 scripts/compress_video.py input.mp4 output.mp4

import os
import sys
import subprocess
import argparse

def parse_args():
    parser = argparse.ArgumentParser(description="Compress video (MP4) or audio (M4A) using FFmpeg.")
    parser.add_argument("input", help="Path to input media file.")
    parser.add_argument("output", help="Path to output compressed media file.")
    return parser.parse_args()

def run_ffmpeg(cmd):
    """Run ffmpeg command and output error logs on failure."""
    try:
        result = subprocess.run(cmd, stdin=subprocess.DEVNULL, capture_output=True, text=True)
        if result.returncode != 0:
            print("ffmpeg failed. Process logs:", file=sys.stderr)
            # Print last 20 lines of stderr
            lines = result.stderr.splitlines()
            for line in lines[-20:]:
                print(line, file=sys.stderr)
            return False
        return True
    except FileNotFoundError:
        print("Error: 'ffmpeg' command not found. Please install FFmpeg.", file=sys.stderr)
        sys.exit(1)

def main():
    args = parse_args()
    
    if not os.path.isfile(args.input):
        print(f"Error: input file not found: {args.input}", file=sys.stderr)
        sys.exit(1)
        
    ext = os.path.splitext(args.input)[1].lstrip('.').lower()
    if ext not in ['mp4', 'm4a']:
        print(f"Error: unsupported extension .{ext}. Must be .mp4 or .m4a", file=sys.stderr)
        sys.exit(1)
        
    success = False
    
    if ext == 'm4a':
        # Audio-only: remux to AAC at 128k, no video stream (-vn)
        cmd = [
            "ffmpeg", "-i", args.input, 
            "-acodec", "aac", "-b:a", "128k", 
            "-vn", "-y", args.output
        ]
        success = run_ffmpeg(cmd)
    else:
        # Video: x264 with 720p maximum height cap, AAC audio, and +faststart flag
        cmd = [
            "ffmpeg", "-i", args.input,
            "-vcodec", "libx264", "-crf", "28", "-preset", "medium",
            "-vf", "scale='min(1280,iw)':-2",
            "-acodec", "aac", "-b:a", "128k",
            "-movflags", "+faststart", "-y", args.output
        ]
        success = run_ffmpeg(cmd)
        
        # Fallback if standard command failed or output file is empty
        if not success or not os.path.isfile(args.output) or os.path.getsize(args.output) == 0:
            print("Primary compression pass failed/empty. Attempting fallback format pass...")
            fallback_cmd = cmd.copy()
            # Insert format parameter before the output path
            fallback_cmd.insert(-1, "-f")
            fallback_cmd.insert(-1, ext)
            success = run_ffmpeg(fallback_cmd)
            
    if not success or not os.path.isfile(args.output) or os.path.getsize(args.output) == 0:
        print("Error: compression failed — output file is missing or empty.", file=sys.stderr)
        sys.exit(1)
        
    orig_size = os.path.getsize(args.input)
    new_size = os.path.getsize(args.output)
    
    savings = ((orig_size - new_size) / orig_size) * 100 if orig_size > 0 else 0
    
    print("Compression complete.")
    print(f"Original: {orig_size / 1024:.1f} KB")
    print(f"Output:   {new_size / 1024:.1f} KB")
    print(f"Savings:  {savings:.1f}%")

if __name__ == "__main__":
    main()
