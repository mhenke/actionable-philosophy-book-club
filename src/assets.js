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

/** Extracts a URL-safe slug from a file path: filename → lowercased, sanitized, extension stripped. */
function _toAssetSlug(filePath) {
    return filePath.split('/').pop().replace(/\.\w+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
}

/** Returns an SVG download icon string used in asset row download buttons. */
function _downloadIcon() {
    return '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>';
}

/** Builds the primary video asset row with metadata (duration, size, label) and download link. */
function buildVideoRow(meeting) {
    const videoDuration = meeting.video.duration ?? 0 ? formatDuration(meeting.video.duration ?? 0) : '';
    const videoSize = meeting.video.fileSize ?? 0 ? formatFileSize(meeting.video.fileSize ?? 0) : '';
    const videoMeta = [videoDuration, videoSize].filter(Boolean).join(' · ');
    const metaLine = videoMeta ? `<span class="asset-meta">${videoMeta}</span>` : '';
    const videoSlug = _toAssetSlug(meeting.video.file ?? '');
    const id = escapeHTML(meeting.id);
    const videoAssetId = `asset-${id}-video-${videoSlug}`;
    const session = escapeHTML(meeting.session);
    return `
                    <div class="asset-row" data-testid="${id}-canonical" data-canonical="true" id="${videoAssetId}">
                        <a href="${escapeHTML(meeting.video.file ?? '')}" class="asset-link asset-link--stacked" aria-label="${escapeHTML(meeting.video.label ?? '')}${videoDuration ? ', ' + videoDuration : ''}${videoSize ? ', ' + videoSize : ''} (${session})">
                            <span class="asset-link-top">
                                <span class="icon-pill" style="background: var(--wash-3-border);" aria-hidden="true">🎬</span>
                                <span class="asset-link-text">${escapeHTML(meeting.video.label ?? '')}</span>
                            </span>
                            ${metaLine}
                        </a>
                        <a href="${escapeHTML(meeting.video.file ?? '')}" download
                           aria-label="Download ${escapeHTML(meeting.video.label ?? '')}${videoDuration ? ', ' + videoDuration : ''}${videoSize ? ', ' + videoSize : ''} (${session})"
                           class="asset-dl">${_downloadIcon()}</a>
                    </div>`;
}

/** Renders a disabled placeholder row for a missing asset type (video/slides). Shared by both placeholder functions. */
function _buildPlaceholder(emoji, label) {
    return `
                    <div class="asset-row opacity-50">
                        <span class="asset-link cursor-default">
                            <span class="icon-pill" style="background: var(--wash-3-border);" aria-hidden="true">${emoji}</span>
                            <span class="asset-link-text">${label}</span> <span class="text-[11px] uppercase tracking-wider ml-auto">Coming Soon</span>
                        </span>
                    </div>`;
}

/** Renders a disabled placeholder row when video is not yet available and placeholders are enabled. */
function buildVideoPlaceholder() {
    return _buildPlaceholder('🎬', 'Video Recording');
}

/** Builds the slides asset row with Office Online viewer link, file size, and download button. */
function buildSlidesRow(meeting) {
    const slidesSize = meeting.slides.fileSize ?? 0 ? formatFileSize(meeting.slides.fileSize ?? 0) : '';
    const metaLine = slidesSize ? `<span class="asset-meta">${slidesSize}</span>` : '';
    const viewerUrl = buildPPTXViewerURL(meeting.slides.file ?? '');
    const inner = `
                            <span class="asset-link-top">
                                <span class="icon-pill" style="background: var(--wash-2-border);" aria-hidden="true">📊</span>
                                <span class="asset-link-text">${escapeHTML(meeting.slides.label ?? '')}</span>
                            </span>
                            ${metaLine}`;
    const wrapper = viewerUrl
        ? `<a href="${viewerUrl}" target="_blank" rel="noopener noreferrer" class="asset-link asset-link--stacked">${inner}</a>`
        : `<span class="asset-link asset-link--stacked">${inner}</span>`;
    return `
                    <div class="asset-row">
                        ${wrapper}
                        <a href="${escapeHTML(meeting.slides.file ?? '')}" download
                           aria-label="Download slides (${escapeHTML(meeting.session)})"
                           class="asset-dl">${_downloadIcon()}</a>
                    </div>`;
}

/** Renders a disabled placeholder row when slides are not yet available and placeholders are enabled. */
function buildSlidesPlaceholder() {
    return _buildPlaceholder('📊', 'Slides');
}

/** Builds a podcast asset row with label, type badge, metadata, caption, and download button. */
function buildPodcastRow(pod, meeting) {
    const copy = getAssetCopy(pod.type);
    const cfg = { icon: copy.icon || '🎙', color: copy.color || 'var(--spectrum-2)' };
    const badgeLabel = copy.label || pod.type;
    const caption = copy.title || '';
    const podDuration = pod.duration ? formatDuration(pod.duration) : '';
    const podSize = pod.fileSize ? formatFileSize(pod.fileSize) : '';
    const podMeta = [podDuration, podSize].filter(Boolean).join(' · ');
    const metaLine = podMeta ? `<span class="asset-meta">${podMeta}</span>` : '';
    const podSlug = _toAssetSlug(pod.file);
    const podAssetId = `asset-${escapeHTML(meeting.id)}-podcast-${podSlug}`;
    const fileExt = pod.file.split('.').pop() || 'file';
    const downloadLabel = `Download ${escapeHTML(pod.label)}${podDuration ? ', ' + podDuration : ''} (${fileExt.toUpperCase()} audio)`;
    return `
                    <div class="asset-row" id="${podAssetId}">
                        <a href="${escapeHTML(pod.file)}" class="asset-link asset-link--stacked">
                            <span class="asset-link-top">
                                <span class="icon-pill" style="background: var(--wash-3-border);" aria-hidden="true">${cfg.icon}</span>
                                <span class="asset-link-text">${escapeHTML(pod.label)}</span>
                                <span class="podcast-badge" style="color:${cfg.color}">${escapeHTML(badgeLabel)}</span>
                            </span>
                            ${metaLine}
                            <span class="podcast-caption">${escapeHTML(caption)}</span>
                        </a>
                        <a href="${escapeHTML(pod.file)}" download
                           aria-label="${downloadLabel}"
                           class="asset-dl">${_downloadIcon()}</a>
                    </div>`;
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
        return `<a href="${file}" target="_blank" rel="noopener noreferrer" class="resource-thumb">
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
        primaryRows.push(buildVideoPlaceholder());
    }

    if (meeting.slides.file ?? '' && isSafePath(meeting.slides.file ?? '', DOMAIN.ASSET)) {
        primaryRows.push(buildSlidesRow(meeting));
    } else if (includePlaceholders) {
        primaryRows.push(buildSlidesPlaceholder());
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
