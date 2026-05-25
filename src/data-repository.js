/**
 * MeetingRepository: Single access point for meeting data.
 *
 * Encapsulates meeting data to enforce information hiding (APOSD Principle 3).
 * All read/write access goes through this repository, preventing direct mutation
 * and allowing schema changes without touching callers.
 *
 * APOSD Principle 2 (Deep Modules): Simple interface (getAll, getById, getByStatus),
 * powerful implementation (validation, mutation control).
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
   * Get all meetings, ordered as stored.
   * @returns {Array} All meetings
   */
  getAll() {
    return [...this.meetings];
  }

  /**
   * Find meeting by ID.
   * @param {string} id - Meeting ID (e.g., 'meeting-01')
   * @returns {Object|null} Meeting object or null if not found
   */
  getMeetingById(id) {
    return this.meetings.find(m => m && m.id === id) || null;
  }

  /**
   * Get meetings by status.
   * @param {string} status - One of 'done', 'upcoming', 'draft'
   * @returns {Array} Meetings matching the given status
   */
  getByStatus(status) {
    return this.meetings.filter(m => m && m.status === status);
  }

}

window.MeetingRepository = MeetingRepository;
})();
