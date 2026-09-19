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
sed -n '2035,2080p' index.html     # read those lines, not all 6,094
```

Generated from `index.html` - 6,094 lines, 287,543 bytes, sha256 `65a2f3518a3b`.

## Files

| file | lines | what it is |
|---|---:|---|
| `index.html` | 6,094 | The entire game: markup, styles and engine in one file. |
| `build.js` | 734 | Release gate + packager. Refuses to zip a build that fails a check. |
| `codemap.js` | 347 | Generates CODE-MAP.md. This file. |
| `make-icons.mjs` | 188 | Rasterizes icons/*.png from the same art as icon.svg. |
| `shots.mjs` | 320 | Captures store/screenshots/ from the real game. |
| `chrome.mjs` | 164 | Headless-Chrome plumbing for shots.mjs. |
| `mutate.js` | 677 | Mutation audit: breaks the game on purpose to test the gates. |
| `harness.js` | 147 | Loads the inline game script into a stub DOM under node:vm. |
| `test.js` | 55 | Headless runner for the in-page selfTest(). |
| `solve.js` | 92 | Proves each level routes, computes par, replays it to verify. |
| `candidates.js` | 452 | Searches for boards that hit a target difficulty rung. |
| `sw.js` | 41 | Service worker. CACHE_NAME must contain GAME_VERSION. |
| `manifest.json` | 42 | PWA manifest. |
| `icon.svg` | 6 | The only image asset the game ships. |

## index.html - section map

Every section marker in the file, in order. `CSS` markers sit in the `<style>`
block, `HTML` in the body, `JS` in the inline script.

| lines | region | section | fns |
|---|---|---|---:|
| 131-163 | CSS | Home screen |  |
| 164-174 | CSS | Menu screen |  |
| 175-252 | CSS | Settings screen |  |
| 253-425 | CSS | Play screen |  |
| 426-479 | CSS | Intro / splash screen |  |
| 480-507 | CSS | Editor |  |
| 508-545 | CSS | Landscape layout |  |
| 546-563 | HTML | INTRO / SPLASH SCREEN |  |
| 564-602 | HTML | HOME SCREEN |  |
| 603-613 | HTML | MENU SCREEN (the level catalogue) |  |
| 614-695 | HTML | PLAY SCREEN |  |
| 696-735 | HTML | EDITOR SCREEN |  |
| 736-866 | HTML | SETTINGS SCREEN |  |
| 867-931 | JS | Tunables |  |
| 932-1134 | JS | Level definitions | 2 |
| 1135-1311 | JS | Daily challenge | 10 |
| 1312-1317 | JS | Medals |  |
| 1318-1366 | JS | Solution contract | 3 |
| 1367-1460 | JS | Persistent storage | 10 |
| 1461-1469 | JS | Lifetime stats (for the Settings > Stats section) | 3 |
| 1470-1531 | JS | Cosmetic perks (purely visual — never affect timing, sparks... | 4 |
| 1532-1909 | JS | Screen management | 14 |
| 1910-1935 | JS | State |  |
| 1936-2120 | JS | The clock | 11 |
| 2121-2175 | JS | Geometry helpers | 9 |
| 2176-2240 | JS | Sound (synthesized via Web Audio API — no asset files, keeps... | 4 |
| 2241-2702 | JS | Input | 15 |
| 2703-2900 | JS | Keyboard input (WASD / arrows) | 8 |
| 2901-2996 | JS | Obstacle motion + collision | 9 |
| 2997-3052 | JS | Wire identity: shape + pattern (always on) and palette (swappable) | 2 |
| 3053-3437 | JS | Rendering | 2 |
| 3438-3472 | JS | Main loop | 1 |
| 3473-3599 | JS | Buttons | 7 |
| 3600-3623 | JS | Intro / splash screen | 2 |
| 3624-3645 | JS | **SOLVERS** |  |
| 3646-3835 | JS | Solver A — routing | 5 |
| 3836-4021 | JS | **LEVEL CODEC** | 6 |
| 4022-4119 | JS | Trap measurement | 3 |
| 4120-4141 | JS | Hazard timing helpers | 4 |
| 4142-4392 | JS | Solver B — scheduling | 7 |
| 4393-4837 | JS | **EDITOR** | 16 |
| 4838-6050 | JS | Self test | 1 |
| 6051-6094 | JS | Boot |  |

## Functions, by section

All 158 `function` declarations in `index.html`.

### Level definitions  <sub>JS &middot; 932-1134</sub>

```
 1114  patrol  (ticksPerCell, waypoints)
 1119  loopPath(waypoints)
