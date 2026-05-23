/** Returns HTML for a meeting's session/date metadata line, used across all card types. Color defaults to var(--text-primary). */
function _renderSessionMeta(meeting, color) {
    const c = color || 'var(--text-primary)';
    return `<span class="text-[11px] font-semibold uppercase tracking-[0.2em] block mb-1" style="color:${c}">${escapeHTML(meeting.session)} <span class="font-normal" style="color:var(--text-muted)">&bull; ${escapeHTML(meeting.date)}</span></span>`;
}

/** Renders the upcoming meeting card: header, asset rows, key takeaway, CTA, and podcast disclosure. */
function renderUpcomingMaterials() {
    const container = document.getElementById('upcoming-materials-container');
    const podcastContainer = document.getElementById('upcoming-podcasts');
    const headerContainer = document.getElementById('upcoming-card-header');
    const quoteContainer = document.getElementById('upcoming-key-takeaway');
    const ctaContainer = document.getElementById('upcoming-cta');
    if (!container) return;

    const upcomingSection = container.closest('section');
    const meeting = getMeetingRepository().getByStatus('upcoming')[0];
    if (!meeting) {
        container.innerHTML = '';
        if (headerContainer) headerContainer.innerHTML = '';
        if (quoteContainer) quoteContainer.innerHTML = '';
        if (ctaContainer) ctaContainer.innerHTML = '';
        return;
    }
    if (upcomingSection) upcomingSection.classList.remove('hidden-view');

    if (headerContainer) {
        headerContainer.innerHTML = `
                    <div class="flex justify-between items-start gap-4">
                        <div class="card-title">
                            ${_renderSessionMeta(meeting, 'var(--spectrum-2)')}
                            <h2 id="next-meeting-heading" class="text-2xl md:text-3xl font-bold tracking-tight">${escapeHTML(meeting.title)}</h2>
                        </div>
                        <span class="shrink-0 text-[11px] font-bold uppercase tracking-widest leading-none" style="border: 1px solid var(--spectrum-2); color: var(--spectrum-2); padding: 3px 8px; display: inline-flex; align-items: center;">Upcoming</span>
                    </div>`;
    }

    const { primaryRows, podcastRows, resourceStrip, podcastSummary } = buildAssetRows(meeting, { includePlaceholders: false });
    container.innerHTML = (primaryRows.length === 0 && podcastRows.length === 0 && !resourceStrip)
        ? `<p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Materials available closer to the meeting.</p>`
        : primaryRows.join('') + resourceStrip;

    if (quoteContainer) {
        quoteContainer.innerHTML = meeting.keyTakeaway
            ? `<div class="border p-5" style="background:var(--wash-1);border-color:var(--border-low);">
                               <p class="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-spectrum-2 mb-2">Key Takeaway</p>
                               <p class="text-lg leading-relaxed italic" style="color:var(--text-primary)">${escapeHTML(meeting.keyTakeaway)}</p>
                           </div>`
            : '';
    }

    if (ctaContainer && meeting.readmeUrl) {
        ctaContainer.innerHTML = `<a href="#p=${escapeHTML(meeting.readmeUrl)}" class="meeting-notes-link btn btn-primary w-full py-4 text-[0.9375rem]">Meeting Notes <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 ml-3" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></a>`;
    }

    if (podcastContainer) {
        podcastContainer.innerHTML = buildPodcastDisclosure(podcastRows, podcastSummary);
    }
    const kbSection = document.querySelector('[aria-labelledby="section-kb"]');
    if (kbSection) kbSection.classList.remove('hidden-view');
    const footer = document.getElementById('site-footer');
    if (footer) footer.classList.remove('hidden-view');
}

function _renderCardList(containerId, meetings, cardRenderer) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const section = container.closest('section');
    if (meetings.length === 0) {
        container.innerHTML = '';
        if (section) section.classList.add('hidden-view');
        return;
    }
    if (section) section.classList.remove('hidden-view');

    const fragment = document.createDocumentFragment();
    for (const meeting of meetings) {
        const card = document.createElement('div');
        card.className = 'card p-6 md:p-8 border-t-2 flex flex-col';
        card.style.borderTopColor = 'var(--spectrum-3)';
        card.innerHTML = cardRenderer(meeting);
        fragment.appendChild(card);
    }
    container.innerHTML = '';
    container.appendChild(fragment);
}

