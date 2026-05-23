/**
 * Reader loader: fetches, parses, sanitizes, and renders markdown into the reader view.
 *
 * Public API:
 * - loadPage(path, anchorId): async; renders a markdown document into #markdown-content
 *
 * Side-effects: uses marked and DOMPurify, mutates reader DOM and readerStatus.
 */
(function() {
'use strict';
let _activeReaderController = null;
let _loadPageGeneration = 0;

const _ALLOWED_EXTERNAL_HOSTS = /^https?:\/\/(mhenke\.github\.io|view\.officeapps\.live\.com|github\.com)\//i;

function ensureDOMPurifyHooks() {
    if (!callOnce(ensureDOMPurifyHooks)) return;
    DOMPurify.addHook('afterSanitizeAttributes', node => {
        if (node.tagName !== 'A') return;
        const href = node.getAttribute('href') || '';
        if (/^https?:/i.test(href)) {
            if (!_ALLOWED_EXTERNAL_HOSTS.test(href)) {
                node.removeAttribute('href');
                node.setAttribute('aria-disabled', 'true');
                node.setAttribute('title', 'Link target is not in the allowlist');
                return;
            }
            node.setAttribute('target', '_blank');
            node.setAttribute('rel', 'noopener noreferrer');
        }
    });
}

function _scrollToElement(el) {
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });

    // Calculate and apply an explicit scroll position that accounts for
    // a sticky header. scrollIntoView has inconsistent offset behavior
    // across browsers when a sticky header overlaps content, so compute
    // the target manually.
    const header = document.querySelector('#reader-view header.sticky') || document.querySelector('header.sticky') || document.querySelector('header');
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const targetTop = window.scrollY + el.getBoundingClientRect().top - headerHeight - 8; // 8px breathing room
    window.scrollTo({ top: Math.max(0, Math.round(targetTop)), behavior: 'smooth' });
}

function buildTableOfContents(h2Elements) {
    if (h2Elements.length < 2) return null;
    const tocItems = Array.from(h2Elements).map((h2, idx) => {
        if (!h2.id) {
            h2.id = h2.textContent.trim().toLowerCase()
                .replace(/[^a-z0-9_-]+/g, '-')
                .replace(/^-+|-+$/g, '') || `section-${idx}`;
        }
        return `<li><a href="#${h2.id}" class="text-spectrum-2 hover:underline flex items-center gap-2" style="font-size:0.8125rem; font-weight:400;"><span style="opacity:0.6;font-size:0.75rem;">\u21b3</span> ${h2.textContent.trim()}</a></li>`;
    }).join('');

    return `
                <nav class="toc-container mb-8 p-5 rounded border" style="background: var(--materials-panel-bg); border-color: var(--border-low);" aria-label="Table of contents">
                    <p class="text-[0.6875rem] font-bold uppercase tracking-[0.2em] mb-3" style="color: var(--text-muted); margin-top:0;">Contents</p>
                    <ul class="space-y-2" style="margin: 0; padding: 0; list-style-type: none;">
                        ${tocItems}
                    </ul>
                </nav>`;
}

function _renderFileTree(ul, prefix, depth) {
    const items = Array.from(ul.children);
    for (const [i, li] of items.entries()) {
        if (li.querySelector(':scope > .tree-connector')) continue;
        const firstAnchor = li.querySelector(':scope > a');
        if (firstAnchor) {
            const href = firstAnchor.getAttribute('href') || '';
            if (href.endsWith('/') || !href) {
                const span = document.createElement('span');
                span.className = firstAnchor.className || '';
                span.innerHTML = firstAnchor.innerHTML;
                li.replaceChild(span, firstAnchor);
            }
        }
        const isLast = i === items.length - 1;
        const connector = isLast ? '\u2514\u2500\u2500 ' : '\u251c\u2500\u2500 ';
        const childPrefix = prefix + (isLast ? '     ' : '\u2502   ');
        const pre = document.createElement('span');
        pre.className = 'tree-connector';
        pre.textContent = prefix + connector;
        li.insertBefore(pre, li.firstChild);
        li.setAttribute('role', 'treeitem');
        li.setAttribute('aria-level', depth + 1);
        const nested = li.querySelector(':scope > ul');
        if (nested) {
            li.setAttribute('aria-expanded', 'true');
            nested.setAttribute('role', 'group');
            _renderFileTree(nested, childPrefix, depth + 1);
        }
        li.classList.add(nested ? 'tree-folder' : 'tree-file');
    }
}

