import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../../');

function loadDashboard() {
    const absolutePath = path.resolve(PROJECT_ROOT, 'src/dashboard.js');
    const code = fs.readFileSync(absolutePath, 'utf8');

    const hiddenViews = new Set();
    const clearedContainers = [];
    const containerStub = (id) => {
        const section = {
            classList: {
                add: (c) => hiddenViews.add(c),
                remove: (c) => hiddenViews.delete(c),
                contains: (c) => hiddenViews.has(c),
            },
        };
        return {
            id,
            innerHTML: 'prior content',
            closest(selector) {
                return selector === 'section' ? section : null;
            },
        };
    };

    const windowObject = {
        __TEST__: true,
        DOM: {
            upcomingCardHeader: containerStub('upcoming-card-header'),
            upcomingMaterialsContainer: containerStub('upcoming-materials'),
            upcomingKeyTakeaway: containerStub('upcoming-key-takeaway'),
            upcomingWhatToRead: containerStub('upcoming-what-to-read'),
            upcomingCta: containerStub('upcoming-cta'),
            upcomingAdditional: containerStub('upcoming-additional'),
            archiveCardsContainer: containerStub('archive-cards'),
            draftCardsContainer: containerStub('draft-cards'),
            siteFooter: containerStub('site-footer'),
        },
        STATUS: { DONE: 'done', UPCOMING: 'upcoming', DRAFT: 'draft' },
        findMeetings: () => [],
        escapeHTML: (s) => String(s),
        buildAssetRows: () => ({ primaryRows: [], additionalRows: [], resourceStrip: '', additionalSummary: '' }),
        buildPodcastDisclosure: () => '',
    };

    const context = {
        window: windowObject,
        document: { querySelector: () => null, getElementById: () => null },
        URL,
        setTimeout,
        clearTimeout,
    };

    vm.createContext(context);
    vm.runInContext(code, context);
    return { window: context.window, hiddenViews, clearedContainers };
}

test('dashboard module exposes a hideEmptySection test hook when __TEST__ is enabled', () => {
    const { window } = loadDashboard();
    assert.ok(window.__dashboardTestHooks, '__dashboardTestHooks should be exposed');
    assert.strictEqual(typeof window.__dashboardTestHooks.hideEmptySection, 'function');
});

test('hideEmptySection clears the container innerHTML', () => {
    const { window } = loadDashboard();
    const container = window.DOM.archiveCardsContainer;
    container.innerHTML = 'old archive content';
    window.__dashboardTestHooks.hideEmptySection(container);
    assert.strictEqual(container.innerHTML, '');
});

test('hideEmptySection adds the hidden-view class to the parent section', () => {
    const { window } = loadDashboard();
    const container = window.DOM.archiveCardsContainer;
    window.__dashboardTestHooks.hideEmptySection(container);
    const section = container.closest('section');
    assert.ok(section.classList.contains('hidden-view'), 'parent section should have hidden-view');
});
