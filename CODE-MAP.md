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
sed -n '2035,2080p' index.html     # read those lines, not all 5,639
```

Generated from `index.html` - 5,639 lines, 261,582 bytes, sha256 `053255e801de`.

## Files

| file | lines | what it is |
|---|---:|---|
| `index.html` | 5,639 | The entire game: markup, styles and engine in one file. |
| `build.js` | 569 | Release gate + packager. Refuses to zip a build that fails a check. |
| `codemap.js` | 347 | Generates CODE-MAP.md. This file. |
| `make-icons.mjs` | 188 | Rasterizes icons/*.png from the same art as icon.svg. |
| `shots.mjs` | 320 | Captures store/screenshots/ from the real game. |
| `chrome.mjs` | 164 | Headless-Chrome plumbing for shots.mjs. |
| `mutate.js` | 524 | Mutation audit: breaks the game on purpose to test the gates. |
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
| 614-676 | HTML | PLAY SCREEN |  |
| 677-716 | HTML | EDITOR SCREEN |  |
| 717-833 | HTML | SETTINGS SCREEN |  |
| 834-892 | JS | Tunables |  |
| 893-1095 | JS | Level definitions | 2 |
| 1096-1272 | JS | Daily challenge | 10 |
| 1273-1278 | JS | Medals |  |
| 1279-1327 | JS | Solution contract | 3 |
| 1328-1396 | JS | Persistent storage | 10 |
| 1397-1405 | JS | Lifetime stats (for the Settings > Stats section) | 3 |
| 1406-1467 | JS | Cosmetic perks (purely visual — never affect timing, sparks... | 4 |
| 1468-1806 | JS | Screen management | 14 |
| 1807-1832 | JS | State |  |
| 1833-1987 | JS | The clock | 9 |
| 1988-2042 | JS | Geometry helpers | 9 |
| 2043-2107 | JS | Sound (synthesized via Web Audio API — no asset files, keeps... | 4 |
| 2108-2501 | JS | Input | 11 |
| 2502-2687 | JS | Keyboard input (WASD / arrows) | 9 |
| 2688-2783 | JS | Obstacle motion + collision | 9 |
| 2784-2839 | JS | Wire identity: shape + pattern (always on) and palette (swappable) | 2 |
| 2840-3224 | JS | Rendering | 2 |
| 3225-3259 | JS | Main loop | 1 |
| 3260-3386 | JS | Buttons | 7 |
| 3387-3410 | JS | Intro / splash screen | 2 |
| 3411-3432 | JS | **SOLVERS** |  |
| 3433-3622 | JS | Solver A — routing | 5 |
| 3623-3808 | JS | **LEVEL CODEC** | 6 |
| 3809-3906 | JS | Trap measurement | 3 |
| 3907-3928 | JS | Hazard timing helpers | 4 |
| 3929-4179 | JS | Solver B — scheduling | 7 |
| 4180-4624 | JS | **EDITOR** | 16 |
| 4625-5595 | JS | Self test | 1 |
| 5596-5639 | JS | Boot |  |

## Functions, by section

All 153 `function` declarations in `index.html`.

### Level definitions  <sub>JS &middot; 893-1095</sub>

```
 1075  patrol  (ticksPerCell, waypoints)
 1080  loopPath(waypoints)
```

### Daily challenge  <sub>JS &middot; 1096-1272</sub>

```
 1104  hashStr              (s)
 1109  mulberry32           (seed)
 1118  localDateString      (d)
 1136  randomDailyBoard     (rand, dateStr)
 1173  measurePressure      (lv, sol)
 1189  generateDailyLevel   (dateStr)
 1247  terminalCellOf       (lv, cell)
 1251  getDailyStreak       ()
 1252  recordDailyPlay      (dateStr)
 1265  resolveChallengeLevel(challengeSlug)
```

### Solution contract  <sub>JS &middot; 1279-1327</sub>

```
 1303  parFor            (lv)
 1314  getMedalThresholds(lv)
 1319  medalForScore     (lv, scoreTicks)
```

### Persistent storage  <sub>JS &middot; 1328-1396</sub>

```
 1350  levelFingerprint(lv)
 1364  levelKey        (lv)
 1365  bestKey         (lv)
 1366  getBest         (lv)
 1372  setBestIfBetter (lv, scoreTicks)
 1382  cleanClearKey   (lv)
 1383  hasCleanClear   (lv)
 1384  markCleanClear  (lv)
 1392  fmtTicks        (t)
 1395  fmtCount        (t)
```

### Lifetime stats (for the Settings > Stats section)  <sub>JS &middot; 1397-1405</sub>

```
 1398  bumpCounter      (key)
 1401  getCounter       (key)
 1402  medalsEarnedCount()
