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
