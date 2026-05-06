/* Sample data for the UNA Events Calendar prototype.
 *
 * Mirrors a reasonable mix of events from myuna.ca/events/ across April–May 2026
 * for offline preview. Replaced at runtime by window.UNA_EVENTS_LIVE_DATA when
 * the WP REST adapter is wired up.
 *
 * Schema:
 *   id          unique string (WP post ID once live)
 *   title       event title
 *   startISO    "YYYY-MM-DDTHH:MM" 24h local
 *   endISO      "YYYY-MM-DDTHH:MM" 24h local
 *   url         link to single event page on myuna.ca
 *   featured    boolean
 *   cost        "Free" / "$2" / "$10" / etc.
 *   venue       string
 *   organizer   string
 *   categories  array of category slugs/labels
 *   excerpt     short blurb
 */
window.UNA_EVENTS_SAMPLE_DATA = {
  events: [
    {
      id: "ev-easter2026",
      title: "Easter at the UNA: Bunny Business",
      startISO: "2026-04-04T09:30",
      endISO:   "2026-04-04T11:30",
      url: "https://www.myuna.ca/event/easter2026",
      featured: false,
      cost: "Free",
      venue: "Old Barn Community Centre",
      organizer: "UNA",
      categories: ["Community", "Featured", "UNA Events"],
      excerpt: "Egg hunts, crafts, and bunny visits for the whole family.",
    },
    {
      id: "ev-baby-toddler-swap",
      title: "Baby and Toddler Clothing Swap",
      startISO: "2026-04-11T12:00",
      endISO:   "2026-04-11T13:30",
      url: "https://www.myuna.ca/event/baby-toddler-swap",
      featured: false,
      cost: "Free",
      venue: "Old Barn Community Centre",
      organizer: "UNA",
      categories: ["Community", "Family"],
      excerpt: "Bring outgrown items, leave with what you need.",
    },
    {
      id: "ev-fmn-april",
      title: "Family Movie Night",
      startISO: "2026-04-11T17:30",
      endISO:   "2026-04-11T20:00",
      url: "https://www.myuna.ca/event/fmn-april",
      featured: false,
      cost: "$2",
      venue: "Old Barn Community Centre",
      organizer: "UNA",
      categories: ["Community", "Family"],
      excerpt: "Family-friendly screening with popcorn.",
    },
    {
      id: "ev-healthy-aging-apr",
      title: "Healthy Aging Seminar Series",
      startISO: "2026-04-16T11:00",
      endISO:   "2026-04-16T12:30",
      url: "https://www.myuna.ca/event/healthy-aging-apr",
      featured: true,
      cost: "Free",
      venue: "Wesbrook Community Centre",
      organizer: "UNA",
      categories: ["Health", "Featured", "UNA Events"],
      excerpt: "Volunteer-led seminar on aging well.",
    },
    {
      id: "ev-night-shift-open-mic",
      title: "Night Shift: Open Mic",
      startISO: "2026-04-18T19:00",
      endISO:   "2026-04-18T21:30",
      url: "https://www.myuna.ca/event/night-shift-open-mic",
      featured: false,
      cost: "Free",
      venue: "Old Barn Community Centre",
      organizer: "UNA",
      categories: ["Music", "UNA Events"],
      excerpt: "Sign-ups at the door; all welcome.",
    },
    {
      id: "ev-soups-social",
      title: "Soups and Social",
      startISO: "2026-04-23T11:00",
      endISO:   "2026-04-23T12:30",
      url: "https://www.myuna.ca/event/soups-social",
      featured: true,
      cost: "Free",
      venue: "Wesbrook Community Centre",
      organizer: "UNA",
      categories: ["Community", "Featured", "Older Adults"],
      excerpt: "Soup, bread, conversation.",
    },
    {
      id: "ev-fmn-may",
      title: "Family Movie Night: Raya and the Last Dragon",
      startISO: "2026-05-02T17:30",
      endISO:   "2026-05-02T20:00",
      url: "https://www.myuna.ca/event/fmn-may",
      featured: false,
      cost: "$2",
      venue: "Old Barn Community Centre",
      organizer: "UNA",
      categories: ["Community", "Family"],
      excerpt: "Family-friendly screening with popcorn.",
    },
    {
      id: "ev-healthy-aging-may",
      title: "Healthy Aging Seminar Series",
      startISO: "2026-05-21T11:00",
      endISO:   "2026-05-21T12:30",
      url: "https://www.myuna.ca/event/healthy-aging-may",
      featured: true,
      cost: "Free",
      venue: "Wesbrook Community Centre",
      organizer: "UNA",
      categories: ["Health", "Featured", "UNA Events"],
      excerpt: "Aging in a Digital World: Innovative Tech Use in Elder Care.",
    },
    {
      id: "ev-disco",
      title: "Night Shift: Disco Dance",
      startISO: "2026-05-23T19:00",
      endISO:   "2026-05-23T21:30",
      url: "https://www.myuna.ca/event/disco",
      featured: false,
      cost: "Free",
      venue: "Old Barn Community Centre",
      organizer: "UNA",
      categories: ["Music", "Adults"],
      excerpt: "Disco beats, open dance floor, welcoming community vibe.",
    },
  ],
};
