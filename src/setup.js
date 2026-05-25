/**
 * Setup: grab essential DOM references and export commonly used elements.
 *
 * All 13 IDs must exist in index.html — they are static elements baked into the
 * HTML template. If an ID is missing the ref will be null, and consumers should
 * guard with optional chaining or if-checks.
 *
 * Consumers by reference:
 *   dashboard, reader       → view.js, app.js
 *   markdownContent          → reader-loader.js, app.js
 *   readerStatus              → reader-loader.js
 *   upcoming* / archive* / draft* / siteFooter  → dashboard.js
 *
 * Public API (exports via globals): dashboard, reader, markdownContent, readerStatus,
 * upcomingCardHeader, upcomingMaterialsContainer, upcomingKeyTakeaway, upcomingCta,
 * upcomingPodcasts, archiveCardsContainer, draftCardsContainer, siteFooter
 *
 * Side-effects: reads DOM at module load time; must run after DOM exists in page.
 */
(function() {
'use strict';
const dashboard = document.getElementById('dashboard-view');
const reader = document.getElementById('reader-view');
const markdownContent = document.getElementById('markdown-content');
const readerStatus = document.getElementById('reader-status');
const upcomingCardHeader = document.getElementById('upcoming-card-header');
const upcomingMaterialsContainer = document.getElementById('upcoming-materials-container');
const upcomingKeyTakeaway = document.getElementById('upcoming-key-takeaway');
const upcomingCta = document.getElementById('upcoming-cta');
const upcomingPodcasts = document.getElementById('upcoming-podcasts');
const archiveCardsContainer = document.getElementById('archive-cards-container');
const draftCardsContainer = document.getElementById('draft-cards-container');
const siteFooter = document.getElementById('site-footer');

window.dashboard = dashboard;
window.reader = reader;
window.markdownContent = markdownContent;
window.readerStatus = readerStatus;
window.upcomingCardHeader = upcomingCardHeader;
window.upcomingMaterialsContainer = upcomingMaterialsContainer;
window.upcomingKeyTakeaway = upcomingKeyTakeaway;
window.upcomingCta = upcomingCta;
window.upcomingPodcasts = upcomingPodcasts;
window.archiveCardsContainer = archiveCardsContainer;
window.draftCardsContainer = draftCardsContainer;
window.siteFooter = siteFooter;
})();
