        // Shared rendering constants
        const PODCAST_CONFIG = {
            'alternate': { icon: '🎬', color: 'var(--spectrum-2)' },
            'deep-dive': { icon: '🔬', color: 'var(--spectrum-2)' },
            'critique':  { icon: '🔍', color: 'var(--spectrum-2)' },
            'debate':    { icon: '⚔️', color: 'var(--spectrum-2)' },
        };

        const DL_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>`;

        function buildVideoRow(meeting) {
            const videoDuration = meeting.video.duration ? formatDuration(meeting.video.duration) : '';
            const videoSize = meeting.video.fileSize ? formatFileSize(meeting.video.fileSize) : '';
            const videoMeta = [videoDuration, videoSize].filter(Boolean).join(' · ');
            const metaLine = videoMeta ? `<span class="asset-meta">${videoMeta}</span>` : '';
            const videoSlug = meeting.video.file.split('/').pop().replace(/\.\w+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
            const videoAssetId = `asset-${escapeHTML(meeting.id)}-video-${videoSlug}`;
            return `
                    <div class="asset-row" data-testid="${escapeHTML(meeting.id)}-canonical" data-canonical="true" id="${videoAssetId}">
                        <a href="${escapeHTML(meeting.video.file)}" class="asset-link asset-link--stacked" aria-label="${escapeHTML(meeting.video.label)}${videoDuration ? ', ' + videoDuration : ''} (${escapeHTML(meeting.session)})">
                            <span class="asset-link-top">
                                <span class="icon-pill" style="background: var(--wash-3-border);" aria-hidden="true">🎬</span>
                                ${escapeHTML(meeting.video.label)}
                            </span>
                            ${metaLine}
                        </a>
                        <a href="${escapeHTML(meeting.video.file)}" download
                           aria-label="Download ${escapeHTML(meeting.video.label)}${videoDuration ? ', ' + videoDuration : ''} (${escapeHTML(meeting.session)})"
                           class="asset-dl">${DL_ICON}</a>
                    </div>`;
        }

        function buildVideoPlaceholder() {
            return `
                    <div class="asset-row opacity-50">
                        <span class="asset-link cursor-default">
                            <span class="icon-pill" style="background: var(--wash-3-border);" aria-hidden="true">🎬</span>
                            Video Recording <span class="text-[11px] uppercase tracking-wider ml-auto">Coming Soon</span>
                        </span>
                    </div>`;
        }

        function buildSlidesRow(meeting) {
            const slidesSize = meeting.slides.fileSize ? formatFileSize(meeting.slides.fileSize) : '';
            const metaLine = slidesSize ? `<span class="asset-meta">${slidesSize}</span>` : '';
            return `
                    <div class="asset-row">
                        <a href="${buildPPTXViewerURL(meeting.slides.file)}" target="_blank" rel="noopener noreferrer" class="asset-link asset-link--stacked">
                            <span class="asset-link-top">
                                <span class="icon-pill" style="background: var(--wash-2-border);" aria-hidden="true">📊</span>
                                ${escapeHTML(meeting.slides.label)}
                            </span>
                            ${metaLine}
                        </a>
                        <a href="${escapeHTML(meeting.slides.file)}" download
                           aria-label="Download slides (${escapeHTML(meeting.session)})"
                           class="asset-dl">${DL_ICON}</a>
                    </div>`;
        }

        function buildSlidesPlaceholder() {
            return `
                    <div class="asset-row opacity-50">
                        <span class="asset-link cursor-default">
                            <span class="icon-pill" style="background: var(--wash-2-border);" aria-hidden="true">📊</span>
                            Slides <span class="text-[11px] uppercase tracking-wider ml-auto">Coming Soon</span>
                        </span>
                    </div>`;
        }

        function buildPodcastRow(pod, meeting) {
            const cfg = PODCAST_CONFIG[pod.type] || { icon: '🎙', color: 'var(--spectrum-2)' };
            const copy = getAssetCopy(pod.type);
            const badgeLabel = copy.label || pod.type;
            const caption = copy.title || '';
            const podDuration = pod.duration ? formatDuration(pod.duration) : '';
            const podSize = pod.fileSize ? formatFileSize(pod.fileSize) : '';
            const podMeta = [podDuration, podSize].filter(Boolean).join(' · ');
            const metaLine = podMeta ? `<span class="asset-meta">${podMeta}</span>` : '';
            const podSlug = pod.file.split('/').pop().replace(/\.\w+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
            const podAssetId = `asset-${escapeHTML(meeting.id)}-podcast-${podSlug}`;
            const fileExt = pod.file.split('.').pop() || 'file';
            const downloadLabel = `Download ${escapeHTML(pod.label)}${podDuration ? ', ' + podDuration : ''} (${fileExt.toUpperCase()} audio)`;
            return `
                    <div class="asset-row" id="${podAssetId}">
                        <a href="${escapeHTML(pod.file)}" class="asset-link asset-link--stacked">
                            <span class="asset-link-top">
                                <span class="icon-pill" style="background: var(--wash-3-border);" aria-hidden="true">${cfg.icon}</span>
                                ${escapeHTML(pod.label)}
                                <span class="podcast-badge" style="color:${cfg.color}">${escapeHTML(badgeLabel)}</span>
                            </span>
                            ${metaLine}
                            <span class="podcast-caption">${escapeHTML(caption)}</span>
                        </a>
                        <a href="${escapeHTML(pod.file)}" download
                           aria-label="${downloadLabel}"
                           class="asset-dl">${DL_ICON}</a>
                    </div>`;
        }

        function buildResourceStrip(resources) {
            const safe = (resources || []).filter(r => isSafeAssetPath(r.file));
            if (safe.length === 0) return '';
            return `<div class="resource-strip">${safe.map(res => {
                const file = escapeHTML(res.file);
                const label = escapeHTML(res.label);
                const isWebp = /\.webp$/i.test(res.file);
                const img = isWebp
                    ? `<picture><source srcset="${file}" type="image/webp"><img src="${file}" alt="" loading="lazy" width="120" height="80"></picture>`
                    : `<img src="${file}" alt="" loading="lazy" width="120" height="80">`;
                return `
                        <a href="${file}" target="_blank" rel="noopener noreferrer" class="resource-thumb">
                            ${img}
                            <span>${label}</span>
                        </a>`;
            }).join('')}</div>`;
        }

        function buildPodcastDisclosure(rows, summary) {
            if (rows.length === 0) return '';
            return `<details class="podcast-disclosure"><summary><span class="asset-link"><span class="icon-pill" style="background:var(--wash-3-border);" aria-hidden="true">📦</span>${escapeHTML(summary)}</span><svg class="podcast-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="16" height="16" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg></summary>${rows.join('')}</details>`;
        }

        function buildPodcastSummary(podcasts) {
            const safe = (podcasts || []).filter(p => isSafeAssetPath(p.file));
            const videoCount = safe.filter(p => p.type === 'alternate').length;
            const podcastCount = safe.length - videoCount;
            const parts = [];
            if (videoCount > 0) parts.push(`${videoCount} Video${videoCount > 1 ? 's' : ''}`);
            if (podcastCount > 0) parts.push(`${podcastCount} Podcast${podcastCount > 1 ? 's' : ''}`);
            const summary = parts.join(' · ');
            return summary ? `Additional Resources: ${summary}` : '';
        }

        function buildAssetRows(meeting, { includePlaceholders = false } = {}) {
            const primaryRows = [];

            if (meeting.video && isSafeAssetPath(meeting.video.file)) {
                primaryRows.push(buildVideoRow(meeting));
                /* alternate recordings render in the podcast disclosure below, not in primaryRows */
            } else if (includePlaceholders) {
                primaryRows.push(buildVideoPlaceholder());
            }

            if (meeting.slides && isSafeAssetPath(meeting.slides.file)) {
                primaryRows.push(buildSlidesRow(meeting));
            } else if (includePlaceholders) {
                primaryRows.push(buildSlidesPlaceholder());
            }

            const podcastRows = (meeting.podcasts || [])
                .filter(pod => isSafeAssetPath(pod.file))
                .map(pod => buildPodcastRow(pod, meeting));

            const resourceStrip = buildResourceStrip(meeting.resources);
            const podcastSummary = buildPodcastSummary(meeting.podcasts);

            return { primaryRows, podcastRows, resourceStrip, podcastSummary };
        }
