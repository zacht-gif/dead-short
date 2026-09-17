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
sed -n '2035,2080p' index.html     # read those lines, not all 4,728
```

Generated from `index.html` - 4,728 lines, 209,290 bytes, sha256 `6a22c014cacf`.

## Files

| file | lines | what it is |
|---|---:|---|
| `index.html` | 4,728 | The entire game: markup, styles and engine in one file. |
| `build.js` | 267 | Release gate + packager. Refuses to zip a build that fails a check. |
| `codemap.js` | 346 | Generates CODE-MAP.md. This file. |
| `make-icons.mjs` | 188 | Rasterizes icons/*.png from the same art as icon.svg. |
| `shots.mjs` | 301 | Captures store/screenshots/ from the real game. |
| `chrome.mjs` | 164 | Headless-Chrome plumbing for shots.mjs. |
| `mutate.js` | 304 | Mutation audit: breaks the game on purpose to test the gates. |
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
| 178-323 | CSS | Play screen |  |
| 324-377 | CSS | Intro / splash screen |  |
| 378-405 | CSS | Editor |  |
| 406-431 | CSS | Landscape layout |  |
| 432-449 | HTML | INTRO / SPLASH SCREEN |  |
| 450-469 | HTML | MENU SCREEN |  |
| 470-517 | HTML | PLAY SCREEN |  |
| 518-557 | HTML | EDITOR SCREEN |  |
| 558-671 | HTML | SETTINGS SCREEN |  |
| 672-693 | JS | Tunables |  |
| 694-896 | JS | Level definitions | 2 |
| 897-1067 | JS | Daily challenge | 10 |
| 1068-1073 | JS | Medals |  |
| 1074-1122 | JS | Solution contract | 3 |
| 1123-1181 | JS | Persistent storage | 10 |
| 1182-1190 | JS | Lifetime stats (for the Settings > Stats section) | 3 |
| 1191-1252 | JS | Cosmetic perks (purely visual — never affect timing, sparks... | 4 |
| 1253-1510 | JS | Screen management | 10 |
| 1511-1536 | JS | State |  |
| 1537-1638 | JS | The clock | 6 |
| 1639-1693 | JS | Geometry helpers | 9 |
| 1694-1758 | JS | Sound (synthesized via Web Audio API — no asset files, keeps... | 4 |
| 1759-2085 | JS | Input | 10 |
| 2086-2212 | JS | Keyboard input (WASD / arrows) | 5 |
| 2213-2308 | JS | Obstacle motion + collision | 9 |
| 2309-2364 | JS | Wire identity: shape + pattern (always on) and palette (swappable) | 2 |
| 2365-2741 | JS | Rendering | 2 |
| 2742-2777 | JS | Main loop | 1 |
| 2778-2881 | JS | Buttons | 5 |
| 2882-2905 | JS | Intro / splash screen | 2 |
| 2906-2927 | JS | **SOLVERS** |  |
| 2928-3117 | JS | Solver A — routing | 5 |
| 3118-3303 | JS | **LEVEL CODEC** | 6 |
| 3304-3401 | JS | Trap measurement | 3 |
| 3402-3423 | JS | Hazard timing helpers | 4 |
| 3424-3664 | JS | Solver B — scheduling | 7 |
| 3665-4108 | JS | **EDITOR** | 16 |
| 4109-4687 | JS | Self test | 1 |
| 4688-4728 | JS | Boot |  |

## Functions, by section

All 139 `function` declarations in `index.html`.

### Level definitions  <sub>JS &middot; 694-896</sub>

```
  876  patrol  (ticksPerCell, waypoints)
  881  loopPath(waypoints)
```

### Daily challenge  <sub>JS &middot; 897-1067</sub>

```
  905  hashStr              (s)
  910  mulberry32           (seed)
  919  localDateString      (d)
  937  randomDailyBoard     (rand, dateStr)
  974  measurePressure      (lv, sol)
  984  generateDailyLevel   (dateStr)
 1042  terminalCellOf       (lv, cell)
 1046  getDailyStreak       ()
 1047  recordDailyPlay      (dateStr)
 1060  resolveChallengeLevel(challengeSlug)
```

### Solution contract  <sub>JS &middot; 1074-1122</sub>

```
 1098  parFor            (lv)
 1109  getMedalThresholds(lv)
 1114  medalForScore     (lv, scoreTicks)
