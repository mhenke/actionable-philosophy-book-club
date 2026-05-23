#!/usr/bin/env python3
# asset-compressor/scripts/compress_pptx.py
# Re-compress PPTX archive with maximum ZIP compression level 9.
#
# Usage:
#   python3 scripts/compress_pptx.py input.pptx output.pptx

import os
import sys
import zipfile
import argparse

def parse_args():
    parser = argparse.ArgumentParser(description="Re-compress a PPTX file using maximum ZIP compression.")
    parser.add_argument("input", help="Path to input PPTX file.")
    parser.add_argument("output", help="Path to output compressed PPTX file.")
    return parser.parse_args()

def main():
    args = parse_args()
    
    if not os.path.isfile(args.input):
        print(f"Error: input file not found: {args.input}", file=sys.stderr)
        sys.exit(1)
        
    try:
        # Re-compress the OOXML package using Python's native zipfile module with max deflate compression (level 9)
        with zipfile.ZipFile(args.input, 'r') as in_zip:
            with zipfile.ZipFile(args.output, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as out_zip:
                for item in in_zip.infolist():
                    # Read original file bytes and write them to output with max compression
                    data = in_zip.read(item.filename)
                    out_zip.writestr(item, data)
    except zipfile.BadZipFile:
        print(f"Error: {args.input} is not a valid zip/PPTX file.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error compressing PPTX: {e}", file=sys.stderr)
        sys.exit(1)
        
    if not os.path.isfile(args.output) or os.path.getsize(args.output) == 0:
        print("Error: compression failed — output file is missing or empty.", file=sys.stderr)
        sys.exit(1)
        
    orig_size = os.path.getsize(args.input)
    new_size = os.path.getsize(args.output)
    
    savings = ((orig_size - new_size) / orig_size) * 100 if orig_size > 0 else 0
    
    print("PPTX Compression Complete (Re-zipped with native max compression).")
    print(f"Original size: {orig_size / 1024:.1f} KB")
    print(f"New size:      {new_size / 1024:.1f} KB")
    print(f"Reduction:     {savings:.1f}%")

if __name__ == "__main__":
    main()
