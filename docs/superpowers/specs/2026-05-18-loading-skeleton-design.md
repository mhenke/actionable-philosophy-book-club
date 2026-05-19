# Loading Skeleton Design

Date: 2026-05-18

## Goal

Replace the empty-container flash on dashboard refresh and the plain "Loading session notes…" text in the reader with structural skeleton states that mirror the real page layout. Skeletons render immediately; real content swaps in-place when data arrives.

## Approach

JS-injected skeletons (Option 1). Each skeleton is a function that writes HTML into the existing containers before async work begins. The existing render functions already overwrite `innerHTML`, so no explicit skeleton teardown is needed — real content replaces the skeleton automatically.

## Architecture

**Files changed:**

| File | Change |
|---|---|
| `index.html` | Add `.sk-block` CSS for skeleton shimmer shapes |
| `src/04-dashboard.js` | Add `renderDashboardSkeleton()` |
| `src/05-reader.js` | Replace simple loading text in `loadPage()` with article-outline skeleton |
| `src/06-app.js` | Call `renderDashboardSkeleton()` before `await loadManifest()` |

All source edits go in `src/`. Rebuild `dist/app.js` with `npm run build:js` after each task.

## CSS

One new rule block in `index.html` `<style>`:

```css
.sk-block {
    background: var(--wash-2);
    border-radius: 3px;
    animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}
```

Skeleton elements use `.sk-block` with inline `height` and `width`/`max-width` to approximate real content proportions. No new Tailwind classes needed — layout uses existing utility classes.

## Dashboard Skeleton

`renderDashboardSkeleton()` in `src/04-dashboard.js` writes placeholder HTML into the five containers populated by the real render functions. Called once, before `loadManifest()`.

**Upcoming card** (`#upcoming-card-header`, `#upcoming-materials-container`, `#upcoming-key-takeaway`, `#upcoming-cta`, `#upcoming-podcasts`):
- Header: session-line stub (short sk-block) + title stub (taller sk-block)
- Materials: two asset-row-height sk-blocks
- Key takeaway: a bordered box with two line stubs
- CTA: a full-width button-height sk-block
- Podcasts: a single disclosure-height sk-block

**Horizon and archive** (`#horizon-cards-container`, `#archive-cards-container`):
- Two card-shaped sk-blocks each, matching approximate card height (`160px`)

**KB tiles** (`section[aria-labelledby="section-kb"]` grid):
- KB tiles are static HTML in `index.html` — no skeleton needed; they are always present.

The function is intentionally minimal: it populates only the containers that are otherwise empty during the manifest fetch window. It does not recreate the full card chrome.

## Reader Skeleton

In `loadPage()` in `src/05-reader.js`, replace:

```js
content.innerHTML = '<div class="py-12 text-center text-sm uppercase tracking-widest text-muted animate-pulse">Loading session notes&hellip;</div>';
```

with a structural article outline:

```html
<div class="reader-skeleton py-8 space-y-6" aria-hidden="true">
  <!-- title -->
  <div class="sk-block" style="height:2rem; max-width:60%"></div>
  <!-- metadata line -->
  <div class="sk-block" style="height:0.75rem; max-width:30%"></div>
  <!-- paragraph block -->
  <div class="space-y-2">
    <div class="sk-block" style="height:0.75rem"></div>
    <div class="sk-block" style="height:0.75rem; max-width:85%"></div>
    <div class="sk-block" style="height:0.75rem; max-width:70%"></div>
  </div>
  <!-- section heading -->
  <div class="sk-block" style="height:1.25rem; max-width:45%"></div>
  <!-- paragraph block -->
  <div class="space-y-2">
    <div class="sk-block" style="height:0.75rem"></div>
    <div class="sk-block" style="height:0.75rem; max-width:90%"></div>
    <div class="sk-block" style="height:0.75rem; max-width:60%"></div>
  </div>
  <!-- list stubs -->
  <div class="space-y-2 pl-4">
    <div class="sk-block" style="height:0.75rem; max-width:55%"></div>
    <div class="sk-block" style="height:0.75rem; max-width:65%"></div>
    <div class="sk-block" style="height:0.75rem; max-width:50%"></div>
  </div>
</div>
```

`aria-hidden="true"` prevents screen readers from announcing skeleton content. The `.reader-skeleton` class adds `space-y-6` layout; `.sk-block` provides the shimmer.

## Data Flow

```
page load
  └─ renderDashboardSkeleton()        ← skeleton visible
      └─ await loadManifest()
          └─ renderUpcomingMaterials() ← overwrites skeleton
          └─ renderArchiveCards()      ← overwrites skeleton
          └─ renderHorizonCards()      ← overwrites skeleton

reader route (#p=...)
  └─ loadPage(path)
      └─ content.innerHTML = skeleton  ← skeleton visible
          └─ await fetchMarkdownCached()
              └─ content.innerHTML = sanitized  ← overwrites skeleton
```

## Error Handling

- If `loadManifest()` throws, `showManifestError()` runs. It writes into the same containers the skeleton populated — existing behavior preserved, no extra handling needed.
- If `loadPage()` throws, the catch block writes the error/retry UI into `content` — same as today. The skeleton is already gone because `innerHTML` assignment is the first thing in the `try`.
- Skeleton is never visible alongside an error state.

## Testing

Add to `tests/manifest-rendering.spec.js`:
- Assert that before manifest loads, `#upcoming-materials-container` contains `.sk-block` elements.
- Assert that after manifest loads, `.sk-block` elements are gone from the dashboard.

Add to `tests/routing.spec.js`:
- Assert that `#markdown-content` contains `.reader-skeleton` while the markdown fetch is in-flight.
- Assert that `.reader-skeleton` is gone after content loads.

Both tests use `page.route()` to delay or intercept the relevant fetch so the skeleton is observable.

## Out of Scope

- Skeleton for the KB tiles section (static HTML, always visible)
- Animated skeleton transitions (swap is instant; adding a cross-fade is not worth the complexity)
- Service worker / offline caching (separate concern)
