# Design Spec: Alternate Asset UI Fix

**Date:** 2026-05-16
**Status:** Approved
**Objective:** Fix the layout breakage where alternate media assets (like alternate videos) wrap into two rows on mobile devices, and standardize the labeling.

## 1. UI Changes (`index.html`)

### 1.1 Rendering Logic (`renderUpcomingMaterials` and `renderArchiveCards`)
Currently, alternates are wrapped in a `div` with `display: inline-block`, causing the inner `flex` elements (link and download button) to stack vertically.

*   **Change:** Convert the wrapper `div` to `display: flex`.
*   **Change:** Prepend the category icon (🎬 for video, 🎙 for audio) to match the canonical rows.
*   **Change:** Shorten the default alternate label from "Video Recap (Alternate)" to "**Video Recap Alt**".

**Old Logic (Simplified):**
```html
<div style="display:inline-block;margin-right:0.75rem;">
    <a href="..." class="asset-link">${a.label}</a>
    <a href="..." class="asset-dl">${dlIcon}</a>
</div>
```

**New Logic (Simplified):**
```html
<div class="flex items-center gap-2">
    <a href="..." class="asset-link">
        <span class="icon-pill" style="background: var(--wash-3-border);">${icon}</span>
        Video Recap Alt
    </a>
    <a href="..." class="asset-dl">${dlIcon}</a>
</div>
```

## 2. Documentation Updates

### 2.1 `CONTRIBUTING.md`
*   Update the example JSON snippet to use the `label: 'Video Recap Alt'` convention.
*   Mention that alternates should use the `Alt` suffix rather than the full `(Alternate)` parenthetical.

### 2.2 `docs/content-contract.md`
*   Update any examples referencing alternate assets to use the new "Video Recap Alt" label.

### 2.3 `docs/superpowers/specs/2026-05-16-podcasts-resources-display-design.md`
*   Update the "Data Model" and "UI Display" sections to reflect the "Alt" suffix and the flex-row layout.

## 3. Constraints
*   Maintain the "Zero Pipeline" mandate—no external dependencies or build steps.
*   Ensure ARIA labels remain descriptive (e.g., `aria-label="Download alternate video recap"`).

## 4. Verification Plan
1.  **Mobile Viewport Check:** Use Playwright or manual dev tools to verify that alternate rows fit on a 375px wide screen without wrapping.
2.  **Visual Audit:** Ensure icons for alternates align horizontally with the labels and download buttons.
