# Phase 3: Testing & Documentation Review

## Test Coverage Findings

### Current state: 0% formal coverage

No test files, no test runner, no spec files, no CI quality gate beyond deployment. The `.playwright-mcp/` directory contains manual exploration snapshots — not a test harness.

### Critical

**T-F01. XSS sanitizer absent and untestable in current state**
Once DOMPurify is added (SEC-CRIT-1), no test confirms it's configured correctly or that a future `marked` options change doesn't bypass it. Error path at line 465 also has no test for XSS via `err.message` injection.
Fix: Playwright tests with `page.route()` serving controlled markdown payloads containing `<script>`, `<img onerror>`, `<svg onload>`.

**T-F02. `isSafeRepoPath` validator has no test matrix**
The validator (SEC-CRIT-2 fix, not yet written) covers a high-CVSS attack surface. Without a comprehensive test matrix, one misauthored regex leaves the app open to the cross-origin XSS chain (CVSS 9.0).
Fix: Unit tests (after function extraction) or a standalone `tests/path-validator.html` covering: `//evil.com/x.md`, `https://evil.com`, `../traversal`, `%2e%2e/`, empty string, null byte, non-.md extensions, >256 chars, starts-with-dot.

**T-F03. `handleRoute` empty hash path bug is untested and confirms an existing defect**
`#p=` with no path calls `loadPage('')` → `fetch('')` → fetches `index.html` itself → `marked.parse` on raw HTML → `innerHTML`. This is both a logic error and (without DOMPurify) an XSS vector. No test catches it; it currently ships.
Fix: `await page.goto('/#p='); expect(locator('#dashboard-view')).toBeVisible()` — this test currently fails, exposing the bug.

### High

**T-F04. `loadPage` has no tests for any code path**
The entire fetch/render pipeline — success, 404, network error — has zero test coverage. Core application logic.
Fix: Playwright with `route.fulfill({ status: 404 })` and `route.abort('failed')` — cover all branches.

**T-F05. Link rewriter: `javascript:` bypass and subdirectory URL resolution untested**
`!href.startsWith('http')` passes `javascript:` URIs. `window.location.origin + '/'` base resolution breaks on GitHub Pages subdirectory deploys. Neither is tested.
Fix: Playwright tests asserting `javascript:` hrefs are not rewritten to `#p=javascript:...`, and that relative `.md` links resolve correctly from nested paths.

**T-F06. `renderFileTree` connector symbols, heading match, and idempotency untested**
No test confirms `└──` appears on last item, `├──` on others. No test for case-insensitive heading match. No idempotency test — navigating to same page twice double-decorates (confirmed bug).
Fix: Playwright DOM assertions on `.tree-connector` text content; idempotency test (currently fails without PERF-MED-4 guard).

**T-F07. Navigation state machine fully untested**
Dashboard → reader, reader → dashboard, back button, `hashchange`, stale content on back-nav — none tested.
Fix: Playwright routing tests covering all transitions, including `page.goBack()` and confirming `#markdown-content` is cleared on back-nav.

### Medium

**T-F08. No link integrity verification — renamed file silently breaks dashboard**
Dashboard hardcodes file paths; no test checks they exist on disk. A renamed recording or slide deck produces a silent 404.
Fix: `tests/check-links.sh` that greps `#p=` and `href="meetings/` paths and verifies existence; run in GitHub Actions CI.

**T-F09. Markdown cache correctness untested (once cache is added)**
Once PERF-HIGH-2 cache is implemented: no test confirms second nav hits cache (not network), and no test confirms different paths don't share cached content.
Fix: Playwright fetch-count assertions using `page.route()` counter.

**T-F10. No performance baseline — FCP regression undetectable**
PERF-CRIT-1 claims +1,500–3,000 ms FCP on mobile; no automated test would catch a future regression if/when Tailwind CDN is replaced.
Fix: Playwright CDP network throttling + `performance.getEntriesByName('first-contentful-paint')` — set budget of <2s on 4G.

**T-F11. Accessibility untested beyond manual inspection**
`aria-busy` state transitions, focus management (`reader.focus()`), 44px touch targets — none verified by automated test.
Fix: Playwright + axe-playwright (`checkA11y`) on both views; bounding box assertions on `.asset-link` and `.asset-dl`.

### Recommended test infrastructure (fits "no build step" constraint)

**Tier 1 — Zero cost, no Node required:**
- `tests/check-links.sh` — shell link integrity checker, add to GitHub Actions. 30 minutes of work.
- `tests/path-validator.html` — self-contained browser harness for `isSafeRepoPath` edge-case matrix.

