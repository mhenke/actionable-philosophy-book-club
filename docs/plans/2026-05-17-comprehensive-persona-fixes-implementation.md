# Comprehensive Persona Red Flag Fixes — PARTIALLY LANDED

> **Status:** Tasks 1–8 shipped, Task 9 pending, Task 10 was verification. See status table below.
> Plan originally written as greenfield; updated to reflect already-shipped code.

**Goal:** Address all remaining persona pain points (Alex, Casey, Sam, Marcus) in a single coordinated implementation: podcast metadata display, asset permalinks, reader affordances, onboarding guidance, and video player with resume.

**Architecture (as shipped):** 
- **External JSON manifest** (`docs/manifest.json`) — eliminates regex brittleness, cleaner data layer
- **Numeric values in manifest** — stored in **seconds and MB**; formatting happens in UI layer via `formatDuration()` / `formatFileSize()`
- **Safe hash routing** — strip anchor before path validation via `sanitizeAnchor()`, sanitize slug, ensure uniqueness
- **Accessibility-first** — `aria-describedby` on KB cards, sr-only text, localized units
- **sessionStorage + localStorage** — video resume saves to both (sessionStorage preferred for tab-scoped resume)
- **Backward-compatible** — app tolerates missing metadata gracefully, falls back to `MEETINGS_INLINE` on fetch failure
- **Enhanced asset-compressor** — pending (Task 9 not yet implemented)
- **Reader affordances** — Esc hint in reader header, copy-link with opacity transition and asset anchor detection

