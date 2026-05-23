/**
 * Retry UI helper: wires a button to an async retry handler with optimistic disabled state.
 *
 * Public API:
 * - bindRetryButton(btn, handler, options)
 *
 * Side-effects: mutates button text and disabled state during retry attempts.
 */
function bindRetryButton(btn, handler, { retryText, retryDisabledText } = {}) {
    btn.addEventListener('click', async () => {
        btn.textContent = retryDisabledText || 'Retrying...';
        btn.disabled = true;
        try {
            await handler();
        } catch {
            btn.textContent = retryText || 'Try again';
            btn.disabled = false;
        }
    });
}

function showRetryUI(container, { message, retryLabel, onRetry, backLabel, onBack }) {
    container.innerHTML = `
                <div class="py-12 text-center">
                    <p class="text-sm uppercase tracking-widest text-muted mb-4">${escapeHTML(message)}</p>
                    <div class="flex gap-4 justify-center">
                        ${onRetry ? `<button class="retry-btn text-sm uppercase tracking-widest text-spectrum-2 underline">${escapeHTML(retryLabel || 'Try again')}</button>` : ''}
                        ${onBack ? `<button class="back-btn text-sm uppercase tracking-widest text-muted underline">${escapeHTML(backLabel || 'Return to Dashboard')}</button>` : ''}
                    </div>
                </div>`;
    const retryBtn = container.querySelector('.retry-btn');
    if (retryBtn && onRetry) bindRetryButton(retryBtn, onRetry);
    const backBtn = container.querySelector('.back-btn');
    if (backBtn && onBack) backBtn.addEventListener('click', onBack);
}

/**
 * Sets up retry UI across dashboard containers when manifest load fails.
 * Clears all dashboard containers and shows a retry prompt in the upcoming header.
 * On retry, reloads the manifest and re-renders all dashboard sections.
 */
function setupManifestRetryUI() {
    const upcomingHeader = document.getElementById('upcoming-card-header');
    const upcomingMaterials = document.getElementById('upcoming-materials-container');
    const upcomingCta = document.getElementById('upcoming-cta');
    const archiveContainer = document.getElementById('archive-cards-container');
    const horizonContainer = document.getElementById('horizon-cards-container');
    if (upcomingHeader) showRetryUI(upcomingHeader, {
        message: "Couldn't load sessions",
        retryLabel: 'Tap to retry',
        onRetry: async () => {
            await loadManifest();
            if (upcomingHeader) upcomingHeader.innerHTML = '';
            renderUpcomingMaterials();
            renderArchiveCards();
            renderHorizonCards();
        },
    });
    if (upcomingMaterials) upcomingMaterials.innerHTML = '';
    if (upcomingCta) upcomingCta.innerHTML = '';
    if (archiveContainer) archiveContainer.innerHTML = '';
    if (horizonContainer) {
        horizonContainer.innerHTML = '';
        const horizonSection = horizonContainer.closest('section');
        if (horizonSection) horizonSection.classList.add('hidden-view');
    }
}
