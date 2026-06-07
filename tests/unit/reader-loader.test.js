import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../../');

function loadReaderLoader(overrides = {}) {
  const absolutePath = path.resolve(PROJECT_ROOT, 'src/reader-loader.js');
  const code = fs.readFileSync(absolutePath, 'utf8');

  const markdownContent = {
    innerHTML: '',
    ariaBusy: null,
    setAttribute(name, value) {
      if (name === 'aria-busy') this.ariaBusy = value;
    },
    focus() {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
  };

  const windowObject = {
    __TEST__: true,
    DOM: {
      markdownContent,
      readerStatus: { textContent: '' },
    },
    ExternalLinkConfig: Object.freeze({ REL: 'noopener noreferrer', OFFICE_VIEWER_ORIGIN: 'https://view.officeapps.live.com' }),
    callOnce() { return true; },
    DOMPurify: {
      addHook() {},
      sanitize(value) { return `sanitized:${value}`; },
    },
    marked: {
      parse(value) { return `<h1>${value}</h1>`; },
    },
    fetchMarkdown: async () => 'default markdown',
    rewriteContentLinks() {},
    showRetryUI() {},
    navigateToDashboard() {},
    setView() {},
    scrollTo() {},
    requestAnimationFrame(callback) { callback(); },
    ErrorHandler: { warn() {} },
    ...overrides.window,
  };

  const context = {
    window: windowObject,
    document: {
      querySelector() { return null; },
      getElementById() { return null; },
      createElement() {
        return {
          innerHTML: '',
          firstElementChild: null,
          querySelectorAll() { return []; },
        };
      },
    },
    URL,
    setTimeout,
    clearTimeout,
    ...overrides.context,
  };

  vm.createContext(context);
  vm.runInContext(code, context);
  return context.window;
}

test('reader loader exposes pipeline test hooks when __TEST__ is enabled', () => {
  const readerLoader = loadReaderLoader();

  assert.ok(readerLoader.__readerPipeline);
  assert.strictEqual(typeof readerLoader.__readerPipeline.runPipeline, 'function');
  assert.strictEqual(typeof readerLoader.__readerPipeline.fetchStage, 'function');
  assert.strictEqual(typeof readerLoader.__readerPipeline.parseSanitizeStage, 'function');
});

test('runPipeline threads context through stages in order', async () => {
  const { __readerPipeline } = loadReaderLoader();
  const calls = [];

  const result = await __readerPipeline.runPipeline({ value: 1 }, [
    async (ctx) => {
      calls.push('one');
      ctx.value += 1;
      return ctx;
    },
    async (ctx) => {
      calls.push('two');
      ctx.value *= 3;
      return ctx;
    },
  ]);

  assert.deepStrictEqual(calls, ['one', 'two']);
  assert.strictEqual(result.value, 6);
});

test('parseSanitizeStage stores sanitized html on the pipeline context', async () => {
  const sanitizeCalls = [];
  const parseCalls = [];
  const { __readerPipeline } = loadReaderLoader({
    window: {
      DOMPurify: {
        addHook() {},
        sanitize(value, options) {
          sanitizeCalls.push({ value, options });
          return `<safe>${value}</safe>`;
        },
      },
      marked: {
        parse(value) {
          parseCalls.push(value);
          return `<article>${value}</article>`;
        },
      },
    },
  });

  const ctx = { text: '# Deep Work' };
  const result = await __readerPipeline.parseSanitizeStage(ctx);

  assert.strictEqual(result, ctx);
  assert.deepStrictEqual(parseCalls, ['# Deep Work']);
  assert.strictEqual(result.sanitized, '<safe><article># Deep Work</article></safe>');
  assert.strictEqual(sanitizeCalls.length, 1);
  assert.strictEqual(sanitizeCalls[0].value, '<article># Deep Work</article>');
  assert.deepStrictEqual(Array.from(sanitizeCalls[0].options.FORBID_TAGS), ['style', 'iframe', 'form', 'object', 'embed']);
  assert.deepStrictEqual(Array.from(sanitizeCalls[0].options.FORBID_ATTR), ['style', 'onerror', 'onload', 'onclick', 'oninput', 'onmouseover', 'onmouseenter', 'onfocus', 'onkeydown', 'onkeyup']);
});

test('fetchStage stores fetched markdown text on the pipeline context', async () => {
  const fetchCalls = [];
  const { __readerPipeline } = loadReaderLoader({
    window: {
      fetchMarkdown: async (pathValue, signal) => {
        fetchCalls.push({ path: pathValue, signal });
        return '# Notes';
      },
    },
  });

  const signal = { aborted: false };
  const ctx = { path: 'meetings/meeting-01/README.md', signal };
  const result = await __readerPipeline.fetchStage(ctx);

  assert.strictEqual(result, ctx);
  assert.strictEqual(result.text, '# Notes');
  assert.deepStrictEqual(fetchCalls, [{ path: 'meetings/meeting-01/README.md', signal }]);
});
