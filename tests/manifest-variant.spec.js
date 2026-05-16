import { test, expect } from '@playwright/test';

test('manifest entries include variant for alternates', async ({ page }) => {
  // Navigate to the base URL served by Playwright's webServer
  await page.goto('/');
  // fetch the MEETINGS JSON object from the page script
  const meetings = await page.evaluate(() => window.MEETINGS);
  const m = meetings.find(m => m.id === 'meeting-01');
  expect(m).toBeTruthy();
  expect(m.video.variant).toBeDefined();
});

test('render alternates under canonical asset', async ({ page }) => {
  await page.goto('/');
  // Wait for canonical row to render
  await page.waitForSelector('[data-testid="meeting-01-canonical"]');
  const canonicalCount = await page.locator('[data-testid="meeting-01-canonical"]').count();
  const altCount = await page.locator('[data-testid="meeting-01-alternate"]').count();
  expect(canonicalCount).toBeGreaterThan(0);
  expect(altCount).toBeGreaterThan(0);
});