```

### Cosmetic perks (purely visual — never affect timing, sparks...  <sub>JS &middot; 1406-1467</sub>

```
 1429  getEquippedSkinId()
 1430  setEquippedSkinId(id)
 1431  applySkin        ()
 1440  renderSkinList   ()
```

### Screen management  <sub>JS &middot; 1468-1806</sub>

```
 1503  prefersReducedMotion()
 1508  loadSettings        ()
 1557  saveSettings        ()
 1560  applySettings       ()
 1588  escapeHtml          (s)
 1595  describeHazards     (lv)
 1606  renderMenu          ()
 1707  nextUnplayedLevel   ()
 1711  renderHome          ()
 1725  showHome            ()
 1737  showMenu            ()
 1749  renderStats         ()
 1765  showSettings        ()
 1776  enterLevel          (lv)
```

### The clock  <sub>JS &middot; 1833-1987</sub>

```
 1862  focusablesIn        (el)
 1867  openModal           (el, firstFocus)
 1873  closeModal          (el)
 1908  computeCellSize     (cols, rows)
 1932  resizeCanvasForLevel()
 1945  currentScore        ()
 1947  resetPuzzle         ()
 1974  startRunIfIdle      ()
 1978  updateHud           ()
```

### Geometry helpers  <sub>JS &middot; 1988-2042</sub>

```
 1989  cellAt          (px, py)
 1994  sameCell        (a,b)
 1995  adjacent        (a,b)
 1996  terminalAt      (cell)
 2004  isBlocked       (cell)
 2010  inBounds        (cell)
 2016  occupiedBy      (cell, excludeIdx)
 2026  ownIntentIndexAt(cell)
 2036  commonPrefixLen (a, b)
```

### Sound (synthesized via Web Audio API — no asset files, keeps...  <sub>JS &middot; 2043-2107</sub>

```
 2049  ensureAudio()
 2058  playTone   (freq, opts)
 2073  playNoise  (opts)
 2102  haptic     (pattern)
```

### Input  <sub>JS &middot; 2108-2501</sub>

```
 2109  pointerPos          (evt)
 2147  setActiveColor      (idx)
 2153  onPointerDown       (cell)
 2220  planTo              (cell)
 2289  advanceToNextPlanned()
 2305  propagateActiveWire ()
 2377  findSealedPair      ()
 2411  announceSealIfAny   ()
 2431  stepTick            ()
 2459  takeTurn            ()
 2470  endPointer          ()
```

### Keyboard input (WASD / arrows)  <sub>JS &middot; 2502-2687</sub>

```
 2507  cycleActiveColor(dir)
 2526  planHead        ()
 2533  keyboardStep    (dc, dr)
 2552  waitMove        ()
 2556  keyboardBack    ()
 2584  boardHasFocus   ()
 2585  anyModalOpen    ()
 2596  handlePlayKey   (e)
 2640  checkWin        ()
```

### Obstacle motion + collision  <sub>JS &middot; 2688-2783</sub>

```
 2696  isGate             (ob)
 2699  gateIsLive         (ob, tick)
 2706  obstacleCellAt     (ob, tick)
 2715  hopEase            (f)
 2721  obstacleRenderPos  (ob, tick, frac)
 2739  obstacleIsDangerous(ob, tick)
 2746  cellIsHot          (cell, tick)
 2755  checkZaps          (tick)
 2777  flashZap           ()
```

### Wire identity: shape + pattern (always on) and palette (swappable)  <sub>JS &middot; 2784-2839</sub>

```
 2808  styleFor (baseColor)
 2813  drawGlyph(shape, x, y, size)
```

### Rendering  <sub>JS &middot; 2840-3224</sub>

```
 2841  cssVar(name, fallback)
 2848  draw  (tick, frac)
```

### Main loop  <sub>JS &middot; 3225-3259</sub>

```
 3239  tick(now)
```

### Buttons  <sub>JS &middot; 3260-3386</sub>

```
 3261  leavePlay     ()
 3277  nextLevelAfter(lv)
 3297  syncTraceBtn  ()
 3304  shareText     ()
 3319  challengeUrl  ()
 3350  shareTextOut  (title, body, blurb)
 3378  doShare       ()
```

### Intro / splash screen  <sub>JS &middot; 3387-3410</sub>

```
 3391  playIntro()
 3396  finish   ()
```

### Solver A — routing  <sub>JS &middot; 3433-3622</sub>

```
 3437  routeSolve      (lv, opts)
 3474  stillConnectable(k)
 3505  reachable       (fromIdx, goalIdx)
 3526  place           (k, cost)
 3538  walk            (k, p, cur, path, costBefore)
