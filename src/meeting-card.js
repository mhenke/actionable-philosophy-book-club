/**
 * Meeting card renderer: thin wrapper around assets.js builders.
 *
 * Public API:
 * - renderMeetingCard(meeting, { status }) -> string
 *
 * Depends on globals from format.js, path.js, and assets.js:
 *   escapeHTML, buildAssetRows, buildPodcastDisclosure
 */
(function() {
'use strict';

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

/**
 * Renders the parts of a meeting card.
 * @param {object} meeting - Meeting object with video/slides/additional_material etc.
 * @param {object} options
 * @param {'upcoming'|'archive'|'draft'} options.status - Card type
 * @returns {{ header: string, materials: string, whatToRead: string, takeaway: string, cta: string, disclosure: string }}
 *   Parts for each card section. Archive/draft return empty strings for unused parts.
 */
function renderMeetingCard(meeting, { status }) {
    if (status === 'draft') {
        return {
            header: _renderCardHeader(meeting, {
                titleClass: 'text-xl font-bold tracking-tight text-muted',
                badgeText: 'Planned',
                badgeStyle: { borderColor: 'var(--text-muted)', color: 'var(--text-muted)', className: 'font-bold' },
            }),
            materials: '<p class="text-[0.6875rem] uppercase tracking-[0.2em] text-muted mt-auto">Materials will appear when session is confirmed.</p>',
            takeaway: '',
            whatToRead: '',
            cta: '',
            disclosure: '',
        };
    }

    const includePlaceholders = status === 'archive';
    const { primaryRows, additionalRows, resourceStrip, additionalSummary } = buildAssetRows(meeting, { includePlaceholders });

    if (status === 'upcoming') {
        const header = _renderCardHeader(meeting, {
            tag: 'h2',
            titleId: 'upcoming-meeting-heading',
            titleClass: 'text-2xl md:text-3xl font-bold tracking-tight',
            metaColor: 'var(--spectrum-2)',
            badgeText: 'Upcoming',
            extraClass: '',
            badgeStyle: { borderColor: 'var(--spectrum-2)', color: 'var(--spectrum-2)', className: 'font-bold' },
        });

        const hasContent = primaryRows.length > 0 || additionalRows.length > 0 || resourceStrip;
        const materials = hasContent
            ? primaryRows.join('') + resourceStrip
            : '<p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Materials available closer to the meeting.</p>';
        const whatToRead = meeting.whatToRead
            ? `<div class="what-to-read-block">
                                <p class="what-to-read-label"><span aria-hidden="true">📖</span> What to Read</p>
                                <p class="what-to-read-text">${sanitizeWhatToRead(meeting.whatToRead)}</p>
                            </div>`
            : '';
        const takeaway = meeting.keyTakeaway
            ? `<div class="mb-6">
                                <p class="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted mb-3">Key Takeaway</p>
                                <p class="text-base leading-relaxed" style="color:var(--text-primary)">${escapeHTML(meeting.keyTakeaway)}</p>
                            </div>`
            : '';
        const cta = meeting.readmeUrl
            ? `<a href="#p=${escapeHTML(meeting.readmeUrl)}" class="meeting-notes-link btn btn-primary py-4 text-[0.9375rem]">Meeting Notes <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 ml-3" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></a>`
            : '';
        const disclosure = buildPodcastDisclosure(additionalRows, additionalSummary);

        return { header, materials, whatToRead, takeaway, cta, disclosure };
    }

/** Minimal sanitizer for What to Read: escape, then linkify http(s) and markdown [text](url). Only http(s) allowed, others stripped. */
function sanitizeWhatToRead(s) {
    const esc = escapeHTML(s);
    let out = esc.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    out = out.replace(/(https?:\/\/[^\s<]+)/g, (m) => {
        if (out.indexOf('href="' + m) !== -1) return m;
        return '<a href="' + m + '" target="_blank" rel="noopener">' + m + '</a>';
    });
    out = out.replace(/\n/g, '<br>');
    return out;
}
    // Archive
    const header = _renderCardHeader(meeting, {
        badgeText: 'Done',
        badgeStyle: { borderColor: 'var(--text-muted)', color: 'var(--text-muted)', className: 'font-semibold' },
    });

    const notesLink = meeting.readmeUrl
        ? `<a href="#p=${escapeHTML(meeting.readmeUrl)}" class="meeting-notes-link btn-ghost">Meeting Notes &rarr;</a>`
        : '';

    const materials = primaryRows.join('') + resourceStrip + notesLink;
    const disclosure = buildPodcastDisclosure(additionalRows, additionalSummary);

    return { header, materials, takeaway: '', whatToRead: '', cta: '', disclosure };
}

window.renderMeetingCard = renderMeetingCard;
if (window.__TEST__) {
    window.__meetingCardTestHooks = { renderMeetingCard };
}
})();
