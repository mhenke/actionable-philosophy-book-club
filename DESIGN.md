# Design

## Aesthetic Vision: The APoSD Identity
The interface is a literal digital extension of the "A Philosophy of Software Design" physical book cover. It targets a "technical but human" feel, prioritizing functional minimalism and high-precision Swiss/International Style design.

## Physical Scene
A clean, well-lit monograph reader or engineering notebook. The dashboard should feel like a premium printed object rather than a standard web application.

## Colors

### Core Surfaces
- **Background (Near White):** `#F7F7F7` — Primary cover background.
- **Banner (Dark Charcoal):** `#222222` — Used for the title bar/header.
- **Title/Banner Text:** `#FFFFFF` — Pure white on charcoal.
- **Text Primary:** `#222222` — High-contrast charcoal for body/headings.
- **Text Muted:** `#545454` — Dark gray, compliant with WCAG AA (5.8:1 ratio).

### The Loops Spectrum (Accents)
A muted blue → teal → sage green gradient spectrum on white.
- **Deep Navy:** `#1A3A5C` (Darkest)
- **Medium Blue:** `#2B6CB0`
- **Steel Blue:** `#4BA3C7`
- **Teal:** `#48BDB8`
- **Seafoam:** `#72C9A8`
- **Light Sage:** `#A8D8B9` (Lightest)

## Typography: Swiss / International Style
Zero decorative type. Hierarchy is achieved entirely through **weight contrast** rather than size or color variation.

- **Typeface:** System font stack (ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Arial, 'Noto Sans', 'Liberation Sans', sans-serif). This ensures zero-latency rendering and matches the "Zero Ceremony" mandate. Inter font files are self-hosted in `assets/fonts/` as a fallback for specific brand-critical elements if needed.
- **Titles (Large/Primary):** All-caps, **Medium weight**, tight tracking (`-0.04em`).
- **Author/Metadata:** All-caps, **Light/Thin weight**, set noticeably smaller or to the right of titles.
- **Body:** Sans-serif, high-legibility, standard case. Line length capped at **65–75ch**.

## Layout & Components
- **The Banner Bar:** Dark charcoal anchor containing the title (Medium) and author (Light) on the same baseline.
- **The Spectrum Bar:** A 6px high-precision linear gradient bar (Navy to Sage) serving as the primary visual divider.
- **Structural Minimalism:** Only necessary text elements; generous whitespace; no side-stripe borders or gradient text.
- **Material Cards:** Flat white cards with subtle 1px borders (`rgba(0,0,0,0.06)`). Hover states trigger an upward shift and a spectrum-tinted shadow.
- **A11y:** 44px minimum touch targets; focus-within rings using `--spectrum-3`.
