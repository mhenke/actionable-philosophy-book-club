---
name: asset-compressor
description: Compress PDF, MP4, and PPTX files to minimize repository size. Use when assets exceed GitHub's 50MB recommendation or to reduce overall repo bloat.
---

# Asset Compressor

This skill provides automated workflows for shrinking large media files common in engineering book clubs (slides, recordings, documents).

## Supported Formats

- **PDF**: Uses Ghostscript with `/ebook` settings.
- **MP4/Video**: Uses FFmpeg with x264/AAC and 720p scaling.
- **PPTX**: Re-compresses the OOXML package with maximum ZIP compression.

## Workflows

### 1. Identify Large Files
Check for files exceeding the 50MB limit:
`find . -type f -size +50M`

### 2. Compress a File
Invoke the appropriate script from the `scripts/` directory.

- **PDF**: `bash scripts/compress_pdf.sh <input> <output>`
- **Video**: `bash scripts/compress_video.sh <input> <output>`
- **PPTX**: `bash scripts/compress_pptx.sh <input> <output>`

### 3. Replace and Verify
Always verify the output file opens correctly before deleting the original.

## Quality Standards
- Videos are scaled to a maximum height of 720p.
- PDFs use 150dpi (/ebook) settings.
- PPTX compression currently focuses on package-level ZIP optimization.
