(function() {
'use strict';
const { upcomingCardHeader, upcomingMaterialsContainer, upcomingKeyTakeaway, upcomingCta, upcomingAdditional, archiveCardsContainer, draftCardsContainer, siteFooter } = window.DOM;

/** Returns HTML for a meeting's session/date metadata line, used across all card types. Color defaults to var(--text-primary). */
function _renderSessionMeta(meeting, color) {
    const c = color || 'var(--text-primary)';
    return `<span class="text-[11px] font-semibold uppercase tracking-[0.2em] block mb-1" style="color:${c}">${escapeHTML(meeting.session)} <span class="font-normal" style="color:var(--text-muted)">&bull; ${escapeHTML(meeting.date)}</span></span>`;
}

function _renderCardBadge(text, { borderColor = 'var(--text-muted)', color = 'var(--text-muted)', className = 'font-semibold' } = {}) {
    return `<span class="shrink-0 text-[0.6875rem] ${className} uppercase tracking-widest leading-none" style="border:1px solid ${borderColor};color:${color}; padding: 3px 8px; display: inline-flex; align-items: center;">${escapeHTML(text)}</span>`;
}

function _renderCardHeader(meeting, opts = {}) {
    const tag = opts.tag || 'h3';
    const titleId = opts.titleId ? ` id="${opts.titleId}"` : '';
    const titleClass = opts.titleClass || 'text-xl font-bold tracking-tight';
    const extraClass = opts.extraClass || 'mb-5';
    return `<div class="flex justify-between items-start${extraClass ? ' ' + extraClass : ''} gap-4">
                        <div class="card-title">
                            ${_renderSessionMeta(meeting, opts.metaColor)}
                            <${tag}${titleId} class="${titleClass}">${escapeHTML(meeting.title)}</${tag}>
                        </div>
                        ${_renderCardBadge(opts.badgeText || '', opts.badgeStyle || {})}
                    </div>`;
}

/** Clears a dashboard container and hides its parent section. Used when a section has no content to show. */
function _hideEmptySection(container) {
    if (!container) return;
    container.innerHTML = '';
    const section = container.closest('section');
    if (section) section.classList.add('hidden-view');
}

/** Renders the upcoming meeting card: header, asset rows, key takeaway, CTA, and podcast disclosure. */
function renderUpcomingMaterials() {
    if (!upcomingMaterialsContainer) return;

    const upcomingSection = upcomingMaterialsContainer.closest('section');
    const meeting = findMeetings({ status: window.STATUS.UPCOMING })[0];
    if (!meeting) {
        upcomingMaterialsContainer.innerHTML = '';
        if (upcomingCardHeader) upcomingCardHeader.innerHTML = '';
        if (upcomingKeyTakeaway) upcomingKeyTakeaway.innerHTML = '';
        if (upcomingCta) upcomingCta.innerHTML = '';
        return;
    }
    if (upcomingSection) upcomingSection.classList.remove('hidden-view');

    if (upcomingCardHeader) {
        upcomingCardHeader.innerHTML = _renderCardHeader(meeting, {
            tag: 'h2',
            titleId: 'next-meeting-heading',
            titleClass: 'text-2xl md:text-3xl font-bold tracking-tight',
            metaColor: 'var(--spectrum-2)',
            badgeText: 'Upcoming',
            extraClass: '',
            badgeStyle: { borderColor: 'var(--spectrum-2)', color: 'var(--spectrum-2)', className: 'font-bold' },
        });
    }

    const { primaryRows, additionalRows, resourceStrip, additionalSummary } = buildAssetRows(meeting, { includePlaceholders: false });
    upcomingMaterialsContainer.innerHTML = (primaryRows.length === 0 && additionalRows.length === 0 && !resourceStrip)
        ? `<p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Materials available closer to the meeting.</p>`
        : primaryRows.join('') + resourceStrip;

    if (upcomingKeyTakeaway) {
        upcomingKeyTakeaway.innerHTML = meeting.keyTakeaway
            ? `<div class="border p-5" style="background:var(--wash-1);border-color:var(--border-low);">
                               <p class="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-spectrum-2 mb-2">Key Takeaway</p>
                               <p class="text-lg leading-relaxed italic" style="color:var(--text-primary)">${escapeHTML(meeting.keyTakeaway)}</p>
                           </div>`
            : '';
    }

    if (upcomingCta && meeting.readmeUrl) {
        upcomingCta.innerHTML = `<a href="#p=${escapeHTML(meeting.readmeUrl)}" class="meeting-notes-link btn btn-primary py-4 text-[0.9375rem]">Meeting Notes <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 ml-3" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></a>`;
    }

    if (upcomingAdditional) {
        upcomingAdditional.innerHTML = buildPodcastDisclosure(additionalRows, additionalSummary);
    }
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

/** Renders archive cards for completed meetings with assets, notes link, and podcast disclosure. */
function renderArchiveCards() {
    const done = findMeetings({ status: window.STATUS.DONE });
    _renderCardList('archive-cards-container', done, meeting => {
        const { primaryRows, additionalRows, resourceStrip, additionalSummary } = buildAssetRows(meeting, { includePlaceholders: true });
        const additionalSection = buildPodcastDisclosure(additionalRows, additionalSummary);
        return `
                    ${_renderCardHeader(meeting, { badgeText: 'Done', badgeStyle: { borderColor: 'var(--text-muted)', color: 'var(--text-muted)', className: 'font-semibold' } })}
                    ${primaryRows.join('')}
                    ${resourceStrip}
                    <a href="#p=${escapeHTML(meeting.readmeUrl)}" class="meeting-notes-link btn-ghost">Meeting Notes &rarr;</a>
                    ${additionalSection}
                `;
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
            await loadRepository();
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

/** Renders draft meeting cards with placeholder content. */
function renderDraftCards() {
    const drafts = findMeetings({ status: window.STATUS.DRAFT });
    if (drafts.length === 0) {
        _hideEmptySection(draftCardsContainer);
        return;
    }
    _renderCardList('draft-cards-container', drafts, meeting => `
                    ${_renderCardHeader(meeting, { titleClass: 'text-xl font-bold tracking-tight text-muted', badgeText: 'Planned', badgeStyle: { borderColor: 'var(--text-muted)', color: 'var(--text-muted)', className: 'font-bold' } })}
                    <p class="text-[0.6875rem] uppercase tracking-[0.2em] text-muted mt-auto">Materials will appear when session is confirmed.</p>
                `);
}

window.renderUpcomingMaterials = renderUpcomingMaterials;
window.renderArchiveCards = renderArchiveCards;
window.renderDraftCards = renderDraftCards;
window.setupManifestRetryUI = setupManifestRetryUI;
if (window.__TEST__) {
    window.__dashboardTestHooks = { hideEmptySection: _hideEmptySection };
}
})();
