# Phase 4: Best Practices & Standards

## Framework & Language Findings

### Critical

**BP-F01. No path validation before `fetch()` in hash router** — `index.html:471-479`
`handleRoute` passes raw hash fragment to `loadPage()` → `fetch()` with zero validation. Cross-origin fetch chains with innerHTML XSS (Critical, already in SEC-CRIT-2 — confirmed again here from a standards perspective).

**BP-F02. `innerHTML = marked.parse(text)` — no sanitizer, error path also injectable** — `index.html:441, 465`
`setHTML()` (Sanitizer API) is now baseline-available across Chrome/Firefox/Safari as of 2024. DOMPurify remains the pragmatic fallback. Error path uses string interpolation into `innerHTML` — use `textContent` or `createElement` instead.

### High

**BP-F03. `marked.setOptions()` is a deprecated API** — `index.html:413`
Deprecated in marked v5, removed in v6+. The unpinned CDN URL (`npm/marked/marked.min.js`) resolves to whatever latest is at cache flush time — currently v14+. `marked.setOptions()` silently no-ops or throws depending on resolved version.
Fix: `marked.use({ gfm: true, breaks: true })` (v5+ API).

**BP-F04. Broken base URL construction for link rewriting** — `index.html:446-449`
`window.location.origin + '/' + baseDir` is fragile on subdirectory GitHub Pages deploys. `link.href` (not `getAttribute`) already returns the fully resolved URL, eliminating all manual string prefix checking.
Fix:
```js
const base = new URL(path, window.location.href);
const resolved = new URL(link.href, base);
if (resolved.origin === window.location.origin) {
    link.setAttribute('href', '#p=' + resolved.pathname.replace(/^\/[^/]+\//, ''));
}
```

**BP-F05. No SRI on CDN scripts; Tailwind play CDN not production-viable** — `index.html:26-27`
Confirmed from both security and standards perspectives. Tailwind CDN has no SRI-compatible versioned URL.

### Medium

**BP-F06. ES2018-era idioms; `getAttribute` instead of URL API** — `index.html:passim`
`Array.from(ul.children).forEach` → `for...of [...ul.children].entries()`. `link.getAttribute('href')` string comparison → `new URL(link.href)` for correct protocol/origin classification. No optional chaining used. `window.scrollTo(0,0)` ignores `scroll-behavior`.

**BP-F07. `will-change: transform` on all cards unconditionally** — `index.html:101`
`will-change` should be applied dynamically on `pointerenter`, removed on `pointerleave`. Currently the `prefers-reduced-motion` block suppresses transitions but does not remove `will-change` — GPU layers still allocated for motion-sensitive users.
Fix: Remove from static `.card` rule; apply in JS on `pointerenter`.

**BP-F08. Three-way CSS token split is unsustainable** — `index.html:8-24, 32-51, passim`
Tailwind config, `:root` custom properties, and inline `style=` attributes all define the same six spectrum colors. Three sources of truth. If Tailwind CDN is retained, configure colors as `'var(--spectrum-N)'` references so `:root` remains the single source:
```js
tailwind.config = { theme: { colors: { 'spectrum-2': 'var(--spectrum-2)' } } }
```

**BP-F09. HTML semantics: `<div>` inside `<h3>`; focus target wrong** — `index.html:287, 390`
`<div class="spectrum-rule">` is a block element inside `<h3>` — HTML conformance error. Use `<span>` or a CSS `::after` pseudo-element. `tabindex="-1"` is on the containing `<div id="reader-view">` rather than the `<article>` inside it — move to the semantic element.

### Low

**BP-F10. Footer always visible regardless of active view** — `index.html:404-406`
Footer is outside both view containers, so it renders during reader sessions below the article. Likely unintentional. Fix: move inside each view or control with the same show/hide logic.

**BP-F11. No `AbortController` on fetch — stale fetch race condition** — `index.html:438`
Two rapid clicks on different links: both fetches race, last-to-complete wins with potentially stale content. Fix: `currentFetch?.abort()` at start of `loadPage`, `AbortController` signal on `fetch()`, silent discard `AbortError`.

---

## CI/CD & DevOps Findings

### Critical

**CI-F01. No CI/CD pipeline exists — every push ships immediately to production**
`.github/` directory does not exist. No workflow file, no linting, no HTML validation, no link check, no security scan. A broken commit goes live in ~30 seconds with no gate, no alert, no rollback trigger.
Fix: Create `.github/workflows/ci.yml` with HTML validation, internal link check, SRI presence check, hardcoded-branch check.

**CI-F02. Supply chain: No SRI on CDN scripts** — confirmed critical from CI perspective
CDN compromise delivers arbitrary JS. No CI step would detect it. See SEC-HIGH-1.

### High

**CI-F03. No Content Security Policy** — `index.html:<head>`
No `<meta http-equiv="Content-Security-Policy">`. Without CSP, the XSS finding (SEC-CRIT-1) has unrestricted execution scope. Tailwind play CDN's JIT requires `unsafe-eval`, making a meaningful CSP impossible until CDN is replaced.
Fix: Replace Tailwind CDN with built stylesheet, then add:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-src https://view.officeapps.live.com; base-uri 'self'; form-action 'none';">
```

**CI-F04. Hardcoded `master` branch in Office Online URLs** — `index.html:314, 346`
No CI check catches a branch rename. Silent failure mode: Office viewer shows generic error.
Fix (minimum): CI grep: `grep -r 'raw\.githubusercontent\.com/.*/master/' index.html && exit 1`

**CI-F05. No CDN version pinning** — `index.html:26-27`
`npm/marked/marked.min.js` tracks latest. `marked.setOptions()` is already broken on current latest versions. A CDN cache flush can silently break markdown rendering.
Fix: Pin to `marked@5.1.2` (last v5 release, compatible with `setOptions`) or update API to `marked.use()` and pin to v12+.

**CI-F06. No automated tests of any kind**
No HTML validator, no accessibility check, no link checker, no JS syntax check. All prior-phase findings would have gone undetected indefinitely.
Fix: Minimum viable CI: HTML5 validator + `@axe-core/cli` + Playwright smoke test (dashboard renders, reader opens markdown).

### Medium

**CI-F07. No rollback procedure documented**
`git revert HEAD && git push` is undocumented. If maintainer is unavailable, a broken page stays broken.
Fix: Document in `CONTRIBUTING.md`. Consider `gh-pages` branch as deployment target with manual promotion step.

**CI-F08. Incomplete `.gitignore`** — `.gitignore`
`.env`, `*.pem`, `*.key`, `.claude/settings.local.json`, `.playwright-mcp/`, `.full-review/` not ignored.
Fix: Add 8 lines.

**CI-F09. No branch protection on `master`**
Direct pushes bypass any future CI checks. Fix: GitHub Settings → Branches → require PR + status checks for `master`.

### Low

**CI-F10. No uptime monitoring**
Silent failure if CDN breaks rendering. Fix: Scheduled GitHub Actions job (`curl` the Pages URL hourly, alert on non-200).

---

## Prioritised 30-Minute Quick Wins (no `index.html` changes)

1. Enable branch protection on `master` — GitHub UI, 2 minutes
2. Extend `.gitignore` with secrets and tool dirs — 6 lines
3. Create `.github/workflows/ci.yml` with HTML validation + link check + hardcoded-branch check
4. Document rollback in `CONTRIBUTING.md`
