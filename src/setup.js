/**
 * Setup: grab essential DOM references and export commonly used elements.
 *
 * All 13 IDs must exist in index.html — they are static elements baked into the
 * HTML template. If an ID is missing the ref will be null, and consumers should
 * guard with optional chaining or if-checks.
 *
 * Architectural note: DOM references are captured at module load time rather than
 * queried on demand. This is a deliberate tradeoff for a no-framework SPA — it
 * centralizes DOM coupling in one module so that HTML structure changes only
 * require updates here, not scattered getElementById calls across 26 files.
 * The cost is temporal coupling: this module must run after DOM is ready.
 *
 * Consumers by reference:
 *   dashboard, reader       → view.js, app.js
 *   markdownContent          → reader-loader.js, app.js
 *   readerStatus              → reader-loader.js
 *   upcoming* / archive* / draft* / siteFooter  → dashboard.js
 *
 * Public API (exports via globals): dashboard, reader, markdownContent, readerStatus,
 * upcomingCardHeader, upcomingMaterialsContainer, upcomingKeyTakeaway, upcomingCta,
 * upcomingAdditional, archiveCardsContainer, draftCardsContainer, siteFooter
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
const upcomingAdditional = document.getElementById('upcoming-additional');
const archiveCardsContainer = document.getElementById('archive-cards-container');
const draftCardsContainer = document.getElementById('draft-cards-container');
const siteFooter = document.getElementById('site-footer');

window.DOM = { dashboard, reader, markdownContent, readerStatus, upcomingCardHeader, upcomingMaterialsContainer, upcomingKeyTakeaway, upcomingCta, upcomingAdditional, archiveCardsContainer, draftCardsContainer, siteFooter };
})();
