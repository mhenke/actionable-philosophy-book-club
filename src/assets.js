/**
 * Asset builders: render video, slides, podcast, and resource rows from meeting data.
 * Viewer URL resolution is delegated to viewer.js (APOSD Principle 3).
 *
 * Public API:
 * - buildAssetRows(meeting, opts)
 *
 * Side-effects: reads window.location via viewer.js.
 */
(function() {
'use strict';

const _DOWNLOAD_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>';

/** Extracts a URL-safe slug from a file path: filename → lowercased, sanitized, extension stripped. */
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

/** Builds the primary video asset row with metadata (duration, size, label) and download link. */
function buildVideoRow(meeting) {
    const videoDuration = meeting.video.duration ? formatDuration(meeting.video.duration) : '';
    const videoSize = meeting.video.fileSize ? formatFileSize(meeting.video.fileSize) : '';
    const videoMeta = [videoDuration, videoSize].filter(Boolean).join(' · ');
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

/** Renders a disabled placeholder row for a missing asset type (video/slides). */
function _buildPlaceholder(emoji, label) {
    return `
                    <div class="asset-row opacity-50">
                        <span class="asset-link cursor-default">
                            <span class="icon-pill" style="background: var(--wash-3-border);" aria-hidden="true">${emoji}</span>
                            <span class="asset-link-text">${label}</span> <span class="text-[11px] uppercase tracking-wider ml-auto">Coming Soon</span>
                        </span>
                    </div>`;
}

/** Builds the slides asset row with Office Online viewer link, file size, and download button. */
function buildSlidesRow(meeting) {
    const slidesSize = meeting.slides.fileSize ? formatFileSize(meeting.slides.fileSize) : '';
    const file = escapeHTML(meeting.slides.file ?? '');
    const label = escapeHTML(meeting.slides.label ?? '');
    const viewerUrl = buildPPTXViewerURL(meeting.slides.file ?? '');
    return _buildAssetRow({
        icon: '\uD83D\uDCCA',
        iconBg: 'var(--wash-2-border)',
        label: label,
        href: viewerUrl || '',
        hrefTarget: viewerUrl ? '_blank' : '',
        hrefRel: viewerUrl ? window.REL_EXTERNAL : '',
        downloadHref: file,
        downloadLabel: `Download slides (${escapeHTML(meeting.session)})`,
        meta: slidesSize ? `<span class="asset-meta">${slidesSize}</span>` : '',
    });
}

/** Builds a podcast asset row with label, type badge, metadata, caption, and download button. */
function buildPodcastRow(pod, meeting) {
    const copy = getAssetCopy(pod.type);
    const cfg = { icon: copy.icon || '\uD83C\uDF99', color: copy.color || 'var(--spectrum-2)' };
    const badgeLabel = copy.label || pod.type;
    const caption = copy.title || '';
    const podDuration = pod.duration ? formatDuration(pod.duration) : '';
    const podSize = pod.fileSize ? formatFileSize(pod.fileSize) : '';
    const podMeta = [podDuration, podSize].filter(Boolean).join(' \u00B7 ');
    const podSlug = _toAssetSlug(pod.file);
    const fileExt = pod.file.split('.').pop() || 'file';
    const file = escapeHTML(pod.file);
    const label = escapeHTML(pod.label);
    return _buildAssetRow({
        id: `asset-${escapeHTML(meeting.id)}-podcast-${podSlug}`,
        icon: cfg.icon,
        iconBg: 'var(--wash-3-border)',
        label: label,
        href: file,
        downloadHref: file,
        downloadLabel: `Download ${label}${podDuration ? ', ' + podDuration : ''} (${fileExt.toUpperCase()} audio)`,
        meta: podMeta ? `<span class="asset-meta">${podMeta}</span>` : '',
        badge: { text: badgeLabel, color: cfg.color },
        caption: caption,
    });
}

/** Builds a horizontal strip of resource thumbnail links from safe resource entries. */
function buildResourceStrip(resources) {
    const safe = (resources || []).filter(r => isSafePath(r.file, DOMAIN.ASSET));
    if (safe.length === 0) return '';
    return `<div class="resource-strip">${safe.map(res => {
        const file = escapeHTML(res.file);
        const label = escapeHTML(res.label);
        const isImage = classifyAssetPath(res.file) === 'image';
        const img = isImage
            ? `<picture><source srcset="${file}" type="image/webp"><img src="${file}" alt="${label}" loading="lazy" width="120" height="80"></picture>`
            : `<img src="${file}" alt="${label}" loading="lazy" width="120" height="80">`;
        return `<a href="${file}" target="_blank" rel="${window.REL_EXTERNAL}" class="resource-thumb">
                            ${img}
                            <span>${label}</span>
                        </a>`;
    }).join('')}</div>`;
}

/** Wraps podcast asset rows in a <details> disclosure element with a summary label. */
function buildPodcastDisclosure(rows, summary) {
    if (rows.length === 0) return '';
    return `<details class="podcast-disclosure"><summary><span class="asset-link"><span class="icon-pill" style="background:var(--wash-3-border);" aria-hidden="true">📦</span>${escapeHTML(summary)}</span><svg class="podcast-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="16" height="16" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg></summary>${rows.join('')}</details>`;
}

/** Generates a summary string like "1 Video · 3 Podcasts" from the podcasts list for use in disclosure summary. */
function buildPodcastSummary(podcasts) {
    const safe = (podcasts || []).filter(p => isSafePath(p.file, DOMAIN.ASSET));
    const videoCount = safe.filter(p => p.type === 'alternate').length;
    const podcastCount = safe.length - videoCount;
    const parts = [];
    if (videoCount > 0) parts.push(`${videoCount} Video${videoCount > 1 ? 's' : ''}`);
    if (podcastCount > 0) parts.push(`${podcastCount} Podcast${podcastCount > 1 ? 's' : ''}`);
    const summary = parts.join(' · ');
    return summary ? `Additional Resources: ${summary}` : '';
}

/**
 * Builds all asset rows for a meeting: primary (video + slides), podcast rows,
 * resource strip, and podcast summary. The orchestrator for all asset builders.
 * @param {object} meeting - Meeting instance or POJO with video/slides/podcasts/resources
 * @param {object} [opts]
 * @param {boolean} [opts.includePlaceholders] - Show "Coming Soon" placeholders for missing assets
 * @returns {{ primaryRows: string[], podcastRows: string[], resourceStrip: string, podcastSummary: string }}
 */
function buildAssetRows(meeting, { includePlaceholders = false } = {}) {
    const primaryRows = [];

    if (meeting.video.file ?? '' && isSafePath(meeting.video.file ?? '', DOMAIN.ASSET)) {
        primaryRows.push(buildVideoRow(meeting));
    } else if (includePlaceholders) {
        primaryRows.push(_buildPlaceholder('🎬', 'Video Recording'));
    }

    if (meeting.slides.file ?? '' && isSafePath(meeting.slides.file ?? '', DOMAIN.ASSET)) {
        primaryRows.push(buildSlidesRow(meeting));
    } else if (includePlaceholders) {
        primaryRows.push(_buildPlaceholder('📊', 'Slides'));
    }

    const podcasts = meeting.podcasts;
    const podcastRows = podcasts
        .filter(pod => isSafePath(pod.file, DOMAIN.ASSET))
        .map(pod => buildPodcastRow(pod, meeting));

    const resourceStrip = buildResourceStrip(meeting.resources);
    const podcastSummary = buildPodcastSummary(podcasts);

    return { primaryRows, podcastRows, resourceStrip, podcastSummary };
}

window.buildAssetRows = buildAssetRows;
window.buildPodcastDisclosure = buildPodcastDisclosure;
})();
