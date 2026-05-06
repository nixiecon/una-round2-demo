# UNA Events Calendar — Prototypes

Two deliverables for the myuna.ca Events area:

1. **Month-view replacement** — a custom HTML/CSS/JS month grid that
   pulls from WP REST (`/wp-json/tribe/events/v1/events`). Replaces
   The Events Calendar plugin's broken month view (the one where
   featured-event images blow up the cell).

2. **Single event page CSS-only redesign** — see the
   [`single-event/`](./single-event/) subfolder. Reorders the existing
   plugin output so Date / Time / Location / Map / Add-to-Cal land in a
   beige hero card at the top.

## Preview

### Month grid

1. Open `month-grid.html` in any modern browser. Sample events live in
   `sample-data.js` (April–May 2026).
2. To preview against live myuna.ca data without WP integration, open
   `month-grid-live.html` and uncomment the
   `window.UNA_EVENTS_LIVE_DATA = …` line — paste in the JSON
   response from `https://www.myuna.ca/wp-json/tribe/events/v1/events`.

### Single event page

1. Open `single-event/preview.html` in a browser. It mocks Tribe's
   single-event DOM and applies `single-event.css`.
2. Resize the window to verify mobile + desktop breakpoints.

## Files

```
month-grid.html          Sample-data preview (offline, no fetch)
month-grid-live.html     WP injection variant
styles.css               Month-grid styling (brand tokens at top)
events-calendar.js       Render, month nav, filters, "+N more" overflow
wp-events-adapter.js     Tribe REST → render-shape transformer
sample-data.js           Stub events for offline preview
single-event/
  single-event.css       CSS-only redesign for single event pages
  preview.html           Local preview of the redesign
  wordpress-integration.md  Customizer paste-in instructions
README.md                this file
wordpress-integration.md month-grid integration steps
```

## Featured event treatment

In the live myuna.ca month view today, "Featured" events render their
**image inline inside the day cell**, which overflows and breaks the
layout. The custom month grid here replaces that with:

- Yellow "Featured" pill chip
- Yellow left-rule on the chip
- Subtle yellow gradient background
- Title still legible, image **never** rendered inline

The image still appears on the single event page.

## "+N more" overflow

When a day has more than 2 events, the cell shows the first 2 chips +
a "+N more" pill button. Clicking the pill opens a bottom sheet listing
all events for that day, with the same featured styling.

## Mobile

On screens <768px the day cells get too small for chips, so the design
falls back to **dot indicators**: each event becomes a small green
(or yellow if featured) dot. Tapping the cell opens the bottom sheet
with full event list.

## Filters

- **Event Category** — multi-select chip filter (matches Tribe's
  `tribe-events-event-categories`).
- **Venue** — multi-select.
- **Organizer** — multi-select.
- **Search box** — text search across title + excerpt + venue.

All filter options are derived dynamically from the data. They survive
month nav.

## Wiring up live data

See [`wordpress-integration.md`](./wordpress-integration.md) in this
folder.

## Dependencies

None. Vanilla HTML/CSS/JS, no build step, no framework.

## To-do before live launch

- [ ] Confirm featured-event visual with Glenda (badge + left rule
      vs. cell-background tint vs. icon-only)
- [ ] Confirm whether the "Find Events" search box stays in v1 or
      defers to Phase 2
- [ ] Hand off `wordpress-integration.md` (this folder + single-event
      subfolder) to UNA's WP dev/agency
- [ ] Single event page: confirm hero block fields with Glenda
      (Date, Time, Cost, Categories, Venue, Map, Add-to-Cal — anything
      to drop or add?)
- [ ] Confirm sticky-on-desktop hero behavior (default ON, easy kill)