function _applyMeetingMaterialsTree(container) {
    container.querySelectorAll('h2').forEach(h2 => {
        if (!/meeting materials/i.test(h2.textContent)) return;
        let el = h2.nextElementSibling;
        while (el && el.tagName !== 'H2') {
            if (el.tagName === 'UL') {
                el.classList.add('materials-panel');
                el.setAttribute('role', 'tree');
                el.setAttribute('aria-label', 'Meeting Materials');
                _renderFileTree(el, '', 0);
            }
            el = el.nextElementSibling;
        }
    });
}

function _showReaderUnavailable() {
    if (markdownContent) markdownContent.innerHTML = '<p>Reader unavailable: required libraries could not be loaded. Check your connection and try reloading the page.</p>';
    setView('reader');
}

function _setupReaderLoading() {
    setView('reader');
    markdownContent.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    readerStatus.textContent = 'Loading document...';
    markdownContent.setAttribute('aria-busy', 'true');
    markdownContent.innerHTML = '<div class="py-12 text-center text-sm uppercase tracking-widest text-muted animate-pulse">Loading session notes&hellip;</div>';
}

function _finalizeReaderContent(sanitized, path, anchorId) {
    markdownContent.innerHTML = sanitized;

    for (const img of markdownContent.querySelectorAll('img')) {
        if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
        if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    }

    rewriteContentLinks(markdownContent, path);

    const h2Elements = markdownContent.querySelectorAll('h2');
    const h1 = markdownContent.querySelector('h1');
    if (h1) {
        document.title = `${h1.textContent.trim()} | Actionable Philosophy Book Club`;
        markdownContent.setAttribute('aria-label', h1.textContent.trim());
        const readerDocLabel = document.getElementById('reader-doc-label');
        if (readerDocLabel) readerDocLabel.textContent = h1.textContent.trim();

        const tocHtml = buildTableOfContents(h2Elements);
        if (tocHtml) {
            const tocDiv = document.createElement('div');
            tocDiv.innerHTML = tocHtml;
            tocDiv.querySelectorAll('a').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = anchor.getAttribute('href').substring(1);
                    const targetEl = document.getElementById(targetId);
                    if (targetEl) _scrollToElement(targetEl);
                });
            });
            h1.parentNode.insertBefore(tocDiv.firstElementChild, h1.nextSibling);
        }
    }

    _applyMeetingMaterialsTree(markdownContent);
    if (anchorId) {
        requestAnimationFrame(() => {
            const el = document.getElementById(anchorId);
            if (el) _scrollToElement(el);
        });
    }
    readerStatus.textContent = 'Document loaded.';
}

/** Shows retry/back UI when document load fails. */
function _showReaderError(path, anchorId, { message = 'Document unavailable.' } = {}) {
    showRetryUI(markdownContent, {
        message: message,
        retryLabel: 'Try again',
        onRetry: () => loadPage(path, anchorId),
        backLabel: 'Return to Dashboard',
        onBack: navigateToDashboard,
    });
    readerStatus.textContent = message;
}

/**
 * Fetches, parses, sanitizes, and renders a markdown file into the reader view.
 * Manages concurrency via generation counter and AbortController, with a 15s timeout.
 */
async function loadPage(path, anchorId) {
    const myGeneration = ++_loadPageGeneration;

    if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
        _showReaderUnavailable();
        return;
    }
    _setupReaderLoading();

    if (_activeReaderController) _activeReaderController.abort();
    const controller = new AbortController();
    _activeReaderController = controller;
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        const text = await fetchMarkdown(path, controller.signal);
        if (myGeneration !== _loadPageGeneration) return;
        ensureDOMPurifyHooks();
        const sanitized = DOMPurify.sanitize(marked.parse(text), {
            FORBID_TAGS: ['style', 'iframe', 'form', 'object', 'embed'],
            FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'oninput', 'onmouseover', 'onmouseenter', 'onfocus', 'onkeydown', 'onkeyup'],
        });
        _finalizeReaderContent(sanitized, path, anchorId);
    } catch (err) {
        if (myGeneration !== _loadPageGeneration) return;
        window.ErrorHandler?.warn('loadPage failed:', { err });
        _showReaderError(path, anchorId);
    } finally {
        clearTimeout(timeoutId);
        if (myGeneration === _loadPageGeneration) {
            markdownContent.setAttribute('aria-busy', 'false');
            _activeReaderController = null;
        }
    }
}

window.loadPage = loadPage;
})();
