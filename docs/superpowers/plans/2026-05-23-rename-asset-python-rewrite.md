# Implementation Plan — Python Rewrite of rename_asset Utility

Rewrite the asset-renaming script from a sequential Bash script with inline Python blocks to a unified, cohesive Python script `rename_asset.py`. Provide a backward-compatible wrapper `rename_asset.sh` to keep CI and documentation intact.

## User Review Required

> [!NOTE]
> This change introduces `asset-compressor/scripts/rename_asset.py` as the new home of the asset-renaming logic. The existing `rename_asset.sh` is simplified to a thin wrapper that invokes Python. This maintains full backward compatibility for both CLI users and the ShellCheck linter in GitHub Actions.

## Proposed Changes

### Tooling & Scripts

#### [NEW] [rename_asset.py](file:///home/mhenke/Projects/actionable-philosophy-book-club/asset-compressor/scripts/rename_asset.py)
Create a new Python script containing the unified refactored code. The script will:
- Parse arguments (`file`, `--meeting`, `--slug`, `--type`, `--dry-run`) using `argparse`.
- Validate that `--type` is only provided for `recording` assets (MP4/M4A), raising an error otherwise.
- Detect "alternate" patterns in the source basename (`-alt`, `_alt`, `-alternate`, `_alternate`) before constructing the target filename.
- Construct the final target path in a single step (no mid-flight mutation).
- Map file extensions to subfolders using a unified dictionary containing `gif`, `svg`, and `webp` resources.
- Automatically sanitize inputs (e.g., lowercase slug, replacing spaces with hyphens) to define errors out of existence.
- Update `asset-manifest.json` safely (warn/raise on JSON corruption rather than silently wiping).

#### [MODIFY] [rename_asset.sh](file:///home/mhenke/Projects/actionable-philosophy-book-club/asset-compressor/scripts/rename_asset.sh)
Replace the existing script with a simple delegation wrapper:
```bash
#!/bin/bash
set -euo pipefail
exec python3 "$(dirname "$0")/rename_asset.py" "$@"
```
This is fully compatible with ShellCheck and all existing scripts/docs.

#### [MODIFY] [SKILL.md](file:///home/mhenke/Projects/actionable-philosophy-book-club/asset-compressor/SKILL.md)
Update documentation to mention `rename_asset.py` while keeping references to `rename_asset.sh` as the main entry point.

---

## Verification Plan

### Automated Tests
Run the project's test suite to ensure no regressions:
```bash
npm test
```

### Manual Verification
1. Test with a normal asset:
   ```bash
   touch test-video.mp4
   bash asset-compressor/scripts/rename_asset.sh test-video.mp4 --meeting 02 --slug raw-module-debate
   # Verify it renames and moves it to meetings/meeting-02/recordings/02-raw-module-debate.mp4
   ```
2. Test with an alternate asset and manifest writing:
   ```bash
   touch test-alt-audio.m4a
   bash asset-compressor/scripts/rename_asset.sh test-alt-audio.m4a --meeting 02 --slug clean-code-paradox --type deep-dive
   # Verify alternate suffix is added and manifest entry is recorded in meetings/meeting-02/asset-manifest.json
   ```
3. Test parameter validation:
   ```bash
   touch test-slide.pptx
   bash asset-compressor/scripts/rename_asset.sh test-slide.pptx --meeting 02 --slug raw-slide --type deep-dive
   # Verify it raises a validation error since --type is not allowed for slides
   ```
4. Test sanitization:
   ```bash
   touch test-resource.png
   bash asset-compressor/scripts/rename_asset.sh test-resource.png --meeting 02 --slug "Raw Design Spaced"
   # Verify it sanitizes the slug to "raw-design-spaced" and places it in meetings/meeting-02/resources/02-raw-design-spaced.png
   ```
