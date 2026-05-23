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

        // ── Theme toggle logic ──
        function isDarkTheme() {
            if (document.documentElement.classList.contains('dark-theme')) return true;
            if (document.documentElement.classList.contains('light-theme')) return false;
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        function setTheme(isDark, userInitiated = false) {
            if (isDark) {
                document.documentElement.classList.add('dark-theme');
                document.documentElement.classList.remove('light-theme');
                if (userInitiated) {
                    try {
                        localStorage.setItem('apbc:theme', 'dark');
                    } catch (e) {
                        // ignore storage errors
                    }
                }
            } else {
                document.documentElement.classList.add('light-theme');
                document.documentElement.classList.remove('dark-theme');
                if (userInitiated) {
                    try {
                        localStorage.setItem('apbc:theme', 'light');
                    } catch (e) {
                        // ignore storage errors
                    }
                }
            }

            const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';
            const toggles = document.querySelectorAll('.theme-toggle-btn');
            toggles.forEach(btn => {
                btn.setAttribute('aria-label', label);
            });

            if (userInitiated && typeof showToast === 'function') {
                showToast(isDark ? 'Dark theme enabled' : 'Light theme enabled');
            }
        }

        // Initialize theme UI states to match whatever resolved during FOUC prevention or media queries
        setTheme(isDarkTheme(), false);

        // Bind events to both theme toggle buttons
        const themeToggles = document.querySelectorAll('.theme-toggle-btn');
        themeToggles.forEach(btn => {
            btn.addEventListener('click', () => {
                const currentDark = isDarkTheme();
                setTheme(!currentDark, true);
            });
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
            }

            handleRoute();
        })();
