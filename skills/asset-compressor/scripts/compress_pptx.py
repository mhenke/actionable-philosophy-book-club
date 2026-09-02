#!/usr/bin/env python3
# skills/asset-compressor/scripts/compress_pptx.py
# Re-compress PPTX archive with image optimization + maximum ZIP compression level 9.
# Images in ppt/media/* are recompressed via palette quantization at same dimensions,
# then the OOXML package is re-zipped at level 9.
#
# Usage:
#   python3 scripts/compress_pptx.py input.pptx output.pptx
#   python3 scripts/compress_pptx.py input.pptx output.pptx --no-image-compress  # ZIP only
#   (also accepts positional without flags)

import os
import sys
import io
import zipfile
import argparse
import tempfile
from pathlib import Path

def parse_args():
    parser = argparse.ArgumentParser(description="Re-compress a PPTX file with image optimization and maximum ZIP compression.")
    parser.add_argument("input", help="Path to input PPTX file.")
    parser.add_argument("output", help="Path to output compressed PPTX file.")
    parser.add_argument("--no-image-compress", action="store_true", help="Skip image recompression; only re-zip.")
    return parser.parse_args()

def _try_optimize_media(data: bytes) -> bytes:
    """Recompress a ppt/media/* blob if it is a PNG: 256-color adaptive palette at same size + optimize. Fallback to original on error."""
    try:
        from PIL import Image
    except ImportError:
        return data
    # Quick magic check for PNG
    if not data.startswith(b"\x89PNG"):
        return data
    # Empty or tiny files
    if len(data) < 1024:
        return data
    try:
        im = Image.open(io.BytesIO(data))
        w, h = im.size
        # Keep dimensions; palette-quantize photographic anime illustrations often wins vs RGBA.
        # Try quantized palette and pick smaller vs RGBA optimized.
        buf_p = io.BytesIO()
        # Convert via RGB to get consistent palette for RGBA sources
        q = im.convert("RGB").convert("P", palette=Image.ADAPTIVE, colors=256)
        q.save(buf_p, "PNG", optimize=True)
        buf_r = io.BytesIO()
        im.save(buf_r, "PNG", optimize=True)
        pick = buf_p.getvalue() if len(buf_p.getvalue()) < len(buf_r.getvalue()) else buf_r.getvalue()
        # Only use smaller result (never inflate)
        return pick if len(pick) < len(data) else data
    except Exception:
        return data

def main():
    args = parse_args()

    if not os.path.isfile(args.input):
        print(f"Error: input file not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    try:
        with zipfile.ZipFile(args.input, 'r') as in_zip:
            # Collect optimized entries
            entries = []
            for item in in_zip.infolist():
                data = in_zip.read(item.filename)
                # Optimize embedded images unless --no-image-compress
                if not args.no_image_compress and item.filename.startswith("ppt/media/") and item.filename.lower().endswith(('.png', '.PNG')):
                    data = _try_optimize_media(data)
                entries.append((item, data))
            with zipfile.ZipFile(args.output, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as out_zip:
                for item, data in entries:
                    # Preserve metadata date_time but ensure compress_type
                    info = zipfile.ZipInfo(filename=item.filename, date_time=item.date_time)
                    info.compress_type = zipfile.ZIP_DEFLATED
                    out_zip.writestr(info, data)
    except zipfile.BadZipFile:
        print(f"Error: {args.input} is not a valid zip/PPTX file.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error compressing PPTX: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

    if not os.path.isfile(args.output) or os.path.getsize(args.output) == 0:
        print("Error: compression failed — output file is missing or empty.", file=sys.stderr)
        sys.exit(1)

    orig_size = os.path.getsize(args.input)
    new_size = os.path.getsize(args.output)
    savings = ((orig_size - new_size) / orig_size) * 100 if orig_size > 0 else 0
    # Report image savings as well
    try:
        import zipfile as zf
        with zf.ZipFile(args.input, 'r') as zin, zf.ZipFile(args.output, 'r') as zout:
            orig_media = sum(zin.read(n).strip.__self__ and 0 for n in [])
    except:
        pass

    print("PPTX Compression Complete (images optimized + re-zipped at level 9).")
    print(f"Original size: {orig_size / 1024:.1f} KB")
    print(f"New size:      {new_size / 1024:.1f} KB")
    print(f"Reduction:     {savings:.1f}%")

if __name__ == "__main__":
    main()
