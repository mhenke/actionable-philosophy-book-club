/**
 * Retry UI helper: wires a button to an async retry handler with optimistic disabled state.
 *
 * Public API:
 * - bindRetryButton(btn, handler, options)
 * - showRetryUI(container, opts)
 *
 * Side-effects: mutates button text and disabled state during retry attempts.
 */
/**
 * Wires a click listener that runs an async handler, disables the button during the attempt,
 * and restores it on failure so the user can retry.
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

/**
 * Renders a centered retry panel with optional retry and back buttons.
 * Wires click handlers via bindRetryButton for the retry case.
 */
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


