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
sed -n '2035,2080p' index.html     # read those lines, not all 4,794
```

Generated from `index.html` - 4,794 lines, 213,372 bytes, sha256 `1dd8b53b93f7`.

## Files

| file | lines | what it is |
|---|---:|---|
| `index.html` | 4,794 | The entire game: markup, styles and engine in one file. |
| `build.js` | 277 | Release gate + packager. Refuses to zip a build that fails a check. |
| `codemap.js` | 346 | Generates CODE-MAP.md. This file. |
| `make-icons.mjs` | 188 | Rasterizes icons/*.png from the same art as icon.svg. |
| `shots.mjs` | 301 | Captures store/screenshots/ from the real game. |
| `chrome.mjs` | 164 | Headless-Chrome plumbing for shots.mjs. |
| `mutate.js` | 339 | Mutation audit: breaks the game on purpose to test the gates. |
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
| 672-707 | JS | Tunables |  |
| 708-910 | JS | Level definitions | 2 |
| 911-1087 | JS | Daily challenge | 10 |
| 1088-1093 | JS | Medals |  |
| 1094-1142 | JS | Solution contract | 3 |
| 1143-1204 | JS | Persistent storage | 10 |
| 1205-1213 | JS | Lifetime stats (for the Settings > Stats section) | 3 |
| 1214-1275 | JS | Cosmetic perks (purely visual — never affect timing, sparks... | 4 |
| 1276-1537 | JS | Screen management | 10 |
| 1538-1563 | JS | State |  |
| 1564-1665 | JS | The clock | 6 |
| 1666-1720 | JS | Geometry helpers | 9 |
| 1721-1785 | JS | Sound (synthesized via Web Audio API — no asset files, keeps... | 4 |
| 1786-2112 | JS | Input | 10 |
| 2113-2239 | JS | Keyboard input (WASD / arrows) | 5 |
| 2240-2335 | JS | Obstacle motion + collision | 9 |
| 2336-2391 | JS | Wire identity: shape + pattern (always on) and palette (swappable) | 2 |
| 2392-2768 | JS | Rendering | 2 |
| 2769-2804 | JS | Main loop | 1 |
| 2805-2908 | JS | Buttons | 5 |
| 2909-2932 | JS | Intro / splash screen | 2 |
| 2933-2954 | JS | **SOLVERS** |  |
| 2955-3144 | JS | Solver A — routing | 5 |
| 3145-3330 | JS | **LEVEL CODEC** | 6 |
| 3331-3428 | JS | Trap measurement | 3 |
| 3429-3450 | JS | Hazard timing helpers | 4 |
| 3451-3691 | JS | Solver B — scheduling | 7 |
| 3692-4135 | JS | **EDITOR** | 16 |
| 4136-4753 | JS | Self test | 1 |
| 4754-4794 | JS | Boot |  |

## Functions, by section

All 139 `function` declarations in `index.html`.

### Level definitions  <sub>JS &middot; 708-910</sub>

```
  890  patrol  (ticksPerCell, waypoints)
  895  loopPath(waypoints)
```

### Daily challenge  <sub>JS &middot; 911-1087</sub>

```
  919  hashStr              (s)
  924  mulberry32           (seed)
  933  localDateString      (d)
  951  randomDailyBoard     (rand, dateStr)
  988  measurePressure      (lv, sol)
 1004  generateDailyLevel   (dateStr)
 1062  terminalCellOf       (lv, cell)
 1066  getDailyStreak       ()
 1067  recordDailyPlay      (dateStr)
 1080  resolveChallengeLevel(challengeSlug)
```

### Solution contract  <sub>JS &middot; 1094-1142</sub>

```
 1118  parFor            (lv)
 1129  getMedalThresholds(lv)
 1134  medalForScore     (lv, scoreTicks)
```

### Persistent storage  <sub>JS &middot; 1143-1204</sub>

```
 1165  levelFingerprint(lv)
 1179  levelKey        (lv)
 1180  bestKey         (lv)
 1181  getBest         (lv)
 1187  setBestIfBetter (lv, scoreTicks)
 1197  cleanClearKey   (lv)
 1198  hasCleanClear   (lv)
 1199  markCleanClear  (lv)
 1202  ticksToSeconds  (t)
 1203  fmtTicks        (t)
