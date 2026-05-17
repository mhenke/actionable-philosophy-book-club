# P1 High Priority Fixes Plan

**Priority:** Fix before next release  
**Estimated effort:** ~4–6 hours total  
**Prerequisite:** P0 fixes complete  
**Source:** `.full-review/05-final-report.md`

> **Note on `dist/app.js`:** Despite the `dist/` prefix, `dist/app.js` is the **canonical source file** — no build step or upstream source exists. It was extracted from an inline `<script>` for CSP compliance and is hand-edited directly.
>
> **Build step reminder:** After any change to `tailwind.config.cjs`, run `npm run build:css` to regenerate `dist/tailwind.css`. After any change to `index.html` or `dist/app.js`, start a dev server (`python3 -m http.server 8000`) and verify in the browser. Run `npm test` before committing.

---

## Fix 1 — Pin GitHub Actions to Commit SHAs [F-02 / CD-02]

**Risk:** CVSS 7.1 supply-chain. The `deploy` job has `id-token: write`; a tag-move attack could publish arbitrary content to the live site.

**File:** `.github/workflows/ci.yml`

### Step 1a — Get current commit SHAs for each action

Requires `gh` CLI with GitHub authentication (`gh auth status`). Alternatively, use the browser:
visit `https://github.com/actions/checkout` and find the commit SHA for the `v6` tag in the tags list.

```bash
# Run these to get the current SHA for each pinned tag:
# (ensure you have a GH token set via `gh auth login` or GITHUB_TOKEN env var)
gh api repos/actions/checkout/git/refs/tags/v6 --jq '.object.sha'
gh api repos/actions/setup-node/git/refs/tags/v6 --jq '.object.sha'
gh api repos/actions/upload-pages-artifact/git/refs/tags/v5 --jq '.object.sha'
gh api repos/actions/deploy-pages/git/refs/tags/v5 --jq '.object.sha'
```

Note: Verify which tag versions actually exist — run `gh api repos/actions/checkout/git/refs --paginate --jq '.[].ref' | grep 'tags/v' | sort -V` to list all tags.

### Step 1b — Replace all tag references with SHAs

Example pattern (replace SHAs with actual values from Step 1a):
```yaml
# Before:
- uses: actions/checkout@v6
# After:
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
```

Apply to all 5 occurrences: lines 17, 20, 162, 169, 174.

### Step 1c — Configure Dependabot to keep SHAs current

**File:** `.github/dependabot.yml` — add to the `github-actions` ecosystem block:
```yaml
- package-ecosystem: "github-actions"
  directory: "/"
  schedule:
    interval: "weekly"
  open-pull-requests-limit: 5
```

Dependabot will auto-propose SHA updates when new versions are tagged.

---

## Fix 2 — Add CI Concurrency Group + Tighten Audit Level [CD-03 / CD-04]

**File:** `.github/workflows/ci.yml`

### Step 2a — Add concurrency group (top of file, after `on:` block)

```yaml
concurrency:
  group: pages-deploy-${{ github.ref }}
  cancel-in-progress: true
```

This ensures only one deploy runs at a time for a given branch. A second push cancels the in-flight deploy.

### Step 2b — Change audit level

**Line:** 116

```yaml
# Before:
run: npm audit --audit-level=high
# After:
run: npm audit --audit-level=moderate
```

---

## Fix 3 — Auto-Inject SW Cache Version from Git SHA [CD-05]

**Problem:** `CACHE = 'v2'` must be manually bumped after every deploy that changes `dist/app.js` or `dist/tailwind.css`. Forgetting means users with an active SW serve stale code until they force-reload.

**File:** `.github/workflows/ci.yml`

### Step 3a — Add a cache-version injection step before artifact assembly

In the deploy job, before the `cp` commands that assemble the artifact:
```yaml
- name: Inject SW cache version
  run: |
    DEPLOY_HASH=$(git rev-parse --short HEAD)
    sed -i "s/const CACHE = .*/const CACHE = '${DEPLOY_HASH}';/" sw.js
```

