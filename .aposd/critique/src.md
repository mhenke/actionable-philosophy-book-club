---
date: 2026-05-23
target: src/
score: 15/18
p0: 0
p1: 3
p2: 3
p3: 1
---

# APOSD Design Critique: `src/`

Sampled 28/30 files in `src/` (sampled systematically across file ordering). Two independent assessments via sub-agents, synthesized below.

---

## Tactical Tornado Verdict

**LOW-MEDIUM risk (9/12 red flag categories hit).** The codebase shows clear strategic thinking — comprehensive error handling, deep module pairs, consistent patterns — but the concatenation-based build forces tactical compromises. The most damning pattern found across both assessments:

- **`openVideoPlayer`** (video-player.js:69-130) is a 62-line function mixing 6 concerns: DOM element resolution, video loading, caption detection (`_tryLoadCaptionTrack`), resume bar wiring (`_setupResumeBar`), progress tracking interval, and 5+ event listeners (close, cancel, hashchange, overlay-click, error) — all captured in a closure-based cleanup. Each concern can't be tested, reused, or understood independently.

The Tactical Tornado also caught patterns the Strategic Thinker assessment missed: duplicate placeholder templates (Repetition), a misnamed `_sessionStorageSaveError` function (`storage.js:27`, name reverses meaning), and `setupManifestRetryUI` (`dashboard.js:115`) whose name hides its destructive side effect.

---

## Design Principles Score

| # | Principle | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Strategic Over Tactical | PASS | MeetingRepository (data-repository.js:14-63) extracts data access; AbortController + generation counter (reader-loader.js:87-119); LRU cache (utils.js:19-40); video cleanup pattern (video-player.js:120-127) |
| 2 | Deep Modules | PASS | `isSafePath` (path.js:22-41): 8+ rules behind 1 boolean; `fetchMarkdown` (utils.js:19-40): LRU+eviction+error cleanup behind 1 call; `openVideoPlayer` (video-player.js:69-130): 60+ lines behind 2 params |
| 3 | Information Hiding | AT RISK | 9 underscored "private" variables globally writable (e.g., `_activeReaderController`, `_rawContentBase`, `_onSessionStorageError`, `_called`, `_videoPlayerCleanup`, `ASSET_COPY`). Only manifest.js wraps in IIFE (l14-45) |
| 4 | General-Purpose Design | PASS | `isSafePath(p, domain)` with DOMAIN enum; pure utilities in format.js; `callOnce` generic guard; `buildAssetRows` with options object |
| 5 | Different Layer, Different Abstraction | PASS | Meeting → MeetingRepository → manifest.js → assets.js → dashboard.js. Each adds value |
| 6 | Pull Complexity Downward | PASS | `getMeetingRepository().getByStatus('upcoming')` (dashboard.js:17) trivial while validation hidden; `buildPPTXViewerURL` handles GitHub detection internally; `fetchMarkdown` caches internally |
| 7 | Better Together or Better Apart | AT RISK | 5 thin reader sub-modules (hooks, links, tree, toc, loader) called from one function — `ensureDOMPurifyHooks` (reader-hooks.js:13-29, 17 lines), `buildTableOfContents` (reader-toc.js:17-35, 19 lines) — too thin to justify file boundaries |
| 8 | Define Errors Out of Existence | PASS | Meeting validates on construction; `isSafePath` returns bool; `getAssetCopy` falls back to DEFAULT; ErrorHandler with optional chaining |
| 9 | Design It Twice | PASS | Two loading strategies (inline + fetch); asset-copy validation + defaults; evolved patterns (AbortController, callOnce) |
| 10 | Comments Describe Non-Obvious | AT RISK | Most JSDoc restates code. `data-repository.js:1-12` lectures on APOSD principles instead of explaining *why*. `utils.js:13` ("caches promises") is a good exception |
| 11 | Comments First | PASS | Every file has consistent Purpose/Public API/Side-effects header before implementation |
| 12 | Choosing Names | PASS | MeetingRepository, isSafePath, buildAssetRows, DOMAIN enum. Minor issues: `_renderSessionMeta` ("meta" vague), `_sessionStorageSaveError` (storage.js:27 — name means opposite of behavior) |
| 13 | Code Should Be Obvious | AT RISK | `buildVideoRow` (assets.js:22-44): nested ternaries + 12-line template + inline SVG; `renderUpcomingMaterials` (dashboard.js:8-63): 6 concerns in 1 function; `openVideoPlayer` (video-player.js:69-130): 5+ inline event handlers; `buildSlidesRow` (assets.js:58-66): unbalanced HTML via paired conditionals |
| 14 | Modifying Existing Code | PASS | Consistent error handling patterns; APOSD annotations show intentional improvement; asset-copy has validation + defaults |
| 15 | Consistency | PASS | All files: 'use strict', consistent JSDoc, escapeHTML(), isSafePath(), ErrorHandler?.warn(), ?? defaults. Minor: `_renderCardList` uses createDocumentFragment while rest uses innerHTML |
| 16 | Design for the Future | PASS | Meeting isolates schema changes; viewer.js centralizes viewer routing; DOMAIN enum supports new domains |
| 17 | Performance as Design | PASS | LRU cache; AbortController; generation counter; callOnce guards. Design-level decisions, not micro-opts |
| 18 | Increments Are Abstractions | PASS | Modules by abstraction: assets (rendering), storage (persistence), viewer (routing), path (security), format (formatting) |

