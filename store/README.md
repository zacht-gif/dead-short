# Store assets

Drafts for the itch.io page. You take the cover through your own pass; everything here is a starting
point, not a finished asset.

| file | what it is |
|---|---|
| `cover.svg` | 630×500 cover art, all original vector geometry |
| `itch-page.md` | Page copy, upload settings, tags, and a pre-publish checklist |

## The cover

`cover.svg` is drawn at itch's cover size (630×500, the minimum being 315×250). Export it to PNG at
2× — 1260×1000 — so it stays sharp on high-DPI screens.

**Why it's an SVG and not a PNG:** every mark in it is original vector geometry — the bolt is a
polygon, the wires are paths, the pads are circles. Nothing is a system emoji glyph. That matters:
Segoe UI Emoji and Apple Color Emoji are licensed fonts, and using one of their glyphs as the
centrepiece of distributed artwork isn't clearly permitted by those EULAs. The game's in-game emoji
are fine, because those render from the *player's* own font and are never redistributed.

Two things to handle in your pass:

1. **The wordmark uses a generic sans stack**, so it renders differently depending on the machine.
   Convert the text to outlines before exporting, or set it in whatever face you want the game to be
   known by.
2. **The board in the art is a real position** — three nested pairs routed around two components,
   with one wire still filling and its remaining route shown as a dotted plan. Worth keeping that
   honest if you rework it; it's the clearest single image of what the game actually is.

## Screenshots

```bash
node shots.mjs            # all of them, into store/screenshots/
node shots.mjs editor     # just the ones whose id contains "editor"
```

These are **generated, not captured by hand**. Every in-game position comes from
`__wiredDev.ui.stageSolution()`, which replays a solution the solver proved and stops partway — so the
marketing images carry the same guarantee the game does. Nothing is posed, and nothing shows a position
a player could not have reached by the rules. Nothing in `shots.mjs` knows a pixel coordinate either, so
a UI change means re-running one command rather than re-staging four screenshots by hand.

Captures are **byte-reproducible**: run it twice and the PNGs hash identically. That is what the Chrome
flag list in `chrome.mjs` buys, and why the looping animations are pinned to t=0 before the shutter.

| id | what it shows |
|---|---|
| `01-mid-run` | Logic Array two thirds through its proven solution — energised wire, the dotted route still to fill, components, a gate mid-cycle, a spark on its outlined cell |
| `02-menu` | All ten levels, the daily with its streak, per-level gold. Height is measured, so an eleventh level lengthens the shot instead of being cropped out |
| `03-settings` | The accessibility options, which are a selling point rather than a footnote |
| `04-editor` | The differentiator: a board loaded through the real paste-a-code path, with the green *Verified solvable. Par 3.3s (20 ticks)* verdict showing |
| `05-board-sealed` | Fault Line with the outer pair run tight along row 1 — the red banner naming the pair that got stranded. The route is `SEAL_DEMO` in `index.html`, shared with the suite, so this picture cannot advertise a warning the tests no longer prove |
| `cover` | `cover.svg` rendered at 1260x1000, i.e. itch's 630x500 cover at 2x |

A short GIF of a wire filling along its dotted route and stopping at a live gate would sell the mechanic
better than any still. cut-and-fill has a working `tools/gif.mjs` built on this same CDP plumbing, so
that is a port rather than a build if it is wanted.

## Before publishing

See the checklist at the end of `itch-page.md` — in particular the `CANONICAL_URL` decision and the
note about the name.