> **Portability note:** The `sed -i` flag above is the GNU/Linux syntax (no backup extension). On macOS, use `sed -i ''` with an empty backup extension. Since CI runs on `ubuntu-latest`, the GNU syntax is correct for the automation — this step only runs in CI, never on a developer's machine.

This replaces `const CACHE = 'v2'` with `const CACHE = 'abc1234'` (the current commit SHA) on every deploy. The SW version is now deterministic and automatic.

### Step 3b — Remove hardcoded version from `sw.js`

The sed command will handle it, but for clarity change `sw.js:2` from:
```js
const CACHE = 'v2';
```
To a comment that documents the injection:
```js
const CACHE = 'dev'; // replaced at deploy time by ci.yml inject step
```

---

## Fix 4 — Fix `currentFetch` Race Condition [C2 / F-09]

**Problem:** A single global `AbortController` slot is shared between hover-prefetch and reader-load fetches. A hover-then-click sequence can abort the real navigation.

**File:** `dist/app.js`

### Step 4a — Replace the shared `currentFetch` with a dedicated reader controller

Remove:
```js
let currentFetch = null;
```

Add after the `mdCache` declaration:
```js
let activeReaderController = null;
```

### Step 4b — Update `fetchMarkdownCached` signature

```js
function fetchMarkdownCached(path, { isReaderLoad = false } = {}) {
    if (mdCache.has(path)) return mdCache.get(path);

    const controller = new AbortController();

    if (isReaderLoad) {
        if (activeReaderController) activeReaderController.abort();
        activeReaderController = controller;
    }

    if (mdCache.size >= 20) {
        mdCache.delete(mdCache.keys().next().value);
    }

    const promise = fetch(
        'https://raw.githubusercontent.com/mhenke/actionable-philosophy-book-club/main/' + path,
        { signal: controller.signal }
    ).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
    });

    mdCache.set(path, promise);
    promise.catch(() => {
        if (mdCache.get(path) === promise) mdCache.delete(path);
    });
    return promise;
}
```

### Step 4c — Update `loadPage` to pass `isReaderLoad: true`

Find the `fetchMarkdownCached(path)` call inside `loadPage` and change to:
```js
const text = await fetchMarkdownCached(path, { isReaderLoad: true });
```

Prefetch calls (`prefetchMarkdown`) do not change — they pass no flag and do not abort each other.

---

## Fix 5 — Fix Video Player Listener Leak [H5]

**Problem:** The `keydown` vpEsc listener registered inside `openVideoPlayer` is only self-removed when the user presses Escape. Closing via the close button leaves the listener registered. 10 opens via close button = 10 zombie listeners.

**File:** `dist/app.js`

### Step 5a — Add a cleanup tracker

Before the `openVideoPlayer` function definition, add:
```js
let videoPlayerCleanup = null;
```

### Step 5b — Call cleanup at the start of every `openVideoPlayer` call

At the top of `openVideoPlayer`:
```js
function openVideoPlayer(filePath, label) {
    if (videoPlayerCleanup) {
        videoPlayerCleanup();
        videoPlayerCleanup = null;
    }
    // ... rest of function
```

### Step 5c — Build the cleanup function before attaching listeners

Replace the current scattered listener setup with:
```js
    // At the point where interval and listeners are set up:
    const vpInterval = setInterval(saveProgress, 3000);
    const vpKeydown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', vpKeydown);

    videoPlayerCleanup = () => {
        clearInterval(vpInterval);
        document.removeEventListener('keydown', vpKeydown);
        videoPlayerCleanup = null;
    };

    function onClose() {
        saveProgress();
        video.pause();
        video.removeAttribute('src');
        video.load();
        overlay.classList.remove('vp--open');
        if (videoPlayerCleanup) videoPlayerCleanup();
    }
```

### Step 5d — Remove the old `vpEsc` self-removing listener pattern

Delete the existing `document.addEventListener('keydown', function vpEsc(e) { ... })` block — it is replaced by the tracked `vpKeydown` listener above.

