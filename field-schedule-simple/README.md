# UNA Community Field Schedule — Prototype

A standalone weekly time-grid for the UNA Community Field bookings
page on myuna.ca. Replaces the manually-updated static image at
`/bookings/` with a live PerfectMind-powered grid.

## Preview

1. Open `index.html` in any modern browser — runs from `file://`.
2. Sample bookings live in `sample-data.js` (week of Apr 26 – May 3, 2026).
3. Resize the window to verify mobile (<768px), tablet (768–1023px),
   desktop (>=1024px) breakpoints.

## Files

```
index.html                   Page skeleton with sample data
index-live.html              Variant with the WP/PerfectMind injection point
styles.css                   Brand tokens + field-grid layout
field-calendar.js            Render, week nav, filters, overlays
perfectmind-field-adapter.js Transforms PerfectMind feed → field-calendar schema
sample-data.js               Stub bookings + org colors + VSB rule
README.md                    This file
wordpress-integration.md     Drop-in steps for myuna.ca
```

## What's different from the Drop-In Calendar

| Drop-In Calendar | Field Schedule |
|---|---|
| Many program types | Org-rentals only |
| Filter by program type, age category, availability, location | Filter by organization, status |
| Spots-left badge on each event | No spots — bookings are full-rental |
| One location | One location (the field itself) |
| No baseline overlays | VSB exclusive use + Community Play Time overlays |

## Brand

Same tokens as the Drop-In Calendar (UNA green, bright green/yellow,
beige, charcoal). Org-color mapping is currently a placeholder palette
in `sample-data.js` and `perfectmind-field-adapter.js` —
**Glenda picks the final palette.**

## VSB Exclusive Use rule

Defined in `sample-data.js` under `vsb`:

```js
{
  days:        [1, 2, 3, 4, 5],   // Mon–Fri
  timeStart:   "07:00",
  timeEnd:     "18:00",
  schoolYear:  { startMonth: 9, startDay: 1, endMonth: 6, endDay: 30 },
}
```

Renders automatically on weekdays during the school year. Skipped
on summer weeks and weekends.

To pin different values, edit those keys in `sample-data.js` (or the
defaults inside `perfectmind-field-adapter.js` for live mode).

## Community Play Time

Computed dynamically: any gap inside `operatingHours` (default 9 a.m. –
10 p.m.) on a given day where there's neither a booking nor a VSB
overlay gets a "Community Play Time" block.

If the operating hours need to change, edit `operatingHours` in
`sample-data.js` (and the matching defaults in the adapter for live).

## Wiring up live PerfectMind data

The same backend that already feeds the Drop-In Calendar's
PerfectMind requests should be able to return field bookings filtered
by location. Two approaches:

1. **Same workspace, location filter**: hit the existing
   PerfectMind endpoint with `LocationName = "UNA Community Field"`
   (or whatever the field's exact location string is in PerfectMind).
2. **Different widget**: if field bookings live in a separate
   PerfectMind workspace/widget, get its `widgetId` and point the
   PHP backend at that widget.

Then on the WordPress page:

```php
<script>
  window.UNA_FIELD_LIVE_DATA = <?php echo wp_json_encode($field_bookings); ?>;
</script>
```

The adapter (`perfectmind-field-adapter.js`) handles the transform.

## To-do before live launch

- [ ] Confirm PerfectMind data source (workspace / location filter)
- [ ] Glenda picks final org colors
- [ ] Pin VSB exclusive-use window verbatim (including holiday exceptions)
- [ ] Confirm operating hours bounds (9 a.m. – 10 p.m. assumed)
- [ ] Hand off `wordpress-integration.md` to UNA's WP dev/agency

See the parent plan at
`~/.claude/plans/hey-so-glenda-really-purrfect-dongarra.md` for the
full scope and verification steps.
