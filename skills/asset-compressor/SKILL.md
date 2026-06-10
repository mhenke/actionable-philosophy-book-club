---
name: asset-compressor
description: Compress PDF, MP4, and PPTX files to minimize repository size. Every asset is compressed unconditionally — no size gate, no confirmation.
metadata:
  internal: true
---

# Asset Compressor

This skill provides automated workflows for shrinking large media files common in engineering book clubs (slides, recordings, documents).

## Supported Formats

- **PDF**: Uses Ghostscript with `/ebook` settings.
- **MP4/Video**: Uses FFmpeg with x264/AAC and 720p scaling.
- **PPTX**: Re-compresses the OOXML package with maximum ZIP compression.


## Staging Folder

Incoming meeting assets are staged in `~/Downloads/aposd/` before processing. Check this folder first when looking for new assets to add to a meeting. The `completed/` subfolder holds assets that have already been processed.

## Workflows

### 1. Compress a File
All meeting assets must be compressed regardless of original file size — no size gate, no confirmation. Invoke the appropriate script:

- **PDF**: `bash scripts/compress_pdf.sh <input> <output>`
- **Video**: `bash scripts/compress_video.sh <input> <output>`
- **PPTX**: `bash scripts/compress_pptx.sh <input> <output>`

### 2. Capture Metadata
After compression, extract exact duration and file size from the output using `ffprobe`. Always floor the duration (never round up — the label must never overstate playback time).

```bash
# Get precise duration in seconds (floored)
ffprobe -v error -show_entries format=duration -of csv=p=0 output.mp4 \
  | awk '{printf "%.0f\n", int($1)}'

# Get file size in KB
stat --format=%s output.mp4 | awk '{printf "%.1f\n", $1/1024}'
```

Write the floored duration and file size to `docs/manifest.json` under the meeting's asset entry. Duration in seconds (integer), fileSize in MB (integer).

### 3. Replace and Verify
Always verify the output file opens correctly before deleting the original.

## Quality Standards
- Videos are scaled to a maximum height of 720p.
- PDFs use 150dpi (/ebook) settings.
- PPTX compression currently focuses on package-level ZIP optimization.

## Naming Convention

All meeting assets follow this pattern:

| Asset type | Pattern | Example |
|---|---|---|
| Main recording | `NN-<Slug>.mp4` | `01-The-Architects-of-Complexity.mp4` |
| Deep dive podcast | `NN-<Slug>-deep-dive.(mp4\|m4a)` | `01-Clean-Code-Paradox-deep-dive.mp4` |
| Critique podcast | `NN-<Slug>-critique.(mp4\|m4a)` | `01-Ousterhout-Uncle-Bob-critique.m4a` |
| Debate podcast | `NN-<Slug>-debate.(mp4\|m4a)` | `01-Ousterhout-Uncle-Bob-debate.m4a` |
| Slides | `NN-<Slug>.pptx` | `01-Architecting-Deep-Systems.pptx` |
| Resource image | `NN-<Slug>.png` | `01-Choose-Your-Adventure.png` |

`NN` is the zero-padded meeting number (`00`, `01`, `02`…).

## Rename & Organize

Use `rename_asset.sh` to rename a file to convention and move it into the correct meeting subdirectory.

**Category is inferred from extension:**

| Extension | Category | Subdirectory |
|---|---|---|
| `.mp4`, `.m4a` | recording | `meetings/NN-*/recordings/` |
| `.pptx`, `.pdf` | slides | `meetings/NN-*/slides/` |
| `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp` | resource | `meetings/NN-*/resources/` |


**Usage:**

```bash
bash scripts/rename_asset.sh <file> --meeting NN --slug <kebab-slug> [--type deep-dive|critique|debate] [--dry-run]
```

- `--meeting` — meeting number (e.g. `01`). Auto-inferred if only one meeting directory exists.
- `--slug` — required. Kebab-case title (e.g. `clean-code-paradox`).
- `--type` — required for podcast recordings (`.mp4`/`.m4a`). Omit for primary session recordings.
- `--dry-run` — preview the rename without moving anything.

**Alternate asset detection:**

If the source filename contains `-alt`, `_alt`, `-alternate`, or `_alternate`, the script treats the file as an "alternate" version. It will:

- Emit a target filename with an additional `-alternate` suffix (e.g. `01-slug-alternate.mp4`).
- Record provenance in `meetings/meeting-NN/asset-manifest.json` with `variant: 'alternate'` and `source_filename` set to the original filename.

**Example — rename a new podcast:**

```bash
bash scripts/rename_asset.sh ~/Downloads/debate-recording.m4a \
    --meeting 01 --slug ousterhout-uncle-bob --type debate --dry-run
```