```

### Persistent storage  <sub>JS &middot; 1123-1181</sub>

```
 1142  levelFingerprint(lv)
 1156  levelKey        (lv)
 1157  bestKey         (lv)
 1158  getBest         (lv)
 1164  setBestIfBetter (lv, scoreTicks)
 1174  cleanClearKey   (lv)
 1175  hasCleanClear   (lv)
 1176  markCleanClear  (lv)
 1179  ticksToSeconds  (t)
 1180  fmtTicks        (t)
```

### Lifetime stats (for the Settings > Stats section)  <sub>JS &middot; 1182-1190</sub>

```
 1183  bumpCounter      (key)
 1186  getCounter       (key)
 1187  medalsEarnedCount()
```

### Cosmetic perks (purely visual — never affect timing, sparks...  <sub>JS &middot; 1191-1252</sub>

```
 1214  getEquippedSkinId()
 1215  setEquippedSkinId(id)
 1216  applySkin        ()
 1225  renderSkinList   ()
```

### Screen management  <sub>JS &middot; 1253-1510</sub>

```
 1272  loadSettings   ()
 1310  saveSettings   ()
 1313  applySettings  ()
 1341  escapeHtml     (s)
 1348  describeHazards(lv)
 1359  renderMenu     ()
 1454  showMenu       ()
 1465  renderStats    ()
 1481  showSettings   ()
 1491  enterLevel     (lv)
```

### The clock  <sub>JS &middot; 1537-1638</sub>

```
 1568  computeCellSize     (cols, rows)
 1584  resizeCanvasForLevel()
 1597  currentScore        ()
 1599  resetPuzzle         ()
 1621  startRunIfIdle      ()
 1629  updateHud           ()
```

### Geometry helpers  <sub>JS &middot; 1639-1693</sub>

```
 1640  cellAt          (px, py)
 1645  sameCell        (a,b)
 1646  adjacent        (a,b)
 1647  terminalAt      (cell)
 1655  isBlocked       (cell)
 1661  inBounds        (cell)
 1667  occupiedBy      (cell, excludeIdx)
 1677  ownIntentIndexAt(cell)
 1687  commonPrefixLen (a, b)
```

### Sound (synthesized via Web Audio API — no asset files, keeps...  <sub>JS &middot; 1694-1758</sub>

```
 1700  ensureAudio()
 1709  playTone   (freq, opts)
 1724  playNoise  (opts)
 1753  haptic     (pattern)
```

### Input  <sub>JS &middot; 1759-2085</sub>

```
 1760  pointerPos          (evt)
 1778  setActiveColor      (idx)
 1784  onPointerDown       (cell)
 1836  planTo              (cell)
 1897  advanceToNextPlanned()
 1913  propagateActiveWire ()
 1985  findSealedPair      ()
 2019  announceSealIfAny   ()
 2039  stepTick            ()
 2052  endPointer          ()
```

### Keyboard input (WASD / arrows)  <sub>JS &middot; 2086-2212</sub>

```
 2091  cycleActiveColor(dir)
 2110  planHead        ()
 2117  keyboardStep    (dc, dr)
 2130  keyboardBack    ()
 2166  checkWin        ()
```

### Obstacle motion + collision  <sub>JS &middot; 2213-2308</sub>

```
 2221  isGate             (ob)
 2224  gateIsLive         (ob, tick)
 2231  obstacleCellAt     (ob, tick)
 2240  hopEase            (f)
 2246  obstacleRenderPos  (ob, tick, frac)
 2264  obstacleIsDangerous(ob, tick)
 2271  cellIsHot          (cell, tick)
 2280  checkZaps          (tick)
 2302  flashZap           ()
```

### Wire identity: shape + pattern (always on) and palette (swappable)  <sub>JS &middot; 2309-2364</sub>

```
 2333  styleFor (baseColor)
 2338  drawGlyph(shape, x, y, size)
```

### Rendering  <sub>JS &middot; 2365-2741</sub>

```
 2366  cssVar(name, fallback)
 2373  draw  (tick, frac)
```

### Main loop  <sub>JS &middot; 2742-2777</sub>

```
 2750  tick(now)
```

### Buttons  <sub>JS &middot; 2778-2881</sub>

```
 2786  nextLevelAfter(lv)
 2807  shareText     ()
 2814  challengeUrl  ()
 2845  shareTextOut  (title, body, blurb)
 2873  doShare       ()
```

### Intro / splash screen  <sub>JS &middot; 2882-2905</sub>

```
 2886  playIntro()
 2891  finish   ()
```

### Solver A — routing  <sub>JS &middot; 2928-3117</sub>

```
 2932  routeSolve      (lv, opts)
 2969  stillConnectable(k)
 3000  reachable       (fromIdx, goalIdx)
 3021  place           (k, cost)
 3033  walk            (k, p, cur, path, costBefore)
