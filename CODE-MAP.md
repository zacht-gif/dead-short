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
sed -n '2035,2080p' index.html     # read those lines, not all 5,867
```

Generated from `index.html` - 5,867 lines, 274,051 bytes, sha256 `b5fd1944d2a2`.

## Files

| file | lines | what it is |
|---|---:|---|
| `index.html` | 5,867 | The entire game: markup, styles and engine in one file. |
| `build.js` | 707 | Release gate + packager. Refuses to zip a build that fails a check. |
| `codemap.js` | 347 | Generates CODE-MAP.md. This file. |
| `make-icons.mjs` | 188 | Rasterizes icons/*.png from the same art as icon.svg. |
| `shots.mjs` | 320 | Captures store/screenshots/ from the real game. |
| `chrome.mjs` | 164 | Headless-Chrome plumbing for shots.mjs. |
| `mutate.js` | 610 | Mutation audit: breaks the game on purpose to test the gates. |
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
| 614-674 | HTML | PLAY SCREEN |  |
| 675-714 | HTML | EDITOR SCREEN |  |
| 715-835 | HTML | SETTINGS SCREEN |  |
| 836-900 | JS | Tunables |  |
| 901-1103 | JS | Level definitions | 2 |
| 1104-1280 | JS | Daily challenge | 10 |
| 1281-1286 | JS | Medals |  |
| 1287-1335 | JS | Solution contract | 3 |
| 1336-1429 | JS | Persistent storage | 10 |
| 1430-1438 | JS | Lifetime stats (for the Settings > Stats section) | 3 |
| 1439-1500 | JS | Cosmetic perks (purely visual — never affect timing, sparks... | 4 |
| 1501-1842 | JS | Screen management | 14 |
| 1843-1868 | JS | State |  |
| 1869-2053 | JS | The clock | 11 |
| 2054-2108 | JS | Geometry helpers | 9 |
| 2109-2173 | JS | Sound (synthesized via Web Audio API — no asset files, keeps... | 4 |
| 2174-2611 | JS | Input | 14 |
| 2612-2787 | JS | Keyboard input (WASD / arrows) | 8 |
| 2788-2883 | JS | Obstacle motion + collision | 9 |
| 2884-2939 | JS | Wire identity: shape + pattern (always on) and palette (swappable) | 2 |
| 2940-3324 | JS | Rendering | 2 |
| 3325-3359 | JS | Main loop | 1 |
| 3360-3485 | JS | Buttons | 7 |
| 3486-3509 | JS | Intro / splash screen | 2 |
| 3510-3531 | JS | **SOLVERS** |  |
| 3532-3721 | JS | Solver A — routing | 5 |
| 3722-3907 | JS | **LEVEL CODEC** | 6 |
| 3908-4005 | JS | Trap measurement | 3 |
| 4006-4027 | JS | Hazard timing helpers | 4 |
| 4028-4278 | JS | Solver B — scheduling | 7 |
| 4279-4723 | JS | **EDITOR** | 16 |
| 4724-5823 | JS | Self test | 1 |
| 5824-5867 | JS | Boot |  |

## Functions, by section

All 157 `function` declarations in `index.html`.

### Level definitions  <sub>JS &middot; 901-1103</sub>

```
 1083  patrol  (ticksPerCell, waypoints)
 1088  loopPath(waypoints)
```

### Daily challenge  <sub>JS &middot; 1104-1280</sub>

```
 1112  hashStr              (s)
 1117  mulberry32           (seed)
 1126  localDateString      (d)
 1144  randomDailyBoard     (rand, dateStr)
 1181  measurePressure      (lv, sol)
 1197  generateDailyLevel   (dateStr)
 1255  terminalCellOf       (lv, cell)
 1259  getDailyStreak       ()
 1260  recordDailyPlay      (dateStr)
 1273  resolveChallengeLevel(challengeSlug)
```

### Solution contract  <sub>JS &middot; 1287-1335</sub>

```
 1311  parFor            (lv)
 1322  getMedalThresholds(lv)
 1327  medalForScore     (lv, scoreTicks)
```

### Persistent storage  <sub>JS &middot; 1336-1429</sub>

```
 1358  levelFingerprint(lv)
 1372  levelKey        (lv)
 1373  bestKey         (lv)
 1374  getBest         (lv)
 1380  setBestIfBetter (lv, scoreTicks)
 1401  cleanClearKey   (lv)
 1402  hasCleanClear   (lv)
 1403  markCleanClear  (lv)
 1425  fmtTicks        (t)
 1428  fmtCount        (t)
```

### Lifetime stats (for the Settings > Stats section)  <sub>JS &middot; 1430-1438</sub>

```
 1431  bumpCounter      (key)
 1434  getCounter       (key)
 1435  medalsEarnedCount()
