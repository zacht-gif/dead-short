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
sed -n '2035,2080p' index.html     # read those lines, not all 6,154
```

Generated from `index.html` - 6,154 lines, 291,077 bytes, sha256 `a8ed24ca7285`.

## Files

| file | lines | what it is |
|---|---:|---|
| `index.html` | 6,154 | The entire game: markup, styles and engine in one file. |
| `build.js` | 769 | Release gate + packager. Refuses to zip a build that fails a check. |
| `codemap.js` | 347 | Generates CODE-MAP.md. This file. |
| `make-icons.mjs` | 188 | Rasterizes icons/*.png from the same art as icon.svg. |
| `shots.mjs` | 331 | Captures store/screenshots/ from the real game. |
| `chrome.mjs` | 164 | Headless-Chrome plumbing for shots.mjs. |
| `mutate.js` | 691 | Mutation audit: breaks the game on purpose to test the gates. |
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
| 564-605 | HTML | HOME SCREEN |  |
| 606-616 | HTML | MENU SCREEN (the level catalogue) |  |
| 617-698 | HTML | PLAY SCREEN |  |
| 699-738 | HTML | EDITOR SCREEN |  |
| 739-875 | HTML | SETTINGS SCREEN |  |
| 876-940 | JS | Tunables |  |
| 941-1143 | JS | Level definitions | 2 |
| 1144-1320 | JS | Daily challenge | 10 |
| 1321-1326 | JS | Medals |  |
| 1327-1375 | JS | Solution contract | 3 |
| 1376-1469 | JS | Persistent storage | 10 |
| 1470-1478 | JS | Lifetime stats (for the Settings > Stats section) | 3 |
| 1479-1540 | JS | Cosmetic perks (purely visual — never affect timing, sparks... | 4 |
| 1541-1929 | JS | Screen management | 14 |
| 1930-1955 | JS | State |  |
| 1956-2147 | JS | The clock | 11 |
| 2148-2202 | JS | Geometry helpers | 9 |
| 2203-2267 | JS | Sound (synthesized via Web Audio API — no asset files, keeps... | 4 |
| 2268-2729 | JS | Input | 15 |
| 2730-2927 | JS | Keyboard input (WASD / arrows) | 8 |
| 2928-3023 | JS | Obstacle motion + collision | 9 |
| 3024-3079 | JS | Wire identity: shape + pattern (always on) and palette (swappable) | 2 |
| 3080-3464 | JS | Rendering | 2 |
| 3465-3499 | JS | Main loop | 1 |
| 3500-3639 | JS | Buttons | 7 |
| 3640-3663 | JS | Intro / splash screen | 2 |
| 3664-3685 | JS | **SOLVERS** |  |
| 3686-3875 | JS | Solver A — routing | 5 |
| 3876-4061 | JS | **LEVEL CODEC** | 6 |
| 4062-4159 | JS | Trap measurement | 3 |
| 4160-4181 | JS | Hazard timing helpers | 4 |
| 4182-4432 | JS | Solver B — scheduling | 7 |
| 4433-4877 | JS | **EDITOR** | 16 |
| 4878-6110 | JS | Self test | 1 |
| 6111-6154 | JS | Boot |  |

## Functions, by section

All 158 `function` declarations in `index.html`.

### Level definitions  <sub>JS &middot; 941-1143</sub>

```
 1123  patrol  (ticksPerCell, waypoints)
 1128  loopPath(waypoints)
```

### Daily challenge  <sub>JS &middot; 1144-1320</sub>

```
 1152  hashStr              (s)
 1157  mulberry32           (seed)
 1166  localDateString      (d)
 1184  randomDailyBoard     (rand, dateStr)
 1221  measurePressure      (lv, sol)
 1237  generateDailyLevel   (dateStr)
 1295  terminalCellOf       (lv, cell)
 1299  getDailyStreak       ()
 1300  recordDailyPlay      (dateStr)
 1313  resolveChallengeLevel(challengeSlug)
