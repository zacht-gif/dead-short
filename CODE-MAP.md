# Wired - code map

**Generated file. Do not edit by hand - your changes will be overwritten.**
Regenerate with `node codemap.js`. `node codemap.js --check` proves it is current,
and `build.js` runs that check, so a stale map cannot ship.

This file answers *where*. For *what shape* and *what to touch for a given change*,
read [ARCHITECTURE.md](ARCHITECTURE.md) - hand-written, and stable because it names
shapes rather than line numbers.

**Use it like this** - find the thing, then read only its slice:

```bash
grep -n stepTick CODE-MAP.md       # -> 2035
sed -n '2035,2080p' index.html     # read those lines, not all 4,693
```

Generated from `index.html` - 4,693 lines, 207,650 bytes, sha256 `3de9d8d871ee`.

## Files

| file | lines | what it is |
|---|---:|---|
| `index.html` | 4,693 | The entire game: markup, styles and engine in one file. |
| `build.js` | 267 | Release gate + packager. Refuses to zip a build that fails a check. |
| `codemap.js` | 346 | Generates CODE-MAP.md. This file. |
| `make-icons.mjs` | 188 | Rasterizes icons/*.png from the same art as icon.svg. |
| `shots.mjs` | 253 | Captures store/screenshots/ from the real game. |
| `chrome.mjs` | 164 | Headless-Chrome plumbing for shots.mjs. |
| `mutate.js` | 294 | Mutation audit: breaks the game on purpose to test the gates. |
| `harness.js` | 135 | Loads the inline game script into a stub DOM under node:vm. |
| `test.js` | 55 | Headless runner for the in-page selfTest(). |
| `solve.js` | 89 | Proves each level routes, computes par, replays it to verify. |
| `sw.js` | 38 | Service worker. CACHE_NAME must contain GAME_VERSION. |
| `manifest.json` | 42 | PWA manifest. |
| `icon.svg` | 6 | The only image asset the game ships. |

## index.html - section map

Every section marker in the file, in order. `CSS` markers sit in the `<style>`
block, `HTML` in the body, `JS` in the inline script.

| lines | region | section | fns |
|---|---|---|---:|
| 83-92 | CSS | Menu screen |  |
| 93-177 | CSS | Settings screen |  |
| 178-319 | CSS | Play screen |  |
| 320-373 | CSS | Intro / splash screen |  |
| 374-401 | CSS | Editor |  |
| 402-427 | CSS | Landscape layout |  |
| 428-445 | HTML | INTRO / SPLASH SCREEN |  |
| 446-465 | HTML | MENU SCREEN |  |
| 466-513 | HTML | PLAY SCREEN |  |
| 514-553 | HTML | EDITOR SCREEN |  |
| 554-667 | HTML | SETTINGS SCREEN |  |
| 668-689 | JS | Tunables |  |
| 690-892 | JS | Level definitions | 2 |
| 893-1063 | JS | Daily challenge | 10 |
| 1064-1069 | JS | Medals |  |
| 1070-1118 | JS | Solution contract | 3 |
| 1119-1177 | JS | Persistent storage | 10 |
| 1178-1186 | JS | Lifetime stats (for the Settings > Stats section) | 3 |
| 1187-1248 | JS | Cosmetic perks (purely visual — never affect timing, sparks... | 4 |
| 1249-1506 | JS | Screen management | 10 |
| 1507-1532 | JS | State |  |
| 1533-1634 | JS | The clock | 6 |
| 1635-1689 | JS | Geometry helpers | 9 |
| 1690-1754 | JS | Sound (synthesized via Web Audio API — no asset files, keeps... | 4 |
| 1755-2081 | JS | Input | 10 |
| 2082-2208 | JS | Keyboard input (WASD / arrows) | 5 |
| 2209-2304 | JS | Obstacle motion + collision | 9 |
| 2305-2360 | JS | Wire identity: shape + pattern (always on) and palette (swappable) | 2 |
| 2361-2737 | JS | Rendering | 2 |
| 2738-2773 | JS | Main loop | 1 |
| 2774-2877 | JS | Buttons | 5 |
| 2878-2901 | JS | Intro / splash screen | 2 |
| 2902-2923 | JS | **SOLVERS** |  |
| 2924-3113 | JS | Solver A — routing | 5 |
| 3114-3299 | JS | **LEVEL CODEC** | 6 |
| 3300-3397 | JS | Trap measurement | 3 |
| 3398-3419 | JS | Hazard timing helpers | 4 |
| 3420-3631 | JS | Solver B — scheduling | 6 |
| 3632-4075 | JS | **EDITOR** | 16 |
| 4076-4652 | JS | Self test | 1 |
| 4653-4693 | JS | Boot |  |

## Functions, by section

All 138 `function` declarations in `index.html`.

### Level definitions  <sub>JS &middot; 690-892</sub>

```
  872  patrol  (ticksPerCell, waypoints)
  877  loopPath(waypoints)
```

### Daily challenge  <sub>JS &middot; 893-1063</sub>

```
  901  hashStr              (s)
  906  mulberry32           (seed)
  915  localDateString      (d)
  933  randomDailyBoard     (rand, dateStr)
  970  measurePressure      (lv, sol)
  980  generateDailyLevel   (dateStr)
 1038  terminalCellOf       (lv, cell)
 1042  getDailyStreak       ()
 1043  recordDailyPlay      (dateStr)
 1056  resolveChallengeLevel(challengeSlug)
```

### Solution contract  <sub>JS &middot; 1070-1118</sub>

```
 1094  parFor            (lv)
 1105  getMedalThresholds(lv)
 1110  medalForScore     (lv, scoreTicks)
```

### Persistent storage  <sub>JS &middot; 1119-1177</sub>

```
 1138  levelFingerprint(lv)
 1152  levelKey        (lv)
 1153  bestKey         (lv)
 1154  getBest         (lv)
 1160  setBestIfBetter (lv, scoreTicks)
 1170  cleanClearKey   (lv)
 1171  hasCleanClear   (lv)
 1172  markCleanClear  (lv)
 1175  ticksToSeconds  (t)
 1176  fmtTicks        (t)
```

### Lifetime stats (for the Settings > Stats section)  <sub>JS &middot; 1178-1186</sub>

```
 1179  bumpCounter      (key)
 1182  getCounter       (key)
 1183  medalsEarnedCount()
```

### Cosmetic perks (purely visual — never affect timing, sparks...  <sub>JS &middot; 1187-1248</sub>

```
 1210  getEquippedSkinId()
 1211  setEquippedSkinId(id)
 1212  applySkin        ()
 1221  renderSkinList   ()
```

### Screen management  <sub>JS &middot; 1249-1506</sub>

```
 1268  loadSettings   ()
 1306  saveSettings   ()
 1309  applySettings  ()
 1337  escapeHtml     (s)
 1344  describeHazards(lv)
 1355  renderMenu     ()
 1450  showMenu       ()
 1461  renderStats    ()
 1477  showSettings   ()
 1487  enterLevel     (lv)
```

### The clock  <sub>JS &middot; 1533-1634</sub>

```
 1564  computeCellSize     (cols, rows)
 1580  resizeCanvasForLevel()
 1593  currentScore        ()
 1595  resetPuzzle         ()
 1617  startRunIfIdle      ()
 1625  updateHud           ()
```

### Geometry helpers  <sub>JS &middot; 1635-1689</sub>

```
 1636  cellAt          (px, py)
 1641  sameCell        (a,b)
 1642  adjacent        (a,b)
 1643  terminalAt      (cell)
 1651  isBlocked       (cell)
 1657  inBounds        (cell)
 1663  occupiedBy      (cell, excludeIdx)
 1673  ownIntentIndexAt(cell)
 1683  commonPrefixLen (a, b)
```

### Sound (synthesized via Web Audio API — no asset files, keeps...  <sub>JS &middot; 1690-1754</sub>

```
 1696  ensureAudio()
 1705  playTone   (freq, opts)
 1720  playNoise  (opts)
 1749  haptic     (pattern)
```

### Input  <sub>JS &middot; 1755-2081</sub>

```
 1756  pointerPos          (evt)
 1774  setActiveColor      (idx)
 1780  onPointerDown       (cell)
 1832  planTo              (cell)
 1893  advanceToNextPlanned()
 1909  propagateActiveWire ()
 1981  findSealedPair      ()
 2015  announceSealIfAny   ()
 2035  stepTick            ()
 2048  endPointer          ()
```

### Keyboard input (WASD / arrows)  <sub>JS &middot; 2082-2208</sub>

```
 2087  cycleActiveColor(dir)
 2106  planHead        ()
 2113  keyboardStep    (dc, dr)
 2126  keyboardBack    ()
 2162  checkWin        ()
```

### Obstacle motion + collision  <sub>JS &middot; 2209-2304</sub>

```
 2217  isGate             (ob)
 2220  gateIsLive         (ob, tick)
 2227  obstacleCellAt     (ob, tick)
 2236  hopEase            (f)
 2242  obstacleRenderPos  (ob, tick, frac)
 2260  obstacleIsDangerous(ob, tick)
 2267  cellIsHot          (cell, tick)
 2276  checkZaps          (tick)
 2298  flashZap           ()
```

### Wire identity: shape + pattern (always on) and palette (swappable)  <sub>JS &middot; 2305-2360</sub>

```
 2329  styleFor (baseColor)
 2334  drawGlyph(shape, x, y, size)
```

### Rendering  <sub>JS &middot; 2361-2737</sub>

```
 2362  cssVar(name, fallback)
 2369  draw  (tick, frac)
```

### Main loop  <sub>JS &middot; 2738-2773</sub>

```
 2746  tick(now)
```

### Buttons  <sub>JS &middot; 2774-2877</sub>

```
 2782  nextLevelAfter(lv)
 2803  shareText     ()
 2810  challengeUrl  ()
 2841  shareTextOut  (title, body, blurb)
 2869  doShare       ()
```

### Intro / splash screen  <sub>JS &middot; 2878-2901</sub>

```
 2882  playIntro()
 2887  finish   ()
```

### Solver A — routing  <sub>JS &middot; 2924-3113</sub>

```
 2928  routeSolve      (lv, opts)
 2965  stillConnectable(k)
 2996  reachable       (fromIdx, goalIdx)
 3017  place           (k, cost)
 3029  walk            (k, p, cur, path, costBefore)
```

### LEVEL CODEC  <sub>JS &middot; 3114-3299</sub>

```
 3143  b64urlEncode(s)
 3146  b64urlDecode(s)
 3152  encodeLevel (lv)
 3178  decodeLevel (code)
 3271  customSlug  (code)
 3277  verifyLevel (lv)
```

### Trap measurement  <sub>JS &middot; 3300-3397</sub>

```
 3315  enumerateRoutes(lv, pairIdx, slack, maxCount)
 3361  restRoutable   (lv, pairIdx, route)
 3376  trapMeasure    (lv, opts)
```

### Hazard timing helpers  <sub>JS &middot; 3398-3419</sub>

```
 3399  gcd         (a,b)
 3400  lcm         (a,b)
 3403  hazardPeriod(lv)
 3411  dangerAt    (lv, tick)
```

### Solver B — scheduling  <sub>JS &middot; 3420-3631</sub>

```
 3437  wireRun       (lv, route, t0, cap)
 3493  scheduleSolve (lv, routes, opts)
 3555  solveLevel    (lv, opts)
 3579  applyAction   (act, sol)
 3597  replaySolution(lv, sol)
 3621  stageSolution (lv, sol, stopAfter)
```

### EDITOR  <sub>JS &middot; 3632-4075</sub>

```
 3661  edPadFor          (i)
 3666  edCellUsed        (cell)
 3672  edInBounds        (cell)
 3678  editorLevel       ()
 3698  edInvalidate      ()
 3704  setVerdict        (html, cls)
 3709  editorTap         (cell)
 3782  renderEditorTools ()
 3800  resizeEditorCanvas()
 3811  drawEditor        ()
 3908  drawGlyphOn       (c2d, shape, x, y, size)
 3926  editorCellAt      (evt)
 3937  runVerify         ()
 3974  editorClear       ()
 3983  editorRandom      ()
 4002  showEditor        ()
```

### Self test  <sub>JS &middot; 4076-4652</sub>

```
 4085  selfTest()
```

## Top-level constants

Cached `getElementById` handles are omitted - there are dozens and they all
sit in **Screen management**.

```
  677  GAME_VERSION        = '2.0.0';
  681  CANONICAL_URL       = '';
  683  TICK_HZ             = 6;
  684  MS_PER_TICK         = 1000 / TICK_HZ;
  685  MAX_FRAME_MS        = 250;
  687  ZAP_PENALTY_TICKS   = 3 * TICK_HZ;
  688  TRACE_MS            = 2500;
  711  LEVELS              = [
  920  DAILY_PALETTE       = ["#ff5d6c","#ffd75a","#7ab8ff","#c98bff","#54e...
  931  DAILY_BAND          = { parMin: 22, parMax: 46, holdsMin: 2, holdsMa...
  979  dailyCache          = new Map();
 1076  PAR_CONTRACT        = {
 1092  MEDAL_ICON          = { gold:'🥇', silver:'🥈', bronze:'🥉' };
 1093  parCache            = new Map();
 1126  STORE_PREFIX        = 'wired-v3-';
 1137  fingerprintCache    = new Map();
 1189  SKINS               = [
 1209  ALL_SKIN_TOKEN_KEYS = [...new Set(SKINS.flatMap(s=>Object.keys(s.tok...
 1250  screen              = 'menu';
 1262  SETTINGS_DEFAULTS   = {colorblind:false, reduceMotion:false, muted:f...
 1263  SETTINGS_KEY        = STORE_PREFIX + 'settings';
 1276  settings            = loadSettings();
 1279  pendingChallenge    = null;
 1280  pendingBoard        = null;
 1511  MIN_CELL            = 32, MAX_CELL = 64;
 1512  CELL                = MAX_CELL;
 1513  level               = LEVELS[0];
 1524  wires               = {};
 1525  activeColor         = null;
 1526  dragging            = false;
 1527  won                 = false;
 1528  zapCount            = 0;
 1529  previewUntil        = 0;
 1530  sealed              = false;
 1531  justLocked          = false;
 1538  tickCount           = 0;
 1539  running             = false;
 1540  tickAccum           = 0;
 1541  lastFrameMs         = null;
 1542  pendingSwitchTicks  = 0;
 1545  ctx                 = canvas.getContext('2d');
 1695  audioCtx            = null;
 1739  sfx                 = {
 2313  WIRE_STYLE          = {
 2322  COLORBLIND_PALETTE  = {
 2922  ROUTE_BUDGET        = 400000;
 3132  CODE_VERSION        = 'W1';
 3133  PAIR_COLORS         = ["#ff5d6c","#ffd75a","#7ab8ff","#54e6a6","#c98...
 3134  EDITOR_MIN          = 5;
 3140  EDITOR_MAX          = 7;
 3141  VERIFY_BUDGET       = 4000000;
 3638  GATE_PRESETS        = [
 3642  PATROL_SPEEDS       = [2, 3, 1, 4];
 3644  edCols              = 6, edRows = 6;
 3645  edPads              = [];
 3646  edBlocked           = [];
 3647  edGates             = [];
 3648  edPatrols           = [];
 3649  edTool              = 'pair0';
 3650  edPatrolDraft       = null;
 3651  edVerified          = null;
 3654  edCtx               = editorCanvas.getContext('2d');
```

## Levels

Par comes from `PAR_CONTRACT`; regenerate it with `node solve.js --contract`.

| # | slug | name | grid | par | defined |
|---:|---|---|---|---:|---:|
| 1 | `breadboard` | Breadboard | 5x5 | 14 | 715 |
| 2 | `circuit-board` | Circuit Board | 6x6 | 28 | 727 |
| 3 | `elbow` | Elbow | 7x7 | 26 | 741 |
| 4 | `interlock` | Interlock | 7x7 | 29 | 757 |
| 5 | `mainframe` | Mainframe | 7x7 | 34 | 774 |
| 6 | `relay-yard` | Relay Yard | 7x8 | 36 | 791 |
| 7 | `backplane` | Backplane | 7x8 | 39 | 805 |
| 8 | `logic-array` | Logic Array | 7x8 | 39 | 820 |
| 9 | `ladder` | Ladder | 7x7 | 31 | 839 |
| 10 | `fault-line` | Fault Line | 7x6 | 38 | 852 |

## Test groups

The 20 assertion groups inside `selfTest()`, so you can find the test
for a behaviour without reading the whole suite.

```
 4100  The first frame of a patrol level renders
 4112  Current costs a tick per cell, and drawing costs nothing
 4130  The exploit this whole model exists to kill
 4145  Determinism: same actions from tick 0, same run
 4158  Spark position is a pure function of the tick counter
 4169  A spark shorts what it touches, and only what it touches
 4203  Current waits at a live contact instead of dying on it
 4218  Components block routing
 4229  A finished wire is a wall
 4242  Sealing the board is detected, and only when certain
 4368  Ordinary play obeys the same rules par was computed under
 4396  Progression is keyed by identity, not position
 4405  A custom board travels inside its own link
 4431  The editor gate refuses what it cannot prove
 4451  Save keys are tied to identity, not array position
 4476  Solver: routing correctness on boards with a known answer
 4527  Solution contract
 4570  The daily is generated AND verified
 4593  Touch targets stay usable on real phones
 4612  Shipped level data is well-formed
```

## The tooling seam

`window.__wiredDev` is the only surface `test.js` and `solve.js` reach through.
Renaming anything in it breaks both runners.

```
solveLevel, routeSolve, replaySolution, LEVELS, TICK_HZ, generateDailyLevel, loopPath, hazardPeriod, PAR_CONTRACT, trapMeasure, measurePressure, encodeLevel, decodeLevel, // Screen and staging control, used by shots.mjs to // photograph real positions. Nothing here can reach a // score: bests live in localStorage and were always // editable from this same console. ui: { enterLevel, showMenu, showSettings, showEditor, stageSolution, draw, updateHud }
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
app                 444
banner              501
bestVal             480
board               491
boardWrap           490
challengeTargetBar  482
colorblindToggle    592
controls            496
creditsVersion      627
editorBackBtn       517
editorCanvas        531
editorClear         524
editorCodeRow       542
editorCopy          539
editorHint          547
editorImport        543
editorLoad          544
editorPlay          538
editorRandom        525
editorScreen        515
editorSize          523
editorSizeRow       522
editorTools         528
editorVerdict       534
editorVerify        537
hud                 476
introBolt           438
introFlash          436
introScreen         429
introSkipHint       441
introTagline        439
introTitle          438
introTraces         430
introWordmark       437
menuBadge           452
menuBanner          455
menuBtn             469
menuList            454
menuScreen          447
muteToggle          606
playBody            474
playBottom          495
playerNameInput     613
playLevelName       470
playLevelNameText   470
playMain            489
playScreen          467
playTop             468
playTopStats        475
previewBtn          498
reduceMotionToggle  599
restartBtn          497
scoreVal            479
sealedBar           483
sealedRestart       485
sealedText          484
settingsBackBtn     557
settingsBtn         448
settingsCredits     626
settingsScreen      555
shareBlurb          638
shareBox            639
shareBtn            499
shareCard           636
shareCloseBtn       643
shareCopyBtn        642
shareModal          635
shareStatus         640
shareTitle          637
skinList            618
statsList           623
timer               477
winBestLine         653
winBreakdown        652
winCard             649
winEarnLine         654
winMenu             657
winModal            648
winNext             659
winRestart          656
winScore            651
winShare            658
zapCount            478
```
