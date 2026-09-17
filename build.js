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
  if(/https?:\/\/(?!www\.w3\.org)/i.test(html.replace(/<!--[\s\S]*?-->/g, ''))){
    offenders.push('an http(s) URL in the document');
  }
  if(offenders.length){
    fail('index.html is no longer self-contained: ' + offenders.join(', ') + '.\n' +
         '        See the zero-dependency rule in README.md before adding one.');
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
  console.log('  checking the code map is current…');
  checkCodeMap();
  console.log('  checking the icon art still matches…');
  checkIconArt();
  console.log('  checking every referenced asset ships…');
  checkShippedAssets();
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