```

### LEVEL CODEC  <sub>JS &middot; 3623-3808</sub>

```
 3652  b64urlEncode(s)
 3655  b64urlDecode(s)
 3661  encodeLevel (lv)
 3687  decodeLevel (code)
 3780  customSlug  (code)
 3786  verifyLevel (lv)
```

### Trap measurement  <sub>JS &middot; 3809-3906</sub>

```
 3824  enumerateRoutes(lv, pairIdx, slack, maxCount)
 3870  restRoutable   (lv, pairIdx, route)
 3885  trapMeasure    (lv, opts)
```

### Hazard timing helpers  <sub>JS &middot; 3907-3928</sub>

```
 3908  gcd         (a,b)
 3909  lcm         (a,b)
 3912  hazardPeriod(lv)
 3920  dangerAt    (lv, tick)
```

### Solver B — scheduling  <sub>JS &middot; 3929-4179</sub>

```
 3946  wireRun       (lv, route, t0, cap)
 4002  scheduleSolve (lv, routes, opts)
 4064  solveLevel    (lv, opts)
 4088  applyAction   (act, sol)
 4116  replaySolution(lv, sol)
 4140  stageSolution (lv, sol, stopAfter)
 4168  stageSealDemo ()
```

### EDITOR  <sub>JS &middot; 4180-4624</sub>

```
 4209  edPadFor          (i)
 4214  edCellUsed        (cell)
 4220  edInBounds        (cell)
 4226  editorLevel       ()
 4246  edInvalidate      ()
 4252  setVerdict        (html, cls)
 4257  editorTap         (cell)
 4330  renderEditorTools ()
 4348  resizeEditorCanvas()
 4359  drawEditor        ()
 4456  drawGlyphOn       (c2d, shape, x, y, size)
 4474  editorCellAt      (evt)
 4485  runVerify         ()
 4522  editorClear       ()
 4531  editorRandom      ()
 4550  showEditor        ()
```

### Self test  <sub>JS &middot; 4625-5595</sub>

```
 4634  selfTest()
