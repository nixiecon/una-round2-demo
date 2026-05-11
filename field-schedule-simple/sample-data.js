/* Sample data for the UNA Community Field Schedule prototype (simplified).
 *
 * Matches the UNA Field Schedule PDF for May 10–17, 2026.
 * The renderer offsets these to the currently displayed week
 * so the demo always has content regardless of when it's viewed.
 *
 * VSB and Community Play Time are NOT in this data — they're rendered
 * as logic overlays by field-calendar.js.
 */
window.UNA_FIELD_SAMPLE_DATA = {
  bookings: [
    // Sun May 10 — VUFC morning, UBC Met evening
    { id: "1001", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-10T09:00", endISO: "2026-05-10T12:00" },
    { id: "1002", org: "UBC Metropolitan FC", orgKey: "ubcmet",
      startISO: "2026-05-10T19:30", endISO: "2026-05-10T21:00" },

    // Mon May 11 — VSB daytime (auto), VUFC + VL-BE evening
    { id: "1101", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-11T18:00", endISO: "2026-05-11T19:30" },
    { id: "1102", org: "VL-BE FC", orgKey: "vlbe",
      startISO: "2026-05-11T20:00", endISO: "2026-05-11T21:30" },

    // Tue May 12 — VSB daytime (auto), UNA Flag Football + VUFC evening
    { id: "1201", org: "UNA Flag Football", orgKey: "una",
      startISO: "2026-05-12T18:00", endISO: "2026-05-12T19:30" },
    { id: "1202", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-12T20:00", endISO: "2026-05-12T21:00" },

    // Wed May 13 — VSB daytime (auto), Soccer Movement + UNA Training evening
    { id: "1301", org: "Soccer Movement FC", orgKey: "soccermovement",
      startISO: "2026-05-13T18:00", endISO: "2026-05-13T19:00" },
    { id: "1302", org: "UNA Training", orgKey: "una",
      startISO: "2026-05-13T19:30", endISO: "2026-05-13T21:00" },

    // Thu May 14 — VSB daytime (auto), VUFC long evening block
    { id: "1401", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-14T18:00", endISO: "2026-05-14T21:30" },

    // Fri May 15 — VSB daytime (auto), VUFC evening
    { id: "1501", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-15T18:00", endISO: "2026-05-15T20:30" },

    // Sat May 16 — VUFC afternoon
    { id: "1601", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-16T16:00", endISO: "2026-05-16T18:00" },

    // Sun May 17 — same pattern as Sun 10
    { id: "1701", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-17T09:00", endISO: "2026-05-17T12:00" },
    { id: "1702", org: "UBC Metropolitan FC", orgKey: "ubcmet",
      startISO: "2026-05-17T19:30", endISO: "2026-05-17T21:00" },
  ],

  // Simplified color scheme — availability-focused.
  // All booked slots use one "booked" color regardless of org.
  bookedColor:        "#3B7267",   // UNA green — all bookings
  vsbColor:           "#69C0E5",   // light blue — VSB school-day block
  communityPlayColor: "#44BC9B",   // bright green — Community Play Time
  availableColor:     "#E0F5ED",   // pale green — Booking Available slots

  // Operating hours for the field
  operatingHours: { start: "09:00", end: "22:00" },

  // VSB exclusive-use rule — 9 AM to 6 PM, Mon–Fri during school year
  vsb: {
    days:        [1, 2, 3, 4, 5],   // Mon–Fri
    timeStart:   "09:00",
    timeEnd:     "18:00",
    schoolYear: { startMonth: 9, startDay: 1, endMonth: 6, endDay: 30 },
  },
};
