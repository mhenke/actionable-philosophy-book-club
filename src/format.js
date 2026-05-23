/**
 * Formatting utilities: HTML escaping, duration and filesize formatters.
 *
 * Public API:
 * - escapeHTML(value)
 * - formatDuration(seconds)
 * - formatFileSize(mb)
 *
 * Side-effects: none (pure helpers).
 */
(function() {
'use strict';
const _HTML_ESCAPE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Escapes & < > " ' for safe HTML interpolation. */
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => _HTML_ESCAPE[c]);
}

/** Formats seconds to "Xh Ym" or "Xm Ys". Returns empty string on invalid input. */
function formatDuration(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '';
    const totalSeconds = Math.round(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m ${secs}s`;
}

/** Formats MB to human-readable: KB (<1 MB), decimal MB (<10), integer MB. */
function formatFileSize(mb) {
    if (!Number.isFinite(mb)) return '';
    if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
    if (mb < 10) return `${mb.toFixed(1)} MB`;
    return `${Math.round(mb)} MB`;
}

window.escapeHTML = escapeHTML;
window.formatDuration = formatDuration;
window.formatFileSize = formatFileSize;
})();