```

### Daily challenge  <sub>JS &middot; 1135-1311</sub>

```
 1143  hashStr              (s)
 1148  mulberry32           (seed)
 1157  localDateString      (d)
 1175  randomDailyBoard     (rand, dateStr)
 1212  measurePressure      (lv, sol)
 1228  generateDailyLevel   (dateStr)
 1286  terminalCellOf       (lv, cell)
 1290  getDailyStreak       ()
 1291  recordDailyPlay      (dateStr)
 1304  resolveChallengeLevel(challengeSlug)
```

### Solution contract  <sub>JS &middot; 1318-1366</sub>

```
 1342  parFor            (lv)
 1353  getMedalThresholds(lv)
 1358  medalForScore     (lv, scoreTicks)
```

### Persistent storage  <sub>JS &middot; 1367-1460</sub>

```
 1389  levelFingerprint(lv)
 1403  levelKey        (lv)
 1404  bestKey         (lv)
 1405  getBest         (lv)
 1411  setBestIfBetter (lv, scoreTicks)
 1432  cleanClearKey   (lv)
 1433  hasCleanClear   (lv)
 1434  markCleanClear  (lv)
 1456  fmtTicks        (t)
 1459  fmtCount        (t)
```

### Lifetime stats (for the Settings > Stats section)  <sub>JS &middot; 1461-1469</sub>

```
 1462  bumpCounter      (key)
 1465  getCounter       (key)
 1466  medalsEarnedCount()
```

### Cosmetic perks (purely visual — never affect timing, sparks...  <sub>JS &middot; 1470-1531</sub>

```
 1493  getEquippedSkinId()
 1494  setEquippedSkinId(id)
 1495  applySkin        ()
 1504  renderSkinList   ()
```

### Screen management  <sub>JS &middot; 1532-1909</sub>

```
 1575  prefersReducedMotion()
 1580  loadSettings        ()
 1629  saveSettings        ()
 1632  applySettings       ()
 1691  escapeHtml          (s)
 1698  describeHazards     (lv)
 1709  renderMenu          ()
 1810  nextUnplayedLevel   ()
 1814  renderHome          ()
 1828  showHome            ()
 1840  showMenu            ()
 1852  renderStats         ()
 1868  showSettings        ()
 1879  enterLevel          (lv)
```

### The clock  <sub>JS &middot; 1936-2120</sub>

```
 1955  fmtSeconds          (s)
 1961  clockNow            ()
 1983  focusablesIn        (el)
 1988  openModal           (el, firstFocus)
 1994  closeModal          (el)
 2029  computeCellSize     (cols, rows)
 2053  resizeCanvasForLevel()
 2071  currentScore        ()
 2073  resetPuzzle         ()
 2101  startRunIfIdle      ()
 2105  updateHud           ()
```

### Geometry helpers  <sub>JS &middot; 2121-2175</sub>

```
 2122  cellAt          (px, py)
 2127  sameCell        (a,b)
 2128  adjacent        (a,b)
 2129  terminalAt      (cell)
 2137  isBlocked       (cell)
 2143  inBounds        (cell)
 2149  occupiedBy      (cell, excludeIdx)
 2159  ownIntentIndexAt(cell)
 2169  commonPrefixLen (a, b)
```

### Sound (synthesized via Web Audio API — no asset files, keeps...  <sub>JS &middot; 2176-2240</sub>

```
 2182  ensureAudio()
 2191  playTone   (freq, opts)
 2206  playNoise  (opts)
 2235  haptic     (pattern)
```

### Input  <sub>JS &middot; 2241-2702</sub>

```
 2242  pointerPos          (evt)
 2280  setActiveColor      (idx)
 2286  onPointerDown       (cell)
 2353  planTo              (cell)
 2433  advanceToNextPlanned()
 2449  propagateActiveWire ()
 2521  findSealedPair      ()
 2555  announceSealIfAny   ()
 2575  stepTick            ()
 2604  startMetronome      ()
 2609  stopMetronome       ()
 2618  metronomeTick       (hidden)
 2649  takeTurn            ()
 2666  waitMove            ()
 2671  endPointer          ()
