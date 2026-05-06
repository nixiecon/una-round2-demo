# UNA Round 2 — Prototype Demos

Public demo of three redesign prototypes for [myuna.ca](https://myuna.ca), built as a follow-up to the [Drop-In Calendar redesign](https://nixiecon.github.io/una-dropin-calendar-demo/).

**Live demo:** https://nixiecon.github.io/una-round2-demo/

## Contents

| Page | Path | Replaces |
|---|---|---|
| Community Field Schedule | [`/field-schedule/`](./field-schedule/) | `myuna.ca/bookings/` |
| Events Calendar — month grid | [`/events-calendar/month-grid.html`](./events-calendar/month-grid.html) | `myuna.ca/events/` (month view) |
| Single Event Page CSS | [`/events-calendar/single-event/preview.html`](./events-calendar/single-event/preview.html) | individual `/event/...` pages |

## Tech

Vanilla HTML / CSS / JS. No build step. No framework. Brand tokens (`--una-green`, `--bright-yellow-lighter`, etc.) copied from the Drop-In Calendar so the visual language is consistent across all four prototypes.

- **Field Schedule** pulls from PerfectMind via a forked adapter (`perfectmind-field-adapter.js`).
- **Events Calendar** pulls from The Events Calendar plugin's public WP REST endpoint (`/wp-json/tribe/events/v1/events`).
- **Single Event Page** is CSS-only — no PHP, no template overrides; drops into Customizer → Additional CSS.

## Status

- **Field Schedule** — full prototype, ready for Glenda review.
- **Events Calendar (month grid + single event)** — preview only, direction-check. Final implementation paused until the Drop-In Calendar ships in WordPress; we'll mirror that PHP integration pattern for these.

Color assignments and a handful of design decisions are placeholders — see `events-calendar/QUESTIONS-FOR-GLENDA.md`.
