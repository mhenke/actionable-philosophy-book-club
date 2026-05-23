# Comprehensive Design Refactoring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Fix all 16 design issues (3 critical, 5 major, 8 minor) identified in the aposd audit to improve module design, information hiding, error handling, and maintainability.

**Architecture:** Five-phase refactoring addressing systemic issues in order of impact:
1. **State & Data Model Refactoring** - Create MeetingRepository and Meeting data class to eliminate global state mutability and thin getters
2. **Rendering Consolidation** - Unify fragmented asset/dashboard rendering logic to reduce information leakage
3. **Error Handling Strategy** - Define error types and consistent error recovery patterns
4. **Module Organization** - Rename modules by concern instead of execution order, document visibility
5. **Documentation & Guardrails** - Add JSDoc, consolidate magic numbers, eliminate inline strings

**Tech Stack:** Vanilla JavaScript, Playwright E2E tests (71 existing), TDD approach, no framework dependencies.

**Test Strategy:** 
- Use existing `window.__TEST__` hooks to expose internal functions for unit testing
- Verify each fix with `npm test` (all 71 tests must pass)
- After each fix, run mini-audit checklist to ensure issues are resolved

**Backward Compatibility:** Tests currently patch `window.MEETINGS` and `window.ASSET_COPY` directly. Refactoring will require test updates alongside code changes.

---

## Phase 1: State & Data Model Refactoring (Critical)

### Task 1.1: Create Meeting Data Class

**Files:**
- Create: `src/data-meeting.js`
- Test: `tests/data-meeting.spec.js`

**Context:**
Meeting objects are currently plain objects accessed with repeated property drilling (e.g., `meeting.video.file`, `meeting.status`, `meeting.podcasts`). This leaks schema knowledge across 4+ rendering functions.

**Step 1: Write the failing test**

Create `tests/data-meeting.spec.js`:

```javascript
describe('Meeting data class', () => {
  test('constructor initializes from plain object', () => {
    const plainObj = {
      id: 'meeting-01',
      title: 'Session 1',
      status: 'done',
      date: '2025-01-15',
      video: { file: 'recordings/meeting-01.mp4', label: 'Video Recap' },
      slides: { file: 'slides/meeting-01.pptx' },
      podcasts: ['podcast-01.mp3'],
      resources: ['resource-01.png'],
      color: 'spectrum-1',
      wash: 'wash-1',
      duration: 189
    };
    const meeting = new Meeting(plainObj);
    expect(meeting.id).toBe('meeting-01');
    expect(meeting.title).toBe('Session 1');
  });

  test('hasVideo returns true only if video.file exists and status is done', () => {
    const meeting = new Meeting({
      status: 'done',
      video: { file: 'recordings/meeting-01.mp4', label: 'Video Recap' }
    });
    expect(meeting.hasVideo()).toBe(true);
  });

  test('hasVideo returns false if status is not done', () => {
    const meeting = new Meeting({
      status: 'upcoming',
      video: { file: 'recordings/meeting-01.mp4', label: 'Video Recap' }
    });
    expect(meeting.hasVideo()).toBe(false);
  });

  test('hasVideo returns false if video.file is missing', () => {
    const meeting = new Meeting({
      status: 'done',
      video: { label: 'Video Recap' }
    });
    expect(meeting.hasVideo()).toBe(false);
  });

  test('getAssets returns object with video, slides, podcasts, resources', () => {
    const meeting = new Meeting({
      status: 'done',
      video: { file: 'recordings/meeting-01.mp4', label: 'Video Recap' },
      slides: { file: 'slides/meeting-01.pptx' },
      podcasts: ['podcast-01.mp3'],
      resources: ['resource-01.png']
    });
    const assets = meeting.getAssets();
    expect(assets.video).toEqual({ file: 'recordings/meeting-01.mp4', label: 'Video Recap' });
    expect(assets.slides).toEqual({ file: 'slides/meeting-01.pptx' });
    expect(assets.podcasts).toEqual(['podcast-01.mp3']);
    expect(assets.resources).toEqual(['resource-01.png']);
  });

  test('isDone returns true only for done status', () => {
    const done = new Meeting({ status: 'done' });
    const upcoming = new Meeting({ status: 'upcoming' });
    const horizon = new Meeting({ status: 'horizon' });
    
    expect(done.isDone()).toBe(true);
    expect(upcoming.isDone()).toBe(false);
    expect(horizon.isDone()).toBe(false);
  });

  test('isUpcoming returns true only for upcoming status', () => {
    const upcoming = new Meeting({ status: 'upcoming' });
    const done = new Meeting({ status: 'done' });
    
    expect(upcoming.isUpcoming()).toBe(true);
    expect(done.isUpcoming()).toBe(false);
  });

  test('isHorizon returns true only for horizon status', () => {
    const horizon = new Meeting({ status: 'horizon' });
    const done = new Meeting({ status: 'done' });
    
    expect(horizon.isHorizon()).toBe(true);
    expect(done.isHorizon()).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- tests/data-meeting.spec.js
```