```

### Cosmetic perks (purely visual — never affect timing, sparks...  <sub>JS &middot; 1439-1500</sub>

```
 1462  getEquippedSkinId()
 1463  setEquippedSkinId(id)
 1464  applySkin        ()
 1473  renderSkinList   ()
```

### Screen management  <sub>JS &middot; 1501-1842</sub>

```
 1539  prefersReducedMotion()
 1544  loadSettings        ()
 1593  saveSettings        ()
 1596  applySettings       ()
 1624  escapeHtml          (s)
 1631  describeHazards     (lv)
 1642  renderMenu          ()
 1743  nextUnplayedLevel   ()
 1747  renderHome          ()
 1761  showHome            ()
 1773  showMenu            ()
 1785  renderStats         ()
 1801  showSettings        ()
 1812  enterLevel          (lv)
```

### The clock  <sub>JS &middot; 1869-2053</sub>

```
 1888  fmtSeconds          (s)
 1894  clockNow            ()
 1916  focusablesIn        (el)
 1921  openModal           (el, firstFocus)
 1927  closeModal          (el)
 1962  computeCellSize     (cols, rows)
 1986  resizeCanvasForLevel()
 2004  currentScore        ()
 2006  resetPuzzle         ()
 2034  startRunIfIdle      ()
 2038  updateHud           ()
```

### Geometry helpers  <sub>JS &middot; 2054-2108</sub>

```
 2055  cellAt          (px, py)
 2060  sameCell        (a,b)
 2061  adjacent        (a,b)
 2062  terminalAt      (cell)
 2070  isBlocked       (cell)
 2076  inBounds        (cell)
 2082  occupiedBy      (cell, excludeIdx)
 2092  ownIntentIndexAt(cell)
 2102  commonPrefixLen (a, b)
```

### Sound (synthesized via Web Audio API — no asset files, keeps...  <sub>JS &middot; 2109-2173</sub>

```
 2115  ensureAudio()
 2124  playTone   (freq, opts)
 2139  playNoise  (opts)
 2168  haptic     (pattern)
```

### Input  <sub>JS &middot; 2174-2611</sub>

```
 2175  pointerPos          (evt)
 2213  setActiveColor      (idx)
 2219  onPointerDown       (cell)
 2286  planTo              (cell)
 2357  advanceToNextPlanned()
 2373  propagateActiveWire ()
 2445  findSealedPair      ()
 2479  announceSealIfAny   ()
 2499  stepTick            ()
 2528  startMetronome      ()
 2533  stopMetronome       ()
 2542  metronomeTick       (hidden)
 2573  takeTurn            ()
 2580  endPointer          ()
```

### Keyboard input (WASD / arrows)  <sub>JS &middot; 2612-2787</sub>

```
 2617  cycleActiveColor(dir)
 2636  planHead        ()
 2643  keyboardStep    (dc, dr)
 2663  keyboardBack    ()
 2691  boardHasFocus   ()
 2692  anyModalOpen    ()
 2703  handlePlayKey   (e)
 2738  checkWin        ()
```

### Obstacle motion + collision  <sub>JS &middot; 2788-2883</sub>

```
 2796  isGate             (ob)
 2799  gateIsLive         (ob, tick)
 2806  obstacleCellAt     (ob, tick)
 2815  hopEase            (f)
 2821  obstacleRenderPos  (ob, tick, frac)
 2839  obstacleIsDangerous(ob, tick)
 2846  cellIsHot          (cell, tick)
 2855  checkZaps          (tick)
 2877  flashZap           ()
```

### Wire identity: shape + pattern (always on) and palette (swappable)  <sub>JS &middot; 2884-2939</sub>

```
 2908  styleFor (baseColor)
 2913  drawGlyph(shape, x, y, size)
```

### Rendering  <sub>JS &middot; 2940-3324</sub>

```
 2941  cssVar(name, fallback)
 2948  draw  (tick, frac)
```

### Main loop  <sub>JS &middot; 3325-3359</sub>

```
 3339  tick(now)
```

### Buttons  <sub>JS &middot; 3360-3485</sub>

```
 3361  leavePlay     ()
 3377  nextLevelAfter(lv)
 3397  syncTraceBtn  ()
 3403  shareText     ()
 3418  challengeUrl  ()
 3449  shareTextOut  (title, body, blurb)
 3477  doShare       ()
```

### Intro / splash screen  <sub>JS &middot; 3486-3509</sub>

```
 3490  playIntro()
 3495  finish   ()
```

### Solver A — routing  <sub>JS &middot; 3532-3721</sub>

```
 3536  routeSolve      (lv, opts)
 3573  stillConnectable(k)
 3604  reachable       (fromIdx, goalIdx)
 3625  place           (k, cost)
 3637  walk            (k, p, cur, path, costBefore)