---

## Fix 6 — Remove Blocking HEAD Request from Media Click Path [P-01]

**Problem:** Every `.mp4` / `.pptx` click awaits a HEAD request before doing anything visible. 100–400 ms delay on LTE; 500–1500 ms on 3G. The target persona is mobile users.

**File:** `dist/app.js`

### Step 6a — Remove the availability check from the click handler

Find the click handler in `setupAssetClickDelegation`. Remove or comment out:
```js
// DELETE these lines:
const available = await checkAssetAvailable(href);
if (!available) {
    showToast('This file is not available yet. Materials appear closer to the meeting date.');
    return;
}
```

### Step 6b — Add error handling to the video player instead

In `openVideoPlayer`, after `video.src = filePath`:
```js
video.addEventListener('error', () => {
    onClose();
    showToast('This file is not available yet. Materials appear closer to the meeting date.');
}, { once: true });
```

### Step 6c — Handle non-video asset failures

For `.pptx` assets that open via `window.location.href`, the browser's native 404/error page handles the failure adequately. No additional handling needed.

### Step 6d — Keep `checkAssetAvailable` for now

Leave the function definition in place — it may be useful for future use. Just remove the call from the click handler hot path.

---

## Fix 7 — Migrate Video Overlay to Native `<dialog>` [BP-09 / BP-10]

**Problem:** The current `<div role="dialog">` has no focus trap (WCAG 2.1 SC 2.1.2 violation). Native `<dialog>` provides built-in focus trapping, top-layer stacking, native Escape handling, and `::backdrop` pseudo-element.

### Step 7a — Update `index.html`

**File:** `index.html` — find the video player overlay `<div>`:
```html
<div id="video-player-overlay" role="dialog" aria-modal="true" ...>
```

Change to:
```html
<dialog id="video-player-overlay" aria-label="Video player">
```

Remove the closing `</div>` tag and replace with `</dialog>`.

Remove the `::backdrop` or fixed-position overlay styles from the inline `<style>` block — the native `<dialog>` provides `::backdrop` via CSS:
```css
#video-player-overlay::backdrop {
    background: rgba(0, 0, 0, 0.85);
}
```

### Step 7b — Update `openVideoPlayer` in `dist/app.js`

Replace class toggle open/close with native API:
```js
// Open:
overlay.showModal();   // replaces: overlay.classList.add('vp--open')

// Close (in onClose):
overlay.close();       // replaces: overlay.classList.remove('vp--open')
```

### Step 7c — Remove manual Escape listener

The `<dialog>` element fires a `cancel` event on Escape natively. Replace the `keydown` vpEsc listener with:
```js
overlay.addEventListener('cancel', (e) => {
    e.preventDefault();  // prevent default close so onClose() handles cleanup
    onClose();
});
```

This also resolves the listener leak (Fix 5) for the Escape path — the `cancel` event is on the element, not a document-level listener.

### Step 7d — Test

Start a dev server if not already running:
```bash
python3 -m http.server 8000
```

- Open `http://localhost:8000` in a browser.
- Click a video asset link. Confirm the overlay appears via native `<dialog>`.
- Press Tab. Confirm focus stays within the overlay (native focus trap).
- Press Escape. Confirm the overlay closes cleanly.
- Click the close button. Confirm cleanup runs (no console errors).
- Re-open. Confirm no stale state from prior session.

---

## Fix 8 — Rename `tailwind.config.js` → `tailwind.config.cjs` [BP-04]

**Problem:** `package.json` declares `"type": "module"`, making all `.js` files ESM. `tailwind.config.js` uses `module.exports` (CJS syntax). Works today due to Tailwind v3 CLI quirk, but will break on tooling upgrades.

### Step 8a — Rename the file

```bash
git mv tailwind.config.js tailwind.config.cjs
```

### Step 8b — Update `package.json` build script

**File:** `package.json`

Tailwind CLI auto-discovers `tailwind.config.cjs` — no explicit flag needed. However, verify:
```bash
npm run build:css
```

