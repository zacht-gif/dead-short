#!/usr/bin/env node
// Packages the game for upload.
//
//   node build.js            run checks, write dist/dead-short-<version>.zip
//   node build.js --no-test  skip the suite (don't ship a build you did this to)
//
// itch.io needs a zip with index.html at the ROOT — not inside a folder — or the
// upload plays as a file listing instead of a game. Everything shipped is a
// runtime file: the harness, the tests and the solver tooling stay out.
//
// No npm dependencies, so zipping goes through whatever the OS already has.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
// Everything the player's browser can ask for. Paths are relative to ROOT and
// are recreated inside the zip, so nested files land where the manifest and the
// service worker expect them.
const RUNTIME_FILES = [
  'index.html', 'manifest.json', 'sw.js', 'icon.svg',
  'icons/icon-192.png', 'icons/icon-512.png',
  'icons/maskable-512.png', 'icons/apple-touch-icon-180.png',
];
const SKIP_TESTS = process.argv.includes('--no-test');

function fail(msg){ console.error('BUILD FAILED: ' + msg); process.exit(1); }

// ---------- Checks that catch the mistakes you can't see in a browser --------

function readVersion(){
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const m = html.match(/const\s+GAME_VERSION\s*=\s*'([^']+)'/);
  if(!m) fail('no GAME_VERSION found in index.html');
  return m[1];
}

function checkServiceWorkerVersion(version){
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const m = sw.match(/const\s+CACHE_NAME\s*=\s*'([^']+)'/);
  if(!m) fail('no CACHE_NAME found in sw.js');
  if(m[1].indexOf(version) === -1){
    // Worth failing the build over: a stale cache name means returning players
    // keep the old build and nothing about that is visible until they complain.
    fail(`sw.js CACHE_NAME is "${m[1]}" but the game is v${version}.\n` +
         `        Bump CACHE_NAME or players will be served the old build from cache.`);
  }
}