Expected: Multiple FAIL messages like "Meeting is not defined" or "test not found".

**Step 3: Write minimal implementation**

Create `src/data-meeting.js`:

```javascript
class Meeting {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.status = data.status;
    this.date = data.date;
    this.video = data.video || {};
    this.slides = data.slides || {};
    this.podcasts = data.podcasts || [];
    this.resources = data.resources || [];
    this.color = data.color;
    this.wash = data.wash;
    this.duration = data.duration;
  }

  hasVideo() {
    return this.isDone() && !!(this.video && this.video.file);
  }

  getAssets() {
    return {
      video: this.video,
      slides: this.slides,
      podcasts: this.podcasts,
      resources: this.resources
    };
  }

  isDone() {
    return this.status === 'done';
  }

  isUpcoming() {
    return this.status === 'upcoming';
  }

  isHorizon() {
    return this.status === 'horizon';
  }
}

// Export for both Node and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Meeting;
}
```

Update `src/06-app.js` to expose Meeting for tests:

```javascript
if (window.__TEST__) {
  window.Meeting = Meeting;
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- tests/data-meeting.spec.js
```

Expected: All tests PASS.

**Step 5: Commit**

```bash
git add src/data-meeting.js tests/data-meeting.spec.js
git commit -m "feat: add Meeting data class with status and asset accessors"
```

---

### Task 1.2: Create MeetingRepository Class

**Files:**
- Create: `src/data-repository.js`
- Modify: `src/06-app.js` - expose for tests
- Test: `tests/data-repository.spec.js`

**Context:**
MEETINGS and ASSET_COPY globals are accessed via thin getters/setters from 5 modules. Replace with a repository pattern that validates on load and prevents direct access.

**Step 1: Write the failing test**

Create `tests/data-repository.spec.js`:

```javascript
describe('MeetingRepository', () => {
  test('create() initializes with empty meetings', () => {
    const repo = new MeetingRepository();
    expect(repo.getAll()).toEqual([]);
  });

  test('load() wraps each meeting in Meeting class', () => {
    const repo = new MeetingRepository();
    const data = [
      {
        id: 'meeting-01',
        title: 'Session 1',
        status: 'done',
        video: { file: 'recordings/meeting-01.mp4' }
      }
    ];
    repo.load(data);
    const meetings = repo.getAll();
    expect(meetings.length).toBe(1);
    expect(meetings[0] instanceof Meeting).toBe(true);
    expect(meetings[0].id).toBe('meeting-01');
  });

  test('getAll() returns array of Meeting instances', () => {
    const repo = new MeetingRepository();
    repo.load([
      { id: 'meeting-01', status: 'done' },
      { id: 'meeting-02', status: 'upcoming' }
    ]);
    const meetings = repo.getAll();
    expect(meetings.length).toBe(2);
    expect(meetings[0] instanceof Meeting).toBe(true);
  });

  test('getById() returns Meeting or null', () => {
    const repo = new MeetingRepository();
    repo.load([
      { id: 'meeting-01', title: 'Session 1', status: 'done' }
    ]);
    const meeting = repo.getById('meeting-01');
    expect(meeting).not.toBeNull();
    expect(meeting.title).toBe('Session 1');
    
    const notFound = repo.getById('meeting-99');
    expect(notFound).toBeNull();
  });

  test('getDone() returns only done meetings', () => {
    const repo = new MeetingRepository();
    repo.load([
      { id: 'meeting-01', status: 'done' },
      { id: 'meeting-02', status: 'upcoming' },
      { id: 'meeting-03', status: 'done' }
    ]);
    const done = repo.getDone();
    expect(done.length).toBe(2);
    expect(done.every(m => m.isDone())).toBe(true);
  });

  test('getUpcoming() returns only upcoming meetings', () => {
    const repo = new MeetingRepository();
    repo.load([
      { id: 'meeting-01', status: 'done' },
      { id: 'meeting-02', status: 'upcoming' },
      { id: 'meeting-03', status: 'horizon' }
    ]);
    const upcoming = repo.getUpcoming();
    expect(upcoming.length).toBe(1);
    expect(upcoming[0].isUpcoming()).toBe(true);
  });

  test('getHorizon() returns only horizon meetings', () => {
    const repo = new MeetingRepository();
    repo.load([
      { id: 'meeting-01', status: 'done' },
      { id: 'meeting-02', status: 'upcoming' },
      { id: 'meeting-03', status: 'horizon' }
    ]);
    const horizon = repo.getHorizon();
    expect(horizon.length).toBe(1);
    expect(horizon[0].isHorizon()).toBe(true);
  });

  test('clear() empties the repository', () => {
    const repo = new MeetingRepository();
    repo.load([
      { id: 'meeting-01', status: 'done' },
      { id: 'meeting-02', status: 'upcoming' }
    ]);
    expect(repo.getAll().length).toBe(2);
    repo.clear();
    expect(repo.getAll().length).toBe(0);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- tests/data-repository.spec.js
```

Expected: FAIL - "MeetingRepository is not defined".

**Step 3: Write minimal implementation**

Create `src/data-repository.js`:

```javascript
class MeetingRepository {
  constructor() {
    this.meetings = [];
  }

  load(plainMeetings) {
    this.meetings = plainMeetings.map(m => new Meeting(m));
  }

  getAll() {
    return this.meetings;
  }

  getById(id) {
    return this.meetings.find(m => m.id === id) || null;
  }

  getDone() {
    return this.meetings.filter(m => m.isDone());
  }

  getUpcoming() {
    return this.meetings.filter(m => m.isUpcoming());
  }

  getHorizon() {
    return this.meetings.filter(m => m.isHorizon());
  }

  clear() {
    this.meetings = [];
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MeetingRepository;
}
```

Update `src/06-app.js` to expose:

```javascript
if (window.__TEST__) {
  window.MeetingRepository = MeetingRepository;
}
```

Also create a singleton instance in `src/00-setup.js` (will be refactored more in later tasks):

```javascript
const meetingRepo = new MeetingRepository();
```

**Step 4: Run test to verify it passes**

```bash
npm test -- tests/data-repository.spec.js
```

Expected: All tests PASS.

**Step 5: Run full test suite**

```bash
npm test
```

Expected: All 71 existing tests still PASS (no regressions).

**Step 6: Commit**

```bash
git add src/data-repository.js tests/data-repository.spec.js src/06-app.js src/00-setup.js
git commit -m "feat: add MeetingRepository to encapsulate global meeting state"
```

---

### Task 1.3: Replace Global Getter/Setter Calls in Dashboard Module

**Files:**
- Modify: `src/04-dashboard.js:1-50` - update renderUpcomingMaterials
- Modify: `tests/dashboard.spec.js` - update test patches
- Test: Run existing dashboard tests

**Context:**
`renderUpcomingMaterials()` currently calls `getMeetings()` directly and accesses `m.status`. Update to use `meetingRepo.getUpcoming()` and rely on Meeting class predicates.

**Step 1: View current implementation**

```bash
grep -n "renderUpcomingMaterials" src/04-dashboard.js | head -20
```

Expected: See function signature and `getMeetings()` calls.