```

### Keyboard input (WASD / arrows)  <sub>JS &middot; 2703-2900</sub>

```
 2708  cycleActiveColor(dir)
 2727  planHead        ()
 2734  keyboardStep    (dc, dr)
 2754  keyboardBack    ()
 2782  boardHasFocus   ()
 2783  anyModalOpen    ()
 2794  handlePlayKey   (e)
 2841  checkWin        ()
```

### Obstacle motion + collision  <sub>JS &middot; 2901-2996</sub>

```
 2909  isGate             (ob)
 2912  gateIsLive         (ob, tick)
 2919  obstacleCellAt     (ob, tick)
 2928  hopEase            (f)
 2934  obstacleRenderPos  (ob, tick, frac)
 2952  obstacleIsDangerous(ob, tick)
 2959  cellIsHot          (cell, tick)
 2968  checkZaps          (tick)
 2990  flashZap           ()
```

### Wire identity: shape + pattern (always on) and palette (swappable)  <sub>JS &middot; 2997-3052</sub>

```
 3021  styleFor (baseColor)
 3026  drawGlyph(shape, x, y, size)
```

### Rendering  <sub>JS &middot; 3053-3437</sub>

```
 3054  cssVar(name, fallback)
 3061  draw  (tick, frac)
```

### Main loop  <sub>JS &middot; 3438-3472</sub>

```
 3452  tick(now)
```

### Buttons  <sub>JS &middot; 3473-3599</sub>

```
 3474  leavePlay     ()
 3490  nextLevelAfter(lv)
 3510  syncTraceBtn  ()
 3517  shareText     ()
 3532  challengeUrl  ()
 3563  shareTextOut  (title, body, blurb)
 3591  doShare       ()
```

### Intro / splash screen  <sub>JS &middot; 3600-3623</sub>

```
 3604  playIntro()
 3609  finish   ()
```

### Solver A — routing  <sub>JS &middot; 3646-3835</sub>

```
 3650  routeSolve      (lv, opts)
 3687  stillConnectable(k)
 3718  reachable       (fromIdx, goalIdx)
 3739  place           (k, cost)
 3751  walk            (k, p, cur, path, costBefore)
```

### LEVEL CODEC  <sub>JS &middot; 3836-4021</sub>

```
 3865  b64urlEncode(s)
 3868  b64urlDecode(s)
 3874  encodeLevel (lv)
 3900  decodeLevel (code)
 3993  customSlug  (code)
 3999  verifyLevel (lv)
```

### Trap measurement  <sub>JS &middot; 4022-4119</sub>

```
 4037  enumerateRoutes(lv, pairIdx, slack, maxCount)
 4083  restRoutable   (lv, pairIdx, route)
 4098  trapMeasure    (lv, opts)
```

### Hazard timing helpers  <sub>JS &middot; 4120-4141</sub>

```
 4121  gcd         (a,b)
 4122  lcm         (a,b)
 4125  hazardPeriod(lv)
 4133  dangerAt    (lv, tick)
```

### Solver B — scheduling  <sub>JS &middot; 4142-4392</sub>

```
 4159  wireRun       (lv, route, t0, cap)
 4215  scheduleSolve (lv, routes, opts)
 4277  solveLevel    (lv, opts)
 4301  applyAction   (act, sol)
 4329  replaySolution(lv, sol)
 4353  stageSolution (lv, sol, stopAfter)
 4381  stageSealDemo ()
```

### EDITOR  <sub>JS &middot; 4393-4837</sub>

```
 4422  edPadFor          (i)
 4427  edCellUsed        (cell)
 4433  edInBounds        (cell)
 4439  editorLevel       ()
 4459  edInvalidate      ()
 4465  setVerdict        (html, cls)
 4470  editorTap         (cell)
 4543  renderEditorTools ()
 4561  resizeEditorCanvas()
 4572  drawEditor        ()
 4669  drawGlyphOn       (c2d, shape, x, y, size)
 4687  editorCellAt      (evt)
 4698  runVerify         ()
 4735  editorClear       ()
 4744  editorRandom      ()
 4763  showEditor        ()
```

### Self test  <sub>JS &middot; 4838-6050</sub>

```
 4847  selfTest()
