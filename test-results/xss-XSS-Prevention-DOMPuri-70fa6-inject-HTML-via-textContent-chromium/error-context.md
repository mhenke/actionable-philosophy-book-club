# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: xss.spec.js >> XSS Prevention (DOMPurify) >> error path does not inject HTML via textContent
- Location: tests/xss.spec.js:40:5

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('#markdown-content')
Timeout: 5000ms
- Expected substring  - 1
+ Received string     + 2

- Document unavailable
+
+         

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('#markdown-content')
    14 × locator resolved to <article aria-busy="false" aria-live="polite" id="markdown-content" class="prose px-6 md:px-10 pt-12 pb-24">↵        </article>
       - unexpected value "
        "

```

```yaml
- banner:
  - heading "A Philosophy of Software Design" [level=1]
  - text: John Ousterhout
- main:
  - text: Meeting 02 • Next Session
  - heading "Deep Modules & Complexity Sink" [level=2]
  - text: Upcoming
  - paragraph: Key Takeaway
  - paragraph:
    - text: "\"A well-designed module is a"
    - strong: complexity sink
    - text: ": it takes on internal implementation suffering so the rest of the system can stay simple.\""
  - link "View Agenda & Discussion Guide":
    - /url: "#p=meetings/meeting-02/README.md"
  - paragraph: Upcoming Materials
  - paragraph: Slide Deck
  - paragraph: Ready before meeting
  - paragraph: Video Recording
  - paragraph: Ready after meeting
  - heading "The Archive" [level=3]
  - heading "Knowledge Base" [level=3]
  - link "Glossary":
    - /url: "#p=docs/glossary.md"
  - link "Principles":
    - /url: "#p=docs/design-principles.md"
  - link "AI Prompts":
    - /url: "#p=templates/prompts/README.md"
  - link "Inbox":
    - /url: "#p=meetings/meeting-99-new/README.md"
- contentinfo:
  - paragraph: Actionable Philosophy Book Club • Spare Time Excellence • 2026
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('XSS Prevention (DOMPurify)', () => {
  4  | 
  5  |     test('script tags in markdown are stripped before render', async ({ page }) => {
  6  |         await page.route('**/meetings/meeting-01/README.md', route =>
  7  |             route.fulfill({ body: '# Test\n<script>window.__xss=1</script>\n<p>Hello</p>' })
  8  |         );
  9  |         await page.goto('/#p=meetings/meeting-01/README.md');
  10 |         await page.waitForSelector('#markdown-content h1');
  11 | 
  12 |         const executed = await page.evaluate(() => window.__xss);
  13 |         expect(executed).toBeUndefined();
  14 | 
  15 |         // Content itself should still render
  16 |         await expect(page.locator('#markdown-content')).toContainText('Hello');
  17 |     });
  18 | 
  19 |     test('img onerror payload does not execute', async ({ page }) => {
  20 |         await page.route('**/meetings/meeting-01/README.md', route =>
  21 |             route.fulfill({ body: '<img src=x onerror="window.__onerror=1">' })
  22 |         );
  23 |         await page.goto('/#p=meetings/meeting-01/README.md');
  24 |         await page.waitForLoadState('networkidle');
  25 | 
  26 |         const fired = await page.evaluate(() => window.__onerror);
  27 |         expect(fired).toBeUndefined();
  28 |     });
  29 | 
  30 |     test('svg onload payload does not execute', async ({ page }) => {
  31 |         await page.route('**/meetings/meeting-01/README.md', route =>
  32 |             route.fulfill({ body: '<svg><script>window.__svgxss=1</script></svg>' })
  33 |         );
  34 |         await page.goto('/#p=meetings/meeting-01/README.md');
  35 |         await page.waitForLoadState('networkidle');
  36 | 
  37 |         expect(await page.evaluate(() => window.__svgxss)).toBeUndefined();
  38 |     });
  39 | 
  40 |     test('error path does not inject HTML via textContent', async ({ page }) => {
  41 |         await page.route('**/meetings/meeting-01/README.md', route =>
  42 |             route.fulfill({ status: 500, body: '' })
  43 |         );
  44 |         await page.goto('/#p=meetings/meeting-01/README.md');
  45 |         await page.waitForLoadState('networkidle');
  46 | 
  47 |         // Error message must be plain text, not parsed as markup
  48 |         const scripts = await page.locator('#markdown-content script').count();
  49 |         expect(scripts).toBe(0);
> 50 |         await expect(page.locator('#markdown-content')).toContainText('Document unavailable');
     |                                                         ^ Error: expect(locator).toContainText(expected) failed
  51 |     });
  52 | 
  53 |     test('no script elements present in rendered content', async ({ page }) => {
  54 |         await page.route('**/meetings/meeting-01/README.md', route =>
  55 |             route.fulfill({ body: '# Safe\n\nPlain paragraph.' })
  56 |         );
  57 |         await page.goto('/#p=meetings/meeting-01/README.md');
  58 |         await page.waitForSelector('#markdown-content h1');
  59 | 
  60 |         const scripts = await page.locator('#markdown-content script').count();
  61 |         expect(scripts).toBe(0);
  62 |     });
  63 | 
  64 | });
  65 | 
```