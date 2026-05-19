# Loading Flash and Layout Shift Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate visible layout shifts and white flashes during initial page load and reader navigation.

**Architecture:** Five independent CSS + JS changes across `index.html`, `src/05-reader.js`, and `src/06-app.js`. Each fix is self-contained and testable independently.

**Tech Stack:** Vanilla CSS, Vanilla JS, Playwright.

---

### Task 1: Add container min-heights to prevent empty-container snap

**Files:**
- Modify: `index.html` (CSS block, after the `.podcast-disclosure summary::-webkit-details-marker` rule)

- [ ] **Step 1: Add min-height CSS rules**

In `index.html`, add after the podcast disclosure rules (around line 383):

```css
        /* Layout shift prevention — reserve space before JS populates containers */
        .card:has(#upcoming-materials-container) {
            min-height: 120px;
        }
        #horizon-cards-container,
        #archive-cards-container {
            min-height: 80px;
        }
```

- [ ] **Step 2: Verify CSS added correctly**

Run: `grep -n "min-height" index.html`
Expected: 3 new min-height rules present

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: all 72 tests pass

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "fix: reserve container min-heights to prevent layout snap on load"
```

---

### Task 2: Remove reader content-swap opacity dance

**Files:**
- Modify: `src/05-reader.js`

- [ ] **Step 1: Read the current loadPage function**

Read `src/05-reader.js` lines 150-225. Find the opacity transition block starting with `content.style.transition = 'none'`.

- [ ] **Step 2: Remove the opacity dance**

Replace this block in `loadPage()`:

```js
                // Cut to invisible, swap content, then fade in — avoids mid-transition content swap flash
                content.style.transition = 'none';
                content.style.opacity = '0';
                content.innerHTML = sanitized;
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    content.style.transition = 'opacity 200ms ease';
                    content.style.opacity = '1';
                }));
```

with:

```js
                content.innerHTML = sanitized;
```

The `await new Promise(requestAnimationFrame)` on line 165 already ensures the loading pulse paints before the fetch. The direct innerHTML replacement paints in one frame.

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: all 72 tests pass

- [ ] **Step 4: Commit**

```bash
git add src/05-reader.js
git commit -m "fix: remove content-swap opacity dance, swap directly"
```

---

### Task 3: Keep footer visible in reader view

**Files:**
- Modify: `src/05-reader.js`

- [ ] **Step 1: Remove footer toggle from setView**

In `setView()` in `src/05-reader.js`, find and remove these two lines:

```js
            const footer = document.getElementById('site-footer');
            if (footer) footer.classList.toggle('hidden', !isDashboard);
```

The function should become:

```js
        function setView(view) {
            const isDashboard = view === 'dashboard';
            dashboard.classList.toggle('hidden-view', !isDashboard);
            reader.classList.toggle('hidden-view', isDashboard);
        }
```

- [ ] **Step 2: Run tests**

Run: `npm test`
Expected: all 72 tests pass

- [ ] **Step 3: Commit**

```bash
git add src/05-reader.js
git commit -m "fix: keep footer visible during reader view"
```

---

### Task 4: Add aspect-ratio placeholder for reader images without dimensions

**Files:**
- Modify: `index.html` (CSS block)

- [ ] **Step 1: Add aspect-ratio CSS**

In `index.html`, add after the `#markdown-content` CSS block:

```css
        #markdown-content img:not([width]) {
            aspect-ratio: 16 / 9;
            background: var(--wash-2);
            border-radius: 4px;
        }
```

- [ ] **Step 2: Run tests**

Run: `npm test`
Expected: all 72 tests pass

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "fix: add aspect-ratio placeholder for un-dimensioned reader images"
```

---

### Task 5: Apply reader theme color before content renders

**Files:**
- Modify: `src/06-app.js`

- [ ] **Step 1: Read the current handleRoute function**

Read `src/06-app.js`, find `handleRoute()`.

- [ ] **Step 2: Add theme pre-application**

In `handleRoute()`, before `loadPage(path, anchorId)`, extract the meeting from `MEETINGS` and apply the theme:

```js
        function handleRoute() {
            const hash = window.location.hash;
            if (!hash || !hash.startsWith('#p=')) {
                showDashboard();
                return;
            }
            const value = hash.slice(3);
            const anchorIdx = value.indexOf('#');
            const path = anchorIdx >= 0 ? value.slice(0, anchorIdx) : value;
            const anchorId = anchorIdx >= 0 ? value.slice(anchorIdx + 1) : null;

            if (path && isSafeRepoPath(path)) {
                const meeting = MEETINGS.find(m => path.startsWith('meetings/' + m.id));
                if (meeting) updateReaderTheme(meeting.id);
                loadPage(path, anchorId);
            } else {
                showDashboard();
            }
        }
```

- [ ] **Step 3: Rebuild and run tests**

```bash
npm run build:js && npm test
```
Expected: all 72 tests pass

- [ ] **Step 4: Commit**

```bash
git add src/06-app.js dist/app.js
git commit -m "fix: apply reader theme before content renders"
```

---

### Task 6: Full verification

**Files:**
- None

- [ ] **Step 1: Run the full test suite**

```bash
npm test
```
Expected: all 72 tests pass

- [ ] **Step 2: Verify clean working tree**

```bash
git status
```
Expected: no unstaged files beyond pre-existing modifications (ci.yml, .gitignore, SECURITY.md, etc.)

- [ ] **Step 3: Spot-check the dashboard load**

```bash
python3 -m http.server 8000
```
Open `http://127.0.0.1:8000/` — dashboard containers should not snap from 0px.
Navigate to `#p=meetings/meeting-02/README.md` — no white flash on content swap.
Footer should be visible in reader view.
