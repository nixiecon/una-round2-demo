# Field Schedule — WordPress integration

Same shortcode + page-template patterns as the Drop-In Calendar.
See `Projects/UNA Drop-In Calendar/wordpress-integration.md` for
background — this file just covers the field-schedule-specific bits.

---

## Option A — Shortcode

In your theme's `functions.php` (or a site-specific plugin):

```php
function una_field_schedule_shortcode() {
    // 1. Get PerfectMind field-booking data (same backend that feeds
    //    the drop-in calendar, filtered by location = "UNA Community Field")
    $bookings = una_get_perfectmind_field_bookings(); // implement this
    $json = wp_json_encode($bookings);

    // 2. Enqueue assets
    wp_enqueue_style(
        'una-field-css',
        get_template_directory_uri() . '/assets/field-schedule/styles.css',
        array(), '1.0.0'
    );

    wp_enqueue_script(
        'una-field-adapter',
        get_template_directory_uri() . '/assets/field-schedule/perfectmind-field-adapter.js',
        array(), '1.0.0', true
    );

    wp_enqueue_script(
        'una-field-js',
        get_template_directory_uri() . '/assets/field-schedule/field-calendar.js',
        array('una-field-adapter'), '1.0.0', true
    );

    // 3. Pass data to JS
    wp_add_inline_script(
        'una-field-adapter',
        "window.UNA_FIELD_LIVE_DATA = {$json};",
        'before'
    );

    // 4. Output HTML template
    ob_start();
    include get_template_directory() . '/assets/field-schedule/template.html';
    return ob_get_clean();
}
add_shortcode('una_field_schedule', 'una_field_schedule_shortcode');
```

Then on the `/bookings/` page, replace the static image block with:

```
[una_field_schedule]
```

Keep the existing PDF download below the shortcode if you still want to
offer it.

---

## File placement

```
wp-content/themes/your-theme/assets/field-schedule/
  ├── styles.css
  ├── perfectmind-field-adapter.js
  ├── field-calendar.js
  ├── sample-data.js              ← optional; only used if LIVE_DATA missing
  └── template.html               ← body of index.html minus html/head/body wrappers
```

---

## PerfectMind data shape expected

The adapter reads PerfectMind's standard PHP-array shape. For field
bookings, the field that identifies the renting org is `Subject` (the
booking subject in PerfectMind):

```json
{
  "Subject": "Vancouver United FC",
  "CourseID": "12345",
  "ExactTime": "2026-04-27 18:00",
  "EndTime": "7:30PM",
  "LocationName": "UNA Community Field",
  "Notes": ""
}
```

If your PerfectMind setup stores the org name in a different field
(e.g. `OrganizationName`, `Renter`), edit
`perfectmind-field-adapter.js`'s `transform()` function — the line
that reads `raw.Subject`.

---

## Org → color mapping

The adapter's `ORG_KEY_LOOKUP` table maps known org names to color
keys. Add Glenda's confirmed mappings here once she signs off. If a
new org appears in the data without a mapping, it falls back to a
hashed `org_<name>` key + a default UNA-green color — visually that
flags it for review.

---

## VSB exclusive-use override

If the school year window changes (e.g. UNA agrees to extend VSB
through July), update the `vsb.schoolYear` block in either
`sample-data.js` (preview) or the adapter's defaults (live).

---

## Browser test checklist

- [ ] `index.html` from `file://` renders sample data with VSB overlay
      (Mon–Fri 7am–6pm) and Community Play Time fill on weekends
- [ ] Past week → past bookings render at lower opacity (planned but
      not yet implemented; reuse drop-in calendar pattern)
- [ ] Filter by org chips → only that org's bookings show; overlays stay
- [ ] Mobile (<768px): single-day view, day-tab strip, bottom-sheet
- [ ] Tablet (768–1023px): full 7-day grid with compressed time column
- [ ] Desktop (>=1024px): full grid, all bookings visible
