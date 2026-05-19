Title: Loading flash and layout shift fixes — Design
Date: 2026-05-18

Overview

Goal: Eliminate visible layout shifts and white flashes during initial page load and
reader navigation across five identified sources.

Identified flash sources

1. Empty container snap  — dashboard containers start 0px, snap when manifest loads
2. Reader white flash   — opacity 0 → swap → fade in creates blank frame
3. Footer jump          — footer hidden in reader view, changing viewport height
4. Image layout shift   — reader images without dimensions load lazily
5. Theme color snap     — reader border color changes after content appears

Design decisions per fix

Fix 1: Container min-heights

CSS additions in index.html:

    .card:has(#upcoming-materials-container) {
        min-height: 120px;
    }
    #horizon-cards-container,
    #archive-cards-container {
        min-height: 80px;
    }

The .card selector uses :has() to target only the upcoming card (the one containing
the materials container). The 120px accounts for card header + one asset row + padding
— enough to prevent a full collapse without wasting space. Archive/horizon grids get
80px which is roughly one card row.

Fix 2: Remove content swap opacity dance

In src/05-reader.js, remove the double-rAF opacity transition pattern:

    content.innerHTML = sanitized;
    // Remove: content.style.transition = 'none';
    // Remove: content.style.opacity = '0';
    // Remove: requestAnimationFrame → rAF → transition → opacity = '1'

Replace with direct innerHTML assignment (keep the await new
Promise(requestAnimationFrame) that was added from the visual-polish-ux work
to ensure the loading pulse paints before the fetch starts).

Fix 3: Keep footer visible always

In src/05-reader.js setView(), remove the footer toggle:

    // Remove: const footer = document.getElementById('site-footer');
    // Remove: if (footer) footer.classList.toggle('hidden', !isDashboard);

The footer stays visible in both dashboard and reader views.

Fix 4: Aspect-ratio placeholder for reader images

CSS addition in index.html:

    #markdown-content img:not([width]) {
        aspect-ratio: 16 / 9;
        background: var(--wash-2);
        border-radius: 4px;
    }

Images in reader content that lack explicit dimensions get a placeholder aspect
ratio to prevent layout shift when they load. Only targets images without [width].

Fix 5: Apply theme color before reader renders

In src/06-app.js handleRoute(), extract meetingId from the path and call
updateReaderTheme() before loadPage(). The meeting color is in place when the
reader first appears.

    function handleRoute() {
        ...
        if (path && isSafeRepoPath(path)) {
            const meeting = MEETINGS.find(m => path.startsWith(m.id));
            if (meeting) updateReaderTheme(meeting.id);
            loadPage(path, anchorId);
        } else {
            showDashboard();
        }
    }

Edge cases

- Fix 1 :has() — :has() is supported in all modern browsers (Chrome 105+, Firefox
  121+, Safari 15.4+). No polyfill needed. Falls back to no min-height on older
  browsers (same as current behavior).
- Fix 2: Without the opacity dance, the content swap is instant. The 200ms fade
  was originally added to mask async rendering — the rAF yield already solved
  that.
- Fix 3: Footer visible in reader may overlap content on very short screens.
  Reader content has min-height: calc(100vh - 14rem) which leaves room.
- Fix 5: handleRoute is also called when the hash changes. Each hash change
  will re-apply the theme.

Testing

- npm test — all 72 tests must pass
- Manual spot-check: reload dashboard, observe no snap. Navigate to reader,
  observe no white flash. Reader images without dimensions should have
  placeholder.
