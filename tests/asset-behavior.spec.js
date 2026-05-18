import fs from 'node:fs';
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

    test('asset copy comes from fetched manifest registry', async ({ page }) => {
        const manifestPath = new URL('../docs/manifest.json', import.meta.url);

        await page.route('**/docs/manifest.json', async route => {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            manifest.assetCopy.alternate = {
                label: 'Route Alternate Label',
                title: 'Route Alternate Title'
            };
            manifest.assetCopy['deep-dive'] = {
                label: 'Route Deep Dive Label',
                title: 'Route Deep Dive Title'
            };
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(manifest)
            });
        });

        await page.goto('/');
        await page.waitForFunction(() => window.__manifestLoaded === true);

        await page.locator('#upcoming-podcasts details').evaluate(el => { el.open = true; });

        await expect(page.locator('#upcoming-podcasts')).toContainText('Route Alternate Label');
        await expect(page.locator('#upcoming-podcasts')).toContainText('Route Alternate Title');
        await expect(page.locator('#upcoming-podcasts')).toContainText('Route Deep Dive Label');
        await expect(page.locator('#upcoming-podcasts')).toContainText('Route Deep Dive Title');

        const loadedCopy = await page.evaluate(() => window.ASSET_COPY);
        expect(loadedCopy.alternate.label).toBe('Route Alternate Label');
        expect(loadedCopy['deep-dive'].title).toBe('Route Deep Dive Title');
    });

    test('invalid asset copy registry surfaces a manifest error', async ({ page }) => {
        const manifestPath = new URL('../docs/manifest.json', import.meta.url);

        await page.route('**/docs/manifest.json', async route => {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            manifest.assetCopy = {
                alternate: {
                    label: 'Route Alternate Label',
                    title: 'Route Alternate Title'
                }
            };
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(manifest)
            });
        });

        await page.goto('/');

        await expect(page.locator('#upcoming-card-header')).toContainText("Couldn't load sessions");
        await expect(page.locator('#upcoming-card-header')).toContainText('asset copy registry');
        await expect(page.locator('#upcoming-materials-container')).toBeEmpty();
    });

    test('archive cards render with Meeting Notes links', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.__manifestLoaded === true);

        const archiveLinks = page.locator('#archive-cards-container .btn-ghost');
        await expect(archiveLinks.first()).toBeVisible();
        await expect(archiveLinks.first()).toHaveAttribute('href', /^#p=meetings/);
    });

});