```

### Lifetime stats (for the Settings > Stats section)  <sub>JS &middot; 1205-1213</sub>

```
 1206  bumpCounter      (key)
 1209  getCounter       (key)
 1210  medalsEarnedCount()
```

### Cosmetic perks (purely visual — never affect timing, sparks...  <sub>JS &middot; 1214-1275</sub>

```
 1237  getEquippedSkinId()
 1238  setEquippedSkinId(id)
 1239  applySkin        ()
 1248  renderSkinList   ()
```

### Screen management  <sub>JS &middot; 1276-1537</sub>

```
 1299  loadSettings   ()
 1337  saveSettings   ()
 1340  applySettings  ()
 1368  escapeHtml     (s)
 1375  describeHazards(lv)
 1386  renderMenu     ()
 1481  showMenu       ()
 1492  renderStats    ()
 1508  showSettings   ()
 1518  enterLevel     (lv)
```

### The clock  <sub>JS &middot; 1564-1665</sub>

```
 1595  computeCellSize     (cols, rows)
 1611  resizeCanvasForLevel()
 1624  currentScore        ()
 1626  resetPuzzle         ()
 1648  startRunIfIdle      ()
 1656  updateHud           ()
```

### Geometry helpers  <sub>JS &middot; 1666-1720</sub>

```
 1667  cellAt          (px, py)
 1672  sameCell        (a,b)
 1673  adjacent        (a,b)
 1674  terminalAt      (cell)
 1682  isBlocked       (cell)
 1688  inBounds        (cell)
 1694  occupiedBy      (cell, excludeIdx)
 1704  ownIntentIndexAt(cell)
 1714  commonPrefixLen (a, b)
```

### Sound (synthesized via Web Audio API — no asset files, keeps...  <sub>JS &middot; 1721-1785</sub>

```
 1727  ensureAudio()
 1736  playTone   (freq, opts)
 1751  playNoise  (opts)
 1780  haptic     (pattern)
```

### Input  <sub>JS &middot; 1786-2112</sub>

```
 1787  pointerPos          (evt)
 1805  setActiveColor      (idx)
 1811  onPointerDown       (cell)
 1863  planTo              (cell)
 1924  advanceToNextPlanned()
 1940  propagateActiveWire ()
 2012  findSealedPair      ()
 2046  announceSealIfAny   ()
 2066  stepTick            ()
 2079  endPointer          ()
```

### Keyboard input (WASD / arrows)  <sub>JS &middot; 2113-2239</sub>

```
 2118  cycleActiveColor(dir)
 2137  planHead        ()
 2144  keyboardStep    (dc, dr)
 2157  keyboardBack    ()
 2193  checkWin        ()
```

### Obstacle motion + collision  <sub>JS &middot; 2240-2335</sub>

```
 2248  isGate             (ob)
 2251  gateIsLive         (ob, tick)
 2258  obstacleCellAt     (ob, tick)
 2267  hopEase            (f)
 2273  obstacleRenderPos  (ob, tick, frac)
 2291  obstacleIsDangerous(ob, tick)
 2298  cellIsHot          (cell, tick)
 2307  checkZaps          (tick)
 2329  flashZap           ()
```

### Wire identity: shape + pattern (always on) and palette (swappable)  <sub>JS &middot; 2336-2391</sub>

```
 2360  styleFor (baseColor)
 2365  drawGlyph(shape, x, y, size)
```

### Rendering  <sub>JS &middot; 2392-2768</sub>

```
 2393  cssVar(name, fallback)
 2400  draw  (tick, frac)
```

### Main loop  <sub>JS &middot; 2769-2804</sub>

```
 2777  tick(now)
```

### Buttons  <sub>JS &middot; 2805-2908</sub>

```
 2813  nextLevelAfter(lv)
 2834  shareText     ()
 2841  challengeUrl  ()
 2872  shareTextOut  (title, body, blurb)
 2900  doShare       ()
