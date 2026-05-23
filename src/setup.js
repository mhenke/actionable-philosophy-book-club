/**
 * Setup: grab essential DOM references and export commonly used elements.
 *
 * Public API (exports via globals): dashboard, reader, markdownContent, readerStatus
 *
 * Side-effects: reads DOM at module load time; must run after DOM exists in page.
 */
'use strict';
const dashboard = document.getElementById('dashboard-view');
const reader = document.getElementById('reader-view');
const markdownContent = document.getElementById('markdown-content');
const readerStatus = document.getElementById('reader-status');
