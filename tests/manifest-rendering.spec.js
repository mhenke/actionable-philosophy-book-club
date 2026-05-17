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

    test('manifest loads with duration and fileSize fields', async ({ page }) => {
        await page.goto('/');
        
        // Verify dashboard renders (manifest is valid)
        const upcoming = await page.locator('#upcoming-materials-container');
        await expect(upcoming).toBeVisible();
        
        // Verify meeting-00 is present
        const meeting00 = await page.locator('text=/Meeting 00/');
        await expect(meeting00).toBeVisible();
        
        // Verify meeting-00 has duration and fileSize in video object
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

});
