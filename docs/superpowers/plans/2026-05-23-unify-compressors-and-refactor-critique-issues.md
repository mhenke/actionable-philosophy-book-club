# Implementation Plan — Unify Compressor Utilities & Refactor Critique Issues

Address the remaining issues identified in the APoSD critique:
1.  **Dynamic Subtypes**: Remove the hardcoded `--type` list validation in `rename_asset.py` and replace it with a warning for unrecognized types to improve extensibility.
2.  **Dry-Run Side-Effect Simulation**: Print simulated directory creation and manifest updates during `--dry-run`.
3.  **Python Compressor Unification**: Rewrite `compress_pdf.sh`, `compress_video.sh`, and `compress_pptx.sh` as clean Python scripts, wrapping them with thin shell scripts for backward compatibility and CI compliance. `compress_pptx.py` will use Python's native `zipfile` module to eliminate external ZIP tool dependencies.

## Proposed Changes

### Tooling & Scripts

#### [MODIFY] [rename_asset.py](file:///home/mhenke/Projects/actionable-philosophy-book-club/asset-compressor/scripts/rename_asset.py)
*   Update argument parser to make `--type` accept any string.
*   Check `--type` against a list of known types (`deep-dive`, `critique`, `debate`). If it's not known, print a warning to stderr rather than exiting.
*   Update dry-run logic to simulate:
    *   Target directory creation.
    *   JSON manifest update detailing what key/values would be written.

#### [NEW] [compress_pdf.py](file:///home/mhenke/Projects/actionable-philosophy-book-club/asset-compressor/scripts/compress_pdf.py)
Create a Python script that runs `gs` via `subprocess`, parses sizes, and prints statistics.

#### [NEW] [compress_video.py](file:///home/mhenke/Projects/actionable-philosophy-book-club/asset-compressor/scripts/compress_video.py)
Create a Python script that runs `ffmpeg` via `subprocess`, handles MP4/M4A types, and provides descriptive logging on failure.

#### [NEW] [compress_pptx.py](file:///home/mhenke/Projects/actionable-philosophy-book-club/asset-compressor/scripts/compress_pptx.py)
Create a Python script using Python's native `zipfile` module to extract and re-compress the PPTX archive at maximum ZIP compression, avoiding external command-line dependencies.

#### [MODIFY] [compress_pdf.sh](file:///home/mhenke/Projects/actionable-philosophy-book-club/asset-compressor/scripts/compress_pdf.sh)
Replace with a delegating wrapper:
```bash
#!/bin/bash
set -euo pipefail
exec python3 "$(dirname "$0")/compress_pdf.py" "$@"
```

#### [MODIFY] [compress_video.sh](file:///home/mhenke/Projects/actionable-philosophy-book-club/asset-compressor/scripts/compress_video.sh)
Replace with a delegating wrapper:
```bash
#!/bin/bash
set -euo pipefail
exec python3 "$(dirname "$0")/compress_video.py" "$@"
```

#### [MODIFY] [compress_pptx.sh](file:///home/mhenke/Projects/actionable-philosophy-book-club/asset-compressor/scripts/compress_pptx.sh)
Replace with a delegating wrapper:
```bash
#!/bin/bash
set -euo pipefail
exec python3 "$(dirname "$0")/compress_pptx.py" "$@"
```

---

## Verification Plan

### Automated Tests
Run the project's test suite to ensure no regressions in CI setup or file routing:
```bash
npm test
```

### Manual Verification
1.  **Test Dynamic Recording Types:**
    *   Command: `bash asset-compressor/scripts/rename_asset.sh test-video.mp4 --meeting 02 --slug raw-module-debate --type summary --dry-run`
    *   Verify: Prints a warning about unrecognized type `summary` but proceeds successfully to build `meetings/meeting-02/recordings/02-raw-module-debate-summary.mp4`.
2.  **Test Dry-Run Side-Effect Simulation:**
    *   Command: `bash asset-compressor/scripts/rename_asset.sh test-video.mp4 --meeting 02 --slug raw-module-debate --type critique --dry-run`
    *   Verify: Outputs simulated directories that would be created and JSON entries that would be written.
3.  **Test PDF Compressor Wrapper:**
    *   Command: `bash asset-compressor/scripts/compress_pdf.sh input.pdf output.pdf` (using test assets).
4.  **Test Video Compressor Wrapper:**
    *   Command: `bash asset-compressor/scripts/compress_video.sh input.mp4 output.mp4` (using test assets).
5.  **Test PPTX Compressor Wrapper:**
    *   Command: `bash asset-compressor/scripts/compress_pptx.sh input.pptx output.pptx` (using test assets).
