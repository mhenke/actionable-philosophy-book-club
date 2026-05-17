import { test, expect } from '@playwright/test';

test.describe('Manifest Rendering', () => {

    test('archive card for meeting-01 renders a podcast row', async ({ page }) => {
        await page.goto('/');
        const badge = page.locator('.podcast-badge').filter({ hasText: 'Deep Dive' }).first();
        await expect(badge).toBeVisible();
    });

    test('podcast row has correct icon and label', async ({ page }) => {
        await page.goto('/');
        const podcastLink = page.locator('.asset-link').filter({ hasText: 'Why Clean Code Rots Your Codebase' });
        await expect(podcastLink).toBeVisible();
    });

    test('archive card includes strategic software design recap', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('Strategic Software Design and Deep Modules')).toBeVisible();
    });

    test('archive card for meeting-01 renders resource thumbnails', async ({ page }) => {
        await page.goto('/');
        const expected = await page.evaluate(() =>
            window.MEETINGS
                .filter(m => m.status === 'done')
                .reduce((count, meeting) => count + (meeting.resources?.length || 0), 0)
        );
        const archiveThumbs = page.locator('#archive-cards-container .resource-thumb');
        await expect(archiveThumbs).toHaveCount(expected);
    });

    test('resource thumbnails have correct labels', async ({ page }) => {
        await page.goto('/');
        const thumbLabels = page.locator('#archive-cards-container .resource-thumb span');
        const texts = await thumbLabels.allTextContents();
        expect(texts.some(t => /architecture of simplicity/i.test(t))).toBe(true);
        expect(texts.some(t => /choose your adventure/i.test(t))).toBe(true);
    });

    test('upcoming card has materials container', async ({ page }) => {
        await page.goto('/');
        const container = page.locator('#upcoming-materials-container');
        await expect(container).toBeVisible();
    });

    test('upcoming card shows meeting 02 video and slide links', async ({ page }) => {
        await page.goto('/');
        const upcoming = page.locator('#upcoming-materials-container');
        await upcoming.waitFor({ state: 'visible' });
        await expect(upcoming.locator('[data-testid="meeting-02-canonical"] .asset-link')).toBeVisible();
        await expect(upcoming.locator('[data-testid="meeting-02-canonical"] .asset-link')).toContainText('Video');
        await expect(upcoming.locator('.asset-link').filter({ hasText: 'Slides' })).toBeVisible();
        await expect(upcoming.getByText(/coming soon/i)).toHaveCount(0);
    });

    test('archive cards and upcoming container both present on dashboard', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#archive-cards-container')).toBeVisible();
        await expect(page.locator('#upcoming-materials-container')).toBeVisible();
    });

    test('dashboard source has no raw rgba utility classes', async ({ page }) => {
        await page.goto('/');
        const rawClassUses = await page.locator('body').evaluate((body) => {
            const html = body.innerHTML;
            return (html.match(/bg-\[rgba/g) || []).length + (html.match(/border-\[rgba/g) || []).length;
        });
        expect(rawClassUses).toBe(0);
    });

    test('meeting-03 and meeting-04 do not render archive cards', async ({ page }) => {
        await page.goto('/');
        const expectedDone = await page.evaluate(() => window.MEETINGS.filter(m => m.status === 'done').length);
        await expect(page.locator('#archive-cards-container .card')).toHaveCount(expectedDone);
        await expect(page.locator('#archive-cards-container')).not.toContainText('meeting-03');
        await expect(page.locator('#archive-cards-container')).not.toContainText('meeting-04');
    });

    test.skip('spectrum-rule spans content width', async ({ page }) => {
        await page.goto('/');
        await page.setViewportSize({ width: 1024, height: 768 });
        const ruleWidth = await page.locator('.spectrum-rule').first().evaluate(el => el.getBoundingClientRect().width);
        expect(ruleWidth).toBeGreaterThan(200);
    });

});
