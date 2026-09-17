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
sed -n '2035,2080p' index.html     # read those lines, not all 5,105
```

Generated from `index.html` - 5,105 lines, 230,876 bytes, sha256 `e3abd42d61ae`.

## Files

| file | lines | what it is |
|---|---:|---|
| `index.html` | 5,105 | The entire game: markup, styles and engine in one file. |
| `build.js` | 489 | Release gate + packager. Refuses to zip a build that fails a check. |
| `codemap.js` | 346 | Generates CODE-MAP.md. This file. |
| `make-icons.mjs` | 188 | Rasterizes icons/*.png from the same art as icon.svg. |
| `shots.mjs` | 301 | Captures store/screenshots/ from the real game. |
| `chrome.mjs` | 164 | Headless-Chrome plumbing for shots.mjs. |
| `mutate.js` | 432 | Mutation audit: breaks the game on purpose to test the gates. |
| `harness.js` | 147 | Loads the inline game script into a stub DOM under node:vm. |
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
| 131-140 | CSS | Menu screen |  |
| 141-225 | CSS | Settings screen |  |
| 226-387 | CSS | Play screen |  |
| 388-441 | CSS | Intro / splash screen |  |
| 442-469 | CSS | Editor |  |
| 470-501 | CSS | Landscape layout |  |
| 502-519 | HTML | INTRO / SPLASH SCREEN |  |
| 520-539 | HTML | MENU SCREEN |  |
| 540-594 | HTML | PLAY SCREEN |  |
| 595-634 | HTML | EDITOR SCREEN |  |
| 635-748 | HTML | SETTINGS SCREEN |  |
| 749-789 | JS | Tunables |  |
| 790-992 | JS | Level definitions | 2 |
| 993-1169 | JS | Daily challenge | 10 |
| 1170-1175 | JS | Medals |  |
| 1176-1224 | JS | Solution contract | 3 |
| 1225-1286 | JS | Persistent storage | 10 |
| 1287-1295 | JS | Lifetime stats (for the Settings > Stats section) | 3 |
| 1296-1357 | JS | Cosmetic perks (purely visual — never affect timing, sparks... | 4 |
| 1358-1646 | JS | Screen management | 11 |
| 1647-1672 | JS | State |  |
| 1673-1818 | JS | The clock | 9 |
| 1819-1873 | JS | Geometry helpers | 9 |
| 1874-1938 | JS | Sound (synthesized via Web Audio API — no asset files, keeps... | 4 |
| 1939-2265 | JS | Input | 10 |
| 2266-2432 | JS | Keyboard input (WASD / arrows) | 8 |
| 2433-2528 | JS | Obstacle motion + collision | 9 |
| 2529-2584 | JS | Wire identity: shape + pattern (always on) and palette (swappable) | 2 |
| 2585-2961 | JS | Rendering | 2 |
| 2962-2997 | JS | Main loop | 1 |
| 2998-3109 | JS | Buttons | 5 |
| 3110-3133 | JS | Intro / splash screen | 2 |
| 3134-3155 | JS | **SOLVERS** |  |
| 3156-3345 | JS | Solver A — routing | 5 |
| 3346-3531 | JS | **LEVEL CODEC** | 6 |
| 3532-3629 | JS | Trap measurement | 3 |
| 3630-3651 | JS | Hazard timing helpers | 4 |
| 3652-3892 | JS | Solver B — scheduling | 7 |
| 3893-4336 | JS | **EDITOR** | 16 |
| 4337-5064 | JS | Self test | 1 |
| 5065-5105 | JS | Boot |  |

## Functions, by section

All 146 `function` declarations in `index.html`.

### Level definitions  <sub>JS &middot; 790-992</sub>

```
  972  patrol  (ticksPerCell, waypoints)
  977  loopPath(waypoints)
```

### Daily challenge  <sub>JS &middot; 993-1169</sub>

```
 1001  hashStr              (s)
 1006  mulberry32           (seed)
 1015  localDateString      (d)
 1033  randomDailyBoard     (rand, dateStr)
 1070  measurePressure      (lv, sol)
 1086  generateDailyLevel   (dateStr)
 1144  terminalCellOf       (lv, cell)
 1148  getDailyStreak       ()
 1149  recordDailyPlay      (dateStr)
 1162  resolveChallengeLevel(challengeSlug)
```

### Solution contract  <sub>JS &middot; 1176-1224</sub>

```
 1200  parFor            (lv)
 1211  getMedalThresholds(lv)
 1216  medalForScore     (lv, scoreTicks)
