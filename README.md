# UNA Community Field Schedule — Prototype

Public demo of the Community Field Schedule redesign for [myuna.ca](https://myuna.ca), built as a follow-up to the [Drop-In Calendar redesign](https://nixiecon.github.io/una-dropin-calendar-demo/).

**Live demo:** https://nixiecon.github.io/una-round2-demo/field-schedule/

## Contents

| Page | Path | Replaces |
|---|---|---|
| Community Field Schedule | [`/field-schedule/`](./field-schedule/) | `myuna.ca/bookings/` |

## Tech

Vanilla HTML / CSS / JS. No build step. No framework. Brand tokens (`--una-green`, `--bright-yellow-lighter`, etc.) copied from the Drop-In Calendar so the visual language is consistent.

The Field Schedule pulls from PerfectMind via a forked adapter (`perfectmind-field-adapter.js`). Same integration pattern as the live Drop-In Calendar: the WordPress/PHP layer fetches PerfectMind server-side and injects the feed as a global JS array (`window.UNA_FIELD_LIVE_DATA`), then the vanilla-JS renderer draws it client-side. No runtime fetch.

## Status

Full prototype, ready for review. Color assignments and a handful of design decisions are placeholders pending Glenda's sign-off.
