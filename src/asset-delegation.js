/** Sets up delegated click handlers on [data-asset-container] elements. Routes .mp4 clicks to video player, others to navigation. */
function setupAssetClickDelegation() {
    const containers = document.querySelectorAll('[data-asset-container]');
    containers.forEach(container => {
        if (!callOnce(container)) return;
        container.addEventListener('click', (e) => {
            const link = e.target.closest('.asset-link');
            if (!link) return;
            const dl = e.target.closest('.asset-dl');
            if (dl) return;

            const href = link.getAttribute('href');
            if (!href || !isSafePath(href, DOMAIN.ASSET)) return;
            e.preventDefault();

            if (classifyAssetPath(href) === 'video') {
                const labelEl = link.querySelector('.asset-link-top') || link;
                openVideoPlayer(href, (labelEl.textContent || '').trim() || href);
            } else {
                window.location.href = href;
            }
        });
    });
}
