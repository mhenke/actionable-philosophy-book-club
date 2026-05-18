import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.addInitScript(() => { window.__TEST__ = true; }); });

test.describe('Formatting Layer', () => {

    test('formatDuration converts seconds to display string', async ({ page }) => {
        await page.goto('/');
        const result = await page.evaluate(() => window.formatDuration(189));
        expect(result).toBe('3m 9s');
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

    test('formatDuration returns minutes and seconds for 0 input', async ({ page }) => {
        await page.goto('/');
        const result = await page.evaluate(() => window.formatDuration(0));
        expect(result).toBe('0m 0s');
    });

    test('formatDuration formats minutes and seconds', async ({ page }) => {
        await page.goto('/');
        const result = await page.evaluate(() => window.formatDuration(150));
        expect(result).toBe('2m 30s');
    });

    test('formatDuration handles exact minutes', async ({ page }) => {
        await page.goto('/');
        const result = await page.evaluate(() => window.formatDuration(120));
        expect(result).toBe('2m 0s');
    });

});