```

### Persistent storage  <sub>JS &middot; 1225-1286</sub>

```
 1247  levelFingerprint(lv)
 1261  levelKey        (lv)
 1262  bestKey         (lv)
 1263  getBest         (lv)
 1269  setBestIfBetter (lv, scoreTicks)
 1279  cleanClearKey   (lv)
 1280  hasCleanClear   (lv)
 1281  markCleanClear  (lv)
 1284  ticksToSeconds  (t)
 1285  fmtTicks        (t)
```

### Lifetime stats (for the Settings > Stats section)  <sub>JS &middot; 1287-1295</sub>

```
 1288  bumpCounter      (key)
 1291  getCounter       (key)
 1292  medalsEarnedCount()
```

### Cosmetic perks (purely visual — never affect timing, sparks...  <sub>JS &middot; 1296-1357</sub>

```
 1319  getEquippedSkinId()
 1320  setEquippedSkinId(id)
 1321  applySkin        ()
 1330  renderSkinList   ()
```

### Screen management  <sub>JS &middot; 1358-1646</sub>

```
 1386  prefersReducedMotion()
 1391  loadSettings        ()
 1440  saveSettings        ()
 1443  applySettings       ()
 1471  escapeHtml          (s)
 1478  describeHazards     (lv)
 1489  renderMenu          ()
 1584  showMenu            ()
 1595  renderStats         ()
 1611  showSettings        ()
 1621  enterLevel          (lv)
```

### The clock  <sub>JS &middot; 1673-1818</sub>

```
 1702  focusablesIn        (el)
 1707  openModal           (el, firstFocus)
 1713  closeModal          (el)
 1748  computeCellSize     (cols, rows)
 1764  resizeCanvasForLevel()
 1777  currentScore        ()
 1779  resetPuzzle         ()
 1801  startRunIfIdle      ()
 1809  updateHud           ()
```

### Geometry helpers  <sub>JS &middot; 1819-1873</sub>

```
 1820  cellAt          (px, py)
 1825  sameCell        (a,b)
 1826  adjacent        (a,b)
 1827  terminalAt      (cell)
 1835  isBlocked       (cell)
 1841  inBounds        (cell)
 1847  occupiedBy      (cell, excludeIdx)
 1857  ownIntentIndexAt(cell)
 1867  commonPrefixLen (a, b)
```

### Sound (synthesized via Web Audio API — no asset files, keeps...  <sub>JS &middot; 1874-1938</sub>

```
 1880  ensureAudio()
 1889  playTone   (freq, opts)
 1904  playNoise  (opts)
 1933  haptic     (pattern)
```

### Input  <sub>JS &middot; 1939-2265</sub>

```
 1940  pointerPos          (evt)
 1958  setActiveColor      (idx)
 1964  onPointerDown       (cell)
 2016  planTo              (cell)
 2077  advanceToNextPlanned()
 2093  propagateActiveWire ()
 2165  findSealedPair      ()
 2199  announceSealIfAny   ()
 2219  stepTick            ()
 2232  endPointer          ()
```

### Keyboard input (WASD / arrows)  <sub>JS &middot; 2266-2432</sub>

```
 2271  cycleActiveColor(dir)
 2290  planHead        ()
 2297  keyboardStep    (dc, dr)
 2310  keyboardBack    ()
 2338  boardHasFocus   ()
 2339  anyModalOpen    ()
 2350  handlePlayKey   (e)
 2386  checkWin        ()
```

### Obstacle motion + collision  <sub>JS &middot; 2433-2528</sub>

```
 2441  isGate             (ob)
 2444  gateIsLive         (ob, tick)
 2451  obstacleCellAt     (ob, tick)
 2460  hopEase            (f)
 2466  obstacleRenderPos  (ob, tick, frac)
 2484  obstacleIsDangerous(ob, tick)
 2491  cellIsHot          (cell, tick)
 2500  checkZaps          (tick)
 2522  flashZap           ()
```

### Wire identity: shape + pattern (always on) and palette (swappable)  <sub>JS &middot; 2529-2584</sub>

```
 2553  styleFor (baseColor)
 2558  drawGlyph(shape, x, y, size)
```

### Rendering  <sub>JS &middot; 2585-2961</sub>

```
 2586  cssVar(name, fallback)
 2593  draw  (tick, frac)
```

### Main loop  <sub>JS &middot; 2962-2997</sub>

```
 2970  tick(now)
```

### Buttons  <sub>JS &middot; 2998-3109</sub>

```
 3006  nextLevelAfter(lv)
 3027  shareText     ()
 3042  challengeUrl  ()
 3073  shareTextOut  (title, body, blurb)
 3101  doShare       ()
```

### Intro / splash screen  <sub>JS &middot; 3110-3133</sub>

```
 3114  playIntro()
 3119  finish   ()
```

### Solver A — routing  <sub>JS &middot; 3156-3345</sub>

```
 3160  routeSolve      (lv, opts)
 3197  stillConnectable(k)
 3228  reachable       (fromIdx, goalIdx)
 3249  place           (k, cost)
 3261  walk            (k, p, cur, path, costBefore)
