import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.addInitScript(() => { window.__TEST__ = true; }); });

test('disclosure summary shows Additional Resources prefix and no duplicate emoji', async ({ page }) => {
  await page.goto('/');

  const summary = page.locator('#upcoming-podcasts .podcast-disclosure summary .asset-link');
  await expect(summary).toBeVisible();

  const text = await summary.innerText();
  // Strip common leading emoji glyphs (icon-pill is visible but aria-hidden)
  const normalized = text.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\uFE0F]+/u, '').trim();
  expect(normalized.startsWith('Additional Resources:')).toBe(true);
  await expect(summary.locator('.icon-pill')).toBeVisible();
  await expect(normalized).toMatch(/\d+ Video/);
  await expect(normalized).toMatch(/\d+ Podcast/);
});

test('video asset shows duration and file size when present in manifest', async ({ page }) => {
  await page.goto('/');
  const videoLink = page.locator('#archive-cards-container .card').last().locator('a.asset-link[href*=".mp4"]').first();
  await expect(videoLink).toContainText(/52m/);
  await expect(videoLink).toContainText(/840 MB/);
});

test('podcast asset shows duration and file size when present in manifest', async ({ page }) => {
  await page.goto('/');
  const podcastLink = page.locator('#archive-cards-container .card').first().locator('a.asset-link[href*=".m4a"]').first();
  await expect(podcastLink).toContainText(/18m/);
  await expect(podcastLink).toContainText(/16 MB/);
});
