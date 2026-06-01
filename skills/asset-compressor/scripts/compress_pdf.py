#!/usr/bin/env python3
# skills/asset-compressor/scripts/compress_pdf.py
# Compress PDF file using Ghostscript to minimize repository size.
#
# Usage:
#   python3 scripts/compress_pdf.py input.pdf output.pdf

import os
import sys
import subprocess
import argparse

def parse_args():
    parser = argparse.ArgumentParser(description="Compress a PDF document using Ghostscript.")
    parser.add_argument("input", help="Path to input PDF file.")
    parser.add_argument("output", help="Path to output PDF file.")
    return parser.parse_args()

def main():
    args = parse_args()
    
    if not os.path.isfile(args.input):
        print(f"Error: input file not found: {args.input}", file=sys.stderr)
        sys.exit(1)
        
    cmd = [
        "gs",
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        "-dPDFSETTINGS=/ebook",
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        f"-sOutputFile={args.output}",
        args.input
    ]
    
    try:
        # Redirect stdin to devnull to match original shell '< /dev/null' behavior
        result = subprocess.run(cmd, stdin=subprocess.DEVNULL, capture_output=True, text=True)
        if result.returncode != 0:
            print("Ghostscript compression failed.", file=sys.stderr)
            if result.stderr:
                print(f"Error details:\n{result.stderr}", file=sys.stderr)
            sys.exit(1)
    except FileNotFoundError:
        print("Error: 'gs' (Ghostscript) command not found. Please install Ghostscript.", file=sys.stderr)
        sys.exit(1)
        
    if not os.path.isfile(args.output) or os.path.getsize(args.output) == 0:
        print("Error: compression failed — output file is missing or empty.", file=sys.stderr)
        sys.exit(1)
        
    orig_size = os.path.getsize(args.input)
    new_size = os.path.getsize(args.output)
    
    savings = ((orig_size - new_size) / orig_size) * 100 if orig_size > 0 else 0
    
    print("PDF Compression Complete.")
    print(f"Original size: {orig_size / 1024:.1f} KB")
    print(f"New size:      {new_size / 1024:.1f} KB")
    print(f"Reduction:     {savings:.1f}%")

if __name__ == "__main__":
    main()
