import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.addInitScript(() => { window.__TEST__ = true; }); });

test.describe('Formatting Layer', () => {

    test('formatDuration converts minutes to display string', async ({ page }) => {
        await page.goto('/');
        const result = await page.evaluate(() => window.formatDuration(52));
        expect(result).toBe('52m');
    });

    test('formatDuration returns empty string for falsy input', async ({ page }) => {
        await page.goto('/');
        const result = await page.evaluate(() => window.formatDuration(null));
        expect(result).toBe('');
    });

    test('formatFileSize converts MB number to formatted string', async ({ page }) => {
        await page.goto('/');
        const result = await page.evaluate(() => window.formatFileSize(840));
        expect(result).toBe('840 MB');
    });

    test('formatFileSize returns empty string for falsy input', async ({ page }) => {
        await page.goto('/');
        const result = await page.evaluate(() => window.formatFileSize(null));
        expect(result).toBe('');
    });

    test('formatDuration returns empty string for 0 minutes', async ({ page }) => {
        await page.goto('/');
        const result = await page.evaluate(() => window.formatDuration(0));
        expect(result).toBe('');
    });

    test('formatDuration formats hours for 120+ minutes', async ({ page }) => {
        await page.goto('/');
        const result = await page.evaluate(() => window.formatDuration(150));
        expect(result).toBe('2h 30m');
    });

    test('formatDuration handles exact hours', async ({ page }) => {
        await page.goto('/');
        const result = await page.evaluate(() => window.formatDuration(120));
        expect(result).toBe('2h 0m');
    });

});
