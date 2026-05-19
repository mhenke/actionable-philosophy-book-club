        function loadAssetCopyRegistry(assetCopy) {
            const registry = {};
            if (!assetCopy || typeof assetCopy !== 'object' || Array.isArray(assetCopy)) {
                console.warn('Invalid manifest asset copy registry: expected an object. Falling back to defaults.');
                return registry;
            }
            const expectedKeys = Object.keys(DEFAULT_ASSET_COPY);
            const expectedSet = new Set(expectedKeys);
            const missing = expectedKeys.filter(key => !(key in assetCopy));
            const extra = Object.keys(assetCopy).filter(key => !expectedSet.has(key));
            if (missing.length || extra.length) {
                console.warn(`Invalid manifest asset copy registry: ${[
                    missing.length ? `missing ${missing.join(', ')}` : '',
                    extra.length ? `unexpected ${extra.join(', ')}` : ''
                ].filter(Boolean).join('; ')}. Using defaults at render time for missing entries.`);
            }
            for (const key of expectedKeys) {
                const entry = assetCopy[key];
                if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
                const sanitized = {};
                if (typeof entry.label === 'string' && entry.label.trim()) sanitized.label = entry.label;
                if (typeof entry.title === 'string' && entry.title.trim()) sanitized.title = entry.title;
                if (Object.keys(sanitized).length > 0) registry[key] = sanitized;
            }
            return registry;
        }

        function getAssetCopy(type) {
            const entry = ASSET_COPY[type];
            if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
                return { ...(DEFAULT_ASSET_COPY[type] || {}), ...entry };
            }
            return DEFAULT_ASSET_COPY[type] || {};
        }

        async function loadManifest() {
            // Use inlined MANIFEST_DATA when built (production), fall back to fetch for dev
            // window.__MANIFEST_DATA allows test overrides via addInitScript
            const inlineData = window.__MANIFEST_DATA || (typeof MANIFEST_DATA !== 'undefined' ? MANIFEST_DATA : null);
            if (inlineData) {
                const data = inlineData;
                if (!data.meetings || !Array.isArray(data.meetings)) throw new Error('Invalid manifest structure');
                const assetCopy = loadAssetCopyRegistry(data.assetCopy);
                MEETINGS = data.meetings;
                ASSET_COPY = assetCopy;
                if (window.__TEST__ === true) { window.MEETINGS = MEETINGS; window.ASSET_COPY = ASSET_COPY; }
                return;
            }
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            try {
                const response = await fetch('docs/manifest.json', { signal: controller.signal });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                if (!data.meetings || !Array.isArray(data.meetings)) throw new Error('Invalid manifest structure');
                const assetCopy = loadAssetCopyRegistry(data.assetCopy);
                MEETINGS = data.meetings;
                ASSET_COPY = assetCopy;
                if (window.__TEST__ === true) { window.MEETINGS = MEETINGS; window.ASSET_COPY = ASSET_COPY; }
            } finally {
                clearTimeout(timeoutId);
            }
        }

        function showManifestError() {
            const upcomingHeader = document.getElementById('upcoming-card-header');
            const upcomingMaterials = document.getElementById('upcoming-materials-container');
            const upcomingCta = document.getElementById('upcoming-cta');
            const archiveContainer = document.getElementById('archive-cards-container');
            const horizonContainer = document.getElementById('horizon-cards-container');
            if (upcomingHeader) upcomingHeader.innerHTML = `
                <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted mb-3">Couldn't load sessions</p>
                <button id="manifest-retry-btn" class="text-sm uppercase tracking-widest underline" style="color:var(--spectrum-2)">Tap to retry</button>`;
            if (upcomingMaterials) upcomingMaterials.innerHTML = '';
            if (upcomingCta) upcomingCta.innerHTML = '';
            if (archiveContainer) archiveContainer.innerHTML = '';
            if (horizonContainer) {
                horizonContainer.innerHTML = '';
                const horizonSection = horizonContainer.closest('section');
                if (horizonSection) horizonSection.classList.add('hidden-view');
            }
            const retryBtn = document.getElementById('manifest-retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', async () => {
                    retryBtn.textContent = 'Retrying...';
                    retryBtn.disabled = true;
                    try {
                        await loadManifest();
                        if (upcomingHeader) upcomingHeader.innerHTML = '';
                        renderUpcomingMaterials();
                        renderArchiveCards();
                        renderHorizonCards();
                    } catch (err) {
                        console.warn('Manifest retry failed:', err?.message || err);
                        retryBtn.textContent = 'Tap to retry';
                        retryBtn.disabled = false;
                    }
                });
            }
        }
