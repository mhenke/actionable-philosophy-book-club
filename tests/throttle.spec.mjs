import { test } from '@playwright/test';
import fs from 'fs';

test('throttled README fetch shows flash (fetch override)', async ({ page }) => {
  const urlPath = 'meetings/meeting-02/README.md';

  // Inject a fetch override before any page script runs to delay the README fetch
  await page.addInitScript(() => {
    const orig = window.fetch;
    window.fetch = function(input, init) {
      try {
        const url = typeof input === 'string' ? input : (input && input.url) ? input.url : '';
        if (url && (url.endsWith('/' + 'meetings/meeting-02/README.md') || url.endsWith('meetings/meeting-02/README.md'))) {
          return new Promise(resolve => setTimeout(resolve, 1500)).then(() => orig(input, init));
        }
      } catch (e) {}
      return orig(input, init);
    };
  });

  const root = 'http://127.0.0.1:8000/';
  const targetHash = '#p=meetings/meeting-02/README.md';

  // Navigate with hash (fetch override already installed)
  await page.goto(root + targetHash, { waitUntil: 'networkidle' });

  // Short wait then capture before screenshot (while README is still pending)
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/tmp/meeting-02-before.png', fullPage: true });

  // Wait for the README response to be fulfilled
  await page.waitForResponse((resp) => resp.url().endsWith('/' + urlPath) || resp.url().endsWith(urlPath), { timeout: 7000 });

  // Wait for reader content to render
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/meeting-02-after.png', fullPage: true });
  console.log('Saved /tmp/meeting-02-before.png and /tmp/meeting-02-after.png');
});
