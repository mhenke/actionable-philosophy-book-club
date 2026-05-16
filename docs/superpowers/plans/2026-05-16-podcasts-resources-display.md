# Podcasts & Resources Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add podcast type-badged asset rows and PNG resource thumbnail strips to all meeting cards, and extend the asset-compressor skill with a file rename+organize script.

**Architecture:** The MEETINGS manifest in `index.html` gains `podcasts[]` and `resources[]` arrays. `renderArchiveCards()` and a new `renderUpcomingMaterials()` function consume those arrays to render the new rows. The asset-compressor skill gets a `rename_asset.sh` script that infers destination from file extension and renames to convention.

**Tech Stack:** Vanilla JS, HTML/CSS (no build step), Bash (asset scripts), Playwright (tests)

---

## File Map

| File | Action | What changes |
|---|---|---|
| `index.html` | Modify | MEETINGS manifest + CSS + `renderArchiveCards()` + `renderUpcomingMaterials()` + upcoming card HTML |
| `tests/manifest-rendering.spec.js` | Create | Playwright tests for podcast rows, resource strip, upcoming materials |
| `asset-compressor/scripts/rename_asset.sh` | Create | Rename+organize script |
| `asset-compressor/scripts/compress_video.sh` | Modify | Add m4a audio-only compression path |
| `asset-compressor/SKILL.md` | Modify | Rename & Organize section + naming convention table |

---

## Task 1: Rename the existing meeting-01 podcast file

The file `01-The-Clean-Code-Paradox-Architecting-Deep-Systems.mp4` does not follow the naming convention. It is a deep-dive podcast, not the primary session recording.

**Files:**
- Rename: `meetings/meeting-01/recordings/01-The-Clean-Code-Paradox-Architecting-Deep-Systems.mp4` → `01-Clean-Code-Paradox-deep-dive.mp4`

- [ ] **Step 1: Rename the file with git mv**

```bash
git mv "meetings/meeting-01/recordings/01-The-Clean-Code-Paradox-Architecting-Deep-Systems.mp4" \
       "meetings/meeting-01/recordings/01-Clean-Code-Paradox-deep-dive.mp4"
```

- [ ] **Step 2: Verify the rename**

```bash
ls meetings/meeting-01/recordings/
```

Expected output:
```
01-Clean-Code-Paradox-deep-dive.mp4
01-The-Architects-of-Complexity.mp4
```

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: rename meeting-01 podcast file to follow naming convention"
```

---

## Task 2: Update the MEETINGS manifest

Replace the `MEETINGS` array in `index.html` with entries that include `podcasts[]`, `resources[]`, and null-safe `video`/`slides` fields. The upcoming meeting-02 gets `video: null` and `slides: null` since files don't exist yet.

**Files:**
- Modify: `index.html` (the `const MEETINGS = [...]` block, currently lines 367–404)

- [ ] **Step 1: Replace the MEETINGS array**

Find and replace the entire `const MEETINGS = [...]` block with:

```js
        // Meeting data manifest
        const MEETINGS = [
            {
                id: 'meeting-02',
                session: 'Session 02',
                date: '15 May 26',
                title: 'Complexity Engineering',
                status: 'upcoming',
                color: 'spectrum-2',
                wash: '--wash-2',
                readmeUrl: 'meetings/meeting-02/README.md',
                video: null,
                slides: null,
                podcasts: [],
                resources: [
                    { label: 'Four Strategies', file: 'meetings/meeting-02/resources/02-Four-Strategies.png' }
                ]
            },
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
                    { type: 'deep-dive', label: 'Clean Code Paradox', file: 'meetings/meeting-01/recordings/01-Clean-Code-Paradox-deep-dive.mp4' }
                ],
                resources: [
                    { label: 'Architecture of Simplicity', file: 'meetings/meeting-01/resources/01-Architecture-of-Simplicity.png' },
                    { label: 'Choose Your Adventure',      file: 'meetings/meeting-01/resources/01-Choose-Your-Adventure.png' }
                ]
            },
            {
                id: 'meeting-00',
                session: 'Session 00',
                date: '29 Apr 26',
                title: 'The Kickoff',
                status: 'done',
                color: 'spectrum-1',
                wash: '--wash-1',
                readmeUrl: 'meetings/meeting-00/README.md',
                video: { file: 'meetings/meeting-00/recordings/00-The-Complexity-Governor.mp4', label: 'Video Recording' },
                slides: { file: 'meetings/meeting-00/slides/00-Strategic-Design-for-the-AI-Era.pptx', label: 'Slide Deck' },
                podcasts: [],
                resources: []
            }
        ];
