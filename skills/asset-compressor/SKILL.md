---
name: asset-compressor
description: Compress PDF, MP4, PPTX, and image files to minimize repository size. Every asset is compressed unconditionally — no size gate, no confirmation.
metadata:
  internal: true
---

# Asset Compressor

This skill provides automated workflows for shrinking large media files common in engineering book clubs (slides, recordings, documents).

## Supported Formats

- **PDF**: Uses Ghostscript with `/ebook` settings.
- **MP4/Video**: Uses FFmpeg with x264/AAC and 720p scaling.
- **PPTX**: Re-compresses the OOXML package with maximum ZIP compression.
- **PNG/Image**: Full-resolution WebP (quality 70) + 50%-scale PNG fallback. Uses ImageMagick `convert` for PNG and FFmpeg for WebP.


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

### 3. Archive Source
After compression succeeds and the output is in place, move the original source file from `~/Downloads/aposd/` to `~/Downloads/aposd/completed/`:

```bash
mv ~/Downloads/aposd/<original-source-file> ~/Downloads/aposd/completed/
```

### 4. Replace and Verify
Always verify the output file opens correctly before deleting the original.

### 5. Compress an Image
Images use a dual-format strategy: full-resolution WebP for sharp display + scaled PNG as fallback.

**Step A — Generate full-resolution WebP (primary):**
```bash
ffmpeg -i <input>.png -quality 70 -y <output>.webp
```

Verify the webp is under 512KB. If over, reduce quality to 60 and retry.

**Step B — Generate scaled PNG (fallback):**
```bash
convert <input>.png -resize 50% -quality 80 -strip <output>.png
```

The 50% scale keeps the PNG fallback reasonable in size while the full-res webp handles sharp display. Both files go into the same `resources/` directory.

**Step C — Verify both files:**
```bash
du -k <output>.webp <output>.png
identify <output>.png | awk '{print $3}'
```

The webp must be under 512KB (CI gate). The PNG fallback can exceed 512KB — only webp and png files under 512KB pass the CI image gate, but the gate checks both formats independently.

## Quality Standards
- Images: Full-resolution WebP at quality 70 (primary), 50%-scale PNG at quality 80 (fallback). WebP must be under 512KB.
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

## Asset Descriptions

After renaming and compressing an asset, add it to the meeting README's Meeting Materials section with a content-specific description. Use the emoji format with duration and file size:

```
  - 🎬 [NN-slug.mp4](recordings/NN-slug.mp4) Mm Ss · XXMB — Specific description
  - 📊 [NN-slug.pptx](slides/NN-slug.pptx) — Specific description
  - 🔬 [NN-slug-deep-dive.m4a](recordings/NN-slug-deep-dive.m4a) Mm Ss · XXMB — Specific description
  - ⚔️ [NN-slug-debate.m4a](recordings/NN-slug-debate.m4a) Mm Ss · XXMB — Specific description
  - 🔍 [NN-slug-critique.m4a](recordings/NN-slug-critique.m4a) Mm Ss · XXMB — Specific description
```

Emoji categories: 🎬 video, 📊 slides, 🔬 deep dive, ⚔️ debate, 🔍 critique.

Descriptions must be content-specific — capture the unique angle or argument of each recording. Never use generic descriptions like "An exploration of the session topic" or "A structured debate between two design perspectives." Instead, reference the specific concepts, authors, or arguments the recording covers (e.g., "Examines how over-fragmentation into shallow methods increases system-wide cognitive load despite making individual functions look cleaner").

Pull duration with:
```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 <file> | awk '{printf "%.0f", int($1)}'
```
Convert seconds to `Mm Ss` format (e.g., 374 → `6m 14s`).

Pull size with:
```bash
stat --format=%s <file> | awk '{printf "%.0f", $1/1024/1024}'
```

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
