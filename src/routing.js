/**
 * Hash router: parses window.location.hash and dispatches to registered route handlers.
 *
 * Public API:
 * - registerRoute(name, handler)
 * - handleRoute()
 *
 * Side-effects: reads window.location.hash and calls handlers; performs path validation.
 */
(function() {
'use strict';
const _routeHandlers = {};

/** Registers a named route handler (e.g., 'reader', 'default'). Silently ignores invalid handlers. */
function registerRoute(name, handler) {
    if (typeof handler !== 'function') return;
    _routeHandlers[name] = handler;
}

/** Parses window.location.hash, validates path, dispatches to registered handler. */
function handleRoute() {
    const hash = window.location.hash;
    if (hash.startsWith('#p=')) {
        let fullPath;
        try { fullPath = decodeURIComponent(hash.slice(3)); }
        catch (e) { _routeHandlers.default?.(); return; }
        const lastHashIndex = fullPath.lastIndexOf('#');
        const path = lastHashIndex > 0 ? fullPath.substring(0, lastHashIndex) : fullPath;
        if (!isSafePath(path, DOMAIN.REPO)) {
            showToast('Invalid document path');
            _routeHandlers.default?.();
            return;
        }
        const anchorId = lastHashIndex > 0 ? fullPath.substring(lastHashIndex + 1) : null;
        const handler = _routeHandlers.reader || _routeHandlers.default;
        handler(path, anchorId);
    } else {
        _routeHandlers.default?.();
    }
}

/** Binds hashchange listener to trigger route handling on navigation. */
function initRouting() {
    window.addEventListener('hashchange', handleRoute);
}

window.registerRoute = registerRoute;
window.handleRoute = handleRoute;
window.initRouting = initRouting;
})();
