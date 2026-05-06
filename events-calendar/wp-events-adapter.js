/* ========================================================================
 * WordPress (The Events Calendar) → UNA Events Calendar Adapter
 *
 * Transforms a response from
 *   https://www.myuna.ca/wp-json/tribe/events/v1/events
 * into the schema events-calendar.js expects.
 *
 * Two ways this gets fed:
 *
 *   1. Server-side (recommended):
 *      WordPress queries Tribe internally, outputs the JSON inline:
 *        <script>
 *          window.UNA_EVENTS_LIVE_DATA = <?php echo wp_json_encode($events); ?>;
 *        </script>
 *
 *   2. Client-side fetch (fallback for static-host previews):
 *      window.WPEventsAdapter.fetch(monthStart).then(events => …)
 *
 * Input shape (Tribe REST event):
 *   {
 *     id, title, url, excerpt, image: {url},
 *     start_date, end_date,    // "YYYY-MM-DD HH:MM:SS"
 *     featured (boolean),
 *     cost,
 *     venue: { venue, address, … },
 *     organizer: [ { organizer, … } ],
 *     categories: [ { name, slug, … } ],
 *   }
 *
 * Output shape (events-calendar.js):
 *   { id, title, startISO, endISO, url, featured, cost, venue, organizer,
 *     categories, excerpt }
 * ====================================================================== */

(function () {
  'use strict';

  function transform(rawEvents) {
    if (!Array.isArray(rawEvents)) return [];
    return rawEvents.map(transformOne).filter(Boolean);
  }

  function transformOne(raw) {
    if (!raw) return null;
    const startISO = toLocalISO(raw.start_date || raw.startDate);
    const endISO   = toLocalISO(raw.end_date   || raw.endDate);
    if (!startISO) return null;

    return {
      id:        String(raw.id || ''),
      title:     stripHtml(raw.title || ''),
      startISO:  startISO,
      endISO:    endISO || startISO,
      url:       raw.url || raw.permalink || '',
      featured:  Boolean(raw.featured),
      cost:      raw.cost || '',
      venue:     extractVenue(raw),
      organizer: extractOrganizer(raw),
      categories: extractCategories(raw),
      excerpt:   stripHtml(raw.excerpt || raw.description || '').slice(0, 220),
    };
  }

  function extractVenue(raw) {
    if (!raw.venue) return '';
    if (typeof raw.venue === 'string') return raw.venue;
    if (Array.isArray(raw.venue)) return (raw.venue[0] && raw.venue[0].venue) || '';
    return raw.venue.venue || '';
  }

  function extractOrganizer(raw) {
    if (!raw.organizer) return '';
    if (typeof raw.organizer === 'string') return raw.organizer;
    if (Array.isArray(raw.organizer)) {
      return raw.organizer.map(o => o.organizer).filter(Boolean).join(', ');
    }
    return raw.organizer.organizer || '';
  }

  function extractCategories(raw) {
    if (!raw.categories) return [];
    if (!Array.isArray(raw.categories)) return [];
    return raw.categories.map(c => c.name || c.slug || c).filter(Boolean);
  }

  // Tribe returns dates in site timezone as "YYYY-MM-DD HH:MM:SS"
  function toLocalISO(d) {
    if (!d) return null;
    if (typeof d === 'string') {
      const m = d.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
      if (!m) return null;
      return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}`;
    }
    return null;
  }

  function stripHtml(s) {
    if (!s) return '';
    return String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  }

  // ----- Optional client-side fetcher (works from a same-origin host;
  //       blocked by CORS from a static demo host) -----

  function fetchMonth(monthDate, base) {
    base = base || 'https://www.myuna.ca/wp-json/tribe/events/v1/events';
    const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    const startStr = formatYMD(start);
    const endStr = formatYMD(end);
    const url = `${base}?start_date=${startStr}&end_date=${endStr}&per_page=100`;
    return fetch(url)
      .then(r => r.json())
      .then(data => transform(data.events || data));
  }

  function formatYMD(d) {
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  window.WPEventsAdapter = {
    transform: transform,
    fetchMonth: fetchMonth,
    _transformOne: transformOne,
  };

})();
