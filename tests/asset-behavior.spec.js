import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { window.__TEST__ = true; });
});

test.describe('Asset behaviour — what users actually do', () => {

    test('slides link opens Office Online viewer in new tab', async ({ page, context }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.__manifestLoaded === true);

        const popupPromise = context.waitForEvent('page');
        await page.click('#upcoming-materials-container .asset-link[href*="officeapps"]');
        const popup = await popupPromise;

        expect(popup.url()).toContain('view.officeapps.live.com');
    });

    test('video link opens inline player, not navigation', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.__manifestLoaded === true);

        await page.click('#upcoming-materials-container .asset-link[href$=".mp4"]');

        await expect(page.locator('#video-player-overlay')).toHaveAttribute('open', '');
        await expect(page.locator('#dashboard-view')).toBeVisible();
    });

    test('Meeting Notes CTA navigates to reader', async ({ page }) => {
        await page.route('**/meetings/meeting-02/README.md', route =>
            route.fulfill({ body: '# Meeting 02\n\nContent.' })
        );
        await page.goto('/');
        await page.waitForFunction(() => window.__manifestLoaded === true);

        await page.click('#upcoming-cta a');

        await expect(page.locator('#reader-view')).toBeVisible();
        await expect(page.locator('#markdown-content h1')).toContainText('Meeting 02');
    });

    test('upcoming card renders meeting title from manifest', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.__manifestLoaded === true);

        const heading = page.locator('#next-meeting-heading');
        await expect(heading).toBeVisible();
        await expect(heading).not.toBeEmpty();
    });

    test('archive cards render with Meeting Notes links', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.__manifestLoaded === true);

        const archiveLinks = page.locator('#archive-cards-container .btn-ghost');
        await expect(archiveLinks.first()).toBeVisible();
        await expect(archiveLinks.first()).toHaveAttribute('href', /^#p=meetings/);
    });

});
