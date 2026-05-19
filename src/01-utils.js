        function fetchMarkdown(path, { isReaderLoad = false } = {}) {
            if (!isSafeRepoPath(path)) return Promise.reject(new Error('Unsafe path: ' + path));
            if (mdCache.has(path)) {
                const val = mdCache.get(path);
                mdCache.delete(path);
                mdCache.set(path, val); // LRU move to end
                return val;
            }
            const controller = new AbortController();
            let timeoutId = null;
            if (isReaderLoad) {
                if (activeReaderController) activeReaderController.abort();
                activeReaderController = controller;
                timeoutId = setTimeout(() => controller.abort(), 15000);
            }
            if (mdCache.size >= CONFIG.CACHE_MAX) {
                mdCache.delete(mdCache.keys().next().value);
            }
            const promise = fetch(path, { signal: controller.signal })
                .then(response => {
                    if (timeoutId) clearTimeout(timeoutId);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    return response.text();
                });
            mdCache.set(path, promise);
            promise.catch(() => {
                if (timeoutId) clearTimeout(timeoutId);
                if (mdCache.get(path) === promise) mdCache.delete(path);
            });
            return promise;
        }


        const _HTML_ESCAPE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        function escapeHTML(value) {
            return String(value).replace(/[&<>"']/g, c => _HTML_ESCAPE[c]);
        }

        function formatDuration(seconds) {
            if (!Number.isFinite(seconds)) return '';
            const totalSeconds = Math.round(seconds);
            const hours = Math.floor(totalSeconds / 3600);
            const mins = Math.floor((totalSeconds % 3600) / 60);
            const secs = totalSeconds % 60;
            if (hours > 0) return `${hours}h ${mins}m`;
            return `${mins}m ${secs}s`;
        }

        function formatFileSize(mb) {
            if (!Number.isFinite(mb)) return '';
            if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
            if (mb < 10) return `${mb.toFixed(1)} MB`;
            return `${Math.round(mb)} MB`;
        }

        function buildPPTXViewerURL(path) {
            if (!isSafeAssetPath(path)) return '#';
            return 'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(RAW_CONTENT_BASE + path);
        }

        // Single path validator for both asset and repo paths — eliminates prior three-way drift.
        const _ASSET_ROOTS = new Set(['meetings', 'assets']);
        const _REPO_ROOTS = new Set(['meetings', 'docs', 'templates']);
        function isSafePath(p, kind) {
            if (!p || typeof p !== 'string') return false;
            if (p.length === 0 || p.length > CONFIG.PATH_MAX_LENGTH) return false;
            if (/^[a-z][a-z0-9+.-]*:/i.test(p)) return false;
            if (p.startsWith('//') || p.startsWith('/') || p.startsWith('.')) return false;
            if (p.includes('..')) return false;
            if (/[\\\x00-\x1f]/.test(p)) return false;
            const segments = p.split('/');
            if (segments.some(s => s === '' || s === '.')) return false;
            if (kind === 'asset' || kind === 'any') {
                const isAsset = _ASSET_ROOTS.has(segments[0]) &&
                    /\.(mp4|m4a|pptx|pdf|png|jpg|jpeg|gif|svg|webp)$/i.test(p);
                if (kind === 'asset') return isAsset;
                if (isAsset) return true;
            }
            if (kind === 'repo' || kind === 'any') {
                return !/[^\w.\-/]/.test(p) &&
                    p.endsWith('.md') &&
                    _REPO_ROOTS.has(segments[0]);
            }
            return false;
        }
        function isSafeAssetPath(path) { return isSafePath(path, 'asset'); }
        function isSafeRepoPath(p) { return isSafePath(p, 'repo'); }

        function getVideoResumeKey(filePath) {
            return LS + 'vs:' + filePath;
        }

        function getSavedVideoResumeTime(filePath) {
            try {
                const saved = sessionStorage.getItem(getVideoResumeKey(filePath));
                return saved ? parseFloat(saved) : 0;
            } catch (err) {
                console.debug('sessionStorage read failed:', err?.message);
                return 0;
            }
        }

        function saveVideoResumePosition(filePath, currentTime) {
            const key = getVideoResumeKey(filePath);
            try {
                if (currentTime > CONFIG.RESUME_MIN_SECONDS) {
                    sessionStorage.setItem(key, `${currentTime}`);
                } else {
                    sessionStorage.removeItem(key);
                }
            } catch (err) {
                console.debug('sessionStorage write failed:', err?.message);
            }
        }

        function clearVideoResumePosition(filePath) {
            try {
                sessionStorage.removeItem(getVideoResumeKey(filePath));
            } catch (err) {
                console.debug('sessionStorage clear failed:', err?.message);
            }
        }
