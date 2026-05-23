const _ASSET_ROOTS = new Set(['meetings', 'assets']);
const _REPO_ROOTS = new Set(['meetings', 'docs', 'templates']);
/** Domain enum for isSafePath: restricts validation to repo paths, asset paths, or either. */
const DOMAIN = Object.freeze({ REPO: 'repo', ASSET: 'asset', ANY: 'any' });
const PATH_MAX_LENGTH = 256;
/**
 * Validates a path against security rules and domain constraints.
 * Rejects protocol URLs, traversal, absolute paths, control chars, invalid extensions, and disallowed roots.
 * @param {string} p - Relative path to validate
 * @param {'repo'|'asset'|'any'} domain - Restricts validation scope
 * @returns {boolean} True if path is safe
 */
function isSafePath(p, domain) {
    if (!p || typeof p !== 'string') return false;
    if (p.length === 0 || p.length > PATH_MAX_LENGTH) return false;
    if (/^[a-z][a-z0-9+.-]*:/i.test(p)) return false;
    if (p.startsWith('//') || p.startsWith('/') || p.startsWith('.')) return false;
    if (p.includes('..')) return false;
    if (/[\\\x00-\x1f]/.test(p)) return false;
    const segments = p.split('/');
    if (segments.some(s => s === '' || s === '.')) return false;
    if (domain === DOMAIN.ASSET || domain === DOMAIN.ANY) {
        const isAsset = _ASSET_ROOTS.has(segments[0]) &&
            /\.(mp4|m4a|pptx|pdf|png|jpg|jpeg|gif|svg|webp)$/i.test(p);
        if (domain === DOMAIN.ASSET) return isAsset;
        if (isAsset) return true;
    }
    if (domain === DOMAIN.REPO || domain === DOMAIN.ANY) {
        return !/[^\w.\-/]/.test(p) &&
            p.endsWith('.md') &&
            _REPO_ROOTS.has(segments[0]);
    }
    return false;
}
