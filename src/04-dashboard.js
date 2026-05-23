function renderUpcomingMaterials() {
    const container = document.getElementById('upcoming-materials-container');
    const podcastContainer = document.getElementById('upcoming-podcasts');
    const headerContainer = document.getElementById('upcoming-card-header');
    const quoteContainer = document.getElementById('upcoming-key-takeaway');
    const ctaContainer = document.getElementById('upcoming-cta');
    if (!container) return;

    const upcomingSection = container.closest('section');
    const meeting = MEETINGS.find(m => m.status === 'upcoming');
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
                            <span class="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-spectrum-2 block mb-1">${escapeHTML(meeting.session)} <span class="font-normal" style="color:var(--text-muted)">&bull; ${escapeHTML(meeting.date)}</span></span>
                            <h2 id="next-meeting-heading" class="text-2xl md:text-3xl font-bold tracking-tight">${escapeHTML(meeting.title)}</h2>
                        </div>
                        <span class="shrink-0 text-[11px] font-bold uppercase tracking-widest px-2 py-1" style="border: 1px solid var(--spectrum-2); color: var(--spectrum-2);">Upcoming</span>
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

function renderArchiveCards() {
    const archiveContainer = document.getElementById('archive-cards-container');
    if (!archiveContainer) return;
    const done = MEETINGS.filter(m => m.status === 'done');

    const fragment = document.createDocumentFragment();
    for (const meeting of done) {
        const { primaryRows, podcastRows, resourceStrip, podcastSummary } = buildAssetRows(meeting, { includePlaceholders: true });
        const podcastSection = buildPodcastDisclosure(podcastRows, podcastSummary);

        const card = document.createElement('div');
        card.className = 'card p-6 md:p-8 border-t-2 flex flex-col';
        card.style.borderTopColor = 'var(--spectrum-3)';

        card.innerHTML = `
                    <div class="flex justify-between items-start mb-5 gap-4">
                        <div class="card-title">
                            <span class="text-[11px] font-semibold uppercase tracking-[0.2em] block mb-1" style="color:var(--text-primary)">${escapeHTML(meeting.session)} <span class="font-normal" style="color:var(--text-muted)">&bull; ${escapeHTML(meeting.date)}</span></span>
                            <h3 class="text-xl font-bold tracking-tight">${escapeHTML(meeting.title)}</h3>
                        </div>
                        <span class="shrink-0 text-[0.6875rem] font-semibold uppercase tracking-widest px-2 py-1" style="border:1px solid var(--text-muted);color:var(--text-muted)">Done</span>
                    </div>
                    ${primaryRows.join('')}
                    ${resourceStrip}
                    <a href="#p=${escapeHTML(meeting.readmeUrl)}" class="meeting-notes-link btn-ghost">Meeting Notes &rarr;</a>
                    ${podcastSection}
                `;

        fragment.appendChild(card);
    }

    archiveContainer.innerHTML = '';
    archiveContainer.appendChild(fragment);
    const archiveSection = archiveContainer.closest('section');
    if (archiveSection) archiveSection.classList.remove('hidden-view');
}

function renderHorizonCards() {
    const horizonContainer = document.getElementById('horizon-cards-container');
    if (!horizonContainer) return;
    const drafts = MEETINGS.filter(m => m.status === 'draft');
    const horizonSection = horizonContainer.closest('section');

    if (drafts.length === 0) {
        horizonContainer.innerHTML = '';
        if (horizonSection) horizonSection.classList.add('hidden-view');
        return;
    }
    if (horizonSection) horizonSection.classList.remove('hidden-view');

    const fragment = document.createDocumentFragment();
    for (const meeting of drafts) {
        const card = document.createElement('div');
        card.className = 'card p-6 md:p-8 border-t-2 flex flex-col';
        card.style.borderTopColor = 'var(--border-low)';

        card.innerHTML = `
                    <div class="flex justify-between items-start mb-5 gap-4">
                        <div class="card-title">
                            <span class="text-[11px] font-semibold uppercase tracking-[0.2em] block mb-1" style="color:var(--text-primary)">${escapeHTML(meeting.session)} <span class="font-normal" style="color:var(--text-muted)">&bull; ${escapeHTML(meeting.date)}</span></span>
                            <h3 class="text-xl font-bold tracking-tight text-muted">Coming Soon</h3>
                        </div>
                        <span class="shrink-0 text-[0.6875rem] font-bold uppercase tracking-widest text-muted px-2 py-1" style="border: 1px solid var(--text-muted)">Planned</span>
                    </div>
                    <p class="text-[0.6875rem] uppercase tracking-[0.2em] text-muted mt-auto">Materials will appear when session is confirmed.</p>
                `;

        fragment.appendChild(card);
    }

    horizonContainer.innerHTML = '';
    horizonContainer.appendChild(fragment);
}

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
