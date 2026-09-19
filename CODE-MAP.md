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
sed -n '2035,2080p' index.html     # read those lines, not all 6,123
```

Generated from `index.html` - 6,123 lines, 287,864 bytes, sha256 `b23458a48576`.

## Files

| file | lines | what it is |
|---|---:|---|
| `index.html` | 6,123 | The entire game: markup, styles and engine in one file. |
| `build.js` | 686 | Release gate + packager. Refuses to zip a build that fails a check. |
| `codemap.js` | 347 | Generates CODE-MAP.md. This file. |
| `make-icons.mjs` | 188 | Rasterizes icons/*.png from the same art as icon.svg. |
| `shots.mjs` | 320 | Captures store/screenshots/ from the real game. |
| `chrome.mjs` | 164 | Headless-Chrome plumbing for shots.mjs. |
| `mutate.js` | 720 | Mutation audit: breaks the game on purpose to test the gates. |
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
| 614-694 | HTML | PLAY SCREEN |  |
| 695-734 | HTML | EDITOR SCREEN |  |
| 735-867 | HTML | SETTINGS SCREEN |  |
| 868-932 | JS | Tunables |  |
| 933-1135 | JS | Level definitions | 2 |
| 1136-1312 | JS | Daily challenge | 10 |
| 1313-1318 | JS | Medals |  |
| 1319-1367 | JS | Solution contract | 3 |
| 1368-1458 | JS | Persistent storage | 13 |
| 1459-1467 | JS | Lifetime stats (for the Settings > Stats section) | 3 |
| 1468-1529 | JS | Cosmetic perks (purely visual — never affect timing, sparks... | 4 |
| 1530-1885 | JS | Screen management | 14 |
| 1886-1911 | JS | State |  |
| 1912-2171 | JS | The clock | 15 |
| 2172-2226 | JS | Geometry helpers | 9 |
| 2227-2291 | JS | Sound (synthesized via Web Audio API — no asset files, keeps... | 4 |
| 2292-2735 | JS | Input | 14 |
| 2736-2956 | JS | Keyboard input (WASD / arrows) | 9 |
| 2957-3052 | JS | Obstacle motion + collision | 9 |
| 3053-3108 | JS | Wire identity: shape + pattern (always on) and palette (swappable) | 2 |
| 3109-3493 | JS | Rendering | 2 |
| 3494-3528 | JS | Main loop | 1 |
| 3529-3661 | JS | Buttons | 7 |
| 3662-3685 | JS | Intro / splash screen | 2 |
| 3686-3707 | JS | **SOLVERS** |  |
| 3708-3897 | JS | Solver A — routing | 5 |
| 3898-4083 | JS | **LEVEL CODEC** | 6 |
| 4084-4181 | JS | Trap measurement | 3 |
| 4182-4203 | JS | Hazard timing helpers | 4 |
| 4204-4454 | JS | Solver B — scheduling | 7 |
| 4455-4899 | JS | **EDITOR** | 16 |
| 4900-6079 | JS | Self test | 1 |
| 6080-6123 | JS | Boot |  |

## Functions, by section

All 165 `function` declarations in `index.html`.

### Level definitions  <sub>JS &middot; 933-1135</sub>

```
 1115  patrol  (ticksPerCell, waypoints)
 1120  loopPath(waypoints)
```

### Daily challenge  <sub>JS &middot; 1136-1312</sub>

```
 1144  hashStr              (s)
 1149  mulberry32           (seed)
 1158  localDateString      (d)
 1176  randomDailyBoard     (rand, dateStr)
 1213  measurePressure      (lv, sol)
 1229  generateDailyLevel   (dateStr)
 1287  terminalCellOf       (lv, cell)
 1291  getDailyStreak       ()
 1292  recordDailyPlay      (dateStr)
 1305  resolveChallengeLevel(challengeSlug)
```

### Solution contract  <sub>JS &middot; 1319-1367</sub>

```
 1343  parFor            (lv)
 1354  getMedalThresholds(lv)
 1359  medalForScore     (lv, scoreTicks)