/** Renders archive cards for completed meetings with assets, notes link, and podcast disclosure. */
function renderArchiveCards() {
    const done = getMeetingRepository().getByStatus('done');
    _renderCardList('archive-cards-container', done, meeting => {
        const { primaryRows, podcastRows, resourceStrip, podcastSummary } = buildAssetRows(meeting, { includePlaceholders: true });
        const podcastSection = buildPodcastDisclosure(podcastRows, podcastSummary);
        return `
                    <div class="flex justify-between items-start mb-5 gap-4">
                        <div class="card-title">
                            ${_renderSessionMeta(meeting)}
                            <h3 class="text-xl font-bold tracking-tight">${escapeHTML(meeting.title)}</h3>
                        </div>
                        <span class="shrink-0 text-[0.6875rem] font-semibold uppercase tracking-widest leading-none" style="border:1px solid var(--text-muted);color:var(--text-muted); padding: 3px 8px; display: inline-flex; align-items: center;">Done</span>
                    </div>
                    ${primaryRows.join('')}
                    ${resourceStrip}
                    <a href="#p=${escapeHTML(meeting.readmeUrl)}" class="meeting-notes-link btn-ghost">Meeting Notes &rarr;</a>
                    ${podcastSection}
                `;
    });
}

/**
 * Sets up retry UI across dashboard containers when manifest load fails.
 * Clears all dashboard containers and shows a retry prompt in the upcoming header.
 * On retry, reloads the manifest and re-renders all dashboard sections.
 */
function setupManifestRetryUI() {
    const upcomingHeader = document.getElementById('upcoming-card-header');
    const upcomingMaterials = document.getElementById('upcoming-materials-container');
    const upcomingCta = document.getElementById('upcoming-cta');
    const archiveContainer = document.getElementById('archive-cards-container');
    const horizonContainer = document.getElementById('horizon-cards-container');
    if (upcomingHeader) showRetryUI(upcomingHeader, {
        message: "Couldn't load sessions",
        retryLabel: 'Tap to retry',
        onRetry: async () => {
            await loadManifest();
            if (upcomingHeader) upcomingHeader.innerHTML = '';
            renderUpcomingMaterials();
            renderArchiveCards();
            renderHorizonCards();
        },
    });
    if (upcomingMaterials) upcomingMaterials.innerHTML = '';
    if (upcomingCta) upcomingCta.innerHTML = '';
    if (archiveContainer) archiveContainer.innerHTML = '';
    if (horizonContainer) {
        horizonContainer.innerHTML = '';
        const horizonSection = horizonContainer.closest('section');
        if (horizonSection) horizonSection.classList.add('hidden-view');
    }
}

/** Renders draft/horizon meeting cards with placeholder content. */
function renderHorizonCards() {
    const drafts = getMeetingRepository().getByStatus('draft');
    if (drafts.length === 0) {
        const container = document.getElementById('horizon-cards-container');
        if (container) container.innerHTML = '';
        const section = container?.closest('section');
        if (section) section.classList.add('hidden-view');
        return;
    }
    _renderCardList('horizon-cards-container', drafts, meeting => `
                    <div class="flex justify-between items-start mb-5 gap-4">
                        <div class="card-title">
                            ${_renderSessionMeta(meeting)}
                            <h3 class="text-xl font-bold tracking-tight text-muted">Coming Soon</h3>
                        </div>
                        <span class="shrink-0 text-[0.6875rem] font-bold uppercase tracking-widest text-muted leading-none" style="border: 1px solid var(--text-muted); padding: 3px 8px; display: inline-flex; align-items: center;">Planned</span>
                    </div>
                    <p class="text-[0.6875rem] uppercase tracking-[0.2em] text-muted mt-auto">Materials will appear when session is confirmed.</p>
                `);
}


