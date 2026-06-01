import { test, expect } from '@playwright/test';

test.describe('Stacked asset metadata', () => {

  test('canonical video row renders .asset-meta with duration and size', async ({ page }) => {
    await page.goto('/');
    const container = page.locator('#upcoming-materials-container');
    await expect(container).toBeVisible();

    const meta = container.locator('.asset-meta').first();
    await expect(meta).toBeVisible();
    const text = await meta.textContent();
    expect(text).toMatch(/\d+m\s+\d+s/);
    expect(text).toMatch(/MB/);
  });

  test('additional_material row renders .asset-meta with duration and size within disclosure', async ({ page }) => {
    await page.goto('/');
    const disclosure = page.locator('#upcoming-additional .podcast-disclosure');
    const summary = disclosure.locator('summary');
    await summary.click();

    const meta = disclosure.locator('.asset-meta').first();
    await expect(meta).toBeVisible();
    const text = await meta.textContent();
    expect(text).toMatch(/\d+m\s+\d+s/);
    expect(text).toMatch(/MB/);
  });
});
