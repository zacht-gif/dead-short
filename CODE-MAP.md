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
sed -n '2035,2080p' index.html     # read those lines, not all 4,780
```

Generated from `index.html` - 4,780 lines, 212,409 bytes, sha256 `4f4a51e6ccc4`.

## Files

| file | lines | what it is |
|---|---:|---|
| `index.html` | 4,780 | The entire game: markup, styles and engine in one file. |
| `build.js` | 267 | Release gate + packager. Refuses to zip a build that fails a check. |
| `codemap.js` | 346 | Generates CODE-MAP.md. This file. |
| `make-icons.mjs` | 188 | Rasterizes icons/*.png from the same art as icon.svg. |
| `shots.mjs` | 301 | Captures store/screenshots/ from the real game. |
| `chrome.mjs` | 164 | Headless-Chrome plumbing for shots.mjs. |
| `mutate.js` | 328 | Mutation audit: breaks the game on purpose to test the gates. |
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
| 897-1073 | JS | Daily challenge | 10 |
| 1074-1079 | JS | Medals |  |
| 1080-1128 | JS | Solution contract | 3 |
| 1129-1190 | JS | Persistent storage | 10 |
| 1191-1199 | JS | Lifetime stats (for the Settings > Stats section) | 3 |
| 1200-1261 | JS | Cosmetic perks (purely visual — never affect timing, sparks... | 4 |
| 1262-1523 | JS | Screen management | 10 |
| 1524-1549 | JS | State |  |
| 1550-1651 | JS | The clock | 6 |
| 1652-1706 | JS | Geometry helpers | 9 |
| 1707-1771 | JS | Sound (synthesized via Web Audio API — no asset files, keeps... | 4 |
| 1772-2098 | JS | Input | 10 |
| 2099-2225 | JS | Keyboard input (WASD / arrows) | 5 |
| 2226-2321 | JS | Obstacle motion + collision | 9 |
| 2322-2377 | JS | Wire identity: shape + pattern (always on) and palette (swappable) | 2 |
| 2378-2754 | JS | Rendering | 2 |
| 2755-2790 | JS | Main loop | 1 |
| 2791-2894 | JS | Buttons | 5 |
| 2895-2918 | JS | Intro / splash screen | 2 |
| 2919-2940 | JS | **SOLVERS** |  |
| 2941-3130 | JS | Solver A — routing | 5 |
| 3131-3316 | JS | **LEVEL CODEC** | 6 |
| 3317-3414 | JS | Trap measurement | 3 |
| 3415-3436 | JS | Hazard timing helpers | 4 |
| 3437-3677 | JS | Solver B — scheduling | 7 |
| 3678-4121 | JS | **EDITOR** | 16 |
| 4122-4739 | JS | Self test | 1 |
| 4740-4780 | JS | Boot |  |

## Functions, by section

All 139 `function` declarations in `index.html`.

### Level definitions  <sub>JS &middot; 694-896</sub>

```
  876  patrol  (ticksPerCell, waypoints)
  881  loopPath(waypoints)
```

### Daily challenge  <sub>JS &middot; 897-1073</sub>

```
  905  hashStr              (s)
  910  mulberry32           (seed)
  919  localDateString      (d)
  937  randomDailyBoard     (rand, dateStr)
  974  measurePressure      (lv, sol)
  990  generateDailyLevel   (dateStr)
 1048  terminalCellOf       (lv, cell)
 1052  getDailyStreak       ()
 1053  recordDailyPlay      (dateStr)
 1066  resolveChallengeLevel(challengeSlug)
```

### Solution contract  <sub>JS &middot; 1080-1128</sub>

```
 1104  parFor            (lv)
 1115  getMedalThresholds(lv)
 1120  medalForScore     (lv, scoreTicks)
```

### Persistent storage  <sub>JS &middot; 1129-1190</sub>

```
 1151  levelFingerprint(lv)
 1165  levelKey        (lv)
 1166  bestKey         (lv)
 1167  getBest         (lv)
 1173  setBestIfBetter (lv, scoreTicks)
 1183  cleanClearKey   (lv)
 1184  hasCleanClear   (lv)
 1185  markCleanClear  (lv)
 1188  ticksToSeconds  (t)
 1189  fmtTicks        (t)
```

### Lifetime stats (for the Settings > Stats section)  <sub>JS &middot; 1191-1199</sub>

```
 1192  bumpCounter      (key)
 1195  getCounter       (key)
 1196  medalsEarnedCount()
```

### Cosmetic perks (purely visual — never affect timing, sparks...  <sub>JS &middot; 1200-1261</sub>

```
 1223  getEquippedSkinId()
 1224  setEquippedSkinId(id)
 1225  applySkin        ()
 1234  renderSkinList   ()
