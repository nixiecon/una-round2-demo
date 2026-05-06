# Single Event Page — WordPress integration

This is a **CSS-only** redesign for myuna.ca's single event pages
(e.g. `https://www.myuna.ca/event/easter2026`). It reorders + restyles
The Events Calendar plugin's output without touching PHP or templates.

## What it changes

- Promotes Date / Time / Location / Map / "Add to Calendar" into a
  **beige hero card** at the top of the page, ABOVE the description.
- UNA-green left border + brand typography on the card.
- Sticky hero on desktop scroll (≥1024px).
- Stacks cleanly on mobile.
- Restyles the "Add to Calendar" button as a UNA-green primary CTA.

## Three ways to install (pick one)

### Option A — Customizer → Additional CSS (fastest, no file access needed)

1. WordPress admin → **Appearance → Customize → Additional CSS**.
2. Paste the entire contents of `single-event.css`.
3. Click **Publish**.
4. Visit any single event URL to verify (e.g. `/event/easter2026`).

This scopes the CSS site-wide, but every selector in the file is
namespaced under `.tribe-events-*` so it only affects event pages.

### Option B — Child theme stylesheet

1. In your active child theme folder, open or create
   `wp-content/themes/<your-child-theme>/style.css`.
2. Paste the contents of `single-event.css` at the bottom.
3. Save and clear any caching plugin.

### Option C — Drop in via "Simple Custom CSS and JS" plugin

1. Install/activate **Simple Custom CSS and JS** plugin (free).
2. Add a new CSS file → paste contents → set "Where on page" to
   **In Header**, "Where in site" to **In Frontend**.
3. Restrict to event pages by setting the linkage rule, or leave
   site-wide (selectors are scoped).

## Browser test checklist

After install, on `/event/easter2026` confirm:

- [ ] Title at top
- [ ] Featured image directly under title (if the event has one)
- [ ] Beige hero card with green left rule appears next
- [ ] Hero card contains: Date, Time, Cost, Categories, Venue
      (name + address), Map, "Add to Calendar" button
- [ ] Description appears AFTER the hero card
- [ ] Resize to mobile width (<768px): hero collapses to single column,
      Add-to-Calendar button is full-width
- [ ] Desktop scroll: hero card stays visible (sticky to top)

## Plugin version assumed

The Events Calendar **v6.x**. Selectors also cover legacy v4/v5
class names (`.tribe-events-cal-links`, etc.) for safety.

If the plugin updates and the layout breaks, check
`<meta name="generator">` in the page source or the plugin's changelog
for renamed classes — most likely culprits are the
`.tribe-events-c-subscribe-dropdown__*` family.

## How to disable the sticky hero on desktop

If Glenda decides she doesn't want sticky behavior, comment out or
delete the block under section 7 in `single-event.css`:

```css
@media (min-width: 1024px) {
  .tribe-events-event-meta {
    position: sticky;
    top: 80px;
    align-self: start;
  }
}
```

## Tweak `top` offset for theme header

If myuna.ca's header is taller (or shorter) than 80px and the sticky
hero overlaps with it, change the `top:` value in section 7. Measure
the rendered header height in DevTools and use that number.

## Open questions for Glenda

Before going live, confirm:

1. **Hero block fields**: Currently Date, Time, Cost, Categories,
   Location, Map, Add-to-Calendar. Want any of these dropped, or others
   added (Phone, Capacity, Registration link)?
2. **Sticky hero on desktop**: keep or kill?
3. **Should "Organizer" (always UNA) move into the hero card or stay
   below the description?** Current CSS de-emphasizes it inside the
   hero (smaller, lighter).