```

### LEVEL CODEC  <sub>JS &middot; 3722-3907</sub>

```
 3751  b64urlEncode(s)
 3754  b64urlDecode(s)
 3760  encodeLevel (lv)
 3786  decodeLevel (code)
 3879  customSlug  (code)
 3885  verifyLevel (lv)
```

### Trap measurement  <sub>JS &middot; 3908-4005</sub>

```
 3923  enumerateRoutes(lv, pairIdx, slack, maxCount)
 3969  restRoutable   (lv, pairIdx, route)
 3984  trapMeasure    (lv, opts)
```

### Hazard timing helpers  <sub>JS &middot; 4006-4027</sub>

```
 4007  gcd         (a,b)
 4008  lcm         (a,b)
 4011  hazardPeriod(lv)
 4019  dangerAt    (lv, tick)
```

### Solver B — scheduling  <sub>JS &middot; 4028-4278</sub>

```
 4045  wireRun       (lv, route, t0, cap)
 4101  scheduleSolve (lv, routes, opts)
 4163  solveLevel    (lv, opts)
 4187  applyAction   (act, sol)
 4215  replaySolution(lv, sol)
 4239  stageSolution (lv, sol, stopAfter)
 4267  stageSealDemo ()
```

### EDITOR  <sub>JS &middot; 4279-4723</sub>

```
 4308  edPadFor          (i)
 4313  edCellUsed        (cell)
 4319  edInBounds        (cell)
 4325  editorLevel       ()
 4345  edInvalidate      ()
 4351  setVerdict        (html, cls)
 4356  editorTap         (cell)
 4429  renderEditorTools ()
 4447  resizeEditorCanvas()
 4458  drawEditor        ()
 4555  drawGlyphOn       (c2d, shape, x, y, size)
 4573  editorCellAt      (evt)
 4584  runVerify         ()
 4621  editorClear       ()
 4630  editorRandom      ()
 4649  showEditor        ()
```

### Self test  <sub>JS &middot; 4724-5823</sub>

```
 4733  selfTest()
