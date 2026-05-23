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
