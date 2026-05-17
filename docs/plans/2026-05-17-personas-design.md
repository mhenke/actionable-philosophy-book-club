Design: Persona Red Flag Fixes — Balanced Approach 2

Overview

Address three distinct persona pain points in a cohesive pass: Alex (power user metadata & shortcuts), Casey (mobile-first layout & thumb zone), and Sam (accessibility & a11y).

Personas & Pain Points

1. Alex (Power User — Engineer)
   - No podcast duration/metadata shown; must guess from label
   - Reader lacks affordance hints (unclear how to navigate or close)
   - Solution: show duration visually, add "(press Esc)" hint in reader header

2. Casey (Mobile — Distracted User)
   - Primary CTA buried below fold on small screens; onboarding banner not in thumb zone
   - Knowledge Base (most critical for newcomers) is last section after 3+ sections scroll
   - Solution: move onboarding banner to mobile-friendly position, reorder sections on mobile

3. Sam (Accessibility — Screen Reader)
   - Visible title vs hidden title discrepancy (banner aria-hidden, h1 .sr-only)
   - Onboarding banner injected by JS; DOM order breaks pre-JS
   - Podcast duration/size not communicated in audio metadata
   - Solution: move banner into main DOM earlier, add duration to aria-labels & visible text

Implementation Sections

1. Podcast Metadata Display
   - Extract or hard-code duration (minutes) for each .m4a link in MEETINGS manifest or on render
   - Render duration as visible label: "Meeting 01 Deep Dive · 45m" next to link
   - Add aria-label: "Meeting 01 Deep Dive podcast, 45 minutes, 120 MB"
   - Update renderUpcomingMaterials() and asset rows to include duration
   - Helps: Alex (quick scan), Sam (informed choice on download size)

2. Onboarding Banner Repositioning
   - Move banner from between #dashboard-view and <footer> into <main> above #upcoming-materials-container
   - Apply responsive styles: sm:sticky sm:bottom-0 or sm:fixed sm:bottom-4 sm:left-4 sm:right-4
   - Ensures banner is in thumb zone on mobile; fixes DOM tab order pre-JS
   - Helps: Casey (mobile accessibility), Sam (correct tab flow)

3. Mobile Section Reordering
   - Current order (all screen sizes): Next Meeting → Horizon → Archive → Knowledge Base
   - Apply sm:-order-2 to Knowledge Base section to bring it forward on small screens
   - New mobile order: Next Meeting → Knowledge Base → Horizon → Archive
   - Helps: Casey (critical content earlier in scroll)

4. Reader Header Affordance Hint
   - Add small text next to "Dashboard" link: " (press Esc)" or "Esc to close"
   - Helps: Alex (discovers keyboard shortcut)

Testing

- Manual: scroll dashboard on mobile (< 640px), verify onboarding banner is sticky/thumb-accessible
- Manual: open podcast link, verify duration displayed and aria-label present
- Manual: in reader, press Esc; verify it closes and hint is visible
- Manual: reorder Knowledge Base on mobile; verify it appears before Archive
- Playwright: test that aria-labels include duration, banner is before main content in DOM

Rollout

- Single commit on new worktree: docs/plans/2026-05-17-personas-design.md + index.html + dist/app.js changes
- No feature flags; changes are safe and non-breaking

Estimated effort

2–4 hours (metadata harvesting + responsive tweaks + affordance hints).
