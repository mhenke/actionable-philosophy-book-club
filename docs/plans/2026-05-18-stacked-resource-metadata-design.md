Title: Stacked metadata for resource rows — Design
Date: 2026-05-18

Overview

Goal: Move duration and file size metadata out of the inline label line into a dedicated `.asset-meta` line above the caption/description, reducing horizontal squeeze and improving readability across all resource asset rows (canonical video, slides, podcasts).

Decision

Implementation approved: Approach A — Extend existing stacked pattern.

Why
- Surgical change: podcast rows already use `.asset-link--stacked` with `.asset-link-top` + `.podcast-caption`. Adding `.asset-meta` between them is minimal.
- Unifies layout: canonical video and slides currently use flat `.asset-link`. Converting them to `.asset-link--stacked` + `.asset-meta` gives all resource rows the same vertical rhythm.
- Low test risk: only adds a new DOM element; existing attribute structure (data-canonical, data-testid, data-alternate, aria-labels) is unchanged.

Design details

Target DOM for canonical video/slides (converted from flat to stacked):

    <a href="..." class="asset-link asset-link--stacked" aria-label="...">
        <span class="asset-link-top">
            <span class="icon-pill" ...>🎬</span>
            Video Primer
        </span>
        <span class="asset-meta">3m 9s · 31 MB</span>
    </a>

Target DOM for podcasts (metadata moved out of asset-link-top):

    <span class="asset-link-top">
        <span class="icon-pill" ...>🔬</span>
        Why Clean Code Rots...
        <span class="podcast-badge" ...>Deep Dive</span>
    </span>
    <span class="asset-meta">18m 13s · 17 MB</span>
    <span class="podcast-caption">A two-host exploration...</span>

CSS addition in index.html (~8 lines):

    .asset-meta {
        font-size: 0.6875rem;
        font-weight: 400;
        color: var(--text-muted);
        padding-left: 2.5rem;
    }

JS changes in buildAssetRows():

- Canonical video block: remove inline meta span from label, add .asset-meta element after .asset-link-top
- Slides block: same treatment
- Podcast block: move metadata out of .asset-link-top into a new .asset-meta element between .asset-link-top and .podcast-caption
- If no duration and no fileSize, omit .asset-meta entirely

The aria-labels remain unchanged — duration/size are already present in the aria-label strings.

Edge cases

- Missing duration for a video → only file size shown in .asset-meta (e.g., slides)
- Missing fileSize → only duration shown
- Both missing → .asset-meta omitted (no empty placeholder line)
- Slides have no caption → .asset-meta is the last child inside the link
- Videos have no caption → same

Acceptance criteria

- Visual: resource rows show label/badge on line 1, duration·size metadata on a separate indented line 2 (above caption if present), download button stays right-aligned
- No visible change to icon, badge, caption, or download button styling
- Metadata font size/color matches current: 11px, text-muted
- Missing metadata values gracefully produce no .asset-meta element

Testing

- Existing Playwright tests should still pass (aria-labels, data attributes, row structure unchanged in attributes)
- Add a test for .asset-meta element existence in rendered output
- Run npm test and tests/check-links.sh

If approved, the next step is to generate a granular implementation plan with tasks (writing-plans).