```

### Persistent storage  <sub>JS &middot; 1368-1458</sub>

```
 1390  levelFingerprint   (lv)
 1404  levelKey           (lv)
 1405  bestKey            (lv)
 1406  getBest            (lv)
 1412  setBestIfBetter    (lv, scoreTicks)
 1426  bestTimeKey        (lv)
 1427  getBestTime        (lv)
 1433  setBestTimeIfBetter(lv, ms)
 1444  cleanClearKey      (lv)
 1445  hasCleanClear      (lv)
 1446  markCleanClear     (lv)
 1454  fmtTicks           (t)
 1457  fmtCount           (t)
```

### Lifetime stats (for the Settings > Stats section)  <sub>JS &middot; 1459-1467</sub>

```
 1460  bumpCounter      (key)
 1463  getCounter       (key)
 1464  medalsEarnedCount()
```

### Cosmetic perks (purely visual — never affect timing, sparks...  <sub>JS &middot; 1468-1529</sub>

```
 1491  getEquippedSkinId()
 1492  setEquippedSkinId(id)
 1493  applySkin        ()
 1502  renderSkinList   ()
```

### Screen management  <sub>JS &middot; 1530-1885</sub>

```
 1572  prefersReducedMotion()
 1577  loadSettings        ()
 1626  saveSettings        ()
 1629  applySettings       ()
 1667  escapeHtml          (s)
 1674  describeHazards     (lv)
 1685  renderMenu          ()
 1786  nextUnplayedLevel   ()
 1790  renderHome          ()
 1804  showHome            ()
 1816  showMenu            ()
 1828  renderStats         ()
 1844  showSettings        ()
 1855  enterLevel          (lv)
```

### The clock  <sub>JS &middot; 1912-2171</sub>

```
 1943  playedMs            (now, start, paused, hiddenSince)
 1948  clockNow            ()
 1961  zapPenaltyMs        ()
 1970  trialTimeMs         ()
 1974  elapsedSeconds      ()
 1978  fmtSeconds          (s)
 2000  focusablesIn        (el)
 2005  openModal           (el, firstFocus)
 2011  closeModal          (el)
 2047  computeCellSize     (cols, rows)
 2071  resizeCanvasForLevel()
 2097  currentScore        ()
 2099  resetPuzzle         ()
 2131  startRunIfIdle      ()
 2141  updateHud           ()
```

### Geometry helpers  <sub>JS &middot; 2172-2226</sub>

```
 2173  cellAt          (px, py)
 2178  sameCell        (a,b)
 2179  adjacent        (a,b)
 2180  terminalAt      (cell)
 2188  isBlocked       (cell)
 2194  inBounds        (cell)
 2200  occupiedBy      (cell, excludeIdx)
 2210  ownIntentIndexAt(cell)
 2220  commonPrefixLen (a, b)
```

### Sound (synthesized via Web Audio API — no asset files, keeps...  <sub>JS &middot; 2227-2291</sub>

```
 2233  ensureAudio()
 2242  playTone   (freq, opts)
 2257  playNoise  (opts)
 2286  haptic     (pattern)
```

### Input  <sub>JS &middot; 2292-2735</sub>

```
 2293  pointerPos          (evt)
 2331  setActiveColor      (idx)
 2337  onPointerDown       (cell)
 2404  planTo              (cell)
 2473  advanceToNextPlanned()
 2489  propagateActiveWire ()
 2561  findSealedPair      ()
 2595  announceSealIfAny   ()
 2615  stepTick            ()
 2644  startMetronome      ()
 2649  stopMetronome       ()
 2658  metronomeTick       (hidden)
 2688  takeTurn            ()
 2704  endPointer          ()
```

### Keyboard input (WASD / arrows)  <sub>JS &middot; 2736-2956</sub>

```
 2741  cycleActiveColor(dir)
 2760  planHead        ()
 2767  keyboardStep    (dc, dr)
 2786  waitMove        ()
 2790  keyboardBack    ()
 2818  boardHasFocus   ()
 2819  anyModalOpen    ()
 2830  handlePlayKey   (e)
 2874  checkWin        ()
