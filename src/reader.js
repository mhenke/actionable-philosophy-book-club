/**
 * Reader: consolidated markdown reader pipeline.
 *
 * Fetches markdown (with LRU cache), parses with marked, sanitizes with DOMPurify,
 * renders into #markdown-content, rewrites links, builds table of contents,
 * and applies meeting materials file tree. Self-contained — inlines all reader-specific
 * dependencies: fetchMarkdown (LRU), callOnce guard, path validation, link rewriting,
 * viewer routing (PPTX/image classification), DOMPurify sanitize hooks, TOC builder,
 * file tree renderer, and scroll-to-anchor with sticky header offset.
 *
 * Public API:
 *   loadMarkdownPage(path, anchorId) → Promise<void>
 *
 * Dependencies (globals, set by other modules):
 *   window.marked, window.DOMPurify, window.DOM, window.setView,
 *   window.showRetryUI, window.navigateToDashboard
 *
 * Side-effects: mutates reader DOM and readerStatus.
 */
(function() {
'use strict';

// ======================================================================
//  DOM references
// ======================================================================

const { markdownContent, readerStatus } = window.DOM;

// ======================================================================
//  Constants
// ======================================================================

const CACHE_MAX = 20;
const PATH_MAX_LENGTH = 256;
const _ASSET_ROOTS = new Set(['meetings', 'assets']);
const _REPO_ROOTS = new Set(['meetings', 'docs', 'templates']);
const DOMAIN = Object.freeze({ REPO: 'repo', ASSET: 'asset' });
const REL_EXTERNAL = 'noopener noreferrer';
const OFFICE_VIEWER_ORIGIN = 'https://view.officeapps.live.com';

const _SANITIZE_OPTIONS = {
    FORBID_TAGS: ['style', 'iframe', 'form', 'object', 'embed'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'oninput', 'onmouseover', 'onmouseenter', 'onfocus', 'onkeydown', 'onkeyup'],
};

const _ALLOWED_EXTERNAL_HOSTS = (function() {
    const officeHost = new URL(OFFICE_VIEWER_ORIGIN).hostname;
    const otherHosts = 'mhenke\\.github\\.io|github\\.com|dl\\.acm\\.org|www\\.cs\\.colostate\\.edu|doi\\.org|bugcounting\\.net|dmtopolog\\.com|stripe\\.com|arxiv\\.org|pinzger\\.github\\.io|www\\.inf\\.usi\\.ch|lemire\\.me|docs\\.oracle\\.com|dev\\.to';
    return new RegExp('^https?:\\/\\/(' + officeHost + '|' + otherHosts + ')\\/', 'i');
})();

// ======================================================================
//  HTML escaping (for retry UI message)
// ======================================================================

const _HTML_ESCAPE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function(c) { return _HTML_ESCAPE[c]; });
}

// ======================================================================
//  Path validation (isSafePath + DOMAIN)
// ======================================================================

function isSafePath(p, domain) {
    if (!p || typeof p !== 'string') return false;
    if (p.length === 0 || p.length > PATH_MAX_LENGTH) return false;
    if (/^[a-z][a-z0-9+.-]*:/i.test(p)) return false;
    if (p.startsWith('//') || p.startsWith('/') || p.startsWith('.')) return false;
    if (p.includes('..')) return false;
    if (/[\\\x00-\x1f]/.test(p)) return false;
    var segments = p.split('/');
    if (segments.some(function(s) { return s === '' || s === '.'; })) return false;
    if (domain === DOMAIN.ASSET) {
        return _ASSET_ROOTS.has(segments[0]) &&
            /\.(mp4|m4a|pptx|pdf|png|jpg|jpeg|gif|svg|webp)$/i.test(p);
    }
    if (domain === DOMAIN.REPO) {
        return !/[^\w.\-/]/.test(p) &&
            p.endsWith('.md') &&
            _REPO_ROOTS.has(segments[0]);
    }
    return false;
}

// ======================================================================
//  LRU markdown cache + callOnce guard
// ======================================================================

var _mdCache = new Map();
var _called = new WeakMap();

function callOnce(key) {
    if (_called.has(key)) return false;
    _called.set(key, true);
    return true;
}

/**
 * Fetches markdown with a 20-entry LRU cache. Caches promises, not just values.
 * Automatically evicts on reject to avoid caching errors.
 * @param {string} path - Validated repo path
 * @param {AbortSignal} [signal] - Optional AbortController signal
 * @returns {Promise<string>}
 */
