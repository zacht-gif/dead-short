#!/usr/bin/env node
// Packages the game for upload.
//
//   node build.js            run checks, write dist/wired-<version>.zip
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
const RUNTIME_FILES = ['index.html', 'manifest.json', 'sw.js', 'icon.svg'];
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

function zipDir(srcDir, zipPath){
  // Zip with whatever the platform ships. Adding a node module for this would
  // mean a package.json and node_modules in a repo that deliberately has neither.
  if(process.platform === 'win32'){
    execFileSync('powershell', ['-NoProfile','-NonInteractive','-Command',
      `Compress-Archive -Path '${path.join(srcDir, '*')}' -DestinationPath '${zipPath}' -Force`],
      { stdio:'pipe' });
  } else {
    execFileSync('zip', ['-r','-q', zipPath, '.'], { cwd: srcDir, stdio:'pipe' });
  }
}

function main(){
  const version = readVersion();
  console.log(`Building Wired v${version}`);

  console.log('  checking service worker cache version…');
  checkServiceWorkerVersion(version);
  console.log('  checking the file is still self-contained…');
  checkSelfContained();
  console.log('  checking for debug scaffolding…');
  checkDebugScaffolding();
  console.log('  checking the code map is current…');
  checkCodeMap();
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
    fs.copyFileSync(src, path.join(stage, f));
  });

  const zipPath = path.join(DIST, `wired-${version}.zip`);
  rmrf(zipPath);
  zipDir(stage, zipPath);
  rmrf(stage);

  const bytes = fs.statSync(zipPath).size;
  console.log('');
  console.log(`  ${path.relative(ROOT, zipPath)}  ${(bytes/1024).toFixed(0)} KB`);
  console.log('');
  console.log('Upload to itch.io with "This file will be played in the browser" ticked.');
  console.log('Suggested embed: 720 x 900, with "Fullscreen button" and "Mobile friendly" on.');
}

main();