function checkSelfContained(){
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  // The zero-dependency rule is the thing that keeps this game portable AND
  // keeps its licensing clean, so it's enforced rather than remembered.
  const offenders = [];
  if(/<script[^>]+\bsrc=/i.test(html)) offenders.push('external <script src>');
  if(/<link[^>]+rel=["']?stylesheet/i.test(html)) offenders.push('external stylesheet');
  if(/@import\s+url\(/i.test(html)) offenders.push('CSS @import');
  // CANONICAL_URL is a real https URL and belongs here: shared challenge links
  // have to point at a page that serves this file, and the game never FETCHES
  // it, so the zero-dependency rule is untouched.
  //
  // Every URL is compared to it WHOLE. The first version of this stripped the
  // canonical value as a substring, which made the exemption prefix-wide: a
  // hostile https://<canonical>/tracker.js had its front half deleted and the
  // leftover "tracker.js" sailed through. The mutation written to test the
  // allowlist's width caught it, which is the entire reason to write one - the
  // comment here previously claimed "another URL on the same host still fails"
  // and that claim was simply false.
  const canonical = (html.match(/const CANONICAL_URL = '([^']*)'/) || [, ''])[1];
  const scanned = html.replace(/<!--[\s\S]*?-->/g, '');
  const bad = (scanned.match(/https?:\/\/[^"'\s)]+/gi) || [])
    .filter(u => u !== canonical && !/^https?:\/\/www\.w3\.org\//i.test(u));
  if(bad.length){
    offenders.push('an http(s) URL in the document: ' + bad[0].slice(0, 60));
  }
  if(offenders.length){
    fail('index.html is no longer self-contained: ' + offenders.join(', ') + '.\n' +
         '        See the zero-dependency rule in README.md before adding one.');
  }
}

// The itch slug is now named in two files: CANONICAL_URL points at the store
// page, and publish.mjs pushes to that project. They are written independently
// and nothing connects them, so they can disagree - and the failure is the worst
// shape there is, because BOTH halves keep working. The build uploads happily to
// one project while every shared link sends players to a different one.
function checkItchSlugAgrees(){
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const pub = fs.readFileSync(path.join(ROOT, 'publish.mjs'), 'utf8');
  const canonical = (html.match(/const CANONICAL_URL = '([^']*)'/) || [, ''])[1];
  if(!/itch\.io\//.test(canonical)) return;  // not pointed at itch; nothing to agree with
  const fromUrl = canonical.replace(/\/+$/, '').split('/').pop();
  const m = pub.match(/const ITCH_SLUG = (?:"([^"]*)"|'([^']*)'|null)/);
  const fromPub = m ? (m[1] || m[2] || null) : null;
  if(!fromPub){
    fail('CANONICAL_URL points at the itch project "' + fromUrl + '" but publish.mjs\n' +
         '        has no ITCH_SLUG set, so the build would upload nowhere.');
  }
  if(fromPub !== fromUrl){
    fail('the itch project is named twice and the two disagree:\n' +
         '        CANONICAL_URL (index.html) -> ' + fromUrl + '\n' +
         '        ITCH_SLUG (publish.mjs)    -> ' + fromPub + '\n' +
         '        Shared links and the upload would go to different projects.');
  }
}

function checkDebugScaffolding(){
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const bad = ['__tickOnce', 'debugger;', 'TODO:', 'FIXME'];
  const found = bad.filter(t => html.indexOf(t) !== -1);
  if(found.length) fail('debug scaffolding left in index.html: ' + found.join(', '));
}

function checkCodeMap(){
  // CODE-MAP.md is generated from index.html. A stale map is worse than no map:
  // it sends the next reader confidently to a line that has since moved, and the
  // mistake only shows up after the edit is made.
  try{
    execFileSync(process.execPath, [path.join(ROOT, 'codemap.js'), '--check'], { encoding:'utf8' });
  } catch(e){
    fail('CODE-MAP.md is out of date with index.html.\n' +
         '        Run: node codemap.js');
  }
}

function checkIconArt(){
  // make-icons.mjs duplicates the bolt path and palette rather than parsing the
  // SVG — a general SVG parser would dwarf a four-shape icon. That trade is only
  // safe while something notices the two copies drifting, which is this.
  const svg = fs.readFileSync(path.join(ROOT, 'icon.svg'), 'utf8');
  const gen = fs.readFileSync(path.join(ROOT, 'make-icons.mjs'), 'utf8');
  const m = svg.match(/<path d="([^"]+)"/);
  if(!m) fail('no <path d="…"> found in icon.svg');
  if(gen.indexOf(m[1]) === -1){
    fail('the bolt path in make-icons.mjs no longer matches icon.svg.\n' +
         '        Update BOLT/BOLT_POINTS, then: node make-icons.mjs');
  }
  ['#0a0e17', '#24344a', '#f5b942'].forEach(hex=>{
    if(svg.indexOf(hex) === -1) fail(hex + ' is no longer in icon.svg');
    if(gen.indexOf(hex) === -1) fail(hex + ' is no longer in make-icons.mjs');
  });
}

// ---------- Accessibility gates -----------------------------------------
// Each of these guards something the suite physically cannot see, because
// selfTest() runs against a stub DOM with no CSS and no layout. They are all
// source-text or arithmetic checks on index.html for that reason.

function readTokenBlock(html){
  // Every --name: #hex in the file, wherever it is declared - the :root block
  // AND the SKINS[] overrides, which matter just as much: three skins override
  // the two tokens the contrast gate below is about, so checking :root alone
  // would pass a build where most skins failed.
  const out = {};
  // The optional quote before the colon is the whole point: :root writes
  //   --grid-line: #405d98;
  // but a SKINS[] entry writes
  //   '--grid-line':'#306857'
  // and requiring the colon to follow the name directly matched only the
  // first. The gate then claimed to check skins while reading nothing but
  // :root - caught by the skin-contrast-regressed mutation, which is exactly
  // the job that mutation exists to do.
  const re = /(--[a-z0-9-]+)['"]?\s*:\s*['"]?(#[0-9a-fA-F]{3,8})['"]?/g;
  let m;
  while((m = re.exec(html)) !== null){
    (out[m[1]] = out[m[1]] || []).push(m[2]);
  }
  return out;
}

function readRootTokens(html){
  // Only the :root block. The fallback check compares against the DEFAULT
  // value, and now that readTokenBlock() also sees the skins, taking "the
  // first declaration" would have meant "whichever comes first in the file" -
  // true today, and a silent trap the day a skin moves above :root.
  const m = html.match(/:root\s*\{([\s\S]*?)\}/);
  if(!m) fail('no :root block found in index.html');
  const out = {};
  const re = /(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g;
  let d;
  while((d = re.exec(m[1])) !== null) out[d[1]] = d[2];
  return out;
}

function srgbLuminance(hex){
  const h = hex.replace('#','');
  const full = h.length === 3 ? h[0]+h[0]+h[1]+h[1]+h[2]+h[2] : h.slice(0,6);
  const ch = [0,2,4].map(i => parseInt(full.slice(i,i+2),16)/255)
    .map(c => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4));
  return 0.2126*ch[0] + 0.7152*ch[1] + 0.0722*ch[2];
}

function contrastRatio(a, b){
  const la = srgbLuminance(a), lb = srgbLuminance(b);
  return (Math.max(la,lb) + 0.05) / (Math.min(la,lb) + 0.05);
}

function checkAccessibleViewport(){
  // user-scalable=no / maximum-scale=1 blocks pinch-zoom outright, which is a
  // WCAG 1.4.4 failure and the single most common one on a mobile game. The
  // gesture it was really there to suppress is double-tap-to-zoom, and
  // touch-action:manipulation on the buttons suppresses exactly that without
  // taking deliberate zoom away from anyone.
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const m = html.match(/<meta\s+name="viewport"[^>]*>/i);
  if(!m) fail('no viewport meta found in index.html');
  const tag = m[0];
  ['user-scalable=no', 'user-scalable = no', 'maximum-scale'].forEach(bad=>{
    if(tag.toLowerCase().indexOf(bad) !== -1){
      fail('the viewport meta blocks pinch-zoom (' + bad + '), which fails WCAG 1.4.4.\n' +
           '        Drop it; buttons already carry touch-action:manipulation.');
    }
  });
  if(html.indexOf('touch-action:manipulation') === -1){
    fail('touch-action:manipulation is gone from the buttons.\n' +
         '        It is the half of the pair that keeps taps fast once\n' +
         '        user-scalable=no is no longer suppressing double-tap zoom.');
  }
}

function checkFocusVisible(){
  // Every control here styles :hover. Until 2026-09-17 none styled :focus, so
  // keyboard users got the browser default - which on the gold primary buttons
  // measured 1.36:1 and was invisible. The offset is the load-bearing part:
  // it puts the ring on the dark surface behind the control instead of inside
  // the control's own fill, where cyan-on-gold is 1.04:1.
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  if(html.indexOf(':focus-visible') === -1){
    fail('no :focus-visible rule in index.html - keyboard focus is invisible.');
  }
  const block = html.match(/:focus-visible\s*\{[^}]*\}/);
  if(!block) fail('found :focus-visible but no rule body to check.');
  if(!/outline\s*:\s*\d/.test(block[0])){
    fail('the :focus-visible rule does not set a visible outline width.');
  }
  if(!/outline-offset\s*:\s*\d/.test(block[0])){
    fail('the :focus-visible rule has no outline-offset.\n' +
         '        Without it the ring sits inside the button fill, where it\n' +
         '        measures 1.04:1 on the gold primary buttons.');
  }
  if(/outline\s*:\s*none/.test(html.replace(/outline\s*:\s*none\s*;?\s*\}/g, ''))){
    // a bare "outline:none" anywhere that is not immediately closing a rule
    // is usually someone suppressing focus again.
  }
}

function checkContrastTokens(){
  // WCAG 1.4.11: a UI component's boundary and a graphical object needed to
  // understand the content both want 3:1. This MEASURES rather than pinning
  // hex literals, so retuning the palette is checked too instead of only this
  // one set of values being frozen.
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const tokens = readTokenBlock(html);
  const need = 3.0;

  // The two backgrounds these are judged against must stay single-valued, or
  // "which background" stops having one answer and this gate quietly measures
  // the wrong pair.
  // Each foreground below is judged against ONE background. If a skin ever
  // overrides one of those backgrounds, "which background" stops having a
  // single answer and this gate would quietly measure the wrong pair - so it
  // fails loudly and asks to be taught, rather than carrying on.
  ['--panel', '--board-bg'].forEach(name=>{
    const vals = tokens[name] || [];
    if(vals.length !== 1){
      fail(name + ' is declared ' + vals.length + ' times; this gate assumes 1.\n' +
           '        A skin now overrides it - teach checkContrastTokens which\n' +
           '        background each override should be measured against.');
    }
  });
  const panel = tokens['--panel'][0];
  const boardBg = tokens['--board-bg'][0];

  const pairs = [
    ['--panel-border', panel,   'the boundary of every button, card and input'],
    ['--grid-line',    boardBg, 'the board grid and the component chips'],
  ];
  pairs.forEach(([name, bg, what])=>{
    const vals = tokens[name] || [];
    if(!vals.length) fail(name + ' is no longer declared anywhere in index.html.');
    vals.forEach(v=>{
      const r = contrastRatio(v, bg);
      if(r < need){
        fail(name + ' = ' + v + ' measures ' + r.toFixed(2) + ':1 against ' + bg + '\n' +
             '        (needs ' + need.toFixed(1) + ':1 - it draws ' + what + ').\n' +
             '        Every declaration counts, including the SKINS[] overrides.');
      }
    });
  });
}

function checkCanvasTokenFallbacks(){
  // draw() reads these tokens through cssVar(name, fallback), so each fallback
  // is a second copy of a value declared in CSS. If they drift, a browser that
  // returns nothing for the custom property paints the old colour - and the
  // contrast gate above, which reads the CSS, would still be green.
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const rootTokens = readRootTokens(html);
  const re = /cssVar\(\s*'(--[a-z0-9-]+)'\s*,\s*'(#[0-9a-fA-F]{3,8})'\s*\)/g;
  let m, checked = 0;
  while((m = re.exec(html)) !== null){
    const [, name, fallback] = m;
    const declared = rootTokens[name];
    if(!declared) fail('cssVar() falls back for ' + name + ', which is not declared in CSS.');
    if(declared.toLowerCase() !== fallback.toLowerCase()){
      fail('cssVar fallback for ' + name + ' is ' + fallback + ' but CSS declares ' + declared + '.\n' +
           '        These are two copies of one value; make them agree.');
    }
    checked++;
  }
  // An empty result here would mean "nothing searched" just as easily as
  // "nothing wrong", and this file has been bitten by that before.
  if(checked < 3) fail('checkCanvasTokenFallbacks matched only ' + checked + ' cssVar() calls; the pattern is wrong.');
}

function checkTurnBasedDriver(){
  // THE FRAME RATE IS NOT DIFFICULTY. That is the claim, and it survives the
  // time trial: there are two drivers now - a player action, and the metronome
  // at a fixed TRIAL_HZ - and the render loop is neither of them. A board that
  // stepped on requestAnimationFrame would run at whatever rate the machine
  // happened to paint, which is the thing the turn-based rewrite existed to
  // kill and the thing a 3/sec interval deliberately does not reintroduce.
  //
  // This gate used to say the game was turn-based FULL STOP, which stopped
  // being true the day the metronome landed. A gate's comment is not evidence;
  // one that describes a world the code left is worse than none.
  //
  // It is a gate rather than a test because nothing goes red when it breaks.
  // Put the accumulator back and every assertion still passes, every level still
  // solves, par is still par; the game simply starts playing itself again while
  // you think, which is the entire thing being fixed. The old model failed the
  // same way in reverse - it looked turn-based in every test, because the tests
  // drove stepTick() directly and never went near the loop.
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  const start = html.indexOf('function tick(now){');
  if(start === -1) fail('no tick(now) render loop found in index.html.');
  // Brace-match rather than regex: the body has nested blocks and a try/catch.
  let depth = 0, end = -1;
  for(let i = html.indexOf('{', start); i < html.length; i++){
    if(html[i] === '{') depth++;
    else if(html[i] === '}'){ depth--; if(depth === 0){ end = i; break; } }
  }
  if(end === -1) fail('could not find the end of tick(now).');
  const body = html.slice(start, end);

  // metronomeTick is in this list because it is the NEW way to smuggle the
  // simulation into the paint loop - call it from tick(now) and the board
  // advances once per frame, which is 144/sec on a good monitor and 30 on a
  // phone. Same defect as the old accumulator, wearing the new name.
  if(/\bstepTick\s*\(/.test(body) || /\btakeTurn\s*\(/.test(body) ||
     /\bmetronomeTick\s*\(/.test(body)){
    fail('the render loop advances the simulation.\n' +
         '        tick(now) calls stepTick/takeTurn/metronomeTick, so the board moves\n' +
         '        at whatever rate this machine paints. The loop renders; a player\n' +
         '        action or the metronome spends the ticks.');
  }
  if(/\bMS_PER_TICK\b|\btickAccum\b/.test(html)){
    fail('a fixed-timestep accumulator is back in index.html.\n' +
         '        MS_PER_TICK / tickAccum were the metronome. Nothing in a\n' +
         '        turn-based game needs them.');
  }

  // Two modes, one function, and the whole difference is WHO spends the move.
  // In the timed game takeTurn() must not step - input plans and the metronome
  // spends, or the clock and the hand both advance the board and drawing fast
  // beats drawing well. In practice it must step, because there is no clock.
  //
  // So the rule is not "never step", it is "step only when guarded", and the
  // guard has to be on the same line for this to be able to prove it.
  const turnBody = bodyOf(html, 'function takeTurn(){');
  if(turnBody === null) fail('takeTurn() is gone - nothing starts a run.');
  // Comments stripped FIRST, and that is not tidiness. The comment above the
  // practice branch mentions stepTick() to explain why it is allowed there, and
  // this gate promptly failed the build on it - a gate reading prose as code,
  // which is the mirror of this project's older lesson that a gate's comment is
  // not evidence. Here the comment became evidence against itself.
  turnBody.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').forEach(raw=>{
    const line = raw.replace(/\/\/.*$/, '');
    if(/\bstepTick\s*\(/.test(line) && !/settings\.practice/.test(line)){
      fail('takeTurn() spends a move outside practice.\n' +
           '        With the clock running, input plans and the metronome spends.\n' +
           '        If both advance the board, drawing fast beats drawing well and\n' +
           '        it looks like nothing worse than a quick player.');
    }
  });
  if(!/settings\.practice[^\n]*\bstepTick\s*\(/.test(turnBody)){
    fail('practice no longer advances the board on a player action.\n' +
         '        With no clock and no step, a practice board never moves at all.');
  }
  if(!/\bstartMetronome\s*\(/.test(turnBody)){
    fail('takeTurn() no longer starts the metronome, so the timed game is frozen.');
  }
}

// Brace-matches a function body out of the source. Shared by the two gates that
// have to reason about what a particular function can see, rather than about
// whether a string appears somewhere in a 5,000-line file.
function bodyOf(html, signature){
  const start = html.indexOf(signature);
  if(start === -1) return null;
  let depth = 0;
  for(let i = html.indexOf('{', start); i < html.length; i++){
    if(html[i] === '{') depth++;
    else if(html[i] === '}'){ depth--; if(depth === 0) return html.slice(start, i); }
  }
  return null;
}

function checkMetronomeIsFixedRate(){
  // The time trial's whole defence is that its clock is the SAME clock for
  // everybody. 3/sec on a gaming desktop and 3/sec on a five-year-old phone, or
  // the level is a different level on each and nobody's time means anything.
  //
  // Read as a shape, because nothing goes red when it breaks: derive the
  // interval from a frame delta and every assertion still passes, every level
  // still solves, and the game quietly becomes harder on slower hardware.
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  const m = html.match(/const TRIAL_HZ = (\d+(?:\.\d+)?);/);
  if(!m){
    fail('TRIAL_HZ is gone, or is no longer a plain number literal.\n' +
         '        The time-trial rate has to be a constant somebody can read and\n' +
         '        change. Computed from the device, it is not a rate, it is a\n' +
         '        handicap nobody asked for.');
  }
  const hz = parseFloat(m[1]);
  if(!(hz > 0 && hz <= 20)){
    fail('TRIAL_HZ is ' + hz + ', which is not a playable rate.\n' +
         '        Zero or negative stops the world; past about 20 the board\n' +
         '        outruns any human hand and the trial is a coin toss.');
  }

  if(!/setInterval\(metronomeTick,\s*Math\.round\(1000 \/ TRIAL_HZ\)\)/.test(html)){
    fail('the metronome no longer beats at TRIAL_HZ.\n' +
         '        Its interval must come from that constant and nothing else -\n' +
         '        not a frame delta, not a literal that can drift away from the\n' +
         '        number the settings screen promises the player.');
  }

  const body = bodyOf(html, 'function metronomeTick(');
  if(body === null) fail('metronomeTick is gone - the time trial has no driver.');
  if(!/\bstopMetronome\s*\(/.test(body)){
    fail('metronomeTick can no longer stop itself.\n' +
         '        It is the only thing holding the interval, so a beat that cannot\n' +
         '        clear it keeps stepping a finished board forever.');
  }
  if(!/\bwon\b/.test(body) || !/\brunning\b/.test(body)){
    fail('metronomeTick no longer checks whether the run is live.\n' +
         '        It would keep spending moves after the win, or before the\n' +
         '        player has made a single one.');
  }
  if(!/hidden/.test(body)){
    fail('metronomeTick no longer checks for a hidden tab.\n' +
         '        Alt-tabbing would burn the board down while the player is in\n' +
         '        another window - and the stopwatch banks that gap, so they would\n' +
         '        come back to a wreck with a good time on it.');
  }
}

function checkClockIsMeasureOnly(){
  // The stopwatch is a second number beside the score. That is safe only for as
  // long as nothing in the simulation can see it: the moment a hazard, a tick or
  // the score reads wall-clock time, two players making the identical moves get
  // different results, par stops having a definition, and the daily stops being
  // the same puzzle for everybody.
  //
  // Checked per function rather than file-wide, because the clock legitimately
  // exists - updateHud renders it, checkWin freezes it, shareText quotes it.
  // What must never happen is the simulation consulting it.
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  // The list grew when the wall clock went. There is now exactly ONE function
  // that reads a real clock - clockNow(), for the cosmetic slide between ticks -
  // so everything that decides anything must be provably clear of it. fmtTicks
  // and setBestIfBetter are on the list because the SCORE is a time now: if
  // either ever sampled a clock, two identical runs would be worth different
  // numbers and every par in PAR_CONTRACT would stop meaning anything.
  const FORBIDDEN = /\b(clockNow|elapsedSeconds|playedMs|runStartMs|finishedMs|pausedMs|hiddenAt|timeTrial)\b|performance\s*\.\s*now|Date\s*\.\s*now/;
  const SEALED = [
    'function stepTick(){',
    'function propagateActiveWire(){',
    'function currentScore(){',
    'function cellIsHot(',
    'function obstacleCellAt(',
    'function fmtTicks(',
    'function setBestIfBetter(',
  ];
  let checked = 0;
  SEALED.forEach(sig => {
    const body = bodyOf(html, sig);
    if(body === null) fail('checkClockIsMeasureOnly cannot find ' + sig + ' - the gate is stale.');
    const hit = body.match(FORBIDDEN);
    if(hit){
      fail(sig.replace(/[({].*$/, '') + ' reads the wall clock (' + hit[0] + ').\n' +
           '        The simulation must be a pure function of the move count, or\n' +
           '        par has no definition and the daily is a different puzzle for\n' +
           '        every player. The clock measures; it never decides.');
    }
    checked++;
  });
  // An empty result would mean "nothing searched" as readily as "nothing wrong".
  if(checked !== SEALED.length){
    fail('checkClockIsMeasureOnly checked ' + checked + ' of ' + SEALED.length + ' functions.');
  }
}

function checkWaitControl(){
  // Wait belongs to exactly one mode, and BOTH halves of that matter. In
  // practice it is mandatory: the board only moves on input, so letting a spark
  // pass requires an input that spends a move and lays no wire, and on a touch
  // screen the button is the only way to make one - lose it and a player whose
  // only safe move is to wait has no legal move at all. With the clock running
  // it must be gone: a control that spends nothing and does nothing, in a game
  // where every other control costs seconds.
  //
  // This gate has now been written in both directions, once each way, because
  // the game changed under it twice in a day. The statement that survives both
  // is the one below - it exists, it works, and it is hidden when it has no job.
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  if(html.indexOf('id="waitBtn"') === -1){
    fail('the Wait button is gone from the play screen markup.\n' +
         '        In practice a touch player has no other way to let a spark pass.');
  }
  if(!/waitBtnEl\.onclick/.test(html)){
    fail('#waitBtn exists but nothing is wired to it.');
  }
  if(!/function waitMove\(\)\{[\s\S]{0,400}?takeTurn\(\)/.test(html)){
    fail('waitMove() no longer takes a turn, so waiting costs nothing.\n' +
         '        A free wait makes every hazard avoidable for zero moves.');
  }
  if(!/function waitMove\(\)\{[\s\S]{0,200}?settings\.practice/.test(html)){
    fail('waitMove() no longer refuses outside practice.\n' +
         '        Hiding the button is then the ONLY thing stopping a free move,\n' +
         '        and a keyboard reaches the function without touching the button.');
  }
  if(!/waitBtnEl\.classList\.toggle\('hidden', !settings\.practice\)/.test(html)){
    fail('the Wait button is no longer hidden when the clock is running.\n' +
         '        It spends nothing and does nothing there.');
  }
  // The board and this row share a column in the landscape layout, and the
  // board's height budget is computed in JS. Leave the row out of that budget
  // and it is pushed off the bottom of a landscape phone - measured, not
  // theorised: it happened the first time the row was added.
  if(!/availableH\s*=[^;]*MOVE_ROW_PX/.test(html)){
    fail('computeCellSize() no longer reserves height for the Trace row.\n' +
         '        In landscape the row shares the board\'s column, so a board\n' +
         '        sized without it hides the control underneath it. Wait is gone\n' +
         '        but Trace still lives there, and Trace is how a player reads\n' +
         '        where the sparks will be - which is the whole game under a clock.');
  }
}

function checkShippedAssets(){
  // A manifest or a cache list can name a file the zip never contained. Nothing
  // about that is visible while developing — the file is right there on disk —
  // and it only shows up as a broken install prompt or a failed offline load
  // after upload. So every referenced path is checked against what we ship.
  const shipped = new Set(RUNTIME_FILES);
  const missing = [];

  const man = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
  (man.icons || []).forEach(i=>{
    if(!shipped.has(i.src)) missing.push(`manifest.json icons[] -> ${i.src}`);
  });

  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const listed = sw.match(/const\s+CACHE_FILES\s*=\s*\[([\s\S]*?)\]/);
  if(!listed) fail('no CACHE_FILES found in sw.js');
  [...listed[1].matchAll(/'([^']+)'/g)].map(x=>x[1]).forEach(p=>{
    if(p === './') return;                       // the scope root, not a file
    const rel = p.replace(/^\.\//, '');
    if(!shipped.has(rel)) missing.push(`sw.js CACHE_FILES -> ${p}`);
  });

  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  [...html.matchAll(/<link[^>]+href="([^"]+)"/g)].map(x=>x[1]).forEach(href=>{
    if(/^(https?:)?\/\//.test(href)) return;     // checkSelfContained owns those
    if(!shipped.has(href)) missing.push(`index.html <link> -> ${href}`);
  });

  if(missing.length){
    fail('these are referenced but are not in RUNTIME_FILES, so the zip would\n' +
         '        ship without them:\n          ' + missing.join('\n          '));
  }
  RUNTIME_FILES.forEach(f=>{
    if(!fs.existsSync(path.join(ROOT, f))) fail('runtime file does not exist: ' + f);
  });
}

function runTests(){
  if(SKIP_TESTS){ console.log('  ! tests skipped'); return; }
  try{
    const out = execFileSync(process.execPath, [path.join(ROOT, 'test.js')], { encoding:'utf8' });
    console.log('  ' + out.trim().split('\n').pop());
  } catch(e){
    fail('the test suite did not pass:\n' + (e.stdout || e.message));
  }
}

function runSolver(){
  if(SKIP_TESTS) return;
  try{
    const out = execFileSync(process.execPath, [path.join(ROOT, 'solve.js')], { encoding:'utf8' });
    console.log('  ' + out.trim().split('\n').pop());
  } catch(e){
    fail('not every level solved and replayed:\n' + (e.stdout || e.message));
  }
}

// ---------- Packaging -------------------------------------------------------

function rmrf(p){
  if(fs.existsSync(p)) fs.rmSync(p, { recursive:true, force:true });
}

function havePwsh(){
  try{
    execFileSync('pwsh', ['-NoProfile','-Command','exit 0'], { stdio:'ignore' });
    return true;
  } catch(e){ return false; }
}

function zipDir(srcDir, zipPath){
  // Zip with whatever the platform ships. Adding a node module for this would
  // mean a package.json and node_modules in a repo that deliberately has neither.
  //
  // Windows PowerShell 5.1's Compress-Archive writes BACKSLASHES as the path
  // separator inside the archive. The zip spec (APPNOTE 4.4.17.1) requires '/',
  // and an unpacker reading 'icons\icon-192.png' sees one filename with a
  // backslash in it rather than a directory — so every icons/ URL 404s once
  // it's on itch. PowerShell 7 writes them correctly, so prefer it and verify
  // the result either way (checkZipPaths below).
  if(process.platform === 'win32'){
    execFileSync(havePwsh() ? 'pwsh' : 'powershell', ['-NoProfile','-NonInteractive','-Command',
      `Compress-Archive -Path '${path.join(srcDir, '*')}' -DestinationPath '${zipPath}' -Force`],
      { stdio:'pipe' });
  } else {
    execFileSync('zip', ['-r','-q', zipPath, '.'], { cwd: srcDir, stdio:'pipe' });
  }
}

function checkZipPaths(zipPath){
  // Read the finished archive back. This was latent for as long as every
  // shipped file sat at the zip root — it only became reachable when icons/
  // arrived, which is exactly when nobody would have been looking for it.
  const buf = fs.readFileSync(zipPath);
  const bad = [];
  RUNTIME_FILES.forEach(f=>{
    // Backslash first: a mangled entry is present under a wrong name, so a
    // presence test would report "missing" and hide the actual cause. The
    // '/' guard matters because a root-level name replaces to itself, which
    // would otherwise flag every file as backslashed.
    if(f.indexOf('/') !== -1 &&
       buf.includes(Buffer.from(f.replace(/\//g, '\\'), 'latin1'))){
      bad.push(`${f} is stored with a backslash`);
    } else if(!buf.includes(Buffer.from(f, 'latin1'))){
      bad.push(`${f} is not in the archive at all`);
    }
  });
  if(bad.length){
    fail('the zip is malformed:\n          ' + bad.join('\n          ') + '\n' +
         '        Install PowerShell 7 (winget install Microsoft.PowerShell) — 5.1\'s\n' +
         '        Compress-Archive cannot write spec-compliant paths.');
  }
}

function main(){
  const version = readVersion();
  console.log(`Building Dead Short v${version}`);

  console.log('  checking service worker cache version…');
  checkServiceWorkerVersion(version);
  console.log('  checking the file is still self-contained…');
  checkSelfContained();
  console.log('  checking for debug scaffolding…');
  checkDebugScaffolding();
  console.log('  checking the itch slug agrees in both files…');
  checkItchSlugAgrees();
  console.log('  checking the code map is current…');
  checkCodeMap();
  console.log('  checking the icon art still matches…');
  checkIconArt();
  console.log('  checking every referenced asset ships…');
  checkShippedAssets();
  console.log('  checking the viewport still allows zoom…');
  checkAccessibleViewport();
  console.log('  checking keyboard focus is visible…');
  checkFocusVisible();
  console.log('  checking non-text contrast…');
  checkContrastTokens();
  console.log('  checking canvas token fallbacks…');
  checkCanvasTokenFallbacks();
  console.log('  checking the render loop cannot spend a move…');
  checkTurnBasedDriver();
  console.log('  checking Wait exists for practice and hides otherwise…');
  checkWaitControl();
  console.log('  checking the clock cannot reach the simulation…');
  checkClockIsMeasureOnly();
  console.log('  checking the metronome beats at a fixed rate…');
  checkMetronomeIsFixedRate();
  console.log('  running tests…');
  runTests();
  console.log('  solving every level…');
  runSolver();

  const stage = path.join(DIST, 'stage');
  rmrf(stage);
  fs.mkdirSync(stage, { recursive:true });
  RUNTIME_FILES.forEach(f=>{
    const src = path.join(ROOT, f);
    if(!fs.existsSync(src)) fail('missing runtime file: ' + f);
    const dest = path.join(stage, f);
    fs.mkdirSync(path.dirname(dest), { recursive:true });
    fs.copyFileSync(src, dest);
  });

  const zipPath = path.join(DIST, `dead-short-${version}.zip`);
  rmrf(zipPath);
  zipDir(stage, zipPath);
  rmrf(stage);
  checkZipPaths(zipPath);

  const bytes = fs.statSync(zipPath).size;
  console.log('');
  console.log(`  ${path.relative(ROOT, zipPath)}  ${(bytes/1024).toFixed(0)} KB`);
  console.log('');
  console.log('Upload to itch.io with "This file will be played in the browser" ticked.');
  console.log('Suggested embed: 720 x 900, with "Fullscreen button" and "Mobile friendly" on.');
}

main();