```

### LEVEL CODEC  <sub>JS &middot; 3346-3531</sub>

```
 3375  b64urlEncode(s)
 3378  b64urlDecode(s)
 3384  encodeLevel (lv)
 3410  decodeLevel (code)
 3503  customSlug  (code)
 3509  verifyLevel (lv)
```

### Trap measurement  <sub>JS &middot; 3532-3629</sub>

```
 3547  enumerateRoutes(lv, pairIdx, slack, maxCount)
 3593  restRoutable   (lv, pairIdx, route)
 3608  trapMeasure    (lv, opts)
```

### Hazard timing helpers  <sub>JS &middot; 3630-3651</sub>

```
 3631  gcd         (a,b)
 3632  lcm         (a,b)
 3635  hazardPeriod(lv)
 3643  dangerAt    (lv, tick)
```

### Solver B — scheduling  <sub>JS &middot; 3652-3892</sub>

```
 3669  wireRun       (lv, route, t0, cap)
 3725  scheduleSolve (lv, routes, opts)
 3787  solveLevel    (lv, opts)
 3811  applyAction   (act, sol)
 3829  replaySolution(lv, sol)
 3853  stageSolution (lv, sol, stopAfter)
 3881  stageSealDemo ()
```

### EDITOR  <sub>JS &middot; 3893-4336</sub>

```
 3922  edPadFor          (i)
 3927  edCellUsed        (cell)
 3933  edInBounds        (cell)
 3939  editorLevel       ()
 3959  edInvalidate      ()
 3965  setVerdict        (html, cls)
 3970  editorTap         (cell)
 4043  renderEditorTools ()
 4061  resizeEditorCanvas()
 4072  drawEditor        ()
 4169  drawGlyphOn       (c2d, shape, x, y, size)
 4187  editorCellAt      (evt)
 4198  runVerify         ()
 4235  editorClear       ()
 4244  editorRandom      ()
 4263  showEditor        ()
```

### Self test  <sub>JS &middot; 4337-5064</sub>

```
 4346  selfTest()