```

### Obstacle motion + collision  <sub>JS &middot; 2957-3052</sub>

```
 2965  isGate             (ob)
 2968  gateIsLive         (ob, tick)
 2975  obstacleCellAt     (ob, tick)
 2984  hopEase            (f)
 2990  obstacleRenderPos  (ob, tick, frac)
 3008  obstacleIsDangerous(ob, tick)
 3015  cellIsHot          (cell, tick)
 3024  checkZaps          (tick)
 3046  flashZap           ()
```

### Wire identity: shape + pattern (always on) and palette (swappable)  <sub>JS &middot; 3053-3108</sub>

```
 3077  styleFor (baseColor)
 3082  drawGlyph(shape, x, y, size)
```

### Rendering  <sub>JS &middot; 3109-3493</sub>

```
 3110  cssVar(name, fallback)
 3117  draw  (tick, frac)
```

### Main loop  <sub>JS &middot; 3494-3528</sub>

```
 3508  tick(now)
```

### Buttons  <sub>JS &middot; 3529-3661</sub>

```
 3530  leavePlay     ()
 3546  nextLevelAfter(lv)
 3566  syncTraceBtn  ()
 3573  shareText     ()
 3594  challengeUrl  ()
 3625  shareTextOut  (title, body, blurb)
 3653  doShare       ()
```

### Intro / splash screen  <sub>JS &middot; 3662-3685</sub>

```
 3666  playIntro()
 3671  finish   ()
```

### Solver A — routing  <sub>JS &middot; 3708-3897</sub>

```
 3712  routeSolve      (lv, opts)
 3749  stillConnectable(k)
 3780  reachable       (fromIdx, goalIdx)
 3801  place           (k, cost)
 3813  walk            (k, p, cur, path, costBefore)
```

### LEVEL CODEC  <sub>JS &middot; 3898-4083</sub>

```
 3927  b64urlEncode(s)
 3930  b64urlDecode(s)
 3936  encodeLevel (lv)
 3962  decodeLevel (code)
 4055  customSlug  (code)
 4061  verifyLevel (lv)
```

### Trap measurement  <sub>JS &middot; 4084-4181</sub>

```
 4099  enumerateRoutes(lv, pairIdx, slack, maxCount)
 4145  restRoutable   (lv, pairIdx, route)
 4160  trapMeasure    (lv, opts)
```

### Hazard timing helpers  <sub>JS &middot; 4182-4203</sub>

```
 4183  gcd         (a,b)
 4184  lcm         (a,b)
 4187  hazardPeriod(lv)
 4195  dangerAt    (lv, tick)
```

### Solver B — scheduling  <sub>JS &middot; 4204-4454</sub>

```
 4221  wireRun       (lv, route, t0, cap)
 4277  scheduleSolve (lv, routes, opts)
 4339  solveLevel    (lv, opts)
 4363  applyAction   (act, sol)
 4391  replaySolution(lv, sol)
 4415  stageSolution (lv, sol, stopAfter)
 4443  stageSealDemo ()
```

### EDITOR  <sub>JS &middot; 4455-4899</sub>

```
 4484  edPadFor          (i)
 4489  edCellUsed        (cell)
 4495  edInBounds        (cell)
 4501  editorLevel       ()
 4521  edInvalidate      ()
 4527  setVerdict        (html, cls)
 4532  editorTap         (cell)
 4605  renderEditorTools ()
 4623  resizeEditorCanvas()
 4634  drawEditor        ()
 4731  drawGlyphOn       (c2d, shape, x, y, size)
 4749  editorCellAt      (evt)
 4760  runVerify         ()
 4797  editorClear       ()
 4806  editorRandom      ()
 4825  showEditor        ()
```

### Self test  <sub>JS &middot; 4900-6079</sub>

```
 4909  selfTest()
