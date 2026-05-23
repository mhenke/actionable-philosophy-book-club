        /**
         * Parses window.location.hash for `#p=path/to/file.md` routes. Validates
         * the path with isSafeRepoPath, extracts an optional trailing #anchor,
         * and dispatches to loadPage or navigateToDashboard on failure/invalid hash.
         */
        function handleRoute() {
            const hash = window.location.hash;
            if (hash.startsWith('#p=')) {
                let fullPath;
                try { fullPath = decodeURIComponent(hash.slice(3)); }
                catch (e) { navigateToDashboard(); return; }
                const lastHashIndex = fullPath.lastIndexOf('#');
                const path = lastHashIndex > 0 ? fullPath.substring(0, lastHashIndex) : fullPath;
                if (!isSafeRepoPath(path)) {
                    showToast('Invalid document path');
                    navigateToDashboard();
                    return;
                }
                const anchorId = lastHashIndex > 0 ? fullPath.substring(lastHashIndex + 1) : null;
                loadPage(path, anchorId).catch(err => {
                    console.error('loadPage failed:', err?.message || err);
                    showToast('Document unavailable');
                    navigateToDashboard();
                });
            } else {
                navigateToDashboard();
            }
        }

        window.addEventListener('hashchange', handleRoute);
