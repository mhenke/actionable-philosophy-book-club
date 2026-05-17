import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.addInitScript(() => { window.__TEST__ = true; }); });

test('disclosure summary shows Additional Resources prefix and no duplicate emoji', async ({ page }) => {
  await page.goto('/');

  const summary = page.locator('.podcast-disclosure summary .asset-link').first();
  await expect(summary).toBeVisible();

  const text = await summary.innerText();
  expect(text.trim().startsWith('Additional Resources:')).toBe(true);
  await expect(summary.locator('.icon-pill')).toBeVisible();
  await expect(text).toMatch(/\d+ Video/);
  await expect(text).toMatch(/\d+ Podcast/);
});