```

### Solution contract  <sub>JS &middot; 1327-1375</sub>

```
 1351  parFor            (lv)
 1362  getMedalThresholds(lv)
 1367  medalForScore     (lv, scoreTicks)
```

### Persistent storage  <sub>JS &middot; 1376-1469</sub>

```
 1398  levelFingerprint(lv)
 1412  levelKey        (lv)
 1413  bestKey         (lv)
 1414  getBest         (lv)
 1420  setBestIfBetter (lv, scoreTicks)
 1441  cleanClearKey   (lv)
 1442  hasCleanClear   (lv)
 1443  markCleanClear  (lv)
 1465  fmtTicks        (t)
 1468  fmtCount        (t)
```

### Lifetime stats (for the Settings > Stats section)  <sub>JS &middot; 1470-1478</sub>

```
 1471  bumpCounter      (key)
 1474  getCounter       (key)
 1475  medalsEarnedCount()
```

### Cosmetic perks (purely visual — never affect timing, sparks...  <sub>JS &middot; 1479-1540</sub>

```
 1502  getEquippedSkinId()
 1503  setEquippedSkinId(id)
 1504  applySkin        ()
 1513  renderSkinList   ()
```

### Screen management  <sub>JS &middot; 1541-1929</sub>

```
 1595  prefersReducedMotion()
 1600  loadSettings        ()
 1649  saveSettings        ()
 1652  applySettings       ()
 1711  escapeHtml          (s)
 1718  describeHazards     (lv)
 1729  renderMenu          ()
 1830  nextUnplayedLevel   ()
 1834  renderHome          ()
 1848  showHome            ()
 1860  showMenu            ()
 1872  renderStats         ()
 1888  showSettings        ()
 1899  enterLevel          (lv)
```

### The clock  <sub>JS &middot; 1956-2147</sub>

```
 1975  fmtSeconds          (s)
 1981  clockNow            ()
 2003  focusablesIn        (el)
 2008  openModal           (el, firstFocus)
 2014  closeModal          (el)
 2049  computeCellSize     (cols, rows)
 2073  resizeCanvasForLevel()
 2091  currentScore        ()
 2093  resetPuzzle         ()
 2121  startRunIfIdle      ()
 2125  updateHud           ()
```

### Geometry helpers  <sub>JS &middot; 2148-2202</sub>

```
 2149  cellAt          (px, py)
 2154  sameCell        (a,b)
 2155  adjacent        (a,b)
 2156  terminalAt      (cell)
 2164  isBlocked       (cell)
 2170  inBounds        (cell)
 2176  occupiedBy      (cell, excludeIdx)
 2186  ownIntentIndexAt(cell)
 2196  commonPrefixLen (a, b)
```

### Sound (synthesized via Web Audio API — no asset files, keeps...  <sub>JS &middot; 2203-2267</sub>

```
 2209  ensureAudio()
 2218  playTone   (freq, opts)
 2233  playNoise  (opts)
 2262  haptic     (pattern)
```

### Input  <sub>JS &middot; 2268-2729</sub>

```
 2269  pointerPos          (evt)
 2307  setActiveColor      (idx)
 2313  onPointerDown       (cell)
 2380  planTo              (cell)
 2460  advanceToNextPlanned()
 2476  propagateActiveWire ()
 2548  findSealedPair      ()
 2582  announceSealIfAny   ()
 2602  stepTick            ()
 2631  startMetronome      ()
 2636  stopMetronome       ()
 2645  metronomeTick       (hidden)
 2676  takeTurn            ()
 2693  waitMove            ()
 2698  endPointer          ()
```

### Keyboard input (WASD / arrows)  <sub>JS &middot; 2730-2927</sub>

```
 2735  cycleActiveColor(dir)
 2754  planHead        ()
 2761  keyboardStep    (dc, dr)
 2781  keyboardBack    ()
 2809  boardHasFocus   ()
 2810  anyModalOpen    ()
 2821  handlePlayKey   (e)
 2868  checkWin        ()