```

- [ ] **Step 2: Verify the page still loads without JS errors**

```bash
npm test -- --grep "dashboard is visible"
```

Expected: 1 test passes, no console errors.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: extend MEETINGS manifest with podcasts and resources arrays"
```

---

## Task 3: Add CSS for podcast badges and resource thumbnails

Add two new CSS rules to the `<style>` block in `index.html`. Insert them after the `.meeting-notes-link` rule (after the line `.meeting-notes-link:active { opacity: 0.5; }`).

**Files:**
- Modify: `index.html` (`<style>` block)

- [ ] **Step 1: Add the CSS after `.meeting-notes-link:active { opacity: 0.5; }`**

```css
        /* Podcast type badge — text + border only, no fill */
        .podcast-badge {
            font-size: 0.5625rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            padding: 2px 5px;
            border: 1px solid currentColor;
            border-radius: 2px;
            white-space: nowrap;
            flex-shrink: 0;
            margin-left: auto;
        }

        /* Resource PNG thumbnail strip */
        .resource-strip {
            display: flex;
            gap: 0.75rem;
            padding-top: 0.75rem;
            flex-wrap: wrap;
        }
        .resource-thumb {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.3rem;
            text-decoration: none;
        }
        .resource-thumb img {
            height: 80px;
            width: auto;
            object-fit: cover;
            border: 1px solid var(--border-low);
        }
        .resource-thumb span {
            font-size: 0.5625rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--text-muted);
            text-align: center;
            max-width: 80px;
        }
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add CSS for podcast badge and resource thumbnail strip"
```

---

## Task 4: Update renderArchiveCards() with podcast rows and resource strip

Replace the `renderArchiveCards()` function body in `index.html`. The new version: conditionally renders video/slides (null-safe), adds podcast rows with type badges, and adds a resource thumbnail strip.

**Files:**
- Modify: `index.html` (the `renderArchiveCards` function, currently lines 442–503)

- [ ] **Step 1: Replace the renderArchiveCards function**

Find and replace the entire `function renderArchiveCards() { ... }` block with:

