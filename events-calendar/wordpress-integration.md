# Events Calendar Month View — WordPress integration

For the **single event page** CSS, see
[`single-event/wordpress-integration.md`](./single-event/wordpress-integration.md).
This file covers the **month-grid replacement**.

---

## Approach

The Events Calendar plugin's broken month view is replaced by a
shortcode that outputs our custom HTML + JS. We don't disable or
modify the plugin — the List view stays untouched. The shortcode
replaces only the Month-view embed on `/events/`.

---

## Option A — Shortcode

Add to your theme's `functions.php` (or a site-specific plugin):

```php
function una_events_month_grid_shortcode() {
    // 1. Query Tribe events for ±3 months around today
    //    (the JS handles month navigation client-side, but seeding 3
    //    months keeps things responsive without re-fetching)
    $args = array(
        'start_date' => date('Y-m-01', strtotime('-1 month')),
        'end_date'   => date('Y-m-t', strtotime('+2 months')),
        'posts_per_page' => 100,
    );
    $events = tribe_get_events($args);

    // Convert to the shape the adapter expects
    $payload = array_map(function($e) {
        $venue = tribe_get_venue($e->ID);
        $organizers = tribe_get_organizer_ids($e->ID);
        $organizer = $organizers ? get_the_title($organizers[0]) : '';
        $categories = wp_get_post_terms($e->ID, 'tribe_events_cat', array('fields' => 'names'));

        return array(
            'id'         => $e->ID,
            'title'      => get_the_title($e->ID),
            'url'        => get_permalink($e->ID),
            'start_date' => tribe_get_start_date($e->ID, true, 'Y-m-d H:i:s'),
            'end_date'   => tribe_get_end_date($e->ID, true, 'Y-m-d H:i:s'),
            'featured'   => tribe_is_event_featured($e->ID),
            'cost'       => tribe_get_cost($e->ID, true),
            'venue'      => $venue,
            'organizer'  => $organizer,
            'categories' => $categories,
            'excerpt'    => get_the_excerpt($e->ID),
        );
    }, $events);

    $json = wp_json_encode($payload);

    // 2. Enqueue assets
    wp_enqueue_style(
        'una-events-css',
        get_template_directory_uri() . '/assets/events-calendar/styles.css',
        array(), '1.0.0'
    );
    wp_enqueue_script(
        'una-events-adapter',
        get_template_directory_uri() . '/assets/events-calendar/wp-events-adapter.js',
        array(), '1.0.0', true
    );
    wp_enqueue_script(
        'una-events-js',
        get_template_directory_uri() . '/assets/events-calendar/events-calendar.js',
        array('una-events-adapter'), '1.0.0', true
    );

    // 3. Pass data to JS
    wp_add_inline_script(
        'una-events-adapter',
        "window.UNA_EVENTS_LIVE_DATA = {$json};",
        'before'
    );

    // 4. Output template
    ob_start();
    include get_template_directory() . '/assets/events-calendar/template.html';
    return ob_get_clean();
}
add_shortcode('una_events_month_grid', 'una_events_month_grid_shortcode');
```

Then on the `/events/` page, replace the month-view block with:

```
[una_events_month_grid]
```

The Tribe plugin's List view URL stays at `/events/list/` — the View
toggle in the top-right of our custom UI just deep-links to it. No
plugin changes needed.

---

## File placement

```
wp-content/themes/your-theme/assets/events-calendar/
  ├── styles.css
  ├── wp-events-adapter.js
  ├── events-calendar.js
  ├── sample-data.js              ← optional fallback
  └── template.html               ← body of month-grid.html minus the html/head/body wrappers
```

---

## Why shortcode + inline JSON beats client-side fetch

Tribe's REST endpoint (`/wp-json/tribe/events/v1/events`) is public,
but fetching it client-side on the same page that hosts the plugin
means a second request to your own server. Shortcode + inline JSON:

- Renders instantly (no spinner)
- No CORS to think about
- One less network round-trip
- Works on the GitHub Pages demo too (just paste the JSON manually
  into `month-grid-live.html`'s LIVE_DATA block for the demo)

---

## Browser test checklist

- [ ] Featured events show "Featured" pill + yellow left rule, no image
- [ ] Days with 3+ events show 2 chips + "+N more" → opens bottom sheet
- [ ] Filters narrow live, clearing returns to full set
- [ ] Search box matches against title + excerpt + venue
- [ ] Mobile (<768px): cells show dots, tap opens bottom sheet
- [ ] Click any chip → opens single event page (use the matching
      `single-event/single-event.css` for the upgraded layout)
- [ ] Month nav arrows + "This Month" button work
- [ ] List view toggle deep-links to `/events/list/`

---

## Disabling the search box (Phase 2 deferral)

If Glenda decides to defer the search to Phase 2, remove or hide the
`<div class="search-row">` block in `month-grid.html` /
`template.html`. The `passesFilters` function reads `state.filters.search`
which stays empty if no input exists, so the rest keeps working.
