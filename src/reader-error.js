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
