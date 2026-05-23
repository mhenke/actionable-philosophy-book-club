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
