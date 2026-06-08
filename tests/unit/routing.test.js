import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../../');

/**
 * Loads path.js (for isSafePath/DOMAIN globals) and routing.js into a
 * shared VM context and returns the window object.
 */
function loadRoutingContext() {
  const events = {};
  const ctx = {
    window: {
      location: { hash: '' },
      addEventListener: (type, fn) => {
        if (!events[type]) events[type] = [];
        events[type].push(fn);
      },
      removeEventListener: (type, fn) => {
        if (!events[type]) return;
        const idx = events[type].indexOf(fn);
        if (idx !== -1) events[type].splice(idx, 1);
      },
    },
  };
  vm.createContext(ctx);
  // Store events map on window for test inspection
  ctx.window.__events = events;

  // Load dependency: path.js provides window.isSafePath and window.DOMAIN
  const pathCode = fs.readFileSync(path.join(PROJECT_ROOT, 'src/path.js'), 'utf8');
  vm.runInContext(pathCode, ctx);

  // Load routing.js under test
  const routingCode = fs.readFileSync(path.join(PROJECT_ROOT, 'src/routing.js'), 'utf8');
  vm.runInContext(routingCode, ctx);

  return ctx.window;
}

// ──────────────────────────────────────────────
//  parseHash
// ──────────────────────────────────────────────

test('parseHash - valid #p=path returns {path, anchor: null}', () => {
  const { parseHash } = loadRoutingContext();
  const result = parseHash('#p=meetings/meeting-01/README.md');
  assert.ok(result !== null, 'expected non-null result');
  assert.strictEqual(result.path, 'meetings/meeting-01/README.md');
  assert.strictEqual(result.anchor, null);
});

test('parseHash - valid #p=path#anchor returns {path, anchor}', () => {
  const { parseHash } = loadRoutingContext();
  const result = parseHash('#p=meetings/meeting-01/README.md#section');
  assert.ok(result !== null, 'expected non-null result');
  assert.strictEqual(result.path, 'meetings/meeting-01/README.md');
  assert.strictEqual(result.anchor, 'section');
});

test('parseHash - invalid hash (no #p=) returns null', () => {
  const { parseHash } = loadRoutingContext();
  assert.strictEqual(parseHash('#section'), null);
  assert.strictEqual(parseHash('#'), null);
  assert.strictEqual(parseHash(''), null);
  assert.strictEqual(parseHash('not-a-hash'), null);
  assert.strictEqual(parseHash('##p=foo.md'), null);
});

test('parseHash - malformed URI (decodeURIComponent throws) returns null', () => {
  const { parseHash } = loadRoutingContext();
  // %G0 is not valid hex → decodeURIComponent throws URIError
  assert.strictEqual(parseHash('#p=%G0'), null);
  // Incomplete percent encoding
  assert.strictEqual(parseHash('#p=meetings/%'), null);
  assert.strictEqual(parseHash('#p=meetings/%2'), null);
});

test('parseHash - unsafe path (traversal) returns null', () => {
  const { parseHash } = loadRoutingContext();
  // Path traversal
  assert.strictEqual(parseHash('#p=../../../etc/passwd'), null);
  // Protocol URL
  assert.strictEqual(parseHash('#p=https://evil.com/x.md'), null);
  // Non-.md extension
  assert.strictEqual(parseHash('#p=meetings/meeting-01/notes.txt'), null);
  // Absolute path
  assert.strictEqual(parseHash('#p=/etc/passwd'), null);
});

test('parseHash - empty hash returns null', () => {
  const { parseHash } = loadRoutingContext();
  assert.strictEqual(parseHash(''), null);
  assert.strictEqual(parseHash(undefined), null);
  assert.strictEqual(parseHash(null), null);
});

test('parseHash - path with anchor after # works correctly', () => {
  const { parseHash } = loadRoutingContext();
  const result = parseHash('#p=meetings/meeting-01/README.md#my-section');
  assert.ok(result !== null, 'expected non-null result');
  assert.strictEqual(result.path, 'meetings/meeting-01/README.md');
  assert.strictEqual(result.anchor, 'my-section');
});

test('parseHash - encoded path decodes correctly', () => {
  const { parseHash } = loadRoutingContext();
  // %2D decodes to hyphen (-) which passes isSafePath
  const result = parseHash('#p=meetings/meeting%2D01/README.md');
  assert.ok(result !== null, 'expected non-null result');
  assert.strictEqual(result.path, 'meetings/meeting-01/README.md');
  assert.strictEqual(result.anchor, null);
});

test('parseHash - encoded path with anchor decodes both parts', () => {
  const { parseHash } = loadRoutingContext();
  // decodeURIComponent is applied to the full string before splitting,
  // so both path and anchor get decoded
  const result = parseHash('#p=meetings/meeting%2D01/README.md#section%2D1');
  assert.ok(result !== null, 'expected non-null result');
  assert.strictEqual(result.path, 'meetings/meeting-01/README.md');
  assert.strictEqual(result.anchor, 'section-1');
});

// ──────────────────────────────────────────────
//  createRouter
// ──────────────────────────────────────────────

test('createRouter - returns object with start and destroy methods', () => {
  const win = loadRoutingContext();
  const router = win.createRouter({
    routes: new Map([['reader', () => {}]]),
    fallback: () => {},
  });
  assert.ok(router);
  assert.strictEqual(typeof router.start, 'function');
  assert.strictEqual(typeof router.destroy, 'function');
});

test('createRouter - throws if routes is not a Map', () => {
  const { createRouter, parseHash } = loadRoutingContext();
  assert.throws(() => createRouter({ routes: {} }), /routes must be a Map/);
});

test('createRouter - start binds hashchange and handles current hash', () => {
  const win = loadRoutingContext();
  const calls = [];
  const router = win.createRouter({
    routes: new Map([
      ['reader', (p, a) => calls.push(['reader', p, a])],
      ['default', () => calls.push(['default'])],
    ]),
    fallback: () => calls.push(['fallback']),
  });

  // No hash set → should fall through to 'default' → fallback
  router.start();
  assert.strictEqual(calls.length, 1);
  assert.deepStrictEqual(calls[0], ['default']);

  // Clean up
  router.destroy();
});

test('createRouter - destroy removes hashchange listener', () => {
  const win = loadRoutingContext();
  const calls = [];
  const router = win.createRouter({
    routes: new Map([
      ['reader', () => calls.push('reader')],
      ['default', () => calls.push('default')],
    ]),
    fallback: () => calls.push('fallback'),
  });

  router.start();
  calls.length = 0; // reset from initial call

  // Manually trigger hashchange to verify listener is active
  const hashchangeListeners = win.__events['hashchange'] || [];
  assert.strictEqual(hashchangeListeners.length, 1,
    'should have one registered hashchange listener');
  hashchangeListeners[0]();
  assert.strictEqual(calls.length, 1, 'listener should fire before destroy');

  calls.length = 0;
  router.destroy();

  // Verify listener was removed
  assert.strictEqual((win.__events['hashchange'] || []).length, 0,
    'should have no hashchange listeners after destroy');
  assert.strictEqual(calls.length, 0,
    'handler should not fire after destroy');
});

// ──────────────────────────────────────────────
//  Legacy API (backward-compatible exports)
// ──────────────────────────────────────────────

test('legacy API exports exist on window', () => {
  const win = loadRoutingContext();
  assert.strictEqual(typeof win.registerRoute, 'function');
  assert.strictEqual(typeof win.handleRoute, 'function');
  assert.strictEqual(typeof win.initRouting, 'function');
});
