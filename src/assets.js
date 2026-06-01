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

/** Builds an additional material row with label, category badge, metadata, caption, and download button. */
function buildAdditionalRow(item, meeting) {
    const category = item.category || '';
    const copy = category ? getAssetCopy(category) : {};
    const fileType = classifyAssetPath(item.file);
    const isAudio = fileType === 'other' && /\.(m4a|mp3|wav|ogg)$/i.test(item.file);
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

/** Builds a horizontal strip of resource thumbnail links from image items in additional_material. */
function buildResourceStrip(additionalMaterial) {
    const images = (additionalMaterial || []).filter(item => classifyAssetPath(item.file) === 'image' && isSafePath(item.file, DOMAIN.ASSET));
    if (images.length === 0) return '';
    return `<div class="resource-strip">${images.map(res => {
        const file = escapeHTML(res.file);
        const label = escapeHTML(res.label);
        const img = `<picture><source srcset="${file}" type="image/webp"><img src="${file}" alt="${label}" loading="lazy" width="120" height="80"></picture>`;
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

/** Generates a summary string like "1 Video · 3 Podcasts" from additional_material for use in disclosure summary. */
function buildAdditionalSummary(additionalMaterial) {
    const safe = (additionalMaterial || []).filter(item => isSafePath(item.file, DOMAIN.ASSET));
    const videoCount = safe.filter(item => classifyAssetPath(item.file) === 'video').length;
    const audioCount = safe.filter(item => classifyAssetPath(item.file) !== 'image' && classifyAssetPath(item.file) !== 'video').length;
    const parts = [];
    if (videoCount > 0) parts.push(`${videoCount} Video${videoCount > 1 ? 's' : ''}`);
    if (audioCount > 0) parts.push(`${audioCount} Podcast${audioCount > 1 ? 's' : ''}`);
    const summary = parts.join(' \u00B7 ');
    return summary ? `Additional Resources: ${summary}` : '';
}

/**
 * Builds all asset rows for a meeting: primary (video + slides), additional material rows,
 * resource strip, and additional summary. The orchestrator for all asset builders.
 * @param {object} meeting - Meeting instance or POJO with video/slides/additional_material
 * @param {object} [opts]
 * @param {boolean} [opts.includePlaceholders] - Show "Coming Soon" placeholders for missing assets
 * @returns {{ primaryRows: string[], additionalRows: string[], resourceStrip: string, additionalSummary: string }}
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

    const additionalMaterial = meeting.additional_material || [];
    const additionalRows = additionalMaterial
        .filter(item => classifyAssetPath(item.file) !== 'image' && isSafePath(item.file, DOMAIN.ASSET))
        .map(item => buildAdditionalRow(item, meeting));

    const resourceStrip = buildResourceStrip(additionalMaterial);
    const additionalSummary = buildAdditionalSummary(additionalMaterial);

    return { primaryRows, additionalRows, resourceStrip, additionalSummary };
}

window.buildAssetRows = buildAssetRows;
window.buildPodcastDisclosure = buildPodcastDisclosure;
window.buildAdditionalRow = buildAdditionalRow;
window.buildAdditionalSummary = buildAdditionalSummary;
})();
