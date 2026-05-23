const _ASSET_ROOTS = new Set(['meetings', 'assets']);
const _REPO_ROOTS = new Set(['meetings', 'docs', 'templates']);
/**
 * @param {string} p - Path to validate
 * @param {'asset'|'repo'|'any'} domain - Validation domain ruleset
 * Validates file paths against security rules: protocol check, path traversal
 * prevention, null byte detection, and domain-specific root + extension rules.
 */
function isSafePath(p, domain) {
    if (!p || typeof p !== 'string') return false;
    if (p.length === 0 || p.length > CONFIG.PATH_MAX_LENGTH) return false;
    if (/^[a-z][a-z0-9+.-]*:/i.test(p)) return false;
    if (p.startsWith('//') || p.startsWith('/') || p.startsWith('.')) return false;
    if (p.includes('..')) return false;
    if (/[\\\x00-\x1f]/.test(p)) return false;
    const segments = p.split('/');
    if (segments.some(s => s === '' || s === '.')) return false;
    if (domain === 'asset' || domain === 'any') {
        const isAsset = _ASSET_ROOTS.has(segments[0]) &&
            /\.(mp4|m4a|pptx|pdf|png|jpg|jpeg|gif|svg|webp)$/i.test(p);
        if (domain === 'asset') return isAsset;
        if (isAsset) return true;
    }
    if (domain === 'repo' || domain === 'any') {
        return !/[^\w.\-/]/.test(p) &&
            p.endsWith('.md') &&
            _REPO_ROOTS.has(segments[0]);
    }
    return false;
}
/** Delegates to isSafePath with asset-domain rules: meetings/ or assets/ root + known media extension. */
function isSafeAssetPath(path) { return isSafePath(path, 'asset'); }
/** Delegates to isSafePath with repo-domain rules: meetings/, docs/, or templates/ root + .md extension. */
function isSafeRepoPath(p) { return isSafePath(p, 'repo'); }
