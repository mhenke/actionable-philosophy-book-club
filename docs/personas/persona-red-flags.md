# Persona Red Flags

This file collects persona-based red flags to help prioritize UX fixes and acceptance criteria.

## Alex (Impatient Power User)
- Context: Desktop user who wants to quickly share or deep-jump to specific assets.
- Pain points:
  - No shareable anchored URLs for individual media files (videos, podcasts). Hash routing supports `#p=` for documents but not per-asset anchors.
  - No anchors or keyboard-accessible shortcuts to jump to a specific podcast type (e.g., Debate, Deep-Dive) within a meeting card.
  - Must scroll past the entire Next Meeting hero card to reach the Archive section when trying to access older meetings quickly.
  - Expanding a meeting's podcast disclosure often shows multiple audio rows with no time/duration metadata for `.m4a` files; it's hard to know which recording is the debate without guessing from labels.
  - No Esc key alternative to close the reader overlay or return focus; the only visible escape is the "Dashboard" link in the header.
  - Reader lacks sequential navigation between meeting siblings (e.g., "next meeting" / "previous meeting"); users must return to the Dashboard to move between sessions.
- Time on task: longer than necessary.
- Frustration trigger: unable to send a direct link to the deep-dive audio or link to a specific podcast type.

## Casey (Distracted Mobile User / Commuting Engineer)
- Context: Mobile (≈375–390px) user, often one-handed during short sessions or on commutes.
- Pain points:
  - Video Primer rows (canonical vs alternate) can look visually identical; users may tap the alternate cut by mistake.
  - The Key Takeaway box and multiple asset rows can push the primary CTA below the fold on small phones, requiring extra scrolls.
  - Download icons placed in the upper-right are hard to reach with the thumb; the primary action (play) should be surfaced as a large, reachable tap target.
  - Video links currently open raw `.mp4` (downloads or external player); in-page playback with resume would improve the mobile experience.
  - The Knowledge Base is the last section of the page; new users who need onboarding or the Onboarding doc must scroll past Next Meeting, Horizon, and Archive before finding it.
  - The onboarding banner is injected by JS and positioned above <main>; on tall phones this places it outside the primary thumb zone and therefore less likely to be acted upon.
- Resolved: Reader error recovery shows "Document unavailable / Try again" when connections drop (fixed).
- Usability impact: increased taps, misclicks, and likely abandonment for quick tasks.

## Sam (Screen Reader User)
- Context: Blind or low-vision user relying on screen reader and keyboard navigation.
- Observations:
  - Skip links and ARIA landmarks are present and usable.
  - `aria-busy` and `role="status"` live region behavior is implemented and announces reader state.
  - Emoji icon-pills are correctly marked `aria-hidden="true"` so they don't pollute assistive output.
  - Native `<details>` for podcast disclosures are announced correctly by most screen readers.
- Remaining concern:
  - The copy-link button currently has a correct `aria-label` but is visually low-opacity (opacity-40). Sighted users may miss it while screen reader users can still find it; consider increasing visible affordance or adding an alternative visible state.
  - The visible banner text "A Philosophy of Software Design" is marked `aria-hidden="true"` while the page's `<h1>` is `.sr-only`. This intentionally separates visual and accessible title delivery but can create a mismatch between sighted and non-sighted users' perception of the page title.
  - The onboarding banner is injected and moved by JS after initial DOM load; if JS hasn't run, the DOM order places the banner between the dashboard and footer, which may break expected tab order.
  - Podcast episode rows do not expose duration or file size for `.m4a` assets; screen reader users cannot determine which episode to download without additional metadata.

## Marcus (Engineer, 3rd Week / New Club Member)
- Context: Returning participant and/or first-time visitor.
- Pain points:
  - Labels like "Synthesis Reader" are unclear without a short explanation or "New here?" entry point.
  - The Knowledge Base is a glossary of domain terms, not a product-orientation guide; new members look for "where to start" content.
  - No clear onboarding microcopy or banner guiding new users to playlists, expected session cadence, or how to use the reader.
- Outcome: confusion about where to begin, missed expectations about meeting cadence and where to find learning paths.

---

### Recommended acceptance checks (examples)
- Add anchorable/permalink URLs for media assets and confirm shareable links open the expected player or page.
- Ensure primary media actions are reachable on 375–390px screens within a single thumb zone; prefer inline play over raw downloads.
- Provide an onboarding microcopy or a "New here?" banner linking to a short explainer page (one-paragraph + CTAs).
- Add keyboard shortcuts or in-page anchors for jumping to podcast types within a meeting card.
- Make the copy-link-btn visually discoverable (increase opacity or add a visible focus state) while preserving correct ARIA labels.