```

## Top-level constants

Cached `getElementById` handles are omitted - there are dozens and they all
sit in **Screen management**.

```
  884  GAME_VERSION        = '2.0.0';
  907  CANONICAL_URL       = 'https:
  914  ZAP_PENALTY_TICKS   = 5;
  920  STEP_ANIM_MS        = 110;
  924  TRACE_AHEAD         = 3;
  930  TRIAL_HZ            = 3;
  953  LEVELS              = [
 1162  DAILY_PALETTE       = ["#ff5d6c","#ffd75a","#7ab8ff","#c98bff","#54e...
 1173  DAILY_BAND          = { parMin: 22, parMax: 46, holdsMin: 2, holdsMa...
 1225  DAILY_SEED_PREFIX   = 'wired-daily-v3-';
 1227  dailyCache          = new Map();
 1324  PAR_CONTRACT        = {
 1340  MEDAL_ICON          = { gold:'🥇', silver:'🥈', bronze:'🥉' };
 1341  parCache            = new Map();
 1377  STORE_PREFIX        = 'wired-v3-';
 1388  fingerprintCache    = new Map();
 1472  SKINS               = [
 1492  ALL_SKIN_TOKEN_KEYS = [...new Set(SKINS.flatMap(s=>Object.keys(s.tok...
 1533  screen              = 'home';
 1538  playReturn          = 'home';
 1539  settingsReturn      = 'home';
 1559  SETTINGS_DEFAULTS   = {colorblind:false, reduceMotion:false, muted:f...
 1561  SETTINGS_KEY        = STORE_PREFIX + 'settings';
 1568  LEGACY_SETTINGS_KEY = 'wired-v2-settings';
 1599  settings            = loadSettings();
 1602  pendingChallenge    = null;
 1603  pendingBoard        = null;
 1914  MIN_CELL            = 32, MAX_CELL = 64;
 1915  CELL                = MAX_CELL;
 1916  level               = LEVELS[0];
 1927  wires               = {};
 1928  activeColor         = null;
 1929  dragging            = false;
 1930  won                 = false;
 1931  zapCount            = 0;
 1932  tracing             = false;
 1933  sealed              = false;
 1934  justLocked          = false;
 1942  tickCount           = 0;
 1943  running             = false;
 1944  pendingSwitchTicks  = 0;
 1945  stepAnimUntil       = 0;
 1966  ctx                 = canvas.getContext('2d');
 1982  modalReturnFocus    = null;
 2181  audioCtx            = null;
 2225  sfx                 = {
 2602  metronomeId         = null;
 3005  WIRE_STYLE          = {
 3014  COLORBLIND_PALETTE  = {
 3644  ROUTE_BUDGET        = 400000;
 3854  CODE_VERSION        = 'W1';
 3855  PAIR_COLORS         = ["#ff5d6c","#ffd75a","#7ab8ff","#54e6a6","#c98...
 3856  EDITOR_MIN          = 5;
 3862  EDITOR_MAX          = 7;
 3863  VERIFY_BUDGET       = 4000000;
 4374  SEAL_DEMO           = {
 4399  GATE_PRESETS        = [
 4403  PATROL_SPEEDS       = [2, 3, 1, 4];
 4405  edCols              = 6, edRows = 6;
 4406  edPads              = [];
 4407  edBlocked           = [];
 4408  edGates             = [];
 4409  edPatrols           = [];
 4410  edTool              = 'pair0';
 4411  edPatrolDraft       = null;
 4412  edVerified          = null;
 4415  edCtx               = editorCanvas.getContext('2d');
```

## Levels

Par comes from `PAR_CONTRACT`; regenerate it with `node solve.js --contract`.

| # | slug | name | grid | par | defined |
|---:|---|---|---|---:|---:|
| 1 | `breadboard` | Breadboard | 5x5 | 14 | 957 |
| 2 | `circuit-board` | Circuit Board | 6x6 | 28 | 969 |
| 3 | `elbow` | Elbow | 7x7 | 26 | 983 |
| 4 | `interlock` | Interlock | 7x7 | 29 | 999 |
| 5 | `mainframe` | Mainframe | 7x7 | 34 | 1016 |
| 6 | `relay-yard` | Relay Yard | 7x8 | 36 | 1033 |
| 7 | `backplane` | Backplane | 7x8 | 39 | 1047 |
| 8 | `logic-array` | Logic Array | 7x8 | 39 | 1062 |
| 9 | `ladder` | Ladder | 7x7 | 31 | 1081 |
| 10 | `fault-line` | Fault Line | 7x6 | 38 | 1094 |

## Test groups

The 30 assertion groups inside `selfTest()`, so you can find the test
for a behaviour without reading the whole suite.

```
 4893  The first frame of a patrol level renders
 4905  One move is one cell, and the clock is what spends it
 4927  The renderer cannot spend a move
 4944  The exploit this whole model exists to kill
 4988  Determinism: same actions from tick 0, same run
 5001  Spark position is a pure function of the tick counter
 5012  A spark shorts what it touches, and only what it touches
 5066  Current waits at a live contact instead of dying on it
 5081  Components block routing
 5092  A finished wire is a wall
 5105  Sealing the board is detected, and only when certain
 5232  The engine charges for exactly what par charges for
 5305  The play screen is not a keyboard trap
 5381  The clock is the score, and the tick count IS the clock
 5461  Practice: the clock off, and nothing written down
 5574  The automatic handoff costs what a manual one costs
 5607  Waiting is free, and Trace is too
 5642  The front door is one button, and it never points nowhere
 5680  Backing out of a level returns you where you came in from
 5710  The system motion preference seeds the default, never overrides
 5744  Progression is keyed by identity, not position
 5753  A custom board travels inside its own link
 5788  The editor gate refuses what it cannot prove
 5808  Save keys are tied to identity, not array position
 5833  The persistence contract survives a rename
 5872  Solver: routing correctness on boards with a known answer
 5923  Solution contract
 5966  The daily is generated AND verified
 5989  Touch targets stay usable on real phones
 6008  Shipped level data is well-formed
```

## The tooling seam

`window.__wiredDev` is the only surface `test.js` and `solve.js` reach through.
Renaming anything in it breaks both runners.

```
solveLevel, routeSolve, replaySolution, LEVELS, generateDailyLevel, loopPath, hazardPeriod, PAR_CONTRACT, trapMeasure, measurePressure, encodeLevel, decodeLevel, // Screen and staging control, used by shots.mjs to // photograph real positions. Nothing here can reach a // score: bests live in localStorage and were always // editable from this same console. ui: { enterLevel, showHome, showMenu, showSettings, showEditor, stageSealDemo, stageSolution, draw, updateHud }
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

96 ids, with the line each is declared on.

```
app                 562
banner              664
bannerPractice      680
bestVal             628
board               640
boardKeys           656
boardWrap           639
challengeTargetBar  631
colorblindToggle    777
creditsVersion      826
editorBackBtn       699
editorCanvas        713
editorClear         706
editorCodeRow       724
editorCopy          721
editorHint          729
editorImport        725
editorLoad          726
editorPlay          720
editorRandom        707
editorScreen        697
editorSize          705
editorSizeRow       704
editorTools         710
editorVerdict       716
editorVerify        719
homeDailyBtn        577
homeEditorBtn       579
homeHelp            582
homeLevelsBtn       578
homeMain            572
homeProgress        575
homeScreen          565
homeSettingsBtn     566
homeStartBtn        573
homeStartSub        574
hud                 624
introBolt           556
introFlash          554
introScreen         547
introSkipHint       559
introTagline        557
introTitle          556
introTraces         548
introWordmark       555
menuBackBtn         605
menuBadge           570
menuBtn             617
menuList            611
menuScreen          604
moveCount           625
muteToggle          791
playBody            622
playBottom          659
playerNameInput     812
playLevelNameText   618
playMain            638
playScreen          615
playTopStats        623
practiceToggle      805
previewBtn          650
reduceMotionToggle  784
restartBtn          661
sealedBar           632
sealedRestart       634
sealedText          633
settingsBackBtn     739
settingsBtn         606
settingsCredits     825
settingsScreen      737
shareBlurb          837
shareBox            838
shareBtn            662
shareCard           835
shareCloseBtn       842
shareCopyBtn        841
shareModal          834
shareStatus         839
shareTitle          836
skinList            817
statsList           822
timeVal             629
trialZapCost        670
waitBtn             649
winBestLine         852
winBreakdown        851
winCard             848
winEarnLine         853
winMenu             856
winModal            847
winNext             858
winRestart          855
winScore            850
winShare            857
winTitle            849
zapCount            626
```
