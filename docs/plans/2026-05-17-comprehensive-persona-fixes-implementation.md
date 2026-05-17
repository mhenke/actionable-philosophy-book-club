# Comprehensive Persona Red Flag Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Address all remaining persona pain points (Alex, Casey, Sam, Marcus) in a single coordinated implementation: podcast metadata display, asset permalinks, reader affordances, onboarding guidance, and mobile video playback.

**Architecture:** 
- Enhanced asset-compressor skill to extract + auto-update MEETINGS manifest with duration/fileSize
- Extend hash routing to support per-asset anchors (`#asset-TYPE-SLUG`)
- Render metadata inline in all asset rows (dashboard + reader)
- Add mobile-only video player overlay with sessionStorage resume
- Improve reader header affordances + onboarding microcopy

**Tech Stack:** Vanilla JS, Playwright, FFmpeg (ffprobe), native HTML5 `<video>`

---

## Task 1: Extend MEETINGS Manifest Schema

**Files:**
- Modify: `index.html:360-500` (MEETINGS array)
- Test: `tests/manifest-rendering.spec.js` (update existing tests)

**Step 1: Understand current manifest structure**

Open `index.html` and find the MEETINGS array. Note current fields for podcasts/videos: `file`, `type`, `title`.

**Step 2: Add duration + fileSize fields to one test entry**

Edit `index.html` MEETINGS[0] (meeting-00):
```javascript
videos: [
  { file: "meetings/meeting-00/video.mp4", type: "canonical", title: "Video Recap", duration: 52, fileSize: 840 }
],
podcasts: [
  { file: "meetings/meeting-00/podcast-deepdive.m4a", type: "debate", title: "Deep Dive", duration: 45, fileSize: 120 }
]
```

**Step 3: Verify tests still pass**

