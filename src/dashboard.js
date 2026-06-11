(function() {
'use strict';
const { upcomingCardHeader, upcomingMaterialsContainer, upcomingKeyTakeaway, upcomingWhatToRead, upcomingCta, upcomingAdditional, archiveCardsContainer, draftCardsContainer, siteFooter } = window.DOM;

/** Clears a dashboard container and hides its parent section. Used when a section has no content to show. */
function _hideEmptySection(container) {
    if (!container) return;
    container.innerHTML = '';
    const section = container.closest('section');
    if (section) section.classList.add('hidden-view');
}

/** Renders the upcoming meeting card using renderMeetingCard. */
function renderUpcomingMaterials() {
    if (!upcomingMaterialsContainer) return;

    const upcomingSection = upcomingMaterialsContainer.closest('section');
    const meeting = findMeetings({ status: window.STATUS.UPCOMING })[0];
    if (!meeting) {
        upcomingMaterialsContainer.innerHTML = '';
        if (upcomingCardHeader) upcomingCardHeader.innerHTML = '';
        if (upcomingKeyTakeaway) upcomingKeyTakeaway.innerHTML = '';
        if (upcomingWhatToRead) upcomingWhatToRead.innerHTML = '';
        if (upcomingCta) upcomingCta.innerHTML = '';
        if (upcomingAdditional) upcomingAdditional.innerHTML = '';
        return;
    }
    if (upcomingSection) upcomingSection.classList.remove('hidden-view');

    const parts = renderMeetingCard(meeting, { status: 'upcoming' });
    if (upcomingCardHeader) upcomingCardHeader.innerHTML = parts.header;
    upcomingMaterialsContainer.innerHTML = parts.materials;
    if (upcomingWhatToRead) upcomingWhatToRead.innerHTML = parts.whatToRead;
    if (upcomingKeyTakeaway) upcomingKeyTakeaway.innerHTML = parts.takeaway;
    if (upcomingCta) upcomingCta.innerHTML = parts.cta;
    if (upcomingAdditional) upcomingAdditional.innerHTML = parts.disclosure;

    const kbSection = document.querySelector('[aria-labelledby="section-kb"]');
    if (kbSection) kbSection.classList.remove('hidden-view');
    if (siteFooter) siteFooter.classList.remove('hidden-view');
}

function _renderCardList(containerId, meetings, cardRenderer) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const section = container.closest('section');
    if (meetings.length === 0) {
        _hideEmptySection(container);
        return;
    }
    if (section) section.classList.remove('hidden-view');

    const fragment = document.createDocumentFragment();
    for (const meeting of meetings) {
        const card = document.createElement('div');
        card.className = 'card p-6 md:p-8 border-t-2 flex flex-col';
        card.style.borderTopColor = meeting.color ? `var(--${meeting.color})` : 'var(--spectrum-3)';
        card.innerHTML = cardRenderer(meeting);
        fragment.appendChild(card);
    }
    container.innerHTML = '';
    container.appendChild(fragment);
}

/** Renders archive cards for completed meetings using renderMeetingCard. */
function renderArchiveCards() {
    const done = findMeetings({ status: window.STATUS.DONE });
    _renderCardList('archive-cards-container', done, meeting => {
        const parts = renderMeetingCard(meeting, { status: 'archive' });
        return parts.header + parts.materials + parts.disclosure;
    });
}

/**
 * Sets up retry UI across dashboard containers when manifest load fails.
 * Clears all dashboard containers and shows a retry prompt in the upcoming header.
 * On retry, reloads the manifest and re-renders all dashboard sections.
 */
function setupManifestRetryUI() {
    if (upcomingCardHeader) showRetryUI(upcomingCardHeader, {
        message: "Couldn't load sessions",
        retryLabel: 'Tap to retry',
        onRetry: async () => {
            const manifest = await loadManifest();
            MeetingRepository.setAll(manifest.meetings);
            if (upcomingCardHeader) upcomingCardHeader.innerHTML = '';
            renderUpcomingMaterials();
            renderArchiveCards();
            renderDraftCards();
        },
    });
    if (upcomingMaterialsContainer) upcomingMaterialsContainer.innerHTML = '';
    if (upcomingCta) upcomingCta.innerHTML = '';
    if (archiveCardsContainer) archiveCardsContainer.innerHTML = '';
    _hideEmptySection(draftCardsContainer);
}

/** Renders draft meeting cards using renderMeetingCard. */
function renderDraftCards() {
    const drafts = findMeetings({ status: window.STATUS.DRAFT });
    if (drafts.length === 0) {
        _hideEmptySection(draftCardsContainer);
        return;
    }
    _renderCardList('draft-cards-container', drafts, meeting => {
        const parts = renderMeetingCard(meeting, { status: 'draft' });
        return parts.header + parts.materials;
    });
}

window.renderUpcomingMaterials = renderUpcomingMaterials;
window.renderArchiveCards = renderArchiveCards;
window.renderDraftCards = renderDraftCards;
window.setupManifestRetryUI = setupManifestRetryUI;
if (window.__TEST__) {
    window.__dashboardTestHooks = { hideEmptySection: _hideEmptySection };
}
})();