```

### LEVEL CODEC  <sub>JS &middot; 3118-3303</sub>

```
 3147  b64urlEncode(s)
 3150  b64urlDecode(s)
 3156  encodeLevel (lv)
 3182  decodeLevel (code)
 3275  customSlug  (code)
 3281  verifyLevel (lv)
```

### Trap measurement  <sub>JS &middot; 3304-3401</sub>

```
 3319  enumerateRoutes(lv, pairIdx, slack, maxCount)
 3365  restRoutable   (lv, pairIdx, route)
 3380  trapMeasure    (lv, opts)
```

### Hazard timing helpers  <sub>JS &middot; 3402-3423</sub>

```
 3403  gcd         (a,b)
 3404  lcm         (a,b)
 3407  hazardPeriod(lv)
 3415  dangerAt    (lv, tick)
```

### Solver B — scheduling  <sub>JS &middot; 3424-3664</sub>

```
 3441  wireRun       (lv, route, t0, cap)
 3497  scheduleSolve (lv, routes, opts)
 3559  solveLevel    (lv, opts)
 3583  applyAction   (act, sol)
 3601  replaySolution(lv, sol)
 3625  stageSolution (lv, sol, stopAfter)
 3653  stageSealDemo ()
```

### EDITOR  <sub>JS &middot; 3665-4108</sub>

```
 3694  edPadFor          (i)
 3699  edCellUsed        (cell)
 3705  edInBounds        (cell)
 3711  editorLevel       ()
 3731  edInvalidate      ()
 3737  setVerdict        (html, cls)
 3742  editorTap         (cell)
 3815  renderEditorTools ()
 3833  resizeEditorCanvas()
 3844  drawEditor        ()
 3941  drawGlyphOn       (c2d, shape, x, y, size)
 3959  editorCellAt      (evt)
 3970  runVerify         ()
 4007  editorClear       ()
 4016  editorRandom      ()
 4035  showEditor        ()
```

### Self test  <sub>JS &middot; 4109-4687</sub>

```
 4118  selfTest()