```

### Intro / splash screen  <sub>JS &middot; 2909-2932</sub>

```
 2913  playIntro()
 2918  finish   ()
```

### Solver A — routing  <sub>JS &middot; 2955-3144</sub>

```
 2959  routeSolve      (lv, opts)
 2996  stillConnectable(k)
 3027  reachable       (fromIdx, goalIdx)
 3048  place           (k, cost)
 3060  walk            (k, p, cur, path, costBefore)
```

### LEVEL CODEC  <sub>JS &middot; 3145-3330</sub>

```
 3174  b64urlEncode(s)
 3177  b64urlDecode(s)
 3183  encodeLevel (lv)
 3209  decodeLevel (code)
 3302  customSlug  (code)
 3308  verifyLevel (lv)
```

### Trap measurement  <sub>JS &middot; 3331-3428</sub>

```
 3346  enumerateRoutes(lv, pairIdx, slack, maxCount)
 3392  restRoutable   (lv, pairIdx, route)
 3407  trapMeasure    (lv, opts)
```

### Hazard timing helpers  <sub>JS &middot; 3429-3450</sub>

```
 3430  gcd         (a,b)
 3431  lcm         (a,b)
 3434  hazardPeriod(lv)
 3442  dangerAt    (lv, tick)
```

### Solver B — scheduling  <sub>JS &middot; 3451-3691</sub>

```
 3468  wireRun       (lv, route, t0, cap)
 3524  scheduleSolve (lv, routes, opts)
 3586  solveLevel    (lv, opts)
 3610  applyAction   (act, sol)
 3628  replaySolution(lv, sol)
 3652  stageSolution (lv, sol, stopAfter)
 3680  stageSealDemo ()
```

### EDITOR  <sub>JS &middot; 3692-4135</sub>

```
 3721  edPadFor          (i)
 3726  edCellUsed        (cell)
 3732  edInBounds        (cell)
 3738  editorLevel       ()
 3758  edInvalidate      ()
 3764  setVerdict        (html, cls)
 3769  editorTap         (cell)
 3842  renderEditorTools ()
 3860  resizeEditorCanvas()
 3871  drawEditor        ()
 3968  drawGlyphOn       (c2d, shape, x, y, size)
 3986  editorCellAt      (evt)
 3997  runVerify         ()
 4034  editorClear       ()
 4043  editorRandom      ()
 4062  showEditor        ()
```

### Self test  <sub>JS &middot; 4136-4753</sub>

```
 4145  selfTest()
