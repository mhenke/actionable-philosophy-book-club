        function renderUpcomingMaterials() {
            const container = document.getElementById('upcoming-materials-container');
            const podcastContainer = document.getElementById('upcoming-podcasts');
            const headerContainer = document.getElementById('upcoming-card-header');
            const quoteContainer = document.getElementById('upcoming-key-takeaway');
            const ctaContainer = document.getElementById('upcoming-cta');
            if (!container) return;

            const meeting = MEETINGS.find(m => m.status === 'upcoming');
            if (!meeting) {
                container.innerHTML = '';
                if (headerContainer) headerContainer.innerHTML = '';
                if (quoteContainer) quoteContainer.innerHTML = '';
                if (ctaContainer) ctaContainer.innerHTML = '';
                return;
            }

            if (headerContainer) {
                headerContainer.innerHTML = `
                    <div class="flex justify-between items-start gap-4">
                        <div class="card-title">
                            <span class="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-spectrum-2 block mb-1">${escapeHTML(meeting.session)} <span class="font-normal" style="color:var(--text-muted)">&bull; ${escapeHTML(meeting.date)}</span></span>
                            <h2 id="next-meeting-heading" class="text-2xl md:text-3xl font-bold tracking-tight">${escapeHTML(meeting.title)}</h2>
                        </div>
                        <span class="shrink-0 text-[11px] font-bold uppercase tracking-widest px-2 py-1" style="border: 1px solid var(--spectrum-2); color: var(--spectrum-2);">Upcoming</span>
                    </div>`;
            }

            const { primaryRows, podcastRows, resourceStrip, podcastSummary } = buildAssetRows(meeting, { includePlaceholders: false });
            container.innerHTML = (primaryRows.length === 0 && podcastRows.length === 0 && !resourceStrip)
                ? `<p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Materials available closer to the meeting.</p>`
                : primaryRows.join('') + resourceStrip;

            if (quoteContainer) {
                quoteContainer.innerHTML = meeting.keyTakeaway
                    ? `<div class="border p-5" style="background:var(--wash-1);border-color:var(--border-low);">
                           <p class="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-spectrum-2 mb-2">Key Takeaway</p>
                           <p class="text-lg leading-relaxed italic text-banner">${escapeHTML(meeting.keyTakeaway)}</p>
                       </div>`
                    : '';
            }

            if (ctaContainer && meeting.readmeUrl) {
                ctaContainer.innerHTML = `<a href="#p=${escapeHTML(meeting.readmeUrl)}" class="meeting-notes-link btn btn-primary w-full py-4 text-[0.9375rem]" data-prefetch-path="${escapeHTML(meeting.readmeUrl)}">Meeting Notes <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 ml-3" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></a>`;
                const ctaLink = ctaContainer.querySelector('[data-prefetch-path]');
                if (ctaLink) ctaLink.addEventListener('pointerenter', () => {
                    if (isSafeRepoPath(meeting.readmeUrl)) prefetchMarkdown(meeting.readmeUrl);
                });
            }

            if (podcastContainer) {
                podcastContainer.innerHTML = buildPodcastDisclosure(podcastRows, podcastSummary);
            }
        }

        function renderArchiveCards() {
            const archiveContainer = document.getElementById('archive-cards-container');
            if (!archiveContainer) return;
            const done = MEETINGS.filter(m => m.status === 'done');

            const fragment = document.createDocumentFragment();
            done.forEach(meeting => {
                const { primaryRows, podcastRows, resourceStrip, podcastSummary } = buildAssetRows(meeting, { includePlaceholders: true });
                const podcastSection = buildPodcastDisclosure(podcastRows, podcastSummary);

                const card = document.createElement('div');
                card.className = 'card p-6 md:p-8 border-t-2 flex flex-col';
                card.style.borderTopColor = 'var(--spectrum-3)';

                card.innerHTML = `
                    <div class="flex justify-between items-start mb-5 gap-4">
                        <div class="card-title">
                            <span class="text-[11px] font-semibold uppercase tracking-[0.2em] block mb-1" style="color:var(--text-primary)">${escapeHTML(meeting.session)} <span class="font-normal" style="color:var(--text-muted)">&bull; ${escapeHTML(meeting.date)}</span></span>
                            <h3 class="text-xl font-bold tracking-tight">${escapeHTML(meeting.title)}</h3>
                        </div>
                        <span class="shrink-0 text-[0.6875rem] font-semibold uppercase tracking-widest px-2 py-1" style="border:1px solid var(--text-muted);color:var(--text-muted)">Done</span>
                    </div>
                    ${primaryRows.join('')}
                    ${resourceStrip}
                    <a href="#p=${escapeHTML(meeting.readmeUrl)}" class="meeting-notes-link btn-ghost" data-prefetch-path="${escapeHTML(meeting.readmeUrl)}">Meeting Notes &rarr;</a>
                    ${podcastSection}
                `;

                fragment.appendChild(card);
                const prefetchLink = card.querySelector('[data-prefetch-path]');
                if (prefetchLink) {
                    prefetchLink.addEventListener('pointerenter', () => {
                        const path = prefetchLink.dataset.prefetchPath;
                        if (path) prefetchMarkdown(path);
                    }, { once: true });
                }
            });

            archiveContainer.innerHTML = '';
            archiveContainer.appendChild(fragment);
        }

        function renderHorizonCards() {
            const horizonContainer = document.getElementById('horizon-cards-container');
            if (!horizonContainer) return;
            const drafts = MEETINGS.filter(m => m.status === 'draft');
            const horizonSection = horizonContainer.closest('section');

            if (drafts.length === 0) {
                horizonContainer.innerHTML = '';
                if (horizonSection) horizonSection.classList.add('hidden-view');
                return;
            }
            if (horizonSection) horizonSection.classList.remove('hidden-view');

            const fragment = document.createDocumentFragment();
            drafts.forEach(meeting => {
                const card = document.createElement('div');
                card.className = 'card p-6 md:p-8 border-t-2 flex flex-col';
                card.style.borderTopColor = 'var(--border-low)';

                card.innerHTML = `
                    <div class="flex justify-between items-start mb-5 gap-4">
                        <div class="card-title">
                            <span class="text-[11px] font-semibold uppercase tracking-[0.2em] block mb-1" style="color:var(--text-primary)">${escapeHTML(meeting.session)} <span class="font-normal" style="color:var(--text-muted)">&bull; ${escapeHTML(meeting.date)}</span></span>
                            <h3 class="text-xl font-bold tracking-tight text-muted">Coming Soon</h3>
                        </div>
                        <span class="shrink-0 text-[0.6875rem] font-bold uppercase tracking-widest text-muted px-2 py-1" style="border: 1px solid var(--text-muted)">Planned</span>
                    </div>
                    <p class="text-[0.6875rem] uppercase tracking-[0.2em] text-muted mt-auto">Materials will appear when session is confirmed.</p>
                `;

                fragment.appendChild(card);
            });

            horizonContainer.innerHTML = '';
            horizonContainer.appendChild(fragment);
        }
        function showDashboard() {
            document.title = 'Actionable Philosophy Book Club Dashboard';
            const readerDocLabel = document.getElementById('reader-doc-label');
            if (readerDocLabel) readerDocLabel.textContent = 'Session Notes';
            setView('dashboard');
            readerStatus.textContent = '';
            content.innerHTML = '';
            window.scrollTo(0, 0);
            const mainEl = document.getElementById('main-content');
            if (mainEl) mainEl.focus({ preventScroll: true });
            if (readerStatus) {
                readerStatus.textContent = 'Dashboard';
                setTimeout(() => { if (readerStatus) readerStatus.textContent = ''; }, CONFIG.STATUS_RESET_MS);
            }
        }

        // ── Toast system ──
        function showToast(message) {
            const container = document.getElementById('toast-container');
            if (!container) return;
            const el = document.createElement('div');
            el.className = 'toast';
            el.textContent = message;
            container.appendChild(el);
            requestAnimationFrame(() => el.classList.add('toast--visible'));
            setTimeout(() => {
                el.classList.remove('toast--visible');
                setTimeout(() => el.remove(), CONFIG.TOAST_FADE_MS);
            }, CONFIG.TOAST_DURATION_MS);
        }

        // ── Asset availability check ──
        // ── Inline video player ──
        function openVideoPlayer(filePath, label) {
            if (videoPlayerCleanup) {
                videoPlayerCleanup();
                videoPlayerCleanup = null;
            }

            const overlay = document.getElementById('video-player-overlay');
            const video = document.getElementById('vp-video');
            const title = document.getElementById('vp-title');
            const resumeBar = document.getElementById('vp-resume-bar');
            const resumeText = document.getElementById('vp-resume-text');
            const resumeBtn = document.getElementById('vp-resume-btn');
            const startBtn = document.getElementById('vp-start-btn');
            if (!overlay || !video) return;

            // preserve and restore focus for accessibility
            const lastFocusBeforeVideo = document.activeElement;

            title.textContent = label || filePath;
            video.src = filePath;
            video.load();

            const savedTime = getSavedVideoResumeTime(filePath);

            resumeBar.style.display = 'none';
            if (savedTime > CONFIG.RESUME_MIN_SECONDS) {
                const mins = Math.floor(savedTime / 60);
                const secs = Math.floor(savedTime % 60);
                resumeText.textContent = `Resume from ${mins}:${secs.toString().padStart(2, '0')}?`;
                if (resumeBtn) resumeBtn.setAttribute('aria-label', 'Resume ' + (label || filePath));
                if (startBtn) startBtn.setAttribute('aria-label', 'Start ' + (label || filePath) + ' from the beginning');
                resumeBar.style.display = 'flex';
                resumeBtn.addEventListener('click', () => { video.currentTime = savedTime; resumeBar.style.display = 'none'; video.play(); }, { once: true });
                startBtn.addEventListener('click', () => { clearVideoResumePosition(filePath); resumeBar.style.display = 'none'; video.play(); }, { once: true });
            }

            const saveProgress = () => saveVideoResumePosition(filePath, video.currentTime);
            const vpInterval = setInterval(saveProgress, CONFIG.PROGRESS_SAVE_MS);

            const onClose = () => {
                if (!overlay.open) return;
                saveProgress();
                video.pause();
                video.removeAttribute('src');
                video.load();
                overlay.close();
                // restore previous focus when closing the overlay
                if (lastFocusBeforeVideo && typeof lastFocusBeforeVideo.focus === 'function') {
                    try { lastFocusBeforeVideo.focus(); } catch(e) { /* ignore */ }
                }
                if (videoPlayerCleanup) {
                    videoPlayerCleanup();
                    videoPlayerCleanup = null;
                }
            };

            const cancelListener = (e) => { e.preventDefault(); onClose(); };
            overlay.addEventListener('cancel', cancelListener);

            const hashChangeListener = () => onClose();
            window.addEventListener('hashchange', hashChangeListener);

            videoPlayerCleanup = () => {
                clearInterval(vpInterval);
                overlay.removeEventListener('cancel', cancelListener);
                window.removeEventListener('hashchange', hashChangeListener);
                videoPlayerCleanup = null;
            };

            const closeBtn = document.getElementById('vp-close');
            closeBtn.onclick = onClose;
            overlay.onclick = (e) => { if (e.target === overlay) onClose(); };

            video.addEventListener('error', () => {
                onClose();
                showToast('This file is not available yet. Materials appear closer to the meeting date.');
            }, { once: true });

            overlay.showModal();
        }

        // ── Asset click delegation (dashboard) ──
        function setupAssetClickDelegation(container) {
            if (!container) return;
            container.addEventListener('click', (e) => {
                const link = e.target.closest('.asset-link');
                if (!link) return;
                const dl = e.target.closest('.asset-dl');
                if (dl) return; // Let download buttons behave normally

                const href = link.getAttribute('href');
                if (!href || !isSafeAssetPath(href)) return; // External/Office URLs use natural link behaviour
                e.preventDefault();

                if (href.endsWith('.mp4')) {
                    const labelEl = link.querySelector('.asset-link-top') || link;
                    openVideoPlayer(href, (labelEl.textContent || '').trim() || href);
                } else {
                    window.location.href = href;
                }
            });
        }

        // ── Onboarding banner ──
        function initOnboardingBanner() {
            const banner = document.getElementById('onboarding-banner');
            const dismissBtn = document.getElementById('onboarding-dismiss');
            if (!banner || !dismissBtn) return;
            if (localStorage.getItem(LS + 'onboarding_dismissed')) return;
            // Move banner into the dashboard main content area
            const mainContent = document.getElementById('main-content');
            if (mainContent && banner.parentNode !== mainContent) {
                mainContent.insertBefore(banner, mainContent.firstChild);
            }
            banner.classList.remove('hidden-view');
            dismissBtn.addEventListener('click', () => {
                banner.classList.add('hidden-view');
                localStorage.setItem(LS + 'onboarding_dismissed', '1');
            });
        }
