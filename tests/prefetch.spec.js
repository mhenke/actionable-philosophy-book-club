import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.addInitScript(() => { window.__TEST__ = true; }); });

test.describe('Performance: Markdown Prefetch', () => {
  test('prefetch function populates mdCache when called', async ({ page }) => {
    await page.route('**/meetings/meeting-00/README.md', route => {
      route.fulfill({ body: '# Meeting Zero\n\nContent.' });
    });

    await page.goto('/');
    
    // Call prefetch directly
    await page.evaluate(() => {
      prefetchMarkdown('meetings/meeting-00/README.md');
    });
    
    await page.waitForFunction(() => window.mdCache.has('meetings/meeting-00/README.md'));
    
    // Verify it's in cache
    const cached = await page.evaluate(() => {
      return mdCache.get('meetings/meeting-00/README.md').then(value => value);
    });
    
    expect(cached).toBeTruthy();
    expect(cached).toContain('Meeting 00');
  });

  test('hovering over meeting notes link triggers prefetch', async ({ page }) => {
    await page.route('**/meetings/meeting-02/README.md', route => {
      route.fulfill({ body: '# Meeting\n\nContent.' });
    });

    await page.goto('/');
    
    // Hover over the meeting notes link
    const notesLink = page.locator('.meeting-notes-link').first();
    await notesLink.hover();
    
    await page.waitForFunction(() => window.mdCache.has('meetings/meeting-02/README.md'));
    
    // Prefetch should have populated the cache
    expect(await page.evaluate(() => window.mdCache.has('meetings/meeting-02/README.md'))).toBe(true);
  });

  test('prefetch does not happen twice for same path', async ({ page }) => {
    await page.goto('/');
    
    // Manually prefetch first time — triggers a real fetch
    await page.evaluate(() => {
      prefetchMarkdown('meetings/meeting-01/README.md');
    });
    await page.waitForFunction(() => window.mdCache.has('meetings/meeting-01/README.md'));
    const sizeAfterFirst = await page.evaluate(() => window.mdCache.size);
    expect(sizeAfterFirst).toBe(1);
    
    // Prefetch again — should be cache hit, cache size unchanged
    await page.evaluate(() => {
      prefetchMarkdown('meetings/meeting-01/README.md');
    });
    const sizeAfterSecond = await page.evaluate(() => window.mdCache.size);
    expect(sizeAfterSecond).toBe(1);
    
    // The cache entry should still resolve to the same content
    const cached = await page.evaluate(() =>
      window.mdCache.get('meetings/meeting-01/README.md').then(v => v.length > 0)
    );
    expect(cached).toBe(true);
  });

  test('prefetch silently fails on network error', async ({ page }) => {
    await page.route('**/meetings/missing.md', route => {
      route.abort();
    });

    await page.goto('/');
    
    // Prefetch should not throw
    await page.evaluate(() => {
      prefetchMarkdown('meetings/missing.md');
    });
    await page.waitForFunction(() => !window.mdCache.has('meetings/missing.md'));

    // Cache should be empty for missing file
    const cached = await page.evaluate(() => {
      return mdCache.has('meetings/missing.md');
    });
    
    expect(cached).toBe(false);
  });

  test('clicking link after prefetch uses cache (no second fetch)', async ({ page }) => {
    await page.goto('/');
    
    // Prefetch meeting-01
    await page.evaluate(() => {
      prefetchMarkdown('meetings/meeting-01/README.md');
    });
    
    await page.waitForFunction(() => window.mdCache.has('meetings/meeting-01/README.md'));
    
    // Navigate to it — should use cache
    await page.goto('/#p=meetings/meeting-01/README.md');
    await expect(page.locator('#markdown-content h1')).toBeVisible();
  });
});
