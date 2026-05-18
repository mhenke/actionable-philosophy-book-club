# Design

## Aesthetic Vision: The APoSD Identity
The interface is a literal digital extension of the "A Philosophy of Software Design" physical book cover. It targets a "technical but human" feel, prioritizing functional minimalism and high-precision Swiss/International Style design.

## Physical Scene
A clean, well-lit monograph reader or engineering notebook. Both the dashboard and reader should feel like the same premium printed object — the mode changes (navigation vs reading), the visual system does not.

## Colors

### Core Surfaces
- **Background (Near White):** `#F7F7F7` — Primary cover background.
- **Banner (Dark Charcoal):** `#222222` — Used for the title bar/header.
- **Title/Banner Text:** `#FFFFFF` — Pure white on charcoal.
- **Text Primary:** `#222222` — High-contrast charcoal for body/headings.
- **Text Muted:** `#545454` — Dark gray, compliant with WCAG AA (5.8:1 ratio).

### The Loops Spectrum (Accents)
A muted blue → teal → sage green gradient spectrum on white.
- **Deep Navy:** `#1A3A5C` (`--spectrum-1`, Darkest)
- **Medium Blue:** `#2B6CB0` (`--spectrum-2`, primary action and highlight color)
- **Steel Blue:** `#4BA3C7` (`--spectrum-3`)
- **Teal:** `#48BDB8` (`--spectrum-4`)
- **Seafoam:** `#72C9A8` (`--spectrum-5`)
- **Light Sage:** `#A8D8B9` (`--spectrum-6`, Lightest)

### Wash Tokens
Spectrum-tinted surface overlays used for highlighted content. All highlighted surfaces (Key Takeaway box, blockquotes, Knowledge Base tiles) use `--wash-2` / `--wash-2-border` (spectrum-2) to share the same visual DNA.

Implementation note: Define the spectrum color tokens as CSS variables in :root (e.g., `--spectrum-1`..`--spectrum-6`) and reference them in styles via `var(--spectrum-N)`. Do not hardcode hex values in runtime styles; keep hex values documented here only and use variables in source files.

## Typography

### Scale
- **Section heading (h1 in prose):** 1.5rem mobile / 1.875rem desktop — matches the dashboard card heading scale (`text-2xl md:text-3xl`).
- **Section label (h2 in prose, section headers on dashboard):** 0.8125rem (prose) / 0.625rem (dashboard), both uppercase with `letter-spacing: 0.2em`.
- **Sub-section heading (h3 in prose):** 1rem, spectrum-1 color. No border — margin-top separation only.
- **Body text (prose paragraphs):** 1.0625rem, line-height 1.7, text-muted color.
- **UI text (asset links, buttons):** 0.875rem, text-primary color.
- **Small labels (archive metadata, KB tiles, badges):** 0.6875rem, uppercase, `letter-spacing: 0.2em`.

### Tracking Scale
Three intentional levels — no other values:
- **Tight:** `-0.04em` — Banner title, display headings.
- **Standard:** `-0.025em` to `0` — Card headings, body.
- **Label:** `0.2em` — All uppercase small labels (section headers, metadata, badges, prose h2).

Section divider labels use `0.35em` (wider than label, emphasizes hierarchy).

### Typeface
System font stack: `ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Arial, 'Noto Sans', 'Liberation Sans', sans-serif`. Zero-latency rendering. File tree panels use `'Courier New', 'Consolas', monospace`.

## Layout & Components

### Both Views — Identical Structure
Dashboard and reader use the same header structure, same container constraints, and same token vocabulary. The visual system does not change between modes.

