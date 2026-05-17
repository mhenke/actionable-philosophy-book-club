import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.addInitScript(() => { window.__TEST__ = true; }); });

test.describe('Manifest Rendering', () => {

    test('dashboard renders upcoming and archive containers', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#upcoming-materials-container')).toBeVisible();
        await expect(page.locator('#archive-cards-container')).toBeVisible();
        await expect(page.locator('#horizon-cards-container')).toBeAttached();
    });

    test('draft meetings render in horizon, not archive', async ({ page }) => {
        await page.goto('/');
        const expectedDone = await page.evaluate(() => window.MEETINGS.filter(m => m.status === 'done').length);
        await expect(page.locator('#archive-cards-container .card')).toHaveCount(expectedDone);
        await expect(page.locator('#archive-cards-container')).not.toContainText('meeting-03');
        await expect(page.locator('#archive-cards-container')).not.toContainText('meeting-04');
    });

    test('manifest data contains duration and fileSize fields', async ({ page }) => {
        await page.goto('/');

        const upcoming = await page.locator('#upcoming-materials-container');
        await expect(upcoming).toBeVisible();

        const meeting00 = await page.locator('text=/Meeting 00/');
        await expect(meeting00).toBeVisible();

        const meeting00Data = await page.evaluate(() => {
            const meeting = window.MEETINGS.find(m => m.id === 'meeting-00');
            return {
                id: meeting.id,
                videoDuration: meeting.video?.duration,
                videoFileSize: meeting.video?.fileSize,
                podcastsCount: meeting.podcasts?.length || 0,
                firstPodcastDuration: meeting.podcasts?.[0]?.duration,
                firstPodcastFileSize: meeting.podcasts?.[0]?.fileSize
            };
        });

        expect(meeting00Data.id).toBe('meeting-00');
        expect(meeting00Data.videoDuration).toBe(52);
        expect(meeting00Data.videoFileSize).toBe(840);
        expect(meeting00Data.podcastsCount).toBeGreaterThan(0);
        expect(meeting00Data.firstPodcastDuration).toBe(45);
        expect(meeting00Data.firstPodcastFileSize).toBe(120);
    });

    test('onboarding banner is visible on dashboard', async ({ page }) => {
        await page.goto('/');
        const banner = page.locator('#onboarding-banner');
        await expect(banner).toBeVisible();
        await expect(banner).toContainText(/New/i);
    });

    test('falls back to inline MEETINGS when manifest fetch fails', async ({ page }) => {
        // Block manifest.json so fetch falls back to inline data
        await page.route('**/docs/manifest.json', route => route.abort('failed'));
        await page.goto('/');
        // Wait for dashboard to render (fallback path should use inline MEETINGS)
        await expect(page.locator('#archive-cards-container')).toBeVisible();
        // Verify meetings rendered from inline fallback data
        await expect(page.locator('#archive-cards-container .card')).not.toHaveCount(0);
    });

    test('inline MEETINGS_INLINE matches manifest.json meeting IDs', async ({ page }) => {
        await page.goto('/');
        const inlineIds = await page.evaluate(() => {
            const inline = window.MEETINGS_INLINE || [];
            return inline.map(m => m.id).sort();
        });
        const manifestIds = await page.evaluate(() => {
            return (window.MEETINGS || []).map(m => m.id).sort();
        });
        expect(inlineIds).toEqual(manifestIds);
    });

    test('inline MEETINGS_INLINE has same fields as manifest.json', async ({ page }) => {
        await page.goto('/');
        const fields = await page.evaluate(() => {
            const inline = window.MEETINGS_INLINE || [];
            const manifest = window.MEETINGS || [];
            const keys = new Set();
            inline.forEach(m => Object.keys(m).forEach(k => keys.add(k)));
            manifest.forEach(m => Object.keys(m).forEach(k => keys.add(k)));
            const results = [];
            for (const key of keys) {
                for (let i = 0; i < Math.max(inline.length, manifest.length); i++) {
                    const iVal = i < inline.length ? inline[i][key] : undefined;
                    const mVal = i < manifest.length ? manifest[i][key] : undefined;
                    if (key === 'video' || key === 'slides') {
                        const iKeys = iVal ? Object.keys(iVal).sort() : [];
                        const mKeys = mVal ? Object.keys(mVal).sort() : [];
                        if (JSON.stringify(iKeys) !== JSON.stringify(mKeys)) {
                            results.push({ meeting: inline[i]?.id || manifest[i]?.id, field: key, inline: iKeys, manifest: mKeys });
                        }
                    } else if (key === 'podcasts' || key === 'resources') {
                        const iLen = Array.isArray(iVal) ? iVal.length : 0;
                        const mLen = Array.isArray(mVal) ? mVal.length : 0;
                        if (iLen !== mLen) {
                            results.push({ meeting: inline[i]?.id || manifest[i]?.id, field: key, inline: `${iLen} items`, manifest: `${mLen} items` });
                        }
                        for (let j = 0; j < Math.max(iLen, mLen); j++) {
                            const iKeys = j < iLen && iVal[j] ? Object.keys(iVal[j]).sort() : [];
                            const mKeys = j < mLen && mVal[j] ? Object.keys(mVal[j]).sort() : [];
                            if (JSON.stringify(iKeys) !== JSON.stringify(mKeys)) {
                                results.push({ meeting: inline[i]?.id || manifest[i]?.id, field: `${key}[${j}]`, inline: iKeys, manifest: mKeys });
                            }
                        }
                    } else {
                        if (iVal !== mVal) {
                            results.push({ meeting: inline[i]?.id || manifest[i]?.id, field: key, inline: iVal, manifest: mVal });
                        }
                    }
                }
            }
            return results;
        });
        expect(fields).toEqual([]);
    });

    test('Knowledge Base cards have accessible descriptions', async ({ page }) => {
        await page.goto('/');
        const cards = page.locator('[aria-labelledby="section-kb"] .card');
        const count = await cards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            const describedBy = await cards.nth(i).getAttribute('aria-describedby');
            expect(describedBy).toBeTruthy();
            const descEl = page.locator('#' + describedBy);
            await expect(descEl).toBeAttached();
        }
    });

});
