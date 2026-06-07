/**
 * Repository for meeting data: owns the in-memory meeting collection,
 * loads it from inline or fetched manifest data, and exposes find queries.
 *
 * Public API:
 * - MeetingRepository.setAll(plainMeetings): validates and wraps the input
 * - MeetingRepository.find(criteria): queries meetings by status or id
 * - loadRepository(): resolves inline or fetched manifest, populates the singleton
 * - findMeetings(criteria): queries the loaded repository (singleton proxy)
 *
 * Side-effects: populates the meeting repo singleton and the asset copy registry
 * when loadRepository runs.
 */
(function() {
'use strict';

let _repo = null;

class MeetingRepository {
  /**
   * Validates and stores plain meeting manifest entries, wrapping each in a Meeting instance.
   * @param {object[]} plainMeetings - Array of raw meeting objects from the manifest
   */
  setAll(plainMeetings) {
    if (!Array.isArray(plainMeetings)) throw new Error('MeetingRepository.setAll requires an array');
    this.meetings = plainMeetings.map(m => new window.Meeting(m));
  }

  /**
   * Queries meetings by criteria. Returns an array of matching meetings, a single meeting
   * by id, or an empty array when no matches exist.
   * @param {object} criteria
   * @param {string} [criteria.id] - return the meeting with this id (or null)
   * @param {string} [criteria.status] - return all meetings with this status
   * @returns {object[]|object|null}
   */
  find(criteria) {
    if (criteria?.id) {
      return this.meetings.find(m => m.id === criteria.id) || null;
    }
    if (criteria?.status) {
      return this.meetings.filter(m => m.status === criteria.status);
    }
    return [...this.meetings];
  }
}

/** Queries the loaded repository. Returns empty array when the repository is not loaded. */
function findMeetings(criteria) {
  return _repo ? _repo.find(criteria) : (criteria?.id ? null : []);
}

/**
 * Loads the meeting manifest: resolves inline data (__MANIFEST_DATA) or
 * fetches docs/manifest.json with an 8s timeout. Returns the populated repository.
 * @returns {Promise<MeetingRepository>}
 */
async function loadRepository() {
  const inlineData = window.__MANIFEST_DATA;
  let manifestData = inlineData;
  if (!manifestData) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('docs/manifest.json', { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      manifestData = await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }
  if (!manifestData.meetings || !Array.isArray(manifestData.meetings)) {
    throw new Error('Invalid manifest structure');
  }
  _repo = new MeetingRepository();
  _repo.setAll(manifestData.meetings);
  window.loadAssetCopyRegistry?.(manifestData.assetCopy);
  return _repo;
}

window.MeetingRepository = MeetingRepository;
window.findMeetings = findMeetings;
window.loadRepository = loadRepository;
})();