If it fails to find the config, add `--config tailwind.config.cjs` to the build script.

### Step 8c — Verify CI

The CI Tailwind freshness check should continue to pass since it runs `npm run build:css`.

---

## Fix 9 — Remove `document.execCommand('copy')` Fallback [BP-02]

**File:** `dist/app.js`

### Step 9a — Find the copy-link handler

Look for the `document.execCommand('copy')` call (around line 785).

### Step 9b — Replace with a graceful toast fallback

```js
// Before (schematic):
navigator.clipboard.writeText(url).then(() => {
    showToast('Link copied!');
}).catch(() => {
    // deprecated fallback:
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
});

// After:
navigator.clipboard.writeText(url)
    .then(() => showToast('Link copied!'))
    .catch(() => showToast('Copy failed — ' + url));
```

---

## Fix 10 — Upgrade `marked` to Current Version [F-05]

**Current:** `marked@5.1.2` (July 2023, 10 major versions behind)  
**Target:** `marked@15.x` (2025)

### Step 10a — Check the jsDelivr URL for the latest build

```
https://cdn.jsdelivr.net/npm/marked@15/marked.min.js
```

### Step 10b — Generate a new SRI hash

```bash
curl -sL https://cdn.jsdelivr.net/npm/marked@15/marked.min.js | \
  openssl dgst -sha384 -binary | openssl base64 -A
```

### Step 10c — Update `index.html`

**File:** `index.html:18`

```html
<!-- Before: -->
<script defer
  src="https://cdn.jsdelivr.net/npm/marked@5.1.2/marked.min.js"
  integrity="sha384-..."
  crossorigin="anonymous"></script>

<!-- After: -->
<script defer
  src="https://cdn.jsdelivr.net/npm/marked@15/marked.min.js"
  integrity="sha384-<NEW_HASH>"
  crossorigin="anonymous"></script>
```

### Step 10d — Fix `marked.use()` call

**File:** `dist/app.js:818`

```js
// Before (dead options):
marked.use({ gfm: true, breaks: true, headerIds: false, mangle: false });

// After:
marked.use({ gfm: true, breaks: true });
```

### Step 10e — Check for async `parse()` API change

In `marked@14+`, `marked.parse()` can return a `Promise<string>` if async extensions are used. The current usage at `dist/app.js:414` is:
```js
const sanitized = DOMPurify.sanitize(marked.parse(text), {...});
```

Test this: if `marked.parse(text)` returns a Promise in v15 by default, wrap with `await`. If it still returns a string synchronously by default (it should for simple GFM), no change needed.

### Step 10f — Update CI SRI verification

**File:** `.github/workflows/ci.yml` — the SRI verification job (lines 77–97) downloads the CDN script and compares the hash against what's in `index.html`. After updating `index.html`, the CI check will automatically verify the new hash is correct on the next run.

---

## Verification Checklist

- [ ] `grep -c "actions/checkout@v" .github/workflows/ci.yml` returns 0 (all pinned to SHAs)
- [ ] `grep "concurrency" .github/workflows/ci.yml` shows concurrency block
- [ ] `grep "audit-level" .github/workflows/ci.yml` shows `moderate`
- [ ] `grep "CACHE" sw.js` shows `dev` or commit SHA (not `v2`)
- [ ] `grep "currentFetch" dist/app.js` returns 0 results
- [ ] `grep "execCommand" dist/app.js` returns 0 results
- [ ] `grep "marked@5" index.html` returns 0 results
- [ ] `grep "headerIds\|mangle" dist/app.js` returns 0 results
- [ ] `ls tailwind.config.cjs` succeeds; `ls tailwind.config.js` fails
- [ ] `npm test` passes
- [ ] `npm run build:css` succeeds
- [ ] CI passes end-to-end
- [ ] Video player: Tab key stays within overlay
- [ ] Video player: Escape closes cleanly with no console errors
- [ ] Media click: video opens immediately (no 100-400 ms pause before overlay appears)
