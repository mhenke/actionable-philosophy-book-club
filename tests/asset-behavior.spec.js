import fs from 'node:fs';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { window.__TEST__ = true; });
});

test.describe('Asset behaviour — what users actually do', () => {

    test('slides link opens Office Online viewer in new tab', async ({ page, context }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.__manifestLoaded === true);

        const slidesLink = page.locator('#upcoming-materials-container .asset-link[href*="officeapps"]');
        await slidesLink.waitFor({ state: 'visible' });
        const popupPromise = context.waitForEvent('page');
        await slidesLink.click();
        const popup = await popupPromise;

        expect(popup.url()).toContain('view.officeapps.live.com');
    });

    test('video link opens inline player, not navigation', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.__manifestLoaded === true);

        await page.evaluate(() => {
            const link = document.querySelector('#upcoming-materials-container .asset-link[href$=".mp4"]');
            if (link) link.click();
        });
        await expect(page.locator('#video-player-overlay')).toHaveAttribute('open', '');
        await expect(page.locator('#dashboard-view')).toBeVisible();
    });

    test('canonical video has data-canonical and accessible name', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.__manifestLoaded === true);

        // The upcoming canonical video should have data-canonical="true" and its link should use the video label in the accessible name
        const canonical = page.locator('#upcoming-materials-container .asset-row[data-testid$="-canonical"]');
        await expect(canonical).toHaveAttribute('data-canonical', 'true');
        const link = canonical.locator('.asset-link');
        const name = await link.getAttribute('aria-label');
        expect(name).toBeTruthy();
        expect(name).not.toContain('Canonical');
    });

    test('Meeting Notes CTA navigates to reader', async ({ page }) => {
        await page.route('**/meetings/meeting-03/README.md', route =>
            route.fulfill({ body: '# Meeting 03\n\nThe Empirical Reality Check.' })
        );
        await page.goto('/');
        await page.waitForFunction(() => window.__manifestLoaded === true);

        await page.click('#upcoming-cta a');

        await expect(page.locator('#reader-view')).toBeVisible();
        await expect(page.locator('#markdown-content h1')).toContainText('Meeting 03');
    });

    test('upcoming card renders meeting title from manifest', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.__manifestLoaded === true);

        const heading = page.locator('#next-meeting-heading');
        await expect(heading).toBeVisible();
        await expect(heading).not.toBeEmpty();
    });

    test('asset copy falls back to defaults at render time for missing registry types', async ({ page }) => {
        const manifestPath = new URL('../docs/manifest.json', import.meta.url);
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        manifest.assetCopy.alternate = {
            label: 'Route Alternate Label',
            title: 'Route Alternate Title'
        };
        delete manifest.assetCopy['deep-dive'];

        await page.addInitScript({ content: `window.__MANIFEST_DATA = ${JSON.stringify(manifest)};` });

        await page.goto('/');
        await page.waitForFunction(() => window.__manifestLoaded === true);

        await page.locator('#upcoming-podcasts details').evaluate(el => { el.open = true; });

        await expect(page.locator('#upcoming-podcasts')).toContainText('Route Alternate Label');
        await expect(page.locator('#upcoming-podcasts')).toContainText('Route Alternate Title');
        await expect(page.locator('#upcoming-podcasts')).toContainText('Deep Dive');
        await expect(page.locator('#upcoming-podcasts')).toContainText('An exploration of the session topic');

        const loadedRegistry = await page.evaluate(() => window.getAssetCopyRegistry());
        expect(loadedRegistry.alternate.label).toBe('Route Alternate Label');
        expect(loadedRegistry['deep-dive']).toBeUndefined();
    });

    test('archive cards render with Meeting Notes links', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.__manifestLoaded === true);

        const archiveLinks = page.locator('#archive-cards-container .btn-ghost');
        await expect(archiveLinks.first()).toBeVisible();
        await expect(archiveLinks.first()).toHaveAttribute('href', /^#p=meetings/);
    });

});
