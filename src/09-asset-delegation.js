        // ── Asset click delegation (dashboard) ──
        function setupAssetClickDelegation(container) {
            if (!container || container.__assetDelegationInstalled) return;
            container.__assetDelegationInstalled = true;
            container.addEventListener('click', (e) => {
                const link = e.target.closest('.asset-link');
                if (!link) return;
                const dl = e.target.closest('.asset-dl');
                if (dl) return;

                const href = link.getAttribute('href');
                if (!href || !isSafeAssetPath(href)) return;
                e.preventDefault();

                if (href.endsWith('.mp4')) {
                    const labelEl = link.querySelector('.asset-link-top') || link;
                    openVideoPlayer(href, (labelEl.textContent || '').trim() || href);
                } else {
                    window.location.href = href;
                }
            });
        }
