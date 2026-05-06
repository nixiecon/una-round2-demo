/* ========================================================================
 * UNA Events Calendar — events-calendar.js
 * Vanilla JS month-grid renderer for myuna.ca events.
 *
 * Data sources (in priority order):
 *   1. window.UNA_EVENTS_LIVE_DATA + window.WPEventsAdapter
 *      → live WP REST API events transformed by the adapter
 *   2. window.UNA_EVENTS_SAMPLE_DATA → stub events (sample-data.js)
 *
 * Featured event treatment:
 *   - Yellow "Featured" flag chip + yellow left border
 *   - NEVER renders the event image inline (this is what's broken on
 *     the live myuna.ca month view)
 * ====================================================================== */

(function () {
  'use strict';

  const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
  const STORAGE_KEY = 'una-events-prefs';
  const MOBILE_QUERY = window.matchMedia('(max-width: 767px)');
  const MAX_EVENTS_PER_CELL = 2;  // before "+N more"

  const els = {
    monthLabel: document.getElementById('month-label'),
    grid: document.getElementById('month-grid'),
    emptyState: document.getElementById('empty-state'),
    searchInput: document.getElementById('search-input'),
    filterCategory: document.getElementById('filter-category'),
    filterVenue: document.getElementById('filter-venue'),
    filterOrganizer: document.getElementById('filter-organizer'),
    mobileFiltersToggle: document.getElementById('mobile-filters-toggle'),
    filtersPanel: document.getElementById('filters'),
    prevMonth: document.getElementById('prev-month'),
    nextMonth: document.getElementById('next-month'),
    todayBtn: document.getElementById('today-btn'),
    daySheet: document.getElementById('day-sheet'),
    daySheetTitle: document.getElementById('day-sheet-title'),
    daySheetContent: document.getElementById('day-sheet-content'),
  };

  const state = {
    monthStart: monthStartOf(new Date()),
    filters: {
      category: [],
      venue: [],
      organizer: [],
      search: '',
    },
  };

  // ============ Bootstrap ============

  function init() {
    const events = getEvents();
    initMultiSelect(els.filterCategory, derive(events, 'categories', true));
    initMultiSelect(els.filterVenue, derive(events, 'venue'));
    initMultiSelect(els.filterOrganizer, derive(events, 'organizer'));
    attachEventHandlers();
    render();
  }

  function getEvents() {
    if (window.UNA_EVENTS_LIVE_DATA && window.WPEventsAdapter) {
      return window.WPEventsAdapter.transform(window.UNA_EVENTS_LIVE_DATA);
    }
    return (window.UNA_EVENTS_SAMPLE_DATA && window.UNA_EVENTS_SAMPLE_DATA.events) || [];
  }

  function derive(events, key, isArrayField) {
    const seen = new Set();
    events.forEach(ev => {
      const v = ev[key];
      if (isArrayField && Array.isArray(v)) {
        v.forEach(item => seen.add(item));
      } else if (v) {
        seen.add(v);
      }
    });
    return Array.from(seen).sort();
  }

  // ============ Multi-select ============

  function initMultiSelect(root, options) {
    const filterKey = root.getAttribute('data-filter-key');
    const placeholder = root.getAttribute('data-placeholder') || 'All';
    root.setAttribute('data-options', JSON.stringify(options));

    function renderChips() {
      root.innerHTML = '';
      const current = state.filters[filterKey] || [];
      if (!current.length) {
        const ph = document.createElement('span');
        ph.className = 'multi-select__placeholder';
        ph.textContent = placeholder;
        root.appendChild(ph);
        return;
      }
      current.forEach(label => {
        const chip = document.createElement('span');
        chip.className = 'multi-select__chip';
        chip.innerHTML = label +
          ' <button type="button" class="multi-select__chip-remove" aria-label="Remove">×</button>';
        chip.querySelector('button').addEventListener('click', e => {
          e.stopPropagation();
          state.filters[filterKey] = current.filter(l => l !== label);
          renderChips();
          render();
        });
        root.appendChild(chip);
      });
    }

    let panel = null;
    function openPanel() {
      if (panel) return;
      panel = document.createElement('div');
      panel.className = 'multi-select__panel';
      options.forEach(label => {
        const opt = document.createElement('div');
        opt.className = 'multi-select__option';
        const selected = (state.filters[filterKey] || []).includes(label);
        opt.setAttribute('aria-selected', selected);
        opt.innerHTML = `<input type="checkbox" ${selected ? 'checked' : ''} /> ${label}`;
        opt.addEventListener('click', e => {
          e.stopPropagation();
          const cur = state.filters[filterKey] || [];
          state.filters[filterKey] = cur.includes(label)
            ? cur.filter(l => l !== label)
            : cur.concat(label);
          renderChips();
          render();
        });
        panel.appendChild(opt);
      });
      root.appendChild(panel);
    }
    function closePanel() {
      if (panel) { panel.remove(); panel = null; }
    }

    root.addEventListener('click', e => {
      if (e.target.closest('.multi-select__chip')) return;
      panel ? closePanel() : openPanel();
    });
    document.addEventListener('click', e => {
      if (!root.contains(e.target)) closePanel();
    });

    renderChips();
  }

  // ============ Event handlers ============

  function attachEventHandlers() {
    els.prevMonth.addEventListener('click', () => {
      state.monthStart = addMonths(state.monthStart, -1);
      render();
    });
    els.nextMonth.addEventListener('click', () => {
      state.monthStart = addMonths(state.monthStart, 1);
      render();
    });
    els.todayBtn.addEventListener('click', () => {
      state.monthStart = monthStartOf(new Date());
      render();
    });
    els.searchInput.addEventListener('input', e => {
      state.filters.search = e.target.value.trim().toLowerCase();
      render();
    });
    els.mobileFiltersToggle.addEventListener('click', () => {
      const open = els.filtersPanel.classList.toggle('is-open');
      els.mobileFiltersToggle.setAttribute('aria-expanded', String(open));
    });
    document.querySelectorAll('[data-close-sheet]').forEach(btn => {
      btn.addEventListener('click', closeDaySheet);
    });
    MOBILE_QUERY.addEventListener('change', render);
  }

  // ============ Render ============

  function render() {
    renderMonthLabel();
    renderMonthGrid();
  }

  function renderMonthLabel() {
    const d = state.monthStart;
    els.monthLabel.textContent = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  }

  function renderMonthGrid() {
    els.grid.innerHTML = '';
    const filteredEvents = getEvents().filter(passesFilters);

    // Compute the first cell: most recent Sunday on/before monthStart
    const first = startCellOf(state.monthStart);
    // Compute the last cell: 6 weeks later (max possible) or 5 if month fits
    const monthEnd = addMonths(state.monthStart, 1);
    const lastCellNeeded = endCellOf(monthEnd);
    const totalCells = Math.round((lastCellNeeded - first) / (1000 * 60 * 60 * 24)) + 1;
    const weeks = Math.ceil(totalCells / 7);
    const cells = weeks * 7;

    let totalEventsInView = 0;
    for (let i = 0; i < cells; i++) {
      const date = addDays(first, i);
      const cell = document.createElement('div');
      cell.className = 'month-cell';
      if (date.getMonth() !== state.monthStart.getMonth()) cell.classList.add('is-other-month');
      if (isSameDate(date, new Date())) cell.classList.add('is-today');

      const dayNum = document.createElement('span');
      dayNum.className = 'day-number';
      dayNum.textContent = date.getDate();
      cell.appendChild(dayNum);

      const dayEvents = filteredEvents.filter(ev =>
        isSameDate(parseISO(ev.startISO), date)
      );
      totalEventsInView += dayEvents.length;

      // Sort featured first, then by start time
      dayEvents.sort((a, b) => {
        if (a.featured !== b.featured) return b.featured - a.featured;
        return a.startISO.localeCompare(b.startISO);
      });

      if (MOBILE_QUERY.matches) {
        // Mobile: dot indicators + tap to open day sheet
        if (dayEvents.length > 0) {
          const dots = document.createElement('div');
          dots.className = 'event-dots';
          dayEvents.forEach(ev => {
            const dot = document.createElement('span');
            dot.className = 'event-chip' + (ev.featured ? ' is-featured' : '');
            dot.title = ev.title;
            dots.appendChild(dot);
          });
          cell.appendChild(dots);
          cell.style.cursor = 'pointer';
          cell.addEventListener('click', () => openDaySheet(date, dayEvents));
        }
      } else {
        // Desktop / tablet: chips
        const visible = dayEvents.slice(0, MAX_EVENTS_PER_CELL);
        const hiddenCount = dayEvents.length - visible.length;

        visible.forEach(ev => {
          cell.appendChild(renderChip(ev));
        });
        if (hiddenCount > 0) {
          const more = document.createElement('button');
          more.type = 'button';
          more.className = 'event-chip-more';
          more.textContent = `+${hiddenCount} more`;
          more.addEventListener('click', e => {
            e.stopPropagation();
            openDaySheet(date, dayEvents);
          });
          cell.appendChild(more);
        }
      }

      els.grid.appendChild(cell);
    }

    els.emptyState.hidden = totalEventsInView !== 0;
  }

  function renderChip(ev) {
    const a = document.createElement('a');
    a.className = 'event-chip' + (ev.featured ? ' is-featured' : '');
    a.href = ev.url || '#';
    a.title = ev.title;
    let inner = '';
    if (ev.featured) {
      inner += `<span class="event-chip__featured-flag">Featured</span>`;
    }
    inner += `<span class="event-chip__time">${formatTime(ev.startISO)}</span>${ev.title}`;
    a.innerHTML = inner;
    return a;
  }

  // ============ Day sheet ============

  function openDaySheet(date, events) {
    els.daySheetTitle.textContent = formatDateLong(date);
    els.daySheetContent.innerHTML = '';
    events.forEach(ev => {
      const a = document.createElement('a');
      a.className = 'day-sheet-event' + (ev.featured ? ' is-featured' : '');
      a.href = ev.url || '#';
      a.innerHTML = `
        <p class="day-sheet-event__title">${ev.featured ? '★ ' : ''}${ev.title}</p>
        <p class="day-sheet-event__meta">${formatTime(ev.startISO)} – ${formatTime(ev.endISO)} · ${ev.venue || ''}</p>
        ${ev.excerpt ? `<p class="day-sheet-event__meta">${ev.excerpt}</p>` : ''}
      `;
      els.daySheetContent.appendChild(a);
    });
    els.daySheet.hidden = false;
  }

  function closeDaySheet() {
    els.daySheet.hidden = true;
  }

  // ============ Filters ============

  function passesFilters(ev) {
    const f = state.filters;
    if (f.category.length && !ev.categories.some(c => f.category.includes(c))) return false;
    if (f.venue.length && !f.venue.includes(ev.venue)) return false;
    if (f.organizer.length && !f.organizer.includes(ev.organizer)) return false;
    if (f.search) {
      const hay = (ev.title + ' ' + (ev.excerpt || '') + ' ' + (ev.venue || '')).toLowerCase();
      if (!hay.includes(f.search)) return false;
    }
    return true;
  }

  // ============ Date utilities ============

  function monthStartOf(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
  function startCellOf(monthStart) {
    const d = new Date(monthStart);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }
  function endCellOf(monthEndExclusive) {
    const d = new Date(monthEndExclusive);
    d.setDate(d.getDate() - 1);
    while (d.getDay() !== 6) d.setDate(d.getDate() + 1);
    return d;
  }
  function addMonths(date, n) {
    return new Date(date.getFullYear(), date.getMonth() + n, 1);
  }
  function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  }
  function isSameDate(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }
  function parseISO(iso) {
    const [datePart, timePart] = iso.split('T');
    const [y, m, d] = datePart.split('-').map(Number);
    const [hh, mm] = (timePart || '00:00').split(':').map(Number);
    return new Date(y, m - 1, d, hh, mm);
  }
  function formatTime(iso) {
    const [, time] = iso.split('T');
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'pm' : 'am';
    const h12 = ((h + 11) % 12) + 1;
    const mm = m === 0 ? '' : ':' + String(m).padStart(2, '0');
    return `${h12}${mm}${ampm}`;
  }
  function formatDateLong(d) {
    return `${DAY_NAMES_SHORT[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
  }

  // ============ Go ============

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
