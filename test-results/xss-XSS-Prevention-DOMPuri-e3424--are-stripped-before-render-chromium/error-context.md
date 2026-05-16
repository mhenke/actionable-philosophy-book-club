# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: xss.spec.js >> XSS Prevention (DOMPurify) >> script tags in markdown are stripped before render
- Location: tests/xss.spec.js:5:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#markdown-content h1') to be visible

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - heading "A Philosophy of Software Design" [level=1] [ref=e5]
        - generic [ref=e6]: John Ousterhout
    - main [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]:
            - generic [ref=e12]: Meeting 02 • Next Session
            - heading "Deep Modules & Complexity Sink" [level=2] [ref=e13]
          - generic [ref=e14]: Upcoming
        - generic [ref=e15]:
          - paragraph [ref=e16]: Key Takeaway
          - paragraph [ref=e17]:
            - text: "\"A well-designed module is a"
            - strong [ref=e18]: complexity sink
            - text: ": it takes on internal implementation suffering so the rest of the system can stay simple.\""
        - generic [ref=e19]:
          - link "View Agenda & Discussion Guide" [ref=e20] [cursor=pointer]:
            - /url: "#p=meetings/meeting-02/README.md"
            - text: View Agenda & Discussion Guide
            - img [ref=e21]
          - generic [ref=e23]:
            - paragraph [ref=e24]: Upcoming Materials
            - generic [ref=e25]:
              - generic [ref=e26]:
                - generic [ref=e27]: 📊
                - generic [ref=e28]:
                  - paragraph [ref=e29]: Slide Deck
                  - paragraph [ref=e30]: Ready before meeting
              - generic [ref=e31]:
                - generic [ref=e32]: 🎬
                - generic [ref=e33]:
                  - paragraph [ref=e34]: Video Recording
                  - paragraph [ref=e35]: Ready after meeting
      - heading "The Archive" [level=3] [ref=e37]: The Archive
      - generic [ref=e39]:
        - heading "Knowledge Base" [level=3] [ref=e40]: Knowledge Base
        - generic [ref=e42]:
          - link "Glossary" [ref=e43] [cursor=pointer]:
            - /url: "#p=docs/glossary.md"
            - generic [ref=e44]: 📚
            - generic [ref=e45]: Glossary
          - link "Principles" [ref=e46] [cursor=pointer]:
            - /url: "#p=docs/design-principles.md"
            - generic [ref=e47]: ⚖️
            - generic [ref=e48]: Principles
          - link "AI Prompts" [ref=e49] [cursor=pointer]:
            - /url: "#p=templates/prompts/README.md"
            - generic [ref=e50]: 🤖
            - generic [ref=e51]: AI Prompts
          - link "Inbox" [ref=e52] [cursor=pointer]:
            - /url: "#p=meetings/meeting-99-new/README.md"
            - generic [ref=e53]: 📂
            - generic [ref=e54]: Inbox
  - contentinfo [ref=e55]:
    - paragraph [ref=e56]: Actionable Philosophy Book Club • Spare Time Excellence • 2026
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
> 10 |         await page.waitForSelector('#markdown-content h1');
     |                    ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
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
  50 |         await expect(page.locator('#markdown-content')).toContainText('Document unavailable');
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