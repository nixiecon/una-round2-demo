/* ========================================================================
 * PerfectMind → UNA Field Schedule Adapter
 * Forks the pattern from the Drop-In Calendar, which UNA's dev (Kimbo
 * Agency) shipped to production as a custom PHP page template that injects
 * the PerfectMind feed into the page as a global JS array, then renders it
 * client-side. Confirmed by inspecting the live test site on 2026-06-02
 * (https://myunatest.kimboagency.com/drop-in): global var `window.UNA_LIVE_DATA`,
 * no runtime fetch, PerfectMind used only for outbound "Register" links.
 *
 * This adapter consumes that SAME feed shape for the field schedule, so it's
 * a clean drop-in for the PHP layer: the template assigns the field feed to
 * `window.UNA_FIELD_LIVE_DATA` (parallel to the drop-in's `UNA_LIVE_DATA`,
 * or PHP can point both at one feed) and field-calendar.js renders it.
 *
 * Usage:
 *   const fieldData = window.PerfectMindFieldAdapter.transform(window.UNA_FIELD_LIVE_DATA);
 *   // → { bookings: [...], orgColors: {...}, operatingHours, vsb }
 *
 * CONFIRMED PerfectMind feed fields (per-session object, live 2026-06-02):
 *   Subject, CourseID, ExactTime, EndTime, Description, LocationName,
 *   InstructorName, Capacity, Remaining, ID, CalendarName, MinimumAge,
 *   MaximumAge, CalendarCategory, SportDropIn, FamilySportsDropIn,
 *   RegisteredSports, ProgramswithDropInOptions, SocialProgramDropIn,
 *   ProgramDate
 *
 * Field → output mapping:
 *   Subject       → org        (display name / renting org — see TODO below)
 *   CourseID, ID  → id
 *   ExactTime     → startISO   (full start datetime; ProgramDate is fallback)
 *   EndTime       → endISO     (full datetime OR time-only — handled below)
 *   Description   → notes
 *   LocationName  → location   (passthrough)
 *   CalendarName  → field      (passthrough — which field/facility)
 *   CalendarCategory → category(passthrough)
 *   Capacity      → capacity   (passthrough)
 *   Remaining     → remaining  (passthrough)
 *
 * TODO(Glenda/Tim): The confirmed shape above is from the drop-in *program*
 * feed. Field RENTALS may populate the renting org in `Subject` (most likely)
 * or in a different field. Confirm which field carries the org/team name for
 * field bookings, then adjust the `org` source + ORG_KEY_LOOKUP keys.
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

  // ExactTime: "2026-04-07 09:25AM" / "2026-04-07 09:25 AM".
  // Also accepts a bare ProgramDate ("2026-04-07") as a date-only fallback.
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

  // EndTime in the real feed may be a full datetime ("2026-04-07 01:00PM")
  // OR time-only ("1:00PM"). Try a full parse first, then fall back to
  // time-only combined with the start date.
  function parseEndTime(endTimeStr, startDate) {
    if (!endTimeStr) return null;
    if (/\d{4}-\d{2}-\d{2}/.test(endTimeStr)) {
      var full = parseExactTime(endTimeStr);
      if (full) return full;
    }
    if (!startDate) return null;
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
      // ExactTime is the full start datetime; ProgramDate is a date-only fallback.
      const startDate = parseExactTime(raw.ExactTime) || parseExactTime(raw.ProgramDate);
      if (!startDate) return null;
      const endDate = parseEndTime(raw.EndTime, startDate);
      if (!endDate) return null;

      // TODO(Glenda/Tim): confirm the renting-org field for field rentals.
      // Subject is the program/booking title in the drop-in feed.
      const org = String(raw.Subject || '').trim();

      return {
        id:        String(raw.CourseID || raw.ID || ''),
        org:       org,
        orgKey:    deriveOrgKey(org),
        startISO:  toLocalISO(startDate),
        endISO:    toLocalISO(endDate),
        notes:     String(raw.Description || '').trim() || undefined,
        // Passthroughs from the real feed (renderer may surface these later).
        location:  String(raw.LocationName || '').trim() || undefined,
        field:     String(raw.CalendarName || '').trim() || undefined,
        category:  String(raw.CalendarCategory || '').trim() || undefined,
        capacity:  (raw.Capacity != null) ? Number(raw.Capacity) : undefined,
        remaining: (raw.Remaining != null) ? Number(raw.Remaining) : undefined,
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
