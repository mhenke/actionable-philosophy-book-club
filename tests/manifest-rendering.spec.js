import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.addInitScript(() => { window.__TEST__ = true; }); });

test.describe('Manifest Rendering', () => {

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

        const meeting01 = await page.locator('text=/Meeting 01/');
        await expect(meeting01).toBeVisible();

        const meeting01Data = await page.evaluate(() => {
            const meeting = window.MEETINGS.find(m => m.id === 'meeting-01');
            return {
                id: meeting.id,
                videoDuration: meeting.video?.duration,
                videoFileSize: meeting.video?.fileSize,
                podcastsCount: meeting.podcasts?.length || 0,
                firstPodcastDuration: meeting.podcasts?.[0]?.duration,
                firstPodcastFileSize: meeting.podcasts?.[0]?.fileSize
            };
        });

        expect(meeting01Data.id).toBe('meeting-01');
        expect(meeting01Data.videoDuration).toEqual(expect.any(Number));
        expect(meeting01Data.videoFileSize).toEqual(expect.any(Number));
        expect(meeting01Data.podcastsCount).toBeGreaterThan(0);
        expect(meeting01Data.firstPodcastDuration).toEqual(expect.any(Number));
        expect(meeting01Data.firstPodcastFileSize).toEqual(expect.any(Number));
    });

    test('manifest loads all expected meeting IDs', async ({ page }) => {
        await page.goto('/');
        const manifestMeta = await page.evaluate(() => {
            const meeting = window.MEETINGS.find(m => m.id === 'meeting-01');
            return {
                ids: window.MEETINGS.map(m => m.id).sort(),
                meetingId: meeting?.id,
            };
        });
        expect(manifestMeta.meetingId).toBe('meeting-01');
        expect(manifestMeta.ids).toContain('meeting-00');
        expect(manifestMeta.ids).toContain('meeting-01');
        expect(manifestMeta.ids).toContain('meeting-02');
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
