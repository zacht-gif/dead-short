#!/usr/bin/env node
// Mutation audit: break the game on purpose, one defect at a time, and check
// that something notices.
//
//   node mutate.js            run every mutation
//   node mutate.js seal       only mutations whose id contains "seal"
//   node mutate.js --list     print the catalogue and exit
//
// WHY THIS EXISTS
//
// Every gate in this repo was written because some failure is invisible in a
// browser. But a gate that has never fired has not been shown to work — it has
// only been shown not to complain, which is the same thing a gate that is
// silently disabled does. The suite going green proves the code passes the
// tests; it does not prove the tests would fail if the code were wrong.
//
// So each entry below is a real defect, several of them bugs this project
// actually shipped. The audit applies one, runs the full build chain, and
// records whether anything went red. A mutation that SURVIVES is the finding:
// it means that defect could be introduced today and every check would pass.
//
// SAFETY
//
// Source files are edited in place and restored in a finally block. The run
// refuses to start on a dirty tree, so if it is ever killed mid-mutation the
// recovery is `git checkout -- .` with nothing of yours at stake.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = __dirname;
const LIST = process.argv.includes('--list');
const VERBOSE = process.argv.includes('--verbose');
const filter = process.argv.slice(2).find(a => !a.startsWith('--'));

// Files a mutation may touch. Snapshotted whole and restored verbatim.
const VOLATILE = ['index.html', 'sw.js', 'icon.svg', 'manifest.json', 'CODE-MAP.md'];

/* ------------------------------ the catalogue ----------------------------- */
//
// `expect` is a substring of the message the audit should see. It is not
// cosmetic: a mutation caught by the WRONG gate is only accidentally caught,
// and the next edit could move it out from under that gate without anyone
// noticing. Matching the message is what tells the two apart.

