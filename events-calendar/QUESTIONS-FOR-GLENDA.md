# Round 2 redesigns — questions for Glenda

Bundle these into one message before client review. Grouped by page so
she can answer in any order.

---

## Both pages

1. **Demo URL preference** — same pattern as the drop-in calendar
   (separate GitHub Pages demo for review, then WP integration after
   sign-off)? Or do you have WP admin access this round and want me
   to push directly to a staging page?

---

## Field Schedule (`/bookings/`)

2. **PerfectMind data source confirmation** — is the field booking
   feed in the same PerfectMind workspace as the drop-in classes?
   (If yes, we filter by `LocationName = "UNA Community Field"`. If
   it's a separate workspace/widget, I'll need that widget ID.)

3. **Org → color mapping** — current placeholders (UNA green / VSB
   light blue / Vancouver United navy / UBC Met deeper navy / VL-BE
   grey / Soccer Movement light grey / Memorial Tournament charcoal).
   Which of these are right? Which need different shades? Are there
   recurring orgs we're missing?

4. **VSB exclusive-use window** — currently coded as Mon–Fri,
   7 a.m. – 6 p.m., Sept 1 – June 30. Verbatim correct? Are there
   holiday exceptions to bake in (PA days, spring break, etc.)?

5. **Operating hours** — currently 9 a.m. – 10 p.m. for the
   "Community Play Time" overlay. That match what the field is
   actually open?

---

## Events Calendar — Month view (`/events/`)

6. **Featured event treatment** — proposed: yellow "Featured" pill
   chip + yellow left rule + subtle yellow gradient background.
   No image inline (that's the bug we're killing). Approve, or want
   a different visual?

7. **Search box** — keep the "Find Events" search in v1, or defer
   to Phase 2? (The custom month grid supports search out of the
   box; easy to hide if you'd rather declutter.)

---

## Single event page (e.g. `/event/easter2026`)

8. **Hero block contents** — proposed top card:
   Date · Time · Cost · Categories · Venue (name + address) · Map ·
   Add-to-Calendar button. Anything to drop or add (Phone? Capacity?
   Registration link?)?

9. **Sticky hero on desktop scroll** — when you scroll down past
   the description, should the hero card pin to the top of the
   viewport or scroll away? Default is sticky; one-line CSS to
   disable if you prefer.

10. **"Organizer" placement** — UNA is always the organizer for these
    events. Currently de-emphasized inside the hero card (smaller,
    lighter). Want it in the hero, below the description, or hidden?

---

## Once these answers come back

Phase 2 work that depends on Glenda's answers:

- Q2 → finalize the PerfectMind adapter for field bookings
- Q3 → swap placeholder colors → final palette in
  `Projects/UNA Field Schedule/sample-data.js` and
  `perfectmind-field-adapter.js`
- Q4–5 → adjust VSB / operating-hours config
- Q6 → adjust featured chip styling in
  `Projects/UNA Events Calendar/styles.css`
- Q7 → keep or remove `<div class="search-row">` from
  `month-grid.html` + `template.html`
- Q8–10 → adjust `Projects/UNA Events Calendar/single-event/single-event.css`
