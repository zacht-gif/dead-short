# itch.io page copy — Wired

Everything on this page is ready to paste into the itch.io project form. Build
the upload first with `.\tools\build.ps1`.

---

## Project settings

| Field | Value |
|---|---|
| **Title** | Wired |
| **Project URL** | `wired` |
| **Short description / tagline** | Connect every pair. Dodge the current. Race the clock. |
| **Classification** | Game |
| **Kind of project** | HTML |
| **Release status** | Released |
| **Pricing** | Free (or "No payments") |
| **Uploads** | `dist/wired-v1.0.zip` — tick **This file will be played in the browser** |
| **Embed options** | Manually set size: **1280 × 800**, tick **Fullscreen button**, tick **Mobile friendly** (orientation: default) |
| **Cover image** | `screenshots/cover-630x500.png` |
| **Screenshots** | `screenshots/wide-menu.png`, `screenshots/wide-play.png`, `screenshots/wide-settings.png` |
| **Tags** | puzzle, offline, singleplayer, mobile-friendly, minimalist, timing, html5, no-ads |
| **Genre** | Puzzle |
| **Average session** | A few minutes |
| **Inputs** | Mouse, touchscreen, keyboard |
| **Accessibility** | Colorblind-friendly, configurable controls, one-handed play, subtitles not applicable |

---

## Description

> A circuit-wiring puzzle that never rolls a die.

Wire every pair of terminals together before the clock gets away from you. Paths
can't cross. Sparks patrol the board on fixed, repeating tracks — touch one with
an unfinished wire and it shorts out, and three seconds go on your score.

Nothing here is random. Every spark's route is drawn on the board before you
start, and **Trace** will show you exactly where each one will be one, two and
three seconds from now — free, and as often as you like. The clock doesn't start
until your first move, so you can plan the whole run and then go fast.

Your score is your solve time plus a penalty for every short, which means
precision counts as much as speed. There's no luck to blame for a bad run, and
none to thank for a good one — just better routing.

**Features**

- Three hand-built levels, plus a **daily challenge** everyone gets the same
  board for — with a streak counter
- **Gold, silver and bronze** time cutoffs on every level
- **Challenge links** that carry your score in the URL, so you can dare someone
  directly with no account and no server
- **Unlockable skins** that are strictly cosmetic — they can't touch timing or
  scoring, so every run stays comparable
- **Colorblind mode** that gives every wire its own shape and dash pattern, not
  just its own hue, plus reduce-motion and mute
- Plays with touch, mouse, or keyboard alone
- **Works completely offline. No ads, no tracking, no accounts, no network
  requests at all.** Add it to your home screen and it keeps working on a plane.

---

## Controls

**Touch** — drag from a dot along the path you want, or tap cell by cell.
**Mouse** — click and drag, or click cell by cell.
**Keyboard** — `Tab` / `Shift+Tab` pick a wire, arrows or `WASD` extend it one
cell at a time, `Backspace` steps back, `Enter` or `Space` grabs a wire when
none is selected.

---

## Devlog / first post

**Wired is out.**

It started as a question left over from Cut & Fill: how much tension can you get
out of a puzzle with no randomness in it at all? Wired's answer is a spark on a
fixed track and a clock that only starts when you do. You can stand there and
read the whole board for as long as you want. The moment you commit, every
mistake is yours.

The whole game is one HTML file with no dependencies, so it works offline the
moment it finishes loading, and it'll still run in ten years.

---

## Notes for whoever posts this

- The **install prompt won't appear inside itch.io's iframe** — itch serves HTML
  games from its own domain and the manifest is ignored there. That's expected,
  not a bug. Host the same zip contents on a static site as well if you want the
  installable PWA.
- Set the release date when publishing, not before — itch.io uses it for
  visibility on the browse pages.
- Screenshots are generated, not hand-captured: re-run
  `node tools/make-screenshots.mjs` after any UI change so the store art matches
  the build.