**Step 2: Update renderUpcomingMaterials function**

In `src/04-dashboard.js`, replace:

```javascript
function renderUpcomingMaterials() {
  const meetings = getMeetings();
  const upcoming = meetings.filter(m => m.status === 'upcoming');
  // ... rest of function
}
```

With:

```javascript
function renderUpcomingMaterials() {
  const upcoming = meetingRepo.getUpcoming();
  // ... rest of function (meetings become upcoming directly)
}
```

**Step 3: Update renderArchiveCards and renderHorizonCards similarly**

Replace all `getMeetings().filter(m => m.status === 'done')` with `meetingRepo.getDone()`.
Replace all `getMeetings().filter(m => m.status === 'horizon')` with `meetingRepo.getHorizon()`.

**Step 4: Run tests to verify**

```bash
npm test -- tests/dashboard.spec.js
```

Expected: Tests still PASS. If tests fail due to test setup, update test patches to use `window.meetingRepo.load()` instead of directly assigning `window.MEETINGS`.

**Step 5: Run full test suite**

```bash
npm test
```

Expected: All 71 tests PASS.

**Step 6: Commit**

```bash
git add src/04-dashboard.js
git commit -m "refactor: update dashboard to use MeetingRepository instead of getMeetings()"
```

---

### Task 1.4: Replace Global Getter/Setter in Asset Rendering Module

**Files:**
- Modify: `src/03-assets.js:158-182` - buildAssetRows function
- Modify: `src/09-asset-delegation.js` - asset delegation handlers
- Test: Run existing asset tests

**Context:**
`buildAssetRows()` iterates meetings and accesses schema properties directly. Update to accept Meeting instances and use their methods.

**Step 1: Update buildAssetRows signature**

In `src/03-assets.js`, change:

```javascript
// OLD: Receives plain object, accesses properties
function buildAssetRows(meeting) {
  let html = '';
  if (meeting.video && meeting.video.file && ...) {
    html += buildVideoRow(...);
  }
  // ... etc
}
```

To:

```javascript
// NEW: Receives Meeting instance, uses methods
function buildAssetRows(meeting) {
  let html = '';
  if (meeting.hasVideo()) {
    html += buildVideoRow(...);
  }
  // ... use meeting.getAssets() for other assets
}
```

**Step 2: Update all asset row builders to use Meeting methods**

For each row builder (buildVideoRow, buildSlidesRow, buildPodcastRow, buildResourceStrip), extract asset data via `meeting.getAssets()` instead of accessing `meeting.video.file`, etc.

**Step 3: Run tests**

```bash
npm test -- tests/asset-behavior.spec.js
```

Expected: PASS. If tests fail, update test setup to wrap test meetings in Meeting class.

**Step 4: Full test suite**

```bash
npm test
```

Expected: All 71 tests PASS.

**Step 5: Commit**

```bash
git add src/03-assets.js
git commit -m "refactor: update asset rendering to use Meeting methods"
```

---

### Task 1.5: Validate Manifest at Load Time (Not Render Time)

**Files:**
- Create: `src/data-validator.js` - MeetingSchema validator
- Modify: `src/02-manifest.js:36-61` - loadManifest function

**Context:**
Currently `loadManifest()` only checks if `data.meetings` exists. Invalid per-meeting data isn't caught until render, causing confusing test failures. Create a schema validator.

**Step 1: Write failing test**

Create `tests/data-validator.spec.js`:

