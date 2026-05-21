import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        window.__TEST__ = true;
    });
});

test.describe('Manual Theme Toggle', () => {
    test('should render theme toggles in headers', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#theme-toggle-dashboard')).toBeVisible();
        // Reader view is hidden initially, so reader toggle is hidden
        await expect(page.locator('#theme-toggle-reader')).toBeHidden();

        // Navigate to a reader page to make it visible
        await page.goto('/#p=docs/onboarding.md');
        await expect(page.locator('#theme-toggle-reader')).toBeVisible();
        await expect(page.locator('#theme-toggle-dashboard')).toBeHidden();
    });

    test('should toggle theme classes on click and sync buttons', async ({ page }) => {
        await page.goto('/');

        // Start with whatever system preference is, check toggling
        const initialIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark-theme'));
        const toggleBtn = page.locator('#theme-toggle-dashboard');

        // Click to toggle
        await toggleBtn.click();

        const afterClickIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark-theme'));
        expect(afterClickIsDark).toBe(!initialIsDark);

        // Check aria-label updates on both buttons
        const expectedLabel = afterClickIsDark ? 'Switch to light theme' : 'Switch to dark theme';
        await expect(page.locator('#theme-toggle-dashboard')).toHaveAttribute('aria-label', expectedLabel);
        await expect(page.locator('#theme-toggle-reader')).toHaveAttribute('aria-label', expectedLabel);

        // Click again to toggle back
        await toggleBtn.click();
        const finalIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark-theme'));
        expect(finalIsDark).toBe(initialIsDark);
    });

    test('should persist theme selection in localStorage', async ({ page }) => {
        await page.goto('/');
        
        // Clear local storage first
        await page.evaluate(() => localStorage.clear());

        const toggleBtn = page.locator('#theme-toggle-dashboard');
        
        // Toggle theme and check storage
        await toggleBtn.click();
        let storedTheme = await page.evaluate(() => localStorage.getItem('apbc:theme'));
        expect(storedTheme).not.toBeNull();

        // Toggle again and check storage
        await toggleBtn.click();
        storedTheme = await page.evaluate(() => localStorage.getItem('apbc:theme'));
        expect(storedTheme).not.toBeNull();
    });

    test('should apply persisted theme synchronously on load to prevent FOUC', async ({ page }) => {
        // Set storage manually in a clean state
        await page.goto('/');
        await page.evaluate(() => localStorage.setItem('apbc:theme', 'dark'));

        // Navigate again and check class is present immediately
        await page.goto('/');
        const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark-theme'));
        expect(isDark).toBe(true);

        // Set to light and test again
        await page.evaluate(() => localStorage.setItem('apbc:theme', 'light'));
        await page.goto('/');
        const isLight = await page.evaluate(() => document.documentElement.classList.contains('light-theme'));
        expect(isLight).toBe(true);
    });

    test('should display toast feedback on user-initiated theme switch', async ({ page }) => {
        await page.goto('/');
        const toggleBtn = page.locator('#theme-toggle-dashboard');

        await toggleBtn.click();
        const toast = page.locator('.toast');
        await expect(toast).toBeVisible();
        
        const toastText = await toast.textContent();
        expect(toastText).toMatch(/theme enabled/i);
    });
});
