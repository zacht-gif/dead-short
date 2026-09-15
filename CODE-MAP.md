# Wired - code map

**Generated file. Do not edit by hand - your changes will be overwritten.**
Regenerate with `node codemap.js`. `node codemap.js --check` proves it is current,
and `build.js` runs that check, so a stale map cannot ship.

This file answers *where*. For *what shape* and *what to touch for a given change*,
read [ARCHITECTURE.md](ARCHITECTURE.md) - hand-written, and stable because it names
shapes rather than line numbers.

Generated from `index.html` - 4,637 lines, 204,591 bytes, sha256 `a4d40b9e3bda`.

## Files

| file | lines | what it is |
|---|---:|---|
| `index.html` | 4,637 | The entire game: markup, styles and engine in one file. |
| `build.js` | 159 | Release gate + packager. Refuses to zip a build that fails a check. |
| `codemap.js` | 334 | Generates CODE-MAP.md. This file. |
| `harness.js` | 135 | Loads the inline game script into a stub DOM under node:vm. |
| `test.js` | 55 | Headless runner for the in-page selfTest(). |
| `solve.js` | 89 | Proves each level routes, computes par, replays it to verify. |
| `sw.js` | 34 | Service worker. CACHE_NAME must contain GAME_VERSION. |
| `manifest.json` | 17 | PWA manifest. |
| `icon.svg` | 6 | The only image asset the game ships. |

## index.html - section map

Every section marker in the file, in order. `CSS` markers sit in the `<style>`
block, `HTML` in the body, `JS` in the inline script.

