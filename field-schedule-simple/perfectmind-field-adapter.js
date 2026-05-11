/* ========================================================================
 * PerfectMind → UNA Field Schedule Adapter
 * Forks the pattern from
 * Projects/UNA Drop-In Calendar/perfectmind-adapter.js
 * but is mapped to the field-booking schema (org rentals, not classes).
 *
 * Usage:
 *   const fieldData = window.PerfectMindFieldAdapter.transform(rawEvents);
 *   // returns { bookings: [...], orgColors: {...}, operatingHours, vsb }
 *
 * Input shape (PerfectMind PHP array, same shape as drop-in feed):
 *   { Subject, CourseID, ExactTime, EndTime, LocationName, ... }
 *
 * Output shape (field-calendar.js schema):
 *   { id, org, orgKey, startISO, endISO, notes }
 * ====================================================================== */

(function () {
  'use strict';

  // ----- Org normalization -----
  // Map known org names to their colorKey. Add Glenda's confirmed mapping
  // here once she signs off on the palette.
  const ORG_KEY_LOOKUP = {
    'una':                  'una',
    'una flag football':    'una',
    'una training':         'una',
    'vancouver school board': 'vsb',
    'vsb':                  'vsb',
    'vancouver united fc':  'vufc',
    'vancouver united':     'vufc',
    'ubc metropolitan fc':  'ubcmet',
    'ubc metropolitan':     'ubcmet',
    'vl-be fc':             'vlbe',
    'vl-be':                'vlbe',
    'soccer movement fc':   'soccermovement',
    'soccer movement':      'soccermovement',
    'memorial tournament':  'memorial',
  };

  // Default placeholder palette. Glenda picks the final colors.
  const DEFAULT_ORG_COLORS = {
    "una":             "#3B7267",
    "vsb":             "#69C0E5",
    "vufc":            "#015990",
    "ubcmet":          "#0A2B3F",
    "vlbe":            "#9C9C9C",
    "soccermovement":  "#B3B3B3",
    "memorial":        "#1A1A1A",
    "communityPlay":   "#44BC9B",
  };

  function deriveOrgKey(rawOrg) {
    if (!rawOrg) return 'other';
    const norm = String(rawOrg).toLowerCase().trim()
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (ORG_KEY_LOOKUP[norm]) return ORG_KEY_LOOKUP[norm];
    // Fallback: hash to a stable key based on first letters
    return 'org_' + norm.replace(/\s+/g, '_').substring(0, 16);
  }

  // ----- Time parsing -----

  // ExactTime: "2026-04-07 09:25AM" or "2026-04-07 09:25 AM"
  function parseExactTime(exactTime) {
    if (!exactTime) return null;
    var d = new Date(exactTime);
    if (!isNaN(d.getTime())) return d;
    var match = exactTime.match(
      /(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i
    );
    if (!match) return null;
    var y = +match[1], m = +match[2] - 1, dd = +match[3];
    var h = +match[4], mn = +match[5], ap = match[6].toUpperCase();
    if (ap === 'PM' && h < 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return new Date(y, m, dd, h, mn);
  }

  // EndTime: "1:00PM" — combined with the start date
  function parseEndTime(endTimeStr, startDate) {
    if (!endTimeStr || !startDate) return null;
    var match = endTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return null;
    var h = +match[1], mn = +match[2], ap = match[3].toUpperCase();
    if (ap === 'PM' && h < 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return new Date(
      startDate.getFullYear(), startDate.getMonth(), startDate.getDate(),
      h, mn
    );
  }

  function toLocalISO(d) {
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' +
           pad(d.getMonth() + 1) + '-' +
           pad(d.getDate()) + 'T' +
           pad(d.getHours()) + ':' +
           pad(d.getMinutes());
  }

  // ----- Main transform -----

  function transform(rawEvents) {
    if (!Array.isArray(rawEvents)) {
      return { bookings: [], orgColors: DEFAULT_ORG_COLORS };
    }

    const bookings = rawEvents.map(function (raw) {
      const startDate = parseExactTime(raw.ExactTime);
      if (!startDate) return null;
      const endDate = parseEndTime(raw.EndTime, startDate);
      if (!endDate) return null;
      const org = String(raw.Subject || '').trim();

      return {
        id:       String(raw.CourseID || raw.ID || ''),
        org:      org,
        orgKey:   deriveOrgKey(org),
        startISO: toLocalISO(startDate),
        endISO:   toLocalISO(endDate),
        notes:    String(raw.Notes || raw.Description || '').trim() || undefined,
      };
    }).filter(function (b) { return b !== null; });

    return {
      bookings: bookings,
      orgColors: DEFAULT_ORG_COLORS,
      operatingHours: { start: "09:00", end: "22:00" },
      vsb: {
        days: [1, 2, 3, 4, 5],
        timeStart: "07:00",
        timeEnd: "18:00",
        schoolYear: { startMonth: 9, startDay: 1, endMonth: 6, endDay: 30 },
      },
    };
  }

  // ----- Export -----

  window.PerfectMindFieldAdapter = {
    transform: transform,
    _deriveOrgKey: deriveOrgKey,
    _parseExactTime: parseExactTime,
    _parseEndTime: parseEndTime,
  };

})();
