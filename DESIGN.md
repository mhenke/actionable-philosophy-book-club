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

## Typography

### Scale
- **Section heading (h1 in prose):** 1.5rem mobile / 1.875rem desktop — matches the dashboard card heading scale (`text-2xl md:text-3xl`).
- **Section label (h2 in prose, section headers on dashboard):** 0.8125rem (prose) / 0.625rem (dashboard), both uppercase with `letter-spacing: 0.2em`.
- **Sub-section heading (h3 in prose):** 1rem, spectrum-1 color, light border-top divider.
- **Body text (prose paragraphs):** 1.0625rem, line-height 1.7, text-muted color.
- **UI text (asset links, buttons):** 0.875rem, text-primary color.
- **Small labels (archive metadata, KB tiles, badges):** 0.6875–0.6875rem, uppercase, `letter-spacing: 0.2em`.

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

- **Content container:** `max-w-6xl mx-auto` with `p-5 md:p-10 lg:px-16` horizontal padding — identical on both pages. Prose article fills this container; no independent line-length cap.
- **The Banner Bar:** Dark charcoal anchor, `max-w-6xl` constrained inner content aligned to the main container.
- **The Spectrum Bar:** 6px linear gradient (Navy to Sage), always full gradient on both views.
- **Section Dividers:** `.spectrum-rule` — same 6-stop spectrum gradient as the header bar, `max-width: 240px`, fading to transparent. Appears next to section heading labels on the dashboard.
- **Borders:** All surface borders use `--border-low` (`rgb(34 34 34 / 0.06)`) — card edges, prose h2 dividers, file tree panel. One consistent weight.
- **Highlighted content (blockquotes, Key Takeaway):** `--wash-2` background / `--wash-2-border` border — spectrum-2 tint shared across both views.
- **Material Cards:** Flat white, `--border-low` border, hover triggers `translateY(-2px)` + spectrum-3 shadow.

### Reader-Specific
- Prose h2 and h3 have top border dividers — functional hierarchy within documents, not decoration.
- Prose links are underlined — reading context convention.
- Prose body text is larger (1.0625rem) than UI text (0.875rem) — intentional mode signal.
- File tree (Session Materials) rendered in monospace with spectrum-3 connectors.

### A11y
- 44px minimum touch targets on all interactive elements.
- Focus rings: `2px solid var(--spectrum-3)` via `:focus-visible`.
- Programmatic focus targets (`#main-content`, `#markdown-content`) suppress the outline.
- `prefers-reduced-motion` suppresses all transitions and animations.
