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
- Extract `duration` (minutes) + `fileSize` (MB) for all `.m4a` and `.mp4` files
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
- Render inline: "Meeting 01 Deep Dive · 45m · 120 MB"
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
- Each asset gets stable `id="asset-{type}-{slug}"` anchor in HTML:
  ```html
  <div id="asset-video-recap">
    <a href="...">Video Recap · 52m · 840 MB</a>
  </div>
  <div id="asset-podcast-deepdive">
    <a href="...">Deep Dive · 45m · 120 MB</a>
  </div>
  ```
- `loadPage()` parses anchor from hash and scrolls to it after render
- Copy-link button now generates `full_url#asset-{type}-{slug}` for deep-linking
- History API: `window.location.hash = '#p=...#asset-TYPE-SLUG'` (pushes state)

**URL examples:**
- `#p=meetings/meeting-01/README.md#asset-video-recap` → jumps to video
- `#p=meetings/meeting-01/README.md#asset-podcast-deepdive` → jumps to deep-dive audio

**Impact:** Enables Alex to share, enables Casey (mobile users can send resources).

---

### 3. Reader Header Affordance + Copy-Link Visibility

**Problem:** Alex doesn't discover Esc key; copy-link button visually hidden.

**Solution:**
- Add small text hint next to "Dashboard" link: `<span class="text-xs text-muted">(press Esc)</span>`
- Increase copy-link button visibility:
  - Normal state: opacity-60 (from opacity-40)
  - Hover/focus: opacity-100
  - Always tab-accessible with correct aria-label
- Small change, high discoverability gain

**Example:**
```html
<header class="reader-header">
  <a href="...">Dashboard</a> <span class="text-xs text-muted">(press Esc)</span>
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

- **Terminology tooltips:** Add `title=""` attributes to jargon:
  - "Synthesis Reader" → tooltip: "A guided walkthrough of key concepts"
  - "Horizon" → tooltip: "Upcoming meetings and future topics"
  - "Archive" → tooltip: "Past meetings and recordings"

**Impact:** Helps Marcus (new users know where to start), improves UX for all.

---

### 5. Mobile Video Playback with Resume

**Problem:** Casey gets download prompts instead of in-page playback; can't resume mid-session.

**Solution:**
- Native `<video>` player overlay when video links clicked on mobile (≤640px)
- Desktop (>640px): keep current behavior (direct link)
- **Player controls:** Standard HTML5 (play/pause, progress, volume, fullscreen)
- **Resume:** Save playback position to `sessionStorage['video-{filename}']` on pause/seek
- **Restore:** On re-open same video (same session), resume from last position

**Flow:**
```
User taps video link (mobile)
  ↓
Overlay opens with <video> player
  ↓
User pauses/seeks (position saved to sessionStorage)
  ↓
User navigates away
  ↓
User returns to reader + taps same video
  ↓
Video resumes from last position
```

**UX details:**
- Overlay: full-width video at top, dismiss button (X), back to reader below
- Error state: "Video unavailable. [Direct link: download]"
- sessionStorage: clears on tab close (safe, per-session only)
- No external player required (native HTML5 `<video>`)

**Impact:** Helps Casey (mobile-friendly experience), improves mobile UX across personas.

---

## Metadata Extraction (Enhanced asset-compressor Skill)

### Current Workflow
```bash
npm run compress:media
```

### Enhanced Workflow
1. Compress/resize media file
2. Rename to kebab-case (existing)
3. **Extract metadata:**
   - Duration: ffprobe → seconds → convert to minutes
   - File size: bytes → MB
4. **Auto-update MEETINGS manifest** in `index.html`:
   - Add/update `duration` + `fileSize` fields
   - Preserve all other asset fields
   - Log success: "Updated podcast-deepdive.m4a: 45m, 120 MB"

### Implementation Details
- Use ffprobe (FFmpeg tool) for metadata extraction
- Query command: `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1:noprint_filename=1 file.m4a`
- Parse file size from file system (stat)
- Update MEETINGS via regex or JSON parsing (choose based on manifest structure)

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
1. Enhanced asset-compressor + manifest metadata
2. Podcast/video metadata display (all locations)
3. Asset permalinks + copy-link routing
4. Reader header affordance + copy-link visibility
5. Onboarding banner + tooltips
6. Mobile video player + resume
7. Testing + polish

**Estimated effort:** 6–8 hours

---

## Rollout

- Single feature branch: `feat/comprehensive-persona-fixes`
- Single PR: design doc + enhanced asset-compressor + all implementation changes
- No feature flags; changes non-breaking
- Deploy to main immediately after CI passes
