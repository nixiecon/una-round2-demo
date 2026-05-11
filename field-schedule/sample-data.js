/* Sample data — from UNA Field Schedule Excel for May 10–17, 2026.
 * The renderer offsets these to the currently displayed week.
 * VSB and Community Play Time are rendered as logic overlays by field-calendar.js.
 */
window.UNA_FIELD_SAMPLE_DATA = {
  bookings: [
    // Sun May 10 — VUFC 9am–2pm, UBC Met 7:30–9pm
    { id: "1001", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-10T09:00", endISO: "2026-05-10T14:00" },
    { id: "1002", org: "UBC Metropolitan FC", orgKey: "ubcmet",
      startISO: "2026-05-10T19:30", endISO: "2026-05-10T21:00" },

    // Mon May 11 — VUFC 5:30–8pm, VL-BE 8–10pm
    { id: "1101", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-11T17:30", endISO: "2026-05-11T20:00" },
    { id: "1102", org: "VL-BE FC", orgKey: "vlbe",
      startISO: "2026-05-11T20:00", endISO: "2026-05-11T22:00" },

    // Tue May 12 — Flag Football 6–7:30pm, VUFC 7:30–10pm
    { id: "1201", org: "UNA Flag Football", orgKey: "una",
      startISO: "2026-05-12T18:00", endISO: "2026-05-12T19:30" },
    { id: "1202", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-12T19:30", endISO: "2026-05-12T22:00" },

    // Wed May 13 — Soccer Movement 6–7pm, UNA Training 7–9pm
    { id: "1301", org: "Soccer Movement FC", orgKey: "soccermovement",
      startISO: "2026-05-13T18:00", endISO: "2026-05-13T19:00" },
    { id: "1302", org: "UNA Training", orgKey: "una",
      startISO: "2026-05-13T19:00", endISO: "2026-05-13T21:00" },

    // Thu May 14 — VUFC 5:30–10pm
    { id: "1401", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-14T17:30", endISO: "2026-05-14T22:00" },

    // Fri May 15 — VUFC 5:30–8pm
    { id: "1501", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-15T17:30", endISO: "2026-05-15T20:00" },

    // Sat May 16 — VUFC 10am–8pm
    { id: "1601", org: "Vancouver United FC", orgKey: "vufc",
      startISO: "2026-05-16T10:00", endISO: "2026-05-16T20:00" },

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
    timeEnd:     "17:30",
    schoolYear: { startMonth: 9, startDay: 1, endMonth: 6, endDay: 30 },
  },
};
