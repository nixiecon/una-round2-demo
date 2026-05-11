/* ========================================================================
 * UNA Community Field Schedule — field-calendar.js
 * Vanilla JS rendering for the Community Field weekly schedule.
 *
 * Data sources (in priority order):
 *   1. window.UNA_FIELD_LIVE_DATA + window.PerfectMindFieldAdapter
 *      → live PerfectMind feed transformed by the adapter
 *   2. window.UNA_FIELD_SAMPLE_DATA → stub bookings (sample-data.js)
 *
 * Renders three layers per day column, in z-order:
 *   • Community Play Time (CPT) gap fill   (z-index: 0)
 *   • Vancouver School Board overlay       (z-index: 1)
 *   • Org bookings                         (z-index: 2+)
 * ====================================================================== */

(function () {
  'use strict';

  // ----- Constants -----
  const DAY_NAMES_LONG  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAY_LETTERS     = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const HOUR_HEIGHT = 56;     // matches --hour-height-desktop in styles.css

  const STORAGE_KEY = 'una-field-schedule-prefs';
  const MOBILE_QUERY = window.matchMedia('(max-width: 767px)');

  // ----- DOM refs -----
  const els = {
    dateRange: document.getElementById('date-range'),
    grid: document.getElementById('field-grid'),
    legend: document.getElementById('legend'),
    filterStatus: document.getElementById('filter-status'),
    mobileFiltersToggle: document.getElementById('mobile-filters-toggle'),
    filtersPanel: document.getElementById('filters'),
    prevWeek: document.getElementById('prev-week'),
    nextWeek: document.getElementById('next-week'),
    todayBtn: document.getElementById('today-btn'),
    mobileDayTabs: document.getElementById('mobile-day-tabs'),
    mobileSheet: document.getElementById('mobile-sheet'),
    mobileSheetContent: document.getElementById('mobile-sheet-content'),
  };

  // ----- State -----
  const state = {
    weekStart: getWeekStart(new Date()),
    mobileActiveDay: new Date().getDay(),
    filters: {
      status: '',
    },
  };

  // ============ Bootstrap ============

  function init() {
    attachEventHandlers();
    render();
  }

  // ============ Data ============

  function getData() {
    if (window.UNA_FIELD_LIVE_DATA && window.PerfectMindFieldAdapter) {
      return window.PerfectMindFieldAdapter.transform(window.UNA_FIELD_LIVE_DATA);
    }
    return window.UNA_FIELD_SAMPLE_DATA || { bookings: [], orgColors: {} };
  }

  function getBookings() {
    const data = getData();
    const bookings = data.bookings || [];
    // If using sample data (no live feed), offset all bookings to the
    // currently displayed week so the demo always has content.
    if (!window.UNA_FIELD_LIVE_DATA) {
      return offsetBookingsToWeek(bookings, state.weekStart);
    }
    return bookings;
  }

  // Shift sample bookings so they land on the displayed week.
  // The anchor week is detected from the earliest booking's Sunday.
  let _anchorWeekStart = null;
  function offsetBookingsToWeek(bookings, targetWeekStart) {
    if (!bookings.length) return bookings;
    if (!_anchorWeekStart) {
      const earliest = bookings.reduce((a, b) => a.startISO < b.startISO ? a : b);
      _anchorWeekStart = getWeekStart(new Date(earliest.startISO));
    }
    const diffMs = targetWeekStart.getTime() - _anchorWeekStart.getTime();
    if (diffMs === 0) return bookings;
    const diffDays = Math.round(diffMs / 86400000);
    return bookings.map(b => ({
      ...b,
      startISO: shiftISO(b.startISO, diffDays),
      endISO:   shiftISO(b.endISO, diffDays),
    }));
  }

  function shiftISO(iso, days) {
    const d = new Date(iso);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const time = iso.split('T')[1];
    return `${y}-${m}-${dd}T${time}`;
  }

  function getOrgColor(orgKey) {
    const colors = getData().orgColors || {};
    return colors[orgKey] || '#3B7267';
  }

  function getOperatingHours() {
    return getData().operatingHours || { start: "09:00", end: "22:00" };
  }

  function getVsbConfig() {
    return getData().vsb || null;
  }

  // ============ Event handlers ============

  function attachEventHandlers() {
    els.prevWeek.addEventListener('click', () => {
      state.weekStart = addDays(state.weekStart, -7);
      render();
    });
    els.nextWeek.addEventListener('click', () => {
      state.weekStart = addDays(state.weekStart, 7);
      render();
    });
    els.todayBtn.addEventListener('click', () => {
      state.weekStart = getWeekStart(new Date());
      state.mobileActiveDay = new Date().getDay();
      render();
    });
    els.filterStatus.addEventListener('change', e => {
      state.filters.status = e.target.value;
      render();
    });
    els.mobileFiltersToggle.addEventListener('click', () => {
      const open = els.filtersPanel.classList.toggle('is-open');
      els.mobileFiltersToggle.setAttribute('aria-expanded', String(open));
    });
    document.querySelectorAll('[data-close-sheet]').forEach(btn => {
      btn.addEventListener('click', closeMobileSheet);
    });
    MOBILE_QUERY.addEventListener('change', render);
  }

  // ============ Render ============

  function render() {
    renderDateRange();
    renderMobileDayTabs();
    renderGrid();
    if (els.legend) renderLegend();
  }

  function renderDateRange() {
    const start = state.weekStart;
    const end = addDays(start, 6);
    const sameMonth = start.getMonth() === end.getMonth();
    const startStr = `${MONTH_NAMES_SHORT[start.getMonth()]} ${start.getDate()}`;
    const endStr = sameMonth
      ? `${end.getDate()}, ${end.getFullYear()}`
      : `${MONTH_NAMES_SHORT[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
    els.dateRange.textContent = `${startStr} – ${endStr}`;
  }

  function renderGrid() {
    const grid = els.grid;
    grid.innerHTML = '';

    // Compute the time bounds for this week:
    // min = earliest event/VSB start across the 7 days
    // max = latest event/VSB end across the 7 days
    const bounds = computeTimeBounds();
    const { startMin, endMin } = bounds;
    const totalMin = endMin - startMin;
    const totalHours = totalMin / 60;
    const gridHeight = totalHours * HOUR_HEIGHT;

    // Set CSS height on day columns dynamically
    grid.style.setProperty('--computed-height', `${gridHeight}px`);

    // ---- Render header row ----
    const corner = document.createElement('div');
    corner.className = 'grid-corner';
    grid.appendChild(corner);

    for (let d = 0; d < 7; d++) {
      const date = addDays(state.weekStart, d);
      const isToday = isSameDate(date, new Date());
      const isActive = MOBILE_QUERY.matches && d === state.mobileActiveDay;

      const header = document.createElement('div');
      header.className = 'day-header' +
        (isToday ? ' is-today' : '') +
        (isActive ? ' is-active' : '');
      header.innerHTML = `
        <span class="day-name">${DAY_NAMES_SHORT[date.getDay()]}</span>
        <span class="day-date">${date.getDate()}</span>
      `;
      grid.appendChild(header);
    }

    // ---- Render time column + day columns ----
    // We render hour rows in a container that spans the full grid below the header.
    // For simplicity, build hour-row elements inside each day column (and time labels in the time column).
    const startHour = Math.floor(startMin / 60);
    const endHour = Math.ceil(endMin / 60);

    // Time column
    const timeCol = document.createElement('div');
    timeCol.className = 'time-col';
    timeCol.style.gridColumn = '1';
    timeCol.style.gridRow = '2';
    grid.appendChild(timeCol);

    for (let h = startHour; h < endHour; h++) {
      const lbl = document.createElement('div');
      lbl.className = 'time-label';
      lbl.textContent = formatHourLabel(h);
      timeCol.appendChild(lbl);
    }

    // Day columns
    for (let d = 0; d < 7; d++) {
      const date = addDays(state.weekStart, d);
      const dayCol = document.createElement('div');
      dayCol.className = 'day-column';
      dayCol.style.gridColumn = `${d + 2}`;
      dayCol.style.gridRow = '2';
      dayCol.style.minHeight = `${gridHeight}px`;
      const isActive = MOBILE_QUERY.matches && d === state.mobileActiveDay;
      if (isActive) dayCol.classList.add('is-active');

      // Hour gridlines
      for (let h = startHour; h < endHour; h++) {
        const row = document.createElement('div');
        row.className = 'hour-row';
        dayCol.appendChild(row);
      }

      // VSB overlay (z-index 1)
      const vsbBlock = computeVsbBlockForDate(date, startMin);
      if (vsbBlock) {
        const overlay = renderVsbOverlay(vsbBlock);
        dayCol.appendChild(overlay);
      }

      // Bookings (z-index 2+)
      const bookings = bookingsForDate(date).filter(passesFilters);
      bookings.forEach((b, i) => {
        const block = renderBooking(b, startMin);
        block.style.zIndex = String(2 + i);
        dayCol.appendChild(block);
      });

      // Community Play Time fills any gap inside operating hours
      // that isn't a booking and isn't VSB.
      const gapBlocks = computeGapBlocks(date, bookings, vsbBlock, startMin);
      gapBlocks.forEach(gap => dayCol.appendChild(renderGapBlock(gap)));

      grid.appendChild(dayCol);
    }
  }

  function renderMobileDayTabs() {
    if (!MOBILE_QUERY.matches) {
      els.mobileDayTabs.innerHTML = '';
      return;
    }
    els.mobileDayTabs.innerHTML = '';
    for (let d = 0; d < 7; d++) {
      const date = addDays(state.weekStart, d);
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'mobile-day-tab';
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-pressed', String(d === state.mobileActiveDay));
      tab.innerHTML = `
        <span class="day-letter">${DAY_LETTERS[date.getDay()]}</span>
        <span class="day-number">${date.getDate()}</span>
      `;
      tab.addEventListener('click', () => {
        state.mobileActiveDay = d;
        render();
      });
      els.mobileDayTabs.appendChild(tab);
    }
  }

  function renderLegend() {
    els.legend.innerHTML = '';
    const orgs = uniqueOrgs(getBookings());
    const items = [
      ...orgs.map(o => ({ label: o.label, color: getOrgColor(o.key) })),
      { label: 'Vancouver School Board', color: '#69C0E5', dashed: true },
      { label: 'Community Play Time', color: '#44BC9B', dashed: true },
    ];
    items.forEach(item => {
      const li = document.createElement('span');
      li.className = 'legend__item';
      li.innerHTML = `
        <span class="legend__swatch"
              style="background:${item.color}; ${item.dashed ? 'border:1px dashed var(--charcoal);' : ''}"></span>
        ${item.label}
      `;
      els.legend.appendChild(li);
    });
  }

  // ============ Filters ============

  function passesFilters(booking) {
    const { status } = state.filters;
    if (org.length && !org.includes(booking.org)) return false;
    if (status === 'booked') return true; // bookings always count
    if (status === 'open') return false;   // hide bookings
    return true;
  }

  // ============ Booking + overlay computation ============

  function bookingsForDate(date) {
    const dateStr = isoDateOnly(date);
    return getBookings().filter(b => b.startISO.startsWith(dateStr));
  }

  function computeTimeBounds() {
    const opHours = getOperatingHours();
    let minMin = hhmmToMin(opHours.start);
    let maxMin = hhmmToMin(opHours.end);

    // Extend to cover any booking that runs outside operating hours
    for (let d = 0; d < 7; d++) {
      const date = addDays(state.weekStart, d);
      const dayBookings = bookingsForDate(date);
      dayBookings.forEach(b => {
        const s = isoToMin(b.startISO);
        const e = isoToMin(b.endISO);
        if (s < minMin) minMin = s;
        if (e > maxMin) maxMin = e;
      });
      // VSB extends bounds too
      const vsb = computeVsbBlockForDate(date, 0);
      if (vsb) {
        if (vsb.startMin < minMin) minMin = vsb.startMin;
        if (vsb.endMin > maxMin) maxMin = vsb.endMin;
      }
    }
    // Snap to whole hours
    minMin = Math.floor(minMin / 60) * 60;
    maxMin = Math.ceil(maxMin / 60) * 60;
    return { startMin: minMin, endMin: maxMin };
  }

  function computeVsbBlockForDate(date, gridStartMin) {
    const cfg = getVsbConfig();
    if (!cfg) return null;
    if (!cfg.days.includes(date.getDay())) return null;
    if (!isInSchoolYear(date, cfg.schoolYear)) return null;

    return {
      startMin: hhmmToMin(cfg.timeStart),
      endMin: hhmmToMin(cfg.timeEnd),
    };
  }

  function isInSchoolYear(date, sy) {
    if (!sy) return true;
    const m = date.getMonth() + 1; // 1-12
    const d = date.getDate();
    // School year wraps across calendar years: Sep 1 - Jun 30.
    if (m === sy.startMonth && d >= sy.startDay) return true;
    if (m > sy.startMonth) return true;
    if (m < sy.endMonth) return true;
    if (m === sy.endMonth && d <= sy.endDay) return true;
    return false;
  }

  function computeGapBlocks(date, bookings, vsbBlock, gridStartMin) {
    const op = getOperatingHours();
    const opStart = hhmmToMin(op.start);
    const opEnd = hhmmToMin(op.end);

    const occupied = [];
    bookings.forEach(b => {
      occupied.push([
        Math.max(opStart, isoToMin(b.startISO)),
        Math.min(opEnd, isoToMin(b.endISO)),
      ]);
    });
    if (vsbBlock) {
      occupied.push([
        Math.max(opStart, vsbBlock.startMin),
        Math.min(opEnd, vsbBlock.endMin),
      ]);
    }
    occupied.sort((a, b) => a[0] - b[0]);

    const merged = [];
    occupied.forEach(seg => {
      if (!merged.length || seg[0] > merged[merged.length - 1][1]) {
        merged.push(seg.slice());
      } else {
        merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], seg[1]);
      }
    });

    const rawGaps = [];
    let cursor = opStart;
    merged.forEach(seg => {
      if (seg[0] > cursor) rawGaps.push([cursor, seg[0]]);
      cursor = Math.max(cursor, seg[1]);
    });
    if (cursor < opEnd) rawGaps.push([cursor, opEnd]);

    const EVENING = 18 * 60; // 6 PM

    const result = [];
    rawGaps.forEach(([start, end]) => {
      const dur = end - start;
      if (dur <= 30 && start >= EVENING - 30) {
        result.push({ startMin: start, endMin: end, type: 'spacer' });
        return;
      }
      if (start < EVENING && end > EVENING) {
        result.push({ startMin: start, endMin: EVENING, type: 'cpt' });
        result.push({ startMin: EVENING, endMin: end, type: 'available' });
      } else {
        result.push({
          startMin: start,
          endMin: end,
          type: start < EVENING ? 'cpt' : 'available',
        });
      }
    });
    return result;
  }

  // ============ Render helpers ============

  function renderBooking(booking, gridStartMin) {
    const startMin = isoToMin(booking.startISO);
    const endMin = isoToMin(booking.endISO);
    const top = (startMin - gridStartMin) * (HOUR_HEIGHT / 60);
    const height = (endMin - startMin) * (HOUR_HEIGHT / 60);

    const block = document.createElement('div');
    block.className = 'booking';
    block.style.top = `${top}px`;
    block.style.height = `${Math.max(height, 28)}px`;
    block.style.background = getOrgColor(booking.orgKey);

    block.innerHTML = `
      <div class="booking__org">${booking.org}</div>
      <div class="booking__time">${formatTime(booking.startISO)} – ${formatTime(booking.endISO)}</div>
      ${booking.notes ? `<div class="booking__notes">${booking.notes}</div>` : ''}
    `;
    block.addEventListener('click', () => openMobileSheet({
      title: booking.org,
      time: `${formatTime(booking.startISO)} – ${formatTime(booking.endISO)}`,
      date: formatDateLong(new Date(booking.startISO)),
      notes: booking.notes,
    }));
    return block;
  }

  function renderVsbOverlay(vsbBlock) {
    const top = (vsbBlock.startMin - getMinFromGridStart()) * (HOUR_HEIGHT / 60);
    const height = (vsbBlock.endMin - vsbBlock.startMin) * (HOUR_HEIGHT / 60);
    const timeStr = formatMinToTime(vsbBlock.startMin) + ' – ' + formatMinToTime(vsbBlock.endMin);
    const div = document.createElement('div');
    div.className = 'vsb-overlay';
    div.style.top = `${top}px`;
    div.style.height = `${height}px`;
    div.innerHTML = '<div class="booking__org">Vancouver School Board</div><div class="booking__time">' + timeStr + '</div>';
    return div;
  }

  function renderGapBlock(gap) {
    const gridStart = getMinFromGridStart();
    const top = (gap.startMin - gridStart) * (HOUR_HEIGHT / 60);
    const height = (gap.endMin - gap.startMin) * (HOUR_HEIGHT / 60);

    const div = document.createElement('div');
    div.style.top = `${top}px`;
    div.style.height = `${height}px`;

    if (gap.type === 'spacer') {
      return div;
    }

    const timeStr = formatMinToTime(gap.startMin) + ' – ' + formatMinToTime(gap.endMin);

    if (gap.type === 'cpt') {
      div.className = 'cpt-block';
      div.innerHTML = '<div class="booking__org">Community Play Time</div>' +
        '<div class="booking__time">' + timeStr + '</div>';
    } else {
      div.className = 'available-overlay';
      div.innerHTML = '<div class="booking__org">Booking Available</div>' +
        '<div class="booking__time">' + timeStr + '</div>';
    }

    return div;
  }

  function formatMinToTime(min) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = ((h + 11) % 12) + 1;
    const mm = m === 0 ? '' : ':' + String(m).padStart(2, '0');
    return h12 + mm + ' ' + ampm;
  }

  function getMinFromGridStart() {
    return computeTimeBounds().startMin;
  }

  // ============ Mobile bottom sheet ============

  function openMobileSheet(detail) {
    els.mobileSheetContent.innerHTML = `
      <h3>${detail.title}</h3>
      <p><strong>Date:</strong> ${detail.date}</p>
      <p><strong>Time:</strong> ${detail.time}</p>
      ${detail.notes ? `<p><strong>Notes:</strong> ${detail.notes}</p>` : ''}
    `;
    els.mobileSheet.hidden = false;
  }
  function closeMobileSheet() {
    els.mobileSheet.hidden = true;
  }

  // ============ Time + date utilities ============

  function getWeekStart(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay()); // Sunday-start
    return d;
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
  function isoDateOnly(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  function isoToMin(iso) {
    const [, time] = iso.split('T');
    return hhmmToMin(time);
  }
  function hhmmToMin(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + (m || 0);
  }
  function formatTime(iso) {
    const [, time] = iso.split('T');
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = ((h + 11) % 12) + 1;
    const mm = m === 0 ? '' : ':' + String(m).padStart(2, '0');
    return `${h12}${mm} ${ampm}`;
  }
  function formatHourLabel(h) {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = ((h + 11) % 12) + 1;
    return `${h12} ${ampm}`;
  }
  function formatDateLong(d) {
    return `${DAY_NAMES_LONG[d.getDay()]}, ${MONTH_NAMES_SHORT[d.getMonth()]} ${d.getDate()}`;
  }
  function uniqueOrgs(bookings) {
    const seen = new Map();
    bookings.forEach(b => seen.set(b.orgKey, b.org));
    return Array.from(seen.entries()).map(([key, label]) => ({ key, label }));
  }

  // ============ Go ============

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