const MUTATIONS = [
  {
    id: 'stale-codemap',
    file: 'index.html',
    find: '<meta name="theme-color" content="#0a0e17">',
    replace: '<meta name="theme-color" content="#0a0e17">\n<!-- a line nobody indexed -->',
    refreshMap: false,              // the point of this one is the stale map
    expect: 'CODE-MAP.md is out of date',
    note: 'index.html edited without regenerating the map',
  },
  {
    id: 'sw-cache-name',
    file: 'sw.js',
    find: "const CACHE_NAME = 'wired-v2.0.0';",
    replace: "const CACHE_NAME = 'wired-v1';",
    expect: 'CACHE_NAME',
    note: 'returning players keep being served the old build from cache',
  },
  {
    id: 'external-script',
    file: 'index.html',
    find: '<link rel="manifest" href="manifest.json">',
    replace: '<link rel="manifest" href="manifest.json">\n<script src="https://cdn.example.com/x.js"></script>',
    expect: 'no longer self-contained',
    note: 'the zero-dependency rule broken by one tag',
  },
  {
    id: 'debug-scaffolding',
    file: 'index.html',
    find: '  // ---------- Boot ----------',
    replace: '  // TODO: take this out before shipping\n  // ---------- Boot ----------',
    expect: 'debug scaffolding',
    note: 'a parked note shipped in the game file',
  },
  {
    id: 'icon-art-drift',
    file: 'icon.svg',
    find: 'M56 12 L28 56',
    replace: 'M57 12 L28 56',
    expect: 'bolt path in make-icons.mjs',
    note: 'icon.svg redrawn, PNGs left rasterised from the old art',
  },
  {
    id: 'unshipped-asset',
    file: 'manifest.json',
    find: '    {\n      "src": "icons/icon-192.png",',
    replace: '    {\n      "src": "icons/icon-1024.png",\n      "sizes": "1024x1024",\n      "type": "image/png",\n      "purpose": "any"\n    },\n    {\n      "src": "icons/icon-192.png",',
    expect: 'not in RUNTIME_FILES',
    note: 'the manifest names a file the zip would not contain',
  },
  {
    id: 'handoff-is-free',
    file: 'index.html',
    find: '        setActiveColor(i);\n        return;\n      }\n    }\n    activeColor = null;',
    replace: '        activeColor = i;\n        return;\n      }\n    }\n    activeColor = null;',
    expect: 'the automatic handoff charges a move',
    note: 'THE Mainframe bug: automatic handoff costs no tick, so ordinary play beats par',
  },
  {
    id: 'free-switch-charges',
    file: 'index.html',
    find: "        pendingSwitchTicks = 0;",
    replace: "        pendingSwitchTicks = 0; stepTick();",
    expect: 'par replays to a win',
    note: 'the model charges for a switch the engine gives away — the same bug mirrored',
  },
  {
    id: 'patrol-negative-tick',
    file: 'index.html',
    find: 'const at = (i)=> ob.path[((i % n) + n) % n];',
    replace: 'const at = (i)=> ob.path[i % n];',
    expect: 'patrol renders at a negative tick',
    note: 'first rendered frame of every patrol level throws again',
  },
  {
    id: 'par-contract-drift',
    file: 'index.html',
    find: '    "mainframe":     34,',
    replace: '    "mainframe":     33,',
    expect: 're-derived par matches the original',
    note: 'a committed par no longer matches what the solver derives',
  },
  {
    id: 'seal-never-fires',
    file: 'index.html',
    find: '    if(!open.length) return null;',
    replace: '    if(!open.length) return null;\n    return null;',
    expect: 'sealing the board is detected',
    note: 'the board-sealed warning goes permanently quiet',
  },
  {
    id: 'seal-demo-stops-sealing',
    file: 'index.html',
    find: '    route: [[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[6,0]],',
    replace: '    route: [[1,0],[2,0],[3,0],[4,0],[5,0],[6,0]],',
    // Chosen so the wire still FINISHES and only the sealing changes — a route
    // that failed to finish would trip an earlier assertion and prove less.
    expect: 'sealing it is detected on a real board',
    note: 'the route the store screenshot photographs no longer seals the board',
  },
  {
    id: 'itch-slug-disagrees',
    file: 'index.html',
    // Mutating the URL rather than publish.mjs keeps the edit inside VOLATILE,
    // and proves the same thing: the two names are compared, not assumed equal.
    find: "  const CANONICAL_URL = 'https://thornsrl.itch.io/dead-short';",
    replace: "  const CANONICAL_URL = 'https://thornsrl.itch.io/dead-shorts';",
    expect: 'named twice and the two disagree',
    note: 'links point at one itch project while the upload goes to another',
  },
  {
    id: 'custom-board-code-dropped',
    file: 'index.html',
    // Anchored on the condition, not the string, so no escape sequence has to
    // survive being written into this file - which has broken it twice today.
    find: "    if(level.isCustom && level.code){",
    replace: "    if(false && level.isCustom && level.code){",
    expect: 'carries its code in the text too',
    note: 'a shared custom board becomes unreachable: itch drops the ?board= param',
  },
  {
    id: 'other-url-on-canonical-host',
    file: 'index.html',
    // The allowlist exempts CANONICAL_URL's exact value. If it were written as
    // a host prefix instead, this would sail through - so prove it does not.
    find: "  const MIN_CELL = 32, MAX_CELL = 64;",
    replace: "  const MIN_CELL = 32, MAX_CELL = 64; const NOT_THE_CANONICAL_ONE = 'https://zacht-gif.github.io/dead-short/tracker.js';",
    expect: 'an http(s) URL in the document',
    note: 'a second URL on the canonical host slips past the self-contained gate',
  },
  {
    // ---- turn-based: the render loop must not be able to spend a move ----
    id: 'render-loop-spends-moves',
    file: 'index.html',
    find: "  function tick(now){",
    replace: "  function tick(now){ if(screen === 'play' && running && !won) stepTick();",
    expect: 'the render loop advances the simulation',
    note: 'the board plays itself again while you think, and every test still passes',
  },
  {
    id: 'fixed-timestep-accumulator-returns',
    file: 'index.html',
    find: "  const ZAP_PENALTY_TICKS = 5;",
    replace: "  const ZAP_PENALTY_TICKS = 5; const MS_PER_TICK = 1000 / 6;",
    expect: 'a fixed-timestep accumulator is back',
    note: 'the metronome creeps back in as a constant nobody notices',
  },
  {
    // The Mainframe bug, third time. advanceToNextPlanned() nulls activeColor
    // when a wire locks, so this condition makes the next pick-up read as a
    // FIRST selection and come free - a move par has already charged for.
    id: 'automatic-handoff-is-free-again',
    file: 'index.html',
    find: "    if(running) pendingSwitchTicks = 1;",
    replace: "    if(activeColor !== null && running) pendingSwitchTicks = 1;",
    expect: 'player path costs exactly par',
    note: 'picking up a wire after one finishes is free, so ordinary play beats par',
  },
  {
    // The other direction: replaySolution sets running before issuing actions,
    // so an 'F' action arrives with a switch already queued and has to clear it.
    id: 'free-switch-still-owes-a-move',
    file: 'index.html',
    find: "        pendingSwitchTicks = 0;",
    replace: "        ;",
    expect: 'par replays to a win',
    note: "the solver's free first selection quietly costs a tick, so every replay misses par",
  },
  {
    // Charge per input EVENT rather than per unit step and a flick that skips
    // cells between pointer samples buys them. planTo walks the gap itself, so
    // this is the whole of what keeps a fast hand from being a cheat code.
    id: 'drag-charged-per-event-not-per-cell',
    file: 'index.html',
    find: "      if(!takeTurn()) return;",
    replace: "      if(guard > 1) continue; if(!takeTurn()) return;",
    expect: 'a flick and a cell-by-cell drag cost the same',
    note: 'a fast drag lays several cells for one move; a slow one pays for each',
  },
  {
    id: 'waiting-is-free',
    file: 'index.html',
    find: "  function waitMove(){",
    replace: "  function waitMove(){ return;",
    expect: 'waiting spends exactly one move',
    note: 'every hazard becomes dodgeable for nothing, so timing stops being a cost',
  },
  {
    id: 'wait-button-unwired',
    file: 'index.html',
    find: "  document.getElementById('waitBtn').onclick = ()=>{ waitMove(); };",
    replace: "  ;",
    expect: 'nothing is wired to it',
    note: 'a touch player has no way to let a spark pass, and nothing goes red',
  },
  {
    id: 'move-row-left-out-of-the-board-budget',
    file: 'index.html',
    find: "    const availableH = isLandscapeCompact ? (window.innerHeight - 90 - MOVE_ROW_PX) : Infinity;",
    replace: "    const availableH = isLandscapeCompact ? (window.innerHeight - 90) : Infinity;",
    expect: 'no longer reserves height for the Wait/Trace row',
    note: 'the Wait button falls off the bottom of a landscape phone',
  },
  {
    // A high-water mark instead of the first gap. Clearing a later board from
    // the catalogue or a challenge link then carries the button past one you
    // have never played.
    id: 'campaign-position-is-a-high-water-mark',
    file: 'index.html',
    find: "    return LEVELS.find(lv => getBest(lv) === null) || LEVELS[LEVELS.length-1];",
    replace: "    return LEVELS[LEVELS.filter(lv => getBest(lv) !== null).length] || LEVELS[LEVELS.length-1];",
    expect: 'does not skip the one before it',
    note: 'clearing a later board out of order makes Continue skip an unplayed one',
  },
  {
    id: 'next-level-forgets-where-you-came-in',
    file: 'index.html',
    find: "    if(screen === 'home' || screen === 'menu') playReturn = screen;",
    replace: "    playReturn = screen;",
    expect: 'Next remembers the hub you came from',
    note: 'Next overwrites the hub with "play", so Menu sends you somewhere you never were',
  },
  {
    // ---- the time trial: a fixed clock, and it is the ONLY driver ----
    id: 'render-loop-drives-the-metronome',
    file: 'index.html',
    find: "      if(screen === 'play'){",
    replace: "      if(screen === 'play'){ metronomeTick();",
    expect: 'the render loop advances the simulation',
    note: 'the board steps once per painted frame - 144/sec on a monitor, 30 on a phone',
  },
  {
    id: 'metronome-rate-is-a-literal',
    file: 'index.html',
    find: "    metronomeId = setInterval(metronomeTick, Math.round(1000 / TRIAL_HZ));",
    replace: "    metronomeId = setInterval(metronomeTick, 333);",
    expect: 'the metronome no longer beats at TRIAL_HZ',
    note: 'the rate can drift away from the number Settings promises the player',
  },
  {
    id: 'trial-rate-is-unplayable',
    file: 'index.html',
    find: "  const TRIAL_HZ = 3;",
    replace: "  const TRIAL_HZ = 60;",
    expect: 'which is not a playable rate',
    note: 'the board outruns any human hand and the trial becomes a coin toss',
  },
  {
    id: 'drawing-spends-moves-under-the-clock',
    file: 'index.html',
    find: "    if(settings.timeTrial){ startMetronome(); return true; }",
    replace: "    if(settings.timeTrial){ startMetronome(); }",
    expect: 'under the clock, drawing spends nothing',
    note: 'the clock AND the input both advance the world, so the trial is an APM contest',
  },
  {
    id: 'metronome-burns-a-hidden-tab',
    file: 'index.html',
    find: "    if(hidden === undefined ? document.hidden : hidden) return;",
    replace: "    if(false) return;",
    expect: 'a hidden tab does not burn the board',
    note: 'glancing at another window hands the player back a wrecked board',
  },
  {
    id: 'metronome-outlives-the-win',
    file: 'index.html',
    find: "      stopMetronome();   // the world stops the instant the board is solved",
    replace: "      ;",
    expect: 'the win stops the metronome',
    note: 'the interval keeps beating against a finished board behind the win card',
  },
  {
    id: 'trial-shows-the-turn-based-rules',
    file: 'index.html',
    find: "    if(bannerEl) bannerEl.classList.toggle('hidden', settings.timeTrial);",
    replace: "    ;",
    expect: 'exactly one set of rules is on screen',
    note: 'the banner promises nothing moves until you do, while the clock runs',
  },
  {
    id: 'wait-button-live-under-the-clock',
    file: 'index.html',
    find: "    if(waitBtnEl) waitBtnEl.classList.toggle('hidden', settings.timeTrial);",
    replace: "    ;",
    expect: 'the Wait button is hidden under the clock',
    note: 'a live control that does nothing, in the mode where waiting is the default',
  },
  {
    id: 'trial-best-shows-a-move-count',
    file: 'index.html',
    find: "      bestValEl.textContent = bt !== null ? fmtSeconds(bt / 1000) : '—';",
    replace: "      bestValEl.textContent = fmtCount(getBest(level));",
    expect: 'BEST shows the time record under the clock',
    note: 'the player is asked to beat a number the mode does not score',
  },
  {
    id: 'short-is-free-on-the-clock',
    file: 'index.html',
    find: "    return playedMs(clockNow(), runStartMs, pausedMs, hiddenAt) + zapPenaltyMs();",
    replace: "    return playedMs(clockNow(), runStartMs, pausedMs, hiddenAt);",
    expect: 'the penalty reaches the scored time',
    note: 'shorting is free in the one mode where only the clock counts',
  },
  {
    id: 'short-penalty-ignores-the-rate',
    file: 'index.html',
    find: "    return zapCount * ZAP_PENALTY_TICKS * (1000 / TRIAL_HZ);",
    replace: "    return zapCount * ZAP_PENALTY_TICKS;",
    expect: 'a short costs the clock its penalty',
    note: 'a short costs 5ms instead of 1.67s, so the penalty is not felt at all',
  },
  {
    id: 'banner-hides-the-short-cost',
    file: 'index.html',
    find: "    if(trialZapCostEl) trialZapCostEl.textContent = fmtSeconds(ZAP_PENALTY_TICKS / TRIAL_HZ);",
    replace: "    ;",
    expect: 'the banner names the real short cost',
    note: 'the rules charge a penalty they never name, so it reads as a bug',
  },
  {
    id: 'trial-shows-a-meaningless-score',
    file: 'index.html',
    find: "    if(scoreStatEl) scoreStatEl.classList.toggle('hidden', settings.timeTrial);",
    replace: "    ;",
    expect: 'SCORE is hidden when the clock is the score',
    note: 'a SCORE stat that is neither the score nor actionable sits beside TIME',
  },
  {
    id: 'trial-card-prints-a-move-best',
    file: 'index.html',
    find: "      winBestLineEl.textContent = settings.timeTrial ? ''",
    replace: "      winBestLineEl.textContent = false ? ''",
    expect: 'the trial card shows no move record',
    note: 'a move best printed beside a time, two numbers meaning different things',
  },
  {
    id: 'trial-card-still-ranks-on-par',
    file: 'index.html',
    find: "        winScoreEl.textContent = fmtSeconds(finishedMs / 1000);",
    replace: "        winScoreEl.textContent = fmtTicks(score);",
    expect: 'the trial card ranks on the clock, not on par',
    note: 'a time trial that reports a move score, which is the thing it replaced',
  },
  {
    // ---- the stopwatch measures; it never decides ----
    id: 'time-enters-the-score',
    file: 'index.html',
    find: "  function currentScore(){ return tickCount + zapCount * ZAP_PENALTY_TICKS; }",
    replace: "  function currentScore(){ return tickCount + zapCount * ZAP_PENALTY_TICKS + Math.round(elapsedSeconds()); }",
    expect: 'reads the wall clock',
    note: 'thinking costs points, and two identical runs score differently',
  },
  {
    id: 'hazards-read-the-wall-clock',
    file: 'index.html',
    find: "  function propagateActiveWire(){",
    replace: "  function propagateActiveWire(){ if(clockNow() < 0) return 'wait';",
    expect: 'reads the wall clock',
    note: 'par loses its definition and the daily differs per player',
  },
  {
    // The outer of the two guards. It masked the inner one on the first audit -
    // both are now tested separately, which is the only way either can fail.
    id: 'staged-win-records-a-time',
    file: 'index.html',
    find: "      if(settings.timeTrial && runStartMs !== null && finishedMs > 0){",
    replace: "      if(settings.timeTrial){",
    expect: 'a staged win shows no time on the card',
    note: 'every solve.js or shots.mjs run posts a 0.00s time on the win card',
  },
  {
    id: 'stopwatch-on-by-default',
    file: 'index.html',
    find: "                             timeTrial:false};",
    replace: "                             timeTrial:true};",
    expect: 'the stopwatch is off until asked for',
    note: 'everybody gets a clock they never asked for, on a game about thinking',
  },
  {
    id: 'clock-starts-on-level-entry',
    file: 'index.html',
    find: "    runStartMs = null;",
    replace: "    runStartMs = clockNow();",
    expect: 'entering a level does not start the clock',
    note: 'studying a frozen board costs time, which the play screen promises it does not',
  },
  {
    id: 'played-ms-not-clamped',
    file: 'index.html',
    find: "    return Math.max(0, now - start - paused - stillHidden);",
    replace: "    return now - start - paused - stillHidden;",
    expect: 'playedMs never returns a negative time',
    note: 'a clock that steps backwards records a negative time as somebody fastest',
  },
  {
    id: 'hidden-stretch-ignored',
    file: 'index.html',
    find: "    const stillHidden = (hiddenSince === null || hiddenSince === undefined) ? 0 : now - hiddenSince;",
    replace: "    const stillHidden = 0;",
    expect: 'playedMs subtracts a hidden stretch still open',
    note: 'alt-tabbing mid-run ruins the time, so the clock punishes leaving the tab',
  },
  {
    id: 'staged-run-writes-a-time',
    file: 'index.html',
    find: "    if(!(ms > 0)) return false;",
    replace: "    if(ms < 0) return false;",
    expect: 'a zero time is never recorded as a best',
    note: 'solve.js and shots.mjs leave a 0.00s fastest nobody played',
  },
  {
    id: 'clock-does-not-freeze-at-the-win',
    file: 'index.html',
    find: "      finishedMs = trialTimeMs();",
    replace: "      ;",
    expect: 'winning freezes the stopwatch',
    note: 'the win card keeps counting, so leaving it open writes a worse time',
  },
  {
    id: 'store-prefix-renamed',
    file: 'index.html',
    find: "  const STORE_PREFIX = 'wired-v3-';",
    replace: "  const STORE_PREFIX = 'dead-short-v3-';",
    expect: 'localStorage prefix still says wired-v3-',
    note: 'the rename swept up the save prefix, orphaning every stored score',
  },
  {
    id: 'daily-seed-renamed',
    file: 'index.html',
    find: "  const DAILY_SEED_PREFIX = 'wired-daily-v3-';",
    replace: "  const DAILY_SEED_PREFIX = 'dead-short-daily-v3-';",
    expect: 'daily seed prefix is unchanged',
    note: 'the rename swept up the daily seed, dealing a different board for every date',
  },
  {
    id: 'legacy-settings-key-renamed',
    file: 'index.html',
    find: "  const LEGACY_SETTINGS_KEY = 'wired-v2-settings';",
    replace: "  const LEGACY_SETTINGS_KEY = 'dead-short-v2-settings';",
    expect: 'v2 settings migration key is unchanged',
    note: 'the rename swept up the migration key, silently dropping carried-over settings',
  },
  {
    id: 'keyboard-trap-returns',
    file: 'index.html',
    find: '  function boardHasFocus(){ return document.activeElement === canvas; }',
    replace: '  function boardHasFocus(){ return true; }',
    expect: 'Tab reaches the buttons when the board is not focused',
    note: 'the board owns Tab everywhere again - the WCAG 2.1.2 trap, verbatim',
  },
  {
    id: 'escape-does-not-leave-board',
    file: 'index.html',
    find: '      if(out && out.focus) out.focus();',
    replace: '      if(out && out.focus) void out;',
    expect: 'Escape moves focus off the board',
    note: 'Escape is swallowed but moves nothing, so the board is still a trap',
  },
  {
    id: 'dialog-does-not-take-keyboard',
    file: 'index.html',
    find: '    if(anyModalOpen()) return false;',
    replace: '    if(false) return false;',
    expect: 'an open dialog takes the keyboard from the board',
    note: 'the play handler fights the win modal for every Tab',
  },
  {
    id: 'os-motion-overrides-choice',
    file: 'index.html',
    find: "      if(!('reduceMotion' in stored) && prefersReducedMotion()) defaults.reduceMotion = true;",
    replace: "      if(prefersReducedMotion()) stored.reduceMotion = true;",
    expect: 'an explicit "off" outranks the OS preference',
    note: 'the system preference starts overriding a choice the player made here',
  },
  {
    id: 'viewport-blocks-zoom',
    file: 'index.html',
    find: '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    replace: '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">',
    expect: 'blocks pinch-zoom',
    note: 'pinch-zoom disabled again - WCAG 1.4.4',
  },
  {
    id: 'focus-ring-loses-its-offset',
    file: 'index.html',
    find: '    outline-offset:2px;',
    replace: '    outline-style:solid;',
    expect: 'no outline-offset',
    note: 'the ring moves inside the button fill, where it is 1.04:1 on gold',
  },
  {
    id: 'contrast-token-regressed',
    file: 'index.html',
    find: '    --panel-border:  #45648e;',
    replace: '    --panel-border:  #24344a;',
    expect: 'measures 1.45:1',
    note: 'every button, card and input boundary drops back under 3:1',
  },
  {
    id: 'skin-contrast-regressed',
    file: 'index.html',
    find: "'--grid-line':'#306857'",
    replace: "'--grid-line':'#1c3d33'",
    expect: 'Every declaration counts',
    note: 'a SKIN override slips back under 3:1 while :root stays fine - this is '
        + 'the one that proves the contrast gate reads skins and not just :root',
  },
  {
    id: 'canvas-fallback-drift',
    file: 'index.html',
    find: "    const panelBorder = cssVar('--panel-border', '#45648e');",
    replace: "    const panelBorder = cssVar('--panel-border', '#24344a');",
    expect: 'cssVar fallback for --panel-border',
    note: 'the CSS and the canvas disagree, so a browser that returns nothing '
        + 'for the custom property paints the old low-contrast colour',
  },
  {
    id: 'spark-is-harmless',
    file: 'index.html',
    find: '    return isGate(ob) ? gateIsLive(ob, tick) : true;',
    replace: '    return isGate(ob) ? gateIsLive(ob, tick) : false;',
    expect: 'a route crossing a patrol lane gets shorted',
    note: 'patrols stop shorting wires — the central hazard disabled',
  },
];

