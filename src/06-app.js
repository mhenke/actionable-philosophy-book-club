        function handleRoute() {
            const hash = window.location.hash;
            if (hash.startsWith('#p=')) {
                const fullPath = decodeURIComponent(hash.slice(3));
                // Split on last # to separate path from anchor (if any)
                const lastHashIndex = fullPath.lastIndexOf('#');
                const path = lastHashIndex > 0 ? fullPath.substring(0, lastHashIndex) : fullPath;
                if (!isSafeRepoPath(path)) {
                    showDashboard();
                    return;
                }
                // Dismiss onboarding banner permanently when visiting any content
                const banner = document.getElementById('onboarding-banner');
                if (banner && !banner.classList.contains('hidden-view')) {
                    banner.classList.add('hidden-view');
                    localStorage.setItem(LS + 'onboarding_dismissed', '1');
                }
                const anchorId = lastHashIndex > 0 ? fullPath.substring(lastHashIndex + 1) : null;
                const meeting = MEETINGS.find(m => m.readmeUrl === path);
                updateReaderTheme(meeting ? meeting.id : null);
                loadPage(path, anchorId);
            } else {
                showDashboard();
            }
        }

        // Expose for tests

        if (window.__TEST__ === true) {
            window.isSafeRepoPath = isSafeRepoPath;
            window.isSafeAssetPath = isSafeAssetPath;
            window.isSafePath = isSafePath;
            window.prefetchMarkdown = prefetchMarkdown;
            window.mdCache = mdCache;
            window.renderUpcomingMaterials = renderUpcomingMaterials;
            window.renderArchiveCards = renderArchiveCards;
            window.renderHorizonCards = renderHorizonCards;
            window.MEETINGS = MEETINGS;
            window.showToast = showToast;
            window.formatDuration = formatDuration;
            window.formatFileSize = formatFileSize;
            window.saveVideoResumePosition = saveVideoResumePosition;
            window.getCurrentMeetingIndex = getCurrentMeetingIndex;
            window.rewriteContentLinks = rewriteContentLinks;
            window.applyMeetingMaterialsTree = applyMeetingMaterialsTree;
        }

        window.addEventListener('hashchange', handleRoute);

        const backBtn = document.getElementById('back-to-dashboard');
        if (backBtn) backBtn.addEventListener('click', e => {
            e.preventDefault();
            window.location.hash = '';
            showDashboard();
        });

        // Key handlers: when reader open, support prev/next with ArrowLeft/ArrowRight and J/K
        document.addEventListener('keydown', e => {
            // Close video overlay on Escape
            if (e.key === 'Escape') {
                const vp = document.getElementById('video-player-overlay');
                if (vp && vp.open) {
                    const closeBtn = document.getElementById('vp-close');
                    if (closeBtn) closeBtn.click();
                }
                return;
            }

            // Reader navigation: left/right arrows and j/k (when not focused on input/textarea)
            const active = document.activeElement;
            const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
            if (isTyping) return;
            if (!reader.classList.contains('hidden-view')) {
                const idx = getCurrentMeetingIndex();
                if (idx !== -1) {
                    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'j') {
                        const next = MEETINGS[idx + 1];
                        if (next && next.readmeUrl) { window.location.hash = '#p=' + encodeURIComponent(next.readmeUrl); }
                        return;
                    }
                    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'k') {
                        const prev = MEETINGS[idx - 1];
                        if (prev && prev.readmeUrl) { window.location.hash = '#p=' + encodeURIComponent(prev.readmeUrl); }
                        return;
                    }
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
                showManifestError();
                return;
            }
            if (window.__TEST__ === true) window.__manifestLoaded = true;
            try {
                renderUpcomingMaterials();
                renderArchiveCards();
                renderHorizonCards();
            } catch (err) {
                console.error('Dashboard render failed:', err?.message || err);
                showManifestError();
            }

            handleRoute();

            // Apply will-change dynamically on card hover for performance
            document.querySelectorAll('.card').forEach(card => {
                card.addEventListener('pointerenter', () => {
                    card.style.willChange = 'transform';
                });
                card.addEventListener('pointerleave', () => {
                    card.style.willChange = '';
                });
            });
        })();
