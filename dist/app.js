        'use strict';
        const dashboard = document.getElementById('dashboard-view');
        const reader    = document.getElementById('reader-view');
        const content   = document.getElementById('markdown-content');
        const readerStatus = document.getElementById('reader-status');
        const mdCache   = new Map();  // Meeting markdown cache (Promises)

        // Meeting data manifest
        const MEETINGS = [
            {
                id: 'meeting-02',
                session: 'Meeting 02',
                date: '27 May 26',
                title: 'Complexity Engineering',
                status: 'upcoming',
                color: 'spectrum-2',
                wash: '--wash-2',
                readmeUrl: 'meetings/meeting-02/README.md',
                video: { file: 'meetings/meeting-02/recordings/02-complexity-governance-the-four-pillars-of-deep-modules.mp4', label: 'Video Primer', variant: 'canonical' },
                slides: { file: 'meetings/meeting-02/slides/02-the-complexity-case.pptx', label: 'Slides', variant: 'canonical' },
                podcasts: [
                    { type: 'alternate', label: 'Video Primer', file: 'meetings/meeting-02/recordings/02-Clean-Code-Paradox-deep-dive.mp4', variant: 'alternate', source_filename: '02-Clean-Code-Paradox-deep-dive.mp4' },
                    { type: 'deep-dive', label: 'Why Clean Code Rots Your Codebase', file: 'meetings/meeting-02/recordings/02-clean-code-rots-codebase-deep-dive.m4a' },
                    { type: 'debate', label: 'Deep Modules vs Small Functions', file: 'meetings/meeting-02/recordings/02-deep-modules-vs-small-functions-debate.m4a' },
                    { type: 'critique', label: 'General Purpose Design Stops Information Leaks', file: 'meetings/meeting-02/recordings/02-info-leaks-general-purpose-critique.m4a' }
                ],
                resources: [
                    { label: 'Four Strategies', file: 'meetings/meeting-02/resources/02-four-strategies.png' },
                    { label: 'Choose Your Next Meeting', file: 'meetings/meeting-02/resources/02-choose-your-next-meeting.png' }
                ]
            },
            {
                id: 'meeting-01',
                session: 'Meeting 01',
                date: '13 May 26',
                title: 'Deep Systems',
                status: 'done',
                color: 'spectrum-3',
                wash: '--wash-3',
                readmeUrl: 'meetings/meeting-01/README.md',
                video: { file: 'meetings/meeting-01/recordings/01-The-Architects-of-Complexity.mp4', label: 'Video Primer', variant: 'canonical' },
                slides: { file: 'meetings/meeting-01/slides/01-Architecting-Deep-Systems.pptx', label: 'Slides', variant: 'canonical' },
                podcasts: [
                    { type: 'deep-dive', label: 'Strategic Software Design and Deep Modules', file: 'meetings/meeting-01/recordings/01-strategic-software-design-and-deep-modules-deep-dive.m4a' },
                    { type: 'debate', label: 'Deep Modules vs Clean Code for AI', file: 'meetings/meeting-01/recordings/01-deep-modules-versus-clean-code-for-ai-debate.m4a' },
                    { type: 'critique', label: 'How Tactical Programming Creates Complexity', file: 'meetings/meeting-01/recordings/01-tactical-programming-complexity-critique.m4a' }
                ],
                resources: [
                    { label: 'Architecture of Simplicity', file: 'meetings/meeting-01/resources/01-architecture-of-simplicity.png' },
                    { label: 'Choose Your Adventure',      file: 'meetings/meeting-01/resources/01-choose-your-adventure.png' }
                ]
            },
            {
                id: 'meeting-00',
                session: 'Meeting 00',
                date: '29 Apr 26',
                title: 'The Kickoff',
                status: 'done',
                color: 'spectrum-1',
                wash: '--wash-1',
                readmeUrl: 'meetings/meeting-00/README.md',
                video: { file: 'meetings/meeting-00/recordings/00-The-Complexity-Governor.mp4', label: 'Video Primer', variant: 'canonical' },
                slides: { file: 'meetings/meeting-00/slides/00-Strategic-Design-for-the-AI-Era.pptx', label: 'Slides', variant: 'canonical' },
                podcasts: [],
                resources: []
            },
            {
                id: 'meeting-03',
                session: 'Meeting 03',
                date: '10 Jun 26',
                title: 'TBD',
                status: 'draft',
                color: 'spectrum-1',
                wash: '--wash-1',
                readmeUrl: 'meetings/meeting-03/README.md',
                video: null,
                slides: null,
                podcasts: [],
                resources: []
            },
            {
                id: 'meeting-04',
                session: 'Meeting 04',
                date: '24 Jun 26',
                title: 'TBD',
                status: 'draft',
                color: 'spectrum-2',
                wash: '--wash-2',
                readmeUrl: 'meetings/meeting-04/README.md',
                video: null,
                slides: null,
                podcasts: [],
                resources: []
            }
        ];

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
            'alternate': { icon: '🎬', color: 'var(--spectrum-3)', label: 'Video', title: 'An alternate recording of the session' },
            'deep-dive': { icon: '🔬', color: 'var(--spectrum-3)', label: 'Deep Dive', title: 'An in-depth solo exploration of the session topic' },
            'critique':  { icon: '🔍', color: 'var(--spectrum-1)', label: 'Critique', title: 'A critical analysis of the key arguments and trade-offs' },
            'debate':    { icon: '⚔️', color: 'var(--spectrum-2)', label: 'Debate',    title: 'A structured debate between two design perspectives' },
        };

        const DL_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>`;

        function buildAssetRows(meeting, { includePlaceholders = false } = {}) {
            const primaryRows = [];
            const podcastRows = [];

            if (meeting.video && isSafeAssetPath(meeting.video.file)) {
                primaryRows.push(`
                    <div class="asset-row" data-testid="${escapeHTML(meeting.id)}-canonical">
                        <a href="${escapeHTML(meeting.video.file)}" class="asset-link">
                            <span class="icon-pill" style="background: var(--wash-3-border);" aria-hidden="true">🎬</span>
                            ${escapeHTML(meeting.video.label)}
                        </a>
                        <a href="${escapeHTML(meeting.video.file)}" download
                           aria-label="Download video — ${escapeHTML(meeting.session)}"
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
                primaryRows.push(`
                    <div class="asset-row">
                        <a href="${buildPPTXViewerURL(meeting.slides.file)}" target="_blank" rel="noopener noreferrer" class="asset-link">
                            <span class="icon-pill" style="background: var(--wash-2-border);" aria-hidden="true">📊</span>
                            ${escapeHTML(meeting.slides.label)}
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
                    const cfg = PODCAST_CONFIG[pod.type] || { icon: '🎙', color: 'var(--spectrum-2)', label: escapeHTML(pod.type), title: '' };
                    // Enhance accessibility: improve aria-label for download button with file type hint
                    const fileExt = pod.file.split('.').pop() || 'file';
                    const downloadLabel = `Download ${escapeHTML(pod.label)} (${fileExt.toUpperCase()} audio)`;
                    podcastRows.push(`
                    <div class="asset-row">
                        <a href="${escapeHTML(pod.file)}" class="asset-link asset-link--stacked">
                            <span class="asset-link-top">
                                <span class="icon-pill" style="background: var(--wash-3-border);" aria-hidden="true">${cfg.icon}</span>
                                ${escapeHTML(pod.label)}
                                <span class="podcast-badge" style="color:${cfg.color}">${escapeHTML(cfg.label)}</span>
                            </span>
                            <span class="podcast-caption">${escapeHTML(cfg.title || '')}</span>
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
            const podcastSummary = summaryParts.join(' · ');

            return { primaryRows, podcastRows, resourceStrip, podcastSummary };
        }

        function renderUpcomingMaterials() {
            const container = document.getElementById('upcoming-materials-container');
            const podcastContainer = document.getElementById('upcoming-podcasts');
            if (!container) return;
            const meeting = MEETINGS.find(m => m.status === 'upcoming');
            if (!meeting) return;
            const { primaryRows, podcastRows, resourceStrip, podcastSummary } = buildAssetRows(meeting, { includePlaceholders: false });
            if (primaryRows.length === 0 && podcastRows.length === 0 && !resourceStrip) {
                container.innerHTML = `<p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Materials available closer to the meeting.</p>`;
                return;
            }
            container.innerHTML = primaryRows.join('') + resourceStrip;
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
                            <span class="text-[11px] font-semibold uppercase tracking-[0.2em] block mb-1 text-muted">${escapeHTML(meeting.session)} &bull; ${escapeHTML(meeting.date)}</span>
                            <h3 class="text-xl font-bold tracking-tight">${escapeHTML(meeting.title)}</h3>
                        </div>
                        <span class="shrink-0 text-[0.6875rem] font-bold uppercase tracking-widest text-white px-2 py-1" style="background-color:var(--banner)">Done</span>
                    </div>
                    ${primaryRows.join('')}
                    ${podcastSection}
                    ${resourceStrip}
                    <a href="#p=${escapeHTML(meeting.readmeUrl)}" class="meeting-notes-link btn-ghost mt-auto" data-prefetch-path="${escapeHTML(meeting.readmeUrl)}">Meeting Notes &rarr;</a>
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

            const fragment = document.createDocumentFragment();
            drafts.forEach(meeting => {
                const card = document.createElement('div');
                card.className = 'card p-6 md:p-8 border-t-2 flex flex-col';
                card.style.borderTopColor = 'var(--border-low)';

                card.innerHTML = `
                    <div class="flex justify-between items-start mb-5 gap-4">
                        <div class="card-title">
                            <span class="text-[11px] font-semibold uppercase tracking-[0.2em] block mb-1 text-muted">${escapeHTML(meeting.session)}</span>
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
                const isLast = i === arr.length - 1;
                const connector = isLast ? '└── ' : '├── ';
                const childPrefix = prefix + (isLast ? '    ' : '│   ');
                const pre = document.createElement('span');
                pre.className = 'tree-connector';
                pre.textContent = prefix + connector;
                li.insertBefore(pre, li.firstChild);
                const nested = li.querySelector(':scope > ul');
                if (nested) renderFileTree(nested, childPrefix);
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

        async function loadPage(path) {
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

                // Smooth cross-fade: keep placeholder visible, replace content and fade in to avoid snapping
                content.style.transition = 'opacity 240ms ease';
                // Start from transparent to allow transition when content is replaced
                content.style.opacity = '0';
                content.innerHTML = sanitized;
                // Trigger transition to visible
                requestAnimationFrame(() => { content.style.opacity = '1'; });

                content.querySelectorAll('img').forEach(img => {
                    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
                    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
                });

                // Site root handles both localhost '/' and GitHub Pages '/repo-name/'
                const siteRoot = window.location.pathname.replace(/[^/]*$/, '');

                content.querySelectorAll('a').forEach(link => {
                    const href = link.getAttribute('href');
                    if (!href || /^https?:/i.test(href)) return;
                    const base = new URL(path, window.location.href);
                    const resolved = new URL(href, base);
                    const repoPath = resolved.pathname.startsWith(siteRoot)
                        ? resolved.pathname.slice(siteRoot.length)
                        : resolved.pathname.slice(1);

                    if (href.endsWith('.md')) {
                        if (!isSafeRepoPath(repoPath)) {
                            link.removeAttribute('href');
                            link.setAttribute('aria-disabled', 'true');
                            link.setAttribute('title', 'Link target is outside allowed directories');
                            return;
                        }
                        link.setAttribute('href', '#p=' + repoPath);
                    } else if (!href.endsWith('/')) {
                        // Relative asset link — rewrite to repo-root-relative path so it
                        // resolves correctly regardless of deployment subdirectory.
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
                const h1 = content.querySelector('h1');
                if (h1) {
                    document.title = `${h1.textContent.trim()} — Actionable Philosophy Book Club`;
                    content.setAttribute('aria-label', h1.textContent.trim());
                }

                content.querySelectorAll('h2').forEach(h2 => {
                    if (/meeting materials/i.test(h2.textContent)) {
                        // Convention defined in docs/content-contract.md — transforms the file tree under this heading.
                        let el = h2.nextElementSibling;
                        while (el && el.tagName !== 'H2') {
                            if (el.tagName === 'UL') {
                                el.classList.add('materials-panel');
                                renderFileTree(el, '');
                            }
                            el = el.nextElementSibling;
                        }
                    }
                });
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
                if (retryBtn) retryBtn.addEventListener('click', () => loadPage(path));
                const returnBtn = content.querySelector('#return-dashboard');
                if (returnBtn) returnBtn.addEventListener('click', showDashboard);
                readerStatus.textContent = 'Document unavailable.';
            } finally {
                content.setAttribute('aria-busy', 'false');
            }
        }

        function showDashboard() {
            document.title = 'Actionable Philosophy Book Club Dashboard';
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
        async function checkAssetAvailable(path) {
            try {
                const resp = await fetch(path, { method: 'HEAD' });
                return resp.ok;
            } catch {
                return false;
            }
        }

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

            title.textContent = label || filePath;
            video.src = filePath;
            video.load();

            const vpKey = LS + 'vp:' + filePath;
            const saved = localStorage.getItem(vpKey);
            const savedTime = saved ? parseFloat(saved) : 0;

            resumeBar.style.display = 'none';
            if (savedTime > CONFIG.RESUME_MIN_SECONDS) {
                const mins = Math.floor(savedTime / 60);
                const secs = Math.floor(savedTime % 60);
                resumeText.textContent = `Resume from ${mins}:${secs.toString().padStart(2, '0')}?`;
                resumeBar.style.display = 'flex';
                resumeBtn.addEventListener('click', () => { video.currentTime = savedTime; resumeBar.style.display = 'none'; video.play(); }, { once: true });
                startBtn.addEventListener('click', () => { localStorage.removeItem(vpKey); resumeBar.style.display = 'none'; video.play(); }, { once: true });
            }

            const saveProgress = () => {
                const t = video.currentTime;
                if (t > CONFIG.RESUME_MIN_SECONDS) localStorage.setItem(vpKey, String(t));
            };
            const vpInterval = setInterval(saveProgress, CONFIG.PROGRESS_SAVE_MS);

            const onClose = () => {
                clearInterval(vpInterval);
                saveProgress();
                video.pause();
                video.removeAttribute('src');
                video.load();
                overlay.close();
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
                e.preventDefault();

                const href = link.getAttribute('href');
                if (!href || !isSafeAssetPath(href)) return;

                // Update permalink hash
                history.replaceState(null, '', '#a=' + href);

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

        // ── Handle #a= permalink to scroll to asset on dashboard ──
        function handleAssetPermalink(assetPath) {
            showDashboard();
            // Remove the reader-status text set by showDashboard()
            if (readerStatus) readerStatus.textContent = '';

            // Try to find the card containing this asset and scroll to it
            const cards = document.querySelectorAll('.card');
            for (const card of cards) {
                const links = card.querySelectorAll('.asset-link');
                for (const link of links) {
                    if (link.getAttribute('href') === assetPath) {
                        // Expand any parent podcast disclosure
                        const disclosure = card.querySelector('.podcast-disclosure');
                        if (disclosure) disclosure.open = true;
                        // Scroll to the card
                        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        // Highlight the asset link briefly
                        link.style.transition = 'background 0.5s';
                        link.style.background = 'var(--wash-3-border)';
                        setTimeout(() => { link.style.background = ''; }, CONFIG.HIGHLIGHT_DURATION_MS);
                        return;
                    }
                }
            }
        }

        function handleRoute() {
            const hash = window.location.hash;
            if (hash.startsWith('#p=')) {
                const path = decodeURIComponent(hash.slice(3));
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
                loadPage(path);
            } else if (hash.startsWith('#a=')) {
                const path = decodeURIComponent(hash.slice(3));
                if (!isSafeAssetPath(path)) {
                    showDashboard();
                    return;
                }
                handleAssetPermalink(path);
            } else {
                showDashboard();
            }
        }

        // Expose for tests
        // Register service worker for offline support
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(console.warn);
        }

        if (window.__TEST__ === true) {
            window.isSafeRepoPath = isSafeRepoPath;
            window.prefetchMarkdown = prefetchMarkdown;
            window.mdCache = mdCache;
            window.renderUpcomingMaterials = renderUpcomingMaterials;
            window.renderArchiveCards = renderArchiveCards;
            window.renderHorizonCards = renderHorizonCards;
            window.MEETINGS = MEETINGS;
            window.showToast = showToast;
        }

        window.addEventListener('hashchange', handleRoute);

        const backBtn = document.getElementById('back-to-dashboard');
        if (backBtn) backBtn.addEventListener('click', e => {
            e.preventDefault();
            window.location.hash = '';
            showDashboard();
        });

        // Key handlers: Esc returns to dashboard; when reader open, support prev/next with ArrowLeft/ArrowRight and J/K
        document.addEventListener('keydown', e => {
            // Close video overlay on Escape
            if (e.key === 'Escape') {
                const vp = document.getElementById('video-player-overlay');
                if (vp && vp.classList.contains('vp--open')) {
                    const closeBtn = document.getElementById('vp-close');
                    if (closeBtn) closeBtn.click();
                    return;
                }
                if (!reader.classList.contains('hidden-view')) {
                    window.location.hash = '';
                    showDashboard();
                }
                return;
            }

            // Reader navigation: left/right arrows and j/k (when not focused on input/textarea)
            const active = document.activeElement;
            const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
            if (isTyping) return;
            if (!reader.classList.contains('hidden-view')) {
                // find current meeting index from hash
                function getCurrentIndex(){
                    const hash = window.location.hash;
                    if (!hash.startsWith('#p=')) return -1;
                    const path = decodeURIComponent(hash.slice(3));
                    return MEETINGS.findIndex(m=>m.readmeUrl===path);
                }
                const idx = getCurrentIndex();
                if (idx !== -1) {
                    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'j') {
                        const next = MEETINGS[idx+1];
                        if (next && next.readmeUrl) { window.location.hash = '#p=' + encodeURIComponent(next.readmeUrl); }
                        return;
                    }
                    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'k') {
                        const prev = MEETINGS[idx-1];
                        if (prev && prev.readmeUrl) { window.location.hash = '#p=' + encodeURIComponent(prev.readmeUrl); }
                        return;
                    }
                }
            }
        });

        // Copy-link button — copies current URL (includes #p= or #a= hash) to clipboard
        const copyLinkBtn = document.getElementById('copy-link-btn');
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    copyLinkBtn.setAttribute('aria-label', 'Link copied!');
                    copyLinkBtn.title = 'Copied!';
                    setTimeout(() => {
                        copyLinkBtn.setAttribute('aria-label', 'Copy link to these session notes');
                        copyLinkBtn.title = 'Copy link';
                    }, CONFIG.HIGHLIGHT_DURATION_MS);
                }).catch(() => {
                    showToast('Copy failed: ' + window.location.href);
                });
            });
        }

        // Runs immediately — no CDN dependency
        renderUpcomingMaterials();
        renderArchiveCards();
        renderHorizonCards();

        // Set up asset click delegation on dashboard containers
        setupAssetClickDelegation(document.getElementById('upcoming-materials-container'));
        setupAssetClickDelegation(document.getElementById('archive-cards-container'));
        setupAssetClickDelegation(document.getElementById('upcoming-podcasts'));

        // Init onboarding banner
        initOnboardingBanner();

        // Apply will-change dynamically on card hover for performance
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('pointerenter', () => {
                card.style.willChange = 'transform';
            });
            card.addEventListener('pointerleave', () => {
                card.style.willChange = '';
            });
        });

        // Wait for CDN libs before enabling the reader
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof marked !== 'undefined') {
                marked.use({ gfm: true, breaks: true });
            }
            handleRoute();
        });

        // Command palette (Ctrl/Cmd+K) - lightweight, accessible, iterative
        (function(){
            const meetings = (typeof MEETINGS !== 'undefined') ? MEETINGS : (window.MEETINGS || []);
            if (!meetings || meetings.length === 0) return;

            // Styles
            const style = document.createElement('style');
            style.textContent = `
                #cmd-palette-overlay { position: fixed; inset: 0; display: none; align-items: flex-start; justify-content: center; z-index: 9999; }
                #cmd-palette-overlay.p--open { display: flex; }
                #cmd-palette { margin-top: 8vh; width: min(720px, 92%); background: white; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.12); overflow: hidden; }
                #cmd-palette .cp-input { width: 100%; box-sizing: border-box; padding: 12px 16px; border: none; outline: none; font-size: 16px; }
                #cmd-palette .cp-list { max-height: 320px; overflow: auto; margin: 0; padding: 0; list-style: none; }
                #cmd-palette .cp-item { display:flex; align-items:center; gap:12px; padding:10px 14px; cursor: pointer; border-top: 1px solid rgba(0,0,0,0.04); }
                #cmd-palette .cp-item[aria-selected="true"] { background: rgba(0,0,0,0.04); }
                #cmd-palette .cp-meta { color: #666; font-size: 13px; }
                #cmd-palette .cp-right { min-width:120px; text-align:right; color:#666; font-size:13px; }
                #cmd-palette .cp-id { font-weight:600; }
                #cmd-palette .cp-title { color:#333; margin-left:6px; }
                .cp-sr { position: absolute !important; left: -9999px !important; }
                @media (prefers-reduced-motion: reduce) { #cmd-palette { transition: none; } }
            `;
            document.head.appendChild(style);

            // DOM
            const overlay = document.createElement('div');
            overlay.id = 'cmd-palette-overlay';
            overlay.setAttribute('aria-hidden', 'true');
            overlay.innerHTML = `
                <div id="cmd-palette" role="dialog" aria-modal="true" aria-label="Command palette">
                    <input class="cp-input" placeholder="Jump to meeting by id or title (Cmd/Ctrl+K)" aria-label="Search meetings" />
                    <ul class="cp-list" role="listbox" aria-label="Search results"></ul>
                    <div id="cp-count" class="cp-sr" aria-live="polite"></div>
                </div>
            `;
            document.body.appendChild(overlay);

            const input = overlay.querySelector('.cp-input');
            const list = overlay.querySelector('.cp-list');
            let lastFocus = null;
            let results = [];
            let selected = 0;

            function openPalette() {
                lastFocus = document.activeElement;
                overlay.classList.add('p--open');
                overlay.setAttribute('aria-hidden', 'false');
                input.value = '';
                renderResults([]);
                setTimeout(() => input.focus(), 50);
                document.body.style.overflow = 'hidden';
            }
            function closePalette() {
                overlay.classList.remove('p--open');
                overlay.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
                if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
            }
            function togglePalette() { if (overlay.classList.contains('p--open')) closePalette(); else openPalette(); }

            function normalize(s){ return (s||'').toString().toLowerCase(); }
            function scoreMatch(q, m){
                // Balanced weighted scoring with trigram fallback
                if (!q) return 1;
                const id = normalize(m.id || '');
                const title = normalize(m.title || m.name || '');
                let score = 0;

                // Exact and prefix matches are very strong signals
                if (id === q) score += 300;
                else if (id.startsWith(q)) score += 180;
                else if (id.includes(q)) score += 120;

                // Title matches (word matches are stronger)
                const qWords = q.split(/\s+/).filter(Boolean);
                for (const w of qWords) {
                    if (title === w) score += 120;
                    else if (title.startsWith(w)) score += 90;
                    else if (title.includes(w)) score += 60;
                }

                // Boost upcoming or recent meetings slightly
                if (m.status && (m.status === 'upcoming' || m.status === 'next' || m.status === 'featured')) score += 20;

                // Short-id fuzzy: allow small typos via trigram similarity
                if (score === 0) {
                    const sim = trigramSimilarity(id + ' ' + title, q);
                    score += Math.round(sim * 150); // scale similarity to score
                }

                return score;

                // Local helper: trigram similarity (simple, fast, tolerant)
                function trigrams(s){
                    const t = [];
                    const ss = ('  ' + (s||'') + '  ').replace(/\s+/g,' ');
                    for (let i=0;i<ss.length-2;i++) t.push(ss.slice(i,i+3));
                    return t;
                }
                function trigramSimilarity(a,b){
                    if (!a || !b) return 0;
                    const A = trigrams(a);
                    const B = trigrams(b);
                    const As = new Set(A);
                    let inter = 0;
                    for (const x of B) if (As.has(x)) inter++;
                    const union = As.size + B.length - inter;
                    return union === 0 ? 0 : inter / union;
                }
            }

            // Helpers: small escape and date formatter
            function escapeHtml(s){
                return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
            }
            function formatDate(d){
                try{ const dt = new Date(d); if (isNaN(dt)) return ''; return dt.toLocaleDateString(); }catch(e){return '';}
            }

            function renderResults(listItems){
                results = listItems;
                selected = 0;
                list.innerHTML = '';
                if (results.length === 0) {
                    const li = document.createElement('li');
                    li.className = 'cp-item';
                    li.textContent = 'No results';
                    li.setAttribute('aria-disabled', 'true');
                    list.appendChild(li);
                    return;
                }
                for (let i=0;i<results.length;i++){
                    const m = results[i];
                    const li = document.createElement('li');
                    li.className = 'cp-item';
                    li.setAttribute('role','option');
                    li.dataset.index = i;
                    if (i===0) li.setAttribute('aria-selected','true');
                    li.innerHTML = `<div style="flex:1"><span class="cp-id">${escapeHtml(m.id)}</span> <span class="cp-meta cp-title">— ${escapeHtml(m.title||m.name||'')}</span></div><div class="cp-right"><div>${m.date?escapeHtml(formatDate(m.date)) : ''}</div><div class="cp-meta">${m.status?escapeHtml(m.status):''}</div></div>`;
                    li.addEventListener('click', () => activateIndex(i));
                    list.appendChild(li);
                }
            }

            function activateIndex(i){
                const m = results[i];
                if (!m) return;
                // prefer opening reader; fallback to scrolling to card
                if (m.readmeUrl) {
                    closePalette();
                    window.location.hash = '#p=' + encodeURIComponent(m.readmeUrl);
                    return;
                }
                closePalette();
                // try to scroll to card by id
                const card = document.querySelector(`[data-meeting-id=\"${m.id}\"]`);
                if (card) card.scrollIntoView({behavior:'smooth', block:'start'});
            }

            input.addEventListener('input', (e) => {
                const q = normalize(e.target.value.trim());
                if (!q) { renderResults(meetings.slice(0,6)); return; }
                const candidates = meetings.map(m => ({m, score: scoreMatch(q,m)}))
                    .filter(x => x.score>0)
                    .sort((a,b)=>b.score-a.score)
                    .map(x=>x.m)
                    .slice(0,8);
                renderResults(candidates);
            });

            input.addEventListener('keydown', (e) => {
                const items = Array.from(list.querySelectorAll('.cp-item'));
                if (e.key === 'ArrowDown') { e.preventDefault(); selected = Math.min(selected+1, items.length-1); updateSelection(items); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); selected = Math.max(selected-1, 0); updateSelection(items); }
                else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        // open in new tab (Shift+Enter)
                        const m = results[selected];
                        if (m && m.readmeUrl) {
                            // open as absolute URL preserving hash
                            const url = window.location.href.split('#')[0] + '#p=' + encodeURIComponent(m.readmeUrl);
                            window.open(url, '_blank');
                            closePalette();
                        }
                    } else {
                        activateIndex(selected);
                    }
                }
                else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
            });

            function updateSelection(items){
                items.forEach((it, idx) => it.setAttribute('aria-selected', idx===selected ? 'true' : 'false'));
                const el = items[selected]; if (el) el.scrollIntoView({block:'nearest'});
            }

            // Global key handler: Ctrl/Cmd+K
            document.addEventListener('keydown', (e) => {
                const isMac = navigator.platform && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
                if ((isMac && e.metaKey && e.key.toLowerCase() === 'k') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'k')){
                    e.preventDefault(); togglePalette();
                }
                // When palette open, allow Esc to close
                if (overlay.classList.contains('p--open') && e.key === 'Escape') {
                    e.preventDefault(); closePalette();
                }
            });

            // clicking outside closes
            overlay.addEventListener('mousedown', (ev) => {
                if (ev.target === overlay) closePalette();
            });

            // seed with top meetings
            renderResults(meetings.slice(0,6));
        })();

