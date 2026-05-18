# Persona Red Flags — Decisions (2026-05-18)

This file records the original persona red flags and the team's decisions about what to address now, what to defer, and what to explore further. Use this as the single source of truth for prioritization and implementation notes.

## Legend
- DONE — Implemented
- WILL NOT ADDRESS — Intentionally not planning work now
- IN PROGRESS — Work started; partial
- EXPLORE — Gather more information / prototypes before committing

---

## Alex (Impatient Power User)
- Context: Desktop user who wants to quickly share or deep-jump to specific assets.

Decisions:
- Shareable per-asset anchors (per-asset permalinks) — WILL NOT ADDRESS
  - Rationale: Adds routing complexity and limited immediate value; deprioritized.
- Keyboard shortcuts / in-page anchors for podcast types — WILL NOT ADDRESS
  - Rationale: Low ROI vs. engineering cost; consider in future if usage data shows demand.
- Jump/scroll behavior to reach Archive quickly — WILL NOT ADDRESS (CONSIDER: TOC/anchor approach)
  - Note: Can be explored later via a lightweight table-of-contents or anchor links; not in scope now.
- Podcast duration metadata (show duration in rows) — DONE
  - Rationale: Implemented; exposes durations for both sighted and screen-reader users.
- Esc to close & focus restore — WILL NOT ADDRESS (no additional work planned)
  - Note: Existing behavior is acceptable; user flagged as low-value.
- Reader previous/next navigation between meetings — DONE
  - Rationale: Implemented to improve sequential reading.

---

## Casey (Distracted Mobile User / Commuting Engineer)
- Context: Mobile (≈375–390px) user, often one-handed.

Decisions:
- Distinguish canonical vs alternate video rows visually — WILL NOT ADDRESS
  - Rationale: Not planned; maintain current labeling conventions.
- Primary media reachability on 375–390px (tap targets, layout width parity) — IN PROGRESS
  - Rationale: Partial adjustments made; need a follow-up pass to ensure index and reader pages share consistent max-widths and tappable areas.
- Inline playback for `.mp4` (resume-capable in-page player) — WILL NOT ADDRESS
  - Rationale: Adds playback and state complexity; defer for now.
- Onboarding banner placement (mobile thumb zone) — DONE
  - Rationale: Banner placement adjusted earlier; no further change planned.

---

## Sam (Screen Reader User)
- Context: Blind or low-vision user relying on screen reader and keyboard navigation.

Decisions:
- Copy-link button visual affordance (increase opacity / visible state) — WILL NOT ADDRESS
  - Rationale: Visual affordance change considered low priority; keep current ARIA-correct implementation.
- Visual vs accessible title mismatch — FIX (IN PROGRESS)
  - Rationale: Aligning visual title and accessible title semantics to avoid confusion; small markup change underway.
- Podcast duration & file-size availability for screen readers — DONE (duration exposed)
  - Rationale: Duration metadata surfaced and exposed to assistive tech.

---

## Marcus (Returning participant / New member)
- Context: Returning participant and/or first-time visitor.

Decisions:
- Onboarding microcopy / "New here?" explainer + CTAs — DONE
  - Rationale: Short onboarding microcopy added to help new users find starting points.

---

## What to Explore (low-cost investigations)
- Lightweight Table-of-Contents / anchor links on long pages to provide quick jumps to Archive (low-effort prototype).
- Consistent max-width and layout tokens for index + reader pages to ensure visual parity across entry points (design pass).
- Small A/B of copy-link visual affordance vs analytics to verify if sighted users actually miss the control.

---

If anything here needs different wording or additional decisions, reply with the exact line(s) to change and those edits will be applied and committed.
