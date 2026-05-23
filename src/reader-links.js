/**
 * Content link rewriter: rewrites and disables links in rendered markdown to maintain safe navigation.
 *
 * Public API:
 * - rewriteContentLinks(container, docPath)
 * - _disableLink(link, title)
 *
 * Side-effects: may remove hrefs and set aria-disabled on unsafe links.
 */
(function() {
'use strict';
function _disableLink(link, title) {
    link.removeAttribute('href');
    link.setAttribute('aria-disabled', 'true');
    if (title) link.setAttribute('title', title);
}

/** Rewrites <a> hrefs in rendered content: .md → #p=, viewer files → viewer.js routing, unsafe paths disabled. */
function rewriteContentLinks(container, docPath) {
    const siteRoot = window.location.pathname.replace(/[^/]*$/, '');
    for (const link of container.querySelectorAll('a')) {
        try {
            const href = link.getAttribute('href');
            if (!href || /^https?:/i.test(href)) continue;
            if (href.startsWith('#')) continue;

            const base = new URL(docPath, window.location.href);
            const resolved = new URL(href, base);
            const repoPath = resolved.pathname.startsWith(siteRoot)
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

            const dest = getViewerDestination(repoPath);
            link.setAttribute('href', dest.url);
            if (dest.target) link.setAttribute('target', dest.target);
            if (dest.rel) link.setAttribute('rel', dest.rel);
        } catch (e) {
            window.ErrorHandler?.warn('rewriteContentLinks: skipped malformed link', { err: e });
        }
    }
}

window.rewriteContentLinks = rewriteContentLinks;
})();
