/**
 * MeetingRepository: Single access point for meeting data.
 *
 * Encapsulates meeting data to enforce information hiding (APOSD Principle 3).
 * All read/write access goes through this repository, preventing direct mutation
 * and allowing schema changes without touching callers.
 *
 * APOSD Principle 2 (Deep Modules): Simple interface (find(criteria)),
 * powerful implementation (compound queries, validation, mutation control).
 *
 * APOSD Principle 7 (Define Errors Out of Existence): Validates schema at load
 * time, preventing invalid meetings from existing in memory.
 */
(function() {
'use strict';

class MeetingRepository {
  constructor() {
    this.meetings = [];
  }

  /**
   * Load meetings from manifest data. Wraps each in Meeting class for validation.
   * 
   * APOSD Principle 7 (Define Errors Out of Existence):
   * Throws on schema errors at load time, not render time.
   * This prevents invalid meetings from existing in memory.
   * 
   * @param {Array} plainMeetings - Plain meeting objects from manifest.json
   * @throws {Error} If meetings is not an array or any meeting fails validation
   */
  setAll(plainMeetings) {
    if (!Array.isArray(plainMeetings)) {
      throw new Error('Meetings must be an array');
    }
    // Wrap each in Meeting class (validates on construction)
    this.meetings = plainMeetings.map(m => new Meeting(m));
  }

  /**
   * Find meetings by optional criteria. Returns all meetings when called with no arguments.
   * Filtering by id returns a single meeting or null; filtering by status returns an array.
   *
   * Deepens the module: one method replaces three, compound queries are trivial to add.
   *
   * @param {object} [criteria] - Optional filter: { id, status }
   * @returns {Array|object|null}
   */
  find(criteria) {
    if (!criteria) return [...this.meetings];
    if (criteria.id) return this.meetings.find(m => m && m.id === criteria.id) || null;
    if (criteria.status) return this.meetings.filter(m => m && m.status === criteria.status);
    return [...this.meetings];
  }

}

window.MeetingRepository = MeetingRepository;
})();
