# itch.io page copy — Dead Short

Draft copy for the store page. Everything below is ready to paste; the cover
still needs your finishing pass (see `store/README.md`).

---

## Title

**Dead Short**

## Short description / tagline
*(itch's one-line field, shown in listings — keep it under ~140 chars)*

> Route every pair without crossing, then time the current past the sparks. No randomness anywhere — the only variable is you.

---

## Page body

**Dead Short is a circuit puzzle that never rolls a die.**

Drag a route from each solder pad to its matching pair. Drawing is free and instant — but current
flows one cell at a time, down one route at a time, and the clock is running while it does. Routes
can't cross each other or the components soldered to the board, so the order you energize them
decides what's still possible.

Sparks patrol fixed, repeating tracks. The cell a spark is sitting on is outlined, and that outline
is the hitbox exactly — no guessing, no pixel-perfect margins. Let live current touch it and that
wire shorts out. Your drawn route survives; only the current is lost.

### Every level is machine-proved

Most puzzle games ask you to trust that a level is beatable. This one can prove it.

- **No board ships unless a solver proves every pair connectable.** That includes the daily and
  anything made in the editor.
- **Par isn't a designer's guess.** It's a schedule the game replays through its own engine before
  showing it to you. Gold is set at par, so gold is always reachable.
- **Difficulty is measured, not asserted.** Levels are ordered by how much routing and timing they
  actually demand — which is not the same as how long they take. The finale has a *lower* par than
  the level before it.
- **The game tells you when you've sealed the board.** Finishing a wire is permanent, so a wire
  completed along the wrong route can strand another pair. Dead Short notices and says which pair, rather
  than letting you keep trying at something that can't be finished.

### What's in it

- **10 hand-built levels**, from a two-pair tutorial to a finale where three quarters of the routes
  you might reasonably draw will seal the board.
- **A daily challenge** — the same board for everyone, generated and verified fresh each day, with a
  streak counter.
- **A board editor** with share codes. Build something, and if the solver can prove it finishable
  you get a short code to paste into chat. Codes carry no score to fake: par is worked out again on
  whoever's machine opens it.
- **Challenge links** that greet a friend with your time as the target.
- **Unlockable board skins**, earned by clean clears.

### Built to be played anywhere

One HTML file, no account, no tracking, and no network calls of any kind — the page is about 63 KB
over the wire. Plays with mouse, touch, or entirely by keyboard.

**Accessibility** is shipped, not planned: every wire carries a distinct shape *and* a distinct dash
pattern for all players, so colour is never the only signal. There's a colourblind palette verified
pairwise under deuteranopia, protanopia and tritanopia — not just one colour at a time — plus a
Reduce Motion option that genuinely disables the pulsing and flashing rather than toning it down.

---

## Controls

| | |
|---|---|
| **Mouse / touch** | Drag from a pad to its matching pair to lay a route. Tap cell by cell if you prefer. |
| **Tap a colour** | Hand the current to that wire immediately |
| **Trace** | Shows where every spark will be 1, 2 and 3 seconds from now — free, unlimited |
| **Tab / Shift+Tab** | Select a wire |
| **Arrows or WASD** | Extend its route one cell |
| **Backspace** | Step back |
| **Enter / Space** | Grab a wire if none is selected |

The board stays frozen until your first move, so plan as long as you like.

---

## itch.io upload settings

- **Kind of project:** HTML
- **Upload:** `dist/dead-short-2.0.0.zip`, ticked **"This file will be played in the browser"**
- **Embed size:** 720 × 900
- **Options:** ✅ Fullscreen button ✅ Mobile friendly ✅ Automatically start on page load
- **Pricing:** No payment — with donations enabled
- **Release status:** Released
- **Genre:** Puzzle
- **Average session:** A few minutes
- **Inputs:** Mouse, Touchscreen, Keyboard
- **Accessibility:** Colorblind friendly, Configurable controls (keyboard play), One button *(no)*
- **Multiplayer:** Singleplayer

### Suggested tags

`puzzle` · `logic` · `singleplayer` · `html5` · `minimalist` · `pathfinding` · `level-editor`
· `daily` · `no-ads` · `colorblind-friendly`

### Notes for the description footer

> Dead Short is free to play. If you want to throw something in the tip jar, thank you — it goes straight
> into the next one.
>
> Boards shared by players are created by them and exchanged as text codes; nothing is uploaded or
> hosted here.

---

## Things to double-check before you hit publish

1. **Set `CANONICAL_URL`** in `index.html`, and do it in this order, because the URL bakes in:

   1. **Rename the GitHub repo** `wired` → `dead-short` (Settings → General). GitHub redirects the
      old name, so nothing breaks, but the Pages URL is derived from the repo name — rename after
      enabling Pages and every link already shared points at the old one.
   2. **Enable Pages** (Settings → Pages → Source: Deploy from a branch → `main` / root). The repo
      is public as of 2026-09-16, so this is available. Confirm the game loads there before step 3.
   3. **Set `CANONICAL_URL = 'https://zacht-gif.github.io/dead-short/'`** and re-run `node build.js`.

   Leave it empty until Pages is actually serving: an empty value degrades gracefully, a URL that
   404s does not. The three options, for the record:

   - **Leave it `''` (fine for launch).** `challengeUrl()` falls back to `location.href`, which inside
     an itch embed is the `html-classic.itch.zone` URL of `index.html` itself. That is a static file
     served directly, so the query string reaches the game and the challenge *should* survive — but
     itch regenerates that URL on **every upload**, so old links rot each time you ship a version.
     Read off the code rather than tested against a live page; check one real link on launch day.
   - **Point it at a page you serve `index.html` from** (GitHub Pages and the like). Permanent, tidy
     links. This is the upgrade if sharing turns out to matter; it is not worth delaying launch for.
   - **Do not point it at the itch store page.** itch does not forward query strings into the
     embedded game, so every challenge link would silently lose its challenge — strictly worse than
     leaving it empty.

   The share sheet always carries the readable result text as well, so the social payload survives
   whichever you pick. Only the deep link is at stake.
2. **Re-run `node build.js`** so the zip matches whatever you last changed. Eight gates have to pass
   before it will package anything — see README, `Building for release`.
3. **Re-run `node shots.mjs`** if the UI moved at all. The screenshots and the cover are generated
   from the real game, so a UI change makes them stale in exactly the way a build goes stale. Upload
   `store/screenshots/`: `01-mid-run`, `02-menu`, `03-settings`, `04-editor`, `05-board-sealed`, and
   `cover.png` for the cover slot.
4. **The name — settled 2026-09-16, kept here as the record.** The game was *Wired*, which is a
   Condé Nast trademark and could not be searched for regardless. It is now **Dead Short**.

   The rename was display-layer only. These keep the old name, and the suite now pins all three
   literals so a later find-and-replace fails loudly instead of silently:

   | keep as-is | renaming it would |
   |---|---|
   | `STORE_PREFIX = 'wired-v3-'` | wipe every player's saved scores and settings |
   | `LEGACY_SETTINGS_KEY = 'wired-v2-settings'` | break the migration from the older save format |
   | `DAILY_SEED_PREFIX = 'wired-daily-v3-'` | change **every daily board**, past and future |
   | `__wiredDev` / `__wiredSelfTest` | break `test.js`, `solve.js` and `shots.mjs` at once |

   A find-and-replace over the whole file is the failure mode here, not the fix. The rule that
   falls out of it: **anything still spelled `wired` is load-bearing.**