/* --------------------------------- runner --------------------------------- */

function sh(cmd, args) {
  try {
    return { code: 0, out: execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' }) };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout || '') + (e.stderr || '') };
  }
}

function assertCleanTree() {
  const r = sh('git', ['status', '--porcelain']);
  if (r.code !== 0) throw new Error('not a git repo, or git is unavailable');
  if (r.out.trim()) {
    console.error('Refusing to run: the working tree has uncommitted changes.');
    console.error('This edits source files in place. Commit or stash first.\n');
    console.error(r.out.trim());
    process.exit(1);
  }
}

function snapshot() {
  const m = new Map();
  for (const f of VOLATILE) {
    const p = path.join(ROOT, f);
    if (fs.existsSync(p)) m.set(f, fs.readFileSync(p));
  }
  return m;
}

function restore(snap) {
  for (const [f, buf] of snap) fs.writeFileSync(path.join(ROOT, f), buf);
}

// Anchors are written with \n. The files are not all LF: a `git checkout` under
// core.autocrlf rewrites index.html as CRLF, and after that every multi-line
// anchor silently matches nothing. That is precisely how this tool first told
// me the Mainframe bug had gone undetected — the mutation had never applied.
function fitEndings(text, src) {
  return src.includes('\r\n') ? text.replace(/\r?\n/g, '\r\n') : text;
}

function apply(mut) {
  const p = path.join(ROOT, mut.file);
  const src = fs.readFileSync(p, 'utf8');
  const find = fitEndings(mut.find, src);
  // An anchor matching zero times leaves the file untouched, so the build passes
  // and the mutation looks like a survivor — a red result that means nothing
  // happened. Matching more than once is just as bad: the edit lands somewhere
  // unintended. Both are errors, never warnings, and never survivors.
  const hits = src.split(find).length - 1;
  if (hits !== 1) {
    throw new Error(`anchor matched ${hits} times in ${mut.file} (needs exactly 1)`);
  }
  fs.writeFileSync(p, src.replace(find, fitEndings(mut.replace, src)));
}

function main() {
  const muts = filter ? MUTATIONS.filter(m => m.id.includes(filter)) : MUTATIONS;

  if (LIST) {
    muts.forEach(m => console.log(`${m.id.padEnd(22)} ${m.note}`));
    return;
  }
  if (!muts.length) {
    console.error(`No mutation id matches "${filter}".`);
    process.exit(1);
  }

  assertCleanTree();
  const snap = snapshot();
  const results = [];

  try {
    for (const mut of muts) {
      process.stdout.write(`${mut.id.padEnd(22)} `);
      let caught = false, right = false, detail = '', error = null;
      try {
        apply(mut);
        // A real edit comes with a regenerated map, so refresh it — otherwise
        // checkCodeMap fires first and masks the gate actually under audit.
        // Not just for index.html: the map records every support file's line
        // count too, so a one-line manifest.json change stales it just as much.
        // That masking is exactly what this audit is for, and it caught it here
        // first — unshipped-asset reported "caught" while proving nothing.
        if (mut.refreshMap !== false) sh(process.execPath, ['codemap.js']);

        const r = sh(process.execPath, ['build.js']);
        caught = r.code !== 0;
        right = caught && r.out.includes(mut.expect);
        // Prefer the failing assertion's own name over the generic "the test
        // suite did not pass", so `expect` can name the test that should own
        // this defect rather than settling for "something went red".
        const failLine = (r.out.match(/^\s*FAIL\s+(.*)$/m) || [, ''])[1].trim();
        const buildLine = (r.out.match(/BUILD FAILED: (.*)/) || [, ''])[1].trim();
        detail = (failLine || buildLine).slice(0, 64);
      } catch (e) {
        // A mutation that could not be applied proves nothing in either
        // direction. Reporting it as a survivor claims the safety net has a
        // hole; reporting it as caught claims the opposite. It is its own
        // outcome, and it is a failure of the audit, not of the code.
        error = e.message;
      } finally {
        restore(snap);
      }
      results.push({ ...mut, caught, right, detail, error });
      if (VERBOSE && detail) console.log('    -> ' + detail);
      console.log(error ? 'ERROR (did not apply)'
                : caught ? (right ? 'caught' : 'caught (wrong gate)')
                : 'SURVIVED');
    }
  } finally {
    restore(snap);
  }

  const errored = results.filter(r => r.error);
  const survivors = results.filter(r => !r.caught && !r.error);
  const misfiled = results.filter(r => r.caught && !r.right);

  console.log('');
  console.log(`${results.filter(r => r.caught).length}/${results.length} mutations caught`);

  if (errored.length) {
    console.log('\nCould not be applied — these tested NOTHING:');
    errored.forEach(r => console.log(`  ${r.id}: ${r.error}`));
    process.exitCode = 1;
  }
  if (misfiled.length) {
    console.log('\nCaught, but not by the gate that should own them:');
    misfiled.forEach(r => console.log(`  ${r.id}\n    ${r.detail}`));
  }
  if (survivors.length) {
    console.log('\nSURVIVED — these defects can be introduced today and every check passes:');
    survivors.forEach(r => console.log(`  ${r.id}: ${r.note}`));
    process.exitCode = 1;
  } else if (!errored.length) {
    console.log('No survivors: every catalogued defect is detected.');
  }

  // The audit is worthless if it leaves the tree altered, so say so either way.
  const after = sh('git', ['status', '--porcelain']);
  console.log(after.out.trim()
    ? '\nWARNING: tree is dirty after the run:\n' + after.out
    : '\nWorking tree restored clean.');
}

main();