```

### Obstacle motion + collision  <sub>JS &middot; 2928-3023</sub>

```
 2936  isGate             (ob)
 2939  gateIsLive         (ob, tick)
 2946  obstacleCellAt     (ob, tick)
 2955  hopEase            (f)
 2961  obstacleRenderPos  (ob, tick, frac)
 2979  obstacleIsDangerous(ob, tick)
 2986  cellIsHot          (cell, tick)
 2995  checkZaps          (tick)
 3017  flashZap           ()
```

### Wire identity: shape + pattern (always on) and palette (swappable)  <sub>JS &middot; 3024-3079</sub>

```
 3048  styleFor (baseColor)
 3053  drawGlyph(shape, x, y, size)
```

### Rendering  <sub>JS &middot; 3080-3464</sub>

```
 3081  cssVar(name, fallback)
 3088  draw  (tick, frac)
```

### Main loop  <sub>JS &middot; 3465-3499</sub>

```
 3479  tick(now)
```

### Buttons  <sub>JS &middot; 3500-3639</sub>

```
 3501  leavePlay     ()
 3517  nextLevelAfter(lv)
 3538  syncTraceBtn  ()
 3545  shareText     ()
 3572  challengeUrl  ()
 3603  shareTextOut  (title, body, blurb)
 3631  doShare       ()
```

### Intro / splash screen  <sub>JS &middot; 3640-3663</sub>

```
 3644  playIntro()
 3649  finish   ()
```

### Solver A — routing  <sub>JS &middot; 3686-3875</sub>

```
 3690  routeSolve      (lv, opts)
 3727  stillConnectable(k)
 3758  reachable       (fromIdx, goalIdx)
 3779  place           (k, cost)
 3791  walk            (k, p, cur, path, costBefore)
```

### LEVEL CODEC  <sub>JS &middot; 3876-4061</sub>

```
 3905  b64urlEncode(s)
 3908  b64urlDecode(s)
 3914  encodeLevel (lv)
 3940  decodeLevel (code)
 4033  customSlug  (code)
 4039  verifyLevel (lv)
```

### Trap measurement  <sub>JS &middot; 4062-4159</sub>

```
 4077  enumerateRoutes(lv, pairIdx, slack, maxCount)
 4123  restRoutable   (lv, pairIdx, route)
 4138  trapMeasure    (lv, opts)
```

### Hazard timing helpers  <sub>JS &middot; 4160-4181</sub>

```
 4161  gcd         (a,b)
 4162  lcm         (a,b)
 4165  hazardPeriod(lv)
 4173  dangerAt    (lv, tick)
```

### Solver B — scheduling  <sub>JS &middot; 4182-4432</sub>

```
 4199  wireRun       (lv, route, t0, cap)
 4255  scheduleSolve (lv, routes, opts)
 4317  solveLevel    (lv, opts)
 4341  applyAction   (act, sol)
 4369  replaySolution(lv, sol)
 4393  stageSolution (lv, sol, stopAfter)
 4421  stageSealDemo ()
```

### EDITOR  <sub>JS &middot; 4433-4877</sub>

```
 4462  edPadFor          (i)
 4467  edCellUsed        (cell)
 4473  edInBounds        (cell)
 4479  editorLevel       ()
 4499  edInvalidate      ()
 4505  setVerdict        (html, cls)
 4510  editorTap         (cell)
 4583  renderEditorTools ()
 4601  resizeEditorCanvas()
 4612  drawEditor        ()
 4709  drawGlyphOn       (c2d, shape, x, y, size)
 4727  editorCellAt      (evt)
 4738  runVerify         ()
 4775  editorClear       ()
 4784  editorRandom      ()
 4803  showEditor        ()
```

### Self test  <sub>JS &middot; 4878-6110</sub>

```
 4887  selfTest()