**Summary: 15 pass, 3 at risk, 0 violate — 15/18**

---

## Overall Impression

This codebase was designed with conscious APOSD awareness — the comments cite principles, error handling is comprehensive, and deep modules like `MeetingRepository` and `openVideoPlayer` are genuinely well-crafted. The single biggest opportunity is the concatenation build system, which undermines information hiding (Principle 3) and forces pass-through accessor functions. Fixing that unlocks cleaner boundaries everywhere.

The Tactical Tornado assessment found issues the Strategic Thinker brushed over: complex HTML templates that resist change, overlapping concurrency mechanisms in `loadPage`, and naming that reverses meaning — none catastrophic, but they add cognitive load.

---

## What's Working

1. **Meeting + MeetingRepository** (data-meeting.js:7-33, data-repository.js:14-63) — deep module pair. Interface (setAll/getAll/getMeetingById/getByStatus) simpler than implementation (validation, mutation control, error prevention). Both assessments independently flagged this as a strength.

2. **`openVideoPlayer(filePath, label)`** (video-player.js:69-130) — ~60 lines behind 2 params, with cleanup that fires on close, cancel, hashchange, and escape key. Despite the Special-General Mixture finding, the interface depth is excellent. The cleanup pattern (`_videoPlayerCleanup` as a closure that resets all handlers) is particularly well-designed.

3. **Multi-layered error strategy** — optional chaining, `??` defaults, try/catch on every storage op, AbortController, generation counter, retry UI, promise-cache error eviction. This is uncommon in tactical codebases and indicates genuine design investment.

---

## Priority Issues

### [P1] Global state leakage from concatenation
- **Principle**: 3 (Information Hiding), 13 (Code Should Be Obvious)
- **Symptom**: Unknown unknowns — underscored "private" vars globally mutable
- **Why**: Concatenation means no module boundaries. 9 underscored variables globally visible: `_onSessionStorageError` (storage.js:14), `ASSET_COPY` (asset-copy.js:13), `_activeReaderController` (reader-loader.js:9), `_loadPageGeneration` (reader-loader.js:10), `_rawContentBase` (viewer.js:13), `_called` (utils.js:43), `_videoPlayerCleanup` (video-player.js:9), `_routeHandlers` (routing.js:10), `mdCache` (utils.js:10). Only manifest.js wraps in IIFE (l14-45). Theme-init.js also leaks key-building knowledge (l8) duplicating `storage.js:10`.
- **Fix**: Wrap each file in IIFE returning public API, following manifest.js:14-45 pattern. Zero build changes.
- **Found by**: Both assessments (Strategic Thinker P1, Tactical Tornado: Information Leakage)

### [P1] Complex template-literal HTML strings resist change
- **Principle**: 13 (Code Should Be Obvious), 5 (Different Layer, Different Abstraction)
- **Symptom**: Change amplification — editing HTML requires modifying templates with nested ternaries, escapeHTML calls, inline SVGs
- **Why**: `buildVideoRow` (assets.js:22-44) has 12-line template with conditional sections; `renderUpcomingMaterials` (dashboard.js:28-35, 44-48, 53) builds 3 inline templates with mixed concerns. Tactical Tornado found additional evidence: `buildSlidesRow` (assets.js:58-66) uses paired conditionals (`viewerLink` / `viewerClose`) producing unbalanced HTML that only resolves to valid markup when tags match — a trap for future editors.
- **Fix**: Extract reusable HTML partials as functions, or switch to createElement/createDocumentFragment for complex structures. Consider a minimal template system.
- **Found by**: Both assessments (Strategic Thinker P1, Tactical Tornado: Obviousness Red Flag)