```

## Top-level constants

Cached `getElementById` handles are omitted - there are dozens and they all
sit in **Screen management**.

```
  853  GAME_VERSION        = '2.0.0';
  876  CANONICAL_URL       = 'https:
  883  ZAP_PENALTY_TICKS   = 5;
  889  STEP_ANIM_MS        = 110;
  893  TRACE_AHEAD         = 3;
  899  TRIAL_HZ            = 3;
  922  LEVELS              = [
 1131  DAILY_PALETTE       = ["#ff5d6c","#ffd75a","#7ab8ff","#c98bff","#54e...
 1142  DAILY_BAND          = { parMin: 22, parMax: 46, holdsMin: 2, holdsMa...
 1194  DAILY_SEED_PREFIX   = 'wired-daily-v3-';
 1196  dailyCache          = new Map();
 1293  PAR_CONTRACT        = {
 1309  MEDAL_ICON          = { gold:'🥇', silver:'🥈', bronze:'🥉' };
 1310  parCache            = new Map();
 1346  STORE_PREFIX        = 'wired-v3-';
 1357  fingerprintCache    = new Map();
 1441  SKINS               = [
 1461  ALL_SKIN_TOKEN_KEYS = [...new Set(SKINS.flatMap(s=>Object.keys(s.tok...
 1502  screen              = 'home';
 1507  playReturn          = 'home';
 1508  settingsReturn      = 'home';
 1523  SETTINGS_DEFAULTS   = {colorblind:false, reduceMotion:false, muted:f...
 1525  SETTINGS_KEY        = STORE_PREFIX + 'settings';
 1532  LEGACY_SETTINGS_KEY = 'wired-v2-settings';
 1563  settings            = loadSettings();
 1566  pendingChallenge    = null;
 1567  pendingBoard        = null;
 1847  MIN_CELL            = 32, MAX_CELL = 64;
 1848  CELL                = MAX_CELL;
 1849  level               = LEVELS[0];
 1860  wires               = {};
 1861  activeColor         = null;
 1862  dragging            = false;
 1863  won                 = false;
 1864  zapCount            = 0;
 1865  tracing             = false;
 1866  sealed              = false;
 1867  justLocked          = false;
 1875  tickCount           = 0;
 1876  running             = false;
 1877  pendingSwitchTicks  = 0;
 1878  stepAnimUntil       = 0;
 1899  ctx                 = canvas.getContext('2d');
 1915  modalReturnFocus    = null;
 2114  audioCtx            = null;
 2158  sfx                 = {
 2526  metronomeId         = null;
 2892  WIRE_STYLE          = {
 2901  COLORBLIND_PALETTE  = {
 3530  ROUTE_BUDGET        = 400000;
 3740  CODE_VERSION        = 'W1';
 3741  PAIR_COLORS         = ["#ff5d6c","#ffd75a","#7ab8ff","#54e6a6","#c98...
 3742  EDITOR_MIN          = 5;
 3748  EDITOR_MAX          = 7;
 3749  VERIFY_BUDGET       = 4000000;
 4260  SEAL_DEMO           = {
 4285  GATE_PRESETS        = [
 4289  PATROL_SPEEDS       = [2, 3, 1, 4];
 4291  edCols              = 6, edRows = 6;
 4292  edPads              = [];
 4293  edBlocked           = [];
 4294  edGates             = [];
 4295  edPatrols           = [];
 4296  edTool              = 'pair0';
 4297  edPatrolDraft       = null;
 4298  edVerified          = null;
 4301  edCtx               = editorCanvas.getContext('2d');
```

## Levels

Par comes from `PAR_CONTRACT`; regenerate it with `node solve.js --contract`.

| # | slug | name | grid | par | defined |
|---:|---|---|---|---:|---:|
| 1 | `breadboard` | Breadboard | 5x5 | 14 | 926 |
| 2 | `circuit-board` | Circuit Board | 6x6 | 28 | 938 |
| 3 | `elbow` | Elbow | 7x7 | 26 | 952 |
| 4 | `interlock` | Interlock | 7x7 | 29 | 968 |
| 5 | `mainframe` | Mainframe | 7x7 | 34 | 985 |
| 6 | `relay-yard` | Relay Yard | 7x8 | 36 | 1002 |
| 7 | `backplane` | Backplane | 7x8 | 39 | 1016 |
| 8 | `logic-array` | Logic Array | 7x8 | 39 | 1031 |
| 9 | `ladder` | Ladder | 7x7 | 31 | 1050 |
| 10 | `fault-line` | Fault Line | 7x6 | 38 | 1063 |

## Test groups

The 29 assertion groups inside `selfTest()`, so you can find the test
for a behaviour without reading the whole suite.

```
 4779  The first frame of a patrol level renders
 4791  One move is one cell, and the clock is what spends it
 4813  The renderer cannot spend a move
 4830  The exploit this whole model exists to kill
 4874  Determinism: same actions from tick 0, same run
 4887  Spark position is a pure function of the tick counter
 4898  A spark shorts what it touches, and only what it touches
 4952  Current waits at a live contact instead of dying on it
 4967  Components block routing
 4978  A finished wire is a wall
 4991  Sealing the board is detected, and only when certain
 5118  The engine charges for exactly what par charges for
 5191  The play screen is not a keyboard trap
 5267  The clock is the score, and the tick count IS the clock
 5347  The automatic handoff costs what a manual one costs
 5380  Waiting is free, and Trace is too
 5415  The front door is one button, and it never points nowhere
 5453  Backing out of a level returns you where you came in from
 5483  The system motion preference seeds the default, never overrides
 5517  Progression is keyed by identity, not position
 5526  A custom board travels inside its own link
 5561  The editor gate refuses what it cannot prove
 5581  Save keys are tied to identity, not array position
 5606  The persistence contract survives a rename
 5645  Solver: routing correctness on boards with a known answer
 5696  Solution contract
 5739  The daily is generated AND verified
 5762  Touch targets stay usable on real phones
 5781  Shipped level data is well-formed
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

93 ids, with the line each is declared on.

```
app                 562
banner              660
bestVal             628
board               640
boardKeys           646
boardWrap           639
challengeTargetBar  631
colorblindToggle    756
creditsVersion      795
editorBackBtn       678
editorCanvas        692
editorClear         685
editorCodeRow       703
editorCopy          700
editorHint          708
editorImport        704
editorLoad          705
editorPlay          699
editorRandom        686
editorScreen        676
editorSize          684
editorSizeRow       683
editorTools         689
editorVerdict       695
editorVerify        698
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
muteToggle          770
playBody            622
playBottom          655
playerNameInput     781
playLevelNameText   618
playMain            638
playScreen          615
playTopStats        623
previewBtn          644
reduceMotionToggle  763
restartBtn          657
sealedBar           632
sealedRestart       634
sealedText          633
settingsBackBtn     718
settingsBtn         606
settingsCredits     794
settingsScreen      716
shareBlurb          806
shareBox            807
shareBtn            658
shareCard           804
shareCloseBtn       811
shareCopyBtn        810
shareModal          803
shareStatus         808
shareTitle          805
skinList            786
statsList           791
timeVal             629
trialZapCost        666
winBestLine         821
winBreakdown        820
winCard             817
winEarnLine         822
winMenu             825
winModal            816
winNext             827
winRestart          824
winScore            819
winShare            826
winTitle            818
zapCount            626
```