```

## Top-level constants

Cached `getElementById` handles are omitted - there are dozens and they all
sit in **Screen management**.

```
  681  GAME_VERSION        = '2.0.0';
  685  CANONICAL_URL       = '';
  687  TICK_HZ             = 6;
  688  MS_PER_TICK         = 1000 / TICK_HZ;
  689  MAX_FRAME_MS        = 250;
  691  ZAP_PENALTY_TICKS   = 3 * TICK_HZ;
  692  TRACE_MS            = 2500;
  715  LEVELS              = [
  924  DAILY_PALETTE       = ["#ff5d6c","#ffd75a","#7ab8ff","#c98bff","#54e...
  935  DAILY_BAND          = { parMin: 22, parMax: 46, holdsMin: 2, holdsMa...
  983  dailyCache          = new Map();
 1080  PAR_CONTRACT        = {
 1096  MEDAL_ICON          = { gold:'🥇', silver:'🥈', bronze:'🥉' };
 1097  parCache            = new Map();
 1130  STORE_PREFIX        = 'wired-v3-';
 1141  fingerprintCache    = new Map();
 1193  SKINS               = [
 1213  ALL_SKIN_TOKEN_KEYS = [...new Set(SKINS.flatMap(s=>Object.keys(s.tok...
 1254  screen              = 'menu';
 1266  SETTINGS_DEFAULTS   = {colorblind:false, reduceMotion:false, muted:f...
 1267  SETTINGS_KEY        = STORE_PREFIX + 'settings';
 1280  settings            = loadSettings();
 1283  pendingChallenge    = null;
 1284  pendingBoard        = null;
 1515  MIN_CELL            = 32, MAX_CELL = 64;
 1516  CELL                = MAX_CELL;
 1517  level               = LEVELS[0];
 1528  wires               = {};
 1529  activeColor         = null;
 1530  dragging            = false;
 1531  won                 = false;
 1532  zapCount            = 0;
 1533  previewUntil        = 0;
 1534  sealed              = false;
 1535  justLocked          = false;
 1542  tickCount           = 0;
 1543  running             = false;
 1544  tickAccum           = 0;
 1545  lastFrameMs         = null;
 1546  pendingSwitchTicks  = 0;
 1549  ctx                 = canvas.getContext('2d');
 1699  audioCtx            = null;
 1743  sfx                 = {
 2317  WIRE_STYLE          = {
 2326  COLORBLIND_PALETTE  = {
 2926  ROUTE_BUDGET        = 400000;
 3136  CODE_VERSION        = 'W1';
 3137  PAIR_COLORS         = ["#ff5d6c","#ffd75a","#7ab8ff","#54e6a6","#c98...
 3138  EDITOR_MIN          = 5;
 3144  EDITOR_MAX          = 7;
 3145  VERIFY_BUDGET       = 4000000;
 3646  SEAL_DEMO           = {
 3671  GATE_PRESETS        = [
 3675  PATROL_SPEEDS       = [2, 3, 1, 4];
 3677  edCols              = 6, edRows = 6;
 3678  edPads              = [];
 3679  edBlocked           = [];
 3680  edGates             = [];
 3681  edPatrols           = [];
 3682  edTool              = 'pair0';
 3683  edPatrolDraft       = null;
 3684  edVerified          = null;
 3687  edCtx               = editorCanvas.getContext('2d');
```

## Levels

Par comes from `PAR_CONTRACT`; regenerate it with `node solve.js --contract`.

| # | slug | name | grid | par | defined |
|---:|---|---|---|---:|---:|
| 1 | `breadboard` | Breadboard | 5x5 | 14 | 719 |
| 2 | `circuit-board` | Circuit Board | 6x6 | 28 | 731 |
| 3 | `elbow` | Elbow | 7x7 | 26 | 745 |
| 4 | `interlock` | Interlock | 7x7 | 29 | 761 |
| 5 | `mainframe` | Mainframe | 7x7 | 34 | 778 |
| 6 | `relay-yard` | Relay Yard | 7x8 | 36 | 795 |
| 7 | `backplane` | Backplane | 7x8 | 39 | 809 |
| 8 | `logic-array` | Logic Array | 7x8 | 39 | 824 |
| 9 | `ladder` | Ladder | 7x7 | 31 | 843 |
| 10 | `fault-line` | Fault Line | 7x6 | 38 | 856 |

## Test groups

The 20 assertion groups inside `selfTest()`, so you can find the test
for a behaviour without reading the whole suite.

```
 4133  The first frame of a patrol level renders
 4145  Current costs a tick per cell, and drawing costs nothing
 4163  The exploit this whole model exists to kill
 4178  Determinism: same actions from tick 0, same run
 4191  Spark position is a pure function of the tick counter
 4202  A spark shorts what it touches, and only what it touches
 4236  Current waits at a live contact instead of dying on it
 4251  Components block routing
 4262  A finished wire is a wall
 4275  Sealing the board is detected, and only when certain
 4402  Ordinary play obeys the same rules par was computed under
 4430  Progression is keyed by identity, not position
 4439  A custom board travels inside its own link
 4465  The editor gate refuses what it cannot prove
 4485  Save keys are tied to identity, not array position
 4510  Solver: routing correctness on boards with a known answer
 4561  Solution contract
 4604  The daily is generated AND verified
 4627  Touch targets stay usable on real phones
 4646  Shipped level data is well-formed
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
app                 448
banner              505
bestVal             484
board               495
boardWrap           494
challengeTargetBar  486
colorblindToggle    596
controls            500
creditsVersion      631
editorBackBtn       521
editorCanvas        535
editorClear         528
editorCodeRow       546
editorCopy          543
editorHint          551
editorImport        547
editorLoad          548
editorPlay          542
editorRandom        529
editorScreen        519
editorSize          527
editorSizeRow       526
editorTools         532
editorVerdict       538
editorVerify        541
hud                 480
introBolt           442
introFlash          440
introScreen         433
introSkipHint       445
introTagline        443
introTitle          442
introTraces         434
introWordmark       441
menuBadge           456
menuBanner          459
menuBtn             473
menuList            458
menuScreen          451
muteToggle          610
playBody            478
playBottom          499
playerNameInput     617
playLevelName       474
playLevelNameText   474
playMain            493
playScreen          471
playTop             472
playTopStats        479
previewBtn          502
reduceMotionToggle  603
restartBtn          501
scoreVal            483
sealedBar           487
sealedRestart       489
sealedText          488
settingsBackBtn     561
settingsBtn         452
settingsCredits     630
settingsScreen      559
shareBlurb          642
shareBox            643
shareBtn            503
shareCard           640
shareCloseBtn       647
shareCopyBtn        646
shareModal          639
shareStatus         644
shareTitle          641
skinList            622
statsList           627
timer               481
winBestLine         657
winBreakdown        656
winCard             653
winEarnLine         658
winMenu             661
winModal            652
winNext             663
winRestart          660
winScore            655
winShare            662
zapCount            482
```