### [P1] `openVideoPlayer` mixes 6+ concerns in 62 lines
- **Principle**: 13 (Code Should Be Obvious), 18 (Increments Are Abstractions)
- **Symptom**: Cognitive load — can't understand one concern without the whole
- **Why**: `openVideoPlayer` (video-player.js:69-130) embeds DOM element resolution (l72-73), video file loading (l79-80), VTT caption probing (l82), resume bar wiring (l84), progress save interval (l87-88), and 5+ event listeners (close, cancel, hashchange, overlay-click, error — l89-118) in one procedural block. Cleanup closures capture all handlers inline (l120-127), making reuse impossible.
- **Fix**: Extract 3-4 sub-functions: `_setupVideoSource(video, filePath)`, `_tryLoadCaptionTrack(video, filePath)`, `_setupResumeBar(video, filePath, label)`, `_wireVideoEvents(els, filePath, label)`.
- **Found by**: Tactical Tornado (Special-General Mixture, HIGH)

### [P2] Thin reader sub-modules add file-jumping cost
- **Principle**: 7 (Better Together or Better Apart)
- **Symptom**: Cognitive load — understanding loadPage requires opening 4 additional files
- **Why**: `ensureDOMPurifyHooks` (reader-hooks.js:13-29, 17 lines), `_applyMeetingMaterialsTree` (reader-tree.js:9-21, 13 lines), `buildTableOfContents` (reader-toc.js:17-35, 19 lines), `rewriteContentLinks` (reader-links.js:17-57, 41 lines) — all called once from `_finalizeReaderContent`. Only `reader-links.js` is deep enough to justify its own file.
- **Fix**: Merge hooks, tree, and toc into reader-loader.js as underscored functions (they're each called once). Keep reader-links.js (41 lines, non-trivial logic) as-is.
- **Found by**: Both assessments (Strategic Thinker P2, Tactical Tornado: Shallow Module)

### [P2] Repeated DOM queries in renderUpcomingMaterials
- **Principle**: 17 (Performance as Design), 15 (Consistency)
- **Symptom**: Cognitive load — tracking which DOM ref was already fetched
- **Why**: `renderUpcomingMaterials` (dashboard.js:9-13) calls `document.getElementById` 5 times, then `container.closest('section')` (l16), then another `getElementById` for `quoteContainer` (l43) — 7 DOM queries. `setup.js` exists for this pattern but isn't used.
- **Fix**: Cache DOM refs in setup.js, reduce renderUpcomingMaterials to 0 DOM queries.
- **Found by**: Strategic Thinker

### [P2] Duplicate placeholder templates (Repetition)
- **Principle**: 15 (Consistency), 18 (Increments Are Abstractions)
- **Symptom**: Change amplification — updating placeholder design requires editing both copies
- **Why**: `buildVideoPlaceholder()` (assets.js:47-55) and `buildSlidesPlaceholder()` (assets.js:81-90) are structurally identical: same `opacity-50` wrapper, same `cursor-default` asset-link, same `Coming Soon` badge — only the emoji (`🎬` vs `📊`) and label differ.
- **Fix**: Extract `_buildPlaceholder(emoji, label)` shared function.
- **Found by**: Tactical Tornado (Repetition, HIGH)

### [P3] Inconsistent DOM construction patterns
- **Principle**: 15 (Consistency)
- **Symptom**: Cognitive load — must know three different patterns
- **Why**: `_renderCardList` (dashboard.js:76-86) uses createDocumentFragment + createElement; assets.js uses template strings; reader-loader.js TOC insertion (l44-57) uses createElement + innerHTML. Three distinct DOM construction strategies in one codebase.
- **Fix**: Standardize on one approach.
- **Found by**: Strategic Thinker

---

## Persona Walkthrough

### Tactical Tornado walkthrough
If the Tactical Tornado wrote this code, they would let `openVideoPlayer` (video-player.js:69-130) continue growing its inline handler list and edge-case checks. Each new feature — captions languages, playback speed controls, picture-in-picture — would add another inline handler, another line in the cleanup closure, another conditional in the 62-line procedural block. The `_videoPlayerCleanup` closure would grow from 8 lines to 20+ as each new handler needs manual cleanup registration. The function would reach 100+ lines without decomposition because "it works, the cleanup pattern is there, ship it."

### Strategic Thinker walkthrough
If the Strategic Thinker were to redesign `openVideoPlayer`, they would extract 4 focused modules: `_setupVideoSource` (handles video element config + VTT caption probing), `_setupResumeBar` (manages resume bar state transition), `_wireVideoEvents` (binds/unbinds all listeners returning a cleanup function), and `_createVideoScope` (coordinates the above with a clean 3-public-method interface). The cleanup pattern would remain closure-based but would call `_wireVideoEvents.cleanup()` instead of listing 5 `removeEventListener` calls. The `openVideoPlayer` entry point would shrink to ~15 lines: resolve elements, call 4 setup functions in sequence, register cleanup, show modal.

---

## Minor Observations

- **`_sessionStorageSaveError`** (storage.js:27) — name means "save error to storage" but behavior is "warn once on storage failure." Misleading name for a guard method.
- **`setupManifestRetryUI`** (dashboard.js:115) — name says "setup retry UI" but behavior is "clear 5 containers' innerHTML then add retry prompt." The name hides the destructive pre-condition.
- **`buildStorageKey` prefix duplication** — `theme-init.js:8` constructs `(window.__STORAGE_PREFIX || 'apbc:') + 'theme'` instead of calling `buildStorageKey('theme')` (which `theme.js:9` correctly does). Same knowledge in two places.
- **`fetchMarkdown`** (utils.js:19) — mixes path validation (`isSafePath` call — domain-specific) with LRU caching (general-purpose). Minor principle 4 leakage.
- **`getAssetCopyRegistry`** (asset-copy.js:55-57) — 3-line pass-through (`return ASSET_COPY`) called only from `test-hooks.js:15`. Existing only because globals are the alternative.
- **`buildSlidesRow` unbalanced HTML** (assets.js:58-66) — `viewerLink` / `viewerClose` paired conditionals produce valid markup only when both open and close match. An unusual pattern that requires mental verification.

---

## Questions to Consider

1. **What if every file were wrapped in an IIFE?** `manifest.js:14-45` already demonstrates this pattern. Zero build changes. Would instantly fix the information-hiding gap — 9 underscored variables would become truly private. This is the highest-leverage change available.

2. **Would merging 5 reader sub-files into 2-3 reduce cognitive load?** All are called from one function (`_finalizeReaderContent`). `ensureDOMPurifyHooks` (17 lines), `_applyMeetingMaterialsTree` (13 lines of logic), and `buildTableOfContents` (19 lines) don't justify their own files. Only `reader-links.js` (41 lines of non-trivial URL rewriting) earns its own boundary.

3. **Could template HTML be extracted into a minimal partial system?** The inline SVGs in `_downloadIcon()` (assets.js:17-19), repeated `escapeHTML` calls in every builder, and the paired conditional pattern in `buildSlidesRow` all suggest an abstraction gap: a template helper that handles escaping and partials automatically.

4. **Does the duplication between `buildVideoPlaceholder` and `buildSlidesPlaceholder` signal a missed abstraction?** Same structure, same class names, same "Coming Soon" label — only the icon and text differ. This is the kind of copy-paste that, left unaddressed, grows to 3-4 variants as new asset types are added.

---

## Recommended Actions

1. **[P1] IIFE-wrap every file** (follow `manifest.js:14-45` pattern) — fixes principle 3 globally with zero build changes
2. **[P1] Decompose `openVideoPlayer`** into 3-4 sub-functions — reduces cognitive load, enables unit testing
3. **[P1] Extract reusable template partials** for asset HTML building — eliminates repetition in `assets.js`
4. **[P2] Merge thin reader sub-modules** (hooks, tree, toc) into `reader-loader.js`
5. **[P2] Consolidate placeholder templates** into `_buildPlaceholder(emoji, label)`

To fix using APOSD design principles, load the `aposd` skill. It applies the 10 APOSD behavioral rules during implementation. Address findings in the priority order above.

Re-run `aposd critique` after fixes to see your assessment improve.