**Tier 2 — Playwright, no application build step:**
```
npm install -D @playwright/test  # test tooling only; app stays zero-build
npx playwright install chromium
```
`playwright.config.js` points at `python3 -m http.server 8080` as webServer. This unlocks all Playwright findings above.

**Tier 3 — Unit tests (requires one 30-minute refactor):**
Extract pure functions (`isSafeRepoPath`, `renderFileTree`, `rewriteInternalLinks`, `decorateSessionMaterials`) to `js/app.js` with ESM exports. Use Vitest for unit tests. This also unlocks the full CSP fix (no `unsafe-eval` needed once CDN JIT is gone).

---

## Documentation Findings

### Critical

**D-F01. Content contract completely undocumented**
The `## Session Materials` heading triggers the file-tree renderer via `/session materials/i` regex. No document mentions this. An author writing `## Materials` or `## Files` silently gets plain text. The `#p=` URL scheme and automatic `.md` link rewriting are equally undocumented.
Fix: Add `docs/content-contract.md` (or a section in CONTRIBUTING.md) covering: the exact heading name, asset link format, URL scheme, and rewriting behavior.

**D-F02. No "Add a New Meeting" workflow exists anywhere**
CONTRIBUTING.md has file naming conventions but zero guidance on the critical step: manually editing `index.html` to add a new card, hardcode asset paths, and construct the Office Online URL. A contributor who only reads CONTRIBUTING.md will either skip `index.html` or construct the URL incorrectly.
Fix: Add a numbered "How to Add a Meeting" section to CONTRIBUTING.md with explicit steps, especially calling out the `index.html` manual edit and the Office Online URL pattern.

### High

**D-F03. `meeting-99-new` / "Inbox" convention unexplained**
The "Inbox" tile points to `meetings/meeting-99-new/README.md`. The `99-new` naming convention, what "Inbox" means operationally (staging area?), and why it's in `meetings/` rather than `templates/` is documented nowhere. A new contributor copying the pattern would not invent this.
Fix: Document the convention in CONTRIBUTING.md or rename to `resources/inbox/` and update `index.html`.

**D-F04. Office Online URL fragility undocumented**
The hardcoded `https://view.officeapps.live.com/...raw.githubusercontent.com/mhenke/actionable-philosophy-book-club/master/...` embeds the GitHub username, repo name, and branch name. ADR 0001 justifies the viewer choice but ignores these failure modes entirely. A fork, rename, or branch rename silently breaks every slide link.
Fix: Add a "Known Fragilities" section to ADR 0001; add the URL construction template to CONTRIBUTING.md's new-meeting workflow.

**D-F05. No local development instructions anywhere**
Opening `index.html` directly via `file://` fails — `fetch()` calls are blocked cross-origin. Neither README nor CONTRIBUTING mentions running a local server. Every new contributor's first experience is a broken reader view with no explanation.
Fix: Add "Local Development" section to README: `python3 -m http.server 8080` then `http://localhost:8080`.

**D-F06. Meeting template mismatches actual renderer behavior**
Template uses plain-text `"Coming Soon"` placeholders in `## Session Materials` (not linked items — still works with tree decorator, but teaches the wrong pattern). Template uses `XX-` placeholders with no convention documentation. Template gives no hint that `## Session Materials` is a special heading.
Fix: Add an explanatory comment block at the top of `meeting-README-template.md` noting the heading contract. Update placeholder items to use link syntax even when pending (e.g., `- [Slides (Coming Soon)](slides/)`).

### Medium

**D-F07. ADR 0002 missing post-processing logic**
ADR 0002 describes the hash router and marked.js rendering but omits `renderFileTree()`, the `## Session Materials` trigger, and the automatic `.md` link rewriting — the most complex custom logic in the project.
Fix: Add an "Implementation Details — Post-processing" subsection.

**D-F08. CONTRIBUTING directory structure omits companion markdown files**
`01-essential-questions.md` and `01-non-obvious-insights.md` are central to the meeting structure and linked from the dashboard, but CONTRIBUTING doesn't mention them. The `resources/` subdirectory distinction (meeting-level vs. project-level) is also unclear.
Fix: Update the repository organization section to include companion `.md` files and clarify `resources/` scoping.

**D-F09. No deployment documentation**
Neither README nor CONTRIBUTING explains that `.nojekyll` is required to prevent Jekyll from breaking GitHub Pages, or that `master` branch root is what Pages serves.
Fix: Add a "Deployment" section to README.

### Low

**D-F10. `PRODUCT.md` Register section is an unfilled placeholder** — "product" is a single word with no explanation. Fix or remove.

**D-F11. No ADR index; ADRs not linked from README** — `docs/adr/` has two files with no discovery path. Fix: Add `docs/adr/README.md` with one-line summaries; link from main README.
