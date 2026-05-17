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
    expect(cached).toContain('Meeting Zero');
  });

  test('hovering over meeting notes link triggers prefetch', async ({ page }) => {
    let prefetchCalled = false;
    
    await page.route('**/meetings/meeting-02/README.md', route => {
      prefetchCalled = true;
      route.fulfill({ body: '# Meeting\n\nContent.' });
    });

    await page.goto('/');
    
    // Hover over the meeting notes link
    const notesLink = page.locator('.meeting-notes-link').first();
    await notesLink.hover();
    
    await page.waitForFunction(() => window.mdCache.has('meetings/meeting-02/README.md'));
    
    // Prefetch should have triggered a fetch
    expect(prefetchCalled).toBe(true);
  });

  test('prefetch does not happen twice for same path', async ({ page }) => {
    let fetchCount = 0;
    
    await page.route('**/meetings/meeting-00/README.md', route => {
      fetchCount++;
      route.fulfill({ body: '# Meeting\n\nContent.' });
    });

    await page.goto('/');
    
    // Manually prefetch
    await page.evaluate(() => {
      prefetchMarkdown('meetings/meeting-00/README.md');
    });
    await page.waitForFunction(() => window.mdCache.has('meetings/meeting-00/README.md'));
    expect(fetchCount).toBe(1);
    
    // Prefetch again - should be cache hit
    await page.evaluate(() => {
      prefetchMarkdown('meetings/meeting-00/README.md');
    });
    await page.waitForFunction(() => window.mdCache.has('meetings/meeting-00/README.md'));
    
    // Still only 1 fetch (cache prevented 2nd)
    expect(fetchCount).toBe(1);
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
    let fetchCount = 0;
    
    await page.route('**/meetings/meeting-00/README.md', route => {
      fetchCount++;
      route.fulfill({ body: '# Meeting\n\nPrefetched.' });
    });

    await page.goto('/');
    
    // Prefetch
    await page.evaluate(() => {
      prefetchMarkdown('meetings/meeting-00/README.md');
    });
    
    await page.waitForTimeout(300);
    expect(fetchCount).toBe(1);
    
    // Now navigate to it
    await page.goto('/#p=meetings/meeting-00/README.md');
    
    // Should render without a second fetch
    await expect(page.locator('#markdown-content')).toContainText('Prefetched');
    
    expect(fetchCount).toBe(1);
  });
});