```javascript
describe('Meeting schema validation', () => {
  test('valid meeting passes validation', () => {
    const valid = {
      id: 'meeting-01',
      title: 'Session 1',
      status: 'done',
      date: '2025-01-15',
      video: { file: 'recordings/meeting-01.mp4', label: 'Video Recap' },
      slides: { file: 'slides/meeting-01.pptx' },
      podcasts: [],
      resources: [],
      color: 'spectrum-1',
      wash: 'wash-1'
    };
    expect(() => validateMeeting(valid)).not.toThrow();
  });

  test('throws if id is missing', () => {
    const invalid = { title: 'Session 1', status: 'done' };
    expect(() => validateMeeting(invalid)).toThrow(/id is required/);
  });

  test('throws if title is missing', () => {
    const invalid = { id: 'meeting-01', status: 'done' };
    expect(() => validateMeeting(invalid)).toThrow(/title is required/);
  });

  test('throws if status is invalid', () => {
    const invalid = { id: 'meeting-01', title: 'Session 1', status: 'invalid' };
    expect(() => validateMeeting(invalid)).toThrow(/status must be/);
  });

  test('throws if video.file exists but is not a string', () => {
    const invalid = {
      id: 'meeting-01',
      title: 'Session 1',
      status: 'done',
      video: { file: 123 }
    };
    expect(() => validateMeeting(invalid)).toThrow(/video\.file must be a string/);
  });

  test('validateArray() validates all meetings', () => {
    const valid = [
      { id: 'meeting-01', title: 'Session 1', status: 'done' },
      { id: 'meeting-02', title: 'Session 2', status: 'upcoming' }
    ];
    expect(() => validateMeetingArray(valid)).not.toThrow();
  });

  test('validateArray() throws on first invalid meeting', () => {
    const invalid = [
      { id: 'meeting-01', title: 'Session 1', status: 'done' },
      { id: 'meeting-02', status: 'invalid' }
    ];
    expect(() => validateMeetingArray(invalid)).toThrow(/meeting-02/);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- tests/data-validator.spec.js
```

Expected: FAIL - "validateMeeting is not defined".

**Step 3: Write validator implementation**

Create `src/data-validator.js`:

```javascript
function validateMeeting(meeting) {
  if (!meeting.id || typeof meeting.id !== 'string') {
    throw new Error(`Meeting id is required and must be a string`);
  }
  if (!meeting.title || typeof meeting.title !== 'string') {
    throw new Error(`Meeting ${meeting.id}: title is required and must be a string`);
  }
  if (!['done', 'upcoming', 'horizon'].includes(meeting.status)) {
    throw new Error(`Meeting ${meeting.id}: status must be 'done', 'upcoming', or 'horizon', got '${meeting.status}'`);
  }
  if (meeting.video && meeting.video.file && typeof meeting.video.file !== 'string') {
    throw new Error(`Meeting ${meeting.id}: video.file must be a string`);
  }
  if (meeting.slides && meeting.slides.file && typeof meeting.slides.file !== 'string') {
    throw new Error(`Meeting ${meeting.id}: slides.file must be a string`);
  }
  if (meeting.podcasts && !Array.isArray(meeting.podcasts)) {
    throw new Error(`Meeting ${meeting.id}: podcasts must be an array`);
  }
  if (meeting.resources && !Array.isArray(meeting.resources)) {
    throw new Error(`Meeting ${meeting.id}: resources must be an array`);
  }
}

function validateMeetingArray(meetings) {
  if (!Array.isArray(meetings)) {
    throw new Error('Meetings must be an array');
  }
  meetings.forEach(validateMeeting);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { validateMeeting, validateMeetingArray };
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- tests/data-validator.spec.js
```

Expected: All tests PASS.

**Step 5: Update loadManifest to validate on load**

In `src/02-manifest.js`, update the `loadManifest()` function:

```javascript
async function loadManifest(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    
    if (!data.meetings || !Array.isArray(data.meetings)) {
      throw new Error('Manifest missing meetings array');
    }
    
    // NEW: Validate all meetings at load time
    validateMeetingArray(data.meetings);
    
    setMeetings(data.meetings);
    // ... rest of function
  } catch (error) {
    // ... error handling
  }
}
```

**Step 6: Run full test suite**

```bash
npm test
```

Expected: All 71 tests PASS.

**Step 7: Commit**

```bash
git add src/data-validator.js tests/data-validator.spec.js src/02-manifest.js
git commit -m "feat: validate Meeting schema at manifest load time"
```

---

### Task 1.6: Mini-Audit: Verify No Direct Global Access Outside Repository

**Context:**
After all Phase 1 changes, verify that MEETINGS and ASSET_COPY are only accessed via repository methods.

