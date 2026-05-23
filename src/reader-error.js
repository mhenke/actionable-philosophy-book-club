/**
 * Reader error UI: shows a retry/back UI when document load fails.
 * Accepts an optional custom message for different error scenarios.
 *
 * Public API:
 * - _showReaderError(path, anchorId, opts?)
 *
 * Side-effects: renders retry UI into #markdown-content and updates readerStatus.
 */
function _showReaderError(path, anchorId, { message = 'Document unavailable.' } = {}) {
    showRetryUI(markdownContent, {
        message: message,
        retryLabel: 'Try again',
        onRetry: () => loadPage(path, anchorId),
        backLabel: 'Return to Dashboard',
        onBack: navigateToDashboard,
    });
    readerStatus.textContent = message;
}
