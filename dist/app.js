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
                date: '15 May 26',
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
                date: '01 May 26',
                title: 'Deep Systems',
                status: 'done',
                color: 'spectrum-3',
                wash: '--wash-3',
                readmeUrl: 'meetings/meeting-01/README.md',
                video: { file: 'meetings/meeting-01/recordings/01-The-Architects-of-Complexity.mp4', label: 'Video Primer', variant: 'canonical' },
                slides: { file: 'meetings/meeting-01/slides/01-Architecting-Deep-Systems.pptx', label: 'Slides', variant: 'canonical' },
                podcasts: [
                    { type: 'alternate', label: 'Video Primer', file: 'meetings/meeting-01/recordings/01-The-Architects-of-Complexity-alternate.mp4', variant: 'alternate', source_filename: '01-The-Architects-of-Complexity-alternate.mp4' },
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
                date: 'TBD',
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
                date: 'TBD',
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

        let currentFetch = null;

        function fetchMarkdownCached(path) {
            if (mdCache.has(path)) return mdCache.get(path);
            if (currentFetch) currentFetch.abort();
            const controller = new AbortController();
            currentFetch = controller;
            if (mdCache.size >= 20) {
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
            // Attach prefetch listeners to all elements with data-prefetch-path attribute
            document.querySelectorAll('[data-prefetch-path]').forEach(element => {
                element.addEventListener('pointerenter', () => {
                    const path = element.dataset.prefetchPath;
                    if (path && isSafeRepoPath(path)) {
                        prefetchMarkdown(path);
                    }
                });
            });
        }

        function escapeHTML(value) {
            return String(value).replace(/[&<>"']/g, c => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[c]));
        }

        function buildOfficeViewerURL(path) {
            if (!isSafeAssetPath(path)) return '#';
            const src = 'https://raw.githubusercontent.com/mhenke/actionable-philosophy-book-club/main/' + path;
            return 'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(src);
        }

        function isSafeAssetPath(path) {
            if (typeof path !== 'string' || path.length === 0 || path.length > 256) return false;
            if (path.includes('..')) return false;
            return /^(meetings|assets)\/[A-Za-z0-9._/-]+\.(mp4|m4a|pptx|pdf|png|jpg|jpeg)$/i.test(path);
        }

        // Shared rendering constants
        const PODCAST_CONFIG = {
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

                (meeting.podcasts || [])
                    .filter(() => false)
                    .forEach(alt => {
                        /* alternate recordings intentionally excluded from primaryRows; they are surfaced in the podcast disclosure */
                    });
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
                        <a href="${buildOfficeViewerURL(meeting.slides.file)}" target="_blank" rel="noopener noreferrer" class="asset-link">
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
                           aria-label="Download ${escapeHTML(pod.label)}"
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

            return { primaryRows, podcastRows, resourceStrip };
        }

        function renderUpcomingMaterials() {
            const container = document.getElementById('upcoming-materials-container');
            const podcastContainer = document.getElementById('upcoming-podcasts');
            if (!container) return;
            const meeting = MEETINGS.find(m => m.status === 'upcoming');
            if (!meeting) return;
            const { primaryRows, podcastRows, resourceStrip } = buildAssetRows(meeting, { includePlaceholders: false });
            if (primaryRows.length === 0 && podcastRows.length === 0 && !resourceStrip) {
                container.innerHTML = `<p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Materials available closer to the meeting.</p>`;
                return;
            }
            container.innerHTML = primaryRows.join('') + resourceStrip;
            if (podcastContainer) {
                podcastContainer.innerHTML = podcastRows.length > 0
                    ? `<details class="podcast-disclosure"><summary><span class="asset-link"><span class="icon-pill" style="background:var(--wash-3-border);" aria-hidden="true">🎧</span>Podcasts</span><svg class="podcast-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="16" height="16" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg></summary>${podcastRows.join('')}</details>`
                    : '';
            }
        }

        function renderArchiveCards() {
            const archiveContainer = document.getElementById('archive-cards-container');
            if (!archiveContainer) return;

            archiveContainer.innerHTML = '';

            MEETINGS.filter(m => m.status === 'done').forEach(meeting => {
                const { primaryRows, podcastRows, resourceStrip } = buildAssetRows(meeting, { includePlaceholders: true });
                const podcastSection = podcastRows.length > 0
                    ? `<details class="podcast-disclosure"><summary><span class="asset-link"><span class="icon-pill" style="background:var(--wash-3-border);" aria-hidden="true">🎧</span>Podcasts</span><svg class="podcast-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="16" height="16" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg></summary>${podcastRows.join('')}</details>`
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

                archiveContainer.appendChild(card);
            });

        }

        function renderHorizonCards() {
            const horizonContainer = document.getElementById('horizon-cards-container');
            if (!horizonContainer) return;

            horizonContainer.innerHTML = '';

            MEETINGS.filter(m => m.status === 'draft').forEach(meeting => {
                const card = document.createElement('div');
                card.className = 'card p-6 md:p-8 border-t-2 flex flex-col';
                card.style.cssText = 'border-top-color: var(--border-low); opacity: 0.6;';

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

                horizonContainer.appendChild(card);
            });
        }

        function isSafeRepoPath(p) {
            if (!p || typeof p !== 'string') return false;
            if (p.length === 0 || p.length > 256) return false;
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

        // Looks for the first <ul> under an <h2> matching "Session Materials" (case-insensitive)
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
            DOMPurify.addHook('afterSanitizeAttributes', node => {
                if (node.tagName !== 'A') return;
                const href = node.getAttribute('href') || '';
                if (/^https?:/i.test(href)) {
                    node.setAttribute('target', '_blank');
                    node.setAttribute('rel', 'noopener noreferrer');
                }
                if (href && !/^(https?:|#|[A-Za-z0-9._/-]+\.md)/i.test(href)) {
                    node.removeAttribute('href');
                }
            });
            window.__domPurifyHooksInstalled = true;
        }

        async function loadPage(path) {
            if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
                const readerEl = document.getElementById('reader-view');
                const contentEl = document.getElementById('markdown-content');
                if (contentEl) contentEl.innerHTML = '<p>Reader unavailable — required libraries could not be loaded. Check your connection and try reloading the page.</p>';
                if (readerEl) readerEl.classList.remove('hidden-view');
                if (dashboard) dashboard.classList.add('hidden-view');
                return;
            }
            const footer = document.getElementById('site-footer');
            if (footer) footer.classList.add('hidden-view');
            dashboard.classList.add('hidden-view');
            reader.classList.remove('hidden-view');
            content.focus({ preventScroll: true });
            window.scrollTo(0, 0);
            readerStatus.textContent = 'Loading document...';
            content.setAttribute('aria-busy', 'true');
            content.innerHTML = '<div class="py-12 text-center text-sm uppercase tracking-widest text-muted animate-pulse">Loading session notes&hellip;</div>';

            try {
                const text = await fetchMarkdownCached(path);
                ensureDOMPurifyHooks();
                content.innerHTML = DOMPurify.sanitize(marked.parse(text), {
                    FORBID_TAGS: ['style', 'iframe', 'form', 'object', 'embed'],
                    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'oninput']
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
                            link.setAttribute('href', repoPath);
                        } else {
                            link.removeAttribute('href');
                            link.setAttribute('aria-disabled', 'true');
                        }
                    }
                });
                const h1 = content.querySelector('h1');
                if (h1) {
                    document.title = `${h1.textContent.trim()} — Actionable Philosophy Book Club`;
                }

                content.querySelectorAll('h2').forEach(h2 => {
                    if (/session materials/i.test(h2.textContent)) {
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
                            <a href="#" class="text-sm uppercase tracking-widest text-muted underline">Return to Dashboard</a>
                        </div>
                    </div>`;
                const retryBtn = content.querySelector('#retry-load');
                if (retryBtn) retryBtn.addEventListener('click', () => loadPage(path));
                readerStatus.textContent = 'Document unavailable.';
            } finally {
                content.setAttribute('aria-busy', 'false');
            }
        }

        function showDashboard() {
            document.title = 'Actionable Philosophy Book Club Dashboard';
            const footer = document.getElementById('site-footer');
            if (footer) footer.classList.remove('hidden-view');
            dashboard.classList.remove('hidden-view');
            reader.classList.add('hidden-view');
            readerStatus.textContent = '';
            content.innerHTML = '';
            window.scrollTo(0, 0);
            const mainEl = document.getElementById('main-content');
            if (mainEl) mainEl.focus({ preventScroll: true });
            if (readerStatus) {
                readerStatus.textContent = 'Dashboard';
                setTimeout(() => { if (readerStatus) readerStatus.textContent = ''; }, 1000);
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

                // Apply meeting-specific theming if this is a meeting README
                const meeting = MEETINGS.find(m => m.readmeUrl === path);
                updateReaderTheme(meeting ? meeting.id : null);

                loadPage(path);
            } else {
                showDashboard();
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
                setTimeout(() => el.remove(), 300);
            }, 4500);
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
        function openVideoPlayer(filePath, label) {
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

            const storageKey = 'vp_resume_' + filePath;
            const saved = localStorage.getItem(storageKey);
            const savedTime = saved ? parseFloat(saved) : 0;

            resumeBar.style.display = 'none';
            if (savedTime > 5) {
                const mins = Math.floor(savedTime / 60);
                const secs = Math.floor(savedTime % 60);
                resumeText.textContent = `Resume from ${mins}:${secs.toString().padStart(2, '0')}?`;
                resumeBar.style.display = 'flex';
                resumeBtn.onclick = () => { video.currentTime = savedTime; resumeBar.style.display = 'none'; video.play(); };
                startBtn.onclick = () => { localStorage.removeItem(storageKey); resumeBar.style.display = 'none'; video.play(); };
            }

            const saveProgress = () => {
                const t = video.currentTime;
                if (t > 5) localStorage.setItem(storageKey, String(t));
            };
            const interval = setInterval(saveProgress, 3000);

            const onClose = () => {
                clearInterval(interval);
                saveProgress();
                video.pause();
                video.removeAttribute('src');
                video.load();
                overlay.classList.remove('vp--open');
            };
            const closeBtn = document.getElementById('vp-close');
            closeBtn.onclick = onClose;
            overlay.onclick = (e) => { if (e.target === overlay) onClose(); };
            document.addEventListener('keydown', function vpEsc(e) {
                if (e.key === 'Escape') { onClose(); document.removeEventListener('keydown', vpEsc); }
            });

            overlay.classList.add('vp--open');
            // Don't autoplay — let user click play or resume
        }

        // ── Asset click delegation (dashboard) ──
        function setupAssetClickDelegation(container) {
            if (!container) return;
            container.addEventListener('click', async (e) => {
                const link = e.target.closest('.asset-link');
                if (!link) return;
                const dl = e.target.closest('.asset-dl');
                if (dl) return; // Let download buttons behave normally
                e.preventDefault();

                const href = link.getAttribute('href');
                if (!href || !isSafeAssetPath(href)) return;

                // Update permalink hash
                history.replaceState(null, '', '#a=' + href);

                const available = await checkAssetAvailable(href);
                if (!available) {
                    showToast('This file is not available yet. Materials appear closer to the meeting date.');
                    return;
                }

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
            if (localStorage.getItem('onboarding_dismissed')) return;
            // Move banner into the dashboard main content area
            const mainContent = document.getElementById('main-content');
            if (mainContent && banner.parentNode !== mainContent) {
                mainContent.insertBefore(banner, mainContent.firstChild);
            }
            banner.classList.remove('hidden-view');
            dismissBtn.addEventListener('click', () => {
                banner.classList.add('hidden-view');
                localStorage.setItem('onboarding_dismissed', '1');
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
                        setTimeout(() => { link.style.background = ''; }, 2000);
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
                    localStorage.setItem('onboarding_dismissed', '1');
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
            navigator.serviceWorker.register('/sw.js').catch(() => {});
        }

        // Expose for tests
        window.isSafeRepoPath = isSafeRepoPath;
        window.prefetchMarkdown = prefetchMarkdown;
        window.mdCache = mdCache;
        window.renderUpcomingMaterials = renderUpcomingMaterials;
        window.renderArchiveCards = renderArchiveCards;
        window.renderHorizonCards = renderHorizonCards;
        window.MEETINGS = MEETINGS;
        window.showToast = showToast;

        window.addEventListener('hashchange', handleRoute);

        const backBtn = document.getElementById('back-to-dashboard');
        if (backBtn) backBtn.addEventListener('click', e => {
            e.preventDefault();
            window.location.hash = '';
        });

        // Esc key returns to dashboard from reader view, or closes video player
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                const vp = document.getElementById('video-player-overlay');
                if (vp && vp.classList.contains('vp--open')) {
                    const closeBtn = document.getElementById('vp-close');
                    if (closeBtn) closeBtn.click();
                    return;
                }
                if (!reader.classList.contains('hidden-view')) {
                    window.location.hash = '';
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
                    }, 2000);
                }).catch(() => {
                    const input = document.createElement('input');
                    input.value = window.location.href;
                    document.body.appendChild(input);
                    input.select();
                    document.execCommand('copy');
                    document.body.removeChild(input);
                });
            });
        }

        // Runs immediately — no CDN dependency
        renderUpcomingMaterials();
        renderArchiveCards();
        renderHorizonCards();
        attachPrefetchListeners();

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
                marked.use({ gfm: true, breaks: true, headerIds: false, mangle: false });
            }
            handleRoute();
        });