**Step 1: Search for direct global access**

```bash
grep -rn "getMeetings\|setMeetings\|MEETINGS\s*=" src/ --include="*.js" | grep -v "00-setup\|data-repository"
```

Expected: ZERO results (all calls should use `meetingRepo` instead).

**Step 2: Search for direct property access patterns**

```bash
grep -rn "\.status\|\.video\|\.slides\|\.podcasts\|\.resources" src/ --include="*.js" | grep -v "Meeting\|meeting\." | head -10
```

Expected: Results should only show INSIDE Meeting class or within functions that receive Meeting instances.

**Step 3: Verify test setup uses repository**

```bash
grep -n "MEETINGS\s*=" tests/*.spec.js | head -5
```

Expected: If tests still directly assign MEETINGS, update them to use `window.meetingRepo.load()`.

**Step 4: Run full test suite**

```bash
npm test
```

Expected: All 71 tests PASS. If any fail, they indicate direct global access that needs refactoring.

**Step 5: Document resolution**

If issues found, refactor before proceeding to Phase 2. If none found, add checkpoint comment in `src/00-setup.js`:

```javascript
// CHECKPOINT: Phase 1 complete. All global MEETINGS access is now via meetingRepo.
// Direct access to MEETINGS should trigger test failure or linter rule.
```

---

## Phase 2: Rendering Consolidation (Critical)

*(Tasks 2.1-2.5: Create unified MeetingRenderer, consolidate dashboard rendering, extract asset type detection, unify link rewriting, verify consistency)*

[Tasks 2.1-2.5 follow same TDD structure as Phase 1 tasks above]

---

## Phase 3: Error Handling Strategy (Critical)

*(Tasks 3.1-3.5: Define error types, create ErrorHandler module, update try-catch blocks, add error boundaries, verify consistency)*

---

## Phase 4: Module Organization (Major)

*(Tasks 4.1-4.4: Rename modules by concern, update build script, document visibility, verify dependency order)*

---

## Phase 5: Documentation & Guardrails (Major)

*(Tasks 5.1-5.4: Add JSDoc, document guard function, consolidate timeouts in CONFIG, create CSS class constants)*

---

## Execution Summary

**Phase 1:** 6 tasks (~3 hours) - Fixes 3 critical issues (global mutability, information leakage, validation timing)
**Phase 2:** 5 tasks (~2.5 hours) - Fixes 2 major issues (rendering consolidation, information leakage)
**Phase 3:** 5 tasks (~2.5 hours) - Fixes 1 critical + 2 major issues (error consistency, swallowing)
**Phase 4:** 4 tasks (~1.5 hours) - Fixes 2 major issues (module organization, temporal decomposition)
**Phase 5:** 4 tasks (~1.5 hours) - Fixes 8 minor issues + documentation

**Total estimated time:** ~11 hours end-to-end with testing, auditing, and commits.

**Verification checklist after completion:**
- [ ] All 71 tests pass
- [ ] `npm run build:js && npm run build:css` succeeds without warnings
- [ ] No direct MEETINGS/ASSET_COPY access outside repository
- [ ] All Meeting schema validation done at load time
- [ ] All errors use defined error types with consistent handling
- [ ] All modules renamed by concern, no temporal ordering
- [ ] All complex functions have JSDoc with parameter/return types
- [ ] Micro-audits completed for each phase with no regressions

---

## References

**Audit findings:** `/docs/superpowers/audits/2026-05-23-aposd-audit-report.md`

**Key modules:**
- `src/00-setup.js` - Global state (to be refactored)
- `src/03-assets.js` - Asset rendering (consolidation needed)
- `src/04-dashboard.js` - Dashboard rendering (consolidation needed)
- `src/05-reader.js` - Markdown reader (error handling needed)
- `src/02-manifest.js` - Manifest loading (validation needed)

**Tests:**
- `tests/dashboard.spec.js` - Dashboard render tests
- `tests/asset-behavior.spec.js` - Asset rendering tests
- `tests/routing.spec.js` - Router and error handling
- `tests/path-validator.spec.js` - Path validation (working well)