function fetchMarkdown(path, signal) {
    if (!isSafePath(path, DOMAIN.REPO)) return Promise.reject(new Error('Unsafe path: ' + path));
    if (_mdCache.has(path)) {
        var val = _mdCache.get(path);
        _mdCache.delete(path);
        _mdCache.set(path, val);
        return val;
    }
    if (_mdCache.size >= CACHE_MAX) {
        _mdCache.delete(_mdCache.keys().next().value);
    }
    var promise = fetch(path, { signal: signal })
        .then(function(response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.text();
        });
    _mdCache.set(path, promise);
    promise.catch(function() {
        if (_mdCache.get(path) === promise) _mdCache.delete(path);
    });
    return promise;
}

// ======================================================================
//  Viewer routing (getViewerDestination)
// ======================================================================

function getViewerDestination(path) {
    var type = window.classify(path);
    if (type === 'slides') {
        return { url: window.buildPPTXViewerURL(path), target: '_blank', rel: REL_EXTERNAL };
    }
    if (type === 'image') {
        return { url: path, target: '_blank', rel: REL_EXTERNAL };
    }
    return { url: path };
}

// ======================================================================
//  Link rewriting
// ======================================================================

function _disableLink(link, title) {
    link.removeAttribute('href');
    link.setAttribute('aria-disabled', 'true');
    if (title) link.setAttribute('title', title);
}

function rewriteContentLinks(container, docPath) {
    var siteRoot = window.location.pathname.replace(/[^/]*$/, '');
    var links = container.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        try {
            var href = link.getAttribute('href');
            if (!href || /^https?:/i.test(href)) continue;
            if (href.startsWith('#')) continue;

            var base = new URL(docPath, window.location.href);
            var resolved = new URL(href, base);
            var repoPath = resolved.pathname.startsWith(siteRoot)
                ? resolved.pathname.slice(siteRoot.length)
                : resolved.pathname.slice(1);

            if (href.endsWith('/')) {
                _disableLink(link, 'Folder (not a navigable file)');
                continue;
            }

            if (href.endsWith('.md')) {
                if (!isSafePath(repoPath, DOMAIN.REPO)) {
                    _disableLink(link, 'Link target is outside allowed directories');
                    continue;
                }
                link.setAttribute('href', '#p=' + repoPath);
                continue;
            }

            if (!isSafePath(repoPath, DOMAIN.ASSET)) {
                _disableLink(link, '');
                continue;
            }

            var dest = getViewerDestination(repoPath);
            link.setAttribute('href', dest.url);
            if (dest.target) link.setAttribute('target', dest.target);
            if (dest.rel) link.setAttribute('rel', dest.rel);
        } catch (e) {
            if (window.ErrorHandler) window.ErrorHandler.warn('rewriteContentLinks: skipped malformed link', { err: e });
        }
    }
}

// ======================================================================
//  DOMPurify hooks
// ======================================================================

function ensureDOMPurifyHooks() {
    if (!callOnce(ensureDOMPurifyHooks)) return;
    window.DOMPurify.addHook('afterSanitizeAttributes', function(node) {
        if (node.tagName !== 'A') return;
        var href = node.getAttribute('href') || '';
        if (/^https?:/i.test(href)) {
            if (!_ALLOWED_EXTERNAL_HOSTS.test(href)) {
                node.removeAttribute('href');
                node.setAttribute('aria-disabled', 'true');
                node.setAttribute('title', 'Link target is not in the allowlist');
                return;
            }
            node.setAttribute('target', '_blank');
            node.setAttribute('rel', REL_EXTERNAL);
        }
    });
}

// ======================================================================
//  Concurrency state
// ======================================================================

var _loadPageGeneration = 0;
var _activeReaderController = null;

// ======================================================================
//  Scroll helper (sticky header offset)
// ======================================================================

function _scrollToElement(el) {
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });

    var header = document.querySelector('#reader-view header.sticky') ||
                 document.querySelector('header.sticky') ||
                 document.querySelector('header');
    var headerHeight = header ? header.getBoundingClientRect().height : 0;
    var targetTop = window.scrollY + el.getBoundingClientRect().top - headerHeight - 8;
    window.scrollTo({ top: Math.max(0, Math.round(targetTop)), behavior: 'smooth' });
}

// ======================================================================
//  Table of contents builder
// ======================================================================

