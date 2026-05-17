import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.addInitScript(() => { window.__TEST__ = true; }); });

test('disclosure summary shows Additional Resources prefix and no duplicate emoji', async ({ page }) => {
  await page.goto('/');

  const summary = page.locator('.podcast-disclosure summary .asset-link').first();
  await expect(summary).toBeVisible();

  const text = await summary.innerText();
  // Strip common leading emoji glyphs (icon-pill is visible but aria-hidden)
  const normalized = text.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\uFE0F]+/u, '').trim();
  expect(normalized.startsWith('Additional Resources:')).toBe(true);
  await expect(summary.locator('.icon-pill')).toBeVisible();
  await expect(normalized).toMatch(/\d+ Video/);
  await expect(normalized).toMatch(/\d+ Podcast/);
});