```

## Top-level constants

Cached `getElementById` handles are omitted - there are dozens and they all
sit in **Screen management**.

```
  885  GAME_VERSION        = '2.0.0';
  908  CANONICAL_URL       = 'https:
  915  ZAP_PENALTY_TICKS   = 5;
  921  STEP_ANIM_MS        = 110;
  925  TRACE_AHEAD         = 3;
  931  TRIAL_HZ            = 3;
  954  LEVELS              = [
 1163  DAILY_PALETTE       = ["#ff5d6c","#ffd75a","#7ab8ff","#c98bff","#54e...
 1174  DAILY_BAND          = { parMin: 22, parMax: 46, holdsMin: 2, holdsMa...
 1226  DAILY_SEED_PREFIX   = 'wired-daily-v3-';
 1228  dailyCache          = new Map();
 1325  PAR_CONTRACT        = {
 1341  MEDAL_ICON          = { gold:'🥇', silver:'🥈', bronze:'🥉' };
 1342  parCache            = new Map();
 1378  STORE_PREFIX        = 'wired-v3-';
 1389  fingerprintCache    = new Map();
 1470  SKINS               = [
 1490  ALL_SKIN_TOKEN_KEYS = [...new Set(SKINS.flatMap(s=>Object.keys(s.tok...
 1531  screen              = 'home';
 1536  playReturn          = 'home';
 1537  settingsReturn      = 'home';
 1556  SETTINGS_DEFAULTS   = {colorblind:false, reduceMotion:false, muted:f...
 1558  SETTINGS_KEY        = STORE_PREFIX + 'settings';
 1565  LEGACY_SETTINGS_KEY = 'wired-v2-settings';
 1596  settings            = loadSettings();
 1599  pendingChallenge    = null;
 1600  pendingBoard        = null;
 1890  MIN_CELL            = 32, MAX_CELL = 64;
 1891  CELL                = MAX_CELL;
 1892  level               = LEVELS[0];
 1903  wires               = {};
 1904  activeColor         = null;
 1905  dragging            = false;
 1906  won                 = false;
 1907  zapCount            = 0;
 1908  tracing             = false;
 1909  sealed              = false;
 1910  justLocked          = false;
 1918  tickCount           = 0;
 1919  running             = false;
 1920  pendingSwitchTicks  = 0;
 1921  stepAnimUntil       = 0;
 1934  runStartMs          = null;
 1935  pausedMs            = 0;
 1936  hiddenAt            = null;
 1937  finishedMs          = null;
 1981  ctx                 = canvas.getContext('2d');
 1999  modalReturnFocus    = null;
 2232  audioCtx            = null;
 2276  sfx                 = {
 2642  metronomeId         = null;
 3061  WIRE_STYLE          = {
 3070  COLORBLIND_PALETTE  = {
 3706  ROUTE_BUDGET        = 400000;
 3916  CODE_VERSION        = 'W1';
 3917  PAIR_COLORS         = ["#ff5d6c","#ffd75a","#7ab8ff","#54e6a6","#c98...
 3918  EDITOR_MIN          = 5;
 3924  EDITOR_MAX          = 7;
 3925  VERIFY_BUDGET       = 4000000;
 4436  SEAL_DEMO           = {
 4461  GATE_PRESETS        = [
 4465  PATROL_SPEEDS       = [2, 3, 1, 4];
 4467  edCols              = 6, edRows = 6;
 4468  edPads              = [];
 4469  edBlocked           = [];
 4470  edGates             = [];
 4471  edPatrols           = [];
 4472  edTool              = 'pair0';
 4473  edPatrolDraft       = null;
 4474  edVerified          = null;
 4477  edCtx               = editorCanvas.getContext('2d');
```

## Levels

Par comes from `PAR_CONTRACT`; regenerate it with `node solve.js --contract`.

| # | slug | name | grid | par | defined |
|---:|---|---|---|---:|---:|
| 1 | `breadboard` | Breadboard | 5x5 | 14 | 958 |
| 2 | `circuit-board` | Circuit Board | 6x6 | 28 | 970 |
| 3 | `elbow` | Elbow | 7x7 | 26 | 984 |
| 4 | `interlock` | Interlock | 7x7 | 29 | 1000 |
| 5 | `mainframe` | Mainframe | 7x7 | 34 | 1017 |
| 6 | `relay-yard` | Relay Yard | 7x8 | 36 | 1034 |
| 7 | `backplane` | Backplane | 7x8 | 39 | 1048 |
| 8 | `logic-array` | Logic Array | 7x8 | 39 | 1063 |
| 9 | `ladder` | Ladder | 7x7 | 31 | 1082 |
| 10 | `fault-line` | Fault Line | 7x6 | 38 | 1095 |

## Test groups

The 29 assertion groups inside `selfTest()`, so you can find the test
for a behaviour without reading the whole suite.

```
 4937  The first frame of a patrol level renders
 4949  One move is one cell, and nothing moves without a move
 4970  The renderer cannot spend a move
 4987  The exploit this whole model exists to kill
 5024  Determinism: same actions from tick 0, same run
 5037  Spark position is a pure function of the tick counter
 5048  A spark shorts what it touches, and only what it touches
 5102  Current waits at a live contact instead of dying on it
 5117  Components block routing
 5128  A finished wire is a wall
 5141  Sealing the board is detected, and only when certain
 5268  The engine charges for exactly what par charges for
 5339  The play screen is not a keyboard trap
 5415  The stopwatch measures; it never decides
 5610  The automatic handoff costs what a manual one costs
 5642  Wait is a move; Trace is not
 5671  The front door is one button, and it never points nowhere
 5709  Backing out of a level returns you where you came in from
 5739  The system motion preference seeds the default, never overrides
 5773  Progression is keyed by identity, not position
 5782  A custom board travels inside its own link
 5817  The editor gate refuses what it cannot prove
 5837  Save keys are tied to identity, not array position
 5862  The persistence contract survives a rename
 5901  Solver: routing correctness on boards with a known answer
 5952  Solution contract
 5995  The daily is generated AND verified
 6018  Touch targets stay usable on real phones
 6037  Shipped level data is well-formed
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
STORE_PREFIX + 'besttime-'
STORE_PREFIX + 'clean-'
STORE_PREFIX + 'daily-lastDate'
STORE_PREFIX + 'daily-streak'
STORE_PREFIX + 'settings'
STORE_PREFIX + 'skin'
STORE_PREFIX + 'stats-plays'
STORE_PREFIX + 'stats-zaps'
```

## DOM ids

100 ids, with the line each is declared on.

```
app                 562
banner              661
bannerTrial         680
bestVal             628
board               640
boardKeys           647
boardWrap           639
challengeTargetBar  631
colorblindToggle    776
creditsVersion      826
editorBackBtn       698
editorCanvas        712
editorClear         705
editorCodeRow       723
editorCopy          720
editorHint          728
editorImport        724
editorLoad          725
editorPlay          719
editorRandom        706
editorScreen        696
editorSize          704
editorSizeRow       703
editorTools         709
editorVerdict       715
editorVerify        718
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
muteToggle          790
playBody            622
playBottom          656
playerNameInput     812
playLevelNameText   618
playMain            638
playScreen          615
playTopStats        623
previewBtn          645
reduceMotionToggle  783
restartBtn          658
scoreStat           627
scoreVal            627
sealedBar           632
sealedRestart       634
sealedText          633
settingsBackBtn     738
settingsBtn         606
settingsCredits     825
settingsScreen      736
shareBlurb          837
shareBox            838
shareBtn            659
shareCard           835
shareCloseBtn       842
shareCopyBtn        841
shareModal          834
shareStatus         839
shareTitle          836
skinList            817
statsList           822
timeStat            629
timeTrialToggle     805
timeVal             629
trialZapCost        686
waitBtn             644
winBestLine         852
winBreakdown        851
winCard             848
winEarnLine         854
winMenu             857
winModal            847
winNext             859
winRestart          856
winScore            850
winShare            858
winTimeLine         853
winTitle            849
zapCount            626
```
