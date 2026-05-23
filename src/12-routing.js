const _routeHandlers = {};

function registerRoute(name, handler) {
    _routeHandlers[name] = handler;
}

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

function initRouting() {
    window.addEventListener('hashchange', handleRoute);
}