```

## Top-level constants

Cached `getElementById` handles are omitted - there are dozens and they all
sit in **Screen management**.

```
  758  GAME_VERSION        = '2.0.0';
  781  CANONICAL_URL       = 'https:
  783  TICK_HZ             = 6;
  784  MS_PER_TICK         = 1000 / TICK_HZ;
  785  MAX_FRAME_MS        = 250;
  787  ZAP_PENALTY_TICKS   = 3 * TICK_HZ;
  788  TRACE_MS            = 2500;
  811  LEVELS              = [
 1020  DAILY_PALETTE       = ["#ff5d6c","#ffd75a","#7ab8ff","#c98bff","#54e...
 1031  DAILY_BAND          = { parMin: 22, parMax: 46, holdsMin: 2, holdsMa...
 1083  DAILY_SEED_PREFIX   = 'wired-daily-v3-';
 1085  dailyCache          = new Map();
 1182  PAR_CONTRACT        = {
 1198  MEDAL_ICON          = { gold:'🥇', silver:'🥈', bronze:'🥉' };
 1199  parCache            = new Map();
 1235  STORE_PREFIX        = 'wired-v3-';
 1246  fingerprintCache    = new Map();
 1298  SKINS               = [
 1318  ALL_SKIN_TOKEN_KEYS = [...new Set(SKINS.flatMap(s=>Object.keys(s.tok...
 1359  screen              = 'menu';
 1371  SETTINGS_DEFAULTS   = {colorblind:false, reduceMotion:false, muted:f...
 1372  SETTINGS_KEY        = STORE_PREFIX + 'settings';
 1379  LEGACY_SETTINGS_KEY = 'wired-v2-settings';
 1410  settings            = loadSettings();
 1413  pendingChallenge    = null;
 1414  pendingBoard        = null;
 1651  MIN_CELL            = 32, MAX_CELL = 64;
 1652  CELL                = MAX_CELL;
 1653  level               = LEVELS[0];
 1664  wires               = {};
 1665  activeColor         = null;
 1666  dragging            = false;
 1667  won                 = false;
 1668  zapCount            = 0;
 1669  previewUntil        = 0;
 1670  sealed              = false;
 1671  justLocked          = false;
 1678  tickCount           = 0;
 1679  running             = false;
 1680  tickAccum           = 0;
 1681  lastFrameMs         = null;
 1682  pendingSwitchTicks  = 0;
 1685  ctx                 = canvas.getContext('2d');
 1701  modalReturnFocus    = null;
 1879  audioCtx            = null;
 1923  sfx                 = {
 2537  WIRE_STYLE          = {
 2546  COLORBLIND_PALETTE  = {
 3154  ROUTE_BUDGET        = 400000;
 3364  CODE_VERSION        = 'W1';
 3365  PAIR_COLORS         = ["#ff5d6c","#ffd75a","#7ab8ff","#54e6a6","#c98...
 3366  EDITOR_MIN          = 5;
 3372  EDITOR_MAX          = 7;
 3373  VERIFY_BUDGET       = 4000000;
 3874  SEAL_DEMO           = {
 3899  GATE_PRESETS        = [
 3903  PATROL_SPEEDS       = [2, 3, 1, 4];
 3905  edCols              = 6, edRows = 6;
 3906  edPads              = [];
 3907  edBlocked           = [];
 3908  edGates             = [];
 3909  edPatrols           = [];
 3910  edTool              = 'pair0';
 3911  edPatrolDraft       = null;
 3912  edVerified          = null;
 3915  edCtx               = editorCanvas.getContext('2d');
```

## Levels

Par comes from `PAR_CONTRACT`; regenerate it with `node solve.js --contract`.

| # | slug | name | grid | par | defined |
|---:|---|---|---|---:|---:|
| 1 | `breadboard` | Breadboard | 5x5 | 14 | 815 |
| 2 | `circuit-board` | Circuit Board | 6x6 | 28 | 827 |
| 3 | `elbow` | Elbow | 7x7 | 26 | 841 |
| 4 | `interlock` | Interlock | 7x7 | 29 | 857 |
| 5 | `mainframe` | Mainframe | 7x7 | 34 | 874 |
| 6 | `relay-yard` | Relay Yard | 7x8 | 36 | 891 |
| 7 | `backplane` | Backplane | 7x8 | 39 | 905 |
| 8 | `logic-array` | Logic Array | 7x8 | 39 | 920 |
| 9 | `ladder` | Ladder | 7x7 | 31 | 939 |
| 10 | `fault-line` | Fault Line | 7x6 | 38 | 952 |

## Test groups

The 23 assertion groups inside `selfTest()`, so you can find the test
for a behaviour without reading the whole suite.

```
 4361  The first frame of a patrol level renders
 4373  Current costs a tick per cell, and drawing costs nothing
 4391  The exploit this whole model exists to kill
 4406  Determinism: same actions from tick 0, same run
 4419  Spark position is a pure function of the tick counter
 4430  A spark shorts what it touches, and only what it touches
 4464  Current waits at a live contact instead of dying on it
 4479  Components block routing
 4490  A finished wire is a wall
 4503  Sealing the board is detected, and only when certain
 4630  Ordinary play obeys the same rules par was computed under
 4658  The play screen is not a keyboard trap
 4725  The system motion preference seeds the default, never overrides
 4759  Progression is keyed by identity, not position
 4768  A custom board travels inside its own link
 4803  The editor gate refuses what it cannot prove
 4823  Save keys are tied to identity, not array position
 4848  The persistence contract survives a rename
 4887  Solver: routing correctness on boards with a known answer
 4938  Solution contract
 4981  The daily is generated AND verified
 5004  Touch targets stay usable on real phones
 5023  Shipped level data is well-formed
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

82 ids, with the line each is declared on.

```
app                 518
banner              581
bestVal             554
board               565
boardKeys           568
boardWrap           564
challengeTargetBar  556
colorblindToggle    673
creditsVersion      708
editorBackBtn       598
editorCanvas        612
editorClear         605
editorCodeRow       623
editorCopy          620
editorHint          628
editorImport        624
editorLoad          625
editorPlay          619
editorRandom        606
editorScreen        596
editorSize          604
editorSizeRow       603
editorTools         609
editorVerdict       615
editorVerify        618
hud                 550
introBolt           512
introFlash          510
introScreen         503
introSkipHint       515
introTagline        513
introTitle          512
introTraces         504
introWordmark       511
menuBadge           526
menuBanner          529
menuBtn             543
menuList            528
menuScreen          521
muteToggle          687
playBody            548
playBottom          575
playerNameInput     694
playLevelNameText   544
playMain            563
playScreen          541
playTopStats        549
previewBtn          578
reduceMotionToggle  680
restartBtn          577
scoreVal            553
sealedBar           557
sealedRestart       559
sealedText          558
settingsBackBtn     638
settingsBtn         522
settingsCredits     707
settingsScreen      636
shareBlurb          719
shareBox            720
shareBtn            579
shareCard           717
shareCloseBtn       724
shareCopyBtn        723
shareModal          716
shareStatus         721
shareTitle          718
skinList            699
statsList           704
timer               551
winBestLine         734
winBreakdown        733
winCard             730
winEarnLine         735
winMenu             738
winModal            729
winNext             740
winRestart          737
winScore            732
winShare            739
winTitle            731
zapCount            552
```
