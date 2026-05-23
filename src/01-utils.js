        /** Fetches and caches markdown content via mdCache Map with LRU eviction at CACHE_MAX (20). */
        function fetchMarkdown(path, signal) {
            if (!isSafeRepoPath(path)) return Promise.reject(new Error('Unsafe path: ' + path));
            if (mdCache.has(path)) {
                const val = mdCache.get(path);
                mdCache.delete(path);
                mdCache.set(path, val);
                return val;
            }
            if (mdCache.size >= CONFIG.CACHE_MAX) {
                mdCache.delete(mdCache.keys().next().value);
            }
            const promise = fetch(path, { signal })
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    return response.text();
                });
            mdCache.set(path, promise);
            promise.catch(() => {
                if (mdCache.get(path) === promise) mdCache.delete(path);
            });
            return promise;
        }

        const _guarded = new WeakMap();
        /** One-shot guard using WeakMap. Returns true first time, false thereafter. */
        function guard(key) {
            if (_guarded.has(key)) return false;
            _guarded.set(key, true);
            return true;
        }
