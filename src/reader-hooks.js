const _ALLOWED_EXTERNAL_HOSTS = /^https?:\/\/(mhenke\.github\.io|view\.officeapps\.live\.com|github\.com)\//i;

/** One-shot DOMPurify hook registration: strips external links outside allowlist, adds rel=noopener. */
function ensureDOMPurifyHooks() {
    if (!guard(ensureDOMPurifyHooks)) return;
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