function buildTableOfContents(h2Elements) {
    if (h2Elements.length < 2) return null;

    var items = [];
    for (var i = 0; i < h2Elements.length; i++) {
        var h2 = h2Elements[i];
        if (!h2.id) {
            h2.id = h2.textContent.trim().toLowerCase()
                .replace(/[^a-z0-9_-]+/g, '-')
                .replace(/^-+|-+$/g, '') || 'section-' + i;
        }
        items.push('<li><a href="#' + h2.id + '" class="text-spectrum-2 hover:underline flex items-center gap-2" style="font-size:0.8125rem; font-weight:400;"><span style="opacity:0.6;font-size:0.75rem;">\u21b3</span> ' + h2.textContent.trim() + '</a></li>');
    }

    return '\n                <nav class="toc-container mb-8 p-5 rounded border" style="background: var(--materials-panel-bg); border-color: var(--border-low);" aria-label="Table of contents">\n                    <p class="text-[0.6875rem] font-bold uppercase tracking-[0.2em] mb-3" style="color: var(--text-muted); margin-top:0;">Contents</p>\n                    <ul class="space-y-2" style="margin: 0; padding: 0; list-style-type: none;">\n                        ' + items.join('') + '\n                    </ul>\n                </nav>';
}

// ======================================================================
//  File tree rendering (for Meeting Materials)
// ======================================================================

function _renderFileTree(ul, prefix, depth) {
    var items = Array.from(ul.children);
    for (var i = 0; i < items.length; i++) {
        var li = items[i];
        if (li.querySelector(':scope > .tree-connector')) continue;

        var firstAnchor = li.querySelector(':scope > a');
        if (firstAnchor) {
            var href = firstAnchor.getAttribute('href') || '';
            if (href.endsWith('/') || !href) {
                var span = document.createElement('span');
                span.className = firstAnchor.className || '';
                span.innerHTML = firstAnchor.innerHTML;
                li.replaceChild(span, firstAnchor);
            }
        }

        var isLast = i === items.length - 1;
        var connector = isLast ? '\u2514\u2500\u2500 ' : '\u251c\u2500\u2500 ';
        var childPrefix = prefix + (isLast ? '     ' : '\u2502   ');

        var pre = document.createElement('span');
        pre.className = 'tree-connector';
        pre.textContent = prefix + connector;
        li.insertBefore(pre, li.firstChild);

        li.setAttribute('role', 'treeitem');
        li.setAttribute('aria-level', depth + 1);

        var nested = li.querySelector(':scope > ul');
        if (nested) {
            li.setAttribute('aria-expanded', 'true');
            nested.setAttribute('role', 'group');
            _renderFileTree(nested, childPrefix, depth + 1);
        }
        li.classList.add(nested ? 'tree-folder' : 'tree-file');
    }
}

function _applyMeetingMaterialsTree(container) {
    var h2s = container.querySelectorAll('h2');
    for (var j = 0; j < h2s.length; j++) {
        var h2 = h2s[j];
        if (!/meeting materials/i.test(h2.textContent)) continue;
        var el = h2.nextElementSibling;
        while (el && el.tagName !== 'H2') {
            if (el.tagName === 'UL') {
                el.classList.add('materials-panel');
                el.setAttribute('role', 'tree');
                el.setAttribute('aria-label', 'Meeting Materials');
                _renderFileTree(el, '', 0);
            }
            el = el.nextElementSibling;
        }
    }
}

// ======================================================================
//  Content finalization (render markdown, rewrite links, build TOC,
//  apply file tree, scroll to anchor)
// ======================================================================

function _finalizeReaderContent(sanitized, path, anchorId) {
    markdownContent.innerHTML = sanitized;

    var imgs = markdownContent.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
        var img = imgs[i];
        if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
        if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    }

    rewriteContentLinks(markdownContent, path);

    var h2Elements = markdownContent.querySelectorAll('h2');
    var h1 = markdownContent.querySelector('h1');
    if (h1) {
        document.title = h1.textContent.trim() + ' | Actionable Philosophy Book Club';
        markdownContent.setAttribute('aria-label', h1.textContent.trim());
        var readerDocLabel = document.getElementById('reader-doc-label');
        if (readerDocLabel) readerDocLabel.textContent = h1.textContent.trim();

        var tocHtml = buildTableOfContents(h2Elements);
        if (tocHtml) {
            var tocDiv = document.createElement('div');
            tocDiv.innerHTML = tocHtml;
            var tocLinks = tocDiv.querySelectorAll('a');
            for (var j = 0; j < tocLinks.length; j++) {
                tocLinks[j].addEventListener('click', function(e) {
                    e.preventDefault();
                    var targetId = this.getAttribute('href').substring(1);
                    var targetEl = document.getElementById(targetId);
                    if (targetEl) _scrollToElement(targetEl);
                });
            }
            h1.parentNode.insertBefore(tocDiv.firstElementChild, h1.nextSibling);
        }
    }

    _applyMeetingMaterialsTree(markdownContent);

    if (anchorId) {
        requestAnimationFrame(function() {
            var el = document.getElementById(anchorId);
            if (el) _scrollToElement(el);
        });
    }

    readerStatus.textContent = 'Document loaded.';
}

