/**
 * Reader error UI: shows a retry/back UI when document load fails.
 *
 * Public API:
 * - _showReaderError(path, anchorId)
 *
 * Side-effects: renders retry UI into #markdown-content and updates readerStatus.
 */
function _showReaderError(path, anchorId) {
    showRetryUI(markdownContent, {
        message: 'Document unavailable.',
        retryLabel: 'Try again',
        onRetry: () => loadPage(path, anchorId),
        backLabel: 'Return to Dashboard',
        onBack: navigateToDashboard,
    });
    readerStatus.textContent = 'Document unavailable.';
}
