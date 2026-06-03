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
 *   // → { bookings: [...], orgShades: {...}, operatingHours, vsb }
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
 * NOTE(Glenda/Tim): Colors are now auto-generated per unique org, so the
 * palette no longer depends on confirming anything in advance. The only open
 * question is the on-block LABEL: field RENTALS may carry the renting-org name
 * in `Subject` (most likely) or another field. If labels read wrong, point the
 * `org` source (in transform below) at the correct field — no color changes.
 * ====================================================================== */

(function () {
  'use strict';

  // ----- Org normalization (no hardcoded org list) -----
  // Every distinct org name becomes its own stable key; colors are generated,
  // not mapped. Adding a new renting org needs zero code changes.
  function deriveOrgKey(rawOrg) {
    if (!rawOrg) return 'other';
    const slug = String(rawOrg).toLowerCase().trim()
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/ /g, '_');
    return slug || 'other';
  }

  // ----- Auto-assigned teal shades -----
  // Each unique org gets its own shade of teal, spread evenly across a
  // readable band so they stay distinct and white block-text stays legible.
  // Deterministic (same orgs → same shades, no flicker between renders) rather
  // than truly random, so two orgs can't collide onto an identical color.
  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = function (n) {
      const k = (n + h / 30) % 12;
      const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      return Math.round(255 * c).toString(16).padStart(2, '0');
    };
    return '#' + f(0) + f(8) + f(4);
  }

  function buildOrgShades(orgKeys) {
    const keys = orgKeys.slice().sort();
    const n = keys.length;
    const shades = {};
    keys.forEach(function (key, i) {
      const t = n > 1 ? i / (n - 1) : 0;        // 0..1 across the org set
      const hue   = 168 + Math.round(t * 8);     // 168..176, stays teal
      const sat   = 46  - Math.round(t * 8);     // 46..38
      const light = 24  + Math.round(t * 28);    // 24..52, dark→mid teal
      shades[key] = hslToHex(hue, sat, light);
    });
    return shades;
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
      return { bookings: [], orgShades: {} };
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

    // Collect every distinct org and auto-assign a teal shade to each.
    const uniqueKeys = [];
    bookings.forEach(function (b) {
      if (b.orgKey && uniqueKeys.indexOf(b.orgKey) === -1) uniqueKeys.push(b.orgKey);
    });

    return {
      bookings: bookings,
      orgShades: buildOrgShades(uniqueKeys),
      bookedColor:        "#3B7267",
      vsbColor:           "#B2E8D4",
      communityPlayColor: "#44BC9B",
      availableColor:     "#F5E06B",
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
    _buildOrgShades: buildOrgShades,
    _parseExactTime: parseExactTime,
    _parseEndTime: parseEndTime,
  };

})();
