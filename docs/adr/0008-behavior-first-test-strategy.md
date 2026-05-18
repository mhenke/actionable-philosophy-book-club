# ADR-0008: Behavior-First Test Strategy

**Status:** Accepted
**Date:** 2026-05-18

## Context

The Playwright test suite grew to cover implementation details: pure formatting functions (`formatDuration`, `formatFileSize`), internal cache mechanics (prefetch), extracted refactoring artifacts, and a throttle spec that saved screenshots with zero assertions. All 92 tests passed. Meanwhile, clicking the Slides link on the dashboard silently did nothing — `e.preventDefault()` was called before the safety check in `setupAssetClickDelegation`, swallowing the Office Online URL click. No test caught it.

## Decision

Delete tests that verify implementation details. Replace them with tests that verify what users can actually do.

**Deleted:**
- `formatters.spec.js` — pure function unit tests (trivial, no regression value)
- `prefetch.spec.js` — internal cache optimization detail
- `refactor-internals.spec.js` — artifacts from an extraction refactor, not behavior
- `additional-resources-summary.spec.js` — internal string formatting
- `throttle.spec.mjs` — no assertions; saved screenshots only

**Added:**
- `asset-behavior.spec.js` — slides open in Office Online viewer, video click opens inline player, CTA navigates to reader, archive links are correctly formed, upcoming card renders from manifest

## Rationale

Tests that pass while a user-facing feature is broken are worse than no tests — they create false confidence. The measure of a test is whether it fails when users can't do something they expect to do.

Implementation-detail tests are also the most brittle: they break on refactors that have zero user-visible impact, creating friction without protection.

The rule going forward: **before writing a test, ask "would a user notice if this broke?"** If no, don't write the test.

## Consequences

- **Positive:** 92 → 74 tests; each remaining test corresponds to something a user would notice if broken; the slides bug would have been caught at write time.
- **Negative:** Internal functions (formatDuration, cache behavior) lose explicit test coverage. Regressions in these must be caught by the behavior tests that depend on them.
- **Retained exceptions:** XSS tests and path-validator tests remain despite being implementation-level, because security regressions are invisible to users until they matter.