```js
        function renderArchiveCards() {
            const archiveContainer = document.getElementById('archive-cards-container');
            if (!archiveContainer) return;

            archiveContainer.innerHTML = '';

            const colorMap = {
                'spectrum-1': '#1A3A5C',
                'spectrum-2': '#2B6CB0',
                'spectrum-3': '#4BA3C7',
            };

            const podcastConfig = {
                'deep-dive': { icon: '🎙', color: 'var(--spectrum-3)', label: 'Deep Dive' },
                'critique':  { icon: '🔍', color: 'var(--spectrum-1)', label: 'Critique' },
                'debate':    { icon: '⚔️', color: 'var(--spectrum-2)', label: 'Debate' },
            };

            const dlIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>`;

            MEETINGS.filter(m => m.status === 'done').forEach(meeting => {
                const colorValue = colorMap[meeting.color];
                const metadataColor = (meeting.color === 'spectrum-1' || meeting.color === 'spectrum-2')
                    ? colorValue
                    : colorMap['spectrum-2'];

                const videoRow = meeting.video ? `
                    <div class="asset-row">
                        <a href="${meeting.video.file}" class="asset-link">
                            <span class="icon-pill bg-[rgba(75,163,199,0.12)]" aria-hidden="true">🎬</span>
                            ${meeting.video.label}
                        </a>
                        <a href="${meeting.video.file}" download aria-label="Download video" class="asset-dl">${dlIcon}</a>
                    </div>` : '';

                const slidesRow = meeting.slides ? `
                    <div class="asset-row">
                        <a href="https://view.officeapps.live.com/op/view.aspx?src=https://raw.githubusercontent.com/mhenke/actionable-philosophy-book-club/master/${meeting.slides.file}" target="_blank" rel="noopener" class="asset-link">
                            <span class="icon-pill bg-[rgba(43,108,176,0.12)]" aria-hidden="true">📊</span>
                            ${meeting.slides.label}
                        </a>
                        <a href="${meeting.slides.file}" download aria-label="Download slides" class="asset-dl">${dlIcon}</a>
                    </div>` : '';

                const podcastRows = (meeting.podcasts || []).map(pod => {
                    const cfg = podcastConfig[pod.type] || { icon: '🎙', color: 'var(--spectrum-2)', label: pod.type };
                    return `
                    <div class="asset-row">
                        <a href="${pod.file}" class="asset-link">
                            <span class="icon-pill bg-[rgba(75,163,199,0.12)]" aria-hidden="true">${cfg.icon}</span>
                            ${pod.label}
                            <span class="podcast-badge" style="color:${cfg.color}">${cfg.label}</span>
                        </a>
                        <a href="${pod.file}" download aria-label="Download ${pod.label}" class="asset-dl">${dlIcon}</a>
                    </div>`;
                }).join('');

                const resourceStrip = (meeting.resources || []).length > 0 ? `
                    <div class="resource-strip">
                        ${(meeting.resources || []).map(res => `
                        <a href="${res.file}" target="_blank" rel="noopener" class="resource-thumb">
                            <img src="${res.file}" alt="${res.label}" loading="lazy">
                            <span>${res.label}</span>
                        </a>`).join('')}
                    </div>` : '';

                const card = document.createElement('div');
                card.className = 'card p-6 border-t-2';
                card.style.borderTopColor = colorValue;
                card.style.background = `var(${meeting.wash})`;

                card.innerHTML = `
                    <div class="flex justify-between items-start mb-5 gap-3">
                        <div>
                            <span class="text-[9px] font-semibold uppercase tracking-[0.25em] block mb-1" style="color:${metadataColor}">${meeting.session} &bull; ${meeting.date}</span>
                            <h4 class="text-xl font-bold tracking-tight">${meeting.title}</h4>
                        </div>
                        <span class="shrink-0 text-[10px] font-bold uppercase tracking-widest text-white px-2 py-1" style="background-color:var(--banner)">Done</span>
                    </div>
                    ${videoRow}
                    ${slidesRow}
                    ${podcastRows}
                    ${resourceStrip}
                    <a href="#p=${meeting.readmeUrl}" class="meeting-notes-link text-[9px] font-semibold uppercase tracking-[0.25em] hover:text-spectrum-1 mt-2 flex items-center min-h-[44px]" style="color:${colorValue}" data-prefetch-path="${meeting.readmeUrl}">Meeting Notes &rarr;</a>
                `;

                archiveContainer.appendChild(card);
            });
        }
```

- [ ] **Step 2: Verify archive cards render with no JS errors**

```bash
npm test -- --grep "dashboard is visible"
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add podcast rows and resource thumbnails to archive cards"
```

---

## Task 5: Replace upcoming card static materials with dynamic rendering

The static "Upcoming Materials" placeholder grid in the upcoming card is replaced by a `<div id="upcoming-materials-container">` and a `renderUpcomingMaterials()` function. The card header, Key Takeaway, and CTA button remain static since they contain bespoke content (title, quote). Only the materials section is dynamic.

**Files:**
- Modify: `index.html` (the static upcoming card HTML, currently lines ~259–277, and the script block)

- [ ] **Step 1: Replace the static materials grid in the upcoming card HTML**

Find this block (inside the Next Session `<section>`):

```html
                    <div>
                        <p class="text-[9px] font-semibold uppercase tracking-[0.25em] text-muted mb-3">Upcoming Materials</p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="flex items-center gap-3 p-4 bg-[rgba(43,108,176,0.04)] border border-[rgba(43,108,176,0.12)]">
                                <span class="icon-pill bg-[rgba(43,108,176,0.1)]" aria-hidden="true">📊</span>
                                <div>
                                    <p class="text-sm font-semibold text-muted">Slide Deck</p>
                                    <p class="text-[9px] uppercase tracking-wider text-muted font-medium mt-0.5">Ready before meeting</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3 p-4 bg-[rgba(75,163,199,0.04)] border border-[rgba(75,163,199,0.12)]">
                                <span class="icon-pill bg-[rgba(75,163,199,0.1)]" aria-hidden="true">🎬</span>
                                <div>
                                    <p class="text-sm font-semibold text-muted">Video Recording</p>
                                    <p class="text-[9px] uppercase tracking-wider text-muted font-medium mt-0.5">Ready after meeting</p>
                                </div>
                            </div>
                        </div>
                    </div>
