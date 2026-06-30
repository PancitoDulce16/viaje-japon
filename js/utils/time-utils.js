/**
 * Time Utilities Module
 *
 * Consolidated time-related utility functions used across the application.
 * This eliminates code duplication and ensures consistent time handling.
 *
 * Usage:
 *   import { TimeUtils } from './time-utils.js';
 *   const minutes = TimeUtils.parseTime("14:30");
 *   const timeStr = TimeUtils.formatTime(870);
 */

const TimeUtils = {
  /**
   * Parses a time string and converts it to minutes since midnight
   * @param {string} timeStr - Time string in formats: "14:30", "2:30pm", "9am", etc.
   * @returns {number} Minutes since midnight (e.g., "14:30" returns 870)
   *
   * Examples:
   *   parseTime("09:00") => 540
   *   parseTime("2:30pm") => 870
   *   parseTime("12am") => 0
   *   parseTime("invalid") => 0
   */
  parseTime(timeStr) {
    if (!timeStr) return 0;

    // Clean the time string
    const cleaned = timeStr.trim().toLowerCase();

    // Extract hours and minutes
    const match = cleaned.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/);
    if (!match) return 0;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2] || 0);
    const period = match[3];

    // Validate parsed numbers
    if (isNaN(hours) || isNaN(minutes)) {
      console.warn(`⚠️ TimeUtils: Invalid time format "${timeStr}", using default 09:00`);
      return 540; // 09:00
    }

    // Convert to 24h format if PM/AM
    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  },

  /**
   * Converts minutes since midnight to time string in 24h format
   * @param {number} minutes - Minutes since midnight
   * @returns {string} Time string in HH:MM format (e.g., "14:30")
   *
   * Examples:
   *   formatTime(540) => "09:00"
   *   formatTime(870) => "14:30"
   *   formatTime(NaN) => "09:00" (with warning)
   */
  formatTime(minutes) {
    // Validate that minutes is a valid number
    if (!isFinite(minutes) || isNaN(minutes)) {
      console.warn(`⚠️ TimeUtils: Invalid minutes value ${minutes}, using default 09:00`);
      minutes = 9 * 60;
    }

    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  },

  /**
   * Calculates the standard deviation of an array of numbers
   * Used for analyzing time distribution and balancing activities
   * @param {number[]} values - Array of numeric values
   * @returns {number} Standard deviation
   *
   * Example:
   *   calculateStandardDeviation([10, 20, 30]) => 8.165
   */
  calculateStandardDeviation(values) {
    if (!values || values.length === 0) return 0;

    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
    const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
    return Math.sqrt(variance);
  },

  /**
   * Adds minutes to a time value, handling midnight wrap-around
   * @param {number} startMinutes - Starting time in minutes since midnight
   * @param {number} durationMinutes - Duration to add
   * @returns {number} Resulting time in minutes since midnight
   *
   * Example:
   *   addMinutes(1380, 120) => 1500  // 23:00 + 2h = 25:00 (next day)
   */
  addMinutes(startMinutes, durationMinutes) {
    return startMinutes + durationMinutes;
  },

  /**
   * Checks if a time falls within a given range
   * @param {number} time - Time in minutes since midnight
   * @param {number} rangeStart - Range start in minutes
   * @param {number} rangeEnd - Range end in minutes
   * @returns {boolean} True if time is within range
   *
   * Example:
   *   isTimeInRange(600, 540, 720) => true  // 10:00 is between 09:00-12:00
   */
  isTimeInRange(time, rangeStart, rangeEnd) {
    return time >= rangeStart && time <= rangeEnd;
  },

  /**
   * Formats a duration in minutes to human-readable format
   * @param {number} minutes - Duration in minutes
   * @returns {string} Formatted duration (e.g., "2h 30m", "45m")
   *
   * Examples:
   *   formatDuration(150) => "2h 30m"
   *   formatDuration(45) => "45m"
   *   formatDuration(120) => "2h"
   */
  formatDuration(minutes) {
    if (!isFinite(minutes) || isNaN(minutes) || minutes < 0) {
      return "0m";
    }

    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  },

  /**
   * Parses a duration string to minutes
   * @param {string} durationStr - Duration string (e.g., "2h", "30m", "1h 30m")
   * @returns {number} Duration in minutes
   *
   * Examples:
   *   parseDuration("2h 30m") => 150
   *   parseDuration("45m") => 45
   *   parseDuration("1h") => 60
   */
  parseDuration(durationStr) {
    if (!durationStr) return 0;

    const cleaned = durationStr.trim().toLowerCase();
    let totalMinutes = 0;

    // Match hours
    const hoursMatch = cleaned.match(/(\d+)\s*h/);
    if (hoursMatch) {
      totalMinutes += parseInt(hoursMatch[1]) * 60;
    }

    // Match minutes
    const minutesMatch = cleaned.match(/(\d+)\s*m/);
    if (minutesMatch) {
      totalMinutes += parseInt(minutesMatch[1]);
    }

    return totalMinutes;
  },

  /**
   * Gets the current time in minutes since midnight
   * @returns {number} Current time in minutes
   *
   * Example:
   *   getCurrentTimeInMinutes() => 870 (if it's 14:30)
   */
  getCurrentTimeInMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TimeUtils };
}

// Make available globally for non-module scripts
if (typeof window !== 'undefined') {
  window.TimeUtils = TimeUtils;
}
