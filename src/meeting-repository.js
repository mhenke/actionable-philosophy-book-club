/**
 * Repository for meeting data: owns the in-memory meeting collection
 * and exposes find queries.
 *
 * Public API:
 * - MeetingRepository.setAll(plainMeetings): validates, wraps, and stores meetings
 * - MeetingRepository.find(criteria): queries meetings by status or id
 * - findMeetings(criteria): singleton proxy function
 *
 * Side-effects: populates the internal singleton used by findMeetings.
 */
(function() {
'use strict';

let _repo = null;

class MeetingRepository {
  /**
   * Validates and stores plain meeting manifest entries, wrapping each in a Meeting instance.
   * Creates the internal singleton on first call (subsequent calls replace the data).
   * @param {object[]} plainMeetings - Array of raw meeting objects from the manifest
   */
  static setAll(plainMeetings) {
    if (!Array.isArray(plainMeetings)) throw new Error('MeetingRepository.setAll requires an array');
    if (!_repo) _repo = new MeetingRepository();
    _repo.meetings = plainMeetings.map(m => new window.Meeting(m));
  }

  /**
   * Queries meetings by criteria. Returns an array of matching meetings, a single meeting
   * by id, or an empty array when no matches exist.
   * @param {object} criteria
   * @param {string} [criteria.id] - return the meeting with this id (or null)
   * @param {string} [criteria.status] - return all meetings with this status
   * @returns {object[]|object|null}
   */
  static find(criteria) {
    if (!_repo) return criteria?.id ? null : [];
    if (criteria?.id) {
      return _repo.meetings.find(m => m.id === criteria.id) || null;
    }
    if (criteria?.status) {
      return _repo.meetings.filter(m => m.status === criteria.status);
    }
    return [..._repo.meetings];
  }
}

/** Queries the loaded repository. Returns empty array when the repository is not loaded. */
function findMeetings(criteria) {
  return MeetingRepository.find(criteria);
}

window.MeetingRepository = MeetingRepository;
window.findMeetings = findMeetings;
})();
