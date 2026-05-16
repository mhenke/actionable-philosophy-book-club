# Design: Podcasts & Resources Display

**Date:** 2026-05-16
**Branch:** fix/critical-security-and-ci

---

## Scope

Three coordinated changes:
1. Extend the `MEETINGS` data manifest to support multiple podcasts and resource images per meeting
2. Update the UI to display podcast rows (with type badges) and PNG thumbnail strips in dashboard cards and the upcoming card
3. Extend the `asset-compressor` skill with a `rename_asset.sh` script that infers file category and meeting, then renames/moves files to match the naming convention

---

## 1. Naming Convention

All meeting assets follow a consistent pattern:

| Asset type | Pattern | Example |
|---|---|---|
| Main recording | `NN-<Slug>.mp4` | `01-The-Architects-of-Complexity.mp4` |
| Deep dive podcast | `NN-<Slug>-deep-dive.(mp4\|m4a)` | `01-Clean-Code-Paradox-deep-dive.mp4` |
| Critique podcast | `NN-<Slug>-critique.(mp4\|m4a)` | `01-Ousterhout-Uncle-Bob-critique.m4a` |
| Debate podcast | `NN-<Slug>-debate.(mp4\|m4a)` | `01-Ousterhout-Uncle-Bob-debate.m4a` |
| Slides | `NN-<Slug>.pptx` | `01-Architecting-Deep-Systems.pptx` |
| Resource image | `NN-<Slug>.png` | `01-Choose-Your-Adventure.png` |

**Type suffix** (`-deep-dive`, `-critique`, `-debate`) is the machine-readable signal that distinguishes podcast recordings from main session recordings. Files without a type suffix in `recordings/` are treated as the primary session video.

---

## 2. Data Model

The `MEETINGS` array in `index.html` gains two new fields per entry:

```js
{
  id: 'meeting-01',
  session: 'Session 01',
  date: '01 May 26',
  title: 'Deep Systems',
  status: 'done',
  color: 'spectrum-3',
  wash: '--wash-3',
  readmeUrl: 'meetings/meeting-01/README.md',
  video: { file: 'meetings/meeting-01/recordings/01-The-Architects-of-Complexity.mp4', label: 'Video Recording' },
  slides: { file: 'meetings/meeting-01/slides/01-Architecting-Deep-Systems.pptx', label: 'Slide Deck' },
  podcasts: [
    { type: 'deep-dive', label: 'Clean Code Paradox',         file: 'meetings/meeting-01/recordings/01-Clean-Code-Paradox-deep-dive.mp4' },
    { type: 'critique',  label: 'Ousterhout vs Uncle Bob',    file: 'meetings/meeting-01/recordings/01-Ousterhout-Uncle-Bob-critique.m4a' },
    { type: 'debate',    label: 'Ousterhout vs Uncle Bob',    file: 'meetings/meeting-01/recordings/01-Ousterhout-Uncle-Bob-debate.m4a' }
  ],
  resources: [
    { label: 'Architecture of Simplicity', file: 'meetings/meeting-01/resources/01-Architecture-of-Simplicity.png' },
    { label: 'Choose Your Adventure',      file: 'meetings/meeting-01/resources/01-Choose-Your-Adventure.png' }
  ]
}
```

Meetings with no podcasts or resources use empty arrays: `podcasts: []`, `resources: []`.

The `video` field remains `null` for upcoming meetings without a recording yet. The `slides` field follows the same pattern.

---

## 3. UI Display

### 3a. Asset row order

Within every card (archive and upcoming), rows render in this fixed order:

1. Video recording (if non-null)
2. Slides (if non-null)
3. Podcasts (one row each, in manifest order)
4. Resource images (thumbnail strip, if non-empty)

### 3b. Podcast rows

Each podcast renders as an `.asset-row` using the existing pattern (icon pill + label + download button), with one addition — a type badge:

```
[🎙] Clean Code Paradox    [Deep Dive]    [↓]
[⚔️] Ousterhout vs Uncle Bob  [Debate]   [↓]
[🔍] Ousterhout vs Uncle Bob  [Critique] [↓]
```

**Icons by type:**
- `deep-dive` → 🎙
- `debate` → ⚔️
- `critique` → 🔍

**Badge colors (small pill, no background fill — text + border only):**
- `deep-dive` → `spectrum-3` (steel blue)
- `critique` → `spectrum-1` (navy)
- `debate` → `spectrum-2` (medium blue)

The play link opens the file directly. The download button uses the same `asset-dl` class as video/slides rows.

### 3c. Resource thumbnail strip

Below the asset rows, resource PNGs render as a horizontal strip of small thumbnails (height ~80px, width auto, `object-fit: cover`). Each image is a direct link that opens the file. A short label appears below each thumbnail in `text-muted` at 9px.

The strip only renders when `resources.length > 0`.

### 3d. Upcoming card

The static Next Session card is converted to render from the first `MEETINGS` entry with `status: 'upcoming'`, using the same `renderArchiveCards`-style logic. This removes the hardcoded HTML duplication and ensures podcast rows and resource thumbnails appear automatically as files are added.

The existing "Upcoming Materials" placeholder tiles (Slide Deck / Video Recording) are replaced by the dynamic asset rows, which show real links when files exist and are omitted when `null`.

---

## 4. `asset-compressor` Skill Update

### New script: `rename_asset.sh`

**Purpose:** Rename and move a media file into the correct meeting subdirectory using the naming convention.

**Inference rules (from file extension):**
| Extension | Inferred category | Target subdirectory |
|---|---|---|
| `.mp4`, `.m4a` | recording | `meetings/NN-*/recordings/` |
| `.pptx`, `.pdf` | slides | `meetings/NN-*/slides/` |
| `.png`, `.jpg`, `.jpeg` | resource | `meetings/NN-*/resources/` |

**Usage:**
```bash
bash scripts/rename_asset.sh <file> --meeting NN --slug <kebab-slug> [--type deep-dive|critique|debate]
```

- `--meeting` — meeting number (e.g., `01`). If omitted and only one meeting directory exists, infers it. If ambiguous, lists options and exits.
- `--slug` — required. Kebab-case title (e.g., `clean-code-paradox`).
- `--type` — required only for `.mp4`/`.m4a` that are podcasts. Omitting it treats the file as the primary session recording.
- `--dry-run` — prints the target path without moving the file.

**Output:**
```
Inferred: recording → meetings/meeting-01/recordings/
Rename:   Clean-Code-Paradox-deep-dive.m4a
          → meetings/meeting-01/recordings/01-Clean-Code-Paradox-deep-dive.m4a
Move? [y/N]
```

### m4a support in `compress_video.sh`

Add m4a handling: FFmpeg remuxes m4a to AAC at 128k, preserving audio quality. No video codec needed.

### `SKILL.md` update

Add a **Rename & Organize** section documenting the new script, inference rules, and the naming convention table.

---

## 5. Files Changed

| File | Change |
|---|---|
| `index.html` | MEETINGS manifest + `renderArchiveCards` + upcoming card rendering |
| `asset-compressor/scripts/rename_asset.sh` | New script |
| `asset-compressor/scripts/compress_video.sh` | Add m4a support |
| `asset-compressor/SKILL.md` | Add Rename & Organize section + naming convention table |
| Meeting README.md files | Update resource links from text to image syntax where needed |

---

## 6. Out of Scope

- Cross-cutting content (inbox files comparing APoSD to Clean Code) — separate spec
- Renaming `meeting-99-new` — separate spec
- Podcast player UI (embedded playback) — not required; direct file links are sufficient
