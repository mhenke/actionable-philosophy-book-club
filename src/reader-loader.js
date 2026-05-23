/**
 * Reader loader: fetches, parses, sanitizes, and renders markdown into the reader view.
 *
 * Public API:
 * - loadPage(path, anchorId): async; renders a markdown document into #markdown-content
 *
 * Side-effects: uses marked and DOMPurify, mutates reader DOM and readerStatus.
 */
let _activeReaderController = null;
let _loadPageGeneration = 0;

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
