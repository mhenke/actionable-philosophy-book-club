# Design: Comprehensive Persona Red Flag Fixes (All-at-Once)

## Overview

Address all remaining persona pain points in a coordinated implementation:
- **Alex (Power User):** Podcast metadata, asset permalinks, Esc affordance
- **Casey (Mobile):** Video playback with resume, podcast metadata
- **Sam (A11y):** Podcast metadata in aria-labels, copy-link visibility
- **Marcus (New User):** Onboarding guidance

## Design Sections

### 1. Podcast & Video Metadata Display

**Problem:** Alex can't tell duration without clicking; Sam doesn't know file size; Casey can't assess download impact.

**Solution:**
- Extract `duration` (seconds) + `fileSize` (MB) for all `.m4a` and `.mp4` files
- Metadata harvested by enhanced `asset-compressor` skill at compression time
- Manifest structure:
  ```javascript
  podcasts: [
    { file: "...", type: "debate", title: "Deep Dive", duration: 45, fileSize: 120 }
  ]
  videos: [
    { file: "...", type: "canonical", duration: 52, fileSize: 840 }
  ]
  ```
- Render inline: "Meeting 01 Strategic Software Design and Deep Modules · 18m · 16 MB"
- Add aria-labels: "Meeting 01 Deep Dive podcast, 45 minutes, 120 megabytes"

**Rendering locations:**
- Dashboard upcoming section: inline with asset rows
- Dashboard archive section: inline with asset rows
- Reader: inline with podcast/video rows
- Disclosure summary: update to include metadata context

**Impact:** Helps Alex (quick scan), Casey (informed choice), Sam (accessible metadata).

---

### 2. Asset Permalinks (Per-Asset Anchors)

**Problem:** Alex can't share direct links to specific podcasts or videos.

**Solution:**
- Extend hash routing to support `#p=meetings/meeting-01/README.md#asset-TYPE-SLUG`
- Each asset gets stable `id="asset-{meetingId}-{type}-{slug}"` anchor in HTML:
  ```html
  <div id="asset-meeting-00-video-00-the-complexity-governor">
    <a href="...">Video Primer · 52m · 840 MB</a>
  </div>
  <div id="asset-meeting-01-podcast-01-strategic-software-design-and-deep-modules-deep-dive">
    <a href="...">Strategic Software Design and Deep Modules · 18m · 16 MB</a>
  </div>
  ```
- `loadPage()` parses anchor from hash and scrolls to it after render
- Copy-link button now generates `full_url#asset-{meetingId}-{type}-{slug}` for deep-linking
- History API: `window.location.hash = '#p=...#asset-meetingId-TYPE-SLUG'` (pushes state)

**URL examples:**
- `#p=meetings/meeting-00/README.md#asset-meeting-00-video-00-the-complexity-governor` → jumps to video
- `#p=meetings/meeting-01/README.md#asset-meeting-01-podcast-01-strategic-software-design-and-deep-modules-deep-dive` → jumps to deep-dive audio

**Impact:** Enables Alex to share, enables Casey (mobile users can send resources).

---

### 3. Reader Header Affordance + Copy-Link Visibility

**Problem:** Alex doesn't discover Esc key; copy-link button visually hidden.

