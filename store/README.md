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

I can't write PNGs to disk from here, so these need capturing from a real browser. Serve the game
(`python -m http.server 8000`) and grab these four — they're the states that show the game best, and
I've checked each one looks right:

1. **Mid-run on Logic Array.** Draw the nested routes and screenshot while the outer wire is still
   filling: you get energized wire, dotted planned route, three components, a gate counting down and
   a spark with its danger cell outlined — the whole vocabulary in one frame.
2. **The menu.** Shows the ten levels, the daily with its streak, and per-level gold targets.
3. **The editor, verified.** Build a board and hit Verify so the green *"Verified solvable. Par …"*
   panel is showing. This is the differentiator — lead with it.
4. **The board-sealed warning.** On Fault Line, run the outer pair tight along row 1; the red banner
   naming the stranded pair appears once it locks.

A short GIF of a wire filling along its dotted route and stopping at a live gate would sell the
mechanic better than any still, if you want one.

## Before publishing

See the checklist at the end of `itch-page.md` — in particular the `CANONICAL_URL` decision and the
note about the name.
