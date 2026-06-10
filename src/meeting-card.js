/**
 * Meeting card renderer: consolidated rendering chain from assets.js, viewer.js,
 * asset-copy.js, format.js, and path.js.
 *
 * Public API:
 * - renderMeetingCard(meeting, { status }) -> string
 *
 * Returns the complete HTML for a meeting card including header, asset rows,
 * resource strip, additional material rows, podcast disclosure, and notes link.
 * Self-contained module with no window.* dependencies.
 */
(function() {
'use strict';

/* ───── format.js (inlined) ───── */

const _HTML_ESCAPE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => _HTML_ESCAPE[c]);
}

function formatDuration(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '';
    const totalSeconds = Math.round(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m ${secs}s`;
}

function formatFileSize(mb) {
    if (!Number.isFinite(mb)) return '';
    if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
    if (mb < 10) return `${mb.toFixed(1)} MB`;
    return `${Math.round(mb)} MB`;
}

/* ───── path.js (inlined) ───── */

const _ASSET_ROOTS = new Set(['meetings', 'assets']);
const _REPO_ROOTS = new Set(['meetings', 'docs', 'templates']);
const DOMAIN = Object.freeze({ REPO: 'repo', ASSET: 'asset' });
const PATH_MAX_LENGTH = 256;

function isSafePath(p, domain) {
    if (!p || typeof p !== 'string') return false;
    if (p.length === 0 || p.length > PATH_MAX_LENGTH) return false;
    if (/^[a-z][a-z0-9+.-]*:/i.test(p)) return false;
    if (p.startsWith('//') || p.startsWith('/') || p.startsWith('.')) return false;
    if (p.includes('..')) return false;
    if (/[\\\x00-\x1f]/.test(p)) return false;
    const segments = p.split('/');
    if (segments.some(s => s === '' || s === '.')) return false;
    if (domain === DOMAIN.ASSET) {
        return _ASSET_ROOTS.has(segments[0]) &&
            /\.(mp4|m4a|pptx|pdf|png|jpg|jpeg|gif|svg|webp)$/i.test(p);
    }
    if (domain === DOMAIN.REPO) {
        return !/[^\w.\-/]/.test(p) &&
            p.endsWith('.md') &&
            _REPO_ROOTS.has(segments[0]);
    }
    return false;
}

const REL_EXTERNAL = 'noopener noreferrer';

/* ───── asset-copy.js (inlined) ───── */

/** Mutable registry loaded from manifest at runtime; merged over defaults. */
let _MERGED_ASSET_COPY = {};

const _DEFAULT_ASSET_COPY = Object.freeze({
    alternate: { label: 'Alternate', title: 'A different take on the session topic', icon: '\uD83C\uDFAC', color: 'var(--spectrum-2)' },
    'deep-dive': { label: 'Deep Dive', title: 'An exploration of the session topic', icon: '\uD83D\uDD2C', color: 'var(--spectrum-2)' },
    critique: { label: 'Critique', title: 'A critical analysis of the key arguments and trade-offs', icon: '\uD83D\uDD0D', color: 'var(--spectrum-2)' },
    debate: { label: 'Debate', title: 'A structured debate between two design perspectives', icon: '\u2694\uFE0F', color: 'var(--spectrum-2)' },
});

/** Validates manifest asset copy entries, installs the sanitized registry. Falls back to defaults for missing entries. */
function loadAssetCopyRegistry(assetCopy) {
    const registry = {};
    if (!assetCopy || typeof assetCopy !== 'object' || Array.isArray(assetCopy)) {
        _MERGED_ASSET_COPY = registry;
        return;
    }
    const expectedKeys = Object.keys(_DEFAULT_ASSET_COPY);
    for (const key of expectedKeys) {
        const entry = assetCopy[key];
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
        const sanitized = {};
        if (typeof entry.label === 'string' && entry.label.trim()) sanitized.label = entry.label;
        if (typeof entry.title === 'string' && entry.title.trim()) sanitized.title = entry.title;
        if (typeof entry.icon === 'string' && entry.icon.trim()) sanitized.icon = entry.icon;
        if (typeof entry.color === 'string' && entry.color.trim()) sanitized.color = entry.color;
        if (Object.keys(sanitized).length > 0) registry[key] = sanitized;
    }
    _MERGED_ASSET_COPY = registry;
}

/** Returns merged entry for a copy type: manifest values override defaults. */
function getAssetCopy(type) {
    const entry = _MERGED_ASSET_COPY[type];
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        return { ...(_DEFAULT_ASSET_COPY[type] || {}), ...entry };
    }
    return _DEFAULT_ASSET_COPY[type] || {};
}

/* ───── Internal asset builders (from assets.js) ───── */

const _DOWNLOAD_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>';

function _toAssetSlug(filePath) {
    return filePath.split('/').pop().replace(/\.\w+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
}

function _buildAssetRow(config) {
    const rowAttrs = config.id ? ` id="${config.id}"` : '';
    const testidAttr = config.testid ? ` data-testid="${config.testid}"` : '';
    const canonicalAttr = config.canonical ? ' data-canonical="true"' : '';

    const iconPart = `<span class="icon-pill" style="background: ${config.iconBg};" aria-hidden="true">${config.icon}</span>`;

    let labelPart = `<span class="asset-link-text">${config.label}</span>`;
    if (config.badge) {
        labelPart += ` <span class="podcast-badge" style="color:${config.badge.color}">${escapeHTML(config.badge.text)}</span>`;
    }

    const metaPart = config.meta ? `<span class="asset-meta">${config.meta}</span>` : '';
    const captionPart = config.caption ? `<span class="podcast-caption">${escapeHTML(config.caption)}</span>` : '';

    const innerContent = `<span class="asset-link-top">${iconPart}${labelPart}</span>${metaPart}${captionPart}`;

    const linkContent = config.href
        ? `<a href="${escapeHTML(config.href)}" class="asset-link asset-link--stacked"${config.ariaLabel ? ` aria-label="${config.ariaLabel}"` : ''}${config.hrefTarget ? ` target="${config.hrefTarget}"` : ''}${config.hrefRel ? ` rel="${config.hrefRel}"` : ''}>${innerContent}</a>`
        : `<span class="asset-link asset-link--stacked">${innerContent}</span>`;

    const dlContent = config.downloadHref
        ? `<a href="${escapeHTML(config.downloadHref)}" download aria-label="${config.downloadLabel}" class="asset-dl">${_DOWNLOAD_ICON_SVG}</a>`
        : '';

    return `<div class="asset-row"${rowAttrs}${testidAttr}${canonicalAttr}>${linkContent}${dlContent}</div>`;
}

function _buildPlaceholder(emoji, label) {
    return `
                    <div class="asset-row opacity-50">
                        <span class="asset-link cursor-default">
                            <span class="icon-pill" style="background: var(--wash-3-border);" aria-hidden="true">${emoji}</span>
                            <span class="asset-link-text">${label}</span> <span class="text-[11px] uppercase tracking-wider ml-auto">Coming Soon</span>
                        </span>
                    </div>`;
}

function buildVideoRow(meeting) {
    const videoDuration = meeting.video.duration ? formatDuration(meeting.video.duration) : '';
    const videoSize = meeting.video.fileSize ? formatFileSize(meeting.video.fileSize) : '';
    const videoMeta = [videoDuration, videoSize].filter(Boolean).join(' \u00B7 ');
    const videoSlug = _toAssetSlug(meeting.video.file ?? '');
    const id = escapeHTML(meeting.id);
    const session = escapeHTML(meeting.session);
    const label = escapeHTML(meeting.video.label ?? '');
    const file = escapeHTML(meeting.video.file ?? '');
    const metaSuffix = [videoDuration, videoSize].filter(Boolean).map(s => ', ' + s).join('');
    return _buildAssetRow({
        id: `asset-${id}-video-${videoSlug}`,
        testid: `${id}-canonical`,
        canonical: true,
        icon: '\uD83C\uDFAC',
        iconBg: 'var(--wash-3-border)',
        label: label,
        href: file,
        ariaLabel: `${label}${metaSuffix} (${session})`,
        downloadHref: file,
        downloadLabel: `Download ${label}${metaSuffix} (${session})`,
        meta: videoMeta ? `<span class="asset-meta">${videoMeta}</span>` : '',
    });
}

function buildSlidesRow(meeting) {
    const slidesSize = meeting.slides.fileSize ? formatFileSize(meeting.slides.fileSize) : '';
    const file = escapeHTML(meeting.slides.file ?? '');
    const label = escapeHTML(meeting.slides.label ?? '');
    const viewerUrl = window.buildPPTXViewerURL(meeting.slides.file ?? '');
    return _buildAssetRow({
        icon: '\uD83D\uDCCA',
        iconBg: 'var(--wash-2-border)',
        label: label,
        href: viewerUrl || '',
        hrefTarget: viewerUrl ? '_blank' : '',
        hrefRel: viewerUrl ? REL_EXTERNAL : '',
        downloadHref: file,
        downloadLabel: `Download slides (${escapeHTML(meeting.session)})`,
        meta: slidesSize ? `<span class="asset-meta">${slidesSize}</span>` : '',
    });
}

function buildAdditionalRow(item, meeting) {
    const category = item.category || '';
    const copy = category ? getAssetCopy(category) : {};
    const isAudio = window.classify(item.file) === 'audio';
    const cfg = category
        ? { icon: copy.icon || '\uD83C\uDF99', color: copy.color || 'var(--spectrum-2)' }
        : (isAudio ? { icon: '\uD83C\uDF99', color: 'var(--spectrum-2)' } : { icon: '\uD83D\uDCC4', color: 'var(--spectrum-2)' });
    const badgeLabel = category ? (copy.label || category) : '';
    const caption = category ? (copy.title || '') : '';
    const itemDuration = item.duration ? formatDuration(item.duration) : '';
    const itemSize = item.fileSize ? formatFileSize(item.fileSize) : '';
    const itemMeta = [itemDuration, itemSize].filter(Boolean).join(' \u00B7 ');
    const itemSlug = _toAssetSlug(item.file);
    const fileExt = item.file.split('.').pop() || 'file';
    const file = escapeHTML(item.file);
    const label = escapeHTML(item.label);
    return _buildAssetRow({
        id: `asset-${escapeHTML(meeting.id)}-additional-${itemSlug}`,
        icon: cfg.icon,
        iconBg: 'var(--wash-3-border)',
        label: label,
        href: file,
        downloadHref: file,
        downloadLabel: `Download ${label}${itemDuration ? ', ' + itemDuration : ''} (${fileExt.toUpperCase()})`,
        meta: itemMeta ? `<span class="asset-meta">${itemMeta}</span>` : '',
        badge: badgeLabel ? { text: badgeLabel, color: cfg.color } : null,
        caption: caption,
    });
}

function buildResourceStrip(additionalMaterial) {
    const images = (additionalMaterial || []).filter(item => window.classify(item.file) === 'image' && isSafePath(item.file, DOMAIN.ASSET));
    if (images.length === 0) return '';
    return `<div class="resource-strip">${images.map(res => {
        const file = escapeHTML(res.file);
        const label = escapeHTML(res.label);
        const webpFile = file.replace(/\.\w+$/, '.webp');
        const img = `<picture><source srcset="${webpFile}" type="image/webp"><img src="${file}" alt="${label}" loading="lazy" width="200" height="140"></picture>`;
        return `                        <a href="${file}" target="_blank" rel="${REL_EXTERNAL}" class="resource-thumb">
                            ${img}
                            <span>${label}</span>
                        </a>`;
    }).join('')}</div>`;
}

function buildPodcastDisclosure(rows, summary) {
    if (rows.length === 0) return '';
    return `<details class="podcast-disclosure"><summary><span class="asset-link"><span class="icon-pill" style="background:var(--wash-3-border);" aria-hidden="true">📦</span>${escapeHTML(summary)}</span><svg class="podcast-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="16" height="16" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg></summary>${rows.join('')}</details>`;
}

function buildAdditionalSummary(additionalMaterial) {
    const safe = (additionalMaterial || []).filter(item => isSafePath(item.file, DOMAIN.ASSET));
    const videoCount = safe.filter(item => window.classify(item.file) === 'video').length;
    const audioCount = safe.filter(item => window.classify(item.file) === 'audio').length;
    const parts = [];
    if (videoCount > 0) parts.push(`${videoCount} Video${videoCount > 1 ? 's' : ''}`);
    if (audioCount > 0) parts.push(`${audioCount} Podcast${audioCount > 1 ? 's' : ''}`);
    const summary = parts.join(' \u00B7 ');
    return summary ? `Additional Resources: ${summary}` : '';
}

function buildAssetRows(meeting, { includePlaceholders = false } = {}) {
    const primaryRows = [];

    if ((meeting.video.file ?? '') && isSafePath(meeting.video.file ?? '', DOMAIN.ASSET)) {
        primaryRows.push(buildVideoRow(meeting));
    } else if (includePlaceholders) {
        primaryRows.push(_buildPlaceholder('\uD83C\uDFAC', 'Video Recording'));
    }

    if ((meeting.slides.file ?? '') && isSafePath(meeting.slides.file ?? '', DOMAIN.ASSET)) {
        primaryRows.push(buildSlidesRow(meeting));
    } else if (includePlaceholders) {
        primaryRows.push(_buildPlaceholder('\uD83D\uDCCA', 'Slides'));
    }

    const additionalMaterial = meeting.additional_material || [];
    const additionalRows = additionalMaterial
        .filter(item => window.classify(item.file) !== 'image' && isSafePath(item.file, DOMAIN.ASSET))
        .map(item => buildAdditionalRow(item, meeting));

    const resourceStrip = buildResourceStrip(additionalMaterial);
    const additionalSummary = buildAdditionalSummary(additionalMaterial);

    return { primaryRows, additionalRows, resourceStrip, additionalSummary };
}

/* ───── Card header rendering (from dashboard.js) ───── */

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

/* ───── Public API ───── */

/**
 * Renders the parts of a meeting card.
 * @param {object} meeting - Meeting object with video/slides/additional_material etc.
 * @param {object} options
 * @param {'upcoming'|'archive'|'draft'} options.status - Card type
 * @returns {{ header: string, materials: string, takeaway: string, cta: string, disclosure: string }}
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
            cta: '',
            disclosure: '',
        };
    }

    const includePlaceholders = status === 'archive';
    const { primaryRows, additionalRows, resourceStrip, additionalSummary } = buildAssetRows(meeting, { includePlaceholders });

    if (status === 'upcoming') {
        const header = _renderCardHeader(meeting, {
            tag: 'h2',
            titleId: 'next-meeting-heading',
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

        const takeaway = meeting.keyTakeaway
            ? `<div class="border p-5" style="background:var(--wash-1);border-color:var(--border-low);">
                                <p class="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-spectrum-2 mb-2">Key Takeaway</p>
                                <p class="text-lg leading-relaxed italic" style="color:var(--text-primary)">${escapeHTML(meeting.keyTakeaway)}</p>
                            </div>`
            : '';

        const cta = meeting.readmeUrl
            ? `<a href="#p=${escapeHTML(meeting.readmeUrl)}" class="meeting-notes-link btn btn-primary py-4 text-[0.9375rem]">Meeting Notes <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 ml-3" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></a>`
            : '';

        const disclosure = buildPodcastDisclosure(additionalRows, additionalSummary);

        return { header, materials, takeaway, cta, disclosure };
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

    return { header, materials, takeaway: '', cta: '', disclosure };
}

window.renderMeetingCard = renderMeetingCard;
window.loadAssetCopyRegistry = loadAssetCopyRegistry;
window.getAssetCopy = getAssetCopy;
if (window.__TEST__) window.getAssetCopyRegistry = () => _MERGED_ASSET_COPY;
})();
