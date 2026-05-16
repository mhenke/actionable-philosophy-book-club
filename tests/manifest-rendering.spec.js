import { test, expect } from '@playwright/test';

test.describe('Manifest Rendering', () => {

    test('archive card for meeting-01 renders a podcast row', async ({ page }) => {
        await page.goto('/');
        const badge = page.locator('.podcast-badge').first();
        await expect(badge).toBeVisible();
        await expect(badge).toContainText('Deep Dive');
    });

    test('podcast row has correct icon and label', async ({ page }) => {
        await page.goto('/');
        const podcastLink = page.locator('.asset-link:has(.podcast-badge)').first();
        await expect(podcastLink).toBeVisible();
        await expect(podcastLink).toContainText('Clean Code Paradox');
    });

    test('archive card for meeting-01 renders resource thumbnails', async ({ page }) => {
        await page.goto('/');
        const archiveThumbs = page.locator('#archive-cards-container .resource-thumb');
        await expect(archiveThumbs).toHaveCount(2);
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

    test('upcoming card shows coming soon placeholders and resource thumbnails', async ({ page }) => {
        await page.goto('/');
        const upcomingPlaceholders = page.locator('#upcoming-materials-container').getByText('Coming Soon');
        await expect(upcomingPlaceholders).toHaveCount(2);
        const placeholderText = await upcomingPlaceholders.allTextContents();
        expect(placeholderText.every(t => /coming soon/i.test(t))).toBe(true);

        const upcomingThumbLabels = page.locator('#upcoming-materials-container .resource-thumb span');
        await expect(upcomingThumbLabels).toHaveCount(2);
        const texts = await upcomingThumbLabels.allTextContents();
        expect(texts.some(t => /Four Strategies/i.test(t))).toBe(true);
        expect(texts.some(t => /Choose Your Next Meeting/i.test(t))).toBe(true);
    });

    test('archive cards and upcoming container both present on dashboard', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#archive-cards-container')).toBeVisible();
        await expect(page.locator('#upcoming-materials-container')).toBeVisible();
    });

});