```

## Top-level constants

Cached `getElementById` handles are omitted - there are dozens and they all
sit in **Screen management**.

```
  893  GAME_VERSION        = '3.0.0';
  916  CANONICAL_URL       = 'https:
  923  ZAP_PENALTY_TICKS   = 5;
  929  STEP_ANIM_MS        = 110;
  933  TRACE_AHEAD         = 3;
  939  TRIAL_HZ            = 3;
  962  LEVELS              = [
 1171  DAILY_PALETTE       = ["#ff5d6c","#ffd75a","#7ab8ff","#c98bff","#54e...
 1182  DAILY_BAND          = { parMin: 22, parMax: 46, holdsMin: 2, holdsMa...
 1234  DAILY_SEED_PREFIX   = 'wired-daily-v3-';
 1236  dailyCache          = new Map();
 1333  PAR_CONTRACT        = {
 1349  MEDAL_ICON          = { gold:'🥇', silver:'🥈', bronze:'🥉' };
 1350  parCache            = new Map();
 1386  STORE_PREFIX        = 'wired-v3-';
 1397  fingerprintCache    = new Map();
 1481  SKINS               = [
 1501  ALL_SKIN_TOKEN_KEYS = [...new Set(SKINS.flatMap(s=>Object.keys(s.tok...
 1542  screen              = 'home';
 1547  playReturn          = 'home';
 1548  settingsReturn      = 'home';
 1568  RATE_IDS            = ['helpRate', 'aboutRate', 'aboutRate2'];
 1569  ZAP_COST_IDS        = ['trialZapCost', 'helpZapCost', 'aboutZapCost'...
 1579  SETTINGS_DEFAULTS   = {colorblind:false, reduceMotion:false, muted:f...
 1581  SETTINGS_KEY        = STORE_PREFIX + 'settings';
 1588  LEGACY_SETTINGS_KEY = 'wired-v2-settings';
 1619  settings            = loadSettings();
 1622  pendingChallenge    = null;
 1623  pendingBoard        = null;
 1934  MIN_CELL            = 32, MAX_CELL = 64;
 1935  CELL                = MAX_CELL;
 1936  level               = LEVELS[0];
 1947  wires               = {};
 1948  activeColor         = null;
 1949  dragging            = false;
 1950  won                 = false;
 1951  zapCount            = 0;
 1952  tracing             = false;
 1953  sealed              = false;
 1954  justLocked          = false;
 1962  tickCount           = 0;
 1963  running             = false;
 1964  pendingSwitchTicks  = 0;
 1965  stepAnimUntil       = 0;
 1986  ctx                 = canvas.getContext('2d');
 2002  modalReturnFocus    = null;
 2208  audioCtx            = null;
 2252  sfx                 = {
 2629  metronomeId         = null;
 3032  WIRE_STYLE          = {
 3041  COLORBLIND_PALETTE  = {
 3684  ROUTE_BUDGET        = 400000;
 3894  CODE_VERSION        = 'W1';
 3895  PAIR_COLORS         = ["#ff5d6c","#ffd75a","#7ab8ff","#54e6a6","#c98...
 3896  EDITOR_MIN          = 5;
 3902  EDITOR_MAX          = 7;
 3903  VERIFY_BUDGET       = 4000000;
 4414  SEAL_DEMO           = {
 4439  GATE_PRESETS        = [
 4443  PATROL_SPEEDS       = [2, 3, 1, 4];
 4445  edCols              = 6, edRows = 6;
 4446  edPads              = [];
 4447  edBlocked           = [];
 4448  edGates             = [];
 4449  edPatrols           = [];
 4450  edTool              = 'pair0';
 4451  edPatrolDraft       = null;
 4452  edVerified          = null;
 4455  edCtx               = editorCanvas.getContext('2d');
```

## Levels

Par comes from `PAR_CONTRACT`; regenerate it with `node solve.js --contract`.

| # | slug | name | grid | par | defined |
|---:|---|---|---|---:|---:|
| 1 | `breadboard` | Breadboard | 5x5 | 14 | 966 |
| 2 | `circuit-board` | Circuit Board | 6x6 | 28 | 978 |
| 3 | `elbow` | Elbow | 7x7 | 26 | 992 |
| 4 | `interlock` | Interlock | 7x7 | 29 | 1008 |
| 5 | `mainframe` | Mainframe | 7x7 | 34 | 1025 |
| 6 | `relay-yard` | Relay Yard | 7x8 | 36 | 1042 |
| 7 | `backplane` | Backplane | 7x8 | 39 | 1056 |
| 8 | `logic-array` | Logic Array | 7x8 | 39 | 1071 |
| 9 | `ladder` | Ladder | 7x7 | 31 | 1090 |
| 10 | `fault-line` | Fault Line | 7x6 | 38 | 1103 |

## Test groups

The 30 assertion groups inside `selfTest()`, so you can find the test
for a behaviour without reading the whole suite.

```
 4933  The first frame of a patrol level renders
 4945  One move is one cell, and the clock is what spends it
 4967  The renderer cannot spend a move
 4984  The exploit this whole model exists to kill
 5028  Determinism: same actions from tick 0, same run
 5041  Spark position is a pure function of the tick counter
 5052  A spark shorts what it touches, and only what it touches
 5106  Current waits at a live contact instead of dying on it
 5121  Components block routing
 5132  A finished wire is a wall
 5145  Sealing the board is detected, and only when certain
 5272  The engine charges for exactly what par charges for
 5345  The play screen is not a keyboard trap
 5421  The clock is the score, and the tick count IS the clock
 5521  Practice: the clock off, and nothing written down
 5634  The automatic handoff costs what a manual one costs
 5667  Waiting is free, and Trace is too
 5702  The front door is one button, and it never points nowhere
 5740  Backing out of a level returns you where you came in from
 5770  The system motion preference seeds the default, never overrides
 5804  Progression is keyed by identity, not position
 5813  A custom board travels inside its own link
 5848  The editor gate refuses what it cannot prove
 5868  Save keys are tied to identity, not array position
 5893  The persistence contract survives a rename
 5932  Solver: routing correctness on boards with a known answer
 5983  Solution contract
 6026  The daily is generated AND verified
 6049  Touch targets stay usable on real phones
 6068  Shipped level data is well-formed
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

101 ids, with the line each is declared on.

```
aboutRate           750
aboutRate2          761
aboutZapCost        768
app                 562
banner              667
bannerPractice      683
bestVal             631
board               643
boardKeys           659
boardWrap           642
challengeTargetBar  634
colorblindToggle    786
creditsVersion      835
editorBackBtn       702
editorCanvas        716
editorClear         709
editorCodeRow       727
editorCopy          724
editorHint          732
editorImport        728
editorLoad          729
editorPlay          723
editorRandom        710
editorScreen        700
editorSize          708
editorSizeRow       707
editorTools         713
editorVerdict       719
editorVerify        722
helpRate            585
helpZapCost         594
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
hud                 627
introBolt           556
introFlash          554
introScreen         547
introSkipHint       559
introTagline        557
introTitle          556
introTraces         548
introWordmark       555
menuBackBtn         608
menuBadge           570
menuBtn             620
menuList            614
menuScreen          607
moveCount           628
muteToggle          800
playBody            625
playBottom          662
playerNameInput     821
playLevelNameText   621
playMain            641
playScreen          618
playTopStats        626
practiceToggle      814
previewBtn          653
reduceMotionToggle  793
restartBtn          664
sealedBar           635
sealedRestart       637
sealedText          636
settingsBackBtn     742
settingsBtn         609
settingsCredits     834
settingsScreen      740
shareBlurb          846
shareBox            847
shareBtn            665
shareCard           844
shareCloseBtn       851
shareCopyBtn        850
shareModal          843
shareStatus         848
shareTitle          845
skinList            826
statsList           831
timeVal             632
trialZapCost        673
waitBtn             652
winBestLine         861
winBreakdown        860
winCard             857
winEarnLine         862
winMenu             865
winModal            856
winNext             867
winRestart          864
winScore            859
winShare            866
winTitle            858
zapCount            629
```