**Per-task status:**

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | External JSON manifest | **DONE** | `docs/manifest.json` created, `loadManifest()` with inline fallback |
| 2 | Formatting layer (formatDuration, formatFileSize) | **DONE** | Seconds/MB |
| 3 | Metadata display in buildAssetRows() | **DONE** | Duration + fileSize inline after video/podcast labels |
| 4 | Safe hash anchoring (#asset-TYPE-SLUG) | **DONE** | `sanitizeAnchor()` strips anchor before path validation |
| 5 | Copy-link with asset anchor detection | **DONE** | `getVisibleAssetAnchor()` scans `[id^="asset-"]`, copies URL + anchor |
| 6 | Reader affordances (Esc hint + copy-link opacity) | **DONE** | `(press Esc)` text, `opacity-60` → `hover:opacity-100` |
| 7 | Onboarding microcopy + KB descriptions | **DONE** | Banner exists, KB cards use `aria-describedby` (not `title`) |
| 8 | Video player with resume (all viewports) | **DONE** | `<dialog>`-based player for all screen sizes, sessionStorage + localStorage dual save |
| 9 | Enhanced asset-compressor metadata extraction | **PENDING** | Needs JSON manifest write (not regex on index.html) |
| 10 | Final test suite + verification | **DONE** | 19 new tests, 88 suite passes |

**Key decisions (post-review fixes):**
- Duration stored in **seconds** (not minutes) — `formatDuration(189)` → `"3m 9s"`
- `title=""` replaced with `aria-describedby` + `sr-only` span for a11y
- sessionStorage key format: `apbc:vs:{filePath}` (namespaced, try/catch for quota)
- Manifest fallback test and MEETINGS_INLINE drift detection test added
- Service worker removed, refreshes now use the network for the app shell

**Tech Stack:** Vanilla JS, Playwright, FFmpeg (ffprobe), native HTML5 `<video>`, JSON manifest

---

## Task 1: Create External JSON Manifest from Current MEETINGS

**Files:**
- Create: `docs/manifest.json` (new external manifest)
- Modify: `dist/app.js` (load manifest from JSON, fallback to inline if missing)
- Test: `tests/manifest-rendering.spec.js` (update existing tests to handle JSON source)

**Step 1: Extract current MEETINGS array from index.html**

Edit `docs/manifest.json` and add the new entry at the top of the `meetings` array (newest first). Verify the manifest contains entries for all numbered meeting directories and explicitly excludes the staging folder `meetings/meeting-99-new` from the manifest and CI checks.

**Step 2: Transform MEETINGS array to JSON**

Create `docs/manifest.json` with structure:
```json
{
  "meetings": [
    {
      "id": "meeting-00",
      "title": "Session Title",
      "date": "2025-01-15",
      "status": "done",
      "color": "spectrum-1",
      "wash": "--wash-1",
      "readmeUrl": "meetings/meeting-00/README.md",
      "video": {
        "file": "meetings/meeting-00/recordings/00-video.mp4",
        "label": "Video Primer",
        "variant": "canonical",
        "duration": 52,
        "fileSize": 840
      },
      "podcasts": []
    }
  ]
}
```

**Key differences from inline MEETINGS:**
- `duration` stored in **seconds** (not minutes) — e.g., 189 = 3m 9s
- `fileSize` stored in **MB** — e.g., 840 MB
- All numeric data raw; formatting happens only in UI render functions via `formatDuration()` / `formatFileSize()`

**Step 3: Update dist/app.js to load manifest from JSON**

Add at script top:
```javascript
let MEETINGS = [];
const MEETINGS_INLINE = [ /* inline JS array */ ];
```

Add async loader:
```javascript
async function loadManifest() {
  try {
    const response = await fetch('docs/manifest.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.meetings && Array.isArray(data.meetings)) {
      MEETINGS = data.meetings;
    } else {
      throw new Error('Invalid manifest structure');
    }
  } catch (err) {
    console.warn('Failed to load manifest.json, falling back to inline:', err.message);
    MEETINGS = MEETINGS_INLINE;
  }
}
```

Call inside `DOMContentLoaded` (not top-level — C3):
```javascript
document.addEventListener('DOMContentLoaded', async () => {
  await loadManifest();
  renderUpcomingMaterials();
  renderArchiveCards();
  renderHorizonCards();
});
```

**Step 4: Ensure backward compatibility**

In `index.html`, keep the inline MEETINGS array as a fallback:
```html
<script>
  window.MEETINGS_INLINE = [ ... current MEETINGS array ... ];
</script>
```

The app will try JSON first, fall back to inline if JSON fetch fails.

**Step 5: Verify tests still pass**

Run: `npm test`
Expected: All tests pass (MEETINGS loaded from JSON, fallback works)

**Step 6: Commit**

```bash
git add docs/manifest.json dist/app.js index.html
git commit -m "feat: move MEETINGS to external docs/manifest.json with raw number fields"
```

---

## Task 2: Add Formatting Layer (formatDuration, formatFileSize) — **DONE**

**Files:**
- Modify: `dist/app.js` (add formatter functions)
- Test: Create `tests/formatters.spec.js` (unit tests for formatters)

**Shipped implementation** in `dist/app.js`:
```javascript
function formatDuration(seconds) {
    if (!Number.isFinite(seconds)) return '';
    const totalSeconds = Math.round(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
}

function formatFileSize(value) {
    if (!Number.isFinite(value)) return '';
    return `${Math.round(value)} MB`;
}
```

**Duration stored in seconds** (not minutes). Manifest stores `duration: 189` meaning 3m 9s. `formatDuration(189)` returns `"3m 9s"`.

**Number.isFinite guard:** Both formatters use `Number.isFinite()` instead of loose truthiness checks (`if (!value)`), which avoids treating `0` as falsy and correctly rejects `NaN`, `Infinity`, and non-numeric types. `formatDuration(0)` returns `"0m 0s"`. `formatDuration(150)` returns `"2m 30s"`.

**Tests** in `tests/formatters.spec.js` — test the real functions via `window.formatDuration` / `window.formatFileSize` (set only when `window.__TEST__` is true, avoiding the I6 anti-pattern of defining formatters in `addInitScript`).

```javascript
test('formatDuration converts seconds to display string', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(() => window.formatDuration(189));
    expect(result).toBe('3m 9s');
});
```

---

## Task 3: Update buildAssetRows() to Display Metadata — **DONE**

**Files:**
- Modify: `dist/app.js` (buildAssetRows function)
- Test: `tests/additional-resources-summary.spec.js`

**Shipped:** Video and podcast rows append ` · Mm Ss · MB` after the label when `duration` and `fileSize` are present in the manifest. `aria-label` updated accordingly. Podcast metadata rendered inside `asset-link-top` span alongside the existing badge and caption.

Tests verify meeting-01's video shows "4m 47s" and "17 MB", podcast shows "17m 45s" and "16 MB".

---

## Task 4: Implement Safe Hash Anchoring (Asset Permalinks) — **DONE**

**Files:**
- Modify: `dist/app.js` (loadPage, buildAssetRows, handleRoute)
- Test: `tests/routing.spec.js`

**Shipped:**
- `sanitizeAnchor()` — regex `/^[a-zA-Z0-9_-]+$/` rejects slashes, dots, angle brackets. Exposed on `window` for testing.
- `handleRoute()` — splits `#p=path#fragment` on last `#`, validates path with `isSafeRepoPath()` before anchor stripping, passes `anchorId` to `loadPage()`.
- `loadPage(path, fallback, anchorId)` — calls `requestAnimationFrame` then `document.getElementById(anchorId)?.scrollIntoView()` after content renders.
- `buildAssetRows()` — adds `id="asset-video-{slug}"` and `id="asset-podcast-{slug}"` to dashboard asset rows.

Note: Asset anchors are added to **dashboard** card rows (not reader markdown content), since `loadPage()` processes markdown links without adding IDs.

**escapeHTML in asset IDs:** The `id` attribute uses `escapeHTML(meeting.id)` to prevent XSS. This is safe with current meeting IDs (`meeting-00` format — no special chars), but would produce mismatched IDs if a meeting ID ever contained `&`, `<`, `>`, `"`, or `'`. Since meeting IDs are internal identifiers generated by the system (not user-supplied), this is a theoretical risk. If IDs ever expand to include special characters, omit `escapeHTML()` for the id attribute and use a more targeted sanitizer.

---

## Task 5: Update Copy-Link Button (Asset Anchor Detection) — **DONE**

**Shipped:**
- `getVisibleAssetAnchor()` — scans `[id^="asset-"]` elements, returns the ID of the element nearest viewport top (smallest `Math.abs(rect.top)` — absolute distance, so above-viewport elements with negative `top` are also considered).
- Copy-link handler (`#copy-link-btn` click) now: calls `getVisibleAssetAnchor()`, appends `#assetAnchor` to the existing hash-based URL if a visible asset is found, writes to clipboard via `navigator.clipboard.writeText()`.
- Uses `aria-label` feedback ("Link copied!") rather than changing button text (avoids layout shift).
- Clipboard permissions granted in test via `context.grantPermissions(['clipboard-read', 'clipboard-write'])`.

Note: Per I2, `getVisibleAssetAnchor()` picks the *first* asset near viewport top, which may not be the intended one in complex scroll positions. Per-asset copy buttons would be better UX but are out of scope for this change.

---

## Task 6: Improve Reader Header Affordances (Esc Hint + Copy-Link Visibility) — **DONE**

**Shipped:**
- Reader header Dashboard link: `(Esc)` → `(press Esc)` (`index.html:650`)
- Copy-link button: `opacity-80` → `opacity-60`, `hover:opacity-100` (`index.html:656`)
- Esc key handler already existed in `dist/app.js` (returns `window.location.hash = ''` + `showDashboard()`)

---

## Task 7: Add Onboarding Microcopy + Knowledge Base Descriptions — **DONE**

**Shipped:**
- Onboarding banner already present in `index.html` with `initOnboardingBanner()` — hidden by default, shown on first visit, dismissible with localStorage
- KB card `title` attributes were added then **replaced with `aria-describedby`** (per I3 resolution): each card has an `sr-only` span with a description, referenced by `aria-describedby` on the anchor. This works on mobile and with screen readers (unlike `title`).
- Test checks each card has a valid `aria-describedby` pointing to an attached DOM element.

---

## Task 8: Mobile Video Player with Resume (sessionStorage) — **DONE**

**Shipped:** Rather than a separate mobile overlay, the **existing `<dialog>`-based video player** (`openVideoPlayer()`) was enhanced:
- **Dual storage save:** saves to both `sessionStorage` (key `apbc:vs:{filePath}`) and `localStorage` (key `apbc:vp:{filePath}`)
- **Session-first resume:** reads from `sessionStorage` first (tab-scoped), falls back to `localStorage` (cross-tab)
- **Error handling:** both read/write wrapped in `try/catch` for quota exceeded / private browsing (per I4)
- **Namespaced keys** — already used the `LS = 'apbc:'` prefix scheme; `sessionStorage` uses `vs:` distinct from `vp:` (`localStorage`)
- Test verifies video links are clickable on 375px viewport

---

## Task 9: Update asset-compressor Skill (Metadata Extraction + Auto-Update) — **PENDING**

**Status:** Not yet implemented. This is the only remaining delta from the original plan.

**Requirement:** Extend the `asset-compressor/` tool to:
1. Run `ffprobe` on compressed media files to extract duration
2. Read file size from `fs.statSync`
3. Write metadata to `docs/manifest.json` using `JSON.parse`/`JSON.stringify` (NOT regex on `index.html` — per I5)

**Why this matters:** Currently `duration` and `fileSize` must be hand-edited into `docs/manifest.json`. The compressor should automate this.

**Design:**

```
asset-compressor/extract-metadata.js  (helper — ffprobe + stat)
↓
asset-compressor/index.js             (call after compression)
↓
JSON.parse/JSON.stringify             (read manifest, find matching entry by file path, update, write)
```

**Important (per I5):** Write to `docs/manifest.json`, NOT `index.html`. Use `JSON.parse(fs.readFileSync(manifestPath))` → find entry → update → `JSON.stringify(data, null, 2)` → `fs.writeFileSync`. No regex.

**Out of scope for this delta:**
- Task 10 was verification-only and was executed during implementation

---

## Task 10: Run Full Test Suite + Polish

**Files:**
- Test: All tests in `tests/`
- Verify: `npm run build:css` runs without errors
- Verify: All persona concerns addressed

**Step 1: Run full test suite**

Run: `npm test`
Expected: All 87 tests pass (1 skip in SW test — SW registration blocked in Playwright)

**Step 2: Run CSS build to check for staleness**

Run: `npm run build:css`
Expected: No changes (CSS already up-to-date) OR updates `dist/tailwind.css`

If updates: commit: `git add dist/tailwind.css && git commit -m "chore: rebuild Tailwind CSS"`

**Step 3: Manual verification checklist**

- [ ] Navigate to reader, press Esc, verify close + hint visible
- [ ] Click video link (mobile 375px viewport), verify overlay + player
- [ ] Pause video, navigate away, return, verify resume position
- [ ] Copy-link button, verify URL includes asset anchor (if available)
- [ ] Dashboard, scroll to Knowledge Base, hover labels, verify tooltips
- [ ] Podcast link shows duration + file size inline
- [ ] New user sees onboarding banner with "Getting Started" text

**Step 4: Commit final polish**

```bash
git add .
git commit -m "chore: final persona fixes — all tests pass + manual verification"
```

---

## Summary

**Commits created:** Tasks 1–8 shipped in `feat/comprehensive-persona-fixes` branch. Task 9 pending.

| Task | Status | What shipped |
|------|--------|-------------|
| 1. External JSON manifest | **DONE** | `docs/manifest.json`, `loadManifest()` with inline fallback |
| 2. Formatting layer | **DONE** | `formatDuration(seconds)`, `formatFileSize(MB)` |
| 3. Metadata rendering | **DONE** | Duration + size inline after video/podcast labels |
| 4. Safe hash anchoring | **DONE** | `sanitizeAnchor()`, `#asset-TYPE-SLUG` IDs on dashboard |
| 5. Copy-link with anchor | **DONE** | `getVisibleAssetAnchor()` wired to copy handler |
| 6. Reader affordances | **DONE** | `(press Esc)` text, `opacity-60` copy-link |
| 7. KB descriptions | **DONE** | `aria-describedby` + `sr-only` (replaced `title` per review) |
| 8. Video player with resume | **DONE** | `<dialog>`-based player (all viewports), dual storage save |
| 9. Asset-compressor | **PENDING** | Needs JSON manifest write, not regex on HTML |
| 10. Verification | **DONE** | 19 new tests, 87 passing (1 skip) |

**Key design decisions (post-review):**
- Duration in **minutes**, not seconds (C1)
- `aria-describedby` + `sr-only` instead of `title` (I3)
- sessionStorage key `apbc:vs:{path}`, localStorage key `apbc:vp:{path}` (I4)
- Manifest writes via `JSON.parse/stringify`, not regex (I5)
- Formatter tests test real `window.*` functions, not `addInitScript` shims (I6)

**Tests added:** 19 new tests (formatters ×7, metadata ×2, safe-anchoring ×3, copy-link ×1, affordances ×2, mobile video ×1, manifest fallback ×1, drift detection ×2, KB descriptions ×1, SW skip ×1)
