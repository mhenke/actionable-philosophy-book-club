        /**
         * Parses window.location.hash for `#p=path/to/file.md` routes. Validates
         * the path with isSafeRepoPath, extracts an optional trailing #anchor,
         * and dispatches to loadPage or showDashboard on failure/invalid hash.
         */
        function handleRoute() {
            const hash = window.location.hash;
            if (hash.startsWith('#p=')) {
                let fullPath;
                try { fullPath = decodeURIComponent(hash.slice(3)); }
                catch (e) { showDashboard(); return; }
                // Split on last # to separate path from anchor (if any)
                const lastHashIndex = fullPath.lastIndexOf('#');
                const path = lastHashIndex > 0 ? fullPath.substring(0, lastHashIndex) : fullPath;
                if (!isSafeRepoPath(path)) {
                    if (typeof showToast === 'function') showToast('Invalid document path');
                    showDashboard();
                    return;
                }
                const anchorId = lastHashIndex > 0 ? fullPath.substring(lastHashIndex + 1) : null;
                loadPage(path, anchorId);
            } else {
                showDashboard();
            }
        }

        // Expose for tests

        function showDashboardRenderError() {
            const upcomingHeader = document.getElementById('upcoming-card-header');
            if (upcomingHeader) {
                upcomingHeader.innerHTML = '<p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Could not load dashboard data</p>';
            }
            if (typeof showToast === 'function') showToast('Could not load dashboard data');
        }

        if (window.__TEST__ === true) {
            window.isSafeRepoPath = isSafeRepoPath;
            window.renderUpcomingMaterials = renderUpcomingMaterials;
            window.renderArchiveCards = renderArchiveCards;
            window.renderHorizonCards = renderHorizonCards;
            window.saveVideoResumePosition = saveVideoResumePosition;
        }

        window.addEventListener('hashchange', handleRoute);

        const backBtn = document.getElementById('back-to-dashboard');
        if (backBtn) backBtn.addEventListener('click', e => {
            e.preventDefault();
            window.location.hash = '';
            showDashboard();
        });

        const skipLink = document.querySelector('a[href="#main-content"]');
        if (skipLink) {
            skipLink.addEventListener('click', e => {
                e.preventDefault();
                const isReaderActive = reader && !reader.classList.contains('hidden-view');
                if (isReaderActive) {
                    if (content) {
                        content.focus();
                        content.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    const mainContent = document.getElementById('main-content');
                    if (mainContent) {
                        mainContent.focus();
                        mainContent.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        }

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                const vp = document.getElementById('video-player-overlay');
                if (vp && vp.open) {
                    const closeBtn = document.getElementById('vp-close');
                    if (closeBtn) closeBtn.click();
                }
            }
        });

        // Set up asset click delegation on dashboard containers
        setupAssetClickDelegation(document.getElementById('upcoming-materials-container'));
        setupAssetClickDelegation(document.getElementById('archive-cards-container'));
        setupAssetClickDelegation(document.getElementById('upcoming-podcasts'));

        // Init onboarding banner
        initOnboardingBanner();

        // Init — runs immediately (script is at end of body, DOM ready)
        (async () => {
            if (window.__TEST__ === true) window.__manifestLoaded = false;

            // Prevent dashboard flash on refresh with #p= reader route — hide dashboard early
            const initialHash = window.location.hash;
            if (initialHash.startsWith('#p=')) {
                dashboard.classList.add('hidden-view');
                reader.classList.remove('hidden-view');
            }
            if (typeof marked !== 'undefined') {
                marked.use({ gfm: true, breaks: true });
            }

            try {
                await loadManifest();
            } catch (err) {
                console.error('Manifest load failed:', err?.message || err);
                setupManifestRetryUI();
                return;
            }
            if (window.__TEST__ === true) window.__manifestLoaded = true;
            try {
                renderUpcomingMaterials();
                renderArchiveCards();
                renderHorizonCards();
                const kbSection = document.querySelector('[aria-labelledby="section-kb"]');
                if (kbSection) kbSection.classList.remove('hidden-view');
                const footer = document.getElementById('site-footer');
                if (footer) footer.classList.remove('hidden-view');
            } catch (err) {
                console.error('Dashboard render failed:', err?.message || err);
                showDashboardRenderError();
            }

            handleRoute();
        })();