```

### Screen management  <sub>JS &middot; 1262-1523</sub>

```
 1285  loadSettings   ()
 1323  saveSettings   ()
 1326  applySettings  ()
 1354  escapeHtml     (s)
 1361  describeHazards(lv)
 1372  renderMenu     ()
 1467  showMenu       ()
 1478  renderStats    ()
 1494  showSettings   ()
 1504  enterLevel     (lv)
```

### The clock  <sub>JS &middot; 1550-1651</sub>

```
 1581  computeCellSize     (cols, rows)
 1597  resizeCanvasForLevel()
 1610  currentScore        ()
 1612  resetPuzzle         ()
 1634  startRunIfIdle      ()
 1642  updateHud           ()
```

### Geometry helpers  <sub>JS &middot; 1652-1706</sub>

```
 1653  cellAt          (px, py)
 1658  sameCell        (a,b)
 1659  adjacent        (a,b)
 1660  terminalAt      (cell)
 1668  isBlocked       (cell)
 1674  inBounds        (cell)
 1680  occupiedBy      (cell, excludeIdx)
 1690  ownIntentIndexAt(cell)
 1700  commonPrefixLen (a, b)
```

### Sound (synthesized via Web Audio API — no asset files, keeps...  <sub>JS &middot; 1707-1771</sub>

```
 1713  ensureAudio()
 1722  playTone   (freq, opts)
 1737  playNoise  (opts)
 1766  haptic     (pattern)
```

### Input  <sub>JS &middot; 1772-2098</sub>

```
 1773  pointerPos          (evt)
 1791  setActiveColor      (idx)
 1797  onPointerDown       (cell)
 1849  planTo              (cell)
 1910  advanceToNextPlanned()
 1926  propagateActiveWire ()
 1998  findSealedPair      ()
 2032  announceSealIfAny   ()
 2052  stepTick            ()
 2065  endPointer          ()
```

### Keyboard input (WASD / arrows)  <sub>JS &middot; 2099-2225</sub>

```
 2104  cycleActiveColor(dir)
 2123  planHead        ()
 2130  keyboardStep    (dc, dr)
 2143  keyboardBack    ()
 2179  checkWin        ()
```

### Obstacle motion + collision  <sub>JS &middot; 2226-2321</sub>

```
 2234  isGate             (ob)
 2237  gateIsLive         (ob, tick)
 2244  obstacleCellAt     (ob, tick)
 2253  hopEase            (f)
 2259  obstacleRenderPos  (ob, tick, frac)
 2277  obstacleIsDangerous(ob, tick)
 2284  cellIsHot          (cell, tick)
 2293  checkZaps          (tick)
 2315  flashZap           ()
```

### Wire identity: shape + pattern (always on) and palette (swappable)  <sub>JS &middot; 2322-2377</sub>

```
 2346  styleFor (baseColor)
 2351  drawGlyph(shape, x, y, size)
```

### Rendering  <sub>JS &middot; 2378-2754</sub>

```
 2379  cssVar(name, fallback)
 2386  draw  (tick, frac)
```

### Main loop  <sub>JS &middot; 2755-2790</sub>

```
 2763  tick(now)
```

### Buttons  <sub>JS &middot; 2791-2894</sub>

```
 2799  nextLevelAfter(lv)
 2820  shareText     ()
 2827  challengeUrl  ()
 2858  shareTextOut  (title, body, blurb)
 2886  doShare       ()
```

### Intro / splash screen  <sub>JS &middot; 2895-2918</sub>

```
 2899  playIntro()
 2904  finish   ()
```

### Solver A — routing  <sub>JS &middot; 2941-3130</sub>

```
 2945  routeSolve      (lv, opts)
 2982  stillConnectable(k)
 3013  reachable       (fromIdx, goalIdx)
 3034  place           (k, cost)
 3046  walk            (k, p, cur, path, costBefore)
```

### LEVEL CODEC  <sub>JS &middot; 3131-3316</sub>

```
 3160  b64urlEncode(s)
 3163  b64urlDecode(s)
 3169  encodeLevel (lv)
 3195  decodeLevel (code)
 3288  customSlug  (code)
 3294  verifyLevel (lv)
```

### Trap measurement  <sub>JS &middot; 3317-3414</sub>

```
 3332  enumerateRoutes(lv, pairIdx, slack, maxCount)
 3378  restRoutable   (lv, pairIdx, route)
 3393  trapMeasure    (lv, opts)
```

### Hazard timing helpers  <sub>JS &middot; 3415-3436</sub>

```
 3416  gcd         (a,b)
 3417  lcm         (a,b)
 3420  hazardPeriod(lv)
 3428  dangerAt    (lv, tick)
