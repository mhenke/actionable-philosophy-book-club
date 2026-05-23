function _disableLink(link, title) {
    link.removeAttribute('href');
    link.setAttribute('aria-disabled', 'true');
    if (title) link.setAttribute('title', title);
}

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

            if (/\.pptx?$/i.test(repoPath)) {
                link.setAttribute('href', buildPPTXViewerURL(repoPath));
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            } else if (/\.(png|jpe?g|gif|webp)$/i.test(repoPath)) {
                link.setAttribute('href', repoPath);
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            } else {
                link.setAttribute('href', repoPath);
            }
        } catch (e) {
            console.warn('rewriteContentLinks: skipped malformed link', e?.message);
        }
    }
}
