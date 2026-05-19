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
                if (href && !/^(https?:|#)/.test(href) && !isSafePath(href, 'any')) {
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

                content.innerHTML = sanitized;

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
