/* Sample data — matches the UNA Field Schedule PDF for May 10–17, 2026.
 * The renderer offsets these to the currently displayed week.
 * VSB and Community Play Time are rendered as logic overlays by field-calendar.js.
 */
window.UNA_FIELD_SAMPLE_DATA = {
  bookings: [
    // Sun May 10
    { id: "1001", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-10T09:00", endISO: "2026-05-10T14:00" },
    { id: "1002", org: "UBC Metropolitan FC", orgKey: "ubcmet",
      startISO: "2026-05-10T19:30", endISO: "2026-05-10T21:00" },

    // Mon May 11 (VSB 9–6 auto)
    { id: "1101", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-11T18:00", endISO: "2026-05-11T19:30" },
    { id: "1102", org: "VL-BE FC", orgKey: "vlbe",
      startISO: "2026-05-11T19:30", endISO: "2026-05-11T21:30" },

    // Tue May 12 (VSB 9–6 auto)
    { id: "1201", org: "UNA Flag Football", orgKey: "una",
      startISO: "2026-05-12T18:00", endISO: "2026-05-12T19:30" },
    { id: "1202", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-12T19:30", endISO: "2026-05-12T21:30" },

    // Wed May 13 (VSB 9–6 auto)
    { id: "1301", org: "Soccer Movement FC", orgKey: "soccermovement",
      startISO: "2026-05-13T18:00", endISO: "2026-05-13T19:00" },
    { id: "1302", org: "UNA Training", orgKey: "una",
      startISO: "2026-05-13T19:00", endISO: "2026-05-13T21:00" },

    // Thu May 14 (VSB 9–6 auto) — VUFC fills entire evening to close
    { id: "1401", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-14T18:00", endISO: "2026-05-14T22:00" },

    // Fri May 15 (VSB 9–6 auto)
    { id: "1501", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-15T18:00", endISO: "2026-05-15T19:30" },

    // Sat May 16 — VUFC all day
    { id: "1601", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-16T09:00", endISO: "2026-05-16T18:00" },

    // Sun May 17 — same as Sun 10
    { id: "1701", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-17T09:00", endISO: "2026-05-17T14:00" },
    { id: "1702", org: "UBC Metropolitan FC", orgKey: "ubcmet",
      startISO: "2026-05-17T19:30", endISO: "2026-05-17T21:00" },
  ],

  orgColors: {
    "una":             "#2E8B7A",
    "vufc":            "#00407A",
    "ubcmet":          "#0B1F3A",
    "vlbe":            "#8C8C8C",
    "soccermovement":  "#48B8D0",
  },

  operatingHours: { start: "09:00", end: "22:00" },

  vsb: {
    days:        [1, 2, 3, 4, 5],
    timeStart:   "09:00",
    timeEnd:     "18:00",
    schoolYear: { startMonth: 9, startDay: 1, endMonth: 6, endDay: 30 },
  },
};
