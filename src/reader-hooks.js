/**
 * Reader hooks: installs DOMPurify hooks to sanitize links and attributes after markdown is sanitized.
 *
 * Public API:
 * - ensureDOMPurifyHooks(): installs afterSanitizeAttributes hook
 *
 * Side-effects: mutates anchor attributes, may remove hrefs for disallowed hosts.
 */
/** Only these external hosts may appear in markdown links: our GitHub Pages origin, the Office viewer, and GitHub.com for source references. */
const _ALLOWED_EXTERNAL_HOSTS = /^https?:\/\/(mhenke\.github\.io|view\.officeapps\.live\.com|github\.com)\//i;

/** Installs DOMPurify afterSanitizeAttributes hook: strips external links outside the allowlist, adds target=_blank + rel=noopener for allowed ones. Runs once via callOnce. */
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