Run: `npm test -- tests/manifest-rendering.spec.js`
Expected: All tests pass (schema change doesn't break existing logic yet)

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: extend MEETINGS manifest with duration + fileSize fields"
```

---

## Task 2: Update buildAssetRows() to Render Metadata

**Files:**
- Modify: `dist/app.js:~180-250` (buildAssetRows function)
- Test: `tests/additional-resources-summary.spec.js` (extend existing test)

**Step 1: Write test for metadata display**

Edit `tests/additional-resources-summary.spec.js` and add:
```javascript
test('renders podcast duration and file size when present', async ({ page }) => {
  await page.goto('http://localhost:3000');
  const podcastLink = await page.locator('text=/Deep Dive.*45m.*120 MB/');
  await expect(podcastLink).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/additional-resources-summary.spec.js`
Expected: FAIL with "no element matching text"

**Step 3: Implement metadata formatting in buildAssetRows()**

In `dist/app.js`, find `buildAssetRows()` function around line 180. Update video/podcast rendering:

```javascript
function formatAssetMetadata(duration, fileSize) {
  const parts = [];
  if (duration) parts.push(`${duration}m`);
  if (fileSize) parts.push(`${fileSize} MB`);
  return parts.length > 0 ? ` · ${parts.join(' · ')}` : '';
}

// In buildAssetRows, update video rendering (around line 210):
const videoDuration = video.duration ? formatAssetMetadata(video.duration, video.fileSize) : '';
html += `<a href="${videoFile}" class="asset-link">
  <span class="icon-pill" aria-hidden="true">🎬</span>
  <span>${escapeHTML(video.title || '')}${videoDuration}</span>
</a>`;

// In buildAssetRows, update podcast rendering (around line 245):
const podcastDuration = podcast.duration ? formatAssetMetadata(podcast.duration, podcast.fileSize) : '';
podcastRows.push(`<li>
  <a href="${podcastFile}" class="asset-link">
    <span class="podcast-badge">${escapeHTML(podcast.title || '')}</span>
    <span class="podcast-caption">${escapeHTML(podcast.label || '')}${podcastDuration}</span>
  </a>
</li>`);
```

**Step 4: Update aria-labels for accessibility**

Update video/podcast aria-labels to include duration + size:
```javascript
const ariaLabel = `${escapeHTML(video.title)}, ${video.duration} minutes, ${video.fileSize} megabytes`;
// Apply to <a> tag: aria-label="${ariaLabel}"
```

**Step 5: Run test to verify it passes**

Run: `npm test -- tests/additional-resources-summary.spec.js`
Expected: PASS (metadata visible)

**Step 6: Run all tests**

Run: `npm test`
Expected: All 66+ tests pass

**Step 7: Commit**

```bash
git add dist/app.js tests/additional-resources-summary.spec.js
git commit -m "feat: render podcast/video duration and fileSize in asset rows"
```

---

## Task 3: Implement Asset Permalinks (Asset Anchors + Router)

**Files:**
- Modify: `dist/app.js:~380-420` (loadPage function)
- Modify: `index.html` (add asset IDs in reader template)
- Test: `tests/routing.spec.js` (new test for asset anchors)

**Step 1: Write test for asset permalink navigation**

Edit `tests/routing.spec.js` and add:
```javascript
test('navigates to asset anchor when URL contains #asset-TYPE-SLUG', async ({ page }) => {
  await page.goto('http://localhost:3000/#p=meetings/meeting-01/README.md#asset-podcast-deepdive');
  await page.waitForLoadState('networkidle');
  
  const anchorElement = await page.locator('#asset-podcast-deepdive');
  await expect(anchorElement).toBeVisible();
  
  // Verify element is scrolled into view (not precise, but close)
  const box = await anchorElement.boundingBox();
  expect(box.y).toBeLessThan(window.innerHeight);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/routing.spec.js`
Expected: FAIL (no anchor matching, or not scrolled)

**Step 3: Update loadPage() to parse and scroll to asset anchors**

In `dist/app.js`, find `loadPage()` around line 380. Update hash parsing:

```javascript
async function loadPage(path, fallback = 'meetings/meeting-01/README.md') {
  // Parse path and anchor from hash: #p=path#asset-TYPE-SLUG
  const [routePath, anchorId] = path.includes('#') 
    ? path.split('#') 
    : [path, null];
    
  if (!isSafeRepoPath(routePath)) {
    // ... existing error handling
  }
  
  // Fetch + render markdown (existing code)
  const html = await fetchMarkdownCached(routePath);
  // ... render to #markdown-content
  
  // NEW: Scroll to asset anchor if present
  if (anchorId) {
    // Wait one frame for DOM to settle
    await new Promise(resolve => requestAnimationFrame(resolve));
    const element = document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
```

**Step 4: Update hash change handler to pass anchor**

Find `window.addEventListener('hashchange', ...)` around line 580. Update to parse anchor:

```javascript
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  const path = hash.startsWith('p=') ? hash.slice(2) : 'meetings/meeting-01/README.md';
  loadPage(path);
});
```

**Step 5: Add asset IDs to rendered markdown content**

For now, add simple anchor divs around assets in the reader. Update `buildAssetRows()` to return asset IDs:

In `buildAssetRows()`, prefix each asset HTML with an anchor:
```javascript
const videoId = `asset-video-${(video.file.split('/').pop().replace('.mp4', ''))}`;
html += `<div id="${videoId}"><a href="...">...</a></div>`;

const podcastId = `asset-podcast-${(podcast.file.split('/').pop().replace('.m4a', ''))}`;
podcastRows.push(`<div id="${podcastId}"><a href="...">...</a></div>`);
```

**Step 6: Run test to verify it passes**

Run: `npm test -- tests/routing.spec.js`
Expected: PASS (asset anchor found and scrolled to)

**Step 7: Run all tests**

Run: `npm test`
Expected: All tests pass

**Step 8: Commit**

```bash
git add dist/app.js tests/routing.spec.js
git commit -m "feat: add asset permalink support (#asset-TYPE-SLUG anchors)"
```

---

## Task 4: Update Copy-Link Button to Include Asset Anchor

**Files:**
- Modify: `dist/app.js:~550-600` (copy-link button handler)
- Test: `tests/routing.spec.js` (extend asset permalink test)

**Step 1: Update copy-link handler to detect focused asset**

In `dist/app.js`, find copy-link button click handler. Update to:

```javascript
const copyLinkBtn = document.getElementById('copy-link-btn');
if (copyLinkBtn) {
  copyLinkBtn.addEventListener('click', () => {
    const basePath = window.location.pathname;
    let hash = window.location.hash;
    
    // If an asset is focused or hovered, append its anchor
    // For now, use current hash as-is (can be enhanced with focus detection later)
    
    const fullUrl = `${window.location.origin}${basePath}${hash}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      // Show feedback: "Copied!"
      copyLinkBtn.textContent = '✓ Copied';
      setTimeout(() => { copyLinkBtn.textContent = '🔗'; }, 2000);
    });
  });
}
```

**Step 2: Enhance to include asset anchor if one is visible**

Add logic to detect focused asset element (optional for MVP, but improves UX):

```javascript
function getFocusedAssetAnchor() {
  // Check if any asset is in viewport
  const assets = document.querySelectorAll('[id^="asset-"]');
  for (const asset of assets) {
    const rect = asset.getBoundingClientRect();
    if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
      return asset.id;
    }
  }
  return null;
}

// In copy-link handler:
const assetAnchor = getFocusedAssetAnchor();
let hash = window.location.hash;
if (assetAnchor && !hash.includes(`#${assetAnchor}`)) {
  hash += `#${assetAnchor}`;
}
```

**Step 3: Test copy-link with asset anchor**

Update routing test to verify copy-link includes anchor:

```javascript
test('copy-link button includes asset anchor when near top of viewport', async ({ page }) => {
  await page.goto('http://localhost:3000/#p=meetings/meeting-01/README.md#asset-podcast-deepdive');
  
  const copyBtn = await page.locator('#copy-link-btn');
  await copyBtn.click();
  
  // Check clipboard (not directly testable in Playwright, but log can verify)
  // For now, just verify button shows feedback
  await expect(copyBtn).toContainText('✓ Copied');
});
```

**Step 4: Commit**

```bash
git add dist/app.js tests/routing.spec.js
git commit -m "feat: copy-link button now includes asset anchors"
```

---

## Task 5: Improve Reader Header Affordances (Esc Hint + Copy-Link Visibility)

**Files:**
- Modify: `index.html:~600-650` (reader header HTML)
- Modify: `dist/tailwind.css` or inline styles for copy-link opacity
- Test: `tests/routing.spec.js` (new test for affordances)

**Step 1: Write test for Esc hint visibility**

```javascript
test('reader header shows (press Esc) hint', async ({ page }) => {
  await page.goto('http://localhost:3000/#p=meetings/meeting-01/README.md');
  
  const escHint = await page.locator('text=/press Esc/i');
  await expect(escHint).toBeVisible();
});
```

**Step 2: Add Esc hint to reader header HTML**

In `index.html`, find the reader header (around line 620) and update:

```html
<header class="reader-header" id="reader-header">
  <div class="reader-header-left">
    <a href="#" id="dashboard-link" class="reader-back-link">Dashboard</a>
    <span class="text-xs text-muted ml-2">(press Esc)</span>
  </div>
  <button id="copy-link-btn" class="copy-link-btn opacity-60 hover:opacity-100 focus:opacity-100" 
    aria-label="Copy link to this page">
    🔗
  </button>
</header>
```

**Step 3: Update copy-link button opacity styles**

Ensure Tailwind classes are applied:
```html
<button ... class="copy-link-btn opacity-60 hover:opacity-100 focus:opacity-100 transition-opacity" ...>
```

If inline CSS is needed in `dist/app.js`:
```javascript
const copyLinkBtn = document.getElementById('copy-link-btn');
if (copyLinkBtn) {
  copyLinkBtn.style.opacity = '0.6';
  copyLinkBtn.addEventListener('mouseenter', () => copyLinkBtn.style.opacity = '1');
  copyLinkBtn.addEventListener('mouseleave', () => copyLinkBtn.style.opacity = '0.6');
}
```

**Step 4: Run test to verify Esc hint is visible**

Run: `npm test -- tests/routing.spec.js`
Expected: PASS (Esc hint found)

**Step 5: Commit**

```bash
git add index.html dist/app.js
git commit -m "feat: add (press Esc) affordance hint in reader header + improve copy-link visibility"
```

---

## Task 6: Add Onboarding Microcopy + Tooltips

**Files:**
- Modify: `index.html:~250-280` (onboarding banner)
- Modify: `index.html:~1500-1700` (Knowledge Base section)
- Test: `tests/manifest-rendering.spec.js` (visual regression check)

**Step 1: Expand onboarding banner with microcopy**

In `index.html`, find the onboarding banner (should be in `<main>` now after earlier commit 6adc694). Update:

```html
<div id="onboarding-banner" class="onboarding-banner p-4 mb-6 bg-wash-1 rounded-md border border-wash-2-border">
  <p class="text-sm leading-relaxed">
    <strong>New to the club?</strong> Start with the <strong><a href="#" onclick="scrollToSection('upcoming-materials'); return false;">Latest Meeting</a></strong> 
    or explore the <strong><a href="#" onclick="scrollToSection('knowledge-base'); return false;">Knowledge Base</a></strong> below.
  </p>
</div>
```

Add helper function in `dist/app.js`:
```javascript
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}
```

**Step 2: Add title tooltips to Knowledge Base labels**

Find Knowledge Base section (around line 1600) and add `title=""` attributes:

```html
<div class="knowledge-base-cards" id="knowledge-base">
  <h2>Knowledge Base</h2>
  <!-- Card 1 -->
  <div class="kb-card" title="A guided walkthrough of key concepts and connections">
    <h3>Synthesis Reader</h3>
    ...
  </div>
  <!-- Card 2 -->
  <div class="kb-card" title="Upcoming meetings and future discussion topics">
    <h3>Horizon</h3>
    ...
  </div>
  <!-- Card 3 -->
  <div class="kb-card" title="Past meetings, recordings, and archived materials">
    <h3>Archive</h3>
    ...
  </div>
</div>
```

**Step 3: Test that tooltips appear on hover**

Manual test: hover over Knowledge Base labels, verify tooltips show.

Playwright test (visual):
```javascript
test('Knowledge Base cards have helpful tooltips', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  const synthesisCard = await page.locator('[title*="guided walkthrough"]');
  await expect(synthesisCard).toHaveAttribute('title', /guided walkthrough/);
});
```

**Step 4: Run tests**

Run: `npm test`
Expected: All tests pass

**Step 5: Commit**

```bash
git add index.html dist/app.js
git commit -m "feat: expand onboarding banner + add Knowledge Base tooltips"
```

---

## Task 7: Mobile Video Player with Resume (sessionStorage)

**Files:**
- Modify: `dist/app.js:~300-350` (renderUpcomingMaterials) + new function
- Modify: `index.html` (add video overlay template)
- Test: `tests/routing.spec.js` (new mobile video player test)

**Step 1: Write test for mobile video player**

```javascript
test('mobile: clicking video link opens inline player overlay', async ({ page, context }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('http://localhost:3000/#p=meetings/meeting-01/README.md');
  
  // Find first video link
  const videoLink = await page.locator('a[href*=".mp4"]').first();
  await videoLink.click();
  
  // Verify overlay appears with video element
  const overlay = await page.locator('#video-overlay');
  await expect(overlay).toBeVisible();
  
  const videoElement = await page.locator('#video-overlay video');
  await expect(videoElement).toBeVisible();
});
```

**Step 2: Add video overlay HTML template to index.html**

At end of `<main>` section (before `</main>`), add:

```html
<div id="video-overlay" class="hidden fixed inset-0 bg-black/80 z-50 flex flex-col">
  <div class="flex-1 flex items-center justify-center">
    <video id="video-player" controls class="max-w-full max-h-full" style="max-height: 80vh;"></video>
  </div>
  <div class="p-4 bg-black text-white flex justify-between items-center">
    <p id="video-title" class="text-sm">Video</p>
    <button id="video-close-btn" class="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600" aria-label="Close video">✕</button>
  </div>
</div>
```

**Step 3: Implement video player controller in dist/app.js**

Add new function after loadPage():

```javascript
class MobileVideoPlayer {
  constructor() {
    this.overlay = document.getElementById('video-overlay');
    this.video = document.getElementById('video-player');
    this.closeBtn = document.getElementById('video-close-btn');
    this.titleEl = document.getElementById('video-title');
    
    this.closeBtn?.addEventListener('click', () => this.close());
    this.overlay?.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
  }
  
  open(videoFile, title) {
    if (!this.overlay) return; // Desktop, skip
    
    this.titleEl.textContent = title || 'Video';
    this.video.src = videoFile;
    this.overlay.classList.remove('hidden');
    
    // Restore playback position if exists
    const storageKey = `video-${videoFile}`;
    const savedTime = sessionStorage.getItem(storageKey);
    if (savedTime) {
      this.video.currentTime = parseFloat(savedTime);
    }
    
    // Save position on pause/seek
    this.video.addEventListener('pause', () => {
      sessionStorage.setItem(storageKey, this.video.currentTime);
    }, { once: false });
    this.video.addEventListener('seeked', () => {
      sessionStorage.setItem(storageKey, this.video.currentTime);
    });
  }
  
  close() {
    this.overlay?.classList.add('hidden');
    this.video.pause();
  }
}

const mobileVideoPlayer = new MobileVideoPlayer();
```

**Step 4: Intercept video link clicks on mobile**

Update video link click handlers. In renderUpcomingMaterials() and similar functions, wrap video links:

```javascript
// When building HTML for video links:
const videoLink = `<a href="#" class="asset-link video-link" data-file="${videoFile}" data-title="${videoTitle}">
  <span class="icon-pill">🎬</span>
  <span>${videoTitle}${videoDuration}</span>
</a>`;

// Add event delegation:
document.addEventListener('click', (e) => {
  const videoLink = e.target.closest('.video-link');
  if (videoLink) {
    e.preventDefault();
    
    // Only on mobile
    if (window.innerWidth <= 640) {
      const file = videoLink.dataset.file;
      const title = videoLink.dataset.title;
      mobileVideoPlayer.open(file, title);
    } else {
      // Desktop: allow direct link
      window.location.href = videoLink.href;
    }
  }
});
```

**Step 5: Run test to verify overlay appears**

Run: `npm test -- tests/routing.spec.js`
Expected: PASS (overlay visible on mobile)

**Step 6: Test sessionStorage resume**

```javascript
test('mobile video: resumesplayback position after navigation', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:3000/#p=meetings/meeting-01/README.md');
  
  const videoLink = await page.locator('a[href*=".mp4"]').first();
  await videoLink.click();
  
  const video = await page.locator('#video-player');
  
  // Seek to 30s
  await video.evaluate(el => el.currentTime = 30);
  await page.waitForTimeout(500);
  
  // Close overlay
  await page.locator('#video-close-btn').click();
  
  // Reopen same video
  await videoLink.click();
  
  // Verify currentTime restored
  const currentTime = await video.evaluate(el => el.currentTime);
  expect(Math.round(currentTime)).toBe(30); // Allow 1s variance
});
```

**Step 7: Commit**

```bash
git add index.html dist/app.js tests/routing.spec.js
git commit -m "feat: add mobile video player overlay with sessionStorage resume"
```

---

## Task 8: Update asset-compressor Skill (Metadata Extraction + Auto-Update)

**Files:**
- Modify: `asset-compressor/` (main script)
- Create: `asset-compressor/extract-metadata.js` (helper)
- Test: manual verification

**Step 1: Check current asset-compressor structure**

Review `asset-compressor/` directory structure and identify the main compression script.

**Step 2: Write metadata extraction helper**

Create `asset-compressor/extract-metadata.js`:

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function extractMetadata(filePath) {
  try {
    // Get duration via ffprobe
    const ffprobeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1:noprint_filename=1 "${filePath}"`;
    const durationSeconds = parseFloat(execSync(ffprobeCmd, { encoding: 'utf-8' }).trim());
    const duration = Math.round(durationSeconds / 60); // Convert to minutes
    
    // Get file size
    const stats = fs.statSync(filePath);
    const fileSize = Math.round(stats.size / (1024 * 1024)); // Convert to MB
    
    return { duration, fileSize };
  } catch (error) {
    console.error(`Failed to extract metadata for ${filePath}:`, error.message);
    return null;
  }
}

module.exports = { extractMetadata };
```

**Step 3: Update main compression script to extract metadata**

Modify main asset-compressor script to call `extractMetadata()` after compression:

```javascript
const { extractMetadata } = require('./extract-metadata.js');

// After compressing media file:
const metadata = extractMetadata(outputPath);
if (metadata) {
  console.log(`Metadata extracted: ${outputPath} - ${metadata.duration}m, ${metadata.fileSize}MB`);
  
  // Will implement auto-update in next step
  updateManifestWithMetadata(outputPath, metadata);
}
```

**Step 4: Write function to auto-update MEETINGS manifest**

In main script, add:

```javascript
function updateManifestWithMetadata(filePath, metadata) {
  const indexPath = path.join(__dirname, '..', 'index.html');
  let html = fs.readFileSync(indexPath, 'utf-8');
  
  // Find matching entry in MEETINGS array by file path
  // Use regex to find: { file: "path/to/file.m4a", ... }
  // and update duration + fileSize
  
  const filename = path.basename(filePath);
  const pattern = new RegExp(
    `(file:\\s*"[^"]*${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",.*?)(duration:\\s*\\d+,)?\\s*(fileSize:\\s*\\d+,)?`,
    's'
  );
  
  const replacement = `$1duration: ${metadata.duration}, fileSize: ${metadata.fileSize},`;
  const updated = html.replace(pattern, replacement);
  
  if (updated !== html) {
    fs.writeFileSync(indexPath, updated, 'utf-8');
    console.log(`✓ Updated manifest with metadata for ${filename}`);
  } else {
    console.warn(`⚠ Could not find entry for ${filename} in manifest. Add manually.`);
  }
}
```

**Step 5: Test metadata extraction manually**

Run compression script on a test media file, verify metadata extracted + manifest updated.

```bash
node asset-compressor/index.js meetings/meeting-01/video.mp4
```

Expected output: "Updated manifest with metadata for video.mp4"

**Step 6: Commit**

```bash
git add asset-compressor/
git commit -m "feat: enhance asset-compressor to extract + auto-update manifest with media metadata"
```

---

## Task 9: Run Full Test Suite + Polish

**Files:**
- Test: All tests in `tests/`
- Verify: `npm run build:css` runs without errors
- Verify: All persona concerns addressed

**Step 1: Run full test suite**

Run: `npm test`
Expected: All 70+ tests pass (added 4+ new tests)

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

**Commits created:** 9 total
- Task 1: Manifest schema
- Task 2: Metadata rendering
- Task 3: Asset permalinks
- Task 4: Copy-link anchors
- Task 5: Reader affordances
- Task 6: Onboarding
- Task 7: Mobile video player
- Task 8: Asset-compressor enhancement
- Task 9: Polish + tests

**Tests added:** ~6 new tests (metadata display, asset permalinks, video player, Esc hint, tooltips, onboarding)

**Features delivered:**
- ✅ Podcast/video metadata display (duration + fileSize) — Alex, Casey, Sam
- ✅ Asset permalinks (`#asset-TYPE-SLUG`) — Alex
- ✅ Reader affordances (Esc hint + copy-link visibility) — Alex + UX
- ✅ Mobile video player + resume — Casey
- ✅ Onboarding guidance (banner + tooltips) — Marcus
- ✅ Auto-updating manifest via asset-compressor — DX improvement

**Timeline:** ~6–8 hours (with testing + verification)