**Solution:**
- Add small text hint next to "Dashboard" link: `<span class="text-xs text-muted">(press Esc)</span>` (hidden on ≤640px via `max-sm:hidden` since mobile users don't have keyboard shortcuts)
- Increase copy-link button visibility:
  - Normal state: opacity-60 (from opacity-40)
  - Hover/focus: opacity-100
  - Always tab-accessible with correct aria-label
- Small change, high discoverability gain

**Example:**
```html
<header class="reader-header">
  <a href="...">Dashboard</a> <span class="text-[0.75rem] font-normal ml-1 opacity-75 max-sm:hidden">(press Esc)</span>
  <button class="copy-link-btn opacity-60 hover:opacity-100 focus:opacity-100">🔗</button>
</header>
```

**Impact:** Helps Alex (discovers keyboard shortcut), improves UX for all.

---

### 4. Onboarding Guidance (Banner + Tooltips)

**Problem:** Marcus doesn't know where to start; labels like "Synthesis Reader" are unclear.

**Solution:**
- **Banner microcopy:** Expand onboarding banner (already in DOM) with light guidance:
  ```html
  <div class="onboarding-banner">
    <p><strong>New to the club?</strong> Start with the <strong>Latest Meeting</strong> or explore the <strong>Knowledge Base</strong> below.</p>
  </div>
  ```
  - Visible on mobile (thumb zone), sticky on small screens
  - Includes CTAs that link to key sections

- **Terminology descriptions:** Add `aria-describedby` + `sr-only` span to jargon cards (per I3 resolution — `title` doesn't work on mobile and has poor screen reader support):
  - "Synthesis Reader" → description: "A guided walkthrough of key concepts"
  - "Horizon" → description: "Upcoming meetings and future topics"
  - "Archive" → description: "Past meetings and recordings"

**Impact:** Helps Marcus (new users know where to start), improves UX for all.

---

### 5. Video Playback with Resume (All Viewports)

**Problem:** Users get download prompts instead of in-page playback; can't resume mid-session.

**Solution:**
- Native `<video>` player in a `<dialog>` overlay when any `.mp4` link is clicked (all viewports)
- **Resume:** Save playback position to both `sessionStorage` (tab-scoped) and `localStorage` (cross-tab fallback)
- **Restore:** On re-open same video, resume from last position
- **Error handling:** Wrapped in `try/catch` for quota exceeded and private browsing modes
- **Dual-close:** Click close button, click overlay backdrop, or press Escape — all close the dialog and restore focus

**Flow:**
```
User clicks video link (any viewport)
  ↓
<dialog> overlay opens with <video> player
  ↓
User pauses/seeks (position saved to sessionStorage + localStorage)
  ↓
User navigates away or closes overlay
  ↓
User returns + taps same video
  ↓
Video resumes from last position with "Resume from X:XX?" prompt
```

**UX details:**
- `<dialog>` element with `showModal()` — native focus trapping and Escape handling
- "Resume from X:XX?" bar appears when saved position exceeds 5s threshold
- Resume bar offers two buttons: Resume (seeks to position) and Start Over (clears saved time)
- Namespaced storage keys: `apbc:vs:{filePath}` (sessionStorage), `apbc:vp:{filePath}` (localStorage)
- Focus restoration: saves `document.activeElement` before opening, restores on close
- Error state: "This file is not available yet. Materials appear closer to the meeting date." toast
- Backdrop click handled via `overlay.onclick` (only fires on backdrop, not content clicks)
- No external player required (native HTML5 `<video>`)

**Impact:** Helps Casey (mobile-friendly playback), improves desktop UX with resume support.

---

## Metadata Extraction (Enhanced asset-compressor Skill) — **PENDING**

**Status:** Not yet implemented. Duration and fileSize values are currently hand-edited into `docs/manifest.json`. The compressor automation is deferred.

### Current Workflow (Manual)
```bash
npm run compress:media
# Then hand-edit docs/manifest.json with duration + fileSize
```

### Planned Workflow (When Implemented)
1. Compress/resize media file
2. Rename to kebab-case (existing)
3. **Extract metadata:**
   - Duration: ffprobe → seconds → display as minutes and seconds
   - File size: bytes → MB
4. **Auto-update manifest** in `docs/manifest.json`:
   - Add/update `duration` + `fileSize` fields via `JSON.parse()`/`JSON.stringify()` (NOT regex on HTML)
   - Preserve all other asset fields
   - Log success: "Updated 01-strategic-software-design-and-deep-modules-deep-dive.m4a: 18m, 16 MB"

### Implementation Details (Future)
- Use ffprobe (FFmpeg tool) for metadata extraction
- Query command: `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1:noprint_filename=1 file.m4a`
- Parse file size from file system (stat)
- Update manifest via `JSON.parse(fs.readFileSync(manifestPath))` → find entry → update → `JSON.stringify(data, null, 2)` → `fs.writeFileSync`

---

## Testing Strategy

### Unit/Integration
- Metadata display: check `duration` + `fileSize` rendered correctly in all locations
- Asset permalinks: verify `#asset-TYPE-SLUG` anchors exist + copy-link generates correct URLs
- Reader affordance: press Esc closes reader, hint visible

### Playwright E2E
- Navigate to reader, verify Esc closes + dashboard link visible
- Click podcast link, verify duration/fileSize shown
- Click copy-link, paste URL, verify it's shareable + deep-links to asset
- Mobile: open video link, verify player overlay + resume on re-visit
- Onboarding: new user sees banner + tooltips on Knowledge Base labels

### Accessibility
- Screen reader: aria-labels include duration + fileSize
- Keyboard: all video controls accessible, Esc key works, tooltips announced

---

## Implementation Plan (See: 2026-05-17-comprehensive-persona-fixes-implementation.md)

**Phases:**
1. Podcast/video metadata display (all locations)
2. Asset permalinks + copy-link routing
3. Reader header affordance + copy-link visibility
4. Onboarding banner + KB descriptions
5. Video player with resume (all viewports)
6. Enhanced asset-compressor (PENDING — see section below)
7. Testing + polish

**Estimated effort:** 6–8 hours

---

## Rollout

- Single feature branch: `feat/comprehensive-persona-fixes`
- Single PR: design doc + enhanced asset-compressor + all implementation changes
- No feature flags; changes non-breaking
- Deploy to main immediately after CI passes
