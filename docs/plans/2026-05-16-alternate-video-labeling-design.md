Design: Alternate Video Labeling & Asset-compressor updates

Date: 2026-05-16

Summary

Provide a clear, low-risk approach to surface alternate media (podcasts/audio/video) as "alternates" in the MEETINGS manifest, update asset naming/compression scripts to support alternates, and ensure tests and release steps validate the behavior before public deployment.

Problem

A podcast/alternate recap was matched to Session 1 and collapsed under the same card as the main video. This created ambiguity for users and lost provenance for the alternate asset.

Goals

- Surface both canonical and alternate media for a meeting without creating duplicate meeting cards.
- Preserve human-readable labels and provenance (source filename, type, uploaded date).
- Ensure asset-import tooling (asset-compressor / rename helper) recognizes alternates and applies canonical kebab-case slugs.
- Add tests and release steps to validate behavior and deployment.

Manifest changes (MEETINGS schema)

- Add optional field on asset entries: variant: "alternate" | "canonical" (default "canonical").
- Example:
  video: { file: 'meetings/meeting-02/recordings/02-complexity-governance.mp4', label: 'Video Recap', variant: 'canonical' }
  alt_audio: { file: 'meetings/meeting-02/recordings/02-complexity-governance-alt.mp3', label: 'Video Recap (Alternate)', variant: 'alternate' }

Rendering rules (UI)

- renderArchiveCards() and renderUpcomingMaterials(): when encountering assets with variant:'alternate', render a small secondary row under the canonical asset with label "(Alternate)" or the full label value.
- Do not create a separate meeting card for alternates.
- Include provenance (file basename) in alt hover/title attribute for advanced users.

Asset-compressor / rename script updates

- Accept an optional metadata flag or infer variant from filename patterns (e.g., *-alt.*, *_alternate.*, *-alternate.*) and write variant: 'alternate' to the manifest.
- Normalize target filenames to kebab-case and include a suffix when variant is alternate: e.g., 02-complexity-governance.mp4 and 02-complexity-governance-alternate.mp3.
- Preserve original filename in manifest as source_filename for provenance.
- Compression step: keep existing audio/video compression heuristics; ensure alternate files are compressed identically.
- Update CONTRIBUTING.md examples to show variant usage.

Tests

- Update tests/manifest-rendering.spec.js to assert:
  - Alternates render under canonical asset with label containing "Alternate"
  - No duplicate meeting card created
  - Manifest contains variant entries for newly imported alternates

Release & verification steps

1. Run: npx impeccable harden
2. Run: npm test (Playwright full suite)
3. Confirm GitHub Pages source and trigger rebuild if necessary
4. Create a release tag and draft release notes mentioning: alternate labeling, asset-compressor update, and audit hardening
5. Verify live site shows canonical + alternate under meeting card

Acceptance criteria

- MEETINGS manifest supports variant metadata and assets are normalized to kebab-case
- UI surfaces alternates without creating duplicate cards
- Asset-compressor auto-detects or accepts variant metadata and writes source_filename provenance
- Full test suite passes and impeccable audit stays green

Notes

- This design is intentionally minimal: variant is a small schema addition and rendering change. Implementation should be surgical to avoid unrelated regressions.

"Docs created and awaiting approval for implementation planning."
