        function _disableLink(link, title) {
            link.removeAttribute('href');
            link.setAttribute('aria-disabled', 'true');
            if (title) link.setAttribute('title', title);
        }

        /**
         * @param {HTMLElement} container - Root element containing links to rewrite
         * @param {string} docPath - Path of the source markdown file, used as base for resolution
         *
         * Rewrites relative links in rendered markdown content. .md links become #p= routes;
         * assets get direct hrefs, external viewer URLs for PPTX, or are disabled if unsafe.
         */
        function rewriteContentLinks(container, docPath) {
            const siteRoot = window.location.pathname.replace(/[^/]*$/, '');
            for (const link of container.querySelectorAll('a')) {
                try {
                    const href = link.getAttribute('href');
                    if (!href || /^https?:/i.test(href)) continue;
                    if (href.startsWith('#')) continue;

                    const base = new URL(docPath, window.location.href);
                    const resolved = new URL(href, base);
                    const repoPath = resolved.pathname.startsWith(siteRoot)
                        ? resolved.pathname.slice(siteRoot.length)
                        : resolved.pathname.slice(1);

                    if (href.endsWith('/')) {
                        _disableLink(link, 'Folder (not a navigable file)');
                        continue;
                    }

                    if (href.endsWith('.md')) {
                        if (!isSafeRepoPath(repoPath)) {
                            _disableLink(link, 'Link target is outside allowed directories');
                            continue;
                        }
                        link.setAttribute('href', '#p=' + repoPath);
                        continue;
                    }

                    if (!isSafeAssetPath(repoPath)) {
                        _disableLink(link, '');
                        continue;
                    }

                    if (/\.pptx?$/i.test(repoPath)) {
                        link.setAttribute('href', buildPPTXViewerURL(repoPath));
                        link.setAttribute('target', '_blank');
                        link.setAttribute('rel', 'noopener noreferrer');
                    } else if (/\.(png|jpe?g|gif|webp)$/i.test(repoPath)) {
                        link.setAttribute('href', repoPath);
                        link.setAttribute('target', '_blank');
                        link.setAttribute('rel', 'noopener noreferrer');
                    } else {
                        link.setAttribute('href', repoPath);
                    }
                } catch (e) {
                    console.warn('rewriteContentLinks: skipped malformed link', e?.message);
                }
            }
        }

        // ── applyMeetingMaterialsTree — file tree post-processing, from loadPage ─
        function _applyMeetingMaterialsTree(container) {
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
            const items = Array.from(ul.children);
            for (const [i, li] of items.entries()) {
                if (li.querySelector(':scope > .tree-connector')) continue;
                // Replace folder anchors with spans — either href still ends with '/' (raw markdown)
                // or href was already stripped by rewriteContentLinks (aria-disabled set)
                const firstAnchor = li.querySelector(':scope > a');
                if (firstAnchor) {
                    const href = firstAnchor.getAttribute('href') || '';
                    if (href.endsWith('/') || !href) {
                        const span = document.createElement('span');
                        span.className = firstAnchor.className || '';
                        span.innerHTML = firstAnchor.innerHTML;
                        li.replaceChild(span, firstAnchor);
                    }
                }
                const isLast = i === items.length - 1;
                const connector = isLast ? '└── ' : '├── ';
                const childPrefix = prefix + (isLast ? '    ' : '│   ');
                const pre = document.createElement('span');
                pre.className = 'tree-connector';
                pre.textContent = prefix + connector;
                li.insertBefore(pre, li.firstChild);
                const nested = li.querySelector(':scope > ul');
                if (nested) renderFileTree(nested, childPrefix);
                li.classList.add(nested ? 'tree-folder' : 'tree-file');
            }
        }

        function ensureDOMPurifyHooks() {
            if (!guard(ensureDOMPurifyHooks)) return;
            DOMPurify.addHook('afterSanitizeAttributes', node => {
                if (node.tagName !== 'A') return;
                const href = node.getAttribute('href') || '';
                if (/^https?:/i.test(href)) {
                    node.setAttribute('target', '_blank');
                    node.setAttribute('rel', 'noopener noreferrer');
                }
            });
        }

        let _activeReaderController = null;
        let _loadPageGeneration = 0;

        function buildTableOfContents(h2Elements) {
            if (h2Elements.length < 2) return null;
            const tocItems = Array.from(h2Elements).map((h2, idx) => {
                if (!h2.id) {
                    h2.id = h2.textContent.trim().toLowerCase()
                        .replace(/[^a-z0-9_-]+/g, '-')
                        .replace(/^-+|-+$/g, '') || `section-${idx}`;
                }
                return `<li><a href="#${h2.id}" class="text-spectrum-2 hover:underline flex items-center gap-2" style="font-size:0.8125rem; font-weight:400;"><span style="opacity:0.6;font-size:0.75rem;">↳</span> ${h2.textContent.trim()}</a></li>`;
            }).join('');

            return `
                <nav class="toc-container mb-8 p-5 rounded border-l-2" style="background: var(--materials-panel-bg); border-color: var(--spectrum-3);" aria-label="Table of contents">
                    <p class="text-[0.6875rem] font-bold uppercase tracking-[0.2em] mb-3" style="color: var(--text-muted); margin-top:0;">Contents</p>
                    <ul class="space-y-2" style="margin: 0; padding: 0; list-style-type: none;">
                        ${tocItems}
                    </ul>
                </nav>`;
        }

        function _showReaderError(path, anchorId) {
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
            if (returnBtn) returnBtn.addEventListener('click', navigateToDashboard);
            readerStatus.textContent = 'Document unavailable.';
        }

        /**
         * @param {string} path - Safe repo path to a markdown file
         * @param {string|null} [anchorId] - Optional heading anchor to scroll into view after render
         *
         * Fetches markdown, parses with marked, sanitizes with DOMPurify, then renders into
         * the reader view. Handles link rewriting, TOC generation, file tree rendering, and
         * stale-response cancellation via generation counter. On failure, shows a retry UI.
         */
        async function loadPage(path, anchorId) {
            const myGeneration = ++_loadPageGeneration;

            if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
                if (content) content.innerHTML = '<p>Reader unavailable: required libraries could not be loaded. Check your connection and try reloading the page.</p>';
                setView('reader');
                return;
            }
            setView('reader');
            content.focus({ preventScroll: true });
            window.scrollTo(0, 0);
            readerStatus.textContent = 'Loading document...';
            content.setAttribute('aria-busy', 'true');
            content.innerHTML = '<div class="py-12 text-center text-sm uppercase tracking-widest text-muted animate-pulse">Loading session notes&hellip;</div>';

            if (_activeReaderController) _activeReaderController.abort();
            const controller = new AbortController();
            _activeReaderController = controller;
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            try {
                const text = await fetchMarkdown(path, controller.signal);
                if (myGeneration !== _loadPageGeneration) return;
                ensureDOMPurifyHooks();
                const sanitized = DOMPurify.sanitize(marked.parse(text), {
                    FORBID_TAGS: ['style', 'iframe', 'form', 'object', 'embed'],
                    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'oninput', 'onmouseover', 'onmouseenter', 'onfocus', 'onkeydown', 'onkeyup'],
                });

                content.innerHTML = sanitized;

                for (const img of content.querySelectorAll('img')) {
                    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
                    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
                }

                rewriteContentLinks(content, path);

                const h2Elements = content.querySelectorAll('h2');
                const h1 = content.querySelector('h1');
                if (h1) {
                    document.title = `${h1.textContent.trim()} | Actionable Philosophy Book Club`;
                    content.setAttribute('aria-label', h1.textContent.trim());
                    const readerDocLabel = document.getElementById('reader-doc-label');
                    if (readerDocLabel) readerDocLabel.textContent = h1.textContent.trim();

                    const tocHtml = buildTableOfContents(h2Elements);
                    if (tocHtml) {
                        const tocDiv = document.createElement('div');
                        tocDiv.innerHTML = tocHtml;
                        tocDiv.querySelectorAll('a').forEach(anchor => {
                            anchor.addEventListener('click', (e) => {
                                e.preventDefault();
                                const targetId = anchor.getAttribute('href').substring(1);
                                const targetEl = document.getElementById(targetId);
                                if (targetEl) {
                                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    targetEl.setAttribute('tabindex', '-1');
                                    targetEl.focus({ preventScroll: true });
                                }
                            });
                        });
                        h1.parentNode.insertBefore(tocDiv.firstChild, h1.nextSibling);
                    }
                }

                _applyMeetingMaterialsTree(content);
                if (anchorId) {
                    requestAnimationFrame(() => {
                        const el = document.getElementById(anchorId);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                }
                readerStatus.textContent = 'Document loaded.';
            } catch (err) {
                if (myGeneration !== _loadPageGeneration) return;
                console.warn('loadPage failed:', err?.message || err);
                _showReaderError(path, anchorId);
            } finally {
                clearTimeout(timeoutId);
                if (myGeneration === _loadPageGeneration) {
                    content.setAttribute('aria-busy', 'false');
                    _activeReaderController = null;
                }
            }
        }