// ======================================================================
//  Error / status UI
// ======================================================================

function _showReaderUnavailable() {
    if (markdownContent) {
        markdownContent.innerHTML = '<p>Reader unavailable: required libraries could not be loaded. Check your connection and try reloading the page.</p>';
    }
    window.setView('reader');
}

function _setupReaderLoading() {
    window.setView('reader');
    markdownContent.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    readerStatus.textContent = 'Loading document...';
    markdownContent.setAttribute('aria-busy', 'true');
    markdownContent.innerHTML = '<div class="py-12 text-center text-sm uppercase tracking-widest text-muted animate-pulse">Loading session notes&hellip;</div>';
}

function _showReaderError(path, anchorId, opts) {
    if (!opts) opts = {};
    window.showRetryUI(markdownContent, {
        message: opts.message || 'Document unavailable.',
        retryLabel: 'Try again',
        onRetry: function() { loadMarkdownPage(path, anchorId); },
        backLabel: 'Return to Dashboard',
        onBack: window.navigateToDashboard,
    });
    readerStatus.textContent = opts.message || 'Document unavailable.';
}

// ======================================================================
//  Pipeline
// ======================================================================

function _isCurrentReaderGeneration(ctx) {
    return typeof ctx.generation !== 'number' || ctx.generation === _loadPageGeneration;
}

async function runPipeline(ctx, stages) {
    var current = ctx;
    for (var k = 0; k < stages.length; k++) {
        if (!_isCurrentReaderGeneration(current)) return current;
        current = (await stages[k](current)) || current;
    }
    return current;
}

async function fetchStage(ctx) {
    ctx.text = await fetchMarkdown(ctx.path, ctx.signal);
    return ctx;
}

async function parseSanitizeStage(ctx) {
    ctx.sanitized = window.DOMPurify.sanitize(window.marked.parse(ctx.text), _SANITIZE_OPTIONS);
    return ctx;
}

async function renderStage(ctx) {
    _finalizeReaderContent(ctx.sanitized, ctx.path, ctx.anchorId);
    return ctx;
}

// ======================================================================
//  Public API
// ======================================================================

/**
 * Fetches, parses, sanitizes, and renders a markdown file into the reader view.
 * Manages concurrency via generation counter and AbortController, with a 15s timeout.
 *
 * @param {string} path - Relative path to the markdown file (e.g. "meetings/meeting-01/README.md")
 * @param {string} [anchorId] - Optional heading ID to scroll to after render
 * @returns {Promise<void>}
 */
async function loadMarkdownPage(path, anchorId) {
    var myGeneration = ++_loadPageGeneration;

    if (typeof window.marked === 'undefined' || typeof window.DOMPurify === 'undefined') {
        _showReaderUnavailable();
        return;
    }

    ensureDOMPurifyHooks();
    _setupReaderLoading();

    if (_activeReaderController) _activeReaderController.abort();
    var controller = new AbortController();
    _activeReaderController = controller;
    var timeoutId = setTimeout(function() { controller.abort(); }, 15000);

    var ctx = {
        path: path,
        anchorId: anchorId,
        generation: myGeneration,
        signal: controller.signal,
        text: '',
        sanitized: '',
    };

    try {
        await runPipeline(ctx, [fetchStage, parseSanitizeStage, renderStage]);
    } catch (err) {
        if (myGeneration !== _loadPageGeneration) return;
        if (window.ErrorHandler) window.ErrorHandler.warn('loadMarkdownPage failed:', { err: err });
        _showReaderError(path, anchorId);
    } finally {
        clearTimeout(timeoutId);
        if (myGeneration === _loadPageGeneration) {
            markdownContent.setAttribute('aria-busy', 'false');
            _activeReaderController = null;
        }
    }
}

// ======================================================================
//  Exports
// ======================================================================

window.loadMarkdownPage = loadMarkdownPage;

if (window.__TEST__) {
    window.__readerPipeline = {
        runPipeline: runPipeline,
        fetchStage: fetchStage,
        parseSanitizeStage: parseSanitizeStage,
        renderStage: renderStage,
    };
}
})();
