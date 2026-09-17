# Dead Short - code map

**Generated file. Do not edit by hand - your changes will be overwritten.**
Regenerate with `node codemap.js`. `node codemap.js --check` proves it is current,
and `build.js` runs that check, so a stale map cannot ship.

This file answers *where*. For *what shape* and *what to touch for a given change*,
read [ARCHITECTURE.md](ARCHITECTURE.md) - hand-written, and stable because it names
shapes rather than line numbers.

**Use it like this** - find the thing, then read only its slice:

```bash
grep -n stepTick CODE-MAP.md       # -> 2035
sed -n '2035,2080p' index.html     # read those lines, not all 4,823
```

Generated from `index.html` - 4,823 lines, 215,195 bytes, sha256 `9f356e0a66f4`.

## Files

| file | lines | what it is |
|---|---:|---|
| `index.html` | 4,823 | The entire game: markup, styles and engine in one file. |
| `build.js` | 309 | Release gate + packager. Refuses to zip a build that fails a check. |
| `codemap.js` | 346 | Generates CODE-MAP.md. This file. |
| `make-icons.mjs` | 188 | Rasterizes icons/*.png from the same art as icon.svg. |
| `shots.mjs` | 301 | Captures store/screenshots/ from the real game. |
| `chrome.mjs` | 164 | Headless-Chrome plumbing for shots.mjs. |
| `mutate.js` | 358 | Mutation audit: breaks the game on purpose to test the gates. |
| `harness.js` | 135 | Loads the inline game script into a stub DOM under node:vm. |
| `test.js` | 55 | Headless runner for the in-page selfTest(). |
| `solve.js` | 89 | Proves each level routes, computes par, replays it to verify. |
| `sw.js` | 41 | Service worker. CACHE_NAME must contain GAME_VERSION. |
| `manifest.json` | 42 | PWA manifest. |
| `icon.svg` | 6 | The only image asset the game ships. |

## index.html - section map

Every section marker in the file, in order. `CSS` markers sit in the `<style>`
block, `HTML` in the body, `JS` in the inline script.

| lines | region | section | fns |
|---|---|---|---:|
| 90-99 | CSS | Menu screen |  |
| 100-184 | CSS | Settings screen |  |
| 185-330 | CSS | Play screen |  |
| 331-384 | CSS | Intro / splash screen |  |
| 385-412 | CSS | Editor |  |
| 413-438 | CSS | Landscape layout |  |
| 439-456 | HTML | INTRO / SPLASH SCREEN |  |
| 457-476 | HTML | MENU SCREEN |  |
| 477-524 | HTML | PLAY SCREEN |  |
| 525-564 | HTML | EDITOR SCREEN |  |
| 565-678 | HTML | SETTINGS SCREEN |  |
| 679-719 | JS | Tunables |  |
| 720-922 | JS | Level definitions | 2 |
| 923-1099 | JS | Daily challenge | 10 |
| 1100-1105 | JS | Medals |  |
| 1106-1154 | JS | Solution contract | 3 |
| 1155-1216 | JS | Persistent storage | 10 |
| 1217-1225 | JS | Lifetime stats (for the Settings > Stats section) | 3 |
| 1226-1287 | JS | Cosmetic perks (purely visual — never affect timing, sparks... | 4 |
| 1288-1549 | JS | Screen management | 10 |
| 1550-1575 | JS | State |  |
| 1576-1677 | JS | The clock | 6 |
| 1678-1732 | JS | Geometry helpers | 9 |
| 1733-1797 | JS | Sound (synthesized via Web Audio API — no asset files, keeps... | 4 |
| 1798-2124 | JS | Input | 10 |
| 2125-2251 | JS | Keyboard input (WASD / arrows) | 5 |
| 2252-2347 | JS | Obstacle motion + collision | 9 |
| 2348-2403 | JS | Wire identity: shape + pattern (always on) and palette (swappable) | 2 |
| 2404-2780 | JS | Rendering | 2 |
| 2781-2816 | JS | Main loop | 1 |
| 2817-2928 | JS | Buttons | 5 |
| 2929-2952 | JS | Intro / splash screen | 2 |
| 2953-2974 | JS | **SOLVERS** |  |
| 2975-3164 | JS | Solver A — routing | 5 |
| 3165-3350 | JS | **LEVEL CODEC** | 6 |
| 3351-3448 | JS | Trap measurement | 3 |
| 3449-3470 | JS | Hazard timing helpers | 4 |
| 3471-3711 | JS | Solver B — scheduling | 7 |
| 3712-4155 | JS | **EDITOR** | 16 |
| 4156-4782 | JS | Self test | 1 |
| 4783-4823 | JS | Boot |  |

## Functions, by section

All 139 `function` declarations in `index.html`.

### Level definitions  <sub>JS &middot; 720-922</sub>

```
  902  patrol  (ticksPerCell, waypoints)
  907  loopPath(waypoints)
```

### Daily challenge  <sub>JS &middot; 923-1099</sub>

```
  931  hashStr              (s)
  936  mulberry32           (seed)
  945  localDateString      (d)
  963  randomDailyBoard     (rand, dateStr)
 1000  measurePressure      (lv, sol)
 1016  generateDailyLevel   (dateStr)
 1074  terminalCellOf       (lv, cell)
 1078  getDailyStreak       ()
 1079  recordDailyPlay      (dateStr)
 1092  resolveChallengeLevel(challengeSlug)
```

### Solution contract  <sub>JS &middot; 1106-1154</sub>

```
 1130  parFor            (lv)
 1141  getMedalThresholds(lv)
 1146  medalForScore     (lv, scoreTicks)
```

### Persistent storage  <sub>JS &middot; 1155-1216</sub>

```
 1177  levelFingerprint(lv)
 1191  levelKey        (lv)
 1192  bestKey         (lv)
 1193  getBest         (lv)
 1199  setBestIfBetter (lv, scoreTicks)
 1209  cleanClearKey   (lv)
 1210  hasCleanClear   (lv)
 1211  markCleanClear  (lv)
 1214  ticksToSeconds  (t)
 1215  fmtTicks        (t)
```

### Lifetime stats (for the Settings > Stats section)  <sub>JS &middot; 1217-1225</sub>

```
 1218  bumpCounter      (key)
 1221  getCounter       (key)
 1222  medalsEarnedCount()
```

### Cosmetic perks (purely visual — never affect timing, sparks...  <sub>JS &middot; 1226-1287</sub>

```
 1249  getEquippedSkinId()
 1250  setEquippedSkinId(id)
 1251  applySkin        ()
 1260  renderSkinList   ()
```

### Screen management  <sub>JS &middot; 1288-1549</sub>

```
 1311  loadSettings   ()
 1349  saveSettings   ()
 1352  applySettings  ()
 1380  escapeHtml     (s)
 1387  describeHazards(lv)
 1398  renderMenu     ()
 1493  showMenu       ()
 1504  renderStats    ()
 1520  showSettings   ()
 1530  enterLevel     (lv)
```

### The clock  <sub>JS &middot; 1576-1677</sub>

```
 1607  computeCellSize     (cols, rows)
 1623  resizeCanvasForLevel()
 1636  currentScore        ()
 1638  resetPuzzle         ()
 1660  startRunIfIdle      ()
 1668  updateHud           ()
```

### Geometry helpers  <sub>JS &middot; 1678-1732</sub>

```
 1679  cellAt          (px, py)
 1684  sameCell        (a,b)
 1685  adjacent        (a,b)
 1686  terminalAt      (cell)
 1694  isBlocked       (cell)
 1700  inBounds        (cell)
 1706  occupiedBy      (cell, excludeIdx)
 1716  ownIntentIndexAt(cell)
 1726  commonPrefixLen (a, b)
```

### Sound (synthesized via Web Audio API — no asset files, keeps...  <sub>JS &middot; 1733-1797</sub>

```
 1739  ensureAudio()
 1748  playTone   (freq, opts)
 1763  playNoise  (opts)
 1792  haptic     (pattern)
```

### Input  <sub>JS &middot; 1798-2124</sub>

```
 1799  pointerPos          (evt)
 1817  setActiveColor      (idx)
 1823  onPointerDown       (cell)
 1875  planTo              (cell)
 1936  advanceToNextPlanned()
 1952  propagateActiveWire ()
 2024  findSealedPair      ()
 2058  announceSealIfAny   ()
 2078  stepTick            ()
 2091  endPointer          ()
```

### Keyboard input (WASD / arrows)  <sub>JS &middot; 2125-2251</sub>

```
 2130  cycleActiveColor(dir)
 2149  planHead        ()
 2156  keyboardStep    (dc, dr)
 2169  keyboardBack    ()
 2205  checkWin        ()
```

### Obstacle motion + collision  <sub>JS &middot; 2252-2347</sub>

```
 2260  isGate             (ob)
 2263  gateIsLive         (ob, tick)
 2270  obstacleCellAt     (ob, tick)
 2279  hopEase            (f)
 2285  obstacleRenderPos  (ob, tick, frac)
 2303  obstacleIsDangerous(ob, tick)
 2310  cellIsHot          (cell, tick)
 2319  checkZaps          (tick)
 2341  flashZap           ()
```

### Wire identity: shape + pattern (always on) and palette (swappable)  <sub>JS &middot; 2348-2403</sub>

```
 2372  styleFor (baseColor)
 2377  drawGlyph(shape, x, y, size)
```

### Rendering  <sub>JS &middot; 2404-2780</sub>

```
 2405  cssVar(name, fallback)
 2412  draw  (tick, frac)
```

### Main loop  <sub>JS &middot; 2781-2816</sub>

```
 2789  tick(now)
```

### Buttons  <sub>JS &middot; 2817-2928</sub>

```
 2825  nextLevelAfter(lv)
 2846  shareText     ()
 2861  challengeUrl  ()
 2892  shareTextOut  (title, body, blurb)
 2920  doShare       ()
```

### Intro / splash screen  <sub>JS &middot; 2929-2952</sub>

```
 2933  playIntro()
 2938  finish   ()
```

### Solver A — routing  <sub>JS &middot; 2975-3164</sub>

```
 2979  routeSolve      (lv, opts)
 3016  stillConnectable(k)
 3047  reachable       (fromIdx, goalIdx)
 3068  place           (k, cost)
 3080  walk            (k, p, cur, path, costBefore)
```

### LEVEL CODEC  <sub>JS &middot; 3165-3350</sub>

```
 3194  b64urlEncode(s)
 3197  b64urlDecode(s)
 3203  encodeLevel (lv)
 3229  decodeLevel (code)
 3322  customSlug  (code)
 3328  verifyLevel (lv)
```

### Trap measurement  <sub>JS &middot; 3351-3448</sub>

```
 3366  enumerateRoutes(lv, pairIdx, slack, maxCount)
 3412  restRoutable   (lv, pairIdx, route)
 3427  trapMeasure    (lv, opts)
```

### Hazard timing helpers  <sub>JS &middot; 3449-3470</sub>

```
 3450  gcd         (a,b)
 3451  lcm         (a,b)
 3454  hazardPeriod(lv)
 3462  dangerAt    (lv, tick)
```

### Solver B — scheduling  <sub>JS &middot; 3471-3711</sub>

```
 3488  wireRun       (lv, route, t0, cap)
 3544  scheduleSolve (lv, routes, opts)
 3606  solveLevel    (lv, opts)
 3630  applyAction   (act, sol)
 3648  replaySolution(lv, sol)
 3672  stageSolution (lv, sol, stopAfter)
 3700  stageSealDemo ()
```

### EDITOR  <sub>JS &middot; 3712-4155</sub>

```
 3741  edPadFor          (i)
 3746  edCellUsed        (cell)
 3752  edInBounds        (cell)
 3758  editorLevel       ()
 3778  edInvalidate      ()
 3784  setVerdict        (html, cls)
 3789  editorTap         (cell)
 3862  renderEditorTools ()
 3880  resizeEditorCanvas()
 3891  drawEditor        ()
 3988  drawGlyphOn       (c2d, shape, x, y, size)
 4006  editorCellAt      (evt)
 4017  runVerify         ()
 4054  editorClear       ()
 4063  editorRandom      ()
 4082  showEditor        ()
```

### Self test  <sub>JS &middot; 4156-4782</sub>

```
 4165  selfTest()
```

## Top-level constants

Cached `getElementById` handles are omitted - there are dozens and they all
sit in **Screen management**.

```
  688  GAME_VERSION        = '2.0.0';
  711  CANONICAL_URL       = 'https:
  713  TICK_HZ             = 6;
  714  MS_PER_TICK         = 1000 / TICK_HZ;
  715  MAX_FRAME_MS        = 250;
  717  ZAP_PENALTY_TICKS   = 3 * TICK_HZ;
  718  TRACE_MS            = 2500;
  741  LEVELS              = [
  950  DAILY_PALETTE       = ["#ff5d6c","#ffd75a","#7ab8ff","#c98bff","#54e...
  961  DAILY_BAND          = { parMin: 22, parMax: 46, holdsMin: 2, holdsMa...
 1013  DAILY_SEED_PREFIX   = 'wired-daily-v3-';
 1015  dailyCache          = new Map();
 1112  PAR_CONTRACT        = {
 1128  MEDAL_ICON          = { gold:'🥇', silver:'🥈', bronze:'🥉' };
 1129  parCache            = new Map();
 1165  STORE_PREFIX        = 'wired-v3-';
 1176  fingerprintCache    = new Map();
 1228  SKINS               = [
 1248  ALL_SKIN_TOKEN_KEYS = [...new Set(SKINS.flatMap(s=>Object.keys(s.tok...
 1289  screen              = 'menu';
 1301  SETTINGS_DEFAULTS   = {colorblind:false, reduceMotion:false, muted:f...
 1302  SETTINGS_KEY        = STORE_PREFIX + 'settings';
 1309  LEGACY_SETTINGS_KEY = 'wired-v2-settings';
 1319  settings            = loadSettings();
 1322  pendingChallenge    = null;
 1323  pendingBoard        = null;
 1554  MIN_CELL            = 32, MAX_CELL = 64;
 1555  CELL                = MAX_CELL;
 1556  level               = LEVELS[0];
 1567  wires               = {};
 1568  activeColor         = null;
 1569  dragging            = false;
 1570  won                 = false;
 1571  zapCount            = 0;
 1572  previewUntil        = 0;
 1573  sealed              = false;
 1574  justLocked          = false;
 1581  tickCount           = 0;
 1582  running             = false;
 1583  tickAccum           = 0;
 1584  lastFrameMs         = null;
 1585  pendingSwitchTicks  = 0;
 1588  ctx                 = canvas.getContext('2d');
 1738  audioCtx            = null;
 1782  sfx                 = {
 2356  WIRE_STYLE          = {
 2365  COLORBLIND_PALETTE  = {
 2973  ROUTE_BUDGET        = 400000;
 3183  CODE_VERSION        = 'W1';
 3184  PAIR_COLORS         = ["#ff5d6c","#ffd75a","#7ab8ff","#54e6a6","#c98...
 3185  EDITOR_MIN          = 5;
 3191  EDITOR_MAX          = 7;
 3192  VERIFY_BUDGET       = 4000000;
 3693  SEAL_DEMO           = {
 3718  GATE_PRESETS        = [
 3722  PATROL_SPEEDS       = [2, 3, 1, 4];
 3724  edCols              = 6, edRows = 6;
 3725  edPads              = [];
 3726  edBlocked           = [];
 3727  edGates             = [];
 3728  edPatrols           = [];
 3729  edTool              = 'pair0';
 3730  edPatrolDraft       = null;
 3731  edVerified          = null;
 3734  edCtx               = editorCanvas.getContext('2d');
```

## Levels

Par comes from `PAR_CONTRACT`; regenerate it with `node solve.js --contract`.

| # | slug | name | grid | par | defined |
|---:|---|---|---|---:|---:|
| 1 | `breadboard` | Breadboard | 5x5 | 14 | 745 |
| 2 | `circuit-board` | Circuit Board | 6x6 | 28 | 757 |
| 3 | `elbow` | Elbow | 7x7 | 26 | 771 |
| 4 | `interlock` | Interlock | 7x7 | 29 | 787 |
| 5 | `mainframe` | Mainframe | 7x7 | 34 | 804 |
| 6 | `relay-yard` | Relay Yard | 7x8 | 36 | 821 |
| 7 | `backplane` | Backplane | 7x8 | 39 | 835 |
| 8 | `logic-array` | Logic Array | 7x8 | 39 | 850 |
| 9 | `ladder` | Ladder | 7x7 | 31 | 869 |
| 10 | `fault-line` | Fault Line | 7x6 | 38 | 882 |

## Test groups

The 21 assertion groups inside `selfTest()`, so you can find the test
for a behaviour without reading the whole suite.

```
 4180  The first frame of a patrol level renders
 4192  Current costs a tick per cell, and drawing costs nothing
 4210  The exploit this whole model exists to kill
 4225  Determinism: same actions from tick 0, same run
 4238  Spark position is a pure function of the tick counter
 4249  A spark shorts what it touches, and only what it touches
 4283  Current waits at a live contact instead of dying on it
 4298  Components block routing
 4309  A finished wire is a wall
 4322  Sealing the board is detected, and only when certain
 4449  Ordinary play obeys the same rules par was computed under
 4477  Progression is keyed by identity, not position
 4486  A custom board travels inside its own link
 4521  The editor gate refuses what it cannot prove
 4541  Save keys are tied to identity, not array position
 4566  The persistence contract survives a rename
 4605  Solver: routing correctness on boards with a known answer
 4656  Solution contract
 4699  The daily is generated AND verified
 4722  Touch targets stay usable on real phones
 4741  Shipped level data is well-formed
```

## The tooling seam

`window.__wiredDev` is the only surface `test.js` and `solve.js` reach through.
Renaming anything in it breaks both runners.

```
solveLevel, routeSolve, replaySolution, LEVELS, TICK_HZ, generateDailyLevel, loopPath, hazardPeriod, PAR_CONTRACT, trapMeasure, measurePressure, encodeLevel, decodeLevel, // Screen and staging control, used by shots.mjs to // photograph real positions. Nothing here can reach a // score: bests live in localStorage and were always // editable from this same console. ui: { enterLevel, showMenu, showSettings, showEditor, stageSealDemo, stageSolution, draw, updateHud }
```

## localStorage keys

All prefixed with `STORE_PREFIX`. Changing the prefix orphans every save.

```
STORE_PREFIX + 'best-'
STORE_PREFIX + 'clean-'
STORE_PREFIX + 'daily-lastDate'
STORE_PREFIX + 'daily-streak'
STORE_PREFIX + 'settings'
STORE_PREFIX + 'skin'
STORE_PREFIX + 'stats-plays'
STORE_PREFIX + 'stats-zaps'
```

## DOM ids

83 ids, with the line each is declared on.

```
app                 455
banner              512
bestVal             491
board               502
boardWrap           501
challengeTargetBar  493
colorblindToggle    603
controls            507
creditsVersion      638
editorBackBtn       528
editorCanvas        542
editorClear         535
editorCodeRow       553
editorCopy          550
editorHint          558
editorImport        554
editorLoad          555
editorPlay          549
editorRandom        536
editorScreen        526
editorSize          534
editorSizeRow       533
editorTools         539
editorVerdict       545
editorVerify        548
hud                 487
introBolt           449
introFlash          447
introScreen         440
introSkipHint       452
introTagline        450
introTitle          449
introTraces         441
introWordmark       448
menuBadge           463
menuBanner          466
menuBtn             480
menuList            465
menuScreen          458
muteToggle          617
playBody            485
playBottom          506
playerNameInput     624
playLevelName       481
playLevelNameText   481
playMain            500
playScreen          478
playTop             479
playTopStats        486
previewBtn          509
reduceMotionToggle  610
restartBtn          508
scoreVal            490
sealedBar           494
sealedRestart       496
sealedText          495
settingsBackBtn     568
settingsBtn         459
settingsCredits     637
settingsScreen      566
shareBlurb          649
shareBox            650
shareBtn            510
shareCard           647
shareCloseBtn       654
shareCopyBtn        653
shareModal          646
shareStatus         651
shareTitle          648
skinList            629
statsList           634
timer               488
winBestLine         664
winBreakdown        663
winCard             660
winEarnLine         665
winMenu             668
winModal            659
winNext             670
winRestart          667
winScore            662
winShare            669
zapCount            489
```
