/* Sample data for the UNA Community Field Schedule prototype.
 *
 * Each booking has:
 *   id          — unique string (PerfectMind booking ID once wired up)
 *   org         — name of the renting organization
 *   orgKey      — short key for color mapping (matches styles.css token)
 *   startISO    — local datetime in "YYYY-MM-DDTHH:MM" 24h
 *   endISO      — local datetime in "YYYY-MM-DDTHH:MM" 24h
 *   notes       — optional ("Memorial Tournament", etc.)
 *
 * Data anchored to the week of Sun Apr 26 – Sun May 3, 2026 to mirror
 * the screenshot Glenda shared. The renderer offsets to the displayed
 * week so it always shows something on whatever week the user is in.
 *
 * VSB and Community Play Time are NOT in this data — they're rendered
 * as logic overlays by field-calendar.js.
 */
window.UNA_FIELD_SAMPLE_DATA = {
  bookings: [
    // Sat Apr 25 — Memorial Tournament + VUFC
    { id: "1001", org: "Memorial Tournament", orgKey: "memorial",
      startISO: "2026-04-25T09:00", endISO: "2026-04-25T14:00" },
    { id: "1002", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-04-25T14:00", endISO: "2026-04-25T18:00" },
    { id: "1003", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-04-25T18:00", endISO: "2026-04-25T20:00" },

    // Sun Apr 26 — Vancouver United, Community Play, UBC Met
    { id: "1101", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-04-26T10:00", endISO: "2026-04-26T14:00" },
    { id: "1102", org: "UBC Metropolitan FC", orgKey: "ubcmet",
      startISO: "2026-04-26T19:30", endISO: "2026-04-26T20:30" },

    // Mon Apr 27 — VUFC evening, VL-BE FC late
    { id: "1201", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-04-27T18:00", endISO: "2026-04-27T19:30" },
    { id: "1202", org: "VL-BE FC", orgKey: "vlbe",
      startISO: "2026-04-27T20:00", endISO: "2026-04-27T21:30" },

    // Tue Apr 28 — UNA Flag Football, then VUFC
    { id: "1301", org: "UNA Flag Football", orgKey: "una",
      startISO: "2026-04-28T18:00", endISO: "2026-04-28T19:30" },
    { id: "1302", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-04-28T19:30", endISO: "2026-04-28T21:30" },

    // Wed Apr 29 — Soccer Movement + UNA Training
    { id: "1401", org: "Soccer Movement FC", orgKey: "soccermovement",
      startISO: "2026-04-29T18:00", endISO: "2026-04-29T19:00" },
    { id: "1402", org: "UNA Training", orgKey: "una",
      startISO: "2026-04-29T19:00", endISO: "2026-04-29T21:00" },

    // Thu Apr 30 — VUFC evening (single long block)
    { id: "1501", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-04-30T18:00", endISO: "2026-04-30T21:30" },

    // Fri May 1 — VUFC
    { id: "1601", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-01T18:30", endISO: "2026-05-01T20:30" },

    // Sat May 2 — VUFC all-day-ish
    { id: "1701", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-02T13:00", endISO: "2026-05-02T20:00" },

    // Sun May 3 — VUFC + Community Play + UBC Met
    { id: "1801", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-03T10:00", endISO: "2026-05-03T14:00" },
    { id: "1802", org: "UBC Metropolitan FC", orgKey: "ubcmet",
      startISO: "2026-05-03T19:30", endISO: "2026-05-03T20:30" },
  ],

  // Simplified color scheme — availability-focused.
  // All booked slots use one "booked" color regardless of org.
  // The calendar shows WHEN the field is available, not WHO booked it.
  bookedColor:        "#3B7267",   // UNA green — all bookings
  vsbColor:           "#69C0E5",   // light blue — VSB school-day block
  communityPlayColor: "#44BC9B",   // bright green — Community Play Time
  availableColor:     "#E0F5ED",   // pale green — Booking Available slots

  // Operating hours for the field (used for Community Play overlay)
  operatingHours: { start: "09:00", end: "22:00" },

  // VSB exclusive-use rule
  vsb: {
    days:        [1, 2, 3, 4, 5],   // Mon–Fri
    timeStart:   "07:00",
    timeEnd:     "18:00",
    schoolYear: { startMonth: 9, startDay: 1, endMonth: 6, endDay: 30 },
  },
};
