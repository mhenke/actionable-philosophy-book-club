const CACHE_MAX = 20;

function fetchMarkdown(path, signal) {
    if (!isSafePath(path, DOMAIN.REPO)) return Promise.reject(new Error('Unsafe path: ' + path));
    if (mdCache.has(path)) {
        const val = mdCache.get(path);
        mdCache.delete(path);
        mdCache.set(path, val);
        return val;
    }
    if (mdCache.size >= CACHE_MAX) {
        mdCache.delete(mdCache.keys().next().value);
    }
    const promise = fetch(path, { signal })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        });
    mdCache.set(path, promise);
    promise.catch(() => {
        if (mdCache.get(path) === promise) mdCache.delete(path);
    });
    return promise;
}

const _guarded = new WeakMap();
function guard(key) {
    if (_guarded.has(key)) return false;
    _guarded.set(key, true);
    return true;
}

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
