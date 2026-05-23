# Implementation Plan: Design Polish & Reader TOC

This plan addresses all requested changes from the design critique, including accessibility, typography, onboarding banner control, and navigation ease of use.

## Proposed Changes

---

### Skip Link & Router Focus Transition

#### [MODIFY] [src/05-reader.js](file:///home/mhenke/Projects/actionable-philosophy-book-club/src/05-reader.js)

We will update the `setView` function to dynamically update the skip link's target depending on the active view. This prevents keyboard/screen-reader users from focusing on hidden elements.

```javascript
function setView(view) {
    const isDashboard = view === 'dashboard';
    dashboard.classList.toggle('hidden-view', !isDashboard);
    reader.classList.toggle('hidden-view', isDashboard);
    
    // Update skip link target dynamically
    const skipLink = document.querySelector('a[href^="#"]');
    if (skipLink) {
        skipLink.setAttribute('href', isDashboard ? '#main-content' : '#markdown-content');
    }
}
```

---

### Typography Styling Tuning

#### [MODIFY] [index.html](file:///home/mhenke/Projects/actionable-philosophy-book-club/index.html)

Update the body `font-family` declaration to prioritize premium neo-grotesque system fonts over generic fallbacks, and tighten header spacing/contrast slightly to enhance the monograph book style.

```css
body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
```

---

### Onboarding Banner Reset Mechanism

#### [MODIFY] [index.html](file:///home/mhenke/Projects/actionable-philosophy-book-club/index.html)

Add a "Reset Welcome Banner" button to the site footer, styled as a subtle, out-of-the-way link using existing design system tokens.

```html
<p class="text-[0.6875rem] font-semibold text-muted">
    Actionable Philosophy Book Club &bull; 2026 &bull; 
    <button id="restore-onboarding" class="hover:text-spectrum-2 transition-colors cursor-pointer inline font-semibold uppercase tracking-wider text-[0.6875rem] ml-1" style="background:none;border:none;padding:0;color:var(--text-muted);">Reset Welcome Banner</button>
</p>
```

#### [MODIFY] [src/10-onboarding.js](file:///home/mhenke/Projects/actionable-philosophy-book-club/src/10-onboarding.js)

Update the onboarding logic to bind a click listener to the new reset button, removing the local storage key and invoking the banner animation + a confirmation toast.

---

### Table of Contents (TOC) with Anchor Links

#### [MODIFY] [src/05-reader.js](file:///home/mhenke/Projects/actionable-philosophy-book-club/src/05-reader.js)

When a document is loaded:
1. Scan for `h2` headings inside the `#markdown-content` container.
2. If two or more `h2` elements are found:
   - Programmatically ensure each has a valid, URL-safe `id`.
   - Build a clean contents nav card.
   - Insert it right below the page's main `h1`.
   - Bind smooth scrolling event listeners to each link to prevent breaking the SPA hash-router.

---

## Verification Plan

### Automated Tests
- Run `npm test` to verify that all 76 E2E routing, XSS, and layout tests continue to pass without regressions.

### Manual Verification
1. Open local preview on mobile and desktop viewports.
2. Verify clicking the skip link in reader view focuses on `#markdown-content` correctly.
3. Dismiss the onboarding banner and click the footer "Reset Welcome Banner" button. Verify the banner is restored at the top of the dashboard and a toast confirms it.
4. Open Meeting 02 and confirm that a Table of Contents is generated at the top of the reader page. Verify that clicking a link smoothly scrolls down to the target section.
