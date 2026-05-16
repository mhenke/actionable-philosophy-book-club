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

    test('archive card includes strategic software design recap', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('Strategic Software Design and Deep Modules')).toBeVisible();
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

    test('upcoming card shows meeting 02 video and slide links', async ({ page }) => {
        await page.goto('/');
        const upcoming = page.locator('#upcoming-materials-container');
        await expect(upcoming.getByRole('link', { name: 'Video Recap', exact: true })).toBeVisible();
        await expect(upcoming.getByRole('link', { name: 'Slide Deck', exact: true })).toBeVisible();
        await expect(page.getByText(/coming soon/i)).toHaveCount(0);
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

});