```

## Top-level constants

Cached `getElementById` handles are omitted - there are dozens and they all
sit in **Screen management**.

```
  681  GAME_VERSION        = '2.0.0';
  699  CANONICAL_URL       = 'https:
  701  TICK_HZ             = 6;
  702  MS_PER_TICK         = 1000 / TICK_HZ;
  703  MAX_FRAME_MS        = 250;
  705  ZAP_PENALTY_TICKS   = 3 * TICK_HZ;
  706  TRACE_MS            = 2500;
  729  LEVELS              = [
  938  DAILY_PALETTE       = ["#ff5d6c","#ffd75a","#7ab8ff","#c98bff","#54e...
  949  DAILY_BAND          = { parMin: 22, parMax: 46, holdsMin: 2, holdsMa...
 1001  DAILY_SEED_PREFIX   = 'wired-daily-v3-';
 1003  dailyCache          = new Map();
 1100  PAR_CONTRACT        = {
 1116  MEDAL_ICON          = { gold:'🥇', silver:'🥈', bronze:'🥉' };
 1117  parCache            = new Map();
 1153  STORE_PREFIX        = 'wired-v3-';
 1164  fingerprintCache    = new Map();
 1216  SKINS               = [
 1236  ALL_SKIN_TOKEN_KEYS = [...new Set(SKINS.flatMap(s=>Object.keys(s.tok...
 1277  screen              = 'menu';
 1289  SETTINGS_DEFAULTS   = {colorblind:false, reduceMotion:false, muted:f...
 1290  SETTINGS_KEY        = STORE_PREFIX + 'settings';
 1297  LEGACY_SETTINGS_KEY = 'wired-v2-settings';
 1307  settings            = loadSettings();
 1310  pendingChallenge    = null;
 1311  pendingBoard        = null;
 1542  MIN_CELL            = 32, MAX_CELL = 64;
 1543  CELL                = MAX_CELL;
 1544  level               = LEVELS[0];
 1555  wires               = {};
 1556  activeColor         = null;
 1557  dragging            = false;
 1558  won                 = false;
 1559  zapCount            = 0;
 1560  previewUntil        = 0;
 1561  sealed              = false;
 1562  justLocked          = false;
 1569  tickCount           = 0;
 1570  running             = false;
 1571  tickAccum           = 0;
 1572  lastFrameMs         = null;
 1573  pendingSwitchTicks  = 0;
 1576  ctx                 = canvas.getContext('2d');
 1726  audioCtx            = null;
 1770  sfx                 = {
 2344  WIRE_STYLE          = {
 2353  COLORBLIND_PALETTE  = {
 2953  ROUTE_BUDGET        = 400000;
 3163  CODE_VERSION        = 'W1';
 3164  PAIR_COLORS         = ["#ff5d6c","#ffd75a","#7ab8ff","#54e6a6","#c98...
 3165  EDITOR_MIN          = 5;
 3171  EDITOR_MAX          = 7;
 3172  VERIFY_BUDGET       = 4000000;
 3673  SEAL_DEMO           = {
 3698  GATE_PRESETS        = [
 3702  PATROL_SPEEDS       = [2, 3, 1, 4];
 3704  edCols              = 6, edRows = 6;
 3705  edPads              = [];
 3706  edBlocked           = [];
 3707  edGates             = [];
 3708  edPatrols           = [];
 3709  edTool              = 'pair0';
 3710  edPatrolDraft       = null;
 3711  edVerified          = null;
 3714  edCtx               = editorCanvas.getContext('2d');
```

## Levels

Par comes from `PAR_CONTRACT`; regenerate it with `node solve.js --contract`.

| # | slug | name | grid | par | defined |
|---:|---|---|---|---:|---:|
| 1 | `breadboard` | Breadboard | 5x5 | 14 | 733 |
| 2 | `circuit-board` | Circuit Board | 6x6 | 28 | 745 |
| 3 | `elbow` | Elbow | 7x7 | 26 | 759 |
| 4 | `interlock` | Interlock | 7x7 | 29 | 775 |
| 5 | `mainframe` | Mainframe | 7x7 | 34 | 792 |
| 6 | `relay-yard` | Relay Yard | 7x8 | 36 | 809 |
| 7 | `backplane` | Backplane | 7x8 | 39 | 823 |
| 8 | `logic-array` | Logic Array | 7x8 | 39 | 838 |
| 9 | `ladder` | Ladder | 7x7 | 31 | 857 |
| 10 | `fault-line` | Fault Line | 7x6 | 38 | 870 |

## Test groups

The 21 assertion groups inside `selfTest()`, so you can find the test
for a behaviour without reading the whole suite.

```
 4160  The first frame of a patrol level renders
 4172  Current costs a tick per cell, and drawing costs nothing
 4190  The exploit this whole model exists to kill
 4205  Determinism: same actions from tick 0, same run
 4218  Spark position is a pure function of the tick counter
 4229  A spark shorts what it touches, and only what it touches
 4263  Current waits at a live contact instead of dying on it
 4278  Components block routing
 4289  A finished wire is a wall
 4302  Sealing the board is detected, and only when certain
 4429  Ordinary play obeys the same rules par was computed under
 4457  Progression is keyed by identity, not position
 4466  A custom board travels inside its own link
 4492  The editor gate refuses what it cannot prove
 4512  Save keys are tied to identity, not array position
 4537  The persistence contract survives a rename
 4576  Solver: routing correctness on boards with a known answer
 4627  Solution contract
 4670  The daily is generated AND verified
 4693  Touch targets stay usable on real phones
 4712  Shipped level data is well-formed
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
