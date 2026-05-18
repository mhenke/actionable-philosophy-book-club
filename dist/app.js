        'use strict';
        const dashboard = document.getElementById('dashboard-view');
        const reader    = document.getElementById('reader-view');
        const content   = document.getElementById('markdown-content');
        const readerStatus = document.getElementById('reader-status');
        const mdCache   = new Map();  // Meeting markdown cache (Promises)

        // Meeting data manifest, loaded from docs/manifest.json at startup.
        let MEETINGS = [];
        let ASSET_COPY = {};

        const DEFAULT_ASSET_COPY = Object.freeze({
            alternate: {
                label: 'Alternate Cut',
                title: 'A companion recording of the session'
            },
            'deep-dive': {
                label: 'Deep Dive',
                title: 'A solo exploration of the session topic'
            },
            critique: {
                label: 'Critique',
                title: 'A critical analysis of the key arguments and trade-offs'
            },
            debate: {
                label: 'Debate',
                title: 'A structured debate between two design perspectives'
            }
        });

        function loadAssetCopyRegistry(assetCopy) {
            const registry = {};
            if (!assetCopy || typeof assetCopy !== 'object' || Array.isArray(assetCopy)) {
                console.warn('Invalid manifest asset copy registry: expected an object. Falling back to defaults.');
                return registry;
            }

            const expectedKeys = Object.keys(DEFAULT_ASSET_COPY);
            const missing = expectedKeys.filter(key => !(key in assetCopy));
            const extra = Object.keys(assetCopy).filter(key => !expectedKeys.includes(key));

            if (missing.length || extra.length) {
                console.warn(`Invalid manifest asset copy registry: ${[
                    missing.length ? `missing ${missing.join(', ')}` : '',
                    extra.length ? `unexpected ${extra.join(', ')}` : ''
                ].filter(Boolean).join('; ')}. Using defaults at render time for missing entries.`);
            }

            expectedKeys.forEach(key => {
                const entry = assetCopy[key];
                if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return;
                const sanitized = {};
                if (typeof entry.label === 'string' && entry.label.trim()) sanitized.label = entry.label;
                if (typeof entry.title === 'string' && entry.title.trim()) sanitized.title = entry.title;
                if (Object.keys(sanitized).length > 0) registry[key] = sanitized;
            });
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
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            try {
                const response = await fetch('docs/manifest.json', { signal: controller.signal });
                clearTimeout(timeoutId);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                if (!data.meetings || !Array.isArray(data.meetings)) throw new Error('Invalid manifest structure');
                const assetCopy = loadAssetCopyRegistry(data.assetCopy);
                MEETINGS = data.meetings;
                ASSET_COPY = assetCopy;
                window.MEETINGS = MEETINGS;
                window.ASSET_COPY = ASSET_COPY;
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
                    } catch (_) {
                        retryBtn.textContent = 'Tap to retry';
                        retryBtn.disabled = false;
                    }
                });
            }
        }

        const LS = 'apbc:';
        const CONFIG = {
            CACHE_MAX: 20,
            RESUME_MIN_SECONDS: 5,
            PROGRESS_SAVE_MS: 3000,
            TOAST_DURATION_MS: 4500,
            TOAST_FADE_MS: 300,
            HIGHLIGHT_DURATION_MS: 2000,
            STATUS_RESET_MS: 1000,
            PATH_MAX_LENGTH: 256,
        };
        let activeReaderController = null;

        function fetchMarkdownCached(path, { isReaderLoad = false } = {}) {
            if (!isSafeRepoPath(path)) return Promise.reject(new Error('Unsafe path: ' + path));
            if (mdCache.has(path)) {
                const val = mdCache.get(path);
                mdCache.delete(path);
                mdCache.set(path, val);
                return val;
            }

            const controller = new AbortController();

            if (isReaderLoad) {
                if (activeReaderController) activeReaderController.abort();
                activeReaderController = controller;
            }
            if (mdCache.size >= CONFIG.CACHE_MAX) {
                mdCache.delete(mdCache.keys().next().value);
            }
            const promise = fetch(path, { signal: controller.signal }).then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.text();
            });
            mdCache.set(path, promise);
            promise.catch(() => {
                if (mdCache.get(path) === promise) mdCache.delete(path);
            });
            return promise;
        }
        function prefetchMarkdown(path) {
            // Fire-and-forget: fetch markdown into cache if not already cached
            if (!isSafeRepoPath(path)) return;
            fetchMarkdownCached(path).catch(() => {
                // Silent fail: prefetch is an optimization, not critical
                // User will just experience normal fetch latency if they click
            });
        }

        function attachPrefetchListeners() {
            document.querySelectorAll('[data-prefetch-path]').forEach(element => {
                element.addEventListener('pointerenter', () => {
                    const path = element.dataset.prefetchPath;
                    if (path && isSafeRepoPath(path)) prefetchMarkdown(path);
                });
            });
        }
        attachPrefetchListeners();

        function escapeHTML(value) {
            return String(value).replace(/[&<>"']/g, c => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[c]));
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

        function formatFileSize(value) {
            if (!Number.isFinite(value)) return '';
            return `${Math.round(value)} MB`;
        }

        const RAW_CONTENT_BASE = 'https://raw.githubusercontent.com/mhenke/actionable-philosophy-book-club/main/';
        function buildPPTXViewerURL(path) {
            if (!isSafeAssetPath(path)) return '#';
            return 'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(RAW_CONTENT_BASE + path);
        }

        function isSafeAssetPath(path) {
            if (typeof path !== 'string' || path.length === 0 || path.length > CONFIG.PATH_MAX_LENGTH) return false;
            const segments = path.split('/');
            if (segments.some(s => s === '' || s === '.' || s === '..')) return false;
            return /^(meetings|assets)(\/[A-Za-z0-9_][A-Za-z0-9._-]*)+\.(mp4|m4a|pptx|pdf|png|jpg|jpeg)$/i.test(path);
        }

        // Shared rendering constants
        const PODCAST_CONFIG = {
            'alternate': { icon: '🎬', color: 'var(--spectrum-2)' },
            'deep-dive': { icon: '🔬', color: 'var(--spectrum-2)' },
            'critique':  { icon: '🔍', color: 'var(--spectrum-1)' },
            'debate':    { icon: '⚔️', color: 'var(--spectrum-2)' },
        };

        const DL_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>`;

        function buildAssetRows(meeting, { includePlaceholders = false } = {}) {
            const primaryRows = [];
            const podcastRows = [];

            if (meeting.video && isSafeAssetPath(meeting.video.file)) {
                const videoDuration = meeting.video.duration ? formatDuration(meeting.video.duration) : '';
                const videoSize = meeting.video.fileSize ? formatFileSize(meeting.video.fileSize) : '';
                const videoMeta = [videoDuration, videoSize].filter(Boolean).join(' · ');
                const metaSpan = videoMeta ? `<span class="font-normal text-[11px] tracking-wide" style="color:var(--text-muted)">${videoMeta}</span>` : '';
                const videoSlug = meeting.video.file.split('/').pop().replace(/\.\w+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
                const videoAssetId = `asset-${escapeHTML(meeting.id)}-video-${videoSlug}`;
                primaryRows.push(`
                    <div class="asset-row" data-testid="${escapeHTML(meeting.id)}-canonical" data-canonical="true" id="${videoAssetId}">
                        <a href="${escapeHTML(meeting.video.file)}" class="asset-link" aria-label="${escapeHTML(meeting.video.label)}${videoDuration ? ', ' + videoDuration : ''} — ${escapeHTML(meeting.session)}">
                            <span class="icon-pill" style="background: var(--wash-3-border);" aria-hidden="true">🎬</span>
                            ${escapeHTML(meeting.video.label)}${metaSpan}
                        </a>
                        <a href="${escapeHTML(meeting.video.file)}" download
                           aria-label="Download ${escapeHTML(meeting.video.label)}${videoDuration ? ', ' + videoDuration : ''} — ${escapeHTML(meeting.session)}"
                           class="asset-dl">${DL_ICON}</a>
                    </div>`);

                /* alternate recordings render in the podcast disclosure below, not in primaryRows */
            } else if (includePlaceholders) {
                primaryRows.push(`
                    <div class="asset-row opacity-50">
                        <span class="asset-link cursor-default">
                            <span class="icon-pill" style="background: var(--wash-3-border);" aria-hidden="true">🎬</span>
                            Video Recording <span class="text-[11px] uppercase tracking-wider ml-auto">Coming Soon</span>
                        </span>
                    </div>`);
            }

            if (meeting.slides && isSafeAssetPath(meeting.slides.file)) {
                const slidesSize = meeting.slides.fileSize ? formatFileSize(meeting.slides.fileSize) : '';
                const slidesMetaSpan = slidesSize ? `<span class="font-normal text-[11px] tracking-wide" style="color:var(--text-muted)">${slidesSize}</span>` : '';
                primaryRows.push(`
                    <div class="asset-row">
                        <a href="${buildPPTXViewerURL(meeting.slides.file)}" target="_blank" rel="noopener noreferrer" class="asset-link">
                            <span class="icon-pill" style="background: var(--wash-2-border);" aria-hidden="true">📊</span>
                            ${escapeHTML(meeting.slides.label)}${slidesMetaSpan}
                        </a>
                        <a href="${escapeHTML(meeting.slides.file)}" download
                           aria-label="Download slides — ${escapeHTML(meeting.session)}"
                           class="asset-dl">${DL_ICON}</a>
                    </div>`);
            } else if (includePlaceholders) {
                primaryRows.push(`
                    <div class="asset-row opacity-50">
                        <span class="asset-link cursor-default">
                            <span class="icon-pill" style="background: var(--wash-2-border);" aria-hidden="true">📊</span>
                            Slides <span class="text-[11px] uppercase tracking-wider ml-auto">Coming Soon</span>
                        </span>
                    </div>`);
            }

            (meeting.podcasts || [])
                .forEach(pod => {
                    if (!isSafeAssetPath(pod.file)) return;
                    const cfg = PODCAST_CONFIG[pod.type] || { icon: '🎙', color: 'var(--spectrum-2)' };
                    const copy = getAssetCopy(pod.type);
                    const label = copy.label || cfg.label || pod.type;
                    const title = copy.title || cfg.title || '';
                    const podDuration = pod.duration ? formatDuration(pod.duration) : '';
                    const podSize = pod.fileSize ? formatFileSize(pod.fileSize) : '';
                    const podMeta = [podDuration, podSize].filter(Boolean).join(' · ');
                    const podMetaSpan = podMeta ? `<span class="font-normal text-[11px] tracking-wide" style="color:var(--text-muted)">${podMeta}</span>` : '';
                    const podSlug = pod.file.split('/').pop().replace(/\.\w+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
                    const podAssetId = `asset-${escapeHTML(meeting.id)}-podcast-${podSlug}`;
                    // Enhance accessibility: improve aria-label for download button with file type hint
                    const fileExt = pod.file.split('.').pop() || 'file';
                    const downloadLabel = `Download ${escapeHTML(pod.label)}${podDuration ? ', ' + podDuration : ''} (${fileExt.toUpperCase()} audio)`;
                    podcastRows.push(`
                    <div class="asset-row" id="${podAssetId}">
                        <a href="${escapeHTML(pod.file)}" class="asset-link asset-link--stacked">
                            <span class="asset-link-top">
                                <span class="icon-pill" style="background: var(--wash-3-border);" aria-hidden="true">${cfg.icon}</span>
                                ${escapeHTML(pod.label)}${podMetaSpan}
                                <span class="podcast-badge" style="color:${cfg.color}">${escapeHTML(label)}</span>
                            </span>
                            <span class="podcast-caption">${escapeHTML(title)}</span>
                        </a>
                        <a href="${escapeHTML(pod.file)}" download
                           aria-label="${downloadLabel}"
                           class="asset-dl">${DL_ICON}</a>
                    </div>`);
                });

            const resourceStrip = (meeting.resources || []).length > 0
                ? `<div class="resource-strip">${
                    (meeting.resources || [])
                        .filter(r => isSafeAssetPath(r.file))
                        .map(res => `
                        <a href="${escapeHTML(res.file)}" target="_blank" rel="noopener noreferrer" class="resource-thumb">
                            <img src="${escapeHTML(res.file)}" alt="${escapeHTML(res.label)}" loading="lazy" width="200" height="80">
                            <span>${escapeHTML(res.label)}</span>
                        </a>`).join('')}
                </div>`
                : '';

            const safePodcasts = (meeting.podcasts || []).filter(p => isSafeAssetPath(p.file));
            const videoCount = safePodcasts.filter(p => p.type === 'alternate').length;
            const podcastCount = safePodcasts.filter(p => p.type !== 'alternate').length;
            const summaryParts = [];
            if (videoCount > 0) summaryParts.push(`${videoCount} Video${videoCount > 1 ? 's' : ''}`);
            if (podcastCount > 0) summaryParts.push(`${podcastCount} Podcast${podcastCount > 1 ? 's' : ''}`);
            let podcastSummary = summaryParts.join(' · ');

            // Prepend label so summaries are explicitly qualified
            if (podcastSummary) {
                podcastSummary = `Additional Resources: ${podcastSummary}`;
            }

            return { primaryRows, podcastRows, resourceStrip, podcastSummary };
        }

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
                podcastContainer.innerHTML = podcastRows.length > 0
                    ? `<details class="podcast-disclosure"><summary><span class="asset-link"><span class="icon-pill" style="background:var(--wash-3-border);" aria-hidden="true">📦</span>${escapeHTML(podcastSummary)}</span><svg class="podcast-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="16" height="16" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg></summary>${podcastRows.join('')}</details>`
                    : '';
            }
        }

        function renderArchiveCards() {
            const archiveContainer = document.getElementById('archive-cards-container');
            if (!archiveContainer) return;
            const done = MEETINGS.filter(m => m.status === 'done');

            const fragment = document.createDocumentFragment();
            done.forEach(meeting => {
                const { primaryRows, podcastRows, resourceStrip, podcastSummary } = buildAssetRows(meeting, { includePlaceholders: true });
                const podcastSection = podcastRows.length > 0
                    ? `<details class="podcast-disclosure"><summary><span class="asset-link"><span class="icon-pill" style="background:var(--wash-3-border);" aria-hidden="true">📦</span>${escapeHTML(podcastSummary)}</span><svg class="podcast-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="16" height="16" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg></summary>${podcastRows.join('')}</details>`
                    : '';

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

        // ── getCurrentMeetingIndex — reader navigation, extracted from keydown ──
        function getCurrentMeetingIndex() {
            const hash = window.location.hash;
            if (!hash.startsWith('#p=')) return -1;
            const path = decodeURIComponent(hash.slice(3));
            return MEETINGS.findIndex(m => m.readmeUrl === path);
        }

        // ── rewriteContentLinks — link post-processing, extracted from loadPage ─
        function rewriteContentLinks(container, docPath) {
            const siteRoot = window.location.pathname.replace(/[^/]*$/, '');
            container.querySelectorAll('a').forEach(link => {
                const href = link.getAttribute('href');
                if (!href || /^https?:/i.test(href)) return;
                const base = new URL(docPath, window.location.href);
                const resolved = new URL(href, base);
                const repoPath = resolved.pathname.startsWith(siteRoot)
                    ? resolved.pathname.slice(siteRoot.length)
                    : resolved.pathname.slice(1);

                // Do not make folder links clickable. Disable hrefs that end with '/' so folders remain structural.
                if (href.endsWith('/')) {
                    link.removeAttribute('href');
                    link.setAttribute('aria-disabled', 'true');
                    link.setAttribute('title', 'Folder — not a navigable file');
                    return;
                }

                if (href.endsWith('.md')) {
                    if (!isSafeRepoPath(repoPath)) {
                        link.removeAttribute('href');
                        link.setAttribute('aria-disabled', 'true');
                        link.setAttribute('title', 'Link target is outside allowed directories');
                        return;
                    }
                    link.setAttribute('href', '#p=' + repoPath);
                } else if (!href.endsWith('/')) {
                    if (isSafeAssetPath(repoPath)) {
                        if (/\.pptx?$/i.test(repoPath)) {
                            link.setAttribute('href', buildPPTXViewerURL(repoPath));
                            link.setAttribute('target', '_blank');
                            link.setAttribute('rel', 'noopener noreferrer');
                        } else if (/\.(png|jpe?g|gif|svg|webp)$/i.test(repoPath)) {
                            link.setAttribute('href', repoPath);
                            link.setAttribute('target', '_blank');
                            link.setAttribute('rel', 'noopener noreferrer');
                        } else if (/\.mp4$/i.test(repoPath)) {
                            link.setAttribute('href', repoPath);
                            link.addEventListener('click', (e) => {
                                e.preventDefault();
                                openVideoPlayer(repoPath, link.textContent.trim() || repoPath);
                            });
                        } else {
                            link.setAttribute('href', repoPath);
                        }
                    } else {
                        link.removeAttribute('href');
                        link.setAttribute('aria-disabled', 'true');
                    }
                }
            });
        }

        // ── applyMeetingMaterialsTree — file tree post-processing, from loadPage ─
        function applyMeetingMaterialsTree(container) {
            container.querySelectorAll('h2').forEach(h2 => {
                if (!/meeting materials/i.test(h2.textContent)) return;
                let el = h2.nextElementSibling;
                while (el && el.tagName !== 'H2') {
                    if (el.tagName === 'UL') {
                        el.classList.add('materials-panel');
                        renderFileTree(el, '');
                    }
                    el = el.nextElementSibling;
                }
            });
        }

        function isSafeRepoPath(p) {
            if (!p || typeof p !== 'string') return false;
            if (p.length === 0 || p.length > CONFIG.PATH_MAX_LENGTH) return false;
            if (!p.endsWith('.md')) return false;
            if (/^[a-z][a-z0-9+.-]*:/i.test(p)) return false;   // any scheme
            if (p.startsWith('//') || p.startsWith('/')) return false; // protocol-relative, absolute
            if (p.startsWith('.') || p.includes('..')) return false;   // traversal
            if (/[\\\x00-\x1f]/.test(p)) return false;           // control chars, backslash
            if (!/^[\w.\-/]+$/.test(p)) return false;
            // Allowlist: only paths under known content directories
            const firstSegment = p.split('/')[0];
            return new Set(['meetings', 'docs', 'templates']).has(firstSegment);
        }

        // Looks for the first <ul> under an <h2> matching "Meeting Materials" (case-insensitive)
        // and prepends tree connector spans to each <li>. Convention defined in docs/content-contract.md.
        function renderFileTree(ul, prefix) {
            [...ul.children].forEach((li, i, arr) => {
                if (li.querySelector(':scope > .tree-connector')) return;
                // If the first child is an anchor that points to a folder (href ends with '/'), make it inert
                const firstAnchor = li.querySelector(':scope > a');
                if (firstAnchor) {
                    const href = firstAnchor.getAttribute('href') || '';
                    if (href.endsWith('/')) {
                        const span = document.createElement('span');
                        span.className = firstAnchor.className || '';
                        span.innerHTML = firstAnchor.innerHTML;
                        li.replaceChild(span, firstAnchor);
                    }
                }
                const isLast = i === arr.length - 1;
                const connector = isLast ? '└── ' : '├── ';
                const childPrefix = prefix + (isLast ? '    ' : '│   ');
                const pre = document.createElement('span');
                pre.className = 'tree-connector';
                pre.textContent = prefix + connector;
                li.insertBefore(pre, li.firstChild);
                const nested = li.querySelector(':scope > ul');
                if (nested) renderFileTree(nested, childPrefix);
                li.classList.add(nested ? 'tree-folder' : 'tree-file');
            });
        }

        function updateReaderTheme(meetingId) {
            const meeting = MEETINGS.find(m => m.id === meetingId);
            if (meeting) {
                content.style.setProperty('--prose-h3-border', `var(--wash-${meeting.color.split('-')[1]}-strong-border)`);
            } else {
                content.style.removeProperty('--prose-h3-border');
            }
        }

        function ensureDOMPurifyHooks() {
            if (window.__domPurifyHooksInstalled) return;
            DOMPurify.addHook('beforeSanitizeAttributes', node => {
                if (node.tagName !== 'A') return;
                const href = node.getAttribute('href');
                if (href && /^#/.test(href)) node.setAttribute('data-dp-href', href);
            });
            DOMPurify.addHook('afterSanitizeAttributes', node => {
                if (node.tagName !== 'A') return;
                const savedHref = node.getAttribute('data-dp-href');
                let href = node.getAttribute('href') || savedHref || '';
                node.removeAttribute('data-dp-href');
                if (savedHref && !node.getAttribute('href')) node.setAttribute('href', savedHref);
                if (/^https?:/i.test(href)) {
                    node.setAttribute('target', '_blank');
                    node.setAttribute('rel', 'noopener noreferrer');
                }
                if (href && !/^(https?:|#|[A-Za-z0-9._/-]+\.(md|mp4|m4a|pptx|ppt|png|jpg|jpeg|gif|pdf|svg))/i.test(href)) {
                    node.removeAttribute('href');
                }
            });
            window.__domPurifyHooksInstalled = true;
        }

        function setView(view) {
            const isDashboard = view === 'dashboard';
            dashboard.classList.toggle('hidden-view', !isDashboard);
            reader.classList.toggle('hidden-view', isDashboard);
            const footer = document.getElementById('site-footer');
            if (footer) footer.classList.toggle('hidden', !isDashboard);
        }

        async function loadPage(path, anchorId) {
            if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
                const contentEl = document.getElementById('markdown-content');
                if (contentEl) contentEl.innerHTML = '<p>Reader unavailable — required libraries could not be loaded. Check your connection and try reloading the page.</p>';
                setView('reader');
                return;
            }
            setView('reader');
            content.focus({ preventScroll: true });
            window.scrollTo(0, 0);
            readerStatus.textContent = 'Loading document...';
            content.setAttribute('aria-busy', 'true');
            content.innerHTML = '<div class="py-12 text-center text-sm uppercase tracking-widest text-muted animate-pulse">Loading session notes&hellip;</div>';

            try {
                const text = await fetchMarkdownCached(path, { isReaderLoad: true });
                ensureDOMPurifyHooks();
                const sanitized = DOMPurify.sanitize(marked.parse(text), {
                    FORBID_TAGS: ['style', 'iframe', 'form', 'object', 'embed'],
                    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'oninput', 'onmouseover', 'onmouseenter', 'onfocus', 'onkeydown', 'onkeyup'],

                });

                // Cut to invisible, swap content, then fade in — avoids mid-transition content swap flash
                content.style.transition = 'none';
                content.style.opacity = '0';
                content.innerHTML = sanitized;
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    content.style.transition = 'opacity 200ms ease';
                    content.style.opacity = '1';
                }));

                content.querySelectorAll('img').forEach(img => {
                    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
                    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
                });

                rewriteContentLinks(content, path);

                const h1 = content.querySelector('h1');
                if (h1) {
                    document.title = `${h1.textContent.trim()} — Actionable Philosophy Book Club`;
                    content.setAttribute('aria-label', h1.textContent.trim());
                    const readerDocLabel = document.getElementById('reader-doc-label');
                    if (readerDocLabel) readerDocLabel.textContent = h1.textContent.trim();
                }

                applyMeetingMaterialsTree(content);
                // Scroll to anchor if present and valid
                if (anchorId) {
                    requestAnimationFrame(() => {
                        const el = document.getElementById(anchorId);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                }
                readerStatus.textContent = 'Document loaded.';
            } catch (err) {
                console.warn('loadPage failed:', err?.message || err);
                history.replaceState(null, '', window.location.pathname + window.location.search);
                content.innerHTML = `
                    <div class="py-12 text-center">
                        <p class="text-sm uppercase tracking-widest text-muted mb-4">Document unavailable.</p>
                        <div class="flex gap-4 justify-center">
                            <button id="retry-load" class="text-sm uppercase tracking-widest text-spectrum-2 underline">Try again</button>
                            <button id="return-dashboard" class="text-sm uppercase tracking-widest text-muted underline">Return to Dashboard</button>
                        </div>
                    </div>`;
                const retryBtn = content.querySelector('#retry-load');
                if (retryBtn) retryBtn.addEventListener('click', () => loadPage(path, anchorId));
                const returnBtn = content.querySelector('#return-dashboard');
                if (returnBtn) returnBtn.addEventListener('click', showDashboard);
                readerStatus.textContent = 'Document unavailable.';
            } finally {
                content.setAttribute('aria-busy', 'false');
            }
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
        let videoPlayerCleanup = null;

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
                // Add contextual aria-labels for screen readers
                try { if (resumeBtn && typeof resumeBtn.setAttribute === 'function') resumeBtn.setAttribute('aria-label', 'Resume ' + (label || filePath)); } catch(e) { /* ignore */ }
                try { if (startBtn && typeof startBtn.setAttribute === 'function') startBtn.setAttribute('aria-label', 'Start ' + (label || filePath) + ' from the beginning'); } catch(e) { /* ignore */ }
                resumeBar.style.display = 'flex';
                resumeBtn.addEventListener('click', () => { video.currentTime = savedTime; resumeBar.style.display = 'none'; video.play(); }, { once: true });
                startBtn.addEventListener('click', () => { clearVideoResumePosition(filePath); resumeBar.style.display = 'none'; video.play(); }, { once: true });
            }

            const saveProgress = () => saveVideoResumePosition(filePath, video.currentTime);
            const vpInterval = setInterval(saveProgress, CONFIG.PROGRESS_SAVE_MS);
            videoPlayerCleanup = () => {
                clearInterval(vpInterval);
                videoPlayerCleanup = null;
            };

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
            const closeBtn = document.getElementById('vp-close');
            closeBtn.onclick = onClose;
            overlay.onclick = (e) => { if (e.target === overlay) onClose(); };
            overlay.addEventListener('cancel', (e) => { e.preventDefault(); onClose(); });

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
                const meeting = MEETINGS.find(m => m.readmeUrl === path);
                updateReaderTheme(meeting ? meeting.id : null);
                loadPage(path, null);
            } else {
                showDashboard();
            }
        }

        // Expose for tests

        if (window.__TEST__ === true) {
            window.isSafeRepoPath = isSafeRepoPath;
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

        function getVideoResumeKey(filePath) {
            return LS + 'vs:' + filePath;
        }

        function getSavedVideoResumeTime(filePath) {
            try {
                const saved = sessionStorage.getItem(getVideoResumeKey(filePath));
                return saved ? parseFloat(saved) : 0;
            } catch (_) {
                return 0;
            }
        }

        function saveVideoResumePosition(filePath, currentTime) {
            const key = getVideoResumeKey(filePath);
            try {
                if (currentTime > CONFIG.RESUME_MIN_SECONDS) {
                    sessionStorage.setItem(key, String(currentTime));
                } else {
                    sessionStorage.removeItem(key);
                }
            } catch (_) {}
        }

        function clearVideoResumePosition(filePath) {
            try {
                sessionStorage.removeItem(getVideoResumeKey(filePath));
            } catch (_) {}
        }

        // Set up asset click delegation on dashboard containers
        setupAssetClickDelegation(document.getElementById('upcoming-materials-container'));
        setupAssetClickDelegation(document.getElementById('archive-cards-container'));
        setupAssetClickDelegation(document.getElementById('upcoming-podcasts'));

        // Init onboarding banner
        initOnboardingBanner();

        // Wait for CDN libs before enabling the reader
        document.addEventListener('DOMContentLoaded', async () => {
            if (window.__TEST__ === true) window.__manifestLoaded = false;
            if (typeof marked !== 'undefined') {
                marked.use({ gfm: true, breaks: true });
            }

            try {
                await loadManifest();
                if (window.__TEST__ === true) window.__manifestLoaded = true;
                renderUpcomingMaterials();
                renderArchiveCards();
                renderHorizonCards();
            } catch (_) {
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

        });