```

Replace with:

```html
                    <div id="upcoming-materials-container"></div>
```

- [ ] **Step 2: Add renderUpcomingMaterials() to the script block**

Add this function immediately before the `renderArchiveCards()` function definition:

```js
        function renderUpcomingMaterials() {
            const container = document.getElementById('upcoming-materials-container');
            if (!container) return;

            const meeting = MEETINGS.find(m => m.status === 'upcoming');
            if (!meeting) return;

            const podcastConfig = {
                'deep-dive': { icon: '🎙', color: 'var(--spectrum-3)', label: 'Deep Dive' },
                'critique':  { icon: '🔍', color: 'var(--spectrum-1)', label: 'Critique' },
                'debate':    { icon: '⚔️', color: 'var(--spectrum-2)', label: 'Debate' },
            };

            const dlIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>`;

            const rows = [];

            if (meeting.video) {
                rows.push(`
                    <div class="asset-row">
                        <a href="${meeting.video.file}" class="asset-link">
                            <span class="icon-pill bg-[rgba(75,163,199,0.12)]" aria-hidden="true">🎬</span>
                            ${meeting.video.label}
                        </a>
                        <a href="${meeting.video.file}" download aria-label="Download video" class="asset-dl">${dlIcon}</a>
                    </div>`);
            }

            if (meeting.slides) {
                rows.push(`
                    <div class="asset-row">
                        <a href="https://view.officeapps.live.com/op/view.aspx?src=https://raw.githubusercontent.com/mhenke/actionable-philosophy-book-club/master/${meeting.slides.file}" target="_blank" rel="noopener" class="asset-link">
                            <span class="icon-pill bg-[rgba(43,108,176,0.12)]" aria-hidden="true">📊</span>
                            ${meeting.slides.label}
                        </a>
                        <a href="${meeting.slides.file}" download aria-label="Download slides" class="asset-dl">${dlIcon}</a>
                    </div>`);
            }

            (meeting.podcasts || []).forEach(pod => {
                const cfg = podcastConfig[pod.type] || { icon: '🎙', color: 'var(--spectrum-2)', label: pod.type };
                rows.push(`
                    <div class="asset-row">
                        <a href="${pod.file}" class="asset-link">
                            <span class="icon-pill bg-[rgba(75,163,199,0.12)]" aria-hidden="true">${cfg.icon}</span>
                            ${pod.label}
                            <span class="podcast-badge" style="color:${cfg.color}">${cfg.label}</span>
                        </a>
                        <a href="${pod.file}" download aria-label="Download ${pod.label}" class="asset-dl">${dlIcon}</a>
                    </div>`);
            });

            const resourceStrip = (meeting.resources || []).length > 0 ? `
                <div class="resource-strip">
                    ${(meeting.resources || []).map(res => `
                    <a href="${res.file}" target="_blank" rel="noopener" class="resource-thumb">
                        <img src="${res.file}" alt="${res.label}" loading="lazy">
                        <span>${res.label}</span>
                    </a>`).join('')}
                </div>` : '';

            if (rows.length === 0 && !resourceStrip) {
                container.innerHTML = `<p class="text-[9px] font-semibold uppercase tracking-[0.25em] text-muted">Materials available closer to the meeting.</p>`;
                return;
            }

            container.innerHTML = rows.join('') + resourceStrip;
        }
```

- [ ] **Step 3: Call renderUpcomingMaterials() in the init block**

Find the line `renderArchiveCards();` near the bottom of the script and add the call directly before it:

```js
        renderUpcomingMaterials();
        renderArchiveCards();
```

- [ ] **Step 4: Run all tests**

```bash
npm test
```

Expected: all existing tests pass.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: replace static upcoming materials with dynamic renderUpcomingMaterials()"
```

---

## Task 6: Add Playwright tests for manifest rendering

Create a new test file covering: podcast rows with badges, resource thumbnail strip, and the dynamic upcoming materials container.

**Files:**
- Create: `tests/manifest-rendering.spec.js`

- [ ] **Step 1: Create the test file**

```js
import { test, expect } from '@playwright/test';

test.describe('Manifest Rendering', () => {

    test('archive card for meeting-01 renders a podcast row', async ({ page }) => {
        await page.goto('/');
        // The Deep Systems card (meeting-01) should have a podcast badge
        const badge = page.locator('.podcast-badge').first();
        await expect(badge).toBeVisible();
        await expect(badge).toContainText('Deep Dive');
    });

    test('podcast row has correct icon and label', async ({ page }) => {
        await page.goto('/');
        // Find the asset-link that contains the podcast badge
        const podcastLink = page.locator('.asset-link:has(.podcast-badge)').first();
        await expect(podcastLink).toBeVisible();
        await expect(podcastLink).toContainText('Clean Code Paradox');
    });

    test('archive card for meeting-01 renders resource thumbnails', async ({ page }) => {
        await page.goto('/');
        const strip = page.locator('.resource-strip').first();
        await expect(strip).toBeVisible();
        // meeting-01 has 2 resource images
        const thumbs = page.locator('.resource-thumb');
        await expect(thumbs).toHaveCount(2);
    });

    test('resource thumbnails have correct labels', async ({ page }) => {
        await page.goto('/');
        const thumbLabels = page.locator('.resource-thumb span');
        const texts = await thumbLabels.allTextContents();
        expect(texts.some(t => /architecture of simplicity/i.test(t))).toBe(true);
        expect(texts.some(t => /choose your adventure/i.test(t))).toBe(true);
    });

    test('upcoming card has materials container', async ({ page }) => {
        await page.goto('/');
        const container = page.locator('#upcoming-materials-container');
        await expect(container).toBeVisible();
    });

    test('upcoming card shows fallback text when no assets', async ({ page }) => {
        // meeting-02 has video: null, slides: null, no podcasts
        await page.goto('/');
        const container = page.locator('#upcoming-materials-container');
        await expect(container).toContainText('Materials available');
    });

    test('archive cards render before upcoming container', async ({ page }) => {
        await page.goto('/');
        // Both sections present simultaneously
        await expect(page.locator('#archive-cards-container')).toBeVisible();
        await expect(page.locator('#upcoming-materials-container')).toBeVisible();
    });

});
```

- [ ] **Step 2: Run the new tests**

```bash
npm test -- --grep "Manifest Rendering"
```

Expected: all 7 tests pass.

- [ ] **Step 3: Run full test suite to confirm no regressions**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add tests/manifest-rendering.spec.js
git commit -m "test: add manifest rendering tests for podcasts and resources"
```

---

## Task 7: Create rename_asset.sh

New Bash script that infers file category from extension, resolves the meeting directory, and renames/moves the file to match the naming convention. Supports `--dry-run`.

**Files:**
- Create: `asset-compressor/scripts/rename_asset.sh`

- [ ] **Step 1: Create the script**

```bash
#!/bin/bash
# scripts/rename_asset.sh
# Rename and organize a meeting asset to match the project naming convention.
#
# Usage:
#   bash scripts/rename_asset.sh <file> --meeting NN --slug <kebab-slug> [--type deep-dive|critique|debate] [--dry-run]
#
# Extension → category → subdirectory:
#   .mp4 .m4a  →  recording  →  meetings/NN-*/recordings/
#   .pptx .pdf →  slides     →  meetings/NN-*/slides/
#   .png .jpg .jpeg → resource → meetings/NN-*/resources/

set -euo pipefail

INPUT=""
MEETING=""
SLUG=""
TYPE=""
DRY_RUN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --meeting) MEETING="$2"; shift 2 ;;
        --slug)    SLUG="$2";    shift 2 ;;
        --type)    TYPE="$2";    shift 2 ;;
        --dry-run) DRY_RUN=true; shift ;;
        -*) echo "Unknown option: $1" >&2; exit 1 ;;
        *)  INPUT="$1"; shift ;;
    esac
done

if [ -z "$INPUT" ]; then
    echo "Usage: $0 <file> --meeting NN --slug <kebab-slug> [--type deep-dive|critique|debate] [--dry-run]" >&2
    exit 1
fi

if [ ! -f "$INPUT" ]; then
    echo "Error: file not found: $INPUT" >&2
    exit 1
fi

if [ -z "$SLUG" ]; then
    echo "Error: --slug is required (e.g. --slug clean-code-paradox)" >&2
    exit 1
fi

# Infer category from extension
EXT="${INPUT##*.}"
EXT_LOWER="${EXT,,}"
case "$EXT_LOWER" in
    mp4|m4a)        CATEGORY="recording";  SUBDIR="recordings" ;;
    pptx|pdf)       CATEGORY="slides";     SUBDIR="slides"     ;;
    png|jpg|jpeg)   CATEGORY="resource";   SUBDIR="resources"  ;;
    *)
        echo "Error: unsupported extension .$EXT_LOWER" >&2
        echo "Supported: .mp4 .m4a .pptx .pdf .png .jpg .jpeg" >&2
        exit 1
        ;;
esac

echo "Inferred: $CATEGORY → $SUBDIR/"

# Resolve meeting directory
if [ -z "$MEETING" ]; then
    # Try to infer: list meeting dirs, pick the only one if unambiguous
    MEETING_DIRS=($(find . -maxdepth 1 -type d -name 'meeting-[0-9]*' | grep -v 'meeting-99' | sort))
    if [ "${#MEETING_DIRS[@]}" -eq 1 ]; then
        MEETING=$(basename "${MEETING_DIRS[0]}" | sed 's/meeting-//')
        echo "Inferred meeting: $MEETING (only meeting directory found)"
    else
        echo "Error: multiple meeting directories found; specify --meeting NN" >&2
        echo "Available:" >&2
        for d in "${MEETING_DIRS[@]}"; do basename "$d"; done >&2
        exit 1
    fi
fi

# Pad meeting number to 2 digits
MEETING_PAD=$(printf '%02d' "$MEETING")

# Find meeting directory
MEETING_DIR=$(find . -maxdepth 1 -type d -name "meeting-${MEETING_PAD}*" | head -1)
if [ -z "$MEETING_DIR" ]; then
    echo "Error: no directory found matching meeting-${MEETING_PAD}*" >&2
    exit 1
fi

# Build target filename
if [ "$CATEGORY" = "recording" ] && [ -n "$TYPE" ]; then
    # Validate type
    case "$TYPE" in
        deep-dive|critique|debate) ;;
        *) echo "Error: --type must be deep-dive, critique, or debate (got: $TYPE)" >&2; exit 1 ;;
    esac
    FILENAME="${MEETING_PAD}-${SLUG}-${TYPE}.${EXT_LOWER}"
else
    FILENAME="${MEETING_PAD}-${SLUG}.${EXT_LOWER}"
fi

TARGET_DIR="${MEETING_DIR}/${SUBDIR}"
TARGET="${TARGET_DIR}/${FILENAME}"

echo "Rename:  $(basename "$INPUT")"
echo "      →  ${TARGET}"

if [ "$DRY_RUN" = true ]; then
    echo "(dry run — no files moved)"
    exit 0
fi

read -r -p "Move? [y/N] " CONFIRM
if [[ "${CONFIRM,,}" != "y" ]]; then
    echo "Aborted."
    exit 0
fi

mkdir -p "$TARGET_DIR"
mv "$INPUT" "$TARGET"
echo "Done."
```

- [ ] **Step 2: Make the script executable**

```bash
chmod +x asset-compressor/scripts/rename_asset.sh
```

- [ ] **Step 3: Dry-run smoke test**

```bash
# Create a throwaway test file
touch /tmp/test-video.mp4
bash asset-compressor/scripts/rename_asset.sh /tmp/test-video.mp4 \
    --meeting 01 --slug test-title --type deep-dive --dry-run
```

Expected output:
```
Inferred: recording → recordings/
Rename:  test-video.mp4
      →  ./meetings/meeting-01/recordings/01-test-title-deep-dive.mp4
(dry run — no files moved)
```

- [ ] **Step 4: Commit**

```bash
git add asset-compressor/scripts/rename_asset.sh
git commit -m "feat: add rename_asset.sh script to asset-compressor skill"
```

---

## Task 8: Add m4a support to compress_video.sh

M4a files are audio-only. They need a different FFmpeg command (no video codec, audio remux only).

**Files:**
- Modify: `asset-compressor/scripts/compress_video.sh`

- [ ] **Step 1: Replace compress_video.sh with the updated version**

```bash
#!/bin/bash
# scripts/compress_video.sh
# Usage: ./compress_video.sh input.(mp4|m4a) output.(mp4|m4a)

INPUT="$1"
OUTPUT="$2"

if [ -z "$INPUT" ] || [ -z "$OUTPUT" ]; then
  echo "Usage: $0 input.(mp4|m4a) output.(mp4|m4a)" >&2
  exit 1
fi

EXT="${INPUT##*.}"
EXT_LOWER="${EXT,,}"

if [ "$EXT_LOWER" = "m4a" ]; then
  # Audio-only: remux to AAC at 128k, no video codec needed
  ffmpeg -i "$INPUT" -acodec aac -b:a 128k -vn -y "$OUTPUT" < /dev/null 2>/dev/null
else
  # Video: x264 with 720p cap and AAC audio
  ffmpeg -i "$INPUT" -vcodec libx264 -crf 28 -preset medium \
         -vf "scale='min(1280,iw)':-2" -acodec aac -b:a 128k \
         -movflags +faststart -y "$OUTPUT" < /dev/null 2>/dev/null

  if [ ! -s "$OUTPUT" ]; then
    ffmpeg -i "$INPUT" -vcodec libx264 -crf 28 -preset medium \
           -vf "scale='min(1280,iw)':-2" -acodec aac -b:a 128k \
           -movflags +faststart -f "$EXT_LOWER" -y "$OUTPUT" < /dev/null 2>/dev/null
  fi
fi

if [ ! -s "$OUTPUT" ]; then
  echo "Error: compression failed — output file is empty." >&2
  exit 1
fi

ORIG_SIZE=$(stat -c%s "$INPUT")
NEW_SIZE=$(stat -c%s "$OUTPUT")
echo "Compression complete."
echo "Original: $((ORIG_SIZE/1024)) KB"
echo "Output:   $((NEW_SIZE/1024)) KB"
```

- [ ] **Step 2: Commit**

```bash
git add asset-compressor/scripts/compress_video.sh
git commit -m "feat: add m4a audio-only compression path to compress_video.sh"
```

---

## Task 9: Update asset-compressor SKILL.md

Add the naming convention table and a Rename & Organize section.

**Files:**
- Modify: `asset-compressor/SKILL.md`

- [ ] **Step 1: Add naming convention and Rename & Organize sections**

Append to the end of `asset-compressor/SKILL.md`:

```markdown

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
| `.png`, `.jpg`, `.jpeg` | resource | `meetings/NN-*/resources/` |

**Usage:**

```bash
bash scripts/rename_asset.sh <file> --meeting NN --slug <kebab-slug> [--type deep-dive|critique|debate] [--dry-run]
```

- `--meeting` — meeting number (e.g. `01`). Auto-inferred if only one meeting directory exists.
- `--slug` — required. Kebab-case title (e.g. `clean-code-paradox`).
- `--type` — required for podcast recordings (`.mp4`/`.m4a`). Omit for primary session recordings.
- `--dry-run` — preview the rename without moving anything.

**Example — rename a new podcast:**

```bash
bash scripts/rename_asset.sh ~/Downloads/debate-recording.m4a \
    --meeting 01 --slug ousterhout-uncle-bob --type debate --dry-run
```
```

- [ ] **Step 2: Commit**

```bash
git add asset-compressor/SKILL.md
git commit -m "docs: add naming convention and Rename & Organize to asset-compressor SKILL.md"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Naming convention — Task 1 (file rename) + Task 9 (documented)
- ✅ MEETINGS manifest with `podcasts[]` and `resources[]` — Task 2
- ✅ CSS for badges and thumbnail strip — Task 3
- ✅ Archive cards with podcast rows and resource strip — Task 4
- ✅ Upcoming card dynamic materials — Task 5
- ✅ Playwright tests — Task 6
- ✅ `rename_asset.sh` with inference + dry-run — Task 7
- ✅ m4a support in `compress_video.sh` — Task 8
- ✅ SKILL.md updated — Task 9

**Type consistency:**
- `podcastConfig` defined identically in `renderUpcomingMaterials()` (Task 5) and `renderArchiveCards()` (Task 4) — duplication intentional per YAGNI (no shared helper needed for two call sites)
- `dlIcon` SVG string is also duplicated across both functions — same rationale
- `.podcast-badge` class referenced in CSS (Task 3) matches usage in Tasks 4 and 5
- `.resource-strip` / `.resource-thumb` CSS (Task 3) matches usage in Tasks 4 and 5
- `#upcoming-materials-container` HTML (Task 5 Step 1) matches selector in test (Task 6)
- `renderUpcomingMaterials()` called before `renderArchiveCards()` in init block (Task 5 Step 3)
