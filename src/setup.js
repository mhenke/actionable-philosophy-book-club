/**
 * Setup: grab essential DOM references and export commonly used elements.
 *
 * Public API (exports via globals): dashboard, reader, markdownContent, readerStatus,
 * upcomingCardHeader, upcomingMaterialsContainer, upcomingKeyTakeaway, upcomingCta,
 * upcomingPodcasts, archiveCardsContainer, horizonCardsContainer, siteFooter
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
const horizonCardsContainer = document.getElementById('horizon-cards-container');
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
window.horizonCardsContainer = horizonCardsContainer;
window.siteFooter = siteFooter;
})();