- **Content container:** `max-w-6xl mx-auto` with `p-5 md:p-10 lg:px-16` horizontal padding — identical on both pages. Prose article fills this container; line-length is capped at 75ch for optimal legibility (see GEMINI.md).
- **The Banner Bar:** Dark charcoal anchor, `max-w-6xl` constrained inner content aligned to the main container.
- **The Spectrum Bar:** 6px linear gradient (Navy to Sage), always full gradient on both views.
- **Section Dividers:** `.spectrum-rule` — same 6-stop spectrum gradient as the header bar, `max-width: 240px`, fading to transparent. Appears next to section heading labels on the dashboard.
- **Borders:** All surface borders use `--border-low` (`rgb(34 34 34 / 0.06)`) — card edges, file tree panel. One consistent weight.
- **Highlighted content (blockquotes, Key Takeaway on dashboard):** `--wash-1` background / `--border-low` border — near-neutral tint so the highlight does not compete with the primary CTA. Prose blockquotes in the reader use `--wash-2` / `--wash-2-border` (stronger tint is appropriate in a reading context).
- **Material Cards:** Flat white, `--border-low` border, hover triggers `translateY(-2px)` + spectrum-3 shadow.

### Reader-Specific
- **Prose h2:** No border. Section separation via `margin-top: 3.5rem` (56px) only. Uppercase tracked label is the visual anchor. See ADR-0011.
- **Prose h3:** No border. Separation via `margin-top: 2rem` only. Spectrum-1 color and font weight distinguish h3 from body text without a divider line.
- **Reader header label:** Updates dynamically to reflect the document's H1 on each load; resets to "Session Notes" on dashboard return.
- Prose links are underlined — reading context convention.
- Prose body text is larger (1.0625rem) than UI text (0.875rem) — intentional mode signal.
- **File tree (Meeting Materials):** Monospace panel, `line-height: 1.5`. Tree connectors in spectrum-3. Folder nodes (`.tree-folder`) get `font-weight: 600`, `text-primary` color — structural, not navigation targets. File nodes (`.tree-file`) get `font-weight: 400`, `spectrum-2` color — actionable. `renderFileTree()` tags each `li` with the appropriate class based on whether it has a child `ul`.

### Dashboard Card Conventions

**Content order within every meeting card** (upcoming and archive):
1. Primary assets (video, slides)
2. Resource thumbnails (PNG strip)
3. Meeting Notes CTA / link
4. Additional Resources (podcast disclosure)

This order is consistent across card types. The upcoming card uses the same sequence as archive cards. Meeting Notes has no `mt-auto` — it sits naturally after the last content item. Do not add vertical pushing; it causes misalignment in the grid when cards have differing amounts of content below Meeting Notes.

**Session / date metadata:** Rendered as two visually distinct elements within a single line. Session identifier (`Meeting NN`) uses `font-semibold` at `text-primary` color. Date uses `font-normal` at `text-muted` color. Never concatenated into a single styled span.

**Date format:** `DD Mon YYYY` (e.g., `13 May 2026`). 4-digit year required — 2-digit year is ambiguous alongside day numbers.

**Status badges:**
- **Upcoming:** Outline style, `spectrum-2` border and color.
- **Done:** Outline style, `text-muted` border and color. Not filled — "Done" is archival context, not an action requiring emphasis.
- **Planned** (Coming Up cards): Outline style, `text-muted` border and color.

**Podcast disclosure chevron:** `spectrum-2` color in both open and closed states. Matches the summary label color for visual consistency.

**Section visibility:** The "Coming Up" section is hidden entirely when no `draft` meetings exist in the manifest. Never render a section heading above an empty container.

### Dashboard Spacing Model

No `space-y` utility on `<main>`. Spacing is explicit:
- **Upcoming card:** no top margin — sits at the container's padding distance from the header (20px mobile, 40px desktop via `p-5`/`md:p-10`).
- **Horizon, Archive, Knowledge Base sections:** `mt-14` (56px) — intentional section separation. Each section `<h2>` label also has `pt-2` (8px) so the label text breathes from the content above within the 56px gap.
- **Onboarding banner (when visible):** `mb-6` (24px) below the banner to the upcoming card — tighter than section gaps since the banner is a utility element, not a major section.

Rationale: `space-y` on the container applies the gap to every child including invisible elements (`display:none`, `position:absolute`), producing phantom top gaps on the first visible section.

### A11y
- 44px minimum touch targets on all interactive elements.
- Focus rings: `2px solid var(--spectrum-3)` via `:focus-visible`.
- Programmatic focus targets (`#main-content`, `#markdown-content`) suppress the outline.
- `prefers-reduced-motion` suppresses all transitions and animations.