```

## Top-level constants

Cached `getElementById` handles are omitted - there are dozens and they all
sit in **Screen management**.

```
  851  GAME_VERSION        = '2.0.0';
  874  CANONICAL_URL       = 'https:
  881  ZAP_PENALTY_TICKS   = 5;
  887  STEP_ANIM_MS        = 110;
  891  TRACE_AHEAD         = 3;
  914  LEVELS              = [
 1123  DAILY_PALETTE       = ["#ff5d6c","#ffd75a","#7ab8ff","#c98bff","#54e...
 1134  DAILY_BAND          = { parMin: 22, parMax: 46, holdsMin: 2, holdsMa...
 1186  DAILY_SEED_PREFIX   = 'wired-daily-v3-';
 1188  dailyCache          = new Map();
 1285  PAR_CONTRACT        = {
 1301  MEDAL_ICON          = { gold:'🥇', silver:'🥈', bronze:'🥉' };
 1302  parCache            = new Map();
 1338  STORE_PREFIX        = 'wired-v3-';
 1349  fingerprintCache    = new Map();
 1408  SKINS               = [
 1428  ALL_SKIN_TOKEN_KEYS = [...new Set(SKINS.flatMap(s=>Object.keys(s.tok...
 1469  screen              = 'home';
 1474  playReturn          = 'home';
 1475  settingsReturn      = 'home';
 1488  SETTINGS_DEFAULTS   = {colorblind:false, reduceMotion:false, muted:f...
 1489  SETTINGS_KEY        = STORE_PREFIX + 'settings';
 1496  LEGACY_SETTINGS_KEY = 'wired-v2-settings';
 1527  settings            = loadSettings();
 1530  pendingChallenge    = null;
 1531  pendingBoard        = null;
 1811  MIN_CELL            = 32, MAX_CELL = 64;
 1812  CELL                = MAX_CELL;
 1813  level               = LEVELS[0];
 1824  wires               = {};
 1825  activeColor         = null;
 1826  dragging            = false;
 1827  won                 = false;
 1828  zapCount            = 0;
 1829  tracing             = false;
 1830  sealed              = false;
 1831  justLocked          = false;
 1839  tickCount           = 0;
 1840  running             = false;
 1841  pendingSwitchTicks  = 0;
 1842  stepAnimUntil       = 0;
 1845  ctx                 = canvas.getContext('2d');
 1861  modalReturnFocus    = null;
 2048  audioCtx            = null;
 2092  sfx                 = {
 2792  WIRE_STYLE          = {
 2801  COLORBLIND_PALETTE  = {
 3431  ROUTE_BUDGET        = 400000;
 3641  CODE_VERSION        = 'W1';
 3642  PAIR_COLORS         = ["#ff5d6c","#ffd75a","#7ab8ff","#54e6a6","#c98...
 3643  EDITOR_MIN          = 5;
 3649  EDITOR_MAX          = 7;
 3650  VERIFY_BUDGET       = 4000000;
 4161  SEAL_DEMO           = {
 4186  GATE_PRESETS        = [
 4190  PATROL_SPEEDS       = [2, 3, 1, 4];
 4192  edCols              = 6, edRows = 6;
 4193  edPads              = [];
 4194  edBlocked           = [];
 4195  edGates             = [];
 4196  edPatrols           = [];
 4197  edTool              = 'pair0';
 4198  edPatrolDraft       = null;
 4199  edVerified          = null;
 4202  edCtx               = editorCanvas.getContext('2d');
```

## Levels

Par comes from `PAR_CONTRACT`; regenerate it with `node solve.js --contract`.

| # | slug | name | grid | par | defined |
|---:|---|---|---|---:|---:|
| 1 | `breadboard` | Breadboard | 5x5 | 14 | 918 |
| 2 | `circuit-board` | Circuit Board | 6x6 | 28 | 930 |
| 3 | `elbow` | Elbow | 7x7 | 26 | 944 |
| 4 | `interlock` | Interlock | 7x7 | 29 | 960 |
| 5 | `mainframe` | Mainframe | 7x7 | 34 | 977 |
| 6 | `relay-yard` | Relay Yard | 7x8 | 36 | 994 |
| 7 | `backplane` | Backplane | 7x8 | 39 | 1008 |
| 8 | `logic-array` | Logic Array | 7x8 | 39 | 1023 |
| 9 | `ladder` | Ladder | 7x7 | 31 | 1042 |
| 10 | `fault-line` | Fault Line | 7x6 | 38 | 1055 |

## Test groups

The 28 assertion groups inside `selfTest()`, so you can find the test
for a behaviour without reading the whole suite.

```
 4649  The first frame of a patrol level renders
 4661  One move is one cell, and nothing moves without a move
 4682  The renderer cannot spend a move
 4699  The exploit this whole model exists to kill
 4736  Determinism: same actions from tick 0, same run
 4749  Spark position is a pure function of the tick counter
 4760  A spark shorts what it touches, and only what it touches
 4814  Current waits at a live contact instead of dying on it
 4829  Components block routing
 4840  A finished wire is a wall
 4853  Sealing the board is detected, and only when certain
 4980  The engine charges for exactly what par charges for
 5051  The play screen is not a keyboard trap
 5127  The automatic handoff costs what a manual one costs
 5159  Wait is a move; Trace is not
 5188  The front door is one button, and it never points nowhere
 5226  Backing out of a level returns you where you came in from
 5256  The system motion preference seeds the default, never overrides
 5290  Progression is keyed by identity, not position
 5299  A custom board travels inside its own link
 5334  The editor gate refuses what it cannot prove
 5354  Save keys are tied to identity, not array position
 5379  The persistence contract survives a rename
 5418  Solver: routing correctness on boards with a known answer
 5469  Solution contract
 5512  The daily is generated AND verified
 5535  Touch targets stay usable on real phones
 5554  Shipped level data is well-formed
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
board               639
boardKeys           646
boardWrap           638
challengeTargetBar  630
colorblindToggle    758
creditsVersion      793
editorBackBtn       680
editorCanvas        694
editorClear         687
editorCodeRow       705
editorCopy          702
editorHint          710
editorImport        706
editorLoad          707
editorPlay          701
editorRandom        688
editorScreen        678
editorSize          686
editorSizeRow       685
editorTools         691
editorVerdict       697
editorVerify        700
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
muteToggle          772
playBody            622
playBottom          655
playerNameInput     779
playLevelNameText   618
playMain            637
playScreen          615
playTopStats        623
previewBtn          644
reduceMotionToggle  765
restartBtn          657
scoreVal            627
sealedBar           631
sealedRestart       633
sealedText          632
settingsBackBtn     720
settingsBtn         606
settingsCredits     792
settingsScreen      718
shareBlurb          804
shareBox            805
shareBtn            658
shareCard           802
shareCloseBtn       809
shareCopyBtn        808
shareModal          801
shareStatus         806
shareTitle          803
skinList            784
statsList           789
waitBtn             643
winBestLine         819
winBreakdown        818
winCard             815
winEarnLine         820
winMenu             823
winModal            814
winNext             825
winRestart          822
winScore            817
winShare            824
winTitle            816
zapCount            626
```