```

### Solver B — scheduling  <sub>JS &middot; 3437-3677</sub>

```
 3454  wireRun       (lv, route, t0, cap)
 3510  scheduleSolve (lv, routes, opts)
 3572  solveLevel    (lv, opts)
 3596  applyAction   (act, sol)
 3614  replaySolution(lv, sol)
 3638  stageSolution (lv, sol, stopAfter)
 3666  stageSealDemo ()
```

### EDITOR  <sub>JS &middot; 3678-4121</sub>

```
 3707  edPadFor          (i)
 3712  edCellUsed        (cell)
 3718  edInBounds        (cell)
 3724  editorLevel       ()
 3744  edInvalidate      ()
 3750  setVerdict        (html, cls)
 3755  editorTap         (cell)
 3828  renderEditorTools ()
 3846  resizeEditorCanvas()
 3857  drawEditor        ()
 3954  drawGlyphOn       (c2d, shape, x, y, size)
 3972  editorCellAt      (evt)
 3983  runVerify         ()
 4020  editorClear       ()
 4029  editorRandom      ()
 4048  showEditor        ()
```

### Self test  <sub>JS &middot; 4122-4739</sub>

```
 4131  selfTest()
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
  987  DAILY_SEED_PREFIX   = 'wired-daily-v3-';
  989  dailyCache          = new Map();
 1086  PAR_CONTRACT        = {
 1102  MEDAL_ICON          = { gold:'🥇', silver:'🥈', bronze:'🥉' };
 1103  parCache            = new Map();
 1139  STORE_PREFIX        = 'wired-v3-';
 1150  fingerprintCache    = new Map();
 1202  SKINS               = [
 1222  ALL_SKIN_TOKEN_KEYS = [...new Set(SKINS.flatMap(s=>Object.keys(s.tok...
 1263  screen              = 'menu';
 1275  SETTINGS_DEFAULTS   = {colorblind:false, reduceMotion:false, muted:f...
 1276  SETTINGS_KEY        = STORE_PREFIX + 'settings';
 1283  LEGACY_SETTINGS_KEY = 'wired-v2-settings';
 1293  settings            = loadSettings();
 1296  pendingChallenge    = null;
 1297  pendingBoard        = null;
 1528  MIN_CELL            = 32, MAX_CELL = 64;
 1529  CELL                = MAX_CELL;
 1530  level               = LEVELS[0];
 1541  wires               = {};
 1542  activeColor         = null;
 1543  dragging            = false;
 1544  won                 = false;
 1545  zapCount            = 0;
 1546  previewUntil        = 0;
 1547  sealed              = false;
 1548  justLocked          = false;
 1555  tickCount           = 0;
 1556  running             = false;
 1557  tickAccum           = 0;
 1558  lastFrameMs         = null;
 1559  pendingSwitchTicks  = 0;
 1562  ctx                 = canvas.getContext('2d');
 1712  audioCtx            = null;
 1756  sfx                 = {
 2330  WIRE_STYLE          = {
 2339  COLORBLIND_PALETTE  = {
 2939  ROUTE_BUDGET        = 400000;
 3149  CODE_VERSION        = 'W1';
 3150  PAIR_COLORS         = ["#ff5d6c","#ffd75a","#7ab8ff","#54e6a6","#c98...
 3151  EDITOR_MIN          = 5;
 3157  EDITOR_MAX          = 7;
 3158  VERIFY_BUDGET       = 4000000;
 3659  SEAL_DEMO           = {
 3684  GATE_PRESETS        = [
 3688  PATROL_SPEEDS       = [2, 3, 1, 4];
 3690  edCols              = 6, edRows = 6;
 3691  edPads              = [];
 3692  edBlocked           = [];
 3693  edGates             = [];
 3694  edPatrols           = [];
 3695  edTool              = 'pair0';
 3696  edPatrolDraft       = null;
 3697  edVerified          = null;
 3700  edCtx               = editorCanvas.getContext('2d');
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

The 21 assertion groups inside `selfTest()`, so you can find the test
for a behaviour without reading the whole suite.

```
 4146  The first frame of a patrol level renders
 4158  Current costs a tick per cell, and drawing costs nothing
 4176  The exploit this whole model exists to kill
 4191  Determinism: same actions from tick 0, same run
 4204  Spark position is a pure function of the tick counter
 4215  A spark shorts what it touches, and only what it touches
 4249  Current waits at a live contact instead of dying on it
 4264  Components block routing
 4275  A finished wire is a wall
 4288  Sealing the board is detected, and only when certain
 4415  Ordinary play obeys the same rules par was computed under
 4443  Progression is keyed by identity, not position
 4452  A custom board travels inside its own link
 4478  The editor gate refuses what it cannot prove
 4498  Save keys are tied to identity, not array position
 4523  The persistence contract survives a rename
 4562  Solver: routing correctness on boards with a known answer
 4613  Solution contract
 4656  The daily is generated AND verified
 4679  Touch targets stay usable on real phones
 4698  Shipped level data is well-formed
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