| lines | region | section | fns |
|---|---|---|---:|
| 82-91 | CSS | Menu screen |  |
| 92-176 | CSS | Settings screen |  |
| 177-318 | CSS | Play screen |  |
| 319-372 | CSS | Intro / splash screen |  |
| 373-400 | CSS | Editor |  |
| 401-426 | CSS | Landscape layout |  |
| 427-444 | HTML | INTRO / SPLASH SCREEN |  |
| 445-464 | HTML | MENU SCREEN |  |
| 465-512 | HTML | PLAY SCREEN |  |
| 513-552 | HTML | EDITOR SCREEN |  |
| 553-666 | HTML | SETTINGS SCREEN |  |
| 667-688 | JS | Tunables |  |
| 689-891 | JS | Level definitions | 2 |
| 892-1062 | JS | Daily challenge | 10 |
| 1063-1068 | JS | Medals |  |
| 1069-1117 | JS | Solution contract | 3 |
| 1118-1176 | JS | Persistent storage | 10 |
| 1177-1185 | JS | Lifetime stats (for the Settings > Stats section) | 3 |
| 1186-1247 | JS | Cosmetic perks (purely visual — never affect timing, sparks... | 4 |
| 1248-1505 | JS | Screen management | 10 |
| 1506-1531 | JS | State |  |
| 1532-1633 | JS | The clock | 6 |
| 1634-1688 | JS | Geometry helpers | 9 |
| 1689-1753 | JS | Sound (synthesized via Web Audio API — no asset files, keeps... | 4 |
| 1754-2080 | JS | Input | 10 |
| 2081-2207 | JS | Keyboard input (WASD / arrows) | 5 |
| 2208-2296 | JS | Obstacle motion + collision | 9 |
| 2297-2352 | JS | Wire identity: shape + pattern (always on) and palette (swappable) | 2 |
| 2353-2729 | JS | Rendering | 2 |
| 2730-2765 | JS | Main loop | 1 |
| 2766-2869 | JS | Buttons | 5 |
| 2870-2893 | JS | Intro / splash screen | 2 |
| 2894-2915 | JS | **SOLVERS** |  |
| 2916-3105 | JS | Solver A — routing | 5 |
| 3106-3291 | JS | **LEVEL CODEC** | 6 |
| 3292-3389 | JS | Trap measurement | 3 |
| 3390-3411 | JS | Hazard timing helpers | 4 |
| 3412-3593 | JS | Solver B — scheduling | 4 |
| 3594-4037 | JS | **EDITOR** | 16 |
| 4038-4596 | JS | Self test | 1 |
| 4597-4637 | JS | Boot |  |

## Functions, by section

All 136 `function` declarations in `index.html`.

### Level definitions  <sub>JS &middot; 689-891</sub>

```
  871  patrol  (ticksPerCell, waypoints)
  876  loopPath(waypoints)
```

### Daily challenge  <sub>JS &middot; 892-1062</sub>

```
  900  hashStr              (s)
  905  mulberry32           (seed)
  914  localDateString      (d)
  932  randomDailyBoard     (rand, dateStr)
  969  measurePressure      (lv, sol)
  979  generateDailyLevel   (dateStr)
 1037  terminalCellOf       (lv, cell)
 1041  getDailyStreak       ()
 1042  recordDailyPlay      (dateStr)
 1055  resolveChallengeLevel(challengeSlug)
```

### Solution contract  <sub>JS &middot; 1069-1117</sub>

```
 1093  parFor            (lv)
 1104  getMedalThresholds(lv)
 1109  medalForScore     (lv, scoreTicks)
```

### Persistent storage  <sub>JS &middot; 1118-1176</sub>

```
 1137  levelFingerprint(lv)
 1151  levelKey        (lv)
 1152  bestKey         (lv)
 1153  getBest         (lv)
 1159  setBestIfBetter (lv, scoreTicks)
 1169  cleanClearKey   (lv)
 1170  hasCleanClear   (lv)
 1171  markCleanClear  (lv)
 1174  ticksToSeconds  (t)
 1175  fmtTicks        (t)
```

### Lifetime stats (for the Settings > Stats section)  <sub>JS &middot; 1177-1185</sub>

```
 1178  bumpCounter      (key)
 1181  getCounter       (key)
 1182  medalsEarnedCount()
```

### Cosmetic perks (purely visual — never affect timing, sparks...  <sub>JS &middot; 1186-1247</sub>

```
 1209  getEquippedSkinId()
 1210  setEquippedSkinId(id)
 1211  applySkin        ()
 1220  renderSkinList   ()
```

### Screen management  <sub>JS &middot; 1248-1505</sub>

```
 1267  loadSettings   ()
 1305  saveSettings   ()
 1308  applySettings  ()
 1336  escapeHtml     (s)
 1343  describeHazards(lv)
 1354  renderMenu     ()
 1449  showMenu       ()
 1460  renderStats    ()
 1476  showSettings   ()
 1486  enterLevel     (lv)
```

### The clock  <sub>JS &middot; 1532-1633</sub>

```
 1563  computeCellSize     (cols, rows)
 1579  resizeCanvasForLevel()
 1592  currentScore        ()
 1594  resetPuzzle         ()
 1616  startRunIfIdle      ()
 1624  updateHud           ()
```

### Geometry helpers  <sub>JS &middot; 1634-1688</sub>

```
 1635  cellAt          (px, py)
 1640  sameCell        (a,b)
 1641  adjacent        (a,b)
 1642  terminalAt      (cell)
 1650  isBlocked       (cell)
 1656  inBounds        (cell)
 1662  occupiedBy      (cell, excludeIdx)
 1672  ownIntentIndexAt(cell)
 1682  commonPrefixLen (a, b)
```

### Sound (synthesized via Web Audio API — no asset files, keeps...  <sub>JS &middot; 1689-1753</sub>

```
 1695  ensureAudio()
 1704  playTone   (freq, opts)
 1719  playNoise  (opts)
 1748  haptic     (pattern)
```

### Input  <sub>JS &middot; 1754-2080</sub>

```
 1755  pointerPos          (evt)
 1773  setActiveColor      (idx)
 1779  onPointerDown       (cell)
 1831  planTo              (cell)
 1892  advanceToNextPlanned()
 1908  propagateActiveWire ()
 1980  findSealedPair      ()
 2014  announceSealIfAny   ()
 2034  stepTick            ()
 2047  endPointer          ()
```

### Keyboard input (WASD / arrows)  <sub>JS &middot; 2081-2207</sub>

```
 2086  cycleActiveColor(dir)
 2105  planHead        ()
 2112  keyboardStep    (dc, dr)
 2125  keyboardBack    ()
 2161  checkWin        ()
```

### Obstacle motion + collision  <sub>JS &middot; 2208-2296</sub>

```
 2216  isGate             (ob)
 2219  gateIsLive         (ob, tick)
 2226  obstacleCellAt     (ob, tick)
 2235  hopEase            (f)
 2241  obstacleRenderPos  (ob, tick, frac)
 2252  obstacleIsDangerous(ob, tick)
 2259  cellIsHot          (cell, tick)
 2268  checkZaps          (tick)
 2290  flashZap           ()
```

### Wire identity: shape + pattern (always on) and palette (swappable)  <sub>JS &middot; 2297-2352</sub>

```
 2321  styleFor (baseColor)
 2326  drawGlyph(shape, x, y, size)
```

### Rendering  <sub>JS &middot; 2353-2729</sub>

```
 2354  cssVar(name, fallback)
 2361  draw  (tick, frac)
```

### Main loop  <sub>JS &middot; 2730-2765</sub>

```
 2738  tick(now)
```

### Buttons  <sub>JS &middot; 2766-2869</sub>

```
 2774  nextLevelAfter(lv)
 2795  shareText     ()
 2802  challengeUrl  ()
 2833  shareTextOut  (title, body, blurb)
 2861  doShare       ()
```

### Intro / splash screen  <sub>JS &middot; 2870-2893</sub>

```
 2874  playIntro()
 2879  finish   ()
```

### Solver A — routing  <sub>JS &middot; 2916-3105</sub>

```
 2920  routeSolve      (lv, opts)
 2957  stillConnectable(k)
 2988  reachable       (fromIdx, goalIdx)
 3009  place           (k, cost)
 3021  walk            (k, p, cur, path, costBefore)
```

### LEVEL CODEC  <sub>JS &middot; 3106-3291</sub>

```
 3135  b64urlEncode(s)
 3138  b64urlDecode(s)
 3144  encodeLevel (lv)
 3170  decodeLevel (code)
 3263  customSlug  (code)
 3269  verifyLevel (lv)
```

### Trap measurement  <sub>JS &middot; 3292-3389</sub>

```
 3307  enumerateRoutes(lv, pairIdx, slack, maxCount)
 3353  restRoutable   (lv, pairIdx, route)
 3368  trapMeasure    (lv, opts)
```

### Hazard timing helpers  <sub>JS &middot; 3390-3411</sub>

```
 3391  gcd         (a,b)
 3392  lcm         (a,b)
 3395  hazardPeriod(lv)
 3403  dangerAt    (lv, tick)
```

### Solver B — scheduling  <sub>JS &middot; 3412-3593</sub>

```
 3429  wireRun       (lv, route, t0, cap)
 3485  scheduleSolve (lv, routes, opts)
 3547  solveLevel    (lv, opts)
 3566  replaySolution(lv, sol)
```

### EDITOR  <sub>JS &middot; 3594-4037</sub>

```
 3623  edPadFor          (i)
 3628  edCellUsed        (cell)
 3634  edInBounds        (cell)
 3640  editorLevel       ()
 3660  edInvalidate      ()
 3666  setVerdict        (html, cls)
 3671  editorTap         (cell)
 3744  renderEditorTools ()
 3762  resizeEditorCanvas()
 3773  drawEditor        ()
 3870  drawGlyphOn       (c2d, shape, x, y, size)
 3888  editorCellAt      (evt)
 3899  runVerify         ()
 3936  editorClear       ()
 3945  editorRandom      ()
 3964  showEditor        ()
```

### Self test  <sub>JS &middot; 4038-4596</sub>

```
 4047  selfTest()
```

## Top-level constants

Cached `getElementById` handles are omitted - there are dozens and they all
sit in **Screen management**.

```
  676  GAME_VERSION        = '2.0.0';
  680  CANONICAL_URL       = '';
  682  TICK_HZ             = 6;
  683  MS_PER_TICK         = 1000 / TICK_HZ;
  684  MAX_FRAME_MS        = 250;
  686  ZAP_PENALTY_TICKS   = 3 * TICK_HZ;
  687  TRACE_MS            = 2500;
  710  LEVELS              = [
  919  DAILY_PALETTE       = ["#ff5d6c","#ffd75a","#7ab8ff","#c98bff","#54e...
  930  DAILY_BAND          = { parMin: 22, parMax: 46, holdsMin: 2, holdsMa...
  978  dailyCache          = new Map();
 1075  PAR_CONTRACT        = {
 1091  MEDAL_ICON          = { gold:'🥇', silver:'🥈', bronze:'🥉' };
 1092  parCache            = new Map();
 1125  STORE_PREFIX        = 'wired-v3-';
 1136  fingerprintCache    = new Map();
 1188  SKINS               = [
 1208  ALL_SKIN_TOKEN_KEYS = [...new Set(SKINS.flatMap(s=>Object.keys(s.tok...
 1249  screen              = 'menu';
 1261  SETTINGS_DEFAULTS   = {colorblind:false, reduceMotion:false, muted:f...
 1262  SETTINGS_KEY        = STORE_PREFIX + 'settings';
 1275  settings            = loadSettings();
 1278  pendingChallenge    = null;
 1279  pendingBoard        = null;
 1510  MIN_CELL            = 32, MAX_CELL = 64;
 1511  CELL                = MAX_CELL;
 1512  level               = LEVELS[0];
 1523  wires               = {};
 1524  activeColor         = null;
 1525  dragging            = false;
 1526  won                 = false;
 1527  zapCount            = 0;
 1528  previewUntil        = 0;
 1529  sealed              = false;
 1530  justLocked          = false;
 1537  tickCount           = 0;
 1538  running             = false;
 1539  tickAccum           = 0;
 1540  lastFrameMs         = null;
 1541  pendingSwitchTicks  = 0;
 1544  ctx                 = canvas.getContext('2d');
 1694  audioCtx            = null;
 1738  sfx                 = {
 2305  WIRE_STYLE          = {
 2314  COLORBLIND_PALETTE  = {
 2914  ROUTE_BUDGET        = 400000;
 3124  CODE_VERSION        = 'W1';
 3125  PAIR_COLORS         = ["#ff5d6c","#ffd75a","#7ab8ff","#54e6a6","#c98...
 3126  EDITOR_MIN          = 5;
 3132  EDITOR_MAX          = 7;
 3133  VERIFY_BUDGET       = 4000000;
 3600  GATE_PRESETS        = [
 3604  PATROL_SPEEDS       = [2, 3, 1, 4];
 3606  edCols              = 6, edRows = 6;
 3607  edPads              = [];
 3608  edBlocked           = [];
 3609  edGates             = [];
 3610  edPatrols           = [];
 3611  edTool              = 'pair0';
 3612  edPatrolDraft       = null;
 3613  edVerified          = null;
 3616  edCtx               = editorCanvas.getContext('2d');
```

## Levels

Par comes from `PAR_CONTRACT`; regenerate it with `node solve.js --contract`.

| # | slug | name | grid | par | defined |
|---:|---|---|---|---:|---:|
| 1 | `breadboard` | Breadboard | 5x5 | 14 | 714 |
| 2 | `circuit-board` | Circuit Board | 6x6 | 28 | 726 |
| 3 | `elbow` | Elbow | 7x7 | 26 | 740 |
| 4 | `interlock` | Interlock | 7x7 | 29 | 756 |
| 5 | `mainframe` | Mainframe | 7x7 | 34 | 773 |
| 6 | `relay-yard` | Relay Yard | 7x8 | 36 | 790 |
| 7 | `backplane` | Backplane | 7x8 | 39 | 804 |
| 8 | `logic-array` | Logic Array | 7x8 | 39 | 819 |
| 9 | `ladder` | Ladder | 7x7 | 31 | 838 |
| 10 | `fault-line` | Fault Line | 7x6 | 38 | 851 |

## Test groups

The 19 assertion groups inside `selfTest()`, so you can find the test
for a behaviour without reading the whole suite.

```
 4062  Current costs a tick per cell, and drawing costs nothing
 4080  The exploit this whole model exists to kill
 4095  Determinism: same actions from tick 0, same run
 4108  Spark position is a pure function of the tick counter
 4119  A spark shorts what it touches, and only what it touches
 4153  Current waits at a live contact instead of dying on it
 4168  Components block routing
 4179  A finished wire is a wall
 4192  Sealing the board is detected, and only when certain
 4318  Ordinary play obeys the same rules par was computed under
 4346  Progression is keyed by identity, not position
 4355  A custom board travels inside its own link
 4381  The editor gate refuses what it cannot prove
 4401  Save keys are tied to identity, not array position
 4426  Solver: routing correctness on boards with a known answer
 4477  Solution contract
 4520  The daily is generated AND verified
 4543  Touch targets stay usable on real phones
 4562  Shipped level data is well-formed
```

## The tooling seam

`window.__wiredDev` is the only surface `test.js` and `solve.js` reach through.
Renaming anything in it breaks both runners.

```
solveLevel, routeSolve, replaySolution, LEVELS, TICK_HZ, generateDailyLevel, loopPath, hazardPeriod, PAR_CONTRACT, trapMeasure, measurePressure
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
app                 443
banner              500
bestVal             479
board               490
boardWrap           489
challengeTargetBar  481
colorblindToggle    591
controls            495
creditsVersion      626
editorBackBtn       516
editorCanvas        530
editorClear         523
editorCodeRow       541
editorCopy          538
editorHint          546
editorImport        542
editorLoad          543
editorPlay          537
editorRandom        524
editorScreen        514
editorSize          522
editorSizeRow       521
editorTools         527
editorVerdict       533
editorVerify        536
hud                 475
introBolt           437
introFlash          435
introScreen         428
introSkipHint       440
introTagline        438
introTitle          437
introTraces         429
introWordmark       436
menuBadge           451
menuBanner          454
menuBtn             468
menuList            453
menuScreen          446
muteToggle          605
playBody            473
playBottom          494
playerNameInput     612
playLevelName       469
playLevelNameText   469
playMain            488
playScreen          466
playTop             467
playTopStats        474
previewBtn          497
reduceMotionToggle  598
restartBtn          496
scoreVal            478
sealedBar           482
sealedRestart       484
sealedText          483
settingsBackBtn     556
settingsBtn         447
settingsCredits     625
settingsScreen      554
shareBlurb          637
shareBox            638
shareBtn            498
shareCard           635
shareCloseBtn       642
shareCopyBtn        641
shareModal          634
shareStatus         639
shareTitle          636
skinList            617
statsList           622
timer               476
winBestLine         652
winBreakdown        651
winCard             648
winEarnLine         653
winMenu             656
winModal            647
winNext             658
winRestart          655
winScore            650
winShare            657
zapCount            477
```
